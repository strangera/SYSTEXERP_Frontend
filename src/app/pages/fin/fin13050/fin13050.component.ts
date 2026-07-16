import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { finalize, forkJoin } from 'rxjs';

// API & Base
import { FIN13050Service } from '../../../service/api/fin/fin13050.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../others/component/table/table.model';

// UI Components
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { InputNumberRangeComponent } from '@shared/components/input-number-range/input-number-range.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, formatYYYYMMDD } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { YearMonthComponent } from '../fin11020/query-year-month.component';

@Component({
  selector: 'app-fin13050',
  standalone: true,
  imports: [
    MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    InputTextComponent, CalendarRangeComponent, MultiSelectComponent, TranslateModule,
    CalendarComponent, InputNumberRangeComponent, YearMonthComponent, TableReportComponent
  ],
  templateUrl: './fin13050.component.html',
})
export class FIN13050Component extends BasicQueryPageComponent<any> implements OnInit {
  vendorOptions: any[] = [];
  PUR_VoucherTypeOptions: any[] = [];
  directTypeOptions: any[] = [];
  taxTypeOptions: any[] = [];
  PUR_DiscNoOptions: any[] = [];
  typeOptions: any[] = [];
  SYS_ORIGINOptions: any[] = [];
  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];
  lastQueryBody: any = null;
  isRowSelectable = (row: any): boolean => !!row?.CanDel;
  editDisabled = (row: any): boolean => !row?.CanEdit;
  detailDisabled = (row: any): boolean => false;
  queryForm = this.formBuilder.group({
    ...createPaginationConfig([{ field: 'PUR_GUINo', order: 1 }, { field: 'PUR_GUIDate', order: 1 }]),
    PUR_VoucherType: [[]],
    PUR_GUINo: [null, [Validators.maxLength(10)]],
    PUR_GUIDate_Start: [null], PUR_GUIDate_End: [null],
    PUR_GUIDate_YYYYMM: [null],
    PUR_RepYYYYMM: [`${(new Date()).getFullYear()}${String(((new Date()).getMonth() + 1) % 2 === 0 ? ((new Date()).getMonth() + 1) : Math.min(((new Date()).getMonth() + 1) + 1, 12)).padStart(2, '0')}` as string | null],
    PUR_VenUniform: [[]],
    PUR_Amt_Small: [null], PUR_Amt_Big: [null],
    PUR_Net_Small: [null], PUR_Net_Big: [null],
    PUR_Tax_Small: [null], PUR_Tax_Big: [null],
    PUR_DirectType: [[]], PUR_TaxType: [[]], PUR_DiscNo: [[]], PUR_Type: [[]],
    SYS_ORIGIN: [[]], Source_Doc_No: [null, [Validators.maxLength(14)]],
    Voucher_No: [null, [Validators.maxLength(11)]],
    PUR_Remark: [null, [Validators.maxLength(100)]],
    CRT_USR_Name: [null], CRT_Date_Start: [null], CRT_Date_End: [null],
    UPD_USR_Name: [null], UPD_Date_Start: [null], UPD_Date_End: [null],
  });

  columns = [
    { field: 'PUR_VoucherType', header: '發票格式', format: (v: string | number) => v },
    { field: 'PUR_GUINo', header: '發票號碼' },
    { field: 'PUR_GUIDate', header: '發票日期', format: formatYYYYMMDD },
    { field: 'PUR_GUIDate_YYYYMM', header: '資料所屬年月' },
    { field: 'PUR_RepYYYYMM', header: '申報年月' },
    { field: 'PUR_VenUniform', header: '廠商統編' },
    { field: 'PUR_Amt', header: '發票總金額', format: formatAmount },
    { field: 'PUR_Net', header: '發票未稅金額', format: formatAmount },
    { field: 'PUR_Tax', header: '發票稅額', format: formatAmount },
    { field: 'PUR_DirectTypeDesc', header: '發票用途' },
    { field: 'PUR_TaxTypeDesc', header: '課稅別' },
    { field: 'PUR_DiscNoDesc', header: '扣抵代號' },
    { field: 'PUR_TypeDesc', header: '類別區分' },
    { field: 'Source_Doc_No', header: '憑證單號' },
    { field: 'Voucher_No', header: '傳票號碼' },
    { field: 'PUR_Remark', header: '備註' },
  ];

  constructor(
    public readonly fin13050Service: FIN13050Service,
    private readonly datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('FIN13050', '/fin/FIN13050cru', this.queryForm, (f) => this.onSubmit(f));
    this.initOptions();
  }

  private initOptions() {
    const sys1000 = (type: string) => (this.fin13050Service as any).querySYS1000DropDownList(type);
    forkJoin({
      vendor: this.fin13050Service.queryVendorList(),
      voucher: this.fin13050Service.queryAPS2002DropDownList(),
      direct: sys1000('PUR_DirectType'),
      tax: sys1000('PUR_TaxType'),
      disc: sys1000('PUR_DiscNo'),
      type: sys1000('PUR_Type'),
      origin: sys1000('SYS_ORIGIN')
    }).pipe(untilDestroyed(this)).subscribe(res => {
      this.vendorOptions = res.vendor?.Data?.map((v: any) => ({ label: `${v.VEN_No} - ${v.VEN_Name}`, value: v.VEN_No })) || [];
      this.PUR_VoucherTypeOptions = res.voucher?.Data?.map((x: any) => ({ value: String(x.No), label: `${x.No}-${x.Name}` })) || [];
      const mapSys = (data: any) => data?.Data?.map((x: any) => ({ value: String(x.No), label: `${x.No}-${x.Name}` })) || [];
      this.directTypeOptions = mapSys(res.direct);
      this.taxTypeOptions = mapSys(res.tax);
      this.PUR_DiscNoOptions = mapSys(res.disc);
      this.typeOptions = mapSys(res.type);
      this.SYS_ORIGINOptions = mapSys(res.origin);
    });
  }

  onSubmit(form: FormGroup): void {
    // 2. 使用底層 handleSubmit，自動處理 valid 檢查、Loading 與 BlockUI
    this.handleSubmit(form, () => {
      const raw = form.getRawValue();
      const payload = {
        ...raw,
        PUR_GUIDate_YYYYMM: this.datePipe.transform(raw.PUR_GUIDate_YYYYMM, 'yyyyMM'),
        PUR_GUINo: raw.PUR_GUINo?.toUpperCase(),
        ...['PUR_VoucherType', 'PUR_DirectType', 'PUR_TaxType', 'PUR_DiscNo', 'PUR_Type', 'SYS_ORIGIN'].reduce((acc, key) => {
          acc[key] = raw[key]?.length ? raw[key] : undefined;
          return acc;
        }, {} as any),
        PUR_VenUniform: (raw.PUR_VenUniform && raw.PUR_VenUniform.length > 0)
          ? [raw.PUR_VenUniform]
          : null
      };

      this.fin13050Service.queryFIN13050(payload).pipe(
        finalize(() => this.loading = false),
        untilDestroyed(this)
      ).subscribe(res => {
        this.data = res?.Data ?? [];
        this.totalRecords = res?.TotalCount ?? this.data.length;
        this.lastQueryBody = { ...payload };
        this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
      });
    });
  }

  onDelete = (selection: any | any[]) => {
    const rows = Array.isArray(selection) ? selection : [selection];
    if (rows.some(r => !r?.CanDel)) return this.messageService.warnBubble('已審核之申報年月資料不可刪除');

    const ids = rows.map(r => r.id).filter(id => id != null);
    this.messageService.confirm({
      header: '刪除確認',
      message: `確定刪除這 ${ids.length} 筆資料？`,
      accept: () => {
        this.loading = true; // 利用底層 loading 觸發遮罩
        this.fin13050Service.deleteFIN13050(ids).pipe(
          finalize(() => this.loading = false),
          untilDestroyed(this)
        ).subscribe(() => {
          this.messageService.successBubble('刪除成功');
          this.onSubmit(this.queryForm);
        });
      }
    });
  }
}
