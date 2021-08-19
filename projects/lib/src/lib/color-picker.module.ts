import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { TextDirective, SliderDirective } from './helpers';

import { ColorPickerService } from './color-picker.service';
import { ColorPickerComponent } from './color-picker.component';
import { ColorPickerDirective } from './color-picker.directive';

@NgModule({
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
})
export class ColorPickerModule {}
