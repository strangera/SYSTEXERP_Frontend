import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationOptionsService {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
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

  //營業型態（帶排序） - 接受 SYS_Type 參數，返回帶 Sort 欄位的選項，用於 Next2 折扣別排序
  querySYS1000_DropDownListWithSort(sysType: string): Observable<any[]> {
    const requestBody = {
      SYS_Type: sysType
    };

    return this.http
      .post<any>(`${this.apiUrl}/querySYS1000_DropDownListWithSort`, requestBody)
      .pipe(
        map((res) => {
          // 先按照 Sort 欄位排序，然後轉換為選項格式
          const sortedData = (res?.Data || [])
            .sort((a: any, b: any) => {
              const sortA = a.Sort ?? Number.MAX_SAFE_INTEGER;
              const sortB = b.Sort ?? Number.MAX_SAFE_INTEGER;
              return sortA - sortB;
            });

          return sortedData.map((x: any) => ({
            label: `${x.No} - ${x.Name}`,
            value: x.No,
            sort: x.Sort // 保留排序資訊
          }));
        })
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
            label: x.location_no,
            value: x.location_no,
            location_no: x.location_no,
            tlt_building: x.tlt_building,
            tlt_floor: x.tlt_floor,
            area_no: x.area_no,
            tlt_space: x.tlt_space || 0,
            building_desc: x.building_desc || '',
            floor_desc: x.floor_desc || '',
            area_desc: x.area_desc || '',
            occ_tlt_no: x.occ_tlt_no || null,
            occ_tlt_name: x.occ_tlt_name || null,
            occ_bdate: x.occ_bdate || null,
            occ_edate: x.occ_edate || null
          })) ?? [];

          // 關鍵：將後端的分頁資訊附加到結果上
          (results as any).__paginationInfo = {
            totalCount: res?.TotalCount || 0,
            totalPages: res?.TotalPages || 0,
            currentPage: searchParams?.pageIndex || 0,
            pageSize: searchParams?.pageSize || 10
          };

          console.log(' LocationService 處理後結果:', {
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

    // 支援 PageSize / pageSize 兩種大小寫
    const pageSize = searchParams?.PageSize ?? searchParams?.pageSize;
    if (pageSize !== undefined) {
      body.PageSize = pageSize;
    }

    const pageIndex = searchParams?.PageIndex ?? searchParams?.pageIndex;
    if (pageIndex !== undefined) {
      body.PageIndex = pageIndex;
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
    if (searchParams?.location_no) {
      body.location_no = searchParams.location_no;
    }

    // 時間衝突過濾條件
    if (searchParams?.tlt_bdate) {
      body.tlt_bdate = searchParams.tlt_bdate;
    }
    if (searchParams?.tlt_edate) {
      body.tlt_edate = searchParams.tlt_edate;
    }
    if (searchParams?.talent_id != null) {
      body.talent_id = searchParams.talent_id;
    }

    return body;
  }

}
