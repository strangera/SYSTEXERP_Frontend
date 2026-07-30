import { AsyncPipe, CommonModule, formatDate } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ColumnGroup, formatAmount } from '@others/component/table/table.model';
import { TLS31080Request, TLS31080Response, Tls31080Service } from '@service/api/tls/tls31080.service';
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
import { applyDisplayStatusVisibility } from '../TLS30000/common/report-display-status.util';
import { filterHourColumns } from '../TLS30000/common/report-hour-columns.const';
import { Tls31080CRUComponent } from './tls31080-cru/tls31080-cru.component';

@Component({
  selector: 'app-tls31080',
  templateUrl: './tls31080.component.html',
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
    Tls31080CRUComponent,
  ]
})
export class TLS31080Component extends BasicQueryPageComponent<TLS31080Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    TxnDate: [yesterday, [Validators.required]],
    TimeMode: ['A'],
    TimeFromHH: [null, [Validators.min(0), Validators.max(23)]],
    TimeToHH: [null, [Validators.min(0), Validators.max(23)]],
    StoreNos: [this.authService.getUserInfo()?.SYS_StoreNo],
    Floors: [[]],
    Areas: [[]],
    category: [{ bus_type: [], bus_class: [], bus_sclass: [] }],
    CabinetKinds: [[]],
    OrgIds: [[]],
    CounterNos: [[]],
    ChargeTypes: [[]],
    Buildings: [[]],
    IncludeTax: [true],
    BizInvFlag: ['A'],
    PreSale: [false],
    ConsumerNum: [false],
  });

  reportTypeOptions = [
    { value: 'A', label: '全時段顯示' },
    { value: 'T', label: '交易時間' }
  ];

  totalRecords = 0;
  data: TLS31080Response[] = [];
  footerData: TLS31080Response | null = null;
  historyRequestBody: TLS31080Request | null = null;
  dialogVisible = false;
  selectedRow: TLS31080Response | null = null;
  btnPDFLoading = false;
  btnExcelLoading = false;

  columns: ReportColumn[] = this.buildColumns('A', null, null);

  private buildColumns(TimeMode: string, TimeFromHH: number | null, TimeToHH: number | null): ReportColumn[] {
    const filteredHours = filterHourColumns(TimeMode, TimeFromHH, TimeToHH);
    const isPreSale = this.queryForm.get('PreSale')?.value === true;
    const isConsumerNum = this.queryForm.get('ConsumerNum')?.value === true;

    return [
      { field: 'floor_desc', header: '樓層名稱', visible: true, align: 'left' },
      { field: 'TimeType', header: '時段類型', visible: true, align: 'left' },
      ...filteredHours,
      { field: 'Reentry', header: '補登金額或筆數', visible: true, format: formatAmount, align: 'right' },
      { field: 'PresaleCheckout', header: '預售結帳', visible: true, format: formatAmount, align: 'right' },
      { field: 'PrePerformance', header: '預售業績', visible: isPreSale, format: formatAmount, align: 'right', isTotal: true },
      { field: 'ConsumerNum', header: '消費人數', visible: isConsumerNum, format: formatAmount, align: 'right', isTotal: true },
      { field: 'ConsumerOrder', header: '消費客單', visible: isConsumerNum, format: formatAmount, align: 'right', isTotal: true },
      { field: 'Subtotal', header: '小計', visible: true, format: formatAmount, align: 'right' },
    ];
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      const cat = raw.category || {};
      const formValue = {
        ...raw,
        TxnDate: formatDate(frm.getRawValue().TxnDate, 'yyyy-MM-dd', 'en-US'),
        CatLNos: (cat.bus_type || []).join(','),
        CatMNos: (cat.bus_class || []).map((x: any) => x.No ?? x).join(','),
        CatSNos: (cat.bus_sclass || []).map((x: any) => x.No ?? x).join(','),
        category: undefined,
        Floors: (raw.Floors || []).join(','),
        Areas: (raw.Areas || []).join(','),
        CabinetKinds: (raw.CabinetKinds || []).join(','),
        OrgIds: (raw.OrgIds || []).join(','),
        CounterNos: (raw.CounterNos || []).join(','),
        ChargeTypes: (raw.ChargeTypes || []).join(','),
        Buildings: (raw.Buildings || []).join(','),
      } as TLS31080Request;

      this.tls31080Service.queryTLS31080(formValue)
        .pipe(this.withLoading(), takeUntilDestroyed(this.destroyRef))
        .subscribe(res => {
          // ★ 核心修正點：正確解構雙層 Data
          // res 是 ApiResponse，res.Data 是 queryTLS31080Result 物件
          const resultObj = res?.Data || {};
          const resData = Array.isArray(resultObj.Data) ? resultObj.Data : []; // 確保一定是 Array
          const totalData = resultObj.TotalData || {};

          this.data = resData; // 賦予陣列給 [data]
          this.footerData = {
            floor_desc: '營業實績',
            TimeType: '',
            TotalCount: totalData.TotalTxnCount ?? 0,
            Subtotal: totalData.TotalSales ?? 0,
            Reentry: totalData.TotalReentry ?? 0,
            PresaleCheckout: totalData.TotalPresaleCheckout ?? 0,
            PrePerformance: totalData.TotalPrePerformance,
            ConsumerNum: totalData.TotalConsumerNum,
            ConsumerOrder: totalData.TotalConsumerOrder,
            H00: totalData.TotalH00 ?? 0, H01: totalData.TotalH01 ?? 0, H02: totalData.TotalH02 ?? 0,
            H03: totalData.TotalH03 ?? 0, H04: totalData.TotalH04 ?? 0, H05: totalData.TotalH05 ?? 0,
            H06: totalData.TotalH06 ?? 0, H07: totalData.TotalH07 ?? 0, H08: totalData.TotalH08 ?? 0,
            H09: totalData.TotalH09 ?? 0, H10: totalData.TotalH10 ?? 0, H11: totalData.TotalH11 ?? 0,
            H12: totalData.TotalH12 ?? 0, H13: totalData.TotalH13 ?? 0, H14: totalData.TotalH14 ?? 0,
            H15: totalData.TotalH15 ?? 0, H16: totalData.TotalH16 ?? 0, H17: totalData.TotalH17 ?? 0,
            H18: totalData.TotalH18 ?? 0, H19: totalData.TotalH19 ?? 0, H20: totalData.TotalH20 ?? 0,
            H21: totalData.TotalH21 ?? 0, H22: totalData.TotalH22 ?? 0, H23: totalData.TotalH23 ?? 0,
          } as TLS31080Response;

          this.historyRequestBody = formValue;
          this.totalRecords = res.TotalCount ?? resData.length;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  columnGroup: ColumnGroup[] = [
    { field: 'budgetAmt', header: '營業額' },
    { field: 'sum', header: '營業佔比' },
    { field: 'custCnt', header: '客單價' },
    { field: 'space', header: '營業坪效' },
    { field: 'temp', header: '臨時櫃' },
    { field: 'month', header: '月累計' },
  ];

  tlt_kind_Option = [
    { value: "1", label: "正櫃" }, { value: "2", label: "臨時櫃" },
    { value: "3", label: "特賣會" }, { value: "4", label: "虛擬櫃" },
  ];

  tlt_term_type = [
    { value: "1", label: "固定租金" }, { value: "2", label: "底租抽成取高者" },
    { value: "3", label: "一般抽成" }, { value: "4", label: "包底抽成" },
    { value: "5", label: "層級抽成" }, { value: "6", label: "包底加層級" },
  ];

  TaxType_Option = [
    { value: true, label: "是" },
    { value: false, label: "否" },
  ];

  BizInvFlag_Option = [
    { value: "A", label: "全部" },
    { value: "Y", label: "是" },
    { value: "N", label: "否" },
  ];

  private readonly dropdown = inject(DropdownApiService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly tls31080Service = inject(Tls31080Service);

  tlt_building_Option = this.dropdown.querySys3800();
  tlt_floor_Option = this.dropdown.querySys3900();
  area_no_Option = this.dropdown.querySys3A00();
  org_id_Option = this.dropdown.querySys3100();
  CounterNos_Option = this.dropdown.queryTltTalent();

  ngOnInit(): void {
    this.initializePage('TLS31080', '', this.queryForm, (frm) => this.onSubmit(frm));
    this.onTimeModeChange('A');

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
  }

  onReport(frm: FormGroup, isExcel: boolean) {
    const raw = frm.getRawValue();
    const cat = raw.category || {};
    const formValue = {
      ...raw,
      TxnDate: formatDate(frm.getRawValue().TxnDate, 'yyyy-MM-dd', 'en-US'),
      CatLNos: (cat.bus_type || []).join(','),
      CatMNos: (cat.bus_class || []).map((x: any) => x.No ?? x).join(','),
      CatSNos: (cat.bus_sclass || []).map((x: any) => x.No ?? x).join(','),
      category: undefined,
      Floors: (raw.Floors || []).join(','),
      Areas: (raw.Areas || []).join(','),
      CabinetKinds: (raw.CabinetKinds || []).join(','),
      OrgIds: (raw.OrgIds || []).join(','),
      CounterNos: (raw.CounterNos || []).join(','),
      ChargeTypes: (raw.ChargeTypes || []).join(','),
      Buildings: (raw.Buildings || []).join(','),
    } as TLS31080Request;

    if (isExcel) {
      this.btnExcelLoading = true;
      this.tls31080Service.exportTLS31080(formValue).subscribe({
        next: (blob) => {
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = '各時段之營業報表.xlsx';
          a.click();
          globalThis.URL.revokeObjectURL(url);
          this.btnExcelLoading = false;
        },
        error: () => this.btnExcelLoading = false
      });
    } else {
      this.btnPDFLoading = true;
      this.tls31080Service.exportTLS31080PDF(formValue).subscribe({
        next: (blob) => {
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = '各時段之營業報表.pdf';
          a.click();
          globalThis.URL.revokeObjectURL(url);
          this.btnPDFLoading = false;
        },
        error: () => this.btnPDFLoading = false
      });
    }
  }

  onTimeModeChange(mode: 'A' | 'T') {
    const from = this.queryForm.get('TimeFromHH');
    const to = this.queryForm.get('TimeToHH');
    if (mode === 'A') {
      from?.disable();
      to?.disable();
      from?.setValue(null);
      to?.setValue(null);
    } else {
      from?.enable();
      to?.enable();
    }
  }

  onDetail1(event: TLS31080Response) {
    this.selectedRow = event;
    this.dialogVisible = true;
  }

  setColumns() {
    this.columns = applyDisplayStatusVisibility(this.columns, {
      preSale: this.queryForm.get('PreSale')?.value === true,
      consumerNum: this.queryForm.get('ConsumerNum')?.value === true,
    });
  }
}