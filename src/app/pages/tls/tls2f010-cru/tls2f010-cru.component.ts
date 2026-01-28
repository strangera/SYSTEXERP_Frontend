import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
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
  standalone: true,
  imports: [TableEditComponent, NgIf, PanelModule, InputNumberRangeComponent, CalendarComponent, InputTextComponent, SelectButtonModule, TableReportComponent, InputNumberComponent, AsyncPipe, RadiobuttonYNComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, MultiSelectComponent, CheckboxModule, TranslateModule]
})
export class TLS2F010CRUComponent extends BasicCruPageComponent<any> implements OnInit {

  dataForm = this.formBuilder.nonNullable.group({
    tlt_no: ['', [Validators.required]],
    sam_yyymm: [new Date()],
    money_type: [null],
    sam_termno: [1],
    COMM_YM: [new Date()],
    COMM_MONEY_TYPE: [''],
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
  // 完整的期別選項映射（可依 money type 產生不同期數）
  private readonly SAM_TERMNO_MAP = {
    '10': [1, 2, 3],
    '15': [1, 2],
    '30': [1]
  };
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
  // 已選取的主表項（供新增時決定 talent_id）
  selectedMainItems: any[] = [];
  selectedMain: any | null = null;
  columns1: ReportColumn[] = [
    { field: 'sam_yyymm', header: '所屬結帳年月', visible: true, format: formatYYYYMM },
    { field: 'money_type_desc', header: '結帳方式', visible: true },
    { field: 'sam_termno', header: '帳次', visible: true },
    {
      field: 'ven_no', header: '廠商統一編號', visible: true, format: (_v: any, _i?: number, rowData?: any) => {
        const no = rowData?.ven_no ?? '';
        const name = rowData?.VEN_Name ?? rowData?.ven_name ?? '';
        return name ? `${no} - ${name}` : no;
      }
    },
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
  detailDefaultInsert: any = {};
  columns3: EditColumn[] = [
    { field: 'GUIType', header: '單據別', type: 'dropdown', width: '120px', options: this.invoiceTypeOptions, optionLabel: 'label', optionValue: 'value', showClear: true },
    { field: 'VEN_No', header: '廠商編號', type: 'dropdown', width: '200px', options: () => this.vendorTLS2F010Options, optionLabel: 'label', optionValue: 'value', showClear: true },
    { field: 'PUR_GUINO', header: '發票/收據編號', type: 'input', width: '140px' },
    { field: 'PUR_GUIDate', header: '發票/收據日期', type: 'date', width: '120px', dateFormat: 'yy-mm-dd', view: 'date' },
    { field: 'DEC_YM', header: '申報年月', type: 'date', width: '120px', dateFormat: 'yy-mm', view: 'month' },
    {
      field: 'ven_uniform',
      header: '廠商統一編號',
      type: 'dropdown',
      width: '200px',
      options: () => this.dropdown.queryPos2013({ VEN_Flag: '' }).pipe(
        map(list => (list ?? []).map(item => ({
          label: `${item['No']} - ${item['Name']}`,
          value: item['No'],
        })))
      ),
      optionLabel: 'label',
      optionValue: 'value',
      showClear: true,
      optionsAsync: true,
    },
    {
      field: 'TAX_TYPE', header: '課稅別', type: 'dropdown', width: '120px', options: this.taxTypeOptions, optionLabel: 'label', optionValue: 'value', showClear: true,
      disabled: (_v, _i, row) => {
        const guiLabel = this.mapValueToLabel(this.invoiceTypeOptions, row?.GUIType);
        return (guiLabel ?? String(row?.GUIType ?? '')).includes('收據');
      }
    },
    {
      field: 'Deduct_Code', header: '扣抵代號', type: 'dropdown', width: '180px', options: this.discountOptions, optionLabel: 'label', optionValue: 'value', showClear: true,
      disabled: (_v, _i, row) => {
        const guiLabel = this.mapValueToLabel(this.invoiceTypeOptions, row?.GUIType);
        return (guiLabel ?? String(row?.GUIType ?? '')).includes('收據');
      }
    },
    { field: 'GUINet', header: '未稅金額', type: 'inputNumber', width: '120px', textAlign: 'right' },
    { field: 'GUITax', header: '稅額', type: 'inputNumber', width: '120px', textAlign: 'right' },
    { field: 'GUIAmt', header: '應稅金額', type: 'inputNumber', width: '120px', textAlign: 'right', disabled: () => true },
    { field: 'PUR_GUIPaper', header: '發票格式', type: 'dropdown', width: '180px', options: this.invoiceFormatOptions, optionLabel: 'label', optionValue: 'value', showClear: true },
    { field: 'INV_UseType', header: '發票用途', type: 'input', width: '120px' },
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

    // 若未帶入 COMM_MONEY_TYPE，預設為「月結」（參考其他元件使用的 index）
    const commCtrlInit = this.dataForm.controls.COMM_MONEY_TYPE;
    if (!commCtrlInit.value && this.money_typeOptions && this.money_typeOptions[2]) {
      commCtrlInit.setValue(this.money_typeOptions[2].value);
    }

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
        label: `${item.ven_no}${item.VEN_Name ? ' - ' + item.VEN_Name : ''}`,
        value: item.ven_no,
      }));
    });

    // 綁定 COMM_MONEY_TYPE 變化以更新 sam_termnoOptions
    const commCtrl = this.dataForm.controls.COMM_MONEY_TYPE as any;
    commCtrl.valueChanges?.pipe?.(untilDestroyed(this)).subscribe((val: any) => {
      const moneyType = Array.isArray(val) && val.length ? String(val[0]) : (val == null ? null : String(val));
      this.updateSamTermnoOptions(moneyType);
      // 預設帳次為 1
      this.dataForm.controls.sam_termno.setValue(1);
    });
    // 初始值處理
    const initVal = commCtrl.value as any;
    const initMoney = Array.isArray(initVal) && initVal.length ? String(initVal[0]) : (initVal == null ? null : String(initVal));
    if (initMoney) this.updateSamTermnoOptions(initMoney);

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

  private updateSamTermnoOptions(moneyType: string | null): void {
    if (moneyType && this.SAM_TERMNO_MAP[moneyType as keyof typeof this.SAM_TERMNO_MAP]) {
      const termNumbers = this.SAM_TERMNO_MAP[moneyType as keyof typeof this.SAM_TERMNO_MAP];
      this.sam_termnoOptions = termNumbers.map(num => ({ label: `${num}`, value: num }));
    } else {
      this.sam_termnoOptions = [];
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

          // 設定新增明細候選列的預設值（取自後端回傳的第一筆明細）
          const firstDetail = details[0] ?? null;
          const firstMain = mains[0] ?? null;
          if (firstDetail || firstMain) {
            // TAX_TYPE 與 Deduct (Deduct_Code) 要找對應的 option value
            const taxVal = (this.taxTypeOptions ?? []).find((o: any) => String(o.label ?? '').includes('應稅'))?.value ?? '';
            const deductVal = (this.discountOptions ?? []).find((o: any) => String(o.label ?? '').includes('代表進項可扣抵'))?.value ?? '';

            this.detailDefaultInsert = {
              // 從 Mains 帶入 VEN_No
              VEN_No: firstMain?.ven_no ?? '',
              // 從 Details 帶入 ven_uniform
              ven_uniform: firstDetail?.ven_uniform ?? '',
              // 不預設 PUR_GUINO
              PUR_GUINO: '',
              // 預設發票日期/申報年月（若後端有提供）
              PUR_GUIDate: firstDetail?.PUR_GUIDate ? new Date(firstDetail.PUR_GUIDate) : null,
              DEC_YM: firstDetail?.DEC_YM ? this.ymToDate(firstDetail.DEC_YM) : null,
              // 預設課稅別為「應稅」
              TAX_TYPE: taxVal,
              // 預設扣抵代號為「代表進項可扣抵之進貨及費用」
              Deduct_Code: deductVal,
              // 預設發票格式為 21
              PUR_GUIPaper: '21',
            };
          } else {
            this.detailDefaultInsert = {};
          }
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
        error: (err: any) => {
          this.queryLoading = false;
          try {
            this.messageService.errorBubble(err?.Message ?? err?.message ?? '查詢失敗');
          } catch (e) {
            // 若 messageService 不可用，忽略
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

    // 若主區有多筆資料，要求先選取一筆主資料（selectedMain）才能新增明細
    if ((this.changeEditData?.length ?? 0) > 1 && !this.selectedMain) {
      this.messageService.errorBubble('此區有多筆主資料，請先選取一筆主資料再進行新增明細');
      this.messageService.unblockUi();
      this.loading = false;
      this.submitted = false;
      return;
    }

    const body = {
      sam_yyymm: this.formatYearMonth(formValue.sam_yyymm ?? formValue.COMM_YM),
      money_type: formValue.COMM_MONEY_TYPE ?? formValue.money_type ?? '',
      sam_termno: Number(formValue.sam_termno ?? 0),
      tlt_no: formValue.tlt_no ?? '',
      // 優先使用選取的主資料的 talent_id，若無則 fallback 到 rowdata
      talent_id: (this.selectedMain && this.selectedMain.talent_id) ? this.selectedMain.talent_id : ((this.rowdata as any)?.talent_id ?? 0),
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

  // 第一張表（主區）選取變更
  onChangeEditSelection(items: any[]): void {
    this.selectedMainItems = items ?? [];
    this.selectedMain = (this.selectedMainItems && this.selectedMainItems.length) ? this.selectedMainItems[0] : null;
  }

  onDetailEditDataChange(data: any[]): void {
    this.detailEditData = data;
  }


  onDetailFieldChange(_event: any): void {
    // event payload: { rowData, field, value, index }
    const ev = _event as { rowData: any, field: string, value: any, index?: number };
    if (!ev || !ev.field) return;

    // 當單據別 (GUIType) 變成「收據」時，自動把課稅別設為「免稅」，扣抵代號設為「代表進項不可扣抵之進貨及費用」
    if (ev.field === 'GUIType') {
      const row = ev.rowData ?? {};
      const guiLabel = this.mapValueToLabel(this.invoiceTypeOptions, ev.value);
      const isReceipt = (guiLabel ?? String(ev.value ?? '')).includes('收據');

      if (isReceipt) {
        let taxVal = this.mapLabelToValue(this.taxTypeOptions, '免稅');
        if (taxVal == null) {
          const hit = (this.taxTypeOptions ?? []).find((o: any) => String(o.label ?? '').includes('免稅'));
          taxVal = hit?.value ?? null;
        }
        let deductVal = this.mapLabelToValue(this.discountOptions, '代表進項不可扣抵之進貨及費用');
        if (deductVal == null) {
          const hit2 = (this.discountOptions ?? []).find((o: any) => String(o.label ?? '').includes('代表進項不可扣抵'));
          deductVal = hit2?.value ?? null;
        }
        // 設定欄位值（若 table-edit 使用的是同一物件則畫面會自動更新）
        row.TAX_TYPE = taxVal ?? row.TAX_TYPE;
        row.Deduct_Code = deductVal ?? row.Deduct_Code;
      }
    }
  }

  // 由 value 取得對應的 label（若找不到就回傳 undefined）
  private mapValueToLabel(options: { label: string, value: any }[] | any, raw: any): string | undefined {
    if (!options) return undefined;
    const list = Array.isArray(options) ? options : (typeof options === 'function' ? options(null) : []);
    const hit = (list ?? []).find((o: any) => o?.value === raw || o?.label === raw);
    return hit?.label;
  }
}

