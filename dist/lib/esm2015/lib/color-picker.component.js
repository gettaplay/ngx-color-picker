import { Component, ViewChild, HostListener, ViewEncapsulation, ElementRef, ChangeDetectorRef, } from '@angular/core';
import { detectIE, calculateAutoPositioning } from './helpers';
import { ColorFormats, Cmyk, Hsla, Hsva, Rgba } from './formats';
import { SliderDimension, SliderPosition, } from './helpers';
import { ColorPickerService } from './color-picker.service';
export class ColorPickerComponent {
    constructor(elRef, cdRef, service) {
        this.elRef = elRef;
        this.cdRef = cdRef;
        this.service = service;
        this.isIE10 = false;
        this.dialogArrowSize = 10;
        this.dialogArrowOffset = 15;
        this.dialogInputFields = [
            ColorFormats.HEX,
            ColorFormats.RGBA,
            ColorFormats.HSLA,
            ColorFormats.CMYK,
        ];
        this.useRootViewContainer = false;
    }
    handleEsc(event) {
        if (this.show && this.cpDialogDisplay === 'popup') {
            this.onCancelColor(event);
        }
    }
    handleEnter(event) {
        if (this.show && this.cpDialogDisplay === 'popup') {
            this.onAcceptColor(event);
        }
    }
    ngOnInit() {
        this.slider = new SliderPosition(0, 0, 0, 0);
        const hueWidth = this.hueSlider.nativeElement.offsetWidth || 140;
        const alphaWidth = this.alphaSlider.nativeElement.offsetWidth || 140;
        this.sliderDimMax = new SliderDimension(hueWidth, this.cpWidth, 130, alphaWidth);
        if (this.cpCmykEnabled) {
            this.format = ColorFormats.CMYK;
        }
        else if (this.cpOutputFormat === 'rgba') {
            this.format = ColorFormats.RGBA;
        }
        else if (this.cpOutputFormat === 'hsla') {
            this.format = ColorFormats.HSLA;
        }
        else {
            this.format = ColorFormats.HEX;
        }
        this.listenerMouseDown = (event) => {
            this.onMouseDown(event);
        };
        this.listenerResize = () => {
            this.onResize();
        };
        this.openDialog(this.initialColor, false);
    }
    ngOnDestroy() {
        this.closeDialog();
    }
    ngAfterViewInit() {
        if (this.cpWidth !== 230 || this.cpDialogDisplay === 'inline') {
            const hueWidth = this.hueSlider.nativeElement.offsetWidth || 140;
            const alphaWidth = this.alphaSlider.nativeElement.offsetWidth || 140;
            this.sliderDimMax = new SliderDimension(hueWidth, this.cpWidth, 130, alphaWidth);
            this.updateColorPicker(false);
            this.cdRef.detectChanges();
        }
    }
    openDialog(color, emit = true) {
        this.service.setActive(this);
        if (!this.width) {
            this.cpWidth = this.directiveElementRef.nativeElement.offsetWidth;
        }
        if (!this.height) {
            this.height = 320;
        }
        this.setInitialColor(color);
        this.setColorFromString(color, emit);
        this.openColorPicker();
    }
    closeDialog() {
        this.closeColorPicker();
    }
    setupDialog(instance, elementRef, color, cpWidth, cpHeight, cpDialogDisplay, cpFallbackColor, cpColorMode, cpCmykEnabled, cpAlphaChannel, cpOutputFormat, cpDisableInput, cpIgnoredElements, cpSaveClickOutside, cpCloseClickOutside, cpUseRootViewContainer, cpPosition, cpPositionOffset, cpPositionRelativeToArrow, cpPresetLabel, cpPresetColors, cpPresetColorsClass, cpMaxPresetColorsLength, cpPresetEmptyMessage, cpPresetEmptyMessageClass, cpOKButton, cpOKButtonClass, cpOKButtonText, cpCancelButton, cpCancelButtonClass, cpCancelButtonText, cpAddColorButton, cpAddColorButtonClass, cpAddColorButtonText, cpRemoveColorButtonClass, cpTriggerElement, isShowSelectColorType) {
        this.setInitialColor(color);
        this.setColorMode(cpColorMode);
        this.isIE10 = detectIE() === 10;
        this.directiveInstance = instance;
        this.directiveElementRef = elementRef;
        this.cpDisableInput = cpDisableInput;
        this.cpCmykEnabled = cpCmykEnabled;
        this.cpAlphaChannel = cpAlphaChannel;
        this.cpOutputFormat = cpOutputFormat;
        this.cpDialogDisplay = cpDialogDisplay;
        this.cpIgnoredElements = cpIgnoredElements;
        this.cpSaveClickOutside = cpSaveClickOutside;
        this.cpCloseClickOutside = cpCloseClickOutside;
        this.useRootViewContainer = cpUseRootViewContainer;
        this.width = this.cpWidth = parseInt(cpWidth, 10);
        this.height = this.cpHeight = parseInt(cpHeight, 10);
        this.cpPosition = cpPosition;
        this.cpPositionOffset = parseInt(cpPositionOffset, 10);
        this.cpOKButton = cpOKButton;
        this.cpOKButtonText = cpOKButtonText;
        this.cpOKButtonClass = cpOKButtonClass;
        this.cpCancelButton = cpCancelButton;
        this.cpCancelButtonText = cpCancelButtonText;
        this.cpCancelButtonClass = cpCancelButtonClass;
        this.fallbackColor = cpFallbackColor || '#fff';
        this.setPresetConfig(cpPresetLabel, cpPresetColors);
        this.cpPresetColorsClass = cpPresetColorsClass;
        this.cpMaxPresetColorsLength = cpMaxPresetColorsLength;
        this.cpPresetEmptyMessage = cpPresetEmptyMessage;
        this.cpPresetEmptyMessageClass = cpPresetEmptyMessageClass;
        this.cpAddColorButton = cpAddColorButton;
        this.cpAddColorButtonText = cpAddColorButtonText;
        this.cpAddColorButtonClass = cpAddColorButtonClass;
        this.cpRemoveColorButtonClass = cpRemoveColorButtonClass;
        this.cpTriggerElement = cpTriggerElement;
        // Additional
        this.isShowSelectColorType = isShowSelectColorType;
        if (!cpPositionRelativeToArrow) {
            this.dialogArrowOffset = 0;
        }
        if (cpDialogDisplay === 'inline') {
            this.dialogArrowSize = 0;
            this.dialogArrowOffset = 0;
        }
        if (cpOutputFormat === 'hex' &&
            cpAlphaChannel !== 'always' &&
            cpAlphaChannel !== 'forced') {
            this.cpAlphaChannel = 'disabled';
        }
    }
    setColorMode(mode) {
        switch (mode.toString().toUpperCase()) {
            case '1':
            case 'C':
            case 'COLOR':
                this.cpColorMode = 1;
                break;
            case '2':
            case 'G':
            case 'GRAYSCALE':
                this.cpColorMode = 2;
                break;
            case '3':
            case 'P':
            case 'PRESETS':
                this.cpColorMode = 3;
                break;
            default:
                this.cpColorMode = 1;
        }
    }
    setInitialColor(color) {
        this.initialColor = color;
    }
    setPresetConfig(cpPresetLabel, cpPresetColors) {
        this.cpPresetLabel = cpPresetLabel;
        this.cpPresetColors = cpPresetColors;
    }
    setColorFromString(value, emit = true, update = true) {
        let hsva;
        if (this.cpAlphaChannel === 'always' || this.cpAlphaChannel === 'forced') {
            hsva = this.service.stringToHsva(value, true);
            if (!hsva && !this.hsva) {
                hsva = this.service.stringToHsva(value, false);
            }
        }
        else {
            hsva = this.service.stringToHsva(value, false);
        }
        if (!hsva && !this.hsva) {
            hsva = this.service.stringToHsva(this.fallbackColor, false);
        }
        if (hsva) {
            this.hsva = hsva;
            this.sliderH = this.hsva.h;
            if (this.cpOutputFormat === 'hex' && this.cpAlphaChannel === 'disabled') {
                this.hsva.a = 1;
            }
            this.updateColorPicker(emit, update);
        }
    }
    onResize() {
        if (this.position === 'fixed') {
            this.setDialogPosition();
        }
        else if (this.cpDialogDisplay !== 'inline') {
            this.closeColorPicker();
        }
    }
    onDragEnd(slider) {
        this.directiveInstance.sliderDragEnd({
            slider: slider,
            color: this.outputColor,
        });
    }
    onDragStart(slider) {
        this.directiveInstance.sliderDragStart({
            slider: slider,
            color: this.outputColor,
        });
    }
    onMouseDown(event) {
        if (this.show &&
            !this.isIE10 &&
            this.cpDialogDisplay === 'popup' &&
            event.target !== this.directiveElementRef.nativeElement &&
            !this.isDescendant(this.elRef.nativeElement, event.target) &&
            !this.isDescendant(this.directiveElementRef.nativeElement, event.target) &&
            this.cpIgnoredElements.filter((item) => item === event.target)
                .length === 0) {
            if (this.cpSaveClickOutside) {
                this.directiveInstance.colorSelected(this.outputColor);
            }
            else {
                this.hsva = null;
                this.setColorFromString(this.initialColor, false);
                if (this.cpCmykEnabled) {
                    this.directiveInstance.cmykChanged(this.cmykColor);
                }
                this.directiveInstance.colorChanged(this.initialColor);
                this.directiveInstance.colorCanceled();
            }
            if (this.cpCloseClickOutside) {
                this.closeColorPicker();
            }
        }
    }
    onAcceptColor(event) {
        event.stopPropagation();
        if (this.outputColor) {
            this.directiveInstance.colorSelected(this.outputColor);
        }
        if (this.cpDialogDisplay === 'popup') {
            this.closeColorPicker();
        }
    }
    onCancelColor(event) {
        this.hsva = null;
        event.stopPropagation();
        this.directiveInstance.colorCanceled();
        this.setColorFromString(this.initialColor, true);
        if (this.cpDialogDisplay === 'popup') {
            if (this.cpCmykEnabled) {
                this.directiveInstance.cmykChanged(this.cmykColor);
            }
            this.directiveInstance.colorChanged(this.initialColor, true);
            this.closeColorPicker();
        }
    }
    onFormatToggle(change) {
        const availableFormats = this.dialogInputFields.length - (this.cpCmykEnabled ? 0 : 1);
        const nextFormat = (((this.dialogInputFields.indexOf(this.format) + change) %
            availableFormats) +
            availableFormats) %
            availableFormats;
        this.format = this.dialogInputFields[nextFormat];
    }
    onColorChange(value) {
        this.hsva.s = value.s / value.rgX;
        this.hsva.v = value.v / value.rgY;
        this.updateColorPicker();
        this.directiveInstance.sliderChanged({
            slider: 'lightness',
            value: this.hsva.v,
            color: this.outputColor,
        });
        this.directiveInstance.sliderChanged({
            slider: 'saturation',
            value: this.hsva.s,
            color: this.outputColor,
        });
    }
    onHueChange(value) {
        this.hsva.h = value.v / value.rgX;
        this.sliderH = this.hsva.h;
        this.updateColorPicker();
        this.directiveInstance.sliderChanged({
            slider: 'hue',
            value: this.hsva.h,
            color: this.outputColor,
        });
    }
    onValueChange(value) {
        this.hsva.v = value.v / value.rgX;
        this.updateColorPicker();
        this.directiveInstance.sliderChanged({
            slider: 'value',
            value: this.hsva.v,
            color: this.outputColor,
        });
    }
    onAlphaChange(value) {
        this.hsva.a = value.v / value.rgX;
        this.updateColorPicker();
        this.directiveInstance.sliderChanged({
            slider: 'alpha',
            value: this.hsva.a,
            color: this.outputColor,
        });
    }
    onHexInput(value) {
        if (value === null) {
            this.updateColorPicker();
        }
        else {
            if (value && value[0] !== '#') {
                value = '#' + value;
            }
            let validHex = /^#([a-f0-9]{3}|[a-f0-9]{6})$/gi;
            if (this.cpAlphaChannel === 'always') {
                validHex = /^#([a-f0-9]{3}|[a-f0-9]{6}|[a-f0-9]{8})$/gi;
            }
            const valid = validHex.test(value);
            if (valid) {
                if (value.length < 5) {
                    value =
                        '#' +
                            value
                                .substring(1)
                                .split('')
                                .map((c) => c + c)
                                .join('');
                }
                if (this.cpAlphaChannel === 'forced') {
                    value += Math.round(this.hsva.a * 255).toString(16);
                }
                this.setColorFromString(value, true, false);
            }
            this.directiveInstance.inputChanged({
                input: 'hex',
                valid: valid,
                value: value,
                color: this.outputColor,
            });
        }
    }
    onRedInput(value) {
        const rgba = this.service.hsvaToRgba(this.hsva);
        const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;
        if (valid) {
            rgba.r = value.v / value.rg;
            this.hsva = this.service.rgbaToHsva(rgba);
            this.sliderH = this.hsva.h;
            this.updateColorPicker();
        }
        this.directiveInstance.inputChanged({
            input: 'red',
            valid: valid,
            value: rgba.r,
            color: this.outputColor,
        });
    }
    onBlueInput(value) {
        const rgba = this.service.hsvaToRgba(this.hsva);
        const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;
        if (valid) {
            rgba.b = value.v / value.rg;
            this.hsva = this.service.rgbaToHsva(rgba);
            this.sliderH = this.hsva.h;
            this.updateColorPicker();
        }
        this.directiveInstance.inputChanged({
            input: 'blue',
            valid: valid,
            value: rgba.b,
            color: this.outputColor,
        });
    }
    onGreenInput(value) {
        const rgba = this.service.hsvaToRgba(this.hsva);
        const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;
        if (valid) {
            rgba.g = value.v / value.rg;
            this.hsva = this.service.rgbaToHsva(rgba);
            this.sliderH = this.hsva.h;
            this.updateColorPicker();
        }
        this.directiveInstance.inputChanged({
            input: 'green',
            valid: valid,
            value: rgba.g,
            color: this.outputColor,
        });
    }
    onHueInput(value) {
        const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;
        if (valid) {
            this.hsva.h = value.v / value.rg;
            this.sliderH = this.hsva.h;
            this.updateColorPicker();
        }
        this.directiveInstance.inputChanged({
            input: 'hue',
            valid: valid,
            value: this.hsva.h,
            color: this.outputColor,
        });
    }
    onValueInput(value) {
        const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;
        if (valid) {
            this.hsva.v = value.v / value.rg;
            this.updateColorPicker();
        }
        this.directiveInstance.inputChanged({
            input: 'value',
            valid: valid,
            value: this.hsva.v,
            color: this.outputColor,
        });
    }
    onAlphaInput(value) {
        const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;
        if (valid) {
            this.hsva.a = value.v / value.rg;
            this.updateColorPicker();
        }
        this.directiveInstance.inputChanged({
            input: 'alpha',
            valid: valid,
            value: this.hsva.a,
            color: this.outputColor,
        });
    }
    onLightnessInput(value) {
        const hsla = this.service.hsva2hsla(this.hsva);
        const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;
        if (valid) {
            hsla.l = value.v / value.rg;
            this.hsva = this.service.hsla2hsva(hsla);
            this.sliderH = this.hsva.h;
            this.updateColorPicker();
        }
        this.directiveInstance.inputChanged({
            input: 'lightness',
            valid: valid,
            value: hsla.l,
            color: this.outputColor,
        });
    }
    onSaturationInput(value) {
        const hsla = this.service.hsva2hsla(this.hsva);
        const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;
        if (valid) {
            hsla.s = value.v / value.rg;
            this.hsva = this.service.hsla2hsva(hsla);
            this.sliderH = this.hsva.h;
            this.updateColorPicker();
        }
        this.directiveInstance.inputChanged({
            input: 'saturation',
            valid: valid,
            value: hsla.s,
            color: this.outputColor,
        });
    }
    onCyanInput(value) {
        const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;
        if (valid) {
            this.cmyk.c = value.v;
            this.updateColorPicker(false, true, true);
        }
        this.directiveInstance.inputChanged({
            input: 'cyan',
            valid: true,
            value: this.cmyk.c,
            color: this.outputColor,
        });
    }
    onMagentaInput(value) {
        const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;
        if (valid) {
            this.cmyk.m = value.v;
            this.updateColorPicker(false, true, true);
        }
        this.directiveInstance.inputChanged({
            input: 'magenta',
            valid: true,
            value: this.cmyk.m,
            color: this.outputColor,
        });
    }
    onYellowInput(value) {
        const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;
        if (valid) {
            this.cmyk.y = value.v;
            this.updateColorPicker(false, true, true);
        }
        this.directiveInstance.inputChanged({
            input: 'yellow',
            valid: true,
            value: this.cmyk.y,
            color: this.outputColor,
        });
    }
    onBlackInput(value) {
        const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;
        if (valid) {
            this.cmyk.k = value.v;
            this.updateColorPicker(false, true, true);
        }
        this.directiveInstance.inputChanged({
            input: 'black',
            valid: true,
            value: this.cmyk.k,
            color: this.outputColor,
        });
    }
    onAddPresetColor(event, value) {
        event.stopPropagation();
        if (!this.cpPresetColors.filter((color) => color === value).length) {
            this.cpPresetColors = this.cpPresetColors.concat(value);
            this.directiveInstance.presetColorsChanged(this.cpPresetColors);
        }
    }
    onRemovePresetColor(event, value) {
        event.stopPropagation();
        this.cpPresetColors = this.cpPresetColors.filter((color) => color !== value);
        this.directiveInstance.presetColorsChanged(this.cpPresetColors);
    }
    // Private helper functions for the color picker dialog status
    openColorPicker() {
        if (!this.show) {
            this.show = true;
            this.hidden = true;
            setTimeout(() => {
                this.hidden = false;
                this.setDialogPosition();
                this.cdRef.detectChanges();
            }, 0);
            this.directiveInstance.stateChanged(true);
            if (!this.isIE10) {
                document.addEventListener('mousedown', this.listenerMouseDown);
                document.addEventListener('touchstart', this.listenerMouseDown);
            }
            window.addEventListener('resize', this.listenerResize);
        }
    }
    closeColorPicker() {
        if (this.show) {
            this.show = false;
            this.directiveInstance.stateChanged(false);
            if (!this.isIE10) {
                document.removeEventListener('mousedown', this.listenerMouseDown);
                document.removeEventListener('touchstart', this.listenerMouseDown);
            }
            window.removeEventListener('resize', this.listenerResize);
            if (!this.cdRef['destroyed']) {
                this.cdRef.detectChanges();
            }
        }
    }
    updateColorPicker(emit = true, update = true, cmykInput = false) {
        if (this.sliderDimMax) {
            if (this.cpColorMode === 2) {
                this.hsva.s = 0;
            }
            let hue, hsla, rgba;
            const lastOutput = this.outputColor;
            hsla = this.service.hsva2hsla(this.hsva);
            if (!this.cpCmykEnabled) {
                rgba = this.service.denormalizeRGBA(this.service.hsvaToRgba(this.hsva));
            }
            else {
                if (!cmykInput) {
                    rgba = this.service.hsvaToRgba(this.hsva);
                    this.cmyk = this.service.denormalizeCMYK(this.service.rgbaToCmyk(rgba));
                }
                else {
                    rgba = this.service.cmykToRgb(this.service.normalizeCMYK(this.cmyk));
                    this.hsva = this.service.rgbaToHsva(rgba);
                }
                rgba = this.service.denormalizeRGBA(rgba);
                this.sliderH = this.hsva.h;
            }
            hue = this.service.denormalizeRGBA(this.service.hsvaToRgba(new Hsva(this.sliderH || this.hsva.h, 1, 1, 1)));
            if (update) {
                this.hslaText = new Hsla(Math.round(hsla.h * 360), Math.round(hsla.s * 100), Math.round(hsla.l * 100), Math.round(hsla.a * 100) / 100);
                this.rgbaText = new Rgba(rgba.r, rgba.g, rgba.b, Math.round(rgba.a * 100) / 100);
                if (this.cpCmykEnabled) {
                    this.cmykText = new Cmyk(this.cmyk.c, this.cmyk.m, this.cmyk.y, this.cmyk.k, Math.round(this.cmyk.a * 100) / 100);
                }
                const allowHex8 = this.cpAlphaChannel === 'always';
                this.hexText = this.service.rgbaToHex(rgba, allowHex8);
                this.hexAlpha = this.rgbaText.a;
            }
            if (this.cpOutputFormat === 'auto') {
                if (this.format !== ColorFormats.RGBA &&
                    this.format !== ColorFormats.CMYK) {
                    if (this.hsva.a < 1) {
                        this.format =
                            this.hsva.a < 1 ? ColorFormats.RGBA : ColorFormats.HEX;
                    }
                }
            }
            this.hueSliderColor = 'rgb(' + hue.r + ',' + hue.g + ',' + hue.b + ')';
            this.alphaSliderColor =
                'rgb(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ')';
            this.outputColor = this.service.outputFormat(this.hsva, this.cpOutputFormat, this.cpAlphaChannel);
            this.selectedColor = this.service.outputFormat(this.hsva, 'rgba', null);
            if (this.format !== ColorFormats.CMYK) {
                this.cmykColor = '';
            }
            else {
                if (this.cpAlphaChannel === 'always' ||
                    this.cpAlphaChannel === 'enabled' ||
                    this.cpAlphaChannel === 'forced') {
                    const alpha = Math.round(this.cmyk.a * 100) / 100;
                    this.cmykColor = `cmyka(${this.cmyk.c},${this.cmyk.m},${this.cmyk.y},${this.cmyk.k},${alpha})`;
                }
                else {
                    this.cmykColor = `cmyk(${this.cmyk.c},${this.cmyk.m},${this.cmyk.y},${this.cmyk.k})`;
                }
            }
            console.log(this.sliderDimMax, 'slider H');
            this.slider = new SliderPosition((this.sliderH || this.hsva.h) * this.sliderDimMax.h - 8, this.hsva.s * this.sliderDimMax.s - 8, (1 - this.hsva.v) * this.sliderDimMax.v - 8, this.hsva.a * this.sliderDimMax.a - 8);
            if (emit && lastOutput !== this.outputColor) {
                if (this.cpCmykEnabled) {
                    this.directiveInstance.cmykChanged(this.cmykColor);
                }
                this.directiveInstance.colorChanged(this.outputColor);
            }
        }
    }
    // Private helper functions for the color picker dialog positioning
    setDialogPosition() {
        if (this.cpDialogDisplay === 'inline') {
            this.position = 'relative';
        }
        else {
            let position = 'static', transform = '', style;
            let parentNode = null, transformNode = null;
            let node = this.directiveElementRef.nativeElement.parentNode;
            const dialogHeight = this.dialogElement.nativeElement.offsetHeight;
            while (node !== null && node.tagName !== 'HTML') {
                style = window.getComputedStyle(node);
                position = style.getPropertyValue('position');
                transform = style.getPropertyValue('transform');
                if (position !== 'static' && parentNode === null) {
                    parentNode = node;
                }
                if (transform && transform !== 'none' && transformNode === null) {
                    transformNode = node;
                }
                if (position === 'fixed') {
                    parentNode = transformNode;
                    break;
                }
                node = node.parentNode;
            }
            const boxDirective = this.createDialogBox(this.directiveElementRef.nativeElement, position !== 'fixed');
            if (this.useRootViewContainer ||
                (position === 'fixed' &&
                    (!parentNode || parentNode instanceof HTMLUnknownElement))) {
                this.top = boxDirective.top;
                this.left = boxDirective.left;
            }
            else {
                if (parentNode === null) {
                    parentNode = node;
                }
                const boxParent = this.createDialogBox(parentNode, position !== 'fixed');
                this.top = boxDirective.top - boxParent.top;
                this.left = boxDirective.left - boxParent.left;
            }
            if (position === 'fixed') {
                this.position = 'fixed';
            }
            let usePosition = this.cpPosition;
            if (this.cpPosition === 'auto') {
                const dialogBounds = this.dialogElement.nativeElement.getBoundingClientRect();
                const triggerBounds = this.cpTriggerElement.nativeElement.getBoundingClientRect();
                usePosition = calculateAutoPositioning(dialogBounds, triggerBounds);
            }
            if (usePosition === 'top') {
                this.arrowTop = dialogHeight - 1;
                this.top -= dialogHeight + this.dialogArrowSize;
                this.left +=
                    (this.cpPositionOffset / 100) * boxDirective.width -
                        this.dialogArrowOffset;
            }
            else if (usePosition === 'bottom') {
                this.top += boxDirective.height + this.dialogArrowSize;
                this.left +=
                    (this.cpPositionOffset / 100) * boxDirective.width -
                        this.dialogArrowOffset;
            }
            else if (usePosition === 'top-left' || usePosition === 'left-top') {
                this.top -=
                    dialogHeight -
                        boxDirective.height +
                        (boxDirective.height * this.cpPositionOffset) / 100;
                this.left -=
                    this.cpWidth + this.dialogArrowSize - 2 - this.dialogArrowOffset;
            }
            else if (usePosition === 'top-right' || usePosition === 'right-top') {
                this.top -=
                    dialogHeight -
                        boxDirective.height +
                        (boxDirective.height * this.cpPositionOffset) / 100;
                this.left +=
                    boxDirective.width +
                        this.dialogArrowSize -
                        2 -
                        this.dialogArrowOffset;
            }
            else if (usePosition === 'left' ||
                usePosition === 'bottom-left' ||
                usePosition === 'left-bottom') {
                this.top +=
                    (boxDirective.height * this.cpPositionOffset) / 100 -
                        this.dialogArrowOffset;
                this.left -= this.cpWidth + this.dialogArrowSize - 2;
            }
            else {
                // usePosition === 'right' || usePosition === 'bottom-right' || usePosition === 'right-bottom'
                this.top +=
                    (boxDirective.height * this.cpPositionOffset) / 100 -
                        this.dialogArrowOffset;
                this.left += boxDirective.width + this.dialogArrowSize - 2;
            }
            this.cpUsePosition = usePosition;
        }
    }
    // Private helper functions for the color picker dialog positioning and opening
    isDescendant(parent, child) {
        let node = child.parentNode;
        while (node !== null) {
            if (node === parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }
    createDialogBox(element, offset) {
        return {
            top: element.getBoundingClientRect().top + (offset ? window.pageYOffset : 0),
            left: element.getBoundingClientRect().left +
                (offset ? window.pageXOffset : 0),
            width: element.offsetWidth,
            height: element.offsetHeight,
        };
    }
}
ColorPickerComponent.decorators = [
    { type: Component, args: [{
                selector: 'color-picker',
                template: "<div\n  #dialogPopup\n  class=\"color-picker\"\n  [class.open]=\"show\"\n  [style.display]=\"!show ? 'none' : 'block'\"\n  [style.visibility]=\"hidden ? 'hidden' : 'visible'\"\n  [style.top.px]=\"top\"\n  [style.left.px]=\"left\"\n  [style.position]=\"position\"\n  [style.height.px]=\"cpHeight\"\n  [style.width.px]=\"cpWidth\"\n  (click)=\"$event.stopPropagation()\"\n>\n  <div\n    *ngIf=\"(cpColorMode || 1) === 1\"\n    class=\"saturation-lightness\"\n    [slider]\n    [rgX]=\"1\"\n    [rgY]=\"1\"\n    [style.background-color]=\"hueSliderColor\"\n    (newValue)=\"onColorChange($event)\"\n    (dragStart)=\"onDragStart('saturation-lightness')\"\n    (dragEnd)=\"onDragEnd('saturation-lightness')\"\n  >\n    <div\n      class=\"cursor\"\n      [style.top.px]=\"slider?.v\"\n      [style.left.px]=\"slider?.s\"\n    ></div>\n  </div>\n\n  <div class=\"hue-alpha box\">\n    <div class=\"left\">\n      <div class=\"selected-color-background\"></div>\n\n      <div\n        class=\"selected-color\"\n        [style.background-color]=\"selectedColor\"\n      ></div>\n\n      <button\n        *ngIf=\"cpAddColorButton\"\n        type=\"button\"\n        class=\"{{ cpAddColorButtonClass }}\"\n        [disabled]=\"\n          cpPresetColors && cpPresetColors.length >= cpMaxPresetColorsLength\n        \"\n        (click)=\"onAddPresetColor($event, selectedColor)\"\n      >\n        {{ cpAddColorButtonText }}\n      </button>\n    </div>\n\n    <div class=\"right\">\n      <div *ngIf=\"cpAlphaChannel === 'disabled'\" style=\"height: 16px\"></div>\n\n      <div\n        #hueSlider\n        class=\"hue\"\n        [slider]\n        [rgX]=\"1\"\n        [style.display]=\"(cpColorMode || 1) === 1 ? 'block' : 'none'\"\n        (newValue)=\"onHueChange($event)\"\n        (dragStart)=\"onDragStart('hue')\"\n        (dragEnd)=\"onDragEnd('hue')\"\n      >\n        <div class=\"cursor\" [style.left.px]=\"slider?.h\"></div>\n      </div>\n\n      <div\n        #valueSlider\n        class=\"value\"\n        [slider]\n        [rgX]=\"1\"\n        [style.display]=\"(cpColorMode || 1) === 2 ? 'block' : 'none'\"\n        (newValue)=\"onValueChange($event)\"\n        (dragStart)=\"onDragStart('value')\"\n        (dragEnd)=\"onDragEnd('value')\"\n      >\n        <div class=\"cursor\" [style.right.px]=\"slider?.v\"></div>\n      </div>\n\n      <div\n        #alphaSlider\n        class=\"alpha\"\n        [slider]\n        [rgX]=\"1\"\n        [style.display]=\"cpAlphaChannel === 'disabled' ? 'none' : 'block'\"\n        [style.background-color]=\"alphaSliderColor\"\n        (newValue)=\"onAlphaChange($event)\"\n        (dragStart)=\"onDragStart('alpha')\"\n        (dragEnd)=\"onDragEnd('alpha')\"\n      >\n        <div class=\"cursor\" [style.left.px]=\"slider?.a\"></div>\n      </div>\n    </div>\n  </div>\n\n  <!-- select color type -->\n  <div *ngIf=\"isShowSelectColorType\">\n    <div\n      *ngIf=\"!cpDisableInput && (cpColorMode || 1) === 1\"\n      class=\"cmyk-text\"\n      [style.display]=\"format !== 3 ? 'none' : 'block'\"\n    >\n      <div class=\"box\">\n        <input\n          type=\"number\"\n          pattern=\"[0-9]*\"\n          min=\"0\"\n          max=\"100\"\n          [text]\n          [rg]=\"100\"\n          [value]=\"cmykText?.c\"\n          (keyup.enter)=\"onAcceptColor($event)\"\n          (newValue)=\"onCyanInput($event)\"\n        />\n        <input\n          type=\"number\"\n          pattern=\"[0-9]*\"\n          min=\"0\"\n          max=\"100\"\n          [text]\n          [rg]=\"100\"\n          [value]=\"cmykText?.m\"\n          (keyup.enter)=\"onAcceptColor($event)\"\n          (newValue)=\"onMagentaInput($event)\"\n        />\n        <input\n          type=\"number\"\n          pattern=\"[0-9]*\"\n          min=\"0\"\n          max=\"100\"\n          [text]\n          [rg]=\"100\"\n          [value]=\"cmykText?.y\"\n          (keyup.enter)=\"onAcceptColor($event)\"\n          (newValue)=\"onYellowInput($event)\"\n        />\n        <input\n          type=\"number\"\n          pattern=\"[0-9]*\"\n          min=\"0\"\n          max=\"100\"\n          [text]\n          [rg]=\"100\"\n          [value]=\"cmykText?.k\"\n          (keyup.enter)=\"onAcceptColor($event)\"\n          (newValue)=\"onBlackInput($event)\"\n        />\n        <input\n          *ngIf=\"cpAlphaChannel !== 'disabled'\"\n          type=\"number\"\n          pattern=\"[0-9]+([\\.,][0-9]{1,2})?\"\n          min=\"0\"\n          max=\"1\"\n          step=\"0.1\"\n          [text]\n          [rg]=\"1\"\n          [value]=\"cmykText?.a\"\n          (keyup.enter)=\"onAcceptColor($event)\"\n          (newValue)=\"onAlphaInput($event)\"\n        />\n      </div>\n\n      <div class=\"box\">\n        <div>C</div>\n        <div>M</div>\n        <div>Y</div>\n        <div>K</div>\n        <div *ngIf=\"cpAlphaChannel !== 'disabled'\">A</div>\n      </div>\n    </div>\n\n    <div\n      *ngIf=\"!cpDisableInput && (cpColorMode || 1) === 1\"\n      class=\"hsla-text\"\n      [style.display]=\"format !== 2 ? 'none' : 'block'\"\n    >\n      <div class=\"box\">\n        <input\n          type=\"number\"\n          pattern=\"[0-9]*\"\n          min=\"0\"\n          max=\"360\"\n          [text]\n          [rg]=\"360\"\n          [value]=\"hslaText?.h\"\n          (keyup.enter)=\"onAcceptColor($event)\"\n          (newValue)=\"onHueInput($event)\"\n        />\n        <input\n          type=\"number\"\n          pattern=\"[0-9]*\"\n          min=\"0\"\n          max=\"100\"\n          [text]\n          [rg]=\"100\"\n          [value]=\"hslaText?.s\"\n          (keyup.enter)=\"onAcceptColor($event)\"\n          (newValue)=\"onSaturationInput($event)\"\n        />\n        <input\n          type=\"number\"\n          pattern=\"[0-9]*\"\n          min=\"0\"\n          max=\"100\"\n          [text]\n          [rg]=\"100\"\n          [value]=\"hslaText?.l\"\n          (keyup.enter)=\"onAcceptColor($event)\"\n          (newValue)=\"onLightnessInput($event)\"\n        />\n        <input\n          *ngIf=\"cpAlphaChannel !== 'disabled'\"\n          type=\"number\"\n          pattern=\"[0-9]+([\\.,][0-9]{1,2})?\"\n          min=\"0\"\n          max=\"1\"\n          step=\"0.1\"\n          [text]\n          [rg]=\"1\"\n          [value]=\"hslaText?.a\"\n          (keyup.enter)=\"onAcceptColor($event)\"\n          (newValue)=\"onAlphaInput($event)\"\n        />\n      </div>\n\n      <div class=\"box\">\n        <div>H</div>\n        <div>S</div>\n        <div>L</div>\n        <div *ngIf=\"cpAlphaChannel !== 'disabled'\">A</div>\n      </div>\n    </div>\n\n    <div\n      *ngIf=\"!cpDisableInput && (cpColorMode || 1) === 1\"\n      [style.display]=\"format !== 1 ? 'none' : 'block'\"\n      class=\"rgba-text\"\n    >\n      <div class=\"box\">\n        <input\n          type=\"number\"\n          pattern=\"[0-9]*\"\n          min=\"0\"\n          max=\"255\"\n          [text]\n          [rg]=\"255\"\n          [value]=\"rgbaText?.r\"\n          (keyup.enter)=\"onAcceptColor($event)\"\n          (newValue)=\"onRedInput($event)\"\n        />\n        <input\n          type=\"number\"\n          pattern=\"[0-9]*\"\n          min=\"0\"\n          max=\"255\"\n          [text]\n          [rg]=\"255\"\n          [value]=\"rgbaText?.g\"\n          (keyup.enter)=\"onAcceptColor($event)\"\n          (newValue)=\"onGreenInput($event)\"\n        />\n        <input\n          type=\"number\"\n          pattern=\"[0-9]*\"\n          min=\"0\"\n          max=\"255\"\n          [text]\n          [rg]=\"255\"\n          [value]=\"rgbaText?.b\"\n          (keyup.enter)=\"onAcceptColor($event)\"\n          (newValue)=\"onBlueInput($event)\"\n        />\n        <input\n          *ngIf=\"cpAlphaChannel !== 'disabled'\"\n          type=\"number\"\n          pattern=\"[0-9]+([\\.,][0-9]{1,2})?\"\n          min=\"0\"\n          max=\"1\"\n          step=\"0.1\"\n          [text]\n          [rg]=\"1\"\n          [value]=\"rgbaText?.a\"\n          (keyup.enter)=\"onAcceptColor($event)\"\n          (newValue)=\"onAlphaInput($event)\"\n        />\n      </div>\n\n      <div class=\"box\">\n        <div>R</div>\n        <div>G</div>\n        <div>B</div>\n        <div *ngIf=\"cpAlphaChannel !== 'disabled'\">A</div>\n      </div>\n    </div>\n\n    <div\n      *ngIf=\"!cpDisableInput && (cpColorMode || 1) === 1\"\n      class=\"hex-text\"\n      [class.hex-alpha]=\"cpAlphaChannel === 'forced'\"\n      [style.display]=\"format !== 0 ? 'none' : 'block'\"\n    >\n      <div class=\"box\">\n        <input\n          [text]\n          [value]=\"hexText\"\n          (blur)=\"onHexInput(null)\"\n          (keyup.enter)=\"onAcceptColor($event)\"\n          (newValue)=\"onHexInput($event)\"\n        />\n        <input\n          *ngIf=\"cpAlphaChannel === 'forced'\"\n          type=\"number\"\n          pattern=\"[0-9]+([\\.,][0-9]{1,2})?\"\n          min=\"0\"\n          max=\"1\"\n          step=\"0.1\"\n          [text]\n          [rg]=\"1\"\n          [value]=\"hexAlpha\"\n          (keyup.enter)=\"onAcceptColor($event)\"\n          (newValue)=\"onAlphaInput($event)\"\n        />\n      </div>\n\n      <div class=\"box\">\n        <div>Hex</div>\n        <div *ngIf=\"cpAlphaChannel === 'forced'\">A</div>\n      </div>\n    </div>\n\n    <div *ngIf=\"!cpDisableInput && (cpColorMode || 1) === 2\" class=\"value-text\">\n      <div class=\"box\">\n        <input\n          type=\"number\"\n          pattern=\"[0-9]*\"\n          min=\"0\"\n          max=\"100\"\n          [text]\n          [rg]=\"100\"\n          [value]=\"hslaText?.l\"\n          (keyup.enter)=\"onAcceptColor($event)\"\n          (newValue)=\"onValueInput($event)\"\n        />\n        <input\n          *ngIf=\"cpAlphaChannel !== 'disabled'\"\n          type=\"number\"\n          pattern=\"[0-9]+([\\.,][0-9]{1,2})?\"\n          min=\"0\"\n          max=\"1\"\n          step=\"0.1\"\n          [text]\n          [rg]=\"1\"\n          [value]=\"hslaText?.a\"\n          (keyup.enter)=\"onAcceptColor($event)\"\n          (newValue)=\"onAlphaInput($event)\"\n        />\n      </div>\n\n      <div class=\"box\">\n        <div>V</div>\n        <div>A</div>\n      </div>\n    </div>\n\n    <div\n      *ngIf=\"!cpDisableInput && (cpColorMode || 1) === 1\"\n      class=\"type-policy\"\n    >\n      <span class=\"type-policy-arrow\" (click)=\"onFormatToggle(-1)\"></span>\n      <span class=\"type-policy-arrow\" (click)=\"onFormatToggle(1)\"></span>\n    </div>\n  </div>\n  <div *ngIf=\"cpPresetColors?.length || cpAddColorButton\" class=\"preset-area\">\n    <hr />\n\n    <div class=\"preset-label\">{{ cpPresetLabel }}</div>\n\n    <div *ngIf=\"cpPresetColors?.length\" class=\"{{ cpPresetColorsClass }}\">\n      <div\n        *ngFor=\"let color of cpPresetColors\"\n        class=\"preset-color\"\n        [style.backgroundColor]=\"color\"\n        (click)=\"setColorFromString(color)\"\n      >\n        <span\n          *ngIf=\"cpAddColorButton\"\n          class=\"{{ cpRemoveColorButtonClass }}\"\n          (click)=\"onRemovePresetColor($event, color)\"\n        ></span>\n      </div>\n    </div>\n\n    <div\n      *ngIf=\"!cpPresetColors?.length && cpAddColorButton\"\n      class=\"{{ cpPresetEmptyMessageClass }}\"\n    >\n      {{ cpPresetEmptyMessage }}\n    </div>\n  </div>\n\n  <div *ngIf=\"cpOKButton || cpCancelButton\" class=\"button-area\">\n    <button\n      *ngIf=\"cpCancelButton\"\n      type=\"button\"\n      class=\"{{ cpCancelButtonClass }}\"\n      (click)=\"onCancelColor($event)\"\n      nz-button\n      nzGhost\n      nzType=\"primary\"\n    >\n      {{ cpCancelButtonText }}\n    </button>\n\n    <button\n      *ngIf=\"cpOKButton\"\n      type=\"button\"\n      class=\"{{ cpOKButtonClass }}\"\n      (click)=\"onAcceptColor($event)\"\n      nz-button\n      nzType=\"primary\"\n    >\n      {{ cpOKButtonText }}\n    </button>\n  </div>\n</div>\n",
                encapsulation: ViewEncapsulation.None,
                styles: [".color-picker{position:absolute;z-index:1000;width:230px;height:auto;border:1px solid #777;cursor:default;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;background-color:#fff}.color-picker.open{top:40px!important;left:0!important;position:absolute!important}.color-picker *{box-sizing:border-box;margin:0;font-size:11px}.color-picker input{width:0;height:26px;min-width:0;font-size:13px;text-align:center;color:#000}.color-picker input:-moz-submit-invalid,.color-picker input:-moz-ui-invalid,.color-picker input:invalid{box-shadow:none}.color-picker input::-webkit-inner-spin-button,.color-picker input::-webkit-outer-spin-button{margin:0;-webkit-appearance:none}.color-picker .arrow{position:absolute;z-index:999999;width:0;height:0;border-style:solid}.color-picker .arrow.arrow-top{left:8px;border-width:10px 5px;border-color:#777 transparent transparent}.color-picker .arrow.arrow-bottom{top:-20px;left:8px;border-width:10px 5px;border-color:transparent transparent #777}.color-picker .arrow.arrow-left-top,.color-picker .arrow.arrow-top-left{right:-21px;bottom:8px;border-width:5px 10px;border-color:transparent transparent transparent #777}.color-picker .arrow.arrow-right-top,.color-picker .arrow.arrow-top-right{bottom:8px;left:-20px;border-width:5px 10px;border-color:transparent #777 transparent transparent}.color-picker .arrow.arrow-bottom-left,.color-picker .arrow.arrow-left,.color-picker .arrow.arrow-left-bottom{top:8px;right:-21px;border-width:5px 10px;border-color:transparent transparent transparent #777}.color-picker .arrow.arrow-bottom-right,.color-picker .arrow.arrow-right,.color-picker .arrow.arrow-right-bottom{top:8px;left:-20px;border-width:5px 10px;border-color:transparent #777 transparent transparent}.color-picker .cursor{position:relative;width:16px;height:16px;border:2px solid #222;border-radius:50%;cursor:default}.color-picker .box{display:flex;padding:4px 8px}.color-picker .left{position:relative;padding:16px 8px}.color-picker .right{flex:1 1 auto;padding:12px 8px}.color-picker .button-area{border-top:1px solid #e6e6e6;padding:16px;text-align:center}.color-picker .button-area button{margin-left:8px}.color-picker .preset-area{padding:4px 15px}.color-picker .preset-area .preset-label{overflow:hidden;width:100%;padding:4px;font-size:11px;white-space:nowrap;text-align:left;text-overflow:ellipsis;color:#555}.color-picker .preset-area .preset-color{position:relative;display:inline-block;width:18px;height:18px;margin:4px 6px 8px;border:1px solid #a9a9a9;border-radius:25%;cursor:pointer}.color-picker .preset-area .preset-empty-message{min-height:18px;margin-top:4px;margin-bottom:8px;font-style:italic;text-align:center}.color-picker .hex-text{width:100%;padding:4px 8px;font-size:11px}.color-picker .hex-text .box{padding:0 24px 8px 8px}.color-picker .hex-text .box div{float:left;flex:1 1 auto;text-align:center;color:#555;clear:left}.color-picker .hex-text .box input{flex:1 1 auto;padding:1px;border:1px solid #a9a9a9}.color-picker .hex-alpha .box div:first-child,.color-picker .hex-alpha .box input:first-child{flex-grow:3;margin-right:8px}.color-picker .cmyk-text,.color-picker .hsla-text,.color-picker .rgba-text,.color-picker .value-text{width:100%;padding:4px 8px;font-size:11px}.color-picker .cmyk-text .box,.color-picker .hsla-text .box,.color-picker .rgba-text .box{padding:0 24px 8px 8px}.color-picker .value-text .box{padding:0 8px 8px}.color-picker .cmyk-text .box div,.color-picker .hsla-text .box div,.color-picker .rgba-text .box div,.color-picker .value-text .box div{flex:1 1 auto;margin-right:8px;text-align:center;color:#555}.color-picker .cmyk-text .box div:last-child,.color-picker .hsla-text .box div:last-child,.color-picker .rgba-text .box div:last-child,.color-picker .value-text .box div:last-child{margin-right:0}.color-picker .cmyk-text .box input,.color-picker .hsla-text .box input,.color-picker .rgba-text .box input,.color-picker .value-text .box input{float:left;flex:1;padding:1px;margin:0 8px 0 0;border:1px solid #a9a9a9}.color-picker .cmyk-text .box input:last-child,.color-picker .hsla-text .box input:last-child,.color-picker .rgba-text .box input:last-child,.color-picker .value-text .box input:last-child{margin-right:0}.color-picker .hue-alpha{align-items:center;margin-bottom:3px}.color-picker .hue{direction:ltr;background-image:url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAAAQCAYAAAD06IYnAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AIWDwkUFWbCCAAAAFxJREFUaN7t0kEKg0AQAME2x83/n2qu5qCgD1iDhCoYdpnbQC9bbY1qVO/jvc6k3ad91s7/7F1/csgPrujuQ17BDYSFsBAWwgJhISyEBcJCWAgLhIWwEBYIi2f7Ar/1TCgFH2X9AAAAAElFTkSuQmCC\")}.color-picker .hue,.color-picker .value{width:100%;height:16px;margin-bottom:16px;border:none;cursor:pointer;background-size:100% 100%}.color-picker .value{direction:rtl;background-image:url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAAAQCAYAAAD06IYnAAACTklEQVR42u3SYUcrABhA4U2SkmRJMmWSJklKJiWZZpKUJJskKUmaTFImKZOUzMySpGRmliRNJilJSpKSJEtmSpIpmWmSdO736/6D+x7OP3gUCoWCv1cqlSQlJZGcnExKSgqpqamkpaWRnp5ORkYGmZmZqFQqsrKyyM7OJicnh9zcXNRqNXl5eeTn56PRaCgoKKCwsJCioiK0Wi3FxcWUlJRQWlpKWVkZ5eXlVFRUUFlZiU6no6qqiurqampqaqitraWurg69Xk99fT0GgwGj0UhDQwONjY00NTXR3NxMS0sLra2ttLW10d7ejslkwmw209HRQWdnJ11dXXR3d9PT00Nvby99fX309/czMDDA4OAgFouFoaEhrFYrw8PDjIyMMDo6ytjYGDabjfHxcSYmJpicnGRqagq73c709DQzMzPMzs4yNzfH/Pw8DocDp9OJy+XC7XazsLDA4uIiS0tLLC8vs7KywurqKmtra3g8HrxeLz6fD7/fz/r6OhsbG2xubrK1tcX29jaBQICdnR2CwSC7u7vs7e2xv7/PwcEBh4eHHB0dcXx8zMnJCaenp5ydnXF+fs7FxQWXl5dcXV1xfX3Nzc0Nt7e33N3dEQqFuL+/5+HhgXA4TCQS4fHxkaenJ56fn3l5eeH19ZVoNMrb2xvv7+98fHwQi8WIx+N8fn6SSCT4+vri+/ubn58ffn9/+VcKgSWwBJbAElgCS2AJLIElsASWwBJYAktgCSyBJbAElsASWAJLYAksgSWwBJbAElgCS2AJLIElsP4/WH8AmJ5Z6jHS4h8AAAAASUVORK5CYII=\")}.color-picker .alpha{direction:ltr;width:100%;height:16px;border:none;cursor:pointer;background-size:100% 100%;background-image:url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAAAQCAYAAAD06IYnAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AIWDwYQlZMa3gAAAWVJREFUaN7tmEGO6jAQRCsOArHgBpyAJYGjcGocxAm4A2IHpmoWE0eBH+ezmFlNvU06shJ3W6VEelWMUQAIIF9f6qZpimsA1LYtS2uF51/u27YVAFZVRUkEoGHdPV/sIcbIEIIkUdI/9Xa7neyv61+SWFUVAVCSct00TWn2fv6u3+Ecfd3tXzy/0+nEUu+SPjo/kqzrmiQpScN6v98XewfA8/lMkiLJ2WxGSUopcT6fM6U0NX9/frfbjev1WtfrlZfLhYfDQQHG/AIOlnGwjINlHCxjHCzjYJm/TJWdCwquJXseFFzGwDNNeiKMOJTO8xQdDQaeB29+K9efeLaBo9J7vdvtJj1RjFFjfiv7qv95tjx/7leSQgh93e1ffMeIp6O+YQjho/N791t1XVOSSI7N//K+4/GoxWLBx+PB5/Op5XLJ+/3OlJJWqxU3m83ovv5iGf8KjYNlHCxjHCzjYBkHy5gf5gusvQU7U37jTAAAAABJRU5ErkJggg==\")}.color-picker .type-policy{position:absolute;top:218px;right:12px;width:16px;height:24px;background-size:8px 16px;background-image:url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAgCAYAAAAffCjxAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAACewAAAnsB01CO3AAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAIASURBVEiJ7ZY9axRRFIafsxMStrLQJpAgpBFhi+C9w1YSo00I6RZ/g9vZpBf/QOr4GyRgkSKNSrAadsZqQGwCkuAWyRZJsySwvhZ7N/vhzrgbLH3Ld8597jlzz50zJokyxXH8DqDVar0qi6v8BbItqSGpEcfxdlmsFWXkvX8AfAVWg3UKPEnT9GKujMzsAFgZsVaCN1VTQd77XUnrgE1kv+6935268WRpzrnHZvYRWC7YvC3pRZZl3wozqtVqiyH9IgjAspkd1Gq1xUJQtVrdB9ZKIAOthdg/Qc65LUk7wNIMoCVJO865rYFhkqjX6/d7vV4GPJwBMqofURS5JEk6FYBer/eeYb/Mo9WwFnPOvQbeAvfuAAK4BN4sAJtAG/gJIElmNuiJyba3EGNmZiPeZuEVmVell/Y/6N+CzDn3AXhEOOo7Hv/3BeAz8IzQkMPnJbuPx1wC+yYJ7/0nYIP5S/0FHKdp+rwCEEXRS/rf5Hl1Gtb2M0iSpCOpCZzPATmX1EySpHMLAsiy7MjMDoHrGSDXZnaYZdnRwBh7J91utwmczAA6CbG3GgPleX4jqUH/a1CktqRGnuc3hSCAMB32gKspkCtgb3KCQMmkjeP4WNJThrNNZval1WptTIsv7JtQ4tmIdRa8qSoEpWl6YWZNoAN0zKxZNPehpLSBZv2t+Q0CJ9lLnARQLAAAAABJRU5ErkJggg==\");background-repeat:no-repeat;background-position:50%}.color-picker .type-policy .type-policy-arrow{display:block;width:100%;height:50%}.color-picker .selected-color{position:absolute;top:16px;left:8px;width:40px;height:40px;border:1px solid #a9a9a9;border-radius:50%}.color-picker .selected-color-background{width:40px;height:40px;border-radius:50%;background-image:url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAh0lEQVRYR+2W0QlAMQgD60zdfwOdqa8TmI/wQMr5K0I5bZLIzLOa2nt37VVVbd+dDx5obgCC3KBLwJ2ff4PnVidkf+ucIhw80HQaCLo3DMH3CRK3iFsmAWVl6hPNDwt8EvNE5q+YuEXcMgkonVM6SdyCoEvAnZ8v1Hjx817MilmxSUB5rdLJDycZgUAZUch/AAAAAElFTkSuQmCC\")}.color-picker .saturation-lightness{direction:ltr;width:100%;height:130px;border:none;cursor:pointer;touch-action:manipulation;background-size:100% 100%;background-image:url(\"data:image/png;base64,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\")}.color-picker .cp-add-color-button-class{position:absolute;display:inline;padding:0;margin:3px -3px;border:0;cursor:pointer;background:transparent}.color-picker .cp-add-color-button-class:hover{text-decoration:underline}.color-picker .cp-add-color-button-class:disabled{cursor:not-allowed;color:#999}.color-picker .cp-add-color-button-class:disabled:hover{text-decoration:none}.color-picker .cp-remove-color-button-class{position:absolute;top:-5px;right:-5px;display:block;width:10px;height:10px;border-radius:50%;cursor:pointer;text-align:center;background:#fff;box-shadow:1px 1px 5px #333}.color-picker .cp-remove-color-button-class:before{content:\"x\";position:relative;bottom:3.5px;display:inline-block;font-size:10px}.ant-btn{border-radius:10px!important}.ant-btn-primary{background:#009fda}.ant-btn-background-ghost.ant-btn-primary{color:#009fda;border-color:#009fda}"]
            },] }
];
ColorPickerComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef },
    { type: ColorPickerService }
];
ColorPickerComponent.propDecorators = {
    dialogElement: [{ type: ViewChild, args: ['dialogPopup', { static: true },] }],
    hueSlider: [{ type: ViewChild, args: ['hueSlider', { static: true },] }],
    alphaSlider: [{ type: ViewChild, args: ['alphaSlider', { static: true },] }],
    handleEsc: [{ type: HostListener, args: ['document:keyup.esc', ['$event'],] }],
    handleEnter: [{ type: HostListener, args: ['document:keyup.enter', ['$event'],] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3ItcGlja2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2xpYi9zcmMvbGliL2NvbG9yLXBpY2tlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFNBQVMsRUFJVCxTQUFTLEVBQ1QsWUFBWSxFQUNaLGlCQUFpQixFQUNqQixVQUFVLEVBQ1YsaUJBQWlCLEdBQ2xCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBRSxRQUFRLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFL0QsT0FBTyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDakUsT0FBTyxFQUdMLGVBQWUsRUFDZixjQUFjLEdBQ2YsTUFBTSxXQUFXLENBQUM7QUFFbkIsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFRNUQsTUFBTSxPQUFPLG9CQUFvQjtJQTZIL0IsWUFDVSxLQUFpQixFQUNqQixLQUF3QixFQUN4QixPQUEyQjtRQUYzQixVQUFLLEdBQUwsS0FBSyxDQUFZO1FBQ2pCLFVBQUssR0FBTCxLQUFLLENBQW1CO1FBQ3hCLFlBQU8sR0FBUCxPQUFPLENBQW9CO1FBL0g3QixXQUFNLEdBQVksS0FBSyxDQUFDO1FBc0J4QixvQkFBZSxHQUFXLEVBQUUsQ0FBQztRQUM3QixzQkFBaUIsR0FBVyxFQUFFLENBQUM7UUFFL0Isc0JBQWlCLEdBQW1CO1lBQzFDLFlBQVksQ0FBQyxHQUFHO1lBQ2hCLFlBQVksQ0FBQyxJQUFJO1lBQ2pCLFlBQVksQ0FBQyxJQUFJO1lBQ2pCLFlBQVksQ0FBQyxJQUFJO1NBQ2xCLENBQUM7UUFFTSx5QkFBb0IsR0FBWSxLQUFLLENBQUM7SUFnRzNDLENBQUM7SUFsQjRDLFNBQVMsQ0FBQyxLQUFVO1FBQ2xFLElBQUks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QU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pFLElBQUksRUFDRixPQUFPLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxJQUFJO2dCQUNwQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLEtBQUssRUFBRSxPQUFPLENBQUMsV0FBVztZQUMxQixNQUFNLEVBQUUsT0FBTyxDQUFDLFlBQVk7U0FDN0IsQ0FBQztJQUNKLENBQUM7OztZQW5xQ0YsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxjQUFjO2dCQUN4Qix3clhBQTRDO2dCQUU1QyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTs7YUFDdEM7OztZQXJCQyxVQUFVO1lBQ1YsaUJBQWlCO1lBYVYsa0JBQWtCOzs7NEJBa0h4QixTQUFTLFNBQUMsYUFBYSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTt3QkFFekMsU0FBUyxTQUFDLFdBQVcsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7MEJBQ3ZDLFNBQVMsU0FBQyxhQUFhLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO3dCQUV6QyxZQUFZLFNBQUMsb0JBQW9CLEVBQUUsQ0FBQyxRQUFRLENBQUM7MEJBTTdDLFlBQVksU0FBQyxzQkFBc0IsRUFBRSxDQUFDLFFBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBvbmVudCxcbiAgT25Jbml0LFxuICBPbkRlc3Ryb3ksXG4gIEFmdGVyVmlld0luaXQsXG4gIFZpZXdDaGlsZCxcbiAgSG9zdExpc3RlbmVyLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgRWxlbWVudFJlZixcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBkZXRlY3RJRSwgY2FsY3VsYXRlQXV0b1Bvc2l0aW9uaW5nIH0gZnJvbSAnLi9oZWxwZXJzJztcblxuaW1wb3J0IHsgQ29sb3JGb3JtYXRzLCBDbXlrLCBIc2xhLCBIc3ZhLCBSZ2JhIH0gZnJvbSAnLi9mb3JtYXRzJztcbmltcG9ydCB7XG4gIEFscGhhQ2hhbm5lbCxcbiAgT3V0cHV0Rm9ybWF0LFxuICBTbGlkZXJEaW1lbnNpb24sXG4gIFNsaWRlclBvc2l0aW9uLFxufSBmcm9tICcuL2hlbHBlcnMnO1xuXG5pbXBvcnQgeyBDb2xvclBpY2tlclNlcnZpY2UgfSBmcm9tICcuL2NvbG9yLXBpY2tlci5zZXJ2aWNlJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnY29sb3ItcGlja2VyJyxcbiAgdGVtcGxhdGVVcmw6ICcuL2NvbG9yLXBpY2tlci5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL2NvbG9yLXBpY2tlci5jb21wb25lbnQuY3NzJ10sXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG59KVxuZXhwb3J0IGNsYXNzIENvbG9yUGlja2VyQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3ksIEFmdGVyVmlld0luaXQge1xuICBwcml2YXRlIGlzSUUxMDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHByaXZhdGUgY215azogQ215aztcbiAgcHJpdmF0ZSBoc3ZhOiBIc3ZhO1xuXG4gIHByaXZhdGUgd2lkdGg6IG51bWJlcjtcbiAgcHJpdmF0ZSBoZWlnaHQ6IG51bWJlcjtcblxuICBwcml2YXRlIGNteWtDb2xvcjogc3RyaW5nO1xuICBwcml2YXRlIG91dHB1dENvbG9yOiBzdHJpbmc7XG4gIHByaXZhdGUgaW5pdGlhbENvbG9yOiBzdHJpbmc7XG4gIHByaXZhdGUgZmFsbGJhY2tDb2xvcjogc3RyaW5nO1xuXG4gIHByaXZhdGUgbGlzdGVuZXJSZXNpemU6IGFueTtcbiAgcHJpdmF0ZSBsaXN0ZW5lck1vdXNlRG93bjogYW55O1xuXG4gIHByaXZhdGUgZGlyZWN0aXZlSW5zdGFuY2U6IGFueTtcblxuICBwcml2YXRlIHNsaWRlckg6IG51bWJlcjtcbiAgcHJpdmF0ZSBzbGlkZXJEaW1NYXg6IFNsaWRlckRpbWVuc2lvbjtcbiAgcHJpdmF0ZSBkaXJlY3RpdmVFbGVtZW50UmVmOiBFbGVtZW50UmVmO1xuXG4gIHByaXZhdGUgZGlhbG9nQXJyb3dTaXplOiBudW1iZXIgPSAxMDtcbiAgcHJpdmF0ZSBkaWFsb2dBcnJvd09mZnNldDogbnVtYmVyID0gMTU7XG5cbiAgcHJpdmF0ZSBkaWFsb2dJbnB1dEZpZWxkczogQ29sb3JGb3JtYXRzW10gPSBbXG4gICAgQ29sb3JGb3JtYXRzLkhFWCxcbiAgICBDb2xvckZvcm1hdHMuUkdCQSxcbiAgICBDb2xvckZvcm1hdHMuSFNMQSxcbiAgICBDb2xvckZvcm1hdHMuQ01ZSyxcbiAgXTtcblxuICBwcml2YXRlIHVzZVJvb3RWaWV3Q29udGFpbmVyOiBib29sZWFuID0gZmFsc2U7XG5cbiAgcHVibGljIHNob3c6IGJvb2xlYW47XG4gIHB1YmxpYyBoaWRkZW46IGJvb2xlYW47XG5cbiAgcHVibGljIHRvcDogbnVtYmVyO1xuICBwdWJsaWMgbGVmdDogbnVtYmVyO1xuICBwdWJsaWMgcG9zaXRpb246IHN0cmluZztcblxuICBwdWJsaWMgZm9ybWF0OiBDb2xvckZvcm1hdHM7XG4gIHB1YmxpYyBzbGlkZXI6IFNsaWRlclBvc2l0aW9uO1xuXG4gIHB1YmxpYyBoZXhUZXh0OiBzdHJpbmc7XG4gIHB1YmxpYyBoZXhBbHBoYTogbnVtYmVyO1xuXG4gIHB1YmxpYyBjbXlrVGV4dDogQ215aztcbiAgcHVibGljIGhzbGFUZXh0OiBIc2xhO1xuICBwdWJsaWMgcmdiYVRleHQ6IFJnYmE7XG5cbiAgcHVibGljIGFycm93VG9wOiBudW1iZXI7XG5cbiAgcHVibGljIHNlbGVjdGVkQ29sb3I6IHN0cmluZztcbiAgcHVibGljIGh1ZVNsaWRlckNvbG9yOiBzdHJpbmc7XG4gIHB1YmxpYyBhbHBoYVNsaWRlckNvbG9yOiBzdHJpbmc7XG5cbiAgcHVibGljIGNwV2lkdGg6IG51bWJlcjtcbiAgcHVibGljIGNwSGVpZ2h0OiBudW1iZXI7XG5cbiAgcHVibGljIGNwQ29sb3JNb2RlOiBudW1iZXI7XG5cbiAgcHVibGljIGNwQ215a0VuYWJsZWQ6IGJvb2xlYW47XG5cbiAgcHVibGljIGNwQWxwaGFDaGFubmVsOiBBbHBoYUNoYW5uZWw7XG4gIHB1YmxpYyBjcE91dHB1dEZvcm1hdDogT3V0cHV0Rm9ybWF0O1xuXG4gIHB1YmxpYyBjcERpc2FibGVJbnB1dDogYm9vbGVhbjtcbiAgcHVibGljIGNwRGlhbG9nRGlzcGxheTogc3RyaW5nO1xuXG4gIHB1YmxpYyBjcElnbm9yZWRFbGVtZW50czogYW55O1xuXG4gIHB1YmxpYyBjcFNhdmVDbGlja091dHNpZGU6IGJvb2xlYW47XG4gIHB1YmxpYyBjcENsb3NlQ2xpY2tPdXRzaWRlOiBib29sZWFuO1xuXG4gIHB1YmxpYyBjcFBvc2l0aW9uOiBzdHJpbmc7XG4gIHB1YmxpYyBjcFVzZVBvc2l0aW9uOiBzdHJpbmc7XG4gIHB1YmxpYyBjcFBvc2l0aW9uT2Zmc2V0OiBudW1iZXI7XG5cbiAgcHVibGljIGNwT0tCdXR0b246IGJvb2xlYW47XG4gIHB1YmxpYyBjcE9LQnV0dG9uVGV4dDogc3RyaW5nO1xuICBwdWJsaWMgY3BPS0J1dHRvbkNsYXNzOiBzdHJpbmc7XG5cbiAgcHVibGljIGNwQ2FuY2VsQnV0dG9uOiBib29sZWFuO1xuICBwdWJsaWMgY3BDYW5jZWxCdXR0b25UZXh0OiBzdHJpbmc7XG4gIHB1YmxpYyBjcENhbmNlbEJ1dHRvbkNsYXNzOiBzdHJpbmc7XG5cbiAgcHVibGljIGNwUHJlc2V0TGFiZWw6IHN0cmluZztcbiAgcHVibGljIGNwUHJlc2V0Q29sb3JzOiBzdHJpbmdbXTtcbiAgcHVibGljIGNwUHJlc2V0Q29sb3JzQ2xhc3M6IHN0cmluZztcbiAgcHVibGljIGNwTWF4UHJlc2V0Q29sb3JzTGVuZ3RoOiBudW1iZXI7XG5cbiAgcHVibGljIGNwUHJlc2V0RW1wdHlNZXNzYWdlOiBzdHJpbmc7XG4gIHB1YmxpYyBjcFByZXNldEVtcHR5TWVzc2FnZUNsYXNzOiBzdHJpbmc7XG5cbiAgcHVibGljIGNwQWRkQ29sb3JCdXR0b246IGJvb2xlYW47XG4gIHB1YmxpYyBjcEFkZENvbG9yQnV0dG9uVGV4dDogc3RyaW5nO1xuICBwdWJsaWMgY3BBZGRDb2xvckJ1dHRvbkNsYXNzOiBzdHJpbmc7XG4gIHB1YmxpYyBjcFJlbW92ZUNvbG9yQnV0dG9uQ2xhc3M6IHN0cmluZztcblxuICBwdWJsaWMgY3BUcmlnZ2VyRWxlbWVudDogRWxlbWVudFJlZjtcblxuICAvLyBBZGRpdGlvbmFsXG4gIHB1YmxpYyBpc1Nob3dTZWxlY3RDb2xvclR5cGU6IGJvb2xlYW47XG5cbiAgQFZpZXdDaGlsZCgnZGlhbG9nUG9wdXAnLCB7IHN0YXRpYzogdHJ1ZSB9KSBkaWFsb2dFbGVtZW50OiBFbGVtZW50UmVmO1xuXG4gIEBWaWV3Q2hpbGQoJ2h1ZVNsaWRlcicsIHsgc3RhdGljOiB0cnVlIH0pIGh1ZVNsaWRlcjogRWxlbWVudFJlZjtcbiAgQFZpZXdDaGlsZCgnYWxwaGFTbGlkZXInLCB7IHN0YXRpYzogdHJ1ZSB9KSBhbHBoYVNsaWRlcjogRWxlbWVudFJlZjtcblxuICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDprZXl1cC5lc2MnLCBbJyRldmVudCddKSBoYW5kbGVFc2MoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgIGlmICh0aGlzLnNob3cgJiYgdGhpcy5jcERpYWxvZ0Rpc3BsYXkgPT09ICdwb3B1cCcpIHtcbiAgICAgIHRoaXMub25DYW5jZWxDb2xvcihldmVudCk7XG4gICAgfVxuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6a2V5dXAuZW50ZXInLCBbJyRldmVudCddKSBoYW5kbGVFbnRlcihcbiAgICBldmVudDogYW55XG4gICk6IHZvaWQge1xuICAgIGlmICh0aGlzLnNob3cgJiYgdGhpcy5jcERpYWxvZ0Rpc3BsYXkgPT09ICdwb3B1cCcpIHtcbiAgICAgIHRoaXMub25BY2NlcHRDb2xvcihldmVudCk7XG4gICAgfVxuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBlbFJlZjogRWxlbWVudFJlZixcbiAgICBwcml2YXRlIGNkUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBwcml2YXRlIHNlcnZpY2U6IENvbG9yUGlja2VyU2VydmljZVxuICApIHt9XG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgdGhpcy5zbGlkZXIgPSBuZXcgU2xpZGVyUG9zaXRpb24oMCwgMCwgMCwgMCk7XG5cbiAgICBjb25zdCBodWVXaWR0aCA9IHRoaXMuaHVlU2xpZGVyLm5hdGl2ZUVsZW1lbnQub2Zmc2V0V2lkdGggfHwgMTQwO1xuICAgIGNvbnN0IGFscGhhV2lkdGggPSB0aGlzLmFscGhhU2xpZGVyLm5hdGl2ZUVsZW1lbnQub2Zmc2V0V2lkdGggfHwgMTQwO1xuXG4gICAgdGhpcy5zbGlkZXJEaW1NYXggPSBuZXcgU2xpZGVyRGltZW5zaW9uKFxuICAgICAgaHVlV2lkdGgsXG4gICAgICB0aGlzLmNwV2lkdGgsXG4gICAgICAxMzAsXG4gICAgICBhbHBoYVdpZHRoXG4gICAgKTtcblxuICAgIGlmICh0aGlzLmNwQ215a0VuYWJsZWQpIHtcbiAgICAgIHRoaXMuZm9ybWF0ID0gQ29sb3JGb3JtYXRzLkNNWUs7XG4gICAgfSBlbHNlIGlmICh0aGlzLmNwT3V0cHV0Rm9ybWF0ID09PSAncmdiYScpIHtcbiAgICAgIHRoaXMuZm9ybWF0ID0gQ29sb3JGb3JtYXRzLlJHQkE7XG4gICAgfSBlbHNlIGlmICh0aGlzLmNwT3V0cHV0Rm9ybWF0ID09PSAnaHNsYScpIHtcbiAgICAgIHRoaXMuZm9ybWF0ID0gQ29sb3JGb3JtYXRzLkhTTEE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZm9ybWF0ID0gQ29sb3JGb3JtYXRzLkhFWDtcbiAgICB9XG5cbiAgICB0aGlzLmxpc3RlbmVyTW91c2VEb3duID0gKGV2ZW50OiBhbnkpID0+IHtcbiAgICAgIHRoaXMub25Nb3VzZURvd24oZXZlbnQpO1xuICAgIH07XG4gICAgdGhpcy5saXN0ZW5lclJlc2l6ZSA9ICgpID0+IHtcbiAgICAgIHRoaXMub25SZXNpemUoKTtcbiAgICB9O1xuXG4gICAgdGhpcy5vcGVuRGlhbG9nKHRoaXMuaW5pdGlhbENvbG9yLCBmYWxzZSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmNsb3NlRGlhbG9nKCk7XG4gIH1cblxuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY3BXaWR0aCAhPT0gMjMwIHx8IHRoaXMuY3BEaWFsb2dEaXNwbGF5ID09PSAnaW5saW5lJykge1xuICAgICAgY29uc3QgaHVlV2lkdGggPSB0aGlzLmh1ZVNsaWRlci5uYXRpdmVFbGVtZW50Lm9mZnNldFdpZHRoIHx8IDE0MDtcbiAgICAgIGNvbnN0IGFscGhhV2lkdGggPSB0aGlzLmFscGhhU2xpZGVyLm5hdGl2ZUVsZW1lbnQub2Zmc2V0V2lkdGggfHwgMTQwO1xuXG4gICAgICB0aGlzLnNsaWRlckRpbU1heCA9IG5ldyBTbGlkZXJEaW1lbnNpb24oXG4gICAgICAgIGh1ZVdpZHRoLFxuICAgICAgICB0aGlzLmNwV2lkdGgsXG4gICAgICAgIDEzMCxcbiAgICAgICAgYWxwaGFXaWR0aFxuICAgICAgKTtcblxuICAgICAgdGhpcy51cGRhdGVDb2xvclBpY2tlcihmYWxzZSk7XG5cbiAgICAgIHRoaXMuY2RSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBvcGVuRGlhbG9nKGNvbG9yOiBhbnksIGVtaXQ6IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XG4gICAgdGhpcy5zZXJ2aWNlLnNldEFjdGl2ZSh0aGlzKTtcblxuICAgIGlmICghdGhpcy53aWR0aCkge1xuICAgICAgdGhpcy5jcFdpZHRoID0gdGhpcy5kaXJlY3RpdmVFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmhlaWdodCkge1xuICAgICAgdGhpcy5oZWlnaHQgPSAzMjA7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRJbml0aWFsQ29sb3IoY29sb3IpO1xuXG4gICAgdGhpcy5zZXRDb2xvckZyb21TdHJpbmcoY29sb3IsIGVtaXQpO1xuXG4gICAgdGhpcy5vcGVuQ29sb3JQaWNrZXIoKTtcbiAgfVxuXG4gIHB1YmxpYyBjbG9zZURpYWxvZygpOiB2b2lkIHtcbiAgICB0aGlzLmNsb3NlQ29sb3JQaWNrZXIoKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXR1cERpYWxvZyhcbiAgICBpbnN0YW5jZTogYW55LFxuICAgIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgY29sb3I6IGFueSxcbiAgICBjcFdpZHRoOiBzdHJpbmcsXG4gICAgY3BIZWlnaHQ6IHN0cmluZyxcbiAgICBjcERpYWxvZ0Rpc3BsYXk6IHN0cmluZyxcbiAgICBjcEZhbGxiYWNrQ29sb3I6IHN0cmluZyxcbiAgICBjcENvbG9yTW9kZTogc3RyaW5nLFxuICAgIGNwQ215a0VuYWJsZWQ6IGJvb2xlYW4sXG4gICAgY3BBbHBoYUNoYW5uZWw6IEFscGhhQ2hhbm5lbCxcbiAgICBjcE91dHB1dEZvcm1hdDogT3V0cHV0Rm9ybWF0LFxuICAgIGNwRGlzYWJsZUlucHV0OiBib29sZWFuLFxuICAgIGNwSWdub3JlZEVsZW1lbnRzOiBhbnksXG4gICAgY3BTYXZlQ2xpY2tPdXRzaWRlOiBib29sZWFuLFxuICAgIGNwQ2xvc2VDbGlja091dHNpZGU6IGJvb2xlYW4sXG4gICAgY3BVc2VSb290Vmlld0NvbnRhaW5lcjogYm9vbGVhbixcbiAgICBjcFBvc2l0aW9uOiBzdHJpbmcsXG4gICAgY3BQb3NpdGlvbk9mZnNldDogc3RyaW5nLFxuICAgIGNwUG9zaXRpb25SZWxhdGl2ZVRvQXJyb3c6IGJvb2xlYW4sXG4gICAgY3BQcmVzZXRMYWJlbDogc3RyaW5nLFxuICAgIGNwUHJlc2V0Q29sb3JzOiBzdHJpbmdbXSxcbiAgICBjcFByZXNldENvbG9yc0NsYXNzOiBzdHJpbmcsXG4gICAgY3BNYXhQcmVzZXRDb2xvcnNMZW5ndGg6IG51bWJlcixcbiAgICBjcFByZXNldEVtcHR5TWVzc2FnZTogc3RyaW5nLFxuICAgIGNwUHJlc2V0RW1wdHlNZXNzYWdlQ2xhc3M6IHN0cmluZyxcbiAgICBjcE9LQnV0dG9uOiBib29sZWFuLFxuICAgIGNwT0tCdXR0b25DbGFzczogc3RyaW5nLFxuICAgIGNwT0tCdXR0b25UZXh0OiBzdHJpbmcsXG4gICAgY3BDYW5jZWxCdXR0b246IGJvb2xlYW4sXG4gICAgY3BDYW5jZWxCdXR0b25DbGFzczogc3RyaW5nLFxuICAgIGNwQ2FuY2VsQnV0dG9uVGV4dDogc3RyaW5nLFxuICAgIGNwQWRkQ29sb3JCdXR0b246IGJvb2xlYW4sXG4gICAgY3BBZGRDb2xvckJ1dHRvbkNsYXNzOiBzdHJpbmcsXG4gICAgY3BBZGRDb2xvckJ1dHRvblRleHQ6IHN0cmluZyxcbiAgICBjcFJlbW92ZUNvbG9yQnV0dG9uQ2xhc3M6IHN0cmluZyxcbiAgICBjcFRyaWdnZXJFbGVtZW50OiBFbGVtZW50UmVmLFxuICAgIGlzU2hvd1NlbGVjdENvbG9yVHlwZTogYm9vbGVhblxuICApOiB2b2lkIHtcbiAgICB0aGlzLnNldEluaXRpYWxDb2xvcihjb2xvcik7XG5cbiAgICB0aGlzLnNldENvbG9yTW9kZShjcENvbG9yTW9kZSk7XG5cbiAgICB0aGlzLmlzSUUxMCA9IGRldGVjdElFKCkgPT09IDEwO1xuXG4gICAgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZSA9IGluc3RhbmNlO1xuICAgIHRoaXMuZGlyZWN0aXZlRWxlbWVudFJlZiA9IGVsZW1lbnRSZWY7XG5cbiAgICB0aGlzLmNwRGlzYWJsZUlucHV0ID0gY3BEaXNhYmxlSW5wdXQ7XG5cbiAgICB0aGlzLmNwQ215a0VuYWJsZWQgPSBjcENteWtFbmFibGVkO1xuICAgIHRoaXMuY3BBbHBoYUNoYW5uZWwgPSBjcEFscGhhQ2hhbm5lbDtcbiAgICB0aGlzLmNwT3V0cHV0Rm9ybWF0ID0gY3BPdXRwdXRGb3JtYXQ7XG5cbiAgICB0aGlzLmNwRGlhbG9nRGlzcGxheSA9IGNwRGlhbG9nRGlzcGxheTtcblxuICAgIHRoaXMuY3BJZ25vcmVkRWxlbWVudHMgPSBjcElnbm9yZWRFbGVtZW50cztcblxuICAgIHRoaXMuY3BTYXZlQ2xpY2tPdXRzaWRlID0gY3BTYXZlQ2xpY2tPdXRzaWRlO1xuICAgIHRoaXMuY3BDbG9zZUNsaWNrT3V0c2lkZSA9IGNwQ2xvc2VDbGlja091dHNpZGU7XG5cbiAgICB0aGlzLnVzZVJvb3RWaWV3Q29udGFpbmVyID0gY3BVc2VSb290Vmlld0NvbnRhaW5lcjtcblxuICAgIHRoaXMud2lkdGggPSB0aGlzLmNwV2lkdGggPSBwYXJzZUludChjcFdpZHRoLCAxMCk7XG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLmNwSGVpZ2h0ID0gcGFyc2VJbnQoY3BIZWlnaHQsIDEwKTtcblxuICAgIHRoaXMuY3BQb3NpdGlvbiA9IGNwUG9zaXRpb247XG4gICAgdGhpcy5jcFBvc2l0aW9uT2Zmc2V0ID0gcGFyc2VJbnQoY3BQb3NpdGlvbk9mZnNldCwgMTApO1xuXG4gICAgdGhpcy5jcE9LQnV0dG9uID0gY3BPS0J1dHRvbjtcbiAgICB0aGlzLmNwT0tCdXR0b25UZXh0ID0gY3BPS0J1dHRvblRleHQ7XG4gICAgdGhpcy5jcE9LQnV0dG9uQ2xhc3MgPSBjcE9LQnV0dG9uQ2xhc3M7XG5cbiAgICB0aGlzLmNwQ2FuY2VsQnV0dG9uID0gY3BDYW5jZWxCdXR0b247XG4gICAgdGhpcy5jcENhbmNlbEJ1dHRvblRleHQgPSBjcENhbmNlbEJ1dHRvblRleHQ7XG4gICAgdGhpcy5jcENhbmNlbEJ1dHRvbkNsYXNzID0gY3BDYW5jZWxCdXR0b25DbGFzcztcblxuICAgIHRoaXMuZmFsbGJhY2tDb2xvciA9IGNwRmFsbGJhY2tDb2xvciB8fCAnI2ZmZic7XG5cbiAgICB0aGlzLnNldFByZXNldENvbmZpZyhjcFByZXNldExhYmVsLCBjcFByZXNldENvbG9ycyk7XG5cbiAgICB0aGlzLmNwUHJlc2V0Q29sb3JzQ2xhc3MgPSBjcFByZXNldENvbG9yc0NsYXNzO1xuICAgIHRoaXMuY3BNYXhQcmVzZXRDb2xvcnNMZW5ndGggPSBjcE1heFByZXNldENvbG9yc0xlbmd0aDtcbiAgICB0aGlzLmNwUHJlc2V0RW1wdHlNZXNzYWdlID0gY3BQcmVzZXRFbXB0eU1lc3NhZ2U7XG4gICAgdGhpcy5jcFByZXNldEVtcHR5TWVzc2FnZUNsYXNzID0gY3BQcmVzZXRFbXB0eU1lc3NhZ2VDbGFzcztcblxuICAgIHRoaXMuY3BBZGRDb2xvckJ1dHRvbiA9IGNwQWRkQ29sb3JCdXR0b247XG4gICAgdGhpcy5jcEFkZENvbG9yQnV0dG9uVGV4dCA9IGNwQWRkQ29sb3JCdXR0b25UZXh0O1xuICAgIHRoaXMuY3BBZGRDb2xvckJ1dHRvbkNsYXNzID0gY3BBZGRDb2xvckJ1dHRvbkNsYXNzO1xuICAgIHRoaXMuY3BSZW1vdmVDb2xvckJ1dHRvbkNsYXNzID0gY3BSZW1vdmVDb2xvckJ1dHRvbkNsYXNzO1xuXG4gICAgdGhpcy5jcFRyaWdnZXJFbGVtZW50ID0gY3BUcmlnZ2VyRWxlbWVudDtcblxuICAgIC8vIEFkZGl0aW9uYWxcbiAgICB0aGlzLmlzU2hvd1NlbGVjdENvbG9yVHlwZSA9IGlzU2hvd1NlbGVjdENvbG9yVHlwZTtcblxuICAgIGlmICghY3BQb3NpdGlvblJlbGF0aXZlVG9BcnJvdykge1xuICAgICAgdGhpcy5kaWFsb2dBcnJvd09mZnNldCA9IDA7XG4gICAgfVxuXG4gICAgaWYgKGNwRGlhbG9nRGlzcGxheSA9PT0gJ2lubGluZScpIHtcbiAgICAgIHRoaXMuZGlhbG9nQXJyb3dTaXplID0gMDtcbiAgICAgIHRoaXMuZGlhbG9nQXJyb3dPZmZzZXQgPSAwO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIGNwT3V0cHV0Rm9ybWF0ID09PSAnaGV4JyAmJlxuICAgICAgY3BBbHBoYUNoYW5uZWwgIT09ICdhbHdheXMnICYmXG4gICAgICBjcEFscGhhQ2hhbm5lbCAhPT0gJ2ZvcmNlZCdcbiAgICApIHtcbiAgICAgIHRoaXMuY3BBbHBoYUNoYW5uZWwgPSAnZGlzYWJsZWQnO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXRDb2xvck1vZGUobW9kZTogc3RyaW5nKTogdm9pZCB7XG4gICAgc3dpdGNoIChtb2RlLnRvU3RyaW5nKCkudG9VcHBlckNhc2UoKSkge1xuICAgICAgY2FzZSAnMSc6XG4gICAgICBjYXNlICdDJzpcbiAgICAgIGNhc2UgJ0NPTE9SJzpcbiAgICAgICAgdGhpcy5jcENvbG9yTW9kZSA9IDE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnMic6XG4gICAgICBjYXNlICdHJzpcbiAgICAgIGNhc2UgJ0dSQVlTQ0FMRSc6XG4gICAgICAgIHRoaXMuY3BDb2xvck1vZGUgPSAyO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJzMnOlxuICAgICAgY2FzZSAnUCc6XG4gICAgICBjYXNlICdQUkVTRVRTJzpcbiAgICAgICAgdGhpcy5jcENvbG9yTW9kZSA9IDM7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5jcENvbG9yTW9kZSA9IDE7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNldEluaXRpYWxDb2xvcihjb2xvcjogYW55KTogdm9pZCB7XG4gICAgdGhpcy5pbml0aWFsQ29sb3IgPSBjb2xvcjtcbiAgfVxuXG4gIHB1YmxpYyBzZXRQcmVzZXRDb25maWcoXG4gICAgY3BQcmVzZXRMYWJlbDogc3RyaW5nLFxuICAgIGNwUHJlc2V0Q29sb3JzOiBzdHJpbmdbXVxuICApOiB2b2lkIHtcbiAgICB0aGlzLmNwUHJlc2V0TGFiZWwgPSBjcFByZXNldExhYmVsO1xuICAgIHRoaXMuY3BQcmVzZXRDb2xvcnMgPSBjcFByZXNldENvbG9ycztcbiAgfVxuXG4gIHB1YmxpYyBzZXRDb2xvckZyb21TdHJpbmcoXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICBlbWl0OiBib29sZWFuID0gdHJ1ZSxcbiAgICB1cGRhdGU6IGJvb2xlYW4gPSB0cnVlXG4gICk6IHZvaWQge1xuICAgIGxldCBoc3ZhOiBIc3ZhIHwgbnVsbDtcblxuICAgIGlmICh0aGlzLmNwQWxwaGFDaGFubmVsID09PSAnYWx3YXlzJyB8fCB0aGlzLmNwQWxwaGFDaGFubmVsID09PSAnZm9yY2VkJykge1xuICAgICAgaHN2YSA9IHRoaXMuc2VydmljZS5zdHJpbmdUb0hzdmEodmFsdWUsIHRydWUpO1xuXG4gICAgICBpZiAoIWhzdmEgJiYgIXRoaXMuaHN2YSkge1xuICAgICAgICBoc3ZhID0gdGhpcy5zZXJ2aWNlLnN0cmluZ1RvSHN2YSh2YWx1ZSwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBoc3ZhID0gdGhpcy5zZXJ2aWNlLnN0cmluZ1RvSHN2YSh2YWx1ZSwgZmFsc2UpO1xuICAgIH1cblxuICAgIGlmICghaHN2YSAmJiAhdGhpcy5oc3ZhKSB7XG4gICAgICBoc3ZhID0gdGhpcy5zZXJ2aWNlLnN0cmluZ1RvSHN2YSh0aGlzLmZhbGxiYWNrQ29sb3IsIGZhbHNlKTtcbiAgICB9XG5cbiAgICBpZiAoaHN2YSkge1xuICAgICAgdGhpcy5oc3ZhID0gaHN2YTtcblxuICAgICAgdGhpcy5zbGlkZXJIID0gdGhpcy5oc3ZhLmg7XG5cbiAgICAgIGlmICh0aGlzLmNwT3V0cHV0Rm9ybWF0ID09PSAnaGV4JyAmJiB0aGlzLmNwQWxwaGFDaGFubmVsID09PSAnZGlzYWJsZWQnKSB7XG4gICAgICAgIHRoaXMuaHN2YS5hID0gMTtcbiAgICAgIH1cblxuICAgICAgdGhpcy51cGRhdGVDb2xvclBpY2tlcihlbWl0LCB1cGRhdGUpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBvblJlc2l6ZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5wb3NpdGlvbiA9PT0gJ2ZpeGVkJykge1xuICAgICAgdGhpcy5zZXREaWFsb2dQb3NpdGlvbigpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5jcERpYWxvZ0Rpc3BsYXkgIT09ICdpbmxpbmUnKSB7XG4gICAgICB0aGlzLmNsb3NlQ29sb3JQaWNrZXIoKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgb25EcmFnRW5kKHNsaWRlcjogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZS5zbGlkZXJEcmFnRW5kKHtcbiAgICAgIHNsaWRlcjogc2xpZGVyLFxuICAgICAgY29sb3I6IHRoaXMub3V0cHV0Q29sb3IsXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgb25EcmFnU3RhcnQoc2xpZGVyOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmRpcmVjdGl2ZUluc3RhbmNlLnNsaWRlckRyYWdTdGFydCh7XG4gICAgICBzbGlkZXI6IHNsaWRlcixcbiAgICAgIGNvbG9yOiB0aGlzLm91dHB1dENvbG9yLFxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG9uTW91c2VEb3duKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5zaG93ICYmXG4gICAgICAhdGhpcy5pc0lFMTAgJiZcbiAgICAgIHRoaXMuY3BEaWFsb2dEaXNwbGF5ID09PSAncG9wdXAnICYmXG4gICAgICBldmVudC50YXJnZXQgIT09IHRoaXMuZGlyZWN0aXZlRWxlbWVudFJlZi5uYXRpdmVFbGVtZW50ICYmXG4gICAgICAhdGhpcy5pc0Rlc2NlbmRhbnQodGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LCBldmVudC50YXJnZXQpICYmXG4gICAgICAhdGhpcy5pc0Rlc2NlbmRhbnQoXG4gICAgICAgIHRoaXMuZGlyZWN0aXZlRWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LFxuICAgICAgICBldmVudC50YXJnZXRcbiAgICAgICkgJiZcbiAgICAgIHRoaXMuY3BJZ25vcmVkRWxlbWVudHMuZmlsdGVyKChpdGVtOiBhbnkpID0+IGl0ZW0gPT09IGV2ZW50LnRhcmdldClcbiAgICAgICAgLmxlbmd0aCA9PT0gMFxuICAgICkge1xuICAgICAgaWYgKHRoaXMuY3BTYXZlQ2xpY2tPdXRzaWRlKSB7XG4gICAgICAgIHRoaXMuZGlyZWN0aXZlSW5zdGFuY2UuY29sb3JTZWxlY3RlZCh0aGlzLm91dHB1dENvbG9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaHN2YSA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5zZXRDb2xvckZyb21TdHJpbmcodGhpcy5pbml0aWFsQ29sb3IsIGZhbHNlKTtcblxuICAgICAgICBpZiAodGhpcy5jcENteWtFbmFibGVkKSB7XG4gICAgICAgICAgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZS5jbXlrQ2hhbmdlZCh0aGlzLmNteWtDb2xvcik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRpcmVjdGl2ZUluc3RhbmNlLmNvbG9yQ2hhbmdlZCh0aGlzLmluaXRpYWxDb2xvcik7XG5cbiAgICAgICAgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZS5jb2xvckNhbmNlbGVkKCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNwQ2xvc2VDbGlja091dHNpZGUpIHtcbiAgICAgICAgdGhpcy5jbG9zZUNvbG9yUGlja2VyKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHVibGljIG9uQWNjZXB0Q29sb3IoZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICBpZiAodGhpcy5vdXRwdXRDb2xvcikge1xuICAgICAgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZS5jb2xvclNlbGVjdGVkKHRoaXMub3V0cHV0Q29sb3IpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNwRGlhbG9nRGlzcGxheSA9PT0gJ3BvcHVwJykge1xuICAgICAgdGhpcy5jbG9zZUNvbG9yUGlja2VyKCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIG9uQ2FuY2VsQ29sb3IoZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5oc3ZhID0gbnVsbDtcblxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZS5jb2xvckNhbmNlbGVkKCk7XG5cbiAgICB0aGlzLnNldENvbG9yRnJvbVN0cmluZyh0aGlzLmluaXRpYWxDb2xvciwgdHJ1ZSk7XG5cbiAgICBpZiAodGhpcy5jcERpYWxvZ0Rpc3BsYXkgPT09ICdwb3B1cCcpIHtcbiAgICAgIGlmICh0aGlzLmNwQ215a0VuYWJsZWQpIHtcbiAgICAgICAgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZS5jbXlrQ2hhbmdlZCh0aGlzLmNteWtDb2xvcik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZGlyZWN0aXZlSW5zdGFuY2UuY29sb3JDaGFuZ2VkKHRoaXMuaW5pdGlhbENvbG9yLCB0cnVlKTtcblxuICAgICAgdGhpcy5jbG9zZUNvbG9yUGlja2VyKCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIG9uRm9ybWF0VG9nZ2xlKGNoYW5nZTogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgYXZhaWxhYmxlRm9ybWF0cyA9XG4gICAgICB0aGlzLmRpYWxvZ0lucHV0RmllbGRzLmxlbmd0aCAtICh0aGlzLmNwQ215a0VuYWJsZWQgPyAwIDogMSk7XG5cbiAgICBjb25zdCBuZXh0Rm9ybWF0ID1cbiAgICAgICgoKHRoaXMuZGlhbG9nSW5wdXRGaWVsZHMuaW5kZXhPZih0aGlzLmZvcm1hdCkgKyBjaGFuZ2UpICVcbiAgICAgICAgYXZhaWxhYmxlRm9ybWF0cykgK1xuICAgICAgICBhdmFpbGFibGVGb3JtYXRzKSAlXG4gICAgICBhdmFpbGFibGVGb3JtYXRzO1xuXG4gICAgdGhpcy5mb3JtYXQgPSB0aGlzLmRpYWxvZ0lucHV0RmllbGRzW25leHRGb3JtYXRdO1xuICB9XG5cbiAgcHVibGljIG9uQ29sb3JDaGFuZ2UodmFsdWU6IHtcbiAgICBzOiBudW1iZXI7XG4gICAgdjogbnVtYmVyO1xuICAgIHJnWDogbnVtYmVyO1xuICAgIHJnWTogbnVtYmVyO1xuICB9KTogdm9pZCB7XG4gICAgdGhpcy5oc3ZhLnMgPSB2YWx1ZS5zIC8gdmFsdWUucmdYO1xuICAgIHRoaXMuaHN2YS52ID0gdmFsdWUudiAvIHZhbHVlLnJnWTtcblxuICAgIHRoaXMudXBkYXRlQ29sb3JQaWNrZXIoKTtcblxuICAgIHRoaXMuZGlyZWN0aXZlSW5zdGFuY2Uuc2xpZGVyQ2hhbmdlZCh7XG4gICAgICBzbGlkZXI6ICdsaWdodG5lc3MnLFxuICAgICAgdmFsdWU6IHRoaXMuaHN2YS52LFxuICAgICAgY29sb3I6IHRoaXMub3V0cHV0Q29sb3IsXG4gICAgfSk7XG5cbiAgICB0aGlzLmRpcmVjdGl2ZUluc3RhbmNlLnNsaWRlckNoYW5nZWQoe1xuICAgICAgc2xpZGVyOiAnc2F0dXJhdGlvbicsXG4gICAgICB2YWx1ZTogdGhpcy5oc3ZhLnMsXG4gICAgICBjb2xvcjogdGhpcy5vdXRwdXRDb2xvcixcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvbkh1ZUNoYW5nZSh2YWx1ZTogeyB2OiBudW1iZXI7IHJnWDogbnVtYmVyIH0pOiB2b2lkIHtcbiAgICB0aGlzLmhzdmEuaCA9IHZhbHVlLnYgLyB2YWx1ZS5yZ1g7XG4gICAgdGhpcy5zbGlkZXJIID0gdGhpcy5oc3ZhLmg7XG5cbiAgICB0aGlzLnVwZGF0ZUNvbG9yUGlja2VyKCk7XG5cbiAgICB0aGlzLmRpcmVjdGl2ZUluc3RhbmNlLnNsaWRlckNoYW5nZWQoe1xuICAgICAgc2xpZGVyOiAnaHVlJyxcbiAgICAgIHZhbHVlOiB0aGlzLmhzdmEuaCxcbiAgICAgIGNvbG9yOiB0aGlzLm91dHB1dENvbG9yLFxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG9uVmFsdWVDaGFuZ2UodmFsdWU6IHsgdjogbnVtYmVyOyByZ1g6IG51bWJlciB9KTogdm9pZCB7XG4gICAgdGhpcy5oc3ZhLnYgPSB2YWx1ZS52IC8gdmFsdWUucmdYO1xuXG4gICAgdGhpcy51cGRhdGVDb2xvclBpY2tlcigpO1xuXG4gICAgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZS5zbGlkZXJDaGFuZ2VkKHtcbiAgICAgIHNsaWRlcjogJ3ZhbHVlJyxcbiAgICAgIHZhbHVlOiB0aGlzLmhzdmEudixcbiAgICAgIGNvbG9yOiB0aGlzLm91dHB1dENvbG9yLFxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG9uQWxwaGFDaGFuZ2UodmFsdWU6IHsgdjogbnVtYmVyOyByZ1g6IG51bWJlciB9KTogdm9pZCB7XG4gICAgdGhpcy5oc3ZhLmEgPSB2YWx1ZS52IC8gdmFsdWUucmdYO1xuXG4gICAgdGhpcy51cGRhdGVDb2xvclBpY2tlcigpO1xuXG4gICAgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZS5zbGlkZXJDaGFuZ2VkKHtcbiAgICAgIHNsaWRlcjogJ2FscGhhJyxcbiAgICAgIHZhbHVlOiB0aGlzLmhzdmEuYSxcbiAgICAgIGNvbG9yOiB0aGlzLm91dHB1dENvbG9yLFxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG9uSGV4SW5wdXQodmFsdWU6IHN0cmluZyB8IG51bGwpOiB2b2lkIHtcbiAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHRoaXMudXBkYXRlQ29sb3JQaWNrZXIoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHZhbHVlICYmIHZhbHVlWzBdICE9PSAnIycpIHtcbiAgICAgICAgdmFsdWUgPSAnIycgKyB2YWx1ZTtcbiAgICAgIH1cblxuICAgICAgbGV0IHZhbGlkSGV4ID0gL14jKFthLWYwLTldezN9fFthLWYwLTldezZ9KSQvZ2k7XG5cbiAgICAgIGlmICh0aGlzLmNwQWxwaGFDaGFubmVsID09PSAnYWx3YXlzJykge1xuICAgICAgICB2YWxpZEhleCA9IC9eIyhbYS1mMC05XXszfXxbYS1mMC05XXs2fXxbYS1mMC05XXs4fSkkL2dpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB2YWxpZCA9IHZhbGlkSGV4LnRlc3QodmFsdWUpO1xuXG4gICAgICBpZiAodmFsaWQpIHtcbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA8IDUpIHtcbiAgICAgICAgICB2YWx1ZSA9XG4gICAgICAgICAgICAnIycgK1xuICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICAgLnN1YnN0cmluZygxKVxuICAgICAgICAgICAgICAuc3BsaXQoJycpXG4gICAgICAgICAgICAgIC5tYXAoKGMpID0+IGMgKyBjKVxuICAgICAgICAgICAgICAuam9pbignJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5jcEFscGhhQ2hhbm5lbCA9PT0gJ2ZvcmNlZCcpIHtcbiAgICAgICAgICB2YWx1ZSArPSBNYXRoLnJvdW5kKHRoaXMuaHN2YS5hICogMjU1KS50b1N0cmluZygxNik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldENvbG9yRnJvbVN0cmluZyh2YWx1ZSwgdHJ1ZSwgZmFsc2UpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmRpcmVjdGl2ZUluc3RhbmNlLmlucHV0Q2hhbmdlZCh7XG4gICAgICAgIGlucHV0OiAnaGV4JyxcbiAgICAgICAgdmFsaWQ6IHZhbGlkLFxuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIGNvbG9yOiB0aGlzLm91dHB1dENvbG9yLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIG9uUmVkSW5wdXQodmFsdWU6IHsgdjogbnVtYmVyOyByZzogbnVtYmVyIH0pOiB2b2lkIHtcbiAgICBjb25zdCByZ2JhID0gdGhpcy5zZXJ2aWNlLmhzdmFUb1JnYmEodGhpcy5oc3ZhKTtcblxuICAgIGNvbnN0IHZhbGlkID0gIWlzTmFOKHZhbHVlLnYpICYmIHZhbHVlLnYgPj0gMCAmJiB2YWx1ZS52IDw9IHZhbHVlLnJnO1xuXG4gICAgaWYgKHZhbGlkKSB7XG4gICAgICByZ2JhLnIgPSB2YWx1ZS52IC8gdmFsdWUucmc7XG5cbiAgICAgIHRoaXMuaHN2YSA9IHRoaXMuc2VydmljZS5yZ2JhVG9Ic3ZhKHJnYmEpO1xuXG4gICAgICB0aGlzLnNsaWRlckggPSB0aGlzLmhzdmEuaDtcblxuICAgICAgdGhpcy51cGRhdGVDb2xvclBpY2tlcigpO1xuICAgIH1cblxuICAgIHRoaXMuZGlyZWN0aXZlSW5zdGFuY2UuaW5wdXRDaGFuZ2VkKHtcbiAgICAgIGlucHV0OiAncmVkJyxcbiAgICAgIHZhbGlkOiB2YWxpZCxcbiAgICAgIHZhbHVlOiByZ2JhLnIsXG4gICAgICBjb2xvcjogdGhpcy5vdXRwdXRDb2xvcixcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvbkJsdWVJbnB1dCh2YWx1ZTogeyB2OiBudW1iZXI7IHJnOiBudW1iZXIgfSk6IHZvaWQge1xuICAgIGNvbnN0IHJnYmEgPSB0aGlzLnNlcnZpY2UuaHN2YVRvUmdiYSh0aGlzLmhzdmEpO1xuXG4gICAgY29uc3QgdmFsaWQgPSAhaXNOYU4odmFsdWUudikgJiYgdmFsdWUudiA+PSAwICYmIHZhbHVlLnYgPD0gdmFsdWUucmc7XG5cbiAgICBpZiAodmFsaWQpIHtcbiAgICAgIHJnYmEuYiA9IHZhbHVlLnYgLyB2YWx1ZS5yZztcblxuICAgICAgdGhpcy5oc3ZhID0gdGhpcy5zZXJ2aWNlLnJnYmFUb0hzdmEocmdiYSk7XG5cbiAgICAgIHRoaXMuc2xpZGVySCA9IHRoaXMuaHN2YS5oO1xuXG4gICAgICB0aGlzLnVwZGF0ZUNvbG9yUGlja2VyKCk7XG4gICAgfVxuXG4gICAgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZS5pbnB1dENoYW5nZWQoe1xuICAgICAgaW5wdXQ6ICdibHVlJyxcbiAgICAgIHZhbGlkOiB2YWxpZCxcbiAgICAgIHZhbHVlOiByZ2JhLmIsXG4gICAgICBjb2xvcjogdGhpcy5vdXRwdXRDb2xvcixcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvbkdyZWVuSW5wdXQodmFsdWU6IHsgdjogbnVtYmVyOyByZzogbnVtYmVyIH0pOiB2b2lkIHtcbiAgICBjb25zdCByZ2JhID0gdGhpcy5zZXJ2aWNlLmhzdmFUb1JnYmEodGhpcy5oc3ZhKTtcblxuICAgIGNvbnN0IHZhbGlkID0gIWlzTmFOKHZhbHVlLnYpICYmIHZhbHVlLnYgPj0gMCAmJiB2YWx1ZS52IDw9IHZhbHVlLnJnO1xuXG4gICAgaWYgKHZhbGlkKSB7XG4gICAgICByZ2JhLmcgPSB2YWx1ZS52IC8gdmFsdWUucmc7XG5cbiAgICAgIHRoaXMuaHN2YSA9IHRoaXMuc2VydmljZS5yZ2JhVG9Ic3ZhKHJnYmEpO1xuXG4gICAgICB0aGlzLnNsaWRlckggPSB0aGlzLmhzdmEuaDtcblxuICAgICAgdGhpcy51cGRhdGVDb2xvclBpY2tlcigpO1xuICAgIH1cblxuICAgIHRoaXMuZGlyZWN0aXZlSW5zdGFuY2UuaW5wdXRDaGFuZ2VkKHtcbiAgICAgIGlucHV0OiAnZ3JlZW4nLFxuICAgICAgdmFsaWQ6IHZhbGlkLFxuICAgICAgdmFsdWU6IHJnYmEuZyxcbiAgICAgIGNvbG9yOiB0aGlzLm91dHB1dENvbG9yLFxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG9uSHVlSW5wdXQodmFsdWU6IHsgdjogbnVtYmVyOyByZzogbnVtYmVyIH0pIHtcbiAgICBjb25zdCB2YWxpZCA9ICFpc05hTih2YWx1ZS52KSAmJiB2YWx1ZS52ID49IDAgJiYgdmFsdWUudiA8PSB2YWx1ZS5yZztcblxuICAgIGlmICh2YWxpZCkge1xuICAgICAgdGhpcy5oc3ZhLmggPSB2YWx1ZS52IC8gdmFsdWUucmc7XG5cbiAgICAgIHRoaXMuc2xpZGVySCA9IHRoaXMuaHN2YS5oO1xuXG4gICAgICB0aGlzLnVwZGF0ZUNvbG9yUGlja2VyKCk7XG4gICAgfVxuXG4gICAgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZS5pbnB1dENoYW5nZWQoe1xuICAgICAgaW5wdXQ6ICdodWUnLFxuICAgICAgdmFsaWQ6IHZhbGlkLFxuICAgICAgdmFsdWU6IHRoaXMuaHN2YS5oLFxuICAgICAgY29sb3I6IHRoaXMub3V0cHV0Q29sb3IsXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgb25WYWx1ZUlucHV0KHZhbHVlOiB7IHY6IG51bWJlcjsgcmc6IG51bWJlciB9KTogdm9pZCB7XG4gICAgY29uc3QgdmFsaWQgPSAhaXNOYU4odmFsdWUudikgJiYgdmFsdWUudiA+PSAwICYmIHZhbHVlLnYgPD0gdmFsdWUucmc7XG5cbiAgICBpZiAodmFsaWQpIHtcbiAgICAgIHRoaXMuaHN2YS52ID0gdmFsdWUudiAvIHZhbHVlLnJnO1xuXG4gICAgICB0aGlzLnVwZGF0ZUNvbG9yUGlja2VyKCk7XG4gICAgfVxuXG4gICAgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZS5pbnB1dENoYW5nZWQoe1xuICAgICAgaW5wdXQ6ICd2YWx1ZScsXG4gICAgICB2YWxpZDogdmFsaWQsXG4gICAgICB2YWx1ZTogdGhpcy5oc3ZhLnYsXG4gICAgICBjb2xvcjogdGhpcy5vdXRwdXRDb2xvcixcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvbkFscGhhSW5wdXQodmFsdWU6IHsgdjogbnVtYmVyOyByZzogbnVtYmVyIH0pOiB2b2lkIHtcbiAgICBjb25zdCB2YWxpZCA9ICFpc05hTih2YWx1ZS52KSAmJiB2YWx1ZS52ID49IDAgJiYgdmFsdWUudiA8PSB2YWx1ZS5yZztcblxuICAgIGlmICh2YWxpZCkge1xuICAgICAgdGhpcy5oc3ZhLmEgPSB2YWx1ZS52IC8gdmFsdWUucmc7XG5cbiAgICAgIHRoaXMudXBkYXRlQ29sb3JQaWNrZXIoKTtcbiAgICB9XG5cbiAgICB0aGlzLmRpcmVjdGl2ZUluc3RhbmNlLmlucHV0Q2hhbmdlZCh7XG4gICAgICBpbnB1dDogJ2FscGhhJyxcbiAgICAgIHZhbGlkOiB2YWxpZCxcbiAgICAgIHZhbHVlOiB0aGlzLmhzdmEuYSxcbiAgICAgIGNvbG9yOiB0aGlzLm91dHB1dENvbG9yLFxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG9uTGlnaHRuZXNzSW5wdXQodmFsdWU6IHsgdjogbnVtYmVyOyByZzogbnVtYmVyIH0pOiB2b2lkIHtcbiAgICBjb25zdCBoc2xhID0gdGhpcy5zZXJ2aWNlLmhzdmEyaHNsYSh0aGlzLmhzdmEpO1xuXG4gICAgY29uc3QgdmFsaWQgPSAhaXNOYU4odmFsdWUudikgJiYgdmFsdWUudiA+PSAwICYmIHZhbHVlLnYgPD0gdmFsdWUucmc7XG5cbiAgICBpZiAodmFsaWQpIHtcbiAgICAgIGhzbGEubCA9IHZhbHVlLnYgLyB2YWx1ZS5yZztcblxuICAgICAgdGhpcy5oc3ZhID0gdGhpcy5zZXJ2aWNlLmhzbGEyaHN2YShoc2xhKTtcblxuICAgICAgdGhpcy5zbGlkZXJIID0gdGhpcy5oc3ZhLmg7XG5cbiAgICAgIHRoaXMudXBkYXRlQ29sb3JQaWNrZXIoKTtcbiAgICB9XG5cbiAgICB0aGlzLmRpcmVjdGl2ZUluc3RhbmNlLmlucHV0Q2hhbmdlZCh7XG4gICAgICBpbnB1dDogJ2xpZ2h0bmVzcycsXG4gICAgICB2YWxpZDogdmFsaWQsXG4gICAgICB2YWx1ZTogaHNsYS5sLFxuICAgICAgY29sb3I6IHRoaXMub3V0cHV0Q29sb3IsXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgb25TYXR1cmF0aW9uSW5wdXQodmFsdWU6IHsgdjogbnVtYmVyOyByZzogbnVtYmVyIH0pOiB2b2lkIHtcbiAgICBjb25zdCBoc2xhID0gdGhpcy5zZXJ2aWNlLmhzdmEyaHNsYSh0aGlzLmhzdmEpO1xuXG4gICAgY29uc3QgdmFsaWQgPSAhaXNOYU4odmFsdWUudikgJiYgdmFsdWUudiA+PSAwICYmIHZhbHVlLnYgPD0gdmFsdWUucmc7XG5cbiAgICBpZiAodmFsaWQpIHtcbiAgICAgIGhzbGEucyA9IHZhbHVlLnYgLyB2YWx1ZS5yZztcblxuICAgICAgdGhpcy5oc3ZhID0gdGhpcy5zZXJ2aWNlLmhzbGEyaHN2YShoc2xhKTtcblxuICAgICAgdGhpcy5zbGlkZXJIID0gdGhpcy5oc3ZhLmg7XG5cbiAgICAgIHRoaXMudXBkYXRlQ29sb3JQaWNrZXIoKTtcbiAgICB9XG5cbiAgICB0aGlzLmRpcmVjdGl2ZUluc3RhbmNlLmlucHV0Q2hhbmdlZCh7XG4gICAgICBpbnB1dDogJ3NhdHVyYXRpb24nLFxuICAgICAgdmFsaWQ6IHZhbGlkLFxuICAgICAgdmFsdWU6IGhzbGEucyxcbiAgICAgIGNvbG9yOiB0aGlzLm91dHB1dENvbG9yLFxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG9uQ3lhbklucHV0KHZhbHVlOiB7IHY6IG51bWJlcjsgcmc6IG51bWJlciB9KTogdm9pZCB7XG4gICAgY29uc3QgdmFsaWQgPSAhaXNOYU4odmFsdWUudikgJiYgdmFsdWUudiA+PSAwICYmIHZhbHVlLnYgPD0gdmFsdWUucmc7XG5cbiAgICBpZiAodmFsaWQpIHtcbiAgICAgIHRoaXMuY215ay5jID0gdmFsdWUudjtcblxuICAgICAgdGhpcy51cGRhdGVDb2xvclBpY2tlcihmYWxzZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZS5pbnB1dENoYW5nZWQoe1xuICAgICAgaW5wdXQ6ICdjeWFuJyxcbiAgICAgIHZhbGlkOiB0cnVlLFxuICAgICAgdmFsdWU6IHRoaXMuY215ay5jLFxuICAgICAgY29sb3I6IHRoaXMub3V0cHV0Q29sb3IsXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgb25NYWdlbnRhSW5wdXQodmFsdWU6IHsgdjogbnVtYmVyOyByZzogbnVtYmVyIH0pOiB2b2lkIHtcbiAgICBjb25zdCB2YWxpZCA9ICFpc05hTih2YWx1ZS52KSAmJiB2YWx1ZS52ID49IDAgJiYgdmFsdWUudiA8PSB2YWx1ZS5yZztcblxuICAgIGlmICh2YWxpZCkge1xuICAgICAgdGhpcy5jbXlrLm0gPSB2YWx1ZS52O1xuXG4gICAgICB0aGlzLnVwZGF0ZUNvbG9yUGlja2VyKGZhbHNlLCB0cnVlLCB0cnVlKTtcbiAgICB9XG5cbiAgICB0aGlzLmRpcmVjdGl2ZUluc3RhbmNlLmlucHV0Q2hhbmdlZCh7XG4gICAgICBpbnB1dDogJ21hZ2VudGEnLFxuICAgICAgdmFsaWQ6IHRydWUsXG4gICAgICB2YWx1ZTogdGhpcy5jbXlrLm0sXG4gICAgICBjb2xvcjogdGhpcy5vdXRwdXRDb2xvcixcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvblllbGxvd0lucHV0KHZhbHVlOiB7IHY6IG51bWJlcjsgcmc6IG51bWJlciB9KTogdm9pZCB7XG4gICAgY29uc3QgdmFsaWQgPSAhaXNOYU4odmFsdWUudikgJiYgdmFsdWUudiA+PSAwICYmIHZhbHVlLnYgPD0gdmFsdWUucmc7XG5cbiAgICBpZiAodmFsaWQpIHtcbiAgICAgIHRoaXMuY215ay55ID0gdmFsdWUudjtcblxuICAgICAgdGhpcy51cGRhdGVDb2xvclBpY2tlcihmYWxzZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZS5pbnB1dENoYW5nZWQoe1xuICAgICAgaW5wdXQ6ICd5ZWxsb3cnLFxuICAgICAgdmFsaWQ6IHRydWUsXG4gICAgICB2YWx1ZTogdGhpcy5jbXlrLnksXG4gICAgICBjb2xvcjogdGhpcy5vdXRwdXRDb2xvcixcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvbkJsYWNrSW5wdXQodmFsdWU6IHsgdjogbnVtYmVyOyByZzogbnVtYmVyIH0pOiB2b2lkIHtcbiAgICBjb25zdCB2YWxpZCA9ICFpc05hTih2YWx1ZS52KSAmJiB2YWx1ZS52ID49IDAgJiYgdmFsdWUudiA8PSB2YWx1ZS5yZztcblxuICAgIGlmICh2YWxpZCkge1xuICAgICAgdGhpcy5jbXlrLmsgPSB2YWx1ZS52O1xuXG4gICAgICB0aGlzLnVwZGF0ZUNvbG9yUGlja2VyKGZhbHNlLCB0cnVlLCB0cnVlKTtcbiAgICB9XG5cbiAgICB0aGlzLmRpcmVjdGl2ZUluc3RhbmNlLmlucHV0Q2hhbmdlZCh7XG4gICAgICBpbnB1dDogJ2JsYWNrJyxcbiAgICAgIHZhbGlkOiB0cnVlLFxuICAgICAgdmFsdWU6IHRoaXMuY215ay5rLFxuICAgICAgY29sb3I6IHRoaXMub3V0cHV0Q29sb3IsXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgb25BZGRQcmVzZXRDb2xvcihldmVudDogYW55LCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICBpZiAoIXRoaXMuY3BQcmVzZXRDb2xvcnMuZmlsdGVyKChjb2xvcikgPT4gY29sb3IgPT09IHZhbHVlKS5sZW5ndGgpIHtcbiAgICAgIHRoaXMuY3BQcmVzZXRDb2xvcnMgPSB0aGlzLmNwUHJlc2V0Q29sb3JzLmNvbmNhdCh2YWx1ZSk7XG5cbiAgICAgIHRoaXMuZGlyZWN0aXZlSW5zdGFuY2UucHJlc2V0Q29sb3JzQ2hhbmdlZCh0aGlzLmNwUHJlc2V0Q29sb3JzKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgb25SZW1vdmVQcmVzZXRDb2xvcihldmVudDogYW55LCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICB0aGlzLmNwUHJlc2V0Q29sb3JzID0gdGhpcy5jcFByZXNldENvbG9ycy5maWx0ZXIoXG4gICAgICAoY29sb3IpID0+IGNvbG9yICE9PSB2YWx1ZVxuICAgICk7XG5cbiAgICB0aGlzLmRpcmVjdGl2ZUluc3RhbmNlLnByZXNldENvbG9yc0NoYW5nZWQodGhpcy5jcFByZXNldENvbG9ycyk7XG4gIH1cblxuICAvLyBQcml2YXRlIGhlbHBlciBmdW5jdGlvbnMgZm9yIHRoZSBjb2xvciBwaWNrZXIgZGlhbG9nIHN0YXR1c1xuXG4gIHByaXZhdGUgb3BlbkNvbG9yUGlja2VyKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5zaG93KSB7XG4gICAgICB0aGlzLnNob3cgPSB0cnVlO1xuICAgICAgdGhpcy5oaWRkZW4gPSB0cnVlO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5oaWRkZW4gPSBmYWxzZTtcblxuICAgICAgICB0aGlzLnNldERpYWxvZ1Bvc2l0aW9uKCk7XG5cbiAgICAgICAgdGhpcy5jZFJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICB9LCAwKTtcblxuICAgICAgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZS5zdGF0ZUNoYW5nZWQodHJ1ZSk7XG5cbiAgICAgIGlmICghdGhpcy5pc0lFMTApIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5saXN0ZW5lck1vdXNlRG93bik7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLmxpc3RlbmVyTW91c2VEb3duKTtcbiAgICAgIH1cblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMubGlzdGVuZXJSZXNpemUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY2xvc2VDb2xvclBpY2tlcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zaG93KSB7XG4gICAgICB0aGlzLnNob3cgPSBmYWxzZTtcblxuICAgICAgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZS5zdGF0ZUNoYW5nZWQoZmFsc2UpO1xuXG4gICAgICBpZiAoIXRoaXMuaXNJRTEwKSB7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMubGlzdGVuZXJNb3VzZURvd24pO1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5saXN0ZW5lck1vdXNlRG93bik7XG4gICAgICB9XG5cbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLmxpc3RlbmVyUmVzaXplKTtcblxuICAgICAgaWYgKCF0aGlzLmNkUmVmWydkZXN0cm95ZWQnXSkge1xuICAgICAgICB0aGlzLmNkUmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZUNvbG9yUGlja2VyKFxuICAgIGVtaXQ6IGJvb2xlYW4gPSB0cnVlLFxuICAgIHVwZGF0ZTogYm9vbGVhbiA9IHRydWUsXG4gICAgY215a0lucHV0OiBib29sZWFuID0gZmFsc2VcbiAgKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc2xpZGVyRGltTWF4KSB7XG4gICAgICBpZiAodGhpcy5jcENvbG9yTW9kZSA9PT0gMikge1xuICAgICAgICB0aGlzLmhzdmEucyA9IDA7XG4gICAgICB9XG5cbiAgICAgIGxldCBodWU6IFJnYmEsIGhzbGE6IEhzbGEsIHJnYmE6IFJnYmE7XG5cbiAgICAgIGNvbnN0IGxhc3RPdXRwdXQgPSB0aGlzLm91dHB1dENvbG9yO1xuXG4gICAgICBoc2xhID0gdGhpcy5zZXJ2aWNlLmhzdmEyaHNsYSh0aGlzLmhzdmEpO1xuXG4gICAgICBpZiAoIXRoaXMuY3BDbXlrRW5hYmxlZCkge1xuICAgICAgICByZ2JhID0gdGhpcy5zZXJ2aWNlLmRlbm9ybWFsaXplUkdCQSh0aGlzLnNlcnZpY2UuaHN2YVRvUmdiYSh0aGlzLmhzdmEpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghY215a0lucHV0KSB7XG4gICAgICAgICAgcmdiYSA9IHRoaXMuc2VydmljZS5oc3ZhVG9SZ2JhKHRoaXMuaHN2YSk7XG5cbiAgICAgICAgICB0aGlzLmNteWsgPSB0aGlzLnNlcnZpY2UuZGVub3JtYWxpemVDTVlLKFxuICAgICAgICAgICAgdGhpcy5zZXJ2aWNlLnJnYmFUb0NteWsocmdiYSlcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJnYmEgPSB0aGlzLnNlcnZpY2UuY215a1RvUmdiKHRoaXMuc2VydmljZS5ub3JtYWxpemVDTVlLKHRoaXMuY215aykpO1xuXG4gICAgICAgICAgdGhpcy5oc3ZhID0gdGhpcy5zZXJ2aWNlLnJnYmFUb0hzdmEocmdiYSk7XG4gICAgICAgIH1cblxuICAgICAgICByZ2JhID0gdGhpcy5zZXJ2aWNlLmRlbm9ybWFsaXplUkdCQShyZ2JhKTtcblxuICAgICAgICB0aGlzLnNsaWRlckggPSB0aGlzLmhzdmEuaDtcbiAgICAgIH1cblxuICAgICAgaHVlID0gdGhpcy5zZXJ2aWNlLmRlbm9ybWFsaXplUkdCQShcbiAgICAgICAgdGhpcy5zZXJ2aWNlLmhzdmFUb1JnYmEobmV3IEhzdmEodGhpcy5zbGlkZXJIIHx8IHRoaXMuaHN2YS5oLCAxLCAxLCAxKSlcbiAgICAgICk7XG5cbiAgICAgIGlmICh1cGRhdGUpIHtcbiAgICAgICAgdGhpcy5oc2xhVGV4dCA9IG5ldyBIc2xhKFxuICAgICAgICAgIE1hdGgucm91bmQoaHNsYS5oICogMzYwKSxcbiAgICAgICAgICBNYXRoLnJvdW5kKGhzbGEucyAqIDEwMCksXG4gICAgICAgICAgTWF0aC5yb3VuZChoc2xhLmwgKiAxMDApLFxuICAgICAgICAgIE1hdGgucm91bmQoaHNsYS5hICogMTAwKSAvIDEwMFxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMucmdiYVRleHQgPSBuZXcgUmdiYShcbiAgICAgICAgICByZ2JhLnIsXG4gICAgICAgICAgcmdiYS5nLFxuICAgICAgICAgIHJnYmEuYixcbiAgICAgICAgICBNYXRoLnJvdW5kKHJnYmEuYSAqIDEwMCkgLyAxMDBcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAodGhpcy5jcENteWtFbmFibGVkKSB7XG4gICAgICAgICAgdGhpcy5jbXlrVGV4dCA9IG5ldyBDbXlrKFxuICAgICAgICAgICAgdGhpcy5jbXlrLmMsXG4gICAgICAgICAgICB0aGlzLmNteWsubSxcbiAgICAgICAgICAgIHRoaXMuY215ay55LFxuICAgICAgICAgICAgdGhpcy5jbXlrLmssXG4gICAgICAgICAgICBNYXRoLnJvdW5kKHRoaXMuY215ay5hICogMTAwKSAvIDEwMFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhbGxvd0hleDggPSB0aGlzLmNwQWxwaGFDaGFubmVsID09PSAnYWx3YXlzJztcblxuICAgICAgICB0aGlzLmhleFRleHQgPSB0aGlzLnNlcnZpY2UucmdiYVRvSGV4KHJnYmEsIGFsbG93SGV4OCk7XG4gICAgICAgIHRoaXMuaGV4QWxwaGEgPSB0aGlzLnJnYmFUZXh0LmE7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNwT3V0cHV0Rm9ybWF0ID09PSAnYXV0bycpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIHRoaXMuZm9ybWF0ICE9PSBDb2xvckZvcm1hdHMuUkdCQSAmJlxuICAgICAgICAgIHRoaXMuZm9ybWF0ICE9PSBDb2xvckZvcm1hdHMuQ01ZS1xuICAgICAgICApIHtcbiAgICAgICAgICBpZiAodGhpcy5oc3ZhLmEgPCAxKSB7XG4gICAgICAgICAgICB0aGlzLmZvcm1hdCA9XG4gICAgICAgICAgICAgIHRoaXMuaHN2YS5hIDwgMSA/IENvbG9yRm9ybWF0cy5SR0JBIDogQ29sb3JGb3JtYXRzLkhFWDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5odWVTbGlkZXJDb2xvciA9ICdyZ2IoJyArIGh1ZS5yICsgJywnICsgaHVlLmcgKyAnLCcgKyBodWUuYiArICcpJztcbiAgICAgIHRoaXMuYWxwaGFTbGlkZXJDb2xvciA9XG4gICAgICAgICdyZ2IoJyArIHJnYmEuciArICcsJyArIHJnYmEuZyArICcsJyArIHJnYmEuYiArICcpJztcblxuICAgICAgdGhpcy5vdXRwdXRDb2xvciA9IHRoaXMuc2VydmljZS5vdXRwdXRGb3JtYXQoXG4gICAgICAgIHRoaXMuaHN2YSxcbiAgICAgICAgdGhpcy5jcE91dHB1dEZvcm1hdCxcbiAgICAgICAgdGhpcy5jcEFscGhhQ2hhbm5lbFxuICAgICAgKTtcbiAgICAgIHRoaXMuc2VsZWN0ZWRDb2xvciA9IHRoaXMuc2VydmljZS5vdXRwdXRGb3JtYXQodGhpcy5oc3ZhLCAncmdiYScsIG51bGwpO1xuXG4gICAgICBpZiAodGhpcy5mb3JtYXQgIT09IENvbG9yRm9ybWF0cy5DTVlLKSB7XG4gICAgICAgIHRoaXMuY215a0NvbG9yID0gJyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgdGhpcy5jcEFscGhhQ2hhbm5lbCA9PT0gJ2Fsd2F5cycgfHxcbiAgICAgICAgICB0aGlzLmNwQWxwaGFDaGFubmVsID09PSAnZW5hYmxlZCcgfHxcbiAgICAgICAgICB0aGlzLmNwQWxwaGFDaGFubmVsID09PSAnZm9yY2VkJ1xuICAgICAgICApIHtcbiAgICAgICAgICBjb25zdCBhbHBoYSA9IE1hdGgucm91bmQodGhpcy5jbXlrLmEgKiAxMDApIC8gMTAwO1xuXG4gICAgICAgICAgdGhpcy5jbXlrQ29sb3IgPSBgY215a2EoJHt0aGlzLmNteWsuY30sJHt0aGlzLmNteWsubX0sJHt0aGlzLmNteWsueX0sJHt0aGlzLmNteWsua30sJHthbHBoYX0pYDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmNteWtDb2xvciA9IGBjbXlrKCR7dGhpcy5jbXlrLmN9LCR7dGhpcy5jbXlrLm19LCR7dGhpcy5jbXlrLnl9LCR7dGhpcy5jbXlrLmt9KWA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2codGhpcy5zbGlkZXJEaW1NYXgsICdzbGlkZXIgSCcpO1xuICAgICAgdGhpcy5zbGlkZXIgPSBuZXcgU2xpZGVyUG9zaXRpb24oXG4gICAgICAgICh0aGlzLnNsaWRlckggfHwgdGhpcy5oc3ZhLmgpICogdGhpcy5zbGlkZXJEaW1NYXguaCAtIDgsXG4gICAgICAgIHRoaXMuaHN2YS5zICogdGhpcy5zbGlkZXJEaW1NYXgucyAtIDgsXG4gICAgICAgICgxIC0gdGhpcy5oc3ZhLnYpICogdGhpcy5zbGlkZXJEaW1NYXgudiAtIDgsXG4gICAgICAgIHRoaXMuaHN2YS5hICogdGhpcy5zbGlkZXJEaW1NYXguYSAtIDhcbiAgICAgICk7XG5cbiAgICAgIGlmIChlbWl0ICYmIGxhc3RPdXRwdXQgIT09IHRoaXMub3V0cHV0Q29sb3IpIHtcbiAgICAgICAgaWYgKHRoaXMuY3BDbXlrRW5hYmxlZCkge1xuICAgICAgICAgIHRoaXMuZGlyZWN0aXZlSW5zdGFuY2UuY215a0NoYW5nZWQodGhpcy5jbXlrQ29sb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kaXJlY3RpdmVJbnN0YW5jZS5jb2xvckNoYW5nZWQodGhpcy5vdXRwdXRDb2xvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gUHJpdmF0ZSBoZWxwZXIgZnVuY3Rpb25zIGZvciB0aGUgY29sb3IgcGlja2VyIGRpYWxvZyBwb3NpdGlvbmluZ1xuXG4gIHByaXZhdGUgc2V0RGlhbG9nUG9zaXRpb24oKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY3BEaWFsb2dEaXNwbGF5ID09PSAnaW5saW5lJykge1xuICAgICAgdGhpcy5wb3NpdGlvbiA9ICdyZWxhdGl2ZSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBwb3NpdGlvbiA9ICdzdGF0aWMnLFxuICAgICAgICB0cmFuc2Zvcm0gPSAnJyxcbiAgICAgICAgc3R5bGU7XG5cbiAgICAgIGxldCBwYXJlbnROb2RlOiBhbnkgPSBudWxsLFxuICAgICAgICB0cmFuc2Zvcm1Ob2RlOiBhbnkgPSBudWxsO1xuXG4gICAgICBsZXQgbm9kZSA9IHRoaXMuZGlyZWN0aXZlRWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnBhcmVudE5vZGU7XG5cbiAgICAgIGNvbnN0IGRpYWxvZ0hlaWdodCA9IHRoaXMuZGlhbG9nRWxlbWVudC5uYXRpdmVFbGVtZW50Lm9mZnNldEhlaWdodDtcblxuICAgICAgd2hpbGUgKG5vZGUgIT09IG51bGwgJiYgbm9kZS50YWdOYW1lICE9PSAnSFRNTCcpIHtcbiAgICAgICAgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICAgICAgcG9zaXRpb24gPSBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdwb3NpdGlvbicpO1xuICAgICAgICB0cmFuc2Zvcm0gPSBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCd0cmFuc2Zvcm0nKTtcblxuICAgICAgICBpZiAocG9zaXRpb24gIT09ICdzdGF0aWMnICYmIHBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICAgICAgICBwYXJlbnROb2RlID0gbm9kZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0cmFuc2Zvcm0gJiYgdHJhbnNmb3JtICE9PSAnbm9uZScgJiYgdHJhbnNmb3JtTm9kZSA9PT0gbnVsbCkge1xuICAgICAgICAgIHRyYW5zZm9ybU5vZGUgPSBub2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uID09PSAnZml4ZWQnKSB7XG4gICAgICAgICAgcGFyZW50Tm9kZSA9IHRyYW5zZm9ybU5vZGU7XG5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGJveERpcmVjdGl2ZSA9IHRoaXMuY3JlYXRlRGlhbG9nQm94KFxuICAgICAgICB0aGlzLmRpcmVjdGl2ZUVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCxcbiAgICAgICAgcG9zaXRpb24gIT09ICdmaXhlZCdcbiAgICAgICk7XG5cbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy51c2VSb290Vmlld0NvbnRhaW5lciB8fFxuICAgICAgICAocG9zaXRpb24gPT09ICdmaXhlZCcgJiZcbiAgICAgICAgICAoIXBhcmVudE5vZGUgfHwgcGFyZW50Tm9kZSBpbnN0YW5jZW9mIEhUTUxVbmtub3duRWxlbWVudCkpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy50b3AgPSBib3hEaXJlY3RpdmUudG9wO1xuICAgICAgICB0aGlzLmxlZnQgPSBib3hEaXJlY3RpdmUubGVmdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChwYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgICAgICAgcGFyZW50Tm9kZSA9IG5vZGU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBib3hQYXJlbnQgPSB0aGlzLmNyZWF0ZURpYWxvZ0JveChcbiAgICAgICAgICBwYXJlbnROb2RlLFxuICAgICAgICAgIHBvc2l0aW9uICE9PSAnZml4ZWQnXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy50b3AgPSBib3hEaXJlY3RpdmUudG9wIC0gYm94UGFyZW50LnRvcDtcbiAgICAgICAgdGhpcy5sZWZ0ID0gYm94RGlyZWN0aXZlLmxlZnQgLSBib3hQYXJlbnQubGVmdDtcbiAgICAgIH1cblxuICAgICAgaWYgKHBvc2l0aW9uID09PSAnZml4ZWQnKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgICAgfVxuXG4gICAgICBsZXQgdXNlUG9zaXRpb24gPSB0aGlzLmNwUG9zaXRpb247XG5cbiAgICAgIGlmICh0aGlzLmNwUG9zaXRpb24gPT09ICdhdXRvJykge1xuICAgICAgICBjb25zdCBkaWFsb2dCb3VuZHMgPVxuICAgICAgICAgIHRoaXMuZGlhbG9nRWxlbWVudC5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCB0cmlnZ2VyQm91bmRzID1cbiAgICAgICAgICB0aGlzLmNwVHJpZ2dlckVsZW1lbnQubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgdXNlUG9zaXRpb24gPSBjYWxjdWxhdGVBdXRvUG9zaXRpb25pbmcoZGlhbG9nQm91bmRzLCB0cmlnZ2VyQm91bmRzKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHVzZVBvc2l0aW9uID09PSAndG9wJykge1xuICAgICAgICB0aGlzLmFycm93VG9wID0gZGlhbG9nSGVpZ2h0IC0gMTtcblxuICAgICAgICB0aGlzLnRvcCAtPSBkaWFsb2dIZWlnaHQgKyB0aGlzLmRpYWxvZ0Fycm93U2l6ZTtcbiAgICAgICAgdGhpcy5sZWZ0ICs9XG4gICAgICAgICAgKHRoaXMuY3BQb3NpdGlvbk9mZnNldCAvIDEwMCkgKiBib3hEaXJlY3RpdmUud2lkdGggLVxuICAgICAgICAgIHRoaXMuZGlhbG9nQXJyb3dPZmZzZXQ7XG4gICAgICB9IGVsc2UgaWYgKHVzZVBvc2l0aW9uID09PSAnYm90dG9tJykge1xuICAgICAgICB0aGlzLnRvcCArPSBib3hEaXJlY3RpdmUuaGVpZ2h0ICsgdGhpcy5kaWFsb2dBcnJvd1NpemU7XG4gICAgICAgIHRoaXMubGVmdCArPVxuICAgICAgICAgICh0aGlzLmNwUG9zaXRpb25PZmZzZXQgLyAxMDApICogYm94RGlyZWN0aXZlLndpZHRoIC1cbiAgICAgICAgICB0aGlzLmRpYWxvZ0Fycm93T2Zmc2V0O1xuICAgICAgfSBlbHNlIGlmICh1c2VQb3NpdGlvbiA9PT0gJ3RvcC1sZWZ0JyB8fCB1c2VQb3NpdGlvbiA9PT0gJ2xlZnQtdG9wJykge1xuICAgICAgICB0aGlzLnRvcCAtPVxuICAgICAgICAgIGRpYWxvZ0hlaWdodCAtXG4gICAgICAgICAgYm94RGlyZWN0aXZlLmhlaWdodCArXG4gICAgICAgICAgKGJveERpcmVjdGl2ZS5oZWlnaHQgKiB0aGlzLmNwUG9zaXRpb25PZmZzZXQpIC8gMTAwO1xuICAgICAgICB0aGlzLmxlZnQgLT1cbiAgICAgICAgICB0aGlzLmNwV2lkdGggKyB0aGlzLmRpYWxvZ0Fycm93U2l6ZSAtIDIgLSB0aGlzLmRpYWxvZ0Fycm93T2Zmc2V0O1xuICAgICAgfSBlbHNlIGlmICh1c2VQb3NpdGlvbiA9PT0gJ3RvcC1yaWdodCcgfHwgdXNlUG9zaXRpb24gPT09ICdyaWdodC10b3AnKSB7XG4gICAgICAgIHRoaXMudG9wIC09XG4gICAgICAgICAgZGlhbG9nSGVpZ2h0IC1cbiAgICAgICAgICBib3hEaXJlY3RpdmUuaGVpZ2h0ICtcbiAgICAgICAgICAoYm94RGlyZWN0aXZlLmhlaWdodCAqIHRoaXMuY3BQb3NpdGlvbk9mZnNldCkgLyAxMDA7XG4gICAgICAgIHRoaXMubGVmdCArPVxuICAgICAgICAgIGJveERpcmVjdGl2ZS53aWR0aCArXG4gICAgICAgICAgdGhpcy5kaWFsb2dBcnJvd1NpemUgLVxuICAgICAgICAgIDIgLVxuICAgICAgICAgIHRoaXMuZGlhbG9nQXJyb3dPZmZzZXQ7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICB1c2VQb3NpdGlvbiA9PT0gJ2xlZnQnIHx8XG4gICAgICAgIHVzZVBvc2l0aW9uID09PSAnYm90dG9tLWxlZnQnIHx8XG4gICAgICAgIHVzZVBvc2l0aW9uID09PSAnbGVmdC1ib3R0b20nXG4gICAgICApIHtcbiAgICAgICAgdGhpcy50b3AgKz1cbiAgICAgICAgICAoYm94RGlyZWN0aXZlLmhlaWdodCAqIHRoaXMuY3BQb3NpdGlvbk9mZnNldCkgLyAxMDAgLVxuICAgICAgICAgIHRoaXMuZGlhbG9nQXJyb3dPZmZzZXQ7XG4gICAgICAgIHRoaXMubGVmdCAtPSB0aGlzLmNwV2lkdGggKyB0aGlzLmRpYWxvZ0Fycm93U2l6ZSAtIDI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyB1c2VQb3NpdGlvbiA9PT0gJ3JpZ2h0JyB8fCB1c2VQb3NpdGlvbiA9PT0gJ2JvdHRvbS1yaWdodCcgfHwgdXNlUG9zaXRpb24gPT09ICdyaWdodC1ib3R0b20nXG4gICAgICAgIHRoaXMudG9wICs9XG4gICAgICAgICAgKGJveERpcmVjdGl2ZS5oZWlnaHQgKiB0aGlzLmNwUG9zaXRpb25PZmZzZXQpIC8gMTAwIC1cbiAgICAgICAgICB0aGlzLmRpYWxvZ0Fycm93T2Zmc2V0O1xuICAgICAgICB0aGlzLmxlZnQgKz0gYm94RGlyZWN0aXZlLndpZHRoICsgdGhpcy5kaWFsb2dBcnJvd1NpemUgLSAyO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNwVXNlUG9zaXRpb24gPSB1c2VQb3NpdGlvbjtcbiAgICB9XG4gIH1cblxuICAvLyBQcml2YXRlIGhlbHBlciBmdW5jdGlvbnMgZm9yIHRoZSBjb2xvciBwaWNrZXIgZGlhbG9nIHBvc2l0aW9uaW5nIGFuZCBvcGVuaW5nXG5cbiAgcHJpdmF0ZSBpc0Rlc2NlbmRhbnQocGFyZW50OiBhbnksIGNoaWxkOiBhbnkpOiBib29sZWFuIHtcbiAgICBsZXQgbm9kZTogYW55ID0gY2hpbGQucGFyZW50Tm9kZTtcblxuICAgIHdoaWxlIChub2RlICE9PSBudWxsKSB7XG4gICAgICBpZiAobm9kZSA9PT0gcGFyZW50KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlRGlhbG9nQm94KGVsZW1lbnQ6IGFueSwgb2Zmc2V0OiBib29sZWFuKTogYW55IHtcbiAgICByZXR1cm4ge1xuICAgICAgdG9wOlxuICAgICAgICBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCArIChvZmZzZXQgPyB3aW5kb3cucGFnZVlPZmZzZXQgOiAwKSxcbiAgICAgIGxlZnQ6XG4gICAgICAgIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCArXG4gICAgICAgIChvZmZzZXQgPyB3aW5kb3cucGFnZVhPZmZzZXQgOiAwKSxcbiAgICAgIHdpZHRoOiBlbGVtZW50Lm9mZnNldFdpZHRoLFxuICAgICAgaGVpZ2h0OiBlbGVtZW50Lm9mZnNldEhlaWdodCxcbiAgICB9O1xuICB9XG59XG4iXX0=