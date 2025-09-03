/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { TableRowSelectEvent } from 'primeng/table';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { AutoCompleteCompleteEvent, AutoCompleteSelectEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { Column } from '../table/table.model';
import { NgIf, NgClass, NgFor } from '@angular/common';
import { PrimeTemplate } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonDirective } from 'primeng/button';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';
import { DialogModule } from 'primeng/dialog';
import { TableComponent } from '../table/table.component';

@Component({
  selector: 'app-input-group',
  templateUrl: './input-group.component.html',
  styleUrl: './input-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, AutoCompleteModule, FormsModule, ReactiveFormsModule, NgClass, PrimeTemplate, InputTextModule, ButtonDirective, ControlMessagesComponent, DialogModule, NgFor, TableComponent]
})
export class InputGroupComponent<T> extends BasicKitComponent implements OnInit, OnChanges {
  // 基本設定
  @Input() override label = '';
  @Input() override controlName = '';
  @Input() control = new FormControl;
  @Input() submitted = false;
  @Input() options: any[] = [];
  @Input() filteredOptions: any[] = [];
  @Input() optionLabel = ''; // 資料的 Label
  @Input() optionValue = ''; // 資料的 Value
  @Input() optionValueAndLabel = ''; // 資料的 Value 和 Label
  @Input() columns: Column[] = [];
  @Input() showReportMode = true; // 是否顯示 匯出按鈕
  @Output() changeEvent = new EventEmitter<DropdownChangeEvent>();
  @Output() selected = new EventEmitter<TableRowSelectEvent>();
  filteredData: T[] = []; // 過濾後的資料
  selectedItems: T[] = []; // 選擇的資料
  dialogVisible = false; // 是否顯示彈窗
  dataKey = ''; // 資料的key
  metaKey = true; // 是否使用meta鍵選擇
  value = '';
  searchForm = new FormGroup({});
  constructor() { super(); }
  ngOnInit(): void {
    this.initDialog();
    if (!this.control.disabled) {
      this.updateControlState(this.control);
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && this.options) {
      this.filteredData = [...this.options];
    }
    this.value = this.options.find(option => option[this.optionValue] === this.control.value)?.[this.optionLabel] || '';
    this.filterOptions({ originalEvent: {} as Event, query: '' });// 提供一个简单的 originalEvent 对象
  }
  // 初始化 Dialog
  initDialog() {
    // 初始化 Form 並添加控制項
    this.searchForm = new FormGroup({});
    this.columns.forEach(column => {
      const control = new FormControl('');
      this.searchForm.addControl(column.field, control);
      control.valueChanges.subscribe(() => {
        this.filterData();
      });
    });
    this.dataKey = this.optionValue;
    this.control.valueChanges.subscribe(value => {
      const option = this.options.find(option =>
        option[this.optionValue] === value
      );
      this.value = option ? option[this.optionLabel] : '';
    });
  }
  // Dialog 顯示彈窗
  search() {
    this.dialogVisible = true;
  }
  // Table 過濾資料
  filterData() {
    this.filteredData = this.options.filter(item => {
      return this.columns.every(column => {
        const controlValue = this.searchForm.get(column.field)?.value || '';
        return String(item[column.field]).toLowerCase().includes(controlValue.toLowerCase());
      });
    });
  }
  // Table 選擇事件
  onRowSelect(event: any) {
    const selectedItem = Array.isArray(event) ? event[0] : event;
    if (!selectedItem) { return; }
    this.selected.emit(selectedItem);
    this.control.setValue(selectedItem[this.optionValue]);
    this.value = selectedItem[this.optionLabel];
    this.dialogVisible = false;
  }
  // dropdown 選擇事件
  onSelect(event: AutoCompleteSelectEvent) {
    this.changeEvent.emit(event.value);
    this.value = event.value[this.optionLabel];
  }
  // 篩選選項
  filterOptions(event: AutoCompleteCompleteEvent) {
    const filtered: any[] = [];
    const query = event.query.toLowerCase();
    for (const option of this.options) {
      const optionValue = option[this.optionValue];
      if (optionValue && optionValue.toLowerCase().indexOf(query) === 0) {
        filtered.push(option);
      }
    }
    this.filteredOptions = filtered;
  }
}

