import { AsyncPipe, DatePipe, DecimalPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropdownRangeComponent } from '@shared/components/dropdown-range/dropdown-range.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { PanelModule } from 'primeng/panel';
import { finalize, of, switchMap } from 'rxjs';
import { transformOptionsForExport } from 'src/app/others/componentextends/basic-print/basic-print-data.component';
import { APS3009Item, FIN25010Data, FIN25010Service, InsertFIN25010Request, QueryAddFIN25010Request, QueryAddFIN25010Response, QueryDetailFIN25010Request } from '../../../service/api/fin/fin25010.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { TableReportComponent, } from './fin25010-table-report/fin25010-table-report.component';
import { formatAmount, formatDate, ReportColumn } from './fin25010-table-report/fin25010-table-report.model';
@Component({
  selector: 'app-fin25010-cru',
  templateUrl: './fin25010-cru.component.html',
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    CalendarComponent,
    DropdownComponent,
    TranslateModule,
    DropdownRangeComponent,
    TableReportComponent,
    AsyncPipe,
    DecimalPipe,
    InputNumberModule,
  ]
})
export class FIN25010CRUComponent extends BasicCruPageComponent<FIN25010Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    ACP_ExpectPayDate: [new Date(), Validators.required], // 收/付款日
    ven_no_b: [null], // 廠客代號(起)
    ven_no_e: [null], // 廠客代號(迄)
    ACP_No: [null, Validators.maxLength(14)], // 應付帳款ID
    Voucher_Kind: [null], // 傳票型態
    VEN_PayType: [null], // 付款方式
    pageSize: [1780],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'ven_no', order: 1 }, { field: 'IN_TYPE', order: 1 }, { field: 'acp_DATE', order: 1 }]],

    // 檢視
    PAM_No: [null],  // 匯款來源單號
    CRT_Date: [null],  // 建立日期
    D_Date: [null],  // 收/付款日
    WSLIP_NO: [null],  // 匯款單號
  });
  // 廠客代號選項
  venNoOptions = this.dropDown.queryPos2013({ VEN_Flag: '' });
  // 傳票型態選項
  voucherKindOptions = this.dropDown.queryGls1010();
  // 付款方式選項
  venPayTypeOptions = [
    { label: '電匯', value: '1' },
    { label: '現金', value: '3' },
  ];

  // table 設定
  data: QueryAddFIN25010Response[] = [];
  selectedItems: QueryAddFIN25010Response[] = [];
  subTotalData: any[] = []; // 用於存放各廠商小計
  footerData: QueryAddFIN25010Response | null = null;
  allVenNos: string[] = []; // 當前查詢結果的廠商代號集合(查詢後算一次，供 calculateFooter 建立零元底圖用，避免每次勾選都重掃全部資料)
  totalRecords = 0;
  lastQueryBody: QueryAddFIN25010Request | null = null
  columns: ReportColumn[] = [
    { field: 'ven_no', header: '廠客代號' },
    { field: 'ven_name', header: '廠客名稱' },
    { field: 'IN_TYPE', header: '資料來源別', format: (v) => getSYS1000('IN_TYPE', v) },
    {
      field: 'ACP_Amt',
      header: '付款金額',
      format: formatAmount,
      isSubTotal: true,
      cellClass: (rowData: any, type?: string) => {
        // A. 如果是明細列 (沒有傳 type 的情況)，不做處理
        if (!type) return '';

        let amt = 0;

        // B. 如果是分組小計
        if (type === 'subtotal') {
          // 透過當前列的 ven_no 去 subTotalData 找我們計算好的結果
          const target = this.subTotalData.find(s => s.ven_no === rowData?.ven_no);
          amt = target ? target.ACP_Amt : 0;
        }

        // C. 如果是總計列
        else if (type === 'footer') {
          amt = this.footerData?.ACP_Amt ?? 0;
        }

        // D. 負數變紅
        return amt < 0 ? 'bg-red-500 text-white font-bold' : '';
      },
      align: 'right'
    },
    { field: 'acp_no', header: '應收/付ID' },
    { field: 'acp_DATE', header: '立帳日期', format: formatDate },
    { field: 'PTA_Date', header: '預計收/付款日', format: formatDate },
    { field: 'NoteDesc', header: '備註' },
    { field: 'ACCNO', header: '會計科目' },
    { field: 'ACP_STATUS', header: '狀態', format: (v) => getSYS1000('ACP_Status', v), exportFormat: transformOptionsForExport(getSYS1000Options('ACP_Status')) },
    { field: 'ORG_ID', header: '組織代號' },
    { field: 'PTA', header: '立沖代號' },
  ];

  apiUrl = 'query_addFIN25010'

  constructor(
    public readonly fin25010Service: FIN25010Service,
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN25010', this.dataForm);
    if (this.isFormReadable) {
      this.loadDetailData();
    }
  }

  /**
 * 載入檢視模式的資料
 */
  loadDetailData(): void {
    // 從路由 state 取得 rowdata (通常是主檔的資料)
    if (!this.rowdata?.PAM_No) {
      this.messageService.errorBubble('缺少單號資訊，無法讀取資料');
      return;
    }

    const req: QueryDetailFIN25010Request = {
      PAM_No: this.rowdata.PAM_No,
      PageIndex: 1,
      PageSize: 9999, // 檢視模式通常一次全列出
      SortBy: [{ field: 'id', order: 1 }]
    };

    this.loading = true;
    this.fin25010Service.queryDetailFIN25010(req)
      .pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      )
      .subscribe(response => {
        this.data = response.Data || [];
        this.data.forEach(item => item.OriginalACP_Amt = item.ACP_Amt);
        this.totalRecords = response.TotalCount;
        this.apiUrl = 'query_detailFIN25010'; // 切換 API URL 以供匯出使用
        this.refreshVenNoBaseline();

        // 在檢視模式下，我們可能希望預設「全選」來顯示統計金額
        // 或者根據業務邏輯計算 footer，這裡強制計算一次
        this.selectedItems = [...this.data];
        this.calculateFooter();
      });
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const queryParams = form.getRawValue();

      // 第一步：先發一個請求拿 TotalCount (pageSize 給 1 即可)
      this.fin25010Service.queryAddFIN25010({ ...queryParams, pageSize: 1, pageIndex: 1 })
        .pipe(untilDestroyed(this), switchMap(firstRes => {
          const total = firstRes.TotalCount || 0;
          if (total === 0) {
            return of(firstRes); // 沒資料就直接回傳
          }
          // 使用精準的 total 做為 pageSize
          return this.fin25010Service.queryAddFIN25010({
            ...queryParams,
            pageSize: total,
            pageIndex: 1
          });
        }), finalize(() => this.loading = false)).subscribe(response => {
          this.lastQueryBody = queryParams;
          this.data = response.Data || [];
          this.data.forEach(item => item.OriginalACP_Amt = item.ACP_Amt);
          this.totalRecords = response.TotalCount;
          this.refreshVenNoBaseline();

          // 查詢後重設勾選與小計
          this.selectedItems = [];
          this.calculateFooter();
        });
    });
  }

  onGenerate() {
    const overAmtItem = this.selectedItems.find(item => Number(item.ACP_Amt) > (item.OriginalACP_Amt ?? 0));
    if (overAmtItem) {
      this.messageService.errorBubble(`更改金額(${overAmtItem.ACP_Amt})不可大於原始金額(${overAmtItem.OriginalACP_Amt})`);
      return;
    }

    if (this.subTotalData.some(s => s.ACP_Amt < 0) || (this.footerData?.ACP_Amt ?? 0) < 0) {
      this.messageService.errorBubble('分組小計或總計不可為負數');
      return;
    }

    // 1. 透過 Set 取得不重複的廠商代號數量
    const uniqueVenCount = new Set(
      this.selectedItems
        .map(item => item.ven_no)
        .filter(venNo => !!venNo) // 過濾掉可能為空的值
    ).size;

    this.messageService.confirm({
      header: `確定要產生電匯資料嗎?`,
      // 2. 將原本的 this.selectedItems.length 改為不重複的廠商數量
      message: `確定要產生 ${uniqueVenCount} 筆廠商的電匯資料嗎?`,
      accept: () => {
        const aps3009Items: APS3009Item[] = this.selectedItems.map(item => ({
          ID: item.ID,
          RMT_TYPE: item.RMT_TYPE,
          VEN_No: item.ven_no,
          APAR_No: item.acp_no,
          ACP_YYYYMM: item.ACP_YYYYMM,
          acp_termno: Number(item.ACP_TERMNO),
          ACP_Amt: Number(item.ACP_Amt),
          PTA_Date: this.datePipe.transform(this.dataForm.value.ACP_ExpectPayDate, 'yyyy-MM-dd') || '',
          NoteDesc: item.NoteDesc,
          IN_TYPE: item.IN_TYPE,
          Remit_Status: item.Remit_Status
        }));

        const request: InsertFIN25010Request = {
          D_Date: this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '',
          APS3009: aps3009Items
        };

        this.loading = true;
        this.fin25010Service.insertFIN25010(request).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
          this.messageService.successBubble(res.Message);
          this.selectedItems = [];
          this.data = [];
          this.footerData = null;
          this.onSubmit(this.dataForm);
          this.messageService.confirm({
            header: '新增成功',
            message: `匯款來源單號為:${res.Data}`,
            acceptLabel: '回查詢畫面',
            accept: () => {
              this.onCancel();
            }
          })
        });
      }
    });
  }

  // 付款金額編輯校驗：更改金額不可大於原始金額
  onAmtInput(rowData: QueryAddFIN25010Response): void {
    const original = rowData.OriginalACP_Amt ?? 0;
    if (Number(rowData.ACP_Amt) > original) {
      this.messageService.errorBubble(`更改金額(${rowData.ACP_Amt})不可大於原始金額(${original})`);
      rowData.ACP_Amt = original;
    }
    this.calculateFooter();
  }

  // 查詢結果變動時算一次廠商代號集合，避免 calculateFooter 每次勾選都重掃全部資料
  private refreshVenNoBaseline(): void {
    this.allVenNos = [...new Set(this.data.map(item => item.ven_no).filter((v): v is string => !!v))];
  }

  // 1. 新增計算小計的方法
  calculateFooter(): void {
    // 建立當下所有廠商的「零元底圖」
    const groupMap = new Map<string, number>();
    for (const venNo of this.allVenNos) {
      groupMap.set(venNo, 0);
    }

    // 累加已勾選
    let total = 0;
    for (const item of this.selectedItems) {
      const amt = Number(item.ACP_Amt) || 0;
      const weightedAmt = item.IN_TYPE === '1' ? amt : -amt;

      // 更新總計
      total += weightedAmt;

      // 更新分組小計
      if (item.ven_no) {
        groupMap.set(item.ven_no, (groupMap.get(item.ven_no) || 0) + weightedAmt);
      }
    }

    this.footerData = { ACP_Amt: total } as any;
    this.subTotalData = Array.from(groupMap.entries()).map(([no, sum]) => ({
      ven_no: no,
      ACP_Amt: sum
    }));
  }

  // 3. 修改產生按鈕的判斷
  get canGenerate(): boolean {
    if (this.selectedItems.length === 0) return false;
    // 規則：只要總計是負數，或任何一個廠商的小計是負數，就不能產生
    const hasNegativeSubtotal = this.subTotalData.some(s => s.ACP_Amt < 0);
    const isTotalNegative = (this.footerData?.ACP_Amt || 0) < 0;

    return !hasNegativeSubtotal && !isTotalNegative;
  }
}
