"use strict";
/// <reference path="../node_modules/pxt-core/localtypings/pxtarget.d.ts" />
/// <reference path="../node_modules/pxt-core/built/pxtblocks.d.ts" />
/// <reference path="../node_modules/pxt-core/built/pxtcompiler.d.ts" />
/// <reference path="../node_modules/pxt-core/built/pxtlib.d.ts" />
/// <reference path="../node_modules/pxt-core/built/pxteditor.d.ts"/>
/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectView = void 0;
const deploy_1 = require("./deploy");
const dialogs_1 = require("./dialogs");
pxt.editor.initExtensionsAsync = function (opts) {
    pxt.debug('loading pxt-ev3 target extensions...');
    exports.projectView = opts.projectView;
    const res = {
        deployAsync: deploy_1.deployCoreAsync,
        showUploadInstructionsAsync: dialogs_1.showUploadDialogAsync
    };
    (0, deploy_1.initAsync)().catch(e => {
        // probably no HID - we'll try this again upon deployment
    });
    return Promise.resolve(res);
};
