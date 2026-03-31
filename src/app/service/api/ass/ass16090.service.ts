import { Injectable } from "@angular/core";


// Response 資料結構
export interface ASS16090Data {
    id: number;
    scrapNote: string;     // 報廢單號
    applicantCode: string;   // 申請人代號
    departmentCode: string;     // 部門代號
    warehouse: string;     // 倉別
    applicationDate: string;   // 申請日期
    approvalDate: string;     // 審核日期
    scrapStatus: string;     // 報廢單狀態
    detailCount: number;     // 明細筆數
}

/** 新增更新資料介面 */
export interface ASS16090Request {
    id?: number;
    itemCode: string;     // 品項編碼
    unit: string;     // 單位
    scrapQty: string;     // 報廢數量
    remark: string;     // 說明
}

@Injectable({
    providedIn: 'root'
})
export class ASS16090Service {
    constructor() { }
}