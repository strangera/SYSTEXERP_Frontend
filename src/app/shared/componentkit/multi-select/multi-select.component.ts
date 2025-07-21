import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { MultiSelect, MultiSelectLazyLoadEvent, MultiSelectModule } from 'primeng/multiselect';
import { NgIf, NgClass } from '@angular/common';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    MultiSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    ControlMessagesComponent,
  ],
})
export class MultiSelectComponent extends BasicKitComponent implements OnInit, OnChanges {
  @ViewChild('multiSelect') multiSelect!: MultiSelect;
  @Input() label = '';
  @Input() controlName = '';
  @Input() options: any[] = [];
  @Input() optionLabel = ''; // 資料的 Label
  @Input() optionValue = ''; // 資料的 Value
  @Input() control = new FormControl;
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() loading = true; // 載入狀態
  @Input() variant: 'filled' | 'outlined' = 'outlined';

  @Input() group = false; // 是否啟用分組
  @Input() optionGroupLabel = 'label'; // 分組的標籤欄位
  @Input() optionGroupChildren = 'items'; // 分組的子項目欄位
  @Input() selectedItemsLabel?: string;
  @Input() maxSelectedLabels = 3; // 預設值，可被覆寫
  @Input() panelStyle: Record<string, any> = { width: '280px' }; // 預設寬度，可被覆寫



  ngOnInit(): void {
    this.ensureControl();
    if (!this.control.disabled) {
      this.updateControlState(this.control);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && changes['options'].currentValue.length > 0) {
      this.loading = false;
    }
  }
  onLazyLoad(event: MultiSelectLazyLoadEvent) {
    console.log(event);
  }
  private ensureControl() {
    if (!this.control) {
      this.control = new FormControl();
    }
  }
}
