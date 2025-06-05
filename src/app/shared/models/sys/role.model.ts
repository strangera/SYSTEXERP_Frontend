export interface Role {
  id: number;
  Role_No: string;
  Role_Name: string;
  Description: string;
  CRT_Date: string;
  CRT_USR_No: string
  CRT_USR_Name: string
  UPD_Date: string
  UPD_USR_No: string
  UPD_USR_Name: string
}

export interface TreeNode {
  id: string;
  label: string;
  IsEnable: boolean;
  partialSelected: boolean;
  children: TreeNode[];
}
export interface PrimeTreeNode {
  key: string; // PrimeNG 建議有 key 屬性
  data?: any; // 實際的節點資料
  children?: PrimeTreeNode[]; // 子節點
}
