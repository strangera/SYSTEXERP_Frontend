import { ColumnGroup, EditColumn } from "@shared/componentkit/table-edit/table-edit.model";
import { validateMinNumber, validateRequired } from "@shared/componentkit/table-edit/validate-field.model";

export const columns: EditColumn[] = [
  { field: 'PLU_MagNo', header: '商品管理編號' },
  { field: 'PLU_Name', header: '商品名稱' },
  { field: 'CAT_LNo', header: '大分類代號' },
  { field: 'CAT_LName', header: '大分類名稱' },
  { field: 'CAT_MNo', header: '中分類代號' },
  { field: 'CAT_MName', header: '中分類名稱' },
  { field: 'CAT_SNo', header: '小分類代號' },
  { field: 'CAT_SName', header: '小分類名稱' },
  { field: 'PLU_OrderPrcRate', header: '進價折數' },
  { field: 'PLU_OrderPrc', header: '調整前進價', groupField: 'OrderPrc' },
  { field: 'MAM_OrderPrc', header: '調整後進價', type: 'inputNumber', groupField: 'OrderPrc', width: '100px', maxLength: 8, minFractionDigits: 2, maxFractionDigits: 2, validate: [validateRequired, validateMinNumber(1)] },
  { field: 'PLU_SalePrc', header: '調整前售價', groupField: 'SalePrc' },
  { field: 'MAM_UnitPrc', header: '調整後售價', type: 'inputNumber', groupField: 'SalePrc', width: '100px', maxLength: 8, validate: [validateRequired, validateMinNumber(1)] },
  { field: 'MAD_Remark', header: '單項說明', type: 'input', width: '120px', maxLength: 200 }
];
export const columnGroup: ColumnGroup[] = [
  { field: 'OrderPrc', header: '進價變價' },
  { field: 'SalePrc', header: '售價變價' }
]
