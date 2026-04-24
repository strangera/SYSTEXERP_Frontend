import { getSYS1000 } from "@service/system/sys1000.service";
import { EditColumn } from "@shared/componentkit/table-edit/table-edit.model";
import { validateDuplicate, validateMaxLength, validateMinNumber, validateRequired } from "@shared/componentkit/table-edit/validate-field.model";
import { formatDate } from "@shared/componentkit/table-report/table-report.model";
import { formatAmount } from "@shared/componentkit/table/table.model";
import { AA00000000 } from "../../tls55040/tls55040-cru/tls55040-cru.component";
import { IRebateDetailForCRU } from "./tls55030-cru.component";
export function toUpperCase(rowData: IRebateDetailForCRU): void {
  if (rowData && rowData.PUR_GUINo) {
    rowData.PUR_GUINo = rowData.PUR_GUINo.toUpperCase();
  }
}
export const columns: EditColumn[] = [
  { field: 'TABTYPE', header: '單據別', format: (value) => getSYS1000('TABTYPE', value), width: '85px' },
  { field: 'PUR_GUINo', header: '發票/收據編號', type: 'input', validate: [validateDuplicate, validateRequired, validateMaxLength(10), AA00000000], onBlur: (rowData) => toUpperCase(rowData), width: '100px' },
  { field: 'PUR_TaxType', header: '課稅別', format: (value) => getSYS1000('PUR_TaxType', value) },
  { field: 'PUR_DirectType', header: '發票用途', format: (value) => getSYS1000('PUR_DirectType', value) },
  { field: 'PUR_Amt', header: '發票金額', format: formatAmount },
  { field: 'PUR_VoucherType', header: '發票格式' },
  { field: 'PUR_GUIDate', header: '發票日期', format: formatDate },
  { field: 'Rebate_GUIDate', header: '折讓日期', type: 'date', format: formatDate, validate: [validateRequired, validateDateRange] },
  { field: 'Rebate_Amt', header: '已折讓金額', format: formatAmount }, {
    field: 'Rebate_Amt_New', header: '折讓金額', type: 'inputNumber', width: '12rem',
    onBlur: (rowData) => {
      // 1. 先計算未稅金額並四捨五入
      rowData.Rebate_Net = Math.round(rowData.Rebate_Amt_New / 1.05);
      // 2. 稅額 = 總額 - 未稅額 (最能確保總數吻合)
      rowData.Rebate_Tax = Math.round(rowData.Rebate_Amt_New - rowData.Rebate_Net);
      // 3. 確保總額也是整數 (預防 inputNumber 帶小數)
      rowData.Rebate_Amt_New = Math.round(rowData.Rebate_Amt_New);
    },
    validate: [validateRequired, validateMinNumber(1)]
  },
  {
    field: 'Rebate_Net', header: '未稅金額', type: 'inputNumber', width: '12rem',
    onBlur: (rowData) => {
      // 1. 先計算總額並四捨五入
      rowData.Rebate_Amt_New = Math.round(rowData.Rebate_Net * 1.05);
      // 2. 稅額 = 總額 - 未稅額
      rowData.Rebate_Tax = Math.round(rowData.Rebate_Amt_New - rowData.Rebate_Net);
      // 3. 確保未稅額也是整數
      rowData.Rebate_Net = Math.round(rowData.Rebate_Net);
    },
    validate: [validateRequired, validateMinNumber(1)]
  },
  {
    field: 'Rebate_Tax',
    header: '稅額',
    type: 'inputNumber',
    width: '12rem',
    onBlur: (rowData) => {
      // 稅額手動輸入時也確保是整數
      rowData.Rebate_Tax = Math.round(rowData.Rebate_Tax);
    },
    validate: [validateRequired, validateMinNumber(1)]
  }
];

export const columns2: EditColumn[] = [
  { field: 'RJM_No', header: '退貨單號' },
  { field: 'APRV_Date', header: '退貨日期' },
  { field: 'HOS_NAME', header: '倉別' },
  // 如果退貨單金額也需要顯示為整數，formatAmount 通常已經處理，
  // 若需要強制顯示無小數，可確認 formatAmount 的實作或改用自定義 format。
  { field: 'RJM_TotalBuyAmt', header: '應稅金額', format: formatAmount },
  { field: 'RJM_TotalBuyNet', header: '未稅金額', format: formatAmount },
  { field: 'RJM_TotalBuyTax', header: '稅額', format: formatAmount },
];

// Rebate_GUIDate 折讓日期要大於等於 PUR_GUIDate 發票日期
export function validateDateRange(value: any, rowData: any): { isValid: boolean; errorMessage: string[] } {
  // 如果其中一個日期沒填，交給 validateRequired 處理，這裡視為通過
  if (!rowData.Rebate_GUIDate || !rowData.PUR_GUIDate) {
    return { isValid: true, errorMessage: [] };
  }

  // 強制轉換為 Date 物件進行數值比較 (getTime)
  const rebateDate = new Date(rowData.Rebate_GUIDate).getTime();
  const purDate = new Date(rowData.PUR_GUIDate).getTime();

  // 根據您的需求：大於 ( > ) 或 大於等於 ( >= )
  const isValid = rebateDate >= purDate;

  return {
    isValid: isValid,
    errorMessage: isValid ? [] : ['折讓日期不可早於發票日期'],
  };
}
