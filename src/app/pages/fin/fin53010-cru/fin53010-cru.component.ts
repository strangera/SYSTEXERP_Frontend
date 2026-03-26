import { NgClass } from '@angular/common';
import { Component, computed, effect, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN53010Service } from '@service/api/fin/fin53010.service';
import { Option } from '@service/utility/dropdown-api.model';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { CheckboxComponent } from '@shared/componentkit/checkbox/checkbox.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, FieldChangeEvent, formatAmount } from '@shared/componentkit/table/table.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmount as reportFormatAmount, formatDate as reportFormatDate, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { NGXLogger } from 'ngx-logger';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule, TableRowReorderEvent } from 'primeng/table';
import { concatMap, finalize, Observable, tap } from 'rxjs';
import { FIN52030Data, FIN52030DetailData } from '../fin52030/fin52030.model';
import {
  FIN53010Aps2002_CRow,
  FIN53010Aps2002Row,
  FIN53010Aps3001Row,
  FIN53010Aps4023_CRow,
  FIN53010Aps4023Row,
  FIN53010Ars3001Row,
  FIN53010Data,
  FIN53010DetailTable,
  FIN53010InsertPayload,
  FIN53010InsertResult,
  FIN53010Payload,
  FIN53010UpdatePayload,
  FIN53010UpdateResult,
  QueryFIN53010Detail,
} from '../fin53010/fin53010.model';
import { TableEditComponent } from './table-edit/table-edit.component';
import { EditColumn, EditColumnExtend } from './table-edit/table-edit.model';

@Component({
  selector: 'app-fin53010-cru',
  templateUrl: './fin53010-cru.component.html',
  styleUrl: './fin53010-cru.component.scss',
  standalone: true,
  imports: [
    NgClass,
    ButtonModule,
    CheckboxModule,
    DropdownModule,
    FormsModule,
    InputTextModule,
    PanelModule,
    ReactiveFormsModule,
    TableModule,
    TranslateModule,
    ButtonComponent,
    CalendarComponent,
    CheckboxComponent,
    DialogComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    RadiobuttonComponent,
    TableComponent,
    TableEditComponent,
    TableReportComponent,
    ProgressSpinnerModule,
  ],
})
export class FIN53010CRUComponent extends BasicCruPageComponent<QueryFIN53010Detail> implements OnInit {

  private readonly venUsrTemplate = viewChild.required<TemplateRef<any>>('venUsrTemplate');

  public readonly dataForm = this.formBuilder.nonNullable.group({
    VouNo: new FormControl<string>('自動給號'),
    /** 傳票類別 1:現金收入 2:現金支出 3:轉帳傳票 */
    VouType: new FormControl<'1' | '2' | '3' | void>(void 0, [Validators.required]),
    /** 傳票狀態 0:作廢 1:建立 2:確認(取消確認動作) 3:過帳 */
    PostFlag: new FormControl<'0' | '1' | '3' | void>(void 0),
    /** 傳票種類(SYS1000.VoucherType) */
    VoucherType: new FormControl<string>('GL', [Validators.required]),
    VouDate: new FormControl<Date>(new Date, [Validators.required]),
    Remark: new FormControl<string | void>(void 0, [Validators.maxLength(100)]),
    INV_YN: new FormControl<'N' | 'Y'>('N', [Validators.required]),
    /** ROC/IFRS 0:ROC 1:IFRS null:全部 */
    VouAccType: new FormControl<'0' | '1' | void>('0', [Validators.required]),
    CRT_USR_No: new FormControl<string | void>(this.isFormCreateable ? this.user.user_No : void 0),
    UPD_USR_No: new FormControl<string | void>(!this.isFormCreateable ? this.user.user_No : void 0),
    CRT_Date: new FormControl<Date | void>(this.isFormCreateable ? new Date() : void 0),
    UPD_Date: new FormControl<Date | void>(!this.isFormCreateable ? new Date() : void 0),
    CompNo: new FormControl<string | void>(void 0),
  });
  public readonly df = computed(() => this.dataForm.controls);

  public readonly fin53010DetailData = signal<QueryFIN53010Detail>(Object.create(null));
  public readonly totalRecords = signal(0);
  public readonly tableData = signal<FIN53010DetailTable[]>([]);
  public readonly selectedDetail = signal<FIN52030DetailData[]>([]);
  private readonly selectedOrgId = signal<string>('100000');

  public readonly tableLoading = signal<boolean>(!1);

  /** 傳票關聯六表列資料 */
  public readonly ars3001RelatedRows = signal<FIN53010Ars3001Row[]>([]);
  public readonly aps3001RelatedRows = signal<FIN53010Aps3001Row[]>([]);
  public readonly aps2002_CRelatedRows = signal<FIN53010Aps2002_CRow[]>([]);
  public readonly aps2002RelatedRows = signal<FIN53010Aps2002Row[]>([]);
  public readonly aps4023_CRelatedRows = signal<FIN53010Aps4023_CRow[]>([]);
  public readonly aps4023RelatedRows = signal<FIN53010Aps4023Row[]>([]);

  public readonly ars3001RelatedColumns: ReportColumn[] = [
    { field: 'org_id', header: '組織代號', visible: true },
    { field: 'ven_no', header: '廠商代號', visible: true },
    { field: 'ars_amt', header: '金額', visible: true, format: v => reportFormatAmount(v) },
    { field: 'pta_date', header: '預計收款日', visible: true, format: v => (v ? reportFormatDate(String(v)) : '') },
    { field: 'ars_date', header: '立帳日期', visible: true, format: v => (v ? reportFormatDate(String(v)) : '') },
    { field: 'acc_no', header: '會計科目代號', visible: true },
    { field: 'note_desc', header: '摘要', visible: true },
    { field: 'sub_detail_no', header: '對象別編號', visible: true },
    { field: 'match_key', header: '對帳KEY值', visible: true },
  ];

  public readonly aps3001RelatedColumns: ReportColumn[] = [
    { field: 'org_id', header: '組織代號', visible: true },
    { field: 'VEN_No', header: '廠商代號', visible: true },
    { field: 'VEN_PayType_Name', header: '付款方式', visible: true, format: (v, _i, row) => {
      const r = row as FIN53010Aps3001Row;
      return String(v ?? r?.VEN_PayType ?? '');
    } },
    { field: 'ACP_Amt', header: '金額', visible: true, format: v => reportFormatAmount(v) },
    { field: 'ACP_ExpectPayDate', header: '預計付款日', visible: true, format: v => (v ? reportFormatDate(String(v)) : '') },
    { field: 'ACP_Date', header: '立帳日期', visible: true, format: v => (v ? reportFormatDate(String(v)) : '') },
    { field: 'VEN_BNK_No', header: '匯款銀行代號', visible: true },
    { field: 'VEN_BankAccountNo', header: '銀行帳號/帳戶名稱', visible: true, format: (_v, _i, row) => {
      const r = row as FIN53010Aps3001Row;
      const a = r?.VEN_BankAccountNo;
      const b = r?.VEN_AccountName;
      if (a && b) return `${a} / ${b}`;
      return (a ?? b ?? '') as string;
    } },
    { field: 'VEN_CTRLYN', header: '票據禁止背書轉讓', visible: true },
    { field: 'VEN_CheckTitle', header: '票據抬頭', visible: true },
    { field: 'AccNo', header: '會計科目代號', visible: true },
    { field: 'NoteDesc', header: '摘要', visible: true },
    { field: 'SubDetailNo', header: '對象別編號', visible: true },
    { field: 'PTA', header: '對帳KEY值', visible: true },
  ];

  public readonly aps2002_CRelatedColumns: ReportColumn[] = [
    { field: 'Orig_RepYYYYMM', header: '原發票申報年月', visible: true },
    { field: 'InvoiceNo', header: '發票號碼/憑證單號', visible: true },
    { field: 'VoucherType', header: '發票格式', visible: true },
    { field: 'Orig_InvoiceDate', header: '原發票日期', visible: true, format: v => (v ? reportFormatDate(String(v)) : '') },
    { field: 'CreditDate', header: '退出/折讓日期', visible: true, format: v => (v ? reportFormatDate(String(v)) : '') },
    { field: 'RepYYYYMM', header: '申報年月', visible: true },
    { field: 'CreditTypeDesc', header: '區別', visible: true },
    { field: 'Orig_Amount', header: '原發票總金額', visible: true, format: v => reportFormatAmount(v) },
    { field: 'BuyerUniformNo', header: '銷受人統一編號', visible: true },
    { field: 'ReturnedAmount', header: '已退回/折讓總金額', visible: true, format: v => reportFormatAmount(v) },
    { field: 'CreditAmount', header: '退回/折讓總金額', visible: true, format: v => reportFormatAmount(v) },
    { field: 'TaxTypeDesc', header: '課稅別', visible: true },
    { field: 'CreditNetAmount', header: '退回/折讓未稅金額', visible: true, format: v => reportFormatAmount(v) },
    { field: 'CreditTaxAmount', header: '退回/折讓稅額', visible: true, format: v => reportFormatAmount(v) },
  ];

  public readonly aps2002RelatedColumns: ReportColumn[] = [
    { field: 'VoucherType', header: '發票格式', visible: true },
    { field: 'TrackNo', header: '字軌', visible: true },
    { field: 'InvoiceNo', header: '發票號碼', visible: true },
    { field: 'InvoiceDate', header: '發票日期', visible: true, format: v => (v ? reportFormatDate(String(v)) : '') },
    { field: 'DeclareYM', header: '申報年月', visible: true },
    { field: 'VendorTaxID', header: '廠商統一編號', visible: true },
    { field: 'InvoiceUsage', header: '發票用途', visible: true },
    { field: 'InvoiceAmount', header: '發票總金額', visible: true, format: v => reportFormatAmount(v) },
    { field: 'TaxType', header: '課稅別', visible: true },
    { field: 'NetAmount', header: '發票未稅金額', visible: true, format: v => reportFormatAmount(v) },
    { field: 'TaxAmount', header: '發票稅額', visible: true, format: v => reportFormatAmount(v) },
    { field: 'DeductionCodeDesc', header: '扣抵代號', visible: true },
    { field: 'CategoryType', header: '類別區分', visible: true },
    { field: 'SourceDocNo', header: '憑證單號', visible: true },
    { field: 'TotalCount', header: '彙總張數', visible: true },
  ];

  public readonly aps4023_CRelatedColumns: ReportColumn[] = [
    { field: 'Original_Invoice_DeclareYM', header: '原發票申報年月', visible: true },
    { field: 'Invoice_Number', header: '發票號碼/憑證單號', visible: true },
    { field: 'Invoice_Type', header: '發票格式', visible: true },
    { field: 'Original_Invoice_Date', header: '原發票日期', visible: true, format: v => (v ? reportFormatDate(String(v)) : '') },
    { field: 'Credit_Invoice_Date', header: '退出折讓日期', visible: true, format: v => (v ? reportFormatDate(String(v)) : '') },
    { field: 'DeclareYM', header: '申報年月', visible: true },
    { field: 'Credit_Type_Flag', header: '區別', visible: true },
    { field: 'Buyer_Uniform_No', header: '買受人統一編號', visible: true },
    { field: 'Returned_Amount_Zero', header: '已退回/折讓總金額', visible: true, format: v => reportFormatAmount(v) },
    { field: 'Returned_Amount', header: '退回/折讓總金額', visible: true, format: v => reportFormatAmount(v) },
    { field: 'Tax_Type', header: '課稅別', visible: true },
    { field: 'pur_net', header: '退回/折讓未稅金額', visible: true, format: v => reportFormatAmount(v) },
    { field: 'pur_tax', header: '退回/折讓稅額', visible: true, format: v => reportFormatAmount(v) },
  ];

  public readonly aps4023RelatedColumns: ReportColumn[] = [
    { field: 'InvoiceType', header: '發票格式', visible: true },
    { field: 'InvoicePrefix', header: '字軌', visible: true },
    { field: 'InvoiceNo', header: '發票號碼', visible: true },
    { field: 'InvoiceDate', header: '發票日期', visible: true, format: v => (v ? reportFormatDate(String(v)) : '') },
    { field: 'DeclareYM', header: '申報年月', visible: true },
    { field: 'BuyerUniform', header: '買受人統一編號', visible: true },
    { field: 'TotalAmount', header: '發票總金額', visible: true, format: v => reportFormatAmount(v) },
    { field: 'TaxType', header: '課稅別', visible: true },
    { field: 'NetAmount', header: '發票未稅金額', visible: true, format: v => reportFormatAmount(v) },
    { field: 'TaxAmount', header: '發票稅額', visible: true, format: v => reportFormatAmount(v) },
    { field: 'SourceDocNo', header: '憑證單號', visible: true },
    { field: 'SummaryCount', header: '彙總張數', visible: true },
    { field: 'AssetFlag', header: '資產註記', visible: true },
  ];

  public selectedItems: FIN53010Data[] = [];
  public rowEditCanSave = signal<boolean>(!1);
  public displayDialog = signal<boolean>(!1);

  public readonly footerData = computed(() => ({
    AccAmtD: this.debitTotal(),
    AccAmtC: this.creditTotal(),
  }));

  public defaultInsertData = computed((): Partial<FIN53010DetailTable> => ({
    ORG_ID: this.selectedOrgId(),
  }));

  // 計算借貸方總額
  public readonly debitTotal = computed(() =>
    this.tableData().reduce((sum, row) => sum + (row.AccAmtD || 0), 0)
  );

  public readonly creditTotal = computed(() =>
    this.tableData().reduce((sum, row) => sum + (row.AccAmtC || 0), 0)
  );

  // 檢查借貸是否平衡
  public readonly isBalanced = computed(() => {
    const data = this.tableData();
    if (!data.length) return !0;
    const diff = Math.abs(this.debitTotal() - this.creditTotal());
    // 因為是自然數 所以不需要排除誤差 保留未來變更
    // return diff < 0.01;
    return !diff;
  });

  public readonly loadingEffect = effect(() => {
    this.loading = this.tableLoading()
      || this.service.accLoading()
      || this.service.venLoading()
      || this.service.usrLoading()
      || this.service.orgNoLoading()
      || this.service.voucherTypeLoading()
      || this.service.refNameLoading()
      || this.service.noteDescLoading()
      || this.service.detailByVouNoLoading();
  });

  // 載入資料的 effect
  public readonly dataEffect = effect(() => {
    if (this.isFormCreateable) return void (() => {
      this.tableLoading.set(!1);
      this.dataEffect.destroy();
    });
    const data = this.fin53010DetailData();
    if (!data?.Details) return;

    // 將 VoucherType 的 value 轉換成 label
    const voucherTypeValue = data.VoucherType?.trim() ?? 'GL';
    const voucherTypeLabel = this.service.voucherTypeMap().get(voucherTypeValue)?.label ?? voucherTypeValue;

    this.dataForm.patchValue({
      VouNo: data.VouNo,
      VouType: ['1', '2', '3'].includes(String(data.VouType)) ? String(data.VouType) as '1' | '2' | '3' : '1',
      PostFlag: ['0', '1', '3'].includes(String(data.PostFlag)) ? String(data.PostFlag) as '0' | '1' | '3' : '0',
      VoucherType: voucherTypeLabel,
      VouDate: data.VouDate ? new Date(data.VouDate) : new Date(),
      Remark: data.Remark,
      INV_YN: (data.INV_YN ?? 'N') as 'N' | 'Y',
      VouAccType: ['0', '1'].includes(String(data.VouAccType)) ? String(data.VouAccType) as '0' | '1' : '0',
      CompNo: data.CompNo,
      ...data.CRT_USR_No ? { CRT_USR_No: data.CRT_USR_No } : {},
      ...data.CRT_Date ? { CRT_Date: new Date(data.CRT_Date) } : {},
      ...data.UPD_USR_No ? { UPD_USR_No: data.UPD_USR_No } : {},
      ...data.UPD_Date ? { UPD_Date: new Date(data.UPD_Date) } : {},
    });

    this.tableData.set(data?.Details.map((v, index) => ({
      ...v,
      AccAmtC: v.AccDC === 'C' ? v.AccAmt : void 0,
      AccAmtD: v.AccDC === 'D' ? v.AccAmt : void 0,
      AccName: this.service.accNoMap().get(String(v.AccNo))?.label,
      DetailName: this.service.vendorMap().get(String(v.DetailNo))?.label
        ?? this.service.usrMap().get(String(v.DetailNo))?.label,
      NoteDesc: v.NoteDesc || this.service.noteDescMap().get(String(v.AccNo))?.label,
      SerNo: index + 1, // 序號從 1 起
    })));

    this.logger.debug(`loadingDetail:`, [data, this.dataForm.getRawValue(), this.tableData()]);
    if (!this.service.accNoMap().size
      || !this.service.vendorMap().size
      || !this.service.usrMap().size
      || !this.service.noteDescMap().size
      || !this.service.voucherTypeMap().size) return;

    this.dataEffect.destroy();
  }, { allowSignalWrites: !0 });

  // Template 相關屬性
  public readonly vouTermSearchTemp = signal<string>('');
  public readonly filteredVoucherTemplateOptions = computed(() =>
    this.service.voucherTemplateOptions().filter(v => {
      const term = this.vouTermSearchTemp().trim();
      if (!term) return !0;
      return String(v.TempNo).includes(term) || String(v.TempName).includes(term);
    }),
  );

  public selectedTemplateType = 'vendor';
  public templateSearchTerm = '';
  public readonly templateOptions = [
    { label: '廠商', value: 'vendor' },
    { label: '員工', value: 'user' }
  ];

  public readonly columns = computed<(Omit<EditColumn, 'field'> & { field: keyof FIN53010DetailTable; })[]>(() => {
    const accMap = this.service.accNoMap();
    const vendorMap = this.service.vendorMap();
    const usrMap = this.service.usrMap();

    return [
      {
        field: 'AccNo',
        header: '科目代號/名稱',
        textAlign: 'left',
        type: 'dropdown',
        required: !0,
        showClear: !1,
        options: () => this.service.accNoOptions(),
        optionLabel: 'label',
        optionValue: 'value',
        templateLabel: 'label',
        format: (v, i, r) => {
          if (!r?.AccNo) return '';
          const accItem = accMap.get(String(r.AccNo));
          return accItem?.label ?? '';
        },
      },
      {
        field: 'DetailNo',
        header: '廠商/員工代號',
        textAlign: 'left',
        type: 'template',
        templateRef: this.venUsrTemplate(),
      },
      {
        field: 'DetailName',
        header: '廠商/員工名稱',
        textAlign: 'left',
        format: (v, i, r) => r?.DetailNo ? vendorMap.get(String(r.DetailNo))?.['Name']
          ?? usrMap.get(String(r.DetailNo))?.label ?? '' : '',
      },
      {
        field: 'NoteDesc',
        header: '摘要',
        textAlign: 'left',
        type: 'input',
      },
      {
        field: 'AccAmtD',
        header: '借方金額',
        textAlign: 'right',
        type: 'inputNumber',
        format: (v) => (v !== void 0 && v !== null) ? formatAmount(v) : '',
      },
      {
        field: 'AccAmtC',
        header: '貸方金額',
        textAlign: 'right',
        type: 'inputNumber',
        format: (v) => (v !== void 0 && v !== null) ? formatAmount(v) : '',
      },
      {
        field: 'ORG_ID',
        header: '組織代號',
        textAlign: 'left',
        type: 'dropdown',
        showClear: !1,
        options: () => this.service.orgNoOptions(),
        optionLabel: 'label',
        optionValue: 'value',
      },
      {
        field: 'clearingCode',
        header: '立沖代號',
        textAlign: 'left',
        type: 'dropdown',
        options: () => [],
        optionLabel: 'label',
        optionValue: 'value',
      },
      {
        field: 'ReflNo',
        header: '對象別編號',
        textAlign: 'left',
        type: 'dropdown',
        options: () => this.service.refNameOptions(),
        optionLabel: 'label',
        optionValue: 'value',
      },
      {
        field: 'recKey',
        header: '對帳KEY值',
        textAlign: 'left',
        type: 'input',
      },
    ];
  });

  public readonly templateColumns: (Omit<Column, 'field'> & { field: keyof FIN52030Data; })[] = [
    { field: 'TempNo', header: '傳票號碼' },
    { field: 'TempName', header: '傳票代號' },
    { field: 'VouType', header: '傳票類型', format: v => this.service.vouTypeOptions.find(({ value }) => value === v)?.label ?? v },
    { field: 'DetailCount', header: '明細筆數' },
  ];

  constructor(
    public readonly service: FIN53010Service,
    private readonly logger: NGXLogger,
  ) {
    super();
    this.user = this.authService.getUserInfo()!;
  }

  public ngOnInit(): void {
    this.initializePage('FIN53010', this.dataForm);

    this.service.getAccNoOptions();
    this.service.getVendorOptions();
    this.service.getUsrOptions();
    this.service.getOrgNoOptions();
    this.service.getRefNameOptions();
    this.service.getAccDescOptions();
    this.service.getVoucherTypeOptions();

    // 如果是新增模式，等待選項載入後設定初始 label
    if (this.isFormCreateable) {
      const setInitialLabel = () => {
        const options = this.service.voucherTypeOptions();
        if (options.length > 0) {
          const defaultValue = 'GL';
          const defaultOption = options.find(opt => opt.value === defaultValue);
          if (defaultOption) {
            this.df().VoucherType.setValue(defaultOption.label);
          }
        }
      };

      // 如果選項已載入，直接設定；否則等待載入完成
      if (this.service.voucherTypeOptions().length > 0) {
        setInitialLabel();
      } else {
        const checkInterval = setInterval(() => {
          if (this.service.voucherTypeOptions().length > 0) {
            setInitialLabel();
            clearInterval(checkInterval);
          }
        }, 100);
        // 設定超時避免無限等待
        setTimeout(() => clearInterval(checkInterval), 5000);
      }
    }

    if (!this.isFormCreateable) {
      this.tableLoading.set(!0);
      this.service.loadFIN53010Detail(this.rowdata!.id).pipe(
        finalize(() => this.tableLoading.set(!1)),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.fin53010DetailData.set(res.Data);
          this.totalRecords.set(res.TotalCount);
          this.loadRelatedDetailByVouNo(res.Data?.VouNo);
        },
      });
    }
  }

  private clearRelatedDetailTables(): void {
    this.ars3001RelatedRows.set([]);
    this.aps3001RelatedRows.set([]);
    this.aps2002_CRelatedRows.set([]);
    this.aps2002RelatedRows.set([]);
    this.aps4023_CRelatedRows.set([]);
    this.aps4023RelatedRows.set([]);
  }

  /** 依傳票號碼載入應收／應付／進銷項關聯六表（無有效 VouNo 則清空） */
  private loadRelatedDetailByVouNo(vouNo: string | undefined | null): void {
    const v = typeof vouNo === 'string' ? vouNo.trim() : '';
    if (!v || v === '自動給號') {
      this.clearRelatedDetailTables();
      return;
    }
    this.service.queryFIN53010DetailDataByVouNo({ VouNo: v }).subscribe({
      next: res => {
        if (res.Status !== '0000' || !res.Data) {
          this.clearRelatedDetailTables();
          return;
        }
        const d = res.Data;
        const pick = <T,>(b: { Details?: T[] | null } | null | undefined): T[] =>
          Array.isArray(b?.Details) && b!.Details!.length ? b!.Details! : [];
        this.ars3001RelatedRows.set(pick(d._ARS3001));
        this.aps3001RelatedRows.set(pick(d._APS3001));
        this.aps2002_CRelatedRows.set(pick(d._APS2002_C));
        this.aps2002RelatedRows.set(pick(d._APS2002));
        this.aps4023_CRelatedRows.set(pick(d._APS4023_C));
        this.aps4023RelatedRows.set(pick(d._APS4023));
      },
      error: () => this.clearRelatedDetailTables(),
    });
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      // 驗證借貸是否平衡
      if (!this.isBalanced()) {
        this.messageService.errorBubble('借貸金額不平衡');
        this.loading = false;
        return;
      }

      // 驗證對話框是否開啟
      if (this.displayDialog()) {
        this.messageService.errorBubble('請先關閉對話框');
        this.loading = false;
        return;
      }

      const { VouNo, ...d } = this.dataForm.getRawValue();

      if (this.tableData().length === 0) {
        this.messageService.errorBubble('明細至少要有一筆');
        this.loading = false
        return;
      }

      // 將 VoucherType 的 label 轉換回 value
      const voucherTypeLabel = d.VoucherType;
      const voucherTypeValue = this.service.voucherTypeOptions().find(opt => opt.label === voucherTypeLabel)?.value
        ?? (this.service.voucherTypeMap().get(voucherTypeLabel)?.value ?? voucherTypeLabel);

      const raw = {
        ...d,
        VoucherType: (voucherTypeValue?.padEnd(3, ' ')) || 'GL ',
        Details: this.tableData().map(({ AccAmtD, AccAmtC, NoteDesc, ...rest }, index) => {
          return {
            ...rest,
            index,
            id: typeof rest.id === 'number' ? rest.id! : void 0,
            AccAmt: (AccAmtD ?? 0) + (AccAmtC ?? 0),
            AccDC: AccAmtD ? 'D' : AccAmtC ? 'C' : '',
            ORG_ID: rest.ORG_ID || '100000',
            VoucherType: (voucherTypeValue?.padEnd(3, ' ')) || 'GL ',
            NoteDesc: this.service.noteDescMap().get(String(NoteDesc))?.label ?? NoteDesc,
          };
        }),
        ...(!this.isFormCreateable && { VouNo }),
      } as FIN53010InsertPayload | FIN53010UpdatePayload;
      const payload = Object.fromEntries(Object.entries(raw).filter(([_, v]) =>
        v !== null && v !== void 0 && (!(Array.isArray(v)) || v.length > 0)
      )) as unknown as FIN53010InsertPayload | FIN53010UpdatePayload;

      this.tableLoading.set(!0);
      const request: Observable<FIN53010InsertResult | FIN53010UpdateResult> = this.isFormCreateable
        ? this.service.insertFIN53010Data({ ...payload, CRT_USR_No: this.user.user_No })
        : this.service.updateFIN53010Data({ ...payload, id: this.rowdata!.id, UPD_USR_No: this.user.user_No });


      this.logger.debug(`submit:`, [payload]);
      request.pipe(
        finalize(() => this.tableLoading.set(!1)),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.onCancel();
          this.messageService.successBubble(this.isFormCreateable ? '新增成功' : '更新成功');
        },
      });
    });
  }

  public onDataChange(data: FIN53010DetailTable[]): void {
    this.logger.debug(`onDataChange:`, [data]);
    const renumbered = data.map((row, i) => ({ ...row, SerNo: i + 1, index: i }));
    this.tableData.set(renumbered);
    this.rowEditCanSave.set(this.tableData().some(row => row.AccNo && row.ORG_ID) || !!this.isBalanced());
  }

  public onFieldChange(event: FieldChangeEvent<FIN53010DetailTable>): void {
    this.logger.debug(`onFieldChange:`, [event]);

    // 只處理業務邏輯，不直接修改 tableData
    // 資料同步由 dataChange 事件處理
    const rowData = event.rowData;
    const index = event.index;

    if (typeof index === 'number' && index >= 0) {
      switch (event.field) {
        case 'AccNo':
          // 自動帶入科目名稱
          rowData.AccCName = this.service.accNoMap().get(String(event.value))?.label ?? '';
          // 自動帶入摘要
          rowData.NoteDesc = String(this.service.noteDescMap()
            .get(event.value)?.data?.[0].label || event.value || '');
          break;

        case 'AccAmtD':
          // 自動互斥借貸方金額
          if (event.value) rowData.AccAmtC = void 0;
          break;

        case 'AccAmtC':
          // 自動互斥借貸方金額
          if (event.value) rowData.AccAmtD = void 0;
          break;

        case 'ORG_ID':
          // 設定目前選擇的組織代號
          this.selectedOrgId.set(String(event.value));
          rowData.SubDetailNo = '';
          break;

        // case 'NoteDesc':
        //   rowData.NoteDesc = String(this.service.noteDescMap().get(event.rowData.AccNo)?.data
        //     ?.find(d => d.value === event.value)?.label
        //     || event.value || '');
        //   break;
      }

      // 如果會計科目是進項稅額，且組織是部門，則自動改為共同
      if (rowData.AccNo?.startsWith('1232')
        && this.service.orgMap().get(rowData.ORG_ID || '')?.label?.endsWith('部')) {
        rowData.AccNo = '123208';
        rowData.AccCName = this.service.accNoMap().get('123208')?.label ?? '';
      }
    }
  }

  public onDelete(event: (FIN53010DetailTable & EditColumnExtend)[]): void {
    const ids: number[] = [];
    for (const e of event) {
      if (RegExp(/^[^0-9]/).test(String(e.SerNo))) continue;

      const data = this.tableData();
      const idx = data.findIndex(d => d.SerNo === e.SerNo);
      if (e[idx]?._dataStatus === 'new') {
        // 如果是新資料則直接從 tableData 移除
        this.tableData.update(current =>
          current
            .filter(d => d.SerNo !== e.SerNo)
            .map((row, i) => ({ ...row, SerNo: i + 1, index: i })),
        );
        continue;
      }
      if (idx > -1) ids.push(idx + 1);
    }

    if (!ids.length) return;
    this.tableLoading.set(!0);
    this.service.deleteFIN53010Data(ids).pipe(
      tap(res => this.logger.debug(`onDelete:`, [ids, res])),
      concatMap(() => this.service.loadFIN53010Detail(this.rowdata!.id)),
      tap(res => {
        this.logger.debug(`reload after delete:`, [res]);
        if (res.Status === '0000') {
          this.fin53010DetailData.set(res.Data);
          this.loadRelatedDetailByVouNo(res.Data?.VouNo);
        }
      }),
      finalize(() => this.tableLoading.set(!1)),
    ).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        this.messageService.successBubble('刪除成功');
      },
    });
  }

  public onRowReorder(event: TableRowReorderEvent): void {
    this.tableData.update(current => {
      const newArray = [...current];
      const movedItem = newArray.splice(event.dragIndex!, 1)[0];
      newArray.splice(event.dropIndex!, 0, movedItem);

      return newArray.map((item, index) => ({
        ...item,
        index,
        displayIndex: index,
        SerNo: index + 1,
      }));
    });

    this.logger.debug(`onRowReorder:`, [event, this.tableData()]);
  }

  public getVocherTemplate(): void {
    const payload: FIN53010Payload = {
      ...(this.df().VouType.value ? { VouType: this.df().VouType.value as FIN53010Payload['VouType'] } : {}),
      // ...(this.isFormCreateable ? { CRT_USR_No: this.user.user_No } : {}),
      // ...(!this.isFormCreateable ? { UPD_USR_No: this.user.user_No } : {}),
    };

    if (this.loading) return;

    this.tableLoading.set(!0);
    this.service.getFin52030(payload).pipe(
      tap(res => this.logger.debug(`getFin52030:`, [res])),
      finalize(() => {
        this.tableLoading.set(!1);
        this.displayDialog.set(!0);
      }),
    ).subscribe();
  }

  public onApplyTemplate(): void {
    this.tableLoading.set(!0);
    this.service.getFin52030Detail(this.selectedDetail()[0]?.TempNo, this.df().CompNo.value!, Number(this.user.mid)).pipe(
      tap(res => this.logger.debug(`onApplyTemplate:`, [res])),
      finalize(() => {
        this.tableLoading.set(!1);
        this.displayDialog.set(!1);
      }),
    ).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const data = res.Data;

        // 將 VoucherType 的 value 轉換成 label
        const voucherTypeValue = data.VoucherType?.trim() ?? "GL";
        const voucherTypeLabel = this.service.voucherTypeMap().get(voucherTypeValue)?.label ?? voucherTypeValue;

        this.dataForm.patchValue({
          VouType: data.VouType,
          VoucherType: voucherTypeLabel,
          CRT_USR_No: data.CRT_USR_No ?? void 0,
          CRT_Date: data.CRT_Date || void 0,
          UPD_USR_No: data.UPD_USR_No ?? void 0,
          UPD_Date: data.UPD_Date || void 0,
        });
        this.tableData.set((data.Details || []).map((v, index) => {
          const accDC = String(v.AccDC ?? '');
          const isCredit = accDC === 'C' || accDC === '0';
          const isDebit = accDC === 'D' || accDC === '1';

          return {
            ...v,
            id: v.id!,
            AccAmtC: isCredit ? v.AccAmt : void 0,
            AccAmtD: isDebit ? v.AccAmt : void 0,
            AccName: this.service.accNoMap().get(String(v.AccNo))?.label,
            DetailName:
              this.service.vendorMap().get(String(v.DetailNo))?.label
              ?? this.service.usrMap().get(String(v.DetailNo))?.label
              ?? '',
            NoteDesc: v.NoteDesc || this.service.noteDescMap().get(String(v.AccNo))?.label,
            SerNo: index + 1, // 序號從 1 起
            index,
          };
        }));
      },
    });
  }

  // Template 相關方法
  public onTemplateTypeChange(event: DropdownChangeEvent): void {
    this.selectedTemplateType = event.value;
    this.templateSearchTerm = ''; // 重置搜尋
  };

  /** 根據所選模板類型與搜尋條件取得並過濾模板資料 */
  public getFilteredTemplateData(): Option[] {
    const src = this.selectedTemplateType === 'vendor'
      ? this.service.vendorOptions()
      : this.service.usrOptions();

    const term = this.templateSearchTerm?.trim().toLowerCase();
    if (!term) return src;

    return src.filter(item => {
      const label = item.label?.toLowerCase() || '';
      const value = item.value?.toLowerCase() || '';
      return label.includes(term) || value.includes(term);
    });
  }

  /** 選中的項目 */
  public selectTemplateItem(rowData: FIN53010DetailTable, item?: Option & { short?: string; }): void {
    this.logger.debug('selectTemplateItem:', [rowData, item]);
    [rowData.DetailNo, rowData.DetailName] = [item?.value ?? '', item?.short ?? item?.label ?? ''];
  };

  public vouTermChange(event: Event): void {
    this.logger.debug(`vouTermChange:`, [event]);
    this.vouTermSearchTemp.set((event.target as HTMLInputElement).value?.toString() || '');
  }

}
