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
