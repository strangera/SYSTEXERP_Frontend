import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';

@Component({
  selector: 'app-radiobutton-yn',
  templateUrl: './radiobutton-yn.component.html',
  styleUrl: './radiobutton-yn.component.scss'
})
export class RadiobuttonYNComponent extends BasicKitComponent implements OnInit {
  @Input() label = '';
  @Input() controlName = '';
  @Input() control: FormControl = new FormControl(); // 初始化為新 FormControl
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() disabled = false; // 是否禁用
  @Input() errorForGroup = false; // 用於 FormGroup 錯誤顯示

  // 定義「全部」、「是」、「否」的選項
  // value: null 代表「全部」，通常用於篩選條件，表示不篩選 Y/N
  // value: 'Y' 代表「是」
  // value: 'N' 代表「否」
  ynOptions = [
    { label: '全部', value: null },
    { label: '是', value: 'Y' },
    { label: '否', value: 'N' }
  ];

  ngOnInit(): void {
    // 檢查 control 是否已被正確傳入，如果沒有則使用預設
    if (!this.control) {
      this.control = new FormControl();
    }

    if (this.disabled) {
      this.control.disable({ emitEvent: false });
    }
    // BasicKitComponent 應該包含 updateControlState 方法
    this.updateControlState(this.control);
  }
}
