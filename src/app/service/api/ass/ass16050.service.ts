import { Injectable } from "@angular/core";


// Response 資料結構
export interface ASS16050Data {
    id: string;
    issueNo: string;     // 領用單號
    applicantCode: string;   // 申請人代號
    departmentCode: string;     // 部門代號
    applicationDate: string;   // 申請日期
    issuanceStatus: string;     // 領用單狀態
    approver: string;   // 審核者
    approvalDate: string;     // 審核日期
    shippingDate: string;   // 發料日期
    detailCount: string;   // 明細筆數
}

export interface ASS16050Request {
    id?: number;
    itemCode: string;     // 品項編碼
    itemName: string;     // 品項名稱
    applyQty: string;     // 申請數量
    issuedQty: string;     // 已發數量
}

@Injectable({
    providedIn: 'root'
})
export class ASS16050Service {
    constructor() { }
}