/**
 * ASS11080 處分資產基本設定 - 資料模型
 */

/** 查詢/更新的資料結構 */
export interface ASS11080Data {
  PS: string;        // 變賣傳票是否啟用
  PC: string;        // 報廢傳票是否啟用
  PC_LOSS: string;   // 資產報廢->處分資產損失
  AR: string;        // 資產變賣->應收帳款
  LOSS: string;      // 資產變賣->處分資產損失
  GET: string;       // 資產變賣->處分資產收入
  MTDAM: string;     // 資產變賣->耗材報廢會科
  MTINVW: string;    // 耗材盤點->耗材盤盈會科
  MTINVL: string;    // 耗材盤點->耗材盤損會科
}

/** 更新 Request */
export interface ASS11080UpdateRequest extends ASS11080Data { }

/** 更新 Response */
export interface ASS11080UpdateResult {
  Success: boolean;
  Message?: string;
}
