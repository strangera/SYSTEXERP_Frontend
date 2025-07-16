
export interface TLS12020QueryParams {
  ECR_LocNo?: string;
  cus_uniform_id?: string;
  ven_name?: string;
  VEN_EngName?: string;
  brand?: string;
  create_store?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_Datestart?: string; // 例如 '2024-07-01'
  contact_Dateend?: string;
  contact_time?: string;      // 如果是 HH:MM 格式也可以寫 string
  contact_USR_Name?: string;
  willing_level?: string;
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];
}
