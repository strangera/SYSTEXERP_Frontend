import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ASS21020Data, ASS21020Delete, ASS21020Query, ASS21020Update, ASS21020UpdateStatus } from '@pages/ass/ass21020/ass21020.model';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl: string = environment.ApiUrl + '/ASS0000/ASS2000';

/** 錶號位置資訊 */
export interface ENG1001Location {
  Mid: number;
  SYS_StoreNo: string;
  ENG_Type: string;
  ENG_MeterNo: string;
  Location_No: string;
  Building_No: string;
  Building_Desc: string;
  Floor_No: string;
  Floor_Desc: string;
  Draw_X: number | null;
  Draw_Y: number | null;
  NET_SPACE: number | null;
}

/** 未設定專櫃清單 */
export interface TLTUnset {
  TLT_No: string;
  TLT_Name: string;
  TLT_bdate: string | null;
  TLT_edate: string | null;
  Water_Flag: string;
  Electric_Flag: string;
  Gas_Flag: string;
  Apply_No: string;
}

@Injectable({ providedIn: 'root' })
export class ASS21020Service {

  constructor(
    private http: HttpClient,
  ) { }

  public queryASS21020(query: ASS21020Query): Observable<BaseQueryResponse<ASS21020Data>> {
    return this.http.post<BaseQueryResponse<ASS21020Data>>(`${apiUrl}/queryASS21020`, query)
  };

  public updateASS21020(payload: ASS21020Update): Observable<ASS21020UpdateStatus> {
    return this.http.post<ASS21020UpdateStatus>(`${apiUrl}/updateASS21020`, payload)
  }

  public deleteASS21020(payload: ASS21020Delete): Observable<ASS21020UpdateStatus> {
    return this.http.post<ASS21020UpdateStatus>(`${apiUrl}/deleteASS21020`, payload)
  }
}
