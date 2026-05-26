import { DatePipe } from '@angular/common';
import { afterNextRender, Component, computed, effect, Injector, OnInit, signal, TemplateRef, ViewChild, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN53010Service } from '@service/api/fin/fin53010.service';
import { Option } from '@service/utility/dropdown-api.model';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn, formatAmount as reportFormatAmount, formatDate as reportFormatDate } from '@shared/componentkit/table-report/table-report.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, FieldChangeEvent, formatAmount } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule, TableRowReorderEvent } from 'primeng/table';
import { concatMap, EMPTY, finalize, forkJoin, Observable, startWith, switchMap, take, tap } from 'rxjs';
import { FIN52030Data, FIN52030DetailData } from '../fin52030/fin52030.model';
import { mapFin53010ForUpdateResponseToStepRows } from '../fin53010/fin53010-detail-for-update.mapper';
import { buildInsertFin53010Request, buildUpdateFin53010Request, Fin53010PayloadMapperDeps } from '../fin53010/fin53010-payload.mapper';
import {
  Aps4023DetailDataByInvoiceNumberData,
  FIN53010Aps2002_CRow,
  FIN53010Aps2002Row,
  FIN53010Aps3001Row,
  FIN53010Aps4023_CRow,
  FIN53010Aps4023Row,
  FIN53010Ars3001Row,
  FIN53010Data,
  FIN53010Detail,
  FIN53010DetailTable,
  FIN53010InsertResult,
  FIN53010Payload,
  FIN53010StepAP,
  FIN53010StepAR,
  FIN53010StepBankDeposit,
  FIN53010StepPurchaseInvoiceRow,
  FIN53010StepSalesInvoiceRow,
  FIN53010UpdateResult,
  QueryFIN53010Detail,
} from '../fin53010/fin53010.model';
import { TableEditComponent } from './table-edit/table-edit.component';
import { EditColumn, EditColumnExtend, FieldChangeEvent as StepFieldChangeEvent } from './table-edit/table-edit.model';

/** API 回傳的日期字串（"YYYY-MM-DDTHH:mm:ss"）解析為 local time Date，避免 UTC midnight 時區問題 */
function parseApiDateToLocal(s: string | null | undefined): Date | null {
  if (s == null || String(s).trim() === '') return null;
  const parts = String(s).slice(0, 10).split('-');
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) return null;
  return new Date(y, m - 1, d);
}

@Component({
  selector: 'app-fin53010-cru',
  templateUrl: './fin53010-cru.component.html',
  standalone: true,
  imports: [
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
    DialogComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    TableComponent,
    TableEditComponent,
    TableReportComponent,
    ProgressSpinnerModule,
  ],
})
export class FIN53010CRUComponent extends BasicCruPageComponent<QueryFIN53010Detail> implements OnInit {
  private static readonly SUMMARY_INVOICE_REGEX = /([A-Za-z]{2})(\d{8})\*(\d{2})\*/;

  @ViewChild('purchaseTableEdit') purchaseTableEditComponent?: TableEditComponent;
  @ViewChild('bankTableEdit') bankTableEditComponent?: TableEditComponent;

  private readonly venUsrTemplate = viewChild.required<TemplateRef<any>>('venUsrTemplate');

  public readonly dataForm = this.formBuilder.nonNullable.group({
    VouNo: new FormControl<string>('自動給號'),
    /** 傳票類別 1:現金收入 2:現金支出 3:轉帳傳票 */
    VouType: new FormControl<'1' | '2' | '3' | void>('3', [Validators.required]),
    /** 傳票狀態 0:作廢 1:建立 2:確認(取消確認動作) 3:過帳 */
    PostFlag: new FormControl<'0' | '1' | '3' | void>('1', [Validators.required]),
    /** 傳票種類(SYS1000.VoucherType) */
    VoucherType: new FormControl<string>('GL', [Validators.required]),
    VouDate: new FormControl<Date>(new Date, [Validators.required]),
    Remark: new FormControl<string | void>(void 0, [Validators.maxLength(100)]),
    INV_YN: new FormControl<'N' | 'Y'>('Y', [Validators.required]),
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
  /** 立沖代號等暫無選項時使用，固定參考避免 dropdown 每次 getOptions 回傳新陣列 */
  readonly emptyClearingOptions: Option[] = [];
  /** 避免 effect 在 maps 抖動時反覆 tableData.set 造成 table-edit 重初始化 */
  private _lastAppliedDetailTableFingerprint: string | null = null;
  public readonly currentStep = signal<number>(1);
  public readonly activeVoucherSteps = signal<number[]>([]);
  public readonly stepLabels = new Map<number, string>([
    [1, '傳票資料'],
    [3, '應付帳款'],
    [4, '應收帳款'],
    [5, '進項發票'],
    [6, '銷項發票'],
    [7, '銀行存款'],
  ]);

  public readonly tableLoading = signal<boolean>(!1);
  /** 依傳票編號查詢並重載（僅編輯模式） */
  public readonly lookupVouLoading = signal<boolean>(!1);
  /** 步驟表同步迴圈（setTimeout 內） */
  private readonly stepRowsSyncBusy = signal<boolean>(!1);
  /** goNextStep / goToStep 切換步驟 */
  private readonly stepNavigateBusy = signal<boolean>(!1);
  /** 下一步／步驟 tab：任一忙碌即顯示 loading */
  public readonly nextStepBusy = computed(() => this.stepRowsSyncBusy() || this.stepNavigateBusy());
  /** 與表單欄位分離，避免與目前傳票號混淆 */
  public readonly lookupVouNo = new FormControl<string>('', { nonNullable: true });

  public readonly stepAPRows = signal<FIN53010StepAP[]>([]);
  public readonly stepARRows = signal<FIN53010StepAR[]>([]);
  public readonly stepSalesRows = signal<FIN53010StepSalesInvoiceRow[]>([]);
  public readonly stepPurchaseRows = signal<FIN53010StepPurchaseInvoiceRow[]>([]);
  public readonly stepBankRows = signal<FIN53010StepBankDeposit[]>([]);

  public readonly stepAPTotal = signal<number>(0);
  public readonly stepARTotal = signal<number>(0);
  public readonly stepPurchaseTotal = signal<{ invoice_amount: number; net_amount: number; tax_amount: number }>({ invoice_amount: 0, net_amount: 0, tax_amount: 0 });
  public readonly stepSalesTotal = signal<{ total_amount: number; net_amount: number; tax_amount: number }>({ total_amount: 0, net_amount: 0, tax_amount: 0 });
  public readonly stepBankTotal = signal<{ deposit_amt: number; withdraw_amt: number }>({ deposit_amt: 0, withdraw_amt: 0 });

  public readonly stepAPFooter = computed(() => ({ acp_amt: this.stepAPTotal() }));
  public readonly stepARFooter = computed(() => ({ ars_amt: this.stepARTotal() }));
  public readonly stepPurchaseFooter = computed(() => ({
    invoice_amount: this.stepPurchaseRows().reduce((sum, r) => sum + (r.invoice_amount ?? 0), 0),
    net_amount: this.stepPurchaseRows().reduce((sum, r) => sum + (r.net_amount ?? 0), 0),
    tax_amount: this.stepPurchaseRows().reduce((sum, r) => sum + (r.tax_amount ?? 0), 0),
  }));
  public readonly stepSalesFooter = computed(() => this.stepSalesTotal());
  public readonly stepBankFooter = computed(() => this.stepBankTotal());

  /** APS1001 銀行下拉 + 步驟列上 POS2013 銀行代號（清單無該代碼時補佔位） */
  public readonly bankNoOptionsForStep = computed(() => {
    const base = this.service.bankNoOptions();
    const seen = new Set(base.map(o => String(o.value)));
    const extra: Option[] = [];
    for (const r of this.stepAPRows()) {
      const c = String(r.ven_bnk_no ?? '').trim();
      if (c && !seen.has(c)) {
        seen.add(c);
        extra.push({ value: c, label: c });
      }
    }
    for (const r of this.stepBankRows()) {
      const c = String(r.bank_no ?? '').trim();
      if (c && !seen.has(c)) {
        seen.add(c);
        extra.push({ value: c, label: c });
      }
    }
    return [...base, ...extra];
  });

  /** 供「下一步」步驟表同步時讀取傳票日期（表單非 signal，需轉成 signal） */
  private readonly vouDateForStepSync = toSignal(
    this.dataForm.controls.VouDate.valueChanges.pipe(
      startWith(this.dataForm.controls.VouDate.value),
    ),
    { initialValue: this.dataForm.controls.VouDate.value },
  );

  /** 查詢傳票編號為空白（含僅空白字元）時，停用「載入傳票」 */
  public isLookupVouNoEmpty(): boolean {
    return !this.lookupVouNo.value?.trim();
  }

  /** 傳票關聯六表列資料 */
  public readonly ars3001RelatedRows = signal<FIN53010Ars3001Row[]>([]);
  public readonly aps3001RelatedRows = signal<FIN53010Aps3001Row[]>([]);
  public readonly aps2002_CRelatedRows = signal<FIN53010Aps2002_CRow[]>([]);
  public readonly aps2002RelatedRows = signal<FIN53010Aps2002Row[]>([]);
  public readonly aps4023_CRelatedRows = signal<FIN53010Aps4023_CRow[]>([]);
  public readonly aps4023RelatedRows = signal<FIN53010Aps4023Row[]>([]);

  /** 傳票關聯六表總計（唯讀模式） */
  public readonly readonlyAps3001Total = signal<number>(0);
  public readonly readonlyArs3001Total = signal<number>(0);
  public readonly readonlyAps2002Total = signal<{ InvoiceAmount: number; NetAmount: number; TaxAmount: number }>({ InvoiceAmount: 0, NetAmount: 0, TaxAmount: 0 });
  public readonly readonlyAps2002_CTotal = signal<{ CreditAmount: number; CreditNetAmount: number; CreditTaxAmount: number }>({ CreditAmount: 0, CreditNetAmount: 0, CreditTaxAmount: 0 });
  public readonly readonlyAps4023Total = signal<{ TotalAmount: number; NetAmount: number; TaxAmount: number }>({ TotalAmount: 0, NetAmount: 0, TaxAmount: 0 });
  public readonly readonlyAps4023_CTotal = signal<{ Returned_Amount: number; pur_net: number; pur_tax: number }>({ Returned_Amount: 0, pur_net: 0, pur_tax: 0 });

  public readonly readonlyAps3001Footer = computed(() => ({ ACP_Amt: this.readonlyAps3001Total() }));
  public readonly readonlyArs3001Footer = computed(() => ({ ars_amt: this.readonlyArs3001Total() }));
  public readonly readonlyAps2002Footer = computed(() => this.readonlyAps2002Total());
  public readonly readonlyAps2002_CFooter = computed(() => this.readonlyAps2002_CTotal());
  public readonly readonlyAps4023Footer = computed(() => this.readonlyAps4023Total());
  public readonly readonlyAps4023_CFooter = computed(() => this.readonlyAps4023_CTotal());

  public readonly ars3001RelatedColumns: ReportColumn[] = [
    { field: 'org_id', header: '組織代號', visible: true, align: 'left' },
    { field: 'ven_no', header: '廠商代號', visible: true, align: 'left' },
    { field: 'ars_amt', header: '金額', visible: true, format: v => reportFormatAmount(v), align: 'right' },
    { field: 'pta_date', header: '預計收款日', visible: true, format: v => (v ? reportFormatDate(String(v)) : ''), align: 'left' },
    { field: 'ars_date', header: '立帳日期', visible: true, format: v => (v ? reportFormatDate(String(v)) : ''), align: 'left' },
    { field: 'acc_no', header: '會計科目代號', visible: true, align: 'left' },
    { field: 'note_desc', header: '摘要', visible: true, align: 'left' },
    { field: 'sub_detail_no', header: '對象別編號', visible: true, align: 'left' },
    { field: 'match_key', header: '對帳KEY值', visible: true, align: 'left' },
  ];

  public readonly aps3001RelatedColumns: ReportColumn[] = [
    { field: 'org_id', header: '組織代號', visible: true, align: 'left' },
    { field: 'VEN_No', header: '廠商代號', visible: true, align: 'left' },
    {
      field: 'VEN_PayType_Name', header: '付款方式', visible: true, format: (v, _i, row) => {
        const r = row as FIN53010Aps3001Row;
        return String(v ?? r?.VEN_PayType ?? '');
      },
      align: 'left'
    },
    { field: 'ACP_Amt', header: '金額', visible: true, format: v => reportFormatAmount(v), align: 'right' },
    { field: 'ACP_ExpectPayDate', header: '預計付款日', visible: true, format: v => (v ? reportFormatDate(String(v)) : ''), align: 'left' },
    { field: 'ACP_Date', header: '立帳日期', visible: true, format: v => (v ? reportFormatDate(String(v)) : ''), align: 'left' },
    { field: 'VEN_BNK_No', header: '匯款銀行代號', visible: true, align: 'left' },
    { field: 'VEN_BankAccountNo', header: '銀行帳號', visible: true, align: 'left' },
    { field: 'VEN_AccountName', header: '帳號名稱', visible: true, align: 'left' },
    { field: 'VEN_CTRLYN', header: '票據禁止背書轉讓', visible: true, align: 'left' },
    { field: 'VEN_CheckTitle', header: '票據抬頭', visible: true, align: 'left' },
    { field: 'AccNo', header: '會計科目代號', visible: true, align: 'left' },
    { field: 'AccCName', header: '會計科目名稱', visible: true, align: 'left' },
    { field: 'NoteDesc', header: '摘要', visible: true, align: 'left' },
    { field: 'SubDetailNo', header: '對象別編號', visible: true, align: 'left' },
    { field: 'PTA', header: '對帳KEY值', visible: true, align: 'left' },
  ];

  public readonly aps2002_CRelatedColumns: ReportColumn[] = [
    { field: 'Orig_RepYYYYMM', header: '原發票申報年月', visible: true, align: 'left' },
    { field: 'InvoiceNo', header: '發票號碼/憑證單號', visible: true, align: 'left' },
    { field: 'VoucherType', header: '發票格式', visible: true, align: 'left' },
    { field: 'Orig_InvoiceDate', header: '原發票日期', visible: true, format: v => (v ? reportFormatDate(String(v)) : ''), align: 'left' },
    { field: 'CreditDate', header: '退出/折讓日期', visible: true, format: v => (v ? reportFormatDate(String(v)) : ''), align: 'left' },
    { field: 'RepYYYYMM', header: '申報年月', visible: true, align: 'left' },
    { field: 'CreditTypeDesc', header: '區別', visible: true, align: 'left' },
    { field: 'Orig_Amount', header: '原發票總金額', visible: true, format: v => reportFormatAmount(v), align: 'right' },
    { field: 'BuyerUniformNo', header: '銷受人統一編號', visible: true, align: 'left' },
    { field: 'ReturnedAmount', header: '已退回/折讓總金額', visible: true, format: v => reportFormatAmount(v), align: 'right' },
    { field: 'CreditAmount', header: '退回/折讓總金額', visible: true, format: v => reportFormatAmount(v), align: 'right' },
    { field: 'TaxTypeDesc', header: '課稅別', visible: true, align: 'left' },
    { field: 'CreditNetAmount', header: '退回/折讓未稅金額', visible: true, format: v => reportFormatAmount(v), align: 'right' },
    { field: 'CreditTaxAmount', header: '退回/折讓稅額', visible: true, format: v => reportFormatAmount(v), align: 'right' },
  ];

  public readonly aps2002RelatedColumns: ReportColumn[] = [
    { field: 'VoucherType', header: '發票格式', visible: true, align: 'left' },
    {
      field: 'TrackNo',
      header: '字軌／發票號碼',
      align: 'left'
    },
    { field: 'InvoiceDate', header: '發票日期', visible: true, format: v => (v ? reportFormatDate(String(v)) : ''), align: 'left' },
    { field: 'DeclareYM', header: '申報年月', visible: true, align: 'left' },
    { field: 'VendorTaxID', header: '廠商統一編號', visible: true, align: 'left' },
    { field: 'InvoiceUsage', header: '發票用途', visible: true, align: 'left' },
    { field: 'InvoiceAmount', header: '發票總金額', visible: true, format: v => reportFormatAmount(v), align: 'right' },
    { field: 'TaxType', header: '課稅別', visible: true, align: 'left' },
    { field: 'NetAmount', header: '發票未稅金額', visible: true, format: v => reportFormatAmount(v), align: 'right' },
    { field: 'TaxAmount', header: '發票稅額', visible: true, format: v => reportFormatAmount(v), align: 'right' },
    { field: 'DeductionCodeDesc', header: '扣抵代號', visible: true, align: 'left' },
    { field: 'CategoryType', header: '類別區分', visible: true, align: 'left' },
    { field: 'SourceDocNo', header: '憑證單號', visible: true, align: 'left' },
    { field: 'TotalCount', header: '彙總張數', visible: true, align: 'left' },
  ];

  public readonly aps4023_CRelatedColumns: ReportColumn[] = [
    { field: 'Original_Invoice_DeclareYM', header: '原發票申報年月', visible: true, align: 'left' },
    { field: 'Invoice_Number', header: '發票號碼/憑證單號', visible: true, align: 'left' },
    { field: 'Invoice_Type', header: '發票格式', visible: true, align: 'left' },
    { field: 'Original_Invoice_Date', header: '原發票日期', visible: true, format: v => (v ? reportFormatDate(String(v)) : ''), align: 'left' },
    { field: 'Credit_Invoice_Date', header: '退出折讓日期', visible: true, format: v => (v ? reportFormatDate(String(v)) : ''), align: 'left' },
    { field: 'DeclareYM', header: '申報年月', visible: true, align: 'left' },
    { field: 'Credit_Type_Flag', header: '區別', visible: true, align: 'left' },
    { field: 'Buyer_Uniform_No', header: '買受人統一編號', visible: true, align: 'left' },
    { field: 'Returned_Amount_Zero', header: '已退回/折讓總金額', visible: true, format: v => reportFormatAmount(v), align: 'right' },
    { field: 'Returned_Amount', header: '退回/折讓總金額', visible: true, format: v => reportFormatAmount(v), align: 'right' },
    { field: 'Tax_Type', header: '課稅別', visible: true, align: 'left' },
    { field: 'pur_net', header: '退回/折讓未稅金額', visible: true, format: v => reportFormatAmount(v), align: 'right' },
    { field: 'pur_tax', header: '退回/折讓稅額', visible: true, format: v => reportFormatAmount(v), align: 'right' },
  ];

  public readonly aps4023RelatedColumns: ReportColumn[] = [
    { field: 'InvoiceType', header: '發票格式', visible: true, align: 'left' },
    {
      field: 'InvoiceNo',
      header: '字軌／發票號碼',
      format: (_v, _i, row) => {
        const r = row as Record<string, unknown>;
        return `${String(r['InvoicePrefix'] ?? '')}${String(r['InvoiceNo'] ?? '')}`;
      },
      align: 'left'
    },
    { field: 'InvoiceDate', header: '發票日期', visible: true, format: v => (v ? reportFormatDate(String(v)) : ''), align: 'left' },
    { field: 'DeclareYM', header: '申報年月', visible: true, align: 'left' },
    { field: 'BuyerUniform', header: '買受人統一編號', visible: true, align: 'left' },
    { field: 'TotalAmount', header: '發票總金額', visible: true, format: v => reportFormatAmount(v), align: 'right' },
    { field: 'TaxType', header: '課稅別', visible: true, align: 'left' },
    { field: 'NetAmount', header: '發票未稅金額', visible: true, format: v => reportFormatAmount(v), align: 'right' },
    { field: 'TaxAmount', header: '發票稅額', visible: true, format: v => reportFormatAmount(v), align: 'right' },
    { field: 'SourceDocNo', header: '憑證單號', visible: true, align: 'left' },
    { field: 'SummaryCount', header: '彙開註記', visible: true, align: 'left' },
    { field: 'AssetFlag', header: '資產註記', visible: true, align: 'left' },
    { field: 'InvoiceType', header: '發票使用別', visible: false, align: 'left' },
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
      || this.service.detailByVouNoLoading()
      || this.service.detailByVouNoForUpdateLoading()
      || this.lookupVouLoading()
      || this.service.bankNoLoading()
      || this.service.aps4023ByInvoiceLoading()
      || this.service.calculatedPayDateLoading();
  });

  /** 銷項／進項步驟表：已依 API 成功帶入的發票字串（列索引 → 完整 10 碼），避免重複請求 */
  private readonly lastSalesInvoiceLookupKey = new Map<number, string>();
  private readonly lastPurchaseInvoiceLookupKey = new Map<number, string>();
  /** 應付帳款預計付款日：列索引查詢去重鍵（列索引 → ven_no|yyyy-MM-dd） */
  private readonly lastStepApPayDateLookupKey = new Map<number, string>();
  private hasShownStepApPayDateError = false;

  // 載入資料的 effect（不 destroy，以便刪除明細重載或依傳票編號重載時仍能同步表單）
  public readonly dataEffect = effect(() => {
    if (this.isFormCreateable) return;
    this.service.noteDescLoading();
    const data = this.fin53010DetailData();
    if (!data?.Details) {
      this._lastAppliedDetailTableFingerprint = null;
      return;
    }

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

    if (!this.areDetailMapsReady()) {
      return;
    }

    const fp = this.buildDetailTableFingerprint(data);
    if (fp === this._lastAppliedDetailTableFingerprint) {
      return;
    }
    this._lastAppliedDetailTableFingerprint = fp;

    this.tableData.set(data.Details.map((v, index) => ({
      ...v,
      AccAmtC: v.AccDC === 'C' ? v.AccAmt : void 0,
      AccAmtD: v.AccDC === 'D' ? v.AccAmt : void 0,
      AccCName: this.service.accNoMap().get(String(v.AccNo))?.label,
      DetailName: this.service.vendorMap().get(String(v.DetailNo))?.label
        ?? this.service.usrMap().get(String(v.DetailNo))?.label,
      NoteDesc: v.NoteDesc || this.service.noteDescMap().get(String(v.AccNo))?.label,
      SerNo: (index + 1) * 10, // 序號從 10 起，10 為單位遞增
    })));

    const rows = this.tableData();
    this.logger.debug(`loadingDetail:`, {
      data,
      form: this.dataForm.getRawValue(),
      tableRowCount: rows.length,
      tableSample: rows.slice(0, 5),
    });
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
        width: '280px',
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
        templateDisplayField: 'DetailName',
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
        field: 'PTA',
        header: '立沖代號',
        textAlign: 'left',
        type: 'dropdown',
        options: (rowData: { AccNo?: string }) => {
          const { AccNo } = rowData || {};
          if (!AccNo) return this.emptyClearingOptions;
          return this.service.ptaOptions().get(AccNo) || this.emptyClearingOptions;
        },
        triggerFields: ['AccNo'],
        optionLabel: 'label',
        optionValue: 'value',
        // 若該 AccNo 的下拉選項已查回但載入回來的 PTA 不在其中（已立沖打平的舊值）→ 改用文字輸入框
        dropdownFallbackToInput: true,
        isOptionsLoaded: (row: { AccNo?: string }) =>
          !!row?.AccNo && this.service.ptaOptions().has(row.AccNo),
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
    { field: 'TempNo', header: '傳票號碼', align: 'left' },
    { field: 'TempName', header: '傳票代號', align: 'left' },
    { field: 'VouType', header: '傳票類型', format: v => this.service.vouTypeOptions.find(({ value }) => value === v)?.label ?? v, align: 'left' },
  ];

  public readonly stepAPColumns: EditColumn[] = [
    { field: 'org_id', header: '組織代號', textAlign: 'left', type: 'dropdown', options: () => this.service.orgNoOptions(), optionLabel: 'label', optionValue: 'value', disabled: () => true },
    { field: 'ven_no', header: '廠商代號', textAlign: 'left', type: 'dropdown', options: () => this.service.vendorOptions(), optionLabel: 'label', optionValue: 'value', disabled: () => true },
    { field: 'ven_pay_type', header: '付款方式', textAlign: 'left', type: 'dropdown', options: () => this.service.venPayTypeOptions(), optionLabel: 'label', optionValue: 'value', disabled: () => true },
    { field: 'acp_amt', header: '金額', textAlign: 'right', width: '7rem', type: 'inputNumber', disabled: () => true },
    { field: 'acp_expect_pay_date', header: '預計付款日', textAlign: 'left', width: '9rem', type: 'date', disabled: () => true },
    { field: 'acp_date', header: '立帳日期', textAlign: 'left', width: '9rem', type: 'date', disabled: () => true },
    { field: 'ven_bnk_no', header: '匯款銀行代號', textAlign: 'left', type: 'dropdown', options: () => this.bankNoOptionsForStep(), optionLabel: 'label', optionValue: 'value', disabled: () => true },
    { field: 'ven_bank_account', header: '銀行帳號/帳戶名稱', textAlign: 'left', type: 'input', disabled: () => true },
    { field: 'ven_ctrlyn', header: '票據禁止背書轉讓', textAlign: 'left', width: '8rem', type: 'dropdown', options: () => this.service.yesNoOptions(), optionLabel: 'label', optionValue: 'value' },
    { field: 'ven_check_title', header: '票據抬頭', textAlign: 'left', type: 'input', disabled: () => true },
    { field: 'acc_no', header: '會計科目代號', textAlign: 'left', type: 'dropdown', options: () => this.service.accNoOptions(), optionLabel: 'label', optionValue: 'value', disabled: () => true },
    { field: 'note_desc', header: '摘要', textAlign: 'left', type: 'input' },
  ];

  public readonly stepARColumns: EditColumn[] = [
    { field: 'org_id', header: '組織代號', type: 'dropdown', textAlign: 'left', options: () => this.service.orgNoOptions(), optionLabel: 'label', optionValue: 'value', disabled: () => true },
    { field: 'ven_no', header: '廠商代號', type: 'dropdown', textAlign: 'left', options: () => this.service.vendorOptions(), optionLabel: 'label', optionValue: 'value', disabled: () => true },
    { field: 'ars_amt', header: '金額', type: 'inputNumber', disabled: () => true, textAlign: 'right' },
    { field: 'pta_date', header: '預計收款日', type: 'date', textAlign: 'left' },
    { field: 'ars_date', header: '立帳日期', type: 'date', disabled: () => true, textAlign: 'left' },
    { field: 'acc_no', header: '會計科目代號', type: 'dropdown', textAlign: 'left', options: () => this.service.accNoOptions(), optionLabel: 'label', optionValue: 'value', disabled: () => true },
    { field: 'note_desc', header: '摘要', type: 'input', textAlign: 'left' },
  ];

  public readonly stepSalesColumns: EditColumn[] = [
    { field: 'invoice_type', header: '發票格式', type: 'dropdown', options: () => this.service.purGUIPaperOptions(), optionLabel: 'label', optionValue: 'value', textAlign: 'left' },
    { field: 'invoice_prefix', header: '字軌', type: 'input', maxLength: 2, textAlign: 'left' },
    { field: 'invoice_no', header: '發票號碼', type: 'input', maxLength: 8, textAlign: 'left' },
    { field: 'invoice_date', header: '發票日期', textAlign: 'left', width: '10rem', type: 'date' },
    { field: 'declare_ym', header: '申報年月', textAlign: 'left', width: '10rem', type: 'date', view: 'month', dateFormat: 'yy/mm' },
    { field: 'buyer_uniform', header: '買受人統一編號', textAlign: 'left', type: 'dropdown', options: () => this.service.vendorOptions(), optionLabel: 'label', optionValue: 'value' },
    { field: 'total_amount', header: '發票總金額', type: 'inputNumber', textAlign: 'right', format: (v) => (v !== null && v !== undefined) ? formatAmount(v) : '' },
    { field: 'tax_type', header: '課稅別', type: 'dropdown', options: () => this.service.taxTypeOptions(), optionLabel: 'label', optionValue: 'value', textAlign: 'left' },
    { field: 'net_amount', header: '發票未稅金額', type: 'inputNumber', textAlign: 'right', format: (v) => (v !== null && v !== undefined) ? formatAmount(v) : '' },
    { field: 'tax_amount', header: '發票稅額', type: 'inputNumber', textAlign: 'right', format: (v) => (v !== null && v !== undefined) ? formatAmount(v) : '' },
    { field: 'source_doc_no', header: '憑證單號', type: 'input', textAlign: 'left' },
    { field: 'summary_count', header: '彙整單號', type: 'inputNumber', textAlign: 'left' },
    { field: 'asset_flag', header: '資產註記', type: 'dropdown', options: () => this.service.assetTypeOptions(), optionLabel: 'label', optionValue: 'value', textAlign: 'left' },
  ];

  public readonly stepPurchaseColumns: EditColumn[] = [
    { field: 'voucher_type', header: '發票格式', type: 'dropdown', options: () => this.service.purGUIPaperOptions(), optionLabel: 'label', optionValue: 'value', textAlign: 'left' },
    { field: 'track_no', header: '字軌', type: 'input', maxLength: 2, textAlign: 'left' },
    { field: 'invoice_no', header: '發票號碼', type: 'input', maxLength: 8, textAlign: 'left' },
    { field: 'invoice_date', header: '發票日期', textAlign: 'left', width: '10rem', type: 'date' },
    { field: 'declare_ym', header: '申報年月', textAlign: 'left', width: '10rem', type: 'date', view: 'month', dateFormat: 'yy/mm' },
    { field: 'vendor_tax_id', header: '廠商統一編號', textAlign: 'left', type: 'dropdown', options: () => this.service.vendorUniformOptions(), optionLabel: 'label', optionValue: 'value' },
    { field: 'invoice_usage', header: '發票用途', type: 'dropdown', options: () => this.service.purDirectTypeOptions(), optionLabel: 'label', optionValue: 'value', textAlign: 'left' },
    { field: 'invoice_amount', header: '發票總金額', type: 'inputNumber', textAlign: 'right', format: (v) => (v !== null && v !== undefined) ? formatAmount(v) : '' },
    { field: 'tax_type', header: '課稅別', type: 'dropdown', options: () => this.service.taxTypeOptions(), optionLabel: 'label', optionValue: 'value', textAlign: 'left' },
    { field: 'net_amount', header: '發票未稅金額', type: 'inputNumber', textAlign: 'right', format: (v) => (v !== null && v !== undefined) ? formatAmount(v) : '' },
    { field: 'tax_amount', header: '發票稅額', type: 'inputNumber', textAlign: 'right', format: (v) => (v !== null && v !== undefined) ? formatAmount(v) : '' },
    { field: 'deduction_code', header: '扣抵代號', type: 'dropdown', options: () => this.service.purDiscNoOptions(), optionLabel: 'label', optionValue: 'value', textAlign: 'left' },
    { field: 'category_type', header: '類別區分', type: 'dropdown', options: () => this.service.purTypeOptions(), optionLabel: 'label', optionValue: 'value', disabled: () => true, textAlign: 'left' },
    { field: 'source_doc_no', header: '憑證單號', type: 'input', textAlign: 'left' },
    { field: 'comb', header: '彙加註記', type: 'input', textAlign: 'left' },
    { field: 'total_count', header: '彙整張數', type: 'inputNumber', validate: [this.validatePURCombCnt], textAlign: 'right' },
  ];

  private validateBankRequired(value: any, rowData: any, data: any[], field: string, header: string): { isValid: boolean, errorMessage: string[] } {
    if (value === '' || value === null || value === undefined) {
      return { isValid: false, errorMessage: [`${header}不可為空`] };
    }
    return { isValid: true, errorMessage: [] };
  }

  public readonly stepBankColumns: EditColumn[] = [
    { field: 'ven_no', header: '廠商代號', type: 'dropdown', options: () => this.service.vendorOptions(), optionLabel: 'label', optionValue: 'value', validate: [this.validateBankRequired.bind(this)], textAlign: 'left' },
    { field: 'bank_no', header: '銀行代號', type: 'dropdown', options: () => this.bankNoOptionsForStep(), optionLabel: 'label', optionValue: 'value', validate: [this.validateBankRequired.bind(this)], textAlign: 'left' },
    { field: 'deposit_amt', header: '存款', type: 'inputNumber', validate: [this.validateBankRequired.bind(this)], textAlign: 'right' },
    { field: 'withdraw_amt', header: '提款', type: 'inputNumber', validate: [this.validateBankRequired.bind(this)], textAlign: 'right' },
    { field: 'status', header: '狀態', type: 'dropdown', options: [{ label: '作廢', value: '0' }, { label: '建立', value: '1' }], optionLabel: 'label', optionValue: 'value', validate: [this.validateBankRequired.bind(this)], textAlign: 'left' },
    { field: 'note_desc', header: '摘要', type: 'input', textAlign: 'left' },
    { field: 'txn_date', header: '日期', type: 'date', disabled: () => true, textAlign: 'left' },
  ];

  private areDetailMapsReady(): boolean {
    return this.service.accNoMap().size > 0
      && this.service.vendorMap().size > 0
      && this.service.usrMap().size > 0
      && !this.service.noteDescLoading()
      && this.service.voucherTypeMap().size > 0;
  }

  /** 僅依 API 明細內容（不含畫面解析名稱），用於避免 maps 就緒後 effect 重複觸發 tableData.set */
  private buildDetailTableFingerprint(data: QueryFIN53010Detail): string {
    const rows = (data.Details ?? []).map(d => ({
      id: d.id,
      SerNo: d.SerNo,
      AccNo: d.AccNo,
      AccDC: d.AccDC,
      AccAmt: d.AccAmt,
      DetailNo: d.DetailNo ?? null,
      ORG_ID: d.ORG_ID ?? null,
      NoteDesc: d.NoteDesc ?? null,
      SubDetailNo: d.SubDetailNo ?? null,
    }));
    return `${data.id}|${data.VouNo}|${JSON.stringify(rows)}`;
  }

  /** 初次載入明細：借方在前、貸方在後；同側依會計科目代號遞增（與 onApplyTemplate 之 D/1、C/0 一致） */
  private sortInitialLoadFin53010Details(details: FIN53010Detail[]): FIN53010Detail[] {
    const isDebit = (dc: string | undefined): boolean => {
      const s = String(dc ?? '').trim();
      return s === 'D' || s === '1';
    };
    return [...details].sort((a, b) => {
      const aD = isDebit(a.AccDC);
      const bD = isDebit(b.AccDC);
      if (aD !== bD) return aD ? -1 : 1;
      return String(a.AccNo ?? '').localeCompare(String(b.AccNo ?? ''), void 0, { numeric: true });
    });
  }

  constructor(
    public readonly service: FIN53010Service,
    private readonly logger: NGXLogger,
    private readonly datePipe: DatePipe,
    private readonly injector: Injector,
  ) {
    super();
    this.user = this.authService.getUserInfo()!;
  }

  public ngOnInit(): void {
    this.initializePage('FIN53010', this.dataForm);

    this.service.getAccNoOptions();
    this.service.getVendorOptions();
    this.service.getVendorUniformOptions();
    this.service.getUsrOptions();
    this.service.getOrgNoOptions();
    this.service.getRefNameOptions();
    this.service.getAccDescOptions();
    this.service.getVoucherTypeOptions();
    this.service.getBankNoOptions();
    this.service.getStepDropdownOptions();

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
          const raw = res.Data;
          if (!raw) return;
          const details = this.sortInitialLoadFin53010Details(raw.Details ?? []);
          this.fin53010DetailData.set({ ...raw, Details: details });
          this.totalRecords.set(res.TotalCount);
          const accNos = Array.from(new Set(
            details.map(d => d.AccNo).filter((a): a is string => !!a && String(a).trim() !== ''),
          ));
          if (accNos.length) {
            this.service.getAccDescOptions(accNos);
            accNos.forEach(acc => this.service.getPTADropdownOptions(acc));
          }
          this.loadRelatedDetailByVouNo(raw.VouNo);
        },
      });
    }
  }

  public readonly canGoBack = computed(() => this.currentStep() > 1);
  public readonly canGoNext = computed(() => {
    if (!this.isFormCreateable && !this.isFormEditable) return false;
    const flow = [1, ...this.activeVoucherSteps()];
    return flow.indexOf(this.currentStep()) < flow.length - 1;
  });
  public readonly isLastStep = computed(() => {
    if (this.isFormReadable) return true;
    if (!this.isFormCreateable && !this.isFormEditable) return true;
    const flow = [1, ...this.activeVoucherSteps()];
    return this.currentStep() === flow[flow.length - 1];
  });

  /** 傳票明細中傳票型態為應付（3）之列數，與 stepRowsSyncEffect 篩選規則一致 */
  public readonly payableDetailRowCount = computed(() => {
    const map = this.service.accVoucherTypeMap();
    let n = 0;
    for (const row of this.tableData()) {
      const vt = map.get(String(row.AccNo ?? ''));
      if (String(vt) === '3') n++;
    }
    return n;
  });

  /** 依明細順序提供可對應的應付來源列（vt=3） */
  public readonly payableDetailSourceRows = computed(() => {
    const map = this.service.accVoucherTypeMap();
    return this.tableData().filter(row => String(map.get(String(row.AccNo ?? ''))) === '3');
  });

  /** 補發票 (INV_YN='Y') 僅自動跳至進項發票步驟一次 */
  private _hasAutoJumpedToStep5 = false;

  /** 應付步驟表是否允許插入列（不含唯讀；模板須再與 !isFormReadable 一併綁定） */
  public readonly stepAPTableCanInsert = computed(() => {
    const max = this.payableDetailRowCount();
    return max > 0 && this.stepAPRows().length < max;
  });

  private readonly stepFlowEffect = effect(() => {
    if (this.isFormReadable) return;
    if (!this.isFormCreateable && !this.isFormEditable) return;
    const types = new Set<string>();
    for (const row of this.tableData()) {
      const accNo = String(row.AccNo ?? '');
      if (!accNo) continue;
      const t = this.service.accVoucherTypeMap().get(accNo);
      if (['3', '4', '5', '6', '7'].includes(String(t))) types.add(String(t));
    }
    const ordered = ['3', '4', '5', '6', '7']
      .filter(v => types.has(v))
      .map(v => Number(v));
    this.activeVoucherSteps.set(ordered);
    const flow = [1, ...ordered];
    if (!flow.includes(this.currentStep())) this.currentStep.set(1);
    // 補發票模式（INV_YN='Y'）且進項發票步驟啟用時，初次自動跳至 step5
    if (
      !this._hasAutoJumpedToStep5
      && this.dataForm.controls.INV_YN.value === 'Y'
      && ordered.includes(5)
      && this.currentStep() === 1
    ) {
      this._hasAutoJumpedToStep5 = true;
      this.currentStep.set(5);
    }
  }, { allowSignalWrites: true });

  /** 依傳票明細與 queryPOS2013（廠商主檔）同步應付／應收／銀行存款步驟表（僅新增模式） */
  private readonly stepRowsSyncEffect = effect(onCleanup => {
    if (!this.isFormCreateable) return;

    const table = this.tableData();
    const vouRaw = this.vouDateForStepSync();
    const vouDate = vouRaw instanceof Date ? vouRaw : (vouRaw ? new Date(vouRaw) : new Date());
    const accVt = this.service.accVoucherTypeMap();

    this.service.vendorOptions();

    const getVenOpt = (venNo: string | undefined) =>
      venNo ? this.service.findVendorOptionByVenNo(venNo) : undefined;

    const vensNeedingFin53010 = new Set<string>();
    for (const row of table) {
      const t = accVt.get(String(row.AccNo ?? ''));
      if (!['3', '4', '7'].includes(String(t))) continue;
      const ven = String(row.DetailNo ?? '').trim();
      if (ven) vensNeedingFin53010.add(ven);
    }

    if (vensNeedingFin53010.size > 0) {
      const sub = forkJoin([...vensNeedingFin53010].map(v => this.service.ensureFin53010VendorForSteps(v))).subscribe({
        error: err => this.logger.error('補詢廠商主檔 queryPOS2013_FIN53010 失敗', err),
      });
      onCleanup(() => sub.unsubscribe());
    }

    if (table.length === 0) {
      this.stepAPRows.set([]);
      this.stepARRows.set([]);
      this.stepBankRows.set([]);
      return;
    }

    this.stepRowsSyncBusy.set(!0);
    const timer = window.setTimeout(() => {
      try {
        const ap: FIN53010StepAP[] = [];
        const ar: FIN53010StepAR[] = [];
        const bk: FIN53010StepBankDeposit[] = [];

        for (const row of table) {
          const accNo = String(row.AccNo ?? '');
          const vt = accVt.get(accNo);
          if (!vt || !['3', '4', '7'].includes(String(vt))) continue;

          const venOpt = getVenOpt(String(row.DetailNo ?? ''));
          const amt = (row.AccAmtD ?? 0) + (row.AccAmtC ?? 0);
          const noteDesc = this.resolveNoteDescForStep(row);

          if (vt === '3') {
            ap.push(this.buildStepApRowFromDetailTableRow(row, vouDate));
          } else if (vt === '4') {
            ar.push({
              org_id: row.ORG_ID ?? '100000',
              ven_no: row.DetailNo,
              ars_amt: amt || undefined,
              ars_date: vouDate,
              acc_no: row.AccNo,
              note_desc: noteDesc,
            });
          } else if (vt === '7') {
            bk.push({
              ven_no: row.DetailNo,
              bank_no: venOpt?.['VEN_BNK_No'] != null ? String(venOpt['VEN_BNK_No']) : undefined,
              deposit_amt: row.AccAmtD ?? undefined,
              withdraw_amt: row.AccAmtC ?? undefined,
              note_desc: noteDesc,
              txn_date: vouDate,
            });
          }
        }

        const apWithSer = ap.map((r, i) => ({ ...r, SerNo: i + 1 }));
        const arWithSer = ar.map((r, i) => ({ ...r, SerNo: i + 1 }));
        const bkWithSer = bk.map((r, i) => ({ ...r, SerNo: i + 1 }));
        this.stepAPRows.set(apWithSer);
        this.stepARRows.set(arWithSer);
        this.stepBankRows.set(bkWithSer);
        this.autoFillStepApExpectedPayDate(apWithSer, onCleanup);
      } finally {
        this.stepRowsSyncBusy.set(!1);
      }
    }, 0);
    onCleanup(() => {
      window.clearTimeout(timer);
      this.stepRowsSyncBusy.set(!1);
    });
  }, { allowSignalWrites: true });

  private formatVenBankAccount(venOpt?: Option): string | undefined {
    if (!venOpt) return undefined;
    const a = venOpt['VEN_BankAccountNo'] as string | undefined | null;
    const b = venOpt['VEN_AccountName'] as string | undefined | null;
    if (a && b) return `${a} / ${b}`;
    const s = (a ?? b ?? '') as string;
    return s || undefined;
  }

  private buildStepApRowFromDetailTableRow(row: FIN53010DetailTable, vouDate: Date): FIN53010StepAP {
    const venOpt = this.service.findVendorOptionByVenNo(String(row.DetailNo ?? ''));
    const amt = (row.AccAmtD ?? 0) + (row.AccAmtC ?? 0);
    const venPayType = venOpt?.['VEN_PayType'] ?? undefined;
    /** 付款方式不為開票時，票據抬頭為空白 */
    const venCheckTitle = (venPayType === '2') ? (row.DetailName ?? venOpt?.['VEN_Name'] ?? undefined) : '';
    return {
      org_id: row.ORG_ID ?? '100000',
      ven_no: row.DetailNo,
      ven_pay_type: venPayType,
      acp_amt: amt || undefined,
      acp_date: vouDate,
      ven_bnk_no: venOpt?.['VEN_BNK_No'] != null ? String(venOpt['VEN_BNK_No']) : undefined,
      ven_bank_account: this.formatVenBankAccount(venOpt),
      ven_ctrlyn: venOpt?.['VEN_CTRLYN'] ?? 'Y',
      ven_check_title: venCheckTitle,
      acc_no: row.AccNo,
      note_desc: this.resolveNoteDescForStep(row),
    };
  }

  private autoFillStepApExpectedPayDate(rows: FIN53010StepAP[], onCleanup: (cleanupFn: () => void) => void): void {
    this.hasShownStepApPayDateError = false;
    if (!rows.length) {
      this.lastStepApPayDateLookupKey.clear();
      return;
    }
    const subscriptions: { unsubscribe: () => void; }[] = [];
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      // 若使用者或既有資料已有預計付款日，保留原值不覆寫
      if (row.acp_expect_pay_date) continue;
      const venNo = String(row.ven_no ?? '').trim();
      const acpDate = row.acp_date instanceof Date ? row.acp_date : null;
      const dateYmd = this.dateToYmdOrUndefined(acpDate);
      if (!venNo || !dateYmd) continue;
      const dedupeKey = `${venNo}|${dateYmd}`;
      if (this.lastStepApPayDateLookupKey.get(index) === dedupeKey) continue;

      const sub = this.service.getCalculatedPayDate({
        VenNo: venNo,
        _Date: dateYmd,
      }).pipe(take(1)).subscribe({
        next: res => {
          if (res.Status !== '0000') {
            if (!this.hasShownStepApPayDateError) {
              this.hasShownStepApPayDateError = true;
              this.messageService.errorBubble(res.Message ? `操作失敗：${res.Message}` : '預計付款日帶入失敗');
            }
            return;
          }
          const rawDate = res.Data;
          if (!rawDate) return;
          const parsed = new Date(rawDate);
          if (Number.isNaN(parsed.getTime())) return;
          this.lastStepApPayDateLookupKey.set(index, dedupeKey);
          this.stepAPRows.update(currentRows => {
            if (!currentRows[index]) return currentRows;
            // 保留使用者後續手動輸入值，僅在欄位仍為空時自動帶入
            if (currentRows[index].acp_expect_pay_date) return currentRows;
            const next = [...currentRows];
            next[index] = { ...next[index], acp_expect_pay_date: parsed };
            return next;
          });
        },
        error: () => {
          if (!this.hasShownStepApPayDateError) {
            this.hasShownStepApPayDateError = true;
            this.messageService.errorBubble('預計付款日帶入失敗');
          }
        },
      });
      subscriptions.push(sub);
    }
    onCleanup(() => {
      subscriptions.forEach(sub => sub.unsubscribe());
    });
  }

  private resolveNoteDescForStep(row: FIN53010DetailTable): string {
    const n = row.NoteDesc;
    if (n === void 0 || n === null) return '';
    const mapped = this.service.noteDescMap().get(String(n))?.label;
    return mapped ?? String(n);
  }

  private dateToYmdOrUndefined(d: Date | null | undefined): string | undefined {
    if (d == null) return undefined;
    return this.datePipe.transform(d, 'yyyy-MM-dd') ?? undefined;
  }

  private clearStepNavigateBusyAfterRender(): void {
    afterNextRender(() => {
      this.stepNavigateBusy.set(!1);
    }, { injector: this.injector });
  }

  private parseSummaryInvoiceToken(raw: string | null | undefined): Pick<FIN53010StepSalesInvoiceRow, 'invoice_type' | 'invoice_prefix' | 'invoice_no'> | null {
    const text = String(raw ?? '').trim();
    if (!text) return null;
    const hit = FIN53010CRUComponent.SUMMARY_INVOICE_REGEX.exec(text);
    if (!hit) return null;
    const [, prefix, invoiceNo, invoiceType] = hit;
    return {
      invoice_type: invoiceType,
      invoice_prefix: prefix.toUpperCase(),
      invoice_no: invoiceNo,
    };
  }

  private buildInvoiceDedupKey(invoiceType: string | null | undefined, prefix: string | null | undefined, invoiceNo: string | null | undefined): string {
    return `${String(invoiceType ?? '').trim().toUpperCase()}|${String(prefix ?? '').trim().toUpperCase()}|${String(invoiceNo ?? '').trim()}`;
  }

  private hydrateSalesRowByInvoice(index: number, prefix: string, no: string): void {
    if (this.isFormReadable) return;
    if (index < 0) return;
    if (prefix.length !== 2 || no.length !== 8) return;
    const full = `${prefix}${no}`;
    if (this.lastSalesInvoiceLookupKey.get(index) === full) return;

    this.service.queryAps4023DetailDataByInvoiceNumber({ InvoiceNumber: full }).pipe(take(1)).subscribe({
      next: res => {
        // 查無資料（9102）屬正常情境（新發票），靜默跳過不報錯
        if (res.Status !== '0000') return;
        const d = res.Data;
        if (!d) return;
        this.lastSalesInvoiceLookupKey.set(index, full);
        const patch = this.mapAps4023ToSalesRow(d, prefix, no);
        this.stepSalesRows.update(rows => {
          const next = [...rows];
          if (!next[index]) return rows;
          next[index] = { ...next[index], ...patch };
          return next;
        });
      },
    });
  }

  private hydratePurchaseRowByInvoice(index: number, prefix: string, no: string): void {
    if (this.isFormReadable) return;
    if (index < 0) return;
    if (prefix.length !== 2 || no.length !== 8) return;
    const full = `${prefix}${no}`;
    if (this.lastPurchaseInvoiceLookupKey.get(index) === full) return;

    this.service.queryAps4023DetailDataByInvoiceNumber({ InvoiceNumber: full }).pipe(take(1)).subscribe({
      next: res => {
        // 查無資料（9102）屬正常情境（新發票），靜默跳過不報錯
        if (res.Status !== '0000') return;
        const d = res.Data;
        if (!d) return;
        this.lastPurchaseInvoiceLookupKey.set(index, full);
        const patch = this.mapAps4023ToPurchaseRow(d, prefix, no);
        this.stepPurchaseRows.update(rows => {
          const next = [...rows];
          if (!next[index]) return rows;
          const merged = { ...next[index], ...patch };
          const discNo = String(merged.deduction_code ?? '');
          const purType = (discNo === '1' || discNo === '3') ? '1' : discNo ? '2' : merged.category_type;
          next[index] = { ...merged, category_type: purType };
          return next;
        });
      },
    });
  }

  private appendStepInvoiceRowsFromSummaryForStep(step: number): void {
    if (this.isFormReadable) return;
    if (step !== 5 && step !== 6) return;

    const accVoucherTypeMap = this.service.accVoucherTypeMap();
    const rows = this.tableData();
    const salesRowsToAppend: FIN53010StepSalesInvoiceRow[] = [];
    const purchaseRowsToAppend: FIN53010StepPurchaseInvoiceRow[] = [];
    const salesKeys = new Set(
      this.stepSalesRows().map(r =>
        this.buildInvoiceDedupKey(r.invoice_type, r.invoice_prefix, r.invoice_no),
      ),
    );
    const purchaseKeys = new Set(
      this.stepPurchaseRows().map(r =>
        this.buildInvoiceDedupKey(r.voucher_type, r.track_no, r.invoice_no),
      ),
    );

    for (const row of rows) {
      const accNo = String(row.AccNo ?? '').trim();
      if (!accNo) continue;
      const vt = String(accVoucherTypeMap.get(accNo) ?? '').trim();
      if (vt !== '5' && vt !== '6') continue; // 5:進項發票, 6:銷項發票
      const noteDesc = this.resolveNoteDescForStep(row);
      const parsed = this.parseSummaryInvoiceToken(noteDesc);
      if (!parsed) continue;

      if (vt === '6') {
        const key = this.buildInvoiceDedupKey(parsed.invoice_type, parsed.invoice_prefix, parsed.invoice_no);
        if (salesKeys.has(key)) continue;
        salesKeys.add(key);
        salesRowsToAppend.push({ ...parsed });
        continue;
      }

      const key = this.buildInvoiceDedupKey(parsed.invoice_type, parsed.invoice_prefix, parsed.invoice_no);
      if (purchaseKeys.has(key)) continue;
      purchaseKeys.add(key);
      purchaseRowsToAppend.push({
        voucher_type: parsed.invoice_type,
        track_no: parsed.invoice_prefix,
        invoice_no: parsed.invoice_no,
      });
    }

    if (salesRowsToAppend.length) {
      const salesStartIndex = this.stepSalesRows().length;
      const salesRowsWithSer = salesRowsToAppend.map((r, offset) => ({ ...r, SerNo: salesStartIndex + offset + 1 }));
      this.stepSalesRows.update(current => [...current, ...salesRowsWithSer]);
      salesRowsWithSer.forEach((r, offset) => {
        this.hydrateSalesRowByInvoice(salesStartIndex + offset, String(r.invoice_prefix ?? '').trim(), String(r.invoice_no ?? '').trim());
      });
    }
    if (purchaseRowsToAppend.length) {
      const purchaseStartIndex = this.stepPurchaseRows().length;
      const purchaseRowsWithSer = purchaseRowsToAppend.map((r, offset) => ({ ...r, SerNo: purchaseStartIndex + offset + 1 }));
      this.stepPurchaseRows.update(current => [...current, ...purchaseRowsWithSer]);
      purchaseRowsWithSer.forEach((r, offset) => {
        this.hydratePurchaseRowByInvoice(purchaseStartIndex + offset, String(r.track_no ?? '').trim(), String(r.invoice_no ?? '').trim());
      });
    }
  }

  public goNextStep(): void {
    if (!this.isFormCreateable && !this.isFormEditable) return;
    if (this.nextStepBusy()) return;
    const flow = [1, ...this.activeVoucherSteps()];
    const idx = flow.indexOf(this.currentStep());
    if (idx >= flow.length - 1) return;
    const nextStep = flow[idx + 1];
    this.stepNavigateBusy.set(!0);
    window.setTimeout(() => {
      this.currentStep.set(nextStep);
      this.appendStepInvoiceRowsFromSummaryForStep(nextStep);
      this.clearStepNavigateBusyAfterRender();
    }, 0);
  }

  public goPrevStep(): void {
    if (!this.isFormCreateable && !this.isFormEditable) return;
    if (this.nextStepBusy()) return;
    const flow = [1, ...this.activeVoucherSteps()];
    const idx = flow.indexOf(this.currentStep());
    if (idx <= 0) return;
    const prevStep = flow[idx - 1];
    this.stepNavigateBusy.set(!0);
    window.setTimeout(() => {
      this.currentStep.set(prevStep);
      this.appendStepInvoiceRowsFromSummaryForStep(prevStep);
      this.clearStepNavigateBusyAfterRender();
    }, 0);
  }

  public goToStep(step: number): void {
    if (!this.isFormCreateable && !this.isFormEditable) return;
    if (this.nextStepBusy()) return;
    const flow = [1, ...this.activeVoucherSteps()];
    if (!flow.includes(step)) return;
    if (this.currentStep() === step) return;
    this.stepNavigateBusy.set(!0);
    window.setTimeout(() => {
      this.currentStep.set(step);
      this.appendStepInvoiceRowsFromSummaryForStep(step);
      this.clearStepNavigateBusyAfterRender();
    }, 0);
  }

  /** 依「查詢傳票編號」呼叫 queryFIN53010 → queryFIN53010Detail 並刷新編輯頁 */
  public onLookupVoucherByVouNo(): void {
    if (this.isFormCreateable || this.lookupVouLoading()) return;
    const raw = this.lookupVouNo.value?.trim() ?? '';
    if (!raw) {
      this.messageService.errorBubble('請輸入傳票編號');
      return;
    }

    const payload: FIN53010Payload = {
      VouNoStart: raw,
      VouNoEnd: raw,
      PageIndex: 1,
      PageSize: 30,
      SortBy: [{ field: 'id', order: 1 }],
    };

    this.lookupVouLoading.set(!0);
    this.service.loadFIN53010(payload).pipe(
      switchMap(res => {
        if (res.Status !== '0000') {
          this.messageService.errorBubble(res.Message ? `操作失敗：${res.Message}` : '查詢傳票失敗');
          return EMPTY;
        }
        const rows = res.Data ?? [];
        if (rows.length === 0) {
          this.messageService.errorBubble('查無資料');
          return EMPTY;
        }
        this.rowdata = rows[0] as unknown as QueryFIN53010Detail;
        return this.service.loadFIN53010Detail(this.rowdata!.id);
      }),
      tap(res => {
        if (!res || res.Status !== '0000') {
          if (res && res.Status !== '0000') {
            this.messageService.errorBubble(res.Message ? `操作失敗：${res.Message}` : '載入傳票明細失敗');
          }
          return;
        }
        this.fin53010DetailData.set(res.Data);
        this.totalRecords.set(res.TotalCount);
        const accNos = Array.from(new Set(
          (res.Data?.Details ?? []).map(d => d.AccNo).filter((a): a is string => !!a && String(a).trim() !== ''),
        ));
        if (accNos.length) {
          this.service.getAccDescOptions(accNos);
          accNos.forEach(acc => this.service.getPTADropdownOptions(acc));
        }
        this.loadRelatedDetailByVouNo(res.Data?.VouNo);
        this.messageService.successBubble('已載入傳票');
      }),
      finalize(() => this.lookupVouLoading.set(!1)),
    ).subscribe();
  }

  private clearRelatedDetailTables(): void {
    this.ars3001RelatedRows.set([]);
    this.aps3001RelatedRows.set([]);
    this.aps2002_CRelatedRows.set([]);
    this.aps2002RelatedRows.set([]);
    this.aps4023_CRelatedRows.set([]);
    this.aps4023RelatedRows.set([]);
    this.readonlyAps3001Total.set(0);
    this.readonlyArs3001Total.set(0);
    this.readonlyAps2002Total.set({ InvoiceAmount: 0, NetAmount: 0, TaxAmount: 0 });
    this.readonlyAps2002_CTotal.set({ CreditAmount: 0, CreditNetAmount: 0, CreditTaxAmount: 0 });
    this.readonlyAps4023Total.set({ TotalAmount: 0, NetAmount: 0, TaxAmount: 0 });
    this.readonlyAps4023_CTotal.set({ Returned_Amount: 0, pur_net: 0, pur_tax: 0 });
  }

  private clearEditStepDetailRows(): void {
    this.stepAPRows.set([]);
    this.stepARRows.set([]);
    this.stepSalesRows.set([]);
    this.stepPurchaseRows.set([]);
    this.stepBankRows.set([]);
    this.stepAPTotal.set(0);
    this.stepARTotal.set(0);
    this.stepPurchaseTotal.set({ invoice_amount: 0, net_amount: 0, tax_amount: 0 });
    this.stepSalesTotal.set({ total_amount: 0, net_amount: 0, tax_amount: 0 });
    this.stepBankTotal.set({ deposit_amt: 0, withdraw_amt: 0 });
  }

  /**
   * 查看：queryFIN53010DetailData_ByVouNo → 六張唯讀表。
   * 編輯可寫：queryFIN53010DetailData_ByVouNo_forupdate → 步驟表（契約見 Swagger）。
   */
  private loadRelatedDetailByVouNo(vouNo: string | undefined | null): void {
    const v = typeof vouNo === 'string' ? vouNo.trim() : '';
    if (!v || v === '自動給號') {
      this.clearRelatedDetailTables();
      this.clearEditStepDetailRows();
      return;
    }
    if (this.isFormEditable) {
      this.service.queryFIN53010DetailDataByVouNoForUpdate({ VouNo: v }).subscribe({
        next: res => {
          if (res.Status !== '0000' || !res.Data) {
            this.clearRelatedDetailTables();
            this.clearEditStepDetailRows();
            return;
          }
          const mapped = mapFin53010ForUpdateResponseToStepRows(res.Data);
          this.stepAPRows.set(mapped.stepAPRows);
          this.stepARRows.set(mapped.stepARRows);
          this.stepSalesRows.set(mapped.stepSalesRows);
          this.stepPurchaseRows.set(mapped.stepPurchaseRows);
          this.stepBankRows.set(mapped.stepBankRows);
          // 預填 lookup key，避免 edit 模式下 blur invoice_no 時觸發 APS4023 查詢覆蓋 DB 資料
          this.lastPurchaseInvoiceLookupKey.clear();
          mapped.stepPurchaseRows.forEach((r, i) => {
            const t = String(r.track_no ?? '').trim();
            const n = String(r.invoice_no ?? '').trim();
            if (t.length === 2 && n.length === 8) this.lastPurchaseInvoiceLookupKey.set(i, `${t}${n}`);
          });
          this.lastSalesInvoiceLookupKey.clear();
          mapped.stepSalesRows.forEach((r, i) => {
            const t = String(r.invoice_prefix ?? '').trim();
            const n = String(r.invoice_no ?? '').trim();
            if (t.length === 2 && n.length === 8) this.lastSalesInvoiceLookupKey.set(i, `${t}${n}`);
          });
          this.stepAPTotal.set(res.Data.Total_ACP_Amt ?? 0);
          this.stepARTotal.set(res.Data.Total_ARS_Amt ?? 0);
          this.stepPurchaseTotal.set({
            invoice_amount: res.Data.Total_PUR_Amt_APS2002 ?? 0,
            net_amount: res.Data.Total_PUR_Net_APS2002 ?? 0,
            tax_amount: res.Data.Total_PUR_Tax_APS2002 ?? 0,
          });
          this.stepSalesTotal.set({
            total_amount: res.Data.Total_PUR_Amt_APS4023 ?? 0,
            net_amount: res.Data.Total_PUR_Net_APS4023 ?? 0,
            tax_amount: res.Data.Total_PUR_Tax_APS4023 ?? 0,
          });
          this.stepBankTotal.set({
            deposit_amt: res.Data.Total_DAmt ?? 0,
            withdraw_amt: res.Data.Total_CAmt ?? 0,
          });
          this.clearRelatedDetailTables();
        },
        error: () => {
          this.clearRelatedDetailTables();
          this.clearEditStepDetailRows();
        },
      });
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

        const aps3001: FIN53010Aps3001Row[] = pick(d._APS3001).map(item => ({
          ...item,
          VEN_CTRLYN: item.VEN_CTRLYN?.toUpperCase() == 'Y' ? '是' : '否',
        }));

        this.ars3001RelatedRows.set(pick(d._ARS3001));
        this.aps3001RelatedRows.set(aps3001);
        this.aps2002_CRelatedRows.set(pick(d._APS2002_C));
        this.aps2002RelatedRows.set(pick(d._APS2002));
        this.aps4023_CRelatedRows.set(pick(d._APS4023_C));
        this.aps4023RelatedRows.set(pick(d._APS4023));
        this.readonlyAps3001Total.set(d._APS3001?.Total_ACP_Amt ?? 0);
        this.readonlyArs3001Total.set(d._ARS3001?.Total_ars_amt ?? 0);
        this.readonlyAps2002Total.set({
          InvoiceAmount: d._APS2002?.Total_InvoiceAmount ?? 0,
          NetAmount: d._APS2002?.Total_NetAmount ?? 0,
          TaxAmount: d._APS2002?.Total_TaxAmount ?? 0,
        });
        this.readonlyAps2002_CTotal.set({
          CreditAmount: d._APS2002_C?.Total_CreditAmount ?? 0,
          CreditNetAmount: d._APS2002_C?.Total_CreditNetAmount ?? 0,
          CreditTaxAmount: d._APS2002_C?.Total_CreditTaxAmount ?? 0,
        });
        this.readonlyAps4023Total.set({
          TotalAmount: d._APS4023?.Total_TotalAmount ?? 0,
          NetAmount: d._APS4023?.Total_NetAmount ?? 0,
          TaxAmount: d._APS4023?.Total_TaxAmount ?? 0,
        });
        this.readonlyAps4023_CTotal.set({
          Returned_Amount: d._APS4023_C?.Total_Returned_Amount ?? 0,
          pur_net: d._APS4023_C?.Total_pur_net ?? 0,
          pur_tax: d._APS4023_C?.Total_pur_tax ?? 0,
        });
      },
      error: () => this.clearRelatedDetailTables(),
    });
  }

  /**
   * 驗證傳票明細行
   * 1. 當會計科目為 '123208' 時，組織代號必須為特定的幾個值
   */
  public readonly validateRow = (rowData: FIN53010DetailTable): { isValid: boolean, errorMessage: string; } => {
    const accNo = String(rowData.AccNo ?? '').trim();
    const orgId = String(rowData.ORG_ID ?? '').trim();

    if (accNo === '123208') {
      const allowedOrgIds = ['107400', '107500', '100200', '100210', '100300', '100310', '106000'];
      if (!allowedOrgIds.includes(orgId)) {
        return { isValid: false, errorMessage: '組織代號有誤。只可以輸入以下組織代號: 107400, 107500, 100200, 100210, 100300, 100310, 106000' };
      }
    }

    return { isValid: true, errorMessage: '' };
  };

  public onSubmit(): void {
    const valid = this.purchaseTableEditComponent?.validateAndShowErrors();
    const bankValid = this.bankTableEditComponent?.validateAndShowErrors();

    if (valid === false || bankValid === false) {
      return;
    }

    this.handleSubmit(this.dataForm, () => {
      if ((this.isFormCreateable || this.isFormEditable) && !this.isLastStep()) {
        this.messageService.warnBubble('請先完成所有步驟，再進行送出');
        return;
      }
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
      const voucherTypePadded = (voucherTypeValue?.padEnd(3, ' ')) || 'GL ';

      const mapperDeps: Fin53010PayloadMapperDeps = {
        datePipe: this.datePipe,
        resolveNoteDesc: (note, row) =>
          this.service.noteDescMap().get(String(note))?.label ?? (note != null ? String(note) : undefined),
        getVendorOption: v => this.service.findVendorOptionByVenNo(v),
      };

      this.tableLoading.set(!0);
      const request: Observable<FIN53010InsertResult | FIN53010UpdateResult> = this.isFormCreateable
        ? this.service.insertFIN53010Data(buildInsertFin53010Request({
          form: { ...d, VouDate: d.VouDate } as Record<string, unknown>,
          voucherTypePadded,
          tableData: this.tableData(),
          activeVoucherSteps: this.activeVoucherSteps(),
          stepAPRows: this.stepAPRows(),
          stepARRows: this.stepARRows(),
          stepSalesRows: this.stepSalesRows(),
          stepPurchaseRows: this.stepPurchaseRows(),
          stepBankRows: this.stepBankRows(),
          deps: mapperDeps,
        }))
        : this.service.updateFIN53010Data(buildUpdateFin53010Request({
          form: { ...d, VouDate: d.VouDate, VouNo } as Record<string, unknown>,
          voucherTypePadded,
          tableData: this.tableData(),
          activeVoucherSteps: this.activeVoucherSteps(),
          stepAPRows: this.stepAPRows(),
          stepARRows: this.stepARRows(),
          stepSalesRows: this.stepSalesRows(),
          stepPurchaseRows: this.stepPurchaseRows(),
          stepBankRows: this.stepBankRows(),
          masterId: this.rowdata!.id,
          deps: mapperDeps,
        }));


      this.logger.debug(`submit:`, [this.isFormCreateable ? 'insert' : 'update', d, this.tableData()]);
      request.pipe(
        finalize(() => this.tableLoading.set(!1)),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          const insertVouNo = this.isFormCreateable
            ? (res.Data as any).VouNo
            : undefined;
          this.messageService.successBubble(
            this.isFormCreateable
              ? (insertVouNo ? `新增成功，傳票號碼：${insertVouNo}` : '新增成功')
              : '更新成功',
          );
          this.onCancel();
        },
      });
    });
  }

  public onDataChange(data: FIN53010DetailTable[]): void {
    this.logger.debug(`onDataChange:`, [data]);
    const renumbered = data.map((row, i) => ({ ...row, SerNo: (i + 1) * 10, index: i }));
    this.tableData.set(renumbered);
    this.rowEditCanSave.set(this.tableData().some(row => row.AccNo && row.ORG_ID) || !!this.isBalanced());
  }

  public onStepAPDataChange(data: FIN53010StepAP[]): void {
    this.stepAPRows.set(data.map((row, i) => ({ ...row, SerNo: i + 1 })));
  }

  public onInsertStepApRow(): void {
    if (!this.stepAPTableCanInsert()) return;

    const current = this.stepAPRows();
    const sources = this.payableDetailSourceRows();
    const nextIndex = current.length;
    const source = sources[nextIndex];
    if (!source) return;

    const vouRaw = this.dataForm.controls.VouDate.value;
    const vouDate = vouRaw instanceof Date ? vouRaw : (vouRaw ? new Date(vouRaw) : new Date());
    const newRow: FIN53010StepAP = {
      ...this.buildStepApRowFromDetailTableRow(source, vouDate),
      id: undefined,
      SerNo: current.length + 1,
    };
    this.stepAPRows.set([...current, newRow]);
  }

  public onStepARDataChange(data: FIN53010StepAR[]): void {
    this.stepARRows.set(data.map((row, i) => ({ ...row, SerNo: i + 1 })));
  }

  public onStepSalesDataChange(data: FIN53010StepSalesInvoiceRow[]): void {
    this.stepSalesRows.set(data.map((row, i) => ({ ...row, SerNo: i + 1 })));
  }

  public onStepPurchaseDataChange(data: FIN53010StepPurchaseInvoiceRow[]): void {
    const normalized = data.map((row, i) => {
      const discNo = String(row.deduction_code ?? '');
      const purType = (discNo === '1' || discNo === '3') ? '1' : discNo ? '2' : row.category_type;
      return { ...row, category_type: purType, SerNo: i + 1 };
    });
    this.stepPurchaseRows.set(normalized);
  }

  public onStepBankDataChange(data: FIN53010StepBankDeposit[]): void {
    this.stepBankRows.set(data.map((row, i) => ({ ...row, SerNo: i + 1 })));
  }

  /** 銷項步驟表：字軌 2 碼 + 發票號碼 8 碼齊備時查 APS4023 並帶入該列 */
  public onStepSalesInvoiceFieldChange(event: StepFieldChangeEvent): void {
    if (this.isFormReadable) return;
    const f = event.field;
    if (f !== 'invoice_prefix' && f !== 'invoice_no') return;
    const idx = event.index;
    if (typeof idx !== 'number' || idx < 0) return;
    const row = event.rowData as FIN53010StepSalesInvoiceRow;
    const prefix = String(row.invoice_prefix ?? '').trim();
    const no = String(row.invoice_no ?? '').trim();
    if (prefix.length !== 2 || no.length !== 8) return;
    this.hydrateSalesRowByInvoice(idx, prefix, no);
  }

  /** 檢核彙總張數
   *
   * 當格式(voucher_type)為26, 27時, 必填
   */
  private validatePURCombCnt(value: any, rowData: any, data: any[], field: string, header: string): { isValid: boolean, errorMessage: string[] } {
    const validData = {
      isValid: true,
      errorMessage: []
    }
    const invalidData = {
      isValid: false,
      errorMessage: ['彙總張數不可為空']
    }

    const vt = String(rowData['voucher_type'] ?? '').trim();
    const invoiceNo = String(rowData['invoice_no'] ?? '').trim();
    const isEmpty = value === '' || value === null || value === undefined;

    // 格式為 26 或 27 時，彙總張數必填
    if ((vt === '26' || vt === '27') && isEmpty) {
      return invalidData;
    }
    // 格式為 22 或 25 且發票號碼為空白或 0000000000 時，彙總張數必填
    if ((vt === '22' || vt === '25') && (invoiceNo === '' || invoiceNo === '0000000000') && isEmpty) {
      return invalidData;
    }

    return validData
  }

  /** 進項步驟表：字軌 2 碼 + 發票號碼 8 碼齊備時查 APS4023 並帶入該列；
   *  發票日期選定後自動帶入申報年月（下一個雙數月）；
   *  申報年月手動選到奇數月時自動修正為下一個雙數月；
   *  廠商統一編號變更時自動帶入廠商代號（ven_no）；
   *  發票總金額或課稅別變更時自動計算未稅金額與稅額 */
  public onStepPurchaseInvoiceFieldChange(event: StepFieldChangeEvent): void {
    if (this.isFormReadable) return;
    const f = event.field;
    const idx = event.index;
    console.log('[PurchaseFieldChange]', f, idx, 'value=', event.value, 'invoice_date=', event.rowData['invoice_date']);
    if (typeof idx !== 'number' || idx < 0) return;
    const row = event.rowData as FIN53010StepPurchaseInvoiceRow;

    if (f === 'invoice_date' || f === 'declare_ym') {
      const srcDate = f === 'invoice_date'
        ? (row.invoice_date instanceof Date ? row.invoice_date : null)
        : (row.declare_ym instanceof Date ? row.declare_ym : null);
      if (!srcDate) return;
      // getMonth() 是 0-based：0=1月(奇), 1=2月(偶)...
      // 奇數月 → getMonth() % 2 === 0；偶數月 → getMonth() % 2 === 1
      const month = srcDate.getMonth();
      const nextEvenMonth = month % 2 === 0
        ? new Date(srcDate.getFullYear(), month + 1, 1) // 奇數月 → 下個月（偶數月）
        : new Date(srcDate.getFullYear(), month, 1);    // 偶數月 → 同月 1 日
      // 直接 mutate rowData（與 table-edit 內部 _tableData 同一引用），
      // 這樣後續 dataChange 帶出的 cleanData 就已包含更新後的 declare_ym
      event.rowData.declare_ym = nextEvenMonth;
      return;
    }

    // 廠商統一編號變更 → 自動帶入廠商代號
    if (f === 'vendor_tax_id') {
      const uniform = String(row.vendor_tax_id ?? '').trim();
      const venNo = uniform ? this.service.vendorUniformToVenNoMap().get(uniform) : undefined;
      event.rowData.ven_no = venNo;
      return;
    }

    // 發票總金額或課稅別變更 → 自動計算未稅金額與稅額
    if (f === 'invoice_amount' || f === 'tax_type') {
      const amount = row.invoice_amount;
      if (amount != null && amount > 0) {
        const taxType = String(row.tax_type ?? '').trim();
        if (taxType === '1') {
          // 應稅 5%：發票總金額為含稅價格
          const tax = Math.round(amount * 5 / 105);
          event.rowData.tax_amount = tax;
          event.rowData.net_amount = amount - tax;
        } else {
          // 零稅率、免稅、其他：稅額為 0，未稅 = 總金額
          event.rowData.tax_amount = 0;
          event.rowData.net_amount = amount;
        }
      }
      return;
    }

    // voucher_type 或 invoice_no 變更時重新計算彙加註記
    if (f === 'voucher_type' || f === 'invoice_no') {
      const vt = String(row.voucher_type ?? '').trim();
      const no = String(row.invoice_no ?? '').trim();
      const isSummary = (vt === '22' || vt === '25') && (no === '' || no === '0000000000');
      event.rowData.comb = isSummary ? 'A' : '';
    }

    if (f !== 'track_no' && f !== 'invoice_no') return;
    const prefix = String(row.track_no ?? '').trim();
    const no = String(row.invoice_no ?? '').trim();
    if (prefix.length !== 2 || no.length !== 8) return;
    this.hydratePurchaseRowByInvoice(idx, prefix, no);
  }

  private mapAps4023ToSalesRow(
    d: Aps4023DetailDataByInvoiceNumberData,
    prefix: string,
    no: string,
  ): Partial<FIN53010StepSalesInvoiceRow> {
    const invYm = d.INV_DeclareYM;
    const declareYm = invYm
      ? new Date(Number(String(invYm).slice(0, 4)), Number(String(invYm).slice(4, 6)) - 1, 1)
      : null;
    return {
      id: d.ID,
      invoice_type: d.InvoiceType ?? undefined,
      invoice_prefix: prefix,
      invoice_no: no,
      invoice_date: d.InvoiceDate ? parseApiDateToLocal(d.InvoiceDate) : null,
      declare_ym: declareYm,
      buyer_uniform: d.Buyer_Uniform ?? undefined,
      total_amount: d.PUR_Amt,
      tax_type: d.PUR_TaxType ?? undefined,
      net_amount: d.PUR_Net,
      tax_amount: d.PUR_Tax,
      source_doc_no: d.Source_Doc_No ?? undefined,
      asset_flag: d.AssetType ?? undefined,
    };
  }

  private mapAps4023ToPurchaseRow(
    d: Aps4023DetailDataByInvoiceNumberData,
    prefix: string,
    no: string,
  ): Partial<FIN53010StepPurchaseInvoiceRow> {
    const invYm = d.INV_DeclareYM;
    const declareYm = invYm
      ? new Date(Number(String(invYm).slice(0, 4)), Number(String(invYm).slice(4, 6)) - 1, 1)
      : null;
    const vendorTaxId = d.Seller_Uniform ?? undefined;
    const venNo = vendorTaxId ? this.service.vendorUniformToVenNoMap().get(vendorTaxId) : undefined;
    return {
      voucher_type: d.InvoiceType ?? undefined,
      track_no: prefix,
      invoice_no: no,
      invoice_date: d.InvoiceDate ? parseApiDateToLocal(d.InvoiceDate) : null,
      declare_ym: declareYm,
      vendor_tax_id: vendorTaxId,
      ven_no: venNo,
      invoice_amount: d.PUR_Amt,
      tax_type: d.PUR_TaxType ?? undefined,
      net_amount: d.PUR_Net,
      tax_amount: d.PUR_Tax,
      source_doc_no: d.Source_Doc_No ?? undefined,
      comb: (() => {
        const vt = String(d.InvoiceType ?? '').trim();
        const invoiceNo = String(no ?? '').trim();
        return (vt === '22' || vt === '25') && (invoiceNo === '' || invoiceNo === '0000000000') ? 'A' : '';
      })(),
    };
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
          // 如果摘要為空，自動帶入摘要
          if (!rowData.NoteDesc) {
            rowData.NoteDesc = String(this.service.noteDescMap()
              .get(event.value)?.data?.[0].label || event.value || '');
          }
          // 取得立沖代號下拉選單
          this.service.getPTADropdownOptions(String(event.value));
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
            .map((row, i) => ({ ...row, SerNo: (i + 1) * 10, index: i })),
        );
        continue;
      }
      if (idx > -1) ids.push(idx + 1);
    }

    if (!ids.length) return;
    this.tableLoading.set(!0);
    this.service.deleteFIN53010Data(ids[0]).pipe(
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
        SerNo: (index + 1) * 10,
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
            AccCName: this.service.accNoMap().get(String(v.AccNo))?.label,
            DetailName:
              this.service.vendorMap().get(String(v.DetailNo))?.label
              ?? this.service.usrMap().get(String(v.DetailNo))?.label
              ?? '',
            NoteDesc: v.NoteDesc || this.service.noteDescMap().get(String(v.AccNo))?.label,
            SerNo: (index + 1) * 10, // 序號從 10 起，10 為單位遞增
            index,
          };
        }));

        const accNos = Array.from(new Set(
          (data.Details || []).map(d => d.AccNo).filter((a): a is string => !!a && String(a).trim() !== ''),
        ));
        accNos.forEach(acc => this.service.getPTADropdownOptions(acc));
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

  public clearVenUsr(rowData: FIN53010DetailTable): void {
    rowData.DetailNo = '';
    rowData.DetailName = '';
  }

}
