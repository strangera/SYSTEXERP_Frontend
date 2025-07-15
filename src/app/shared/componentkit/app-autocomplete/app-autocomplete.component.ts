// ========== autocomplete.component.ts ==========
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
export class AutoCompleteComponent implements OnInit, OnDestroy {

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

  @Output() selectEvent = new EventEmitter<AutoCompleteOption>();
  @Output() unselectEvent = new EventEmitter<any>();
  @Output() changeEvent = new EventEmitter<any>();

  selectedOption: AutoCompleteOption | null = null;
  filteredOptions: AutoCompleteOption[] = [];
  processedOptions: AutoCompleteOption[] = [];

  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.processApiData();
    this.setupValueListener();
    this.setupModelChangeListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  private setupModelChangeListener(): void {
    // 使用 setTimeout 來監聽 ngModel 的變化
    setTimeout(() => {
      // 當 selectedOption 改變時，更新 FormControl
      if (this.selectedOption) {
        this.control.setValue(this.selectedOption.value);
        this.control.markAsDirty();
        this.selectEvent.emit(this.selectedOption);
        this.changeEvent.emit(this.selectedOption);
      } else {
        this.control.setValue('');
        this.unselectEvent.emit(null);
      }
    }, 0);
  }

  private processApiData(): void {
    this.processedOptions = this.options.map(item => this.parseApiData(item));
  }

  private parseApiData(apiData: string): AutoCompleteOption {
    return {
      value: apiData,
      label: apiData,
      fullText: apiData,
      bankCode: '',
      bankName: '',
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
        next: (data: string[]) => {  // 改成 string[]
          console.log('API 返回的資料:', data);

          this.filteredOptions = data.map(item => this.parseApiData(item)).slice(0, this.maxResults);

          console.log('處理後的選項:', this.filteredOptions);
        },
        error: (err) => {
          console.warn('動態搜尋失敗:', err);
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
  // PrimeNG AutoComplete 會自動處理選擇事件，透過 [(ngModel)] 綁定
  // 我們監聽 ngModel 變化來處理選擇邏輯

  private initializeFromValue(value: string): void {
    if (value && value.length >= 7) {
      const option = this.processedOptions.find(opt => opt.value === value);
      if (option) {
        this.selectedOption = option;
        this.cdr.detectChanges();
      }
    }
  }

  clearSelection(): void {
    this.selectedOption = null;
    this.control.setValue('');
  }

  get isRequired(): boolean {
    return !!(this.control?.hasError?.('required') && this.control?.touched);
  }

  get hasError(): boolean {
    return this.submitted && this.control?.errors !== null && this.control?.errors !== undefined;
  }
}
