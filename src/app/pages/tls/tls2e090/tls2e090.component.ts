import { AsyncPipe, DatePipe } from '@angular/common'; // 加入 DatePipe
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TotalData } from '@service/api/tls/tls27040.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { RadiobuttonYNComponent } from '@shared/components/radiobutton-yn/radiobutton-yn.component';
import { RadiobuttonComponent } from '@shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { ColumnGroup } from '@others/component/table/table.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import { debounceTime, finalize, Observable } from 'rxjs';
import { Tls2e090Data, Tls2e090QueryBody, Tls2e090Service } from '../../../service/api/tls/tls2e090.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { columnGroup, columns1, columns2, columns3 } from './tls2e090.model';
type ReportType = '1' | '2' | '3';
type QueryApiFn = (body: Tls2e090QueryBody) => Observable<ApiResponse<any, any>>;

@Component({
  selector: 'app-tls2e090',
  templateUrl: './tls2e090.component.html',
  standalone: true,
  styles: [`
    :host ::ng-deep {
      app-table-report .p-datatable-tbody > tr,
      app-table-report .p-datatable-tbody > tr > td {
        height: 60px !important;
        min-height: 60px !important;
      }

      app-table-report .p-datatable-tbody > tr > td.data-cell {
        white-space: nowrap !important;
        word-break: normal !important;
        overflow-wrap: normal !important;
      }
    }
  `],
  imports: [
    ButtonModule,
    RadiobuttonComponent,
    SelectButtonModule,
    TableReportComponent,
    InputNumberComponent,
    AsyncPipe,
    RadiobuttonYNComponent,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    MultiSelectComponent,
    CheckboxModule,
    TranslateModule
  ]
})
export class TLS2E090Component extends BasicQueryPageComponent<Tls2e090Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    sam_yyymm_Start: [new Date()],
    sam_yyymm_End: [new Date()],
    money_typeList: [null],
    ven_no: [],
    tlt_noList: [null],
    org_idList: [null],
    tlt_floorList: [null],
    tlt_buildingList: [null],
    tlt_term_typeList: [null],
    bus_typeList: [[] as string[]],
    bus_classList: [[] as IDropdownItem[]],
    rece_yn: [],
    acc_payableNeg: [false],
    sam_ap_amtNeg: [false],
    isUnderLimitAmt: [false],
    check_day: [],
    invoice_type: [],
    pageSize: [1000],
    pageIndex: [1],
    SortBy: [[{ field: 'tlt_no', order: 1 }]],
    is_tax: [true],
    store_way: [null as '1' | '2' | null], // 新增：null=全部, '1'=專櫃, '2'=自營
  });

  reportType: ReportType = '1';
  isTaxed = true;
  taxOptions = [{ label: '含稅', value: true }, { label: '未稅', value: false }];
  typeOptions = [
    { label: '專櫃帳款結算彙總表', value: '1' },
    { label: '專櫃銷貨彙總表-依抽成', value: '2' },
    { label: '專櫃銷貨彙總表-依類別', value: '3' }
  ];

  data1: Tls2e090Data[] = [];
  data2: Tls2e090Data[] = [];
  footerData1: TotalData | null = null;
  footerData2: TotalData | null = null;
  totalRecords1 = 0;
  totalRecords2 = 0;
  lastQueryBody1: Tls2e090QueryBody | null = null;
  lastQueryBody2: Tls2e090QueryBody | null = null;
  loading2 = false;

  columns: ReportColumn[] = columns1;
  columnGroup?: ColumnGroup[] = columnGroup;

  money_typeOptions = getSYS1000Options('money_type');
  tlt_term_typeOptions = getSYS1000Options('tlt_term_type');
  ven_noOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
  tlt_noOptions = this.dropdown.queryTltTalent();
  org_idOptions = this.dropdown.querySys3100();
  tlt_floorOptions = this.dropdown.querySys3900();
  tlt_buildingOptions = this.dropdown.querySys3800();
  bus_typeOptions = this.dropdown.queryTltBusType();
  bus_classOptions: IDropdownItem[] = [];
  invoiceTypeOptions = getSYS1000Options('invoice_type');
  apiUrl = 'queryTLS2E090';
  btnLoading = false;
  btnLoading2 = false;
  constructor(
    public readonly tls2e090Service: Tls2e090Service,
    private readonly dropdown: DropdownApiService,
    private readonly dropDownListService: DropDownListService,
    private readonly datePipe: DatePipe // 注入 DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2E090');
    this.queryForm.controls.bus_typeList.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((value: string[]) => {
      if (value && value.length > 0) {
        this.dropDownListService.queryTLTBUSCLASS_DropDownList({ bus_type: value }).pipe(untilDestroyed(this)).subscribe(response => {
          const groupedData = response.Data.reduce((accumulator, currentItem) => {
            const groupKey = currentItem.bus_type || '';
            if (!accumulator[groupKey]) {
              accumulator[groupKey] = { label: currentItem.bus_type_name, items: [] };
            }
            accumulator[groupKey].items.push({
              ...currentItem,
              label: `${currentItem.No} - ${currentItem.Name}`,
            });
            return accumulator;
          }, {} as Record<string, any>);
          this.bus_classOptions = Object.values(groupedData);
        });
      } else {
        this.bus_classOptions = [];
        this.queryForm.controls.bus_classList.setValue([]);
      }
    });
  }

  switchReport(type: ReportType) {
    if (type === '2' || type === '3') this.isTaxed = true;
    this.columns = this.getDynamicColumns();
    this.data1 = [];
    this.data2 = [];
    this.footerData1 = null;
    this.footerData2 = null;
    this.totalRecords1 = 0;
    this.totalRecords2 = 0;
    this.onSubmit(this.queryForm);
  }

  onTaxChange(value: boolean) {
    this.isTaxed = value;
    this.columns = this.getDynamicColumns();
  }

  getDynamicColumns(): ReportColumn[] {
    let baseColumns: ReportColumn[];
    if (this.reportType === '1') {
      this.columnGroup = columnGroup;
      this.apiUrl = 'queryTLS2E090';
      return columns1;
    } else if (this.reportType === '2') {
      baseColumns = columns2;
      this.apiUrl = 'queryTLS2E090SalCharge';
    } else {
      baseColumns = columns3;
      this.apiUrl = 'queryTLS2E090SalChargeCategory';
    }
    this.columnGroup = undefined;
    return this.isTaxed
      ? baseColumns.filter((col: ReportColumn) => !col.field.startsWith('Namt'))
      : baseColumns.filter((col: ReportColumn) => !col.field.startsWith('Amt'));
  }

  getCurrentQueryFunction(): QueryApiFn {
    switch (this.reportType) {
      case '1': return (body) => this.tls2e090Service.queryTls2e090(body);
      case '2': return (body) => this.tls2e090Service.querySalCharge(body);
      case '3': return (body) => this.tls2e090Service.querySalChargeCategory(body);
      default: return (body) => this.tls2e090Service.queryTls2e090(body);
    }
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;  // 控制一般專櫃 loading
      this.loading2 = true; // 控制自營專櫃 loading

      const rawValue = frm.getRawValue();
      const transformedBusClassList: string[][] = rawValue.bus_classList.map((item: any) => [item.bus_type || '', item.No || '']);

      const baseBody: Tls2e090QueryBody = {
        ...rawValue,
        sam_yyymm_Start: this.datePipe.transform(rawValue.sam_yyymm_Start, 'yyyyMM'),
        sam_yyymm_End: this.datePipe.transform(rawValue.sam_yyymm_End, 'yyyyMM'),
        bus_classList: transformedBusClassList,
        isNet: true,
        cash_yn: '',
      };

      const queryFn = this.getCurrentQueryFunction();
      const sw = rawValue.store_way;

      // 只有在選「全部」或「專櫃」時才打第一個 API
      if (sw === null || sw === '1') {
        queryFn({ ...baseBody, store_wayList: ['1'] })
          .pipe(untilDestroyed(this as any), finalize(() => this.loading = false))
          .subscribe(res => {
            this.data1 = res.Data;
            this.totalRecords1 = res.TotalCount;
            this.footerData1 = res.footerData?.[0] || null;
            this.lastQueryBody1 = { ...baseBody, store_wayList: ['1'] };
          });
      } else {
        this.loading = false;
      }

      // 只有在選「全部」或「自營」時才打第二個 API
      if (sw === null || sw === '2') {
        queryFn({ ...baseBody, store_wayList: ['2'] })
          .pipe(untilDestroyed(this as any), finalize(() => this.loading2 = false))
          .subscribe(res => {
            this.data2 = res.Data;
            this.totalRecords2 = res.TotalCount;
            this.footerData2 = res.footerData?.[0] || null;
            this.lastQueryBody2 = { ...baseBody, store_wayList: ['2'] };
          });
      } else {
        this.loading2 = false;
      }
    });
  }

  onExportPDF() {
    this.btnLoading = true;
    const bodies: { body: Tls2e090QueryBody; storeLabel: string }[] = [];
    if (this.lastQueryBody1) bodies.push({ body: this.lastQueryBody1, storeLabel: '專櫃' });
    if (this.lastQueryBody2) bodies.push({ body: this.lastQueryBody2, storeLabel: '自營' });
    if (bodies.length === 0) { this.btnLoading = false; return; }

    let pending = bodies.length;
    bodies.forEach(item => {
      const call$ = this.reportType === '1'
        ? this.tls2e090Service.exportTLS2E090PDF(item.body)
        : this.reportType === '2'
          ? this.tls2e090Service.exportTLS2E090SalChargePDF(item.body)
          : this.tls2e090Service.exportTLS2E090SalChargeCategoryPDF(item.body);

      call$.pipe(finalize(() => {
        pending -= 1;
        if (pending === 0) this.btnLoading = false;
      }), untilDestroyed(this)).subscribe(blob => {
        const stamp = this.datePipe.transform(new Date(), 'yyyyMMdd_HHmmss');
        const typeLabel = this.typeOptions.find(t => t.value === this.reportType)?.label || 'report';
        const filename = `${typeLabel}_${item.storeLabel}_${stamp}.pdf`;
        this.downloadBlob(blob, filename);
      });
    });
  }

  onExportExcel() {
    this.btnLoading2 = true;
    const bodies: { body: Tls2e090QueryBody; storeLabel: string }[] = [];
    if (this.lastQueryBody1) bodies.push({ body: this.lastQueryBody1, storeLabel: '專櫃' });
    if (this.lastQueryBody2) bodies.push({ body: this.lastQueryBody2, storeLabel: '自營' });
    if (bodies.length === 0) { this.btnLoading2 = false; return; }

    let pending = bodies.length;
    bodies.forEach(item => {
      const call$ = this.reportType === '1'
        ? this.tls2e090Service.exportTLS2E090(item.body)
        : this.reportType === '2'
          ? this.tls2e090Service.exportTLS2E090SalCharge(item.body)
          : this.tls2e090Service.exportTLS2E090SalChargeCategory(item.body);

      call$.pipe(finalize(() => {
        pending -= 1;
        if (pending === 0) this.btnLoading2 = false;
      }), untilDestroyed(this)).subscribe(blob => {
        const stamp = this.datePipe.transform(new Date(), 'yyyyMMdd_HHmmss');
        const typeLabel = this.typeOptions.find(t => t.value === this.reportType)?.label || 'report';
        const filename = `${typeLabel}_${item.storeLabel}_${stamp}.xlsx`;
        this.downloadBlob(blob, filename);
      });
    });
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}
