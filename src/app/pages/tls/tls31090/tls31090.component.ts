import { AsyncPipe, CommonModule, formatDate } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ColumnGroup, formatAmount } from '@others/component/table/table.model';
import { TLS31090Request, TLS31090Response, Tls31090Service } from '@service/api/tls/tls31090.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CategorySelectComponent } from '@shared/biz-components/category-select/category-select.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { InputNumberRangeComponent } from '@shared/components/input-number-range/input-number-range.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { yesterday } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { combineLatest, debounceTime } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ReportColumn } from '../tls2f010-cru/tls2f010-table-report.model';
import { filterHourColumns } from '../TLS30000/common/report-hour-columns.const';
import { applyDisplayStatusVisibility } from '../TLS30000/common/report-display-status.util';
import { startReportAutoRefresh } from '../TLS30000/common/report-auto-refresh.util';
import { REPORT_AUTO_REFRESH_HINT_TEXT } from '../TLS30000/common/report-auto-refresh-hint.constant';
import { Tls31090CRUComponent } from './tls31090-cru/tls31090-cru.component';

@Component({
  selector: 'app-tls31090',
  templateUrl: './tls31090.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    RadiobuttonComponent,
    CommonModule,
    CalendarComponent,
    InputNumberRangeComponent,
    ButtonComponent,
    TableModule,
    TableReportComponent,
    TranslateModule,
    MultiSelectComponent,
    ButtonModule,
    CheckboxModule,
    CategorySelectComponent,
    Tls31090CRUComponent,
  ]
})

export class TLS31090Component extends BasicQueryPageComponent<TLS31090Response> implements OnInit {
  readonly autoRefreshHintText = REPORT_AUTO_REFRESH_HINT_TEXT;

  queryForm = this.formBuilder.nonNullable.group({
    TxnDate: [yesterday, [Validators.required]],//交易日期_起
    // TxnDate: [new Date(2025, 0, 1), [Validators.required]],//交易日期_起 (測試)
    TimeMode: ['A'],// 時段模式：'A'=全時段(預設)，'T'=依範圍 (全時段不用帶TimeFromHH、TimeToHH)
    TimeFromHH: [null, [Validators.min(0), Validators.max(23)]],// 起始小時 (0~23)，當 TimeMode='T' 時生效
    TimeToHH: [null, [Validators.min(0), Validators.max(23)]],// 結束小時 (0~23)，當 TimeMode='T' 時生效
    StoreNos: [this.authService.getUserInfo()?.SYS_StoreNo], //門市代號，多選以逗號分隔 (例: "001,002,003")
    Floors: [[]], //樓層代號，多選以逗號分隔
    Areas: [[]], //區域代號，多選以逗號分隔
    category: [{ bus_type: [], bus_class: [], bus_sclass: [] }], //大中小分類（app-category-select 複合欄位）
    CabinetKinds: [[]], //櫃別類型，多選以逗號分隔 (TLTTALENT.tlt_kind)
    OrgIds: [[]], //組織代號，多選以逗號分隔
    CounterNos: [[]], //專櫃代號，多選以逗號分隔 (TLTTALENT.tlt_no)
    ChargeTypes: [[]], //抽成別，多選以逗號分隔 (POS5007.TLT_ID)
    Buildings: [[]], //館別代號，多選以逗號分隔 (TLTTALENT_LOCATION.tlt_building)
    IncludeTax: [true], //是否含稅：1=含稅(預設)，0=未稅
    BizInvFlag: ['A'], //是否開立業主發票：'A'=全部(預設)、'Y'=是、'N'=否
    PreSale: [false],
    ConsumerNum: [false],

    // ...createPaginationConfig([{ field: 'tlt_kind', order: 1 }])
  });

  reportTypeOptions = [
    { value: 'A', label: '全時段顯示' },
    { value: 'T', label: '交易時間' }
  ];

  totalRecords = 0;
  data: TLS31090Response[] = [];
  footerData: TLS31090Response | null = null;
  historyRequestBody: TLS31090Request | null = null; //歷史查詢條件
  dialogVisible = false;
  selectedRow: TLS31090Response | null = null;

  btnPDFLoading = false;
  btnExcelLoading = false;

  isPreSale = this.queryForm.get('PreSale')?.value ?? false;
  isConsumerNum = this.queryForm.get('ConsumerNum')?.value ?? false;

  //時段控制（stored property，避免每次 CD 產生新陣列）
  columns: ReportColumn[] = this.buildColumns('A', null, null);

  // --- 動態欄位重構點 ---
  private buildColumns(TimeMode: string, TimeFromHH: number | null, TimeToHH: number | null): ReportColumn[] {
    const filteredHours = filterHourColumns(TimeMode, TimeFromHH, TimeToHH);

    return [
      { field: 'BusTypeName', header: '大分類名稱', visible: true, align: 'left' },
      { field: 'TimeType', header: '時段類型', visible: true, align: 'left' },

      ...filteredHours,

      { field: 'Reentry', header: '補登', visible: true, format: formatAmount, align: 'right' },
      { field: 'PresaleCheckout', header: '預售結帳', visible: true, format: formatAmount, align: 'right' },
      { field: 'PrePerformance', header: '預售業績', visible: this.queryForm.get('PreSale')?.value === true, format: formatAmount, align: 'right', isTotal: true },
      { field: 'ConsumerNum', header: '消費人數', visible: this.queryForm.get('ConsumerNum')?.value === true, format: formatAmount, align: 'right', isTotal: true },
      { field: 'ConsumerOrder', header: '消費客單', visible: this.queryForm.get('ConsumerNum')?.value === true, format: formatAmount, align: 'right', isTotal: true },
      { field: 'Subtotal', header: '小計', visible: true, format: formatAmount, align: 'right' },
    ];
  }

  // --- 動態欄位重構點 ---
  setColumns() {
    this.columns = applyDisplayStatusVisibility(this.columns, {
      preSale: this.queryForm.get('PreSale')?.value === true,
      consumerNum: this.queryForm.get('ConsumerNum')?.value === true,
    });
  }

  columnGroup: ColumnGroup[] = [
    { field: 'budgetAmt', header: '營業額' },
    { field: 'sum', header: '營業佔比' },
    { field: 'custCnt', header: '客單價' },
    { field: 'space', header: '營業坪效' },
    { field: 'temp', header: '臨時櫃' },
    { field: 'month', header: '月累計' },
  ]
  tlt_kind_Option = [
    { value: "1", label: "正櫃" },
    { value: "2", label: "臨時櫃" },
    { value: "3", label: "特賣會" },
    { value: "4", label: "虛擬櫃" },
  ]
  tlt_term_type = [
    { value: "1", label: "固定租金" },
    { value: "2", label: "底租抽成取高者" },
    { value: "3", label: "一般抽成" },
    { value: "4", label: "包底抽成" },
    { value: "5", label: "層級抽成" },
    { value: "6", label: "包底加層級" },
  ]
  TaxType_Option = [ // 銷售金額是否含稅
    { value: true, label: "是" },
    { value: false, label: "否" },
  ]
  BizInvFlag_Option = [ // 是否開立業主發票
    { value: "A", label: "全部" },
    { value: "Y", label: "是" },
    { value: "N", label: "否" },
  ]
  private readonly dropdown = inject(DropdownApiService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly tls31090Service = inject(Tls31090Service);

  tlt_building_Option = this.dropdown.querySys3800(); // 館別
  tlt_floor_Option = this.dropdown.querySys3900(); // 樓層
  area_no_Option = this.dropdown.querySys3A00(); // 區域
  org_id_Option = this.dropdown.querySys3100(); // 組織
  CounterNos_Option = this.dropdown.queryTltTalent(); // 專櫃代號

  ngOnInit(): void {
    this.initializePage('TLS31090', '', this.queryForm, (frm) => this.onSubmit(frm));

    // 日期表單控制
    this.onTimeModeChange('A');

    // 監聽時段相關欄位，更新 columns（避免用 getter 每次 CD 都產生新陣列）
    combineLatest([
      this.queryForm.controls.TimeMode.valueChanges,
      this.queryForm.controls.TimeFromHH.valueChanges,
      this.queryForm.controls.TimeToHH.valueChanges,
    ]).pipe(debounceTime(50), takeUntilDestroyed(this.destroyRef)).subscribe(([mode, from, to]) => {
      this.columns = this.buildColumns(mode, from, to);
    });

    this.queryForm.get('PreSale')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.setColumns();
    });
    this.queryForm.get('ConsumerNum')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.setColumns();
    });

    // 查詢日期若為系統日，每 10 分鐘自動重新查詢一次
    startReportAutoRefresh(this.destroyRef, () => this.historyRequestBody?.TxnDate, () => {
      if (this.historyRequestBody) this.executeQuery(this.historyRequestBody);
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      const cat = raw.category || {};

      // 可用 2025-10-01 測試

      const formValue = {
        ...raw,
        // 日期格式化
        TxnDate: formatDate(frm.getRawValue().TxnDate, 'yyyy-MM-dd', 'en-US'),

        // 分類轉成編號
        CatLNos: cat.bus_type || [],
        CatMNos: (cat.bus_class || []).map((x: any) => [x.bus_type, x.No]),
        CatSNos: (cat.bus_sclass || []).map((x: any) => [x.bus_type, x.bus_class, x.No]),
        category: undefined,

        // 多選陣列轉成逗號字串
        Floors: (raw.Floors || []).join(','),
        Areas: (raw.Areas || []).join(','),
        CabinetKinds: (raw.CabinetKinds || []).join(','),
        OrgIds: (raw.OrgIds || []).join(','),
        CounterNos: (raw.CounterNos || []).join(','),
        ChargeTypes: (raw.ChargeTypes || []).join(','),
        Buildings: (raw.Buildings || []).join(','),
      } as TLS31090Request;

      this.executeQuery(formValue, frm.getRawValue());
    })
  }

  private executeQuery(formValue: TLS31090Request, rawFormValue?: unknown) {
    this.tls31090Service.queryTLS31090(formValue).pipe(this.withLoading(), takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.data = res.Data.Data ?? [];               // 查詢資料
      this.footerData = {
        BusTypeName: '營業實績',
        TimeType: '',
        H00: res.Data.TotalData?.TotalH00 ?? 0,
        H01: res.Data.TotalData?.TotalH01 ?? 0,
        H02: res.Data.TotalData?.TotalH02 ?? 0,
        H03: res.Data.TotalData?.TotalH03 ?? 0,
        H04: res.Data.TotalData?.TotalH04 ?? 0,
        H05: res.Data.TotalData?.TotalH05 ?? 0,
        H06: res.Data.TotalData?.TotalH06 ?? 0,
        H07: res.Data.TotalData?.TotalH07 ?? 0,
        H08: res.Data.TotalData?.TotalH08 ?? 0,
        H09: res.Data.TotalData?.TotalH09 ?? 0,
        H10: res.Data.TotalData?.TotalH10 ?? 0,
        H11: res.Data.TotalData?.TotalH11 ?? 0,
        H12: res.Data.TotalData?.TotalH12 ?? 0,
        H13: res.Data.TotalData?.TotalH13 ?? 0,
        H14: res.Data.TotalData?.TotalH14 ?? 0,
        H15: res.Data.TotalData?.TotalH15 ?? 0,
        H16: res.Data.TotalData?.TotalH16 ?? 0,
        H17: res.Data.TotalData?.TotalH17 ?? 0,
        H18: res.Data.TotalData?.TotalH18 ?? 0,
        H19: res.Data.TotalData?.TotalH19 ?? 0,
        H20: res.Data.TotalData?.TotalH20 ?? 0,
        H21: res.Data.TotalData?.TotalH21 ?? 0,
        H22: res.Data.TotalData?.TotalH22 ?? 0,
        H23: res.Data.TotalData?.TotalH23 ?? 0,

        Reentry: res.Data.TotalData?.TotalReentry ?? 0, // 補登總計
        PresaleCheckout: res.Data.TotalData?.TotalPresaleCheckout ?? 0, // 預售結帳總計
        Subtotal: res.Data.TotalData?.TotalSales ?? 0, // 營業實績總計
        PrePerformance: res.Data.TotalData?.TotalPreOrderAmt ?? 0, // 預售實績總計
        ConsumerNum: res.Data.TotalData.TotalConsumerNum, // 消費人數總計
        ConsumerOrder: res.Data.TotalData.TotalConsumerOrder, // 消費客單總計
      };
      this.historyRequestBody = formValue;
      this.totalRecords = res.Data.Data.length;      // 長度計算筆數
      if (rawFormValue) this.queryStateService.setQueryState(this.ProgNo, rawFormValue);
    })
  }
  onReport(frm: FormGroup, isExcel: boolean) {
    console.log('匯出Excel');
    const raw = frm.getRawValue();
    const cat = raw.category || {};
    const formValue = {
      ...raw,
      // 日期格式化
      TxnDate: formatDate(frm.getRawValue().TxnDate, 'yyyy-MM-dd', 'en-US'),

      // 分類轉成編號
      CatLNos: cat.bus_type || [],
      CatMNos: (cat.bus_class || []).map((x: any) => [x.bus_type, x.No]),
      CatSNos: (cat.bus_sclass || []).map((x: any) => [x.bus_type, x.bus_class, x.No]),
      category: undefined,

      // 多選陣列轉成逗號字串
      Floors: (raw.Floors || []).join(','),
      Areas: (raw.Areas || []).join(','),
      CabinetKinds: (raw.CabinetKinds || []).join(','),
      OrgIds: (raw.OrgIds || []).join(','),
      CounterNos: (raw.CounterNos || []).join(','),
      ChargeTypes: (raw.ChargeTypes || []).join(','),
      Buildings: (raw.Buildings || []).join(','),
    } as TLS31090Request;

    console.log('各時段之大分類之營業報表print請求(Excel)', JSON.stringify(formValue));

    if (isExcel) {
      console.log('匯出Excel');
      this.btnExcelLoading = true;
      this.tls31090Service.exportTLS31090(formValue).subscribe(blob => {
        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '各時段之大分類之營業報表.xlsx';
        a.click();
        globalThis.URL.revokeObjectURL(url);
        this.btnExcelLoading = false;
      });
    } else {
      console.log('匯出PDF');
      this.btnPDFLoading = true;
      this.tls31090Service.exportTLS31090PDF(formValue).subscribe(blob => {
        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '各時段之大分類之營業報表.pdf';
        a.click();
        globalThis.URL.revokeObjectURL(url);
        this.btnPDFLoading = false;
      });
    }
  }

  //#region 日期表單控制
  onTimeModeChange(mode: 'A' | 'T') {
    const from = this.queryForm.get('TimeFromHH');
    const to = this.queryForm.get('TimeToHH');

    if (mode === 'A') {
      from?.disable();
      to?.disable();

      from?.setValue(null); // 全時段重制為null
      to?.setValue(null);   // 全時段重制為null
    } else {
      from?.enable();
      to?.enable();
    }
  }

  onDetail1(event: TLS31090Response) {
    this.selectedRow = event;
    this.dialogVisible = true;
  }
}
