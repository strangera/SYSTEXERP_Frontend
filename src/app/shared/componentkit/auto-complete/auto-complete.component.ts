import { CommonModule } from '@angular/common'; // 使用 CommonModule
import { ChangeDetectionStrategy, Component, effect, input, Input, OnInit, output, signal, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ControlMessagesComponent } from '@shared/component/control-messages/control-messages.component';
import { BasicKitComponent } from '@shared/componentextends/basic-kit/basic-kit.component';
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
@Component({
  selector: 'app-auto-complete',
  standalone: true,
  imports: [
    CommonModule,
    AutoCompleteModule,
    FormsModule,
    ReactiveFormsModule,
    ControlMessagesComponent,
  ],
  templateUrl: './auto-complete.component.html',
  styleUrls: ['./auto-complete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutoCompleteComponent extends BasicKitComponent implements OnInit {
  @ViewChild(AutoComplete) private autoComplete?: AutoComplete;
  @Input() override label = '';
  @Input() override controlName = '';
  control = input.required<FormControl>();
  submitted = input<boolean>(false);
  optionLabel = input<string | undefined>(undefined);
  optionValue = input<string | undefined>(undefined);
  showClear = input<boolean>(true);
  optionSelected = output<AutoCompleteSelectEvent>();
  valueChange = output<any>();
  // 這是實際的選項列表，由 effect 根據 options 更新
  private _options = signal<any[]>([]);
  // 這是使用者傳入的原始 options
  options = input<any[] | null>([]);
  // 用於顯示在 PrimeNG AutoComplete 中的過濾後選項
  filteredOptions = signal<any[]>([]);
  loading = signal<boolean>(false);

  // 使用 effect 來處理 options 變化時的副作用 (更新 _options 和 loading 狀態)
  constructor() {
    // 使用 effect 處理 options 變化時的副作用 (更新 _options 和 loading 狀態)
    effect(() => {
      const value = this.options();
      if (value !== null) {
        // 當 options 收到資料時，停止載入
        this.loading.set(false);
        this._options.set(value);
      } else {
        // 當 options 收到 null 時，表示開始載入
        this.loading.set(true);
        this._options.set([]); // 清空選項
        // 【修正點 2】: 確保在載入時，過濾選項也是空陣列
        this.filteredOptions.set([]);
      }
    }, { allowSignalWrites: true });
    super();
  }
  ngOnInit(): void {
    this.initControl(this.control());
    this.control().valueChanges.subscribe(value => {
      this.valueChange.emit(value);
    })
  }
  /**
   * 根據使用者輸入的文字過濾選項。
   * @param event PrimeNG AutoCompleteCompleteEvent 包含使用者輸入的查詢字串。
   */
  filterOptions(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase();
    const availableOptions = this._options();

    if (this.loading() || availableOptions.length === 0) {
      this.filteredOptions.set([]);
      this.tryRefreshVirtualScroll();
      return;
    }

    const labelKey = this.optionLabel() || 'name';
    const valueKey = this.optionValue(); // 取得 value 的 key (例如 'ecr_no')

    const filtered = availableOptions.filter(option => {
      const textToMatch = option[labelKey];
      const valueToMatch = valueKey ? option[valueKey] : null;

      // 轉為字串進行模糊比對
      const isLabelMatch = String(textToMatch).toLowerCase().includes(query);

      // 如果有 valueKey，也一起比對 (這樣輸入編號或名稱都能搜到)
      const isValueMatch = valueToMatch ? String(valueToMatch).toLowerCase().includes(query) : false;

      return isLabelMatch || isValueMatch;
    });

    this.filteredOptions.set(filtered);
    this.tryRefreshVirtualScroll();
  }
  /**
   * 嘗試刷新 PrimeNG 內部虛擬滾動。
   * 這是解決虛擬滾動計算錯誤、出現空白空間的常見方法。
   */
  private tryRefreshVirtualScroll(): void {
    // 使用 setTimeout 確保在 DOM 更新完成後再調用刷新方法
    setTimeout(() => {
      // 檢查 autoComplete 元件是否存在，且其內部 Scroller 實例是否存在
      if (this.autoComplete?.scroller) {
        // 調用 PrimeNG Scroller 的 API 來刷新滾動器的內部狀態
        this.autoComplete.scroller.scrollToIndex(0, 'auto');
      }
    }, 0);
  }
  handleOptionSelected(event: AutoCompleteSelectEvent): void {
    this.optionSelected.emit(event);
  }
}
