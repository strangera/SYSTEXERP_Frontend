import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorHandlerService } from '../../system/error-handler.service';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationOptionsService {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  //館別
  getBuildingOptions(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/querySYS3800_DropDownList`, {})
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? [])
      );
  }

  //位置
  getLocationOptions(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/queryPOS2002_DropDownList`, {})
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? [])
      );
  }

  //樓層
  getFloorOptions(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/querySYS3900_DropDownList`, {})
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? [])
      );
  }
  //區域
  getRegionOptions(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/querySYS3A00_DropDownList`, {})
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? [])
      );
  }
  //組織代碼
  getOrgOptions(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/querySYS3100_DropDownList`, {})
      .pipe(
        map((res) => res?.Data?.map((x: any) =>
        ({
          label: `${x.No} - ${x.Name}`,
          value: x.No
        })) ?? [])
      );
  }

  //營業型態 - 接受 SYS_Type 參數
  getPaperTypeOptions(sysType: string): Observable<any[]> {
    const requestBody = {
      SYS_Type: sysType
    };

    return this.http
      .post<any>(`${this.apiUrl}/querySYS1000_DropDownList`, requestBody)
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: `${x.No} - ${x.Name}`, value: x.No })) ?? [])
      );
  }

  // 位置代碼選項 - 包含自動帶入用的館別、樓層、區域資訊
  getLocationWithDetailsOptions(searchParams?: any): Observable<any[]> {
    console.log('🔍 LocationService 收到原始參數:', searchParams);

    // 準備請求體，符合後端期望格式
    const body: any = this.buildRequestBody(searchParams);

    console.log('📤 LocationService 發送請求體:', body);

    return this.http
      .post<any>(`${this.apiUrl}/queryPOS2002_Location_DropDownList`, body)
      .pipe(
        map((res) => {
          console.log('📥 LocationService API 回應:', res);

          const results = res?.Data?.map((x: any) => ({
            label: x.location_no,           // 下拉選單顯示用
            value: x.location_no,           // 下拉選單選擇值
            location_no: x.location_no,     // 確保這個欄位存在
            tlt_building: x.tlt_building,   // 自動帶入用 - 館別
            tlt_floor: x.tlt_floor,         // 自動帶入用 - 樓層
            area_no: x.area_no,             // 自動帶入用 - 區域
            tlt_space: x.tlt_space || 0,    // 自動帶入用 - 營業面積
            building_desc: x.building_desc || '', // 館別描述
            floor_desc: x.floor_desc || '',   // 樓層描述
            area_desc: x.area_desc || ''      // 區域描述
          })) ?? [];

          // 關鍵：將後端的分頁資訊附加到結果上
          (results as any).__paginationInfo = {
            totalCount: res?.TotalCount || 0,
            totalPages: res?.TotalPages || 0,
            currentPage: searchParams?.pageIndex || 0,
            pageSize: searchParams?.pageSize || 10
          };

          console.log('✅ LocationService 處理後結果:', {
            原始數量: res?.Data?.length || 0,
            處理後數量: results.length,
            總筆數: res?.TotalCount,
            總頁數: res?.TotalPages,
            請求參數: body
          });

          return results;
        }),
        catchError((error) => {
          console.error('❌ getLocationWithDetailsOptions 錯誤:', error);
          console.error('❌ 錯誤請求體:', body);
          return of([]);
        })
      );
  }

  // 建構符合後端期望的請求體
  private buildRequestBody(searchParams?: any): any {
    const body: any = {};

    // ✅ 只有在有參數時才加入，不設預設值
    if (searchParams?.pageSize !== undefined) {
      body.PageSize = searchParams.pageSize;
    }

    if (searchParams?.pageIndex !== undefined) {
      body.PageIndex = searchParams.pageIndex + 1; // 後端通常是 1-based 索引
    }

    if (searchParams?.SortBy && Array.isArray(searchParams.SortBy)) {
      body.SortBy = searchParams.SortBy;
    }

    // 搜尋條件
    if (searchParams?.building_code) {
      body.building_code = searchParams.building_code;
    }
    if (searchParams?.floor_code) {
      body.floor_code = searchParams.floor_code;
    }
    if (searchParams?.area_code) {
      body.area_code = searchParams.area_code;
    }

    return body;
  }

}
