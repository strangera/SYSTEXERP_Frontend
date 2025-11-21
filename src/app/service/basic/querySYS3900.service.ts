import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FloorService {
  apiUrl: string = environment.ApiUrl;
  title = '樓層';

  constructor(
    private http: HttpClient,
  ) { }

  getFloors(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/querySYS3900_DropDownList`, {})
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? []),
      );
  }

  // 查詢 APS1003 的下拉資料
  getAPS1003DropDownList(cap_typeList: string[]): Observable<any[]> {
    return this.http.post<any>(
      `${this.apiUrl}/queryTLS13030_APS1003_DropDownList`,
      { cap_typeList }
    ).pipe(
      map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? []),
    );
  }
}
