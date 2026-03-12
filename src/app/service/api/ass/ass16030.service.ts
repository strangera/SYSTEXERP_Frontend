import { Injectable } from "@angular/core";


// Response 資料結構
export interface ASS16030Data {
    issuanceNote: string;     // 領用單號
    applicantCode: string;   // 申請人代號
    departmentCode: string;     // 部門代號
    applicationDate: string;   // 申請日期
    issuanceStatus: string;     // 領用單狀態
    approver: string;   // 審核者
    approvalDate: string;     // 審核日期
    issuanceDate: string;   // 發料日期
    detailCount: string;   // 明細筆數
}

export interface ASS16030Request {
    id?: number; // ID
    itemCode: string; // 品項代碼
    unit: string; // 單位
    quantity: string; // 數量
    itemRemark: string; // 單項說明
}

@Injectable({
    providedIn: 'root'
})
export class ASS16030Service {
    constructor() { }
}