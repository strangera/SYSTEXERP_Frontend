import { ReportColumn, ColumnGroup, formatAmount } from "@shared/components/table-report/table-report.model";
export interface TLS22020Data {
  ECR_No: string;
  tlt_no: string;
  tlt_name: string;
  TXN_Total: number;
  SLE_Total: number;
  Diff_Total: number;
  [key: string]: any; //動態付款別欄位
}

// 群組的付款別清單
export const payNoDataList = [
  { Pay_No: "10", Pay_Name: "現金" },
  { Pay_No: "07", Pay_Name: "會員折抵" },
  { Pay_No: "41", Pay_Name: "聯合信用卡" },
  { Pay_No: "43", Pay_Name: "中信信用卡" },
  { Pay_No: "22", Pay_Name: "外來提貨單-高夢/北阪" },
  { Pay_No: "23", Pay_Name: "外來禮券-高夢" },
  { Pay_No: "24", Pay_Name: "禮券餘代卡" },
  { Pay_No: "25", Pay_Name: "提貨單餘代卡" },
  { Pay_No: "26", Pay_Name: "品牌已開票券" },
  { Pay_No: "27", Pay_Name: "品牌未開票券" },
  { Pay_No: "30", Pay_Name: "貴賓提貨單(應收帳款)" },
  { Pay_No: "52", Pay_Name: "一卡通" },
  { Pay_No: "55", Pay_Name: "LINE Pay" },
  { Pay_No: "56", Pay_Name: "iPASS MONEY" },
  { Pay_No: "57", Pay_Name: "台灣Pay" },
  { Pay_No: "58", Pay_Name: "精誠錢包" },
  { Pay_No: "59", Pay_Name: "即享券" },
  { Pay_No: "60", Pay_Name: "喜客券" },
  { Pay_No: "79", Pay_Name: "APP提貨單" },
  { Pay_No: "77", Pay_Name: "感熱紙抵用券" },
  { Pay_No: "78", Pay_Name: "APP抵用券" },
  { Pay_No: "62", Pay_Name: "商品提貨單" },
  { Pay_No: "20", Pay_Name: "禮券" },
  { Pay_No: "71", Pay_Name: "商品抵用券" },
  { Pay_No: "72", Pay_Name: "外來提貨單(抵用券)" },
  { Pay_No: "73", Pay_Name: "外來禮券(抵用券)" },
  { Pay_No: "74", Pay_Name: "活動券(自營)" },
  { Pay_No: "75", Pay_Name: "折價券" },
  { Pay_No: "76", Pay_Name: "現抵" },
  { Pay_No: "81", Pay_Name: "中信-停車場" },
  { Pay_No: "82", Pay_Name: "一卡通-停車場" },
  { Pay_No: "83", Pay_Name: "LINE Pay-停車場" }
];


// 群組資訊（套用在表格）
export const creditCardGroup: ColumnGroup[] = payNoDataList.map(item => ({
  field: item.Pay_No,
  header: item.Pay_Name
}));

//固定前置欄位
const baseColumns: ReportColumn[] = [
  { header: '收銀機代號', field: 'ECR_No' },
  { header: '專櫃編號', field: 'tlt_no' },
  { header: '專櫃名稱', field: 'tlt_name' }
];

// 每個付款別的「三個子欄位」
const paymentColumns: ReportColumn[] = payNoDataList.flatMap((item) => [
  { header: '明細', field: `TXN_PayAmt_${item.Pay_No}`, groupField: item.Pay_No, isTotal: true, format: formatAmount, align: 'right' },
  { header: 'Z帳', field: `SLE_PayAmt_${item.Pay_No}`, groupField: item.Pay_No, isTotal: true, format: formatAmount, align: 'right' },
  { header: '差異', field: `Diff_PayAmt_${item.Pay_No}`, groupField: item.Pay_No, isTotal: true, format: formatAmount, align: 'right' },
]);

// 固定欄位
const tailColumns: ReportColumn[] = [
  { header: '明細總金額', field: 'Total_Txn_PayAmt', isTotal: true, format: formatAmount, align: 'right' },
  { header: '帳單總金額', field: 'Total_SLE_PayAmt', isTotal: true, format: formatAmount, align: 'right' },
  { header: '總差額', field: 'Total_Diff_PayAmt', isTotal: true, format: formatAmount, align: 'right' },

];

export const creditCardColumns: ReportColumn[] = [
  ...baseColumns,
  ...paymentColumns,
  ...tailColumns
];
