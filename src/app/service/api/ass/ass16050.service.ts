import { Injectable } from "@angular/core";


// Response 資料結構
export interface ASS16050Data {
    id: string;
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

export interface ASS16050Request {
    issuanceNote: string;     // 領用單號
    departmentCode: string;     // 部門代號
    applicantCode: string;   // 申請人代號
    applicationDate: string;   // 申請日期
    issuanceDate: string;   // 發料日期
    issuanceStatus: string;     // 驗收單狀態
    detailCount: string;   // 明細筆數
}

@Injectable({
    providedIn: 'root'
})
export class ASS16050Service {
    constructor() { }
}