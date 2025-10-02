import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';

@Component({
  selector: 'app-radiobutton',
  templateUrl: './radiobutton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    RadioButtonModule,
    FormsModule,
    ReactiveFormsModule,
    ControlMessagesComponent,
  ],
})
export class RadiobuttonComponent extends BasicKitComponent implements OnInit {
  @Input() override label = '';
  @Input() groupname = '';
  @Input() control: FormControl = new FormControl();
  @Input() options: { value: any, label: string }[] = [];
  @Input() submitted = false; // 檢查欄位是否標準
  @Output() valueChange: EventEmitter<any> = new EventEmitter<any>(); // 用於發送所選的值

  ngOnInit(): void {
    this.updateControlState(this.control);
  }

  onSelectionChange(value: any): void {
    this.valueChange.emit(value); // 當選擇改變時發送事件
  }
}
