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
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? [])
      );
  }

  // 位置代碼選項 - 包含自動帶入用的館別、樓層、區域資訊
  getLocationWithDetailsOptions(searchParams?: {
    building_code?: string;
    floor_code?: string;
    area_code?: string;
  }): Observable<any[]> {

    // 準備請求體
    const body: any = {};

    // 🎯 如果有搜尋參數就加入
    if (searchParams) {
      if (searchParams.building_code) {
        body.building_code = searchParams.building_code;
      }
      if (searchParams.floor_code) {
        body.floor_code = searchParams.floor_code;
      }
      if (searchParams.area_code) {
        body.area_code = searchParams.area_code;
      }
    }

    console.log('🔍 LocationService API 請求體:', body);

    return this.http
      .post<any>(`${this.apiUrl}/queryPOS2002_Location_DropDownList`, body)
      .pipe(
        map((res) => {
          console.log('📥 LocationService API 回應:', res);

          return res?.Data?.map((x: any) => ({
            label: x.location_no,           // 下拉選單顯示用
            value: x.location_no,           // 下拉選單選擇值
            location_no: x.location_no,     // 🎯 確保這個欄位存在
            tlt_building: x.tlt_building,   // 自動帶入用 - 館別
            tlt_floor: x.tlt_floor,         // 自動帶入用 - 樓層
            area_no: x.area_no,             // 自動帶入用 - 區域
            tlt_space: x.tlt_space || 0,    // 自動帶入用 - 營業面積
            building_desc: x.building_desc || '', // 館別描述
            floor_desc: x.floor_desc || '',   // 樓層描述
            area_desc: x.area_desc || ''      // 區域描述
          })) ?? [];
        }),
        catchError((error) => {
          console.error('❌ getLocationWithDetailsOptions 錯誤:', error);
          return of([]);
        })
      );
  }
}
