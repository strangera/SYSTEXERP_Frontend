import { DatePipe } from '@angular/common';
import type { Option } from '@service/utility/dropdown-api.model';
import type {
  FIN53010DetailTable,
  FIN53010StepAP,
  FIN53010StepAR,
  FIN53010StepBankDeposit,
  FIN53010StepPurchaseInvoiceRow,
  FIN53010StepSalesInvoiceRow,
  InsertAPS2002DataBody,
  InsertAPS3001DataBody,
  InsertAPS4002DataBody,
  InsertAPS4023DataBody,
  InsertARS3001DataBody,
  InsertFIN53010DetailBody,
  InsertFIN53010DetailDataNextBody,
  InsertFIN53010Request,
  UpdateAPS2002DataBody,
  UpdateAPS3001DataBody,
  UpdateAPS4002DataBody,
  UpdateAPS4023DataBody,
  UpdateARS3001DataBody,
  UpdateFIN53010DetailBody,
  UpdateFIN53010DetailDataNextBody,
  UpdateFIN53010Request,
} from './fin53010.model';

export interface Fin53010PayloadMapperDeps {
  datePipe: DatePipe;
  /** 解析摘要顯示值（送 API 用 label） */
  resolveNoteDesc: (note: unknown, row: FIN53010DetailTable) => string | undefined;
  getVendorOption: (venNo: string | undefined | null) => Option | undefined;
}

type Fin53010PayloadDepsWithVou = Fin53010PayloadMapperDeps & { vouDate: Date };

function toYmd(d: Date | string | null | undefined, datePipe: DatePipe): string | undefined {
  if (d == null) return undefined;
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return undefined;
  return datePipe.transform(dt, 'yyyy-MM-dd') ?? undefined;
}

function toYyyyMm(d: Date | string | null | undefined, datePipe: DatePipe): string | undefined {
  if (d == null) return undefined;
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return undefined;
  return datePipe.transform(dt, 'yyyyMM') ?? undefined;
}

function vouYyyyMm(vouDate: Date, datePipe: DatePipe): string | undefined {
  return toYyyyMm(vouDate, datePipe);
}

function vendorDisplayName(ven: Option | undefined): string | undefined {
  if (!ven?.label) return undefined;
  const label = String(ven.label);
  const idx = label.indexOf(' - ');
  if (idx === -1) return label.trim() || undefined;
  return label.slice(idx + 3).trim() || undefined;
}

function splitVenBankAccount(venBankAccount: string | undefined): {
  VEN_BankAccountNo?: string;
  VEN_AccountName?: string;
} {
  const s = typeof venBankAccount === 'string' ? venBankAccount.trim() : '';
  if (!s) return {};

  // 1. 直接用字串的 '/' 進行分割，無任何回溯風險
  const parts = s.split('/');

  if (parts.length >= 2) {
    // 2. 第一部分就是帳號，順便清除空格
    const bankAccountNo = parts[0].trim();

    // 3. 剩餘的部分重新用 '/' 組合回去（保留內含的單一斜線），並清除空格
    const accountName = parts.slice(1).join('/').trim();

    return {
      VEN_BankAccountNo: bankAccountNo || undefined,
      VEN_AccountName: accountName || undefined
    };
  }

  return { VEN_BankAccountNo: s };
}

function mapStepApToInsert(
  row: FIN53010StepAP,
  deps: Fin53010PayloadDepsWithVou,
): InsertAPS3001DataBody {
  const ven = deps.getVendorOption(row.ven_no);
  const bank = splitVenBankAccount(row.ven_bank_account);
  return {
    org_id: row.org_id,
    ACP_YYYYMM: vouYyyyMm(deps.vouDate, deps.datePipe),
    ACP_Date: toYmd(row.acp_date ?? undefined, deps.datePipe),
    VEN_No: row.ven_no,
    VEN_Name: vendorDisplayName(ven),
    VEN_Uniform: ven?.['VEN_Uniform'] == null ? undefined : String(ven['VEN_Uniform']),
    AccNo: row.acc_no,
    ACP_Amt: row.acp_amt,
    VEN_PayType: row.ven_pay_type,
    VEN_BNK_No: row.ven_bnk_no,
    VEN_BNK_BranchNo: row.ven_bnk_branch_no,
    VEN_BankAccountNo: bank.VEN_BankAccountNo,
    VEN_AccountName: bank.VEN_AccountName,
    ACP_ExpectPayDate: toYmd(row.acp_expect_pay_date ?? undefined, deps.datePipe),
    NoteDesc: row.note_desc,
    VEN_CTRLYN: row.ven_ctrlyn,
    PTA: row.PTA ?? null,
  };
}

function mapStepArToInsert(row: FIN53010StepAR, deps: Fin53010PayloadDepsWithVou): InsertARS3001DataBody {
  const ven = deps.getVendorOption(row.ven_no);
  return {
    ORG_ID: row.org_id,
    ARS_Amt: row.ars_amt,
    PTA_Date: toYmd(row.pta_date ?? undefined, deps.datePipe),
    ARS_Date: toYmd(row.ars_date ?? undefined, deps.datePipe),
    VEN_No: row.ven_no,
    VEN_Name: vendorDisplayName(ven),
    VEN_Uniform: ven?.['VEN_Uniform'] == null ? undefined : String(ven['VEN_Uniform']),
    AccNo: row.acc_no,
    NoteDesc: row.note_desc,
    ACCT_KEY: row.ACCT_KEY ?? undefined,
    PTA: row.PTA ?? null,
  };
}

function mapStepSalesToInsert4023(row: FIN53010StepSalesInvoiceRow, deps: Fin53010PayloadDepsWithVou): InsertAPS4023DataBody {
  const id = row.id;
  const invoiceType = String(row.invoice_type ?? '').trim();
  const isAllowance = invoiceType === '33' || invoiceType === '34';
  // allowance rows store full 10-char number in invoice_no; split for API
  const invNoFull = String(row.invoice_no ?? '').trim();
  const invPrefix = row.invoice_prefix ?? (invNoFull.length === 10 ? invNoFull.slice(0, 2) : null);
  const invNo = invNoFull.length === 10 ? invNoFull.slice(2) : (invNoFull || null);
  return {
    ID: typeof id === 'number' && !Number.isNaN(id) ? id : 0,
    InvoiceType: row.invoice_type ?? null,
    InvoicePrefix: invPrefix,
    InvoiceNo: invNo,
    // 33/34：InvoiceDate = 退出/折讓日期；31/32：InvoiceDate = 原發票日期
    InvoiceDate: isAllowance
      ? (toYmd(row.credit_date ?? undefined, deps.datePipe) ?? null)
      : (toYmd(row.invoice_date ?? undefined, deps.datePipe) ?? null),
    INV_DeclareYM: toYyyyMm(row.declare_ym ?? undefined, deps.datePipe) ?? null,
    Buyer_Uniform: row.buyer_uniform ?? null,
    // 折讓(33/34)：PUR_Amt = 畫面算好的折讓總額(allowance_amount)，不是原發票總額；一般發票才用 total_amount
    PUR_Amt: isAllowance ? (row.allowance_amount ?? ((row.net_amount ?? 0) + (row.tax_amount ?? 0))) : (row.total_amount ?? null),
    PUR_TaxType: row.tax_type ?? null,
    PUR_Net: row.net_amount ?? null,
    PUR_Tax: row.tax_amount ?? null,
    Source_Doc_No: row.source_doc_no ?? null,
    AssetType: row.asset_flag ?? null,
    Credit_Type: isAllowance ? (row.credit_type ?? null) : undefined,
  };
}

function mapStepPurchaseToInsert2002(
  row: FIN53010StepPurchaseInvoiceRow,
  index: number,
  deps: Fin53010PayloadDepsWithVou,
): InsertAPS2002DataBody {
  const prefix = String(row.track_no ?? '').trim();
  const no = String(row.invoice_no ?? '').trim();
  // 某些發票格式發票號碼可不填；未填時送空字串給後端
  const purGuino = no ? `${prefix}${no}` : '';
  const ven = deps.getVendorOption(row.ven_no);
  const voucherType = String(row.voucher_type ?? '').trim();
  const invoiceNoStr = no;
  const isSummaryInvoice = (voucherType === '22' || voucherType === '25')
    && (invoiceNoStr === '' || invoiceNoStr === '0000000000');
  const purComb = isSummaryInvoice ? 'A' : undefined;
  const purVenUniform = row.vendor_tax_id ? String(row.vendor_tax_id).slice(0, 8) : undefined;
  const isAllowance = voucherType === '23' || voucherType === '24';
  return {
    id: row.id ?? 0, // picker 選定既有發票(含彙開)帶回 id，後端用它綁定；0=新增/依號碼比對
    PUR_GUINo: purGuino,
    PUR_VoucherType: row.voucher_type,
    ACP_Type: '7',
    PUR_GUIDate: isAllowance
      ? toYmd(row.credit_date ?? undefined, deps.datePipe)  // 23/24：credit_date = 退出/折讓日期
      : toYmd(row.invoice_date ?? undefined, deps.datePipe),
    PUR_VenNo: row.ven_no,
    PUR_VenName: vendorDisplayName(ven),
    PUR_VenUniform: purVenUniform,
    PUR_Net: row.net_amount,
    PUR_Tax: row.tax_amount,
    // 折讓(23/24)：PUR_Amt = 畫面算好的折讓總額(allowance_amount)，不是原發票總額；一般發票才用 invoice_amount
    PUR_Amt: isAllowance ? (row.allowance_amount ?? ((row.net_amount ?? 0) + (row.tax_amount ?? 0))) : row.invoice_amount,
    // PUR_Uniform: row.vendor_tax_id,
    PUR_TaxType: row.tax_type,
    PUR_DiscNo: row.deduction_code,
    PUR_RepYYYYMM: toYyyyMm(row.declare_ym ?? undefined, deps.datePipe),
    PUR_DirectType: row.invoice_usage,
    PUR_SeqNo: index + 1,
    PUR_Type: row.category_type,
    PUR_Comb_Cnt: row.total_count,
    PUR_Comb: purComb,
    Source_Doc_No: row.source_doc_no ?? null,
    Credit_Type: isAllowance ? (row.credit_type ?? null) : undefined,
  };
}

function mapStepBankToInsert4002(row: FIN53010StepBankDeposit, deps: Fin53010PayloadDepsWithVou): InsertAPS4002DataBody {
  return {
    BNK_id: row.bank_no,
    DAmt: row.deposit_amt,
    CAmt: row.withdraw_amt,
    VEN_No: row.ven_no,
    Remark: row.note_desc,
    Source_Date: toYmd(row.txn_date ?? undefined, deps.datePipe),
    Status: row.status,
    Source_SerNo: row._detailSerNo ?? null,
  };
}

function buildInsertNext(
  activeSteps: number[],
  stepAP: FIN53010StepAP[],
  stepAR: FIN53010StepAR[],
  stepSales: FIN53010StepSalesInvoiceRow[],
  stepPurchase: FIN53010StepPurchaseInvoiceRow[],
  stepBank: FIN53010StepBankDeposit[],
  stepPurchaseAllowance: FIN53010StepPurchaseInvoiceRow[],
  stepSalesAllowance: FIN53010StepSalesInvoiceRow[],
  deps: Fin53010PayloadDepsWithVou,
): InsertFIN53010DetailDataNextBody {
  const normalSalesRows = activeSteps.includes(6) && stepSales.length
    ? stepSales.filter(r => !r.isPOS4023).map(r => mapStepSalesToInsert4023(r, deps))
    : [];
  // 依發票格式分表：31/32 → POS4023；35 → APS4023
  const normalSalesPos = normalSalesRows.filter(r => r.InvoiceType === '31' || r.InvoiceType === '32');
  const normalSalesAps = normalSalesRows.filter(r => r.InvoiceType !== '31' && r.InvoiceType !== '32');
  const allowanceSalesRows = activeSteps.includes(9) && stepSalesAllowance.length
    ? stepSalesAllowance.map(r => mapStepSalesToInsert4023(r, deps))
    : [];
  const normalPurchaseRows = activeSteps.includes(5) && stepPurchase.length
    ? stepPurchase.map((r, i) => mapStepPurchaseToInsert2002(r, i, deps))
    : [];
  const allowancePurchaseRows = activeSteps.includes(8) && stepPurchaseAllowance.length
    ? stepPurchaseAllowance.map((r, i) => mapStepPurchaseToInsert2002(r, normalPurchaseRows.length + i, deps))
    : [];
  return {
    insertAPS3001Datas:
      activeSteps.includes(3) && stepAP.length
        ? stepAP.map(r => mapStepApToInsert(r, deps))
        : [],
    insertARS3001Datas:
      activeSteps.includes(4) && stepAR.length
        ? stepAR.map(r => mapStepArToInsert(r, deps))
        : [],
    insertAPS4023Datas: [...normalSalesAps, ...allowanceSalesRows],
    insertPOS4023Datas: normalSalesPos,
    insertAPS2002Datas: [...normalPurchaseRows, ...allowancePurchaseRows],
    insertAPS4002Datas:
      activeSteps.includes(7) && stepBank.length
        ? stepBank.map(r => mapStepBankToInsert4002(r, deps))
        : [],
  };
}

function buildInsertDetails(
  rows: FIN53010DetailTable[],
  deps: { resolveNoteDesc: Fin53010PayloadMapperDeps['resolveNoteDesc']; },
): InsertFIN53010DetailBody[] {
  return rows.map((rest, index) => {
    const AccAmtD = rest.AccAmtD;
    const AccAmtC = rest.AccAmtC;
    const noteResolved = deps.resolveNoteDesc(rest.NoteDesc, rest);
    const accAmt = (AccAmtD ?? 0) + (AccAmtC ?? 0);
    const accDc = AccAmtD != null ? 'D' : AccAmtC != null ? 'C' : '';
    const ser = typeof rest.SerNo === 'number' ? rest.SerNo : index + 1;
    const pta = rest.PTA != null ? String(rest.PTA) : undefined;
    const body: InsertFIN53010DetailBody = {
      index,
      SerNo: ser,
      AccDC: accDc,
      AccNo: rest.AccNo,
      AccAmt: accAmt,
      ORG_ID: rest.ORG_ID || '100000',
      DetailNo: rest.DetailNo,
      SubDetailNo: rest.SubDetailNo ?? rest.ReflNo,
      ProjectNo: undefined,
      NoteDesc: noteResolved,
      PTA: pta,
      ACCT_KEY: rest.recKey != null ? String(rest.recKey) : undefined,
    };
    return body;
  });
}

/** 新增：組 Swagger InsertFIN53010Request */
export function buildInsertFin53010Request(params: {
  form: Record<string, unknown>;
  voucherTypePadded: string;
  tableData: FIN53010DetailTable[];
  activeVoucherSteps: number[];
  stepAPRows: FIN53010StepAP[];
  stepARRows: FIN53010StepAR[];
  stepSalesRows: FIN53010StepSalesInvoiceRow[];
  stepPurchaseRows: FIN53010StepPurchaseInvoiceRow[];
  stepBankRows: FIN53010StepBankDeposit[];
  stepPurchaseAllowanceRows: FIN53010StepPurchaseInvoiceRow[];
  stepSalesAllowanceRows: FIN53010StepSalesInvoiceRow[];
  deps: Fin53010PayloadMapperDeps;
}): InsertFIN53010Request {
  const { form, voucherTypePadded, tableData, activeVoucherSteps, deps } = params;
  const vouDate = form['VouDate'] instanceof Date ? form['VouDate'] : new Date();
  const vouDateIso = toYmd(vouDate, deps.datePipe) ?? vouDate.toISOString();
  const mergedDeps: Fin53010PayloadDepsWithVou = { ...deps, vouDate };
  const details = buildInsertDetails(tableData, { resolveNoteDesc: params.deps.resolveNoteDesc });
  const insertNext = buildInsertNext(
    activeVoucherSteps,
    params.stepAPRows,
    params.stepARRows,
    params.stepSalesRows,
    params.stepPurchaseRows,
    params.stepBankRows,
    params.stepPurchaseAllowanceRows,
    params.stepSalesAllowanceRows,
    mergedDeps,
  );
  const req: InsertFIN53010Request = {
    VouType: form['VouType'] as string | undefined,
    VouDate: vouDateIso,
    PostFlag: form['PostFlag'] as string | undefined,
    VoucherType: voucherTypePadded,
    INV_YN: form['INV_YN'] as string | undefined,
    Remark: form['Remark'] as string | undefined,
    VouAccType: form['VouAccType'] as string | undefined,
    Details: details,
    insertFIN53010DetailData_Next: insertNext,
  };
  return req;
}

function mapStepApToUpdate(row: FIN53010StepAP, deps: Fin53010PayloadDepsWithVou, id?: number): UpdateAPS3001DataBody {
  return { ...mapStepApToInsert(row, deps), id };
}

function mapStepArToUpdate(row: FIN53010StepAR, deps: Fin53010PayloadDepsWithVou, id?: number): UpdateARS3001DataBody {
  return { ...mapStepArToInsert(row, deps), id };
}

function mapStepSalesToUpdate4023(row: FIN53010StepSalesInvoiceRow, deps: Fin53010PayloadDepsWithVou): UpdateAPS4023DataBody {
  return mapStepSalesToInsert4023(row, deps);
}

function mapStepPurchaseToUpdate2002(
  row: FIN53010StepPurchaseInvoiceRow,
  index: number,
  deps: Fin53010PayloadDepsWithVou,
  id?: number,
): UpdateAPS2002DataBody {
  return { ...mapStepPurchaseToInsert2002(row, index, deps), id };
}

function mapStepBankToUpdate4002(row: FIN53010StepBankDeposit, deps: Fin53010PayloadDepsWithVou, id?: number): UpdateAPS4002DataBody {
  return { ...mapStepBankToInsert4002(row, deps), id };
}

function buildUpdateNext(
  activeSteps: number[],
  stepAP: FIN53010StepAP[],
  stepAR: FIN53010StepAR[],
  stepSales: FIN53010StepSalesInvoiceRow[],
  stepPurchase: FIN53010StepPurchaseInvoiceRow[],
  stepBank: FIN53010StepBankDeposit[],
  stepPurchaseAllowance: FIN53010StepPurchaseInvoiceRow[],
  stepSalesAllowance: FIN53010StepSalesInvoiceRow[],
  deps: Fin53010PayloadDepsWithVou,
): UpdateFIN53010DetailDataNextBody | null {
  /** 後端契約：updateAPS3001Datas／updateARS3001Datas 為陣列；無 id 或省略 id 視為子檔新增（依 API 實作為準）。 */
  const next: UpdateFIN53010DetailDataNextBody = {};
  if (activeSteps.includes(3) && stepAP.length) {
    next.updateAPS3001Datas = stepAP.map(r => mapStepApToUpdate(r, deps, r.id));
  }
  if (activeSteps.includes(4) && stepAR.length) {
    next.updateARS3001Datas = stepAR.map(r => mapStepArToUpdate(r, deps, r.id));
  }
  const normalSalesRows = activeSteps.includes(6)
    ? stepSales.filter(r => !r.isPOS4023).map(r => mapStepSalesToUpdate4023(r, deps))
    : [];
  // 依發票格式分表：31/32 → POS4023；35 → APS4023
  const normalSalesPos = normalSalesRows.filter(r => r.InvoiceType === '31' || r.InvoiceType === '32');
  const normalSalesAps = normalSalesRows.filter(r => r.InvoiceType !== '31' && r.InvoiceType !== '32');
  const allowanceSalesRows = activeSteps.includes(9)
    ? stepSalesAllowance.map(r => mapStepSalesToUpdate4023(r, deps))
    : [];
  const mergedSales = [...normalSalesAps, ...allowanceSalesRows];
  if (mergedSales.length) {
    next.updateAPS4023Datas = mergedSales;
  }
  if (normalSalesPos.length) {
    next.updatePOS4023Datas = normalSalesPos;
  }
  const normalPurchaseRows = activeSteps.includes(5)
    ? stepPurchase.map((r, i) => mapStepPurchaseToUpdate2002(r, i, deps, r.id))
    : [];
  const allowancePurchaseRows = activeSteps.includes(8)
    ? stepPurchaseAllowance.map((r, i) => mapStepPurchaseToUpdate2002(r, normalPurchaseRows.length + i, deps, r.id))
    : [];
  const mergedPurchase = [...normalPurchaseRows, ...allowancePurchaseRows];
  if (mergedPurchase.length) {
    next.updateAPS2002Datas = mergedPurchase;
  }
  if (activeSteps.includes(7) && stepBank.length) {
    next.updateAPS4002Datas = stepBank.map(r => mapStepBankToUpdate4002(r, deps, r.id));
  }
  if (
    !(next.updateAPS3001Datas?.length)
    && !(next.updateARS3001Datas?.length)
    && !(next.updateAPS4023Datas?.length)
    && !(next.updateAPS2002Datas?.length)
    && !(next.updateAPS4002Datas?.length)
  ) {
    return null;
  }
  return next;
}

function buildUpdateDetails(
  rows: FIN53010DetailTable[],
  deps: { resolveNoteDesc: Fin53010PayloadMapperDeps['resolveNoteDesc']; },
): UpdateFIN53010DetailBody[] {
  return rows.map((rest, index) => {
    const AccAmtD = rest.AccAmtD;
    const AccAmtC = rest.AccAmtC;
    const noteResolved = deps.resolveNoteDesc(rest.NoteDesc, rest);
    const accAmt = (AccAmtD ?? 0) + (AccAmtC ?? 0);
    const accDc = AccAmtD != null ? 'D' : AccAmtC != null ? 'C' : '';
    const ser = typeof rest.SerNo === 'number' ? rest.SerNo : index + 1;
    const pta = rest.PTA == null ? undefined : String(rest.PTA);
    const id = typeof rest.id === 'number' ? rest.id : undefined;
    const body: UpdateFIN53010DetailBody = {
      id,
      index,
      SerNo: ser,
      AccDC: accDc,
      AccNo: rest.AccNo,
      AccAmt: accAmt,
      ORG_ID: rest.ORG_ID || '100000',
      DetailNo: rest.DetailNo,
      SubDetailNo: rest.SubDetailNo ?? rest.ReflNo,
      ProjectNo: undefined,
      NoteDesc: noteResolved,
      PTA: pta,
      ACCT_KEY: rest.recKey != null ? String(rest.recKey) : undefined,
    };
    return body;
  });
}

/** 更新：組 Swagger UpdateFIN53010Request */
export function buildUpdateFin53010Request(params: {
  form: Record<string, unknown>;
  voucherTypePadded: string;
  tableData: FIN53010DetailTable[];
  activeVoucherSteps: number[];
  stepAPRows: FIN53010StepAP[];
  stepARRows: FIN53010StepAR[];
  stepSalesRows: FIN53010StepSalesInvoiceRow[];
  stepPurchaseRows: FIN53010StepPurchaseInvoiceRow[];
  stepBankRows: FIN53010StepBankDeposit[];
  stepPurchaseAllowanceRows: FIN53010StepPurchaseInvoiceRow[];
  stepSalesAllowanceRows: FIN53010StepSalesInvoiceRow[];
  masterId: number;
  deps: Fin53010PayloadMapperDeps;
}): UpdateFIN53010Request {
  const { form, voucherTypePadded, tableData, activeVoucherSteps, masterId, deps } = params;
  const vouDate = form['VouDate'] instanceof Date ? form['VouDate'] : new Date();
  const vouDateIso = toYmd(vouDate, deps.datePipe) ?? vouDate.toISOString();
  const mergedDeps: Fin53010PayloadDepsWithVou = { ...deps, vouDate };
  const details = buildUpdateDetails(tableData, { resolveNoteDesc: params.deps.resolveNoteDesc });
  const updateNext = buildUpdateNext(
    activeVoucherSteps,
    params.stepAPRows,
    params.stepARRows,
    params.stepSalesRows,
    params.stepPurchaseRows,
    params.stepBankRows,
    params.stepPurchaseAllowanceRows,
    params.stepSalesAllowanceRows,
    mergedDeps,
  );
  return {
    id: masterId,
    CompNo: form['CompNo'] as string | undefined,
    VouNo: form['VouNo'] as string | undefined,
    VouType: form['VouType'] as string | undefined,
    VouDate: vouDateIso,
    PostFlag: form['PostFlag'] as string | undefined,
    VoucherType: voucherTypePadded,
    INV_YN: form['INV_YN'] as string | undefined,
    Remark: form['Remark'] as string | undefined,
    VouAccType: form['VouAccType'] as string | undefined,
    Details: details,
    updateFIN53010DetailData_Next: updateNext ?? undefined,
  };
}
