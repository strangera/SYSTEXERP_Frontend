import { ChangeDetectionStrategy, Component, input, OnInit, output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';

@Component({
  selector: 'app-radiobutton',
  templateUrl: './radiobutton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    RadioButtonModule,
    FormsModule,
    ReactiveFormsModule,
    ControlMessagesComponent,
  ],
})
export class RadiobuttonComponent extends BasicKitComponent implements OnInit {
  public _label = input<string>('', { alias: 'label' });
  public groupname = input<string>('');
  public control = input<FormControl>(new FormControl());
  public options = input.required<{ value: any, label: string; disabled?: boolean }[]>();
  public submitted = input<boolean>(!1); // 檢查欄位是否標準
  public disabled = input<boolean>(false); // 是否禁用
  public valueChange = output<any>(); // 用於發送所選的值
  public labelChange = output<string>(); // 用於發送選擇事件

  ngOnInit(): void {
    this.initControl(this.control());
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
