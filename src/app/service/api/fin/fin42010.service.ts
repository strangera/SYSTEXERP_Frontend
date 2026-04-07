import { Injectable } from "@angular/core";


// Response 資料結構
export interface FIN42010Data {
    subjectCode: string;     // 科目代號
    subjectName: string;   // 科目名稱
    january: number;     // 1月
    february: number;     // 2月
    march: number;     // 3月
    april: number;     // 4月
    may: number;     // 5月
    june: number;     // 6月
    july: number;     // 7月
    august: number;     // 8月
    september: number;     // 9月
    october: number;     // 10月
    november: number;     // 11月
    december: number;     // 12月
    totalBudget: number;     // 預算總金額
}


@Injectable({
    providedIn: 'root'
})
export class FIN42010Service {
    constructor() { }
}