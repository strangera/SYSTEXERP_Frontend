import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Tls2f010Service } from '@service/api/tls/tls2f010.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { RadiobuttonYNComponent } from '@shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { map } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { formatAmount, formatYYYYMM, ReportColumn } from './../../../shared/componentkit/table-report/table-report.model';
@Component({
  selector: 'app-tls2f010-cru',
  templateUrl: './tls2f010-cru.component.html',
  styleUrl: './tls2f010-cru.component.scss',
  standalone: true,
  imports: [TableComponent, TableEditComponent, NgIf, PanelModule, InputNumberRangeComponent, CalendarComponent, InputTextComponent, SelectButtonModule, TableReportComponent, InputNumberComponent, AsyncPipe, RadiobuttonYNComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, MultiSelectComponent, CheckboxModule, TranslateModule]
})
export class TLS2F010CRUComponent extends BasicCruPageComponent<any> implements OnInit {

  dataForm = this.formBuilder.nonNullable.group({
    tlt_no: ['', [Validators.required]],
    sam_yyymm: [null],
    money_type: [null],
    sam_termno: [null],
    COMM_YM: [null],
    COMM_MONEY_TYPE: [null],
  });

  taxTypeOptions = getSYS1000Options('PLU_TaxType');
  money_typeOptions = getSYS1000Options('money_type');
  sam_termnoOptions: { value: number, label: string }[] = []; // 期別選項

  totalRecords = 0;
  data: any[] = [];
  lastQueryBody: any = null;
  footerData: any = null;

  tlt_term_typeOptions = getSYS1000Options('tlt_term_type');
  ven_noOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
  vendorTLS2F010Options: { label: string; value: string }[] = [];

  tlt_noOptions = this.tls2f010Service.queryTLS2F010_TLT_No({
    PageSize: 0,
    PageIndex: 0,
    OrderBy: '',
    Offset: 0,
    SortBy: [],
    keyword: '',
  }).pipe(
    map(res => (res?.Data ?? []).map((item: any) => ({
      ...item,
      No: item.tlt_no,
      Name: item.tlt_name,
      VEN_No: item.ven_no,
      label: `${item.tlt_no} - ${item.tlt_name}`,
      value: item.tlt_no,
    })))
  );
  org_idOptions = this.dropdown.querySys3100();
  tlt_floorOptions = this.dropdown.querySys3900();
  tlt_buildingOptions = this.dropdown.querySys3800();
  bus_typeOptions = this.dropdown.queryTltBusType();
  bus_classOptions: IDropdownItem[] = [];
  invoiceTypeOptions = getSYS1000Options('invoice_type');
  queryLoading = false;

  // 控制查詢區與結果表格顯示
  showQueryArea = true;
  showResultTables = false;

  changeEditData: any[] = [];
  columns1: ReportColumn[] = [
    { field: 'sam_yyymm', header: '所屬結帳年月', visible: true, format: formatYYYYMM },
    { field: 'money_type_desc', header: '結帳方式', visible: true },
    { field: 'sam_termno', header: '帳次', visible: true },
    { field: 'ven_no', header: '廠商統一編號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
    { field: 'sam_ap_notaxamt', header: '應付貨款(免稅)', visible: true, format: formatAmount, align: 'right' },
    { field: 'sam_ap_namt', header: '廠商應開立發票額(收據)', visible: true, format: formatAmount, align: 'right' },
    { field: 'sam_ap_tax', header: '營業稅', visible: true, format: formatAmount, align: 'right' },
    { field: 'sam_ap_amt', header: '總額', visible: true, format: formatAmount, align: 'right' },
    { field: 'gui_copy', header: '廠商應開立發票張數', visible: true },
  ];

  sourceInvoiceData: any[] = [];
  columns2: Column[] = [
    { field: 'col-1', header: '單據別' },
    { field: 'col-2', header: '發票/收據編號' },
    { field: 'col-3', header: '發票/收據日期' },
    { field: 'col-4', header: '所屬結帳年月' },
    { field: 'col-5', header: '申報年月' },
    { field: 'col-1', header: '廠商統一編號' },
    { field: 'col-2', header: '課稅別' },
    { field: 'col-3', header: '扣抵代號' },
    { field: 'col-4', header: '發票用途' },
    { field: 'col-5', header: '發票總額' },
    { field: 'col-2', header: '未稅金額' },
    { field: 'col-3', header: '稅額' },
    { field: 'col-4', header: '發票格式' },
    { field: 'col-5', header: '發票/收據狀況' },
  ];

  detailEditData: any[] = [];
  columns3: EditColumn[] = [
    { field: 'GUIType', header: '單據別', type: 'dropdown', width: '200px', options: this.invoiceTypeOptions, optionLabel: 'label', optionValue: 'value', showClear: true },
    { field: 'VEN_No', header: '廠商編號', type: 'dropdown', width: '120px', options: () => this.vendorTLS2F010Options, optionLabel: 'label', optionValue: 'value', showClear: true },
    { field: 'PUR_GUINO', header: '發票/收據編號', type: 'input', width: '140px' },
    { field: 'PUR_GUIDate', header: '發票/收據日期', type: 'date', width: '200px', dateFormat: 'yy-mm-dd', view: 'date' },
    { field: 'DEC_YM', header: '申報年月', type: 'date', width: '120px', dateFormat: 'yy-mm', view: 'month' },
    { field: 'ven_uniform', header: '廠商統一編號', type: 'input', width: '140px' },
    { field: 'TAX_TYPE', header: '課稅別', type: 'input', width: '200px' },
    { field: 'Deduct_Code', header: '扣抵代號', type: 'input', width: '120px' },
    { field: 'GUINet', header: '未稅金額', type: 'inputNumber', width: '140px', textAlign: 'right' },
    { field: 'GUITax', header: '稅額', type: 'inputNumber', width: '200px', textAlign: 'right' },
    { field: 'GUIAmt', header: '應稅金額', type: 'inputNumber', width: '120px', textAlign: 'right' },
    { field: 'PUR_GUIPaper', header: '發票格式', type: 'input', width: '140px' },
    { field: 'INV_UseType', header: '發票用途', type: 'input', width: '140px' },
  ];

  constructor(
    private readonly dropdown: DropdownApiService,
    private readonly dropDownListService: DropDownListService,
    private readonly tls2f010Service: Tls2f010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2F010', this.dataForm);

    this.tls2f010Service.queryTLS2F010_TLT_No({
      PageSize: 0,
      PageIndex: 0,
      OrderBy: '',
      Offset: 0,
      SortBy: [],
      keyword: '',
    }).subscribe((res: any) => {
      const data = res?.Data ?? [];
      this.vendorTLS2F010Options = data.map((item: any) => ({
        label: item.ven_no,
        value: item.ven_no,
      }));
    });
  }

  private formatYearMonth(value: any): string {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) {
      const s = String(value);
      if (s.length === 6 && !isNaN(+s)) return s;
      return '';
    }
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${yyyy}${mm}`;
  }

  // 查詢並載入
  querySourceInvoice(): void {
    this.queryLoading = true;
    const formValue = this.dataForm.getRawValue();
    const params = {
      tlt_no: formValue.tlt_no,
      sam_yyymm: this.formatYearMonth(formValue.sam_yyymm),
      money_type: formValue.COMM_MONEY_TYPE,
      sam_termno: formValue.sam_termno,
      COMM_YM: this.formatYearMonth(formValue.COMM_YM),
    };

    this.tls2f010Service.queryTLS2F010InsertData(params)
      .subscribe({
        next: (res: any) => {
          const data = res?.Data ?? [];
          this.changeEditData = data;
          if (data.length > 0) {
            this.showQueryArea = false;
            this.showResultTables = true;
          }
        },
        complete: () => {
          this.queryLoading = false;
        },
      });
  }
  onSubmit(frm: any): void {
    this.handleSubmit(frm, () => {
      // this.ass11040Service.queryASS11040(frm.getRawValue()).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
      //   this.data = res.Data;
      //   this.totalRecords = res.TotalCount;
      //   this.lastQuery = frm.getRawValue();
      //   this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      // })
    })
  }

  // table-edit 資料變更事件 — 先簡單同步到本地變數
  onChangeEditDataChange(data: any[]): void {
    this.changeEditData = data;
  }

  onDetailEditDataChange(data: any[]): void {
    // this.detailEditData = data;
  }


  onDetailFieldChange(_event: any): void {
    // no-op
  }
}

