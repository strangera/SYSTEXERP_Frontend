export interface FIN71010Data {
  MID: number;
  SYS_StoreNo: string | null;
  ECR_No: string | null;
  APEXP_ARG_NO: string | null;
  APEXP_LID: string | null;
  APEXP_LID_Name: string | null;
  APEXP_COMMON_ARG_NO: string | null;
  APEXP_LID_COMMON: string | null;
  APEXP_LID_COMMON_Name: string | null;
  PTAX_ARG_NO: string | null;
  PTAX_LID: string | null;
  PTAX_LID_Name: string | null;
  PTAX_COMMON_ARG_NO: string | null;
  PTAX_LID_COMMON: string | null;
  PTAX_LID_COMMON_Name: string | null;
  CRT_Date: string | null;
  CRT_USR_No: string | null;
  CRT_USR_Name: string | null;
  UPD_Date: string | null;
  UPD_USR_No: string | null;
  UPD_USR_Name: string | null;
}

export interface FIN71010DropdownItem {
  No: string;
  Name: string;
}

export interface FIN71010Update {
  MID: number;
  SYS_StoreNo: string;
  ECR_No: string;
  APEXP_LID?: string | null;
  APEXP_LID_COMMON?: string | null;
  PTAX_LID?: string | null;
  PTAX_LID_COMMON?: string | null;
}
