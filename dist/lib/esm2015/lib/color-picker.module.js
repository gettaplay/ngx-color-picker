import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { TextDirective, SliderDirective } from './helpers';
import { ColorPickerService } from './color-picker.service';
import { ColorPickerComponent } from './color-picker.component';
import { ColorPickerDirective } from './color-picker.directive';
export class ColorPickerModule {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3ItcGlja2VyLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2xpYi9zcmMvbGliL2NvbG9yLXBpY2tlci5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRXRELE9BQU8sRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRTNELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQzVELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBY2hFLE1BQU0sT0FBTyxpQkFBaUI7OztZQVo3QixRQUFRLFNBQUM7Z0JBQ1IsT0FBTyxFQUFFLENBQUMsWUFBWSxFQUFFLGNBQWMsQ0FBQztnQkFDdkMsT0FBTyxFQUFFLENBQUMsb0JBQW9CLENBQUM7Z0JBQy9CLFNBQVMsRUFBRSxDQUFDLGtCQUFrQixDQUFDO2dCQUMvQixZQUFZLEVBQUU7b0JBQ1osb0JBQW9CO29CQUNwQixvQkFBb0I7b0JBQ3BCLGFBQWE7b0JBQ2IsZUFBZTtpQkFDaEI7Z0JBQ0QsZUFBZSxFQUFFLENBQUMsb0JBQW9CLENBQUM7YUFDeEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IE56QnV0dG9uTW9kdWxlIH0gZnJvbSAnbmctem9ycm8tYW50ZC9idXR0b24nO1xuXG5pbXBvcnQgeyBUZXh0RGlyZWN0aXZlLCBTbGlkZXJEaXJlY3RpdmUgfSBmcm9tICcuL2hlbHBlcnMnO1xuXG5pbXBvcnQgeyBDb2xvclBpY2tlclNlcnZpY2UgfSBmcm9tICcuL2NvbG9yLXBpY2tlci5zZXJ2aWNlJztcbmltcG9ydCB7IENvbG9yUGlja2VyQ29tcG9uZW50IH0gZnJvbSAnLi9jb2xvci1waWNrZXIuY29tcG9uZW50JztcbmltcG9ydCB7IENvbG9yUGlja2VyRGlyZWN0aXZlIH0gZnJvbSAnLi9jb2xvci1waWNrZXIuZGlyZWN0aXZlJztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW0NvbW1vbk1vZHVsZSwgTnpCdXR0b25Nb2R1bGVdLFxuICBleHBvcnRzOiBbQ29sb3JQaWNrZXJEaXJlY3RpdmVdLFxuICBwcm92aWRlcnM6IFtDb2xvclBpY2tlclNlcnZpY2VdLFxuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBDb2xvclBpY2tlckNvbXBvbmVudCxcbiAgICBDb2xvclBpY2tlckRpcmVjdGl2ZSxcbiAgICBUZXh0RGlyZWN0aXZlLFxuICAgIFNsaWRlckRpcmVjdGl2ZSxcbiAgXSxcbiAgZW50cnlDb21wb25lbnRzOiBbQ29sb3JQaWNrZXJDb21wb25lbnRdLFxufSlcbmV4cG9ydCBjbGFzcyBDb2xvclBpY2tlck1vZHVsZSB7fVxuIl19