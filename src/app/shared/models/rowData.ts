export interface RowCheckData {
  subsystemItem: string;
  operationName?: string;
  checked: boolean;
  operationChecked: boolean;
  functionButtons: Record<string, boolean>;
  remark: string; // 新增的備註屬性
}
