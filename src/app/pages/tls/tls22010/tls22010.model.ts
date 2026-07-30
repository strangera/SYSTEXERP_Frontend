import { formatAmount, ReportColumn } from "@shared/components/table-report/table-report.model";
import { SortMeta } from "primeng/api";

/**
 * 主查詢 (queryTLS22010) 的列表資料介面
 */
export interface ITxnData {
  TXN_DATE: string;
  ECR_No: string;
  building_no: string;
  AREA_NO: string;
  FLOOR_NO: string;
  FLOOR_Name: string; // <--- 新增欄位 (來自 Swagger)
  TXN_TotSaleAmt: number;
  sad_preorder_Amt: number;
  sad_settle_Amt: number;
  TXN_TotSaleAmt_Sum: number;
  TXN_TotExtraAmt: number;
  TXN_TotHaveTax: number;
  TXN_ChangeHaveTax: number;
  TXN_TotOver: number;
  TXN_TotGUI: number;
  GUI_NET: number;
  TXN_TotTax: number;
  TXN_TotGUISaleNoTax: number;
  TXN_TotOver_Sum: number;
  GUI_REFUND: number;
  TXN_TotPayAmt: number;
  SLE_SaleAmt: number;
  TXN_Mode_P: number;
  Status_Code: string;
  IsCompany?: boolean;
}

/**
 * 主查詢 (queryTLS22010) 的彙總/合計資料介面
 */
export interface ITxnDataSum {
  TXN_TotSaleAmt: number;
  sad_preorder_Amt: number;
  sad_settle_Amt: number;
  TXN_TotSaleAmt_Sum: number;
  TXN_TotExtraAmt: number;
  TXN_TotHaveTax: number;
  TXN_ChangeHaveTax: number;
  TXN_TotOver: number;
  TXN_TotGUI: number;
  GUI_NET: number;
  TXN_TotTax: number;
  TXN_TotGUISaleNoTax: number;
  TXN_TotOver_Sum: number;
  GUI_REFUND: number;
  TXN_TotPayAmt: number;
  SLE_SaleAmt: number;
  TXN_Mode_P: number;
}

/**
 * 主查詢 (queryTLS22010) 的 API 請求參數介面
 */
export interface TLS22010Query {
  PageSize: number;
  PageIndex: number;
  OrderBy?: string; // <--- 新增欄位 (來自 Swagger)
  Offset?: number; // <--- 新增欄位 (來自 Swagger)
  SortBy?: SortMeta[];
  TXN_Date: string | null;
  floor_noList?: string[] | null;
  ECR_NoList?: string[] | null;
  ShowStatus?: string;
  // status1/status2 已移除 (未在 Swagger 請求中出現)
}

/**
 * 細項查詢 (queryTLS22010_Detail) 的 API 請求參數介面
 */
export interface TLS22010DetailQuery {
  PageSize: number;
  PageIndex: number;
  SortBy?: SortMeta[];
  TXN_Date: string; // 注意：Swagger 文件中這些欄位是 string
  ECR_No: string;
  floor_no: string; // 注意：Swagger 文件中使用 floor_no
}

/**
 * 細項查詢 (queryTLS22010_Detail) 的列表資料介面
 */
export interface ITxnDataDetail {
  TXN_No: string;
  TXN_GUIBegNo: string;
  TXN_GUIEndNo: string;
  TXN_TotSaleAmt: number;
  sad_preorder_Amt: number;
  sad_settle_Amt: number;
  TXN_TotSaleAmt_Sum: number;
  TXN_TotExtraAmt: number;
  TXN_TotHaveTax: number;
  TXN_ChangeHaveTax: number;
  TXN_TotOver: number;
  TXN_TotGUI: number;
  GUI_NET: number;
  TXN_TotTax: number;
  TXN_TotGUISaleNoTax: number;
  TXN_TotOver_Sum: number;
  GUI_REFUND: number;
  TXN_TotPayAmt: number;
}

/**
 * 細項查詢 (queryTLS22010_Detail) 的彙總/合計資料介面
 */
export interface ITxnDataDetailSum {
  TXN_TotSaleAmt: number;
  sad_preorder_Amt: number;
  sad_settle_Amt: number;
  TXN_TotSaleAmt_Sum: number;
  TXN_TotExtraAmt: number;
  TXN_TotHaveTax: number;
  TXN_ChangeHaveTax: number;
  TXN_TotOver: number;
  TXN_TotGUI: number;
  GUI_NET: number;
  TXN_TotTax: number;
  TXN_TotGUISaleNoTax: number;
  TXN_TotOver_Sum: number;
  GUI_REFUND: number;
  TXN_TotPayAmt: number;
}


// --- 現有函式和常數 (保持不變) ---

/**
 * formatTxnNo: 將輸入值補零至六位數。
 * 無論輸入是數字或字串，都會在左側用 '0' 補足至六位。
 * 例如: 164 -> "000164"
 * 例如: 1234567 -> "1234567" (超過六位則保持不變)
 * @param val 交易序號
 * @returns 補零後的字串
 */
const formatTxnNo = (val: number | string | null | undefined): string => {
  // 檢查 val 是否為 null 或 undefined，若是則回傳空字串
  if (val === null || val === undefined) {
    return '';
  }

  const str = String(val);
  // 使用 padStart(6, '0') 確保最小長度為 6，並用 '0' 填充
  return str.padStart(6, '0');
};

export const columns: ReportColumn[] = [
  { field: 'ECR_No_Display', header: '收銀機號', visible: true, type: 'html', sortField: 'ECR_No', width: '100px' },
  { field: 'AREA_NO', header: '區域', visible: true },
  { field: 'FLOOR_Name', header: '樓層', visible: true }, // <--- 欄位定義不變，但 ITxnData 已經更新
  { field: 'TXN_TotSaleAmt', header: '銷售金額 (A)', visible: true, format: formatAmount, isTotal: true, align: 'right' },
  { field: 'sad_preorder_Amt', header: '預購金額', visible: true, format: formatAmount, isTotal: true, align: 'right' },
  { field: 'sad_settle_Amt', header: '預購結帳 (C2)', visible: true, format: formatAmount, isTotal: true, align: 'right' },
  { field: 'TXN_TotSaleAmt_Sum', header: '銷售小計(D) = (A)', visible: true, format: formatAmount, isTotal: true, align: 'right' },
  { field: 'TXN_TotExtraAmt', header: '代收/付金額 (L)', visible: true, format: formatAmount, isTotal: true, align: 'right' },
  { field: 'TXN_TotHaveTax', header: '已開發票金額 (E)', visible: true, format: formatAmount, isTotal: true, align: 'right' },
  { field: 'TXN_ChangeHaveTax', header: '已開找零 (K)', visible: true, format: formatAmount, isTotal: true, align: 'right' },
  { field: 'TXN_TotOver', header: '已開溢付 (I)', visible: true, format: formatAmount, isTotal: true, align: 'right' },
  { field: 'TXN_TotGUI', header: '發票總金額 (F)', visible: true, format: formatAmount, isTotal: true, align: 'right' },
  { field: 'GUI_NET', header: '發票未稅金額 (M)', visible: true, format: formatAmount, isTotal: true, align: 'right' },
  { field: 'TXN_TotTax', header: '發票稅額 (N)', visible: true, format: formatAmount, isTotal: true, align: 'right' },
  { field: 'TXN_TotGUISaleNoTax', header: '發票免稅金額 (O)', visible: true, format: formatAmount, isTotal: true, align: 'right' },
  { field: 'TXN_TotOver_Sum', header: '溢收 (G)', visible: true, format: formatAmount, isTotal: true, align: 'right' },
  { field: 'GUI_REFUND', header: '折讓 (J)', visible: true, format: formatAmount, isTotal: true, align: 'right' },
  { field: 'TXN_TotPayAmt', header: '付款金額(H)=(D)+(G)-(C2)-(K)', visible: true, format: formatAmount, isTotal: true, cellClass: (row) => getStatusColor(row), align: 'right' },
  { field: 'SLE_SaleAmt', header: 'Z 報表總金額', visible: true, format: formatAmount, isTotal: true, cellClass: (row) => getStatusColor(row), align: 'right' },
  { field: 'TXN_Mode_P', header: '後台(作廢/補登)', visible: true, isTotal: true, format: formatAmount, align: 'right' },
  { field: 'Status_Code', header: '狀態', visible: true },
];

export const columnscru: ReportColumn[] = [
  { field: 'TXN_No', header: '交易序號', visible: true, format: formatTxnNo },
  { field: 'TXN_GUIBegNo', header: '發票號碼', visible: true },
  { field: 'TXN_TotSaleAmt', header: '銷售金額 (A)', visible: true, format: formatAmount, align: 'right' },
  { field: 'sad_preorder_Amt', header: '預購金額', visible: true, format: formatAmount, align: 'right' },
  { field: 'sad_settle_Amt', header: '預購結帳 (C2)', visible: true, format: formatAmount, align: 'right' },
  { field: 'TXN_TotSaleAmt_Sum', header: '銷售小計(D) = (A)', visible: true, format: formatAmount, align: 'right' },
  { field: 'TXN_TotExtraAmt', header: '代收/付金額 (L)', visible: true, format: formatAmount, align: 'right' },
  { field: 'TXN_TotHaveTax', header: '已開發票金額 (E)', visible: true, format: formatAmount, align: 'right' },
  { field: 'TXN_ChangeHaveTax', header: '已開找零 (K)', visible: true, format: formatAmount, align: 'right' },
  { field: 'TXN_TotOver', header: '已開溢付 (I)', visible: true, format: formatAmount, align: 'right' },
  { field: 'TXN_TotGUI', header: '發票總金額 (F)', visible: true, format: formatAmount, align: 'right' },
  { field: 'GUI_NET', header: '發票未稅金額 (M)', visible: true, format: formatAmount, align: 'right' },
  { field: 'TXN_TotTax', header: '發票稅額 (N)', visible: true, format: formatAmount, align: 'right' },
  { field: 'TXN_TotGUISaleNoTax', header: '發票免稅金額 (O)', visible: true, format: formatAmount, align: 'right' },
  { field: 'TXN_TotOver_Sum', header: '溢收 (G)', visible: true, format: formatAmount, align: 'right' },
  { field: 'GUI_REFUND', header: '折讓 (J)', visible: true, format: formatAmount, align: 'right' },
  { field: 'TXN_TotPayAmt', header: '付款金額(H)', visible: true, format: formatAmount, align: 'right' },
];

export const toApiDate = (v: Date | string | null | undefined) => {
  if (!v) return null;
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, '0');
    const d = String(v.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  }
  return String(v).replace(/[-/]/g, ''); //轉成 20250801
};

export function getStatusColor(row: any): string {
  switch (row.Status_Code) {
    case '#': // 粉紅：L檔金額異常
      return 'bg-pink-100 text-red-600';
    case '⚠': // 咖啡：L檔未上送
      return 'bg-amber-100 text-amber-800';
    case '@': // 綠：Z報與L檔不平
      return 'bg-green-100 text-green-700';
    default:
      return '';
  }
}
