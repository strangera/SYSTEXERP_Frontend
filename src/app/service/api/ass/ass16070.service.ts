import { Injectable } from "@angular/core";


// Response 資料結構
export interface ASS16070Data {
    id: number;
    transferNote: string;     // 調撥單號
    applicantCode: string;   // 申請人代號
    departmentCode: string;     // 部門代號
    applicationDate: string;   // 申請日期
    outWarehouse: string;     // 調出倉別
    outDate: string;   // 撥出日期
    inWarehouse: string;     // 調入倉別
    inDate: string;     // 撥入日期
    transferStatus: string;     // 調撥狀態
    detailCount: number;     // 明細筆數
}

/** 新增更新資料介面 */
export interface ASS16070Request {
    id?: number;
    itemCode: string;     // 品項編號
    unit: string;     // 單位
    returnQty: string;     // 調撥數量
    remark: string;     // 說明
}

@Injectable({
    providedIn: 'root'
})
export class ASS16070Service {
    constructor() { }
}