import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
/**
 * FIN54035 Model
 * @prop TargetYM: 關帳年月
 * @prop CntPostFlag1: 未過帳筆數
 * @prop CntPostFlag3: 已過帳筆數
 */
export interface FIN54035Data {
  TargetYM: string;
  CntPostFlag1: number;
  CntPostFlag3: number;
}

export interface FIN54035Response extends Omit<ApiResponse<unknown[]>, 'Data'> {
  Data: FIN54035Data;
}

/**
 * CallSp_GL_monthly_close Request
 * @prop CloseYM: 關帳年月 (格式: YYYYMM)
 * @prop CloseType: 類型(1=關帳, 2=反關帳)
 */
export interface FIN54035Payload {
  CloseYM: string;
  CloseType: 1 | 2;
}
