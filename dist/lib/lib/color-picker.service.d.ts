import { Cmyk, Rgba, Hsla, Hsva } from './formats';
import { ColorPickerComponent } from './color-picker.component';
import * as ɵngcc0 from '@angular/core';
export declare class ColorPickerService {
    private active;
    constructor();
    setActive(active: ColorPickerComponent | null): void;
    hsva2hsla(hsva: Hsva): Hsla;
    hsla2hsva(hsla: Hsla): Hsva;
    hsvaToRgba(hsva: Hsva): Rgba;
    cmykToRgb(cmyk: Cmyk): Rgba;
    rgbaToCmyk(rgba: Rgba): Cmyk;
    rgbaToHsva(rgba: Rgba): Hsva;
    rgbaToHex(rgba: Rgba, allowHex8?: boolean): string;
    normalizeCMYK(cmyk: Cmyk): Cmyk;
    denormalizeCMYK(cmyk: Cmyk): Cmyk;
    denormalizeRGBA(rgba: Rgba): Rgba;
    stringToHsva(colorString?: string, allowHex8?: boolean): Hsva | null;
    outputFormat(hsva: Hsva, outputFormat: string, alphaChannel: string | null): string;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<ColorPickerService, never>;
    static ɵprov: ɵngcc0.ɵɵInjectableDef<ColorPickerService>;
}

//# sourceMappingURL=color-picker.service.d.ts.map