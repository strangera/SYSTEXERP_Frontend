import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { DropdownChangeEvent, DropdownLazyLoadEvent } from 'primeng/dropdown';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownComponent extends BasicKitComponent implements OnInit, OnChanges {
  // 基本
  @Input() label = '';
  @Input() override placeholder = '';
  @Input() controlName = '';
  @Input() options: any[] = [];
  @Input() optionsAll = false; // 是否顯示全部選項
  @Input() optionLabel = ''; // 資料的 Label
  @Input() optionValue = ''; // 資料的 Value
  @Input() control = new FormControl();
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() loading = true; // 載入狀態
  destroy$ = new Subject<void>(); // 銷毀訂閱
  // 選項
  @Output() changeEvent = new EventEmitter<DropdownChangeEvent>();

  ngOnInit(): void {
    this.ensureControl();
    this.handleControlState();

    // 🆕 初始化時檢查並轉換空字串為 null
    this.convertEmptyStringToNull(this.control.value);

    // 監聽 `disabled` 變化
    this.control.statusChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.handleControlState();
    });

    // 🆕 監聽 control 值變化，自動轉換空字串為 null
    this.control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.convertEmptyStringToNull(value);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && changes['options'].currentValue.length > 0) {
      this.loading = false;
      // 🆕 當 options 變化時，檢查並轉換當前值
      this.convertEmptyStringToNull(this.control.value);
    }

    // 🆕 當 control 變化時，檢查並轉換初始值
    if (changes['control'] && changes['control'].currentValue) {
      this.convertEmptyStringToNull(this.control.value);
    }
  }

  onLazyLoad(event: DropdownLazyLoadEvent) {
    console.log(event);
  }

  private ensureControl() {
    if (!this.control) {
      this.control = new FormControl();
    }
  }

  private handleControlState() {
    if (!this.control.disabled) {
      this.updateControlState(this.control);
      if (!this.placeholder) {
        this.placeholder = '請選擇';
      }
    }
  }

  // 🆕 自動轉換空字串為 null
  private convertEmptyStringToNull(value: any) {
    // 如果值是空字串，自動轉換為 null
    if (value === '' || (typeof value === 'string' && value.trim() === '')) {
      // 使用 patchValue 避免觸發 valueChanges 造成無限循環
      this.control.patchValue(null, { emitEvent: false });
    }
  }

  onDropdownChange(event: DropdownChangeEvent) {
    this.changeEvent.emit(event);
  }
}
