import { Column, ColumnGroup } from "@shared/componentkit/table/table.model";

export const columns: Column[] = [
  { field: 'PLU_MagNo', header: '商品管理編號', visible: true },
  { field: 'PLU_Name', header: '商品名稱', visible: true },
  { field: 'CAT_LNo', header: '大分類代號', visible: true },
  { field: 'CAT_LName', header: '大分類名稱', visible: true },
  { field: 'CAT_MNo', header: '中分類代號', visible: true },
  { field: 'CAT_MName', header: '中分類名稱', visible: true },
  { field: 'CAT_SNo', header: '小分類代號', visible: true },
  { field: 'CAT_SName', header: '小分類名稱', visible: true },
  { field: 'PLU_OrderPrcRate', header: '進價折數', visible: true },
  { field: 'PLU_OrderPrc', header: '調整前進價', visible: true, groupField: 'OrderPrc' },
  { field: 'MAM_OrderPrc', header: '調整後進價', visible: true, type: 'inputNumber', groupField: 'OrderPrc' },
  { field: 'PLU_SalePrc', header: '調整前售價', visible: true, groupField: 'SalePrc' },
  { field: 'MAM_UnitPrc', header: '調整後售價', visible: true, type: 'inputNumber', groupField: 'SalePrc' },
  { field: 'MAD_Remark', header: '單項說明', visible: true, type: 'input' }
];
export const columnGroup: ColumnGroup[] = [
  { field: 'OrderPrc', header: '進價變價' },
  { field: 'SalePrc', header: '售價變價' }
]
