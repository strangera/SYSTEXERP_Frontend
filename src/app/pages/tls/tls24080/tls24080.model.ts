import { Column, formatAmount, formatDate } from "@shared/componentkit/table/table.model";

// 專櫃編號修正
export const TLTNoEditColumn: Column[] = [
  { field: 'TXN_Date', header: '銷售日期', format: formatDate },
  { field: 'ECR_No', header: '收銀機號' },
  { field: 'TXN_No', header: '交易序號' },
  { field: 'PRM_TLT_No', header: '原專櫃編號' },
  { field: 'PRM_TLT_Name', header: '原專櫃名稱' },
  { field: 'TLT_No', header: '修正後專櫃編號' },
  { field: 'TLT_Name', header: '修正後專櫃名稱' },
  { field: 'UPD_Date', header: '修正日期', format: formatDate },
  { field: 'UPD_USR_No', header: '修正者編號' },
  { field: 'UPD_USR_Name', header: '修正者名稱' },
];
// 折扣別修正
export const DiscCodeEditColumn: Column[] = [
  { field: 'TXN_Date', header: '銷售日期', format: formatDate },
  { field: 'ECR_No', header: '收銀機號' },
  { field: 'TXN_No', header: '交易序號' },
  { field: 'TLT_No', header: '專櫃編號' },
  { field: 'TLT_Name', header: '專櫃名稱' },
  { field: 'tlt_id', header: '商品抽成類別' },
  { field: 'TXN_Qty', header: '數量' },
  { field: 'TXN_SaleAmt', header: '金額', format: formatAmount },
  { field: 'PRM_DiscCode', header: '原折扣', format: formatAmount },
  { field: 'DiscCode', header: '修正折扣', format: formatAmount },
  { field: 'UPD_Date', header: '修正日期', format: formatDate },
  { field: 'UPD_USR_No', header: '修正者編號' },
  { field: 'UPD_USR_Name', header: '修正者名稱' },
];
// 抽成類別修正
export const TLTIdEditColumn: Column[] = [
  { field: 'TXN_Date', header: '銷售日期', format: formatDate },
  { field: 'ECR_No', header: '收銀機號' },
  { field: 'TXN_No', header: '交易序號' },
  { field: 'TLT_No', header: '專櫃編號' },
  { field: 'TLT_Name', header: '專櫃名稱' },
  { field: 'TXN_Qty', header: '數量' },
  { field: 'TXN_SaleAmt', header: '金額', format: formatAmount },
  { field: 'PRM_TLT_Id', header: '原商品抽成類別' },
  { field: 'tlt_id', header: '修正後商品抽成類別' },
  { field: 'TXN_DiscCode', header: '折扣別編號' },
  { field: 'TXN_DiscCodeName', header: '折扣別名稱' },
  { field: 'UPD_Date', header: '修正日期', format: formatDate },
  { field: 'UPD_USR_No', header: '修正者編號' },
  { field: 'UPD_USR_Name', header: '修正者名稱' },
];
// 付款別修正
export const PayNoEditColumn: Column[] = [
  { field: 'TXN_Date', header: '銷售日期', format: formatDate },
  { field: 'ECR_No', header: '收銀機號' },
  { field: 'TXN_No', header: '交易序號' },
  { field: 'TLT_No', header: '專櫃編號' },
  { field: 'TLT_Name', header: '專櫃名稱' },
  { field: 'PRM_PAY_No', header: '原付款別' },
  { field: 'PAY_No', header: '修正後付款別' },
  { field: 'TXN_PayAmt', header: '金額', format: formatAmount },
  { field: 'PRM_TERM_No', header: '原分期數' },
  { field: 'TERM_No', header: '修正後分期數' },
  { field: 'UPD_Date', header: '修正日期', format: formatDate },
  { field: 'UPD_USR_No', header: '修正者編號' },
  { field: 'UPD_USR_Name', header: '修正者名稱' },
];
// 預售交易修正
export const PreOrderEditColumn: Column[] = [
  { field: 'TXN_Date', header: '銷售日期', format: formatDate },
  { field: 'ECR_No', header: '收銀機號' },
  { field: 'TXN_No', header: '交易序號' },
  { field: 'TLT_No', header: '專櫃編號' },
  { field: 'TLT_Name', header: '專櫃名稱' },
  { field: 'PRM_TXN_PreOrder', header: '原預售交易' },
  { field: 'TXN_PreOrder', header: '修正後預售交易' },
  { field: 'PRM_POD_No', header: '原預售活動編號' },
  { field: 'POD_No', header: '修正後預售活動編號' },
  { field: 'UPD_Date', header: '修正日期', format: formatDate },
  { field: 'UPD_USR_No', header: '修正者編號' },
  { field: 'UPD_USR_Name', header: '修正者名稱' },
];
// 交易資料作廢
export const VoidEditColumn: Column[] = [
  { field: 'ORG_TXN_Date', header: '原銷售日期', format: formatDate },
  { field: 'ORG_ECR_No', header: '原收銀機號' },
  { field: 'ORG_TXN_No', header: '原交易序號' },
  { field: 'TLT_No', header: '專櫃編號' },
  { field: 'TLT_Name', header: '專櫃名稱' },
  { field: 'TXN_GUITrack', header: '字軌' },
  { field: 'TXN_GUIBegNo', header: '發票起始號碼' },
  { field: 'TXN_GUIEndNo', header: '發票結束號碼' },
  { field: 'TXN_TotGUI', header: '發票金額' },
  { field: 'Void_Date', header: '作廢日期', format: formatDate },
  { field: 'Void_USR_No', header: '作廢人員編號' },
  { field: 'Void_USR_Name', header: '作廢日期名稱' },
  { field: 'TXN_Status', header: '狀態' },
];
