// 角色能讀取門市
export interface RoleDataPermissions {
  // 角色ID
  roleId: number;
  // 門市 ID
  storeId: number;
  storeName: string;
  // 建立時間
  crtDate: string;
  // 建立使用者ID
  crtUserId: number | null;
  // 更新時間
  updDate: string | null;
  // 更新使用者ID
  updUserId: number | null;
}
