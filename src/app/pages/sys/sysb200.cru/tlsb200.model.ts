export interface Tlsb200Model {
  id?: number;
  // 基本資料
  VEN_No: string;
  VEN_Flag: string;
  VEN_Uniform: string;
  VEN_RemitFeeMode: string;
  VEN_Name: string;
  VEN_EngName: string;
  VEN_ShortName: string;

  // 公司資料
  VEN_Post: string;
  VEN_Address: string;
  VEN_GUIAddr: string;
  VEN_Tel: string;
  VEN_Fax: string;
  VEN_Email: string;
  VEN_GUIEmail: string;

  // 聯絡人
  VEN_Boss: string;
  VEN_BossTitle: string;
  VEN_BossID: string;
  VEN_BossAddr: string;
  VEN_BossEmail: string;

  // 付款資料
  VEN_PayType: string;
  VEN_BNK_No: string;
  VEN_BankAccountNo: string;
  VEN_AccountName: string;
  VEN_PayConditionDay: string;

  // 其他資料
  VEN_CheckTitle: string;
  VEN_Remark: string;
}
