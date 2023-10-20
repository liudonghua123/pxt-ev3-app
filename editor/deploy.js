"use strict";
/// <reference path="../node_modules/pxt-core/built/pxteditor.d.ts"/>
/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployCoreAsync = exports.enableWebSerialAsync = exports.canUseWebSerial = exports.initAsync = exports.debug = exports.ev3 = void 0;
var HF2 = pxt.HF2;
var UF2 = pxtc.UF2;
const wrap_1 = require("./wrap");
const dialogs_1 = require("./dialogs");
function debug() {
    return initHidAsync()
        .then(w => w.downloadFileAsync("/tmp/dmesg.txt", v => console.log(pxt.Util.uint8ArrayToString(v))));
}
exports.debug = debug;
// Web Serial API https://wicg.github.io/serial/
// chromium bug https://bugs.chromium.org/p/chromium/issues/detail?id=884928
// Under experimental features in Chrome Desktop 77+
var ParityType;
(function (ParityType) {
    ParityType[ParityType["none"] = 0] = "none";
    ParityType[ParityType["even"] = 1] = "even";
    ParityType[ParityType["odd"] = 2] = "odd";
    ParityType[ParityType["mark"] = 3] = "mark";
    ParityType[ParityType["space"] = 4] = "space";
})(ParityType || (ParityType = {}));
class WebSerialPackageIO {
    constructor(port, options) {
        this.port = port;
        this.options = options;
        console.log(`serial: new io`);
    }
    async readSerialAsync() {
        this._reader = this.port.readable.getReader();
        let buffer;
        const reader = this._reader;
        while (reader === this._reader) { // will change if we recycle the connection
            const { done, value } = await this._reader.read();
            if (!buffer)
                buffer = value;
            else { // concat
                let tmp = new Uint8Array(buffer.length + value.byteLength);
                tmp.set(buffer, 0);
                tmp.set(value, buffer.length);
                buffer = tmp;
            }
            if (buffer) {
                let size = HF2.read16(buffer, 0);
                if (buffer.length == size + 2) {
                    this.onData(new Uint8Array(buffer));
                    buffer = undefined;
                }
                else {
                    console.warn("Incomplete command " + size);
                }
            }
        }
    }
    static isSupported() {
        return !!navigator.serial;
    }
    static async mkPacketIOAsync() {
        const serial = navigator.serial;
        if (serial) {
            try {
                const requestOptions = {};
                const port = await serial.requestPort(requestOptions);
                let io = WebSerialPackageIO.portIos.filter(i => i.port == port)[0];
                if (!io) {
                    const options = {
                        baudRate: 460800,
                        buffersize: 4096
                    };
                    io = new WebSerialPackageIO(port, options);
                    WebSerialPackageIO.portIos.push(io);
                }
                return io;
            }
            catch (e) {
                console.log(`connection error`, e);
            }
        }
        throw new Error("could not open serial port");
    }
    error(msg) {
        console.error(msg);
        throw new Error(lf("error on brick ({0})", msg));
    }
    openAsync() {
        console.log(`serial: opening port`);
        if (!!this._reader)
            return Promise.resolve();
        this._reader = undefined;
        this._writer = undefined;
        return this.port.open(this.options)
            .then(() => {
            this.readSerialAsync();
            return Promise.resolve();
        });
    }
    async closeAsync() {
        // don't close port
        return pxt.U.delay(500);
    }
    reconnectAsync() {
        return this.openAsync();
    }
    disconnectAsync() {
        return this.closeAsync();
    }
    sendPacketAsync(pkt) {
        if (!this._writer)
            this._writer = this.port.writable.getWriter();
        return this._writer.write(pkt);
    }
    onDeviceConnectionChanged(connect) {
        throw new Error("onDeviceConnectionChanged not implemented");
    }
    onConnectionChanged() {
        throw new Error("onConnectionChanged not implemented");
    }
    isConnecting() {
        throw new Error("isConnecting not implemented");
        return false;
    }
    isConnected() {
        throw new Error("isConnected not implemented");
        return false;
    }
    disposeAsync() {
        return Promise.reject("disposeAsync not implemented");
    }
}
WebSerialPackageIO.portIos = [];
function hf2Async() {
    const pktIOAsync = useWebSerial
        ? WebSerialPackageIO.mkPacketIOAsync() : pxt.packetio.mkPacketIOAsync();
    return pktIOAsync.then(h => {
        let w = new wrap_1.Ev3Wrapper(h);
        exports.ev3 = w;
        return w.reconnectAsync(true)
            .then(() => w);
    });
}
let useHID = false;
let useWebSerial = false;
function initAsync() {
    if (pxt.U.isNodeJS) {
        // doesn't seem to work ATM
        useHID = false;
    }
    else {
        const nodehid = /nodehid/i.test(window.location.href);
        if (pxt.BrowserUtils.isLocalHost() && pxt.Cloud.localToken && nodehid)
            useHID = true;
    }
    if (WebSerialPackageIO.isSupported())
        pxt.tickEvent("webserial.supported");
    return Promise.resolve();
}
exports.initAsync = initAsync;
function canUseWebSerial() {
    return WebSerialPackageIO.isSupported();
}
exports.canUseWebSerial = canUseWebSerial;
function enableWebSerialAsync() {
    initPromise = undefined;
    useWebSerial = WebSerialPackageIO.isSupported();
    useHID = useWebSerial;
    if (useWebSerial)
        return initHidAsync().then(() => { });
    else
        return Promise.resolve();
}
exports.enableWebSerialAsync = enableWebSerialAsync;
async function cleanupAsync() {
    if (exports.ev3) {
        console.log('cleanup previous port');
        try {
            await exports.ev3.disconnectAsync();
        }
        catch (e) {
        }
        finally {
            exports.ev3 = undefined;
        }
    }
}
let initPromise;
function initHidAsync() {
    if (initPromise)
        return initPromise;
    if (useHID) {
        initPromise = cleanupAsync()
            .then(() => hf2Async())
            .catch((err) => {
            console.error(err);
            initPromise = null;
            useHID = false;
            useWebSerial = false;
            return Promise.reject(err);
        });
    }
    else {
        useHID = false;
        useWebSerial = false;
        initPromise = Promise.reject(new Error("no HID"));
    }
    return initPromise;
}
// this comes from aux/pxt.lms
const fspath = "../prjs/BrkProg_SAVE/";
const rbfTemplate = `
4c45474f580000006d000100000000001c000000000000000e000000821b038405018130813e8053
74617274696e672e2e2e0084006080XX00448581644886488405018130813e80427965210084000a
`;
function deployCoreAsync(resp) {
    let filename = resp.downloadFileBaseName || "pxt";
    filename = filename.replace(/^lego-/, "");
    let elfPath = fspath + filename + ".elf";
    let rbfPath = fspath + filename + ".rbf";
    let rbfHex = rbfTemplate
        .replace(/\s+/g, "")
        .replace("XX", pxt.U.toHex(pxt.U.stringToUint8Array(elfPath)));
    let rbfBIN = pxt.U.fromHex(rbfHex);
    pxt.HF2.write16(rbfBIN, 4, rbfBIN.length);
    let origElfUF2 = UF2.parseFile(pxt.U.stringToUint8Array(ts.pxtc.decodeBase64(resp.outfiles[pxt.outputName()])));
    let mkFile = (ext, data = null) => {
        let f = UF2.newBlockFile();
        f.filename = "Projects/" + filename + ext;
        if (data)
            UF2.writeBytes(f, 0, data);
        return f;
    };
    let elfUF2 = mkFile(".elf");
    for (let b of origElfUF2) {
        UF2.writeBytes(elfUF2, b.targetAddr, b.data);
    }
    let r = UF2.concatFiles([elfUF2, mkFile(".rbf", rbfBIN)]);
    let data = UF2.serializeFile(r);
    resp.outfiles[pxtc.BINARY_UF2] = btoa(data);
    let saveUF2Async = () => {
        if (pxt.commands && pxt.commands.electronDeployAsync) {
            return pxt.commands.electronDeployAsync(resp);
        }
        if (pxt.commands && pxt.commands.saveOnlyAsync) {
            return pxt.commands.saveOnlyAsync(resp);
        }
        return Promise.resolve();
    };
    if (!useHID)
        return saveUF2Async();
    pxt.tickEvent("webserial.flash");
    let w;
    return initHidAsync()
        .then(w_ => {
        w = w_;
        if (w.isStreaming)
            pxt.U.userError("please stop the program first");
        return w.reconnectAsync(false)
            .catch(e => {
            // user easily forgets to stop robot
            (0, dialogs_1.bluetoothTryAgainAsync)().then(() => w.disconnectAsync())
                .then(() => pxt.U.delay(1000))
                .then(() => w.reconnectAsync());
            // nothing we can do
            return Promise.reject(e);
        });
    })
        .then(() => w.stopAsync())
        .then(() => w.rmAsync(elfPath))
        .then(() => w.flashAsync(elfPath, UF2.readBytes(origElfUF2, 0, origElfUF2.length * 256)))
        .then(() => w.flashAsync(rbfPath, rbfBIN))
        .then(() => w.runAsync(rbfPath))
        .then(() => pxt.U.delay(500))
        .then(() => {
        pxt.tickEvent("webserial.success");
        return w.disconnectAsync();
        //return Promise.delay(1000).then(() => w.dmesgAsync())
    }).catch(e => {
        pxt.tickEvent("webserial.fail");
        useHID = false;
        useWebSerial = false;
        // if we failed to initalize, tell the user to retry
        return Promise.reject(e);
    });
}
exports.deployCoreAsync = deployCoreAsync;
