import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, Input, OnChanges, SimpleChanges, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { TooltipModule } from 'primeng/tooltip';
import { TableUtilityService } from '../services/table-edit-utility.service'; // 🎯 引入服務
import { EditColumn } from '../table-edit.model';
import { CellInput } from './table-edit-cell.model';

@Component({
  selector: 'app-dropdown-cell',
  host: { 'table-edit-id': 'FIN53010-CRU' },
  template: `
<ng-container *ngIf="useInputWithDropdown(); else existingLogicTpl">
  <div class="p-dropdown p-component p-inputwrapper w-full"
       [class.p-disabled]="dropdownDisabled"
       [pTooltip]="cellInput.rowData._validationErrors?.[cellInput.col.field]"
       tooltipPosition="bottom"
       [ngClass]="{ 'ng-invalid ng-dirty': !!cellInput.rowData._validationErrors?.[cellInput.col.field] }"
       style="display:flex;min-width:0">
    <input type="text"
           class="p-dropdown-label p-inputtext"
           style="flex:1;border:none;outline:none;background:transparent;min-width:0"
           [placeholder]="dropdownDisabled ? '' : '請輸入' + cellInput.col.header"
           [(ngModel)]="cellInput.rowData[cellInput.col.field]"
           [ngModelOptions]="{ standalone: true }"
           [disabled]="dropdownDisabled"
           (ngModelChange)="cellInput.onValueChange(cellInput.rowData, $event, cellInput.col, cellInput.index)"
           [maxlength]="cellInput.col.maxLength || null" />
    <div class="p-dropdown-trigger"
         [style.cursor]="dropdownDisabled ? 'default' : 'pointer'"
         (click)="!dropdownDisabled && togglePickerPanel($event)">
      <span class="p-dropdown-trigger-icon pi pi-chevron-down"></span>
    </div>
  </div>

  <p-overlayPanel #inputWithDropdownPanel [dismissable]="true" appendTo="body" styleClass="p-0">
    <div style="width:260px;padding:0.5rem">
      <input type="text" placeholder="搜尋..."
             class="p-inputtext p-component p-element w-full"
             style="margin-bottom:0.4rem"
             [(ngModel)]="pickerFilter"
             [ngModelOptions]="{ standalone: true }"
             (input)="onPickerFilterInput()" />
      <div style="max-height:220px;overflow-y:auto">
        <div *ngFor="let opt of filteredPickerOptions"
             class="p-dropdown-item"
             style="white-space:normal"
             (click)="onPickOption(opt); inputWithDropdownPanel.hide()">
          {{ getOptLabel(opt) }}
        </div>
        <div *ngIf="!filteredPickerOptions.length"
             class="p-2 text-color-secondary">
          無符合選項
        </div>
      </div>
    </div>
  </p-overlayPanel>
</ng-container>

<ng-template #existingLogicTpl>
<ng-container *ngIf="shouldRenderAsInput(); else dropdownTpl">
  <p-iconField iconPosition="right">
    <input type="text"
           class="min-w-max p-inputtext p-component p-element"
           [placeholder]="dropdownDisabled ? '' : '請輸入' + cellInput.col.header"
           [(ngModel)]="cellInput.rowData[cellInput.col.field]"
           [ngModelOptions]="{ standalone: true }"
           [disabled]="dropdownDisabled"
           (ngModelChange)="cellInput.onValueChange(cellInput.rowData, $event, cellInput.col, cellInput.index)"
           [maxlength]="cellInput.col.maxLength || null"
           [style]="{ 'width': cellInput.col.width || '100%', 'text-align': cellInput.col.textAlign, 'min-width': '-webkit-fill-available' }"
           [ngClass]="{ 'ng-invalid ng-dirty': cellInput.rowData._validationErrors?.[cellInput.col.field] }" />
    <p-inputIcon *ngIf="cellInput.rowData._validationErrors?.[cellInput.col.field]"
                 styleClass="pi pi-exclamation-circle text-red-500"
                 [pTooltip]="cellInput.rowData._validationErrors?.[cellInput.col.field]"
                 tooltipPosition="bottom" />
  </p-iconField>
</ng-container>

<ng-template #dropdownTpl>
 <p-iconField iconPosition="right">
  <p-dropdown #pdd class="flex min-w-max" appendTo="body"
              [(ngModel)]="cellInput.rowData[cellInput.col.field]"
              [ngModelOptions]="{ standalone: true }"
              [placeholder]="internalLoading ? '載入中...' : (dropdownDisabled ? '' : '請輸入' + cellInput.col.header)"
              [options]="getOptions(cellInput.rowData, cellInput.col)"
              [optionLabel]="cellInput.col.optionLabel"
              [optionValue]="cellInput.col.optionValue"
              [filter]="true"
              [style]="{'width': cellInput.col.width, 'text-align': cellInput.col.textAlign,'min-width':'-webkit-fill-available'}"
              [disabled]="dropdownDisabled"
              [editable]="!!cellInput.col.allowCustomValue"
              [loading]="internalLoading"
              (onChange)="cellInput.onValueChange(cellInput.rowData, $event.value, cellInput.col, cellInput.index)"
              (onFilter)="handleFilter($event, cellInput)"
              (onHide)="handleHide()"
              (keydown.enter)="handleEnter($event)"
              [virtualScroll]="(getOptions(cellInput.rowData, cellInput.col)?.length ?? 0) > 10"
              [virtualScrollItemSize]="37"
              scrollHeight="250px"
              [showClear]="cellInput.col.showClear ?? true"
              [variant]="cellInput.rowData._isAutoInsertCandidate ? 'filled' : 'outlined'"
              [ngClass]="{'ng-invalid ng-dirty': cellInput.rowData._validationErrors?.[cellInput.col.field] }">

    <ng-template let-item pTemplate="item" *ngIf="cellInput.col.templateLabel">
      <div class="flex align-items-center gap-2">
        <span>{{ item[cellInput.col.templateLabel] }}</span>
      </div>
    </ng-template>
  </p-dropdown>

  <p-inputIcon *ngIf="cellInput.rowData._validationErrors?.[cellInput.col.field] && !internalLoading"
               styleClass="pi pi-exclamation-circle text-red-500"
               [pTooltip]="cellInput.rowData._validationErrors?.[cellInput.col.field]"
               tooltipPosition="bottom" />
</p-iconField>
</ng-template>
</ng-template>
  `,
  styles: [`
    /* 使用 ::ng-deep 是因為下拉選單通常 appendTo="body"，不在組件視圖內 */
    ::ng-deep .p-dropdown-item {
        height: 37px !important;      /* 必須與 virtualScrollItemSize 一致 */
        line-height: 37px !important; /* 確保文字垂直居中 */
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        box-sizing: border-box !important;
    }

    /* 確保虛擬滾動容器高度也是固定的 */
    ::ng-deep .p-dropdown-items-wrapper .p-scroller {
        height: 250px !important; /* 與 scrollHeight 一致 */
    }
    `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    IconFieldModule,
    InputIconModule,
    OverlayPanelModule,
    TooltipModule
  ]
})
export class DropdownCellComponent implements OnChanges, DoCheck, AfterViewInit {
  @Input({ required: true }) cellInput!: CellInput;

  @ViewChild('pdd') private readonly pdd?: Dropdown;

  protected readonly tableUtilityService = inject(TableUtilityService);
  private readonly cdr = inject(ChangeDetectorRef);

  public internalLoading = false;
  private _resolvedOptions: any[] | undefined = undefined;
  private _lastRowData: any = null;
  private _isSubscribing = false;

  /** 快取後綁定 p-dropdown，避免每次 CD 重算觸發 PrimeNG disabled setter 內的 detectChanges 連鎖 */
  public dropdownDisabled = false;

  @ViewChild('inputWithDropdownPanel') private readonly inputWithDropdownPanel?: OverlayPanel;
  protected pickerFilter = '';
  protected filteredPickerOptions: Record<string, unknown>[] = [];

  protected useInputWithDropdown(): boolean {
    return !!this.cellInput.col.inputWithDropdown;
  }

  protected togglePickerPanel(event: Event): void {
    this.pickerFilter = '';
    this.filteredPickerOptions = (this.getOptions(this.cellInput.rowData, this.cellInput.col) ?? []) as Record<string, unknown>[];
    this.inputWithDropdownPanel?.toggle(event);
  }

  protected onPickerFilterInput(): void {
    const all = (this.getOptions(this.cellInput.rowData, this.cellInput.col) ?? []) as Record<string, unknown>[];
    const term = this.pickerFilter.trim().toLowerCase();
    const labelKey = this.cellInput.col.optionLabel ?? 'label';
    this.filteredPickerOptions = term
      ? all.filter(o => String(o[labelKey] ?? '').toLowerCase().includes(term))
      : all;
    this.cdr.markForCheck();
  }

  protected getOptLabel(opt: Record<string, unknown>): string {
    const col = this.cellInput.col;
    return col.optionLabel ? String(opt[col.optionLabel] ?? '') : String(opt ?? '');
  }

  protected onPickOption(opt: Record<string, unknown>): void {
    const col = this.cellInput.col;
    const val = col.optionValue ? opt[col.optionValue] : opt;
    this.cellInput.rowData[col.field] = val;
    this.cellInput.onValueChange(this.cellInput.rowData, val, col, this.cellInput.index);
    this.cdr.markForCheck();
  }

  isDisabled(): boolean {
    const col = this.cellInput.col;
    return (col.disabled && col.disabled(this.cellInput.rowData[col.field], this.cellInput.index, this.cellInput.rowData)) || this.cellInput.disabled;
  }

  private syncDropdownDisabled(): void {
    const next = this.isDisabled() || this.internalLoading;
    if (this.dropdownDisabled !== next) {
      this.dropdownDisabled = next;
      this.cdr.markForCheck();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cellInput']) {
      this.syncDropdownDisabled();
    }
  }

  ngAfterViewInit(): void {
    // 點擊即編輯：這格是剛被單擊啟用的，直接展開下拉，省去第二次點擊
    if (this.cellInput?.autoOpen && !this.dropdownDisabled) {
      setTimeout(() => this.pdd?.show());
    }
  }

  ngDoCheck(): void {
    this.syncDropdownDisabled();
  }

  handleHide() {
    const rowData = this.cellInput.rowData;
    const col = this.cellInput.col as EditColumn;
    // 關閉時重置自訂 filter，避免影響其他列
    if (col.onFilter) {
      col.onFilter('', rowData, col, this.cellInput.index);
    }
    const currentValue = rowData[col.field];

    // 如果允許自訂值，跳過驗證邏輯
    if (col.type === 'dropdown' && !col.allowCustomValue) {
      const options = this.getOptions(rowData, col) || [];
      let isValidOption = false;

      if (currentValue === null || currentValue === undefined) {
        isValidOption = true; // null 或 undefined 是允許的 (除非是必填)
      } else {
        // 檢查當前值是否仍在有效選項列表中
        const valueKey = col.optionValue || col.optionLabel;
        isValidOption = options.some((option: any) => {
          // 使用字串化比較以避免 number vs string 的嚴格相等問題
          if (valueKey && String(option[valueKey]) === String(currentValue)) {
            return true;
          }
          if (!col.optionValue && typeof currentValue === 'object' && option === currentValue) {
            return true;
          }
          return false;
        });
      }

      if (!isValidOption) {
        rowData[col.field] = null; // 強制將無效值設為 null
      }
    }

    // 呼叫父層的 onValueChange
    // 如果值被清洗 (設為 null)，或即使沒有清洗，下拉選單關閉後也應該重新觸發驗證
    // 這樣可以確保在下拉選單關閉時，即使只是點擊，也會觸發 rowValidate 檢查。
    this.cellInput.onValueChange(
      rowData,
      rowData[col.field], // 傳遞可能已被清洗的最新值
      col,
      this.cellInput.index
    );
  }


  /**
   * 獲取 Dropdown 的選項，支持 function 加入或直接給 List
   * @param rowData 當前行資料
   * @param col 欄位配置
   * @returns 選項陣列
   */
  // 紀錄上一次的參數物件 (Key: 欄位名, Value: 欄位值)
  private _lastTriggerValues: Record<string, any> = {};
  public getOptions(rowData: any, col: EditColumn): any[] | undefined {
    if (!col.optionsAsync) {
      return typeof col.options === 'function' ? col.options(rowData) : col.options;
    }

    // 1. 建立當前依賴欄位的值快照
    const currentTriggerValues: Record<string, any> = {};
    if (col.triggerFields) {
      col.triggerFields.forEach(f => {
        currentTriggerValues[f] = rowData?.[f];
      });
    }

    // 2. 判斷是否需要刷新：rowData 指標變了 OR 任何一個 triggerField 的值變了
    const triggerChanged = JSON.stringify(this._lastTriggerValues) !== JSON.stringify(currentTriggerValues);

    if ((this._lastRowData !== rowData || triggerChanged) && !this._isSubscribing) {
      this._lastRowData = rowData;
      this._lastTriggerValues = currentTriggerValues; // 更新快照

      const optionsResult = typeof col.options === 'function' ? col.options(rowData) : col.options;

      if (optionsResult && typeof optionsResult.subscribe === 'function') {
        this.internalLoading = true;
        this.syncDropdownDisabled();
        this._isSubscribing = true;
        optionsResult.subscribe({
          next: (data: any) => {
            this._resolvedOptions = data;
            this.internalLoading = false;
            this._isSubscribing = false;
            this.syncDropdownDisabled();
            this.cdr.markForCheck();
          },
          error: () => {
            this.internalLoading = false;
            this._isSubscribing = false;
            this.syncDropdownDisabled();
            this.cdr.markForCheck();
          }
        });
      } else {
        this._resolvedOptions = optionsResult;
      }
    }

    return this._resolvedOptions;
  }

  handleFilter(event: { filter: string }, cellInput: CellInput): void {
    const col = cellInput.col as EditColumn;
    if (col.onFilter) {
      col.onFilter(event.filter ?? '', cellInput.rowData, col, cellInput.index);
      this.cdr.markForCheck();
    }
  }

  handleEnter(event: Event) {
    event.preventDefault(); // 阻止表單提交
    event.stopPropagation(); // 阻止事件冒泡
  }

  /**
   * 當 col.dropdownFallbackToInput 為 true，且當前值不在 options 內時，
   * 改以文字輸入框呈現。透過 col.isOptionsLoaded 避免 async 載入中誤判。
   */
  public shouldRenderAsInput(): boolean {
    const col = this.cellInput.col;
    if (!col.dropdownFallbackToInput) return false;

    const rowData = this.cellInput.rowData;
    const value = rowData?.[col.field];
    if (value === null || value === undefined || value === '') return false;

    if (typeof col.isOptionsLoaded === 'function' && !col.isOptionsLoaded(rowData)) {
      return false;
    }

    const options = this.getOptions(rowData, col) || [];
    const valueKey = col.optionValue || col.optionLabel;
    if (!valueKey) return false;

    return !options.some((o: any) => String(o?.[valueKey]) === String(value));
  }
}
