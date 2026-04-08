/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  NgZone,
  OnChanges,
  Output,
  SimpleChanges,
  Type,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { SortMeta } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { KeyFilterModule } from 'primeng/keyfilter';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableModule, TableRowReorderEvent } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

// 專屬 FIN32020 的 service / model / cell-components
import { TableEditDataService } from './services/fin32020table-edit-data.service';
import { TableUtilityService } from './services/fin32020table-edit-utility.service';
import { TableValidationService } from './services/fin32020table-validation.service';
import { FIN32020DateCellComponent } from './fin32020table-edit-cell/FIN32020date-cell.component';
import { FIN32020DropdownCellComponent } from './fin32020table-edit-cell/FIN32020dropdown-cell.component';
import { FIN32020InputCellComponent } from './fin32020table-edit-cell/FIN32020input-cell.component';
import { FIN32020NumberCellComponent } from './fin32020table-edit-cell/FIN32020number-cell.component';
import { FIN32020PercentCellComponent } from './fin32020table-edit-cell/FIN32020percent-cell.component';
import { FIN32020CellInput } from './fin32020table-edit-cell/FIN32020table-edit-cell.model';
import {
  ColumnGroup,
  EditColumn,
  FieldChangeEvent,
} from './fin32020table-edit.model';
import { FIN32020TemplateCellComponent } from './fin32020table-edit-cell/FIN32020template-cell.component';

@Component({
  selector: 'app-fin32020table-edit',
  templateUrl: './fin32020table-edit.component.html',
  styleUrl: './fin32020table-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    AutoCompleteModule,
    BreadcrumbModule,
    ButtonModule,
    CommonModule,
    DividerModule,
    DropdownModule,
    FileUploadModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputNumberModule,
    KeyFilterModule,
    MultiSelectModule,
    OverlayPanelModule,
    SkeletonModule,
    TableModule,
    TooltipModule,
  ],
  providers: [TableEditDataService, TableValidationService],
})
export class FIN32020TableEditComponent implements OnChanges {
  @ViewChild('dt') private readonly table!: Table;

  // 基本設置
  @Input() title: string | undefined = undefined; // table 標題
  @Input() tableKey: string | undefined = undefined; // table 唯一標識 (必填)
  @Input() dataKey = '_TABLE_KEY'; // table 資料 key
  @Input() serialName = '序號'; // table 序號欄位名稱
  @Input() showReorder = true; // 是否顯示順序調整
  @Output() rowReorderData = new EventEmitter<TableRowReorderEvent>(); // row reorder 事件
  @Input() tableRequired = false; // table 是否為必填
  @Input({ required: true }) data: any[] = []; // table 資料 (必填)
  @Input({ required: true }) columns!: EditColumn[]; // table 欄位配置 (必填)
  @Input() columnGroup?: ColumnGroup[]; // table 群組欄位
  @Output() dataChange = new EventEmitter<any[]>(); // table 資料改變 (事件)
  @Input() loading = false; // 是否顯示 loading
  @Input() disabled = false; // 是否禁用 table
  @Input() showCaption = true; // 是否顯示 caption（新增 / Excel 那條）

  // 排序
  @Input() multiSortMeta: SortMeta[] | null | undefined = undefined;
  @Input() showSort = false;

  // 選擇 row（批次刪除用）
  @Input() showCheckBox = true;
  @Input() selectedItems: any[] = [];
  @Output() selectionChange = new EventEmitter<any[]>();
  @Input() isRowSelectable: (
    rowData: any,
    rowIndex: number,
    data: any
  ) => boolean | undefined = () => true;

  // Header 設定
  @Input() showDelete = true; // 決定是否顯示「批次刪除」按鈕
  @Output() delete = new EventEmitter<any>();
  @Input() showInsert = false;
  @Input() insertDisabled = false;
  @Output() insert = new EventEmitter<any>();

  // Header(右) - Excel
  @Input() showExcel = false;
  @Input() showExcelExport = true;
  @Output() exportExcel = new EventEmitter<any>();
  @Input() showExcelImport = true;
  @Output() importExcel = new EventEmitter<FileSelectEvent>();
  @Input() exportExcelLoading = false;

  // rowEdit / 新增 / 刪除
  @Input() canInsert = true;
  @Input() rowEditDisabled: (rowData: any) => boolean | undefined = () => false;
  @Input() defaultInsertData: any = {};
  @Input() dataStatusField = '_dataStatus';
  @Input() dataStatusValue = {
    Original: 'original',
    New: 'new',
    Modified: 'modified',
    Deleted: 'deleted',
  };
  @Input() keepDeletedData = false;

  @Output() fieldChange = new EventEmitter<FieldChangeEvent>();

  // ➕ 新增：cell 點擊事件（讓外層 FIN32020CRU 開 Dialog）
  @Output() cellClick = new EventEmitter<{
    col: EditColumn;
    rowData: any;
    index: number;
    event: MouseEvent;
  }>();

  // 驗證
  @Input() rowValidate:
    | ((rowData: any, index?: number) => {
        isValid: boolean;
        errorMessage: string;
      })
    | undefined = undefined;
  @Input() validateOnlySelected = false;
  @Input() errorMessage: string | undefined;

  // Footer / 分頁
  @Input() footerData: any;
  @Input() showFooter = false;
  @Input() scrollable = false;
  @Input() showPaginator = false;

  protected readonly tableUtilityService = inject(TableUtilityService);
  protected readonly cdr = inject(ChangeDetectorRef);
  protected readonly messageService = inject(NotificationService);
  protected readonly validationService = inject(TableValidationService);
  protected readonly dataService = inject(TableEditDataService);
  protected readonly zone = inject(NgZone);

  public get _tableData(): any[] {
    return this.dataService.tableData;
  }

  public trackByRow = (index: number, item: any) => item[this.dataKey];

  public rowSelectableWrapper = ({
    data,
    index,
  }: {
    data: any;
    index: number;
  }): boolean | undefined => {
    return (
      this.isRowSelectable(data, index, this.data) &&
      !data._isAutoInsertCandidate
    );
  };

  public tableDataEmpty = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      const dataChange = changes['data'];
      const isDataReferenceDifferent =
        dataChange.previousValue !== dataChange.currentValue;

      if (dataChange.firstChange || isDataReferenceDifferent) {
        const isInternalStateSynchronized = this.dataService.isSynchronized(
          this.data,
          this.dataKey
        );

        if (dataChange.firstChange || !isInternalStateSynchronized) {
          this.dataService.initializeData(
            this.data,
            this.columns,
            this.dataKey,
            this.dataStatusField,
            this.dataStatusValue,
            this.keepDeletedData,
            this.canInsert,
            this.rowValidate,
            this.defaultInsertData,
            this.disabled
          );
          this.cdr.detectChanges();
        }
      }
    }

    if (changes['defaultInsertData']) {
      this.dataService.updateCandidateRowDefaults(
        this.dataKey,
        this.dataStatusField,
        this.defaultInsertData
      );
      this.cdr.detectChanges();
    }

    if (changes['disabled']) {
      const currentDisabled = changes['disabled'].currentValue;
      const previousDisabled = changes['disabled'].previousValue;

      if (
        previousDisabled !== currentDisabled &&
        currentDisabled === false &&
        this.canInsert
      ) {
        const hasCandidateRow = this._tableData.some(
          (item) => item['_isAutoInsertCandidate']
        );
        if (!hasCandidateRow) {
          this.dataService.insertNewRow(
            this.columns,
            this.dataKey,
            this.defaultInsertData,
            this.dataStatusField,
            this.dataStatusValue
          );
          this.cdr.detectChanges();
        }
      }
    }
  }

  onSelectionChange(event: any[]) {
    if (this.disabled) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      const filtered = event.filter(
        (item: any) => !item._isAutoInsertCandidate
      );
      requestAnimationFrame(() => {
        this.zone.run(() => {
          this.selectionChange.emit(filtered);
          this.selectedItems = filtered;
          this.cdr.markForCheck();
        });
      });
    });
  }

  // Caption 上用的 Insert（如果有用到）
  insertRow() {
    if (this.disabled || !this.canInsert) {
      return;
    }
    this.dataService.insertNewRow(
      this.columns,
      this.dataKey,
      this.defaultInsertData,
      this.dataStatusField,
      this.dataStatusValue
    );
    this.cdr.detectChanges();
  }

  // 處理欄位值變更
  onValueChange(rowData: any, value: any, col: EditColumn, index: number) {
    if (this.disabled) {
      return;
    }
    this.tableDataEmpty = false;
    this.validationService.validateField(rowData, col, value, this._tableData);

    const { cleanData } = this.dataService.updateRowOnValueChange(
      rowData,
      value,
      col,
      index,
      this.columns,
      this.dataKey,
      this.dataStatusField,
      this.dataStatusValue,
      this.keepDeletedData,
      this.canInsert,
      this.rowValidate,
      this.defaultInsertData
    );

    if (this._tableData.length === 0 && this.canInsert) {
      this.insertRow();
    }

    this.fieldChange.emit({ rowData, field: col.field, value, index });
    this.dataChange.emit(cleanData);
    this.cdr.detectChanges();
  }

  // 批次刪除（Caption 上的刪除按鈕、或之後如果要用都走這裡）
// 批次 / 單筆刪除都走這裡
deleteRow(selectedItems: any[]) {
  if (this.disabled) {
    return;
  }

  if (!selectedItems || selectedItems.length === 0) {
    return;
  }

  const { fullData, cleanData } = this.dataService.deleteRows(
    selectedItems,
    this.dataKey,
    this.dataStatusField,
    this.dataStatusValue,
    this.canInsert,
    this.keepDeletedData
  );

  this.delete.emit(fullData);
  this.selectedItems = [];

  // 🔹 刪除後，檢查目前 table 狀態
  const activeRows = this._tableData.filter(
    (item) => !item._isAutoInsertCandidate
  );

  // 👉 如果已經沒有任何「正式資料列」，且只剩一筆候選列（+ 那列）
  //    就自動把它轉成正式第 1 列，再補一筆新的候選列
  if (
    this.canInsert &&
    !this.disabled &&
    activeRows.length === 0 &&
    this._tableData.length === 1 &&
    this._tableData[0]._isAutoInsertCandidate
  ) {
    // 這裡 event 傳 undefined 沒關係，裡面有判斷 if (event)
    this.onInsertFromPlus(this._tableData[0], 0);
  } else {
    // 一般情況照舊，把刪完的資料往外丟
    this.dataChange.emit(cleanData);
  }

  this.cdr.detectChanges();
}


  /** table 整體驗證 */
  validateAndShowErrors(): boolean {
    const { isValid, isTableEmpty, firstErrorIndex } =
      this.validationService.validateAndShowErrors(
        this.data,
        this.columns,
        this.selectedItems,
        this.tableRequired,
        this.validateOnlySelected,
        this.rowValidate
      );
    this.tableDataEmpty = isTableEmpty;

    if (isTableEmpty) {
      this.messageService.errorBubble('表格資料不可為空', '驗證失敗');
      this.cdr.detectChanges();
      return false;
    }

    if (!isValid) {
      this.cdr.detectChanges();
      if (firstErrorIndex !== undefined && firstErrorIndex !== -1) {
        this.scrollToRow(firstErrorIndex);
      }
      return false;
    }
    return true;
  }

  private scrollToRow(index: number): void {
    if (this.table && this.table.el) {
      const tbody =
        this.table.el.nativeElement.querySelector('.p-datatable-tbody');
      if (tbody) {
        const rowElement = tbody.children[index];
        if (rowElement) {
          rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }

  onRowReorder() {
    this.tableUtilityService.reorderTableData(
      this._tableData,
      this.canInsert,
      this.disabled
    );
    this.dataChange.emit(
      this._tableData.filter((item) => !item._isAutoInsertCandidate)
    );
  }

  // 取得 Cell Component 類型 (NgComponentOutlet 用)
  getEditComponent(type: EditColumn['type']): Type<any> | undefined {
    switch (type) {
      case 'input':
        return FIN32020InputCellComponent;
      case 'percent':
        return FIN32020PercentCellComponent;
      case 'inputNumber':
        return FIN32020NumberCellComponent;
      case 'dropdown':
        return FIN32020DropdownCellComponent;
      case 'date':
        return FIN32020DateCellComponent;
      case 'template':
        return FIN32020TemplateCellComponent;
      default:
        return undefined;
    }
  }

  // NgComponentOutlet 的輸入參數
  public cellInputData(
    rowData: any,
    col: EditColumn,
    index: number
  ): FIN32020CellInput {
    return {
      rowData,
      col,
      index,
      disabled: this.disabled,
      onValueChange: this.onValueChange.bind(this),
    };
  }

  /** cell 點擊事件，轉給外層 (FIN32020CRU) 使用 */
  onCellClick(
    col: EditColumn,
    rowData: any,
    index: number,
    event: MouseEvent
  ): void {
    if (this.disabled) return;
    if (col.type) {
      // 避免影響 row select
      event.stopPropagation();
    }
    this.cellClick.emit({ col, rowData, index, event });
  }

  // 單筆刪除以前用的 method，現在模板已經拿掉垃圾桶，但先保留以備不時之需
  onRowDelete(rowData: any, event?: MouseEvent) {
    if (this.disabled) return;

    if (event) {
      event.stopPropagation();
    }

    this.deleteRow([rowData]);
  }

  // 從「新增資料」候選列的 + 建立新列（按一下 + 就新增一列）
  onInsertFromPlus(rowData: any, index: number, event?: MouseEvent) {
    if (this.disabled || !this.canInsert) return;
    if (event) {
      event.stopPropagation(); // 避免觸發 row select
    }

    // 1. 把目前候選列變正式資料列
    if (rowData._isAutoInsertCandidate) {
      rowData._isAutoInsertCandidate = false;

      if (this.dataStatusField) {
        rowData[this.dataStatusField] = this.dataStatusValue.New;
      }
    }

    // 2. 再補一筆新的候選列，維持最後一列是「新增」用
    this.dataService.insertNewRow(
      this.columns,
      this.dataKey,
      this.defaultInsertData,
      this.dataStatusField,
      this.dataStatusValue
    );

    // 3. 對外同步資料（排除候選列）
    const cleanData = this._tableData.filter(
      (item) => !item._isAutoInsertCandidate
    );
    this.dataChange.emit(cleanData);

    this.cdr.detectChanges();
  }
  public applyDialogValue(
  rowData: any,
  index: number,
  patch: Record<string, any>
): void {
  if (this.disabled || !rowData) return;

  // 1. 如果是候選列，先轉成正式列
  if (rowData._isAutoInsertCandidate) {
    rowData._isAutoInsertCandidate = false;

    if (this.dataStatusField) {
      rowData[this.dataStatusField] = this.dataStatusValue.New;
    }

    // 2. 先把值寫進這列
    Object.assign(rowData, patch);

    // 3. 再補一筆新的候選列
    this.dataService.insertNewRow(
      this.columns,
      this.dataKey,
      this.defaultInsertData,
      this.dataStatusField,
      this.dataStatusValue
    );
  } else {
    // 一般列直接更新
    Object.assign(rowData, patch);

    // 標記 modified（如果原本不是 new）
    if (
      this.dataStatusField &&
      rowData[this.dataStatusField] !== this.dataStatusValue.New &&
      rowData[this.dataStatusField] !== this.dataStatusValue.Deleted
    ) {
      rowData[this.dataStatusField] = this.dataStatusValue.Modified;
    }
  }

  const cleanData = this._tableData
    .filter((item) => !item._isAutoInsertCandidate)
    .map((item, idx) => ({
      ...item,
      [this.dataKey]: idx + 1,
    }));

  this.dataChange.emit(cleanData);
  this.cdr.detectChanges();
}
}
