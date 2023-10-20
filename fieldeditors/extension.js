"use strict";
/// <reference path="../node_modules/pxt-core/built/pxteditor.d.ts"/>
/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
const field_ports_1 = require("./field_ports");
const field_motors_1 = require("./field_motors");
const field_brickbuttons_1 = require("./field_brickbuttons");
const field_color_1 = require("./field_color");
const field_music_1 = require("./field_music");
pxt.editor.initFieldExtensionsAsync = function (opts) {
    pxt.debug('loading pxt-ev3 target extensions...');
    updateBlocklyShape();
    const res = {
        fieldEditors: [{
                selector: "ports",
                editor: field_ports_1.FieldPorts
            }, {
                selector: "motors",
                editor: field_motors_1.FieldMotors
            }, {
                selector: "brickbuttons",
                editor: field_brickbuttons_1.FieldBrickButtons
            }, {
                selector: "colorenum",
                editor: field_color_1.FieldColorEnum
            }, {
                selector: "music",
                editor: field_music_1.FieldMusic
            }]
    };
    return Promise.resolve(res);
};
/**
 * Update the shape of Blockly blocks with square corners
 */
function updateBlocklyShape() {
    /**
     * Rounded corner radius.
     * @const
     */
    Blockly.BlockSvg.CORNER_RADIUS = 0 * Blockly.BlockSvg.GRID_UNIT;
    /**
     * Inner space between edge of statement input and notch.
     * @const
     */
    Blockly.BlockSvg.STATEMENT_INPUT_INNER_SPACE = 3 * Blockly.BlockSvg.GRID_UNIT;
    /**
     * SVG path for drawing next/previous notch from left to right.
     * @const
     */
    Blockly.BlockSvg.NOTCH_PATH_LEFT = ('l 8,8 ' +
        'h 16 ' +
        'l 8,-8 ');
    /**
     * SVG path for drawing next/previous notch from right to left.
     * @const
     */
    Blockly.BlockSvg.NOTCH_PATH_RIGHT = ('l -8,8 ' +
        'h -16 ' +
        'l -8,-8 ');
    /**
     * SVG start point for drawing the top-left corner.
     * @const
     */
    Blockly.BlockSvg.TOP_LEFT_CORNER_START =
        'm 0,' + 0;
    /**
     * SVG path for drawing the rounded top-left corner.
     * @const
     */
    Blockly.BlockSvg.TOP_LEFT_CORNER =
        'l ' + Blockly.BlockSvg.CORNER_RADIUS + ',0 ';
    /**
     * SVG path for drawing the rounded top-right corner.
     * @const
     */
    Blockly.BlockSvg.TOP_RIGHT_CORNER =
        'l ' + 0 + ',' + Blockly.BlockSvg.CORNER_RADIUS;
    /**
     * SVG path for drawing the rounded bottom-right corner.
     * @const
     */
    Blockly.BlockSvg.BOTTOM_RIGHT_CORNER =
        'l 0,' + Blockly.BlockSvg.CORNER_RADIUS;
    /**
     * SVG path for drawing the rounded bottom-left corner.
     * @const
     */
    Blockly.BlockSvg.BOTTOM_LEFT_CORNER =
        'l -' + Blockly.BlockSvg.CORNER_RADIUS + ',0';
    /**
     * SVG path for drawing the top-left corner of a statement input.
     * @const
     */
    Blockly.BlockSvg.INNER_TOP_LEFT_CORNER =
        'l ' + Blockly.BlockSvg.CORNER_RADIUS + ',-' + 0;
    /**
     * SVG path for drawing the bottom-left corner of a statement input.
     * Includes the rounded inside corner.
     * @const
     */
    Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER =
        'l ' + 0 + ',' + Blockly.BlockSvg.CORNER_RADIUS * 2 +
            'l ' + Blockly.BlockSvg.CORNER_RADIUS + ',' + 0;
    /**
     * Corner radius of the flyout background.
     * @type {number}
     * @const
     */
    Blockly.Flyout.prototype.CORNER_RADIUS = 0;
    /**
     * Margin around the edges of the blocks in the flyout.
     * @type {number}
     * @const
     */
    Blockly.Flyout.prototype.MARGIN = 8;
}
// When require()d from node, bind the global pxt namespace
// namespace pxt {
//     export const dummyExport = 1;
// }
// eval("if (typeof process === 'object' && process + '' === '[object process]') pxt = global.pxt")
