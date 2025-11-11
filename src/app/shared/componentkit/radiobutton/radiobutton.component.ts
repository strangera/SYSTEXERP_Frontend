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
  public options = input.required<{ value: any, label: string; }[]>();
  public submitted = input<boolean>(!1); // 檢查欄位是否標準
  public disabled = input<boolean>(!1); // 是否禁用
  public valueChange = output<any>(); // 用於發送所選的值

  ngOnInit(): void {
    this.initControl(this.control());
  }

  onSelectionChange(value: any): void {
    this.valueChange.emit(value); // 當選擇改變時發送事件
  }
}
