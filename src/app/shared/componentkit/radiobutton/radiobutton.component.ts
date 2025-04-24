import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-radiobutton',
  templateUrl: './radiobutton.component.html',
  styleUrl: './radiobutton.component.scss'
})
export class RadiobuttonComponent extends BasicKitComponent implements OnInit {
  @Input() label: string = '';
  @Input() groupname: string = '';
  @Input() control: FormControl = new FormControl();
  @Input() options: { value: any, label: string }[] = [];
  @Input() submitted: boolean = false; // 檢查欄位是否標準
  @Output() valueChange: EventEmitter<any> = new EventEmitter<any>(); // 用於發送所選的值

  ngOnInit(): void {
    // Required *
    this.checkRequiredValidator(this.control);
    // Placeholder
    // this.setPlaceholder('請選擇', this.control);
  }

  onSelectionChange(value: any): void {
    this.valueChange.emit(value); // 當選擇改變時發送事件
  }
}
