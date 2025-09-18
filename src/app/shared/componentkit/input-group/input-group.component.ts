/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { TableRowSelectEvent } from 'primeng/table';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { AutoCompleteCompleteEvent, AutoCompleteSelectEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { NgIf, NgClass, NgFor } from '@angular/common';
import { PrimeTemplate } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonDirective } from 'primeng/button';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';
import { DialogModule } from 'primeng/dialog';
import { TableComponent } from '../table/table.component';
import { untilDestroyed } from '@ngneat/until-destroy';

export interface InputGroupColumn {
  field: string;     // 欄位名稱 (資料的欄位名稱)
  header: string;    // 欄位標題 (顯示在表格上的標題)
  visible?: boolean;  // 是否顯示 (可篩選欄位是否顯示？)
  hidden?: boolean;  // 是否隱藏 (是否為無法篩選欄位)
  format?: (value: any, index?: number, rowData?: any) => string | number | null; // 格式化(日期、時間...)
}

@Component({
  selector: 'app-input-group',
  templateUrl: './input-group.component.html',
  styleUrl: './input-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, AutoCompleteModule, FormsModule, ReactiveFormsModule, NgClass, PrimeTemplate, InputTextModule, ButtonDirective, ControlMessagesComponent, DialogModule, NgFor, TableComponent]
})
export class InputGroupComponent extends BasicKitComponent implements OnInit, OnChanges {
  // 基本設定
  @Input() override label = '';
  @Input() override controlName = '';
  @Input() control = new FormControl;
  @Input() customPlaceholder = '請選擇';
  @Input() submitted = false;
  // autoComplete
  @Input() set options(value: any[] | null) { value !== null ? this._options = value : this._options = [] };
  get options(): any[] { return this._options; }
  private _options: any[] = [];
  @Input() filteredOptions: any[] = [];
  @Input() optionLabel: string | undefined; // 資料的 Label
  @Input() optionValue: string | undefined; // 資料的 Value
  @Input() templateLabel: string | undefined; // 模板的 Label
  @Input() customLabel = ''; // 自訂 Label
  // table
  dialogVisible = false; // 是否顯示彈窗
  searchForm = new FormGroup({});
  @Input() columns: InputGroupColumn[] = [];
  @Output() changeEvent = new EventEmitter<DropdownChangeEvent>();
  @Output() selected = new EventEmitter<TableRowSelectEvent>();
  filteredData: any = []; // 過濾後的資料
  // 右邊文字顯示
  @Input() value: any = '';

  constructor() { super(); }
  ngOnInit(): void {
    this.initDialog();
    this.initControl(this.control);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && this.options) {
      this.filteredData = [...this.options];
    }
    let foundOption: any = null;
    if (this.optionValue) {
      foundOption = this.options.find(option => option[this.optionValue as string] === this.control.value);
    } else {
      foundOption = this.options.find(option => option === this.control.value);
    }
    if (foundOption) {
      if (this.optionLabel) {
        this.value = foundOption[this.optionLabel];
      } else {
        this.value = '';
      }
    }
    this.filterOptions({ originalEvent: {} as Event, query: '' });

    if (changes['columns'] && this.columns.length > 0) {
      this.searchForm = new FormGroup({});
      this.columns.forEach(column => {
        const control = new FormControl('');
        this.searchForm.addControl(column.field, control);
        control.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
          // Table 過濾資料
          this.filteredData = this.options.filter(item => {
            return this.columns.every(column => {
              const controlValue = this.searchForm.get(column.field)?.value || '';
              return String(item[column.field]).toLowerCase().includes(controlValue.toLowerCase());
            });
          });
        });
      });
    }
  }
  // 篩選選項
  filterOptions(event: AutoCompleteCompleteEvent) {
    const filtered: any[] = [];
    const query = event.query.toLowerCase();
    for (const option of this.options) {
      if (this.optionValue) {
        const optionValue = option[this.optionValue];
        if (typeof optionValue === 'string' && optionValue.toLowerCase().includes(query)) {
          filtered.push(option);
        }
      } else {
        const foundMatch = Object.values(option).some(value =>
          typeof value === 'string' && value.toLowerCase().includes(query)
        );
        if (foundMatch) {
          filtered.push(option);
        }
      }
    }
    this.filteredOptions = filtered;
  }
  onInput(event: any) {
    let foundOption: any = null;
    if (this.optionValue) {
      foundOption = this.options.find(option => option[this.optionValue as string] === this.control.value);
    } else {
      foundOption = this.options.find(option => option === this.control.value);
    }
    if (foundOption) {
      if (this.optionLabel) {
        this.value = foundOption[this.optionLabel];
      } else {
        this.value = '';
      }
    }
  }
  // 初始化 Dialog
  initDialog() {
    this.control.valueChanges.pipe(untilDestroyed(this)).subscribe(value => {
      if (!value) {
        this.value = '';
      }
      let foundOption: any = null;
      if (this.optionValue) {
        foundOption = this.options.find(option => option[this.optionValue as string] === value);
      } else {
        foundOption = this.options.find(option => option === value);
      }
      if (foundOption) {
        if (this.optionLabel) {
          this.value = foundOption[this.optionLabel];
        } else {
          this.value = '';
        }
      }
    });
  }
  // Table 選擇事件
  onRowSelect(event: any) {
    const selectedItem = Array.isArray(event) ? event[0] : event;
    if (!selectedItem) { return; }

    this.selected.emit(selectedItem);
    // 確保 optionValue 和 optionLabel 存在才進行賦值
    if (this.optionValue && this.optionLabel) {
      this.control.setValue(selectedItem[this.optionValue]);
      this.value = selectedItem[this.optionLabel];
    } else if (this.customLabel && this.optionLabel) {
      this.control.setValue(event[0]);
      this.value = selectedItem[this.optionLabel];
    }

    this.dialogVisible = false;
  }
  // dropdown 選擇事件
  onSelect(event: AutoCompleteSelectEvent) {
    this.changeEvent.emit(event.value);
    if (this.optionValue && this.optionLabel) {
      // this.control.setValue(event.value[this.optionValue]);
      this.value = event.value[this.optionLabel];
    } else if (this.customLabel && this.optionLabel) {
      // this.control.setValue(event.value);
      this.value = event.value[this.optionLabel];
    }
  }
}

