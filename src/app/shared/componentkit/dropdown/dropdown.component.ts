import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { NgIf, NgClass } from '@angular/common';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';
@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, DropdownModule, FormsModule, ReactiveFormsModule, NgClass, ControlMessagesComponent]
})
export class DropdownComponent extends BasicKitComponent implements OnInit {
  // 必填
  @Input() label = '';
  @Input() showLabel = true;
  @Input() controlName = '';
  @Input() control = new FormControl();
  @Input() options: unknown[] = [];
  @Input() optionLabel = ''; // 資料的 Label
  @Input() optionValue = ''; // 資料的 Value
  @Input() customPlaceholder = '請選擇';
  @Input() submitted = false; // 檢查欄位是否標準
  // PrimeNG 下拉選單屬性
  @Input() showClear = true; // 是否顯示清除按鈕
  @Input() filter = true; // 是否啟用過濾功能
  // 自訂屬性
  @Input() showErrorMessage = true;
  @Input() templateLabel = ''; // 自訂 Label 模板
  // 觸發事件
  @Output() changeEvent = new EventEmitter<DropdownChangeEvent>();

  ngOnInit(): void {
    this.initControl(this.control);
  }
  onDropdownChange(event: DropdownChangeEvent) {
    this.changeEvent.emit(event);
  }
}
