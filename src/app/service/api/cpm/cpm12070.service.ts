import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SortMeta } from 'primeng/api';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../fin/fin26010.service'; // 延用專案定義

/** 查詢與報表請求介面 */
export interface CPM12070Request {
  KIND_IDs?: string;       // 類別多選 (逗號分隔)
  DATE_FROM?: string;      // 查詢起始日期
  DATE_TO?: string;        // 查詢結束日期
  PageIndex: number;
  PageSize: number;
  SortBy: SortMeta[];
}

/** 查詢回傳單筆資料介面 */
export interface CPM12070Response {
  RowNum: number;
  KIND_ID: string;
  KIND_Name: string;
  TotalCount: number;
  DoneCount: number;
  PendingCount: number;
}

/** 矩陣預覽請求介面 (統計表：月份矩陣) */
export interface CPM12070MatrixRequest {
  KIND_IDs?: string;
  CLASS_IDs?: string; // 責任單位多選 (逗號分隔)
  DATE_FROM?: string;
  DATE_TO?: string;
}

/** 矩陣預覽欄 (責任單位) */
export interface CPM12070MatrixColumn {
  CLASS_ID: string;
  CLASS_NAME: string;
}

/** 矩陣預覽列 (月份或總計) */
export interface CPM12070MatrixRow {
  Label: string;
  IsTotal: boolean;
  Cells: { [classId: string]: number };
}

/** 矩陣預覽回傳介面 */
export interface CPM12070MatrixResponse {
  Columns: CPM12070MatrixColumn[];
  Rows: CPM12070MatrixRow[];
}

@Injectable({
  providedIn: 'root'
})
export class Cpm12070Service {
  private apiUrl = `${environment.ApiUrl}/CPM0000/CPM1000`;

  constructor(private http: HttpClient) { }

  /** 查詢統計資料 */
  queryCPM12070(body: CPM12070Request): Observable<any> {
    return this.http.post<ApiResponse<CPM12070Response[]>>(`${this.apiUrl}/queryCPM12070`, body).pipe(
      map(res => {
        return {
          Data: res.Data,
          TotalCount: res.TotalCount,
          TotalPage: res.TotalPage,
          Message: res.Message
        };
      })
    );
  }

  /** 統計表矩陣預覽 (欄=責任單位，列=月份+總計) */
  queryCPM12070Matrix(body: CPM12070MatrixRequest): Observable<CPM12070MatrixResponse> {
    return this.http.post<ApiResponse<CPM12070MatrixResponse>>(`${this.apiUrl}/queryCPM12070Matrix`, body).pipe(
      map(res => res.Data)
    );
  }

  /** 明細表(逐日)矩陣預覽 (欄=責任單位，列=日期+總計) */
  queryCPM12070DetailMatrix(body: CPM12070MatrixRequest): Observable<CPM12070MatrixResponse> {
    return this.http.post<ApiResponse<CPM12070MatrixResponse>>(`${this.apiUrl}/queryCPM12070DetailMatrix`, body).pipe(
      map(res => res.Data)
    );
  }

  /** 統計表矩陣匯出 Excel */
  exportCPM12070MatrixExcel(body: CPM12070MatrixRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportCPM12070MatrixExcel`, body, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  /** 明細表(逐日)矩陣匯出 Excel */
  exportCPM12070DetailMatrixExcel(body: CPM12070MatrixRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportCPM12070DetailMatrixExcel`, body, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  /** 統計表矩陣匯出 PDF (單層表頭) */
  exportCPM12070MatrixPdf(body: CPM12070MatrixRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportCPM12070MatrixPdf`, body, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  /** 明細表(逐日)矩陣匯出 PDF (單層表頭) */
  exportCPM12070DetailMatrixPdf(body: CPM12070MatrixRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportCPM12070DetailMatrixPdf`, body, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
