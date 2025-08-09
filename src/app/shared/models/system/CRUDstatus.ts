//
export enum CRUDStatus {
  Create = 'Create', // INSERT 建立
  Read = 'Read', // SELECT 讀取
  Edit = 'Edit', // UPDATE 更新
  Delete = 'Delete', // DELETE 刪除
}

export enum ItemOperationStatus {
  Original = 'original', // 資料沒動
  New = 'new', // 新增
  Modified = 'modify', // 被修改
  Deleted = 'delete', // 被刪除
}
export type ItemStatus = ItemOperationStatus | 'original' | 'modify' | 'delete' | 'new';
