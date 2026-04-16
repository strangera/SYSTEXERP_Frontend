import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { IDropdownItem } from "@service/utility/dropDownList.service";
import { ApiResponse } from "@shared/utils/rxjs-operators/validate-api-response";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

// Response 資料結構
export interface ASS16020Data {
    inventoryNumber: string;     // 盤點單號
    inventoryStatus: string;   // 盤點狀態
    inventoryDate: string;     // 盤點日期
    closingDate: string;   // 結案日期
    inventoryStaff: string;     // 盤點人員
}

export interface ASS16020ReportRequest {
    inventoryNumber: string;     // 盤點單號
}

export interface ASS16020ReportData {
    MainCategoryNo: string;     // 大分類編號
    MainCategoryName: string;     // 大分類名稱
    MidCategoryNo: string;     // 中分類編號
    MidCategoryName: string;     // 中分類名稱
    SmallCategoryNo: string;     // 小分類編號
    SmallCategoryName: string;     // 小分類名稱
    Inventoryordernumber: string;     // 盤點序號
    ItemNo: string;     // 品項編號
    ItemName: string;   // 品項名稱
    StockQty: number;     // 庫存數量
    InventoryQty: number;     // 盤點數量
    DiffQty: number;     // 差異數量
    AvgUnitPrice: number;     // 平均單價
    DiffAmount: number;     // 差異金額
}

export interface ASS16020Request {
    warehouseType: string; // 倉別
    inventoryNumber: string; // 盤點單號
    SInventoryDate: string; // 盤點日期(起)
    EInventoryDate: string; // 盤點日期(迄)
    initOrgCode: string; // 初盤組織
    initChecker: string; // 初盤人員
    reOrgCode: string; // 複盤組織
    rechecker: string; // 複盤人員
    remark: string; // remark
}

export enum PageMode {
    Query = 'Query',
    Report = 'Report',
}

@Injectable({
    providedIn: 'root'
})
export class Ass16020Service {
    private apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';
    constructor(private http: HttpClient) { }


    // 查詢盤點人員下拉選單
    queryTBLUSER_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
        return this.http.post<ApiResponse<IDropdownItem[]>>(`${environment.ApiUrl}/queryTBLUSER_DropDownList`, {});
    }
}