import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { environment } from 'src/environments/environment';

export interface TLS32020QueryRequest {
  reportType: string;
  // 基準日期
  BaseDateFrom: string | null;
  BaseDateTo: string | null;
  // 比較日期
  CompareDateFrom: string | null;
  CompareDateTo: string | null;
  FloorList: string | null;
  AreaList: string | null;
  BusTypeList: string | null;
  BusClassList: string | null;
  CabinetKindList: string | null;
  TermTypeList: string | null;
  OrgList: string | null;
  TltNoList: string | null;
  AuditoriumList: string | null; // 新增：館別
  TaxFlag: string;
  isOwnerInvoice: string; // 新增：是否開立業主發票
}

export interface TLS32020Data {
  SeqNo: number,
  YM: string,
  Building: string,
  BuildingName: string,
  BaseTarget: number,
  BaseSale: number,
  BaseAchieveRate: number,
  BaseTxnCnt: number,
  BaseTicket: number,
  CompareSale: number,
  CompareTxnCnt: number,
  CompareTicket: number,
  DiffAmt: number,
  GrowthRate: number,
  DiffTxn: number,
  DiffTicket: number
}

@Injectable({
  providedIn: 'root'
})
export class TLS32020Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';

  constructor(private http: HttpClient) { }

  queryTLS32020(body: TLS32020QueryRequest) {
    return this.http.post<BaseQueryResponse<TLS32020Data>>(this.apiUrl + '/queryTLS32020', body);
  }
  // 模擬匯出方法
  exportTLS32020PDF(body: TLS32020QueryRequest) { return { pipe: (cb: any) => cb(new Blob()) } as any; }
  exportTLS32020Excel(body: TLS32020QueryRequest) { return { pipe: (cb: any) => cb(new Blob()) } as any; }
}
