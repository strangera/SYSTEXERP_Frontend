import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [CommonModule],
})

//POS10015 門市系統主機設定檔
export class Tls46010m {
  'id': string;
  'SYS_StoreNo': string;
  'SYS_SrvNo': string;
  'SYS_SrvIP': string;
  'SYS_SrvPort': number; // 主機連接埠，預設值為20
  'SYS_SrvStatus': string;
  'SYS_SrvName': string;
  'SYS_SrvUsrID': string;
  'SYS_SrvUsrPwd': string;

  'SYS_SRVDDir': string;
  'SYS_SRVUDir': string;

  'SYS_MyPOSDDir': string;
  'SYS_MyPOSUDir': string;
  'SYS_SRVDDirClt': string;
  'SYS_SRVUDirClt': string;

  'CRT_Date': Date;
  'CRT_USR_No': string;
  'CRT_USR_Name': string;
  'UPD_Date': Date;
  'UPD_USR_No': string;
  'UPD_USR_Name': string;
}

// option項目
export interface Option {
  value: string;
  label: string;
}

// api dropDown list 接收選項
export interface apiOption {
  No: string;
  Name: string;
}
