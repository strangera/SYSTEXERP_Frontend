import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { ReportColumn, formatAmount } from '@shared/componentkit/table-report/table-report.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { IInvoiceDetail, IReturnDetailData, RebateDetailOptionQueryBody, ReturnDetailOptionQueryBody, Tls55030Service } from '@service/api/tls/tls55030.service';
import { getSYS1000 } from '@service/system/sys1000.service';

/**
 * 處理 TLS55030 頁面中所有彈跳視窗 (Dialog) 邏輯的元件。
 * 包含：折讓單明細選擇 (IInvoiceDetail) 與 退貨明細選擇 (IReturnDetailData)。
 */
@UntilDestroy()
@Component({
  selector: 'app-tls55030-dialog',
  template: `
    <!-- 退貨明細彈窗 (Dialog 2) -->
    <app-dialog [visible]="dialogVisible2" header="退貨明細" (visibleChange)="dialogVisible2 = $event" (save)="saveReturnDialog()"
      [disable]="selectedItemsDialog2.length === 0">
      <app-table-report tableKey="tls55030DialogTable2" dataKey="RJM_No" [showReportMode]="false" [data]="dialogData2"
        [columns]="dialogColumns2" [showDelete]="false" [selectedItems]="selectedItemsDialog2" [showCaption]="false"
        (selectionChange)="selectedItemsDialog2 = $event" [showManage]="false" [showCheckBox]="true"
        [isRowSelectable]="isRowSelectable2.bind(this)" [lastQueryBody]="lastQueryBody2"
        [queryFunction]="tls55030Service.queryTLS55030ReturnDetailOption.bind(tls55030Service)" [totalRecords]="totalRecords2"
        [loading]="dialogLoading2">
      </app-table-report>
    </app-dialog>

    <!-- 折讓單明細彈窗 (Dialog 1) -->
    <app-dialog [visible]="dialogVisible" header="折讓單明細" (visibleChange)="dialogVisible = $event" (save)="saveInvoiceDialog()"
      [disable]="selectedItemsDialog.length === 0">
      <app-table-report tableKey="tls55030DialogTable" dataKey="PUR_GUINo" [showReportMode]="false" [data]="dialogData"
        [columns]="dialogColumns" [showDelete]="false" [selectedItems]="selectedItemsDialog" [showCaption]="false"
        (selectionChange)="selectedItemsDialog = $event" [showManage]="false" [showCheckBox]="true"
        [isRowSelectable]="isRowSelectable.bind(this)" [lastQueryBody]="lastQueryBody" [showReorder]="false"
        [queryFunction]="tls55030Service.queryTLS55030RebateDetailOption.bind(tls55030Service)" [totalRecords]="totalRecords"
        [loading]="dialogLoading">
      </app-table-report>
    </app-dialog>
  `,
  standalone: true,
  imports: [DialogComponent, TableReportComponent],
})
export class TLS55030DialogComponent {
  // --- Inputs from Parent ---
  /** 廠商編號 */
  @Input() venNo: string | null = null;
  /** <-- 新增：廠商統一編號 (即 VEN_Uniform 或 No, 供 API 查詢用) --> */
  @Input() venUniformNo: string | null = null;
  /** 結帳年月 */
  @Input() acpYyyyMm: Date | null = null;
  /** 已存在於主表格的折讓單明細，用於判斷是否可選 */
  @Input() existingInvoiceData: IInvoiceDetail[] = [];
  /** 已存在於主表格的退貨明細，用於判斷是否可選 */
  @Input() existingReturnData: IReturnDetailData[] = [];

  // --- Outputs to Parent ---
  /** 發出選取的折讓單明細 */
  @Output() invoicesSelected = new EventEmitter<IInvoiceDetail[]>();
  /** 發出選取的退貨明細 */
  @Output() returnsSelected = new EventEmitter<IReturnDetailData[]>();

  public readonly tls55030Service = inject(Tls55030Service);
  private readonly datePipe = inject(DatePipe);

  // --- Rebate Invoice Dialog (折讓單明細) 相關屬性 ---
  dialogVisible = false;
  dialogData: IInvoiceDetail[] = [];
  selectedItemsDialog: IInvoiceDetail[] = [];
  dialogLoading = false;
  totalRecords = 0;
  lastQueryBody: RebateDetailOptionQueryBody | null = null;

  dialogColumns: ReportColumn[] = [
    { field: 'SeqNo', header: '序號' },
    { field: 'TABTYPE', header: '單據別', format: (v) => getSYS1000('TABTYPE', v) },
    { field: 'PUR_GUINo', header: '發票號碼' },
    { field: 'PUR_GUIDate', header: '發票日期' },
    { field: 'PUR_TaxType', header: '稅別', format: (v) => getSYS1000('PUR_TaxType', v) },
    { field: 'PUR_DirectType', header: '發票用途' },
    { field: 'PUR_VoucherType', header: '發票格式' },
    { field: 'PUR_Amt', header: '發票金額', format: formatAmount },
    { field: 'Rebate_Amt', header: '已折讓金額', format: formatAmount },
  ];

  /** 開啟折讓單明細選擇彈窗並載入資料 */
  openInvoiceDialog() {
    // <-- 修正：檢查並使用 venUniformNo (廠商統一編號)
    if (!this.venUniformNo) return;

    this.dialogVisible = true;
    this.dialogLoading = true;
    this.selectedItemsDialog = []; // 清空上次的選擇

    const body: RebateDetailOptionQueryBody = {
      VEN_No: this.venUniformNo,
      PageSize: 30,
      PageIndex: 1,
      SortBy: [{ field: 'SeqNo', order: 1 }]
    };

    // 使用 venUniformNo (即 No) 作為 VEN_No 參數進行 API 查詢
    this.tls55030Service.queryTLS55030RebateDetailOption(body).pipe(untilDestroyed(this)).subscribe(res => {
      this.dialogData = res.Data;
      this.dialogLoading = false;
      this.totalRecords = res.TotalCount || res.Data.length;
      this.lastQueryBody = body;
    });
  }

  /** 儲存選取的折讓單明細並發送事件給父元件 */
  saveInvoiceDialog() {
    this.dialogVisible = false;
    // 確保只發送當前選中的項目
    const selectedItems = [...this.selectedItemsDialog];
    this.invoicesSelected.emit(selectedItems);
    this.selectedItemsDialog = [];
  }

  /** 判斷折讓單明細行是否可選 (已存在的不能再選) */
  isRowSelectable(event: IInvoiceDetail): boolean {
    // 使用 SeqNo 作為唯一鍵
    return !this.existingInvoiceData || !this.existingInvoiceData.some((item: IInvoiceDetail) => item.PUR_GUINo === event.PUR_GUINo);
  }

  // --- Return Detail Dialog (退貨明細) 相關屬性 ---
  dialogVisible2 = false;
  dialogData2: IReturnDetailData[] = [];
  selectedItemsDialog2: IReturnDetailData[] = [];
  dialogLoading2 = false;
  totalRecords2 = 0;
  lastQueryBody2: ReturnDetailOptionQueryBody | null = null;

  dialogColumns2: ReportColumn[] = [
    { field: 'RJM_No', header: '退貨單號' },
    { field: 'APRV_Date', header: '退貨日期' },
    { field: 'HOS_NAME', header: '倉別' },
    { field: 'RJM_TotalBuyNet', header: '未稅金額', format: formatAmount },
    { field: 'RJM_TotalBuyTax', header: '稅額', format: formatAmount },
    { field: 'RJM_TotalBuyAmt', header: '應稅金額', format: formatAmount }
  ];

  /** 開啟退貨明細選擇彈窗並載入資料 */
  openReturnDialog() {
    if (!this.acpYyyyMm || !this.venNo) return;
    this.dialogVisible2 = true;
    this.dialogLoading2 = true;
    this.selectedItemsDialog2 = []; // 清空上次的選擇
    const body: ReturnDetailOptionQueryBody = {
      VEN_No: this.venNo,
      ACP_YYYYMM: this.datePipe.transform(this.acpYyyyMm, 'yyyyMM') as string,
      PageSize: 30,
      PageIndex: 1
    };
    this.tls55030Service.queryTLS55030ReturnDetailOption(body).pipe(untilDestroyed(this)).subscribe(res => {
      this.dialogData2 = res.Data;
      this.lastQueryBody2 = body;
      this.dialogLoading2 = false;
      this.totalRecords2 = res.TotalCount;
    });
  }

  /** 儲存選取的退貨明細並發送事件給父元件 */
  saveReturnDialog() {
    this.dialogVisible2 = false;
    // 確保只發送當前選中的項目
    const selectedItems = [...this.selectedItemsDialog2];
    this.returnsSelected.emit(selectedItems);
    this.selectedItemsDialog2 = [];
  }

  /** 判斷退貨明細行是否可選 (已存在的不能再選) */
  isRowSelectable2(event: IReturnDetailData): boolean {
    // 使用 RJM_No 作為唯一鍵
    return !this.existingReturnData || !this.existingReturnData.some((item: IReturnDetailData) => item.RJM_No === event.RJM_No);
  }
}
