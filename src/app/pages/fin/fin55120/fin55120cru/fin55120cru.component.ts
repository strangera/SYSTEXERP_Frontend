import { DatePipe, Location, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'; // 確保有加上 UntilDestroy 裝飾器
import { TranslateModule } from '@ngx-translate/core';
import { FIN55050Detail } from '@service/api/fin/fin55050.service';
import { FIN55050Item, Fin55120Service, QueryFIN55050Request } from '@service/api/fin/fin55120.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, ReportColumn } from '@shared/components/table-report/table-report.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { finalize } from 'rxjs';

@UntilDestroy() // 使用 untilDestroyed 必須加上這個
@Component({
  selector: 'app-fin55120cru',
  standalone: true,
  imports: [ProgressSpinnerModule, MenubarComponent, ButtonComponent, PanelModule, TranslateModule, NgFor, TableReportComponent, DatePipe, NgIf],
  templateUrl: './fin55120cru.component.html'
})
export class Fin55120cruComponent extends BasicCruPageComponent<unknown> implements OnInit {
  accNo: string | null = null;
  dateFrom: string | null = null;
  dateTo: string | null = null;
  dataList: FIN55050Item[] = [];
  columns: ReportColumn[] = [
    {
      field: 'VouNo', header: '傳票號碼', type: 'link', linkDisabled: (rowData: FIN55050Detail) => {
        return rowData.VouNo === '期初餘額' || !rowData.VouNo;
      }
    },
    { field: 'Ven_Name', header: '廠商編號/簡稱' },
    { field: 'VouStatus', header: '狀態' },
    { field: 'ORG_ID', header: '部門' },
    { field: 'Org_Name', header: '部門名稱' },
    { field: 'ProjectNo', header: '活動' },
    { field: 'PTA', header: '立沖代號' },
    { field: 'NoteDesc', header: '摘要' },
    { field: 'AccAmt_D', header: '借方金額', format: formatAmount, align: 'right' },
    { field: 'AccAmt_C', header: '貸方金額', format: formatAmount, align: 'right' },
    { field: 'OpeningBal', header: '餘額', format: formatAmount, align: 'right' },
  ];

  constructor(
    public readonly fin55120Service: Fin55120Service,
    private readonly route: ActivatedRoute,
    private readonly location: Location,
  ) {
    super();
  }

  ngOnInit(): void {
    this.previousRoute = '/account/fin/fin55120';
    this.formTitle = '分類帳查詢';
    this.crudstatus = CRUDStatus.Read;
    this.initializePage('FIN55120');

    // 1. 從 URL 抓取參數 (注意 Key 名稱要跟 openDetail 設的一樣)
    const params = this.route.snapshot.queryParamMap;
    this.accNo = params.get('accno'); // 路由會自動轉小寫
    this.dateFrom = params.get('datefrom');// 路由會自動轉小寫
    this.dateTo = params.get('dateto');// 路由會自動轉小寫

    // 2. 如果必要參數存在，則自動執行查詢
    if (this.accNo && this.dateFrom && this.dateTo) {
      this.searchLedger();
    }
  }

  /**
   * 執行分類帳查詢
   */
  searchLedger() {
    this.loading = true;

    // 1. 處理 AccNo 補位邏輯 (目標長度 6 位)
    let fromAcc = this.accNo || '';
    let toAcc = this.accNo || '';

    if (fromAcc.length < 6) {
      fromAcc = fromAcc.padEnd(6, '0'); // 不足 6 位後補 0
      toAcc = toAcc.padEnd(6, '9');     // 不足 6 位後補 9
    }

    const body: QueryFIN55050Request = {
      AccNoFrom: fromAcc,
      AccNoTo: toAcc,
      DateFrom: this.dateFrom || '',
      DateTo: this.dateTo || '',
      VouStatusList: ['3'], // 資產負債表只顯示已過帳的資料
      PageSize: 999,
      PageIndex: 1,
      ReportMode: '2', // 含無交易科目，避免像 216112/216114 這種目前無交易的科目被 SP 濾掉
    };

    this.fin55120Service.queryFIN55050(body).pipe(
      untilDestroyed(this),
      finalize(() => this.loading = false)
    ).subscribe(response => {
      const rawData = response.Data || [];

      this.dataList = rawData
        // ReportMode=2 會多帶回無交易的科目，期初餘額為 0 又沒有明細的科目不顯示
        .filter(item => this.shouldDisplayAccount(item._Details || []))
        .map(item => {
          const details = [...(item._Details || [])]; // 淺拷貝一份陣列避免影響原始資料

          let displayDetails: FIN55050Detail[] = [];
          let lastDetail = null;

          if (details.length > 0) {
            // 1. 處理第一筆：將傳票號碼改為「期初餘額」
            // 根據 SP 邏輯，details[0] 一定是 SortKey=0 的期初資料
            details[0] = {
              ...details[0],
              VouNo: '期初餘額' // 這裡塞入你想顯示的字眼
            };

            // 2. 處理最後一筆 (總計)
            if (details.length >= 2) {
              lastDetail = details[details.length - 1]; // 取得最後一筆
              displayDetails = details.slice(0, -1);    // Table Body 顯示「第一筆到倒數第二筆」
            } else {
              // 如果只有一筆資料（只有期初），就全部顯示
              displayDetails = details;
            }
          }

          return {
            ...item,
            displayDetails: displayDetails,
            lastDetail: lastDetail
          };
        });
    });
  }

  /**
   * 判斷該會計科目是否要顯示：期初餘額(OpeningBal)為 0 且沒有明細資料(只有期初那一筆)時不顯示。
   */
  private shouldDisplayAccount(details: FIN55050Detail[]): boolean {
    if (!details || details.length === 0) return false;
    const openingBal = Number(details[0]?.OpeningBal) || 0;
    const hasTransactionDetails = details.length > 1; // 除了期初餘額之外還有明細
    return hasTransactionDetails || openingBal !== 0;
  }

  onCellLinkClick(event: { rowData: FIN55050Detail, field: string }) {
    const { rowData, field } = event;

    if (field === 'VouNo') {
      if (rowData.VouNo === '期初餘額') return; // 排除期初餘額點擊
      // 4. 組建查詢參數
      const params = new URLSearchParams();
      params.set('vouno', rowData.VouNo);
      params.set('vou', rowData.VouStatus);
      // 5. 取得完整網址並開啟
      const externalUrl = this.location.prepareExternalUrl(`/account/fin/fin55120detail?${params.toString()}`);
      const finalUrl = `${globalThis.location.origin}${externalUrl}`;
      globalThis.open(finalUrl, '_blank', 'noopener,noreferrer');
      console.log('跳轉到傳票明細:', rowData.VouNo);
    }
  }
}
