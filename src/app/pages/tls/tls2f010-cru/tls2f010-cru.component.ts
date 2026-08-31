import { AsyncPipe, DatePipe, NgIf } from '@angular/common'; // 1. 引入 DatePipe
import { ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls2f010Service } from '@service/api/tls/tls2f010.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { IDropdownItem } from '@service/utility/dropDownList.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { validateRequired } from '@shared/components/table-edit/validate-field.model';
import { formatDate } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { combineLatest, distinctUntilChanged, finalize, map, shareReplay, startWith, switchMap } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { TLS2F010TableReportComponent } from './tls2f010-table-report.component';
import { formatAmount, formatYYYYMM, ReportColumn } from './tls2f010-table-report.model';

@Component({
  selector: 'app-tls2f010-cru',
  templateUrl: './tls2f010-cru.component.html',
  styles: [`
    /* PrimeNG editable dropdown 找不到 mapping 的選項時，label() 會 fallback 回傳 placeholder 字串，
       導致套用 p-placeholder 灰色樣式，但實際顯示的是使用者手打的文字，這裡強制蓋回正常文字色 */
    :host ::ng-deep .ven-uniform-dropdown .p-dropdown-label.p-placeholder {
      color: var(--text-color) !important;
      opacity: 1 !important;
    }
  `],
  standalone: true,
  imports: [TableEditComponent, NgIf, PanelModule, CalendarComponent, InputTextComponent, SelectButtonModule, TLS2F010TableReportComponent, InputNumberComponent, AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, DropdownModule, InputTextModule, CheckboxModule, TranslateModule],
  providers: [DatePipe] // 2. 注入 DatePipe 服務
})
export class TLS2F010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  @ViewChild('detailEdit') tableDetailEdit!: TableEditComponent;
  protected readonly cdr = inject(ChangeDetectorRef);
  private readonly datePipe = inject(DatePipe); // 3. 使用 inject 取得 DatePipe 實例

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
  taxTypeOptions = getSYS1000Options('PUR_TaxType');
  money_typeOptions = getSYS1000Options('money_type');
  discountOptions: Option[] = getSYS1000Options('PUR_DiscNo');
  tlt_term_typeOptions = getSYS1000Options('tlt_term_type');
  invoiceTypeOptions = getSYS1000Options('invoice_type');
  InvWayOptions = getSYS1000Options('Inv_Way');
  sam_termnoOptions: { value: number, label: string }[] = [];
  ven_noOptions = this.dropdown.queryPos2013({ VEN_Flag: '' }).pipe(
    map(list => (list ?? []).map(item => ({ label: `${item['No']} - ${item['Name']}`, value: item['No'] })))
  ).pipe(shareReplay(1));
  venNoOptionsList: { label: string; value: string }[] = [];
  vendorTLS2F010Options: { label: string; value: string }[] = [];
  tltOptionsList: { label: string; value: string }[] = [];
  private readonly SAM_TERMNO_MAP = { '10': [1, 2, 3], '15': [1, 2], '30': [1] };
  private readonly tltNoData$ = ((): any => {
    const ymControl = this.dataForm.controls.sam_yyymm as any;
    const commMoneyTypeControl = this.dataForm.controls.COMM_MONEY_TYPE as any;
    const source$ = combineLatest({
      ym: ymControl.valueChanges.pipe(startWith(ymControl.value)),
      type: commMoneyTypeControl.valueChanges.pipe(startWith(commMoneyTypeControl.value))
    }).pipe(
      map(({ ym, type }) => ({
        sam_yyymm: this.datePipe.transform(ym as any, 'yyyyMM') || '',
        money_type: type
      })),
      distinctUntilChanged((prev, curr) => prev.sam_yyymm === curr.sam_yyymm && prev.money_type === curr.money_type),
      switchMap(params => this.tls2f010Service.queryTLS2F010_TLT_No({ keyword: '', sam_yyymm: params.sam_yyymm || '', money_type: params.money_type || '' }))
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
  bus_classOptions: IDropdownItem[] = [];
  invoiceFormatOptions = [
    { value: '21', label: '21-進項三聯式、電子計算機統一發票' },
    { value: '22', label: '22-進項二聯式收銀機統一發票、載有稅額之其他憑證' },
    { value: '25', label: '25-進項三聯式收銀機統一發票及一般稅額計算之電子發票' },
  ];
  org_idOptions = this.dropdown.querySys3100();
  tlt_floorOptions = this.dropdown.querySys3900();
  tlt_buildingOptions = this.dropdown.querySys3800();
  bus_typeOptions = this.dropdown.queryTltBusType();

  totalRecords = 0;
  data: any[] = [];
  lastQueryBody: any = null;
  footerData: any = null;
  isInsertDisable = false;
  private selectedTltNoRaw: string | null = null;

  queryLoading = false;
  showQueryArea = true;
  showEditArea = false;
  showResultTables = false;
  changeEditData: any[] = [];
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
  private originalDetailSnapshot: any[] | null = null;

  columns3: EditColumn[] = [
    { field: 'GUIType', header: '單據別', type: 'dropdown', width: '120px', options: this.invoiceTypeOptions, optionLabel: 'label', optionValue: 'value', showClear: true, required: true, validate: [validateRequired] },
    { field: 'VEN_No', header: '廠商編號', type: 'dropdown', width: '200px', options: () => this.vendorTLS2F010Options, optionLabel: 'label', optionValue: 'value', showClear: true },
    { field: 'PUR_GUINO', header: '發票/收據編號', type: 'input', width: '140px', required: true, validate: [validateRequired] },
    { field: 'PUR_GUIDate', header: '發票/收據日期', type: 'date', width: '120px', dateFormat: 'yy-mm-dd', view: 'date', required: true, validate: [validateRequired] },
    { field: 'DEC_YM', header: '申報年月', type: 'date', width: '120px', dateFormat: 'yy-mm', view: 'month', required: true, validate: [validateRequired] },
    { field: 'ven_uniform', header: '廠商統一編號', type: 'dropdown', width: '200px', options: () => this.ven_noOptions, optionLabel: 'label', optionValue: 'value', showClear: true, optionsAsync: true, required: true, validate: [validateRequired] },
    {
      field: 'TAX_TYPE', header: '課稅別', type: 'dropdown', width: '120px', options: this.taxTypeOptions, optionLabel: 'label', optionValue: 'value', showClear: true, required: true, validate: [validateRequired], disabled: (_v, _i, row) => {
        const guiLabel = this.mapValueToLabel(this.invoiceTypeOptions, row?.GUIType);
        return (guiLabel ?? String(row?.GUIType ?? '')).includes('收據');
      }
    },
    {
      field: 'Deduct_Code', header: '扣抵代號', type: 'dropdown', width: '180px', options: this.discountOptions, optionLabel: 'label', optionValue: 'value', showClear: true, disabled: (_v, _i, row) => {
        const guiLabel = this.mapValueToLabel(this.invoiceTypeOptions, row?.GUIType);
        return (guiLabel ?? String(row?.GUIType ?? '')).includes('收據');
      }
    },
    {
      field: 'GUINet', header: '未稅金額', type: 'inputNumber', width: '12rem', textAlign: 'right',
      required: true, validate: [validateRequired],
    },
    {
      field: 'GUITax', header: '稅額', type: 'inputNumber', width: '12rem', textAlign: 'right', minFractionDigits: 0, maxFractionDigits: 0, max: 999999999999, maxLength: 12, disabled: (_v, _i, row) => {
        const guiLabel = this.mapValueToLabel(this.invoiceTypeOptions, row?.GUIType);
        const isReceipt = (guiLabel ?? String(row?.GUIType ?? '')).includes('收據');
        const taxLabel = this.mapValueToLabel(this.taxTypeOptions, row?.TAX_TYPE);
        const isTaxFree = !(taxLabel ?? '').includes('應稅');
        return isReceipt || isTaxFree;
      },
      validate: [
        (value, rowData, _data, _field, header) => {
          const guiLabel = this.mapValueToLabel(this.invoiceTypeOptions, rowData?.GUIType);
          const isReceipt = (guiLabel ?? String(rowData?.GUIType ?? '')).includes('收據');
          const taxLabel = this.mapValueToLabel(this.taxTypeOptions, rowData?.TAX_TYPE);
          const isTaxFree = (taxLabel ?? '').includes('免稅');
          const isTaxable = (taxLabel ?? '').includes('應稅');
          if (isReceipt || isTaxFree || !isTaxable) {
            return { isValid: true, errorMessage: [], };
          }
          const num = Number(value ?? 0);
          const net = Number(rowData?.GUINet ?? 0);
          const calculatedTax = Math.round(net * 0.05);
          if (Math.abs(num - calculatedTax) > 1) {
            return { isValid: false, errorMessage: [`差額 +1/-1`], };
          }
          return { isValid: true, errorMessage: [], };
        },
      ],
    },
    { field: 'GUIAmt', header: '應稅金額', type: 'inputNumber', width: '14rem', textAlign: 'right', disabled: () => true, minFractionDigits: 0, maxFractionDigits: 0, max: 999999999999, maxLength: 12 },
    {
      field: 'PUR_GUIPaper', header: '發票格式', type: 'dropdown', width: '180px', options: this.invoiceFormatOptions, optionLabel: 'label', optionValue: 'value', showClear: true, required: true, validate: [validateRequired], disabled: (_v, _i, row) => {
        const guiLabel = this.mapValueToLabel(this.invoiceTypeOptions, row?.GUIType);
        return (guiLabel ?? String(row?.GUIType ?? '')).includes('收據');
      }
    },
    { field: 'INV_UseType', header: '發票用途', type: 'dropdown', width: '120px', options: this.InvWayOptions, optionLabel: 'label', optionValue: 'value', showClear: true },
  ];

  constructor(
    private readonly dropdown: DropdownApiService,
    private readonly tls2f010Service: Tls2f010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2F010', this.dataForm);
    this.ven_noOptions.subscribe(list => this.venNoOptionsList = list ?? []);
    const commCtrlInit = this.dataForm.controls.COMM_MONEY_TYPE;
    if (!commCtrlInit.value && this.money_typeOptions && this.money_typeOptions[2]) {
      commCtrlInit.setValue(this.money_typeOptions[2].value);
    }
    if (this.queryData) {
      this.dataForm.patchValue(this.queryData);
    }
    if (this.rowdata) {
      const row = this.rowdata as any;
      const parseYm = (ymStr: string) => {
        if (!ymStr || ymStr.length !== 6) return null;
        return new Date(+ymStr.substring(0, 4), +ymStr.substring(4, 6) - 1, 1);
      };

      this.dataForm.patchValue({
        ...row,
        COMM_YM: parseYm(row.COMM_YM),
        DEC_YM: parseYm(row.DEC_YM),
        PUR_GUIType: this.mapLabelToValue(this.invoiceTypeOptions, row.GUIType),
        TAX_TYPE: this.mapLabelToValue(this.taxTypeOptions, row.TAX_TYPE),
        COMM_MONEY_TYPE: this.mapLabelToValue(this.money_typeOptions, row.COMM_MONEY_TYPE),
        PUR_DiscNo: this.mapLabelToValue(this.discountOptions, row.PUR_DiscNo),
      });

      const backendDetails = row.Details ?? row.details ?? [];
      this.detailEditData = JSON.parse(JSON.stringify(backendDetails || []));

      if (row.tlt_no) {
        this.selectedTltNoRaw = row.tlt_no;
        const display = row.tlt_name ? `${row.tlt_no} - ${row.tlt_name}` : row.tlt_no;
        const ctrl = this.dataForm.controls.tlt_no;
        if (ctrl) ctrl.setValue(display, { emitEvent: false });
      }
      this.originalDetailSnapshot = JSON.parse(JSON.stringify(this.detailEditData || []));
    }

    this.tltNoData$.pipe(
      map((res: any) => res?.Data ?? [])
    ).subscribe((data: any[]) => {
      this.vendorTLS2F010Options = (data ?? []).map((item: any) => ({
        label: `${item.ven_no}${item.VEN_Name ? ' - ' + item.VEN_Name : ''}`,
        value: item.ven_no,
      }));
      this.tltOptionsList = (data ?? []).map((item: any) => ({
        label: `${item.tlt_no}${item.tlt_name ? ' - ' + item.tlt_name : ''}`,
        value: item.tlt_no,
      }));

      const row = this.rowdata as any;
      if (row && row.tlt_no) {
        const found = (data ?? []).find((it: any) => it.tlt_no === row.tlt_no);
        const display = found ? `${found.tlt_no}${found.tlt_name ? ' - ' + found.tlt_name : ''}` : `${row.tlt_no}${row.tlt_name ? ' - ' + row.tlt_name : ''}`;
        const ctrl = this.dataForm.controls.tlt_no;
        if (ctrl) ctrl.setValue(display, { emitEvent: false });
        this.selectedTltNoRaw = row.tlt_no;
      }
    });

    const commCtrl = this.dataForm.controls.COMM_MONEY_TYPE as any;
    commCtrl.valueChanges?.pipe?.(untilDestroyed(this)).subscribe((val: any) => {
      const moneyType = Array.isArray(val) && val.length ? String(val[0]) : (val == null ? null : String(val));
      this.updateSamTermnoOptions(moneyType);
      this.dataForm.controls.sam_termno.setValue(1);
    });

    const initVal = commCtrl.value as any;
    const initMoney = Array.isArray(initVal) && initVal.length ? String(initVal[0]) : (initVal == null ? null : String(initVal));
    if (initMoney) this.updateSamTermnoOptions(initMoney);

    if (this.isFormEditable || this.isFormReadable) {
      this.showQueryArea = false;
      this.showEditArea = true;
      this.showResultTables = false;
    } else {
      this.showEditArea = false;
    }

    this.originalDetailSnapshot = JSON.parse(JSON.stringify(this.detailEditData || []));

    if (this.isFormEditable) {
      this.applyEditModeReadonly();
    }

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
        if (!Number.isNaN(net)) {
          const tax = isCurrentlyTaxable() ? Math.round(net * 0.05) : 0;
          if (taxCtrl) taxCtrl.setValue(tax, { emitEvent: false });
          if (amtCtrl) amtCtrl.setValue(net + tax, { emitEvent: false });
        }
      });
    }

    if (taxCtrl && taxCtrl.valueChanges) {
      taxCtrl.valueChanges.pipe(untilDestroyed(this)).subscribe((tv: any) => {
        const taxVal = Number(tv ?? 0);
        const netVal = Number(guinetCtrl && guinetCtrl.value ? guinetCtrl.value : 0);
        if (!Number.isNaN(taxVal) && !Number.isNaN(netVal)) {
          if (!isCurrentlyTaxable()) {
            taxCtrl.setValue(0, { emitEvent: false });
            if (amtCtrl) amtCtrl.setValue(netVal, { emitEvent: false });
          } else {
            if (amtCtrl) amtCtrl.setValue(netVal + taxVal, { emitEvent: false });
          }
        }
      });
    }

    if (taxTypeCtrl && taxTypeCtrl.valueChanges) {
      taxTypeCtrl.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
        const netVal = Number(guinetCtrl && guinetCtrl.value ? guinetCtrl.value : 0);
        const tax = isCurrentlyTaxable() ? Math.round(netVal * 0.05) : 0;
        if (taxCtrl) taxCtrl.setValue(tax, { emitEvent: false });
        if (amtCtrl) amtCtrl.setValue(netVal + tax, { emitEvent: false });
      });
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

  private applyEditModeReadonly(): void {
    const editableFields = new Set<string>([
      'PUR_GUINO', 'PUR_GUIType', 'PUR_GUIDate', 'PUR_TaxType', 'DEC_YM', 'ven_uniform',
      'ACP_GUINet_From', 'ACP_GUINet_To', 'ACP_GUITax_From', 'ACP_GUITax_To', 'PUR_GUIPaper', 'PUR_DiscNo'
    ]);
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

  private mapLabelToValue(options: { label: string; value: any }[], raw: any): any {
    if (raw == null) return null;
    const hit = options.find(o => o.value === raw || o.label === raw);
    return hit?.value ?? null;
  }

  querySourceInvoice(): void {
    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
      return;
    }
    this.queryLoading = true;
    const formValue = this.dataForm.getRawValue();

    const params = {
      tlt_no: this.getRawTltNo(formValue.tlt_no),
      sam_yyymm: this.datePipe.transform(formValue.sam_yyymm, 'yyyyMM'),
      money_type: formValue.COMM_MONEY_TYPE,
      sam_termno: formValue.sam_termno,
    };

    this.tls2f010Service.queryTLS2F010InsertData(params)
      .subscribe({
        next: (res: any) => {
          const data = res?.Data ?? [];
          const mains = data.flatMap((item: any) => item?.Mains ?? []);
          const details = data.flatMap((item: any) => item?.Details ?? []);
          const receYn = data[0]?.rece_yn ?? null;
          const prevTalentId = this.selectedMain?.talent_id ?? null;
          this.changeEditData = mains;
          this.sourceInvoiceData = details;

          if (receYn === 'N') {
            this.messageService.warnBubble(`(${params.tlt_no})為非業主發票廠商，不需登入發票`);
          } else if (mains.length === 0) {
            this.messageService.warnBubble(`${params.tlt_no}-查無此專櫃請款資料！！`);
          }

          const firstDetail = details[0] ?? null;
          const firstMain = mains[0] ?? null;
          const commYmValue = this.dataForm.controls.sam_yyymm.value;
          let defaultInvoiceDate: Date | null = null;

          if (commYmValue instanceof Date) {
            defaultInvoiceDate = new Date(commYmValue.getFullYear(), commYmValue.getMonth() + 1, 0);
          } else {
            defaultInvoiceDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
          }

          if (firstDetail || firstMain) {
            const taxVal = (this.taxTypeOptions ?? []).find((o: any) => String(o.label ?? '').includes('應稅'))?.value ?? '';
            const deductVal = (this.discountOptions ?? []).find((o: any) => String(o.label ?? '').includes('代表進項可扣抵'))?.value ?? '';
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
              VEN_No: firstMain?.ven_no != null ? String(firstMain?.ven_no) : (this.detailDefaultInsert?.VEN_No ?? ''),
              ven_uniform: defaultVenUniform,
              PUR_GUINO: '',
              PUR_GUIDate: defaultInvoiceDate,
              DEC_YM: targetDate || null,
              GUIType: String(firstMain?.tlttalent?.invoice_type ?? firstMain?.invoice_type ?? ''),
              TAX_TYPE: taxVal,
              Deduct_Code: deductVal,
              PUR_GUIPaper: '21',
              INV_UseType: '2',
            };
          } else {
            this.detailDefaultInsert = { INV_UseType: '2' };
          }

          if (data.length > 0) {
            const sumUnposted = (field: string) => data.reduce((s: number, item: any) => s + Number(item?.[field] ?? 0), 0);
            this.footer2 = {
              UnPostedAmt_NoTax: formatAmount(sumUnposted('UnPostedAmt_NoTax')),
              UnPostedAmt_WithTax: formatAmount(sumUnposted('UnPostedAmt_WithTax')),
            };
          } else {
            this.footer2 = null;
          }

          if (mains.length > 0 && receYn === 'Y') {
            this.showQueryArea = false;
            this.showResultTables = true;
          }

          const reselect = prevTalentId != null ? (mains.find((m: any) => m?.talent_id === prevTalentId) ?? null) : null;
          if (reselect) {
            this.onChangeEditSelection(reselect);
          } else if (mains.length === 1) {
            this.onChangeEditSelection(mains[0]);
          } else {
            this.selectedMain = null;
            this.checkIsInsertDisable();
          }
          this.originalDetailSnapshot = JSON.parse(JSON.stringify(this.detailEditData || []));
        },
        error: (err: any) => { this.queryLoading = false; },
        complete: () => { this.queryLoading = false; },
      });
  }

  private checkIsInsertDisable(): void {
    this.isInsertDisable = this.isFormCreateable && !this.selectedMain;
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
      PUR_GUIDate: this.datePipe.transform(formValue.PUR_GUIDate, 'yyyy-MM-dd'), // 改用 DatePipe
      DEC_YM: this.datePipe.transform(formValue.DEC_YM, 'yyyyMM'), // 改用 DatePipe
      ven_uniform: formValue.ven_uniform ?? '',
      PUR_TaxType: Array.isArray(formValue.PUR_TaxType) ? formValue.PUR_TaxType[0] ?? '' : formValue.PUR_TaxType ?? '',
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

    const commMoneyCtrl = this.dataForm.controls.COMM_MONEY_TYPE as any;
    const moneyCtrl = this.dataForm.controls.money_type as any;
    if (moneyCtrl && (moneyCtrl.value == null || moneyCtrl.value === '') && commMoneyCtrl) {
      const val = Array.isArray(commMoneyCtrl.value) && commMoneyCtrl.value.length ? commMoneyCtrl.value[0] : commMoneyCtrl.value;
      moneyCtrl.setValue(val, { emitEvent: false });
    }

    if (this.dataForm.invalid) {
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

    const valid = this.tableDetailEdit?.validateAndShowErrors();
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

    const selectedMain = this.selectedMain;
    if (!selectedMain) {
      this.messageService.errorBubble('請先選擇一筆結帳資料');
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
        talent_id: selectedMain.talent_id ?? 0,
        PUR_GUIType: row.GUIType ?? '',
        ven_no: row.VEN_No ?? '',
        PUR_GUINO: row.PUR_GUINO ?? '',
        PUR_GUIDate: this.datePipe.transform(row.PUR_GUIDate, 'yyyy-MM-dd'), // 改用 DatePipe
        DEC_YM: this.datePipe.transform(row.DEC_YM, 'yyyyMM'), // 改用 DatePipe
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

    const getTaxLabel = (d: any): string => {
      if (d?.TaxType_desc) return String(d.TaxType_desc);
      return this.mapValueToLabel(this.taxTypeOptions, d?.PUR_TaxType ?? d?.TAX_TYPE ?? d?.TaxType) ?? '';
    };
    const sumField = (arr: any[], field: string) => arr.reduce((s, d) => s + (Number(d[field] ?? 0)), 0);

    const talentId = selectedMain.talent_id;
    const oldDetails = (this.sourceInvoiceData ?? []).filter((d: any) => d?.talent_id === talentId);
    const allInvoices = [...details, ...oldDetails];

    const guinoCounts = new Map<string, number>();
    allInvoices.forEach(d => {
      const no = String(d?.PUR_GUINO ?? '').trim();
      if (!no) return;
      guinoCounts.set(no, (guinoCounts.get(no) ?? 0) + 1);
    });
    const duplicateGuinos = Array.from(guinoCounts.entries()).filter(([, count]) => count > 1).map(([no]) => no);
    if (duplicateGuinos.length > 0) {
      this.messageService.warnBubble(`發票/收據編號(${duplicateGuinos.join('、')})重複，請檢查單據資料`);
      this.loading = false; this.submitted = false; this.messageService.unblockUi(); return;
    }

    const noTaxInvoices = allInvoices.filter(d => getTaxLabel(d).includes('免稅'));
    const taxableInvoices = allInvoices.filter(d => getTaxLabel(d).includes('應稅'));

    const sumNoTaxAmt = sumField(noTaxInvoices, 'ACP_GUIAmt');
    const sumTaxableNet = sumField(taxableInvoices, 'ACP_GUINet');
    const sumTax = sumField(allInvoices, 'ACP_GUITax');
    const sumAmt = sumField(allInvoices, 'ACP_GUIAmt');

    const noTaxPayable = Number(selectedMain?.sam_ap_notaxamt ?? 0);
    if (sumNoTaxAmt > noTaxPayable) {
      this.messageService.warnBubble(`免稅單據加總 (${sumNoTaxAmt}) 不可大於該筆應付貨款(免稅)合計 (${noTaxPayable})`);
      this.loading = false; this.submitted = false; this.messageService.unblockUi(); return;
    }

    const namt = Number(selectedMain?.sam_ap_namt ?? 0);
    if (sumTaxableNet > namt) {
      this.messageService.warnBubble(`應稅單據未稅金額加總 (${sumTaxableNet}) 不可大於該筆廠商應開立發票額(收據)合計 (${namt})`);
      this.loading = false; this.submitted = false; this.messageService.unblockUi(); return;
    }

    const taxLimit = Number(selectedMain?.sam_ap_tax ?? 0);
    if (sumTax > taxLimit) {
      this.messageService.warnBubble(`稅額加總 (${sumTax}) 不可大於該筆營業稅合計 (${taxLimit})`);
      this.loading = false; this.submitted = false; this.messageService.unblockUi(); return;
    }

    const totalLimit = Number(selectedMain?.sam_ap_amt ?? 0);
    if (sumAmt > totalLimit) {
      this.messageService.warnBubble(`應稅金額加總 (${sumAmt}) 不可大於該筆總額合計 (${totalLimit})`);
      this.loading = false; this.submitted = false; this.messageService.unblockUi(); return;
    }

    const body = {
      sam_yyymm: this.datePipe.transform(formValue.sam_yyymm ?? formValue.COMM_YM, 'yyyyMM'), // 改用 DatePipe
      money_type: formValue.COMM_MONEY_TYPE ?? formValue.money_type ?? '',
      sam_termno: Number(formValue.sam_termno ?? 0),
      tlt_no: this.getRawTltNo(formValue.tlt_no) ?? '',
      COMM_YM: this.datePipe.transform(formValue.COMM_YM, 'yyyyMM'), // 改用 DatePipe
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
          this.detailEditData = [];
          this.originalDetailSnapshot = [];
          this.querySourceInvoice();
        }
      });
  }

  onChangeEditSelection(item: any): void {
    this.selectedMain = item ?? null;
    this.checkIsInsertDisable();
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
  }

  onDetailEditDataChange(data: any[]): void { this.detailEditData = data; }

  onLocalCancel(): void {
    if (this.originalDetailSnapshot != null) {
      this.detailEditData = JSON.parse(JSON.stringify(this.originalDetailSnapshot));
    } else {
      this.detailEditData = [];
    }
    this.selectedMain = null;
    this.checkIsInsertDisable();
  }

  onDetailFieldChange(_event: any): void {
    const ev = _event as { rowData: any, field: string, value: any, index?: number };
    if (!ev || !ev.field) return;

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
        row.TAX_TYPE = taxVal ?? row.TAX_TYPE;
        row.Deduct_Code = deductVal ?? row.Deduct_Code;
        row.GUITax = 0;
        row.PUR_GUIPaper = '22';
        const netVal = Number(row.GUINet ?? 0);
        row.GUIAmt = (Number.isNaN(netVal) ? 0 : netVal);
      }
    }

    if (ev.field === 'TAX_TYPE') {
      const taxLabel = this.mapValueToLabel(this.taxTypeOptions, ev.value);
      const isTaxable = (taxLabel ?? '').includes('應稅');
      if (!isTaxable) {
        const row = ev.rowData ?? {};
        let deductVal = this.mapLabelToValue(this.discountOptions, '代表進項不可扣抵之進貨及費用');
        if (deductVal == null) {
          const hit2 = (this.discountOptions ?? []).find((o: any) => String(o.label ?? '').includes('代表進項不可扣抵'));
          deductVal = hit2?.value ?? null;
        }
        row.Deduct_Code = deductVal ?? row.Deduct_Code;
        row.GUITax = 0;
        const netVal = Number(row.GUINet ?? 0);
        row.GUIAmt = (Number.isNaN(netVal) ? 0 : netVal);
      }
    }

    if (ev.field === 'GUINet') {
      const row = ev.rowData ?? {};
      const net = Number(ev.value ?? 0);
      if (!Number.isNaN(net)) {
        const guiLabel = this.mapValueToLabel(this.invoiceTypeOptions, row?.GUIType);
        const isReceipt = (guiLabel ?? '').includes('收據');
        const taxLabel = this.mapValueToLabel(this.taxTypeOptions, row?.TAX_TYPE ?? row?.PUR_TaxType);
        const isTaxable = (taxLabel ?? '').includes('應稅');
        const tax = (!isReceipt && isTaxable) ? Math.round(net * 0.05) : 0;
        row.GUITax = tax;
        row.GUIAmt = net + tax;
        if (row._validationErrors) {
          delete row._validationErrors['GUITax'];
        }
        this.cdr.markForCheck();
      }
    }

    if (ev.field === 'GUITax') {
      const row = ev.rowData ?? {};
      const net = Number(row.GUINet ?? 0);
      const tax = Number(ev.value ?? 0);
      if (!Number.isNaN(net) && !Number.isNaN(tax)) {
        row.GUIAmt = net + tax;
      }
    }
  }

  private mapValueToLabel(options: { label: string, value: any }[] | any, raw: any): string | undefined {
    if (!options) return undefined;
    const list = Array.isArray(options) ? options : (typeof options === 'function' ? options(null) : []);
    const hit = (list ?? []).find((o: any) => o?.value === raw || o?.label === raw);
    return hit?.label;
  }

  get venUniformDisplayLabel(): string {
    const val = this.dataForm.controls.ven_uniform.value;
    if (!val) return '';
    const hit = this.venNoOptionsList.find(o => o.value === val);
    return hit ? hit.label : String(val);
  }

  getTltLabel(value: any): string {
    if (!value) return '';
    const hit = (this.tltOptionsList ?? []).find(t => t.value === value);
    return hit ? hit.label : String(value);
  }

  private getRawTltNo(displayOrValue: any): string | null {
    if (this.selectedTltNoRaw) return this.selectedTltNoRaw;
    if (displayOrValue == null) return null;
    const s = String(displayOrValue);
    const m = s.match(/^([^\s-]+)\s*-\s*/);
    if (m && m[1]) return m[1];
    const hit = (this.tltOptionsList ?? []).find(t => t.label === s || t.value === s);
    if (hit) return hit.value;
    return s;
  }
}
