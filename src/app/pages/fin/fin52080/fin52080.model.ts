export interface FIN52080Data {
  ABAT_YN: 'Y' | 'N';
  AccCName: string;
  AccDC: AccDCType;
  AccEName: string;
  AccNo: string;
  Budget_YN: 'Y' | 'N';
  ClassNo: string;
  Input_YN: 'Y' | 'N';
  Ledger_MD: LedgerMDType;
  Org_YN: 'Y' | 'N';
  Voucher_Type: VoucherType;
}

export interface FIN52080Query {
  AccNo?: string;
  AccCName?: string;
  AccEName?: string;
  AccDC?: AccDCType;
  Ledger_MD?: LedgerMDType;
  ClassNo?: string;
  ABAT_YN?: 'Y' | 'N';
  Voucher_Type?: VoucherType;
  Budget_YN?: 'Y' | 'N';
  Org_YN?: 'Y' | 'N';
  Input_YN?: 'Y' | 'N';
}

export interface FIN52080ClassNo {
  ClassNo: string;
  ClassCName: string;
}

export interface FIN52080Tree {
  org_id: string;
  org10Label: string;
  org20Label: string;
  org30Label: string;
  org40Label: string;
  org_name: string;
}

export interface DeleteFIN52080Request {
  Ids: string[] | null;
}

/** D: 借 C: 貸 */
export type AccDCType = 'D' | 'C';
/** 0: 統制 1: 明細 */
export type LedgerMDType = '0' | '1';
/** 傳票格式 (Code Table, 未來還會增加)
 * - 0: 無特定
 * - 1: 應付票據
 * - 2: 應收票據
 * - 3: 應付帳款
 * - 4: 應收帳款
 * - 5: 進項稅額
 * - 6: 銷項稅額
 * - 7: 銀行存款
 * - 9: 應付費用
 * - A: 應收費用
 * - B: 代收稅款
 * - C: 固定資產
 * - D: 現金
 * - E: 應收保證票據
 */
export type VoucherType = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '9' | 'A' | 'B' | 'C' | 'D' | 'E';
