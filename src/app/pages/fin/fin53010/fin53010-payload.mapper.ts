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
  const parts = s.split(/\s*\/\s*/);
  if (parts.length >= 2) {
    return { VEN_BankAccountNo: parts[0]?.trim(), VEN_AccountName: parts.slice(1).join(' / ').trim() };
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
    VEN_Uniform: ven?.['VEN_Uniform'] != null ? String(ven['VEN_Uniform']) : undefined,
    AccNo: row.acc_no,
    ACP_Amt: row.acp_amt,
    VEN_BNK_No: row.ven_bnk_no,
    VEN_BankAccountNo: bank.VEN_BankAccountNo,
    VEN_AccountName: bank.VEN_AccountName,
    ACP_ExpectPayDate: toYmd(row.acp_expect_pay_date ?? undefined, deps.datePipe),
    NoteDesc: row.note_desc,
    VEN_CTRLYN: row.ven_ctrlyn,
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
    VEN_Uniform: ven?.['VEN_Uniform'] != null ? String(ven['VEN_Uniform']) : undefined,
    AccNo: row.acc_no,
    NoteDesc: row.note_desc,
  };
}

function mapStepSalesToInsert4023(row: FIN53010StepSalesInvoiceRow): InsertAPS4023DataBody {
  const id = row.id;
  return { ID: typeof id === 'number' && !Number.isNaN(id) ? id : 0 };
}

function mapStepPurchaseToInsert2002(
  row: FIN53010StepPurchaseInvoiceRow,
  index: number,
  deps: Fin53010PayloadDepsWithVou,
): InsertAPS2002DataBody {
  const prefix = String(row.track_no ?? '').trim();
  const no = String(row.invoice_no ?? '').trim();
  const purGuino = prefix && no ? `${prefix}${no}` : undefined;
  const ven = deps.getVendorOption(row.vendor_tax_id);
  const voucherType = String(row.voucher_type ?? '').trim();
  const purComb = (voucherType === '26' || voucherType === '27') ? 'A' : undefined;
  return {
    PUR_GUINo: purGuino,
    PUR_VoucherType: row.voucher_type,
    ACP_Type: '7',
    PUR_GUIDate: toYmd(row.invoice_date ?? undefined, deps.datePipe),
    PUR_VenNo: row.vendor_tax_id,
    PUR_VenName: vendorDisplayName(ven),
    PUR_VenUniform: ven?.['VEN_Uniform'] != null ? String(ven['VEN_Uniform']) : row.vendor_tax_id,
    PUR_Net: row.net_amount,
    PUR_Tax: row.tax_amount,
    PUR_Amt: row.invoice_amount,
    PUR_Uniform: row.vendor_tax_id,
    PUR_TaxType: row.tax_type,
    PUR_DiscNo: row.deduction_code,
    PUR_RepYYYYMM: toYyyyMm(row.declare_ym ?? undefined, deps.datePipe),
    PUR_DirectType: row.invoice_usage,
    PUR_SeqNo: index + 1,
    PUR_Type: row.category_type,
    PUR_Comb_Cnt: row.total_count,
    PUR_Comb: purComb,
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
  };
}

function buildInsertNext(
  activeSteps: number[],
  stepAP: FIN53010StepAP[],
  stepAR: FIN53010StepAR[],
  stepSales: FIN53010StepSalesInvoiceRow[],
  stepPurchase: FIN53010StepPurchaseInvoiceRow[],
  stepBank: FIN53010StepBankDeposit[],
  deps: Fin53010PayloadDepsWithVou,
): InsertFIN53010DetailDataNextBody {
  return {
    insertAPS3001Datas:
      activeSteps.includes(3) && stepAP.length
        ? stepAP.map(r => mapStepApToInsert(r, deps))
        : [],
    insertARS3001Datas:
      activeSteps.includes(4) && stepAR.length
        ? stepAR.map(r => mapStepArToInsert(r, deps))
        : [],
    insertAPS4023Datas:
      activeSteps.includes(6) && stepSales.length
        ? stepSales.map(r => mapStepSalesToInsert4023(r))
        : [],
    insertAPS2002Datas:
      activeSteps.includes(5) && stepPurchase.length
        ? stepPurchase.map((r, i) => mapStepPurchaseToInsert2002(r, i, deps))
        : [],
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
    const accDc = AccAmtD ? 'D' : AccAmtC ? 'C' : '';
    const ser = typeof rest.SerNo === 'number' ? rest.SerNo : index + 1;
    const pta = rest.recKey != null ? String(rest.recKey) : undefined;
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
  deps: Fin53010PayloadMapperDeps;
}): InsertFIN53010Request {
  const { form, voucherTypePadded, tableData, activeVoucherSteps, deps } = params;
  const vouDate = form['VouDate'] instanceof Date ? form['VouDate'] : new Date();
  const vouDateIso = vouDate.toISOString();
  const mergedDeps: Fin53010PayloadDepsWithVou = { ...deps, vouDate };
  const details = buildInsertDetails(tableData, { resolveNoteDesc: params.deps.resolveNoteDesc });
  const insertNext = buildInsertNext(
    activeVoucherSteps,
    params.stepAPRows,
    params.stepARRows,
    params.stepSalesRows,
    params.stepPurchaseRows,
    params.stepBankRows,
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

function mapStepSalesToUpdate4023(row: FIN53010StepSalesInvoiceRow): UpdateAPS4023DataBody {
  const n = row.id;
  const id = typeof n === 'number' && !Number.isNaN(n) ? n : 0;
  return { ID: id };
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
  deps: Fin53010PayloadDepsWithVou,
): UpdateFIN53010DetailDataNextBody | null {
  const next: UpdateFIN53010DetailDataNextBody = {};
  if (activeSteps.includes(3) && stepAP.length) {
    const r = stepAP[0];
    next.updateAPS3001Datas = [mapStepApToUpdate(r, deps, r.id)];
  }
  if (activeSteps.includes(4) && stepAR.length) {
    const r = stepAR[0];
    next.updateARS3001Datas = [mapStepArToUpdate(r, deps, r.id)];
  }
  if (activeSteps.includes(6) && stepSales.length) {
    next.updateAPS4023Datas = stepSales.map(r => mapStepSalesToUpdate4023(r));
  }
  if (activeSteps.includes(5) && stepPurchase.length) {
    next.updateAPS2002Datas = stepPurchase.map((r, i) => mapStepPurchaseToUpdate2002(r, i, deps, r.id));
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
    const accDc = AccAmtD ? 'D' : AccAmtC ? 'C' : '';
    const ser = typeof rest.SerNo === 'number' ? rest.SerNo : index + 1;
    const pta = rest.recKey != null ? String(rest.recKey) : undefined;
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
  masterId: number;
  deps: Fin53010PayloadMapperDeps;
}): UpdateFIN53010Request {
  const { form, voucherTypePadded, tableData, activeVoucherSteps, masterId, deps } = params;
  const vouDate = form['VouDate'] instanceof Date ? form['VouDate'] : new Date();
  const vouDateIso = vouDate.toISOString();
  const mergedDeps: Fin53010PayloadDepsWithVou = { ...deps, vouDate };
  const details = buildUpdateDetails(tableData, { resolveNoteDesc: params.deps.resolveNoteDesc });
  const updateNext = buildUpdateNext(
    activeVoucherSteps,
    params.stepAPRows,
    params.stepARRows,
    params.stepSalesRows,
    params.stepPurchaseRows,
    params.stepBankRows,
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
