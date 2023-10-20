(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"./field_brickbuttons":2,"./field_color":3,"./field_motors":4,"./field_music":5,"./field_ports":6}],2:[function(require,module,exports){
"use strict";
/// <reference path="../node_modules/pxt-core/localtypings/blockly.d.ts"/>
/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldBrickButtons = void 0;
class FieldBrickButtons extends Blockly.FieldDropdown {
    constructor(text, options, validator) {
        super(options.data);
        this.isFieldCustom_ = true;
        /**
         * Callback for when a button is clicked inside the drop-down.
         * Should be bound to the FieldIconMenu.
         * @param {Event} e DOM event for the click/touch
         * @private
         */
        this.buttonClick_ = function (e) {
            let value = e.target.getAttribute('data-value');
            this.setValue(value);
            Blockly.DropDownDiv.hide();
        };
        /**
         * Callback for when the drop-down is hidden.
         */
        this.onHide_ = function () {
            const content = Blockly.DropDownDiv.getContentDiv();
            content.removeAttribute('role');
            content.removeAttribute('aria-haspopup');
            content.removeAttribute('aria-activedescendant');
            content.style.width = '';
            // Update color (deselect) on dropdown hide
            let source = this.sourceBlock_;
            if (source === null || source === void 0 ? void 0 : source.isShadow()) {
                source.setColour(this.savedPrimary_);
            }
            else if (this.borderRect_) {
                this.borderRect_.setAttribute('fill', this.savedPrimary_);
            }
        };
        this.columns_ = parseInt(options.columns) || 4;
        this.width_ = parseInt(options.width) || 150;
    }
    /**
     * Create a dropdown menu under the text.
     * @private
     */
    showEditor_() {
        // If there is an existing drop-down we own, this is a request to hide the drop-down.
        if (Blockly.DropDownDiv.hideIfOwner(this)) {
            return;
        }
        // If there is an existing drop-down someone else owns, hide it immediately and clear it.
        Blockly.DropDownDiv.hideWithoutAnimation();
        Blockly.DropDownDiv.clearContent();
        // Populate the drop-down with the icons for this field.
        let dropdownDiv = Blockly.DropDownDiv.getContentDiv();
        let contentDiv = document.createElement('div');
        // Accessibility properties
        contentDiv.setAttribute('role', 'menu');
        contentDiv.setAttribute('aria-haspopup', 'true');
        const buttonsSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        pxsim.svg.hydrate(buttonsSVG, {
            viewBox: "0 0 256.68237 256.68237",
            width: this.width_,
            height: this.width_
        });
        contentDiv.appendChild(buttonsSVG);
        const gWrapper = pxsim.svg.child(buttonsSVG, 'g', { 'transform': 'translate(-4.695057,58.29823)' });
        const gInnerWrapper = pxsim.svg.child(gWrapper, 'g', { 'transform': 'translate(3.9780427e-6,-32.677281)' });
        const back = pxsim.svg.child(gInnerWrapper, 'path', {
            style: 'fill:#6a6a6a;stroke-width:3.91719985',
            d: 'M 106.30882,198.38022 C 84.431262,177.26258 50.453467,142.52878 50.453467,142.52878 v -7.12931 H 37.087971 a 32.381533,32.381533 0 1 1 0,-64.763062 H 50.457376 V 63.503186 L 105.71731,7.0563355 h 55.25604 c 25.02699,25.5048885 55.25994,55.2599395 55.25994,55.2599395 v 8.320133 h 12.77398 a 32.381533,32.381533 0 0 1 0,64.763062 h -12.77398 v 7.13323 c -29.43384,30.27603 -54.66454,55.85144 -54.66454,55.85144 z'
        });
        const buttonLeft = pxsim.svg.child(gInnerWrapper, 'path', {
            style: 'fill:#a8a9a8;stroke-width:3.91719985',
            d: 'm 36.492567,78.357208 h 40.69971 V 126.48393 H 36.492567 A 24.063359,24.063359 0 0 1 12.429199,102.42057 v 0 A 24.063359,24.063359 0 0 1 36.492567,78.357208 Z'
        });
        const buttonRight = pxsim.svg.child(gInnerWrapper, 'path', {
            style: 'fill:#a8a9a8;stroke-width:3.91719985',
            d: 'M 229.00727,126.48784 H 188.30756 V 78.361126 h 40.69971 a 24.063359,24.063359 0 0 1 24.06335,24.063354 v 0 a 24.063359,24.063359 0 0 1 -24.06335,24.06336 z'
        });
        const buttonEnter = pxsim.svg.child(gInnerWrapper, 'path', {
            style: 'fill:#3c3c3c;stroke-width:3.91719985',
            d: 'm 109.27806,78.357208 h 46.9398 a 1.782326,1.782326 0 0 1 1.78233,1.782326 V 124.7016 a 1.782326,1.782326 0 0 1 -1.78233,1.78233 h -46.9398 a 1.782326,1.782326 0 0 1 -1.78233,-1.78233 V 80.139534 a 1.782326,1.782326 0 0 1 1.78233,-1.782326 z'
        });
        const buttonTop = pxsim.svg.child(gInnerWrapper, 'path', {
            style: 'fill:#a8a9a8;stroke-width:3.91719985',
            d: 'm 108.09114,15.967966 49.90905,-0.59542 37.43276,38.619675 -15.44943,15.449437 V 97.367379 H 165.7249 V 81.306861 A 11.978797,11.978797 0 0 0 153.84012,69.422075 c -11.59883,-0.184102 -43.37516,0 -43.37516,0 A 9.6676495,9.6676495 0 0 0 100.36251,79.520618 V 97.347793 H 86.103905 V 69.422075 L 70.654464,53.97264 Z'
        });
        const buttonBottom = pxsim.svg.child(gInnerWrapper, 'path', {
            style: 'fill:#a8a9a8;stroke-width:3.91719985',
            d: 'M 157.78865,189.01028 108.18908,189.38233 70.654464,150.794 86.323259,135.4895 v -28.08625 h 14.101921 v 16.11144 a 12.006218,12.006218 0 0 0 11.85346,11.9788 c 11.59882,0.1841 43.13227,0 43.13227,0 a 10.18472,10.18472 0 0 0 10.38059,-10.38058 v -17.70966 h 14.39179 v 28.08632 l 15.3045,15.3045 z'
        });
        const buttons = [buttonEnter, buttonLeft, buttonRight, buttonTop, buttonBottom];
        const options = this.getOptions();
        for (let i = 0, option; option = options[i]; i++) {
            let content = options[i][0]; // Human-readable text or image.
            const value = options[i][1]; // Language-neutral value.
            const button = buttons[i];
            button.setAttribute('id', ':' + i); // For aria-activedescendant
            button.setAttribute('role', 'menuitem');
            button.setAttribute('cursor', 'pointer');
            const title = pxsim.svg.child(button, 'title');
            title.textContent = content;
            Blockly.bindEvent_(button, 'click', this, this.buttonClick_);
            Blockly.bindEvent_(button, 'mouseup', this, this.buttonClick_);
            // These are applied manually instead of using the :hover pseudoclass
            // because Android has a bad long press "helper" menu and green highlight
            // that we must prevent with ontouchstart preventDefault
            Blockly.bindEvent_(button, 'mousedown', button, function (e) {
                this.setAttribute('stroke', '#ffffff');
                e.preventDefault();
            });
            Blockly.bindEvent_(button, 'mouseover', button, function () {
                this.setAttribute('stroke', '#ffffff');
            });
            Blockly.bindEvent_(button, 'mouseout', button, function () {
                this.setAttribute('stroke', 'transparent');
            });
            button.setAttribute('data-value', value);
        }
        contentDiv.style.width = this.width_ + 'px';
        dropdownDiv.appendChild(contentDiv);
        Blockly.DropDownDiv.setColour('#ffffff', '#dddddd');
        // Position based on the field position.
        Blockly.DropDownDiv.showPositionedByField(this, this.onHide_.bind(this));
        // Update colour to look selected.
        let source = this.sourceBlock_;
        this.savedPrimary_ = source === null || source === void 0 ? void 0 : source.getColour();
        if (source === null || source === void 0 ? void 0 : source.isShadow()) {
            source.setColour(source.getColourTertiary());
        }
        else if (this.borderRect_) {
            this.borderRect_.setAttribute('fill', this.sourceBlock_.getColourTertiary());
        }
    }
}
exports.FieldBrickButtons = FieldBrickButtons;

},{}],3:[function(require,module,exports){
"use strict";
/// <reference path="../node_modules/pxt-core/localtypings/blockly.d.ts"/>
/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldColorEnum = void 0;
class FieldColorEnum extends pxtblockly.FieldColorNumber {
    constructor(text, params, opt_validator) {
        super(text, params, opt_validator);
        this.isFieldCustom_ = true;
        this.paramsData = params["data"];
    }
    mapColour(enumString) {
        switch (enumString) {
            case '#000000': return 'ColorSensorColor.Black';
            case '#006db3': return 'ColorSensorColor.Blue';
            case '#00934b': return 'ColorSensorColor.Green';
            case '#ffd01b': return 'ColorSensorColor.Yellow';
            case '#f12a21': return 'ColorSensorColor.Red';
            case '#ffffff': return 'ColorSensorColor.White';
            case '#6c2d00': return 'ColorSensorColor.Brown';
            default: return 'ColorSensorColor.None';
        }
    }
    mapEnum(colorString) {
        switch (colorString) {
            case 'ColorSensorColor.Black': return '#000000';
            case 'ColorSensorColor.Blue': return '#006db3';
            case 'ColorSensorColor.Green': return '#00934b';
            case 'ColorSensorColor.Yellow': return '#ffd01b';
            case 'ColorSensorColor.Red': return '#f12a21';
            case 'ColorSensorColor.White': return '#ffffff';
            case 'ColorSensorColor.Brown': return '#6c2d00';
            case 'ColorSensorColor.None': return '#dfe6e9';
            default: return colorString;
        }
    }
    showEditor_() {
        super.showEditor_();
        const colorCells = document.querySelectorAll('.legoColorPicker td');
        colorCells.forEach((cell) => {
            const titleName = this.mapColour(cell.getAttribute("title"));
            const index = this.paramsData.findIndex(item => item[1] === titleName);
            cell.setAttribute("title", this.paramsData[index][0]);
        });
    }
    /**
     * Return the current colour.
     * @param {boolean} opt_asHex optional field if the returned value should be a hex
     * @return {string} Current colour in '#rrggbb' format.
     */
    getValue(opt_asHex) {
        const colour = this.mapColour(this.value_);
        if (!opt_asHex && colour.indexOf('#') > -1) {
            return `0x${colour.replace(/^#/, '')}`;
        }
        return colour;
    }
    /**
     * Set the colour.
     * @param {string} colour The new colour in '#rrggbb' format.
     */
    setValue(colorStr) {
        let colour = this.mapEnum(colorStr);
        if (this.sourceBlock_ && Blockly.Events.isEnabled() &&
            this.value_ != colour) {
            Blockly.Events.fire(new Blockly.Events.BlockChange(this.sourceBlock_, 'field', this.name, this.value_, colour));
        }
        this.value_ = colour;
        if (this.sourceBlock_) {
            this.sourceBlock_.setColour(colour);
        }
    }
}
exports.FieldColorEnum = FieldColorEnum;

},{}],4:[function(require,module,exports){
"use strict";
/// <reference path="../node_modules/pxt-core/localtypings/blockly.d.ts"/>
/// <reference path="../node_modules/pxt-core/built/pxtblocks.d.ts"/>
/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldMotors = void 0;
class FieldMotors extends pxtblockly.FieldImages {
    //public shouldSort_: boolean;
    constructor(text, options, validator) {
        super(text, options, validator);
        this.isFieldCustom_ = true;
        this.buttonClick_ = function (e) {
            let value = e.target.getAttribute('data-value');
            this.setValue(value);
            Blockly.DropDownDiv.hide();
        };
        this.columns_ = parseInt(options.columns) || 4;
        this.width_ = parseInt(options.width) || 400;
        //this.shouldSort_ = options.sort;
        this.addLabel_ = true;
        this.renderSelectedImage_ = Blockly.FieldDropdown.prototype.renderSelectedText_;
        this.updateSize_ = Blockly.Field.prototype.updateSize_;
    }
    /**
     * Create a dropdown menu under the text.
     * @private
     */
    showEditor_() {
        // If there is an existing drop-down we own, this is a request to hide the drop-down.
        if (Blockly.DropDownDiv.hideIfOwner(this)) {
            return;
        }
        let sourceBlock = this.sourceBlock_;
        // If there is an existing drop-down someone else owns, hide it immediately and clear it.
        Blockly.DropDownDiv.hideWithoutAnimation();
        Blockly.DropDownDiv.clearContent();
        // Populate the drop-down with the icons for this field.
        let dropdownDiv = Blockly.DropDownDiv.getContentDiv();
        let contentDiv = document.createElement('div');
        // Accessibility properties
        contentDiv.setAttribute('role', 'menu');
        contentDiv.setAttribute('aria-haspopup', 'true');
        const options = this.getOptions();
        //if (this.shouldSort_) options.sort();
        for (let i = 0; i < options.length; i++) {
            const content = options[i][0]; // Human-readable text or image.
            const value = options[i][1]; // Language-neutral value.
            // Icons with the type property placeholder take up space but don't have any functionality
            // Use for special-case layouts
            if (content.type == 'placeholder') {
                let placeholder = document.createElement('span');
                placeholder.setAttribute('class', 'blocklyDropDownPlaceholder');
                placeholder.style.width = content.width + 'px';
                placeholder.style.height = content.height + 'px';
                contentDiv.appendChild(placeholder);
                continue;
            }
            let button = document.createElement('button');
            button.setAttribute('id', ':' + i); // For aria-activedescendant
            button.setAttribute('role', 'menuitem');
            button.setAttribute('class', 'blocklyDropDownButton');
            button.title = content.alt;
            if (this.columns_) {
                button.style.width = ((this.width_ / this.columns_) - 8) + 'px';
                //button.style.height = ((this.width_ / this.columns_) - 8) + 'px';
            }
            else {
                button.style.width = content.width + 'px';
                button.style.height = content.height + 'px';
            }
            let backgroundColor = sourceBlock.getColour();
            if (value == this.getValue()) {
                // This icon is selected, show it in a different colour
                backgroundColor = sourceBlock.getColourTertiary();
                button.setAttribute('aria-selected', 'true');
            }
            button.style.backgroundColor = backgroundColor;
            button.style.borderColor = sourceBlock.getColourTertiary();
            Blockly.bindEvent_(button, 'click', this, this.buttonClick_);
            Blockly.bindEvent_(button, 'mouseover', button, function () {
                this.setAttribute('class', 'blocklyDropDownButton blocklyDropDownButtonHover');
                contentDiv.setAttribute('aria-activedescendant', this.id);
            });
            Blockly.bindEvent_(button, 'mouseout', button, function () {
                this.setAttribute('class', 'blocklyDropDownButton');
                contentDiv.removeAttribute('aria-activedescendant');
            });
            let buttonImg = document.createElement('img');
            buttonImg.src = content.src;
            //buttonImg.alt = icon.alt;
            // Upon click/touch, we will be able to get the clicked element as e.target
            // Store a data attribute on all possible click targets so we can match it to the icon.
            button.setAttribute('data-value', value);
            buttonImg.setAttribute('data-value', value);
            button.appendChild(buttonImg);
            if (this.addLabel_) {
                const buttonText = this.createTextNode_(content.alt);
                buttonText.setAttribute('data-value', value);
                buttonText.style.whiteSpace = 'inherit';
                buttonText.style.width = 'auto';
                buttonText.style.padding = '0 10px';
                button.appendChild(buttonText);
            }
            contentDiv.appendChild(button);
        }
        contentDiv.style.width = this.width_ + 'px';
        dropdownDiv.appendChild(contentDiv);
        Blockly.DropDownDiv.setColour(sourceBlock.getColour(), sourceBlock.getColourTertiary());
        // Position based on the field position.
        Blockly.DropDownDiv.showPositionedByField(this, this.onHideCallback.bind(this));
        // Update colour to look selected.
        this.savedPrimary_ = sourceBlock === null || sourceBlock === void 0 ? void 0 : sourceBlock.getColour();
        if (sourceBlock === null || sourceBlock === void 0 ? void 0 : sourceBlock.isShadow()) {
            sourceBlock.setColour(sourceBlock.style.colourTertiary);
        }
        else if (this.borderRect_) {
            this.borderRect_.setAttribute('fill', sourceBlock.style.colourTertiary);
        }
    }
    trimOptions_() {
    }
}
exports.FieldMotors = FieldMotors;

},{}],5:[function(require,module,exports){
"use strict";
/// <reference path="../node_modules/pxt-core/localtypings/blockly.d.ts"/>
/// <reference path="../node_modules/pxt-core/built/pxtblocks.d.ts"/>
/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldMusic = void 0;
let soundCache;
let soundIconCache;
let soundIconCacheArray;
class FieldMusic extends pxtblockly.FieldImages {
    constructor(text, options, validator) {
        super(text, { blocksInfo: options.blocksInfo, sort: true, data: options.data }, validator);
        this.isFieldCustom_ = true;
        this.buttonClick_ = function (e) {
            let value = e.target.getAttribute('data-value');
            this.setValue(value);
            Blockly.DropDownDiv.hide();
        };
        this.categoryClick_ = function (e) {
            let value = e.target.getAttribute('data-value');
            this.setSelectedCategory(value);
            const options = this.getOptions();
            options.sort();
            const categories = this.getCategories(options);
            const dropdownDiv = Blockly.DropDownDiv.getContentDiv();
            const categoriesDiv = dropdownDiv.childNodes[0];
            const contentDiv = dropdownDiv.childNodes[1];
            categoriesDiv.innerHTML = '';
            contentDiv.innerHTML = '';
            this.refreshCategories(categoriesDiv, categories);
            this.refreshOptions(contentDiv, options);
            this.stopSounds();
        };
        /**
         * Callback for when a button is hovered over inside the drop-down.
         * Should be bound to the FieldIconMenu.
         * @param {Event} e DOM event for the mouseover
         * @private
         */
        this.buttonEnter_ = function (value) {
            if (soundCache) {
                const jresValue = value.substring(value.lastIndexOf('.') + 1);
                const buf = soundCache[jresValue];
                if (buf) {
                    const refBuf = {
                        data: pxt.U.stringToUint8Array(atob(buf))
                    };
                    pxsim.AudioContextManager.playBufferAsync(refBuf);
                }
            }
        };
        this.buttonLeave_ = function () {
            this.stopSounds();
        };
        this.columns_ = parseInt(options.columns) || 4;
        this.width_ = parseInt(options.width) || 450;
        //this.setText = Blockly.FieldDropdown.prototype.setText;
        this.updateSize_ = Blockly.Field.prototype.updateSize_;
        if (!pxt.BrowserUtils.isIE() && !soundCache) {
            soundCache = JSON.parse(pxtTargetBundle.bundledpkgs['music']['sounds.jres']);
        }
        if (!soundIconCache) {
            soundIconCache = JSON.parse(pxtTargetBundle.bundledpkgs['music']['icons.jres']);
            soundIconCacheArray = Object.entries(soundIconCache).filter(el => el[0] !== "*");
        }
    }
    /**
     * Create a dropdown menu under the text.
     * @private
     */
    showEditor_() {
        // If there is an existing drop-down we own, this is a request to hide the drop-down.
        if (Blockly.DropDownDiv.hideIfOwner(this)) {
            return;
        }
        // If there is an existing drop-down someone else owns, hide it immediately and clear it.
        Blockly.DropDownDiv.hideWithoutAnimation();
        Blockly.DropDownDiv.clearContent();
        // Populate the drop-down with the icons for this field.
        let dropdownDiv = Blockly.DropDownDiv.getContentDiv();
        let contentDiv = document.createElement('div');
        // Accessibility properties
        contentDiv.setAttribute('role', 'menu');
        contentDiv.setAttribute('aria-haspopup', 'true');
        contentDiv.className = 'blocklyMusicFieldOptions';
        contentDiv.style.display = "flex";
        contentDiv.style.flexWrap = "wrap";
        contentDiv.style.float = "none";
        const options = this.getOptions();
        //options.sort(); // Do not need to use to not apply sorting in different languages
        // Create categoies
        const categories = this.getCategories(options);
        const selectedCategory = this.parseCategory(this.getText());
        this.selectedCategory_ = selectedCategory || categories[0];
        let categoriesDiv = document.createElement('div');
        // Accessibility properties
        categoriesDiv.setAttribute('role', 'menu');
        categoriesDiv.setAttribute('aria-haspopup', 'true');
        categoriesDiv.style.backgroundColor = this.sourceBlock_.getColourTertiary();
        categoriesDiv.className = 'blocklyMusicFieldCategories';
        this.refreshCategories(categoriesDiv, categories);
        this.refreshOptions(contentDiv, options);
        contentDiv.style.width = this.width_ + 'px';
        contentDiv.style.cssFloat = 'left';
        dropdownDiv.style.maxHeight = `410px`;
        dropdownDiv.appendChild(categoriesDiv);
        dropdownDiv.appendChild(contentDiv);
        Blockly.DropDownDiv.setColour(this.sourceBlock_.getColour(), this.sourceBlock_.getColourTertiary());
        // Position based on the field position.
        Blockly.DropDownDiv.showPositionedByField(this, this.onHide_.bind(this));
        // Update colour to look selected.
        let source = this.sourceBlock_;
        this.savedPrimary_ = source === null || source === void 0 ? void 0 : source.getColour();
        if (source === null || source === void 0 ? void 0 : source.isShadow()) {
            source.setColour(source.getColourTertiary());
        }
        else if (this.borderRect_) {
            this.borderRect_.setAttribute('fill', this.sourceBlock_.getColourTertiary());
        }
    }
    getCategories(options) {
        if (this.categoriesCache_)
            return this.categoriesCache_;
        let categoryMap = {};
        for (let i = 0, option; option = options[i]; i++) {
            const content = options[i][0]; // Human-readable text or image.
            const category = this.parseCategory(content);
            categoryMap[category] = true;
        }
        this.categoriesCache_ = Object.keys(categoryMap);
        return this.categoriesCache_;
    }
    refreshCategories(categoriesDiv, categories) {
        // Show category dropdown.
        for (let i = 0; i < categories.length; i++) {
            const category = categories[i];
            let button = document.createElement('button');
            button.setAttribute('id', ':' + i); // For aria-activedescendant
            button.setAttribute('role', 'menuitem');
            button.setAttribute('class', 'blocklyDropdownTag');
            button.setAttribute('data-value', category);
            let backgroundColor = '#1A9DBC';
            if (category == this.selectedCategory_) {
                // This icon is selected, show it in a different colour
                backgroundColor = '#0c4e5e';
                button.setAttribute('aria-selected', 'true');
            }
            button.style.padding = "2px 6px";
            button.style.backgroundColor = backgroundColor;
            button.style.borderColor = backgroundColor;
            Blockly.bindEvent_(button, 'click', this, this.categoryClick_);
            Blockly.bindEvent_(button, 'mouseup', this, this.categoryClick_);
            const textNode = this.createTextNode_(category);
            textNode.setAttribute('data-value', category);
            button.appendChild(textNode);
            categoriesDiv.appendChild(button);
        }
    }
    refreshOptions(contentDiv, options) {
        const categories = this.getCategories(options);
        // Show options
        for (let i = 0, option; option = options[i]; i++) {
            let content = options[i][0]; // Human-readable text or image.
            const value = options[i][1]; // Language-neutral value.
            // Filter for options in selected category
            const category = this.parseCategory(content);
            if (this.selectedCategory_ != category)
                continue;
            // Icons with the type property placeholder take up space but don't have any functionality
            // Use for special-case layouts
            if (content.type == 'placeholder') {
                let placeholder = document.createElement('span');
                placeholder.setAttribute('class', 'blocklyDropDownPlaceholder');
                placeholder.style.width = content.width + 'px';
                placeholder.style.height = content.height + 'px';
                contentDiv.appendChild(placeholder);
                continue;
            }
            let button = document.createElement('button');
            button.setAttribute('id', ':' + i); // For aria-activedescendant
            button.setAttribute('role', 'menuitem');
            button.setAttribute('class', 'blocklyDropDownButton');
            button.title = content;
            if (this.columns_) {
                button.style.width = ((this.width_ / this.columns_) - 8) + 'px';
                //button.style.height = ((this.width_ / this.columns_) - 8) + 'px';
            }
            else {
                button.style.width = content.width + 'px';
                button.style.height = content.height + 'px';
            }
            let backgroundColor = this.savedPrimary_ || this.sourceBlock_.getColour();
            if (value == this.getValue()) {
                // This icon is selected, show it in a different colour
                backgroundColor = this.sourceBlock_.getColourTertiary();
                button.setAttribute('aria-selected', 'true');
            }
            button.style.backgroundColor = backgroundColor;
            button.style.borderColor = this.sourceBlock_.getColourTertiary();
            Blockly.bindEvent_(button, 'click', this, this.buttonClick_);
            Blockly.bindEvent_(button, 'mouseup', this, this.buttonClick_);
            // These are applied manually instead of using the :hover pseudoclass
            // because Android has a bad long press "helper" menu and green highlight
            // that we must prevent with ontouchstart preventDefault
            let that = this;
            Blockly.bindEvent_(button, 'mousedown', button, function (e) {
                this.setAttribute('class', 'blocklyDropDownButton blocklyDropDownButtonHover');
                e.preventDefault();
            });
            Blockly.bindEvent_(button, 'mouseenter', button, function () {
                that.buttonEnter_(value);
            });
            Blockly.bindEvent_(button, 'mouseleave', button, function () {
                that.buttonLeave_();
            });
            Blockly.bindEvent_(button, 'mouseover', button, function () {
                this.setAttribute('class', 'blocklyDropDownButton blocklyDropDownButtonHover');
                contentDiv.setAttribute('aria-activedescendant', this.id);
            });
            Blockly.bindEvent_(button, 'mouseout', button, function () {
                this.setAttribute('class', 'blocklyDropDownButton');
                contentDiv.removeAttribute('aria-activedescendant');
            });
            // Find index in array by category name
            const categoryIndex = categories.indexOf(category);
            let buttonImg = document.createElement('img');
            buttonImg.src = this.getSoundIcon(categoryIndex);
            // Upon click/touch, we will be able to get the clicked element as e.target
            // Store a data attribute on all possible click targets so we can match it to the icon.
            const textNode = this.createTextNode_(content);
            button.setAttribute('data-value', value);
            buttonImg.setAttribute('data-value', value);
            buttonImg.style.height = "auto";
            textNode.setAttribute('data-value', value);
            if (pxt.Util.userLanguage() !== "en")
                textNode.setAttribute('lang', pxt.Util.userLanguage()); // for hyphens, here you need to set the correct abbreviation of the selected language 
            textNode.style.display = "block";
            textNode.style.lineHeight = "1rem";
            textNode.style.marginBottom = "5%";
            textNode.style.padding = "0px 8px";
            textNode.style.wordBreak = "break-word";
            textNode.style.hyphens = "auto";
            button.appendChild(buttonImg);
            button.appendChild(textNode);
            contentDiv.appendChild(button);
        }
    }
    trimOptions_() {
    }
    onHide_() {
        super.onHide_();
        Blockly.DropDownDiv.getContentDiv().style.maxHeight = '';
        this.stopSounds();
        // Update color (deselect) on dropdown hide
        let source = this.sourceBlock_;
        if (source === null || source === void 0 ? void 0 : source.isShadow()) {
            source.setColour(this.savedPrimary_);
        }
        else if (this.borderRect_) {
            this.borderRect_.setAttribute('fill', this.savedPrimary_);
        }
    }
    createTextNode_(content) {
        const category = this.parseCategory(content);
        let text = content.substr(content.indexOf(' ') + 1);
        const textSpan = document.createElement('span');
        textSpan.setAttribute('class', 'blocklyDropdownText');
        textSpan.textContent = text;
        return textSpan;
    }
    parseCategory(content) {
        return content.substr(0, content.indexOf(' '));
    }
    setSelectedCategory(value) {
        this.selectedCategory_ = value;
    }
    stopSounds() {
        pxsim.AudioContextManager.stop();
    }
    getSoundIcon(indexCategory) {
        if (soundIconCacheArray && soundIconCacheArray[indexCategory]) {
            return soundIconCacheArray[indexCategory][1].icon;
        }
        return undefined;
    }
}
exports.FieldMusic = FieldMusic;

},{}],6:[function(require,module,exports){
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

},{}]},{},[1,2,3,4,5,6]);
