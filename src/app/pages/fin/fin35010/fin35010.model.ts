// 異動狀態 (1=繳票 2=取消繳票 3=退票 4=取消退票)
export enum UpdateType {
  Deposit = '1',      // 繳票
  CancelDeposit = '2',  // 取消繳票
  Refund = '3',       // 退票
  CancelRefund = '4',   // 取消退票
}
