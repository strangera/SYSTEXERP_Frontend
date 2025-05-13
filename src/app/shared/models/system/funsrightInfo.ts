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

export interface BehaviorType {
  function_code: string,
  function_desc: string,
  sort: number,
  CRT_Date: string,
  CRT_USR_No: string,
  CRT_USR_Name: string
}

export interface FunsrightInfo {
  id: string,
  prog_no: string,
  prog_id: string,
  prog_name: string,
  prog_up: string,
  module_no: string,
  sub_module_no: string,
  prog_ispage: string,
  prog_stopflag: string,
  prog_sort: string,

  label?: string  // 程式代號 + 程式名稱

  PrivilegeBehavior?: BehaviorType[] // 先不理會
}
