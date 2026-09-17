export interface userLogin {
  code?: string;
  password?: string;
  client_ip?: string;
}

export interface UserInfo {
  AccessToken: string;        // Token
  SYS_StoreNo: string;        // 分店編號
  USER_PwdExpireDate: string; // 使用者密碼過期日期
  id: number;                 // ID
  mid: number;                // 商場編號
  user_Name: string;          // 使用者 名稱
  user_No: string;            // 使用者 編號
  user_email: string;         // 使用者 電子郵件
  client_ip: string;          // 使用者 IP 地址
  STR_Uniform: string;        // 統一編號
  CompNo: string;             // 公司編號
  loginTime?: string;         // 登入時間
}
