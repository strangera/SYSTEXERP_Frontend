import { InputGroupColumn } from "@shared/componentkit/input-group/input-group.component";
import { Column, formatAmount } from "@shared/componentkit/table-report/table-report.model";

export const bus_typeColumns: Column[] = [
  { field: 'bus_type', header: '大分類代碼' },
  { field: 'bus_type_name', header: '大分類名稱' },
  { field: 'total_budget', header: '月預算', format: formatAmount },
]

export const bus_classColumns: Column[] = [
  { field: 'bus_type', header: '大分類代碼' },
  { field: 'bus_type_name', header: '大分類名稱' },
  { field: 'bus_class', header: '中分類代碼' },
  { field: 'bus_class_name', header: '中分類名稱' },
  { field: 'total_budget', header: '月預算', format: formatAmount },

]
export const bus_sclassColumns: Column[] = [
  { field: 'bus_type', header: '大分類代碼' },
  { field: 'bus_type_name', header: '大分類名稱' },
  { field: 'bus_class', header: '中分類代碼' },
  { field: 'bus_class_name', header: '中分類名稱' },
  { field: 'bus_sclass', header: '小分類代碼' },
  { field: 'bus_sclass_name', header: '小分類名稱' },
  { field: 'total_budget', header: '月預算', format: formatAmount },

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
  { field: 'total_budget', header: '月預算', format: formatAmount },

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
  { field: 'total_budget', header: '月預算', format: formatAmount },

]
// 欄位配置
export const bus_typeFieldColumns: InputGroupColumn[] = [
  { field: 'No', header: '大分類代碼', visible: true },
  { field: 'Name', header: '大分類名稱', visible: true }
];
export const bus_classFieldColumns: InputGroupColumn[] = [
  { field: 'bus_type', header: '大分類代碼', visible: true },
  { field: 'bus_type_name', header: '大分類名稱', visible: true },
  { field: 'No', header: '小分類代碼', visible: true },
  { field: 'Name', header: '小分類名稱', visible: true }
];
export const bus_sclassFieldColumns: InputGroupColumn[] = [
  { field: 'bus_type', header: '大分類代碼', visible: true },
  { field: 'bus_type_name', header: '大分類名稱', visible: true },
  { field: 'bus_class', header: '中分類名稱', visible: true },
  { field: 'bus_class_name', header: '中分類名稱', visible: true },
  { field: 'No', header: '小分類代碼', visible: true },
  { field: 'Name', header: '小分類名稱', visible: true }
]
export const report_typeOptions = [
  { label: '依大分類統計', value: 'bus_type' },
  { label: '依中分類統計', value: 'bus_class' },
  { label: '依小分類統計', value: 'bus_sclass' },
  { label: '依組織統計', value: 'org_id' },
  { label: '依專櫃統計', value: 'tlt_no' }
];
