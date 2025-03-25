export interface SYS1000 {
  id? : number;
  SYS_Type? : string;
  SYS_Code?: string;
  SYS_Name?: string;
  CRT_Date: Date;
  CRT_USR_No: string;
  UPD_Date: Date;
  UPD_USR_No: string;
}

export interface SYS1000Response {
  id? : number;
  SYS_Type? : string;
  SYS_Code?: string;
  SYS_Name?: string;
}
