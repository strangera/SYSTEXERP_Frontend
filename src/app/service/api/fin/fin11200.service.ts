import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { convertYYYYMMToDate } from '@others/component/table/table.model';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SummaryData {
  GUI_YYMM: string;
  ECR_No: string;
  GUI_BegNo: string | null;
  GUI_EndNo: string | null;
  GUI_Status: string | null;
  TOT_NOS: number;
  USED_NOS: number;
  FREE_NOS: number;
}

@Injectable({
  providedIn: 'root',
})
export class Fin11200Service {
  private apiUrl: string = environment.ApiUrl + '/FIN0000/INV1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS1018 資料表 (DisplayMode 1=明細, 2=機號彙總-依機台, 3=機號彙總-依機台+連續號)
   */
  queryFIN11200(params: {
    DisplayMode?: number;
    PageSize?: number;
    PageIndex?: number;
    SortBy?: { field: string; order: number }[];
    GUI_YYMM?: string;
    ECR_NoList?: string[];
    GUI_StatusList?: string[];
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/queryFIN11200`, params).pipe(
      map((res: any) => {
        if ((params.DisplayMode ?? 1) === 1) {
          return {
            ...res,
            Data: (res.Data ?? []).map((item: any) => ({
              ...item,
              GUI_YYMM: convertYYYYMMToDate(item.GUI_YYMM)
            }))
          };
        }
        return res;
      })
    );
  }

  /**
   * 電子發票配號作業 - 配號
   */
  execProcNumber(params: {
    NumberDetails: {
      GUI_YYMM: string;
      ECR_No: string;
    }[];
  }): Observable<any> {
    console.log(params);

    return this.http.post(`${this.apiUrl}/ExecProc_Number`, params);
  }

  /**
   * 電子發票配號作業 - 下傳
   */
  execProcExport(params: {
    ExportDetails: {
      ID: number;
      STO_No: string;
      GUI_YYMM: string;
      SER_NOS: string;
    }[];
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/ExecProc_Export`, params);
  }

  /**
   * 電子發票配號作業 - 停用
   */
  execProcClosed(params: {
    ClosedDetail: {
      ID: number;
      STO_No: string;
      GUI_YYMM: string;
      SER_NOS: string;
    };
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/ExecProc_Closed`, params);
  }
}
