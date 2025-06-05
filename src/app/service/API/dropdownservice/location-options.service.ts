import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';
import { map, Observable } from 'rxjs';
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
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? [])
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
  getLocationWithDetailsOptions(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/queryPOS2002_Location_DropDownList`, {})
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({
          label: x.No,           // 下拉選單顯示用
          value: x.No,           // 下拉選單選擇值
          buildingNo: x.BuildingNo,  // 自動帶入用 - 館別
          floorNo: x.FloorNo,        // 自動帶入用 - 樓層
          areaNo: x.AreaNo           // 自動帶入用 - 區域
        })) ?? [])
      );
  }
}
