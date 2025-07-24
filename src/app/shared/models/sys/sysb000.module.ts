export interface Sysb100m {
  'id': string;
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

export interface Sysb200m {
  'id': string;
  'manufacturerID': string;
  'approvalStatus': string;
  'manufacturerUID': string;
  'manufacturerCName': string;
  'manufacturerEName': Date;
  'manufacturerSName': string;
  'mailingAddress': string;
  'contactPerson': Date;
  'contactPersonTitle': string;
  'contactPersonUID': string;
  'contactPersonPhone': string;
  'contactAddress': string;
  'contactEmail': string;
  'registeredAddress': string;
  'registeredPhone': Date;
  'companyFax': string;
  'companyWebsite': string;
  'systemtype': Date;
  'remark': string;
  'expirationDay': string;
  'remittanceBankCode': string;
  'CRT_Date': Date;
  'CRT_USR_No': string;
  'CRT_USR_Name': string;
  'UPD_Date': Date;
  'UPD_USR_No': string;
  'UPD_USR_Name': string;
}

export interface Sysb300m {
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

  'CanDel': boolean; // 是否可刪除
}

// SYS3100 組織碼設定作業
export interface Sysb400m {
  'id': string;
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

  'CanDel': boolean; // 是否可刪除
}

// SYS3A00 區域代碼檔
export interface Sysb500m {
  'id': string;
  'area_no': string;
  'area_desc': string;
  'CRT_Date': Date;
  'CRT_USR_No': string;
  'CRT_USR_Name': string;
  'UPD_Date': Date;
  'UPD_USR_No': string;
  'UPD_USR_Name': string;
}

// SYS3900 樓層基本資料維護
export interface Sysb600m {
  'id': string;
  'floor_no': string;
  'floor_desc': string;
  'CRT_Date': Date;
  'CRT_USR_No': string;
  'CRT_USR_Name': string;
  'UPD_Date': Date;
  'UPD_USR_No': string;
  'UPD_USR_Name': string;
}

// tblUser 使用者設定檔
export interface tblUser {
  'id': string;
  'user_No': string;
  'user_Name': string;
  'user_Password': string;
  'title': string;
  'org_ID': string;

  'str_date': Date;
  'end_date': Date;

  'status': string;
  'user_type': string;
  'user_email': string;
  'TLT_No': string;
  'remarks': string;
  'user_priority': string;
  'USER_PwdExpireDate': Date;

  'CRT_Date': Date;
  'CRT_USR_No': string;
  'CRT_USR_Name': string;
  'UPD_Date': Date;
  'UPD_USR_No': string;
  'UPD_USR_Name': string;
}

//tblRole 使用者角色設定檔
export interface tblRole {
  'id': number;
  'Role_No': string;
  'Role_Name': string;
  'Description': string;

  'CRT_Date': Date;
  'CRT_USR_No': string;
  'CRT_USR_Name': string;
  'UPD_Date': Date;
  'UPD_USR_No': string;
  'UPD_USR_Name': string;
}

// SYS1000代碼檔案
export interface SYS1000 {
  'ID': number;
  'SYS_Code': string;
  'SYS_Name': string;
  'SYS_Enabled': string;
  'SYS_Sort': number;
  'SYS_Type': string;

  'CRT_Date': Date;
  'CRT_USR_No': string;
  'CRT_USR_Name': string;
  'UPD_Date': Date;
  'UPD_USR_No': string;
  'UPD_USR_Name': string;
}

export interface apiOption {
  No: string;
  Name: string;
  Label?: string;
}

export interface option {
  value: string;
  label: string;
}
