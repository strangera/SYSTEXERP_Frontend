import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';

@Component({
  selector: 'app-radiobutton-yn',
  templateUrl: './radiobutton-yn.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    RadioButtonModule,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    ControlMessagesComponent,
  ],
})
export class RadiobuttonYNComponent extends BasicKitComponent implements OnInit {
  @Input() label = '';
  @Input() controlName = '';
  @Input() control = new FormControl(); // 初始化為新 FormControl
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() errorForGroup = false; // 用於 FormGroup 錯誤顯示
  @Input() showAll = false; // 是否顯示「全部」選項

  ynOptions: { label: string; value: string | null }[] = [];

  ngOnInit(): void {
    this.updateControlState(this.control);
    this.ynOptions = this.showAll
      ? [
        { label: '全部', value: null },
        { label: '是', value: 'Y' },
        { label: '否', value: 'N' },
      ]
      : [
        { label: '是', value: 'Y' },
        { label: '否', value: 'N' },
      ];
  }
}
