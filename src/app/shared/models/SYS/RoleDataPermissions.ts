// 角色能讀取門市
export interface RoleDataPermissions {
  roleId: number;           // 角色ID
  storeId: number;      // 門市ID
  storeName: string;    // 門市名稱
  crtDate: string;      // 建立時間 
  crtUserId: number | null;  // 建立使用者ID
  updDate: string | null;// 更新時間
  updUserId: number | null;// 更新使用者ID
}
