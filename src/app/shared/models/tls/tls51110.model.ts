export interface LogoBudget {
  id: number;
  LOGO_No: string;
  YYYYMM: string;
  BUDGET: number;
  BUDGET_Cost: number;
  BUD_Remark: string;
  BUD_Status: string;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
}
