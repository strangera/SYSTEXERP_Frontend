import { Injectable } from "@angular/core";


// Response 資料結構
export interface FIN42040Data {
    subjectName: string;     // 科目名稱
    currentAmount: number | null; // 本期金額
    currentRatio?: number | null; // 本期佔比(%)
    budgetAmount?: number | null; // 預算同期金額
    budgetRatio?: number | null; // 預算同期佔比(%)
    growthRate?: number | null; // 預算同期增減率(%)
    currentTotalAmount?: number | null; // 本期累計金額
    currentTotalRatio?: number | null; // 本期累計佔比(%)
    totalBudgetAmount?: number | null; // 預算累計金額
    totalBudgetRatio?: number | null; // 預算累計佔比(%)
    totalGrowthRate?: number | null; // 增減率(%)
}

@Injectable({
    providedIn: 'root'
})
export class FIN42040Service {
    constructor() { }
}