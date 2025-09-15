// 型態資料模型
export interface TDS52020Data {
  Id: number;
  VoucherKind: string;
  VoucherName: string;
}

export const columns = [
  { field: 'VoucherKind', header: '型態代號' },
  { field: 'VoucherName', header: '型態名稱' },
];
