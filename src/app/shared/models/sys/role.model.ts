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
  children: TreeNode[]; // 遞迴定義，表示子節點也是相同結構
}

export type TreeData = TreeNode[];
