"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showUploadDialogAsync = exports.bluetoothTryAgainAsync = void 0;
const React = require("react");
const deploy_1 = require("./deploy");
const extension_1 = require("./extension");
let confirmAsync;
function bluetoothTryAgainAsync() {
    return confirmAsync({
        header: lf("Bluetooth download failed..."),
        jsx: React.createElement("ul", null,
            React.createElement("li", null, lf("Make sure to stop your program or exit portview on the EV3.")),
            React.createElement("li", null, lf("Check your battery level.")),
            React.createElement("li", null, lf("Close EV3 LabView or other MakeCode editor tabs."))),
        hasCloseIcon: false,
        hideCancel: true,
        hideAgree: false,
        agreeLbl: lf("Try again")
    }).then(r => { });
}
exports.bluetoothTryAgainAsync = bluetoothTryAgainAsync;
function enableWebSerialAndCompileAsync() {
    return (0, deploy_1.enableWebSerialAsync)()
        .then(() => pxt.U.delay(500))
        .then(() => extension_1.projectView.compile());
}
let bluetoothDialogShown = false;
function explainWebSerialPairingAsync() {
    if (!confirmAsync || bluetoothDialogShown)
        return Promise.resolve();
    bluetoothDialogShown = true;
    return confirmAsync({
        header: lf("Bluetooth pairing"),
        hasCloseIcon: false,
        hideCancel: true,
        buttons: [{
                label: lf("Help"),
                icon: "question circle",
                className: "lightgrey",
                url: "/bluetooth"
            }],
        jsx: React.createElement("p", null,
            lf("You will be prompted to select a serial port."),
            pxt.BrowserUtils.isWindows()
                ? lf("Look for 'Standard Serial over Bluetooth link'.")
                : lf("Loop for 'cu.EV3-SerialPort'."),
            lf("If you have paired multiple EV3, you might have to try out multiple ports until you find the correct one."))
    }).then(() => { });
}
function showUploadDialogAsync(fn, url, _confirmAsync) {
    confirmAsync = _confirmAsync;
    // https://msdn.microsoft.com/en-us/library/cc848897.aspx
    // "For security reasons, data URIs are restricted to downloaded resources.
    // Data URIs cannot be used for navigation, for scripting, or to populate frame or iframe elements"
    const downloadAgain = !pxt.BrowserUtils.isIE() && !pxt.BrowserUtils.isEdge();
    const docUrl = (pxt.appTarget.appTheme.usbDocs ? pxt.appTarget.appTheme.usbDocs : false);
    const jsx = React.createElement("div", { className: "ui grid stackable" },
        React.createElement("div", { className: "column five wide", style: { backgroundColor: "#E2E2E2" } },
            React.createElement("div", { className: "ui header" }, lf("First time here?")),
            React.createElement("strong", { style: { fontSize: "small" } }, lf("You must have version 1.10E or above of the firmware")),
            React.createElement("div", { style: { justifyContent: "center", display: "flex", padding: "1rem" } },
                React.createElement("img", { className: "ui image", src: "/static/download/firmware.png", style: { height: "100px" } })),
            React.createElement("a", { href: "/troubleshoot", target: "_blank" }, lf("Check your firmware version here and update if needed"))),
        React.createElement("div", { className: "column eleven wide" },
            React.createElement("div", { className: "ui grid" },
                React.createElement("div", { className: "row" },
                    React.createElement("div", { className: "column" },
                        React.createElement("div", { className: "ui two column grid padded" },
                            React.createElement("div", { className: "column" },
                                React.createElement("div", { className: "ui" },
                                    React.createElement("div", { className: "image" },
                                        React.createElement("img", { className: "ui medium rounded image", src: "/static/download/connect.svg", style: { height: "109px", width: "261px", marginBottom: "1rem" } })),
                                    React.createElement("div", { className: "content" },
                                        React.createElement("div", { className: "description" },
                                            React.createElement("span", { className: "ui yellow circular label" }, "1"),
                                            React.createElement("strong", null, lf("Connect the EV3 to your computer with a USB cable")),
                                            React.createElement("br", null),
                                            React.createElement("span", { style: { fontSize: "small" } }, lf("Use the miniUSB port on the top of the EV3 Brick")))))),
                            React.createElement("div", { className: "column" },
                                React.createElement("div", { className: "ui" },
                                    React.createElement("div", { className: "image" },
                                        React.createElement("img", { className: "ui medium rounded image", src: "/static/download/transfer.svg", style: { height: "109px", width: "261px", marginBottom: "1rem" } })),
                                    React.createElement("div", { className: "content" },
                                        React.createElement("div", { className: "description" },
                                            React.createElement("span", { className: "ui yellow circular label" }, "2"),
                                            React.createElement("strong", null, lf("Move the .uf2 file to the EV3 Brick")),
                                            React.createElement("br", null),
                                            React.createElement("span", { style: { fontSize: "small" } }, lf("Locate the downloaded .uf2 file and drag it to the EV3 USB drive"))))))))))));
    return confirmAsync({
        header: lf("Download to your EV3"),
        jsx,
        hasCloseIcon: true,
        hideCancel: true,
        hideAgree: false,
        agreeLbl: lf("I got it"),
        className: 'downloaddialog',
        buttons: [(0, deploy_1.canUseWebSerial)() && {
                label: lf("Bluetooth"),
                icon: "bluetooth",
                className: "bluetooth focused",
                onclick: () => {
                    pxt.tickEvent("bluetooth.enable");
                    explainWebSerialPairingAsync()
                        .then(() => enableWebSerialAndCompileAsync());
                }
            }, downloadAgain && {
                label: fn,
                icon: "download",
                className: "lightgrey focused",
                url,
                fileName: fn
            }, docUrl && {
                label: lf("Help"),
                icon: "help",
                className: "lightgrey",
                url: docUrl
            }]
        //timeout: 20000
    }).then(() => { });
}
exports.showUploadDialogAsync = showUploadDialogAsync;
