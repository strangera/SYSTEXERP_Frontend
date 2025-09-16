import { NgClass, NgIf } from '@angular/common';
import { Component, ElementRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';

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
export class MultiSelectComponent extends BasicKitComponent implements OnInit {
  @ViewChild('multiSelect') multiSelect!: MultiSelect;
  @Input() override label = '';
  @Input() override controlName = '';
  @Input() set options(value: any[] | null) {
    if (value !== null) {
      this.loading = false;
      this._options = value;
    } else {
      this.loading = true;
      this._options = [];
    }
  };
  get options(): any[] { return this._options; }
  @Input() optionLabel = ''; // 資料的 Label
  @Input() optionValue: string | undefined = ''; // 資料的 Value
  @Input() control = new FormControl;
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() loading = false;
  @Input() variant: 'filled' | 'outlined' = 'outlined';
  @Input() appendTo: HTMLElement | ElementRef | TemplateRef<any> | string | null | undefined | any = void 0;

  @Input() group = false; // 是否啟用分組
  @Input() optionGroupLabel = 'label'; // 分組的標籤欄位
  @Input() optionGroupChildren = 'items'; // 分組的子項目欄位
  @Input() selectedItemsLabel?: string;
  @Input() maxSelectedLabels = 3; // 預設值，可被覆寫
  @Input() filter = true;
  @Input() dataKey = this.optionValue;
  private _options: any[] = [];

  ngOnInit(): void {
    this.ensureControl();
    if (!this.control.disabled) {
      this.updateControlState(this.control);
    }
  }
  private ensureControl() {
    if (!this.control) {
      this.control = new FormControl();
    }
  }
}
