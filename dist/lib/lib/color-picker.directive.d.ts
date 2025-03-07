import { OnChanges, OnDestroy, EventEmitter, ApplicationRef, ElementRef, ViewContainerRef, Injector, ComponentFactoryResolver } from '@angular/core';
import { ColorPickerService } from './color-picker.service';
import { AlphaChannel, ColorMode, OutputFormat } from './helpers';
import * as ɵngcc0 from '@angular/core';
export declare class ColorPickerDirective implements OnChanges, OnDestroy {
    private injector;
    private cfr;
    private appRef;
    private vcRef;
    private elRef;
    private _service;
    private dialog;
    private dialogCreated;
    private ignoreChanges;
    private cmpRef;
    private viewAttachedToAppRef;
    colorPicker: string;
    cpWidth: string;
    cpHeight: string;
    cpToggle: boolean;
    cpDisabled: boolean;
    cpIgnoredElements: any;
    cpFallbackColor: string;
    cpColorMode: ColorMode;
    cpCmykEnabled: boolean;
    cpOutputFormat: OutputFormat;
    cpAlphaChannel: AlphaChannel;
    cpDisableInput: boolean;
    cpDialogDisplay: string;
    cpSaveClickOutside: boolean;
    cpCloseClickOutside: boolean;
    cpUseRootViewContainer: boolean;
    cpPosition: string;
    cpPositionOffset: string;
    cpPositionRelativeToArrow: boolean;
    cpOKButton: boolean;
    cpOKButtonText: string;
    cpOKButtonClass: string;
    cpCancelButton: boolean;
    cpCancelButtonText: string;
    cpCancelButtonClass: string;
    cpPresetLabel: string;
    cpPresetColors: string[];
    cpPresetColorsClass: string;
    cpMaxPresetColorsLength: number;
    cpPresetEmptyMessage: string;
    cpPresetEmptyMessageClass: string;
    cpAddColorButton: boolean;
    cpAddColorButtonText: string;
    cpAddColorButtonClass: string;
    cpRemoveColorButtonClass: string;
    isShowSelectColorType: boolean;
    cpInputChange: EventEmitter<{
        input: string;
        value: number | string;
        color: string;
    }>;
    cpToggleChange: EventEmitter<boolean>;
    cpSliderChange: EventEmitter<{
        slider: string;
        value: string | number;
        color: string;
    }>;
    cpSliderDragEnd: EventEmitter<{
        slider: string;
        color: string;
    }>;
    cpSliderDragStart: EventEmitter<{
        slider: string;
        color: string;
    }>;
    colorPickerOpen: EventEmitter<string>;
    colorPickerClose: EventEmitter<string>;
    colorPickerCancel: EventEmitter<string>;
    colorPickerSelect: EventEmitter<string>;
    colorPickerChange: EventEmitter<string>;
    cpCmykColorChange: EventEmitter<string>;
    cpPresetColorsChange: EventEmitter<any>;
    handleClick(): void;
    handleFocus(): void;
    handleInput(event: any): void;
    constructor(injector: Injector, cfr: ComponentFactoryResolver, appRef: ApplicationRef, vcRef: ViewContainerRef, elRef: ElementRef, _service: ColorPickerService);
    ngOnDestroy(): void;
    ngOnChanges(changes: any): void;
    openDialog(): void;
    closeDialog(): void;
    cmykChanged(value: string): void;
    stateChanged(state: boolean): void;
    colorChanged(value: string, ignore?: boolean): void;
    colorSelected(value: string): void;
    colorCanceled(): void;
    inputFocus(): void;
    inputChange(event: any): void;
    inputChanged(event: any): void;
    sliderChanged(event: any): void;
    sliderDragEnd(event: {
        slider: string;
        color: string;
    }): void;
    sliderDragStart(event: {
        slider: string;
        color: string;
    }): void;
    presetColorsChanged(value: any[]): void;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<ColorPickerDirective, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<ColorPickerDirective, "[colorPicker]", ["ngxColorPicker"], { "cpWidth": "cpWidth"; "cpHeight": "cpHeight"; "cpToggle": "cpToggle"; "cpDisabled": "cpDisabled"; "cpIgnoredElements": "cpIgnoredElements"; "cpFallbackColor": "cpFallbackColor"; "cpColorMode": "cpColorMode"; "cpCmykEnabled": "cpCmykEnabled"; "cpOutputFormat": "cpOutputFormat"; "cpAlphaChannel": "cpAlphaChannel"; "cpDisableInput": "cpDisableInput"; "cpDialogDisplay": "cpDialogDisplay"; "cpSaveClickOutside": "cpSaveClickOutside"; "cpCloseClickOutside": "cpCloseClickOutside"; "cpUseRootViewContainer": "cpUseRootViewContainer"; "cpPosition": "cpPosition"; "cpPositionOffset": "cpPositionOffset"; "cpPositionRelativeToArrow": "cpPositionRelativeToArrow"; "cpOKButton": "cpOKButton"; "cpOKButtonText": "cpOKButtonText"; "cpOKButtonClass": "cpOKButtonClass"; "cpCancelButton": "cpCancelButton"; "cpCancelButtonText": "cpCancelButtonText"; "cpCancelButtonClass": "cpCancelButtonClass"; "cpPresetLabel": "cpPresetLabel"; "cpPresetColorsClass": "cpPresetColorsClass"; "cpMaxPresetColorsLength": "cpMaxPresetColorsLength"; "cpPresetEmptyMessage": "cpPresetEmptyMessage"; "cpPresetEmptyMessageClass": "cpPresetEmptyMessageClass"; "cpAddColorButton": "cpAddColorButton"; "cpAddColorButtonText": "cpAddColorButtonText"; "cpAddColorButtonClass": "cpAddColorButtonClass"; "cpRemoveColorButtonClass": "cpRemoveColorButtonClass"; "isShowSelectColorType": "isShowSelectColorType"; "colorPicker": "colorPicker"; "cpPresetColors": "cpPresetColors"; }, { "cpInputChange": "cpInputChange"; "cpToggleChange": "cpToggleChange"; "cpSliderChange": "cpSliderChange"; "cpSliderDragEnd": "cpSliderDragEnd"; "cpSliderDragStart": "cpSliderDragStart"; "colorPickerOpen": "colorPickerOpen"; "colorPickerClose": "colorPickerClose"; "colorPickerCancel": "colorPickerCancel"; "colorPickerSelect": "colorPickerSelect"; "colorPickerChange": "colorPickerChange"; "cpCmykColorChange": "cpCmykColorChange"; "cpPresetColorsChange": "cpPresetColorsChange"; }, never>;
}

//# sourceMappingURL=color-picker.directive.d.ts.map