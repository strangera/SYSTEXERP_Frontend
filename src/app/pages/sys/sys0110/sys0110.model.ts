// 定義 sys3700 列表中的子項目介面 (與您上一個問題中的 UserSys3700Detail 相同)
export interface UserSys3700Detail {
  ID?: number;
  User_No?: string;
  SEQ_No?: number;
  Org_ID: string | null;      // 這裡根據 JSON 數據可能為 null
  Building_No: string | null;
  Floor_No: string | null;
  Area_No: string | null;
  TLT_No: string | null;
  TLT_Kind: string | null;
  BUS_Type: string | null;
  CRT_Date?: string; // ISO 8601 date string
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string; // ISO 8601 date string
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
}

// 定義主要的使用者資訊介面
export interface UserInfo {
  id: number;
  user_No: string;
  user_Name: string;
  user_Password: string;
  title: string;
  org_ID: string;
  str_date: string; // ISO 8601 date string
  end_date: string; // ISO 8601 date string
  status: string;
  user_type: string;
  user_email: string;
  TLT_No: string;
  remarks: string;
  user_priority: string;
  USER_PwdExpireDate: string; // ISO 8601 date string
  last_Login: string | null; // 可以是 string (日期) 或 null
  CRT_Date: string; // ISO 8601 date string
  UPD_Date: string; // ISO 8601 date string
  sys3700: UserSys3700Detail[]; // 包含 UserSys3700Detail 介面的陣列
  // 注意：JSON 底部重複的 CRT_USR_No, CRT_USR_Name, UPD_USR_No, UPD_USR_Name
  // 如果這些是多餘的或與頂層的建立/更新人員資訊一致，則無需再次定義。
  // 這裡假設它們是頂層用戶信息的屬性，不是重複的。
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}
