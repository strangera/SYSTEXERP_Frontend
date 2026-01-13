import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Tls2f010Service } from '@service/api/tls/tls2f010.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { Option } from '@service/utility/dropdown-api.model';
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
import { formatDate, } from '@shared/componentkit/table-report/table-report.model';
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
  imports: [TableEditComponent, NgIf, PanelModule, InputNumberRangeComponent, CalendarComponent, InputTextComponent, SelectButtonModule, TableReportComponent, InputNumberComponent, AsyncPipe, RadiobuttonYNComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, MultiSelectComponent, CheckboxModule, TranslateModule]
})
export class TLS2F010CRUComponent extends BasicCruPageComponent<any> implements OnInit {

  dataForm = this.formBuilder.nonNullable.group({
    tlt_no: ['', [Validators.required]],
    sam_yyymm: [null],
    money_type: [null],
    sam_termno: [null],
    COMM_YM: [null],
    COMM_MONEY_TYPE: [null],
    // 以下為從查詢頁帶入的條件，用於編輯模式顯示，不一定都參與送出
    PUR_GUIType: [null],
    PUR_GUINO: [''],
    PUR_GUIDate_From: [null],
    PUR_GUIDate_To: [null],
    PUR_TaxType: [[]],
    ACP_GUIAmt_From: [null],
    ACP_GUIAmt_To: [null],
    ACP_GUINet_From: [null],
    ACP_GUINet_To: [null],
    ACP_GUITax_From: [null],
    ACP_GUITax_To: [null],
    PUR_GUIPaper: [null],
    COMM_NUM_Start: [null],
    COMM_NUM_End: [null],
    CRT_USR_No: [''],
    CRT_Date_From: [null],
    CRT_Date_To: [null],
    floor_no: [[]],

    ven_uniform: [''],
    DEC_YM: [null],
    ACP_GUINet: [null],
    ACP_GUITax: [null],
    PUR_DiscNo: [''],
  });

  taxTypeOptions = getSYS1000Options('PLU_TaxType');
  money_typeOptions = getSYS1000Options('money_type');
  sam_termnoOptions: { value: number, label: string }[] = []; // 期別選項
  discountOptions: Option[] = getSYS1000Options('PUR_DiscNo');
  totalRecords = 0;
  data: any[] = [];
  lastQueryBody: any = null;
  footerData: any = null;

  tlt_term_typeOptions = getSYS1000Options('tlt_term_type');
  ven_noOptions = this.dropdown.queryPos2013({ VEN_Flag: '' }).pipe(
    map(list =>
      (list ?? []).map(item => ({
        label: `${item['No']} - ${item['Name']}`,
        value: item['No']
      }))
    )
  );
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
  invoiceFormatOptions = [
    { value: '21', label: '21/進項三聯式、電子計算機統一發票' },
    { value: '27', label: '27/彙總登陸每張稅額五百元以下之進項二聯式收銀機統一發票、載有稅額之其他憑證' },
  ];
  queryLoading = false;

  // 控制查詢區與結果表格顯示
  showQueryArea = true;
  showEditArea = false;
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
  columns2: ReportColumn[] = [
    { field: 'GUIType_desc', header: '單據別', visible: true },
    { field: 'PUR_GUINO', header: '發票/收據編號', visible: true },
    { field: 'PUR_GUIDate', header: '發票/收據日期', visible: true, format: formatDate },
    { field: 'sam_yyymm', header: '所屬結帳年月', visible: true, format: formatYYYYMM },
    { field: 'DEC_YM', header: '申報年月', visible: true, format: formatYYYYMM },
    { field: 'ven_uniform', header: '廠商統一編號', visible: true },
    { field: 'TaxType_desc', header: '課稅別', visible: true },
    { field: 'DiscNo_desc', header: '扣抵代號', visible: true },
    { field: 'Inv_Way_desc', header: '發票用途', visible: true },
    { field: 'ACP_GUIAmt', header: '發票總額', visible: true, format: formatAmount, align: 'right' },
    { field: 'ACP_GUINet', header: '未稅金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'ACP_GUITax', header: '稅額', visible: true, format: formatAmount, align: 'right' },
    { field: 'PUR_GUIPaper', header: '發票格式', visible: true, width: '40px' },
  ];
  footer2: any = null;

  detailEditData: any[] = [];
  columns3: EditColumn[] = [
    { field: 'GUIType', header: '單據別', type: 'dropdown', width: '200px', options: this.invoiceTypeOptions, optionLabel: 'label', optionValue: 'value', showClear: true },
    { field: 'VEN_No', header: '廠商編號', type: 'dropdown', width: '120px', options: () => this.vendorTLS2F010Options, optionLabel: 'label', optionValue: 'value', showClear: true },
    { field: 'PUR_GUINO', header: '發票/收據編號', type: 'input', width: '140px' },
    { field: 'PUR_GUIDate', header: '發票/收據日期', type: 'date', width: '200px', dateFormat: 'yy-mm-dd', view: 'date' },
    { field: 'DEC_YM', header: '申報年月', type: 'date', width: '120px', dateFormat: 'yy-mm', view: 'month' },
    { field: 'ven_uniform', header: '廠商統一編號', type: 'input', width: '140px' },
    { field: 'TAX_TYPE', header: '課稅別', type: 'dropdown', width: '200px', options: this.taxTypeOptions, optionLabel: 'label', optionValue: 'value', showClear: true },
    { field: 'Deduct_Code', header: '扣抵代號', type: 'dropdown', width: '120px', options: this.discountOptions, optionLabel: 'label', optionValue: 'value', showClear: true },
    { field: 'GUINet', header: '未稅金額', type: 'inputNumber', width: '140px', textAlign: 'right' },
    { field: 'GUITax', header: '稅額', type: 'inputNumber', width: '200px', textAlign: 'right' },
    { field: 'GUIAmt', header: '應稅金額', type: 'inputNumber', width: '120px', textAlign: 'right', disabled: () => true },
    { field: 'PUR_GUIPaper', header: '發票格式', type: 'dropdown', width: '140px', options: this.invoiceFormatOptions, optionLabel: 'label', optionValue: 'value', showClear: true },
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

    if (this.queryData) {
      this.dataForm.patchValue(this.queryData);
    }
    if (this.rowdata) {
      const row = this.rowdata as any;

      this.dataForm.patchValue({
        ...row,
        COMM_YM: this.ymToDate(row.COMM_YM),
        DEC_YM: this.ymToDate(row.DEC_YM),
        // 下拉要轉成 value
        PUR_GUIType: this.mapLabelToValue(this.invoiceTypeOptions, row.GUIType),
        TAX_TYPE: this.mapLabelToValue(this.taxTypeOptions, row.TAX_TYPE),
        COMM_MONEY_TYPE: this.mapLabelToValue(this.money_typeOptions, row.COMM_MONEY_TYPE),
        PUR_DiscNo: this.mapLabelToValue(this.discountOptions, row.PUR_DiscNo),
      });
    }


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

    // 決定顯示哪一塊畫面：
    // - 新增模式：顯示查詢區 + 查詢結果/新增單據
    // - 編輯/檢視模式：顯示從查詢頁帶入的條件區塊(showEditArea)，不再顯示查詢區與結果表
    if (this.isFormEditable || this.isFormReadable) {
      this.showQueryArea = false;
      this.showEditArea = true;
      this.showResultTables = false;
    } else {
      this.showEditArea = false;
    }

    // 編輯模式下：只允許特定欄位可編輯，其餘鎖定
    if (this.isFormEditable) {
      this.applyEditModeReadonly();
    }
  }

  /**
   * 編輯模式下鎖定欄位：只有以下欄位可編輯，其餘全部 disable（唯讀）
   * PUR_GUINO, PUR_GUIType, PUR_GUIDate_From, PUR_GUIDate_To,
   * PUR_TaxType, DEC_YM, ven_uniform,
   * ACP_GUINet_From, ACP_GUINet_To,
   * ACP_GUITax_From, ACP_GUITax_To,
   * PUR_GUIPaper
   */
  private applyEditModeReadonly(): void {
    const editableFields = new Set<string>([
      'PUR_GUINO',
      'PUR_GUIType',
      'PUR_GUIDate_From',
      'PUR_GUIDate_To',
      'PUR_TaxType',
      'DEC_YM',
      'ven_uniform',
      'ACP_GUINet_From',
      'ACP_GUINet_To',
      'ACP_GUITax_From',
      'ACP_GUITax_To',
      'PUR_GUIPaper',
      'PUR_DiscNo'
    ]);

    Object.keys(this.dataForm.controls).forEach(key => {
      const control = this.dataForm.get(key);
      if (!control) return;

      if (editableFields.has(key)) {
        control.enable({ emitEvent: false });
      } else {
        control.disable({ emitEvent: false });
      }
    });
  }
  // 下拉選單的 label/value 轉換
  private mapLabelToValue(
    options: { label: string; value: any }[],
    raw: any
  ): any {
    if (raw == null) return null;
    const hit = options.find(o => o.value === raw || o.label === raw);
    return hit?.value ?? null;
  }
  // yyyyMM 字串轉 Date
  private ymToDate(value: string): Date | null {
    if (!value || value.length !== 6) return null;
    const y = +value.substring(0, 4);
    const m = +value.substring(4, 6) - 1;
    return new Date(y, m, 1);
  }
  // Date 轉 yyyy-MM-dd 字串
  private formatDateOnly(value: any): string {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  // Date 轉 yyyyMM 字串
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
          const mains = data.flatMap((item: any) => item?.Mains ?? []);
          const details = data.flatMap((item: any) => item?.Details ?? []);

          this.changeEditData = mains;
          this.sourceInvoiceData = details;

          // 取出未登錄餘額(免稅/含稅)做為第二個表格的 footer 總計（只在 footer 顯示，不當成欄位）
          if (data.length > 0) {
            const first = data[0];
            this.footer2 = {
              UnPostedAmt_NoTax: formatAmount(first.UnPostedAmt_NoTax ?? 0),
              UnPostedAmt_WithTax: formatAmount(first.UnPostedAmt_WithTax ?? 0),
            };
          } else {
            this.footer2 = null;
          }

          if (mains.length > 0 || details.length > 0) {
            this.showQueryArea = false;
            this.showResultTables = true;
          }
        },
        complete: () => {
          this.queryLoading = false;
        },
      });
  }
  private buildUpdateParams(): any {
    const formValue = this.dataForm.getRawValue();
    const row = this.rowdata as any;

    const net = Number(formValue.ACP_GUINet ?? 0);
    const tax = Number(formValue.ACP_GUITax ?? 0);
    const amt = net + tax;

    return {
      id: row?.id ?? 0,

      PUR_GUIType: formValue.PUR_GUIType ?? '',
      PUR_GUINO: formValue.PUR_GUINO ?? '',
      PUR_GUIDate: this.formatDateOnly(formValue.PUR_GUIDate_From),
      DEC_YM: this.formatYearMonth(formValue.DEC_YM),
      ven_uniform: formValue.ven_uniform ?? '',
      PUR_TaxType: Array.isArray(formValue.PUR_TaxType)
        ? formValue.PUR_TaxType[0] ?? ''
        : formValue.PUR_TaxType ?? '',
      PUR_DiscNo: formValue.PUR_DiscNo ?? '',
      ACP_GUINet: net,
      ACP_GUITax: tax,
      ACP_GUIAmt: amt,
      PUR_GUIPaper: String(formValue.PUR_GUIPaper ?? ''),
    };
  }

  onSubmit(frm: any): void {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      this.loading = false;
      return;
    }

    if (!this.isFormCreateable && !this.isFormEditable) {
      this.messageService.unblockUi();
      this.submitted = false;
      return;
    }

    this.loading = true;

    // 編輯模式
    if (this.isFormEditable) {
      const params = this.buildUpdateParams();

      this.tls2f010Service.updateTLS2F010(params).subscribe({
        next: () => {
          this.messageService.successBubble('更新成功');
          this.onCancel();
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
          this.submitted = false;
        },
      });
      return;
    }

    // 新增模式
    const effectiveDetails = (this.detailEditData || []).filter(row => {
      if (row._isAutoInsertCandidate) return false;
      const status = row.status ?? row._dataStatus;
      return status !== 'deleted';
    });

    if (effectiveDetails.length === 0) {
      this.messageService.errorBubble('請至少輸入一筆新增單據明細');
      this.messageService.unblockUi();
      this.loading = false;
      this.submitted = false;
      return;
    }

    const formValue = this.dataForm.getRawValue();

    const details = effectiveDetails.map((row: any) => {
      const net = Number(row.GUINet ?? 0);
      const tax = Number(row.GUITax ?? 0);
      const amt = row.GUIAmt != null ? Number(row.GUIAmt) : net + tax;
      return {
        PUR_GUIType: row.GUIType ?? '',
        ven_no: row.VEN_No ?? '',
        PUR_GUINO: row.PUR_GUINO ?? '',
        PUR_GUIDate: this.formatDateOnly(row.PUR_GUIDate),
        DEC_YM: this.formatYearMonth(row.DEC_YM),
        ven_uniform: row.ven_uniform ?? '',
        PUR_TaxType: row.TAX_TYPE ?? '',
        PUR_DiscNo: row.Deduct_Code ?? '',
        ACP_GUINet: net,
        ACP_GUITax: tax,
        ACP_GUIAmt: amt,
        PUR_GUIPaper: row.PUR_GUIPaper != null ? String(row.PUR_GUIPaper) : '',
        Inv_Way: row.INV_UseType ?? '',
      };
    });

    const body = {
      sam_yyymm: this.formatYearMonth(formValue.sam_yyymm ?? formValue.COMM_YM),
      money_type: formValue.COMM_MONEY_TYPE ?? formValue.money_type ?? '',
      sam_termno: Number(formValue.sam_termno ?? 0),
      tlt_no: formValue.tlt_no ?? '',
      talent_id: (this.rowdata as any)?.talent_id ?? 0,
      details,
    };

    this.tls2f010Service.insertTLS2F010(body).subscribe({
      next: () => {
        this.messageService.successBubble('新增成功');
        this.onCancel();
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
        this.submitted = false;
      },
    });
  }


  // table-edit 資料變更事件 — 先簡單同步到本地變數
  onChangeEditDataChange(data: any[]): void {
    this.changeEditData = data;
  }

  onDetailEditDataChange(data: any[]): void {
    this.detailEditData = data;
  }


  onDetailFieldChange(_event: any): void {
    // no-op
  }
}

