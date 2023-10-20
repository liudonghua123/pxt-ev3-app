"use strict";
/// <reference path="../node_modules/pxt-core/localtypings/blockly.d.ts"/>
/// <reference path="../node_modules/pxt-core/built/pxtblocks.d.ts"/>
/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldPorts = void 0;
class FieldPorts extends pxtblockly.FieldImages {
    constructor(text, options, validator) {
        super(text, { blocksInfo: options.blocksInfo, sort: true, data: options.data }, validator);
        this.isFieldCustom_ = true;
        this.buttonClick_ = function (e) {
            let value = e.target.getAttribute('data-value');
            this.setValue(value);
            Blockly.DropDownDiv.hide();
        };
        this.columns_ = parseInt(options.columns) || 4;
        this.width_ = parseInt(options.width) || 300;
        //this.setText = Blockly.FieldDropdown.prototype.setText;
        this.updateSize_ = Blockly.Field.prototype.updateSize_;
    }
    trimOptions_() {
    }
}
exports.FieldPorts = FieldPorts;
