import { Injectable } from "@angular/core";


// Response 資料結構
export interface FIN42020Data {
    STYPE_NAME: string;     // 科目名稱
    MONTH_CURRENT_AMOUNT: number | null; // 本月金額
    MONTH_CURRENT_RATIO?: number | null;
    MONTH_LAST_AMOUNT?: number | null;
    MONTH_LAST_RATIO?: number | null;
    MONTH_GROWTH_RATE?: number | null;
    MONTH_BUDGET?: number | null;
    MONTH_BUDGET_RATE?: number | null;

    ACC_CURRENT_AMOUNT?: number | null;
    ACC_CURRENT_RATIO?: number | null;
    ACC_LAST_AMOUNT?: number | null;
    ACC_LAST_RATIO?: number | null;
    ACC_GROWTH_RATE?: number | null;
    ACC_BUDGET?: number | null;
    ACC_BUDGET_RATE?: number | null;
}

@Injectable({
    providedIn: 'root'
})
export class FIN42020Service {
    constructor() { }
}