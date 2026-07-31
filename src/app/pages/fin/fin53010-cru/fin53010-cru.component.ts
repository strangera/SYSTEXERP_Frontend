import { DatePipe } from '@angular/common';
import { afterNextRender, Component, computed, DestroyRef, effect, Injector, OnInit, signal, TemplateRef, ViewChild, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@others/component/table/table.component';
import { Column, FieldChangeEvent, formatAmount } from '@others/component/table/table.model';
import { QueryGLS3003AbatAcctResponse } from '@pages/fin/fin53010/fin53010.model';
import { FIN53010Service } from '@service/api/fin/fin53010.service';
import { Option } from '@service/utility/dropdown-api.model';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn, formatAmount as reportFormatAmount, formatDate as reportFormatDate } from '@shared/components/table-report/table-report.model';
import { ValidationService } from '@shared/service/validation.service';
import { NGXLogger } from 'ngx-logger';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { concatMap, EMPTY, finalize, forkJoin, map, Observable, of, startWith, switchMap, take, tap } from 'rxjs';
import { FIN52030Data, FIN52030DetailData } from '../fin52030/fin52030.model';
import { mapFin53010ForUpdateResponseToStepRows } from '../fin53010/fin53010-detail-for-update.mapper';
import { buildInsertFin53010Request, buildUpdateFin53010Request, Fin53010PayloadMapperDeps } from '../fin53010/fin53010-payload.mapper';
import {
  Aps2002DetailDataByInvoiceNoData,
  Aps4023DetailDataByInvoiceNumberData,
  EmployeeBankAccountItem,
  FIN53010Aps2002_CRow,
  FIN53010Aps2002Row,
  FIN53010Aps3001Row,
  FIN53010Aps4002ByVouNoRow,
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
  Pos4023DetailDataByInvoiceNumberData,
  QueryFIN53010Detail,
  SalesInvoicePickItem,
} from '../fin53010/fin53010.model';
import { TableEditComponent } from './table-edit/table-edit.component';
import { EditColumn, EditColumnExtend, FieldChangeEvent as StepFieldChangeEvent } from './table-edit/table-edit.model';

/** API 回傳的日期字串 解析為 local time Date，支援 YYYYMMDD / YYYY-MM-DD / YYYY/MM/DD / ISO */
function parseApiDateToLocal(s: string | null | undefined): Date | null {
  if (s == null || String(s).trim() === '') return null;
  const str = String(s).trim();
  // YYYYMMDD (8 pure digits)
  if (/^\d{8}$/.test(str)) {
    const y = Number(str.slice(0, 4)), m = Number(str.slice(4, 6)), d = Number(str.slice(6, 8));
    if (m < 1 || m > 12 || d < 1 || d > 31) return null;
    return new Date(y, m - 1, d);
  }
  // YYYY-MM-DD or YYYY/MM/DD (optionally followed by time)
  const match = /^(\d{4})[-/](\d{2})[-/](\d{2})/.exec(str);
  if (match) {
    const y = Number(match[1]), m = Number(match[2]), d = Number(match[3]);
    if (m < 1 || m > 12 || d < 1 || d > 31) return null;
    return new Date(y, m - 1, d);
  }
  return null;
}

@Component({
  selector: 'app-fin53010-cru',
  templateUrl: './fin53010-cru.component.html',
  standalone: true,
  imports: [
    ButtonModule,
    CheckboxModule,
    DialogModule,
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
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
})
export class FIN53010CRUComponent extends BasicCruPageComponent<QueryFIN53010Detail> implements OnInit {
  private static readonly SUMMARY_INVOICE_REGEX = /([A-Za-z]{2})(\d{8})\*(\d{2})\*/;

  @ViewChild('apTableEdit') apTableEditComponent?: TableEditComponent;
  @ViewChild('arTableEdit') arTableEditComponent?: TableEditComponent;
  @ViewChild('purchaseTableEdit') purchaseTableEditComponent?: TableEditComponent;
  @ViewChild('bankTableEdit') bankTableEditComponent?: TableEditComponent;
  @ViewChild('ptaDialogTable') ptaDialogTable!: TableComponent;

  private readonly venUsrTemplate = viewChild.required<TemplateRef<any>>('venUsrTemplate');
  // 銷項折讓：原始發票查詢 Dialog
  showSalesAllowancePickerDialog = false;
  salesAllowancePickerRowIndex: number | null = null;
  salesAllowancePickerRowData: FIN53010StepSalesInvoiceRow | null = null;
  salesAllowancePickerList: Aps4023DetailDataByInvoiceNumberData[] = [];
  salesAllowancePickerTotalRecords = 0;
  salesAllowancePickerLoading = false;
  salesAllowancePickerQueryControl = new FormControl<string>('');
  salesAllowancePickerSelectedItem: Aps4023DetailDataByInvoiceNumberData | null = null;
  public readonly salesAllowancePickerColumns: Column[] = [
    { field: 'InvoiceNumber', header: '發票號碼' },
    { field: 'InvoiceType', header: '發票格式', align: 'center' },
    { field: 'InvoiceDate', header: '發票日期', align: 'center', format: v => reportFormatDate(v) },
    { field: 'PUR_Amt', header: '原發票金額', align: 'right', format: v => reportFormatAmount(v) },
    { field: 'Buyer_Uniform', header: '買受人統一編號' },
    { field: 'AlreadyAllowanceAmt', header: '已退回/折讓金額', align: 'right', format: v => reportFormatAmount(v) },
    { field: 'PUR_TaxType', header: '課稅別', align: 'center' },
  ];

  // 銷項發票：雙擊「發票號碼」挑既有發票 Dialog（格式 31/32 查 POS4023、35 查 APS4023）
  showSalesInvoicePickerDialog = false;
  salesInvoicePickerRowIndex: number | null = null;
  salesInvoicePickerRowData: FIN53010StepSalesInvoiceRow | null = null;
  /** 目前 picker 來源：31/32 → POS4023；35 → APS4023 */
  private salesInvoicePickerSource: '31/32' | '35' = '31/32';
  salesInvoicePickerList: SalesInvoicePickItem[] = [];
  salesInvoicePickerTotalRecords = 0;
  salesInvoicePickerLoading = false;
  salesInvoicePickerQueryControl = new FormControl<string>('');
  salesInvoicePickerSelectedItem: SalesInvoicePickItem | null = null;
  public readonly salesInvoicePickerColumns: Column[] = [
    { field: 'InvoiceNumber', header: '發票號碼' },
    { field: 'InvoiceType', header: '發票格式', align: 'center' },
    { field: 'InvoiceDate', header: '發票日期', align: 'center', format: v => reportFormatDate(v) },
    { field: 'TotalAmount', header: '發票總金額', align: 'right', format: v => reportFormatAmount(v) },
    { field: 'BuyerUniform', header: '買受人統一編號' },
    { field: 'VoucherNo', header: '傳票編號', align: 'center' },
  ];

  // 進項折讓：原始發票查詢 Dialog
  showPurchaseAllowancePickerDialog = false;
  purchaseAllowancePickerRowIndex: number | null = null;
  purchaseAllowancePickerRowData: FIN53010StepPurchaseInvoiceRow | null = null;
  purchaseAllowancePickerList: Aps2002DetailDataByInvoiceNoData[] = [];
  purchaseAllowancePickerTotalRecords = 0;
  purchaseAllowancePickerLoading = false;
  purchaseAllowancePickerQueryControl = new FormControl<string>('');
  purchaseAllowancePickerSelectedItem: Aps2002DetailDataByInvoiceNoData | null = null;
  public readonly purchaseAllowancePickerColumns: Column[] = [
    { field: 'PUR_GUINo', header: '發票號碼' },
    { field: 'PUR_VoucherType', header: '發票格式', align: 'center' },
    { field: 'PUR_GUIDate', header: '發票日期', align: 'center', format: v => reportFormatDate(v) },
    { field: 'PUR_Amt', header: '原發票金額', align: 'right', format: v => reportFormatAmount(v) },
    { field: 'PUR_VenUniform', header: '廠商統一編號' },
    { field: 'AlreadyAllowanceAmt', header: '已退回/折讓金額', align: 'right', format: v => reportFormatAmount(v) },
    { field: 'PUR_TaxType', header: '課稅別', align: 'center' },
  ];

  public readonly dataForm = this.formBuilder.nonNullable.group({
    VouNo: new FormControl<string>('自動給號'),
    /** 傳票類別 1:現金收入 2:現金支出 3:轉帳傳票 */
    VouType: new FormControl<'1' | '2' | '3' | void>('3', [Validators.required]),
    /** 傳票狀態 0:作廢 1:建立 2:確認(取消確認動作) 3:過帳 */
    PostFlag: new FormControl<'0' | '1' | '2' | '3' | void>('1', [Validators.required]),
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

  // 立沖代號選取彈窗
  showPtaDialog = false;
  ptaDialogLoading = false;
  ptaDialogSelectedItem: QueryGLS3003AbatAcctResponse | null = null;
  ptaDialogData: QueryGLS3003AbatAcctResponse[] = [];
  ptaFilterForm = this.formBuilder.group({
    VouNo: [''],
    PTA: [''],
    VEN_No: [null as string | null],  // 廠商代號
    USR_No: [null as string | null],  // 員工代號（與 VEN_No 二選一）
  });
  ptaDialogColumns: Column[] = [
    { field: 'VouNo', header: '傳票號碼', visible: true },
    { field: 'NoteDesc', header: '摘要', visible: true },
    { field: 'DebitAmt', header: '借方(餘額)', visible: true, format: formatAmount, align: 'right' },
    { field: 'CreditAmt', header: '貸方(餘額)', visible: true, format: formatAmount, align: 'right' },
    { field: 'PTA', header: '立沖代號', visible: true },
    { field: 'VEN_No', header: '廠商/員工代號', visible: true },
    {
      field: 'VEN_ShortName',
      header: '廠商/員工名稱',
      visible: true,
      format: (_v, _i, row) => {
        const r = row as QueryGLS3003AbatAcctResponse;
        return r?.VEN_ShortName ?? r?.USR_Name ?? '';
      },
    },
  ];
  private currentEditingPtaRowIndex: number | null = null;
  private currentEditingPtaAccNo: string | null = null;
  /** 從哪個金額欄觸發的 PTA dialog（null = 從 PTA 欄直接點） */
  private currentEditingPtaAmtField: 'AccAmtD' | 'AccAmtC' | null = null;
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
    [8, '進項折讓發票'],
    [9, '銷項折讓發票'],
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

  public readonly stepAPFooter = computed(() => ({ acp_amt: this.stepAPRows().reduce((sum, r) => sum + (r.acp_amt ?? 0), 0) }));
  public readonly stepARFooter = computed(() => ({ ars_amt: this.stepARRows().reduce((sum, r) => sum + (r.ars_amt ?? 0), 0) }));
  public readonly stepPurchaseFooter = computed(() => ({
    invoice_amount: this.stepPurchaseRows().reduce((sum, r) => sum + (r.invoice_amount ?? 0), 0),
    net_amount: this.stepPurchaseRows().reduce((sum, r) => sum + (r.net_amount ?? 0), 0),
    tax_amount: this.stepPurchaseRows().reduce((sum, r) => sum + (r.tax_amount ?? 0), 0),
  }));
  public readonly stepSalesFooter = computed(() => ({
    total_amount: this.stepSalesRows().reduce((sum, r) => sum + (r.total_amount ?? 0), 0),
    net_amount: this.stepSalesRows().reduce((sum, r) => sum + (r.net_amount ?? 0), 0),
    tax_amount: this.stepSalesRows().reduce((sum, r) => sum + (r.tax_amount ?? 0), 0),
  }));
  public readonly stepBankFooter = computed(() => ({
    deposit_amt: this.stepBankRows().reduce((sum, r) => sum + (r.deposit_amt ?? 0), 0),
    withdraw_amt: this.stepBankRows().reduce((sum, r) => sum + (r.withdraw_amt ?? 0), 0),
  }));

  /** 進項折讓步驟列（格式 23/24，type=5 反向貸方） */
  public readonly stepPurchaseAllowanceRows = signal<FIN53010StepPurchaseInvoiceRow[]>([]);
  /** 銷項折讓步驟列（格式 33/34，type=6 反向借方） */
  public readonly stepSalesAllowanceRows = signal<FIN53010StepSalesInvoiceRow[]>([]);

  public readonly stepPurchaseAllowanceFooter = computed(() => ({
    invoice_amount: this.stepPurchaseAllowanceRows().reduce((sum, r) => sum + (r.invoice_amount ?? 0), 0),
    net_amount: this.stepPurchaseAllowanceRows().reduce((sum, r) => sum + (r.net_amount ?? 0), 0),
    tax_amount: this.stepPurchaseAllowanceRows().reduce((sum, r) => sum + (r.tax_amount ?? 0), 0),
  }));
  public readonly stepSalesAllowanceFooter = computed(() => ({
    total_amount: this.stepSalesAllowanceRows().reduce((sum, r) => sum + (r.total_amount ?? 0), 0),
    net_amount: this.stepSalesAllowanceRows().reduce((sum, r) => sum + (r.net_amount ?? 0), 0),
    tax_amount: this.stepSalesAllowanceRows().reduce((sum, r) => sum + (r.tax_amount ?? 0), 0),
  }));

  /** 觸發進項折讓的傳票明細列（type=5 + AccDC='D' + AccAmtC>0，上半部唯讀顯示用） */
  public readonly purchaseAllowanceTriggerRows = computed(() => {
    const accVt = this.service.accVoucherTypeMap();
    const accMap = this.service.accNoMap();
    return this.tableData().filter(row => {
      const accNo = String(row.AccNo ?? '');
      if (String(accVt.get(accNo)) !== '5') return false;
      const accDC = String(accMap.get(accNo)?.['AccDC'] ?? '').trim();
      return accDC === 'D' && (row.AccAmtC ?? 0) > 0;
    });
  });

  /** 觸發銷項折讓的傳票明細列（type=6 + AccDC='C' + AccAmtD>0，上半部唯讀顯示用） */
  public readonly salesAllowanceTriggerRows = computed(() => {
    const accVt = this.service.accVoucherTypeMap();
    const accMap = this.service.accNoMap();
    return this.tableData().filter(row => {
      const accNo = String(row.AccNo ?? '');
      if (String(accVt.get(accNo)) !== '6') return false;
      const accDC = String(accMap.get(accNo)?.['AccDC'] ?? '').trim();
      return accDC === 'C' && (row.AccAmtD ?? 0) > 0;
    });
  });

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

  /** 應付帳款「廠商/員工代號」顯示用選項：合併廠商 + 員工（欄位唯讀，僅供顯示名稱，員工付款時才對得上 label） */
  public readonly apVenOptions = computed(() => [...this.service.vendorOptions(), ...this.service.usrOptions()]);

  /** 供「下一步」步驟表同步時讀取傳票日期（表單非 signal，需轉成 signal） */
  private readonly vouDateForStepSync = toSignal(
    this.dataForm.controls.VouDate.valueChanges.pipe(
      startWith(this.dataForm.controls.VouDate.value),
    ),
    { initialValue: this.dataForm.controls.VouDate.value },
  );

  /** 科目代號下拉搜尋字串：數字開頭用 startsWith，中文用 contains */
  // 注意：此 signal 需搭配 accNoFilterRowKey 一起使用，避免單一共用的搜尋字串
  // 同時套用到「所有列」的下拉選項，導致正在輸入篩選文字的那一列以外的列，
  // 因目前已選值不在被窄化後的選項清單中而暫時顯示空白（見 columns() 內 AccNo 的 options/onFilter）。
  private readonly accNoFilterRowKey = signal<string | null>(null); // 目前正在輸入篩選文字的那一列 (_TABLE_KEY)
  private readonly accNoFilterQuery = signal<string>('');
  private readonly accNoFilteredOptions = computed(() => {
    const q = this.accNoFilterQuery();
    const all = this.service.accNoOptions();
    if (!q) return all;
    const isNumeric = /^\d/.test(q);
    return all.filter(o => {
      const label = String(o?.label ?? '');
      return isNumeric ? label.startsWith(q) : label.includes(q);
    });
  });

  /** 追蹤實際傳票型態代碼（form 存 label，需另存 code 供判斷） */
  readonly voucherTypeCode = signal<string>('GL');
  /** RC/RM 傳票類型：僅允許編輯摘要，不可新增或刪除明細列，其餘欄位鎖定 */
  readonly isRcRmVoucher = computed(() => {
    const t = this.voucherTypeCode().trim().toUpperCase();
    return t === 'RC' || t === 'RM';
  });

  /** 過帳後進入編輯模式：只允許修改摘要(Remark)，其餘欄位唯讀 */
  get isPostedEdit(): boolean {
    return this.isFormEditable && this.dataForm.controls.PostFlag.value === '3';
  }

  /** 補發票欄位可編輯條件：狀態=建立(1) */
  get isInvYnEditable(): boolean {
    if (this.isFormReadable) return false;
    return this.dataForm.controls.PostFlag.value === '1';
  }

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
  public readonly aps4002RelatedRows = signal<FIN53010Aps4002ByVouNoRow[]>([]);

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
  public readonly readonlyAps4002Footer = computed(() => ({
    DAmt: this.aps4002RelatedRows().reduce((sum, r) => sum + (r.DAmt ?? 0), 0),
    CAmt: this.aps4002RelatedRows().reduce((sum, r) => sum + (r.CAmt ?? 0), 0),
  }));

  public readonly ars3001RelatedColumns: ReportColumn[] = [
    { field: 'org_id', header: '組織代號', visible: true, align: 'left', width: '100px' },
    { field: 'ven_no', header: '廠商代號', visible: true, align: 'left', width: '100px' },
    { field: 'ars_amt', header: '金額', visible: true, format: v => reportFormatAmount(v), align: 'right', width: '100px' },
    { field: 'pta_date', header: '預計收款日', visible: true, format: v => (v ? reportFormatDate(String(v)) : ''), align: 'left', width: '100px' },
    { field: 'ars_date', header: '立帳日期', visible: true, format: v => (v ? reportFormatDate(String(v)) : ''), align: 'left', width: '100px' },
    { field: 'acc_no', header: '會計科目代號', visible: true, align: 'left', width: '100px' },
    { field: 'note_desc', header: '摘要', visible: true, align: 'left', width: '200px' },
    { field: 'sub_detail_no', header: '對象別編號', visible: true, align: 'left', width: '100px' },
    { field: 'ACCT_KEY', header: '對帳KEY值', visible: true, align: 'left', width: '100px' },
    { field: 'PTA', header: '立沖代號', visible: true, align: 'left', width: '100px' },
    { field: 'ARS_No', header: '應收ID', visible: true, align: 'left', width: '120px' },
  ];

  public readonly aps3001RelatedColumns: ReportColumn[] = [
    { field: 'org_id', header: '組織代號', visible: true, align: 'left', width: '100px' },
    { field: 'VEN_No', header: '廠商代號', visible: true, align: 'left', width: '100px' },
    {
      field: 'VEN_PayType_Name', header: '付款方式', visible: true, format: (v, _i, row) => {
        const r = row as FIN53010Aps3001Row;
        return String(v ?? r?.VEN_PayType ?? '');
      },
      align: 'left',
      width: '100px'
    },
    { field: 'ACP_Amt', header: '金額', visible: true, format: v => reportFormatAmount(v), align: 'right', width: '100px' },
    { field: 'ACP_ExpectPayDate', header: '預計付款日', visible: true, format: v => (v ? reportFormatDate(String(v)) : ''), align: 'left', width: '100px' },
    { field: 'ACP_Date', header: '立帳日期', visible: true, format: v => (v ? reportFormatDate(String(v)) : ''), align: 'left', width: '100px' },
    { field: 'VEN_BNK_No', header: '匯款銀行代號', visible: true, align: 'left', width: '100px' },
    { field: 'VEN_BankAccountNo', header: '銀行帳號', visible: true, align: 'left', width: '100px' },
    { field: 'VEN_AccountName', header: '帳號名稱', visible: true, align: 'left', width: '150px' },
    { field: 'VEN_CTRLYN', header: '票據禁止背書轉讓', visible: true, align: 'left', width: '100px' },
    { field: 'VEN_CheckTitle', header: '票據抬頭', visible: true, align: 'left', width: '100px' },
    { field: 'AccNo', header: '會計科目代號', visible: true, align: 'left', width: '100px' },
    { field: 'AccCName', header: '會計科目名稱', visible: true, align: 'left', width: '100px' },
    { field: 'NoteDesc', header: '摘要', visible: true, align: 'left', width: '200px' },
    { field: 'SubDetailNo', header: '對象別編號', visible: true, align: 'left', width: '100px' },
    { field: 'ACCT_KEY', header: '對帳KEY值', visible: true, align: 'left', width: '100px' },
    { field: 'PTA', header: '立沖代號', visible: true, align: 'left', width: '100px' },
    { field: 'ACP_No', header: '應付ID', visible: true, align: 'left', width: '120px' },
  ];

  public readonly aps2002_CRelatedColumns: ReportColumn[] = [
    { field: 'Orig_RepYYYYMM', header: '原發票申報年月', visible: true, align: 'left', width: '100px' },
    { field: 'InvoiceNo', header: '發票號碼/憑證單號', visible: true, align: 'left', width: '100px' },
    { field: 'VoucherType', header: '發票格式', visible: true, align: 'left', width: '100px' },
    { field: 'Orig_InvoiceDate', header: '原發票日期', visible: true, format: v => (v ? reportFormatDate(String(v)) : ''), align: 'left', width: '100px' },
    { field: 'CreditDate', header: '退出/折讓日期', visible: true, format: v => (v ? reportFormatDate(String(v)) : ''), align: 'left', width: '100px' },
    { field: 'RepYYYYMM', header: '申報年月', visible: true, align: 'left', width: '100px' },
    { field: 'CreditTypeDesc', header: '區別', visible: true, align: 'left', width: '100px' },
    { field: 'Orig_Amount', header: '原發票總金額', visible: true, format: v => reportFormatAmount(v), align: 'right', width: '100px' },
    { field: 'BuyerUniformNo', header: '銷受人統一編號', visible: true, align: 'left', width: '100px' },
    { field: 'ReturnedAmount', header: '已退回/折讓總金額', visible: true, format: v => reportFormatAmount(v), align: 'right', width: '100px' },
    { field: 'CreditAmount', header: '退回/折讓總金額', visible: true, format: v => reportFormatAmount(v), align: 'right', width: '100px' },
    { field: 'TaxTypeDesc', header: '課稅別', visible: true, align: 'left', width: '100px' },
    { field: 'CreditNetAmount', header: '退回/折讓未稅金額', visible: true, format: v => reportFormatAmount(v), align: 'right', width: '100px' },
    { field: 'CreditTaxAmount', header: '退回/折讓稅額', visible: true, format: v => reportFormatAmount(v), align: 'right', width: '100px' },
  ];

  public readonly aps2002RelatedColumns: ReportColumn[] = [
    { field: 'VoucherType', header: '發票格式', visible: true, align: 'left' },
    {
      field: 'TrackNo',
      header: '發票號碼',
      format: (_v, _i, row) => {
        const r = row as Record<string, unknown>;
        return `${String(r['TrackNo'] ?? '')}${String(r['InvoiceNo'] ?? '')}`;
      },
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
    { field: 'TotalAmount', header: '發票總金額', visible: true, format: (v, _i, row) => reportFormatAmount((row as Record<string, unknown>)['Invoice_Cancel'] === 'Y' ? 0 : v), align: 'right' },
    { field: 'TaxType', header: '課稅別', visible: true, align: 'left' },
    { field: 'NetAmount', header: '發票未稅金額', visible: true, format: (v, _i, row) => reportFormatAmount((row as Record<string, unknown>)['Invoice_Cancel'] === 'Y' ? 0 : v), align: 'right' },
    { field: 'TaxAmount', header: '發票稅額', visible: true, format: (v, _i, row) => reportFormatAmount((row as Record<string, unknown>)['Invoice_Cancel'] === 'Y' ? 0 : v), align: 'right' },
    { field: 'SourceDocNo', header: '憑證單號', visible: true, align: 'left' },
    { field: 'SummaryCount', header: '彙開註記', visible: true, align: 'left' },
    { field: 'AssetFlag', header: '資產註記', visible: true, align: 'left' },
    { field: 'InvoiceType', header: '發票使用別', visible: false, align: 'left' },
  ];

  public readonly aps4002RelatedColumns: ReportColumn[] = [
    { field: 'BNK_id', header: '銀行科目代號', visible: true, align: 'left' },
    { field: 'BNK_AccName', header: '科目名稱', visible: true, align: 'left' },
    { field: 'DAmt', header: '存款', visible: true, format: v => reportFormatAmount(v), align: 'right' },
    { field: 'CAmt', header: '提款', visible: true, format: v => reportFormatAmount(v), align: 'right' },
    { field: 'VEN_No', header: '廠商代號', visible: true, align: 'left' },
    { field: 'VEN_Name', header: '廠商名稱', visible: true, align: 'left' },
    { field: 'Remark', header: '摘要', visible: true, align: 'left' },
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
    this.voucherTypeCode.set(voucherTypeValue);

    this.dataForm.patchValue({
      VouNo: data.VouNo,
      VouType: ['1', '2', '3'].includes(String(data.VouType)) ? String(data.VouType) as '1' | '2' | '3' : '1',
      PostFlag: ['0', '1', '2', '3'].includes(String(data.PostFlag)) ? String(data.PostFlag) as '0' | '1' | '2' | '3' : '0',
      VoucherType: voucherTypeLabel,
      VouDate: data.VouDate ? new Date(data.VouDate) : new Date(),
      Remark: data.Remark,
      INV_YN: (data.INV_YN ?? 'N') as 'N' | 'Y',
      VouAccType: ['0', '1'].includes(String(data.VouAccType)) ? String(data.VouAccType) as '0' | '1' : '0',
      CompNo: data.CompNo,
      CRT_USR_No: data.CRT_USR_No ?? void 0,
      CRT_Date: data.CRT_Date ? new Date(data.CRT_Date) : void 0,
      UPD_USR_No: data.UPD_USR_No ?? void 0,
      UPD_Date: data.UPD_Date ? new Date(data.UPD_Date) : void 0,
    });

    if (!this.areDetailMapsReady()) {
      return;
    }

    const fp = this.buildDetailTableFingerprint(data);
    if (fp === this._lastAppliedDetailTableFingerprint) {
      return;
    }
    this._lastAppliedDetailTableFingerprint = fp;
    this._ptaLockKey = ''; // 重新載入 → 讓沖帳鎖定重查

    this.tableData.set(data.Details.map((v, index) => {
      const accNo = String(v.AccNo ?? '').trim(); // DB CHAR 欄位有 padding，trim 後才對得上下拉選項 value
      return {
        ...v,
        AccNo: accNo,
        AccAmtC: v.AccDC === 'C' ? v.AccAmt : void 0,
        AccAmtD: v.AccDC === 'D' ? v.AccAmt : void 0,
        AccCName: this.service.accNoMap().get(accNo)?.label,
        DetailName: this.service.vendorMap().get(String(v.DetailNo))?.label
          ?? this.service.usrMap().get(String(v.DetailNo))?.label,
        NoteDesc: v.NoteDesc || this.service.noteDescMap().get(accNo)?.label,
        SerNo: v.SerNo ?? (index + 1) * 10, // 保留 DB 原始 SerNo，缺值才補
        recKey: v.ACCT_KEY ?? void 0,
      };
    }));

    const rows = this.tableData();
    this.logger.debug(`loadingDetail:`, {
      data,
      form: this.dataForm.getRawValue(),
      tableRowCount: rows.length,
      tableSample: rows.slice(0, 5),
    });
  }, { allowSignalWrites: !0 });

  /** 已被沖帳的立帳列不可編輯：載入傳票後查 checkGLS3003PtaLocked，於列上標記 _ptaLocked */
  private _ptaLockKey = '';
  private readonly ptaLockEffect = effect(() => {
    if (this.isFormCreateable) return;
    const rows = this.tableData();
    const lizIds = rows.filter(r => r.id && r.PTA).map(r => r.id);
    const key = lizIds.slice().sort((a, b) => a - b).join(',');
    if (!lizIds.length || key === this._ptaLockKey) return;
    this._ptaLockKey = key;

    this.service.checkGLS3003PtaLocked({ Gls3002Ids: lizIds }).pipe(take(1)).subscribe(res => {
      const locked = res.Data ?? [];
      if (!locked.length) return;
      const lockedSet = new Set(locked.map(d => d.Gls3002Id));
      this.tableData.update(rs => rs.map(r =>
        (r.id != null && lockedSet.has(r.id)) ? { ...r, _ptaLocked: true } : r));
    });
  }, { allowSignalWrites: !0 });

  /** 該列是否因立帳已被沖帳而鎖定（不可編輯） */
  private isRowLocked = (rowData?: FIN53010DetailTable): boolean => !!rowData?._ptaLocked;

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
        // 只有「正在輸入篩選文字的那一列」才套用窄化後的選項；其餘列一律用完整清單，
        // 避免其他列已選的科目代號因不在窄化清單中而暫時顯示空白 (#598)
        options: (rowData: FIN53010DetailTable & { _TABLE_KEY?: string }) => (rowData?._TABLE_KEY !== undefined && rowData._TABLE_KEY === this.accNoFilterRowKey())
          ? this.accNoFilteredOptions()
          : this.service.accNoOptions(),
        optionLabel: 'label',
        optionValue: 'value',
        templateLabel: 'label',
        validate: [this.validateRequired],
        disabled: (_v: unknown, _i: unknown, rowData: FIN53010DetailTable) => !!rowData?.id || this.isRowLocked(rowData),
        format: (v, i, r) => {
          if (!r?.AccNo) return '';
          const accItem = accMap.get(String(r.AccNo));
          return accItem?.label ?? '';
        },
        onFilter: (q, rowData) => {
          this.accNoFilterRowKey.set(rowData?._TABLE_KEY ?? null);
          this.accNoFilterQuery.set(q ?? '');
        },
      },
      {
        field: 'DetailNo',
        header: '廠商/員工代號',
        textAlign: 'left',
        type: 'template',
        templateDisplayField: 'DetailName',
        templateRef: this.venUsrTemplate(),
        disabled: (_v: unknown, _i: unknown, rowData: FIN53010DetailTable) => this.isRowLocked(rowData),
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
        // 摘要即使立帳被沖帳仍可修改
      },
      {
        field: 'AccAmtD',
        header: '借方金額',
        textAlign: 'right',
        type: 'inputNumber',
        format: (v) => (v !== void 0 && v !== null) ? formatAmount(v) : '',
        // DB 已存列：貸方有值時禁止輸入借方（方向鎖定，避免切換後 PTA 無法復原）
        disabled: (_v: unknown, _i: unknown, rowData: FIN53010DetailTable) =>
          (!!rowData?.id && (rowData.AccAmtC ?? 0) > 0) || this.isRowLocked(rowData),
        // 立沖科目（AccDC=C）新增列：首次 focus 自動開 PTA dialog，選完後帶回金額/廠商/摘要
        onFocus: (_r, _v, _c, index: number) => {
          if (this.isFormReadable) return;
          const rowData = this.tableData()[index];
          if (!rowData?.AccNo || rowData.id) return;
          const { AccDC, ABAT_YN } = this.getAccAbatInfo(rowData.AccNo);
          if (ABAT_YN !== 'Y' || AccDC !== 'C' || rowData.PTA) return;
          this.openPtaDialog(index, 'AccAmtD');
        },
      },
      {
        field: 'AccAmtC',
        header: '貸方金額',
        textAlign: 'right',
        type: 'inputNumber',
        format: (v) => (v !== void 0 && v !== null) ? formatAmount(v) : '',
        // DB 已存列：借方有值時禁止輸入貸方（方向鎖定，避免切換後 PTA 無法復原）
        disabled: (_v: unknown, _i: unknown, rowData: FIN53010DetailTable) =>
          (!!rowData?.id && (rowData.AccAmtD ?? 0) > 0) || this.isRowLocked(rowData),
        // 立沖科目（AccDC=D）新增列：首次 focus 自動開 PTA dialog，選完後帶回金額/廠商/摘要
        onFocus: (_r, _v, _c, index: number) => {
          if (this.isFormReadable) return;
          const rowData = this.tableData()[index];
          if (!rowData?.AccNo || rowData.id) return;
          const { AccDC, ABAT_YN } = this.getAccAbatInfo(rowData.AccNo);
          if (ABAT_YN !== 'Y' || AccDC !== 'D' || rowData.PTA) return;
          this.openPtaDialog(index, 'AccAmtC');
        },
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
        validate: [this.validateRequired],
        disabled: (_v: unknown, _i: unknown, rowData: FIN53010DetailTable) => this.isRowLocked(rowData),
      },
      {
        field: 'PTA',
        header: '立沖代號',
        textAlign: 'left',
        type: 'input',
        cellClass: this.ptaCellClass,
        placeholder: '點擊選擇...',
        onFocus: (_r, _v, _c, index: number) => {
          if (this.isFormReadable) return;
          const rowData = this.tableData()[index];
          const { ABAT_YN } = this.getAccAbatInfo(rowData?.AccNo);
          if (ABAT_YN !== 'Y') return;
          if (this.isAutoCodeRow(rowData)) return;
          this.openPtaDialog(index);
        },
        disabled: (_v, _i, rowData) => {
          if (this.isFormReadable) return true;
          if (this.isRowLocked(rowData)) return true;
          if (!rowData?.AccNo) return true;
          const { AccDC, ABAT_YN } = this.getAccAbatInfo(rowData.AccNo);
          if (ABAT_YN !== 'Y') return true;
          // 同方向（自動編碼）禁用
          if (this.isAutoCodeRow(rowData)) return true;
          // 反方向有金額才開放，否則禁用（還沒輸金額時不可點）
          if (AccDC === 'D') return (rowData.AccAmtC ?? 0) <= 0;
          if (AccDC === 'C') return (rowData.AccAmtD ?? 0) <= 0;
          return true;
        },
        validate: [
          (value: unknown, rowData: FIN53010DetailTable) => {
            const { ABAT_YN } = this.getAccAbatInfo(rowData?.AccNo);
            if (ABAT_YN !== 'Y') return { isValid: true, errorMessage: [] };
            // auto-code 列由 rebuildAllAutoPta 自動補 PTA，不需使用者手動填
            if (this.isAutoCodeRow(rowData)) return { isValid: true, errorMessage: [] };
            const hasAmt = (rowData?.AccAmtD ?? 0) > 0 || (rowData?.AccAmtC ?? 0) > 0;
            if (hasAmt && !value) return { isValid: false, errorMessage: ['立沖科目必須填入立沖代號'] };
            return { isValid: true, errorMessage: [] };
          },
        ],
      },
      {
        field: 'ReflNo',
        header: '對象別編號',
        textAlign: 'left',
        type: 'dropdown',
        options: () => this.service.refNameOptions(),
        optionLabel: 'label',
        optionValue: 'value',
        disabled: (_v: unknown, _i: unknown, rowData: FIN53010DetailTable) => this.isRowLocked(rowData),
      },
      {
        field: 'recKey',
        header: '對帳KEY值',
        textAlign: 'left',
        type: 'input',
        disabled: (_v: unknown, _i: unknown, rowData: FIN53010DetailTable) => this.isRowLocked(rowData),
      },
    ];
  });

  /** RC/RM 傳票：除摘要外其餘欄位全部鎖定 */
  public readonly effectiveColumns = computed(() => {
    const cols = this.columns();
    if (!this.isRcRmVoucher()) return cols;
    return cols.map(col => col.field === 'NoteDesc' ? col : { ...col, disabled: () => true });
  });

  public readonly templateColumns: (Omit<Column, 'field'> & { field: keyof FIN52030Data; })[] = [
    { field: 'TempNo', header: '傳票號碼', align: 'left' },
    { field: 'TempName', header: '傳票代號', align: 'left' },
    { field: 'VouType', header: '傳票類型', format: v => this.service.vouTypeOptions.find(({ value }) => value === v)?.label ?? v, align: 'left' },
  ];

  public readonly stepAPColumns: EditColumn[] = [
    { field: 'org_id', header: '組織代號', textAlign: 'left', type: 'dropdown', options: () => this.service.orgNoOptions(), optionLabel: 'label', optionValue: 'value', disabled: () => true, validate: [this.validateRequired] },
    { field: 'ven_no', header: '廠商代號', textAlign: 'left', type: 'dropdown', options: () => this.apVenOptions(), optionLabel: 'label', optionValue: 'value', disabled: () => true, validate: [this.validateRequired] },
    { field: 'ven_pay_type', header: '付款方式', textAlign: 'left', type: 'dropdown', options: () => this.service.venPayTypeOptions(), optionLabel: 'label', optionValue: 'value', disabled: () => true, validate: [this.validateRequired] },
    { field: 'acp_amt', header: '金額', textAlign: 'right', width: '7rem', type: 'inputNumber', disabled: () => true, format: (v) => (v !== null && v !== undefined) ? formatAmount(v) : '', validate: [this.validateRequired] },
    { field: 'acp_expect_pay_date', header: '預計付款日', textAlign: 'left', width: '9rem', type: 'date', validate: [this.validateRequired] },
    { field: 'acp_date', header: '立帳日期', textAlign: 'left', width: '9rem', type: 'date', disabled: () => true, validate: [this.validateRequired] },
    { field: 'ven_bnk_no', header: '匯款銀行代號', textAlign: 'left', type: 'dropdown', options: () => this.bankNoOptionsForStep(), optionLabel: 'label', optionValue: 'value', disabled: () => true },
    { field: 'ven_bank_account', header: '銀行帳號/帳戶名稱', textAlign: 'left', type: 'input', disabled: () => true },
    { field: 'ven_ctrlyn', header: '票據禁止背書轉讓', textAlign: 'left', width: '8rem', type: 'dropdown', options: () => this.service.yesNoOptions(), optionLabel: 'label', optionValue: 'value' },
    { field: 'ven_check_title', header: '票據抬頭', textAlign: 'left', type: 'input', disabled: () => true },
    { field: 'acc_no', header: '會計科目代號', textAlign: 'left', type: 'dropdown', options: () => this.service.accNoOptions(), optionLabel: 'label', optionValue: 'value', disabled: () => true, validate: [this.validateRequired] },
    { field: 'note_desc', header: '摘要', textAlign: 'left', type: 'input' },
    { field: 'PTA', header: '立沖代號', textAlign: 'left', type: 'input', disabled: () => true },
    { field: 'ACP_No', header: '應付ID', textAlign: 'left', type: 'input', disabled: () => true },
  ];

  public readonly stepARColumns: EditColumn[] = [
    { field: 'org_id', header: '組織代號', type: 'dropdown', textAlign: 'left', options: () => this.service.orgNoOptions(), optionLabel: 'label', optionValue: 'value', disabled: () => true, validate: [this.validateRequired] },
    { field: 'ven_no', header: '廠商代號', type: 'dropdown', textAlign: 'left', options: () => this.service.vendorOptions(), optionLabel: 'label', optionValue: 'value', disabled: () => true, validate: [this.validateRequired] },
    { field: 'ars_amt', header: '金額', type: 'inputNumber', disabled: () => true, textAlign: 'right', format: (v) => (v !== null && v !== undefined) ? formatAmount(v) : '', validate: [this.validateRequired] },
    { field: 'pta_date', header: '預計收款日', type: 'date', textAlign: 'left', validate: [this.validateRequired] },
    { field: 'ars_date', header: '立帳日期', type: 'date', disabled: () => true, textAlign: 'left', validate: [this.validateRequired] },
    { field: 'acc_no', header: '會計科目代號', type: 'dropdown', textAlign: 'left', options: () => this.service.accNoOptions(), optionLabel: 'label', optionValue: 'value', disabled: () => true, validate: [this.validateRequired] },
    { field: 'note_desc', header: '摘要', type: 'input', textAlign: 'left' },
    { field: 'PTA', header: '立沖代號', type: 'input', disabled: () => true, textAlign: 'left' },
    { field: 'ACCT_KEY', header: '對帳KEY值', type: 'input', disabled: () => true, textAlign: 'left' },
    { field: 'ARS_No', header: '應收ID', type: 'input', disabled: () => true, textAlign: 'left' },
  ];

  public readonly stepSalesColumns: EditColumn[] = [
    { field: 'invoice_type', header: '發票格式', type: 'dropdown', options: () => this.service.purGUIPaperOptions().filter(o => o.value === '31' || o.value === '32' || o.value === '35'), optionLabel: 'label', optionValue: 'value', textAlign: 'left' },
    { field: 'invoice_prefix', header: '字軌', type: 'input', maxLength: 2, textAlign: 'left', validate: [this.validateSalesInvoicePrefix.bind(this)], readonly: (_v, _i, rd) => (rd as FIN53010StepSalesInvoiceRow)?.invoice_type === '35' },
    { field: 'invoice_no', header: '發票號碼', type: 'input', maxLength: 8, textAlign: 'left', validate: [this.validateSalesInvoiceNo.bind(this)], readonly: (_v, _i, rd) => (rd as FIN53010StepSalesInvoiceRow)?.invoice_type === '35', onDblClick: (rowData, _v, _col, index) => this.openSalesInvoicePickerDialog(rowData as FIN53010StepSalesInvoiceRow, index ?? 0) },
    { field: 'invoice_date', header: '發票日期', textAlign: 'left', width: '10rem', type: 'date' },
    { field: 'declare_ym', header: '申報年月', textAlign: 'left', width: '10rem', type: 'date', view: 'month', dateFormat: 'yy/mm' },
    { field: 'buyer_uniform', header: '買受人統一編號', textAlign: 'left', type: 'dropdown', options: () => this.service.vendorUniformOptions(), optionLabel: 'label', optionValue: 'value', allowCustomValue: true, showClear: true, validate: [this.validateUniformNumber.bind(this)] },
    { field: 'total_amount', header: '發票總金額', type: 'inputNumber', textAlign: 'right', format: (v) => (v !== null && v !== undefined) ? formatAmount(v) : '' },
    { field: 'tax_type', header: '課稅別', type: 'dropdown', options: () => this.service.taxTypeOptions(), optionLabel: 'label', optionValue: 'value', textAlign: 'left' },
    { field: 'net_amount', header: '發票未稅金額', type: 'inputNumber', textAlign: 'right', format: (v) => (v !== null && v !== undefined) ? formatAmount(v) : '' },
    { field: 'tax_amount', header: '發票稅額', type: 'inputNumber', textAlign: 'right', format: (v) => (v !== null && v !== undefined) ? formatAmount(v) : '' },
    { field: 'source_doc_no', header: '憑證單號', type: 'input', textAlign: 'left', validate: [this.validateSalesSourceDocNo.bind(this)] },
    { field: 'summary_count', header: '彙整單號', type: 'inputNumber', textAlign: 'left' },
    { field: 'asset_flag', header: '資產註記', type: 'dropdown', options: () => this.service.assetTypeOptions(), optionLabel: 'label', optionValue: 'value', textAlign: 'left' },
  ];

  public readonly stepPurchaseColumns: EditColumn[] = [
    { field: 'voucher_type', header: '發票格式', type: 'dropdown', options: () => this.service.purGUIPaperOptions().filter(o => +o.value >= 21 && +o.value <= 25), optionLabel: 'label', optionValue: 'value', textAlign: 'left' },
    { field: 'track_no', header: '字軌', type: 'input', maxLength: 2, textAlign: 'left', validate: [this.validatePurchaseTrackNo.bind(this)] },
    { field: 'invoice_no', header: '發票號碼', type: 'input', maxLength: 8, textAlign: 'left', validate: [this.validatePurchaseInvoiceNo.bind(this)] },
    { field: 'invoice_date', header: '發票日期', textAlign: 'left', width: '10rem', type: 'date', validate: [this.validateRequired.bind(this)] },
    { field: 'declare_ym', header: '申報年月', textAlign: 'left', width: '10rem', type: 'date', view: 'month', dateFormat: 'yy/mm' },
    { field: 'vendor_tax_id', header: '廠商統一編號', textAlign: 'left', type: 'dropdown', options: () => this.service.vendorUniformOptions(), optionLabel: 'label', optionValue: 'value', allowCustomValue: true, validate: [this.validateRequired.bind(this), this.validateUniformNumber.bind(this)] },
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

  // 步驟表新增列預設值：用穩定參考 class field，避免 template inline 物件字面每次變更偵測
  // 都產生新參考 → app-table-edit ngOnChanges 每輪都觸發 updateCandidateRowDefaults + detectChanges。
  public readonly stepPurchaseDefaultInsert = { tax_type: '1', invoice_usage: '1', deduction_code: '1' };
  public readonly stepPurchaseAllowanceDefaultInsert = { voucher_type: '23', tax_type: '1' };
  public readonly stepSalesAllowanceDefaultInsert = { invoice_type: '33', tax_type: '1' };

  // Dialog 樣式：同上，穩定參考避免 template inline 物件字面每輪 CD 產生新參考
  public readonly dialogStyle65vw = { width: '65vw' };
  public readonly dialogStyle80vw = { width: '80vw' };
  public readonly dialogInnerStyle280 = { width: '280px' };
  public readonly dialogContentStyle = { 'min-height': '50vh', 'max-height': '75vh' };

  private validateRequired(value: any, rowData: any, data: any[], field: string, header: string): { isValid: boolean, errorMessage: string[] } {
    if (value === '' || value === null || value === undefined) {
      return { isValid: false, errorMessage: [`${header}不可為空`] };
    }
    return { isValid: true, errorMessage: [] };
  }

  /** 存款/提款二擇一：同一列只要其中一個有值即通過 */
  private validateBankAmtEither(_value: unknown, rowData: FIN53010StepBankDeposit): { isValid: boolean, errorMessage: string[] } {
    const deposit = rowData?.deposit_amt;
    const withdraw = rowData?.withdraw_amt;
    const hasDeposit = deposit !== null && deposit !== undefined;
    const hasWithdraw = withdraw !== null && withdraw !== undefined;
    if (!hasDeposit && !hasWithdraw) {
      return { isValid: false, errorMessage: ['存款或提款至少須填一項'] };
    }
    return { isValid: true, errorMessage: [] };
  }

  private validateSalesInvoicePrefix(value: unknown, rowData: unknown): { isValid: boolean; errorMessage: string[] } {
    const vt = String((rowData as Record<string, unknown>)['invoice_type'] ?? '').trim();
    const v = String(value ?? '').trim();
    if (vt === '31' || vt === '32') {
      if (!v) return { isValid: false, errorMessage: ['字軌不可為空'] };
    }
    if (vt === '35') {
      const invoiceNo = String((rowData as Record<string, unknown>)['invoice_no'] ?? '').trim();
      if (invoiceNo && !v) return { isValid: false, errorMessage: ['輸入發票號碼時，字軌不可為空'] };
    }
    return { isValid: true, errorMessage: [] };
  }

  private validateSalesInvoiceNo(value: unknown, rowData: unknown): { isValid: boolean; errorMessage: string[] } {
    const vt = String((rowData as Record<string, unknown>)['invoice_type'] ?? '').trim();
    const v = String(value ?? '').trim();
    if (vt === '35') {
      const sourceDocNo = String((rowData as Record<string, unknown>)['source_doc_no'] ?? '').trim();
      if (!v && !sourceDocNo) return { isValid: false, errorMessage: ['格式35：請輸入發票號碼或憑證單號'] };
      return { isValid: true, errorMessage: [] };
    }
    if (!v) return { isValid: false, errorMessage: ['發票號碼不可為空'] };
    return { isValid: true, errorMessage: [] };
  }

  private validateSalesSourceDocNo(value: unknown, rowData: unknown): { isValid: boolean; errorMessage: string[] } {
    const vt = String((rowData as Record<string, unknown>)['invoice_type'] ?? '').trim();
    if (vt !== '36' && vt !== '37') return { isValid: true, errorMessage: [] };
    if (!String(value ?? '').trim()) return { isValid: false, errorMessage: ['憑證單號不可為空'] };
    return { isValid: true, errorMessage: [] };
  }

  private validatePurchaseTrackNo(value: unknown, rowData: unknown): { isValid: boolean; errorMessage: string[] } {
    const vt = String((rowData as Record<string, unknown>)['voucher_type'] ?? '').trim();
    if (vt !== '21') return { isValid: true, errorMessage: [] };
    if (!String(value ?? '').trim()) return { isValid: false, errorMessage: ['字軌不可為空'] };
    return { isValid: true, errorMessage: [] };
  }

  private validatePurchaseInvoiceNo(value: unknown, rowData: unknown): { isValid: boolean; errorMessage: string[] } {
    const vt = String((rowData as Record<string, unknown>)['voucher_type'] ?? '').trim();
    const v = String(value ?? '').trim();
    if (vt === '21' && !v) return { isValid: false, errorMessage: ['發票號碼不可為空'] };
    if (vt === '22' || vt === '25') {
      const trackNo = String((rowData as Record<string, unknown>)['track_no'] ?? '').trim();
      if (trackNo && !v) return { isValid: false, errorMessage: ['輸入字軌時，發票號碼不可為空'] };
    }
    return { isValid: true, errorMessage: [] };
  }


  private validateUniformNumber(value: any, _rowData: unknown, _data: unknown[], _field: string, _header: string): { isValid: boolean, errorMessage: string[] } {
    if (value === '' || value === null || value === undefined) {
      return { isValid: true, errorMessage: [] };
    }
    const error = this.validationService.companyIdValidator({ value: String(value) });
    if (error) {
      return { isValid: false, errorMessage: ['統一編號格式錯誤'] };
    }
    return { isValid: true, errorMessage: [] };
  }

  public readonly stepBankColumns: EditColumn[] = [
    { field: 'ven_no', header: '廠商代號', type: 'dropdown', options: () => this.service.vendorOptions(), optionLabel: 'label', optionValue: 'value', textAlign: 'left' },
    { field: 'bank_no', header: '銀行代號', type: 'dropdown', options: () => this.service.accNoOptions(), optionLabel: 'label', optionValue: 'value', validate: [this.validateRequired], disabled: () => true, textAlign: 'left' },
    { field: 'deposit_amt', header: '存款', type: 'inputNumber', validate: [this.validateBankAmtEither.bind(this)], disabled: () => true, textAlign: 'right', format: (v) => (v !== null && v !== undefined) ? formatAmount(v) : '' },
    { field: 'withdraw_amt', header: '提款', type: 'inputNumber', validate: [this.validateBankAmtEither.bind(this)], disabled: () => true, textAlign: 'right', format: (v) => (v !== null && v !== undefined) ? formatAmount(v) : '' },
    { field: 'note_desc', header: '摘要', type: 'input', textAlign: 'left' },
    { field: 'txn_date', header: '日期', type: 'date', disabled: () => true, textAlign: 'left' },
  ];

  private readonly creditTypeOptions = [
    { label: '退出', value: 'R' },
    { label: '折讓', value: 'C' },
  ];

  /** 進項折讓發票欄位定義（格式 23/24） */
  public readonly stepPurchaseAllowanceColumns: EditColumn[] = [
    { field: 'voucher_type', header: '發票格式', type: 'dropdown', options: () => this.service.purGUIPaperOptions().filter(o => o.value === '23' || o.value === '24'), optionLabel: 'label', optionValue: 'value', textAlign: 'left' },
    { field: 'invoice_no', header: '原始發票號碼', type: 'input', maxLength: 10, textAlign: 'left', onFocus: (rowData, _v, _col, index) => this.openPurchaseAllowancePickerDialog(rowData as FIN53010StepPurchaseInvoiceRow, index ?? 0) },
    { field: 'invoice_date', header: '原發票日期', type: 'date', disabled: () => true, textAlign: 'left', width: '10rem' },
    { field: 'credit_date', header: '退出/折讓日期', textAlign: 'left', width: '10rem', type: 'date' },
    { field: 'declare_ym', header: '申報年月', textAlign: 'left', width: '10rem', type: 'date', view: 'month', dateFormat: 'yy/mm' },
    { field: 'credit_type', header: '區別', type: 'dropdown', options: () => this.creditTypeOptions, optionLabel: 'label', optionValue: 'value', textAlign: 'left' },
    { field: 'invoice_amount', header: '原發票總金額', type: 'inputNumber', textAlign: 'right', disabled: () => true, format: (v) => (v !== null && v !== undefined) ? formatAmount(v) : '' },
    { field: 'vendor_tax_id', header: '銷受人統一編號', textAlign: 'left', type: 'dropdown', options: () => this.service.vendorUniformOptions(), optionLabel: 'label', optionValue: 'value', allowCustomValue: true, showClear: true, validate: [this.validateUniformNumber.bind(this)] },
    { field: 'net_amount', header: '退回/折讓未稅金額', type: 'inputNumber', textAlign: 'right', format: (v) => (v !== null && v !== undefined) ? formatAmount(v) : '' },
    { field: 'tax_type', header: '課稅別', type: 'dropdown', options: () => this.service.taxTypeOptions(), optionLabel: 'label', optionValue: 'value', textAlign: 'left' },
    { field: 'tax_amount', header: '退回/折讓稅額', type: 'inputNumber', textAlign: 'right', format: (v) => (v !== null && v !== undefined) ? formatAmount(v) : '' },
  ];

  /** 銷項折讓發票欄位定義（格式 33/34） */
  public readonly stepSalesAllowanceColumns: EditColumn[] = [
    { field: 'invoice_type', header: '發票格式', type: 'dropdown', options: () => this.service.purGUIPaperOptions().filter(o => o.value === '33' || o.value === '34'), optionLabel: 'label', optionValue: 'value', textAlign: 'left' },
    { field: 'invoice_no', header: '原始發票號碼', type: 'input', maxLength: 10, textAlign: 'left', onFocus: (rowData, _v, _col, index) => this.openSalesAllowancePickerDialog(rowData as FIN53010StepSalesInvoiceRow, index ?? 0) },
    { field: 'invoice_date', header: '原發票日期', type: 'date', disabled: () => true, textAlign: 'left', width: '10rem' },
    { field: 'credit_date', header: '退出/折讓日期', textAlign: 'left', width: '10rem', type: 'date' },
    { field: 'declare_ym', header: '申報年月', textAlign: 'left', width: '10rem', type: 'date', view: 'month', dateFormat: 'yy/mm' },
    { field: 'credit_type', header: '區別', type: 'dropdown', options: () => this.creditTypeOptions, optionLabel: 'label', optionValue: 'value', textAlign: 'left' },
    { field: 'buyer_uniform', header: '買受人統一編號', textAlign: 'left', type: 'dropdown', options: () => this.service.vendorUniformOptions(), optionLabel: 'label', optionValue: 'value', allowCustomValue: true, showClear: true, validate: [this.validateUniformNumber.bind(this)] },
    { field: 'total_amount', header: '原發票總金額', type: 'inputNumber', textAlign: 'right', disabled: () => true, format: (v) => (v !== null && v !== undefined) ? formatAmount(v) : '' },
    { field: 'net_amount', header: '退回/折讓未稅金額', type: 'inputNumber', textAlign: 'right', format: (v) => (v !== null && v !== undefined) ? formatAmount(v) : '' },
    { field: 'tax_type', header: '課稅別', type: 'dropdown', options: () => this.service.taxTypeOptions(), optionLabel: 'label', optionValue: 'value', textAlign: 'left' },
    { field: 'tax_amount', header: '退回/折讓稅額', type: 'inputNumber', textAlign: 'right', format: (v) => (v !== null && v !== undefined) ? formatAmount(v) : '' },
  ];

  /** 進項折讓觸發列（上半部唯讀顯示）欄位定義 */
  public readonly purchaseAllowanceTriggerColumns: ReportColumn[] = [
    { field: 'AccNo', header: '科目代號', visible: true, align: 'left' },
    { field: 'AccCName', header: '科目名稱', visible: true, align: 'left' },
    { field: 'NoteDesc', header: '摘要', visible: true, align: 'left' },
    { field: 'AccAmtC', header: '貸方金額', visible: true, format: v => reportFormatAmount(v), align: 'right' },
    { field: 'ORG_ID', header: '組織代號', visible: true, align: 'left' },
  ];

  /** 銷項折讓觸發列（上半部唯讀顯示）欄位定義 */
  public readonly salesAllowanceTriggerColumns: ReportColumn[] = [
    { field: 'AccNo', header: '科目代號', visible: true, align: 'left' },
    { field: 'AccCName', header: '科目名稱', visible: true, align: 'left' },
    { field: 'NoteDesc', header: '摘要', visible: true, align: 'left' },
    { field: 'AccAmtD', header: '借方金額', visible: true, format: v => reportFormatAmount(v), align: 'right' },
    { field: 'ORG_ID', header: '組織代號', visible: true, align: 'left' },
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

  /** 初次載入明細：純依 SerNo 遞增，保留使用者儲存時的排列順序 */
  private sortInitialLoadFin53010Details(details: FIN53010Detail[]): FIN53010Detail[] {
    return [...details].sort((a, b) => (a.SerNo ?? 0) - (b.SerNo ?? 0));
  }

  constructor(
    public readonly service: FIN53010Service,
    private readonly logger: NGXLogger,
    private readonly datePipe: DatePipe,
    private readonly injector: Injector,
    private readonly destroyRef: DestroyRef,
    private readonly validationService: ValidationService,
    private readonly confirmationService: ConfirmationService,
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



  /** 應付步驟表是否允許插入列（不含唯讀；模板須再與 !isFormReadable 一併綁定） */
  public readonly stepAPTableCanInsert = computed(() => {
    const max = this.payableDetailRowCount();
    return max > 0 && this.stepAPRows().length < max;
  });

  private _previousActiveSteps: number[] = [];

  private readonly stepFlowEffect = effect(() => {
    if (this.isFormReadable) return;
    if (!this.isFormCreateable && !this.isFormEditable) return;
    const accVtMap = this.service.accVoucherTypeMap();
    const accMap = this.service.accNoMap();
    const normalTypes = new Set<string>();
    const allowanceTypes = new Set<string>();

    for (const row of this.tableData()) {
      const accNo = String(row.AccNo ?? '');
      if (!accNo) continue;
      const t = String(accVtMap.get(accNo) ?? '');
      if (!['3', '4', '5', '6', '7'].includes(t)) continue;

      if (t === '5') {
        const accDC = String(accMap.get(accNo)?.['AccDC'] ?? '').trim();
        // 進項正向（AccDC='D' 且放借方，或 AccDC 未知）→ 一般進項步驟
        if (accDC !== 'D' || (row.AccAmtD ?? 0) > 0) normalTypes.add('5');
        // 進項反向（AccDC='D' 且放貸方）→ 進項折讓步驟
        if (accDC === 'D' && (row.AccAmtC ?? 0) > 0) allowanceTypes.add('8');
      } else if (t === '6') {
        const accDC = String(accMap.get(accNo)?.['AccDC'] ?? '').trim();
        // 銷項正向（AccDC='C' 且放貸方，或 AccDC 未知）→ 一般銷項步驟
        if (accDC !== 'C' || (row.AccAmtC ?? 0) > 0) normalTypes.add('6');
        // 銷項反向（AccDC='C' 且放借方）→ 銷項折讓步驟
        if (accDC === 'C' && (row.AccAmtD ?? 0) > 0) allowanceTypes.add('9');
      } else {
        normalTypes.add(t);
      }
    }

    const ordered = ['3', '4', '5', '8', '6', '9', '7']
      .filter(v => {
        if (v === '5' || v === '6') return normalTypes.has(v);
        if (v === '8' || v === '9') return allowanceTypes.has(v);
        return normalTypes.has(v);
      })
      .map(v => Number(v));

    this.activeVoucherSteps.set(ordered);
    const flow = [1, ...ordered];
    if (!flow.includes(this.currentStep())) this.currentStep.set(1);

    // 新加入的發票/折讓步驟 → 自動跳過去
    const newlyAdded = ordered.find(s => [5, 6, 8, 9].includes(s) && !this._previousActiveSteps.includes(s));
    if (newlyAdded) this.currentStep.set(newlyAdded);
    this._previousActiveSteps = [...ordered];
  }, { allowSignalWrites: true });

  /** 依傳票明細與 queryPOS2013（廠商主檔）同步應付／應收／銀行存款步驟表 */
  private readonly stepRowsSyncEffect = effect(onCleanup => {
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
      // 不用 onCleanup 取消：hydration 具不可撤銷副作用（更新 vendorOptions signal），
      // 取消會使 tap 不執行，導致 VEN_PayConditionDay 永遠無法合併進選項。
      // ensureFin53010VendorForSteps 本身已以 fin53010VenHydrationKeys 保證每鍵只打一次。
      forkJoin([...vensNeedingFin53010].map(v => this.service.ensureFin53010VendorForSteps(v)))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ error: err => this.logger.error('補詢廠商主檔 queryPOS2013_FIN53010 失敗', err) });
    }

    if (table.length === 0) {
      this.stepAPRows.set([]);
      this.stepARRows.set([]);
      this.stepBankRows.set([]);
      return;
    }

    this.stepRowsSyncBusy.set(!0);
    const timer = globalThis.setTimeout(() => {
      try {
        const ap: FIN53010StepAP[] = [];
        const ar: FIN53010StepAR[] = [];
        const bk: FIN53010StepBankDeposit[] = [];

        // 新增模式掃全部列；編輯模式只掃 _dataStatus==='new' 的新增列
        const rowsToSync = this.isFormCreateable
          ? table
          : table.filter(r => (r as unknown as Record<string, unknown>)['_dataStatus'] === 'new');

        for (const row of rowsToSync) {
          const accNo = String(row.AccNo ?? '');
          const vt = accVt.get(accNo);
          if (!vt || !['3', '4', '7'].includes(String(vt))) continue;

          const amt = (row.AccAmtD ?? 0) + (row.AccAmtC ?? 0);
          const noteDesc = this.resolveNoteDescForStep(row);

          if (vt === '3') {
            // 應付帳款：方向對齊（貸方科目放貸方）才產生 step row；反向為沖銷，不新增
            // ABAT_YN 僅影響 PTA 自動編碼，不影響應付列是否產生
            if (!this.isCreatingDirectionRow(row)) continue;
            ap.push(this.buildStepApRowFromDetailTableRow(row, vouDate));
          } else if (vt === '4') {
            // 應收帳款：方向對齊（借方科目放借方）才產生 step row；反向為沖銷，不新增
            // ABAT_YN 僅影響 PTA 自動編碼，不影響應收列是否產生
            if (!this.isCreatingDirectionRow(row)) continue;
            ar.push({
              org_id: row.ORG_ID ?? '100000',
              ven_no: row.DetailNo,
              ars_amt: amt || undefined,
              ars_date: vouDate,
              // 日期一律交由 reconcileStepExpectedDates 權威填入（後端優先），此處不預填以免壓過後端值
              pta_date: undefined,
              acc_no: row.AccNo,
              note_desc: noteDesc,
              PTA: row.PTA ?? null,
            });
          } else if (vt === '7') {
            bk.push({
              ven_no: row.DetailNo,
              bank_no: accNo || undefined,
              deposit_amt: row.AccAmtD ?? undefined,
              withdraw_amt: row.AccAmtC ?? undefined,
              note_desc: noteDesc,
              txn_date: vouDate,
            });
          }
        }

        if (this.isFormCreateable) {
          // 新增模式：依 PTA 合併，保留使用者已填的可編輯欄位（例如 acp_expect_pay_date、pta_date、note_desc）
          const existingAPByPTA = new Map(this.stepAPRows().map(r => [r.PTA?.trim(), r]));
          const existingARByPTA = new Map(this.stepARRows().map(r => [r.PTA?.trim(), r]));

          const apWithSer = ap.map((r, i) => {
            const existing = r.PTA ? existingAPByPTA.get(r.PTA.trim()) : undefined;
            return {
              ...r,
              SerNo: i + 1,
              ...(existing != null ? {
                // 新建列日期一律為 undefined，保留既有值以免重建時閃爍；reconcileStepExpectedDates 會權威補齊
                acp_expect_pay_date: r.acp_expect_pay_date ?? existing.acp_expect_pay_date,
                ven_ctrlyn: existing.ven_ctrlyn ?? r.ven_ctrlyn,
                note_desc: existing.note_desc ?? r.note_desc,
              } : {}),
            };
          });
          const arWithSer = ar.map((r, i) => {
            const existing = r.PTA ? existingARByPTA.get(r.PTA.trim()) : undefined;
            return {
              ...r,
              SerNo: i + 1,
              ...(existing != null ? {
                pta_date: r.pta_date ?? existing.pta_date,
                note_desc: existing.note_desc ?? r.note_desc,
              } : {}),
            };
          });
          const bkWithSer = bk.map((r, i) => ({ ...r, SerNo: i + 1 }));
          this.stepAPRows.set(apWithSer);
          this.stepARRows.set(arWithSer);
          this.stepBankRows.set(bkWithSer);
          this.reconcileStepExpectedDates();
          this.reconcileEmployeeBankAccounts();
        } else {
          // 編輯模式：保留原有 DB 列，將新明細列產生的 step rows 重新合併
          // (以 _dataStatus==='new' 標記的 step row 為上一次 effect 產生的，先移除再重建)
          const mergeStepRows = <T>(existing: T[], generated: T[]): T[] => {
            // Trim PTAs to guard against DB CHAR-field padding mismatches
            const generatedPTAs = new Set(
              generated
                .map(r => ((r as Record<string, unknown>)['PTA'] as string | null | undefined)?.trim())
                .filter((p): p is string => !!p),
            );
            const originals = existing.filter(r => {
              if ((r as Record<string, unknown>)['_dataStatus'] === 'new') return false;
              const pta = ((r as Record<string, unknown>)['PTA'] as string | null | undefined)?.trim();
              // 若新產生的 rows 已包含同 PTA，移除舊的（避免刪除後重新新增時重複）
              return !pta || !generatedPTAs.has(pta);
            });
            const withStatus = generated.map(r => ({ ...r, _dataStatus: 'new' as const }));
            return [...originals, ...withStatus].map((r, i) => ({ ...r, SerNo: i + 1 }));
          };

          if (ap.length > 0 || this.stepAPRows().some(r => (r as Record<string, unknown>)['_dataStatus'] === 'new')) {
            this.stepAPRows.set(mergeStepRows(this.stepAPRows(), ap));
          }
          if (ar.length > 0 || this.stepARRows().some(r => (r as Record<string, unknown>)['_dataStatus'] === 'new')) {
            this.stepARRows.set(mergeStepRows(this.stepARRows(), ar));
          }
          if (ap.length > 0 || ar.length > 0) {
            this.reconcileStepExpectedDates();
            this.reconcileEmployeeBankAccounts();
          }
          if (bk.length > 0 || this.stepBankRows().some(r => (r as Record<string, unknown>)['_dataStatus'] === 'new')) {
            this.stepBankRows.set(mergeStepRows(this.stepBankRows(), bk));
          }

          // 編輯模式：廠商切換後補同步既有 DB 列的廠商付款方式等欄位
          // 觸發時機：1) tableData 改變（廠商選擇） 2) vendorOptions 更新（hydration 完成後）
          const ptaVenSyncMap = new Map<string, string | undefined>();
          for (const row of table) {
            const pta = (row.PTA as string | undefined)?.trim();
            if (pta && row.DetailNo) ptaVenSyncMap.set(pta, row.DetailNo ?? undefined);
          }
          if (ptaVenSyncMap.size > 0) {
            this.stepAPRows.update(rows => rows.map(r => {
              if ((r as Record<string, unknown>)['_dataStatus'] === 'new') return r;
              const pta = r.PTA?.trim();
              if (!pta || !ptaVenSyncMap.has(pta)) return r;
              const venNo = ptaVenSyncMap.get(pta);
              const venOpt = venNo ? getVenOpt(venNo) : undefined;
              if (venOpt?.['VEN_PayType'] == null) return r; // 等 hydration 完成再同步
              const venPayType = venOpt['VEN_PayType'] as string;
              return {
                ...r,
                ven_no: venNo,
                ven_pay_type: venPayType,
                ven_bnk_no: venOpt['VEN_BNK_No'] != null ? String(venOpt['VEN_BNK_No']) : r.ven_bnk_no,
                ven_bnk_branch_no: venOpt['VEN_BNK_BranchNo'] != null ? String(venOpt['VEN_BNK_BranchNo']) : r.ven_bnk_branch_no,
                ven_bank_account: this.formatVenBankAccount(venOpt) ?? r.ven_bank_account,
                ven_ctrlyn: (venOpt['VEN_CTRLYN'] as string | undefined) ?? r.ven_ctrlyn,
                ven_check_title: venPayType === '2' ? (venOpt['VEN_Name'] as string | undefined) : '',
              };
            }));
            this.stepARRows.update(rows => rows.map(r => {
              if ((r as Record<string, unknown>)['_dataStatus'] === 'new') return r;
              const pta = r.PTA?.trim();
              if (!pta || !ptaVenSyncMap.has(pta)) return r;
              return { ...r, ven_no: ptaVenSyncMap.get(pta) };
            }));
          }
        }
      } finally {
        this.stepRowsSyncBusy.set(!1);
      }
    }, 0);
    onCleanup(() => {
      globalThis.clearTimeout(timer);
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

  private formatEmployeeBankAccount(item?: EmployeeBankAccountItem | null): string | undefined {
    if (!item) return undefined;
    const a = item.VEN_BankAccountNo;
    const b = item.VEN_AccountName;
    if (a && b) return `${a} / ${b}`;
    const s = (a ?? b ?? '') as string;
    return s || undefined;
  }

  /**
   * 員工付款：明細列選員工時，APS3001 匯款欄位改由 tblUser_BnkAcct 帶出（員工不在 POS2013 廠商主檔，
   * 走既有廠商 venOpt 路徑會是空白）。只補「銀行欄位為空」的員工列，不覆蓋既有值或使用者輸入。
   * 已快取者立即套用；未快取者非同步補查後再呼叫自己收斂（快取寫入後不會再排入 pending，故不會無限迴圈）。
   * 員工付款方式固定電匯('1')，票據抬頭一律帶員工名稱（員工不在廠商主檔，走 venOpt 路徑會是空白）。
   */
  // attempted：本條收斂鏈已補查過的員工代號。ensureEmployeeBankAccount 遇 API 失敗時
  // 不寫快取（保留下次重試機會），若不記錄「本鏈已試過」，getCachedEmployeeBank 永遠是
  // undefined → 每輪重新排入 pending → subscribe 回呼再打 API → 失敗 → 無限緊迴圈；
  // 每按一次「載入傳票」再疊加一條，最終灌爆瀏覽器。故本鏈只補查一次，未果就停，
  // 下次使用者重新載入時是全新的 attempted，仍可重試。
  private reconcileEmployeeBankAccounts(attempted = new Set<string>()): void {
    const pending = new Set<string>();

    const apply = (r: FIN53010StepAP): FIN53010StepAP => {
      const venNo = String(r.ven_no ?? '').trim();
      if (!venNo || !this.service.isEmployeePayee(venNo)) return r;
      if (r.ven_bnk_no || r.ven_bank_account) return r; // 已有銀行值 → 不覆蓋
      const cached = this.service.getCachedEmployeeBank(venNo);
      if (cached === undefined) { if (!attempted.has(venNo)) pending.add(venNo); return r; } // 尚未查且本鏈未試過 → 排入補查
      // 員工不在廠商主檔，票據抬頭一律帶員工名稱（銀行 API 的 UserName 優先，查無帳號時 fallback 員工下拉名稱）
      const empName = (cached?.UserName as string | undefined)
        ?? (this.service.usrMap().get(venNo)?.['user_Name'] as string | undefined)
        ?? r.ven_check_title;
      if (cached === null) return { ...r, ven_pay_type: r.ven_pay_type ?? '1', ven_check_title: empName }; // 查無帳號，仍給預設付款方式與抬頭
      return {
        ...r,
        ven_pay_type: r.ven_pay_type ?? '1',
        ven_bnk_no: cached.VEN_BNK_No != null ? String(cached.VEN_BNK_No) : r.ven_bnk_no,
        ven_bnk_branch_no: cached.VEN_BNK_BranchNo != null ? String(cached.VEN_BNK_BranchNo) : r.ven_bnk_branch_no,
        ven_bank_account: this.formatEmployeeBankAccount(cached) ?? r.ven_bank_account,
        ven_check_title: empName,
      };
    };

    this.stepAPRows.update(rows => rows.map(apply));

    if (pending.size > 0) {
      pending.forEach(v => attempted.add(v)); // 標記本鏈已試過，失敗也不再於同鏈重打
      forkJoin([...pending].map(u => this.service.ensureEmployeeBankAccount(u)))
        .pipe(take(1), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.reconcileEmployeeBankAccounts(attempted));
    }
  }

  private buildStepApRowFromDetailTableRow(row: FIN53010DetailTable, vouDate: Date): FIN53010StepAP {
    const venOpt = this.service.findVendorOptionByVenNo(String(row.DetailNo ?? ''));
    const amt = (row.AccAmtD ?? 0) + (row.AccAmtC ?? 0);
    const venPayType = venOpt?.['VEN_PayType'] ?? undefined;
    const venCheckTitle = (venPayType === '2') ? (row.DetailName ?? venOpt?.['VEN_Name'] ?? undefined) : '';
    return {
      org_id: row.ORG_ID ?? '100000',
      ven_no: row.DetailNo,
      ven_pay_type: venPayType,
      acp_amt: amt || undefined,
      acp_date: vouDate,
      // 日期一律交由 reconcileStepExpectedDates 權威填入（後端優先），此處不預填以免壓過後端值
      acp_expect_pay_date: undefined,
      ven_bnk_no: venOpt?.['VEN_BNK_No'] != null ? String(venOpt['VEN_BNK_No']) : undefined,
      ven_bnk_branch_no: venOpt?.['VEN_BNK_BranchNo'] != null ? String(venOpt['VEN_BNK_BranchNo']) : undefined,
      ven_bank_account: this.formatVenBankAccount(venOpt),
      ven_ctrlyn: venOpt?.['VEN_CTRLYN'] ?? 'Y',
      ven_check_title: venCheckTitle,
      acc_no: row.AccNo,
      note_desc: this.resolveNoteDescForStep(row),
      PTA: row.PTA ?? null,
    };
  }

  /** 預計付款/收款日：下個月第一天 + VEN_PayConditionDay 天；無天數設定時回傳 undefined */
  private calcExpectPayDate(venOpt: Record<string, unknown> | undefined): Date | undefined {
    const payCondDay = venOpt?.['VEN_PayConditionDay'] as number | null | undefined;
    if (payCondDay == null) return undefined;
    // 天數為 0：代表即付，用系統今日
    if (payCondDay === 0) return new Date();
    const today = new Date();
    const base = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return new Date(base.getFullYear(), base.getMonth(), base.getDate() + payCondDay);
  }

  /**
   * AP/AR 步驟列預計付款/收款日的「唯一」填值入口——具收斂性、可重入、只補空白列。
   *
   * 設計目標：傳票明細填完 → 產生應收/應付 → 打 API → 日期一定帶得進來，不再有時序漏帶。
   *
   * 兩個獨立來源（任一成功即可帶入日期，徹底杜絕單一來源失效造成的空白）：
   *   1) 後端權威值 getCalculatedPayDate(廠商, 立帳日)——不依賴下拉是否帶回 VEN_PayConditionDay。
   *   2) 前端計算值 calcExpectPayDate(已補水化廠商的 VEN_PayConditionDay)——作為 fallback。
   *
   * 尚未有定論的廠商會被非同步補查（後端日期 + 廠商補水化），回來後再套用一次，直到收斂。
   * 只填「目前為空」的列，因此不會覆蓋 DB 載入值或使用者手動輸入值。
   */
  private reconcileStepExpectedDates(): void {
    const vouRaw = this.vouDateForStepSync();
    const vouDate = vouRaw instanceof Date ? vouRaw : (vouRaw ? new Date(vouRaw) : new Date());
    const dateKey = this.datePipe.transform(vouDate, 'yyyy-MM-dd') ?? '';

    const pendingBackend = new Set<string>();
    const pendingHydrate = new Set<string>();

    // 回傳 Date=可填、null=確定無日期、undefined=尚無定論(已排入待查)
    const resolveDate = (venNo: string): Date | null | undefined => {
      // 員工不在廠商主檔、無付款條件天數，預計付款/收款日一律帶立帳日(=傳票日期)
      if (this.service.isEmployeePayee(venNo)) return vouDate;
      const backend = this.service.getCachedPayDate(venNo, dateKey);
      if (backend instanceof Date) return backend;
      if (backend === undefined) pendingBackend.add(venNo);
      if (this.service.isVendorHydratedForFin53010(venNo)) {
        const clientDate = this.calcExpectPayDate(this.service.findVendorOptionByVenNo(venNo));
        if (clientDate) return clientDate;
        if (backend === null) return null; // 後端與前端都判定無日期 → 確定不帶
      } else {
        pendingHydrate.add(venNo);
      }
      return undefined;
    };

    const fill = <T extends object>(rows: T[], venKey: keyof T, dateField: keyof T): T[] => {
      let changed = false;
      const next = rows.map(r => {
        if (r[dateField] != null) return r; // 已有值不覆蓋
        const venNo = String((r[venKey] as unknown) ?? '').trim();
        if (!venNo) return r;
        const d = resolveDate(venNo);
        if (d instanceof Date) { changed = true; return { ...r, [dateField]: d }; }
        return r;
      });
      return changed ? next : rows;
    };

    const applyOnce = () => {
      this.stepAPRows.update(rows => fill(rows, 'ven_no', 'acp_expect_pay_date'));
      this.stepARRows.update(rows => fill(rows, 'ven_no', 'pta_date'));
    };

    applyOnce(); // 同步填入已快取者，並蒐集 pending
    const waits: Observable<unknown>[] = [
      ...[...pendingBackend].map(v => this.service.ensureCalculatedPayDate(v, dateKey)),
      ...[...pendingHydrate].map(v => this.service.ensureFin53010VendorForSteps(v)),
    ];
    if (waits.length > 0) {
      forkJoin(waits).pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => applyOnce(),
        error: err => this.logger.error('補查預計付款/收款日失敗', err),
      });
    }
  }

  private resolveNoteDescForStep(row: FIN53010DetailTable): string {
    const n = row.NoteDesc;
    if (n === void 0 || n === null) return '';
    const mapped = this.service.noteDescMap().get(String(n))?.label;
    return mapped ?? String(n);
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

    const row = this.stepSalesRows()[index];
    const invoiceType = String(row?.invoice_type ?? '').trim();
    if (!['31', '32', '35'].includes(invoiceType)) return;

    const full = `${prefix}${no}`;
    if (this.lastSalesInvoiceLookupKey.get(index) === full) return;
    this.lastSalesInvoiceLookupKey.set(index, full);

    // 1. 配號範圍驗證
    this.service.validateSalesInvoice({ InvoiceType: invoiceType, InvoicePrefix: prefix, InvoiceNo: no })
      .pipe(take(1))
      .subscribe({
        next: res => {
          const isValid = res.Status === '0000' && res.Data === true;
          this.stepSalesRows.update(rows => {
            const next = [...rows];
            if (!next[index]) return rows;
            next[index] = { ...next[index], _invoiceValidated: isValid };
            return next;
          });
          if (!isValid) {
            this.messageService.errorBubble(`銷項發票第 ${(row?.SerNo ?? index + 1)} 筆：字軌 ${prefix} 號碼 ${no} 不在配號範圍內`);
          }
        },
      });

    // 2. 依發票格式查既有發票帶出（31/32 → POS4023、35 → APS4023），已被別傳票占用則提醒且不帶入
    const applyManualHydrate = (item: SalesInvoicePickItem | null): void => {
      if (!item) return; // 查無 → 新發票，靜默
      const occ = (item.VoucherNo ?? '').trim();
      if (occ && occ !== this.currentVouNoOrEmpty()) {
        this.messageService.errorBubble(`發票 ${full} 已被傳票 ${occ} 使用，無法帶入`);
        this.stepSalesRows.update(rows => {
          const next = [...rows];
          if (!next[index]) return rows;
          next[index] = { ...next[index], invoice_no: '', _invoiceValidated: false };
          return next;
        });
        this.lastSalesInvoiceLookupKey.delete(index);
        return;
      }
      const patch = this.mapPickToSalesRow(item);
      // 手輸入帶出：只覆蓋來源有值的欄位，不清掉 user 已填的資料（如買受人統一編號）
      const cleanPatch: Record<string, unknown> = {};
      Object.entries(patch).forEach(([k, v]) => { if (v !== undefined && v !== null) cleanPatch[k] = v; });
      this.stepSalesRows.update(rows => {
        const next = [...rows];
        if (!next[index]) return rows;
        next[index] = this.withClearedInvoiceErrors({ ...next[index], ...cleanPatch });
        return next;
      });
    };

    if (invoiceType === '35') {
      this.service.queryAps4023DetailDataByInvoiceNumber({ InvoiceNumber: full }).pipe(take(1)).subscribe({
        next: res => { if (res.Status === '0000' && res.Data) applyManualHydrate(this.normalizeAps4023(res.Data)); },
      });
    } else {
      this.service.queryPos4023DetailDataByInvoiceNumber({ InvoiceNumber: full }).pipe(take(1)).subscribe({
        next: res => { if (res.Status === '0000' && res.Data) applyManualHydrate(this.normalizePos4023(res.Data)); },
      });
    }
  }

  /** 目前傳票號碼（新增時為 '自動給號' 視為空字串） */
  private currentVouNoOrEmpty(): string {
    const v = this.dataForm.getRawValue().VouNo?.trim() ?? '';
    return v && v !== '自動給號' ? v : '';
  }

  private normalizePos4023(d: Pos4023DetailDataByInvoiceNumberData): SalesInvoicePickItem {
    return {
      InvoiceNumber: String(d.TXN_GUINo ?? '').trim(),
      InvoiceType: String(d.INV_GUIType ?? '').trim(),
      InvoiceDate: d.TXN_Date ?? null,
      TotalAmount: d.TXN_SaleAmt ?? null,
      NetAmount: d.TXN_Net ?? null,
      TaxAmount: d.TXN_Tax ?? null,
      TaxType: d.PLU_TaxType ?? null,
      BuyerUniform: d.TXN_Uniform ?? null,
      DeclareYM: d.INV_DeclareYM ?? null,
      AssetType: d.AssetType ?? null,
      SourceDocNo: d.Source_Doc_No ?? null,
      VoucherNo: d.Voucher_No ?? null,
      SourceId: d.ID ?? null,
    };
  }

  private normalizeAps4023(d: Aps4023DetailDataByInvoiceNumberData): SalesInvoicePickItem {
    return {
      InvoiceNumber: String(d.InvoiceNumber ?? '').trim(),
      InvoiceType: String(d.InvoiceType ?? '').trim(),
      InvoiceDate: d.InvoiceDate ?? null,
      TotalAmount: d.PUR_Amt ?? null,
      NetAmount: d.PUR_Net ?? null,
      TaxAmount: d.PUR_Tax ?? null,
      TaxType: d.PUR_TaxType ?? null,
      BuyerUniform: d.Buyer_Uniform ?? null,
      DeclareYM: d.INV_DeclareYM ?? null,
      AssetType: d.AssetType ?? null,
      SourceDocNo: d.Source_Doc_No ?? null,
      VoucherNo: d.Voucher_No ?? null,
      SourceId: d.ID ?? null,
    };
  }

  /** 帶入用日期解析：嚴格格式優先，失敗再退回寬鬆 new Date()（APS4023 DateTime 與 POS4023 DateOnly 序列化格式不同） */
  private parsePickDate(s: string | null | undefined): Date | null {
    if (s == null || String(s).trim() === '') return null;
    const strict = parseApiDateToLocal(s);
    if (strict) return strict;
    const d = new Date(String(s));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  private mapPickToSalesRow(item: SalesInvoicePickItem): Partial<FIN53010StepSalesInvoiceRow> {
    const full = String(item.InvoiceNumber ?? '').trim();
    const prefix = full.length === 10 ? full.slice(0, 2) : '';
    const no = full.length === 10 ? full.slice(2) : full;
    const ym = item.DeclareYM ? String(item.DeclareYM) : '';
    const declareYm = /^\d{6}$/.test(ym)
      ? new Date(Number(ym.slice(0, 4)), Number(ym.slice(4, 6)) - 1, 1)
      : null;
    return {
      id: item.SourceId ?? undefined,
      invoice_type: item.InvoiceType || undefined,
      invoice_prefix: prefix || undefined,
      invoice_no: no || undefined,
      invoice_date: this.parsePickDate(item.InvoiceDate),
      declare_ym: declareYm,
      buyer_uniform: item.BuyerUniform ?? undefined,
      total_amount: item.TotalAmount ?? undefined,
      tax_type: item.TaxType ?? undefined,
      net_amount: item.NetAmount ?? undefined,
      tax_amount: item.TaxAmount ?? undefined,
      source_doc_no: item.SourceDocNo ?? undefined,
      asset_flag: item.AssetType ?? undefined,
      _invoiceValidated: true,
    };
  }

  /** 雙擊「發票號碼」→ 依格式開既有發票挑選視窗（31/32 查 POS4023、35 查 APS4023） */
  public openSalesInvoicePickerDialog(rowData: FIN53010StepSalesInvoiceRow, index: number): void {
    if (this.isFormReadable) return;
    const invoiceType = String(rowData?.invoice_type ?? '').trim();
    if (!['31', '32', '35'].includes(invoiceType)) {
      this.messageService.errorBubble('請先選擇發票格式');
      return;
    }
    this.salesInvoicePickerSource = invoiceType === '35' ? '35' : '31/32';
    this.salesInvoicePickerRowIndex = index;
    this.salesInvoicePickerRowData = rowData;
    this.salesInvoicePickerQueryControl.setValue('');
    this.salesInvoicePickerSelectedItem = null;
    this.salesInvoicePickerList = [];
    this.salesInvoicePickerTotalRecords = 0;
    this.showSalesInvoicePickerDialog = true;
    this.loadSalesInvoicePickerList();
  }

  public loadSalesInvoicePickerList(): void {
    this.salesInvoicePickerList = [];
    this.salesInvoicePickerTotalRecords = 0;
    this.salesInvoicePickerLoading = true;
    const body = {
      InvoiceNumber: this.salesInvoicePickerQueryControl.value?.trim() || null,
      PageIndex: 1,
      PageSize: 200,
    };
    if (this.salesInvoicePickerSource === '35') {
      this.service.queryAps4023SalesInvoicesForPicker(body).pipe(take(1)).subscribe({
        next: res => {
          this.salesInvoicePickerLoading = false;
          if (res.Status === '0000') {
            this.salesInvoicePickerList = (res.Data ?? []).map(d => this.normalizeAps4023(d));
            this.salesInvoicePickerTotalRecords = res.TotalCount ?? 0;
          }
        },
        error: () => { this.salesInvoicePickerLoading = false; },
      });
    } else {
      this.service.queryPos4023SalesInvoicesForPicker(body).pipe(take(1)).subscribe({
        next: res => {
          this.salesInvoicePickerLoading = false;
          if (res.Status === '0000') {
            this.salesInvoicePickerList = (res.Data ?? []).map(d => this.normalizePos4023(d));
            this.salesInvoicePickerTotalRecords = res.TotalCount ?? 0;
          }
        },
        error: () => { this.salesInvoicePickerLoading = false; },
      });
    }
  }

  public onSalesInvoicePick(item: SalesInvoicePickItem): void {
    const idx = this.salesInvoicePickerRowIndex;
    if (idx === null || idx < 0) return;
    const occ = (item.VoucherNo ?? '').trim();
    if (occ && occ !== this.currentVouNoOrEmpty()) {
      this.messageService.errorBubble(`發票 ${item.InvoiceNumber} 已被傳票 ${occ} 使用，無法選取`);
      return; // 提醒且禁止選取
    }
    const patch = this.mapPickToSalesRow(item);
    this.stepSalesRows.update(rows => {
      const next = [...rows];
      if (!next[idx]) return rows;
      next[idx] = this.withClearedInvoiceErrors({ ...next[idx], ...patch });
      return next;
    });
    const full = String(item.InvoiceNumber ?? '').trim();
    if (full.length === 10) this.lastSalesInvoiceLookupKey.set(idx, full);
    this.showSalesInvoicePickerDialog = false;
  }

  /** 帶入既有發票後，清掉字軌/發票號碼/格式殘留的欄位驗證錯誤（避免有值卻仍紅框報「未輸入」） */
  private withClearedInvoiceErrors(row: FIN53010StepSalesInvoiceRow): FIN53010StepSalesInvoiceRow {
    const errs = (row as Record<string, unknown>)['_validationErrors'] as Record<string, string> | undefined;
    if (!errs) return row;
    const cleaned = { ...errs };
    delete cleaned['invoice_no'];
    delete cleaned['invoice_prefix'];
    delete cleaned['invoice_type'];
    return { ...row, _validationErrors: cleaned } as FIN53010StepSalesInvoiceRow;
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

  private hydratePurchaseAllowanceRowByInvoice(index: number, invoiceNo: string): void {
    if (this.isFormReadable) return;
    if (index < 0 || invoiceNo.length < 8) return;
    this.service.queryAps2002DetailDataByInvoiceNo({ InvoiceNo: invoiceNo }).pipe(take(1)).subscribe({
      next: res => {
        if (res.Status !== '0000' || !res.Data) return;
        const d = res.Data;
        // 格式轉換：原始格式 21→折讓格式 23，22→24（其他保持不變）
        const srcType = String(d.PUR_VoucherType ?? '').trim();
        const allowanceType = srcType === '21' ? '23' : srcType === '22' ? '24' : srcType || undefined;
        this.stepPurchaseAllowanceRows.update(rows => {
          const next = [...rows];
          if (!next[index]) return rows;
          const parsedHydrateDate = d.PUR_GUIDate ? parseApiDateToLocal(d.PUR_GUIDate) : null;
          next[index] = {
            ...next[index],
            voucher_type: allowanceType,
            invoice_date: parsedHydrateDate ?? next[index].invoice_date,
            invoice_amount: d.PUR_Amt ?? next[index].invoice_amount,
            vendor_tax_id: d.PUR_VenUniform ?? next[index].vendor_tax_id,
            tax_type: d.PUR_TaxType ?? next[index].tax_type,
          };
          return next;
        });
      },
    });
  }

  public formatPickerDate(v: string | null | undefined): string {
    if (!v) return '';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  }

  public formatPickerAmt(v: number | null | undefined): string {
    if (v == null) return '';
    return v.toLocaleString();
  }

  public openSalesAllowancePickerDialog(rowData: FIN53010StepSalesInvoiceRow, index: number): void {
    if (this.isFormReadable) return;
    this.salesAllowancePickerRowIndex = index;
    this.salesAllowancePickerRowData = rowData;
    this.salesAllowancePickerQueryControl.setValue('');
    this.salesAllowancePickerSelectedItem = null;
    this.salesAllowancePickerList = [];
    this.salesAllowancePickerTotalRecords = 0;
    this.showSalesAllowancePickerDialog = true;
    this.loadSalesAllowancePickerList();
  }

  public loadSalesAllowancePickerList(): void {
    this.salesAllowancePickerList = [];
    this.salesAllowancePickerTotalRecords = 0;
    this.salesAllowancePickerLoading = true;
    this.service.queryAps4023OriginalInvoicesForAllowance({
      InvoiceNumber: this.salesAllowancePickerQueryControl.value?.trim() || null,
      PageIndex: 1,
      PageSize: 200,
    }).pipe(take(1)).subscribe({
      next: res => {
        this.salesAllowancePickerLoading = false;
        if (res.Status === '0000') {
          this.salesAllowancePickerList = res.Data ?? [];
          this.salesAllowancePickerTotalRecords = res.TotalCount ?? 0;
          const row = this.salesAllowancePickerRowData;
          const list = this.salesAllowancePickerList;
          if (row) {
            const fullNo = String(row.invoice_no ?? '').trim();
            if (fullNo) {
              // double-nested setTimeout: fires after app-table's own setTimeout that clears selectedItems
              setTimeout(() => setTimeout(() => {
                this.salesAllowancePickerSelectedItem = list.find(
                  item => String(item.InvoiceNumber ?? '').trim() === fullNo
                ) ?? null;
              }));
            }
          }
        }
      },
      error: () => { this.salesAllowancePickerLoading = false; },
    });
  }

  public onSalesAllowanceInvoicePick(item: Aps4023DetailDataByInvoiceNumberData): void {
    const rowData = this.salesAllowancePickerRowData;
    if (!rowData) return;
    const fullNo = String(item.InvoiceNumber ?? '').trim();
    const prefix = fullNo.length === 10 ? fullNo.slice(0, 2) : '';
    const srcType = String(item.InvoiceType ?? '').trim();
    const allowanceType = srcType === '31' ? '33' : srcType === '32' ? '34' : srcType || undefined;

    // InvoiceDate 可能已是 Date 物件（HttpClient 或攔截器轉換），直接使用
    const rawDate = item.InvoiceDate as unknown;
    const parsedSalesDate: Date | null = rawDate instanceof Date
      ? rawDate
      : (rawDate ? parseApiDateToLocal(String(rawDate)) : null);

    // 若為 candidate row，promote 並加入 signal（避免切 tab 後資料消失）
    const rd = rowData as Record<string, unknown>;
    if (rd['_isAutoInsertCandidate']) {
      rd['_isAutoInsertCandidate'] = false;
      rd['_dataStatus'] = 'new';
      rowData.invoice_type = allowanceType;
      rowData.invoice_prefix = prefix || undefined;
      rowData.invoice_no = fullNo || undefined;
      rowData.invoice_date = parsedSalesDate ?? rowData.invoice_date;
      rowData.total_amount = item.PUR_Amt ?? rowData.total_amount;
      rowData.tax_type = item.PUR_TaxType ?? rowData.tax_type;
      rowData.buyer_uniform = item.Buyer_Uniform ?? rowData.buyer_uniform;
      this.stepSalesAllowanceRows.update(rows => [...rows, rowData]);
    } else {
      const idx = this.salesAllowancePickerRowIndex;
      if (idx === null || idx < 0) return;
      this.stepSalesAllowanceRows.update(rows => {
        const next = [...rows];
        if (!next[idx]) return rows;
        next[idx] = {
          ...next[idx],
          invoice_type: allowanceType,
          invoice_prefix: prefix || undefined,
          invoice_no: fullNo || undefined,
          invoice_date: parsedSalesDate ?? next[idx].invoice_date,
          total_amount: item.PUR_Amt ?? next[idx].total_amount,
          tax_type: item.PUR_TaxType ?? next[idx].tax_type,
          buyer_uniform: item.Buyer_Uniform ?? next[idx].buyer_uniform,
        };
        return next;
      });
    }
    this.showSalesAllowancePickerDialog = false;
  }

  public openPurchaseAllowancePickerDialog(rowData: FIN53010StepPurchaseInvoiceRow, index: number): void {
    if (this.isFormReadable) return;
    this.purchaseAllowancePickerRowIndex = index;
    this.purchaseAllowancePickerRowData = rowData;
    this.purchaseAllowancePickerQueryControl.setValue('');
    this.purchaseAllowancePickerSelectedItem = null;
    this.purchaseAllowancePickerList = [];
    this.purchaseAllowancePickerTotalRecords = 0;
    this.showPurchaseAllowancePickerDialog = true;
    this.loadPurchaseAllowancePickerList();
  }

  public loadPurchaseAllowancePickerList(): void {
    this.purchaseAllowancePickerList = [];
    this.purchaseAllowancePickerTotalRecords = 0;
    this.purchaseAllowancePickerLoading = true;
    this.service.queryAps2002OriginalInvoicesForAllowance({
      InvoiceNo: this.purchaseAllowancePickerQueryControl.value?.trim() || null,
      PageIndex: 1,
      PageSize: 200,
    }).pipe(take(1)).subscribe({
      next: res => {
        this.purchaseAllowancePickerLoading = false;
        if (res.Status === '0000') {
          this.purchaseAllowancePickerList = res.Data ?? [];
          this.purchaseAllowancePickerTotalRecords = res.TotalCount ?? 0;
          const row = this.purchaseAllowancePickerRowData;
          const list = this.purchaseAllowancePickerList;
          if (row) {
            const invoiceNo = String(row.invoice_no ?? '').trim();
            if (invoiceNo) {
              // double-nested setTimeout: fires after app-table's own setTimeout that clears selectedItems
              setTimeout(() => setTimeout(() => {
                this.purchaseAllowancePickerSelectedItem = list.find(
                  item => String(item.PUR_GUINo ?? '').trim() === invoiceNo
                ) ?? null;
              }));
            }
          }
        }
      },
      error: () => { this.purchaseAllowancePickerLoading = false; },
    });
  }

  public onPurchaseAllowanceInvoicePick(item: Aps2002DetailDataByInvoiceNoData): void {
    const rowData = this.purchaseAllowancePickerRowData;
    if (!rowData) return;
    const srcType = String(item.PUR_VoucherType ?? '').trim();
    const allowanceType = srcType === '21' ? '23' : srcType === '22' ? '24' : srcType || undefined;

    // PUR_GUIDate 可能已是 Date 物件（HttpClient 或攔截器轉換），直接使用
    const rawDate = item.PUR_GUIDate as unknown;
    const parsedDate: Date | null = rawDate instanceof Date
      ? rawDate
      : (rawDate ? parseApiDateToLocal(String(rawDate)) : null);

    // 若為 candidate row，promote 並加入 signal（避免切 tab 後資料消失）
    const rd = rowData as Record<string, unknown>;
    if (rd['_isAutoInsertCandidate']) {
      rd['_isAutoInsertCandidate'] = false;
      rd['_dataStatus'] = 'new';
      rowData.voucher_type = allowanceType;
      rowData.invoice_no = String(item.PUR_GUINo ?? '').trim() || undefined;
      rowData.invoice_date = parsedDate ?? rowData.invoice_date;
      rowData.invoice_amount = item.PUR_Amt ?? rowData.invoice_amount;
      rowData.vendor_tax_id = item.PUR_VenUniform ?? rowData.vendor_tax_id;
      rowData.tax_type = item.PUR_TaxType ?? rowData.tax_type;
      this.stepPurchaseAllowanceRows.update(rows => [...rows, rowData]);
    } else {
      const idx = this.purchaseAllowancePickerRowIndex;
      if (idx === null || idx < 0) return;
      this.stepPurchaseAllowanceRows.update(rows => {
        const next = [...rows];
        if (!next[idx]) return rows;
        next[idx] = {
          ...next[idx],
          voucher_type: allowanceType,
          invoice_no: String(item.PUR_GUINo ?? '').trim() || undefined,
          invoice_date: parsedDate ?? next[idx].invoice_date,
          invoice_amount: item.PUR_Amt ?? next[idx].invoice_amount,
          vendor_tax_id: item.PUR_VenUniform ?? next[idx].vendor_tax_id,
          tax_type: item.PUR_TaxType ?? next[idx].tax_type,
        };
        return next;
      });
    }
    this.showPurchaseAllowancePickerDialog = false;
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
    globalThis.setTimeout(() => {
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
    globalThis.setTimeout(() => {
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
    globalThis.setTimeout(() => {
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
        // 重置 fingerprint，確保 dataEffect 一定重新套用（避免同張傳票因快取被跳過）
        this._lastAppliedDetailTableFingerprint = null;
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
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  private clearRelatedDetailTables(): void {
    this.ars3001RelatedRows.set([]);
    this.aps3001RelatedRows.set([]);
    this.aps2002_CRelatedRows.set([]);
    this.aps2002RelatedRows.set([]);
    this.aps4023_CRelatedRows.set([]);
    this.aps4023RelatedRows.set([]);
    this.aps4002RelatedRows.set([]);
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
    this.stepPurchaseAllowanceRows.set([]);
    this.stepSalesAllowanceRows.set([]);
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
      this.service.queryFIN53010DetailDataByVouNoForUpdate({ VouNo: v }).pipe(
        takeUntilDestroyed(this.destroyRef),
      ).subscribe({
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
          this.stepSalesAllowanceRows.set(mapped.stepSalesAllowanceRows);
          this.stepPurchaseRows.set(mapped.stepPurchaseRows);
          this.stepPurchaseAllowanceRows.set(mapped.stepPurchaseAllowanceRows);
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
    this.service.queryFIN53010DetailDataByVouNo({ VouNo: v }).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
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
        this.aps4002RelatedRows.set(pick(d._APS4002));
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
  public readonly validateRow = (_rowData: FIN53010DetailTable): { isValid: boolean, errorMessage: string; } => {
    // const accNo = String(rowData.AccNo ?? '').trim();
    // const orgId = String(rowData.ORG_ID ?? '').trim();

    // if (accNo === '123208') {
    //   const allowedOrgIds = ['107400', '107500', '100200', '100210', '100300', '100310', '106000'];
    //   if (!allowedOrgIds.includes(orgId)) {
    //     return { isValid: false, errorMessage: '組織代號有誤。只可以輸入以下組織代號: 107400, 107500, 100200, 100210, 100300, 100310, 106000' };
    //   }
    // }

    return { isValid: true, errorMessage: '' };
  };

  public onSubmit(): void {
    // 應付/應收步驟表格：在當前步驟時用 ViewChild 驗證（顯示欄位紅框）；非當前步驟則用資料層檢查
    const apValid = this.apTableEditComponent?.validateAndShowErrors();
    const arValid = this.arTableEditComponent?.validateAndShowErrors();
    if (apValid === false || arValid === false) return;

    if (this.activeVoucherSteps().includes(3) && apValid === undefined) {
      const badAP = this.stepAPRows().filter(r =>
        !r.org_id || !r.ven_no || !r.ven_pay_type || !(r.acp_amt ?? 0) || !r.acp_expect_pay_date || !r.acp_date || !r.acc_no
      );
      if (badAP.length > 0) {
        this.messageService.errorBubble(`應付帳款第 ${badAP.map(r => r.SerNo).join('、')} 筆有必填欄位未填`);
        return;
      }
    }
    if (this.activeVoucherSteps().includes(4) && arValid === undefined) {
      const badAR = this.stepARRows().filter(r =>
        !r.org_id || !r.ven_no || !(r.ars_amt ?? 0) || !r.pta_date || !r.ars_date || !r.acc_no
      );
      if (badAR.length > 0) {
        this.messageService.errorBubble(`應收帳款第 ${badAR.map(r => r.SerNo).join('、')} 筆有必填欄位未填`);
        return;
      }
    }

    const valid = this.purchaseTableEditComponent?.validateAndShowErrors();
    const bankValid = this.bankTableEditComponent?.validateAndShowErrors();

    if (valid === false || bankValid === false) {
      return;
    }

    // 銷項發票：所有列必須已找到對應 DB 記錄（id 不為 0 / undefined）
    // 例外1：無發票號碼但有憑證單號（如格式35走憑證單號路徑）→ 略過配號驗證
    // 例外2：格式35無發票號碼且無憑證單號 → 後端自動帶入傳票號碼，不在此報錯
    if (this.activeVoucherSteps().includes(6)) {
      const invalidRows = this.stepSalesRows()
        .map((r, i) => ({ r, i }))
        .filter(({ r }) => {
          if (r.isPOS4023 || r._invoiceValidated) return false;
          const hasInvoiceNo = !!String(r.invoice_no ?? '').trim();
          const hasSourceDocNo = !!String(r.source_doc_no ?? '').trim();
          if (!hasInvoiceNo && hasSourceDocNo) return false;
          if (!hasInvoiceNo && !hasSourceDocNo) return false; // 後端自動補 VouNo
          return true;
        });
      if (invalidRows.length > 0) {
        const serNos = invalidRows.map(({ r, i }) => r.SerNo ?? (i + 1)).join('、');
        this.messageService.errorBubble(`銷項發票第 ${serNos} 筆發票號碼在系統中查無資料，請確認字軌及發票號碼是否正確`);
        return;
      }
    }

    const proceed = () => this.handleSubmit(this.dataForm, () => {
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

      // 立沖代號防呆：ABAT_YN='Y' 且非 auto-code 列 且有金額，PTA 不可空白
      const ptaInvalidRows = this.tableData().filter(row => {
        const { ABAT_YN } = this.getAccAbatInfo(row.AccNo);
        if (ABAT_YN !== 'Y') return false;
        if (this.isAutoCodeRow(row)) return false;
        const hasAmt = (row.AccAmtD ?? 0) > 0 || (row.AccAmtC ?? 0) > 0;
        return hasAmt && !row.PTA;
      });
      if (ptaInvalidRows.length > 0) {
        const serNos = ptaInvalidRows.map(r => r.SerNo).join('、');
        this.messageService.errorBubble(`第 ${serNos} 列為立沖科目，立沖代號必填`);
        this.loading = false;
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
        // 員工不在廠商主檔，falls back 到員工選項，讓 VEN_Name 帶得到員工姓名
        getVendorOption: v => this.service.findVendorOptionByVenNo(v) ?? this.service.usrMap().get(String(v ?? '').trim()),
      };

      // 確保進項發票每筆 ven_no 都有值（舊資料可能因 vendor_tax_id 未重新選取而遺失）
      const uniformMap = this.service.vendorUniformToVenNoMap();
      const resolvedPurchaseRows = this.stepPurchaseRows().map(r => {
        if (r.ven_no) return r;
        const venNo = r.vendor_tax_id ? uniformMap.get(String(r.vendor_tax_id)) : undefined;
        return venNo ? { ...r, ven_no: venNo } : r;
      });
      const resolvedPurchaseAllowanceRows = this.stepPurchaseAllowanceRows().map(r => {
        if (r.ven_no) return r;
        const venNo = r.vendor_tax_id ? uniformMap.get(String(r.vendor_tax_id)) : undefined;
        return venNo ? { ...r, ven_no: venNo } : r;
      });

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
          stepPurchaseRows: resolvedPurchaseRows,
          stepSalesAllowanceRows: this.stepSalesAllowanceRows(),
          stepPurchaseAllowanceRows: resolvedPurchaseAllowanceRows,
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
          stepPurchaseRows: resolvedPurchaseRows,
          stepSalesAllowanceRows: this.stepSalesAllowanceRows(),
          stepPurchaseAllowanceRows: resolvedPurchaseAllowanceRows,
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

    // 若有進項或銷項列發票號碼與憑證單號皆空，先詢問是否以傳票號碼自動填入憑證單號
    const purchaseAutoFillRows = this.activeVoucherSteps().includes(5)
      ? this.stepPurchaseRows()
        .map((r, i) => ({ r, i }))
        .filter(({ r }) => !String(r.invoice_no ?? '').trim() && !String(r.source_doc_no ?? '').trim())
      : [];
    const salesAutoFillRows = this.activeVoucherSteps().includes(6)
      ? this.stepSalesRows()
        .map((r, i) => ({ r, i }))
        .filter(({ r }) => !String(r.invoice_no ?? '').trim() && !String(r.source_doc_no ?? '').trim())
      : [];

    if (purchaseAutoFillRows.length > 0 || salesAutoFillRows.length > 0) {
      const lines: string[] = [];
      if (purchaseAutoFillRows.length > 0) {
        const nos = purchaseAutoFillRows.map(({ r, i }) => r.SerNo ?? (i + 1)).join('、');
        lines.push(`進項發票第 ${nos} 筆`);
      }
      if (salesAutoFillRows.length > 0) {
        const nos = salesAutoFillRows.map(({ r, i }) => r.SerNo ?? (i + 1)).join('、');
        lines.push(`銷項發票第 ${nos} 筆`);
      }
      this.confirmationService.confirm({
        message: `${lines.join('，')} 未填發票號碼及憑證單號，系統將自動以傳票號碼作為憑證單號，是否繼續送出？`,
        header: '確認',
        acceptLabel: '確定送出',
        rejectLabel: '取消',
        acceptButtonStyleClass: 'p-button-primary',
        rejectButtonStyleClass: 'p-button-outlined p-button-secondary',
        accept: proceed,
      });
      return;
    }

    proceed();
  }

  public onDataChange(data: FIN53010DetailTable[]): void {
    this.logger.debug(`onDataChange:`, [data]);
    const oldData = this.tableData();
    const renumbered = data.map((row, i) => ({ ...row, SerNo: (i + 1) * 10, index: i }));
    this.tableData.set(renumbered);
    this.rebuildAllAutoPta();
    this.rowEditCanSave.set(this.tableData().some(row => row.AccNo && row.ORG_ID) || !!this.isBalanced());

    const newById = new Map(this.tableData().filter(r => r.id).map(r => [r.id, r]));
    const deletedPTAs = new Set<string>();
    const ptaRemap = new Map<string, string>();

    for (const old of oldData) {
      if (!old.PTA || !old.id) continue;
      const newRow = newById.get(old.id);
      if (newRow) {
        if (newRow.PTA && newRow.PTA !== old.PTA) ptaRemap.set(old.PTA, newRow.PTA);
      } else {
        deletedPTAs.add(old.PTA);
      }
    }

    if (deletedPTAs.size > 0) {
      this.stepAPRows.update(rows => rows.filter(r => !r.PTA || !deletedPTAs.has(r.PTA)));
      this.stepARRows.update(rows => rows.filter(r => !r.PTA || !deletedPTAs.has(r.PTA)));
    }
    if (ptaRemap.size > 0) {
      this.stepAPRows.update(rows => rows.map(r => r.PTA && ptaRemap.has(r.PTA) ? { ...r, PTA: ptaRemap.get(r.PTA) } : r));
      this.stepARRows.update(rows => rows.map(r => r.PTA && ptaRemap.has(r.PTA) ? { ...r, PTA: ptaRemap.get(r.PTA) } : r));
    }

    // Always sync vendor + amount from current tableData to AP/AR rows by PTA (works for both create and edit mode)
    // Trim PTAs to guard against DB CHAR-field padding mismatches
    const ptaToVendor = new Map<string, string | undefined>();
    const ptaToAmt = new Map<string, number | undefined>();
    for (const row of this.tableData()) {
      const pta = row.PTA?.trim();
      if (pta) {
        ptaToVendor.set(pta, row.DetailNo ?? undefined);
        const amt = (row.AccAmtD ?? 0) + (row.AccAmtC ?? 0);
        ptaToAmt.set(pta, amt || undefined);
      }
    }
    if (ptaToVendor.size > 0) {
      const vensToLoad = new Set<string>();

      // 只同步「非日期」的廠商欄位（付款方式、銀行、抬頭等）；日期一律交給 reconcileStepExpectedDates
      const applyVenOptToAP = (r: FIN53010StepAP, venOpt: Record<string, unknown>): FIN53010StepAP => {
        const venPayType = venOpt['VEN_PayType'] as string | undefined;
        const venOptAsOption = venOpt as unknown as Option;
        return {
          ...r,
          ven_pay_type: venPayType ?? r.ven_pay_type,
          ven_bnk_no: venOpt['VEN_BNK_No'] != null ? String(venOpt['VEN_BNK_No']) : r.ven_bnk_no,
          ven_bnk_branch_no: venOpt['VEN_BNK_BranchNo'] != null ? String(venOpt['VEN_BNK_BranchNo']) : r.ven_bnk_branch_no,
          ven_bank_account: this.formatVenBankAccount(venOptAsOption) ?? r.ven_bank_account,
          ven_ctrlyn: (venOpt['VEN_CTRLYN'] as string | undefined) ?? r.ven_ctrlyn,
          ven_check_title: venPayType === '2' ? (venOpt['VEN_Name'] as string | undefined) : '',
        };
      };

      this.stepAPRows.update(rows => rows.map(r => {
        const pta = r.PTA?.trim();
        if (!pta || !ptaToVendor.has(pta)) return r;
        const newVenNo = ptaToVendor.get(pta);
        // 廠商變更 → 清空日期，讓 reconcile 依新廠商重新帶入
        const venChanged = String(r.ven_no ?? '').trim() !== String(newVenNo ?? '').trim();
        const venOpt = newVenNo ? this.service.findVendorOptionByVenNo(newVenNo) : undefined;
        if (newVenNo && !this.service.isVendorHydratedForFin53010(newVenNo)) vensToLoad.add(newVenNo);
        const base = { ...r, ven_no: newVenNo, acp_amt: ptaToAmt.get(pta), ...(venChanged ? { acp_expect_pay_date: undefined } : {}) };
        return venOpt ? applyVenOptToAP(base, venOpt) : base;
      }));

      this.stepARRows.update(rows => rows.map(r => {
        const pta = r.PTA?.trim();
        if (!pta || !ptaToVendor.has(pta)) return r;
        const newVenNo = ptaToVendor.get(pta);
        const venChanged = String(r.ven_no ?? '').trim() !== String(newVenNo ?? '').trim();
        if (newVenNo && !this.service.isVendorHydratedForFin53010(newVenNo)) vensToLoad.add(newVenNo);
        return { ...r, ven_no: newVenNo, ars_amt: ptaToAmt.get(pta), ...(venChanged ? { pta_date: undefined } : {}) };
      }));

      // 廠商選項未載入時補水化，回來後重算非日期欄位（日期由 reconcile 收斂）
      if (vensToLoad.size > 0) {
        forkJoin([...vensToLoad].map(v => this.service.ensureFin53010VendorForSteps(v)))
          .pipe(take(1))
          .subscribe(() => {
            this.stepAPRows.update(rows => rows.map(r => {
              const venNo = String(r.ven_no ?? '').trim();
              const venOpt = venNo ? this.service.findVendorOptionByVenNo(venNo) : undefined;
              return venOpt ? applyVenOptToAP(r, venOpt) : r;
            }));
            this.reconcileStepExpectedDates();
            this.reconcileEmployeeBankAccounts();
          });
      }

      // 唯一日期填值入口（同步已快取者，未定者非同步補齊後收斂）
      this.reconcileStepExpectedDates();
      this.reconcileEmployeeBankAccounts();
    }
  }

  public onStepAPDataChange(data: FIN53010StepAP[]): void {
    const newPTAs = new Set(data.map(r => r.PTA).filter((p): p is string => !!p));
    const deletedPTAs = this.stepAPRows()
      .map(r => r.PTA)
      .filter((p): p is string => !!p && !newPTAs.has(p));
    if (deletedPTAs.length > 0) {
      this.tableData.update(rows =>
        rows.map(row => (row.PTA && deletedPTAs.includes(row.PTA) ? { ...row, PTA: undefined } as FIN53010DetailTable : row))
      );
    }
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
    const newPTAs = new Set(data.map(r => r.PTA).filter((p): p is string => !!p));
    const deletedPTAs = this.stepARRows()
      .map(r => r.PTA)
      .filter((p): p is string => !!p && !newPTAs.has(p));
    if (deletedPTAs.length > 0) {
      this.tableData.update(rows =>
        rows.map(row => (row.PTA && deletedPTAs.includes(row.PTA) ? { ...row, PTA: undefined } as FIN53010DetailTable : row))
      );
    }
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
    const idx = event.index;
    if (typeof idx !== 'number' || idx < 0) return;
    const row = event.rowData as FIN53010StepSalesInvoiceRow;

    // 改發票號碼/字軌/格式 = 換一張發票：清掉既有 id → 存檔重新 link/insert，舊發票由後端解除綁定
    if ((f === 'invoice_type' || f === 'invoice_prefix' || f === 'invoice_no') && row.id != null) {
      event.rowData.id = undefined;
    }

    if (f === 'invoice_date' || f === 'declare_ym') {
      const srcDate = f === 'invoice_date'
        ? (row.invoice_date instanceof Date ? row.invoice_date : null)
        : (row.declare_ym instanceof Date ? row.declare_ym : null);
      if (!srcDate) return;
      const month = srcDate.getMonth();
      const nextEvenMonth = month % 2 === 0
        ? new Date(srcDate.getFullYear(), month + 1, 1)
        : new Date(srcDate.getFullYear(), month, 1);
      event.rowData.declare_ym = nextEvenMonth;
      // 申報年月結案檢查
      const ym = this.datePipe.transform(nextEvenMonth, 'yyyyMM');
      if (ym) {
        this.service.checkRepYYYYMMAudited(ym).pipe(take(1)).subscribe(isAudited => {
          if (isAudited) {
            this.messageService.errorBubble(`申報年月 ${ym} 已結束申報，不可新增`);
            event.rowData.declare_ym = null;
          }
        });
      }
      return;
    }

    // 格式 35 且發票號碼未填 → 憑證單號自動帶入傳票編號
    if (f === 'invoice_type') {
      const vt = String(event.value ?? '').trim();
      if (vt === '35') {
        const invoiceNo = String(row.invoice_no ?? '').trim();
        const sourceDocNo = String(row.source_doc_no ?? '').trim();
        const vouNo = this.dataForm.getRawValue().VouNo?.trim() ?? '';
        if (!invoiceNo && !sourceDocNo && vouNo && vouNo !== '自動給號') {
          event.rowData.source_doc_no = vouNo;
        }
      }
    }

    if (f === 'total_amount' || f === 'tax_type') {
      const amount = row.total_amount;
      if (amount != null && amount > 0) {
        const taxType = String(row.tax_type ?? '').trim();
        if (taxType === '1') {
          const tax = Math.round(amount * 5 / 105);
          event.rowData.tax_amount = tax;
          event.rowData.net_amount = amount - tax;
        } else {
          event.rowData.tax_amount = 0;
          event.rowData.net_amount = amount;
        }
      }
      return;
    }

    if (f !== 'invoice_prefix' && f !== 'invoice_no') return;
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
      // 申報年月結案檢查
      const ym = this.datePipe.transform(nextEvenMonth, 'yyyyMM');
      if (ym) {
        this.service.checkRepYYYYMMAudited(ym).pipe(take(1)).subscribe(isAudited => {
          if (isAudited) {
            this.messageService.errorBubble(`申報年月 ${ym} 已結束申報，不可新增`);
            event.rowData.declare_ym = null;
          }
        });
      }
      return;
    }

    // 廠商統一編號變更 → 自動帶入廠商代號
    if (f === 'vendor_tax_id') {
      const uniform = String(row.vendor_tax_id ?? '').trim();
      const venNo = uniform ? this.service.vendorUniformToVenNoMap().get(uniform) : undefined;
      event.rowData.ven_no = venNo ?? '0';
      return;
    }

    // 發票總金額或課稅別變更 → 自動計算未稅金額與稅額；課稅別變更時聯動扣抵代號
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
      // 課稅別變更時聯動扣抵代號：免稅(2)/零稅率(3) → 3；其他 → 1
      if (f === 'tax_type') {
        const taxType = String(row.tax_type ?? '').trim();
        event.rowData.deduction_code = (taxType === '2' || taxType === '3') ? '3' : '1';
      }
      return;
    }

    // 格式 22/27/28 且憑證單號未填 → 自動帶入傳票編號（新增模式 VouNo 為「自動給號」時略過）
    if (f === 'voucher_type') {
      const vt = String(event.value ?? '').trim();
      if (['22', '27', '28'].includes(vt)) {
        const sourceDocNo = String(row.source_doc_no ?? '').trim();
        const vouNo = this.dataForm.getRawValue().VouNo?.trim() ?? '';
        if (!sourceDocNo && vouNo && vouNo !== '自動給號') {
          event.rowData.source_doc_no = vouNo;
        }
      }
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


  public onStepPurchaseAllowanceDataChange(data: FIN53010StepPurchaseInvoiceRow[]): void {
    this.stepPurchaseAllowanceRows.set(data.map((row, i) => ({ ...row, SerNo: i + 1 })));
  }

  public onStepSalesAllowanceDataChange(data: FIN53010StepSalesInvoiceRow[]): void {
    this.stepSalesAllowanceRows.set(data.map((row, i) => ({ ...row, SerNo: i + 1 })));
  }

  /** 銷項折讓步驟表 fieldChange：字軌 + 發票號碼齊備時帶入原發票資訊；金額/課稅別變更時計算稅額 */
  public onStepSalesAllowanceFieldChange(event: StepFieldChangeEvent): void {
    if (this.isFormReadable) return;
    const f = event.field;
    const idx = event.index;
    if (typeof idx !== 'number' || idx < 0) return;
    const row = event.rowData as FIN53010StepSalesInvoiceRow;

    if (f === 'total_amount' || f === 'tax_type') {
      const amount = row.total_amount;
      if (amount != null && amount > 0) {
        const taxType = String(row.tax_type ?? '').trim();
        if (taxType === '1') {
          const tax = Math.round(amount * 5 / 105);
          event.rowData.tax_amount = tax;
          event.rowData.net_amount = amount - tax;
        } else {
          event.rowData.tax_amount = 0;
          event.rowData.net_amount = amount;
        }
      }
    }

  }

  /** 進項折讓步驟表 fieldChange：invoice_no blur 帶入原發票資訊；金額/課稅別變更時計算稅額 */
  public onStepPurchaseAllowanceFieldChange(event: StepFieldChangeEvent): void {
    if (this.isFormReadable) return;
    const f = event.field;
    const row = event.rowData as FIN53010StepPurchaseInvoiceRow;

    if (f === 'invoice_amount' || f === 'tax_type') {
      const amount = row.invoice_amount;
      if (amount != null && amount > 0) {
        const taxType = String(row.tax_type ?? '').trim();
        if (taxType === '1') {
          const tax = Math.round(amount * 5 / 105);
          event.rowData.tax_amount = tax;
          event.rowData.net_amount = amount - tax;
        } else {
          event.rowData.tax_amount = 0;
          event.rowData.net_amount = amount;
        }
      }
    }

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
          // 科目不需立沖時清空 PTA
          if (this.getAccAbatInfo(String(event.value)).ABAT_YN !== 'Y') {
            rowData.PTA = undefined;
          }
          this.rebuildAllAutoPta();
          break;

        case 'AccAmtD':
          // 自動互斥借貸方金額
          if (event.value) rowData.AccAmtC = void 0;
          // rebuildAllAutoPta 由 onDataChange 呼叫（tableData 已更新後），
          // 在此提前呼叫時 tableData 仍是舊值，會錯誤清除原有 PTA 並產生新號
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
      // if (rowData.AccNo?.startsWith('1232')
      //   && this.service.orgMap().get(rowData.ORG_ID || '')?.label?.endsWith('部')) {
      //   rowData.AccNo = '123208';
      //   rowData.AccCName = this.service.accNoMap().get('123208')?.label ?? '';
      // }
    }
  }

  /** 從 accNoMap 取得科目的 AccDC 與 ABAT_YN */
  private getAccAbatInfo(accNo: string | undefined | null): { AccDC: string; ABAT_YN: string } {
    const info = this.service.accNoMap().get(String(accNo ?? ''));
    return {
      AccDC: String(info?.['AccDC'] ?? '').trim(),
      ABAT_YN: String(info?.['ABAT_YN'] ?? '').trim(),
    };
  }

  /** 立沖代號欄位底色：
   *  同方向（系統自動產生 #N）→ 綠底 pta-cell-auto
   *  反向（須自行挑選立沖代號）→ 橘底 pta-cell-manual */
  public ptaCellClass = (rowData: FIN53010DetailTable): string => {
    const { AccDC, ABAT_YN } = this.getAccAbatInfo(rowData?.AccNo);
    if (ABAT_YN !== 'Y') return '';
    if (this.isAutoCodeRow(rowData)) return 'pta-cell-auto';
    const isReverse = (AccDC === 'D' && (rowData?.AccAmtC ?? 0) > 0)
      || (AccDC === 'C' && (rowData?.AccAmtD ?? 0) > 0);
    return isReverse ? 'pta-cell-manual' : '';
  };

  /** 判斷該列是否為「建立方向」（與科目借貸方向一致且有金額），不考慮 ABAT_YN。
   *  用於判斷 Voucher_Type=3/4 是否應產生應付/應收列。 */
  private isCreatingDirectionRow(rowData: FIN53010DetailTable): boolean {
    const { AccDC } = this.getAccAbatInfo(rowData.AccNo);
    if (AccDC === 'D' && (rowData.AccAmtD ?? 0) > 0) return true;
    if (AccDC === 'C' && (rowData.AccAmtC ?? 0) > 0) return true;
    return false;
  }

  /** 判斷該列是否應自動編碼 PTA（同方向 + ABAT_YN=Y） */
  private isAutoCodeRow(rowData: FIN53010DetailTable): boolean {
    const { ABAT_YN } = this.getAccAbatInfo(rowData.AccNo);
    if (ABAT_YN !== 'Y') return false;
    return this.isCreatingDirectionRow(rowData);
  }

  /** 為「自動編碼」列指定 PTA。
   *  新增模式（VouNo='自動給號'）：沒有 PTA 的 auto-code row 給暫存 ID #1, #2, …
   *  編輯模式：只補沒有 PTA 的 auto-code row，取現有最大號 +1；原號不重排。 */
  private rebuildAllAutoPta(): void {
    const vouNo = this.dataForm.getRawValue().VouNo?.trim() ?? '';

    if (!vouNo || vouNo === '自動給號') {
      // 新增模式：計算已用最大暫存號，再補給空缺的 auto-code rows
      let counter = 1;
      for (const r of this.tableData()) {
        if (this.isAutoCodeRow(r) && r.PTA?.startsWith('#')) {
          const n = parseInt(r.PTA.slice(1), 10);
          if (!isNaN(n) && n >= counter) counter = n + 1;
        }
      }
      this.tableData.update(rows =>
        rows.map(row => {
          if (this.isAutoCodeRow(row) && !row.PTA) {
            return { ...row, PTA: `#${counter++}` };
          }
          // 曾是 auto-code row（有 #N）但條件已不符（科目換掉、金額清空、方向切換）→ 清除暫存 PTA
          if (row.PTA?.startsWith('#') && !this.isAutoCodeRow(row)) {
            return { ...row, PTA: undefined };
          }
          return row;
        })
      );
      return;
    }

    // 編輯模式：取現有最大序號，只補沒有 PTA 的 auto-code row
    const autoPrefix = `${vouNo}-`;
    const detailNums = this.tableData()
      .filter(r => r.PTA?.startsWith(autoPrefix))
      .map(r => parseInt(r.PTA!.slice(autoPrefix.length), 10))
      .filter(n => !isNaN(n));
    // 也納入 step rows 已用的號碼，避免刪除後重新新增時產生重複 PTA
    const stepNums = [
      ...this.stepAPRows().map(r => r.PTA),
      ...this.stepARRows().map(r => r.PTA),
    ].filter((p): p is string => typeof p === 'string' && p.startsWith(autoPrefix))
      .map(p => parseInt(p.slice(autoPrefix.length), 10))
      .filter(n => !isNaN(n));
    const allNums = [...detailNums, ...stepNums];
    let maxCounter = allNums.length > 0 ? Math.max(...allNums) : 0;

    this.tableData.update(rows =>
      rows.map(row => {
        if (this.isAutoCodeRow(row) && !row.PTA) {
          return { ...row, PTA: `${autoPrefix}${++maxCounter}` };
        }
        // 方向切換 → 清掉舊的自動 PTA（僅對尚未存入 DB 的新列；已存 DB 的列 PTA 不自動清除，須由 user 手動刪除）
        const { ABAT_YN } = this.getAccAbatInfo(row.AccNo);
        if (ABAT_YN === 'Y' && row.PTA?.startsWith(autoPrefix) && !this.isAutoCodeRow(row) && !row.id) {
          return { ...row, PTA: undefined };
        }
        return row;
      })
    );
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

  /**
   * 傳票明細刪除前的檢查（供 app-table-edit 的 beforeDelete 使用）。
   * 立帳明細（有 PTA 且已存 DB）若已被沖帳 → 回 false 擋下刪除。
   */
  public ptaDeleteGuard = (rows: (FIN53010DetailTable & EditColumnExtend)[]): Observable<boolean> => {
    const lockGls3002Ids = (rows ?? [])
      .filter(r => r?.id && r.PTA)
      .map(r => r.id as number);

    if (!lockGls3002Ids.length) return of(true);

    return this.service.checkGLS3003PtaLocked({ Gls3002Ids: lockGls3002Ids }).pipe(
      take(1),
      map(res => {
        const locked = res.Data ?? [];
        if (locked.length) {
          const ptas = locked.map(l => l.PTA).filter(Boolean).join('、');
          this.messageService.errorBubble(`立沖代號 ${ptas} 之立帳已被沖帳，無法刪除`);
          return false;
        }
        return true;
      }),
    );
  };

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

  // ── 立沖代號選取彈窗 ─────────────────────────────────────────────────────

  openPtaDialog(rowIndex: number, amtField?: 'AccAmtD' | 'AccAmtC'): void {
    const rowData = this.tableData()[rowIndex];
    if (!rowData?.AccNo) return;

    this.currentEditingPtaRowIndex = rowIndex;
    this.currentEditingPtaAccNo = rowData.AccNo ?? null;
    this.currentEditingPtaAmtField = amtField ?? null;
    this.showPtaDialog = true;
    this.ptaFilterForm.reset();
    this.ptaDialogSelectedItem = null;
    this.ptaDialogData = [];

    const currentPta = rowData.PTA;
    this.ptaDialogLoading = true;
    this.service.queryGLS3003AbatAcct({ AccNo: rowData.AccNo })
      .pipe(finalize(() => (this.ptaDialogLoading = false)), take(1))
      .subscribe((response: { Data?: QueryGLS3003AbatAcctResponse[] | null }) => {
        this.ptaDialogData = response.Data ?? [];
        if (currentPta) {
          const match = this.ptaDialogData.find(item => item.PTA === currentPta);
          if (match) {
            this.ptaDialogSelectedItem = match;
            setTimeout(() => {
              if (this.ptaDialogTable?.dt) {
                this.ptaDialogTable.selectedItems = match;
                this.ptaDialogTable.dt.selection = match;
              }
            }, 100);
          }
        }
      });
  }

  filterPtaDialog(): void {
    const { VouNo, PTA, VEN_No, USR_No } = this.ptaFilterForm.value;
    this.ptaDialogLoading = true;
    this.service.queryGLS3003AbatAcct({
      AccNo: this.currentEditingPtaAccNo,
      VouNo: VouNo || null,
      PTA: PTA || null,
      VEN_No: VEN_No || USR_No || null,  // 廠商或員工代號二選一
    })
      .pipe(finalize(() => (this.ptaDialogLoading = false)), take(1))
      .subscribe((response: { Data?: QueryGLS3003AbatAcctResponse[] | null }) => {
        this.ptaDialogData = response.Data ?? [];
      });
  }

  onPtaRowSelect(event: { data?: QueryGLS3003AbatAcctResponse }): void {
    if (event.data) {
      this.ptaDialogSelectedItem = event.data;
    }
  }

  confirmPtaSelection(): void {
    let selected = this.ptaDialogSelectedItem;
    if (!selected) {
      const raw = this.ptaDialogTable?.selectedItems;
      selected = Array.isArray(raw) ? (raw[0] ?? null) : (raw as QueryGLS3003AbatAcctResponse ?? null);
    }
    if (!selected) return;

    const rowIndex = this.currentEditingPtaRowIndex;
    const amtField = this.currentEditingPtaAmtField;
    if (rowIndex !== null) {
      this.tableData.update(rows =>
        rows.map((r, i) => {
          if (i !== rowIndex) return r;
          const updated: FIN53010DetailTable = { ...r, PTA: selected.PTA ?? '' };
          // 決定沖帳金額落在哪個方向：從金額欄開窗用該欄；從立沖代號欄開窗(amtField=null)
          // 則依科目 AccDC 推導（C 科目沖在借方、D 科目沖在貸方），才能在「改選不同 PTA」時
          // 一樣回填廠商/金額/摘要（過去只在金額欄開窗才填，改 PTA 欄只換代號，是這次的 bug）
          const effAmtField: 'AccAmtD' | 'AccAmtC' | null = amtField
            ?? (this.getAccAbatInfo(r.AccNo).AccDC === 'C' ? 'AccAmtD'
              : this.getAccAbatInfo(r.AccNo).AccDC === 'D' ? 'AccAmtC'
                : null);
          if (effAmtField) {
            // 從 PTA 對象自動回填廠商代號、摘要
            const venNo = (selected.VEN_No ?? '').trim();
            if (venNo) {
              updated.DetailNo = venNo;
              // templateDisplayField='DetailName' 讀的是 rowData.DetailName，需同步設定
              const vendorOpt = this.service.vendorMap().get(venNo);
              updated.DetailName = vendorOpt?.['short'] ?? vendorOpt?.label
                ?? this.service.usrMap().get(venNo)?.label
                ?? selected.VEN_ShortName ?? selected.USR_Name ?? '';
            }
            if (selected.NoteDesc) updated.NoteDesc = selected.NoteDesc;
            // AccDC=C 科目：反向在借方（AccAmtD）→ 沖貸方餘額（CreditAmt）
            // AccDC=D 科目：反向在貸方（AccAmtC）→ 沖借方餘額（DebitAmt）
            if (effAmtField === 'AccAmtD') {
              updated.AccAmtD = selected.CreditAmt ?? selected.DebitAmt ?? undefined;
              updated.AccAmtC = undefined;
            } else {
              updated.AccAmtC = selected.DebitAmt ?? selected.CreditAmt ?? undefined;
              updated.AccAmtD = undefined;
            }
          }
          return updated;
        })
      );
    }
    this.showPtaDialog = false;
    this.currentEditingPtaRowIndex = null;
    this.currentEditingPtaAmtField = null;
    this.ptaDialogSelectedItem = null;
  }

  closePtaDialog(): void {
    this.showPtaDialog = false;
    this.ptaDialogSelectedItem = null;
  }

}
