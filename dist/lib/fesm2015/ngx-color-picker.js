import { EventEmitter, Directive, Input, Output, HostListener, ElementRef, Injectable, Component, ViewEncapsulation, ChangeDetectorRef, ViewChild, Injector, ReflectiveInjector, ComponentFactoryResolver, ApplicationRef, ViewContainerRef, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';

var ColorFormats;
(function (ColorFormats) {
    ColorFormats[ColorFormats["HEX"] = 0] = "HEX";
    ColorFormats[ColorFormats["RGBA"] = 1] = "RGBA";
    ColorFormats[ColorFormats["HSLA"] = 2] = "HSLA";
    ColorFormats[ColorFormats["CMYK"] = 3] = "CMYK";
})(ColorFormats || (ColorFormats = {}));
class Rgba {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}
class Hsva {
    constructor(h, s, v, a) {
        this.h = h;
        this.s = s;
        this.v = v;
        this.a = a;
    }
}
class Hsla {
    constructor(h, s, l, a) {
        this.h = h;
        this.s = s;
        this.l = l;
        this.a = a;
    }
}
class Cmyk {
    constructor(c, m, y, k, a = 1) {
        this.c = c;
        this.m = m;
        this.y = y;
        this.k = k;
        this.a = a;
    }
}

function calculateAutoPositioning(elBounds, triggerElBounds) {
    // Defaults
    let usePositionX = 'right';
    let usePositionY = 'bottom';
    // Calculate collisions
    const { height, width } = elBounds;
    const { top, left } = triggerElBounds;
    const bottom = top + triggerElBounds.height;
    const right = left + triggerElBounds.width;
    const collisionTop = top - height < 0;
    const collisionBottom = bottom + height >
        (window.innerHeight || document.documentElement.clientHeight);
    const collisionLeft = left - width < 0;
    const collisionRight = right + width > (window.innerWidth || document.documentElement.clientWidth);
    const collisionAll = collisionTop && collisionBottom && collisionLeft && collisionRight;
    // Generate X & Y position values
    if (collisionBottom) {
        usePositionY = 'top';
    }
    if (collisionTop) {
        usePositionY = 'bottom';
    }
    if (collisionLeft) {
        usePositionX = 'right';
    }
    if (collisionRight) {
        usePositionX = 'left';
    }
    // Choose the largest gap available
    if (collisionAll) {
        const postions = ['left', 'right', 'top', 'bottom'];
        return postions.reduce((prev, next) => elBounds[prev] > elBounds[next] ? prev : next);
    }
    if (collisionLeft && collisionRight) {
        if (collisionTop) {
            return 'bottom';
        }
        if (collisionBottom) {
            return 'top';
        }
        return top > bottom ? 'top' : 'bottom';
    }
    if (collisionTop && collisionBottom) {
        if (collisionLeft) {
            return 'right';
        }
        if (collisionRight) {
            return 'left';
        }
        return left > right ? 'left' : 'right';
    }
    return `${usePositionY}-${usePositionX}`;
}
function detectIE() {
    let ua = '';
    if (typeof navigator !== 'undefined') {
        ua = navigator.userAgent.toLowerCase();
    }
    const msie = ua.indexOf('msie ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }
    // Other browser
    return false;
}
class TextDirective {
    constructor() {
        this.newValue = new EventEmitter();
    }
    inputChange(event) {
        const value = event.target.value;
        if (this.rg === undefined) {
            this.newValue.emit(value);
        }
        else {
            const numeric = parseFloat(value);
            this.newValue.emit({ v: numeric, rg: this.rg });
        }
    }
}
TextDirective.decorators = [
    { type: Directive, args: [{
                selector: '[text]',
            },] }
];
TextDirective.propDecorators = {
    rg: [{ type: Input }],
    text: [{ type: Input }],
    newValue: [{ type: Output }],
    inputChange: [{ type: HostListener, args: ['input', ['$event'],] }]
};
class SliderDirective {
    constructor(elRef) {
        this.elRef = elRef;
        this.dragEnd = new EventEmitter();
        this.dragStart = new EventEmitter();
        this.newValue = new EventEmitter();
        this.listenerMove = (event) => this.move(event);
        this.listenerStop = () => this.stop();
    }
    mouseDown(event) {
        this.start(event);
    }
    touchStart(event) {
        this.start(event);
    }
    move(event) {
        event.preventDefault();
        this.setCursor(event);
    }
    start(event) {
        this.setCursor(event);
        event.stopPropagation();
        document.addEventListener('mouseup', this.listenerStop);
        document.addEventListener('touchend', this.listenerStop);
        document.addEventListener('mousemove', this.listenerMove);
        document.addEventListener('touchmove', this.listenerMove);
        this.dragStart.emit();
    }
    stop() {
        document.removeEventListener('mouseup', this.listenerStop);
        document.removeEventListener('touchend', this.listenerStop);
        document.removeEventListener('mousemove', this.listenerMove);
        document.removeEventListener('touchmove', this.listenerMove);
        this.dragEnd.emit();
    }
    getX(event) {
        const position = this.elRef.nativeElement.getBoundingClientRect();
        const pageX = event.pageX !== undefined ? event.pageX : event.touches[0].pageX;
        return pageX - position.left - window.pageXOffset;
    }
    getY(event) {
        const position = this.elRef.nativeElement.getBoundingClientRect();
        const pageY = event.pageY !== undefined ? event.pageY : event.touches[0].pageY;
        return pageY - position.top - window.pageYOffset;
    }
    setCursor(event) {
        const width = this.elRef.nativeElement.offsetWidth;
        const height = this.elRef.nativeElement.offsetHeight;
        const x = Math.max(0, Math.min(this.getX(event), width));
        const y = Math.max(0, Math.min(this.getY(event), height));
        if (this.rgX !== undefined && this.rgY !== undefined) {
            this.newValue.emit({
                s: x / width,
                v: 1 - y / height,
                rgX: this.rgX,
                rgY: this.rgY,
            });
        }
        else if (this.rgX === undefined && this.rgY !== undefined) {
            this.newValue.emit({ v: y / height, rgY: this.rgY });
        }
        else if (this.rgX !== undefined && this.rgY === undefined) {
            this.newValue.emit({ v: x / width, rgX: this.rgX });
        }
    }
}
SliderDirective.decorators = [
    { type: Directive, args: [{
                selector: '[slider]',
            },] }
];
SliderDirective.ctorParameters = () => [
    { type: ElementRef }
];
SliderDirective.propDecorators = {
    rgX: [{ type: Input }],
    rgY: [{ type: Input }],
    slider: [{ type: Input }],
    dragEnd: [{ type: Output }],
    dragStart: [{ type: Output }],
    newValue: [{ type: Output }],
    mouseDown: [{ type: HostListener, args: ['mousedown', ['$event'],] }],
    touchStart: [{ type: HostListener, args: ['touchstart', ['$event'],] }]
};
class SliderPosition {
    constructor(h, s, v, a) {
        this.h = h;
        this.s = s;
        this.v = v;
        this.a = a;
    }
}
class SliderDimension {
    constructor(h, s, v, a) {
        this.h = h;
        this.s = s;
        this.v = v;
        this.a = a;
    }
}

class ColorPickerService {
    constructor() {
        this.active = null;
    }
    setActive(active) {
        if (this.active && this.active !== active && this.active.cpDialogDisplay !== 'inline') {
            this.active.closeDialog();
        }
        this.active = active;
    }
    hsva2hsla(hsva) {
        const h = hsva.h, s = hsva.s, v = hsva.v, a = hsva.a;
        if (v === 0) {
            return new Hsla(h, 0, 0, a);
        }
        else if (s === 0 && v === 1) {
            return new Hsla(h, 1, 1, a);
        }
        else {
            const l = v * (2 - s) / 2;
            return new Hsla(h, v * s / (1 - Math.abs(2 * l - 1)), l, a);
        }
    }
    hsla2hsva(hsla) {
        const h = Math.min(hsla.h, 1), s = Math.min(hsla.s, 1);
        const l = Math.min(hsla.l, 1), a = Math.min(hsla.a, 1);
        if (l === 0) {
            return new Hsva(h, 0, 0, a);
        }
        else {
            const v = l + s * (1 - Math.abs(2 * l - 1)) / 2;
            return new Hsva(h, 2 * (v - l) / v, v, a);
        }
    }
    hsvaToRgba(hsva) {
        let r, g, b;
        const h = hsva.h, s = hsva.s, v = hsva.v, a = hsva.a;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0:
                r = v, g = t, b = p;
                break;
            case 1:
                r = q, g = v, b = p;
                break;
            case 2:
                r = p, g = v, b = t;
                break;
            case 3:
                r = p, g = q, b = v;
                break;
            case 4:
                r = t, g = p, b = v;
                break;
            case 5:
                r = v, g = p, b = q;
                break;
            default:
                r = 0, g = 0, b = 0;
        }
        return new Rgba(r, g, b, a);
    }
    cmykToRgb(cmyk) {
        const r = (1 - cmyk.c) * (1 - cmyk.k);
        const g = (1 - cmyk.m) * (1 - cmyk.k);
        const b = (1 - cmyk.y) * (1 - cmyk.k);
        return new Rgba(r, g, b, cmyk.a);
    }
    rgbaToCmyk(rgba) {
        const k = 1 - Math.max(rgba.r, rgba.g, rgba.b);
        if (k === 1) {
            return new Cmyk(0, 0, 0, 1, rgba.a);
        }
        else {
            const c = (1 - rgba.r - k) / (1 - k);
            const m = (1 - rgba.g - k) / (1 - k);
            const y = (1 - rgba.b - k) / (1 - k);
            return new Cmyk(c, m, y, k, rgba.a);
        }
    }
    rgbaToHsva(rgba) {
        let h, s;
        const r = Math.min(rgba.r, 1), g = Math.min(rgba.g, 1);
        const b = Math.min(rgba.b, 1), a = Math.min(rgba.a, 1);
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const v = max, d = max - min;
        s = (max === 0) ? 0 : d / max;
        if (max === min) {
            h = 0;
        }
        else {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
                default:
                    h = 0;
            }
            h /= 6;
        }
        return new Hsva(h, s, v, a);
    }
    rgbaToHex(rgba, allowHex8) {
        /* tslint:disable:no-bitwise */
        let hex = '#' + ((1 << 24) | (rgba.r << 16) | (rgba.g << 8) | rgba.b).toString(16).substr(1);
        if (allowHex8) {
            hex += ((1 << 8) | Math.round(rgba.a * 255)).toString(16).substr(1);
        }
        /* tslint:enable:no-bitwise */
        return hex;
    }
    normalizeCMYK(cmyk) {
        return new Cmyk(cmyk.c / 100, cmyk.m / 100, cmyk.y / 100, cmyk.k / 100, cmyk.a);
    }
    denormalizeCMYK(cmyk) {
        return new Cmyk(Math.floor(cmyk.c * 100), Math.floor(cmyk.m * 100), Math.floor(cmyk.y * 100), Math.floor(cmyk.k * 100), cmyk.a);
    }
    denormalizeRGBA(rgba) {
        return new Rgba(Math.round(rgba.r * 255), Math.round(rgba.g * 255), Math.round(rgba.b * 255), rgba.a);
    }
    stringToHsva(colorString = '', allowHex8 = false) {
        let hsva = null;
        colorString = (colorString || '').toLowerCase();
        const stringParsers = [
            {
                re: /(rgb)a?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*%?,\s*(\d{1,3})\s*%?(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
                parse: function (execResult) {
                    return new Rgba(parseInt(execResult[2], 10) / 255, parseInt(execResult[3], 10) / 255, parseInt(execResult[4], 10) / 255, isNaN(parseFloat(execResult[5])) ? 1 : parseFloat(execResult[5]));
                }
            }, {
                re: /(hsl)a?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
                parse: function (execResult) {
                    return new Hsla(parseInt(execResult[2], 10) / 360, parseInt(execResult[3], 10) / 100, parseInt(execResult[4], 10) / 100, isNaN(parseFloat(execResult[5])) ? 1 : parseFloat(execResult[5]));
                }
            }
        ];
        if (allowHex8) {
            stringParsers.push({
                re: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})?$/,
                parse: function (execResult) {
                    return new Rgba(parseInt(execResult[1], 16) / 255, parseInt(execResult[2], 16) / 255, parseInt(execResult[3], 16) / 255, parseInt(execResult[4] || 'FF', 16) / 255);
                }
            });
        }
        else {
            stringParsers.push({
                re: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/,
                parse: function (execResult) {
                    return new Rgba(parseInt(execResult[1], 16) / 255, parseInt(execResult[2], 16) / 255, parseInt(execResult[3], 16) / 255, 1);
                }
            });
        }
        stringParsers.push({
            re: /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])$/,
            parse: function (execResult) {
                return new Rgba(parseInt(execResult[1] + execResult[1], 16) / 255, parseInt(execResult[2] + execResult[2], 16) / 255, parseInt(execResult[3] + execResult[3], 16) / 255, 1);
            }
        });
        for (const key in stringParsers) {
            if (stringParsers.hasOwnProperty(key)) {
                const parser = stringParsers[key];
                const match = parser.re.exec(colorString), color = match && parser.parse(match);
                if (color) {
                    if (color instanceof Rgba) {
                        hsva = this.rgbaToHsva(color);
                    }
                    else if (color instanceof Hsla) {
                        hsva = this.hsla2hsva(color);
                    }
                    return hsva;
                }
            }
        }
        return hsva;
    }
    outputFormat(hsva, outputFormat, alphaChannel) {
        if (outputFormat === 'auto') {
            outputFormat = hsva.a < 1 ? 'rgba' : 'hex';
        }
        switch (outputFormat) {
            case 'hsla':
                const hsla = this.hsva2hsla(hsva);
                const hslaText = new Hsla(Math.round((hsla.h) * 360), Math.round(hsla.s * 100), Math.round(hsla.l * 100), Math.round(hsla.a * 100) / 100);
                if (hsva.a < 1 || alphaChannel === 'always') {
                    return 'hsla(' + hslaText.h + ',' + hslaText.s + '%,' + hslaText.l + '%,' +
                        hslaText.a + ')';
                }
                else {
                    return 'hsl(' + hslaText.h + ',' + hslaText.s + '%,' + hslaText.l + '%)';
                }
            case 'rgba':
                const rgba = this.denormalizeRGBA(this.hsvaToRgba(hsva));
                if (hsva.a < 1 || alphaChannel === 'always') {
                    return 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',' +
                        Math.round(rgba.a * 100) / 100 + ')';
                }
                else {
                    return 'rgb(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ')';
                }
            default:
                const allowHex8 = (alphaChannel === 'always' || alphaChannel === 'forced');
                return this.rgbaToHex(this.denormalizeRGBA(this.hsvaToRgba(hsva)), allowHex8);
        }
    }
}
ColorPickerService.decorators = [
    { type: Injectable }
];
ColorPickerService.ctorParameters = () => [];

class ColorPickerComponent {
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

class ColorPickerDirective {
    constructor(injector, cfr, appRef, vcRef, elRef, _service) {
        this.injector = injector;
        this.cfr = cfr;
        this.appRef = appRef;
        this.vcRef = vcRef;
        this.elRef = elRef;
        this._service = _service;
        this.dialogCreated = false;
        this.ignoreChanges = false;
        this.viewAttachedToAppRef = false;
        this.cpWidth = '230px';
        this.cpHeight = 'auto';
        this.cpToggle = false;
        this.cpDisabled = false;
        this.cpIgnoredElements = [];
        this.cpFallbackColor = '';
        this.cpColorMode = 'color';
        this.cpCmykEnabled = false;
        this.cpOutputFormat = 'auto';
        this.cpAlphaChannel = 'enabled';
        this.cpDisableInput = false;
        this.cpDialogDisplay = 'popup';
        this.cpSaveClickOutside = true;
        this.cpCloseClickOutside = true;
        this.cpUseRootViewContainer = false;
        this.cpPosition = 'auto';
        this.cpPositionOffset = '0%';
        this.cpPositionRelativeToArrow = false;
        this.cpOKButton = false;
        this.cpOKButtonText = 'OK';
        this.cpOKButtonClass = 'cp-ok-button-class';
        this.cpCancelButton = false;
        this.cpCancelButtonText = 'Cancel';
        this.cpCancelButtonClass = 'cp-cancel-button-class';
        this.cpPresetLabel = 'Preset colors';
        this.cpPresetColorsClass = 'cp-preset-colors-class';
        this.cpMaxPresetColorsLength = 6;
        this.cpPresetEmptyMessage = 'No colors added';
        this.cpPresetEmptyMessageClass = 'preset-empty-message';
        this.cpAddColorButton = false;
        this.cpAddColorButtonText = 'Add color';
        this.cpAddColorButtonClass = 'cp-add-color-button-class';
        this.cpRemoveColorButtonClass = 'cp-remove-color-button-class';
        // Additional
        this.isShowSelectColorType = false;
        this.cpInputChange = new EventEmitter(true);
        this.cpToggleChange = new EventEmitter(true);
        this.cpSliderChange = new EventEmitter(true);
        this.cpSliderDragEnd = new EventEmitter(true);
        this.cpSliderDragStart = new EventEmitter(true);
        this.colorPickerOpen = new EventEmitter(true);
        this.colorPickerClose = new EventEmitter(true);
        this.colorPickerCancel = new EventEmitter(true);
        this.colorPickerSelect = new EventEmitter(true);
        this.colorPickerChange = new EventEmitter(false);
        this.cpCmykColorChange = new EventEmitter(true);
        this.cpPresetColorsChange = new EventEmitter(true);
    }
    handleClick() {
        this.inputFocus();
    }
    handleFocus() {
        this.inputFocus();
    }
    handleInput(event) {
        this.inputChange(event);
    }
    ngOnDestroy() {
        if (this.cmpRef != null) {
            if (this.viewAttachedToAppRef) {
                this.appRef.detachView(this.cmpRef.hostView);
            }
            this.cmpRef.destroy();
            this.cmpRef = null;
            this.dialog = null;
        }
    }
    ngOnChanges(changes) {
        if (changes.cpToggle && !this.cpDisabled) {
            if (changes.cpToggle.currentValue) {
                this.openDialog();
            }
            else if (!changes.cpToggle.currentValue) {
                this.closeDialog();
            }
        }
        if (changes.colorPicker) {
            if (this.dialog && !this.ignoreChanges) {
                if (this.cpDialogDisplay === 'inline') {
                    this.dialog.setInitialColor(changes.colorPicker.currentValue);
                }
                this.dialog.setColorFromString(changes.colorPicker.currentValue, false);
                if (this.cpUseRootViewContainer && this.cpDialogDisplay !== 'inline') {
                    this.cmpRef.changeDetectorRef.detectChanges();
                }
            }
            this.ignoreChanges = false;
        }
        if (changes.cpPresetLabel || changes.cpPresetColors) {
            if (this.dialog) {
                this.dialog.setPresetConfig(this.cpPresetLabel, this.cpPresetColors);
            }
        }
    }
    openDialog() {
        if (!this.dialogCreated) {
            let vcRef = this.vcRef;
            this.dialogCreated = true;
            this.viewAttachedToAppRef = false;
            if (this.cpUseRootViewContainer && this.cpDialogDisplay !== 'inline') {
                const classOfRootComponent = this.appRef.componentTypes[0];
                const appInstance = this.injector.get(classOfRootComponent, Injector.NULL);
                if (appInstance !== Injector.NULL) {
                    vcRef =
                        appInstance.vcRef || appInstance.viewContainerRef || this.vcRef;
                    if (vcRef === this.vcRef) {
                        console.warn('You are using cpUseRootViewContainer, ' +
                            'but the root component is not exposing viewContainerRef!' +
                            "Please expose it by adding 'public vcRef: ViewContainerRef' to the constructor.");
                    }
                }
                else {
                    this.viewAttachedToAppRef = true;
                }
            }
            const compFactory = this.cfr.resolveComponentFactory(ColorPickerComponent);
            if (this.viewAttachedToAppRef) {
                this.cmpRef = compFactory.create(this.injector);
                this.appRef.attachView(this.cmpRef.hostView);
                document.body.appendChild(this.cmpRef.hostView
                    .rootNodes[0]);
            }
            else {
                const injector = ReflectiveInjector.fromResolvedProviders([], vcRef.parentInjector);
                this.cmpRef = vcRef.createComponent(compFactory, 0, injector, []);
            }
            this.cmpRef.instance.setupDialog(this, this.elRef, this.colorPicker, this.cpWidth, this.cpHeight, this.cpDialogDisplay, this.cpFallbackColor, this.cpColorMode, this.cpCmykEnabled, this.cpAlphaChannel, this.cpOutputFormat, this.cpDisableInput, this.cpIgnoredElements, this.cpSaveClickOutside, this.cpCloseClickOutside, this.cpUseRootViewContainer, this.cpPosition, this.cpPositionOffset, this.cpPositionRelativeToArrow, this.cpPresetLabel, this.cpPresetColors, this.cpPresetColorsClass, this.cpMaxPresetColorsLength, this.cpPresetEmptyMessage, this.cpPresetEmptyMessageClass, this.cpOKButton, this.cpOKButtonClass, this.cpOKButtonText, this.cpCancelButton, this.cpCancelButtonClass, this.cpCancelButtonText, this.cpAddColorButton, this.cpAddColorButtonClass, this.cpAddColorButtonText, this.cpRemoveColorButtonClass, this.elRef, this.isShowSelectColorType);
            this.dialog = this.cmpRef.instance;
            if (this.vcRef !== vcRef) {
                this.cmpRef.changeDetectorRef.detectChanges();
            }
        }
        else if (this.dialog) {
            this.dialog.openDialog(this.colorPicker);
        }
    }
    closeDialog() {
        if (this.dialog && this.cpDialogDisplay === 'popup') {
            this.dialog.closeDialog();
        }
    }
    cmykChanged(value) {
        this.cpCmykColorChange.emit(value);
    }
    stateChanged(state) {
        this.cpToggleChange.emit(state);
        if (state) {
            this.colorPickerOpen.emit(this.colorPicker);
        }
        else {
            this.colorPickerClose.emit(this.colorPicker);
        }
    }
    colorChanged(value, ignore = true) {
        this.ignoreChanges = ignore;
        this.colorPickerChange.emit(value);
    }
    colorSelected(value) {
        this.colorPickerSelect.emit(value);
    }
    colorCanceled() {
        this.colorPickerCancel.emit();
    }
    inputFocus() {
        const element = this.elRef.nativeElement;
        const ignored = this.cpIgnoredElements.filter((item) => item === element);
        if (!this.cpDisabled && !ignored.length) {
            if (typeof document !== 'undefined' &&
                element === document.activeElement) {
                this.openDialog();
            }
            else if (!this.dialog || !this.dialog.show) {
                this.openDialog();
            }
            else {
                this.closeDialog();
            }
        }
    }
    inputChange(event) {
        if (this.dialog) {
            this.dialog.setColorFromString(event.target.value, true);
        }
        else {
            this.colorPicker = event.target.value;
            this.colorPickerChange.emit(this.colorPicker);
        }
    }
    inputChanged(event) {
        this.cpInputChange.emit(event);
    }
    sliderChanged(event) {
        this.cpSliderChange.emit(event);
    }
    sliderDragEnd(event) {
        this.cpSliderDragEnd.emit(event);
    }
    sliderDragStart(event) {
        this.cpSliderDragStart.emit(event);
    }
    presetColorsChanged(value) {
        this.cpPresetColorsChange.emit(value);
    }
}
ColorPickerDirective.decorators = [
    { type: Directive, args: [{
                selector: '[colorPicker]',
                exportAs: 'ngxColorPicker',
            },] }
];
ColorPickerDirective.ctorParameters = () => [
    { type: Injector },
    { type: ComponentFactoryResolver },
    { type: ApplicationRef },
    { type: ViewContainerRef },
    { type: ElementRef },
    { type: ColorPickerService }
];
ColorPickerDirective.propDecorators = {
    colorPicker: [{ type: Input }],
    cpWidth: [{ type: Input }],
    cpHeight: [{ type: Input }],
    cpToggle: [{ type: Input }],
    cpDisabled: [{ type: Input }],
    cpIgnoredElements: [{ type: Input }],
    cpFallbackColor: [{ type: Input }],
    cpColorMode: [{ type: Input }],
    cpCmykEnabled: [{ type: Input }],
    cpOutputFormat: [{ type: Input }],
    cpAlphaChannel: [{ type: Input }],
    cpDisableInput: [{ type: Input }],
    cpDialogDisplay: [{ type: Input }],
    cpSaveClickOutside: [{ type: Input }],
    cpCloseClickOutside: [{ type: Input }],
    cpUseRootViewContainer: [{ type: Input }],
    cpPosition: [{ type: Input }],
    cpPositionOffset: [{ type: Input }],
    cpPositionRelativeToArrow: [{ type: Input }],
    cpOKButton: [{ type: Input }],
    cpOKButtonText: [{ type: Input }],
    cpOKButtonClass: [{ type: Input }],
    cpCancelButton: [{ type: Input }],
    cpCancelButtonText: [{ type: Input }],
    cpCancelButtonClass: [{ type: Input }],
    cpPresetLabel: [{ type: Input }],
    cpPresetColors: [{ type: Input }],
    cpPresetColorsClass: [{ type: Input }],
    cpMaxPresetColorsLength: [{ type: Input }],
    cpPresetEmptyMessage: [{ type: Input }],
    cpPresetEmptyMessageClass: [{ type: Input }],
    cpAddColorButton: [{ type: Input }],
    cpAddColorButtonText: [{ type: Input }],
    cpAddColorButtonClass: [{ type: Input }],
    cpRemoveColorButtonClass: [{ type: Input }],
    isShowSelectColorType: [{ type: Input }],
    cpInputChange: [{ type: Output }],
    cpToggleChange: [{ type: Output }],
    cpSliderChange: [{ type: Output }],
    cpSliderDragEnd: [{ type: Output }],
    cpSliderDragStart: [{ type: Output }],
    colorPickerOpen: [{ type: Output }],
    colorPickerClose: [{ type: Output }],
    colorPickerCancel: [{ type: Output }],
    colorPickerSelect: [{ type: Output }],
    colorPickerChange: [{ type: Output }],
    cpCmykColorChange: [{ type: Output }],
    cpPresetColorsChange: [{ type: Output }],
    handleClick: [{ type: HostListener, args: ['click',] }],
    handleFocus: [{ type: HostListener, args: ['focus',] }],
    handleInput: [{ type: HostListener, args: ['input', ['$event'],] }]
};

class ColorPickerModule {
}
ColorPickerModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule, NzButtonModule],
                exports: [ColorPickerDirective],
                providers: [ColorPickerService],
                declarations: [
                    ColorPickerComponent,
                    ColorPickerDirective,
                    TextDirective,
                    SliderDirective,
                ],
                entryComponents: [ColorPickerComponent],
            },] }
];

/**
 * Generated bundle index. Do not edit.
 */

export { Cmyk, ColorPickerComponent, ColorPickerDirective, ColorPickerModule, ColorPickerService, Hsla, Hsva, Rgba, SliderDirective, TextDirective };
//# sourceMappingURL=ngx-color-picker.js.map
