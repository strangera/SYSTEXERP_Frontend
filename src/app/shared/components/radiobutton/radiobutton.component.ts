import { ChangeDetectionStrategy, Component, inject, input, OnInit, output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { EnterToTabDirective } from '@shared/directive/enter-to-tab.directive';
import { FieldStateDirective } from '@shared/directive/field-state.directive';

@Component({
  selector: 'app-radiobutton',
  template: `
  @if (_label() !== "") {
<label [for]="groupname() + '_' + options()[0].value" class="block mb-2 font-bold">
  {{ _label() }}
  @if (fieldState.isRequired) {
  <span class="text-red-500">*</span>
  }
</label>
}

<div class="flex flex-wrap gap-3 py-2">
  @for (option of options(); track option.value) {
  <div class="flex items-center" [class.pointer-events-none]="disabled() || option.disabled"
    [class.opacity-60]="disabled() || option.disabled">
    <p-radioButton [inputId]="groupname() + '_' + option.value" [name]="groupname()" [value]="option.value"
      [formControl]="control()" (onClick)="onSelectionChange(option.value, option.label)"
      [disabled]="disabled() || (option.disabled ?? false)" appEnterToTab></p-radioButton>

    <label [for]="groupname() + '_' + option.value" class="ml-2 cursor-pointer"
      [class.text-gray-400]="disabled() || option.disabled">
      {{ option.label }}
    </label>
  </div>
  }
</div>
@if (submitted() && fieldState.getErrorMessage(control()); as msg) {
  <div class="text-red-600 text-sm">{{ msg }}</div>
}
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    RadioButtonModule,
    FormsModule,
    ReactiveFormsModule,
    EnterToTabDirective,
  ],
  hostDirectives: [FieldStateDirective],
})
export class RadiobuttonComponent implements OnInit {
  protected readonly fieldState = inject(FieldStateDirective, { self: true });

  public _label = input<string>('', { alias: 'label' });
  public groupname = input<string>('');
  public control = input<FormControl>(new FormControl());
  public options = input.required<{ value: any, label: string; disabled?: boolean }[]>();
  public submitted = input<boolean>(!1); // 檢查欄位是否標準
  public disabled = input<boolean>(false); // 是否禁用
  public valueChange = output<any>(); // 用於發送所選的值
  public labelChange = output<string>(); // 用於發送選擇事件

  ngOnInit(): void {
    this.fieldState.initControl(this.control());
  }

  onSelectionChange(value: any, label: string): void {
    // 取得該選項的 disabled 狀態
    const currentOption = this.options().find(opt => opt.value === value);
    const isOptionDisabled = currentOption?.disabled ?? false;

    // 如果組件整體禁用，或者該選項單獨禁用，則不發送事件
    if (this.disabled() || isOptionDisabled || this.control().disabled) {
      return;
    }

    this.valueChange.emit(value);
    this.labelChange.emit(label);
  }
}
