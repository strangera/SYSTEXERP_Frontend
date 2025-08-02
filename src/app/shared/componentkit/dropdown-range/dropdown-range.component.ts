import { NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicKitComponent } from '@shared/componentextends/basic-kit/basic-kit.component';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { DropdownComponent } from '../dropdown/dropdown.component';

@Component({
  selector: 'app-dropdown-range',
  standalone: true,
  imports: [
    NgIf,
    InputGroupModule,
    FormsModule,
    DropdownComponent,
    ReactiveFormsModule,
    NgClass,
  ],
  templateUrl: './dropdown-range.component.html',
  styleUrl: './dropdown-range.component.scss'
})
export class DropdownRangeComponent extends BasicKitComponent implements OnInit {
  // 必填欄位
  @Input() label = '';
  @Input() showLabel = true;
  @Input() startLabel!: string;
  @Input() endLabel!: string;
  @Input() controlName = '';
  @Input() startControlName = '';
  @Input() endControlName = '';
  @Input() startControl = new FormControl(); // 開始值的 FormControl
  @Input() endControl = new FormControl(); // 結束值的 FormControl
  @Input() options: unknown[] = [];
  @Input() optionLabel = ''; // 資料的 Label
  @Input() optionValue = ''; // 資料的 Value
  @Input() submitted = false;
  // PrimeNG 下拉選單屬性
  @Input() showClear = true; // 是否顯示清除按鈕
  @Input() filter = true; // 是否啟用過濾功能
  // 自訂屬性
  @Input() errorForGroup = false;
  @Input() templateLabel = ''; // 自訂 Label 模板
  // 觸發事件
  @Output() startChangeEvent = new EventEmitter<DropdownChangeEvent>();
  @Output() endChangeEvent = new EventEmitter<DropdownChangeEvent>();

  ngOnInit(): void {
    this.checkRequiredValidator(this.startControl, 0);
    this.checkRequiredValidator(this.endControl, 1);
  }

  onStartDropdownChange(event: DropdownChangeEvent) {
    this.startChangeEvent.emit(event);
  }
  onEndDropdownChange(event: DropdownChangeEvent) {
    this.endChangeEvent.emit(event);
  }
}
