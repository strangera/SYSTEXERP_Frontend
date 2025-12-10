import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { APS30181, Tls55040GoodData, Tls55040GoodQueryBody, Tls55040Service } from '@service/api/tls/tls55040.service';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Column } from '@shared/componentkit/table/table.model';

@UntilDestroy()
@Component({
  selector: 'app-tls55040-good-data-dialog',
  templateUrl: './tls55040-good-data-dialog.component.html',
  standalone: true,
  imports: [DialogComponent, TableReportComponent, TranslateModule],
  providers: [DatePipe]
})
export class Tls55040GoodDataDialogComponent implements OnInit {

  // ============== Input/Output 來自父元件 ==============

  /** 彈窗是否可見 */
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  /** 查詢驗收單的必要條件：廠商編號 */
  @Input() venNo!: string | null;

  /** 查詢驗收單的必要條件：結帳年月 (格式 yyyyMM) */
  @Input() acpYYYYMM!: string | null;

  /** 父元件已選擇或匯入過的單據，用於排除重複選擇 */
  @Input() existingDocs: APS30181[] = [];

  /** 匯入成功後，將選取的資料傳回給父元件 */
  @Output() itemsImported = new EventEmitter<APS30181[]>();

  // ============== 查詢和表格相關屬性 ==============

  ODMselectedItems: Tls55040GoodData[] = [];
  ODMData: Tls55040GoodData[] = [];
  ODMLastQueryBody: Tls55040GoodQueryBody | null = null;
  ODMtotalRecords = 0;
  ODMLoading = false;

  ODMColumns: Column[] = [
    { field: 'ODM_No', header: '驗收單編號' },
    { field: 'APRV_Date', header: '驗收日期' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'HOS_Name', header: '驗收倉別' },
    { field: 'TotalBuyNet', header: '未稅金額' },
    { field: 'TotalBuyTax', header: '稅額' },
    { field: 'TotalBuyAmt', header: '含稅金額' },
  ];

  constructor(
    public readonly tls55040Service: Tls55040Service,
    private readonly datePipe: DatePipe,
  ) { }

  ngOnInit(): void {
    // 初始載入資料 (如果元件在一開始就被創建)
    this.queryData();
  }

  /**
   * 執行商品資料查詢 (queryTLS55040GoodData)
   * 當父元件調用此方法或 TableReport 觸發懶載入時會執行
   * @param queryParams 查詢參數
   */
  queryData(queryParams?: Tls55040GoodQueryBody): void {
    if (!this.venNo || !this.acpYYYYMM) {
      console.warn('Vendor No. or ACP YYYYMM is missing. Cannot query.');
      return;
    }

    this.ODMLoading = true;

    // 構建查詢 body
    const body: Tls55040GoodQueryBody = {
      PageSize: queryParams?.PageSize || 30,
      PageIndex: queryParams?.PageIndex || 1,
      SortBy: queryParams?.SortBy,
      VEN_No: this.venNo,
      ACP_YYYYMM: this.acpYYYYMM,
    };

    // 記錄最後一次查詢條件 (用於 TableReport 元件)
    this.ODMLastQueryBody = body;

    this.tls55040Service.queryTLS55040GoodData(body).pipe(untilDestroyed(this)).subscribe(res => {
      this.ODMData = res.Data || [];
      this.ODMtotalRecords = res.TotalCount || 0;
      this.ODMLoading = false;
    });
  }

  /**
   * 處理 Row 是否可選擇的邏輯 (排除已匯入過的單號)
   * @param event 單筆驗收單資料
   */
  isRowSelectable(event: Tls55040GoodData): boolean {
    return !this.existingDocs || !this.existingDocs.some(item => item.EVENT_No === event.ODM_No);
  }

  /**
   * 處理 '儲存' 按鈕點擊事件 (將選取的資料轉換後發送給父元件)
   */
  saveAndImport(): void {
    if (this.ODMselectedItems.length === 0) return;

    const newItems: APS30181[] = this.ODMselectedItems.map(item => {
      return {
        EVENT_TYPE: item.SortFlag,
        EVENT_No: item.ODM_No,
        EVENT_Net: item.TotalBuyNet,
        EVENT_Tax: item.TotalBuyTax,
        EVENT_Amt: item.TotalBuyAmt,
        ADJ_Amt: 0,
        EVENT_DATE: new Date(item.APRV_Date)
      }
    });

    // 1. 發送匯入事件給父元件
    this.itemsImported.emit(newItems);

    // 2. 關閉彈窗並重置選取狀態
    this.closeDialog();
  }

  /** 關閉彈窗並重置狀態 */
  closeDialog(): void {
    this.visibleChange.emit(false);
    this.ODMselectedItems = [];
    // 不需要重置 ODMData，因為下次開啟時會重新查詢
  }
}
