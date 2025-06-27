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
  @Input() loading = true; // 是否必填
  destroy$ = new Subject<void>(); // 銷毀訂閱
  // 選項
  @Output() changeEvent = new EventEmitter<DropdownChangeEvent>();

  ngOnInit(): void {
    this.ensureControl();
    this.handleControlState();

    // 監聽 `disabled` 變化
    this.control.statusChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.handleControlState();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.loading = false;
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

  onDropdownChange(event: DropdownChangeEvent) {
    this.changeEvent.emit(event);
  }
}
