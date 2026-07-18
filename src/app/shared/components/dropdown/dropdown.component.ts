import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dropdown, DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { EnterToTabDirective } from '@shared/directive/enter-to-tab.directive';
import { FieldStateDirective } from '@shared/directive/field-state.directive';
@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    EnterToTabDirective
  ],
  hostDirectives: [FieldStateDirective],
})
export class DropdownComponent implements OnInit {
  protected readonly fieldState = inject(FieldStateDirective, { self: true });
  private readonly cdr = inject(ChangeDetectorRef);

  readonly Validators = Validators;
  @ViewChild('dd') dropdownComponent!: Dropdown;
  @Input() readonly = false; // 新增：唯讀模式
  // 必填
  @Input() label = '';
  @Input() showLabel = true;
  @Input() controlName = '';
  @Input() set options(value: any[] | null) {
    if (value === null) {
      this.loading = true;
      this._options = [];
    } else {
      this.loading = false;
      this._options = [...value]; // 使用 spread operator 確保參考更新
    }
  }
  get options(): any[] { return this._options; }
  private _options: any[] = [];
  @Input() optionLabel = 'label'; // 資料的 Label
  @Input() optionValue: string | undefined; // 資料的 Value
  @Input() optionDisabled: string | undefined; // 資料的 Disabled 屬性
  @Input() customPlaceholder = '請選擇';
  @Input() submitted = false; // 檢查欄位是否標準
  // PrimeNG 下拉選單屬性
  @Input() showClear = true; // 是否顯示清除按鈕
  @Input() filterBy?: string; // 預設提示文字
  @Input() filter = true; // 是否啟用過濾功能
  @Input() disabled = false; // 是否禁用
  @Input() loading = false;// 是否載入中
  @Input() editable = true; // 是否可編輯輸入
  @Input() helpMsg?: string;
  @Input() group = false;
  // 自訂屬性
  @Input() showErrorMessage = true;
  @Input() templateLabel = ''; // 自訂 Label 模板
  @Input() errorForGroup = false; // 是否為 FormGroup 的錯誤訊息
  // 觸發事件
  @Output() changeEvent = new EventEmitter<DropdownChangeEvent>();
  @Output() valueChange = new EventEmitter<any>(); //直接用 (valueChange) 拿到值
  private _control: FormControl = new FormControl();
  @Input() set control(value: FormControl) {
    if (value) {
      this._control = value;
      this.fieldState.initControl(this._control, this.controlName, this.label);

      // 新增：監聽值變化，不論是自動帶入還是外部重置，只要值變了，就把手打暫存字串清空
      // 這樣 selectedOptionLabel 就會乖乖走清單比對回填邏輯，不會出現錯亂
      this._control.valueChanges.subscribe(() => {
        this.currentInputValue = '';
        this.cdr.markForCheck();
      });

      this.cdr.markForCheck();
    }
  }
  public get control(): FormControl {
    if (this.disabled && this._control) {
      this._control.disable({ emitEvent: false });
    }
    return this._control;
  }

  ngOnInit(): void {
    this.fieldState.initControl(this.control, this.controlName, this.label);
  }
  onDropdownChange(event: DropdownChangeEvent) {
    if (this.readonly) return;

    // 當選取完畢或清空時，重置打字暫存與 PrimeNG 內部的過濾字串
    this.currentInputValue = '';
    if (this.dropdownComponent) {
      this.dropdownComponent._filterValue.set('');
    }

    this.changeEvent.emit(event);
    this.valueChange.emit(event.value);  // 同時 emit 純值
  }

  onDropdownHide() {
    if (this.readonly || !this.editable) {
      return;
    }
    // 點擊選單外面關閉時，順便清除輸入暫存與過濾條件，讓狀態回復
    this.currentInputValue = '';
    if (this.dropdownComponent) {
      this.dropdownComponent._filterValue.set('');
    }
  }
  // 修正原本的 selectedOptionLabel，確保打字過程中不會因為 control.value 沒變而讓 input 的顯示文字跳掉
  get selectedOptionLabel(): string {
    // 如果使用者正在輸入中，以使用者輸入的文字優先顯示
    if (this.editable && this.currentInputValue) {
      return this.currentInputValue;
    }

    if (!this.control.value || !this.options || this.options.length === 0) {
      return '';
    }

    const selectedOption = this.options.find(option =>
      this.optionValue ? option[this.optionValue] === this.control.value : option === this.control.value
    );

    if (selectedOption) {
      return this.templateLabel === '' ? selectedOption[this.optionLabel] : selectedOption[this.templateLabel];
    }
    return this.control.value?.toString() || '';
  }

  // 新增：取得 dropdown 的 CSS 類別
  get dropdownClasses(): string {
    const classes = ['w-full'];

    if (this.readonly) {
      classes.push('readonly-field');
    }

    if (this.submitted && this.control.errors) {
      classes.push('ng-dirty', 'ng-invalid');
    }

    return classes.join(' ');
  }

  // 類別內部新增一個暫存當前輸入字串的變數
  private currentInputValue = '';

  // 新增：當外層 input 獲得焦點時觸發（例如用 Tab 鍵切換過來）
  onNativeInputFocus(event: FocusEvent) {
    if (!this.editable || this.readonly || this.disabled) return;

    // Tab 過去時，如果選單沒開，就主動把它秀出來
    if (this.dropdownComponent && !this.dropdownComponent.overlayVisible) {
      this.dropdownComponent.show();
    }
  }

  // 修改後的打字過濾邏輯
  onNativeInput(event: Event) {
    const inputEl = event.target as HTMLInputElement;
    this.currentInputValue = inputEl.value;

    if (this.dropdownComponent) {
      // 1. 將輸入的文字塞給 PrimeNG 的過濾訊號 (Signal)
      this.dropdownComponent._filterValue.set(this.currentInputValue);

      // 2. 呼叫內部變更事件，強迫面板重新篩選
      this.dropdownComponent.onFilterInputChange(event);

      // 3. 關鍵修正：不只用 show()，我們多給一條龍的防禦，確保選單絕對是張開的
      if (!this.dropdownComponent.overlayVisible) {
        this.dropdownComponent.show();
        // 確保畫面重新計算尺寸
        this.dropdownComponent.cd.markForCheck();
      }
    }

    // 當使用者把字串刪光時，直接同步清空 Form 控制項
    if (!this.currentInputValue) {
      this.control.setValue(null);
      this.valueChange.emit(null);
    }
  }

  // 當整個元件失焦（離開該區域）時觸發：進行最終的 Mapping 檢查與關閉選單
  onComponentBlur(event: FocusEvent) {
    if (!this.editable) return;

    // 新增：防禦機制。取得接下來獲得焦點的元素
    const relatedTarget = event.relatedTarget as HTMLElement;

    // 檢查這個元素是不是在 PrimeNG 的下拉面板 (overlay panel) 裡面
    // PrimeNG 的下拉面板通常會帶有 '.p-dropdown-panel' 的類別
    if (relatedTarget && (
      relatedTarget.closest('.p-dropdown-panel') ||
      relatedTarget.classList.contains('p-dropdown-filter')
    )) {
      // 如果使用者是在點擊 filter 框、滾動條或裡面的選項，直接中斷，不要判定為失焦關閉！
      return;
    }

    // 核心邏輯：真正的離開了這個組件群組，這時才關閉下拉面板
    if (this.dropdownComponent) {
      this.dropdownComponent.hide();
    }

    // 如果目前根本沒打字，或者打字內容為空，就不用比對了
    if (!this.currentInputValue) {
      return;
    }

    // 開始比對清單（支援 value 或 label 的完全符合）
    const matchedOption = this.options.find(option => {
      const valStr = this.optionValue ? String(option[this.optionValue]) : '';
      const lblStr = String(option[this.optionLabel]);
      return this.currentInputValue === valStr || this.currentInputValue === lblStr;
    });

    if (matchedOption) {
      // 找到了！將真正對應的 value 塞回 Control
      const finalValue = this.optionValue ? matchedOption[this.optionValue] : matchedOption;
      this.control.setValue(finalValue);
      this.valueChange.emit(finalValue);
      this.changeEvent.emit({ originalEvent: event, value: finalValue });
    } else {
      // 找不到！使用者亂打，直接清空欄位
      this.control.setValue(null);
      this.valueChange.emit(null);
      this.changeEvent.emit({ originalEvent: event, value: null });
      this.currentInputValue = ''; // 重置暫存
    }

    this.cdr.markForCheck();
  }
  // 修改後的鍵盤事件接管邏輯（加入滾輪滾動追蹤）
  onInputKeyDown(event: Event) {
    if (!this.editable || this.readonly || this.disabled) return;

    const keyboardEvent = event as KeyboardEvent;

    // ===== 1. 處理向下鍵與向上鍵：讓高亮條可以在選單內移動 ＋ 滾動條同步 =====
    if (keyboardEvent.key === 'ArrowDown' || keyboardEvent.key === 'ArrowUp') {
      keyboardEvent.preventDefault();
      keyboardEvent.stopPropagation();

      if (this.dropdownComponent) {
        if (!this.dropdownComponent.overlayVisible) {
          this.dropdownComponent.show();
        }

        // 取得目前已經高亮的索引
        let currentIndex = this.dropdownComponent.focusedOptionIndex();

        // 如果目前是 -1 (沒聚焦)，按下鍵時直接抓第一個有效選項
        if (currentIndex === -1) {
          currentIndex = this.dropdownComponent.findFirstFocusedOptionIndex();
          // 根據按鍵計算下一個或上一個索引
        } else if (keyboardEvent.key === 'ArrowDown') {
          currentIndex = this.dropdownComponent.findNextOptionIndex(currentIndex);
        } else {
          currentIndex = this.dropdownComponent.findPrevOptionIndex(currentIndex);
        }

        // 強制讓 PrimeNG 更新高亮狀態並把滾動條捲到該位置
        if (currentIndex !== -1 && currentIndex !== null) {
          this.dropdownComponent.focusedOptionIndex.set(currentIndex);
          this.dropdownComponent.changeFocusedOptionIndex(keyboardEvent, currentIndex);

          // === 關鍵修正：強迫 PrimeNG 捲軸主動滾動到目前聚焦的索引畫面 ===
          if (this.dropdownComponent.virtualScroll && this.dropdownComponent.scroller) {
            // 如果開啟了虛擬滾動 (VirtualScroll)，呼叫 scroller 元件的 API
            this.dropdownComponent.scroller.scrollToIndex(currentIndex);
          } else {
            // 一般滾動模式下，呼叫內建的滾動對齊方法
            this.dropdownComponent.scrollInView(currentIndex);
          }
        }
        this.cdr.markForCheck();
      }
    }

    // ===== 2. 處理 Enter 鍵 =====
    if (keyboardEvent.key === 'Enter') {
      if (this.dropdownComponent && this.dropdownComponent.overlayVisible) {
        const currentIndex = this.dropdownComponent.focusedOptionIndex();
        const visibleOptions = this.dropdownComponent.visibleOptions();

        if (currentIndex !== -1 && visibleOptions && visibleOptions[currentIndex]) {
          keyboardEvent.preventDefault();
          keyboardEvent.stopPropagation();

          const targetOption = visibleOptions[currentIndex];
          this.dropdownComponent.onOptionSelect(keyboardEvent, targetOption);

          this.currentInputValue = '';
          this.dropdownComponent.hide();
          this.cdr.markForCheck();
        }
      }
    }
  }
}
