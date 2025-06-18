interface Sys1000Base {
  ID: number;
  SYS_Type: string;
  SYS_TypeName: string;
  SYS_Enabled: string | null;
  SYS_Sort: number;
  CRT_Date: string;
  CRT_USR_No: number;
  CRT_USR_Name: string | null;
  UPD_Date: string;
  UPD_USR_No: number;
  UPD_USR_Name: string | null;
}

export interface Sys1000Children extends Sys1000Base {
  SYS_Code: string;
  SYS_Name: string;
}

export interface Sys1000 extends Sys1000Base {
  Children: Sys1000Children[];
}

export type SystemOption = Pick<Sys1000Children, 'SYS_Code' | 'SYS_Name' | 'SYS_Sort'>;
