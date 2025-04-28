export interface ApilistForm {
  api_id?: string;
  api_path?: string;
  http_methos?: string;
  description?: string;
  release_ver?: string;
  release_date?: Date;
  sys_type?: string;
  api_type?: string;
}

export interface ApilistQuery {
  api_id?: string;
  api_path?: string;
  http_method?: string;
  release_ver?: string;
  release_date?: Date;
  sys_type?: string;
  api_type?: string;
}

export interface ApilistInfo {
  api_id?: string;
  api_path?: string;
  http_method? : string;
  description?: string;
  release_ver?: string;
  release_date?: Date;
  sys_type?: string;
  api_type?: string;
  crt_date?: string;
  crt_usr_no?: string;
  crt_usr_name?: string;
  upd_date?: string;
  upd_usr_no?: string;
  upd_usr_name?: string;
}

