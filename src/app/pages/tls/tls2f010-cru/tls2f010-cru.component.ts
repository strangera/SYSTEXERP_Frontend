import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
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
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableValidationService } from '@shared/componentkit/table-edit/services/table-validation.service';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { formatDate, } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { combineLatest, distinctUntilChanged, finalize, map, shareReplay, startWith, switchMap } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TLS2F010TableReportComponent } from './tls2f010-table-report.component';
import { formatAmount, formatYYYYMM, ReportColumn } from './tls2f010-table-report.model';
@Component({
  selector: 'app-tls2f010-cru',
  templateUrl: './tls2f010-cru.component.html',
  standalone: true,
  imports: [TableEditComponent, NgIf, PanelModule, CalendarComponent, InputTextComponent, SelectButtonModule, TLS2F010TableReportComponent, InputNumberComponent, AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, CheckboxModule, TranslateModule]
})
export class TLS2F010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  @ViewChild('detailEdit') tableDetailEdit!: TableEditComponent;
  private readonly validationService = inject(TableValidationService);
  protected readonly cdr = inject(ChangeDetectorRef);
  dataForm = this.formBuilder.nonNullable.group({
    tlt_no: ['', [Validators.required]],
    sam_yyymm: [new Date(), [Validators.required]],
    money_type: [null],
    sam_termno: [1, [Validators.required]],
    COMM_YM: [new Date(), [Validators.required]],
    COMM_MONEY_TYPE: ['', [Validators.required]],
    PUR_GUIType: [null],
    PUR_GUINO: [''],
    PUR_GUIDate: [null],
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
    floor_no: [[]],
    ACP_GUIAmt: [null],
    CRT_Date: [null],
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
  ).pipe(shareReplay(1));
  vendorTLS2F010Options: { label: string; value: string }[] = [];
  tltOptionsList: { label: string; value: string }[] = [];
  isInsertDisable = false;
  // 當頁面顯示 "no - name" 時，保留原始的 tlt_no（送出時使用）
  private selectedTltNoRaw: string | null = null;

  private readonly tltNoData$ = ((): any => {
    const formatYm = (v: any): string => {
      if (!v) return '';
      const d = v instanceof Date ? v : new Date(v);
      if (isNaN(d.getTime())) {
        const s = String(v);
        return s.length === 6 && !isNaN(+s) ? s : '';
      }
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      return `${yyyy}${mm}`;
    };

    const ymControl = this.dataForm.controls.sam_yyymm as any;
    const commMoneyTypeControl = this.dataForm.controls.COMM_MONEY_TYPE as any;
    const source$ = combineLatest({
      ym: ymControl.valueChanges.pipe(startWith(ymControl.value)),
      type: commMoneyTypeControl.valueChanges.pipe(startWith(commMoneyTypeControl.value))
    }).pipe(
      map(({ ym, type }) => ({
        sam_yyymm: formatYm(ym),
        money_type: type
      })),
      distinctUntilChanged((prev, curr) =>
        prev.sam_yyymm === curr.sam_yyymm && prev.money_type === curr.money_type
      ),
      switchMap(params => this.tls2f010Service.queryTLS2F010_TLT_No({
        keyword: '',
        sam_yyymm: params.sam_yyymm || '',
        money_type: params.money_type || ''
      }))
    );
    return source$.pipe(shareReplay(1));
  })();

  tlt_noOptions = this.tltNoData$.pipe(
    map((res: any) => (res?.Data ?? []).map((item: any) => ({
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
  InvWayOptions = getSYS1000Options('Inv_Way');
  invoiceFormatOptions = [
    { value: '21', label: '21-進項三聯式、電子計算機統一發票' },
    { value: '22', label: '22-進項二聯式收銀機統一發票、載有稅額之其他憑證' },
    { value: '25', label: '25-進項三聯式收銀機統一發票及一般稅額計算之電子發票' },
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
  // snapshot 用於按下 Cancel 時還原 table-edit 的資料
  private originalDetailSnapshot: any[] | null = null;
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
      options: () => this.ven_noOptions,
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
    { field: 'GUINet', header: '未稅金額', type: 'inputNumber', width: '12rem', textAlign: 'right' },
    {
      field: 'GUITax', header: '稅額', type: 'inputNumber', width: '12rem', textAlign: 'right', minFractionDigits: 0, maxFractionDigits: 0, max: 999999999999, maxLength: 12,
      disabled: (_v, _i, row) => {
        // 單據別是收據，或是課稅別選免稅時，稅額要為0且disable
        const guiLabel = this.mapValueToLabel(this.invoiceTypeOptions, row?.GUIType);
        const isReceipt = (guiLabel ?? String(row?.GUIType ?? '')).includes('收據');
        const isTaxFree = String(row?.TAX_TYPE ?? '') === '0';

        return isReceipt || isTaxFree;
      },
      validate: [
        (value, rowData, _data, _field, header) => {
          const num = Number(value ?? 0);
          const net = Number(rowData?.GUINet ?? 0);
          const calculatedTax = Math.round(net * 0.05);
          if (Math.abs(num - calculatedTax) > 1) {
            return {
              isValid: false,
              errorMessage: [`差額 +1/-1`],
            };
          }

          return {
            isValid: true,
            errorMessage: [],
          };
        },
      ],
    },
    { field: 'GUIAmt', header: '應稅金額', type: 'inputNumber', width: '14rem', textAlign: 'right', disabled: () => true, minFractionDigits: 0, maxFractionDigits: 0, max: 999999999999, maxLength: 12 },
    { field: 'PUR_GUIPaper', header: '發票格式', type: 'dropdown', width: '180px', options: this.invoiceFormatOptions, optionLabel: 'label', optionValue: 'value', showClear: true },
    {
      field: 'INV_UseType',
      header: '發票用途',
      type: 'dropdown',
      width: '120px',
      options: this.InvWayOptions, optionLabel: 'label', optionValue: 'value', showClear: true
    },
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
      // 若後端在 rowdata 中帶入明細（Details / details），將其載入為 table-edit 的初始資料，並建立快照
      const backendDetails = row.Details ?? row.details ?? [];
      try {
        this.detailEditData = JSON.parse(JSON.stringify(backendDetails || []));
      } catch (e) {
        this.detailEditData = (backendDetails || []).slice();
      }
      // 若後端帶入 tlt_no 與 tlt_name，先保留原始 no，並把 control 顯示為 "no - name"
      try {
        if (row.tlt_no) {
          this.selectedTltNoRaw = row.tlt_no;
          const display = row.tlt_name ? `${row.tlt_no} - ${row.tlt_name}` : row.tlt_no;
          const ctrl = this.dataForm.controls.tlt_no;
          if (ctrl) ctrl.setValue(display, { emitEvent: false });
        }
      } catch (e) {
        // ignore
      }
      try {
        this.originalDetailSnapshot = JSON.parse(JSON.stringify(this.detailEditData || []));
      } catch (e) {
        this.originalDetailSnapshot = (this.detailEditData || []).slice();
      }
    }


    this.tltNoData$.pipe(
      map((res: any) => res?.Data ?? [])
    ).subscribe((data: any[]) => {
      this.vendorTLS2F010Options = (data ?? []).map((item: any) => ({
        label: `${item.ven_no}${item.VEN_Name ? ' - ' + item.VEN_Name : ''}`,
        value: item.ven_no,
      }));
      // 同步建立 tlt options list 用於顯示 tlt_no 的 label
      this.tltOptionsList = (data ?? []).map((item: any) => ({
        label: `${item.tlt_no}${item.tlt_name ? ' - ' + item.tlt_name : ''}`,
        value: item.tlt_no,
      }));
      // 如果先前從 rowdata 設定了原始 tlt_no，當選項載入時把顯示值更新為包含中文名稱
      try {
        const row = this.rowdata as any;
        if (row && row.tlt_no) {
          const found = (data ?? []).find((it: any) => it.tlt_no === row.tlt_no);
          const display = found ? `${found.tlt_no}${found.tlt_name ? ' - ' + found.tlt_name : ''}` : `${row.tlt_no}${row.tlt_name ? ' - ' + row.tlt_name : ''}`;
          const ctrl = this.dataForm.controls.tlt_no;
          if (ctrl) ctrl.setValue(display, { emitEvent: false });
          this.selectedTltNoRaw = row.tlt_no;
        }
      } catch (e) {
        // ignore
      }
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

    // 保存初始的 detailEditData snapshot（如果未來需還原）
    try {
      this.originalDetailSnapshot = JSON.parse(JSON.stringify(this.detailEditData || []));
    } catch (e) {
      this.originalDetailSnapshot = (this.detailEditData || []).slice();
    }

    // 編輯模式下：只允許特定欄位可編輯，其餘鎖定
    if (this.isFormEditable) {
      this.applyEditModeReadonly();
    }

    // 若在編輯/新增模式時允許在主表輸入未稅金額，當未稅金額變化時自動計算稅額與發票總額
    try {
      const guinetCtrl = this.dataForm.controls.ACP_GUINet as any;
      const taxCtrl = this.dataForm.controls.ACP_GUITax as any;
      const amtCtrl = this.dataForm.controls.ACP_GUIAmt as any;
      const taxTypeCtrl = this.dataForm.controls.PUR_TaxType as any;

      const isCurrentlyTaxable = () => {
        const raw = taxTypeCtrl && taxTypeCtrl.value != null ? taxTypeCtrl.value : null;
        const label = this.mapValueToLabel(this.taxTypeOptions, raw) ?? String(raw ?? '');
        return String(label).includes('應稅');
      };

      if (guinetCtrl && guinetCtrl.valueChanges) {
        guinetCtrl.valueChanges.pipe(untilDestroyed(this)).subscribe((v: any) => {
          const net = Number(v ?? 0);
          if (!isNaN(net)) {
            const tax = isCurrentlyTaxable() ? Math.round(net * 0.05) : 0;
            try {
              if (taxCtrl) taxCtrl.setValue(tax, { emitEvent: false });
              if (amtCtrl) amtCtrl.setValue(net + tax, { emitEvent: false });
            } catch (e) {
              // ignore
            }
          }
        });
      }

      // 當使用者修改稅額時更新發票總額（免稅時強制 0）
      if (taxCtrl && taxCtrl.valueChanges) {
        taxCtrl.valueChanges.pipe(untilDestroyed(this)).subscribe((tv: any) => {
          const taxVal = Number(tv ?? 0);
          const netVal = Number(guinetCtrl && guinetCtrl.value ? guinetCtrl.value : 0);
          if (!isNaN(taxVal) && !isNaN(netVal)) {
            if (!isCurrentlyTaxable()) {
              try { taxCtrl.setValue(0, { emitEvent: false }); } catch (e) { }
              if (amtCtrl) amtCtrl.setValue(netVal, { emitEvent: false });
            } else {
              if (amtCtrl) amtCtrl.setValue(netVal + taxVal, { emitEvent: false });
            }
          }
        });
      }

      // 課稅別變更時重新計算
      if (taxTypeCtrl && taxTypeCtrl.valueChanges) {
        taxTypeCtrl.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
          try {
            const netVal = Number(guinetCtrl && guinetCtrl.value ? guinetCtrl.value : 0);
            const tax = isCurrentlyTaxable() ? Math.round(netVal * 0.05) : 0;
            if (taxCtrl) taxCtrl.setValue(tax, { emitEvent: false });
            if (amtCtrl) amtCtrl.setValue(netVal + tax, { emitEvent: false });
          } catch (e) {
            // ignore
          }
        });
      }
    } catch (e) {
      // ignore
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
      'PUR_GUIDate',
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

    // 允許在編輯時輸入明細未稅金額（ACP_GUINet），並允許直接修改稅額欄位
    editableFields.add('ACP_GUINet');
    editableFields.add('ACP_GUITax');

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
    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
      return;
    }
    this.queryLoading = true;
    const formValue = this.dataForm.getRawValue();
    const params = {
      tlt_no: this.getRawTltNo(formValue.tlt_no),
      sam_yyymm: this.formatYearMonth(formValue.sam_yyymm),
      money_type: formValue.COMM_MONEY_TYPE,
      sam_termno: formValue.sam_termno,
    };
    this.tls2f010Service.queryTLS2F010InsertData(params)
      .subscribe({
        next: (res: any) => {
          const data = res?.Data ?? [];
          const mains = data.flatMap((item: any) => item?.Mains ?? []);
          const details = data.flatMap((item: any) => item?.Details ?? []);

          this.changeEditData = mains;
          this.sourceInvoiceData = details;

          this.checkIsInsertDisable(); // 如果已有請款年月，新增時不可存檔的判斷

          // 設定新增明細候選列的預設值（取自後端回傳的第一筆明細）
          const firstDetail = details[0] ?? null;
          const firstMain = mains[0] ?? null;
          const commYmValue = this.dataForm.controls.sam_yyymm.value;
          let defaultInvoiceDate: Date | null = null;

          if (commYmValue instanceof Date) {
            // 計算該年月的最後一天：設定為下個月的第 0 天
            defaultInvoiceDate = new Date(commYmValue.getFullYear(), commYmValue.getMonth() + 1, 0);
          } else {
            // 如果不是 Date 型別（例如是字串），則維持抓取當下月份月底作為 fallback
            defaultInvoiceDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
          }
          if (firstDetail || firstMain) {
            // TAX_TYPE 與 Deduct (Deduct_Code) 要找對應的 option value
            const taxVal = (this.taxTypeOptions ?? []).find((o: any) => String(o.label ?? '').includes('應稅'))?.value ?? '';
            const deductVal = (this.discountOptions ?? []).find((o: any) => String(o.label ?? '').includes('代表進項可扣抵'))?.value ?? '';
            // 優先取出 Details 中第一個有 ven_uniform 的值，若無則看 firstDetail，再 fallback 到 firstMain
            const defaultVenUniform = (details.find((d: any) => d?.ven_uniform) ?? firstDetail)?.ven_uniform ?? firstMain?.ven_uniform ?? '';
            const commYm = this.dataForm.controls.COMM_YM.value;
            let targetDate = null;
            if (commYm) {
              const year = commYm.getFullYear();
              const month = commYm.getMonth() + 1;
              const targetMonth = month % 2 === 0 ? month : month + 1;
              targetDate = new Date(year, targetMonth, 0);
            }
            this.detailDefaultInsert = {
              // 從 Mains 帶入 VEN_No
              VEN_No: firstMain?.ven_no != null ? String(firstMain?.ven_no) : (this.detailDefaultInsert?.VEN_No ?? ''),
              // 從後端 Details 或 Mains 帶入 ven_uniform
              ven_uniform: defaultVenUniform,
              // 不預設 PUR_GUINO
              PUR_GUINO: '',
              // 預設發票日期為當月最後一天
              PUR_GUIDate: defaultInvoiceDate,
              DEC_YM: targetDate || null, // 預設申報年月改雙數月
              // 預設單據別：若主表 (firstMain) 有 tlttalent.invoice_type 或 invoice_type，帶入該值
              GUIType: String(firstMain?.tlttalent?.invoice_type ?? firstMain?.invoice_type ?? ''),
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
          // 若後端只回傳單一 main，預設選取該筆以帶入 talent_id
          if (mains.length === 1 && !this.selectedMain) {
            this.selectedMain = mains[0];
            this.selectedMainItems = [mains[0]];
          }
          // 載入完成後儲存 detailEditData 快照，用於 Cancel 還原
          try {
            this.originalDetailSnapshot = JSON.parse(JSON.stringify(this.detailEditData || []));
          } catch (e) {
            this.originalDetailSnapshot = (this.detailEditData || []).slice();
          }
        },
        error: (err: any) => {
          this.queryLoading = false;
        },
        complete: () => {
          this.queryLoading = false;
        },
      });
  }
  /** 如果已有請款付款年月，新增時不可存檔的判斷 */
  private checkIsInsertDisable(): void {
    const formCommYm = this.formatYearMonth(this.dataForm.controls.COMM_YM.value);
    const dataCommYm = this.changeEditData[0]?.COMM_YM;

    // 確保都有值且相等時設為 true
    this.isInsertDisable = this.isFormCreateable && !!dataCommYm && (dataCommYm === formCommYm);
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
      PUR_GUIDate: this.formatDateOnly(formValue.PUR_GUIDate),
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
    console.log('[TLS2F010CRU] onSubmit called', { submitted: this.submitted, invalid: this.dataForm.invalid });

    // 若 backend/interface 仍使用 money_type，而 UI 使用 COMM_MONEY_TYPE，嘗試同步值以避免表單驗證失敗
    try {
      const commMoneyCtrl = this.dataForm.controls.COMM_MONEY_TYPE as any;
      const moneyCtrl = this.dataForm.controls.money_type as any;
      if (moneyCtrl && (moneyCtrl.value == null || moneyCtrl.value === '') && commMoneyCtrl) {
        const val = Array.isArray(commMoneyCtrl.value) && commMoneyCtrl.value.length ? commMoneyCtrl.value[0] : commMoneyCtrl.value;
        moneyCtrl.setValue(val, { emitEvent: false });
      }
    } catch (e) {
      console.warn('[TLS2F010CRU] sync money_type failed', e);
    }

    if (this.dataForm.invalid) {
      const controls = this.dataForm.controls as Record<string, any>;
      const invalidControls = Object.keys(controls).filter(k => controls[k] && controls[k].invalid);
      console.log('[TLS2F010CRU] form invalid', { invalidControls });
      this.messageService.errorBubble('表單驗證失敗，請檢查必填欄位');
      this.messageService.unblockUi();
      this.loading = false;
      return;
    }

    if (!this.isFormCreateable && !this.isFormEditable) {
      this.messageService.unblockUi();
      this.submitted = false;
      this.loading = false;
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
    const valid = this.tableDetailEdit?.validateAndShowErrors()
    // 驗證edit-table的資料，若有錯誤則不執行存檔
    if (!valid) {
      this.loading = false;
      this.submitted = false;
      return;
    }

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

    // 驗證：發票金額不得超過應付貨款，且若有應付貨款(免稅)則需包含免稅發票
    const mainForValidation = this.selectedMain ?? (this.changeEditData && this.changeEditData.length ? this.changeEditData[0] : null);
    if (mainForValidation) {
      // 1. 準備統計數據
      const newInvoices = details; // 新增單據資料
      const oldInvoices = this.sourceInvoiceData ?? []; // 已開立發票資料（中間table)

      // Helper: 計算總和
      const sumField = (arr: any[], field: string) => arr.reduce((s, d) => s + (Number(d[field] ?? 0)), 0);

      // 2. 加總所有欄位 (New + Old)
      const totalAmt = sumField(newInvoices, 'ACP_GUIAmt') + sumField(oldInvoices, 'ACP_GUIAmt');
      const totalTax = sumField(newInvoices, 'ACP_GUITax') + sumField(oldInvoices, 'ACP_GUITax');
      const totalNet = sumField(newInvoices, 'ACP_GUINet') + sumField(oldInvoices, 'ACP_GUINet');

      // 3. 驗證邏輯
      // A. 發票總額 vs 應付貨款總額 (sam_ap_amt 或 sam_ap_namt)
      const payableTotal = Number(mainForValidation.sam_ap_amt ?? mainForValidation.sam_ap_namt ?? 0);
      if (payableTotal > 0 && totalAmt > payableTotal) {
        this.messageService.errorBubble(`單據總額 (${totalAmt}) 不可超過應付貨款總額 (${payableTotal})`);
        this.loading = false; this.submitted = false; this.messageService.unblockUi();
        return;
      }

      // B. 稅額合計 vs sam_ap_tax
      const limitTax = Number(mainForValidation.sam_ap_tax ?? 0);
      if (limitTax > 0 && totalTax > limitTax) {
        this.messageService.errorBubble(`單據稅額合計 (${totalTax}) 不可超過營業稅 (${limitTax})`);
        this.loading = false; this.submitted = false; this.messageService.unblockUi();
        return;
      }

      // C. 未稅金額合計 vs sam_ap_namt
      const limitNet = Number(mainForValidation.sam_ap_namt ?? 0);
      if (limitNet > 0 && totalNet > limitNet) {
        this.messageService.errorBubble(`單據未稅金額合計 (${totalNet}) 不可超過廠商應開立發票額(收據) (${limitNet})`);
        this.loading = false; this.submitted = false; this.messageService.unblockUi();
        return;
      }

      // 4. 免稅發票檢查
      const noTaxPayable = Number(mainForValidation.sam_ap_notaxamt ?? 0);
      if (noTaxPayable > 0) {
        const allInvoices = [...details, ...(this.sourceInvoiceData ?? [])];
        const hasNoTaxInvoice = allInvoices.some((d: any) => {
          const label = this.mapValueToLabel(this.taxTypeOptions, d.PUR_TaxType);
          return (label ?? '').includes('免稅');
        });
        if (!hasNoTaxInvoice) {
          this.messageService.errorBubble('應付貨款(免稅)金額大於 0 時，需包含至少一筆免稅發票');
          this.messageService.unblockUi();
          this.loading = false;
          this.submitted = false;
          return;
        }
      }
    }

    const body = {
      sam_yyymm: this.formatYearMonth(formValue.sam_yyymm ?? formValue.COMM_YM),
      money_type: formValue.COMM_MONEY_TYPE ?? formValue.money_type ?? '',
      sam_termno: Number(formValue.sam_termno ?? 0),
      tlt_no: this.getRawTltNo(formValue.tlt_no) ?? '',
      // 優先使用選取的主資料的 talent_id，若無則 fallback 到 rowdata
      talent_id: (this.selectedMain && this.selectedMain.talent_id) ? this.selectedMain.talent_id : ((this.rowdata as any)?.talent_id ?? 0),
      COMM_YM: this.formatYearMonth(formValue.COMM_YM),
      details,
    };

    this.tls2f010Service.insertTLS2F010(body)
      .pipe(finalize(() => {
        this.loading = false;
        this.messageService.unblockUi();
        this.submitted = false;
      }))
      .subscribe({
        next: () => {
          this.messageService.successBubble('新增成功');
          this.onCancel();
        },
        error: (err: any) => {
          console.error('[TLS2F010CRU] insertTLS2F010 error', err);
          // 主要錯誤訊息交由全域 error handler 顯示，此處僅確保 UI 狀態正確
        }
      });
  }


  // table-edit 資料變更事件 — 先簡單同步到本地變數
  onChangeEditDataChange(data: any[]): void {
    this.changeEditData = data;
  }

  // 第一張表（主區）選取變更
  onChangeEditSelection(items: any): void {
    this.selectedMainItems = Array.isArray(items) ? items : (items ? [items] : []);
    this.selectedMain = (this.selectedMainItems && this.selectedMainItems.length) ? this.selectedMainItems[0] : null;
    // 當使用者選取主表時，同步 selectedMain 的一些欄位到新增單據的預設 insert 值
    try {
      if (this.selectedMain) {
        const m = this.selectedMain as any;
        this.detailDefaultInsert = {
          ...this.detailDefaultInsert,
          VEN_No: m?.ven_no != null ? String(m?.ven_no) : (this.detailDefaultInsert?.VEN_No ?? ''),
          ven_uniform: m?.ven_uniform ?? this.detailDefaultInsert?.ven_uniform ?? '',
          GUIType: String(m?.tlttalent?.invoice_type ?? m?.invoice_type ?? this.detailDefaultInsert?.GUIType ?? ''),
          DEC_YM: this.dataForm.controls.COMM_YM.value || null,
        };
      }
    } catch (e) {
      // ignore
    }
  }

  onDetailEditDataChange(data: any[]): void {
    this.detailEditData = data;
  }

  // 當點選 Cancel 時，由頁面層負責還原 table-edit 的資料快照，然後返回上一頁
  onLocalCancel(): void {
    // 先還原 table-edit 資料
    if (this.originalDetailSnapshot != null) {
      try {
        this.detailEditData = JSON.parse(JSON.stringify(this.originalDetailSnapshot));
      } catch (e) {
        this.detailEditData = (this.originalDetailSnapshot || []).slice();
      }
    } else {
      // 沒有快照則清空
      this.detailEditData = [];
    }
    // 若有選取主表也還原為空
    this.selectedMain = null;
    this.selectedMainItems = [];
    // 留在當前頁面（不顯示提示）
  }


  onDetailFieldChange(_event: any): void {
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
        // 收據沒有稅額
        const netVal = Number(row.GUINet ?? 0);
        row.GUITax = 0;
        row.GUIAmt = (isNaN(netVal) ? 0 : netVal);
      }
    }

    // 如果稅別選免稅 "0"，則強制扣抵代號為「代表進項不可扣抵之進貨及費用」，且稅額為 0
    if (ev.field === 'TAX_TYPE' && ev.value === '0') {
      const row = ev.rowData ?? {};
      let deductVal = this.mapLabelToValue(this.discountOptions, '代表進項不可扣抵之進貨及費用');
      if (deductVal == null) {
        const hit2 = (this.discountOptions ?? []).find((o: any) => String(o.label ?? '').includes('代表進項不可扣抵'));
        deductVal = hit2?.value ?? null;
      }
      row.Deduct_Code = deductVal ?? row.Deduct_Code;
      row.GUITax = 0; // 免稅時稅額為 0
      const netVal = Number(row.GUINet ?? 0);
      row.GUIAmt = (isNaN(netVal) ? 0 : netVal); // 免稅時總額 = 未稅金額
    }

    // 當未稅金額 (GUINet) 變更時，自動計算稅額與發票總額
    if (ev.field === 'GUINet') {
      const row = ev.rowData ?? {};
      const net = Number(ev.value ?? 0);
      if (!isNaN(net)) {
        // 只有在單據別為發票且課稅別為「應稅」時才計稅
        const guiLabel = this.mapValueToLabel(this.invoiceTypeOptions, row?.GUIType);
        const isReceipt = (guiLabel ?? '').includes('收據');
        const taxLabel = this.mapValueToLabel(this.taxTypeOptions, row?.TAX_TYPE ?? row?.PUR_TaxType);
        const isTaxable = (taxLabel ?? '').includes('應稅');
        const tax = (!isReceipt && isTaxable) ? Math.round(net * 0.05) : 0;
        row.GUITax = tax;
        row.GUIAmt = net + tax;

        // 重新計算稅額，解除稅額的+1/-1驗證錯誤（如果有的話）
        if (row._validationErrors) {
          delete row._validationErrors['GUITax'];
        }
        this.cdr.markForCheck();
      }
    }

    // 當稅額 (GUITax) 變更時，自動計算發票總額
    if (ev.field === 'GUITax') {
      const row = ev.rowData ?? {};
      const net = Number(row.GUINet ?? 0);
      const tax = Number(ev.value ?? 0);
      if (!isNaN(net) && !isNaN(tax)) {
        row.GUIAmt = net + tax;
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

  getTltLabel(value: any): string {
    if (!value) return '';
    const hit = (this.tltOptionsList ?? []).find(t => t.value === value);
    return hit ? hit.label : String(value);
  }

  // 由顯示值或緩存回推原始 tlt_no
  private getRawTltNo(displayOrValue: any): string | null {
    // 若已儲存原始值，優先回傳
    if (this.selectedTltNoRaw) return this.selectedTltNoRaw;
    if (displayOrValue == null) return null;
    const s = String(displayOrValue);
    // 若為 "no - name" 格式，取第一段為 no
    const m = s.match(/^([^\s-]+)\s*-\s*/);
    if (m && m[1]) return m[1];
    // 否則嘗試從 tltOptionsList 找對應 label
    const hit = (this.tltOptionsList ?? []).find(t => t.label === s || t.value === s);
    if (hit) return hit.value;
    return s;
  }
}

