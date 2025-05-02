import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [CommonModule],
})
export class Sysb100m {
  'SYS_StoreNo': string;
  'STR_Uniform': string;
  'SYS_StoreName': string;
  'SYS_StoreNameENG': string;
  'STO_TaxNo': string;
  'STO_ManagerName': string;
  'STO_ContactName': string;
  'STO_ContactTel': string;
  'STO_ContactFax': string;
  'STO_Addr': string;
  'STO_AddrENG': string;
  'STO_RegAddr': string;
  'STO_RegAddrENG': string;
  'STO_BRN': string;
  'STO_Tel': string;
  'STO_Fax': string;
  'STO_PostCode': string;
  'STO_MailTel': string;
  'STO_MailFax': string;
  'STO_MailAddr': string;
  'STO_InvoiceAddr': string;
  'STO_Email': string;
  'STO_URL': string;
  'CRT_Date': Date;
  'CRT_USR_No': string;
  'CRT_USR_Name': string;
  'UPD_Date': Date;
  'UPD_USR_No': string;
  'UPD_USR_Name': string;
}

export class Sysb300m {
  'id': string;
  'level_id': string;
  'level_name': string;
  'p_level_id': string;
  'CRT_Date': Date;
  'CRT_USR_No': string;
  'CRT_USR_Name': string;
  'UPD_Date': Date;
  'UPD_USR_No': string;
  'UPD_USR_Name': string;
}

export class Sysb400m {
  'org_id': string;
  'org_name': string;
  'p_org_id': string;
  'level_id': string;
  'level_name': string;
  'p_level_id': string;
  'stop_flag': string;
  'CRT_USR_No': string;
  'CRT_USR_Name': string;
  'UPD_Date': Date;
  'UPD_USR_No': string;
  'UPD_USR_Name': string;
}

export interface option {
  value: string;
  label: string;
}
