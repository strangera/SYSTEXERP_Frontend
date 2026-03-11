import { Injectable } from "@angular/core";


// Response 資料結構
export interface ASS16020Data {
    inventoryNumber: string;     // 盤點單號
    inventoryStatus: string;   // 盤點狀態
    inventoryDate: string;     // 盤點日期
    closingDate: string;   // 結案日期
    inventoryStaff: string;     // 盤點人員
}

@Injectable({
    providedIn: 'root'
})
export class Ass16020Service {
    constructor() { }
}