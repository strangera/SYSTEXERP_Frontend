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
  prog_id: string;
  IsEnable: boolean | null;
  partialSelected?: boolean;
  isOpen?: boolean;
  isHidden?: boolean;
  children: TreeNode[];
  actions: TreeNode[];
  parent?: TreeNode;
  isDisable?: boolean | string
  enabledCount?: number;
  totalCount?: number;
}
