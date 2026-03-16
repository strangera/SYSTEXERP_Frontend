import { Injectable } from "@angular/core";


// Response 資料結構
export interface ASS16010Data {
    inventoryNo: string;     // 盤點單號
    inventoryDate: string;   // 盤點日期
}

@Injectable({
    providedIn: 'root'
})
export class Ass16010Service {
    constructor() { }
}