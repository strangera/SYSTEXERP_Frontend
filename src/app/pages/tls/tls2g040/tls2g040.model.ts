import { Column } from "@shared/componentkit/table-report/table-report.model";

export const bus_typeColumns: Column[] = [
  { field: 'bus_type', header: '大分類代碼' },
  { field: 'bus_type_name', header: '大分類名稱' },
  { field: 'budget', header: '月預算' },
]

export const bus_classColumns: Column[] = [
  { field: 'bus_type', header: '大分類代碼' },
  { field: 'bus_type_name', header: '大分類名稱' },
  { field: 'bus_class', header: '中分類代碼' },
  { field: 'bus_class_name', header: '中分類名稱' },
  { field: 'budget', header: '月預算' },

]
export const bus_sclassColumns: Column[] = [
  { field: 'bus_type', header: '大分類代碼' },
  { field: 'bus_type_name', header: '大分類名稱' },
  { field: 'bus_class', header: '中分類代碼' },
  { field: 'bus_class_name', header: '中分類名稱' },
  { field: 'bus_sclass', header: '小分類代碼' },
  { field: 'bus_sclass_name', header: '小分類名稱' },
  { field: 'budget', header: '月預算' },

]
export const org_idColumns: Column[] = [
  { field: 'bus_type', header: '大分類代碼' },
  { field: 'bus_type_name', header: '大分類名稱' },
  { field: 'bus_class', header: '中分類代碼' },
  { field: 'bus_class_name', header: '中分類名稱' },
  { field: 'bus_sclass', header: '小分類代碼' },
  { field: 'bus_sclass_name', header: '小分類名稱' },
  { field: 'org_id', header: '組織代碼' },
  { field: 'org_name', header: '組織名稱' },
  { field: 'budget', header: '月預算' },

]
export const tlt_noColumns: Column[] = [
  { field: 'bus_type', header: '大分類代碼' },
  { field: 'bus_type_name', header: '大分類名稱' },
  { field: 'bus_class', header: '中分類代碼' },
  { field: 'bus_class_name', header: '中分類名稱' },
  { field: 'bus_sclass', header: '小分類代碼' },
  { field: 'bus_sclass_name', header: '小分類名稱' },
  { field: 'org_id', header: '組織代碼' },
  { field: 'org_name', header: '組織名稱' },
  { field: 'tlt_no', header: '專櫃編號' },
  { field: 'tlt_name', header: '櫃位名稱' },
  { field: 'budget', header: '月預算' },

]
