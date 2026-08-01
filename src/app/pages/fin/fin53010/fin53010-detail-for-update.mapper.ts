import type {
  APS2002,
  APS3001,
  APS4002,
  APS4023,
  ARS3001,
  FIN53010StepAP,
  FIN53010StepAR,
  FIN53010StepBankDeposit,
  FIN53010StepPurchaseInvoiceRow,
  FIN53010StepSalesInvoiceRow,
  Pos4023,
  QueryFIN53010DetailDataByVouNoForUpdateResponse,
} from './fin53010.model';

function parseYmdToDate(s: string | null | undefined): Date | null {
  if (s == null || String(s).trim() === '') return null;
  const d = new Date(String(s));
  return isNaN(d.getTime()) ? null : d;
}

/** DeclareYM / RepYYYYMM 等 yyyyMM */
function parseYyyyMmToMonthDate(s: string | null | undefined): Date | null {
  if (s == null || String(s).trim() === '') return null;
  const raw = String(s).replace(/\D/g, '');
  if (raw.length < 6) return null;
  const y = Number(raw.slice(0, 4));
  const m = Number(raw.slice(4, 6));
  if (!y || !m || m < 1 || m > 12) return null;
  return new Date(y, m - 1, 1);
}

function formatVenBankAccountFromApi(row: APS3001): string | undefined {
  const a = row.VEN_BankAccountNo;
  const b = row.VEN_AccountName;
  if (a != null && String(a).trim() !== '' && b != null && String(b).trim() !== '') {
    return `${String(a).trim()} / ${String(b).trim()}`;
  }
  const one = (a ?? b ?? '') as string;
  return String(one).trim() || undefined;
}

function mapVenCtrlynForStep(raw: string | null | undefined): string | undefined {
  if (raw == null || raw === '') return undefined;
  const u = String(raw).trim().toUpperCase();
  if (u === 'Y' || u === 'N') return u;
  return raw;
}

export function mapAps3001RowToStepAP(row: APS3001): FIN53010StepAP {
  const id = row.id;
  return {
    ...(typeof id === 'number' && !Number.isNaN(id) ? { id } : {}),
    org_id: row.org_id ?? '100000',
    ven_no: row.VEN_No ?? undefined,
    ven_pay_type: row.VEN_PayType ?? undefined,
    acp_amt: row.ACP_Amt ?? undefined,
    acp_expect_pay_date: parseYmdToDate(row.ACP_ExpectPayDate ?? undefined),
    acp_date: parseYmdToDate(row.ACP_Date ?? undefined),
    ven_bnk_no: row.VEN_BNK_No ?? undefined,
    ven_bank_account: formatVenBankAccountFromApi(row),
    ven_ctrlyn: mapVenCtrlynForStep(row.VEN_CTRLYN ?? undefined),
    ven_check_title: row.VEN_CheckTitle ?? undefined,
    acc_no: row.AccNo ?? undefined,
    note_desc: row.NoteDesc ?? undefined,
    PTA: row.PTA ?? null,
    ACP_No: row.ACP_No ?? null,
  };
}

export function mapArs3001RowToStepAR(row: ARS3001): FIN53010StepAR {
  const id = row.id;

  const org = row.ORG_ID;
  const ven = row.VEN_No;
  const amt = row.ARS_Amt;
  const pta = row.PTA_Date;
  const ars = row.ARS_Date;
  const acc = row.AccNo;
  const note = row.NoteDesc;
  return {
    ...(typeof id === 'number' && !Number.isNaN(id) ? { id } : {}),
    org_id: org || '100000',
    ven_no: ven || undefined,
    ars_amt: amt ?? undefined,
    pta_date: parseYmdToDate(pta),
    ars_date: parseYmdToDate(ars),
    acc_no: acc || undefined,
    note_desc: note || undefined,
    ACCT_KEY: row.ACCT_KEY ?? null,
    PTA: row.PTA ?? null,
    ARS_No: row.ARS_No ?? null,
  };
}

export function mapPos4023RowToStepSales(row: Pos4023): FIN53010StepSalesInvoiceRow {
  // 這些 31/32 是本傳票自己寫進 POS4023 的 → 帶 id、可編輯，存檔走 UPDATE POS4023 by id
  const idRaw = row.ID;
  const id = typeof idRaw === 'number' && !Number.isNaN(idRaw) ? idRaw : undefined;
  return {
    ...(id !== undefined ? { id } : {}),
    _invoiceValidated: true,
    invoice_type: row.INV_GUIType ?? undefined,
    invoice_prefix: row.INV_GUITrack ?? undefined,
    invoice_no: row.INV_GUINumber ?? undefined,
    invoice_date: parseYmdToDate(row.TXN_Date ?? undefined),
    declare_ym: parseYyyyMmToMonthDate(row.INV_DeclareYM ?? undefined),
    buyer_uniform: row.TXN_Uniform ?? undefined,
    inv_cancel: row.INV_Cancel ?? undefined,
    total_amount: row.INV_Cancel === 'Y' ? 0 : (row.TXN_SaleAmt ?? undefined),
    tax_type: row.PLU_TaxType ?? undefined,
    net_amount: row.INV_Cancel === 'Y' ? 0 : (row.TXN_Net ?? undefined),
    tax_amount: row.INV_Cancel === 'Y' ? 0 : (row.TXN_Tax ?? undefined),
  };
}

export function mapAps4023RowToStepSales(row: APS4023): FIN53010StepSalesInvoiceRow {
  const invNum = String(row.InvoiceNumber ?? '').trim();
  let prefix = '';
  let inv8 = invNum;
  if (invNum.length === 10) {
    prefix = invNum.slice(0, 2);
    inv8 = invNum.slice(2);
  }
  const idRaw = row.ID;
  const id = typeof idRaw === 'number' && !Number.isNaN(idRaw) ? idRaw : undefined;
  const invoiceType = String(row.InvoiceType ?? '').trim();
  const isAllowance = invoiceType === '33' || invoiceType === '34';
  const isVoid = row.Invoice_Cancel === 'Y';
  return {
    ...(id !== undefined ? { id } : {}),
    _invoiceValidated: true,
    invoice_type: row.InvoiceType ?? undefined,
    invoice_prefix: prefix || undefined,
    // allowance (33/34): store full 10-char number in invoice_no for display; mapper splits it back for API
    invoice_no: isAllowance ? invNum : (inv8.length === 8 ? inv8 : invNum),
    // 33/34：InvoiceDate = 退出/折讓日期(credit_date)；Orig_InvoiceDate（後端 self-join）= 原發票日期
    ...(isAllowance
      ? {
          credit_date: parseYmdToDate(row.InvoiceDate ?? undefined),
          ...(row.Orig_InvoiceDate != null ? { invoice_date: parseYmdToDate(row.Orig_InvoiceDate) } : {}),
        }
      : { invoice_date: parseYmdToDate(row.InvoiceDate ?? undefined) }
    ),
    declare_ym: parseYyyyMmToMonthDate(row.INV_DeclareYM ?? undefined),
    buyer_uniform: row.Buyer_Uniform ?? undefined,
    total_amount: isVoid ? 0 : (row.PUR_Amt ?? undefined),
    tax_type: row.PUR_TaxType ?? undefined,
    net_amount: isVoid ? 0 : (row.PUR_Net ?? undefined),
    tax_amount: isVoid ? 0 : (row.PUR_Tax ?? undefined),
    source_doc_no: row.Source_Doc_No ?? undefined,
    summary_count: undefined,
    asset_flag: row.AssetType ?? undefined,
    inv_cancel: row.Invoice_Cancel ?? undefined,
    ...(isAllowance ? { credit_type: row.Credit_Type ?? undefined } : {}),
  };
}

export function mapAps2002RowToStepPurchase(row: APS2002): FIN53010StepPurchaseInvoiceRow {
  const id = row.id;
  const guinoRaw = String(row.PUR_GUINo ?? '').trim();
  // '0000000000' 代表發票號碼未填，回填空白
  const guino = /^0+$/.test(guinoRaw) ? '' : guinoRaw;
  let trackNo = '';
  let invoiceNo = guino;
  if (guino.length >= 10) {
    trackNo = guino.slice(0, 2);
    invoiceNo = guino.slice(2);
  } else if (guino.length > 2) {
    trackNo = guino.slice(0, 2);
    invoiceNo = guino.slice(2);
  }
  const voucherType = String(row.PUR_VoucherType ?? '').trim();
  const isAllowance = voucherType === '23' || voucherType === '24';
  return {
    ...(typeof id === 'number' && !Number.isNaN(id) ? { id } : {}),
    voucher_type: row.PUR_VoucherType ?? undefined,
    track_no: isAllowance ? undefined : (trackNo || undefined),
    // 23/24 折讓：完整 10 碼存入 invoice_no（同銷項 33/34 做法），payload mapper 直接用整串
    invoice_no: isAllowance ? (guino || undefined) : (invoiceNo || undefined),
    // 23/24 的 PUR_GUIDate = 退出折讓日期（credit_date）；Orig_InvoiceDate（後端 self-join）= 原發票日期
    ...(isAllowance
      ? {
          credit_date: parseYmdToDate(row.PUR_GUIDate ?? undefined),
          ...(row.Orig_InvoiceDate != null ? { invoice_date: parseYmdToDate(row.Orig_InvoiceDate) } : {}),
        }
      : { invoice_date: parseYmdToDate(row.PUR_GUIDate ?? undefined) }
    ),
    declare_ym: parseYyyyMmToMonthDate(row.PUR_RepYYYYMM ?? undefined),
    vendor_tax_id: row.PUR_VenUniform ?? undefined,
    ven_no: row.PUR_VenNo ?? undefined,
    invoice_usage: row.PUR_DirectType ?? undefined,
    invoice_amount: row.PUR_Amt ?? undefined,
    tax_type: row.PUR_TaxType ?? undefined,
    net_amount: row.PUR_Net ?? undefined,
    tax_amount: row.PUR_Tax ?? undefined,
    deduction_code: row.PUR_DiscNo ?? undefined,
    category_type: row.PUR_Type ?? undefined,
    source_doc_no: row.Source_Doc_No ?? undefined,
    comb: row.PUR_Comb ?? undefined,
    total_count: row.PUR_Comb_Cnt ?? undefined,
    ...(isAllowance ? { credit_type: row.Credit_Type ?? undefined } : {}),
  };
}

export function mapAps4002RowToStepBank(row: APS4002): FIN53010StepBankDeposit {
  const id = row.id;
  return {
    ...(typeof id === 'number' && !Number.isNaN(id) ? { id } : {}),
    ven_no: row.VEN_No ?? undefined,
    bank_no: row.BNK_id ?? undefined,
    deposit_amt: row.DAmt ?? undefined,
    withdraw_amt: row.CAmt ?? undefined,
    status: row.Status ?? undefined,
    note_desc: row.Remark ?? undefined,
    txn_date: parseYmdToDate(row.Source_Date ?? undefined),
  };
}

export interface Fin53010ForUpdateStepMapped {
  stepAPRows: FIN53010StepAP[];
  stepARRows: FIN53010StepAR[];
  stepSalesRows: FIN53010StepSalesInvoiceRow[];
  stepSalesAllowanceRows: FIN53010StepSalesInvoiceRow[];
  stepPurchaseRows: FIN53010StepPurchaseInvoiceRow[];
  stepPurchaseAllowanceRows: FIN53010StepPurchaseInvoiceRow[];
  stepBankRows: FIN53010StepBankDeposit[];
}

const arr = <T,>(a: T[] | null | undefined): T[] => (Array.isArray(a) ? a : []);

/**
 * 將 queryFIN53010DetailData_ByVouNo_forupdate 的 Data 填入多步驟列。
 * APS2002 格式 21/22/25 → stepPurchaseRows；23/24 → stepPurchaseAllowanceRows。
 * APS4023 格式 31/32/35 → stepSalesRows；33/34 → stepSalesAllowanceRows。
 */
export function mapFin53010ForUpdateResponseToStepRows(
  data: QueryFIN53010DetailDataByVouNoForUpdateResponse | null | undefined,
): Fin53010ForUpdateStepMapped {
  if (!data) {
    return {
      stepAPRows: [],
      stepARRows: [],
      stepSalesRows: [],
      stepSalesAllowanceRows: [],
      stepPurchaseRows: [],
      stepPurchaseAllowanceRows: [],
      stepBankRows: [],
    };
  }

  const allPurchase = arr(data._APS2002s).map(mapAps2002RowToStepPurchase);
  const normalPurchase = allPurchase.filter(r => {
    const t = String(r.voucher_type ?? '').trim();
    return t !== '23' && t !== '24';
  });
  const allowancePurchase = allPurchase.filter(r => {
    const t = String(r.voucher_type ?? '').trim();
    return t === '23' || t === '24';
  });

  const allSalesFromApi = arr(data._APS4023s).map(mapAps4023RowToStepSales);
  const normalSales = allSalesFromApi.filter(r => {
    const t = String(r.invoice_type ?? '').trim();
    return t !== '33' && t !== '34';
  });
  const allowanceSales = allSalesFromApi.filter(r => {
    const t = String(r.invoice_type ?? '').trim();
    return t === '33' || t === '34';
  });

  // 排除已有對應 APS4023 的 POS4023，避免重複顯示（只保留 APS4023 沒有的發票）
  const aps4023InvoiceNums = new Set(
    arr(data._APS4023s).map(r => String(r.InvoiceNumber ?? '').trim()).filter(Boolean)
  );
  const pos4023Rows = arr(data._POS4023s)
    .filter(r => {
      const key = `${String(r.INV_GUITrack ?? '').trim()}${String(r.INV_GUINumber ?? '').trim()}`;
      return !aps4023InvoiceNums.has(key);
    })
    .map(mapPos4023RowToStepSales);

  return {
    stepAPRows: arr(data._APS3001s).map(mapAps3001RowToStepAP).map((r, i) => ({ ...r, SerNo: i + 1 })),
    stepARRows: arr(data._ARS3001s).map(mapArs3001RowToStepAR).map((r, i) => ({ ...r, SerNo: i + 1 })),
    stepSalesRows: [
      ...normalSales,
      ...pos4023Rows,
    ].map((r, i) => ({ ...r, SerNo: i + 1 })),
    stepSalesAllowanceRows: allowanceSales.map((r, i) => ({ ...r, SerNo: i + 1 })),
    stepPurchaseRows: normalPurchase.map((r, i) => ({ ...r, SerNo: i + 1 })),
    stepPurchaseAllowanceRows: allowancePurchase.map((r, i) => ({ ...r, SerNo: i + 1 })),
    stepBankRows: arr(data._APS4002s).map(mapAps4002RowToStepBank).map((r, i) => ({ ...r, SerNo: i + 1 })),
  };
}
