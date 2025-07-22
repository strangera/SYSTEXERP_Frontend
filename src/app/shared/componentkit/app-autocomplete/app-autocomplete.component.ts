// ========== 修正後的 app-autocomplete.component.ts ==========
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgIf, NgClass } from '@angular/common';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PrimeTemplate } from 'primeng/api';

export interface AutoCompleteOption {
  value: string;
  label: string;
  fullText: string;
  bankCode?: string;
  bankName?: string;
  branchCode?: string;
  branchName?: string;
}

@Component({
  selector: 'app-autocomplete',
  templateUrl: './app-autocomplete.component.html',
  styleUrls: ['./app-autocomplete.component.scss'],
  standalone: true,
  imports: [NgIf, AutoCompleteModule, FormsModule, NgClass, PrimeTemplate]
})
export class AutoCompleteComponent implements OnInit, OnDestroy, OnChanges {

  @Input() label = '';
  @Input() placeholder = '請輸入搜尋...';
  @Input() controlName = '';
  @Input() control = new FormControl();
  @Input() submitted = false;
  @Input() options: string[] = [];
  @Input() forceSelection = false;
  @Input() dropdown = true;
  @Input() maxResults = 10;
  @Input() searchMethod?: (keyword: string) => Observable<any[]>;

  // 🎯 新增：支援外部設定選中值
  @Input() selectedOption: AutoCompleteOption | null = null;

  @Output() selectEvent = new EventEmitter<AutoCompleteOption>();
  @Output() unselectEvent = new EventEmitter<any>();
  @Output() changeEvent = new EventEmitter<any>();
  // 🎯 新增：選中值變更事件
  @Output() selectedOptionChange = new EventEmitter<AutoCompleteOption | null>();

  filteredOptions: AutoCompleteOption[] = [];
  processedOptions: AutoCompleteOption[] = [];

  private destroy$ = new Subject<void>();
  private isInternalChange = false; // 🎯 防止循環更新

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.processApiData();
    this.setupValueListener();
    this.initializeFromControlValue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // 🎯 當外部設定 selectedOption 時
    if (changes['selectedOption'] && !this.isInternalChange) {
      console.log('🔄 外部設定 selectedOption:', changes['selectedOption'].currentValue);
      this.handleExternalSelectedOptionChange();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 🎯 處理外部設定的 selectedOption
  private handleExternalSelectedOptionChange(): void {
    if (this.selectedOption) {
      // 設定 FormControl 的值
      this.control.setValue(this.selectedOption.value, { emitEvent: false });
      console.log('✅ 已同步 selectedOption 到 FormControl:', this.selectedOption.value);
    } else {
      // 清空值
      this.control.setValue('', { emitEvent: false });
      console.log('🗑️ 已清空 FormControl');
    }
    this.cdr.detectChanges();
  }

  private setupValueListener(): void {
    if (this.control) {
      this.control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
        if (value && !this.selectedOption) {
          this.initializeFromValue(value);
        }
      });
    }
  }

  // 🎯 從 FormControl 初始值初始化
  private initializeFromControlValue(): void {
    const currentValue = this.control.value;
    if (currentValue && !this.selectedOption) {
      console.log('🎯 從 FormControl 初始化:', currentValue);
      this.initializeFromValue(currentValue);
    }
  }

  private processApiData(): void {
    this.processedOptions = this.options.map(item => this.parseApiData(item));
  }

  private parseApiData(apiData: string): AutoCompleteOption {
    // 🎯 解析 "0040037臺灣銀行營業部" 格式
    let bankCode = '';
    let bankName = '';

    // 嘗試解析銀行代碼和名稱
    const match = apiData.match(/^(\d{7})(.+)$/);
    if (match) {
      bankCode = match[1];      // "0040037"
      bankName = match[2];      // "臺灣銀行營業部"
    }

    return {
      value: bankCode || apiData.substring(0, 7),  // 用於 FormControl 的值（只有代碼）
      label: apiData,                              // 🎯 顯示完整文字（代碼+名稱）
      fullText: apiData,                           // 完整文字
      bankCode: bankCode,
      bankName: bankName,
      branchCode: '',
      branchName: ''
    };
  }

  onSearch(event: any): void {
    const query = event.query;

    if (!query || query.length < 1) {
      this.filteredOptions = [];
      return;
    }

    // 如果有提供搜尋方法，使用動態搜尋
    if (this.searchMethod) {
      this.searchMethod(query).subscribe({
        next: (data: string[]) => {
          console.log('🔍 API 返回的資料:', data);

          this.filteredOptions = data.map(item => this.parseApiData(item)).slice(0, this.maxResults);

          console.log('✅ 處理後的選項:', this.filteredOptions);
        },
        error: (err) => {
          console.warn('❌ 動態搜尋失敗:', err);
          this.filteredOptions = [];
        }
      });
    } else {
      // 靜態搜尋邏輯
      this.filteredOptions = this.processedOptions.filter(option =>
        option.value.includes(query) ||
        option.label.toLowerCase().includes(query)
      ).slice(0, this.maxResults);
    }
  }

  // 🎯 新增：監聽 PrimeNG AutoComplete 的選擇事件
  onModelChange(selectedOption: AutoCompleteOption | null): void {
    console.log('🎯 AutoComplete 模型變更:', selectedOption);

    this.isInternalChange = true;

    if (selectedOption) {
      // 有選中項目
      this.selectedOption = selectedOption;
      this.control.setValue(selectedOption.value);

      console.log('✅ 項目已選中:', selectedOption);

      // 發出事件
      this.selectEvent.emit(selectedOption);
      this.changeEvent.emit(selectedOption);
      this.selectedOptionChange.emit(selectedOption);
    } else {
      // 清空選擇
      this.selectedOption = null;
      this.control.setValue('');

      console.log('🗑️ 選擇已清空');

      // 發出事件
      this.unselectEvent.emit(null);
      this.selectedOptionChange.emit(null);
    }

    setTimeout(() => {
      this.isInternalChange = false;
    }, 0);
  }

  private initializeFromValue(value: string): void {
    if (value && value.length >= 1) {
      // 🎯 嘗試從現有選項中找到匹配項
      const option = this.processedOptions.find(opt => opt.value === value);
      if (option) {
        this.selectedOption = option;
        this.cdr.detectChanges();
        console.log('🎯 已從值初始化選項:', option);
      } else {
        // 🎯 如果找不到，嘗試用搜尋方法重建
        if (this.searchMethod) {
          this.searchMethod(value).subscribe({
            next: (data: string[]) => {
              const matchedItem = data.find(item => item.includes(value));
              if (matchedItem) {
                this.selectedOption = this.parseApiData(matchedItem);
                this.cdr.detectChanges();
                console.log('🎯 已從搜尋重建選項:', this.selectedOption);
              }
            },
            error: (err) => {
              console.warn('❌ 重建選項失敗:', err);
            }
          });
        }
      }
    }
  }

  clearSelection(): void {
    this.selectedOption = null;
    this.control.setValue('');
    this.unselectEvent.emit(null);
    this.selectedOptionChange.emit(null);
  }

  get isRequired(): boolean {
    return !!(this.control?.hasError?.('required') && this.control?.touched);
  }

  get hasError(): boolean {
    return this.submitted && this.control?.errors !== null && this.control?.errors !== undefined;
  }

  // 🎯 新增：除錯方法
  debugAutoComplete(): void {
    console.log('🔍 AutoComplete 狀態:');
    console.log('  selectedOption:', this.selectedOption);
    console.log('  control.value:', this.control.value);
    console.log('  filteredOptions:', this.filteredOptions);
  }
}
