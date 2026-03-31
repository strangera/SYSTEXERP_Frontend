import { Injectable } from "@angular/core";


// Response 資料結構
export interface ASS16060Data {
    id: string;
    returnNote: string;     // 退回單號
    returnerCode: string;   // 退回人代號
    warehouse: string;     // 倉別
    departmentCode: string;   // 部門代號
    returnDate: string;     // 退回日期
    returnStatus: string;   // 退回狀態
    detailCount: string;     // 明細筆數
}

export interface ASS16060DetailData {
    id: string;
    itemCode: string;     // 品項代碼
    unit: string;     // 單位
    returnQty: string;     // 退回數量
    remark: string;     // 說明
}

/** 新增更新資料介面 */
export interface ASS16060Request {
    id?: number; // 記錄 ID
    warehouse: string;     // 倉別
    returnerCode: string;   // 退回人代號
    departmentCode: string;   // 部門代號
    applyDate: string;     // 申請日期
    retExp: string;     // 退回說明
    items: ASS16060DetailData[]; // 明細資料
}


@Injectable({
    providedIn: 'root'
})
export class ASS16060Service {
    constructor() { }
}