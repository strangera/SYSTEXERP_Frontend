import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
/**
 * FIN54030 Model
 * @prop TargetYM: 關帳年月 (yyyyMM)
 * @prop CntPostFlag1: 建立筆數
 * @prop CntPostFlag3: 過帳筆數
 */
export interface FIN54030Data {
  TargetYM: string;
  CntPostFlag1: number;
  CntPostFlag3: number;
}

export interface FIN54030Response extends Omit<ApiResponse<unknown[]>, 'Data'> {
  Data: FIN54030Data;
}

/**
 * CloseFIN54030 Model
 * @prop CloseYM: 關帳年月 (yyyyMM)
 * @prop Close Type: 1:關帳 2:反關帳
 */
export interface FIN54030Payload {
  CloseYM: string;
  CloseType: '1' | '2';
}
