/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>
/// <reference path="../node_modules/pxt-core/localtypings/pxtarget.d.ts"/>
/// <reference path="../built/common-sim.d.ts"/>
var pxsim;
(function (pxsim) {
    class EV3Board extends pxsim.CoreBoard {
        constructor() {
            super();
            this.inputNodes = [];
            this.outputNodes = [];
            this.motorMap = {
                0x01: 0,
                0x02: 1,
                0x04: 2,
                0x08: 3
            };
            this.bus.setNotify(10000 /* DAL.DEVICE_ID_NOTIFY */, 10001 /* DAL.DEVICE_ID_NOTIFY_ONE */);
            this.brickNode = new pxsim.BrickNode();
            this.outputState = new pxsim.EV3OutputState();
            this.analogState = new pxsim.EV3AnalogState();
            this.uartState = new pxsim.EV3UArtState();
            this.motorState = new pxsim.EV3MotorState();
            this.screenState = new pxsim.ScreenState(["#97b5a6", "#000000"], pxsim.visuals.SCREEN_WIDTH, pxsim.visuals.SCREEN_HEIGHT);
            this.audioState = new pxsim.AudioState();
            this.remoteState = new pxsim.RemoteState();
        }
        receiveMessage(msg) {
            if (!pxsim.runtime || pxsim.runtime.dead)
                return;
            switch (msg.type || "") {
                case "eventbus": {
                    let ev = msg;
                    this.bus.queue(ev.id, ev.eventid, ev.value);
                    break;
                }
                case "serial": {
                    let data = msg.data || "";
                    // TODO
                    break;
                }
            }
        }
        initAsync(msg) {
            super.initAsync(msg);
            const options = (msg.options || {});
            const boardDef = msg.boardDefinition;
            const cmpsList = msg.parts;
            const cmpDefs = msg.partDefinitions || {};
            const fnArgs = msg.fnArgs;
            const opts = {
                state: this,
                boardDef: boardDef,
                partsList: cmpsList,
                partDefs: cmpDefs,
                fnArgs: fnArgs,
                maxWidth: "100%",
                maxHeight: "100%",
                highContrast: msg.highContrast,
                light: msg.light
            };
            this.viewHost = new pxsim.visuals.BoardHost(pxsim.visuals.mkBoardView({
                boardDef,
                visual: boardDef.visual,
                highContrast: msg.highContrast,
                light: msg.light
            }), opts);
            document.body.innerHTML = ""; // clear children
            document.body.className = msg.light ? "light" : "";
            document.body.appendChild(this.view = this.viewHost.getView());
            this.inputNodes = [];
            this.outputNodes = [];
            this.highcontrastMode = msg.highContrast;
            this.lightMode = msg.light;
            return Promise.resolve();
        }
        screenshotAsync(width) {
            return this.viewHost.screenshotAsync(width);
        }
        getBrickNode() {
            return this.brickNode;
        }
        motorUsed(ports, large) {
            for (let i = 0; i < 4 /* DAL.NUM_OUTPUTS */; ++i) {
                const p = 1 << i;
                if (ports & p) {
                    const motorPort = this.motorMap[p];
                    const outputNode = this.outputNodes[motorPort];
                    if (!outputNode) {
                        this.outputNodes[motorPort] = new pxsim.MotorNode(motorPort, large);
                        continue;
                    }
                    if (outputNode && outputNode.isLarge() != large)
                        return false;
                }
            }
            return true;
        }
        getMotor(port, large) {
            const r = [];
            for (let i = 0; i < 4 /* DAL.NUM_OUTPUTS */; ++i) {
                const p = 1 << i;
                if (port & p) {
                    const motorPort = this.motorMap[p];
                    const outputNode = this.outputNodes[motorPort];
                    if (outputNode)
                        r.push(outputNode);
                }
            }
            return r;
        }
        getMotors() {
            return this.outputNodes;
        }
        hasSensor(port) {
            return !!this.inputNodes[port];
        }
        getSensor(port, type) {
            if (!this.inputNodes[port]) {
                switch (type) {
                    case 32 /* DAL.DEVICE_TYPE_GYRO */:
                        this.inputNodes[port] = new pxsim.GyroSensorNode(port);
                        break;
                    case 29 /* DAL.DEVICE_TYPE_COLOR */:
                        this.inputNodes[port] = new pxsim.ColorSensorNode(port);
                        break;
                    case 16 /* DAL.DEVICE_TYPE_TOUCH */:
                        this.inputNodes[port] = new pxsim.TouchSensorNode(port);
                        break;
                    case 30 /* DAL.DEVICE_TYPE_ULTRASONIC */:
                        this.inputNodes[port] = new pxsim.UltrasonicSensorNode(port);
                        break;
                    case 33 /* DAL.DEVICE_TYPE_IR */:
                        this.inputNodes[port] = new pxsim.InfraredSensorNode(port);
                        break;
                    case 2 /* DAL.DEVICE_TYPE_NXT_LIGHT */:
                        this.inputNodes[port] = new pxsim.NXTLightSensorNode(port);
                        break;
                }
            }
            return this.inputNodes[port];
        }
        getInputNodes() {
            return this.inputNodes;
        }
    }
    pxsim.EV3Board = EV3Board;
    function initRuntimeWithDalBoard() {
        pxsim.U.assert(!pxsim.runtime.board);
        let b = new EV3Board();
        pxsim.runtime.board = b;
        pxsim.runtime.postError = (e) => {
            // TODO
            pxsim.runtime.updateDisplay();
            console.log('runtime error: ' + e);
        };
    }
    pxsim.initRuntimeWithDalBoard = initRuntimeWithDalBoard;
    function ev3board() {
        return pxsim.runtime.board;
    }
    pxsim.ev3board = ev3board;
    function inLightMode() {
        return /light=1/i.test(window.location.href) || ev3board().lightMode;
    }
    pxsim.inLightMode = inLightMode;
    function inHighcontrastMode() {
        return ev3board().highcontrastMode;
    }
    pxsim.inHighcontrastMode = inHighcontrastMode;
    if (!pxsim.initCurrentRuntime) {
        pxsim.initCurrentRuntime = initRuntimeWithDalBoard;
    }
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    let AnalogOff;
    (function (AnalogOff) {
        AnalogOff[AnalogOff["InPin1"] = 0] = "InPin1";
        AnalogOff[AnalogOff["InPin6"] = 8] = "InPin6";
        AnalogOff[AnalogOff["OutPin5"] = 16] = "OutPin5";
        AnalogOff[AnalogOff["BatteryTemp"] = 24] = "BatteryTemp";
        AnalogOff[AnalogOff["MotorCurrent"] = 26] = "MotorCurrent";
        AnalogOff[AnalogOff["BatteryCurrent"] = 28] = "BatteryCurrent";
        AnalogOff[AnalogOff["Cell123456"] = 30] = "Cell123456";
        AnalogOff[AnalogOff["Pin1"] = 32] = "Pin1";
        AnalogOff[AnalogOff["Pin6"] = 2432] = "Pin6";
        AnalogOff[AnalogOff["Actual"] = 4832] = "Actual";
        AnalogOff[AnalogOff["LogIn"] = 4840] = "LogIn";
        AnalogOff[AnalogOff["LogOut"] = 4848] = "LogOut";
        AnalogOff[AnalogOff["NxtCol"] = 4856] = "NxtCol";
        AnalogOff[AnalogOff["OutPin5Low"] = 5144] = "OutPin5Low";
        AnalogOff[AnalogOff["Updated"] = 5152] = "Updated";
        AnalogOff[AnalogOff["InDcm"] = 5156] = "InDcm";
        AnalogOff[AnalogOff["InConn"] = 5160] = "InConn";
        AnalogOff[AnalogOff["OutDcm"] = 5164] = "OutDcm";
        AnalogOff[AnalogOff["OutConn"] = 5168] = "OutConn";
        AnalogOff[AnalogOff["Size"] = 5172] = "Size";
    })(AnalogOff = pxsim.AnalogOff || (pxsim.AnalogOff = {}));
    class EV3AnalogState {
        constructor() {
            let data = new Uint8Array(5172);
            pxsim.MMapMethods.register("/dev/lms_analog", {
                data,
                beforeMemRead: () => {
                    //console.log("analog before read");
                    pxsim.util.map16Bit(data, AnalogOff.BatteryTemp, 21);
                    pxsim.util.map16Bit(data, AnalogOff.BatteryCurrent, 900);
                    const inputNodes = pxsim.ev3board().getInputNodes();
                    for (let port = 0; port < 4 /* DAL.NUM_INPUTS */; port++) {
                        const node = inputNodes[port];
                        if (node) {
                            if (node.isAnalog())
                                data[AnalogOff.InDcm + port] = node.getDeviceType();
                            data[AnalogOff.InConn + port] = node.isUart() ? 122 /* DAL.CONN_INPUT_UART */ : (!node.isNXT() ? 121 /* DAL.CONN_INPUT_DUMB */ : 119 /* DAL.CONN_NXT_DUMB */);
                            if (node.isAnalog() && node.hasData()) {
                                //data[AnalogOff.InPin6 + 2 * port] = node.getValue();
                                pxsim.util.map16Bit(data, node.getAnalogReadPin() + 2 * port, Math.floor(node.getValue()));
                            }
                        }
                    }
                },
                read: buf => {
                    let v = "vSIM";
                    for (let i = 0; i < buf.data.length; ++i)
                        buf.data[i] = v.charCodeAt(i) || 0;
                    return buf.data.length;
                },
                write: buf => {
                    return 2;
                },
                ioctl: (id, buf) => {
                    //console.log("ioctl: " + id);
                    for (let port = 0; port < 4 /* DAL.NUM_INPUTS */; port++) {
                        const connection = buf.data[pxsim.DevConOff.Connection + port];
                        const type = buf.data[pxsim.DevConOff.Type + port];
                        const mode = buf.data[pxsim.DevConOff.Mode + port];
                        //console.log(`${port}, mode: ${mode}`);
                        const node = pxsim.ev3board().getInputNodes()[port];
                        if (node)
                            node.setMode(mode);
                    }
                    return 2;
                }
            });
        }
    }
    pxsim.EV3AnalogState = EV3AnalogState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    let NodeType;
    (function (NodeType) {
        NodeType[NodeType["Port"] = 0] = "Port";
        NodeType[NodeType["Brick"] = 1] = "Brick";
        NodeType[NodeType["TouchSensor"] = 2] = "TouchSensor";
        NodeType[NodeType["MediumMotor"] = 3] = "MediumMotor";
        NodeType[NodeType["LargeMotor"] = 4] = "LargeMotor";
        NodeType[NodeType["GyroSensor"] = 5] = "GyroSensor";
        NodeType[NodeType["ColorSensor"] = 6] = "ColorSensor";
        NodeType[NodeType["UltrasonicSensor"] = 7] = "UltrasonicSensor";
        NodeType[NodeType["InfraredSensor"] = 8] = "InfraredSensor";
        NodeType[NodeType["NXTLightSensor"] = 9] = "NXTLightSensor";
    })(NodeType = pxsim.NodeType || (pxsim.NodeType = {}));
    class BaseNode {
        constructor(port) {
            this.isOutput = false;
            this.used = false;
            this.changed = true;
            this.port = port;
        }
        didChange() {
            const res = this.changed;
            this.changed = false;
            return res;
        }
        setChangedState() {
            this.changed = true;
        }
        /**
         * Updates any internal state according to the elapsed time since the last call to `updateState`
         * @param elapsed
         */
        updateState(elapsed) {
        }
    }
    pxsim.BaseNode = BaseNode;
})(pxsim || (pxsim = {}));
/// <reference path="./nodeTypes.ts"/>
var pxsim;
(function (pxsim) {
    class PortNode extends pxsim.BaseNode {
        constructor(port) {
            super(port);
            this.id = pxsim.NodeType.Port;
        }
    }
    pxsim.PortNode = PortNode;
    class BrickNode extends pxsim.BaseNode {
        constructor() {
            super(-1);
            this.id = pxsim.NodeType.Brick;
            this.buttonState = new pxsim.EV3ButtonState();
            this.lightState = new pxsim.EV3LightState();
        }
    }
    pxsim.BrickNode = BrickNode;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    class EV3ButtonState extends pxsim.CommonButtonState {
        constructor() {
            super();
            this.buttons = [
                new pxsim.CommonButton(1 /* DAL.BUTTON_ID_UP */),
                new pxsim.CommonButton(2 /* DAL.BUTTON_ID_ENTER */),
                new pxsim.CommonButton(4 /* DAL.BUTTON_ID_DOWN */),
                new pxsim.CommonButton(8 /* DAL.BUTTON_ID_RIGHT */),
                new pxsim.CommonButton(16 /* DAL.BUTTON_ID_LEFT */),
                new pxsim.CommonButton(32 /* DAL.BUTTON_ID_ESCAPE */)
            ];
            let data = new Uint8Array(this.buttons.length);
            pxsim.MMapMethods.register("/dev/lms_ui", {
                data,
                beforeMemRead: () => {
                    for (let i = 0; i < this.buttons.length; ++i)
                        data[i] = this.buttons[i].isPressed() ? 1 : 0;
                },
                read: buf => {
                    let v = "vSIM";
                    for (let i = 0; i < buf.data.length; ++i)
                        buf.data[i] = v.charCodeAt(i) || 0;
                    return buf.data.length;
                },
                write: buf => {
                    pxsim.output.setLights(buf.data[0] - 48);
                    return 2;
                }
            });
        }
    }
    pxsim.EV3ButtonState = EV3ButtonState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    class SensorNode extends pxsim.BaseNode {
        constructor(port) {
            super(port);
        }
        isUart() {
            return true;
        }
        isAnalog() {
            return false;
        }
        isNXT() {
            return false;
        }
        isModeReturnArr() {
            return this.modeReturnArr;
        }
        getValue() {
            return 0;
        }
        getValues() {
            return [0];
        }
        getAnalogReadPin() {
            return pxsim.AnalogOff.InPin6; // Defl for ev3 sensor
        }
        setMode(mode) {
            this.mode = mode;
            this.changed = true;
            this.modeChanged = true;
            this.modeReturnArr = false;
        }
        getMode() {
            return this.mode;
        }
        getDeviceType() {
            return 126 /* DAL.DEVICE_TYPE_NONE */;
        }
        hasData() {
            return true;
        }
        valueChange() {
            const res = this.valueChanged;
            this.valueChanged = false;
            return res;
        }
        modeChange() {
            const res = this.modeChanged;
            this.modeChanged = false;
            return res;
        }
        setChangedState() {
            this.changed = true;
            this.valueChanged = false;
        }
    }
    pxsim.SensorNode = SensorNode;
    class AnalogSensorNode extends SensorNode {
        constructor(port) {
            super(port);
        }
        isUart() {
            return false;
        }
        isAnalog() {
            return true;
        }
    }
    pxsim.AnalogSensorNode = AnalogSensorNode;
    class UartSensorNode extends SensorNode {
        constructor(port) {
            super(port);
        }
        hasChanged() {
            return this.changed;
        }
    }
    pxsim.UartSensorNode = UartSensorNode;
})(pxsim || (pxsim = {}));
/// <reference path="./sensor.ts"/>
var pxsim;
(function (pxsim) {
    let ColorSensorMode;
    (function (ColorSensorMode) {
        ColorSensorMode[ColorSensorMode["None"] = -1] = "None";
        ColorSensorMode[ColorSensorMode["Reflected"] = 0] = "Reflected";
        ColorSensorMode[ColorSensorMode["Ambient"] = 1] = "Ambient";
        ColorSensorMode[ColorSensorMode["Colors"] = 2] = "Colors";
        ColorSensorMode[ColorSensorMode["RefRaw"] = 3] = "RefRaw";
        ColorSensorMode[ColorSensorMode["RgbRaw"] = 4] = "RgbRaw";
        ColorSensorMode[ColorSensorMode["ColorCal"] = 5] = "ColorCal";
    })(ColorSensorMode = pxsim.ColorSensorMode || (pxsim.ColorSensorMode = {}));
    let ThresholdState;
    (function (ThresholdState) {
        ThresholdState[ThresholdState["Normal"] = 1] = "Normal";
        ThresholdState[ThresholdState["High"] = 2] = "High";
        ThresholdState[ThresholdState["Low"] = 3] = "Low";
    })(ThresholdState = pxsim.ThresholdState || (pxsim.ThresholdState = {}));
    class ColorSensorNode extends pxsim.UartSensorNode {
        constructor(port) {
            super(port);
            this.id = pxsim.NodeType.ColorSensor;
            this.color = 0;
            this.colors = [0, 0, 0];
            this.mode = -1;
            this.modeReturnArr = false;
        }
        getDeviceType() {
            return 29 /* DAL.DEVICE_TYPE_COLOR */;
        }
        isModeReturnArr() {
            return this.modeReturnArr;
        }
        setColors(colors) {
            this.colors = colors;
            this.setChangedState();
        }
        setColor(color) {
            this.color = color;
            this.setChangedState();
        }
        getValue() {
            return this.color;
        }
        getValues() {
            return this.colors;
        }
        setMode(mode) {
            this.mode = mode;
            if (this.mode == ColorSensorMode.RefRaw) {
                this.color = 512;
                this.colors = [0, 0, 0];
                this.modeReturnArr = false;
            }
            else if (this.mode == ColorSensorMode.RgbRaw) {
                this.color = 0;
                this.colors = [128, 128, 128];
                this.modeReturnArr = true;
            }
            else if (this.mode == ColorSensorMode.Colors) {
                this.color = 0; // None defl color
                this.colors = [0, 0, 0];
                this.modeReturnArr = false;
            }
            else { // Reflection or ambiend light
                this.color = 50;
                this.colors = [0, 0, 0];
                this.modeReturnArr = false;
            }
            this.changed = true;
            this.modeChanged = true;
        }
    }
    pxsim.ColorSensorNode = ColorSensorNode;
})(pxsim || (pxsim = {}));
/// <reference path="../../libs/core/enums.d.ts"/>
var pxsim;
(function (pxsim) {
    var MMapMethods;
    (function (MMapMethods) {
        var BM = pxsim.BufferMethods;
        class MMap extends pxsim.RefObject {
            constructor(impl, len) {
                super();
                this.impl = impl;
                this.len = len;
                if (!impl.data)
                    impl.data = new Uint8Array(this.len);
                if (!impl.afterMemWrite)
                    impl.afterMemWrite = () => { };
                if (!impl.beforeMemRead)
                    impl.beforeMemRead = () => { };
                if (!impl.read)
                    impl.read = () => 0;
                if (!impl.write)
                    impl.write = () => 0;
                if (!impl.ioctl)
                    impl.ioctl = () => -1;
                if (!impl.lseek)
                    impl.lseek = (offset, whence) => -1;
            }
            destroy() {
            }
            buf() {
                return { data: this.impl.data };
            }
        }
        MMapMethods.MMap = MMap;
        MMapMethods.mmapRegistry = {};
        function register(filename, impl) {
            MMapMethods.mmapRegistry[filename] = impl;
        }
        MMapMethods.register = register;
        function setNumber(m, format, offset, value) {
            BM.setNumber(m.buf(), format, offset, value);
            m.impl.afterMemWrite();
        }
        MMapMethods.setNumber = setNumber;
        function getNumber(m, format, offset) {
            m.impl.beforeMemRead();
            return BM.getNumber(m.buf(), format, offset);
        }
        MMapMethods.getNumber = getNumber;
        function slice(m, offset, length) {
            m.impl.beforeMemRead();
            return BM.slice(m.buf(), offset, length);
        }
        MMapMethods.slice = slice;
        function length(m) {
            m.impl.beforeMemRead();
            return m.buf().data.length;
        }
        MMapMethods.length = length;
        function ioctl(m, id, data) {
            return m.impl.ioctl(id, data);
        }
        MMapMethods.ioctl = ioctl;
        function write(m, data) {
            return m.impl.write(data);
        }
        MMapMethods.write = write;
        function read(m, data) {
            return m.impl.read(data);
        }
        MMapMethods.read = read;
        function lseek(m, offset, whence) {
            return m.impl.lseek(offset, whence);
        }
        MMapMethods.lseek = lseek;
    })(MMapMethods = pxsim.MMapMethods || (pxsim.MMapMethods = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var control;
    (function (control) {
        function mmap(filename, size, offset) {
            let impl = pxsim.MMapMethods.mmapRegistry[filename];
            if (!impl)
                impl = {};
            return new pxsim.MMapMethods.MMap(impl, size);
        }
        control.mmap = mmap;
    })(control = pxsim.control || (pxsim.control = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var output;
    (function (output) {
        function createBuffer(size) {
            return pxsim.BufferMethods.createBuffer(size);
        }
        output.createBuffer = createBuffer;
    })(output = pxsim.output || (pxsim.output = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    class GyroSensorNode extends pxsim.UartSensorNode {
        constructor(port) {
            super(port);
            this.id = pxsim.NodeType.GyroSensor;
            this.rate = 0;
        }
        getDeviceType() {
            return 32 /* DAL.DEVICE_TYPE_GYRO */;
        }
        setRate(rate) {
            rate = rate | 0;
            if (this.rate != rate) {
                this.rate = rate;
                this.setChangedState();
            }
        }
        getRate() {
            return this.rate;
        }
        getValue() {
            return this.getRate();
        }
    }
    pxsim.GyroSensorNode = GyroSensorNode;
})(pxsim || (pxsim = {}));
/// <reference path="./sensor.ts"/>
var pxsim;
(function (pxsim) {
    let InfraredRemoteButton;
    (function (InfraredRemoteButton) {
        //% block="center beacon"
        InfraredRemoteButton[InfraredRemoteButton["CenterBeacon"] = 1] = "CenterBeacon";
        //% block="top left"
        InfraredRemoteButton[InfraredRemoteButton["TopLeft"] = 2] = "TopLeft";
        //% block="bottom left"
        InfraredRemoteButton[InfraredRemoteButton["BottomLeft"] = 4] = "BottomLeft";
        //% block="top right"
        InfraredRemoteButton[InfraredRemoteButton["TopRight"] = 8] = "TopRight";
        //% block="bottom right"
        InfraredRemoteButton[InfraredRemoteButton["BottomRight"] = 16] = "BottomRight";
    })(InfraredRemoteButton = pxsim.InfraredRemoteButton || (pxsim.InfraredRemoteButton = {}));
    class RemoteState {
        constructor() {
            this.state = 0;
        }
        unmapButtons() {
            switch (this.state) {
                case InfraredRemoteButton.TopLeft: return 1;
                case InfraredRemoteButton.BottomLeft: return 2;
                case InfraredRemoteButton.TopRight: return 3;
                case InfraredRemoteButton.BottomRight: return 4;
                case InfraredRemoteButton.TopLeft | InfraredRemoteButton.TopRight: return 5;
                case InfraredRemoteButton.TopLeft | InfraredRemoteButton.BottomRight: return 6;
                case InfraredRemoteButton.BottomLeft | InfraredRemoteButton.TopRight: return 7;
                case InfraredRemoteButton.BottomLeft | InfraredRemoteButton.BottomRight: return 8;
                case InfraredRemoteButton.CenterBeacon: return 9;
                case InfraredRemoteButton.BottomLeft | InfraredRemoteButton.TopLeft: return 10;
                case InfraredRemoteButton.TopRight | InfraredRemoteButton.BottomRight: return 11;
                default: return 0;
            }
        }
        setPressed(btns, down) {
            if (down)
                this.state = this.state | btns;
            else
                this.state = ~(~this.state | btns);
        }
    }
    pxsim.RemoteState = RemoteState;
    let InfraredSensorMode;
    (function (InfraredSensorMode) {
        InfraredSensorMode[InfraredSensorMode["None"] = -1] = "None";
        InfraredSensorMode[InfraredSensorMode["Proximity"] = 0] = "Proximity";
        InfraredSensorMode[InfraredSensorMode["Seek"] = 1] = "Seek";
        InfraredSensorMode[InfraredSensorMode["RemoteControl"] = 2] = "RemoteControl";
    })(InfraredSensorMode = pxsim.InfraredSensorMode || (pxsim.InfraredSensorMode = {}));
    class InfraredSensorNode extends pxsim.UartSensorNode {
        constructor(port) {
            super(port);
            this.id = pxsim.NodeType.InfraredSensor;
            this.proximity = 50; // [0..100]
        }
        getDeviceType() {
            return 33 /* DAL.DEVICE_TYPE_IR */;
        }
        setPromixity(proximity) {
            if (this.proximity != proximity) {
                this.proximity = proximity;
                this.setChangedState();
            }
        }
        getValue() {
            switch (this.mode) {
                case InfraredSensorMode.Proximity: return this.proximity;
                case InfraredSensorMode.RemoteControl: return pxsim.ev3board().remoteState.unmapButtons();
                default: return 0;
            }
        }
    }
    pxsim.InfraredSensorNode = InfraredSensorNode;
})(pxsim || (pxsim = {}));
var lf = pxsim.localization.lf;
var pxsim;
(function (pxsim) {
    var motors;
    (function (motors) {
        function portsToString(out) {
            let r = "";
            for (let i = 0; i < 4 /* DAL.NUM_OUTPUTS */; ++i) {
                if (out & (1 << i)) {
                    if (r.length > 0)
                        r += "+";
                    r += "ABCD"[i];
                }
            }
            return r;
        }
        function __motorUsed(ports, large) {
            //console.log("MOTOR INIT " + port);
            if (pxsim.ev3board().motorUsed(ports, large))
                pxsim.runtime.queueDisplayUpdate();
            else
                pxsim.U.userError(`${lf("Multiple motors are connected to Port")} ${portsToString(ports)}`);
        }
        motors.__motorUsed = __motorUsed;
    })(motors = pxsim.motors || (pxsim.motors = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var sensors;
    (function (sensors) {
        function __sensorUsed(port, type) {
            //console.log("SENSOR INIT " + port + ", type: " + type);
            if (type == 100 /* DAL.DEVICE_TYPE_IIC_UNKNOWN */)
                return; // Ignore IIC        
            if (!pxsim.ev3board().hasSensor(port)) {
                const sensor = pxsim.ev3board().getSensor(port, type);
                pxsim.runtime.queueDisplayUpdate();
            }
            else {
                pxsim.U.userError(`${lf("Multiple sensors are connected to Port")} ${port + 1}`);
            }
        }
        sensors.__sensorUsed = __sensorUsed;
    })(sensors = pxsim.sensors || (pxsim.sensors = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    class EV3LightState {
        constructor() {
            this.lightPattern = 0;
        }
    }
    pxsim.EV3LightState = EV3LightState;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var output;
    (function (output) {
        function setLights(pattern) {
            const brickState = pxsim.ev3board().getBrickNode();
            const lightState = brickState.lightState;
            if (lightState.lightPattern != pattern) {
                lightState.lightPattern = pattern;
                brickState.setChangedState();
            }
        }
        output.setLights = setLights;
    })(output = pxsim.output || (pxsim.output = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    let MotorDataOff;
    (function (MotorDataOff) {
        MotorDataOff[MotorDataOff["TachoCounts"] = 0] = "TachoCounts";
        MotorDataOff[MotorDataOff["Speed"] = 4] = "Speed";
        MotorDataOff[MotorDataOff["Padding"] = 5] = "Padding";
        MotorDataOff[MotorDataOff["TachoSensor"] = 8] = "TachoSensor";
        MotorDataOff[MotorDataOff["Size"] = 12] = "Size";
    })(MotorDataOff || (MotorDataOff = {}));
    class EV3MotorState {
        constructor() {
            let data = new Uint8Array(12 * 4 /* DAL.NUM_OUTPUTS */);
            pxsim.MMapMethods.register("/dev/lms_motor", {
                data,
                beforeMemRead: () => {
                    const outputs = pxsim.ev3board().outputNodes;
                    // console.log("motor before read");
                    for (let port = 0; port < 4 /* DAL.NUM_OUTPUTS */; ++port) {
                        const output = outputs[port];
                        const speed = output ? outputs[port].getSpeed() : 0;
                        const angle = output ? outputs[port].getAngle() : 0;
                        const tci = MotorDataOff.TachoCounts + port * MotorDataOff.Size;
                        const tsi = MotorDataOff.TachoSensor + port * MotorDataOff.Size;
                        data[tci] = data[tci + 1] = data[tci + 2] = data[tci + 3] = 0; // Tacho count
                        data[MotorDataOff.Speed + port * MotorDataOff.Size] = speed; // Speed
                        data[tsi] = angle & 0xff; // Count
                        data[tsi + 1] = (angle >> 8) & 0xff; // Count
                        data[tsi + 2] = (angle >> 16) & 0xff; // Count
                        data[tsi + 3] = (angle >> 24); // Count
                    }
                },
                read: buf => {
                    let v = "vSIM";
                    for (let i = 0; i < buf.data.length; ++i)
                        buf.data[i] = v.charCodeAt(i) || 0;
                    return buf.data.length;
                },
                write: buf => {
                    if (buf.data.length == 0)
                        return 2;
                    const cmd = buf.data[0];
                    return 2;
                },
                ioctl: (id, buf) => {
                    return 2;
                }
            });
        }
    }
    pxsim.EV3MotorState = EV3MotorState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    const MIN_RAMP_SPEED = 3;
    class MotorNode extends pxsim.BaseNode {
        constructor(port, large) {
            super(port);
            this.isOutput = true;
            // current state
            this.angle = 0;
            this.tacho = 0;
            this.speed = 0;
            this.manualReferenceAngle = undefined;
            this.manualAngle = undefined;
            this.setLarge(large);
        }
        isReady() {
            return !this.speedCmd;
        }
        getSpeed() {
            return Math.round(this.speed);
        }
        getAngle() {
            return Math.round(this.angle);
        }
        // returns the secondary motor if any
        getSynchedMotor() {
            return this._synchedMotor;
        }
        setSpeedCmd(cmd, values) {
            if (this.speedCmd != cmd ||
                JSON.stringify(this.speedCmdValues) != JSON.stringify(values))
                this.setChangedState();
            // new command TODO: values
            this.speedCmd = cmd;
            this.speedCmdValues = values;
            this.speedCmdTacho = this.tacho;
            this.speedCmdTime = pxsim.U.now();
            delete this._synchedMotor;
        }
        setSyncCmd(motor, cmd, values) {
            this.setSpeedCmd(cmd, values);
            this._synchedMotor = motor;
        }
        clearSpeedCmd() {
            delete this.speedCmd;
            delete this.speedCmdValues;
            delete this._synchedMotor;
            this.setChangedState();
        }
        clearSyncCmd() {
            if (this._synchedMotor)
                this.clearSpeedCmd();
        }
        setLarge(large) {
            this.id = large ? pxsim.NodeType.LargeMotor : pxsim.NodeType.MediumMotor;
            // large 170 rpm  (https://education.lego.com/en-us/products/ev3-large-servo-motor/45502)
            this.rotationsPerMilliSecond = (large ? 170 : 250) / 60000;
        }
        isLarge() {
            return this.id == pxsim.NodeType.LargeMotor;
        }
        reset() {
            // not sure what reset does...
        }
        clearCount() {
            this.tacho = 0;
            this.angle = 0;
        }
        stop() {
            this.started = false;
            this.clearSpeedCmd();
        }
        start() {
            this.started = true;
        }
        manualMotorDown() {
            this.manualReferenceAngle = this.angle;
            this.manualAngle = 0;
        }
        // position: 0, 360
        manualMotorAngle(angle) {
            this.manualAngle = angle;
        }
        manualMotorUp() {
            delete this.manualReferenceAngle;
            delete this.manualAngle;
        }
        updateState(elapsed) {
            //console.log(`motor: ${elapsed}ms - ${this.speed}% - ${this.angle}> - ${this.tacho}|`)
            const interval = Math.min(20, elapsed);
            let t = 0;
            while (t < elapsed) {
                let dt = interval;
                if (t + dt > elapsed)
                    dt = elapsed - t;
                this.updateStateStep(dt);
                t += dt;
            }
        }
        updateStateStep(elapsed) {
            if (this.manualAngle === undefined) {
                // compute new speed
                switch (this.speedCmd) {
                    case 165 /* DAL.opOutputSpeed */:
                    case 164 /* DAL.opOutputPower */:
                        // assume power == speed
                        // TODO: PID
                        this.speed = this.speedCmdValues[0];
                        break;
                    case 175 /* DAL.opOutputTimeSpeed */:
                    case 173 /* DAL.opOutputTimePower */:
                    case 172 /* DAL.opOutputStepPower */:
                    case 174 /* DAL.opOutputStepSpeed */: {
                        // ramp up, run, ramp down, <brake> using time
                        const speed = this.speedCmdValues[0];
                        const step1 = this.speedCmdValues[1];
                        const step2 = this.speedCmdValues[2];
                        const step3 = this.speedCmdValues[3];
                        const brake = this.speedCmdValues[4];
                        const isTimeCommand = this.speedCmd == 173 /* DAL.opOutputTimePower */ || this.speedCmd == 175 /* DAL.opOutputTimeSpeed */;
                        const dstep = isTimeCommand
                            ? pxsim.U.now() - this.speedCmdTime
                            : this.tacho - this.speedCmdTacho;
                        if (step1 && dstep < step1) { // rampup
                            this.speed = speed * dstep / step1;
                            // ensure non-zero speed
                            this.speed = Math.max(MIN_RAMP_SPEED, Math.ceil(Math.abs(this.speed))) * Math.sign(speed);
                        }
                        else if (dstep < step1 + step2) // run
                            this.speed = speed;
                        else if (step2 && dstep < step1 + step2 + step3) {
                            this.speed = speed * (step1 + step2 + step3 - dstep)
                                / (step1 + step2 + step3) + 5;
                            // ensure non-zero speed
                            this.speed = Math.max(MIN_RAMP_SPEED, Math.ceil(Math.abs(this.speed))) * Math.sign(speed);
                        }
                        else {
                            if (brake)
                                this.speed = 0;
                            if (!isTimeCommand) {
                                // we need to patch the actual position of the motor when
                                // finishing the move as our integration step introduce errors
                                const deltaAngle = -Math.sign(speed) * (dstep - (step1 + step2 + step3));
                                if (deltaAngle) {
                                    this.angle += deltaAngle;
                                    this.tacho -= Math.abs(deltaAngle);
                                    this.setChangedState();
                                }
                            }
                            this.clearSpeedCmd();
                        }
                        break;
                    }
                    case 176 /* DAL.opOutputStepSync */:
                    case 177 /* DAL.opOutputTimeSync */: {
                        const otherMotor = this._synchedMotor;
                        const speed = this.speedCmdValues[0];
                        const turnRatio = this.speedCmdValues[1];
                        // if turnratio is negative, right motor at power level
                        // right motor -> this.port > otherMotor.port
                        if (Math.sign(this.port - otherMotor.port)
                            == Math.sign(turnRatio))
                            break; // handled in other motor code
                        const stepsOrTime = this.speedCmdValues[2];
                        const brake = this.speedCmdValues[3];
                        const dstep = this.speedCmd == 177 /* DAL.opOutputTimeSync */
                            ? pxsim.U.now() - this.speedCmdTime
                            : this.tacho - this.speedCmdTacho;
                        // 0 is special case, run infinite
                        if (!stepsOrTime || dstep < stepsOrTime)
                            this.speed = speed;
                        else {
                            if (brake)
                                this.speed = 0;
                            this.clearSpeedCmd();
                        }
                        // turn ratio is a bit weird to interpret
                        // see https://communities.theiet.org/blogs/698/1706
                        otherMotor.speed = this.speed * (100 - Math.abs(turnRatio)) / 100;
                        // clamp
                        this.speed = Math.max(-100, Math.min(100, this.speed >> 0));
                        otherMotor.speed = Math.max(-100, Math.min(100, otherMotor.speed >> 0));
                        ;
                        // stop other motor if needed
                        if (!this._synchedMotor)
                            otherMotor.clearSpeedCmd();
                        break;
                    }
                }
            }
            else {
                // the user is holding the handle - so position is the angle
                this.speed = 0;
                // rotate by the desired angle change
                this.angle = this.manualReferenceAngle + this.manualAngle;
                this.setChangedState();
            }
            // don't round speed
            // compute delta angle
            const rotations = this.speed / 100 * this.rotationsPerMilliSecond * elapsed;
            const deltaAngle = rotations * 360;
            if (deltaAngle) {
                this.angle += deltaAngle;
                this.tacho += Math.abs(deltaAngle);
                this.setChangedState();
            }
            // if the motor was stopped or there are no speed commands,
            // let it coast to speed 0
            if ((this.manualReferenceAngle === undefined)
                && this.speed && !(this.started || this.speedCmd)) {
                // decay speed 5% per tick
                this.speed = Math.round(Math.max(0, Math.abs(this.speed) - 10) * pxsim.sign(this.speed));
            }
        }
    }
    pxsim.MotorNode = MotorNode;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    // A re-implementation of Math.sign (since IE11 doesn't support it)
    function sign(num) {
        return num ? num < 0 ? -1 : 1 : 0;
    }
    pxsim.sign = sign;
})(pxsim || (pxsim = {}));
/// <reference path="./sensor.ts"/>
var pxsim;
(function (pxsim) {
    let NXTLightSensorMode;
    (function (NXTLightSensorMode) {
        NXTLightSensorMode[NXTLightSensorMode["None"] = -1] = "None";
        NXTLightSensorMode[NXTLightSensorMode["ReflectedLightRaw"] = 0] = "ReflectedLightRaw";
        NXTLightSensorMode[NXTLightSensorMode["ReflectedLight"] = 1] = "ReflectedLight";
        NXTLightSensorMode[NXTLightSensorMode["AmbientLightRaw"] = 2] = "AmbientLightRaw";
        NXTLightSensorMode[NXTLightSensorMode["AmbientLight"] = 3] = "AmbientLight";
    })(NXTLightSensorMode = pxsim.NXTLightSensorMode || (pxsim.NXTLightSensorMode = {}));
    class NXTLightSensorNode extends pxsim.AnalogSensorNode {
        constructor(port) {
            super(port);
            this.id = pxsim.NodeType.NXTLightSensor;
            this.value = 0;
            this.darkReflectedLight = 3372;
            this.brightReflectedLight = 445;
            this.darkAmbientLight = 3411;
            this.brightAmbientLight = 633;
            this.mode = -1;
        }
        getDeviceType() {
            return 2 /* DAL.DEVICE_TYPE_NXT_LIGHT */;
        }
        setValue(value) {
            this.value = value;
            this.setChangedState();
        }
        getValue() {
            return this.value;
        }
        setMode(mode) {
            this.mode = mode;
            if (this.mode == NXTLightSensorMode.ReflectedLight)
                this.value = 1908;
            else if (this.mode == NXTLightSensorMode.AmbientLight)
                this.value = 2022;
            else
                this.value = 2048;
            this.changed = true;
            this.modeChanged = true;
        }
        getAnalogReadPin() {
            return pxsim.AnalogOff.InPin1;
        }
        isNXT() {
            return true;
        }
    }
    pxsim.NXTLightSensorNode = NXTLightSensorNode;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    class EV3OutputState {
        constructor() {
            let data = new Uint8Array(10);
            pxsim.MMapMethods.register("/dev/lms_pwm", {
                data,
                beforeMemRead: () => {
                    //console.log("pwm before read");
                    for (let i = 0; i < 10; ++i)
                        data[i] = 0;
                },
                read: buf => {
                    // console.log("pwm read");
                    if (buf.data.length == 0)
                        return 2;
                    const cmd = buf.data[0];
                    switch (cmd) {
                        case 169 /* DAL.opOutputTest */:
                            const port = buf.data[1];
                            let r = 0;
                            pxsim.ev3board().getMotor(port)
                                .filter(motor => !motor.isReady())
                                .forEach(motor => r |= (1 << motor.port));
                            pxsim.BufferMethods.setNumber(buf, pxsim.BufferMethods.NumberFormat.UInt8LE, 2, r);
                            break;
                        default:
                            let v = "vSIM";
                            for (let i = 0; i < buf.data.length; ++i)
                                buf.data[i] = v.charCodeAt(i) || 0;
                            break;
                    }
                    return buf.data.length;
                },
                write: buf => {
                    if (buf.data.length == 0)
                        return 2;
                    const cmd = buf.data[0];
                    switch (cmd) {
                        case 3 /* DAL.opProgramStart */: {
                            // init
                            return 2;
                        }
                        case 162 /* DAL.opOutputReset */: {
                            // reset
                            const port = buf.data[1];
                            const motors = pxsim.ev3board().getMotor(port);
                            motors.forEach(motor => motor.reset());
                            return 2;
                        }
                        case 178 /* DAL.opOutputClearCount */:
                            const port = buf.data[1];
                            const motors = pxsim.ev3board().getMotor(port);
                            motors.forEach(motor => motor.clearCount());
                            break;
                        case 172 /* DAL.opOutputStepPower */:
                        case 174 /* DAL.opOutputStepSpeed */:
                        case 173 /* DAL.opOutputTimePower */:
                        case 175 /* DAL.opOutputTimeSpeed */: {
                            // step speed
                            const port = buf.data[1];
                            const speed = pxsim.BufferMethods.getNumber(buf, pxsim.BufferMethods.NumberFormat.Int8LE, 2); // signed byte
                            // note that b[3] is padding                            
                            const step1 = pxsim.BufferMethods.getNumber(buf, pxsim.BufferMethods.NumberFormat.Int32LE, 4);
                            const step2 = pxsim.BufferMethods.getNumber(buf, pxsim.BufferMethods.NumberFormat.Int32LE, 8);
                            const step3 = pxsim.BufferMethods.getNumber(buf, pxsim.BufferMethods.NumberFormat.Int32LE, 12);
                            const brake = pxsim.BufferMethods.getNumber(buf, pxsim.BufferMethods.NumberFormat.Int8LE, 16);
                            //console.log(buf);
                            const motors = pxsim.ev3board().getMotor(port);
                            motors.forEach(motor => motor.setSpeedCmd(cmd, [speed, step1, step2, step3, brake]));
                            return 2;
                        }
                        case 176 /* DAL.opOutputStepSync */:
                        case 177 /* DAL.opOutputTimeSync */: {
                            const port = buf.data[1];
                            const speed = pxsim.BufferMethods.getNumber(buf, pxsim.BufferMethods.NumberFormat.Int8LE, 2); // signed byte
                            // note that b[3] is padding
                            const turnRatio = pxsim.BufferMethods.getNumber(buf, pxsim.BufferMethods.NumberFormat.Int16LE, 4);
                            // b[6], b[7] is padding
                            const stepsOrTime = pxsim.BufferMethods.getNumber(buf, pxsim.BufferMethods.NumberFormat.Int32LE, 8);
                            const brake = pxsim.BufferMethods.getNumber(buf, pxsim.BufferMethods.NumberFormat.Int8LE, 12);
                            const motors = pxsim.ev3board().getMotor(port);
                            // cancel any other sync command
                            for (const motor of pxsim.ev3board().getMotors().filter(motor => motors.indexOf(motor) < 0)) {
                                motor.clearSyncCmd();
                            }
                            // apply commands to all motors
                            for (const motor of motors) {
                                const otherMotor = motors.filter(m => m.port != motor.port)[0];
                                motor.setSyncCmd(otherMotor, cmd, [speed, turnRatio, stepsOrTime, brake]);
                            }
                            return 2;
                        }
                        case 163 /* DAL.opOutputStop */: {
                            // stop
                            const port = buf.data[1];
                            const brake = pxsim.BufferMethods.getNumber(buf, pxsim.BufferMethods.NumberFormat.Int8LE, 2);
                            const motors = pxsim.ev3board().getMotor(port);
                            motors.forEach(motor => motor.stop());
                            return 2;
                        }
                        case 164 /* DAL.opOutputPower */:
                        case 165 /* DAL.opOutputSpeed */: {
                            // setSpeed
                            const port = buf.data[1];
                            const speed = pxsim.BufferMethods.getNumber(buf, pxsim.BufferMethods.NumberFormat.Int8LE, 2);
                            const motors = pxsim.ev3board().getMotor(port);
                            motors.forEach(motor => motor.setSpeedCmd(cmd, [speed]));
                            return 2;
                        }
                        case 166 /* DAL.opOutputStart */: {
                            // start
                            const port = buf.data[1];
                            const motors = pxsim.ev3board().getMotor(port);
                            motors.forEach(motor => motor.start());
                            return 2;
                        }
                        case 167 /* DAL.opOutputPolarity */: {
                            console.error("opOutputPolarity not supported");
                            return 2;
                        }
                        case 161 /* DAL.opOutputSetType */: {
                            const portIndex = buf.data[1]; // not a port but a port index 0..3
                            const large = buf.data[2] == 0x07;
                            const motor = pxsim.ev3board().getMotors()[portIndex];
                            if (motor)
                                motor.setLarge(large);
                            return 2;
                        }
                        default:
                            console.warn('unknown cmd: ' + cmd);
                            break;
                    }
                    return 2;
                },
                ioctl: (id, buf) => {
                    return 2;
                }
            });
        }
    }
    pxsim.EV3OutputState = EV3OutputState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var game;
    (function (game) {
        function takeScreenshot() {
            // TODO
        }
        game.takeScreenshot = takeScreenshot;
    })(game = pxsim.game || (pxsim.game = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var music;
    (function (music) {
        function fromWAV(buf) {
            return buf;
        }
        music.fromWAV = fromWAV;
        function stopAllSounds() {
            pxsim.SoundMethods.stop();
        }
        music.stopAllSounds = stopAllSounds;
        pxsim.music.setVolume = (volume) => {
            pxsim.getAudioState().volume = volume;
        };
        function volume() {
            return pxsim.getAudioState().volume;
        }
        music.volume = volume;
    })(music = pxsim.music || (pxsim.music = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var SoundMethods;
    (function (SoundMethods) {
        let audio;
        function buffer(buf) {
            return buf;
        }
        SoundMethods.buffer = buffer;
        function play(buf) {
            return pxsim.AudioContextManager.playBufferAsync(buf);
        }
        SoundMethods.play = play;
        function stop() {
            pxsim.AudioContextManager.stop();
        }
        SoundMethods.stop = stop;
    })(SoundMethods = pxsim.SoundMethods || (pxsim.SoundMethods = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var storage;
    (function (storage) {
        function __stringToBuffer(s) {
            // TODO
            return new pxsim.RefBuffer(new Uint8Array([]));
        }
        storage.__stringToBuffer = __stringToBuffer;
        function __bufferToString(b) {
            // TODO
            return "";
        }
        storage.__bufferToString = __bufferToString;
        function __mkdir(fn) {
            // TODO
        }
        storage.__mkdir = __mkdir;
        function __unlink(filename) {
            // TODO
        }
        storage.__unlink = __unlink;
        function __truncate(filename) {
            // TODO
        }
        storage.__truncate = __truncate;
    })(storage = pxsim.storage || (pxsim.storage = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    pxsim.TOUCH_SENSOR_ANALOG_PRESSED = 2600;
    class TouchSensorNode extends pxsim.AnalogSensorNode {
        constructor(port) {
            super(port);
            this.id = pxsim.NodeType.TouchSensor;
            this.pressed = [];
        }
        setPressed(pressed) {
            this.pressed.push(pressed);
            this.setChangedState();
        }
        isPressed() {
            return this.pressed;
        }
        getValue() {
            if (this.pressed.length) {
                if (this.pressed.pop())
                    return pxsim.TOUCH_SENSOR_ANALOG_PRESSED;
            }
            return 0;
        }
        getDeviceType() {
            return 16 /* DAL.DEVICE_TYPE_TOUCH */;
        }
        hasData() {
            return this.pressed.length > 0;
        }
    }
    pxsim.TouchSensorNode = TouchSensorNode;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    let UartOff;
    (function (UartOff) {
        UartOff[UartOff["TypeData"] = 0] = "TypeData";
        UartOff[UartOff["Repeat"] = 1792] = "Repeat";
        UartOff[UartOff["Raw"] = 4192] = "Raw";
        UartOff[UartOff["Actual"] = 42592] = "Actual";
        UartOff[UartOff["LogIn"] = 42600] = "LogIn";
        UartOff[UartOff["Status"] = 42608] = "Status";
        UartOff[UartOff["Output"] = 42612] = "Output";
        UartOff[UartOff["OutputLength"] = 42740] = "OutputLength";
        UartOff[UartOff["Size"] = 42744] = "Size";
    })(UartOff || (UartOff = {}));
    let UartStatus;
    (function (UartStatus) {
        UartStatus[UartStatus["UART_PORT_CHANGED"] = 1] = "UART_PORT_CHANGED";
        UartStatus[UartStatus["UART_DATA_READY"] = 8] = "UART_DATA_READY";
    })(UartStatus || (UartStatus = {}));
    let IO;
    (function (IO) {
        IO[IO["UART_SET_CONN"] = 3222041856] = "UART_SET_CONN";
        IO[IO["UART_READ_MODE_INFO"] = 3225187585] = "UART_READ_MODE_INFO";
        IO[IO["UART_NACK_MODE_INFO"] = 3225187586] = "UART_NACK_MODE_INFO";
        IO[IO["UART_CLEAR_CHANGED"] = 3225187587] = "UART_CLEAR_CHANGED";
        IO[IO["IIC_SET_CONN"] = 3222038786] = "IIC_SET_CONN";
        IO[IO["IIC_READ_TYPE_INFO"] = 3225184515] = "IIC_READ_TYPE_INFO";
        IO[IO["IIC_SETUP"] = 3226233093] = "IIC_SETUP";
        IO[IO["IIC_SET"] = 3224135942] = "IIC_SET";
        IO[IO["TST_PIN_ON"] = 3221976065] = "TST_PIN_ON";
        IO[IO["TST_PIN_OFF"] = 3221976066] = "TST_PIN_OFF";
        IO[IO["TST_PIN_READ"] = 3221976067] = "TST_PIN_READ";
        IO[IO["TST_PIN_WRITE"] = 3221976068] = "TST_PIN_WRITE";
        IO[IO["TST_UART_ON"] = 3225973765] = "TST_UART_ON";
        IO[IO["TST_UART_OFF"] = 3225973766] = "TST_UART_OFF";
        IO[IO["TST_UART_EN"] = 3225973767] = "TST_UART_EN";
        IO[IO["TST_UART_DIS"] = 3225973768] = "TST_UART_DIS";
        IO[IO["TST_UART_READ"] = 3225973769] = "TST_UART_READ";
        IO[IO["TST_UART_WRITE"] = 3225973770] = "TST_UART_WRITE";
    })(IO || (IO = {}));
    let DevConOff;
    (function (DevConOff) {
        DevConOff[DevConOff["Connection"] = 0] = "Connection";
        DevConOff[DevConOff["Type"] = 4] = "Type";
        DevConOff[DevConOff["Mode"] = 8] = "Mode";
        DevConOff[DevConOff["Size"] = 12] = "Size";
    })(DevConOff = pxsim.DevConOff || (pxsim.DevConOff = {}));
    let UartCtlOff;
    (function (UartCtlOff) {
        UartCtlOff[UartCtlOff["TypeData"] = 0] = "TypeData";
        UartCtlOff[UartCtlOff["Port"] = 56] = "Port";
        UartCtlOff[UartCtlOff["Mode"] = 57] = "Mode";
        UartCtlOff[UartCtlOff["Size"] = 58] = "Size";
    })(UartCtlOff || (UartCtlOff = {}));
    let TypesOff;
    (function (TypesOff) {
        TypesOff[TypesOff["Name"] = 0] = "Name";
        TypesOff[TypesOff["Type"] = 12] = "Type";
        TypesOff[TypesOff["Connection"] = 13] = "Connection";
        TypesOff[TypesOff["Mode"] = 14] = "Mode";
        TypesOff[TypesOff["DataSets"] = 15] = "DataSets";
        TypesOff[TypesOff["Format"] = 16] = "Format";
        TypesOff[TypesOff["Figures"] = 17] = "Figures";
        TypesOff[TypesOff["Decimals"] = 18] = "Decimals";
        TypesOff[TypesOff["Views"] = 19] = "Views";
        TypesOff[TypesOff["RawMin"] = 20] = "RawMin";
        TypesOff[TypesOff["RawMax"] = 24] = "RawMax";
        TypesOff[TypesOff["PctMin"] = 28] = "PctMin";
        TypesOff[TypesOff["PctMax"] = 32] = "PctMax";
        TypesOff[TypesOff["SiMin"] = 36] = "SiMin";
        TypesOff[TypesOff["SiMax"] = 40] = "SiMax";
        TypesOff[TypesOff["InvalidTime"] = 44] = "InvalidTime";
        TypesOff[TypesOff["IdValue"] = 46] = "IdValue";
        TypesOff[TypesOff["Pins"] = 48] = "Pins";
        TypesOff[TypesOff["Symbol"] = 49] = "Symbol";
        TypesOff[TypesOff["Align"] = 54] = "Align";
        TypesOff[TypesOff["Size"] = 56] = "Size";
    })(TypesOff || (TypesOff = {}));
    class EV3UArtState {
        constructor() {
            let data = new Uint8Array(UartOff.Size);
            pxsim.MMapMethods.register("/dev/lms_uart", {
                data,
                beforeMemRead: () => {
                    //console.log("uart before read");
                    const inputNodes = pxsim.ev3board().getInputNodes();
                    for (let port = 0; port < 4 /* DAL.NUM_INPUTS */; port++) {
                        const node = inputNodes[port];
                        if (node && node.isUart()) {
                            // Actual
                            const index = 0; //UartOff.Actual + port * 2;
                            if (!node.isModeReturnArr()) {
                                const value = Math.round(node.getValue());
                                pxsim.util.map16Bit(data, UartOff.Raw + 32 /* DAL.MAX_DEVICE_DATALENGTH */ * 300 * port + 32 /* DAL.MAX_DEVICE_DATALENGTH */ * index, value);
                            }
                            else {
                                const values = node.getValues();
                                for (let i = 0, offset = 0; i < values.length; i++, offset += 2) {
                                    pxsim.util.map16Bit(data, UartOff.Raw + 32 /* DAL.MAX_DEVICE_DATALENGTH */ * 300 * port + 32 /* DAL.MAX_DEVICE_DATALENGTH */ * index + offset, Math.round(values[i]));
                                }
                            }
                            // Status
                            data[UartOff.Status + port] = node.valueChange() ? UartStatus.UART_PORT_CHANGED : UartStatus.UART_DATA_READY;
                        }
                    }
                },
                read: buf => {
                    let v = "vSIM";
                    // for (let i = 0; i < buf.data.length; ++i)
                    //     buf.data[i] = v.charCodeAt(i) || 0
                    return buf.data.length;
                },
                write: buf => {
                    return 2;
                },
                ioctl: (id, buf) => {
                    switch (id) {
                        case IO.UART_SET_CONN: {
                            // Set mode
                            //console.log("IO.UART_SET_CONN");
                            for (let port = 0; port < 4 /* DAL.NUM_INPUTS */; port++) {
                                const connection = buf.data[DevConOff.Connection + port]; // CONN_NONE, CONN_INPUT_UART
                                const type = buf.data[DevConOff.Type + port];
                                const mode = buf.data[DevConOff.Mode + port];
                                //console.log(`${port}, mode: ${mode}`)
                                const node = pxsim.ev3board().getInputNodes()[port];
                                if (node)
                                    node.setMode(mode);
                            }
                            return 2;
                        }
                        case IO.UART_CLEAR_CHANGED: {
                            //console.log("IO.UART_CLEAR_CHANGED")
                            for (let port = 0; port < 4 /* DAL.NUM_INPUTS */; port++) {
                                const connection = buf.data[DevConOff.Connection + port]; // CONN_NONE, CONN_INPUT_UART
                                const type = buf.data[DevConOff.Type + port];
                                const mode = buf.data[DevConOff.Mode + port];
                                const node = pxsim.ev3board().getInputNodes()[port];
                                if (node)
                                    node.setMode(mode);
                            }
                            return 2;
                        }
                        case IO.UART_READ_MODE_INFO: {
                            //console.log("IO.UART_READ_MODE_INFO")
                            const port = buf.data[UartCtlOff.Port];
                            const mode = buf.data[UartCtlOff.Mode];
                            const node = pxsim.ev3board().getInputNodes()[port];
                            if (node)
                                buf.data[UartCtlOff.TypeData + TypesOff.Type] = node.getDeviceType(); // DEVICE_TYPE_NONE, DEVICE_TYPE_TOUCH, 
                            return 2;
                        }
                    }
                    return 2;
                }
            });
        }
    }
    pxsim.EV3UArtState = EV3UArtState;
})(pxsim || (pxsim = {}));
/// <reference path="./sensor.ts"/>
var pxsim;
(function (pxsim) {
    class UltrasonicSensorNode extends pxsim.UartSensorNode {
        constructor(port) {
            super(port);
            this.id = pxsim.NodeType.UltrasonicSensor;
            this.distance = 127; // in cm
        }
        getDeviceType() {
            return 30 /* DAL.DEVICE_TYPE_ULTRASONIC */;
        }
        setDistance(distance) {
            if (this.distance != distance) {
                this.distance = distance;
                this.setChangedState();
            }
        }
        getValue() {
            return this.distance * 10; // convert to 0.1 cm
        }
    }
    pxsim.UltrasonicSensorNode = UltrasonicSensorNode;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var util;
    (function (util) {
        function map16Bit(buffer, index, value) {
            buffer[index] = value & 0xFF;
            buffer[index + 1] = (value >> 8) & 0xFF;
        }
        util.map16Bit = map16Bit;
    })(util = pxsim.util || (pxsim.util = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class View {
            constructor() {
                this.rendered = false;
                this.visible = false;
                this.width = 0;
                this.height = 0;
                this.left = 0;
                this.top = 0;
                this.scaleFactor = 1;
                this.hover = false;
            }
            inject(parent, theme, width, visible = true) {
                this.width = width;
                this.theme = theme;
                parent.appendChild(this.getView());
                if (visible) {
                    this.visible = true;
                    this.onComponentInjected();
                }
            }
            getWidth() {
                return this.scaleFactor == undefined ? this.getInnerWidth() : this.getInnerWidth() * this.scaleFactor;
            }
            getHeight() {
                return this.scaleFactor == undefined ? this.getInnerHeight() : this.getInnerHeight() * this.scaleFactor;
            }
            onComponentInjected() {
                // To be overridden by sub class
            }
            onComponentVisible() {
                // To be overridden by sub class
            }
            onComponentHidden() {
                // To be overridden by sub class
            }
            translate(x, y, applyImmediately = true) {
                this.left = x;
                this.top = y;
                if (applyImmediately) {
                    this.updateTransform();
                }
            }
            scale(scaleFactor, applyImmediately = true) {
                this.scaleFactor = scaleFactor;
                if (applyImmediately) {
                    this.updateTransform();
                }
            }
            updateState() {
            }
            updateTheme(theme) {
                this.theme = theme;
                this.updateThemeCore();
            }
            updateThemeCore() {
            }
            setVisible(visible) {
                if (this.rendered) {
                    this.getView().style.display = visible ? 'block' : 'none';
                }
            }
            hasClick() {
                return true;
            }
            registerClick(handler, zoom) {
                this.onClickHandler = handler;
                if (zoom) {
                    this.getView().addEventListener(pxsim.pointerEvents.up, (ev) => {
                        if (!this.getSelected()) {
                            this.onClickHandler(ev);
                            this.setHover(false);
                        }
                    });
                    this.getView().addEventListener(pxsim.pointerEvents.move, () => {
                        if (!this.getSelected()) {
                            this.setHover(true);
                        }
                    });
                    this.getView().addEventListener(pxsim.pointerEvents.leave, () => {
                        this.setHover(false);
                    });
                }
                else {
                    this.getView().addEventListener(pxsim.pointerEvents.up, this.onClickHandler);
                }
            }
            dispose() {
                if (this.onClickHandler)
                    this.getView().removeEventListener(pxsim.pointerEvents.up, this.onClickHandler);
                View.dispose(this);
            }
            getView() {
                if (!this.rendered) {
                    this.element = pxsim.svg.elt("g");
                    View.track(this);
                    const content = this.buildDom();
                    if (content) {
                        this.element.appendChild(content);
                    }
                    this.updateTransform();
                    this.rendered = true;
                }
                return this.element;
            }
            resize(width, height, strict) {
                this.width = width;
                this.height = height;
            }
            getActualHeight() {
                return this.height;
            }
            getActualWidth() {
                return this.width;
            }
            updateTransform() {
                if (this.rendered) {
                    let left = this.left;
                    let top = this.top;
                    let scaleFactor = this.scaleFactor;
                    if (this.hover) {
                        const hoverScaleFactor = scaleFactor + 0.05;
                        // Scale around center of module 
                        const centerX = this.getWidth() / 2;
                        const centerY = this.getHeight() / 2;
                        left = left - centerX * (hoverScaleFactor - 1);
                        top = top - centerY * (hoverScaleFactor - 1);
                        scaleFactor = hoverScaleFactor;
                    }
                    let transform = `translate(${left} ${top})`;
                    if (scaleFactor !== 1) {
                        transform += ` scale(${scaleFactor})`;
                    }
                    this.element.setAttribute("transform", transform);
                }
            }
            static getInstance(element) {
                if (element.hasAttribute("ref-id")) {
                    return View.allViews[element.getAttribute("ref-id")];
                }
                return undefined;
            }
            static track(view) {
                const myId = "id-" + (View.currentId++);
                view.element.setAttribute("ref-id", myId);
                View.allViews[myId] = view;
            }
            static dispose(view) {
                if (view.element) {
                    const id = view.element.getAttribute("ref-id");
                    // TODO: Remove from DOM
                    view.element.parentNode.removeChild(view.element);
                    delete View.allViews[id];
                }
            }
            ///////// HOVERED STATE /////////////
            getHover() {
                return this.hover;
            }
            setHover(hover) {
                if (this.hover != hover) {
                    this.hover = hover;
                    this.updateTransform();
                }
            }
            ///////// SELECTED STATE /////////////
            getSelected() {
                return this.selected;
            }
            setSelected(selected) {
                if (this.selected != selected) {
                    this.selected = selected;
                    this.setChangedState();
                }
            }
            setChangedState() {
                this.changed = true;
            }
            didChange() {
                const res = this.changed;
                this.changed = false;
                return res;
            }
            hasBackground() {
                return false;
            }
        }
        View.currentId = 0;
        View.allViews = {};
        visuals.View = View;
        class SimView extends View {
            constructor(state) {
                super();
                this.state = state;
            }
            getId() {
                return this.state.id;
            }
            getPort() {
                return this.state.port;
            }
            getPaddingRatio() {
                return 0;
            }
            getWiringRatio() {
                return 0.5;
            }
            setSelected(selected) { }
            getView() {
                return super.getView();
            }
            kill() {
            }
        }
        visuals.SimView = SimView;
        class ViewContainer extends View {
            getInnerWidth() {
                return 0;
            }
            getInnerHeight() {
                return 0;
            }
            addView(view) {
                view.inject(this.element, this.theme);
            }
            clear() {
                const markForRemoval = [];
                forEachElement(this.element.childNodes, e => {
                    markForRemoval.push(e);
                });
                markForRemoval.forEach(e => {
                    this.element.removeChild(e);
                });
            }
            onComponentInjected() {
                const observer = new MutationObserver(records => {
                    records.forEach(r => {
                        forEachElement(r.addedNodes, node => {
                            const instance = View.getInstance(node);
                            if (instance) {
                                instance.onComponentVisible();
                            }
                        });
                        forEachElement(r.removedNodes, node => {
                            const instance = View.getInstance(node);
                            if (instance) {
                                instance.onComponentHidden();
                            }
                        });
                    });
                });
                observer.observe(this.element, {
                    childList: true,
                    subtree: true
                });
            }
            buildDom() {
                return undefined;
            }
        }
        visuals.ViewContainer = ViewContainer;
        function forEachElement(nodes, cb) {
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (node.nodeType === Node.ELEMENT_NODE) {
                    cb(node);
                }
            }
        }
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        function normalizeId(prefix, svgId) {
            return `${prefix}-${svgId}`;
        }
        visuals.normalizeId = normalizeId;
        function normalizeXml(prefix, xml) {
            xml = xml.replace(/id=\"(.*?)\"/g, (m, id) => {
                return `id="${normalizeId(prefix, id)}"`;
            });
            xml = xml.replace(/url\(#(.*?)\)/g, (m, id) => {
                return `url(#${normalizeId(prefix, id)})`;
            });
            xml = xml.replace(/xlink:href=\"#(.*?)\"/g, (m, id) => {
                return `xlink:href="#${normalizeId(prefix, id)}"`;
            });
            return xml;
        }
        visuals.normalizeXml = normalizeXml;
        class ModuleView extends visuals.View {
            constructor(xml, prefix, id, port) {
                super();
                this.xml = xml;
                this.prefix = prefix;
                this.id = id;
                this.port = port;
                this.xml = normalizeXml(this.prefix, xml);
            }
            normalizeXml(xml) {
                return pxsim.visuals.normalizeXml(this.prefix, xml);
            }
            normalizeId(svgId) {
                return `${this.prefix}-${svgId}`;
            }
            getId() {
                return this.id;
            }
            getPort() {
                return this.port;
            }
            getPaddingRatio() {
                return 0;
            }
            getWiringRatio() {
                return 0.5;
            }
            buildDom() {
                this.content = pxsim.svg.parseString(this.xml);
                this.buildDomCore();
                if (pxsim.inLightMode())
                    this.optimizeForLightMode();
                this.attachEvents();
                if (this.hasClick())
                    this.content.style.cursor = "pointer";
                return this.content;
            }
            buildDomCore() {
            }
            optimizeForLightMode() {
            }
            getInnerHeight() {
                if (!this.content) {
                    return 0;
                }
                if (!this.content.hasAttribute("viewBox")) {
                    return this.getContentHeight();
                }
                return parseFloat(this.content.getAttribute("viewBox").split(" ")[3]);
            }
            getInnerWidth() {
                if (!this.content) {
                    return 0;
                }
                if (!this.content.hasAttribute("viewBox")) {
                    return this.getContentWidth();
                }
                return parseFloat(this.content.getAttribute("viewBox").split(" ")[2]);
            }
            getContentHeight() {
                if (!this.content) {
                    return 0;
                }
                return parseFloat(this.content.getAttribute("height"));
            }
            getContentWidth() {
                if (!this.content) {
                    return 0;
                }
                return parseFloat(this.content.getAttribute("width"));
            }
            attachEvents() {
            }
            resize(width, height, strict) {
                super.resize(width, height);
                this.updateDimensions(width, height);
            }
            updateDimensions(width, height) {
                if (this.content) {
                    const currentWidth = this.getInnerWidth();
                    const currentHeight = this.getInnerHeight();
                    const newHeight = currentHeight / currentWidth * width;
                    const newWidth = currentWidth / currentHeight * height;
                    this.content.setAttribute('width', `${width}`);
                    this.content.setAttribute('height', `${newHeight}`);
                    this.height = newHeight;
                }
            }
            hasClick() {
                return true;
            }
            setSelected(selected) {
                super.setSelected(selected);
                this.updateOpacity();
            }
            updateState() {
                this.updateOpacity();
            }
            updateOpacity() {
                if (this.rendered) {
                    const opacity = this.selected && this.fadeWhenSelected() ? 0.2 : 1;
                    if (this.hasClick() && this.opacity != opacity) {
                        this.opacity = opacity;
                        this.setOpacity(this.opacity);
                    }
                    if (this.hasClick()) {
                        if (this.selected)
                            this.content.style.cursor = "";
                        else
                            this.content.style.cursor = "pointer";
                    }
                }
            }
            fadeWhenSelected() {
                return true;
            }
            setOpacity(opacity) {
                this.element.setAttribute("opacity", `${opacity}`);
            }
        }
        visuals.ModuleView = ModuleView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./moduleView.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class PortView extends visuals.ModuleView {
            constructor(port, label) {
                super(visuals.PORT_SVG, "port", pxsim.NodeType.Port, port);
                this.label = label;
            }
            buildDomCore() {
                const textLabel = this.content.getElementById(this.normalizeId("port_text"));
                textLabel.textContent = this.label;
                textLabel.style.userSelect = 'none';
            }
            getPaddingRatio() {
                return 1 / 6;
            }
            hasClick() {
                return false;
            }
        }
        visuals.PortView = PortView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./view.ts" />
/// <reference path="./nodes/moduleView.ts" />
/// <reference path="./nodes/portView.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        visuals.BRICK_HEIGHT_RATIO = 1 / 3;
        visuals.MODULE_AND_WIRING_HEIGHT_RATIO = 1 / 3; // For inputs and outputs
        visuals.MODULE_HEIGHT_RATIO = visuals.MODULE_AND_WIRING_HEIGHT_RATIO * 4 / 5;
        visuals.WIRING_HEIGHT_RATIO = visuals.MODULE_AND_WIRING_HEIGHT_RATIO / 5;
        visuals.MODULE_INNER_PADDING_RATIO = 1 / 35;
        visuals.MAX_MODULE_WIDTH = 100;
        visuals.MIN_MODULE_HEIGHT = 40;
        visuals.CLOSE_ICON_GAP_MULTIPLIER = 0.3;
        class LayoutView extends visuals.ViewContainer {
            constructor() {
                super();
                this.inputs = [];
                this.outputs = [];
                this.inputContainers = [];
                this.outputContainers = [];
                this.inputControls = [];
                this.outputControls = [];
                this.inputCloseIcons = [];
                this.outputCloseIcons = [];
                this.inputBackgroundViews = [];
                this.outputBackgroundViews = [];
                this.inputWires = [];
                this.outputWires = [];
                this.renderedViews = {};
                this.hasDimensions = false;
                this.outputContainers = [new visuals.ViewContainer(), new visuals.ViewContainer, new visuals.ViewContainer(), new visuals.ViewContainer()];
                this.inputContainers = [new visuals.ViewContainer(), new visuals.ViewContainer, new visuals.ViewContainer(), new visuals.ViewContainer()];
                this.brick = new visuals.BrickViewPortrait(0);
                this.brickLandscape = new visuals.BrickViewLandscape(0);
                for (let port = 0; port < 4 /* DAL.NUM_OUTPUTS */; port++) {
                    this.outputWires[port] = new visuals.WireView(port);
                }
                for (let port = 0; port < 4 /* DAL.NUM_INPUTS */; port++) {
                    this.inputWires[port] = new visuals.WireView(port);
                }
            }
            layout(width, height) {
                this.hasDimensions = true;
                this.resize(width, height);
                this.scrollGroup.setAttribute("width", width.toString());
                this.scrollGroup.setAttribute("height", height.toString());
                this.position();
            }
            setBrick(brick) {
                this.brick = brick;
                this.brick.inject(this.scrollGroup, this.theme);
                this.brickLandscape.inject(this.scrollGroup, this.theme);
                this.brick.setSelected(false);
                this.brickLandscape.setSelected(true);
                this.brickLandscape.setVisible(false);
                this.position();
            }
            isBrickLandscape() {
                return this.brickInLandscape;
            }
            getBrick() {
                return this.brickInLandscape ? this.getLandscapeBrick() : this.getPortraitBrick();
            }
            getPortraitBrick() {
                return this.brick;
            }
            getLandscapeBrick() {
                return this.brickLandscape;
            }
            unselectBrick() {
                this.brick.setSelected(false);
                this.brickLandscape.setSelected(true);
                this.brickLandscape.setVisible(false);
                this.brickInLandscape = false;
                this.position();
            }
            setlectBrick() {
                this.brick.setSelected(true);
                this.brickLandscape.setSelected(false);
                this.brickLandscape.setVisible(true);
                this.brickInLandscape = true;
                this.position();
            }
            toggleBrickSelect() {
                const selected = this.brickInLandscape;
                if (selected)
                    this.unselectBrick();
                else
                    this.setlectBrick();
            }
            setInput(port, view, control, closeIcon, backgroundView) {
                if (this.inputs[port] != view || this.inputControls[port] != control) {
                    if (this.inputs[port]) {
                        // Remove current input
                        this.inputs[port].dispose();
                    }
                    this.inputs[port] = view;
                    if (this.inputControls[port]) {
                        this.inputControls[port].dispose();
                    }
                    this.inputControls[port] = control;
                    this.inputCloseIcons[port] = closeIcon;
                    this.inputBackgroundViews[port] = backgroundView;
                    this.inputContainers[port].clear();
                    if (control && backgroundView)
                        this.inputContainers[port].addView(backgroundView);
                    this.inputContainers[port].addView(view);
                    if (control)
                        this.inputContainers[port].addView(control);
                    if (view.hasClick())
                        view.registerClick((ev) => {
                            view.setSelected(true);
                            pxsim.runtime.queueDisplayUpdate();
                        }, true);
                    if (control && closeIcon) {
                        this.inputContainers[port].addView(closeIcon);
                        closeIcon.registerClick(() => {
                            // Clear selection
                            view.setSelected(false);
                            pxsim.runtime.queueDisplayUpdate();
                        });
                    }
                }
                this.position();
            }
            setOutput(port, view, control, closeIcon, backgroundView) {
                if (this.outputs[port] != view || this.outputControls[port] != control) {
                    if (this.outputs[port]) {
                        // Remove current output
                        this.outputs[port].dispose();
                    }
                    this.outputs[port] = view;
                    if (this.outputControls[port]) {
                        this.outputControls[port].dispose();
                    }
                    this.outputControls[port] = control;
                    this.outputCloseIcons[port] = closeIcon;
                    this.outputBackgroundViews[port] = backgroundView;
                    this.outputContainers[port].clear();
                    if (control && backgroundView)
                        this.outputContainers[port].addView(backgroundView);
                    this.outputContainers[port].addView(view);
                    if (control)
                        this.outputContainers[port].addView(control);
                    if (view.hasClick())
                        view.registerClick((ev) => {
                            view.setSelected(true);
                            pxsim.runtime.queueDisplayUpdate();
                        }, true);
                    if (control && closeIcon) {
                        this.outputContainers[port].addView(closeIcon);
                        closeIcon.registerClick(() => {
                            // Clear selection
                            view.setSelected(false);
                            pxsim.runtime.queueDisplayUpdate();
                        });
                    }
                }
                this.position();
            }
            buildDom() {
                this.contentGroup = pxsim.svg.elt("g");
                this.scrollGroup = pxsim.svg.child(this.contentGroup, "g");
                this.inputs = [];
                this.outputs = [];
                this.inputControls = [];
                this.outputControls = [];
                // Inject all wires
                for (let port = 0; port < 4 /* DAL.NUM_OUTPUTS */; port++) {
                    this.outputWires[port].inject(this.scrollGroup, this.theme);
                }
                for (let port = 0; port < 4 /* DAL.NUM_INPUTS */; port++) {
                    this.inputWires[port].inject(this.scrollGroup, this.theme);
                }
                // Inject all view containers
                for (let i = 0; i < 4; i++) {
                    this.inputContainers[i].inject(this.scrollGroup, this.theme);
                    this.outputContainers[i].inject(this.scrollGroup, this.theme);
                }
                // Inject all ports
                this.setInput(0, new visuals.PortView(0, '1'));
                this.setInput(1, new visuals.PortView(1, '2'));
                this.setInput(2, new visuals.PortView(2, '3'));
                this.setInput(3, new visuals.PortView(3, '4'));
                this.setOutput(0, new visuals.PortView(0, 'A'));
                this.setOutput(1, new visuals.PortView(1, 'B'));
                this.setOutput(2, new visuals.PortView(2, 'C'));
                this.setOutput(3, new visuals.PortView(3, 'D'));
                return this.contentGroup;
            }
            getInnerWidth() {
                if (!this.hasDimensions) {
                    return 0;
                }
                return this.width;
            }
            getInnerHeight() {
                if (!this.hasDimensions) {
                    return 0;
                }
                return this.height;
            }
            updateTheme(theme) {
                this.inputWires.forEach(n => {
                    n.updateTheme(theme);
                });
                this.outputWires.forEach(n => {
                    n.updateTheme(theme);
                });
                this.inputs.forEach(n => {
                    n.updateTheme(theme);
                });
                this.brick.updateTheme(theme);
                this.brickLandscape.updateTheme(theme);
                this.outputs.forEach(n => {
                    n.updateTheme(theme);
                });
            }
            position() {
                if (!this.hasDimensions) {
                    return;
                }
                this.offsets = [];
                const contentWidth = this.width;
                if (!contentWidth)
                    return;
                const contentHeight = this.height;
                if (!contentHeight)
                    return;
                const noConnections = this.outputs.concat(this.inputs).filter(m => m.getId() != pxsim.NodeType.Port).length == 0;
                this.outputs.concat(this.inputs).forEach(m => m.setVisible(true));
                const moduleHeight = this.getModuleHeight();
                const brickHeight = this.getBrickHeight();
                const brickWidth = this.brick.getInnerWidth() / this.brick.getInnerHeight() * brickHeight;
                const brickPadding = (contentWidth - brickWidth) / 2;
                const modulePadding = this.getModulePadding();
                const moduleSpacing = contentWidth / 4;
                let currentX = this.getModulePadding();
                let currentY = 0;
                this.outputs.forEach((n, i) => {
                    this.outputContainers[i].translate(currentX + (this.getAbosluteModuleWidth() - this.getInnerModuleWidth()) / 2, currentY);
                    if (this.outputs[i]) {
                        const view = this.outputs[i];
                        const outputPadding = this.getInnerModuleWidth() * view.getPaddingRatio();
                        const outputHeight = this.getModuleHeight();
                        const outputWidth = this.getInnerModuleWidth();
                        // Translate and resize view
                        view.resize(outputWidth - outputPadding * 2, outputHeight);
                        // const viewHeight = view.getInnerHeight() / view.getInnerWidth() * outputWidth;
                        // view.translate(outputPadding + ((desiredOutputWidth - outputWidth) / 2), outputHeight - viewHeight, true);
                        const viewHeight = view.getActualHeight();
                        view.translate(outputPadding, outputHeight - viewHeight, true);
                        // Resize control
                        const control = this.outputControls[i];
                        if (control) {
                            const controlWidth = outputWidth;
                            const closeIconOffset = (this.getCloseIconSize() * (1 + visuals.CLOSE_ICON_GAP_MULTIPLIER));
                            const controlHeight = outputHeight - closeIconOffset;
                            control.resize(controlWidth, controlHeight);
                            control.translate((controlWidth - control.getActualWidth()) / 2, closeIconOffset + ((controlHeight - control.getActualHeight()) / 2), true);
                            // Translate and resize close icon
                            const closeIcon = this.outputCloseIcons[i];
                            if (closeIcon) {
                                const closeIconSize = this.getCloseIconSize();
                                closeIcon.resize(closeIconSize, closeIconSize);
                                closeIcon.translate((outputWidth - closeIcon.getActualWidth()) / 2, (visuals.CLOSE_ICON_GAP_MULTIPLIER * closeIcon.getActualHeight()), true);
                            }
                        }
                        // Resize background
                        const backgroundView = this.inputBackgroundViews[i];
                        if (backgroundView) {
                            backgroundView.resize(this.getInnerModuleWidth(), outputHeight);
                            backgroundView.translate(0, 0, true);
                        }
                    }
                    currentX += moduleSpacing;
                });
                currentX = 0;
                currentY = moduleHeight;
                const wireBrickSpacing = brickWidth / 5;
                const wiringYPadding = 5;
                let wireStartX = 0;
                let wireEndX = brickPadding + wireBrickSpacing;
                let wireEndY = currentY + this.getWiringHeight() + wiringYPadding;
                let wireStartY = currentY - wiringYPadding;
                // Draw output lines
                for (let port = 0; port < 4 /* DAL.NUM_OUTPUTS */; port++) {
                    this.outputWires[port].updateDimensions(wireStartX + moduleSpacing * this.outputs[port].getWiringRatio(), wireStartY, wireEndX, wireEndY);
                    this.outputWires[port].setSelected(this.outputs[port].getId() == pxsim.NodeType.Port);
                    wireStartX += moduleSpacing;
                    wireEndX += wireBrickSpacing;
                }
                currentX = brickPadding;
                currentY += this.getWiringHeight();
                // Render the brick in the middle
                this.brick.resize(brickWidth, brickHeight);
                this.brick.translate(currentX, currentY);
                this.brickLandscape.resize(contentWidth, brickHeight);
                this.brickLandscape.translate((contentWidth - this.brickLandscape.getContentWidth()) / 2, currentY);
                currentX = modulePadding;
                currentY += brickHeight + this.getWiringHeight();
                this.inputs.forEach((n, i) => {
                    this.inputContainers[i].translate(currentX + (this.getAbosluteModuleWidth() - this.getInnerModuleWidth()) / 2, currentY);
                    if (this.inputs[i]) {
                        const view = this.inputs[i];
                        const inputPadding = this.getInnerModuleWidth() * view.getPaddingRatio();
                        const inputHeight = this.getModuleHeight();
                        const inputWidth = this.getInnerModuleWidth();
                        // Translate and resize view
                        view.resize(inputWidth - inputPadding * 2, inputHeight);
                        const viewHeight = Math.max(view.getActualHeight(), visuals.MIN_MODULE_HEIGHT);
                        view.translate(inputPadding, 0, true);
                        // Resize control
                        const control = this.inputControls[i];
                        if (control) {
                            const controlWidth = inputWidth;
                            const controlHeight = inputHeight - viewHeight - (this.getCloseIconSize() * (1 + visuals.CLOSE_ICON_GAP_MULTIPLIER));
                            control.resize(controlWidth, controlHeight);
                            control.translate((controlWidth - control.getActualWidth()) / 2, viewHeight + ((controlHeight - control.getActualHeight()) / 2), true);
                            // Translate and resize close icon
                            const closeIcon = this.inputCloseIcons[i];
                            if (closeIcon) {
                                const closeIconSize = this.getCloseIconSize();
                                closeIcon.resize(closeIconSize, closeIconSize);
                                closeIcon.translate((inputWidth - closeIcon.getActualWidth()) / 2, inputHeight - ((1 + visuals.CLOSE_ICON_GAP_MULTIPLIER) * closeIcon.getActualHeight()), true);
                            }
                        }
                        // Resize background
                        const backgroundView = this.inputBackgroundViews[i];
                        if (backgroundView) {
                            backgroundView.resize(this.getInnerModuleWidth(), inputHeight, true);
                            backgroundView.translate(0, 0, true);
                        }
                    }
                    currentX += moduleSpacing;
                });
                wireStartX = moduleSpacing / 2;
                wireEndX = brickPadding + wireBrickSpacing;
                wireEndY = currentY - this.getWiringHeight() - wiringYPadding;
                wireStartY = currentY + wiringYPadding;
                // Draw input lines
                for (let port = 0; port < 4 /* DAL.NUM_INPUTS */; port++) {
                    this.inputWires[port].updateDimensions(wireStartX, wireStartY, wireEndX, wireEndY);
                    this.inputWires[port].setSelected(this.inputs[port].getId() == pxsim.NodeType.Port);
                    wireStartX += moduleSpacing;
                    wireEndX += wireBrickSpacing;
                }
            }
            getBrickHeight() {
                return this.height * visuals.BRICK_HEIGHT_RATIO;
            }
            getWiringHeight() {
                return this.height * visuals.WIRING_HEIGHT_RATIO;
            }
            getModuleBounds() {
                return {
                    width: Math.min(this.getAbosluteModuleWidth(), visuals.MAX_MODULE_WIDTH),
                    height: this.getModuleHeight()
                };
            }
            getModulePadding() {
                return this.getModuleBounds().width / 35;
            }
            getInnerModuleWidth() {
                return this.getModuleBounds().width - (this.getModulePadding() * 2);
            }
            getAbosluteModuleWidth() {
                return this.width / 4;
            }
            getModuleHeight() {
                return this.height * visuals.MODULE_HEIGHT_RATIO;
            }
            getCloseIconSize() {
                return this.getInnerModuleWidth() / 4;
            }
        }
        visuals.LayoutView = LayoutView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./layoutView.ts" />
var pxsim;
(function (pxsim) {
    pxsim.GAME_LOOP_FPS = 32;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var visuals;
    (function (visuals) {
        const EV3_STYLE = `
        svg.sim {
            margin-bottom:1em;
        }
        svg.sim.grayscale {
            -moz-filter: grayscale(1);
            -webkit-filter: grayscale(1);
            filter: grayscale(1);
        }
        .user-select-none, .sim-button {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        .sim-button {
            cursor: pointer;
        }
        .sim-button:hover {
            stroke-width: 2px !important;
            stroke: white !important;
        }

        .sim-systemled {
            fill:#333;
            stroke:#555;
            stroke-width: 1px;
        }

        .sim-text {
            font-family:"Lucida Console", Monaco, monospace;
            font-size:8px;
            fill:#fff;
            pointer-events: none;
            user-select: none;
        }
        .sim-text.small {
            font-size:6px;
        }
        .sim-text.medium {
            font-size:16px;
        }
        .sim-text.large {
            font-size:20px;
        }
        .sim-text.number {
            font-family: Courier, Lato, Work Sans, PT Serif, Source Serif Pro;
            /*font-weight: bold;*/
        }
        .sim-text.inverted {
            fill: #5A5A5A; /*#F12B21;*/
        }

        .no-drag, .sim-text, .sim-text-pin {
            user-drag: none;
            user-select: none;
            -moz-user-select: none;
            -webkit-user-drag: none;
            -webkit-user-select: none;
            -ms-user-select: none;
        }

        /* Color Grid */
        .sim-color-grid-circle:hover {
            stroke-width: 0.4;
            stroke: #000;
            cursor: pointer;
        }
        .sim-color-selected {
            stroke-width: 1px !important;
            stroke: #A8AAA8 !important;
        }
        .sim-color-wheel-half:hover {
            stroke-width: 1;
            stroke: #000;
            fill: gray !important;
            cursor: pointer;
        }

        /* Motor slider */
        .sim-motor-btn {
            cursor: pointer;
        }
        .sim-motor-btn:hover .btn {
            stroke-width: 2px;
            stroke: black !important;
        }
    `;
        const EV3_WIDTH = 99.984346;
        const EV3_HEIGHT = 151.66585;
        visuals.SCREEN_WIDTH = 178;
        visuals.SCREEN_HEIGHT = 128;
        visuals.themes = ["#3ADCFE"].map(accent => {
            return {
                accent: accent,
                buttonOuter: "#979797",
                buttonUps: ["#a8aaa8", "#393939", "#a8aaa8", "#a8aaa8", "#a8aaa8", '#a8aaa8'],
                buttonDown: "#000",
                wireColor: '#5A5A5A',
                backgroundViewColor: '#d6edff'
            };
        });
        function randomTheme(highContrast, light) {
            let theme = visuals.themes[Math.floor(Math.random() * visuals.themes.length)];
            if (highContrast) {
                theme = JSON.parse(JSON.stringify(theme));
                theme.highContrast = true;
                theme.wireColor = '#ffffff';
                theme.backgroundViewColor = '#ffffff';
            }
            return theme;
        }
        visuals.randomTheme = randomTheme;
        class EV3View {
            constructor(props) {
                this.props = props;
                this.cachedControlNodes = {};
                this.cachedDisplayViews = {};
                this.cachedCloseIcons = {};
                this.cachedBackgroundViews = {};
                this.width = 0;
                this.height = 0;
                this.running = false;
                this.lastAnimationIds = [];
                this.buildDom();
                const dalBoard = pxsim.board();
                dalBoard.updateSubscribers.push(() => this.updateState());
                if (props && props.wireframe)
                    pxsim.U.addClass(this.element, "sim-wireframe");
                if (props && props.theme)
                    this.updateTheme();
                if (props && props.runtime) {
                    this.board = this.props.runtime.board;
                    this.board.updateSubscribers.push(() => this.updateState());
                    this.updateState();
                }
                pxsim.Runtime.messagePosted = (msg) => {
                    switch (msg.type || "") {
                        case "status": {
                            const state = msg.state;
                            if (state == "killed")
                                this.kill();
                            if (state == "running")
                                this.begin();
                            break;
                        }
                    }
                };
            }
            getView() {
                return {
                    el: this.wrapper,
                    y: 0,
                    x: 0,
                    w: EV3View.BOARD_WIDTH,
                    h: EV3View.BOARD_WIDTH
                };
            }
            getCoord(pinNm) {
                // Not needed
                return undefined;
            }
            highlightPin(pinNm) {
                // Not needed
            }
            getPinDist() {
                // Not needed
                return 10;
            }
            updateTheme() {
                let theme = this.props.theme;
                this.layoutView.updateTheme(theme);
            }
            getControlForNode(id, port, useCache = true) {
                if (useCache && this.cachedControlNodes[id] && this.cachedControlNodes[id][port]) {
                    return this.cachedControlNodes[id][port];
                }
                let view;
                switch (id) {
                    case pxsim.NodeType.ColorSensor: {
                        const state = pxsim.ev3board().getInputNodes()[port];
                        if (state.getMode() == pxsim.ColorSensorMode.Colors) {
                            view = new visuals.ColorGridControl(this.element, this.defs, state, port);
                        }
                        else if (state.getMode() == pxsim.ColorSensorMode.RgbRaw) {
                            view = new visuals.ColorRGBWheelControl(this.element, this.defs, state, port);
                        }
                        else if (state.getMode() == pxsim.ColorSensorMode.Reflected) {
                            view = new visuals.ColorWheelControl(this.element, this.defs, state, port);
                        }
                        else if (state.getMode() == pxsim.ColorSensorMode.RefRaw) {
                            view = new visuals.ColorWheelControl(this.element, this.defs, state, port);
                        }
                        else if (state.getMode() == pxsim.ColorSensorMode.Ambient) {
                            view = new visuals.ColorWheelControl(this.element, this.defs, state, port);
                        }
                        break;
                    }
                    case pxsim.NodeType.UltrasonicSensor: {
                        const state = pxsim.ev3board().getInputNodes()[port];
                        view = new visuals.DistanceSliderControl(this.element, this.defs, state, port);
                        break;
                    }
                    case pxsim.NodeType.InfraredSensor: {
                        const state = pxsim.ev3board().getInputNodes()[port];
                        if (state.getMode() == pxsim.InfraredSensorMode.Proximity)
                            view = new visuals.ProximitySliderControl(this.element, this.defs, state, port);
                        else if (state.getMode() == pxsim.InfraredSensorMode.RemoteControl)
                            view = new visuals.RemoteBeaconButtonsControl(this.element, this.defs, state, port);
                        break;
                    }
                    case pxsim.NodeType.GyroSensor: {
                        const state = pxsim.ev3board().getInputNodes()[port];
                        view = new visuals.RotationSliderControl(this.element, this.defs, state, port);
                        break;
                    }
                    case pxsim.NodeType.NXTLightSensor: {
                        const state = pxsim.ev3board().getInputNodes()[port];
                        if (state.getMode() != pxsim.NXTLightSensorMode.None) {
                            view = new visuals.LightWheelControl(this.element, this.defs, state, port);
                        }
                        break;
                    }
                    case pxsim.NodeType.MediumMotor:
                    case pxsim.NodeType.LargeMotor: {
                        const state = pxsim.ev3board().getMotors()[port];
                        view = new visuals.MotorSliderControl(this.element, this.defs, state, port);
                        break;
                    }
                }
                if (view) {
                    if (!this.cachedControlNodes[id])
                        this.cachedControlNodes[id] = [];
                    this.cachedControlNodes[id][port] = view;
                    return view;
                }
                return undefined;
            }
            getDisplayViewForNode(id, port) {
                if (this.cachedDisplayViews[id] && this.cachedDisplayViews[id][port]) {
                    return this.cachedDisplayViews[id][port];
                }
                let view;
                switch (id) {
                    case pxsim.NodeType.TouchSensor:
                        view = new visuals.TouchSensorView(port);
                        break;
                    case pxsim.NodeType.MediumMotor:
                        view = new visuals.MediumMotorView(port);
                        break;
                    case pxsim.NodeType.LargeMotor:
                        view = new visuals.LargeMotorView(port);
                        break;
                    case pxsim.NodeType.GyroSensor:
                        view = new visuals.GyroSensorView(port);
                        break;
                    case pxsim.NodeType.ColorSensor:
                        view = new visuals.ColorSensorView(port);
                        break;
                    case pxsim.NodeType.UltrasonicSensor:
                        view = new visuals.UltrasonicSensorView(port);
                        break;
                    case pxsim.NodeType.InfraredSensor:
                        view = new visuals.InfraredView(port);
                        break;
                    case pxsim.NodeType.NXTLightSensor:
                        view = new visuals.NXTLightSensorView(port);
                        break;
                    case pxsim.NodeType.Brick:
                        //return new BrickView(0);
                        view = this.layoutView.getBrick();
                        break;
                }
                if (view) {
                    if (!this.cachedDisplayViews[id])
                        this.cachedDisplayViews[id] = [];
                    this.cachedDisplayViews[id][port] = view;
                    return view;
                }
                return undefined;
            }
            getCloseIconView(port) {
                if (this.cachedCloseIcons[port]) {
                    return this.cachedCloseIcons[port];
                }
                const closeIcon = new visuals.CloseIconControl(this.element, this.defs, new pxsim.PortNode(-1), -1);
                this.cachedCloseIcons[port] = closeIcon;
                return closeIcon;
            }
            getBackgroundView(port) {
                if (this.cachedBackgroundViews[port]) {
                    return this.cachedBackgroundViews[port];
                }
                const backgroundView = new visuals.BackgroundViewControl(this.element, this.defs, new pxsim.PortNode(-1), -1);
                this.cachedBackgroundViews[port] = backgroundView;
                return backgroundView;
            }
            buildDom() {
                this.wrapper = document.createElement('div');
                this.wrapper.style.display = 'inline';
                this.element = pxsim.svg.elt("svg", { height: "100%", width: "100%", "class": "user-select-none" });
                this.defs = pxsim.svg.child(this.element, "defs");
                this.style = pxsim.svg.child(this.element, "style", {});
                this.style.textContent = EV3_STYLE;
                this.layoutView = new visuals.LayoutView();
                this.layoutView.inject(this.element, this.props.theme);
                const brick = new visuals.BrickViewPortrait(-1);
                this.layoutView.setBrick(brick);
                EV3View.isPreviousBrickLandscape() ? this.layoutView.setlectBrick() : this.layoutView.unselectBrick();
                this.resize();
                // Add Screen canvas to board
                this.buildScreenCanvas();
                this.wrapper.appendChild(this.element);
                this.wrapper.appendChild(this.screenCanvas);
                this.wrapper.appendChild(this.screenCanvasTemp);
                window.addEventListener("resize", e => {
                    this.resize();
                });
            }
            resize() {
                if (!this.element)
                    return;
                this.width = document.body.offsetWidth;
                this.height = document.body.offsetHeight;
                this.layoutView.layout(this.width, this.height);
                this.updateState();
                let state = pxsim.ev3board().screenState;
                this.updateScreenStep(state);
            }
            buildScreenCanvas() {
                this.screenCanvas = document.createElement("canvas");
                this.screenCanvas.id = "board-screen-canvas";
                this.screenCanvas.style.userSelect = "none";
                this.screenCanvas.style.msUserSelect = "none";
                this.screenCanvas.style.webkitUserSelect = "none";
                this.screenCanvas.style.MozUserSelect = "none";
                this.screenCanvas.style.position = "absolute";
                this.screenCanvas.addEventListener(pxsim.pointerEvents.up, ev => {
                    this.layoutView.toggleBrickSelect();
                    this.resize();
                });
                /*
                this.screenCanvas.style.cursor = "crosshair";
                this.screenCanvas.onmousemove = (e: MouseEvent) => {
                    const x = e.clientX;
                    const y = e.clientY;
                    const bBox = this.screenCanvas.getBoundingClientRect();
                    this.updateXY(Math.floor((x - bBox.left) / this.screenScaledWidth * SCREEN_WIDTH),
                        Math.floor((y - bBox.top) / this.screenScaledHeight * SCREEN_HEIGHT));
                }
                this.screenCanvas.onmouseleave = () => {
                    this.updateXY(SCREEN_WIDTH, SCREEN_HEIGHT);
                }
                */
                this.screenCanvas.width = visuals.SCREEN_WIDTH;
                this.screenCanvas.height = visuals.SCREEN_HEIGHT;
                this.screenCanvasCtx = this.screenCanvas.getContext("2d");
                this.screenCanvasTemp = document.createElement("canvas");
                this.screenCanvasTemp.style.display = 'none';
            }
            kill() {
                this.running = false;
                if (this.lastAnimationIds.length > 0) {
                    this.lastAnimationIds.forEach(animationId => {
                        cancelAnimationFrame(animationId);
                    });
                }
                // Kill the brick
                this.layoutView.getPortraitBrick().kill();
                this.layoutView.getLandscapeBrick().kill();
                // Save previous inputs for the next cycle
                EV3View.previousSelectedInputs = {};
                pxsim.ev3board().getInputNodes().forEach((node, index) => EV3View.previousSelectedInputs[index] = (this.getDisplayViewForNode(node.id, index).getSelected()));
                EV3View.previousSeletedOutputs = {};
                pxsim.ev3board().getMotors().forEach((node, index) => EV3View.previousSeletedOutputs[index] = (this.getDisplayViewForNode(node.id, index).getSelected()));
                EV3View.previousBrickLandscape = this.layoutView.isBrickLandscape();
            }
            static isPreviousInputSelected(index) {
                const previousInput = EV3View.previousSelectedInputs[index];
                delete EV3View.previousSelectedInputs[index];
                return previousInput;
            }
            static isPreviousOutputSelected(index) {
                const previousOutput = EV3View.previousSeletedOutputs[index];
                delete EV3View.previousSeletedOutputs[index];
                return previousOutput;
            }
            static isPreviousBrickLandscape() {
                const b = EV3View.previousBrickLandscape;
                EV3View.previousBrickLandscape = false;
                return !!b;
            }
            begin() {
                this.running = true;
                this.updateState();
            }
            updateState() {
                if (this.lastAnimationIds.length > 0) {
                    this.lastAnimationIds.forEach(animationId => {
                        cancelAnimationFrame(animationId);
                    });
                }
                if (!this.running)
                    return;
                const fps = pxsim.GAME_LOOP_FPS;
                let now;
                let then = pxsim.U.now();
                let interval = 1000 / fps;
                let delta;
                let that = this;
                function loop() {
                    const animationId = requestAnimationFrame(loop);
                    that.lastAnimationIds.push(animationId);
                    now = pxsim.U.now();
                    delta = now - then;
                    if (delta > interval) {
                        then = now;
                        that.updateStateStep(delta);
                    }
                }
                loop();
            }
            updateStateStep(elapsed) {
                const inputNodes = pxsim.ev3board().getInputNodes();
                inputNodes.forEach((node, index) => {
                    node.updateState(elapsed);
                    const view = this.getDisplayViewForNode(node.id, index);
                    if (!node.didChange() && !view.didChange())
                        return;
                    if (view) {
                        const previousSelected = EV3View.isPreviousInputSelected(index);
                        const isSelected = previousSelected != undefined ? previousSelected : view.getSelected();
                        view.setSelected(isSelected);
                        const control = isSelected ? this.getControlForNode(node.id, index, !node.modeChange()) : undefined;
                        const closeIcon = control ? this.getCloseIconView(index + 10) : undefined;
                        const backgroundView = control && view.hasBackground() ? this.getBackgroundView(index + 10) : undefined;
                        this.layoutView.setInput(index, view, control, closeIcon, backgroundView);
                        view.updateState();
                        if (control)
                            control.updateState();
                    }
                });
                const brickNode = pxsim.ev3board().getBrickNode();
                if (brickNode.didChange()) {
                    this.layoutView.getPortraitBrick().updateState();
                    this.layoutView.getLandscapeBrick().updateState();
                }
                const outputNodes = pxsim.ev3board().getMotors();
                outputNodes.forEach((node, index) => {
                    node.updateState(elapsed);
                    const view = this.getDisplayViewForNode(node.id, index);
                    if (!node.didChange() && !view.didChange())
                        return;
                    if (view) {
                        const previousSelected = EV3View.isPreviousOutputSelected(index);
                        const isSelected = previousSelected != undefined ? previousSelected : view.getSelected();
                        view.setSelected(isSelected);
                        const control = isSelected ? this.getControlForNode(node.id, index) : undefined;
                        const closeIcon = control ? this.getCloseIconView(index) : undefined;
                        const backgroundView = control && view.hasBackground() ? this.getBackgroundView(index) : undefined;
                        this.layoutView.setOutput(index, view, control, closeIcon, backgroundView);
                        view.updateState();
                        if (control)
                            control.updateState();
                    }
                });
                let state = pxsim.ev3board().screenState;
                if (state.didChange()) {
                    this.updateScreenStep(state);
                }
            }
            updateScreenStep(state) {
                const isLandscape = this.layoutView.isBrickLandscape();
                const bBox = this.layoutView.getBrick().getScreenBBox();
                if (!bBox || bBox.width == 0)
                    return;
                const scale = (bBox.height - 2) / visuals.SCREEN_HEIGHT;
                this.screenScaledHeight = (bBox.height - 2);
                this.screenScaledWidth = this.screenScaledHeight / visuals.SCREEN_HEIGHT * visuals.SCREEN_WIDTH;
                this.screenCanvas.style.top = `${bBox.top + 1}px`;
                this.screenCanvas.style.left = `${bBox.left + ((bBox.width - this.screenScaledWidth) * 0.5)}px`;
                this.screenCanvas.width = this.screenScaledWidth;
                this.screenCanvas.height = this.screenScaledHeight;
                this.screenCanvas.style.cursor = !isLandscape ? "zoom-in" : "zoom-out";
                this.screenCanvasData = this.screenCanvasCtx.getImageData(0, 0, visuals.SCREEN_WIDTH, visuals.SCREEN_HEIGHT);
                new Uint32Array(this.screenCanvasData.data.buffer).set(state.screen);
                // Move the image to another canvas element in order to scale it
                this.screenCanvasTemp.style.width = `${visuals.SCREEN_WIDTH}`;
                this.screenCanvasTemp.style.height = `${visuals.SCREEN_HEIGHT}`;
                this.screenCanvasTemp.getContext("2d").putImageData(this.screenCanvasData, 0, 0);
                this.screenCanvasCtx.scale(scale, scale);
                this.screenCanvasCtx.drawImage(this.screenCanvasTemp, 0, 0);
            }
            updateXY(width, height) {
                const screenWidth = Math.max(0, Math.min(visuals.SCREEN_WIDTH, width));
                const screenHeight = Math.max(0, Math.min(visuals.SCREEN_HEIGHT, height));
                console.log(`width: ${screenWidth}, height: ${screenHeight}`);
                // TODO: add a reporter for the hovered XY position
            }
        }
        EV3View.BOARD_WIDTH = 500;
        EV3View.BOARD_HEIGHT = 500;
        EV3View.previousSelectedInputs = {};
        EV3View.previousSeletedOutputs = {};
        visuals.EV3View = EV3View;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        visuals.mkBoardView = (opts) => {
            return new visuals.EV3View({
                runtime: pxsim.runtime,
                theme: visuals.randomTheme(opts.highContrast, opts.light),
                disableTilt: false,
                wireframe: opts.wireframe,
            });
        };
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./nodes/moduleView.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        visuals.CONTROL_WIDTH = 76.84;
        visuals.CONTROL_HEIGHT = 112.72;
        visuals.CONTROL_TEXT_COLOR = '#000';
        class ControlView extends visuals.SimView {
            constructor(parent, globalDefs, state, port) {
                super(state);
                this.parent = parent;
                this.globalDefs = globalDefs;
                this.state = state;
                this.port = port;
            }
            getInnerWidth() {
                return visuals.CONTROL_WIDTH;
            }
            getInnerHeight() {
                return visuals.CONTROL_HEIGHT;
            }
            getPaddingRatio() {
                return 0;
            }
            getWiringRatio() {
                return 0.5;
            }
            hasClick() {
                return false;
            }
            buildDom() {
                this.content = pxsim.svg.elt("svg", { viewBox: `0 0 ${this.getInnerWidth()} ${this.getInnerHeight()}` });
                this.content.appendChild(this.getInnerView(this.parent, this.globalDefs));
                return this.content;
            }
            resize(width, height, strict) {
                super.resize(width, height);
                this.updateDimensions(width, height, strict);
            }
            updateDimensions(width, height, strict) {
                width = Math.max(0, width);
                height = Math.max(0, height);
                if (this.content) {
                    const currentWidth = this.getInnerWidth();
                    const currentHeight = this.getInnerHeight();
                    const newHeight = Math.max(0, currentHeight / currentWidth * width);
                    const newWidth = Math.max(0, currentWidth / currentHeight * height);
                    if (strict) {
                        this.content.setAttribute('width', `${width}`);
                        this.content.setAttribute('height', `${height}`);
                    }
                    else if (newHeight > height) {
                        // scale width instead
                        this.content.setAttribute('width', `${newWidth}`);
                        this.content.setAttribute('height', `${height}`);
                        this.width = newWidth;
                    }
                    else {
                        this.content.setAttribute('width', `${width}`);
                        this.content.setAttribute('height', `${newHeight}`);
                        this.height = newHeight;
                    }
                }
            }
            onComponentVisible() {
            }
        }
        visuals.ControlView = ControlView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        function touchEvents(e, move, down, up) {
            if (Array.isArray(e)) {
                e.forEach(el => bindEvents(el, move, down, up));
            }
            else {
                bindEvents(e, move, down, up);
            }
        }
        visuals.touchEvents = touchEvents;
        function bindEvents(e, move, down, up) {
            const moveEvent = move ? (ev) => {
                move.call(this, ev);
                ev.preventDefault();
                ev.stopPropagation();
            } : undefined;
            const enterEvent = move ? (ev) => {
                if (ev.buttons != 1) {
                    // cancel all events when we re-enter without a button down
                    upEvent(ev);
                }
            } : undefined;
            const upEvent = up ? (ev) => {
                up.call(this, ev);
                ev.preventDefault();
                ev.stopPropagation();
                // Unregister document up and move events
                if (window.PointerEvent) {
                    if (moveEvent)
                        document.removeEventListener("pointermove", moveEvent);
                    if (upEvent)
                        document.removeEventListener("pointerup", upEvent);
                    if (upEvent)
                        document.removeEventListener("pointercancel", upEvent);
                    if (moveEvent)
                        document.removeEventListener("pointerenter", enterEvent);
                }
                else {
                    if (moveEvent)
                        document.removeEventListener("mousemove", moveEvent);
                    if (upEvent)
                        document.removeEventListener("mouseup", upEvent);
                    if (moveEvent)
                        document.removeEventListener("mouseenter", enterEvent);
                    if (pxsim.svg.isTouchEnabled()) {
                        if (moveEvent)
                            document.removeEventListener("touchmove", moveEvent);
                        if (upEvent)
                            document.removeEventListener("touchend", upEvent);
                        if (upEvent)
                            document.removeEventListener("touchcancel", upEvent);
                    }
                }
            } : undefined;
            const downEvent = down ? (ev) => {
                down.call(this, ev);
                ev.preventDefault();
                ev.stopPropagation();
                // Register document up and move events
                if (window.PointerEvent) {
                    if (moveEvent)
                        document.addEventListener("pointermove", moveEvent);
                    if (upEvent)
                        document.addEventListener("pointerup", upEvent);
                    if (upEvent)
                        document.addEventListener("pointercancel", upEvent);
                    if (moveEvent)
                        document.addEventListener("pointerenter", enterEvent);
                }
                else {
                    if (moveEvent)
                        document.addEventListener("mousemove", moveEvent);
                    if (upEvent)
                        document.addEventListener("mouseup", upEvent);
                    if (moveEvent)
                        document.addEventListener("mouseenter", enterEvent);
                    if (pxsim.svg.isTouchEnabled()) {
                        if (moveEvent)
                            document.addEventListener("touchmove", moveEvent);
                        if (upEvent)
                            document.addEventListener("touchend", upEvent);
                        if (upEvent)
                            document.addEventListener("touchcancel", upEvent);
                    }
                }
            } : undefined;
            if (window.PointerEvent) {
                if (downEvent)
                    e.addEventListener("pointerdown", downEvent);
            }
            else {
                if (downEvent)
                    e.addEventListener("mousedown", downEvent);
                if (pxsim.svg.isTouchEnabled()) {
                    if (downEvent)
                        e.addEventListener("touchstart", downEvent);
                }
            }
        }
        function createGradient(id, opts) {
            const g = pxsim.svg.elt("linearGradient");
            g.setAttribute("id", id);
            opts.stops.forEach(stop => {
                let offset;
                if (typeof stop.offset === "number") {
                    offset = stop.offset + "%";
                }
                else {
                    offset = stop.offset;
                }
                pxsim.svg.child(g, "stop", { offset, "stop-color": stop.color });
            });
            return g;
        }
        visuals.createGradient = createGradient;
        function updateGradient(gradient, opts) {
            let j = 0;
            forEachElement(gradient.childNodes, (e, i) => {
                if (i < opts.stops.length) {
                    const stop = opts.stops[i];
                    e.setAttribute("offset", offsetString(stop.offset));
                    e.setAttribute("stop-color", stop.color);
                }
                else {
                    gradient.removeChild(e);
                }
                j = i + 1;
            });
            for (; j < opts.stops.length; j++) {
                const stop = opts.stops[j];
                pxsim.svg.child(gradient, "stop", { offset: offsetString(stop.offset), "stop-color": stop.color });
            }
        }
        visuals.updateGradient = updateGradient;
        function forEachElement(nodes, cb) {
            let index = 0;
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (node.nodeType === Node.ELEMENT_NODE) {
                    cb(node, index);
                    ++index;
                }
            }
        }
        visuals.forEachElement = forEachElement;
        function offsetString(offset) {
            return (typeof offset === "number") ? offset + "%" : offset;
        }
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./nodes/moduleView.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class WireView extends visuals.View {
            constructor(port) {
                super();
                this.port = port;
            }
            isRendered() {
                return !!this.wire;
            }
            updateDimensions(startX, startY, endX, endY) {
                this.startX = startX;
                this.startY = startY;
                this.endX = endX;
                this.endY = endY;
                this.hasDimensions = true;
                this.updatePath();
            }
            buildDom() {
                this.wire = pxsim.svg.elt("svg", { height: "100%", width: "100%" });
                this.path = pxsim.svg.child(this.wire, "path", {
                    'd': '',
                    'fill': 'transparent',
                    'stroke': '#5A5A5A',
                    'stroke-width': '3px'
                });
                this.setSelected(true);
                return this.wire;
            }
            updateThemeCore() {
                let theme = this.theme;
                this.path.setAttribute('stroke', theme.wireColor);
            }
            updatePath() {
                if (!this.hasDimensions)
                    return;
                const height = this.endY - this.startY;
                const thirdHeight = height / 3;
                const middleHeight = this.port == 1 || this.port == 2 ? thirdHeight : thirdHeight * 2;
                let d = `M${this.startX} ${this.startY}`;
                d += ` L${this.startX} ${this.startY + middleHeight}`;
                d += ` L${this.endX} ${this.startY + middleHeight}`;
                d += ` L${this.endX} ${this.endY}`;
                this.path.setAttribute('d', d);
            }
            getId() {
                return -2;
            }
            getPort() {
                return this.port;
            }
            getPaddingRatio() {
                return 0;
            }
            getWiringRatio() {
                return 0.5;
            }
            getInnerWidth() {
                return visuals.CONTROL_WIDTH;
            }
            getInnerHeight() {
                return visuals.CONTROL_HEIGHT;
            }
            setSelected(selected) {
                super.setSelected(selected);
                this.updateOpacity();
            }
            updateOpacity() {
                const opacity = this.selected ? "0.2" : "1";
                this.setOpacity(opacity);
            }
            setOpacity(opacity) {
                this.element.setAttribute("opacity", opacity);
            }
            hasClick() {
                return false;
            }
        }
        visuals.WireView = WireView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    pxsim.COLOR_SENSOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 33.22 34"><defs><linearGradient id="linear-gradient" x1="-448.15" y1="475.99" x2="-448.15" y2="475.83" gradientTransform="matrix(32.16 0 0 -33.37 14429.08 15914.64)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#a8aaa8"/><stop offset="1" stop-color="#535453"/></linearGradient></defs><g style="isolation:isolate"><g id="svg41"><g id="color_box" data-name="color box"><g id="color_grey" data-name="color grey"><path id="color_sideboxes" data-name="color sideboxes" d="M2.14 9.19H34a.7.7 0 0 1 .7.7V28a.7.7 0 0 1-.7.7H2.14a.7.7 0 0 1-.7-.7V9.89a.7.7 0 0 1 .7-.7z" transform="translate(-1.44 -1.6)" fill="#a8aaa8"/><g id="color_bigbox-2" data-name="color bigbox-2"><image width="33" height="34" transform="translate(.06)" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAjCAYAAADxG9hnAAAACXBIWXMAAAsSAAALEgHS3X78AAAAzUlEQVRYR+3YMU4DMRBG4W8Q5eYMUEMuw/3ScQDugkTPcoSsa4ZibYjcUMVQ+Ekjj+Tif7YrT2Sm/8BtayIisOCurtemYEXJzIzMFBEL7vGIJ7vMtVnxgje8q09zxAmvOONzQJ1r3gnH9jQLHuw3cmMMB3tewXIZGrVG8p056vS/MkV6pkjPFOmZIj1TpGeK9EyRninSM0V6pkjPFOmZIj2XIn81n0h+RAo+sNWNUbXV3NI+4Sueaz9iJNFouWu0iVFEHIwb0jQK1szcvgDqy2NNnOFs5AAAAABJRU5ErkJggg==" style="mix-blend-mode:multiply" opacity=".3"/><path id="color_bigbox-2_path" d="M5 3.33h26c1 0 1.78.57 1.78 1.27v28.17c0 .7-.8 1.27-1.78 1.27H5c-1 0-1.78-.57-1.78-1.27V4.6c.03-.7.83-1.27 1.78-1.27z" transform="translate(-1.44 -1.6)" fill="url(#linear-gradient)"/></g><path id="color_side_black_4" data-name="color side black 4" d="M31.83 10.38h.7v5.58h-.7z"/><path id="color_side_black_3" data-name="color side black 3" d="M.84 10.38h.7v5.58h-.7z"/><path id="color_side_black_2" data-name="color side black 2" d="M31.83 18.34h.7v5.58h-.7z"/><path id="color_side_black1" data-name="color side black1" d="M.84 18.34h.7v5.58h-.7z"/></g><path id="color_red" data-name="color red" d="M11.63 23.43a6.32 6.32 0 0 1 .15-1.37 8.79 8.79 0 1 1 12.54 0 6.42 6.42 0 1 1-12.55 2.7 6.61 6.61 0 0 1-.15-1.33z" transform="translate(-1.44 -1.6)" fill="#d42715"/><path id="color_black" data-name="color black" d="M13.11 23.43a4.89 4.89 0 0 1 .34-1.81 7.4 7.4 0 1 1 10.4-1.2 7.32 7.32 0 0 1-1.18 1.18 5 5 0 1 1-9.56 1.83z" transform="translate(-1.44 -1.6)"/><g id="color_sensors" data-name="color sensors" fill="#f1f1f1"><circle id="color_sensor_white_big" data-name="color sensor white big" cx="16.61" cy="14.43" r="3.35"/><circle id="color_sensor_white_small" data-name="color sensor white small" cx="16.61" cy="21.69" r="1.81"/></g></g></g></g></svg>`;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        visuals.EV3_LANDSCAPE_SVG = `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 146.25 120.31"><defs><linearGradient id="linear-gradient-background" x1="-809.89" y1="-16.33" x2="-809.89" y2="-16.88" gradientTransform="matrix(65.53 0 0 48.84 53145.53 916.09)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6a6a6a"/><stop offset=".52" stop-color="#6a6a6a"/><stop offset="1" stop-color="#6a6a6a"/></linearGradient><linearGradient id="linear-gradient" x1="-374.89" y1="432.9" x2="-374.89" y2="432.82" gradientTransform="matrix(110.73 0 0 -106.94 41567.45 46425.3)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f1f1f1"/><stop offset="1" stop-color="#7a7a7a"/></linearGradient><linearGradient id="linear-gradient-2" x1="-376" y1="450.74" x2="-376" y2="450.72" gradientTransform="matrix(100.11 0 0 -79.18 37697.19 35762.28)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#a8aaa8"/><stop offset="1" stop-color="gray"/></linearGradient><linearGradient id="linear-gradient-3" x1="-376.21" y1="614.94" x2="-376.21" y2="614.75" gradientTransform="matrix(98.29 0 0 -23.36 37033.43 14529.9)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#a8aaa8"/><stop offset="1" stop-color="#535453"/></linearGradient><linearGradient id="linear-gradient-black" x1="-382.07" y1="493.36" x2="-382.07" y2="494.25" gradientTransform="matrix(65.53 0 0 -48.84 25091.11 24228.69)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6a6a6a"/><stop offset=".52" stop-color="#6a6a6a"/><stop offset="1" stop-color="#6a6a6a"/></linearGradient><linearGradient id="linear-gradient-green" x2="145" y2="48" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6a6a6a"/><stop offset=".52" stop-color="#8CE300"/><stop offset="1" stop-color="#6a6a6a"/></linearGradient><linearGradient id="linear-gradient-red" x2="145" y2="48" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6a6a6a"/><stop offset=".52" stop-color="#D02E26"/><stop offset="1" stop-color="#6a6a6a"/></linearGradient><linearGradient id="linear-gradient-orange" x2="145" y2="48" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6a6a6a"/><stop offset=".52" stop-color="#F8D039"/><stop offset="1" stop-color="#6a6a6a"/></linearGradient><linearGradient id="linear-gradient-5" x1="-743.87" y1="1256.85" x2="-743.87" y2="1257.21" gradientTransform="matrix(3.03 0 0 -6.22 2312.41 7891.56)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#757575"/><stop offset="1" stop-color="#393939"/></linearGradient></defs><g id="EV3"><g id="brick"><path id="ev3_body_2" data-name="ev3 body 2" d="M2.64 0h141a2.47 2.47 0 0 1 2.64 2.25v115.81a2.47 2.47 0 0 1-2.64 2.25h-141A2.47 2.47 0 0 1 0 118.06V2.25A2.47 2.47 0 0 1 2.64 0z" fill="#fff"/><path id="ev3_screenborder" data-name="ev3 screenborder" d="M8.47 1.54h129.31a6.58 6.58 0 0 1 6.58 6.58v72.67a6.6 6.6 0 0 1-6.58 6.6H8.47a6.6 6.6 0 0 1-6.58-6.6V8.12a6.58 6.58 0 0 1 6.58-6.58z" fill="#393939"/><path id="ev3_screen" data-name="ev3 screen" d="M19.06 5.07h106.8a4.6 4.6 0 0 1 4.69 4.52v68.25a4.61 4.61 0 0 1-4.61 4.62H19.06a4.61 4.61 0 0 1-4.61-4.62V9.68a4.6 4.6 0 0 1 4.61-4.61z" fill="#97b5a6"/></g><g id="buttons"><path id="btn_grey" data-name="btn grey" d="M68.9 119.14c-3.46-3.34-8.84-8.84-8.84-8.84v-1.13h-2.13a5.13 5.13 0 1 1-.35-10.25h2.47v-1.13l8.76-8.94h8.75c3.94 4 8.74 8.75 8.74 8.75v1.32h2a5.13 5.13 0 0 1 .35 10.25H86.3v1.13c-4.66 4.79-8.68 8.84-8.68 8.84z" fill="#6a6a6a"/><path id="btn_color" data-name="btn color" d="M68.9 119.14c-3.46-3.34-8.84-8.84-8.84-8.84v-1.13h-2.13a5.13 5.13 0 1 1-.35-10.25h2.47v-1.13l8.76-8.94h8.75c3.94 4 8.74 8.75 8.74 8.75v1.32h2a5.13 5.13 0 0 1 .35 10.25H86.3v1.13c-4.66 4.79-8.68 8.84-8.68 8.84z" fill="url(#linear-gradient-background)"/><path id="btn_left" data-name="btn left" d="M57.85 100.14h6.45v7.62h-6.45a3.81 3.81 0 0 1-3.8-3.81 3.81 3.81 0 0 1 3.8-3.81z" fill="#a8aaa8"/><path id="btn_right" data-name="btn right" d="M88.32 107.76h-6.44v-7.62h6.44a3.81 3.81 0 0 1 3.81 3.8 3.81 3.81 0 0 1-3.81 3.81z" fill="#a8aaa8"/><path id="btn_enter" data-name="btn enter" d="M69.37 100.14h7.44a.29.29 0 0 1 .29.28v7.06a.29.29 0 0 1-.29.28h-7.44a.29.29 0 0 1-.28-.28v-7.06a.29.29 0 0 1 .28-.28z" fill="#393939"/><path id="btn_up" data-name="btn up" d="M69.19 90.26l7.9-.09L83 96.28l-2.44 2.44v4.42h-2.25v-2.55a1.86 1.86 0 0 0-1.86-1.86h-6.87a1.54 1.54 0 0 0-1.6 1.46v3H65.7v-4.47l-2.44-2.49z" fill="#a8aaa8"/><path id="btn_down" data-name="btn down" d="M77.05 117.65l-7.85.06-5.94-6.1 2.48-2.43v-4.44H68v2.54a1.9 1.9 0 0 0 1.86 1.9h6.82a1.62 1.62 0 0 0 1.65-1.58v-2.86h2.27v4.44l2.4 2.43z" fill="#a8aaa8"/></g></g></svg>`;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        visuals.EV3_SVG = `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110.73 170.04"><defs><linearGradient id="linear-gradient" x1="-374.89" y1="432.9" x2="-374.89" y2="432.82" gradientTransform="matrix(110.73 0 0 -106.94 41567.45 46425.3)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f1f1f1"/><stop offset="1" stop-color="#7a7a7a"/></linearGradient><linearGradient id="linear-gradient-2" x1="-376" y1="450.74" x2="-376" y2="450.72" gradientTransform="matrix(100.11 0 0 -79.18 37697.19 35762.28)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#a8aaa8"/><stop offset="1" stop-color="gray"/></linearGradient><linearGradient id="linear-gradient-3" x1="-376.21" y1="614.94" x2="-376.21" y2="614.75" gradientTransform="matrix(98.29 0 0 -23.36 37033.43 14529.9)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#a8aaa8"/><stop offset="1" stop-color="#535453"/></linearGradient><linearGradient id="linear-gradient-black" x1="-382.07" y1="493.36" x2="-382.07" y2="494.25" gradientTransform="matrix(65.53 0 0 -48.84 25091.11 24228.69)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6a6a6a"/><stop offset=".52" stop-color="#6a6a6a"/><stop offset="1" stop-color="#6a6a6a"/></linearGradient><linearGradient id="linear-gradient-green" x2="145" y2="48" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6a6a6a"/><stop offset=".52" stop-color="#8CE300"/><stop offset="1" stop-color="#6a6a6a"/></linearGradient><linearGradient id="linear-gradient-red" x2="145" y2="48" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6a6a6a"/><stop offset=".52" stop-color="#D02E26"/><stop offset="1" stop-color="#6a6a6a"/></linearGradient><linearGradient id="linear-gradient-orange" x2="145" y2="48" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6a6a6a"/><stop offset=".52" stop-color="#F8D039"/><stop offset="1" stop-color="#6a6a6a"/></linearGradient><linearGradient id="linear-gradient-5" x1="-743.87" y1="1256.85" x2="-743.87" y2="1257.21" gradientTransform="matrix(3.03 0 0 -6.22 2312.41 7891.56)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#757575"/><stop offset="1" stop-color="#393939"/></linearGradient><clipPath id="clip-path"><path fill="none" d="M86.48 149.58h12.38v12.38H86.48z"/></clipPath></defs><g id="EV3"><g id="brick"><path id="ev3_body_2" data-name="ev3 body 2" d="M2 31.7h106.76a2 2 0 0 1 2 2v103a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-103a2 2 0 0 1 2-2z" fill="url(#linear-gradient)"/><path id="ev3_body_1" data-name="ev3 body 1" d="M8.19 127.57h94.35a2 2 0 0 1 2 2v38.53a2 2 0 0 1-2 2H8.19a2 2 0 0 1-2-2v-38.56a2 2 0 0 1 2-2z" fill="#f1f1f1"/><path id="ev3_screen_grey" data-name="ev3 screen grey" d="M7.28 0h96.17a2 2 0 0 1 2 2v75.21a2 2 0 0 1-2 2H7.28a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z" fill="url(#linear-gradient-2)"/><path id="ev3_screenborder" data-name="ev3 screenborder" d="M18.2 10.47h74.48a3.79 3.79 0 0 1 3.79 3.79v41.86a3.8 3.8 0 0 1-3.79 3.8H18.2a3.8 3.8 0 0 1-3.79-3.8V14.26a3.79 3.79 0 0 1 3.79-3.79z" fill="#393939"/><path id="ev3_screen" data-name="ev3 screen" d="M24 12.44h63.22A2.73 2.73 0 0 1 90 15.17v40.35a2.73 2.73 0 0 1-2.73 2.73H24a2.73 2.73 0 0 1-2.73-2.73V15.17A2.73 2.73 0 0 1 24 12.44z" fill="#97b5a6"/><path id="ev3_grey_buttom" data-name="ev3 grey buttom" d="M6.22 146.68h98.29v21.39a2 2 0 0 1-2 2H8.19a2 2 0 0 1-2-2z" fill="url(#linear-gradient-3)"/></g><g id="buttons"><path id="btn_grey" data-name="btn grey" d="M48.69 133.94c-5.58-5.39-14.26-14.26-14.26-14.26v-1.82H31a8.27 8.27 0 1 1 0-16.53h3.41V99.5l14.13-14.41h14.11C69 91.61 76.75 99.2 76.75 99.2v2.13H80a8.27 8.27 0 1 1 0 16.53h-3.25v1.82c-7.51 7.73-14 14.26-14 14.26z" fill="#6a6a6a"/><path id="btn_color" data-name="btn color" d="M48.69 133.94c-5.58-5.39-14.26-14.26-14.26-14.26v-1.82H31a8.27 8.27 0 1 1 0-16.53h3.41V99.5l14.13-14.41h14.11C69 91.61 76.75 99.2 76.75 99.2v2.13H80a8.27 8.27 0 1 1 0 16.53h-3.25v1.82c-7.51 7.73-14 14.26-14 14.26z" fill="url(#linear-gradient-black)"/><path id="btn_left" data-name="btn left" d="M30.87 103.3h10.39v12.28H30.87a6.14 6.14 0 0 1-6.14-6.14 6.14 6.14 0 0 1 6.14-6.14z" fill="#a8aaa8"/><path id="btn_right" data-name="btn right" d="M80 115.58H69.62V103.3H80a6.14 6.14 0 0 1 6.15 6.14 6.14 6.14 0 0 1-6.15 6.14z" fill="#a8aaa8"/><path id="btn_enter" data-name="btn enter" d="M49.45 103.3h12a.46.46 0 0 1 .46.45v11.38a.46.46 0 0 1-.46.45h-12a.46.46 0 0 1-.46-.45v-11.38a.46.46 0 0 1 .46-.45z" fill="#393939"/><path id="btn_up" data-name="btn up" d="M49.15 87.37l12.74-.15 9.55 9.86L67.5 101v7.13h-3.64v-4.1a3 3 0 0 0-3-3H49.78a2.47 2.47 0 0 0-2.58 2.35v4.77h-3.67V101l-3.94-4z" fill="#a8aaa8"/><path id="btn_down" data-name="btn down" d="M61.83 131.54l-12.66.1-9.58-9.85 4-3.91v-7.17h3.6v4.11a3.06 3.06 0 0 0 3 3.06c3 .05 11 0 11 0a2.6 2.6 0 0 0 2.65-2.55v-4.62h3.67v7.17l3.91 3.91z" fill="#a8aaa8"/><path id="btn_part_4" data-name="btn part 4" fill="#393939" d="M54 59.76h3.03v13.8H54z"/><path id="btn_part_3" data-name="btn part 3" fill="#9a9a9a" d="M54 72.96h3.03v6.07H54z"/><path id="btn_part_2" data-name="btn part 2" fill="url(#linear-gradient-5)" d="M54 72.96h3.03v6.22H54z"/><path id="btn_part_1" data-name="btn part 1" fill="gray" d="M54 79.18h3.03v5.92H54z"/><path id="btn_back" data-name="btn back" d="M13.2 79.18h23.66v5.71c-2.62 2.64-6 6-6 6H15.17a2 2 0 0 1-2-2z" fill="#a8aaa8"/></g><g id="LEGO_logo" data-name="LEGO logo"><path id="logo_white_bg" data-name="logo white bg" fill="#fff" d="M86.56 149.66h12.21v12.21H86.56z"/><g id="lego"><g clip-path="url(#clip-path)"><g id="logo_part_5" data-name="logo part 5"><path id="Path_18" data-name="Path 18" d="M86.56 161.87h12.21v-12.21H86.56zM98 154.73a4.76 4.76 0 0 1-.24 1.18c-.43 1.27-.91 2.07-2.07 2.07a1.12 1.12 0 0 1-1.16-.7v-.15l-.09.11a1.86 1.86 0 0 1-1.46.72 1.29 1.29 0 0 1-1-.43l-.07-.09-.06.06a1.6 1.6 0 0 1-1.16.42 1.32 1.32 0 0 1-1-.37h-.09l-.07.07a1.55 1.55 0 0 1-1.11.37.87.87 0 0 1-.95-.79.37.37 0 0 1 0-.11 8.15 8.15 0 0 1 1.09-3.1 1 1 0 0 1 .92-.52.78.78 0 0 1 .57.17c.11.11.11.2.13.42v.28l.16-.24a1.6 1.6 0 0 1 1.52-.65 1 1 0 0 1 .9.37v.09l.06-.07a1.8 1.8 0 0 1 1.2-.39 1.53 1.53 0 0 1 1.12.37.69.69 0 0 1 .13.2l.07.11.08-.11a1.59 1.59 0 0 1 1.31-.57 1.27 1.27 0 0 1 1 .35 1.37 1.37 0 0 1 .26 1" fill="#ffed00"/></g></g><g clip-path="url(#clip-path)"><g id="logo_part_4" data-name="logo part 4"><path id="Path_19" data-name="Path 19" d="M86.56 161.87h12.21v-12.21H86.56zm11.75-6.66a6.73 6.73 0 0 1-.52 1.59 2.28 2.28 0 0 1-2.1 1.55 1.67 1.67 0 0 1-1.36-.54 2.18 2.18 0 0 1-1.48.54 1.73 1.73 0 0 1-1.09-.35 2.12 2.12 0 0 1-1.22.35 1.8 1.8 0 0 1-1-.3 2.19 2.19 0 0 1-1.18.3 1.28 1.28 0 0 1-1.36-1.21 8.26 8.26 0 0 1 1.18-3.34 1.37 1.37 0 0 1 1.22-.8c.59 0 .79.17.9.37a2.24 2.24 0 0 1 1.46-.4 1.51 1.51 0 0 1 1 .33A2.4 2.4 0 0 1 94 153a1.74 1.74 0 0 1 1.36.45 2 2 0 0 1 1.33-.43 1.53 1.53 0 0 1 1.37.61 1.79 1.79 0 0 1 .29 1.55" fill="#d42715"/></g></g><g clip-path="url(#clip-path)"><g id="logo_part_3" data-name="logo part 3"><path id="Path_20" data-name="Path 20" d="M86.48 162h12.38v-12.42H86.48zm12.2-.18h-12v-12h12z" fill="#171714"/></g></g><g clip-path="url(#clip-path)"><g id="logo_part_2" data-name="logo part 2"><path id="Path_21" data-name="Path 21" d="M98.25 153.29v-.09h.06s.07 0 .07.05 0 0-.07 0zm.2.17v-.06c0-.05 0-.07-.06-.07a.09.09 0 0 0 .08-.09.07.07 0 0 0-.07-.08h-.17v.3h.07v-.13.07zm-.16-.39a.24.24 0 0 1 0 .48.24.24 0 0 1-.24-.24.26.26 0 0 1 .24-.24m0-.07a.31.31 0 0 0 0 .62.31.31 0 0 0 .31-.31.32.32 0 0 0-.31-.31" fill="#171714"/></g></g><g clip-path="url(#clip-path)"><g id="logo_part_1" data-name="logo part 1"><path id="Path_22" data-name="Path 22" d="M96.7 153.33a1.73 1.73 0 0 0-1.38.61.66.66 0 0 0-.15-.22 1.47 1.47 0 0 0-1.16-.41 1.87 1.87 0 0 0-1.25.41 1.1 1.1 0 0 0-1-.41 1.7 1.7 0 0 0-1.6.7.52.52 0 0 0-.15-.46.87.87 0 0 0-.63-.2 1.1 1.1 0 0 0-1 .57 8.73 8.73 0 0 0-1.13 3.17 1 1 0 0 0 1 1h.08a1.53 1.53 0 0 0 1.18-.39 1.35 1.35 0 0 0 1 .39 1.61 1.61 0 0 0 1.23-.46 1.36 1.36 0 0 0 1.09.46 1.92 1.92 0 0 0 1.53-.77 1.2 1.2 0 0 0 1.24.75c1.2 0 1.73-.83 2.16-2.12a4.54 4.54 0 0 0 .27-1.2 1.21 1.21 0 0 0-1-1.37 1.29 1.29 0 0 0-.34 0m-8 3.28c.62-.11.79.11.77.33-.07.61-.63.76-1.12.74a.62.62 0 0 1-.69-.55 8.47 8.47 0 0 1 1.07-3 .72.72 0 0 1 .68-.39c.31 0 .37.15.37.33a14.2 14.2 0 0 1-1.07 2.55m2-.57c0 .11-.11.35-.17.59a3.1 3.1 0 0 1 .61-.09c.31 0 .48.14.48.38 0 .59-.66.76-1.11.76a.85.85 0 0 1-.94-.75v-.08a6 6 0 0 1 .67-2.27 1.36 1.36 0 0 1 1.53-.9c.31 0 .68.13.68.44s-.35.56-.68.59h-.5a3.58 3.58 0 0 0-.24.48c.64-.09.9 0 .79.41s-.59.52-1.12.44m3.13-1.55a.46.46 0 0 0-.37.21 6.33 6.33 0 0 0-.64 1.73c0 .28.09.35.22.35s.46-.24.55-.61c0 0-.42 0-.31-.37s.33-.44.68-.46c.7 0 .63.48.57.76a1.81 1.81 0 0 1-1.7 1.6.9.9 0 0 1-1-.79v-.18a5 5 0 0 1 .4-1.55c.37-.87.76-1.48 1.77-1.48.59 0 1.07.22 1 .76a.67.67 0 0 1-.64.68c-.11 0-.52 0-.39-.42 0-.13 0-.24-.15-.24m3.75.75a7.06 7.06 0 0 1-.59 1.61 1.41 1.41 0 0 1-1.37.86.82.82 0 0 1-.94-.86 5.11 5.11 0 0 1 .39-1.63c.31-.83.63-1.51 1.66-1.49s.94 1.05.85 1.51m-.85-.52a9.84 9.84 0 0 1-.63 1.85.33.33 0 0 1-.31.22c-.13 0-.17-.09-.2-.2a7.75 7.75 0 0 1 .7-1.94c.09-.13.18-.16.26-.13s.18.11.18.2" fill="#171714"/></g></g></g></g><g id="EV3_logo" data-name="EV3 logo" fill="#f1f1f1"><path id="ev3_3" data-name="ev3 3" d="M36 155a.18.18 0 0 1 .2.16v.84a.16.16 0 0 1-.17.14H34a.36.36 0 0 0-.38.33v1.14a.34.34 0 0 0 .38.3h2c.19 0 .17.14.17.14v.82c0 .08-.06.14-.17.14h-3.43a.2.2 0 0 1-.2-.19v-.05a.38.38 0 0 0-.38-.38h-1.12a.38.38 0 0 0-.38.38v1.64a.37.37 0 0 0 .38.33h6.75a.36.36 0 0 0 .39-.3v-6.89a.36.36 0 0 0-.39-.3H30.9a.34.34 0 0 0-.38.3v1.67a.38.38 0 0 0 .35.38H32a.36.36 0 0 0 .35-.36v-.05a.17.17 0 0 1 .16-.19H36z"/><path id="ev3_v" data-name="ev3 v" d="M29.29 153.2H27.7c-.24 0-.33.17-.44.38L25.32 158a.27.27 0 0 1-.19.11.23.23 0 0 1-.19-.14L23 153.58c-.11-.21-.22-.38-.46-.38h-1.62c-.35 0-.41.19-.3.41l3.2 6.73c.17.32.28.38.58.38h1.42a.55.55 0 0 0 .57-.38l3.22-6.73c.11-.22 0-.41-.32-.41"/><path id="ev3_e" data-name="ev3 e" d="M19.39 156.1a.34.34 0 0 1 .38.3v1.17a.33.33 0 0 1-.38.3h-5.05c-.11 0-.2.06-.2.14v.82c0 .08.09.14.2.14h5.05a.33.33 0 0 1 .38.3v1.15a.33.33 0 0 1-.35.3h-6.75a.35.35 0 0 1-.38-.3v-6.89a.34.34 0 0 1 .38-.3h6.75a.31.31 0 0 1 .35.28v1.17a.31.31 0 0 1-.33.3h-5.08c-.11 0-.22 0-.22.13v.89c0 .08.09.14.19.14z"/></g></g></svg>`;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    pxsim.LARGE_MOTOR_SVG = `<?xml version="1.0" encoding="UTF-8"?> <svg width="82px" height="156px" viewBox="0 0 82 156" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <title>Large Motor</title> <desc>Created with Sketch.</desc> <defs></defs> <g id="Artboard" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(-66.000000, -54.000000)"> <g id="Large-Motor" transform="translate(66.000000, 54.000000)"> <path d="M39.98,155.52 L13.67,155.52 C13.3386292,155.52 13.07,155.251371 13.07,154.92 L13.07,149.62 C13.07,149.288629 13.3386292,149.02 13.67,149.02 L39.98,149.02 C40.3113708,149.02 40.58,149.288629 40.58,149.62 L40.58,154.9 C40.5854219,155.062566 40.5246096,155.220368 40.4114947,155.337253 C40.2983799,155.454138 40.1426565,155.52009 39.98,155.52 Z" id="LM_back2" fill="#A8AAA8" fill-rule="nonzero"></path> <g id="Group" transform="translate(9.000000, 136.000000)"> <image id="Bitmap" opacity="0.3" style="mix-blend-mode: multiply;" x="0" y="0" width="36" height="20" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAVCAYAAADB5CeuAAAAAXNSR0IArs4c6QAAAMRJREFUSA3tlrERwjAMRW2OEmYgPQMwFrMwAytBT1iB9OY/x05J1IAopLtv2Y5yevfPhXIpJWVF+oMQSwEDmJ00tKzkFpM6P8Q1bbUZpLN0lLwcw6G7dJFuQOEUQCfJE0rtK0sCigCmq144LIshG4fmqy0DatWiVhBOhVNWB6x18abCKasD1rr+puocY/3pS3ULA1DMMU/pJfHBQ/SGAZY6JYzKVw6Kw5x+vnYGcsptHN5rDxCzlUfg0CgWHJuhPCg+9XwDDy9ID0K8XgsAAAAASUVORK5CYII="></image> <path d="M33.84,18.07 L2.51,18.07 C2.17862915,18.07 1.91,17.8013708 1.91,17.47 L1.91,2.77 C1.91,2.43862915 2.17862915,2.17 2.51,2.17 L33.84,2.17 C34.1713708,2.17 34.44,2.43862915 34.44,2.77 L34.44,17.47 C34.44,17.8013708 34.1713708,18.07 33.84,18.07 Z" id="LM_back1-2" fill="#A8AAA8" fill-rule="nonzero"></path> </g> <g id="LM_rightside" transform="translate(22.000000, 37.000000)" fill-rule="nonzero"> <path d="M12.06,34.51 L6.45,34.51 C4.99937339,34.5153259 3.60647912,33.9421088 2.57978624,32.9172929 C1.55309337,31.892477 0.977328505,30.5006339 0.98,29.05 L0.98,6.15 C0.977339027,4.70110385 1.55173283,3.31078487 2.57625885,2.28625885 C3.60078487,1.26173283 4.99110385,0.687339027 6.44,0.69 L12.05,0.69 C15.0654747,0.69 17.51,3.13452527 17.51,6.15 L17.51,29.05 C17.5126553,30.4971617 16.939633,31.8859609 15.9172718,32.910198 C14.8949106,33.9344351 13.5071641,34.5100024 12.06,34.51 Z" id="LM_rightside5" fill="#A8AAA8"></path> <circle id="LM_rightside4" fill="#FFFFFF" cx="6.3" cy="29.21" r="3.79"></circle> <circle id="LM_rightside3" fill="#FFFFFF" cx="6.3" cy="6" r="3.79"></circle> <path d="M3.38,24.59 C4.07351535,24.1313154 4.88857129,23.8909784 5.72,23.9 C6.76862292,23.8298668 7.81405119,24.0772848 8.72,24.61 C9.97,25.54 9.95,24.51 9.95,24.51 L9.95,22.71 C9.95,22.26 9.39,21.86 8.72,22.25 L7.72,22.83 C7.72,22.83 7.36,23.02 7.36,22.5 L7.36,19.9 C7.36,19.9 7.36,19.11 8.09,19.13 C8.82,19.15 9.47,19.13 9.47,19.13 C9.47,19.13 9.76,18.88 9.76,17.74 C9.76,16.6 9.47,16.42 9.47,16.42 L8.08,16.42 C8.08,16.42 7.35,16.42 7.35,15.77 L7.35,14.47 C7.35,14.47 7.12,14.11 6.18,14.17 C5.6978322,14.1741563 5.22153417,14.2762201 4.78,14.47 L4.78,15.77 C4.77453579,16.1305967 4.48063814,16.4200414 4.12,16.42 C3.49,16.42 2.86,16.42 2.86,16.42 C2.86,16.42 2.61,16.61 2.57,17.74 C2.53,18.87 2.86,19.13 2.86,19.13 L4.12,19.13 C4.12,19.13 4.92,19.18 4.94,19.9 C4.96,20.62 4.94,22.52 4.94,22.52 C4.94,22.52 4.94,23.03 4.6,22.85 L3.39,22.27 C3.39,22.27 2.56,21.86 2.57,22.73 C2.58,23.6 2.57,24.53 2.57,24.53 C2.57,24.53 2.65,25.02 3.38,24.59 Z" id="LM_rightside2" fill="#FFFFFF"></path> <path d="M10.23,12.79 C10.1913976,13.0147775 10.0630557,13.2141964 9.87446015,13.3424414 C9.68586455,13.4706864 9.453229,13.5167322 9.23,13.47 C9.14591061,13.4523039 9.06499079,13.421959 8.99,13.38 C8.1099436,12.9124008 7.1357966,12.6492102 6.14,12.61 C5.162003,12.5962776 4.20061308,12.8635231 3.37,13.38 C2.54,13.78 2.3,12.79 2.3,12.79 L2.3,11.03 C2.33192589,10.6400455 2.66941985,10.3469587 3.06,10.37 C3.16998614,10.3773249 3.27646607,10.4116733 3.37,10.47 C4.20732336,10.980005 5.16044012,11.2690368 6.14,11.31 C7.13850164,11.2335413 8.10964397,10.9473099 8.99,10.47 C8.99,10.47 10.17,10.23 10.19,11.03 C10.21,11.83 10.23,12.79 10.23,12.79 Z" id="LM_rightside1" fill="#FFFFFF"></path> </g> <g id="Group" transform="translate(32.000000, 12.000000)"> <image id="Bitmap" opacity="0.3" style="mix-blend-mode: multiply;" x="0" y="0" width="36" height="76" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAABNCAYAAAAhOa00AAAAAXNSR0IArs4c6QAAAnlJREFUaAXtmsFRwzAQRROGI6EEwhmGEqABTtyhACqiAC4cOVBBaAEKCB0AuYf/hdbjBMcrbYTlw+7MZp3IWr98OZIn2ul6vZ7k2BTG89Evr2PGRaY5ucEzQ+55zL9EXP0HXDJUBLoCyG2EekZ8hy8B9h0/KxKSoFpA97jqJZxDSKUI9QhflAQ7RMJe2wKiUhxC2jn8BH7ENzivGFgvVA9Q4MDLMZygwUqB7YRSgISDkcoVBeuEygASuLJgnBLaHr/5NeIL/AvO+SjVP3HuE/wCHn5E7dypxwfo3JhBoaZvPKBiZ9F5bDOhR28msSrUVpLqUmXmmkn+nBiGjp1jEsuQtYHkeC8wsBQH2huMv745/A7Omdp+H6DzljGXaaogFGdkzswlgZAumAlM5qnwOCKZCsdsMIEqzPEnXRbYUFCkTAYbEioZbGioJLAaUCpYLahesJpQO8FqQwkYV5MVnM/9bxuPLjyjknG64KoSnvfHAkUtmlVlTFAEC+ZQooQWXSlNIWl3pUQJLbpSmkLS7kqJElp0pTSFpN2VEiW06EppCkm7KyVKaNGV0hSSdldKlNCiK6UpJO2ulCihRVdKU0jaXSlRQouulKaQtI9JKW7JBRsLFCtAPuD8M3YyBigCvcJZCcJ/h6tDEWgBf2DEPnOomampVCcQ4KoptROoFlQvUA0oFWhoqCSgIaGSgYaCygIaAiobiFCy3yelIPyM1uwo/b41vZqAeCVCcb1hwR+NMNxzY6lJ2HtDtBiBuHRszNSpiQTiFB0EgkA3cEarcQ0zVzWGajAUc7WHq4RSYetV1rLcb9ZZ57kFmZsznA8g3qcm64QyZSrY6Qey39wRVmjftAAAAABJRU5ErkJggg=="></image> <path d="M33.89,60.6 L20.48,73.53 L1.91,72.9 L1.74,13.9 C1.74,13.06 1.9,13.06 2.2,12.77 L12.62,2.67 L12.83,2.48 C13.42,2.08 14.83,2.59 14.83,3.43 L34.27,24.15 L34.27,59.9 C34.28,60.34 34.14,60.33 33.89,60.6 Z" id="LM_level4-2" fill="#A8AAA8" fill-rule="nonzero"></path> </g> <g id="Group" transform="translate(32.000000, 69.000000)"> <image id="Bitmap" opacity="0.3" style="mix-blend-mode: multiply;" x="0" y="0" width="25" height="27" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAcCAYAAAB/E6/TAAAAAXNSR0IArs4c6QAAAZhJREFUSA3tlj1SwzAQRnEmJanogYoChiOQC1BxAA7AcTgDDQfgBLlDekxNQ5LefE/WeizHGa9l07Ezny3L2n36W9lFVVVnXStk3Trvs+IdB5Rz0a0XY6X6K+ncG7zV7qByqZj7Vl0oJqAIWevNswRsrJVyeJM2XdjSIrUgL6p7kBjZWLuVQ5gJxUthcepYk3vpXfqRmOdc7eT7IT1KK+IjGxG9pzcoZyRyawx/ZiSsl0a2FahaxCnjBetyLWXvOPmaAbuUmg210AOLDgTY1NEoRGNJhwFBhT4npKFZARCW0Ouqea8GmjdqT7R/UM+k+KosYe0U8HhlbRxAZPA2EoaCkArkHfehtjFkfQP0Kb1KTRarfMqAPEl3EmV37i11DB04j+TkMdohQJwmfFJcsLBGHHpy8Ng+dupLjZlyzAWzzVC7OK6xUzsBN63mg7DRIAsuIKNzw7JBAMfAJoFOwPjcHO3gyaAeGJuEL3XyJzQLqAMrI+imDUt+t3CYatognBhM3YX0rXUMaTA7yDoKMKZCqPozkAHt/gsh4I9CsIZ80gAAAABJRU5ErkJggg=="></image> <path d="M22.9800421,24.9 L22.98,7.6 C22.9824406,7.20649401 22.8788083,6.81960003 22.68,6.48 C22.4,6.21 19.16,2.86 19.16,2.86 C18.8448174,2.57277854 18.4252272,2.42809227 18,2.46 C17.25,2.46 6.38,2.46 6.38,2.46 L1.98,7.16 L1.98,15.16 L12.64,15.73 L22.9800421,24.9 Z" id="LM_level3-2" fill="#A8AAA8" fill-rule="nonzero"></path> </g> <g id="LM_leftside" transform="translate(49.000000, 94.000000)" fill-rule="nonzero"> <path d="M12.06,34.54 L6.45,34.54 C4.99937339,34.5453259 3.60647912,33.9721088 2.57978624,32.9472929 C1.55309337,31.922477 0.977328505,30.5306339 0.98,29.08 L0.98,6.18 C0.98,3.16452527 3.42452527,0.72 6.44,0.72 L12.05,0.72 C15.0631921,0.725503561 17.5044964,3.16680786 17.51,6.18 L17.51,29.08 C17.5126553,30.5271617 16.939633,31.9159609 15.9172718,32.940198 C14.8949106,33.9644351 13.5071641,34.5400024 12.06,34.54 Z" id="LM_leftside5" fill="#A8AAA8"></path> <circle id="LM_leftside4" fill="#FFFFFF" cx="12.67" cy="29.24" r="3.79"></circle> <circle id="LM_leftside3" fill="#FFFFFF" cx="12.67" cy="6.03" r="3.79"></circle> <path d="M9.75,24.62 C10.4421225,24.1572205 11.2574415,23.9133217 12.09,23.92 C13.1380484,23.8411302 14.1850856,24.0854388 15.09,24.62 C16.34,25.55 16.32,24.52 16.32,24.52 L16.32,22.72 C16.32,22.27 15.76,21.88 15.09,22.26 L14.09,22.84 C14.09,22.84 13.73,23.03 13.73,22.51 L13.73,19.9 C13.73,19.9 13.73,19.11 14.46,19.13 C15.19,19.15 15.84,19.13 15.84,19.13 C15.84,19.13 16.13,18.88 16.13,17.75 C16.13,16.62 15.84,16.42 15.84,16.42 L14.45,16.42 C14.45,16.42 13.72,16.42 13.72,15.78 L13.72,14.48 C13.72,14.48 13.49,14.12 12.55,14.17 C12.0671703,14.1775857 11.5908982,14.283046 11.15,14.48 L11.15,15.78 C11.1391868,16.1366743 10.8468382,16.4201639 10.49,16.42 L9.23,16.42 C9.23,16.42 8.98,16.62 8.94,17.75 C8.9,18.88 9.23,19.13 9.23,19.13 L10.49,19.13 C10.49,19.13 11.29,19.13 11.31,19.9 C11.33,20.67 11.31,22.52 11.31,22.52 C11.31,22.52 11.31,23.03 10.97,22.85 L9.76,22.27 C9.76,22.27 8.93,21.87 8.94,22.73 C8.95,23.59 8.94,24.53 8.94,24.53 C8.94,24.53 8.98,25.06 9.75,24.62 Z" id="LM_leftside2" fill="#FFFFFF"></path> <path d="M16.6,12.82 C16.5640845,13.0461448 16.4363396,13.2474057 16.2469908,13.3761629 C16.057642,13.5049201 15.8235128,13.5497335 15.6,13.5 C15.5157002,13.4885804 15.4342916,13.4614442 15.36,13.42 C14.4821686,12.9467916 13.506699,12.6832437 12.51,12.65 C11.5311949,12.6299456 10.5680375,12.8976825 9.74,13.42 C8.91,13.82 8.67,12.82 8.67,12.82 L8.67,11.06 C8.70188656,10.6714097 9.04116607,10.3812364 9.43,10.41 C9.53837526,10.4186243 9.6438555,10.4492476 9.74,10.5 C10.5773234,11.010005 11.5304401,11.2990368 12.51,11.34 C13.5091637,11.2671668 14.4810541,10.9807149 15.36,10.5 C15.36,10.5 16.54,10.26 16.56,11.06 C16.58,11.86 16.6,12.82 16.6,12.82 Z" id="LM_leftside1" fill="#FFFFFF"></path> </g> <g id="Group" transform="translate(0.000000, 81.000000)"> <image id="Bitmap" opacity="0.3" style="mix-blend-mode: multiply;" x="0" y="0" width="58" height="64" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAABBCAYAAABvnNwUAAAAAXNSR0IArs4c6QAAAqRJREFUaAXtm01OwzAQhSlUYgNbJDalaxBHgAtwBg7AiVixYsOODScoN0DqAcoNoJUQq/CecaK64zhOm7T1yCNNf+zUns/P4xjkDIqiOOjKBrCu2mpqB3G3Dnywxm+8cYDzFBUX8BPvBd0WLtDcDL5oA90JrAW9Ref3cAL3bQR9hU/hMwDPYzrcGHYJ9AEd3sCpcN9WKkvYZ/gkBni4SVQroFR2G6AMmf1cwUdwkzaIpRmYObuO2w7v8P4G/4ZzwdiFf6HfF/g13MzUOp5DXNDaMIpcdcdw5ui2pi668hpVvrQenFlrwaLh6A684XVb6Ay8TS1vD61z1jZGNanqGM7Odm0cfK4ZxhCjN39bwVpQNsqVd5sL0j9F+LUROBoWoM50Qb/B/AjH1VttEDga1sJFLQS9ocQ1XAscBWun777laQidwIzXbD4Q/xS3o6JxNbag+5qnTcAjXFDt1YOwAE0hT0PAzp0iCItWOB1SyNMQcFVXC2unb0p5WkHVffDCJpyndZymXMAqyNNaYAGLK1Xl6TK5A6sxT72wWvNUwGrOUwGLArV56sBqz1MHFl/4r0/+Ic4NBBVWa1yNuVHmhlk1KBUsbz3OhpkVGq2E1cgmmDKsGBIlBVlZJUIKjKysGBIlBVlZJUIKjKysGBIlBVlZJUIKjKysGBIlBVlZJUIKjKysGBIlBVlZJUIKjKysGBIlBVlZJUIKjKysGBIlBVlZJUIKjFJZnu3XaA4XYXly8xMe9WxMQiNCHnKRz9gRXn/gfILiDH4OP4anbgR9hz/BP3D69pdAQ3yY41zFhF+spX7coAR9BI/zrIA5XL0CTNl5ziJVmyFw71NczuNp9uQMQasDyQkSm9PjFHA1dgeWlfYA2Op1SX0HqLMKl8EL2LJC4/sftL72OnfR538AAAAASUVORK5CYII="></image> <path d="M49.98,61.51 L7.29,61.51 C4.09779415,61.51 1.51,58.9222059 1.51,55.73 L1.51,26.09 C11.87,12.03 19.63,2.22 19.63,2.22 L20.23,2.22 C20.23,2.22 39.69,2.37 44.09,2.37 C45.013529,2.18179526 45.9580478,2.5786519 46.47,3.37 L55.73,12.9 L55.73,55.7 C55.7379772,57.2329575 55.1366519,58.7062958 54.0583133,59.7958867 C52.9799747,60.8854775 51.5129577,61.5020641 49.98,61.51 Z" id="LM_level2_grey-2" fill="#A8AAA8" fill-rule="nonzero"></path> </g> <g id="LM_total"> <g id="LM_whitepart" transform="translate(0.000000, 89.000000)" fill="#F1F1F1" fill-rule="nonzero"> <g id="LM_whitepart_combined"> <polygon id="LM_whitepart_top" points="44.46 53.9 37.31 46.53 13.52 15.46 13.52 0.6 0.46 16.74 0.46 47.96 1.46 55.65"></polygon> </g> </g> <g id="Group" transform="translate(5.000000, 87.000000)"> <image id="Bitmap" opacity="0.3" style="mix-blend-mode: multiply;" x="0" y="0" width="47" height="52" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAA1CAYAAAAHz2g0AAAAAXNSR0IArs4c6QAAAhhJREFUaAXtWttRwzAQxAyfpAWSb4YWoAFqoIBURAH8UAAVhEpMBxD+za6xFMmyQcqNLWnmbmbHj1in3btTYjvXdF13IbUGJvURMx5cA7LNxLkYX/YacN/gYAtc25PL7HzDbQu+R9e9SMBA/gEOnwCKWNJaOH8BDq6Iq3NndMjv4eMeYCaWtFs477OMuU8iWEKpgCOSfQTegC+AtbkGPjHPK3AH9NVziZ0kg3ou2B3Aslkj8pjGGgN3A9j1liwAg+mE6SSWLhtMEZj3jZckYKh7Rp3R3wGeMxyvbtECBvL8xuGi5TZH9IMARQnIXPcBafdElIAh2jnr3uXs7f8roMS6dxX8KaDUuo8SUAN5CpnMQMmL1o3+rAB8kPvHasxz9jjIQOmLdqzEE1BL3bsirICa6n5SAE5WU/eBgNrq3hMwlA4fB3Pc37tczto3a4APCHxQKOIOM0WJEcAx2e/tU4iba10B5lxVWxWQO12aAc2AMAJaQsIAiodrBsQhFDrQDAgDKB6uGRCHUOhAMyAMoHi4ZkAcQqEDzYAwgOLhmgFxCIUO3Azwn/YazONpBLAT5APwOkEKVEN+5Em+v8Y+CRjfyOXofeDksWBPBnszyHNj+jv6bhUcHPGO9IAPjK3dA2Hmndsy8u/AM3DqVMGBbbcZiWCKtkAp1oJI0CtEckHD0/CqneRtRwgvzGwMaNCtRU6BgMxEk6f/AY1G0nHf2MzkAAAAAElFTkSuQmCC"></image> <path d="M39.16,50.44 L8.07,50.44 C6.5353168,50.4426552 5.06258085,49.834865 3.97645681,48.7506168 C2.89033276,47.6663686 2.2799977,46.1946855 2.28,44.66 L2.28,22.41 C10.98,11.14 17.84,2 17.84,2 L39.16,2 C40.6998701,1.9893432 42.1803327,2.59359794 43.2729596,3.67871541 C44.3655865,4.76383288 44.9800369,6.24009301 44.98,7.78 L44.98,44.66 C44.98,46.1929513 44.3710375,47.6631169 43.2870772,48.7470772 C42.2031169,49.8310375 40.7329513,50.44 39.2,50.44 L39.16,50.44 Z" id="LM_top_grey-2" fill="#A8AAA8" fill-rule="nonzero"></path> </g> <g id="LM_top" transform="translate(17.000000, 112.000000)" fill="#6A6A6A" fill-rule="nonzero"> <g id="LM_top_total"> <path d="M2.58,1.95 L2.58,29.42 C2.53732346,30.0007732 2.04187943,30.443134 1.46,30.42 C0.901094365,30.4156223 0.441619994,29.9780276 0.41,29.42 L0.41,1.95 C0.449349984,1.38861093 0.909606462,0.949468178 1.47222361,0.93650465 C2.03484076,0.923541121 2.51483504,1.34101911 2.58,1.9 L2.58,1.95 Z M6.19,1.95 L6.19,29.42 C6.2296472,29.8325035 6.03195189,30.231808 5.67986701,30.4503653 C5.32778212,30.6689226 4.88221788,30.6689226 4.53013299,30.4503653 C4.17804811,30.231808 3.9803528,29.8325035 4.02,29.42 L4.02,1.95 C3.9803528,1.53749648 4.17804811,1.138192 4.53013299,0.919634704 C4.88221788,0.701077408 5.32778212,0.701077408 5.67986701,0.919634704 C6.03195189,1.138192 6.2296472,1.53749648 6.19,1.95 Z M9.81,1.95 L9.81,29.42 C9.8496472,29.8325035 9.65195189,30.231808 9.29986701,30.4503653 C8.94778212,30.6689226 8.50221788,30.6689226 8.15013299,30.4503653 C7.79804811,30.231808 7.6003528,29.8325035 7.64,29.42 L7.64,1.95 C7.6003528,1.53749648 7.79804811,1.138192 8.15013299,0.919634704 C8.50221788,0.701077408 8.94778212,0.701077408 9.29986701,0.919634704 C9.65195189,1.138192 9.8496472,1.53749648 9.81,1.95 Z M13.42,1.95 L13.42,29.42 C13.3873113,29.9829764 12.9306072,30.4280683 12.3669758,30.44625 C11.8033444,30.4644316 11.318904,30.0496992 11.25,29.49 L11.25,1.95 C11.2826887,1.38702361 11.7393928,0.941931677 12.3030242,0.923750018 C12.8666556,0.905568359 13.351096,1.3203008 13.42,1.88 L13.42,1.95 Z M17.04,1.95 L17.04,29.42 C17.0513034,30.0199642 16.5796777,30.5182857 15.98,30.54 C15.401933,30.5576338 14.9125708,30.1167669 14.87,29.54 L14.87,1.95 C14.9026887,1.38702361 15.3593928,0.941931677 15.9230242,0.923750018 C16.4866556,0.905568359 16.971096,1.3203008 17.04,1.88 L17.04,1.95 Z" id="LM_top_lines"></path> </g> </g> <circle id="LM_detail_2" fill="#9A9A9A" fill-rule="nonzero" cx="50.32" cy="137.11" r="2.24"></circle> <image id="Bitmap" opacity="0.3" style="mix-blend-mode: multiply;" x="44" y="0" width="38" height="38" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAYAAACMo1E1AAAAAXNSR0IArs4c6QAAAu1JREFUWAnNmD1y1EAQhb1bhJgjsMT8HAEuQGJHRJyOhAwCTmAyQqpMvOsbYDtGvE/Mm+oZaWUtaHfoqt75n/70WquSZtV13dkhtpKF+Y9V38gpbfeq7OSU2RTnsEBauZq7JkHVMIBdyiltgH2SU9oy8CGQs+AEdq4oALyQR5gaFpgMQiOZga/V3gnwzgNT5SRcUguw1/L3cuCAjGlcqV1bV3UYGLgP8q/yu4dUfFRtkpuVWoABCOgYTF6XKvUc1nFhT+VcGH6tGJMqjiqXwN5og6gWAZYwUkqareLV3jRr4Cy6FgHxVv5F/lP+S06alnT2ZG9iEOs8Mrheg5GOV/KPchYvCTS2FzGIRcw+iwajXKszGqo9T0792DYdz6SiYKLTeav62JUeo49Yo+nt06rBU6ezvkin9yUsFsxp5a99ynQqXGFkbSOHI9s6PWgZuJQ/k6NiCwOsAIzK+QHZAgxBLNAmCVb8W1spZjFQrhDIyrUGMyAcmQW4AbFnNigLFuByrlXP1A3AiB1Z+nuuoG0AFUMWLL7n4oSWdd77buSUvXJFB52NrFPcnTy/4qNc7GBCSyuEAq7oaEmWYmeBfM/ljsZwBYfhYCoGGkAOMmi4wcCJ4RAm3/t6ZeqFWqeKB7aa1EpBBIKDsreo3A/14LM+eP8sX+zXX2QZrN/Zb51q/J+v6QHwiSDfyb/Lj/FJyC0Tfe/3A0xOq9b0hrynSi8Xv5X3xxOCGdxOBZwmcFV5ger+ClN1UQOEL/5vqRyAEW1wVsIV6DX5ikEZNyhnHBs59+S/GhcPCAc5KAbgNomiammjZyVMSeclQAEXD3L6YX4OMKD8qPAZyYMnTQPlHDApyEY3aWM2B5Z3LpeqZlulGiDRIhRvHOy5Y/84aay+V7k4OahoMD4jAbS5n3bxIE3tDKX2/b40sjjaLDgW+HNNVYNQ2gC9SI3PKgG0WbnZUF44G84LKAOouw1Mu1aOI4861V43Wf4V3OSOCw7+BmjmA7QisxQnAAAAAElFTkSuQmCC"></image> <circle id="LM_detail_1" fill="#9A9A9A" fill-rule="nonzero" cx="21.66" cy="86.59" r="2.24"></circle> <g id="hole" transform="translate(45.000000, 1.000000)" fill-rule="nonzero"> <g id="Group" fill="#D42715"> <circle id="LM_red-2" cx="17.96" cy="17.95" r="17.06"></circle> </g> <g id="LM_details_in_red" transform="translate(2.000000, 2.000000)"> <circle id="LM_detail_red_hole4" fill="#D6EDFF" cx="12.9" cy="27.01" r="3.79"></circle> <circle id="LM_detail_red_hole3" fill="#D6EDFF" cx="4.75" cy="12.89" r="3.79"></circle> <circle id="LM_detail_red_hole2" fill="#D6EDFF" cx="18.87" cy="4.74" r="3.79"></circle> <circle id="LM_detail_red_hole1" fill="#D6EDFF" cx="27.02" cy="18.86" r="3.79"></circle> <path d="M18.18,15.31 C17.9816076,15.2705154 17.8089761,15.149396 17.7043432,14.9762761 C17.5997103,14.8031562 17.5727287,14.5940066 17.63,14.4 C17.84,13.68 17.99,13.07 17.99,13.07 C17.99,13.07 17.82,12.72 16.72,12.43 C15.62,12.14 15.37,12.37 15.37,12.37 L14.98,13.7 C14.98,13.7 14.82,14.42 14.17,14.24 L12.98,13.9 C12.98,13.9 12.58,14.03 12.38,14.96 C12.2599627,15.4271881 12.2395203,15.9143986 12.32,16.39 L13.57,16.72 C13.9132251,16.8260991 14.1147049,17.1808788 14.03,17.53 C13.87,18.14 13.7,18.74 13.7,18.74 C13.7,18.74 13.82,19.04 14.9,19.36 C15.98,19.68 16.32,19.45 16.32,19.45 L16.64,18.23 C16.64,18.23 16.9,17.47 17.64,17.64 C18.04,17.7533333 18.44,17.8833333 18.84,18.03 C19.3790257,17.4116231 19.6330766,16.5950309 19.54,15.78 C18.89,15.55 18.18,15.31 18.18,15.31 Z" id="LM_detail_hole" fill="#1F1F1F"></path> <path d="M15.62,23.13 L14.07,22.9 L12.54,22.33 C12.29437,22.2663058 12.1467122,22.015735 12.21,21.77 L12.76,19.72 C12.8281001,19.4784149 13.0772913,19.3360199 13.32,19.4 L14.77,20 L16.4,20.22 C16.64563,20.2836942 16.7932878,20.534265 16.73,20.78 L16.18,22.83 C16.1519467,22.9468655 16.0773095,23.0471692 15.9734274,23.1076097 C15.8695454,23.1680501 15.7454609,23.1833663 15.63,23.15 L15.62,23.13 Z" id="LM_detail_red4" fill="#393939"></path> <path d="M23.13,16.2 L22.87,17.75 L22.3,19.27 C22.2716803,19.3872072 22.1975067,19.4881458 22.0941102,19.5501837 C21.9907137,19.6122216 21.8667451,19.6301684 21.75,19.6 L19.69,19.05 C19.4484149,18.9818999 19.3060199,18.7327087 19.37,18.49 L19.98,17.05 L20.2,15.42 C20.2283197,15.3027928 20.3024933,15.2018542 20.4058898,15.1398163 C20.5092863,15.0777784 20.6332549,15.0598316 20.75,15.09 L22.75,15.64 C22.9915851,15.7081001 23.1339801,15.9572913 23.07,16.2 L23.13,16.2 Z" id="LM_detail_red3" fill="#393939"></path> <path d="M16.19,8.69 L17.74,8.94 L19.27,9.51 C19.5107539,9.57376787 19.6570302,9.81756168 19.6,10.06 L19.05,12.11 C18.9818999,12.3515851 18.7327087,12.4939801 18.49,12.43 L17.04,11.83 L15.41,11.61 C15.167847,11.5417439 15.0223875,11.2949036 15.08,11.05 L15.63,9 C15.6580533,8.88313454 15.7326905,8.78283079 15.8365726,8.72239033 C15.9404546,8.66194987 16.0645391,8.64663373 16.18,8.68 L16.19,8.69 Z" id="LM_detail_red2" fill="#393939"></path> <path d="M8.68,15.62 L8.98,14.07 L9.55,12.55 C9.57831973,12.4327928 9.65249325,12.3318542 9.75588978,12.2698163 C9.85928631,12.2077784 9.98325491,12.1898316 10.1,12.22 L12.16,12.77 C12.4015851,12.8381001 12.5439801,13.0872913 12.48,13.33 L11.87,14.77 L11.65,16.4 C11.6216803,16.5172072 11.5475067,16.6181458 11.4441102,16.6801837 C11.3407137,16.7422216 11.2167451,16.7601684 11.1,16.73 L9.1,16.18 C8.85841494,16.1118999 8.71601994,15.8627087 8.78,15.62 L8.68,15.62 Z" id="LM_detail_red1" fill="#393939"></path> </g> </g> </g> </g> </g> </svg>`;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        visuals.MEDIUM_MOTOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 48 68"><defs><linearGradient id="linear-gradient" x1="-427.2" y1="440.79" x2="-427.2" y2="440.63" gradientTransform="matrix(44.14 0 0 -44.15 18878.72 19502.57)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#a8aaa8"/><stop offset="1" stop-color="#535453"/></linearGradient></defs><g style="isolation:isolate" transform="translate(0 20)"><g id="svg7610"><g id="Medium_Motor" data-name="Medium Motor"><g id="medmotor_box" data-name="medmotor box"><path id="medmotor_box_wgradient" data-name="medmotor box wgradient" d="M2.57 0h39a2.36 2.36 0 0 1 2.57 2v40.33c0 1-1.1 1.82-2.57 1.82h-39C1.1 44.15 0 43.34 0 42.33V2a2.36 2.36 0 0 1 2.57-2z" transform="translate(2 1.84)" fill="url(#linear-gradient)"/></g><g id="medmotor_star" data-name="medmotor star"><image width="48" height="48" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAxCAYAAACcXioiAAAACXBIWXMAAAsSAAALEgHS3X78AAACfElEQVRoQ+2aPXLbMBBG32ZUijlCnDo/R1AukCoHyAFS5Sw5g5t0bnwCu0ofpTZ9A1usvSmwoClRJEEAI4gzejMcqliS+2FB4AMoUVVyISICrIErO3dpgBpoNONDJde9RKTCJf4R+Ga/u9TADbAFalXdkYEsAiz5L8B3nICxCmyBa+Auh4jVVMAUneR/ABugAuRIaIUT9w4TJyLJIpIEWJ+/wrX8Bng7fgViMRtcRR5F5G/KO/FmKiCANa5Vq6nADhXwwY7DrjaLHALgeJcZQ4D32MtulYwil4AYfOXOogKxRLe8p7SAZC4CSnMRUJrBmThwbBbSRxIh4HFDs3VPwIQl7oXj/M1U3BBr3PUAY3aiEZGjVnzPjQZY4mOscbNqjIgGeLDzGINWvBUQaImHSOlGIUZu2IqbgAr4CtwCT8AL7sbndLzgcrvF5Vq1jQ98An5bwNSNSh9PuFw/A+KH0RhLXIo9K96dB1L68SnZs+JLnchaK75UAWA9ZskCgGULUFiugAZ4BJquAB0IPjcUZz9ugNoL8IqSNplOxA74Z0ezUlU1p3eNG5787tocUuaQOZXfAfe4XB9UVVcAqroTkTsLaghzoZ5TuFGPb+jWzA3Z6dBk/Hrgp53nVEJx7vKXnUMq0XBgp/cWNFaJbe+yYXzCoS14SINL/g9hAnors96KbM5Gqy0Dg+MHUNxjo+6z1Hmg5SKgNBcBpSktIGrk6VJSQOsopwLHKCVAed2sqmPnAMgnICaB9sv9VOAYOQTEWPEdGZKHRAFWeu8Q74Fnpjemnnm1xEndBxI/dEOUFe9Z4hSy/FcCZlnxniVOIZsACPhKYaR2my5ZBZTgP7HrUIs43RAaAAAAAElFTkSuQmCC" style="mix-blend-mode:multiply" opacity=".3"/><path id="medmotor_cut-2" data-name="medmotor cut-2" d="M0 21.25A6.21 6.21 0 0 1 6.22 15H15V6.23A6.22 6.22 0 0 1 21.24 0h1.66a6.22 6.22 0 0 1 6.22 6.22V15h8.8a6.21 6.21 0 0 1 6.22 6.22v1.66a6.21 6.21 0 0 1-6.22 6.22h-8.8v8.8a6.21 6.21 0 0 1-6.22 6.22h-1.66A6.22 6.22 0 0 1 15 37.93v-8.8H6.22A6.22 6.22 0 0 1 0 22.92z" transform="translate(2 1.84)" fill="#a8aaa8"/><circle id="medmotor_hole_4" data-name="medmotor hole 4" cx="39.77" cy="24" r="4.85" fill="#393939"/><circle id="medmotor_hole_3" data-name="medmotor hole 3" cx="8.37" cy="24" r="4.85" fill="#393939"/><circle id="medmotor_hole_2" data-name="medmotor hole 2" cx="24.15" cy="8.22" r="4.85" fill="#393939"/><circle id="medmotor_hole_1" data-name="medmotor hole 1" cx="24.15" cy="39.62" r="4.85" fill="#393939"/></g><g id="medmotor_red" data-name="medmotor red"><circle cx="24.3" cy="24" r="6.75" fill="#d42715"/><circle cx="24.3" cy="24" r="6.63" fill="none" stroke="#a20800" stroke-width=".25"/></g><path id="medmotor_Hole" data-name="medmotor Hole" d="M20.59 19.46s-.05 1-.77 1h-1.46a2.38 2.38 0 0 0-.45 1.69c0 1.27.36 1.6.36 1.6h1.62a.64.64 0 0 1 .7.59.21.21 0 0 1 0 .11v1.67a4 4 0 0 0 1.77.29 6.88 6.88 0 0 0 1.64-.26v-1.67a.73.73 0 0 1 .73-.7 9.89 9.89 0 0 0 1.44-.14s.4-.37.44-1.63-.36-1.64-.36-1.64H24.6a.65.65 0 0 1-.75-.51.49.49 0 0 1 0-.17 11.22 11.22 0 0 1 0-1.64 4.78 4.78 0 0 0-3.25 0c-.02.69-.01 1.41-.01 1.41z" transform="translate(2 1.84)"/></g></g></g></svg>`;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    pxsim.NXT_LIGHT_SENSOR_SVG = `
    <svg version="1.1" id="Слой_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 33.2 34" style="enable-background:new 0 0 33.2 34;" xml:space="preserve">
    <style type="text/css">
        .st0{fill:#474747;}
        .st1{fill:none;stroke:#FFFFFF;stroke-width:2.8;stroke-miterlimit:10;}
        .st2{fill:none;stroke:#383838;stroke-width:0.4;stroke-miterlimit:10;}
        .st3{fill:#666666;stroke:url(#box_00000130636317907917613520000004877254895855996036_);stroke-width:4;stroke-miterlimit:10;}
        
            .st4{clip-path:url(#SVGID_00000130609479858867275430000009055526515060617625_);fill:url(#bottom_00000111891200299251479400000000525049900985449092_);}
        .st5{clip-path:url(#SVGID_00000177466942530748431800000014072249853411572632_);fill:#FF5F06;}
        
            .st6{clip-path:url(#SVGID_00000177466942530748431800000014072249853411572632_);fill:url(#SVGID_00000015355549129698986540000002219337734446813878_);}
        
            .st7{opacity:0.6;clip-path:url(#SVGID_00000113315643478351944160000009687003270334645898_);fill:url(#delimetr_bottom_00000065762655765916016380000008125485320273655173_);enable-background:new    ;}
        
            .st8{clip-path:url(#SVGID_00000155135572614667216610000003757569732389185415_);fill:url(#delimetr_top_00000154425707523878284540000007100221247278020758_);}
        
            .st9{clip-path:url(#SVGID_00000038398042624174977400000014551399462200126103_);fill:url(#top_shadow_00000020385684115995285450000007344490910050154632_);}
        .st10{fill:#420000;}
        .st11{fill:#F1F1F1;}
        .st12{fill:#540000;}
        .st13{fill:#F2AFA5;}
        .st14{fill:#333333;}
    </style>
    <g id="sensor">
        <g id="cant">
            <path class="st1" d="M1.5,16.5V7.9c0-3.3,2.7-6,6-6h18.2c3.3,0,6,2.7,6,6v8.6"/>
            <path class="st2" d="M1.5,16.5V7.9c0-3.3,2.7-6,6-6h18.2c3.3,0,6,2.7,6,6v8.6"/>
        </g>
        
            <radialGradient id="box_00000049191924399974878860000014696402224181607822_" cx="16.6" cy="17" r="17.1" gradientUnits="userSpaceOnUse">
            <stop  offset="0" style="stop-color:#666666;stop-opacity:0"/>
            <stop  offset="0.1404" style="stop-color:#8D8D8D;stop-opacity:1.126710e-02"/>
            <stop  offset="0.4535" style="stop-color:#F0F0F0;stop-opacity:3.640837e-02"/>
            <stop  offset="0.4983" style="stop-color:#FFFFFF;stop-opacity:4.000000e-02"/>
            <stop  offset="0.6252" style="stop-color:#D7D7D7;stop-opacity:2.987791e-02"/>
            <stop  offset="1" style="stop-color:#666666;stop-opacity:0"/>
        </radialGradient>
        
            <path id="box" style="fill:#666666;stroke:url(#box_00000049191924399974878860000014696402224181607822_);stroke-width:4;stroke-miterlimit:10;" d="
            M25.7,32.1h-1.1c0,0-0.3,0-0.7-0.2c-0.4-0.2-3-1.3-7.3-1.3c-3.9,0-6.9,1.2-7.2,1.3s-0.7,0.2-0.7,0.2H7.5c-3.3,0-6-2.7-6-6V7.9
            c0-3.3,2.7-6,6-6h18.2c3.3,0,6,2.7,6,6v18.2C31.7,29.4,29,32.1,25.7,32.1z"/>
        <g id="main_x5F_sensor_x5F_part">
            <g>
                <g id="bottom_x5F_bg">
                    <defs>
                        <path id="SVGID_1_" d="M24.1,16.6c0-4.3-3.4-7.5-7.5-7.5c-4.2,0-7.5,3.2-7.5,7.5c0,0.3,0,5.7,0,10s0.4,3.9,0.3,5.3
                            c0.4-0.1,7.2-0.1,7.2-0.1s6.8,0,7.3,0.1c-0.1-1.5,0.1-1,0.2-5.2C24.1,25.4,24.1,16.9,24.1,16.6z"/>
                    </defs>
                    <clipPath id="SVGID_00000052817872584624374030000015673935739830515104_">
                        <use xlink:href="#SVGID_1_"  style="overflow:visible;"/>
                    </clipPath>
                    
                        <radialGradient id="bottom_00000062154757473568856140000002800956133076696219_" cx="16.6082" cy="31.9918" r="2.0941" gradientTransform="matrix(1.028679e-13 1 -4.466 4.594128e-13 159.4849 15.3836)" gradientUnits="userSpaceOnUse">
                        <stop  offset="0" style="stop-color:#FF5F0E"/>
                        <stop  offset="0.598" style="stop-color:#D44F01"/>
                        <stop  offset="1" style="stop-color:#CC3300"/>
                    </radialGradient>
                    
                        <path id="bottom" style="clip-path:url(#SVGID_00000052817872584624374030000015673935739830515104_);fill:url(#bottom_00000062154757473568856140000002800956133076696219_);" d="
                        M24.6,33.2l-15.9,0v-6.6h15.9V33.2z"/>
                </g>
                <g id="bg_00000148620313449745676180000014198483210581309880_">
                    <defs>
                        <path id="SVGID_00000012466347304542822280000007903063227865853321_" d="M24.1,16.6c0-4.3-3.4-7.5-7.5-7.5
                            c-4.2,0-7.5,3.2-7.5,7.5c0,0.3,0,5.7,0,10s0.4,3.9,0.3,5.3c0.5-0.2,3.4-1.5,7.2-1.5s6.7,1.3,7.3,1.5c-0.1-1.5,0.2-1.1,0.2-5.3
                            C24.1,25.3,24.1,16.9,24.1,16.6z"/>
                    </defs>
                    <clipPath id="SVGID_00000139254659202136202620000005884854553411899037_">
                        <use xlink:href="#SVGID_00000012466347304542822280000007903063227865853321_"  style="overflow:visible;"/>
                    </clipPath>
                    
                        <rect id="bg_00000034064585226058829120000012488620380688124346_" x="8.3" y="7.4" style="clip-path:url(#SVGID_00000139254659202136202620000005884854553411899037_);fill:#FF5F06;" width="16.7" height="25.8"/>
                    
                        <radialGradient id="SVGID_00000138572382045240118030000012313864861156993443_" cx="16.5775" cy="31.2584" r="6.0517" gradientTransform="matrix(1.035340e-13 -1 1.6959 1.755813e-13 -36.433 47.836)" gradientUnits="userSpaceOnUse">
                        <stop  offset="0" style="stop-color:#DA4B05"/>
                        <stop  offset="0.4751" style="stop-color:#EA5201"/>
                        <stop  offset="1" style="stop-color:#FF5F0E;stop-opacity:0"/>
                    </radialGradient>
                    
                        <rect x="7.9" y="23.6" style="clip-path:url(#SVGID_00000139254659202136202620000005884854553411899037_);fill:url(#SVGID_00000138572382045240118030000012313864861156993443_);" width="17.3" height="9.3"/>
                </g>
                <g>
                    <defs>
                        <path id="SVGID_00000094595978396505368870000008796123524019988911_" d="M24.1,16c0-4.3-3.4-7.5-7.5-7.5
                            c-4.2,0-7.5,3.2-7.5,7.5c0,0.3,0,15.5,0,15.5h15C24.1,31.5,24.1,16.3,24.1,16z"/>
                    </defs>
                    <clipPath id="SVGID_00000145754943681332641210000011121640817426790042_">
                        <use xlink:href="#SVGID_00000094595978396505368870000008796123524019988911_"  style="overflow:visible;"/>
                    </clipPath>
                    
                        <radialGradient id="delimetr_bottom_00000075136767000026385740000003695436981939052432_" cx="16.2278" cy="-308.4296" r="10.8203" gradientTransform="matrix(1 0 0 -0.447 0 -116.9622)" gradientUnits="userSpaceOnUse">
                        <stop  offset="0" style="stop-color:#000000;stop-opacity:0.3"/>
                        <stop  offset="0.5935" style="stop-color:#000000;stop-opacity:4.240200e-02"/>
                        <stop  offset="0.6912" style="stop-color:#000000;stop-opacity:0"/>
                    </radialGradient>
                    
                        <polygon id="delimetr_bottom" style="opacity:0.6;clip-path:url(#SVGID_00000145754943681332641210000011121640817426790042_);fill:url(#delimetr_bottom_00000075136767000026385740000003695436981939052432_);enable-background:new    ;" points="
                        7.1,21 26.1,21 26.1,27.3 7.1,27.3 				"/>
                </g>
                <g>
                    <defs>
                        <path id="SVGID_00000075854915927625046790000000164760611681787046_" d="M24.1,16.6c0-4.3-3.4-7.5-7.5-7.5
                            c-4.2,0-7.5,3.2-7.5,7.5c0,0.3,0,15.5,0,15.5h15C24.1,32.1,24.1,16.9,24.1,16.6z"/>
                    </defs>
                    <clipPath id="SVGID_00000141420672956864587150000005113979649568525219_">
                        <use xlink:href="#SVGID_00000075854915927625046790000000164760611681787046_"  style="overflow:visible;"/>
                    </clipPath>
                    
                        <linearGradient id="delimetr_top_00000137830124836902768560000009424917604336672927_" gradientUnits="userSpaceOnUse" x1="16.5936" y1="545.0898" x2="16.5936" y2="543.7897" gradientTransform="matrix(1 0 0 1 0 -524)">
                        <stop  offset="0" style="stop-color:#A8AAA8;stop-opacity:0"/>
                        <stop  offset="1" style="stop-color:#FFFFFF;stop-opacity:0.2"/>
                    </linearGradient>
                    
                        <polygon id="delimetr_top" style="clip-path:url(#SVGID_00000141420672956864587150000005113979649568525219_);fill:url(#delimetr_top_00000137830124836902768560000009424917604336672927_);" points="
                        8.1,19.7 25,19.7 25,21 8.1,21 				"/>
                </g>
                <g id="inner_x5F_top_x5F_shadow">
                    <defs>
                        <path id="SVGID_00000047759342974608281490000002612623718154999743_" d="M24.1,16.6c0-4.3-3.4-7.5-7.5-7.5
                            c-4.2,0-7.5,3.2-7.5,7.5c0,0.3,0,15.3,0,15.3h15C24.1,31.9,24.1,16.9,24.1,16.6z"/>
                    </defs>
                    <clipPath id="SVGID_00000016045493132469692650000002641635228213605762_">
                        <use xlink:href="#SVGID_00000047759342974608281490000002612623718154999743_"  style="overflow:visible;"/>
                    </clipPath>
                    
                        <radialGradient id="top_shadow_00000145773816133645482240000004904066233270648486_" cx="16.8567" cy="32.0841" r="11.8227" gradientTransform="matrix(1 0 0 -1 0 36)" gradientUnits="userSpaceOnUse">
                        <stop  offset="0" style="stop-color:#000000;stop-opacity:0.5"/>
                        <stop  offset="1" style="stop-color:#FF5F06;stop-opacity:0.5"/>
                    </radialGradient>
                    
                        <rect id="top_shadow" x="6.3" y="8.7" style="clip-path:url(#SVGID_00000016045493132469692650000002641635228213605762_);fill:url(#top_shadow_00000145773816133645482240000004904066233270648486_);" width="20.6" height="8.4"/>
                </g>
            </g>
            <circle id="photoresistor_x5F_bg" class="st10" cx="16.6" cy="17.5" r="2.5"/>
            <circle id="photoresistor" class="st11" cx="16.6" cy="17.5" r="2.4"/>
            <circle id="led_x5F_bg" class="st12" cx="16.6" cy="23.2" r="2.4"/>
            <circle id="led" class="st13" cx="16.6" cy="23.2" r="2.3"/>
            <g id="contur">
                <path class="st14" d="M23.9,31.9c0.1-2.3,0.3-4.5,0.2-6.8c-0.1-2.3,0.2-8-0.2-10.2c-1.6-7.7-13-7.7-14.6,0C9,17,9.2,23,9.1,25.2
                    c-0.1,2.3,0.2,4.6,0.2,6.8C9,28,9,22.4,9,18.4c-0.1-2.2,0.1-4.7,1.6-6.5C14.4,6.9,22.8,8.8,24,15c0.4,2.2,0.1,7.9,0.1,10.2
                    C24.2,27.4,24,29.8,23.9,31.9L23.9,31.9z"/>
            </g>
        </g>
    </g>
    </svg>
    `;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        visuals.PORT_SVG = `<svg id="svg6348" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 49.96 58.93"><g id="icn_port" data-name="icn port"><path id="port_2" data-name="port 2" d="M4.48 0h50v58.93h-50z" transform="translate(-4.48)" fill="#eaeaea"/><path id="port_1" data-name="port 1" d="M9.74 46.49V18.66h17.11v-6.91h4.72V2.59h12.92v8.82h5.06v35.08h-8v7.43H38.9v-7.51h-2v7.5h-2.19v-7.5h-2.16v7.5h-2.1v-7.5H28.6v7.5h-2.1v-7.5h-1.82v7.5h-2.46v-7.5h-1.68v7.5H18v-7.45z" transform="translate(-4.48)" fill="#a8aaa8"/><g id="text10060" style="isolation:isolate"><text id="port_text" transform="translate(22.21 40.2)" style="isolation:isolate" font-size="16" fill="#fff" font-family="ArialMT,Arial">B</text></g></g></svg>`;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        visuals.REMOVE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="123.773" viewBox="0 0 21.167 32.748" id="svg10208"><defs id="defs10202"><linearGradient x2="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(0 -2.30835 7.23512 0 1161.604 852.653)" id="linearGradient9407"><stop offset="0" id="stop9403" stop-color="#a9aba9"/><stop offset="1" id="stop9405" stop-color="#848484"/></linearGradient><linearGradient x2="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(0 2.61718 -8.4555 0 1161.604 932.35)" id="linearGradient9387"><stop offset="0" id="stop9383" stop-color="#303030"/><stop offset="1" id="stop9385" stop-color="#777"/></linearGradient><clipPath id="clipPath9357"><path d="M0 1145.871h1366V0H0z" id="path9355"/></clipPath><linearGradient x2="1" gradientUnits="userSpaceOnUse" gradientTransform="rotate(124.418 344.32 757.342) scale(10.33459)" id="linearGradient9347"><stop offset="0" id="stop9343" stop-color="#fff"/><stop offset="1" id="stop9345" stop-color="#9e9e9e"/></linearGradient><clipPath id="clipPath9305"><path d="M0 1145.871h1366V0H0z" id="path9303"/></clipPath><linearGradient x2="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(0 -5.71338 10.23004 0 1161.5 872.467)" id="linearGradient9295"><stop offset="0" id="stop9291" stop-color="#f2f2f2"/><stop offset="1" id="stop9293" stop-color="#7a7a7a"/></linearGradient><clipPath id="clipPath9273"><path d="M0 1145.871h1366V0H0z" id="path9271"/></clipPath></defs><g id="layer1" transform="translate(0 -264.252)"><g transform="matrix(.38484 0 0 -.38484 -436.414 624.07)" id="g9267"><g id="g9269" clip-path="url(#clipPath9273)"><g id="g9275" transform="translate(1188.02 889.514)"><path d="M0 0h-53.041c-.541 0-.98.254-.98.566v29.585c0 .313.439.566.98.566H0c.541 0 .979-.253.979-.566V.566C.979.254.541 0 0 0" id="path9277" fill="#f2f2f2"/></g></g></g><g transform="matrix(.38484 0 0 -.38484 -436.414 624.07)" id="g9279"><g id="g9281"><g id="g9287"><g id="g9289"><path d="M1134.979 898.024c-.541 0-.979-.254-.979-.567v-29.584c0-.313.438-.567.979-.567h53.042c.541 0 .979.254.979.567v29.584c0 .313-.438.567-.979.567z" id="path9297" fill="url(#linearGradient9295)"/></g></g></g></g><path d="M19.01 291.648H2.237v-22.204H19.01z" id="path9307" fill="#f2f2f2" stroke-width=".385"/><g id="g9309" transform="matrix(.38484 0 0 -.38484 11.821 288.693)"><path d="M0 0h-6.642c-.687 0-1.245.558-1.245 1.246v12.867c0 .688.558 1.246 1.245 1.246H0c.687 0 1.245-.558 1.245-1.246V1.246C1.245.558.687 0 0 0" id="path9311" fill="#f22a21"/></g><path d="M6.251 274.214c-.838 0-1.517.68-1.517 1.518v3.536h3.083v-3.536c0-.839-.68-1.518-1.518-1.518z" id="topleft" fill="#a9aba9" stroke-width=".385"/><path d="M4.734 281.185v3.725c0 .838.68 1.517 1.517 1.517H6.3c.838 0 1.518-.68 1.518-1.517v-3.725z" id="bottomleft" fill="#a9aba9" stroke-width=".385"/><g id="g9327" transform="matrix(.38484 0 0 -.38484 7.498 280.74)"><path d="M0 0h-6.352a.415.415 0 0 0-.415.416v1.717c0 .229.186.415.415.415H0a.415.415 0 0 0 .415-.415V.416A.415.415 0 0 0 0 0" id="path9329" fill="#f22a21"/></g><g transform="matrix(.38484 0 0 -.38484 -436.414 624.07)" id="g9331"><g id="g9333"><g id="g9339"><g id="g9341"><path d="M1157.731 904.68a3.697 3.697 0 1 1 7.393 0 3.697 3.697 0 0 1-7.393 0" id="path9349" fill="url(#linearGradient9347)"/></g></g></g></g><g id="g9359" transform="matrix(.38484 0 0 -.38484 10.556 276.771)"><path d="M0 0a2.244 2.244 0 1 0 0 4.488A2.244 2.244 0 0 0 0 0" id="path9361" fill="#f22a21"/></g><g id="centerbeacon" transform="matrix(.38484 0 0 -.38484 15.002 273.177)"><path d="M0 0h-23.265l-3.683 4.151v6.736H3.684V4.151z" id="path9365" fill="#a9aba9"/></g><path d="M12.061 283.616H9.026v-.48h3.035z" id="path9367" fill="#b42e29" stroke-width=".385"/><path d="M12.061 284.494H9.026v-.479h3.035z" id="path9369" fill="#b42e29" stroke-width=".385"/><g transform="matrix(.38484 0 0 -.38484 -436.414 624.07)" id="g9371"><g id="g9373"><g id="g9379"><g id="g9381"><path d="M1140.849 934.967a1.04 1.04 0 0 1-1.038-1.039v-12.452h43.585v12.452c0 .573-.465 1.039-1.037 1.039z" id="path9389" fill="url(#linearGradient9387)"/></g></g></g></g><g transform="matrix(.38484 0 0 -.38484 -436.414 624.07)" id="g9391"><g id="g9393"><g id="g9399"><g id="g9401"><path d="M1139.811 863.778v-12.453c0-.803.651-1.453 1.453-1.453h40.679c.803 0 1.453.65 1.453 1.453v12.453z" id="path9409" fill="url(#linearGradient9407)"/></g></g></g></g><path d="M14.878 274.214c-.838 0-1.518.68-1.518 1.518v3.536h3.083v-3.536c0-.839-.68-1.518-1.517-1.518z" id="topright" fill="#a9aba9" stroke-width=".385"/><path d="M13.36 281.185v3.725c0 .838.68 1.517 1.518 1.517h.048c.838 0 1.517-.68 1.517-1.517v-3.725z" id="bottomright" fill="#a9aba9" stroke-width=".385"/><g id="g9323" transform="matrix(.38484 0 0 -.38484 16.124 280.74)"><path d="M0 0h-6.352a.416.416 0 0 0-.415.416v1.717c0 .229.187.415.415.415H0a.415.415 0 0 0 .415-.415V.416A.415.415 0 0 0 0 0" id="path9325" fill="#006db4"/></g></g></svg>`;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        visuals.TOUCH_SENSOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 37 37"><defs><clipPath id="clip-path" transform="translate(-23.5 -19.95)"><path d="M27.94 55.37c-1.06 0-2-.6-2-1.36v-4.4H25a1 1 0 0 1-1-1V29.37a1 1 0 0 1 1-1h1v-5c0-.77.91-1.37 2-1.37h10.71v1.37h6.37V22h11.08c1.07 0 2 .6 2 1.37v5h1a1 1 0 0 1 1 1v19.24a1 1 0 0 1-1 1h-1V54c0 .76-.9 1.37-2 1.37z" fill="none"/></clipPath><linearGradient id="linear-gradient" x1="-419.47" y1="499.03" x2="-419.47" y2="498.9" gradientTransform="matrix(32.16 0 0 -33.37 13531 16705.16)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#a8aaa8"/><stop offset="1" stop-color="#535453"/></linearGradient><linearGradient id="linear-gradient-2" x1="-523.02" y1="1202.1" x2="-523.91" y2="1202.1" gradientTransform="matrix(9.56 0 0 -6.22 5012.11 7495.73)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#d42715"/><stop offset="1" stop-color="#a20800"/></linearGradient><linearGradient id="linear-gradient-3" x1="-937.08" y1="111.13" x2="-937.97" y2="111.13" gradientTransform="matrix(0 9.56 6.22 0 -672.58 8970)" xlink:href="#linear-gradient-2"/><linearGradient id="linear-gradient-4" x1="-227.08" y1="-525.1" x2="-227.97" y2="-525.1" gradientTransform="matrix(-9.56 0 0 6.22 -2147 3285.47)" xlink:href="#linear-gradient-2"/><linearGradient id="linear-gradient-5" x1="186.98" y1="565.87" x2="186.08" y2="565.87" gradientTransform="matrix(0 -9.56 -6.22 0 3537.68 1810.89)" xlink:href="#linear-gradient-2"/><linearGradient id="linear-gradient-6" x1="-523.02" y1="1202.1" x2="-523.91" y2="1202.1" gradientTransform="matrix(9.56 0 0 -6.22 5012.11 7495.73)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#d42715"/><stop offset="1"/></linearGradient><linearGradient id="linear-gradient-7" x1="-937.08" y1="111.13" x2="-937.97" y2="111.13" gradientTransform="matrix(0 9.56 6.22 0 -672.58 8970)" xlink:href="#linear-gradient-6"/><linearGradient id="linear-gradient-8" x1="-227.08" y1="-525.1" x2="-227.97" y2="-525.1" gradientTransform="matrix(-9.56 0 0 6.22 -2147 3285.47)" xlink:href="#linear-gradient-6"/><linearGradient id="linear-gradient-9" x1="186.98" y1="565.87" x2="186.08" y2="565.87" gradientTransform="matrix(0 -9.56 -6.22 0 3537.68 1810.89)" xlink:href="#linear-gradient-6"/></defs><g style="isolation:isolate"><g id="_457f40bb-bec4-4a4a-9249-bb4ee7f4f5d6" data-name="457f40bb-bec4-4a4a-9249-bb4ee7f4f5d6"><g id="Touch_sensor" data-name="Touch sensor"><g clip-path="url(#clip-path)" id="touch_box" data-name="touch box"><g id="touch_box_grey" data-name="touch box grey"><g id="touch_box_total" data-name="touch box total"><path id="touch_box_1" data-name="touch box 1" d="M24.76 28.37h34.58a.76.76 0 0 1 .76.76v19.72a.76.76 0 0 1-.76.76H24.76a.76.76 0 0 1-.76-.76V29.13a.76.76 0 0 1 .76-.76z" transform="translate(-23.5 -19.95)" fill="#a8aaa8"/><image width="37" height="37" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAYAAACoPemuAAAACXBIWXMAAAsSAAALEgHS3X78AAAA/UlEQVRYR+2YvY3DMAxG3xekVGZw+gyQOW6Sm+VmuAEyTfr4VrB6ppBkGEb+6ATJFXyAIAigyEdbFWVm/EfW04MkXQu8hV3o7tlcajklJWALpOvXLpKBvu6NBHQsy3Uys7yGsbst8A3sAE+3PXCoe6MDvur+KAYcgR9Jx+mvTBSpPT6xXV3PfrH2HBLM3hhFqK1H2VDE5nhyNMY7c7GlLJG4yepewKcIMS8h5iXEvISYlxDzEmJeQsxLiHkJMS8h5iXEvISYlxDzMhf79HhxrD8Vy8AfMNSAd6+h1s9Qpz1mZpJ64JdCx/tp9Xszs3HUCSBpg3/g9ioyRWoAOAOiRFr4OQdRFAAAAABJRU5ErkJggg==" style="mix-blend-mode:multiply" opacity=".3"/><path id="touch_box_2-2" data-name="touch box 2-2" d="M27.94 22h10.77v1.37h6.37V22h11.07c1.07 0 2 .6 2 1.37V54c0 .76-.9 1.36-2 1.36H27.94c-1.07 0-2-.6-2-1.36V23.37c.06-.77.93-1.37 2-1.37z" transform="translate(-23.5 -19.95)" fill="url(#linear-gradient)"/><path id="touch_boxside_1" data-name="touch boxside 1" d="M35.08 11.45h.76v6.07h-.76z"/><path id="touch_boxside_2" data-name="touch boxside 2" d="M1.41 11.45h.76v6.07h-.76z"/><path id="touch_boxside_3" data-name="touch boxside 3" d="M35.08 20.1h.76v6.07h-.76z"/><path id="touch_boxside_4" data-name="touch boxside 4" d="M1.41 20.1h.76v6.07h-.76z"/></g></g></g><g id="touch_btn" data-name="touch btn"><path id="touch_gradient4" data-name="touch gradient4" fill="url(#linear-gradient-2)" d="M5.05 16.76h9.56v6.22H5.05z"/><path id="touch_gradient3" data-name="touch gradient3" fill="url(#linear-gradient-3)" d="M15.44 6.22h6.22v9.56h-6.22z"/><path id="touch_gradient2" data-name="touch gradient2" fill="url(#linear-gradient-4)" d="M22.49 16.76h9.56v6.22h-9.56z"/><path id="touch_gradient1" data-name="touch gradient1" fill="url(#linear-gradient-5)" d="M15.44 23.67h6.22v9.56h-6.22z"/><g id="touch_red" data-name="touch red"><circle cx="18.55" cy="19.8" r="6.07" fill="#d42715"/><circle cx="18.55" cy="19.8" r="5.94" fill="none" stroke="#a20800" stroke-width=".25"/></g><path id="touch_hole" data-name="touch hole" d="M40.52 37.33s-.05.91-.69.92h-1.31a2.13 2.13 0 0 0-.41 1.52c0 1.14.32 1.44.32 1.44h1.46a.58.58 0 0 1 .63.53v1.6a3.46 3.46 0 0 0 1.59.26 5.9 5.9 0 0 0 1.5-.26v-1.5a.67.67 0 0 1 .66-.63 9.38 9.38 0 0 0 1.3-.12s.36-.34.39-1.47-.31-1.48-.31-1.48h-1.53a.57.57 0 0 1-.67-.45.86.86 0 0 1 0-.16 9 9 0 0 1 0-1.47 4.31 4.31 0 0 0-2.92 0c-.03.62-.01 1.27-.01 1.27z" transform="translate(-23.5 -19.95)"/></g></g></g></g></svg>`;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    pxsim.GYRO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 37 62.5"><defs><clipPath id="clip-path" transform="translate(-11.5 1.52)"><path d="M21.71 61a8.91 8.91 0 0 1-2-.46h-4.22a2 2 0 0 1-2-2V54h-.76a.76.76 0 0 1-.76-.76V7a.76.76 0 0 1 .76-.76h.76V2a2 2 0 0 1 2-2h12.65v.61h3.42V0h12.75a2 2 0 0 1 2 2v4.22h.91A.76.76 0 0 1 48 7v46.24a.76.76 0 0 1-.76.76h-.91v4.55a2 2 0 0 1-2 2h-4.16c-.18.3-1.91.46-2.23.46z" fill="none"/></clipPath><linearGradient id="linear-gradient" x1="-438.91" y1="1403.05" x2="-438.91" y2="1402.05" gradientTransform="matrix(32.76 0 0 -5.01 14410.48 7079.21)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#3e3e3e"/></linearGradient><linearGradient id="linear-gradient-2" x1="-468.07" y1="2985.3" x2="-468.07" y2="2984.3" gradientTransform="matrix(20.61 0 0 -2.03 9674.72 6104.84)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="gray"/></linearGradient></defs><g style="isolation:isolate"><g id="svg5788"><g id="gyro"><g clip-path="url(#clip-path)" id="gyro_total" data-name="gyro total"><g id="gyro_mask_total" data-name="gyro mask total"><g id="gyro_box" data-name="gyro box"><path id="gyro_sides" data-name="gyro sides" d="M12.76 6.22h34.43A.76.76 0 0 1 48 7v46.24a.76.76 0 0 1-.76.76H12.76a.76.76 0 0 1-.76-.76V7a.76.76 0 0 1 .76-.78z" transform="translate(-11.5 1.52)" fill="#a8aaa8"/><path id="gyro_grey_behind" data-name="gyro grey behind" fill="#9a9a9a" d="M15.52 2.13h5.76V17.9h-5.76z"/><image width="37" height="51" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAA0CAYAAADmI0o+AAAACXBIWXMAAAsSAAALEgHS3X78AAABDklEQVRYR+2ZwU3DQBBF36DcSBHcU0DKohZqoKZwJmkh5jwcNg62iRHfHkEO/0mWbXn99TyytKudyEzukU1/ERFb4AnYzo6epwPeM7OrytkARETQwp6BHRDz734jgQPwEhFv1OQcrhWjfeEO2KMHwleFSnKGYtCC+kNhOn51zsNPo/4Ti6lYTMViKhZTsZhKpdjS+fEm00l8Kf2Kgst5yVpsRIXYcC33ATxe7ldVrkIMxhWDlVJQJwYFMkMqf/5SLKZiMRWLqVhMxWIqFlOxmIrFVCymYjEVi6lYTMViKvcmdm2eTjdVcvjwjzkDJ1rPciTW0fqFULxz80uOwCtwzMyMvvW8sjNbQUeTOgN8AqpBM7JNqq/cAAAAAElFTkSuQmCC" style="mix-blend-mode:multiply" opacity=".3"/><path id="gyro_grey_large-2" data-name="gyro grey large-2" d="M15.49 0h12.66v16l3.42-.26V0h12.74a2 2 0 0 1 2 2v43.81a2 2 0 0 1-2 2H15.49a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z" transform="translate(-11.5 1.52)" fill="#a8aaa8"/><g id="gyro_white" data-name="gyro white"><g id="gyro_white-2" data-name="gyro white-2"><path id="gyro_white_2" data-name="gyro white 2" d="M14.73 29.58h30.34a1.21 1.21 0 0 1 1.21 1.21v27.76a2 2 0 0 1-2 2H15.49a2 2 0 0 1-2-2V30.79a1.21 1.21 0 0 1 1.24-1.21z" transform="translate(-11.5 1.52)" fill="#f1f1f1"/><path id="gyro_white_1" data-name="gyro white 1" d="M13.52 55.52h32.76v3a2 2 0 0 1-2 2H15.49a2 2 0 0 1-2-2z" transform="translate(-11.5 1.52)" style="isolation:isolate" opacity=".6" fill="url(#linear-gradient)"/></g><g id="gyro_white_small" data-name="gyro white small"><path id="gyro_white_small_path" d="M37.94 60.85H21.71a7.84 7.84 0 0 1-1.26-.24 3.14 3.14 0 0 1-1-.38l1.25-1a1.8 1.8 0 0 1 1.05-.36h16.19a1 1 0 0 1 .6.33l.16.15 1.3 1.14a2.47 2.47 0 0 1-.93.25 11.33 11.33 0 0 1-1.13.11z" transform="translate(-11.5 1.52)" fill="url(#linear-gradient-2)"/><path d="M37.94 60.73a9 9 0 0 0 1.85-.27l-1.17-1.06-.17-.14c-.18-.17-.34-.31-.51-.31H21.71a1.68 1.68 0 0 0-1 .34l-1.11.93a8.7 8.7 0 0 0 2.08.51h16.26m0 .25H21.71c-.34 0-2.46-.44-2.46-.78l1.33-1.1a1.88 1.88 0 0 1 1.13-.4h16.23c.33 0 .57.29.84.51l1.4 1.26c0 .34-1.91.53-2.24.53z" transform="translate(-11.5 1.52)" fill="#9a9a9a"/></g></g><g id="gyro_red_elements" data-name="gyro red elements" fill="#d42715"><circle id="gyro_reddot" data-name="gyro reddot" cx="18.4" cy="18.97" r="3.03"/><path id="gyro_arrow_2" data-name="gyro arrow 2" d="M21.92 23.36s-3.9-5.13-.76-10.77a9.59 9.59 0 0 0 .91.45c.65.37.74-.3.61-.75l-1.21-3.8-3.8 1.07a1.2 1.2 0 0 0-.45.15c-.2.12-.37.4 0 .61l1.06.6s-4.53 6.65 1.06 14.26c1.6-1.18 2.58-1.82 2.58-1.82z" transform="translate(-11.5 1.52)"/><path id="gyro_arrow1" data-name="gyro arrow1" d="M37.84 23.36s3.9-5.13.76-10.77a9.59 9.59 0 0 1-.91.45c-.64.37-.74-.3-.6-.75l1.21-3.8 3.79 1.07a1.31 1.31 0 0 1 .46.15c.2.12.36.4 0 .61l-1.07.6s4.52 6.65-1.06 14.26c-1.59-1.18-2.58-1.82-2.58-1.82z" transform="translate(-11.5 1.52)"/></g></g></g></g></g></g></g></svg>`;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    pxsim.INFRARED_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="83" height="34.663" viewBox="0 0 21.96 9.171" id="svg9433"><defs id="defs9427"><clipPath id="clipPath9203"><path d="M0 1145.871h1366V0H0z" id="path9201"/></clipPath><clipPath id="clipPath9215"><path d="M737.191 1004.92h12.59v-18.959h-12.59z" id="path9213"/></clipPath><clipPath id="clipPath9233"><path d="M741.135 1011.29h5.158v-5.16h-5.158z" id="path9231"/></clipPath><linearGradient x2="1" gradientUnits="userSpaceOnUse" gradientTransform="scale(-3.61054) rotate(-42.51 -461.754 125.99)" id="linearGradient9243"><stop offset="0" id="stop9239" stop-color="#f2f2f2"/><stop offset="1" id="stop9241" stop-color="#7a7a7a"/></linearGradient></defs><g id="layer1" transform="translate(0 -287.829)"><g id="g10128" transform="translate(-62.25 173.06) scale(.74516)"><path id="path9195" d="M92.414 162.955h13.539v2.515H92.414z" fill="#1f1f1f" stroke-width=".353"/><g id="g9197" transform="matrix(.35278 0 0 -.35278 -164.065 511.69)"><g clip-path="url(#clipPath9203)" id="g9199"><g transform="translate(719.444 1013.871)" id="g9205"><path id="path9207" d="M0 0h48.387c9.634.073 17.503-7.678 17.575-17.312.073-9.633-7.678-17.502-17.312-17.575a11.528 11.528 0 0 0-.263 0h-5.716l-7.482 6.977H13.803l-6.827-6.977H0c-9.634-.073-17.503 7.678-17.576 17.311C-17.648-7.942-9.898-.073-.265 0H0"/></g><g id="g9209"><g id="g9221"><g id="g9219" clip-path="url(#clipPath9215)" opacity=".058"><path id="path9217" d="M737.191 1004.922h12.59v-18.961h-12.59z" fill="#fff"/></g></g></g><g transform="translate(728.09 1013.871)" id="g9223"><path id="path9225" d="M0 0h31.101v-1.288L21.7-10.315H9.101L0-1.288z" fill="#1f1f1f"/></g><g id="g9227"><g id="g9257"><g id="g9255" clip-path="url(#clipPath9233)" opacity=".261"><g id="g9253"><g id="g9251"><g id="g9249"><g id="g9247"><path id="path9245" d="M743.714 1011.292a2.578 2.578 0 1 0 0-5.158 2.58 2.58 0 0 0 0 5.158" fill="url(#linearGradient9243)"/></g></g></g></g></g></g></g><g transform="translate(709.889 997.793)" id="g9259"><path id="path9261" d="M0 0h14.106l2.275-2.427h-4.248L10.616-.759H0z" fill="#d52715"/></g><g transform="translate(777.54 997.793)" id="g9263"><path id="path9265" d="M0 0h-14.106l-2.275-2.427h4.246l1.518 1.668H.001z" fill="#d52715"/></g></g></g></g></g></svg>`;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    pxsim.ULTRASONIC_SVG = `<svg id="svg5190" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 83.53 35.14"><defs><clipPath id="clip-path" transform="translate(.04 -22.43)"><circle cx="17.53" cy="40" r="6.98" fill="none"/></clipPath><clipPath id="clip-path-2" transform="translate(.04 -22.43)"><circle cx="65.92" cy="40" r="6.98" fill="none"/></clipPath></defs><g id="ultra_sonic" data-name="ultra sonic"><path id="US_main_black2" data-name="US main black2" fill="#242424" d="M22.57 1.49h43.38v31.25H22.57z"/><path id="US_main_black1" data-name="US main black1" d="M30.16 8.47h25.33v17.59H30.16z"/><g id="US_eye1" data-name="US eye1"><g id="US_eye1_black" data-name="US eye1 black"><circle cx="17.57" cy="17.57" r="17.44" stroke="#b3b3b3" stroke-miterlimit="10" stroke-width=".25"/><circle cx="17.57" cy="17.57" r="17.32" fill="none"/></g><circle id="US_eye1_red" data-name="US eye1 red" cx="17.57" cy="17.57" r="10.77" fill="#ab1919"/><circle id="US_eye1_gold_circle" data-name="US eye1 gold circle" cx="17.57" cy="17.57" r="8.04" fill="#aa7707"/><circle id="US_eye1_wh_in_gold" data-name="US eye1 wh in gold" cx="17.57" cy="17.57" r="6.98" fill="#f1f1f1"/><g clip-path="url(#clip-path)" id="US_eye1_net" data-name="US eye1 net"><g id="US_eye1_net_mask" data-name="US eye1 net mask"><g id="US_eye1_net_total" data-name="US eye1 net total" fill="#aa7707"><path id="US_eye1_net14" data-name="US eye1 net14" transform="rotate(-30 -30.693 33.636)" d="M10.84 33.53h.61v22.79h-.61z"/><path id="US_eye1_net13" data-name="US eye1 net13" transform="rotate(-30 -18.79 36.465)" d="M11.8 47.44h22.51v.61H11.8z"/><path id="US_eye1_net12" data-name="US eye1 net12" transform="rotate(-30 -28.208 32.202)" d="M13.33 32.09h.61v22.79h-.61z"/><path id="US_eye1_net11" data-name="US eye1 net11" transform="rotate(-30 -20.225 33.98)" d="M10.36 44.95h22.51v.61H10.36z"/><path id="US_eye1_net10" data-name="US eye1 net10" transform="rotate(-30 -25.7 30.754)" d="M15.83 30.65h.61v22.79h-.61z"/><path id="US_eye1_net9" data-name="US eye1 net9" transform="rotate(-30 -21.673 31.473)" d="M8.92 42.45h22.51v.61H8.92z"/><path id="US_eye1_net8" data-name="US eye1 net8" transform="rotate(-30 -23.216 29.32)" d="M18.33 29.21h.61V52h-.61z"/><path id="US_eye1_net7" data-name="US eye1 net7" transform="rotate(-30 -23.107 28.988)" d="M7.47 39.96h22.51v.61H7.47z"/><path id="US_eye1_net6" data-name="US eye1 net6" transform="rotate(-30 -20.713 27.89)" d="M20.82 27.77h.61v22.79h-.61z"/><path id="US_eye1_net5" data-name="US eye1 net5" transform="rotate(-30 -24.555 26.48)" d="M6.03 37.46h22.51v.61H6.03z"/><path id="US_eye1_net4" data-name="US eye1 net4" transform="rotate(-30 -18.224 26.437)" d="M23.32 26.32h.61v22.79h-.61z"/><path id="US_eye1_net3" data-name="US eye1 net3" transform="rotate(-30 -25.99 23.996)" d="M4.59 34.96H27.1v.61H4.59z"/><path id="US_eye1_net2" data-name="US eye1 net2" transform="rotate(-30 -15.72 25.008)" d="M25.81 24.88h.61v22.79h-.61z"/><path id="US_eye1_net1" data-name="US eye1 net1" transform="rotate(-30 -27.438 21.488)" d="M3.15 32.47h22.51v.61H3.15z"/></g></g></g></g><g id="US_eye2" data-name="US eye2"><g id="US_eye2_black" data-name="US eye2 black"><circle cx="65.96" cy="17.57" r="17.44" stroke="#b3b3b3" stroke-miterlimit="10" stroke-width=".25"/><circle cx="65.96" cy="17.57" r="17.32" fill="none"/></g><circle id="US_eye2_red" data-name="US eye2 red" cx="65.96" cy="17.57" r="10.77" fill="#ab1919"/><circle id="US_eye2_gold_circle" data-name="US eye2 gold circle" cx="65.96" cy="17.57" r="8.04" fill="#aa7707"/><circle id="US_eye2_wh_in_gold" data-name="US eye2 wh in gold" cx="65.96" cy="17.57" r="6.98" fill="#f1f1f1"/><g clip-path="url(#clip-path-2)" id="US_eye2_net" data-name="US eye2 net"><g id="US_eye2_net_mask" data-name="US eye2 net mask"><g id="US_eye2_net_total" data-name="US eye2 net total" fill="#aa7707"><path id="US_eye2_net14" data-name="US eye2 net14" transform="rotate(-30 17.686 33.64)" d="M59.23 33.53h.61v22.79h-.61z"/><path id="US_eye2_net13" data-name="US eye2 net13" transform="rotate(-30 29.607 36.473)" d="M60.18 47.44h22.51v.61H60.18z"/><path id="US_eye2_net12" data-name="US eye2 net12" transform="rotate(-30 20.19 32.21)" d="M61.72 32.09h.61v22.79h-.61z"/><path id="US_eye2_net11" data-name="US eye2 net11" transform="rotate(-30 28.16 33.965)" d="M58.74 44.95h22.51v.61H58.74z"/><path id="US_eye2_net10" data-name="US eye2 net10" transform="rotate(-30 22.679 30.757)" d="M64.22 30.65h.61v22.79h-.61z"/><path id="US_eye2_net9" data-name="US eye2 net9" transform="rotate(-30 26.725 31.48)" d="M57.3 42.45h22.51v.61H57.3z"/><path id="US_eye2_net8" data-name="US eye2 net8" transform="rotate(-30 25.182 29.327)" d="M66.71 29.21h.61V52h-.61z"/><path id="US_eye2_net7" data-name="US eye2 net7" transform="rotate(-30 25.277 28.973)" d="M55.86 39.96h22.51v.61H55.86z"/><path id="US_eye2_net6" data-name="US eye2 net6" transform="rotate(-30 27.671 27.874)" d="M69.21 27.77h.61v22.79h-.61z"/><path id="US_eye2_net5" data-name="US eye2 net5" transform="rotate(-30 23.842 26.489)" d="M54.42 37.46h22.51v.61H54.42z"/><path id="US_eye2_net4" data-name="US eye2 net4" transform="rotate(-30 30.174 26.445)" d="M71.71 26.32h.61v22.79h-.61z"/><path id="US_eye2_net3" data-name="US eye2 net3" transform="rotate(-30 22.394 23.98)" d="M52.98 34.96h22.51v.61H52.98z"/><path id="US_eye2_net2" data-name="US eye2 net2" transform="rotate(-30 32.663 24.992)" d="M74.2 24.88h.61v22.79h-.61z"/><path id="US_eye2_net1" data-name="US eye2 net1" transform="rotate(-30 20.96 21.496)" d="M51.54 32.47h22.51v.61H51.54z"/></g></g></g></g></g></svg>`;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class BackgroundViewControl extends visuals.ControlView {
            getInnerView() {
                this.backgroundGroup = pxsim.svg.elt("g");
                this.backgroundRect = pxsim.svg.child(this.backgroundGroup, "rect", {
                    'x': 0, 'y': 0,
                    'width': '100%',
                    'height': '100%',
                    'style': `fill: ${this.theme.backgroundViewColor};stroke: #A8A9A8; stroke-width: 3px; stroke-opacity: 0.2`
                });
                return this.backgroundGroup;
            }
            buildDom() {
                this.content = pxsim.svg.elt("svg", { width: "100%", height: "100%" });
                this.content.appendChild(this.getInnerView());
                return this.content;
            }
            resize(width, height, strict) {
                super.resize(width, height, strict);
                this.backgroundRect.setAttribute('stroke-dasharray', `${height + width + height} 1000`);
                this.backgroundRect.setAttribute('stroke-dashoffset', `-${width}`);
            }
            getInnerWidth() {
                return 76.84;
            }
            getInnerHeight() {
                return 173.86;
            }
        }
        visuals.BackgroundViewControl = BackgroundViewControl;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class CloseIconControl extends visuals.ControlView {
            getInnerView() {
                this.closeGroup = pxsim.svg.elt("g");
                this.closeGroup.style.cursor = 'pointer';
                const circleCloseWrapper = pxsim.svg.child(this.closeGroup, "g");
                pxsim.svg.child(circleCloseWrapper, "circle", { 'cx': "16", 'cy': "16", 'r': "16", 'style': "fill: transparent;" });
                pxsim.svg.child(circleCloseWrapper, "circle", { 'cx': "16", 'cy': "16", 'r': "15", 'style': "fill: none;stroke: #a8aaa8;stroke-width: 2px" });
                pxsim.svg.child(this.closeGroup, "rect", { 'x': "10", 'y': "16", 'width': "18", 'height': "2", 'transform': "translate(-9.46 17.41) rotate(-45)", 'style': "fill: #a8aaa8" });
                pxsim.svg.child(this.closeGroup, "rect", { 'x': "18", 'y': "8", 'width': "2", 'height': "18", 'transform': "translate(-9.46 17.41) rotate(-45)", 'style': "fill: #a8aaa8" });
                return this.closeGroup;
            }
            buildDom() {
                this.content = pxsim.svg.elt("svg", { width: "100%", height: "100%", viewBox: "0 0 32 32" });
                this.content.appendChild(this.getInnerView());
                return this.content;
            }
            getInnerHeight() {
                return 32;
            }
            getInnerWidth() {
                return 32;
            }
        }
        visuals.CloseIconControl = CloseIconControl;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class ColorGridControl extends visuals.ControlView {
            constructor() {
                super(...arguments);
                this.colorDivs = [];
            }
            getInnerView() {
                this.group = pxsim.svg.elt("g");
                this.group.setAttribute("transform", `translate(2, 2.5) scale(0.6)`);
                const colors = ['#f12a21', '#ffd01b', '#006db3', '#00934b', '#000', '#6c2d00'];
                const colorIds = ['red', 'yellow', 'blue', 'green', 'black', 'brown'];
                let cy = -4;
                for (let c = 0; c < colorIds.length; c++) {
                    const cx = c % 2 == 0 ? 2.2 : 7.5;
                    if (c % 2 == 0)
                        cy += 5;
                    if (colorIds[c]) {
                        const circle = pxsim.svg.child(this.group, "circle", {
                            'class': `sim-color-grid-circle sim-color-grid-${colorIds[c]}`,
                            'cx': cx, 'cy': cy, 'r': '2', 'style': `fill: ${colors[c]}`
                        });
                        this.colorDivs.push(circle);
                        pxsim.pointerEvents.down.forEach(evid => circle.addEventListener(evid, ev => {
                            this.setColor(ColorGridControl.colorValue[c]);
                        }));
                    }
                }
                const whiteCircleWrapper = pxsim.svg.child(this.group, "g", { 'id': 'white-cirlce-wrapper' });
                const noneCircleWrapper = pxsim.svg.child(this.group, "g", { 'id': 'nothing-circle-wrapper' });
                const whiteCircle = pxsim.svg.child(whiteCircleWrapper, "circle", { 'class': 'sim-color-grid-circle sim-color-grid-white', 'cx': 2.2, 'cy': '16', 'r': '2', 'style': `fill: #fff` });
                const noneCircle = pxsim.svg.child(noneCircleWrapper, "circle", { 'class': 'sim-color-grid-circle sim-color-grid-none', 'cx': 7.5, 'cy': '16', 'r': '2', 'style': `fill: #fff; fill-opacity: 0%;` });
                this.colorDivs.push(whiteCircle);
                this.colorDivs.push(noneCircle);
                pxsim.svg.child(whiteCircleWrapper, "circle", { 'cx': 2.2, 'cy': '16', 'r': '2', 'style': `fill: none; stroke: #94989b; stroke-width: 0.1px` });
                pxsim.svg.child(noneCircleWrapper, "circle", { 'cx': 7.5, 'cy': '16', 'r': '2', 'style': `fill: none; stroke: #94989b; stroke-width: 0.1px` });
                pxsim.pointerEvents.down.forEach(evid => whiteCircleWrapper.addEventListener(evid, ev => {
                    this.setColor(6);
                }));
                pxsim.pointerEvents.down.forEach(evid => noneCircleWrapper.addEventListener(evid, ev => {
                    this.setColor(0);
                }));
                return this.group;
            }
            getInnerWidth() {
                return 9.5;
            }
            getInnerHeight() {
                return 15;
            }
            updateState() {
                if (!this.visible) {
                    return;
                }
                const node = this.state;
                const color = node.getValue();
                for (let c = 0; c < ColorGridControl.colorValue.length; c++) {
                    const colorId = ColorGridControl.colorIds[c];
                    const colorValue = ColorGridControl.colorValue[c];
                    const colorDiv = this.colorDivs[c];
                    if (colorValue == color) {
                        pxsim.U.addClass(colorDiv, 'sim-color-selected');
                    }
                    else {
                        pxsim.U.removeClass(colorDiv, 'sim-color-selected');
                    }
                }
            }
            setColor(color) {
                const state = this.state;
                const currentColor = state.getValue();
                if (currentColor == color) {
                    state.setColor(0);
                }
                else {
                    state.setColor(color);
                }
            }
        }
        ColorGridControl.colorIds = ['red', 'yellow', 'blue', 'green', 'black', 'brown', 'white', 'none'];
        ColorGridControl.colorValue = [5, 4, 2, 3, 1, 7, 6, 0];
        visuals.ColorGridControl = ColorGridControl;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class ColorRGBWheelControl extends visuals.ControlView {
            constructor() {
                super(...arguments);
                this.colorGradient = [];
                this.reporter = [];
                this.rect = [];
                this.printOffsetH = 16;
                this.rgbLetters = ["R", "G", "B"];
                this.rectNames = ["rectR", "rectG", "rectB"];
                this.captured = false;
            }
            getInnerWidth() {
                return 120;
            }
            getInnerHeight() {
                return 192;
            }
            getReporterHeight() {
                return 70;
            }
            getSliderWidth() {
                return 24;
            }
            getSliderHeight() {
                return 100;
            }
            getMaxValue() {
                return 512;
            }
            mapValue(x, inMin, inMax, outMin, outMax) {
                return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
            }
            updateState() {
                if (!this.visible)
                    return;
                const node = this.state;
                const values = node.getValues();
                let inverseValue = [];
                for (let i = 0; i < 3; i++) {
                    inverseValue[i] = this.getMaxValue() - values[i];
                    inverseValue[i] = this.mapValue(inverseValue[i], 0, this.getMaxValue(), 0, 100);
                    pxsim.svg.setGradientValue(this.colorGradient[i], inverseValue[i] + "%");
                    this.reporter[i].textContent = this.rgbLetters[i] + ": " + `${parseFloat((values[i]).toString()).toFixed(0)}`;
                }
            }
            updateColorLevel(pt, parent, ev) {
                if (!this.classVal)
                    this.classVal = ev.target.classList.value;
                let cur = pxsim.svg.cursorPoint(pt, parent, ev);
                let index = this.rectNames.findIndex(i => i == this.classVal);
                const bBox = this.rect[index].getBoundingClientRect();
                const height = bBox.height;
                let t = Math.max(0, Math.min(1, (height + bBox.top / this.scaleFactor - cur.y / this.scaleFactor) / height));
                const state = this.state;
                let colorsVal = this.state.getValues();
                colorsVal[index] = t * this.getMaxValue();
                state.setColors(colorsVal);
            }
            getInnerView(parent, globalDefs) {
                this.group = pxsim.svg.elt("g");
                let gc = "gradient-color-" + this.getPort();
                let prevColorGradient = [];
                for (let i = 0; i < 3; i++) {
                    prevColorGradient[i] = globalDefs.querySelector(`#${gc + "-" + i}`);
                    this.colorGradient[i] = prevColorGradient[i] ? prevColorGradient[i] : pxsim.svg.linearGradient(globalDefs, gc + "-" + i, false);
                    pxsim.svg.setGradientValue(this.colorGradient[i], "50%");
                    pxsim.svg.setGradientColors(this.colorGradient[i], "black", "yellow");
                }
                let reporterGroup = [];
                for (let i = 0; i < 3; i++) {
                    reporterGroup[i] = pxsim.svg.child(this.group, "g");
                    reporterGroup[i].setAttribute("transform", `translate(${this.getWidth() / 2}, ${18 + this.printOffsetH * i})`);
                    this.reporter[i] = pxsim.svg.child(reporterGroup[i], "text", { 'text-anchor': 'middle', 'class': 'sim-text number large inverted', 'style': 'font-size: 18px;' });
                }
                let sliderGroup = [];
                for (let i = 0; i < 3; i++) {
                    sliderGroup[i] = pxsim.svg.child(this.group, "g");
                    const translateX = (this.getWidth() / 2 - this.getSliderWidth() / 2 - 36) + 36 * i;
                    sliderGroup[i].setAttribute("transform", `translate(${translateX}, ${this.getReporterHeight()})`);
                    this.rect[i] = pxsim.svg.child(sliderGroup[i], "rect", {
                        "width": this.getSliderWidth(),
                        "height": this.getSliderHeight(),
                        "style": `fill: url(#${gc + "-" + i})`
                    });
                }
                let pt = parent.createSVGPoint();
                for (let i = 0; i < 3; i++) {
                    visuals.touchEvents(this.rect[i], ev => {
                        if (this.captured && ev.clientY) {
                            ev.preventDefault();
                            this.updateColorLevel(pt, parent, ev);
                        }
                    }, ev => {
                        this.captured = true;
                        if (ev.clientY) {
                            this.rect[i].setAttribute('cursor', '-webkit-grabbing');
                            this.rect[i].setAttribute('class', this.rectNames[i]);
                            this.updateColorLevel(pt, parent, ev);
                        }
                    }, () => {
                        this.captured = false;
                        this.classVal = '';
                        this.rect[i].setAttribute('cursor', '-webkit-grab');
                    });
                }
                return this.group;
            }
        }
        visuals.ColorRGBWheelControl = ColorRGBWheelControl;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class ColorWheelControl extends visuals.ControlView {
            getInnerWidth() {
                return 111;
            }
            getInnerHeight() {
                return 192;
            }
            getReporterHeight() {
                return 38;
            }
            getSliderWidth() {
                return 62;
            }
            getSliderHeight() {
                return 131;
            }
            getMaxValue(state) {
                return (state == pxsim.ColorSensorMode.RefRaw ? 1023 : 100);
            }
            mapValue(x, inMin, inMax, outMin, outMax) {
                return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
            }
            updateState() {
                if (!this.visible) {
                    return;
                }
                const node = this.state;
                const value = node.getValue();
                let inverseValue = this.getMaxValue(node.getMode()) - value;
                if (node.getMode() == pxsim.ColorSensorMode.RefRaw)
                    inverseValue = this.mapValue(inverseValue, 0, 1023, 0, 100);
                pxsim.svg.setGradientValue(this.colorGradient, inverseValue + "%");
                this.reporter.textContent = `${parseFloat((value).toString()).toFixed(0)}`;
                if (node.getMode() != pxsim.ColorSensorMode.RefRaw)
                    this.reporter.textContent += `%`;
            }
            updateColorLevel(pt, parent, ev) {
                let cur = pxsim.svg.cursorPoint(pt, parent, ev);
                const bBox = this.rect.getBoundingClientRect();
                const height = bBox.height;
                let t = Math.max(0, Math.min(1, (height + bBox.top / this.scaleFactor - cur.y / this.scaleFactor) / height));
                const state = this.state;
                state.setColor(t * this.getMaxValue(state.getMode()));
            }
            getInnerView(parent, globalDefs) {
                this.group = pxsim.svg.elt("g");
                let gc = "gradient-color-" + this.getPort();
                const prevColorGradient = globalDefs.querySelector(`#${gc}`);
                this.colorGradient = prevColorGradient ? prevColorGradient : pxsim.svg.linearGradient(globalDefs, gc, false);
                pxsim.svg.setGradientValue(this.colorGradient, "50%");
                pxsim.svg.setGradientColors(this.colorGradient, "black", "yellow");
                const reporterGroup = pxsim.svg.child(this.group, "g");
                reporterGroup.setAttribute("transform", `translate(${this.getWidth() / 2}, 20)`);
                this.reporter = pxsim.svg.child(reporterGroup, "text", { 'text-anchor': 'middle', 'x': 0, 'y': '0', 'class': 'sim-text number large inverted' });
                const sliderGroup = pxsim.svg.child(this.group, "g");
                sliderGroup.setAttribute("transform", `translate(${this.getWidth() / 2 - this.getSliderWidth() / 2}, ${this.getReporterHeight()})`);
                const rect = pxsim.svg.child(sliderGroup, "rect", {
                    "width": this.getSliderWidth(),
                    "height": this.getSliderHeight(),
                    "style": `fill: url(#${gc})`
                });
                this.rect = rect;
                let pt = parent.createSVGPoint();
                let captured = false;
                visuals.touchEvents(rect, ev => {
                    if (captured && ev.clientY) {
                        ev.preventDefault();
                        this.updateColorLevel(pt, parent, ev);
                    }
                }, ev => {
                    captured = true;
                    if (ev.clientY) {
                        rect.setAttribute('cursor', '-webkit-grabbing');
                        this.updateColorLevel(pt, parent, ev);
                    }
                }, () => {
                    captured = false;
                    rect.setAttribute('cursor', '-webkit-grab');
                });
                return this.group;
            }
        }
        visuals.ColorWheelControl = ColorWheelControl;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class DistanceSliderControl extends visuals.ControlView {
            getInnerWidth() {
                return 111;
            }
            getInnerHeight() {
                return 192;
            }
            getReporterHeight() {
                return 38;
            }
            getSliderWidth() {
                return 62;
            }
            getSliderHeight() {
                return 131;
            }
            getMaxValue() {
                return 250; // cm
            }
            updateState() {
                if (!this.visible) {
                    return;
                }
                const node = this.state;
                const percentage = node.getValue() / 10; /* convert back to cm */
                const y = this.getSliderHeight() * percentage / this.getMaxValue();
                this.slider.setAttribute("transform", `translate(0, ${y - DistanceSliderControl.SLIDER_HANDLE_HEIGHT / 2})`);
                // Update reporter text
                this.reporter.textContent = `${parseFloat((percentage).toString()).toFixed(0)}cm`;
            }
            updateSliderValue(pt, parent, ev) {
                let cur = pxsim.svg.cursorPoint(pt, parent, ev);
                const bBox = this.rect.getBoundingClientRect();
                const height = bBox.height;
                let t = Math.max(0, Math.min(1, (height + bBox.top / this.scaleFactor - cur.y / this.scaleFactor) / height));
                const state = this.state;
                state.setDistance((1 - t) * (this.getMaxValue()));
            }
            getInnerView(parent, globalDefs) {
                let gid = "gradient-slider-" + this.getPort();
                this.group = pxsim.svg.elt("g");
                const prevGradient = globalDefs.querySelector(`#${gid}`);
                this.gradient = prevGradient ? prevGradient : visuals.createGradient(gid, this.getGradientDefinition());
                this.gradient.setAttribute('x1', '0%');
                this.gradient.setAttribute('y1', '0%');
                this.gradient.setAttribute('x2', '0%');
                this.gradient.setAttribute('y2', '100%');
                // this.gradient.setAttribute('gradientTransform', 'matrix(50, 0, 0, -110, 21949.45, 46137.67)');
                // this.gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
                globalDefs.appendChild(this.gradient);
                this.group = pxsim.svg.elt("g");
                const reporterGroup = pxsim.svg.child(this.group, "g");
                reporterGroup.setAttribute("transform", `translate(${this.getWidth() / 2}, 20)`);
                this.reporter = pxsim.svg.child(reporterGroup, "text", { 'text-anchor': 'middle', 'x': 0, 'y': '0', 'class': 'sim-text number large inverted' });
                const sliderGroup = pxsim.svg.child(this.group, "g");
                sliderGroup.setAttribute("transform", `translate(${this.getInnerWidth() / 2 - this.getSliderWidth() / 2}, ${this.getReporterHeight()})`);
                const rect = pxsim.svg.child(sliderGroup, "rect", { 'x': DistanceSliderControl.SLIDER_SIDE_PADDING, 'y': 2, 'width': this.getSliderWidth() - DistanceSliderControl.SLIDER_SIDE_PADDING * 2, 'height': this.getSliderHeight(), 'style': `fill: url(#${gid})` });
                this.rect = rect;
                this.slider = pxsim.svg.child(sliderGroup, "g", { "transform": "translate(0,0)" });
                const sliderInner = pxsim.svg.child(this.slider, "g");
                pxsim.svg.child(sliderInner, "rect", { 'width': this.getSliderWidth(), 'height': DistanceSliderControl.SLIDER_HANDLE_HEIGHT, 'rx': '2', 'ry': '2', 'style': 'fill: #f12a21' });
                pxsim.svg.child(sliderInner, "rect", { 'x': '0.5', 'y': '0.5', 'width': this.getSliderWidth() - 1, 'height': DistanceSliderControl.SLIDER_HANDLE_HEIGHT - 1, 'rx': '1.5', 'ry': '1.5', 'style': 'fill: none;stroke: #b32e29' });
                const dragSurface = pxsim.svg.child(this.group, "rect", {
                    x: 0,
                    y: 0,
                    width: this.getInnerWidth(),
                    height: this.getInnerHeight(),
                    opacity: 0,
                    cursor: '-webkit-grab'
                });
                let pt = parent.createSVGPoint();
                let captured = false;
                visuals.touchEvents(dragSurface, ev => {
                    if (captured && ev.clientY != undefined) {
                        ev.preventDefault();
                        this.updateSliderValue(pt, parent, ev);
                    }
                }, ev => {
                    captured = true;
                    if (ev.clientY != undefined) {
                        dragSurface.setAttribute('cursor', '-webkit-grabbing');
                        this.updateSliderValue(pt, parent, ev);
                    }
                }, () => {
                    captured = false;
                    dragSurface.setAttribute('cursor', '-webkit-grab');
                });
                return this.group;
            }
            getGradientDefinition() {
                return {
                    stops: [
                        { offset: 0, color: '#626262' },
                        { offset: 100, color: "#ddd" }
                    ]
                };
            }
        }
        DistanceSliderControl.SLIDER_HANDLE_HEIGHT = 26;
        DistanceSliderControl.SLIDER_SIDE_PADDING = 6;
        visuals.DistanceSliderControl = DistanceSliderControl;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class LightWheelControl extends visuals.ControlView {
            getInnerWidth() {
                return 111;
            }
            getInnerHeight() {
                return 192;
            }
            getReporterHeight() {
                return 38;
            }
            getSliderWidth() {
                return 62;
            }
            getSliderHeight() {
                return 131;
            }
            getMinValue(state) {
                if (state.getMode() == pxsim.NXTLightSensorMode.ReflectedLight)
                    return state.brightReflectedLight;
                else if (state.getMode() == pxsim.NXTLightSensorMode.AmbientLight)
                    return state.brightAmbientLight;
                return 0;
            }
            getMaxValue(state) {
                if (state.getMode() == pxsim.NXTLightSensorMode.ReflectedLightRaw || state.getMode() == pxsim.NXTLightSensorMode.AmbientLightRaw) {
                    return 4095;
                }
                else if (state.getMode() == pxsim.NXTLightSensorMode.ReflectedLight) {
                    return state.darkReflectedLight;
                }
                else if (state.getMode() == pxsim.NXTLightSensorMode.AmbientLight) {
                    return state.darkAmbientLight;
                }
                return 100;
            }
            mapValue(x, inMin, inMax, outMin, outMax) {
                return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
            }
            updateState() {
                if (!this.visible) {
                    return;
                }
                const node = this.state;
                const value = node.getValue();
                let inverseValue = this.getMaxValue(node) - value + this.getMinValue(node);
                if (node.getMode() == pxsim.NXTLightSensorMode.ReflectedLightRaw || node.getMode() == pxsim.NXTLightSensorMode.AmbientLightRaw) {
                    inverseValue = this.mapValue(inverseValue, 0, 4095, 0, 100);
                }
                else if (node.getMode() == pxsim.NXTLightSensorMode.ReflectedLight) {
                    inverseValue = this.mapValue(inverseValue, node.darkReflectedLight, node.brightReflectedLight, 0, 100);
                }
                else if (node.getMode() == pxsim.NXTLightSensorMode.AmbientLight) {
                    inverseValue = this.mapValue(inverseValue, node.darkAmbientLight, node.brightAmbientLight, 0, 100);
                }
                pxsim.svg.setGradientValue(this.colorGradient, inverseValue + "%");
                if (node.getMode() == pxsim.NXTLightSensorMode.ReflectedLightRaw || node.getMode() == pxsim.NXTLightSensorMode.AmbientLightRaw) {
                    this.reporter.textContent = `${Math.floor(parseFloat(value.toString()))}`;
                }
                else {
                    this.reporter.textContent = `${Math.floor(this.mapValue(parseFloat(value.toString()), this.getMaxValue(node), this.getMinValue(node), 0, 100))}%`;
                }
            }
            updateColorLevel(pt, parent, ev) {
                const state = this.state;
                let cur = pxsim.svg.cursorPoint(pt, parent, ev);
                const bBox = this.rect.getBoundingClientRect();
                const height = bBox.height;
                let t = Math.max(0, Math.min(1, (height + bBox.top / this.scaleFactor - cur.y / this.scaleFactor) / height));
                if (state.getMode() == pxsim.NXTLightSensorMode.ReflectedLight || state.getMode() == pxsim.NXTLightSensorMode.AmbientLight)
                    t = 1 - t;
                state.setValue(this.getMinValue(state) + t * (this.getMaxValue(state) - this.getMinValue(state)));
            }
            getInnerView(parent, globalDefs) {
                this.group = pxsim.svg.elt("g");
                let gc = "gradient-color-" + this.getPort();
                const prevColorGradient = globalDefs.querySelector(`#${gc}`);
                this.colorGradient = prevColorGradient ? prevColorGradient : pxsim.svg.linearGradient(globalDefs, gc, false);
                pxsim.svg.setGradientValue(this.colorGradient, "50%");
                pxsim.svg.setGradientColors(this.colorGradient, "black", "yellow");
                const reporterGroup = pxsim.svg.child(this.group, "g");
                reporterGroup.setAttribute("transform", `translate(${this.getWidth() / 2}, 20)`);
                this.reporter = pxsim.svg.child(reporterGroup, "text", { 'text-anchor': 'middle', 'x': 0, 'y': '0', 'class': 'sim-text number large inverted' });
                const sliderGroup = pxsim.svg.child(this.group, "g");
                sliderGroup.setAttribute("transform", `translate(${this.getWidth() / 2 - this.getSliderWidth() / 2}, ${this.getReporterHeight()})`);
                const rect = pxsim.svg.child(sliderGroup, "rect", {
                    "width": this.getSliderWidth(),
                    "height": this.getSliderHeight(),
                    "style": `fill: url(#${gc})`
                });
                this.rect = rect;
                let pt = parent.createSVGPoint();
                let captured = false;
                visuals.touchEvents(rect, ev => {
                    if (captured && ev.clientY) {
                        ev.preventDefault();
                        this.updateColorLevel(pt, parent, ev);
                    }
                }, ev => {
                    captured = true;
                    if (ev.clientY) {
                        rect.setAttribute('cursor', '-webkit-grabbing');
                        this.updateColorLevel(pt, parent, ev);
                    }
                }, () => {
                    captured = false;
                    rect.setAttribute('cursor', '-webkit-grab');
                });
                return this.group;
            }
        }
        visuals.LightWheelControl = LightWheelControl;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class MotorReporterControl extends visuals.ControlView {
            getInnerView() {
                this.group = pxsim.svg.elt("g");
                const outerCircle = pxsim.svg.child(this.group, "circle", {
                    'stroke-dasharray': '565.48', 'stroke-dashoffset': '0',
                    'cx': 100, 'cy': 100, 'r': '90', 'style': `fill:transparent; transition: stroke-dashoffset 1s linear;`,
                    'stroke': '#a8aaa8', 'stroke-width': '1rem'
                });
                this.circleBar = pxsim.svg.child(this.group, "circle", {
                    'stroke-dasharray': '565.48', 'stroke-dashoffset': '0',
                    'cx': 100, 'cy': 100, 'r': '90', 'style': `fill:transparent; transition: stroke-dashoffset 1s linear;`,
                    'stroke': '#f12a21', 'stroke-width': '1rem'
                });
                this.reporter = pxsim.svg.child(this.group, "text", {
                    'x': this.getWidth() / 2, 'y': this.getHeight() / 2,
                    'text-anchor': 'middle', 'dominant-baseline': 'middle',
                    'style': 'font-size: 50px',
                    'class': 'sim-text inverted number'
                });
                return this.group;
            }
            getInnerWidth() {
                return 200;
            }
            getInnerHeight() {
                return 200;
            }
            updateState() {
                if (!this.visible) {
                    return;
                }
                const node = this.state;
                const speed = node.getSpeed();
                this.updateSpeed(speed);
                // Update reporter
                this.reporter.textContent = `${speed}`;
            }
            updateSpeed(speed) {
                let c = Math.PI * (90 * 2);
                speed = Math.abs(speed);
                let pct = ((100 - speed) / 100) * c;
                this.circleBar.setAttribute('stroke-dashoffset', `${pct}`);
            }
        }
        visuals.MotorReporterControl = MotorReporterControl;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class MotorSliderControl extends visuals.ControlView {
            constructor() {
                super(...arguments);
                this.internalAngle = 0;
            }
            getInnerView(parent, globalDefs) {
                this.group = pxsim.svg.elt("g");
                const slider = pxsim.svg.child(this.group, 'g', { 'transform': 'translate(25,25)' });
                const outerCircle = pxsim.svg.child(slider, "circle", {
                    'stroke-dasharray': '565.48', 'stroke-dashoffset': '0',
                    'cx': 100, 'cy': 100, 'r': '90', 'style': `fill:transparent;`,
                    'stroke': '#a8aaa8', 'stroke-width': '1rem'
                });
                this.reporter = pxsim.svg.child(this.group, "text", {
                    'x': this.getInnerWidth() / 2, 'y': this.getInnerHeight() / 2,
                    'text-anchor': 'middle', 'dominant-baseline': 'middle',
                    'style': 'font-size: 50px',
                    'class': 'sim-text inverted number'
                });
                this.dial = pxsim.svg.child(slider, "g", { 'cursor': '-webkit-grab' });
                const handleInner = pxsim.svg.child(this.dial, "g");
                pxsim.svg.child(handleInner, "circle", { 'cx': 0, 'cy': 0, 'r': 30, 'style': 'fill: #f12a21;' });
                pxsim.svg.child(handleInner, "circle", { 'cx': 0, 'cy': 0, 'r': 29.5, 'style': 'fill: none;stroke: #b32e29' });
                this.updateDial();
                let pt = parent.createSVGPoint();
                let captured = false;
                const dragSurface = pxsim.svg.child(this.group, "rect", {
                    x: 0,
                    y: 0,
                    width: this.getInnerWidth(),
                    height: this.getInnerHeight(),
                    opacity: 0,
                    cursor: '-webkit-grab'
                });
                visuals.touchEvents(dragSurface, ev => {
                    if (captured && ev.clientY != undefined) {
                        ev.preventDefault();
                        this.updateSliderValue(pt, parent, ev);
                        this.handleSliderMove();
                    }
                }, ev => {
                    captured = true;
                    if (ev.clientY != undefined) {
                        this.updateSliderValue(pt, parent, ev);
                        this.handleSliderDown();
                    }
                }, () => {
                    captured = false;
                    this.handleSliderUp();
                });
                return this.group;
            }
            getInnerWidth() {
                return 250;
            }
            getInnerHeight() {
                return 250;
            }
            updateSliderValue(pt, parent, ev) {
                let cur = pxsim.svg.cursorPoint(pt, parent, ev);
                let bBox = this.content.getBoundingClientRect();
                const coords = {
                    x: cur.x / this.scaleFactor - bBox.left / this.scaleFactor,
                    y: cur.y / this.scaleFactor - bBox.top / this.scaleFactor
                };
                const radius = MotorSliderControl.SLIDER_RADIUS / 2;
                const dx = coords.x - radius;
                const dy = coords.y - radius;
                const atan = Math.atan(-dy / dx);
                let deg = Math.ceil(atan * (180 / Math.PI));
                if (dx < 0) {
                    deg -= 270;
                }
                else if (dy > 0) {
                    deg -= 450;
                }
                else if (dx >= 0 && dy <= 0) {
                    deg = 90 - deg;
                }
                const value = Math.abs(Math.ceil((deg % 360)));
                this.internalAngle = value;
                this.updateDial();
                this.prevVal = deg;
                this.lastPosition = cur.x;
            }
            handleSliderDown() {
                const state = this.state;
                state.manualMotorDown();
            }
            handleSliderMove() {
                this.dial.setAttribute('cursor', '-webkit-grabbing');
                const state = this.state;
                state.manualMotorAngle(this.internalAngle);
            }
            handleSliderUp() {
                this.dial.setAttribute('cursor', '-webkit-grab');
                const state = this.state;
                state.manualMotorUp();
                this.internalAngle = 0;
                this.updateDial();
            }
            updateDial() {
                let angle = this.internalAngle;
                // Update dial position
                const radius = MotorSliderControl.SLIDER_RADIUS;
                const dialRadius = 5;
                const x = Math.ceil((radius - dialRadius) * Math.sin(angle * Math.PI / 180)) + radius;
                const y = Math.ceil((radius - dialRadius) * -Math.cos(angle * Math.PI / 180)) + radius;
                this.dial.setAttribute('transform', `translate(${x}, ${y})`);
            }
            updateState() {
                if (!this.visible) {
                    return;
                }
                const node = this.state;
                const angle = node.getAngle() % 360;
                // Update reporter
                this.reporter.textContent = `${angle}°`;
            }
        }
        MotorSliderControl.SLIDER_RADIUS = 100;
        visuals.MotorSliderControl = MotorSliderControl;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class ProximitySliderControl extends visuals.ControlView {
            getInnerWidth() {
                return 111;
            }
            getInnerHeight() {
                return 192;
            }
            getReporterHeight() {
                return 38;
            }
            getSliderWidth() {
                return 62;
            }
            getSliderHeight() {
                return 131;
            }
            getMaxValue() {
                return 100;
            }
            updateState() {
                if (!this.visible) {
                    return;
                }
                const node = this.state;
                const percentage = node.getValue();
                const y = this.getSliderHeight() * percentage / this.getMaxValue();
                this.slider.setAttribute("transform", `translate(0, ${y - ProximitySliderControl.SLIDER_HANDLE_HEIGHT / 2})`);
                // Update reporter text
                this.reporter.textContent = `${parseFloat((percentage).toString()).toFixed(0)}`;
            }
            updateSliderValue(pt, parent, ev) {
                let cur = pxsim.svg.cursorPoint(pt, parent, ev);
                const bBox = this.rect.getBoundingClientRect();
                const height = bBox.height;
                let t = Math.max(0, Math.min(1, (height + bBox.top / this.scaleFactor - cur.y / this.scaleFactor) / height));
                const state = this.state;
                const v = Math.floor((1 - t) * (this.getMaxValue()));
                state.setPromixity(v);
            }
            getInnerView(parent, globalDefs) {
                let gid = "gradient-slider-" + this.getId();
                this.group = pxsim.svg.elt("g");
                this.gradient = visuals.createGradient(gid, this.getGradientDefinition());
                this.gradient.setAttribute('x1', '0%');
                this.gradient.setAttribute('y1', '0%');
                this.gradient.setAttribute('x2', '0%');
                this.gradient.setAttribute('y2', '100%');
                // this.gradient.setAttribute('gradientTransform', 'matrix(50, 0, 0, -110, 21949.45, 46137.67)');
                // this.gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
                globalDefs.appendChild(this.gradient);
                this.group = pxsim.svg.elt("g");
                const reporterGroup = pxsim.svg.child(this.group, "g");
                reporterGroup.setAttribute("transform", `translate(${this.getWidth() / 2}, 20)`);
                this.reporter = pxsim.svg.child(reporterGroup, "text", { 'text-anchor': 'middle', 'x': 0, 'y': '0', 'class': 'sim-text number large inverted' });
                const sliderGroup = pxsim.svg.child(this.group, "g");
                sliderGroup.setAttribute("transform", `translate(${this.getInnerWidth() / 2 - this.getSliderWidth() / 2}, ${this.getReporterHeight()})`);
                const rect = pxsim.svg.child(sliderGroup, "rect", { 'x': ProximitySliderControl.SLIDER_SIDE_PADDING, 'y': 2, 'width': this.getSliderWidth() - ProximitySliderControl.SLIDER_SIDE_PADDING * 2, 'height': this.getSliderHeight(), 'style': `fill: url(#${gid})` });
                this.rect = rect;
                this.slider = pxsim.svg.child(sliderGroup, "g", { "transform": "translate(0,0)" });
                const sliderInner = pxsim.svg.child(this.slider, "g");
                pxsim.svg.child(sliderInner, "rect", { 'width': this.getSliderWidth(), 'height': ProximitySliderControl.SLIDER_HANDLE_HEIGHT, 'rx': '2', 'ry': '2', 'style': 'fill: #f12a21' });
                pxsim.svg.child(sliderInner, "rect", { 'x': '0.5', 'y': '0.5', 'width': this.getSliderWidth() - 1, 'height': ProximitySliderControl.SLIDER_HANDLE_HEIGHT - 1, 'rx': '1.5', 'ry': '1.5', 'style': 'fill: none;stroke: #b32e29' });
                const dragSurface = pxsim.svg.child(this.group, "rect", {
                    x: 0,
                    y: 0,
                    width: this.getInnerWidth(),
                    height: this.getInnerHeight(),
                    opacity: 0,
                    cursor: '-webkit-grab'
                });
                let pt = parent.createSVGPoint();
                let captured = false;
                visuals.touchEvents(dragSurface, ev => {
                    if (captured && ev.clientY != undefined) {
                        ev.preventDefault();
                        this.updateSliderValue(pt, parent, ev);
                    }
                }, ev => {
                    captured = true;
                    if (ev.clientY != undefined) {
                        dragSurface.setAttribute('cursor', '-webkit-grabbing');
                        this.updateSliderValue(pt, parent, ev);
                    }
                }, () => {
                    captured = false;
                    dragSurface.setAttribute('cursor', '-webkit-grab');
                });
                return this.group;
            }
            getGradientDefinition() {
                return {
                    stops: [
                        { offset: 0, color: '#626262' },
                        { offset: 100, color: "#ddd" }
                    ]
                };
            }
        }
        ProximitySliderControl.SLIDER_HANDLE_HEIGHT = 26;
        ProximitySliderControl.SLIDER_SIDE_PADDING = 6;
        visuals.ProximitySliderControl = ProximitySliderControl;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        let InfraredRemoteButton;
        (function (InfraredRemoteButton) {
            InfraredRemoteButton[InfraredRemoteButton["CenterBeacon"] = 1] = "CenterBeacon";
            InfraredRemoteButton[InfraredRemoteButton["TopLeft"] = 2] = "TopLeft";
            InfraredRemoteButton[InfraredRemoteButton["BottomLeft"] = 4] = "BottomLeft";
            InfraredRemoteButton[InfraredRemoteButton["TopRight"] = 8] = "TopRight";
            InfraredRemoteButton[InfraredRemoteButton["BottomRight"] = 16] = "BottomRight";
        })(InfraredRemoteButton || (InfraredRemoteButton = {}));
        class RemoteBeaconButtonsControl extends visuals.ControlView {
            constructor() {
                super(...arguments);
                this.id = Math.random().toString();
            }
            getInnerView() {
                this.group = pxsim.svg.elt("g");
                this.group.setAttribute("transform", `scale(0.9, 0.9)`);
                const xml = pxsim.visuals.normalizeXml(this.id, pxsim.visuals.REMOVE_SVG);
                const content = pxsim.svg.parseString(xml);
                this.group.appendChild(content);
                const btns = {
                    "centerbeacon": InfraredRemoteButton.CenterBeacon,
                    "topleft": InfraredRemoteButton.TopLeft,
                    "topright": InfraredRemoteButton.TopRight,
                    "bottomleft": InfraredRemoteButton.BottomLeft,
                    "bottomright": InfraredRemoteButton.BottomRight
                };
                Object.keys(btns).forEach(bid => {
                    const cid = btns[bid];
                    const bel = content.getElementById(pxsim.visuals.normalizeId(this.id, bid));
                    bel.setAttribute("class", "sim-button");
                    pxsim.pointerEvents.down.forEach(evid => bel.addEventListener(evid, ev => {
                        pxsim.ev3board().remoteState.setPressed(cid, true);
                    }));
                    bel.addEventListener(pxsim.pointerEvents.leave, ev => {
                        pxsim.ev3board().remoteState.setPressed(cid, false);
                    });
                    bel.addEventListener(pxsim.pointerEvents.up, ev => {
                        pxsim.ev3board().remoteState.setPressed(cid, false);
                    });
                });
                return this.group;
            }
            getInnerWidth() {
                return 80;
            }
            getInnerHeight() {
                return 123.773;
            }
        }
        visuals.RemoteBeaconButtonsControl = RemoteBeaconButtonsControl;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        const MAX_RATE = 40;
        class RotationSliderControl extends visuals.ControlView {
            //private static SLIDER_HEIGHT = 78;
            getInnerView(parent, globalDefs) {
                this.group = pxsim.svg.elt("g");
                const sliderGroup = pxsim.svg.child(this.group, "g");
                sliderGroup.setAttribute("transform", `translate(10,0)`);
                const rotationLine = pxsim.svg.child(sliderGroup, "g");
                pxsim.svg.child(rotationLine, "path", { 'transform': 'translate(7.11 -31.1)', 'd': 'M68.71,99.5l6.1-8S61.3,79.91,42.69,78.35,12,83.14,6.49,85.63a48.69,48.69,0,0,0-9.6,5.89L3.16,99.3S19.27,87.7,37.51,87.94,68.71,99.5,68.71,99.5Z', 'style': 'fill: #626262' });
                this.slider = pxsim.svg.child(sliderGroup, "g");
                const handleInner = pxsim.svg.child(sliderGroup, "g");
                pxsim.svg.child(this.slider, "circle", { 'cx': 9, 'cy': 50, 'r': 13, 'style': 'fill: #f12a21' });
                pxsim.svg.child(this.slider, "circle", { 'cx': 9, 'cy': 50, 'r': 12.5, 'style': 'fill: none;stroke: #b32e29' });
                this.rateText = pxsim.svg.child(this.group, "text", {
                    'x': this.getInnerWidth() / 2,
                    'y': RotationSliderControl.SLIDER_WIDTH * 1.2,
                    'text-anchor': 'middle', 'dominant-baseline': 'middle',
                    'style': 'font-size: 16px',
                    'class': 'sim-text inverted number'
                });
                const dragSurface = pxsim.svg.child(this.group, "rect", {
                    x: 0,
                    y: 0,
                    width: this.getInnerWidth(),
                    height: this.getInnerHeight(),
                    opacity: 0,
                    cursor: '-webkit-grab'
                });
                let pt = parent.createSVGPoint();
                let captured = false;
                visuals.touchEvents(dragSurface, ev => {
                    if (captured && ev.clientX != undefined) {
                        ev.preventDefault();
                        this.updateSliderValue(pt, parent, ev);
                    }
                }, ev => {
                    captured = true;
                    if (ev.clientX != undefined) {
                        this.updateSliderValue(pt, parent, ev);
                    }
                }, () => {
                    captured = false;
                });
                return this.group;
            }
            getInnerWidth() {
                return RotationSliderControl.SLIDER_WIDTH * 1.5;
            }
            updateState() {
                if (!this.visible) {
                    return;
                }
                const node = this.state;
                const rate = node.getRate();
                this.rateText.textContent = `${rate}°/s`;
                // cap rate at 40deg/s
                const percentage = 50 + Math.sign(rate) * Math.min(MAX_RATE, Math.abs(rate)) / MAX_RATE * 50;
                const x = RotationSliderControl.SLIDER_WIDTH * percentage / 100;
                const y = Math.abs((percentage - 50) / 50) * 10;
                this.slider.setAttribute("transform", `translate(${x}, ${y})`);
            }
            updateSliderValue(pt, parent, ev) {
                let cur = pxsim.svg.cursorPoint(pt, parent, ev);
                const width = visuals.CONTROL_WIDTH; //DistanceSliderControl.SLIDER_HEIGHT;
                const bBox = this.content.getBoundingClientRect();
                let t = Math.max(0, Math.min(1, (width + bBox.left / this.scaleFactor - cur.x / this.scaleFactor) / width));
                t = -(t - 0.5) * 2; // [-1,1]
                const state = this.state;
                state.setRate(MAX_RATE * t);
            }
        }
        RotationSliderControl.SLIDER_WIDTH = 70;
        visuals.RotationSliderControl = RotationSliderControl;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./moduleView.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class BrickView extends visuals.ModuleView {
            constructor(xml, prefix, port) {
                super(xml, prefix, pxsim.NodeType.Brick, port);
                this.currentCanvasX = 178;
                this.currentCanvasY = 128;
                this.btnids = [];
                this.lastLightPattern = -1;
                this.lastLightAnimationId = undefined;
                this.pulse = 0;
            }
            buildDomCore() {
                // Setup buttons
                this.buttons = this.btnids.map(n => this.content.getElementById(this.normalizeId(n)));
                this.buttons.forEach(b => pxsim.U.addClass(b, "sim-button"));
                this.light = this.content.getElementById(this.normalizeId(BrickView.EV3_LIGHT_ID));
            }
            optimizeForLightMode() {
                this.content.getElementById(this.normalizeId('ev3_body_2')).style.fill = '#f1f1f1';
                this.content.getElementById(this.normalizeId('ev3_screen_grey')).style.fill = '#a8aaa8';
                this.content.getElementById(this.normalizeId('ev3_grey_buttom')).style.fill = '#a8aaa8';
                this.content.getElementById(this.normalizeId('btn_part_2')).style.fill = '#393939';
            }
            setStyleFill(svgId, fillUrl, lightFill) {
                const el = this.content.getElementById(svgId);
                if (el)
                    el.style.fill = pxsim.inLightMode() ? lightFill || BrickView.LIGHT_BLACK_COLOR : `url("#${fillUrl}")`;
            }
            hasClick() {
                return false;
            }
            updateState() {
                this.updateLight();
            }
            updateThemeCore() {
                let theme = this.theme;
                // svg.fill(this.buttons[0], theme.buttonUps[0]);
                // svg.fill(this.buttons[1], theme.buttonUps[1]);
                // svg.fill(this.buttons[2], theme.buttonUps[2]);
            }
            updateLight() {
                let state = pxsim.ev3board().getBrickNode().lightState;
                const lightPattern = state.lightPattern;
                if (lightPattern == this.lastLightPattern)
                    return;
                this.lastLightPattern = lightPattern;
                if (this.lastLightAnimationId) {
                    cancelAnimationFrame(this.lastLightAnimationId);
                    delete this.lastLightAnimationId;
                }
                switch (lightPattern) {
                    case 0: // LED_BLACK
                        this.setStyleFill(this.normalizeId(BrickView.EV3_LIGHT_ID), this.normalizeId(`linear-gradient-black`));
                        //svg.fill(this.light, "#FFF");
                        break;
                    case 1: // LED_GREEN
                        this.setStyleFill(this.normalizeId(BrickView.EV3_LIGHT_ID), this.normalizeId(`linear-gradient-green`), 'green');
                        //svg.fill(this.light, "#00ff00");
                        break;
                    case 2: // LED_RED
                        this.setStyleFill(this.normalizeId(BrickView.EV3_LIGHT_ID), this.normalizeId(`linear-gradient-red`), 'red');
                        //svg.fill(this.light, "#ff0000");
                        break;
                    case 3: // LED_ORANGE
                        this.setStyleFill(this.normalizeId(BrickView.EV3_LIGHT_ID), this.normalizeId(`linear-gradient-orange`), 'orange');
                        //svg.fill(this.light, "#FFA500");
                        break;
                    case 4: // LED_GREEN_FLASH
                        this.flashLightAnimation('green');
                        break;
                    case 5: // LED_RED_FLASH
                        this.flashLightAnimation('red');
                        break;
                    case 6: // LED_ORANGE_FLASH
                        this.flashLightAnimation('orange');
                        break;
                    case 7: // LED_GREEN_PULSE
                        this.pulseLightAnimation('green');
                        break;
                    case 8: // LED_RED_PULSE
                        this.pulseLightAnimation('red');
                        break;
                    case 9: // LED_ORANGE_PULSE
                        this.pulseLightAnimation('orange');
                        break;
                }
            }
            flashLightAnimation(id) {
                const pattern = this.lastLightPattern;
                let fps = 3;
                let now;
                let then = Date.now();
                let interval = 1000 / fps;
                let delta;
                let that = this;
                function draw() {
                    if (that.lastLightPattern != pattern)
                        return;
                    that.lastLightAnimationId = requestAnimationFrame(draw);
                    now = pxsim.U.now();
                    delta = now - then;
                    if (delta > interval) {
                        then = now - (delta % interval);
                        that.flashLightAnimationStep(id);
                    }
                }
                draw();
            }
            flashLightAnimationStep(id) {
                if (this.flash) {
                    this.setStyleFill(this.normalizeId(BrickView.EV3_LIGHT_ID), this.normalizeId(`linear-gradient-${id}`), id);
                }
                else {
                    this.setStyleFill(this.normalizeId(BrickView.EV3_LIGHT_ID), this.normalizeId(`linear-gradient-black`));
                }
                this.flash = !this.flash;
            }
            pulseLightAnimation(id) {
                const pattern = this.lastLightPattern;
                let fps = 8;
                let now;
                let then = Date.now();
                let interval = 1000 / fps;
                let delta;
                let that = this;
                function draw() {
                    if (that.lastLightPattern != pattern)
                        return;
                    that.lastLightAnimationId = requestAnimationFrame(draw);
                    now = pxsim.U.now();
                    delta = now - then;
                    if (delta > interval) {
                        // update time stuffs
                        then = now - (delta % interval);
                        that.pulseLightAnimationStep(id);
                    }
                }
                draw();
            }
            pulseLightAnimationStep(id) {
                switch (this.pulse) {
                    case 1:
                        this.setStyleFill(this.normalizeId(BrickView.EV3_LIGHT_ID), this.normalizeId(`linear-gradient-black`));
                        break;
                    case 2:
                        this.setStyleFill(this.normalizeId(BrickView.EV3_LIGHT_ID), this.normalizeId(`linear-gradient-black`));
                        break;
                    case 3:
                        this.setStyleFill(this.normalizeId(BrickView.EV3_LIGHT_ID), this.normalizeId(`linear-gradient-black`));
                        break;
                    case 4:
                        this.setStyleFill(this.normalizeId(BrickView.EV3_LIGHT_ID), this.normalizeId(`linear-gradient-black`));
                        break;
                    case 5:
                        this.setStyleFill(this.normalizeId(BrickView.EV3_LIGHT_ID), this.normalizeId(`linear-gradient-${id}`), id);
                        break;
                    case 6:
                        this.setStyleFill(this.normalizeId(BrickView.EV3_LIGHT_ID), this.normalizeId(`linear-gradient-${id}`), id);
                        break;
                    case 7:
                        this.setStyleFill(this.normalizeId(BrickView.EV3_LIGHT_ID), this.normalizeId(`linear-gradient-black`));
                        break;
                    case 8:
                        this.setStyleFill(this.normalizeId(BrickView.EV3_LIGHT_ID), this.normalizeId(`linear-gradient-${id}`), id);
                        break;
                }
                this.pulse++;
                if (this.pulse == 9)
                    this.pulse = 0;
            }
            kill() {
                cancelAnimationFrame(this.lastLightAnimationId);
            }
            attachEvents() {
                let bpState = pxsim.ev3board().getBrickNode().buttonState;
                let stateButtons = bpState.buttons;
                this.buttons.forEach((btn, index) => {
                    let button = stateButtons[index];
                    pxsim.pointerEvents.down.forEach(evid => btn.addEventListener(evid, ev => {
                        button.setPressed(true);
                        pxsim.svg.fill(this.buttons[index], this.theme.buttonDown);
                    }));
                    btn.addEventListener(pxsim.pointerEvents.leave, ev => {
                        button.setPressed(false);
                        pxsim.svg.fill(this.buttons[index], this.theme.buttonUps[index]);
                    });
                    btn.addEventListener(pxsim.pointerEvents.up, ev => {
                        button.setPressed(false);
                        pxsim.svg.fill(this.buttons[index], this.theme.buttonUps[index]);
                    });
                });
            }
            getScreenBBox() {
                if (!this.content)
                    return undefined;
                const screen = this.content.getElementById(this.normalizeId(BrickView.EV3_SCREEN_ID));
                if (!screen)
                    return undefined;
                return screen.getBoundingClientRect();
            }
        }
        BrickView.EV3_SCREEN_ID = "ev3_screen";
        BrickView.EV3_LIGHT_ID = "btn_color";
        BrickView.LIGHT_BLACK_COLOR = '#6a6a6a';
        visuals.BrickView = BrickView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./moduleView.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class BrickViewLandscape extends visuals.BrickView {
            constructor(port) {
                super(visuals.EV3_LANDSCAPE_SVG, "board-land", port);
                this.btnids = ["btn_up", "btn_enter", "btn_down", "btn_right", "btn_left"];
            }
            updateDimensions(width, height) {
                if (this.content) {
                    const currentWidth = this.getInnerWidth();
                    const currentHeight = this.getInnerHeight();
                    const newHeight = currentHeight / currentWidth * width;
                    const newWidth = currentWidth / currentHeight * height;
                    this.content.setAttribute('width', `${height > width ? width : newWidth}`);
                    this.content.setAttribute('height', `${height > width ? newHeight : height}`);
                }
            }
        }
        visuals.BrickViewLandscape = BrickViewLandscape;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./moduleView.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class BrickViewPortrait extends visuals.BrickView {
            constructor(port) {
                super(visuals.EV3_SVG, "board", port);
                this.btnids = ["btn_up", "btn_enter", "btn_down", "btn_right", "btn_left", "btn_back"];
            }
        }
        visuals.BrickViewPortrait = BrickViewPortrait;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./moduleView.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class SensorView extends visuals.ModuleView {
            constructor(xml, prefix, id, port) {
                super(xml, prefix, id, port);
                // Shown by default
                this.selected = true;
            }
            fadeWhenSelected() {
                return false;
            }
            hasBackground() {
                return true;
            }
        }
        visuals.SensorView = SensorView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./sensorView.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class ColorSensorView extends visuals.SensorView {
            constructor(port) {
                super(pxsim.COLOR_SENSOR_SVG, "color", pxsim.NodeType.ColorSensor, port);
            }
            optimizeForLightMode() {
                this.content.getElementById(this.normalizeId('color_bigbox-2_path')).style.fill = '#a8aaa8';
            }
            getPaddingRatio() {
                return 1 / 4;
            }
            updateState() {
                super.updateState();
                const colorState = pxsim.ev3board().getInputNodes()[this.port];
                if (!colorState)
                    return;
                const mode = colorState.getMode();
                switch (mode) {
                    case pxsim.ColorSensorMode.Colors:
                        this.updateSensorLightVisual('#0062DD');
                        return; // blue
                    case pxsim.ColorSensorMode.RgbRaw:
                        this.updateSensorLightVisual('#0062DD');
                        return; // blue
                    case pxsim.ColorSensorMode.Reflected:
                        this.updateSensorLightVisual('#F86262');
                        return; // red
                    case pxsim.ColorSensorMode.RefRaw:
                        this.updateSensorLightVisual('#F86262');
                        return; // red
                    case pxsim.ColorSensorMode.Ambient:
                        this.updateSensorLightVisual('#67C3E2');
                        return; // light blue
                }
                this.updateSensorLightVisual('#ffffff');
            }
            updateSensorLightVisual(color) {
                const sensorHole = this.content.getElementById(this.normalizeId(ColorSensorView.sensor_hole_id));
                sensorHole.style.stroke = color;
                if (color != '#ffffff') {
                    sensorHole.style.strokeWidth = '2px';
                }
            }
        }
        ColorSensorView.sensor_hole_id = 'color_sensor_white_big';
        visuals.ColorSensorView = ColorSensorView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./sensorView.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class GyroSensorView extends visuals.SensorView {
            constructor(port) {
                super(pxsim.GYRO_SVG, "gyro", pxsim.NodeType.GyroSensor, port);
            }
            optimizeForLightMode() {
                this.content.getElementById(this.normalizeId('gyro_white_1')).style.fill = '#7B7B7B';
                this.content.getElementById(this.normalizeId('gyro_white_small_path')).style.fill = '#7B7B7B';
            }
            getPaddingRatio() {
                return 0.3;
            }
        }
        visuals.GyroSensorView = GyroSensorView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./moduleView.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class InfraredView extends visuals.SensorView {
            constructor(port) {
                super(pxsim.INFRARED_SVG, "infrared", pxsim.NodeType.InfraredSensor, port);
            }
            optimizeForLightMode() {
                this.content.getElementById(this.normalizeId('path9245')).style.fill = '#f2f2f2';
            }
        }
        visuals.InfraredView = InfraredView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./moduleView.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class MotorView extends visuals.ModuleView {
            constructor(xml, prefix, id, port, rotating_hole_id) {
                super(xml, prefix, id, port);
                this.rotating_hole_id = rotating_hole_id;
            }
            updateState() {
                super.updateState();
                const motorState = pxsim.ev3board().getMotors()[this.port];
                if (!motorState)
                    return;
                const speed = motorState.getSpeed();
                this.setMotorAngle(motorState.getAngle() % 360);
                this.setMotorLabel(speed);
            }
            setMotorAngle(angle) {
                const holeEl = this.content.getElementById(this.normalizeId(this.rotating_hole_id));
                this.renderMotorAngle(holeEl, angle);
            }
            getWiringRatio() {
                return 0.37;
            }
            setMotorLabel(speed, force) {
                if (!force && this.currentLabel === `${speed}`)
                    return;
                this.currentLabel = `${speed}`;
                if (!this.motorLabel) {
                    this.motorLabelGroup = pxsim.svg.child(this.content, "g");
                    this.motorLabel = pxsim.svg.child(this.motorLabelGroup, "text", { 'text-anchor': 'middle', 'x': '0', 'y': '0', 'class': 'sim-text number inverted' });
                }
                this.motorLabel.textContent = `${this.currentLabel}%`;
                this.positionMotorLabel();
            }
        }
        visuals.MotorView = MotorView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./moduleView.ts" />
/// <reference path="./motorView.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class LargeMotorView extends visuals.MotorView {
            constructor(port) {
                super(pxsim.LARGE_MOTOR_SVG, "large-motor", pxsim.NodeType.LargeMotor, port, "hole");
            }
            updateState() {
                super.updateState();
                const motorState = pxsim.ev3board().getMotors()[this.port];
                if (!motorState)
                    return;
                const syncedMotor = motorState.getSynchedMotor();
                if ((syncedMotor || this.syncedMotor) && syncedMotor != this.syncedMotor) {
                    this.syncedMotor = syncedMotor;
                    if (this.syncedMotor) {
                        this.showSyncedLabel(motorState, syncedMotor);
                    }
                    else if (this.syncedLabelG) {
                        this.syncedLabelG.parentNode.removeChild(this.syncedLabelG);
                    }
                    this.setMotorLabel(motorState.getSpeed(), true);
                }
                this.setMotorLabel(motorState.getSpeed());
            }
            showSyncedLabel(motorNode, syncedMotor) {
                const a = String.fromCharCode('A'.charCodeAt(0) + motorNode.port);
                const b = String.fromCharCode('A'.charCodeAt(0) + syncedMotor.port);
                this.syncedLabelG = pxsim.svg.child(this.element, 'g', { 'transform': 'scale(0.5)' });
                pxsim.svg.child(this.syncedLabelG, 'rect', { 'rx': 15, 'ry': 15, 'x': 0, 'y': 0, 'width': 84, 'height': 34, 'fill': '#A8A9A8' });
                pxsim.svg.child(this.syncedLabelG, 'circle', { 'cx': 17, 'cy': 17, 'r': 15, 'fill': 'white' });
                const leftLabel = pxsim.svg.child(this.syncedLabelG, 'text', { 'transform': 'translate(11, 22)', 'class': 'no-drag', 'style': 'isolation: isolate;font-size: 16px;fill: #A8A9A8;font-family: ArialMT, Arial' });
                leftLabel.textContent = a;
                pxsim.svg.child(this.syncedLabelG, 'rect', { 'rx': 0, 'ry': 0, 'x': 37, 'y': 12, 'width': 10, 'height': 3, 'fill': '#ffffff' });
                pxsim.svg.child(this.syncedLabelG, 'rect', { 'rx': 0, 'ry': 0, 'x': 37, 'y': 18, 'width': 10, 'height': 3, 'fill': '#ffffff' });
                pxsim.svg.child(this.syncedLabelG, 'circle', { 'cx': 67, 'cy': 17, 'r': 15, 'fill': 'white' });
                const rightLabel = pxsim.svg.child(this.syncedLabelG, 'text', { 'transform': 'translate(61, 22)', 'class': 'no-drag', 'style': 'isolation: isolate;font-size: 16px;fill: #A8A9A8;font-family: ArialMT, Arial' });
                rightLabel.textContent = b;
            }
            renderMotorAngle(holeEl, angle) {
                const width = 35.92;
                const height = 35.9;
                const transform = `translate(45.000000, 1.000000) rotate(${angle} ${width / 2} ${height / 2})`;
                holeEl.setAttribute("transform", transform);
            }
            getWiringRatio() {
                return 0.37;
            }
            positionMotorLabel() {
                const hasSyncedLabel = this.syncedMotor;
                this.motorLabelGroup.setAttribute('transform', `translate(${hasSyncedLabel ? '15 35' : '25 15'})`);
                this.motorLabel.style.fontSize = '13px';
            }
        }
        visuals.LargeMotorView = LargeMotorView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./moduleView.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class MediumMotorView extends visuals.MotorView {
            constructor(port) {
                super(visuals.MEDIUM_MOTOR_SVG, "medium-motor", pxsim.NodeType.MediumMotor, port, "medmotor_Hole");
            }
            optimizeForLightMode() {
                this.content.getElementById(this.normalizeId('medmotor_box_wgradient')).style.fill = '#a8aaa8';
            }
            getPaddingRatio() {
                return 1 / 8;
            }
            getWiringRatio() {
                return 0.5;
            }
            renderMotorAngle(holeEl, angle) {
                const width = 44.45;
                const height = 44.45;
                const transform = `translate(2 1.84) rotate(${angle} ${width / 2} ${height / 2})`;
                holeEl.setAttribute("transform", transform);
            }
            positionMotorLabel() {
                this.motorLabelGroup.setAttribute('transform', 'translate(25 13)');
                this.motorLabel.style.fontSize = '11px';
            }
        }
        visuals.MediumMotorView = MediumMotorView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./sensorView.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class NXTLightSensorView extends visuals.SensorView {
            constructor(port) {
                super(pxsim.NXT_LIGHT_SENSOR_SVG, "color", pxsim.NodeType.NXTLightSensor, port);
            }
            optimizeForLightMode() {
                this.content.getElementById(this.normalizeId('box')).style.fill = '#a8aaa8';
            }
            getPaddingRatio() {
                return 1 / 4;
            }
            updateState() {
                super.updateState();
                const lightState = pxsim.ev3board().getInputNodes()[this.port];
                if (!lightState)
                    return;
                const mode = lightState.getMode();
                if (mode == pxsim.NXTLightSensorMode.ReflectedLightRaw || mode == pxsim.NXTLightSensorMode.ReflectedLight) {
                    this.updateSensorLightVisual('#eb0c0c');
                }
            }
            updateSensorLightVisual(color) {
                const sensorHole = this.content.getElementById(this.normalizeId(NXTLightSensorView.sensor_hole_id));
                sensorHole.style.stroke = color;
                if (color != '#ffffff') {
                    sensorHole.style.strokeWidth = '2px';
                }
            }
        }
        NXTLightSensorView.sensor_hole_id = 'led';
        visuals.NXTLightSensorView = NXTLightSensorView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./moduleView.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class TouchSensorView extends visuals.ModuleView {
            constructor(port) {
                super(visuals.TOUCH_SENSOR_SVG, "touch", pxsim.NodeType.TouchSensor, port);
            }
            optimizeForLightMode() {
                this.content.getElementById(this.normalizeId('touch_box_2-2')).style.fill = '#a8aaa8';
            }
            getPaddingRatio() {
                return 1 / 4;
            }
            hasClick() {
                return false;
            }
            setAttribute(svgId, attribute, value) {
                const el = this.content.getElementById(svgId);
                if (el)
                    el.setAttribute(attribute, value);
            }
            setStyleFill(svgId, fillUrl, lightFill) {
                const el = this.content.getElementById(svgId);
                if (el)
                    el.style.fill = pxsim.inLightMode() ? lightFill : `url("#${fillUrl}")`;
            }
            attachEvents() {
                this.content.style.cursor = "pointer";
                const btn = this.content;
                const state = pxsim.ev3board().getSensor(this.port, 16 /* DAL.DEVICE_TYPE_TOUCH */);
                pxsim.pointerEvents.down.forEach(evid => btn.addEventListener(evid, ev => {
                    this.setPressed(true);
                    state.setPressed(true);
                }));
                btn.addEventListener(pxsim.pointerEvents.leave, ev => {
                    this.setPressed(false);
                    state.setPressed(false);
                });
                btn.addEventListener(pxsim.pointerEvents.up, ev => {
                    this.setPressed(false);
                    state.setPressed(false);
                });
            }
            setPressed(pressed) {
                if (pressed) {
                    for (let i = 0; i < 4; i++) {
                        this.setStyleFill(`${this.normalizeId(TouchSensorView.RECT_ID[i])}`, `${this.normalizeId(TouchSensorView.TOUCH_GRADIENT_PRESSED[i])}`, TouchSensorView.LIGHT_TOUCH_BLACK_COLOR);
                    }
                }
                else {
                    for (let i = 0; i < 4; i++) {
                        this.setStyleFill(`${this.normalizeId(TouchSensorView.RECT_ID[i])}`, `${this.normalizeId(TouchSensorView.TOUCH_GRADIENT_UNPRESSED[i])}`, TouchSensorView.LIGHT_TOUCH_RED_COLOR);
                    }
                }
            }
        }
        TouchSensorView.RECT_ID = ["touch_gradient4", "touch_gradient3", "touch_gradient2", "touch_gradient1"];
        TouchSensorView.TOUCH_GRADIENT_UNPRESSED = ["linear-gradient-2", "linear-gradient-3", "linear-gradient-4", "linear-gradient-5"];
        TouchSensorView.TOUCH_GRADIENT_PRESSED = ["linear-gradient-6", "linear-gradient-7", "linear-gradient-8", "linear-gradient-9"];
        TouchSensorView.LIGHT_TOUCH_BLACK_COLOR = '#000';
        TouchSensorView.LIGHT_TOUCH_RED_COLOR = '#d42715';
        visuals.TouchSensorView = TouchSensorView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
/// <reference path="./sensorView.ts" />
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        class UltrasonicSensorView extends visuals.SensorView {
            constructor(port) {
                super(pxsim.ULTRASONIC_SVG, "ultrasonic", pxsim.NodeType.UltrasonicSensor, port);
            }
        }
        visuals.UltrasonicSensorView = UltrasonicSensorView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
