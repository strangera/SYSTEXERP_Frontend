import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BaseQueryResponse } from '../../../shared/models/api/base-api.interface';
import { ErrorHandlerService } from '../../system/error-handler.service';

interface Data {
  No: string;
  Name: string;
}

/**
 * @description
 * data_type: 1: 讀取收銀機主檔中統收機台, 2:讀取預購活動主檔中的收銀機台
 * building_no: 館別編號
 * floor_no: 樓層編號
 */
export interface PreorderECRListQuery {
  data_type: string;
  building_no: string[];
  floor_no: string[];
}

/**
 * @description
 * data_type: '1' 讀取收銀機主檔中統收機台, '2' 讀取預購活動主檔中的收銀機台
 * building_no: 館別編號
 * floor_no: 樓層編號
 */
export interface TLTTALENTQuery {
  building_no: string[];
  floor_no: string[];
}

/**
 * @description
 * tlt_id: 專櫃ID
 * tlt_no: 專櫃編號
 * tlt_name: 專櫃名稱
 */
export interface TLTTALENT {
  talent_id: number;
  tlt_no: string;
  tlt_name: string;
}

@Injectable({ providedIn: 'root' })
export class TLS26010Service {
  apiUrl: string = environment.ApiUrl;

  // 儲存資料
  private sys3800Data = signal<Data[]>([]);
  private sys3900Data = signal<Data[]>([]);
  private preorderECRData = signal<Data[]>([]);
  private TLTTALENTData = signal<TLTTALENT[]>([]);

  // 資料轉為 dropdown 格式
  readonly sys3800List = computed(() =>
    this.sys3800Data().map(item => ({
      label: item.Name || '',
      value: item.No || ''
    }))
  );

  readonly sys3900List = computed(() =>
    this.sys3900Data().map(item => ({
      label: item.Name || '',
      value: item.No || ''
    }))
  );

  readonly preorderECRList = computed(() =>
    this.preorderECRData().map(item => ({
      label: item.Name,
      value: item.No
    }))
  );

  readonly TLTTALENTList = computed(() =>
    this.TLTTALENTData().map(item => ({
      label: item.tlt_name,
      value: item.tlt_no
    }))
  );

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // 取得管別
  loadSYS3800(query: any): void {
    this.http.post<BaseQueryResponse<Data>>(`${this.apiUrl}/querySYS3800_DropDownList`, query).pipe(
      tap(response => this.sys3800Data.set(response.Data)),
      catchError((error) => this.errorHandler.handleError(error)),
      finalize(() => console.log('管別查詢結果:', this.sys3800Data()))
    ).subscribe();
  }

  // 取得管別
  loadSYS3900(query: any): void {
    this.http.post<BaseQueryResponse<Data>>(`${this.apiUrl}/querySYS3900_DropDownList`, query).pipe(
      tap(response => this.sys3900Data.set(response.Data)),
      catchError((error) => this.errorHandler.handleError(error)),
      finalize(() => console.log('樓層查詢結果:', this.sys3900Data()))
    ).subscribe();
  }

  // 取得收銀機號
  loadPreorderECRList(query: PreorderECRListQuery): void {
    this.http.post<BaseQueryResponse<Data>>(`${this.apiUrl}/queryPreorderECR_List`, query).pipe(
      tap(response => this.preorderECRData.set(response.Data)),
      catchError((error) => this.errorHandler.handleError(error)),
      finalize(() => console.log('收銀機號查詢結果:', this.preorderECRData()))
    ).subscribe();
  }

  // 取得專櫃編號
  loadTLTTALENT(query: TLTTALENTQuery): void {
    this.http.post<BaseQueryResponse<TLTTALENT>>(`${this.apiUrl}/queryTLTTALENT_DropDownList`, query).pipe(
      tap(response => this.TLTTALENTData.set(response.Data)),
      catchError((error) => this.errorHandler.handleError(error)),
      finalize(() => console.log('專櫃編號查詢結果:', this.TLTTALENTData()))
    ).subscribe();
  }

  // queryTLS26010
  // insertTLS26010
  // updateTLS26010
  // deleteTLS26010
  // approvalTLS26010
  // disapprovalTLS26010
  // importTLS26010
}
