// 未完成(待確認使否要使用)
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { FormControl } from '@angular/forms';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';

@Component({
  selector: 'app-multi-select-table',
  templateUrl: './multi-select-table.component.html',
  styleUrl: './multi-select-table.component.scss'
})
export class MultiSelectTableComponent extends BasicKitComponent implements OnInit, OnChanges {
  // 表單參數
  @Input() control = new FormControl;                // 必填
  @Input() submitted = false;                        // 必填
  @Input() controlName = '';                         // 必填
  @Input() label = '';                               // 必填
  // 自動完成欄位
  @Input() suggestions: any[] = [];  // 建議的資料    // 必填
  @Input() optionLabel = '';                         // 必填
  @Input() optionValue: string | undefined;                         // 必填
  @Input() datakey = '';                         // 必填
  @Output() inputValueChanged = new EventEmitter<Record<string, string>>(); // 方法:輸入p-autoComplete事件
  @ViewChild('autoComplete') autoComplete!: AutoComplete;
  selectedItems: any[] = []; // 用於儲存已選取項目

  constructor() {
    super();
  }
  ngOnInit(): void {
    this.updateControlState(this.control);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['suggestions']) {
      const newSuggestions = changes['suggestions'].currentValue;
      const selectedItemsMap = new Map<any, any>();
      // 將 selectedItems 轉成 Map，方便比對
      this.selectedItems.forEach(item => {
        selectedItemsMap.set(item[this.datakey], item);
      });
      // 合併 newSuggestions 和 selectedItems
      const mergedSuggestions = [...newSuggestions];  // 從新的 suggestions 開始
      this.selectedItems.forEach(selectedItem => {
        if (!selectedItemsMap.has(selectedItem[this.datakey])) {
          // 如果 newSuggestions 中沒有相同的 datakey，則加入
          mergedSuggestions.push(selectedItem);
        }
        // 如果有重複的 datakey 則不覆蓋，以 newSuggestions 為主
      });
      this.suggestions = mergedSuggestions;
      console.log(this.suggestions);

    }
  }
  onInputChange(event: AutoCompleteCompleteEvent) {
    this.inputValueChanged.emit({
      [typeof this.optionValue === 'string' ? this.optionValue : this.optionLabel]: event.query
    });
  }
}
