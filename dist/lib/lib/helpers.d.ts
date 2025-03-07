import { EventEmitter, ElementRef } from '@angular/core';
import * as ɵngcc0 from '@angular/core';
export declare type ColorMode = 'color' | 'c' | '1' | 'grayscale' | 'g' | '2' | 'presets' | 'p' | '3';
export declare type AlphaChannel = 'enabled' | 'disabled' | 'always' | 'forced';
export declare type BoundingRectangle = {
    top: number;
    bottom: number;
    left: number;
    right: number;
    height: number;
    width: number;
};
export declare type OutputFormat = 'auto' | 'hex' | 'rgba' | 'hsla';
export declare function calculateAutoPositioning(elBounds: BoundingRectangle, triggerElBounds: BoundingRectangle): string;
export declare function detectIE(): boolean | number;
export declare class TextDirective {
    rg: number;
    text: any;
    newValue: EventEmitter<any>;
    inputChange(event: any): void;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<TextDirective, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<TextDirective, "[text]", never, { "rg": "rg"; "text": "text"; }, { "newValue": "newValue"; }, never>;
}
export declare class SliderDirective {
    private elRef;
    private listenerMove;
    private listenerStop;
    rgX: number;
    rgY: number;
    slider: string;
    dragEnd: EventEmitter<any>;
    dragStart: EventEmitter<any>;
    newValue: EventEmitter<any>;
    mouseDown(event: any): void;
    touchStart(event: any): void;
    constructor(elRef: ElementRef);
    private move;
    private start;
    private stop;
    private getX;
    private getY;
    private setCursor;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<SliderDirective, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<SliderDirective, "[slider]", never, { "rgX": "rgX"; "rgY": "rgY"; "slider": "slider"; }, { "dragEnd": "dragEnd"; "dragStart": "dragStart"; "newValue": "newValue"; }, never>;
}
export declare class SliderPosition {
    h: number;
    s: number;
    v: number;
    a: number;
    constructor(h: number, s: number, v: number, a: number);
}
export declare class SliderDimension {
    h: number;
    s: number;
    v: number;
    a: number;
    constructor(h: number, s: number, v: number, a: number);
}

//# sourceMappingURL=helpers.d.ts.map