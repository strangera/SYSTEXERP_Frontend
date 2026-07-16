import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, EventEmitter, Input, Component as NgComponent, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
// PrimeNG
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ColorPickerModule } from 'primeng/colorpicker';
import { SelectButtonModule } from 'primeng/selectbutton';
// 自定義組件與常數
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import * as CONST from '../tls42010.const';

@NgComponent({
  selector: 'app-tls42010-editor',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, AsyncPipe, TranslateModule,
    SelectButtonModule, ColorPickerModule, CheckboxModule, ButtonModule,
    DropdownComponent, InputTextComponent, InputNumberComponent
  ],
  templateUrl: './tls42010-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush // 效能優化
})
export class TLS42010EditorComponent {
  @Input() form!: FormGroup;
  @Input() funcOptions$!: Observable<any[]>;
  @Input() styleOptions: any[] = [];
  @Input() selectedKey: any; // 用於計算標籤顯示

  @Output() mergeAction = new EventEmitter<string>();
  @Output() attrAction = new EventEmitter<{ action: string, event: MouseEvent }>();
  @Output() fontTypeChange = new EventEmitter<{ index: number, checked: boolean }>();

  readonly tabOptions = CONST.TLS42010_TAB_OPTIONS;
  readonly KB_SwitchOptions = CONST.KB_SwitchOptions;
  readonly KB_FontOptions = CONST.KB_FONT_OPTIONS;
  readonly KB_FonttypedOptions = CONST.KB_FONTTYPED_OPTIONS;
  readonly KB_MergeOptions = CONST.KB_MergeOptions;
  readonly KB_AttrOptions = CONST.KB_AttrOptions;

  selectedTab: 'func' | 'button' | 'font' | 'other' = 'func';

  getControl(name: string) {
    return this.form.get(name) as FormControl;
  }

  // 標籤邏輯移到子組件
  getMergeButtonLabel(option: any): string {
    if (!this.selectedKey) return option.label;
    if (option.value === 'mergeRight') {
      const count = this.selectedKey.mergeRight || 0;
      return count > 0 ? `往右合併 (${count}格)` : option.label;
    } else if (option.value === 'mergeDown') {
      const count = this.selectedKey.mergeDown || 0;
      return count > 0 ? `往下合併 (${count}格)` : option.label;
    }
    return option.label;
  }

  isMergeOptionSelected(value: string): boolean {
    if (!this.selectedKey) return false;
    if (value === 'mergeRight') return (this.selectedKey.mergeRight || 0) > 0;
    if (value === 'mergeDown') return (this.selectedKey.mergeDown || 0) > 0;
    return false;
  }
}
