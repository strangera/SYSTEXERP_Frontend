export interface UserData {
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  id: number;
  user_No: string;
  user_Name: string;
  user_Password: string;
  title: string;
  org_ID: string;
  str_date: string;
  end_date: string;
  status: string;
  user_type: string;
  user_email: string;
  TLT_No: string;
  remarks: string;
  user_priority: string;
  USER_PwdExpireDate: string;
  last_Login: string;
}

export interface TreeNode {
  id: string;
  label: string;
  IsEnable: boolean;
  partialSelected: boolean;
  actions: TreeNode[]; // 可選的操作列表
  children: TreeNode[];
}
export interface PrimeTreeNode {
  key: string; // PrimeNG 建議有 key 屬性
  data?: any; // 實際的節點資料 (這裡可以放您的 id, label, IsEnable, actions 等)
  children?: PrimeTreeNode[]; // 子節點
  actions?: TreeNode[];
  // 這兩個是 PrimeNG TreeTable 判斷勾選狀態的關鍵屬性！
  selected?: boolean; // 表示該節點是否被完全選中
  partialSelected?: boolean; // 表示該節點是否被部分選中
}
