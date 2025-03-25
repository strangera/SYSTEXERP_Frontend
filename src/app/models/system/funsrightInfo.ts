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
  add_api_path?: string; //
  delete_api_path?: string;
  edit_api_path?: string;
  enable_fg?: string;
  export_api_path?: string;
  extright1_api_path?: string;
  extright2_api_path?: string;
  extright3_api_path?: string;
  extright4_api_path?: string;
  extright5_api_path?: string;
  group_no?: string;
  http_method?: string;
  parent_id?: string;
  path?: string;
  print_api_path?: string;
  prog_name?: string;
  prog_no?: string;
  query_api_path?: string;
  report_api_path?: string;
  show_fg?: string;
  permissions?: string[];
}
