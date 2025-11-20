import { getSYS1000 } from "@service/system/sys1000.service";
import { EditColumn } from "@shared/componentkit/table-edit/table-edit.model";
import { validateMinNumber, validateRequired } from "@shared/componentkit/table-edit/validate-field.model";
import { formatAmount } from "@shared/componentkit/table/table.model";

export const columns: EditColumn[] = [
  { field: 'TABTYPE', header: '單據別', format: (value) => getSYS1000('TABTYPE', value) },
  { field: 'PUR_GUINo', header: '發票/收據編號' },
  { field: 'PUR_TaxType', header: '課稅別', format: (value) => getSYS1000('PUR_TaxType', value) },
  { field: 'PUR_DirectType', header: '發票用途', format: (value) => getSYS1000('PUR_DirectType', value) },
  { field: 'PUR_Amt', header: '發票金額', format: formatAmount },
  { field: 'PUR_VoucherType', header: '發票格式' },
  { field: 'Rebate_Amt', header: '已折讓金額', format: formatAmount },
  {
    field: 'Rebate_Amt_New', header: '折讓金額', type: 'inputNumber', width: '12rem',
    onBlur: (rowData) => {
      rowData.Rebate_Net = rowData.Rebate_Amt_New / 1.05;
      rowData.Rebate_Tax = rowData.Rebate_Amt_New / 21;
    },
    validate: [validateRequired, validateMinNumber(1)]
  },
  {
    field: 'Rebate_Net', header: '未稅金額', type: 'inputNumber', width: '12rem',
    onBlur: (rowData) => {
      rowData.Rebate_Amt_New = rowData.Rebate_Net * 1.05;
      rowData.Rebate_Tax = (rowData.Rebate_Net * 1.05) / 21;
    },
    validate: [validateRequired, validateMinNumber(1)]
  },
  { field: 'Rebate_Tax', header: '稅額', type: 'inputNumber', width: '12rem', validate: [validateRequired, validateMinNumber(1)] }
];
export const columns2: EditColumn[] = [
  { field: 'RJM_No', header: '退貨單號' },
  { field: 'APRV_Date', header: '退貨日期' },
  { field: 'HOS_NAME', header: '倉別' },
  { field: 'RJM_TotalBuyAmt', header: '應稅金額', format: formatAmount },
  { field: 'RJM_TotalBuyNet', header: '未稅金額', format: formatAmount },
  { field: 'RJM_TotalBuyTax', header: '稅額', format: formatAmount },
];
