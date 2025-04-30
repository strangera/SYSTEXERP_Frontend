export enum PermissionsInfo {
  add = 'ADD',
  delete = 'DELETE',
  edit = 'EDIT',
  export = 'EXPORT',
  extright1 = 'EXTRIGHT1',
  extright2 = 'EXTRIGHT2',
  extright3 = 'EXTRIGHT3',
  extright4 = 'EXTRIGHT4',
  extright5 = 'EXTRIGHT5',
  print = 'PRINT',
  query = 'QUERY',
  report = 'REPORT',
}

export interface FunsrightInfo {
  id: number,           // ID
  prog_no: string,      // 程式代號
  prog_id: string,
  prog_name: string,    // 程式名稱
  prog_up: string,      // 上層程式代號
  module_no: string,    // 模組代號
  sub_module_no: string,// 子模組代號
  prog_ispage: string,  // 是否為頁面
  prog_stopflag: string,// 停用狀態
  prog_sort: number     // 排序

  label?: string  // 程式代號 + 程式名稱

  PrivilegeBehavior?: PermissionsInfo[] // 先不理會
}
