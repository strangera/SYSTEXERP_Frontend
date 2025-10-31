import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FloorService } from '../../../service/basic/floor.service';
import { MachinedisplayService } from '../../../service/basic/machinedisplay.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownModule } from 'primeng/dropdown';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { Tls22010Service } from '../../../service/api/tls/tls22010.service';
import { formatAmount } from 'src/app/shared/componentkit/table/table.model';
import { ButtonModule } from 'primeng/button';
import { yesterday } from '@shared/models/system/query-form.model';
import { NgIf } from '@angular/common';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { finalize } from 'rxjs';
import { TLS22010Query } from "../tls22010-cru/tls22010.model";
import { untilDestroyed } from '@ngneat/until-destroy';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';

@Component({
  templateUrl: './tls22010.component.html',
  styleUrls: ['./tls22010.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    MultiSelectComponent,
    DropdownModule,
    RadiobuttonComponent,
    ButtonComponent,
    TranslateModule,
    ButtonModule,
    NgIf,
    TableReportComponent
  ],
})
export class TLS22010Component extends BasicQueryPageComponent<any> implements OnInit {
  first = 0;
  queryForm = this.formBuilder.group({
    TXN_Date: [yesterday, { validators: [Validators.required], updateOn: 'change' }],
    floor_noList: [[]],
    ECR_NoList: [[]],
    ShowStatus: ['1'],
    status1: [''],
    status2: [''],

  });
  historyRequestBody: TLS22010Query | null = null;
  selectedItems: any[] = [];
  totalRecords = 0;
  data: any[] = [];
  statusSummary = {
    LDataButZZero: 0,
    ZNotMatchL: 0,
    NoTxnMachine: 0
  };
  TXN_Date = '';
  // ------ 欄位定義 ------
  columns7: ReportColumn[] = [
    // { header: '總計', field: 'group_name', hidden: true },
    { field: 'ECR_No_Display', header: '收銀機號', visible: true, type: 'html', sortField: 'ECR_No' },
    { field: 'AREA_NO', header: '區域', visible: true },
    { field: 'FLOOR_Name', header: '樓層', visible: true },
    { field: 'TXN_TotSaleAmt', header: '銷售金額 (A)', visible: true, format: formatAmount, isTotal: true },
    { field: 'sad_preorder_Amt', header: '預購金額', visible: true, format: formatAmount, isTotal: true },
    { field: 'sad_settle_Amt', header: '預購結帳 (C2)', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_TotSaleAmt_Sum', header: '銷售小計(D) = (A)', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_TotExtraAmt', header: '代收/付金額 (L)', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_TotHaveTax', header: '已開發票金額 (E)', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_ChangeHaveTax', header: '已開找零 (K)', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_TotOver', header: '已開溢付 (I)', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_TotGUI', header: '發票總金額 (F)', visible: true, format: formatAmount, isTotal: true },
    { field: 'GUI_NET', header: '發票未稅金額 (M)', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_TotTax', header: '發票稅額 (N)', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_TotGUISaleNoTax', header: '發票免稅金額 (O)', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_TotOver_Sum', header: '溢收 (G)', visible: true, format: formatAmount, isTotal: true },
    { field: 'GUI_REFUND', header: '折讓 (J)', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_TotPayAmt', header: '付款金額(H)=(D)+(G)-(C2)-(K)', visible: true, format: formatAmount, isTotal: true, cellClass: (row) => this.getStatusColor(row) },
    { field: 'SLE_SaleAmt', header: 'Z 報表總金額', visible: true, format: formatAmount, isTotal: true, cellClass: (row) => this.getStatusColor(row) },
    { field: 'TXN_Mode_P', header: '後台(作廢/補登)', visible: true, isTotal: true, format: formatAmount },
    { field: 'Status_Code', header: '狀態', visible: true },
  ];

  statusOptions = [
    { label: '全部', value: 'all' },
    { label: '正常', value: 'normal' },
    { label: '異常', value: 'abnormal' },
  ];

  exportExcelLoading = false;
  floorOptions: any[] = [];
  machinedisplayOptions: any[] = [];
  ECRNoOptions: any[] = [];
  footerData: any[] = [];
  // private skipAutoQueryOnce = false;

  constructor(
    private floorService: FloorService,
    private machineDisplayService: MachinedisplayService,
    private ECRNoService: ECRNoService,
    public readonly tls22010Service: Tls22010Service,
  ) {
    super();
  }
  getStatusColor(row: any): string {
    switch (row.Status_Code) {
      case '#': // 粉紅：L檔金額異常
        return 'bg-pink-100 text-red-600';
      case '!': // 咖啡：L檔未上送
        return 'bg-amber-100 text-amber-800';
      case '@': // 綠：Z報與L檔不平
        return 'bg-green-100 text-green-700';
      default:
        return '';
    }
  }
  // --------- 生命週期 ----------
  ngOnInit(): void {
    this.initializePage('TLS22010', '/TLS/TLS22010cru', this.queryForm, (form) => this.onSubmit(form));

    // 下拉選項
    this.floorService.getFloors().subscribe((data) => (this.floorOptions = data));
    this.machineDisplayService.getMachinedisplay().subscribe((data) => (this.machinedisplayOptions = data));
    this.ECRNoService.getECRNo().subscribe((data) => (this.ECRNoOptions = data));

    // const state = this.router.lastSuccessfulNavigation?.extras.state;
    // const isFromRelatedRoute = state?.['fromRoute']?.includes(this.ProgNo.toLowerCase());
    // if (isFromRelatedRoute) {
    //   this.skipAutoQueryOnce = true;

    //   const res = this.queryStateService.getQueryStateValue(this.ProgNo + '_data');
    //   if (res) {
    //     this.data = res.Data ?? [];
    //     this.footerData = res.footerData ?? [];
    //     this.totalRecords = res.TotalCount ?? this.data.length;
    //   }
    // }
  }
  /** 避免時區影響：以本地時間組 YYYY-MM-DD */
  private toYMD(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  onSubmit(frm: FormGroup): void {
    // if (this.skipAutoQueryOnce) {
    //   this.skipAutoQueryOnce = false;
    //   return;
    // }

    this.handleSubmit(frm, () => {
      const raw = frm.value;
      const payload = {
        PageSize: raw.pageSize ?? 30,
        PageIndex: raw.pageIndex ?? 1,
        OrderBy: raw.OrderBy ?? '',    // 後端有要
        Offset: raw.Offset ?? 0,       // 後端有要
        SortBy: raw.SortBy ?? [],
        TXN_Date: raw.TXN_Date instanceof Date
          ? this.toYMD(raw.TXN_Date)
          : raw.TXN_Date || '',

        ECR_NoList: raw.ECR_NoList?.length ? raw.ECR_NoList : [],
        floor_noList: raw.floor_noList?.length ? raw.floor_noList : [],
        ShowStatus: raw.ShowStatus ?? 'all',   // 預設一個值避免漏掉
      };

      this.tls22010Service.queryTLS22010(payload).pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      ).subscribe(response => {
        this.data = response.Data ?? [];
        this.footerData = { group_name: '總計', ...(response.footerData[0] ?? {}) };
        this.totalRecords = response.TotalCount ?? this.data.length;

        // 儲存查詢狀態
        this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
        this.historyRequestBody = payload;

        console.log('Data:', this.data);
        console.log('footerData:', this.footerData);
      });
    });
  }
  // 覆寫父類別的 onDetail 方法，傳遞查詢條件到 CRU 頁面
  override onDetail(data: unknown) {
    const queryConditions = {
      Data: this.data,
      footerData: this.footerData,
      TotalCount: this.totalRecords
    };
    // 儲存完整的查詢結果數據
    this.queryStateService.setQueryState(this.ProgNo + '_data', queryConditions);
    // 呼叫父類別的 onDetail 方法，傳遞查詢條件
    super.onDetail(data, queryConditions);
  }
}
