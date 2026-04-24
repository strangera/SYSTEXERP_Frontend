/* src/app/service/api/fin/fin13050.service.ts */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface DropDownItem {
  No: string;
  Name: string;
}

/** 後端常見的 Vendor 欄位（防禦性設計：多鍵名相容）*/
export interface VendorItem {
  Ven_No?: string;          // 供應商編號
  Vdr_No?: string;
  VEN_No?: string;

  Ven_Name?: string;        // 供應商名稱
  Vdr_Name?: string;
  VEN_Name?: string;

  Ven_Uniform?: string;     // 統一編號
  Vdr_Uniform?: string;
  VEN_Uniform?: string;
  Uniform?: string;
}

export interface VendorNoOption {
  label: string;     // ex: "000123 台灣某某股份有限公司"
  value: string;     // VEN_No
  venName?: string;  // VEN_Name
  venUniform?: string; // VEN_Uniform
}

/** 統一編號下拉用（可直接回填 VenNo/VenName） */
export interface VendorOption {
  label: string;     // 顯示「統編 名稱」
  value: string;     // VEN_Uniform（統編）
  venNo?: string;    // VEN_No
  venName?: string;  // VEN_Name
  venUniform?: string; // VEN_Uniform
}

@Injectable({ providedIn: 'root' })
export class FIN13050Service {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
  ) { }

  // ✅ 查詢（對齊後端；不傳 Offset、OrderBy）
  queryFIN13050(query: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/queryFIN13050`, query)
  }

  // ✅ 新增
  insertFIN13050(data: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/insertFIN13050`, data)
  }

  // ✅ 更新
  updateFIN13050(data: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/updateFIN13050`, data)
  }

  // ✅ 明細/對應（若你仍需要）
  queryDetailByGUI(param: { GUI_No: string }): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/queryFIN13050Detail`, param)
  }

  queryCorrespondByGUI(param: { GUI_Correspond: string }): Observable<any> {
    return this.http
      .post<any>(
        `${this.apiUrl}/FIN0000/INV1000/queryFIN13050Correspond`,
        param
      )
  }

  deleteFIN13050(idList: number[]): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/deleteFIN13050`, { idList })
  }

  // ✅ SYS1000 下拉欄位（依 SYS_Type）
  querySYS1000DropDownList(sysType: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/querySYS1000_DropDownList`, {
        SYS_Type: sysType,
      })
  }

  queryAPS2002DropDownList(): Observable<ApiResponse<DropDownItem[]>> {
    // 如果你的後端是 GET，改成 this.http.get<ApiResponse<DropDownItem[]>>(`${this.apiUrl}/queryAPS2002_DropDownList`);
    return this.http
      .post<ApiResponse<DropDownItem[]>>(`${this.apiUrl}/queryAPS2002_DropDownList`, {})
  }

  /** 取得供應商清單（用於統一編號下拉）。可接受 keyword 做伺服端過濾（可選）。 */
  queryVendorList(payload: { keyword?: string } = {}): Observable<ApiResponse<VendorItem[]>> {
    return this.http
      .post<ApiResponse<VendorItem[]>>(
        `${this.apiUrl}/FIN0000/GLS1000/queryVendorList`,
        payload ?? {}
      )
  }

  /** 便利：直接回傳 dropdown 需要的 {label,value,venNo,venName,venUniform}[]，value=統編，label=「統編 名稱」 */
  queryVendorUniformOptions(keyword = ''): Observable<VendorOption[]> {
    return this.queryVendorList(keyword ? { keyword } : {})
      .pipe(
        map(res => {
          const list = Array.isArray(res?.Data) ? res.Data : [];
          // 去重、過濾空值、統編需為 8 位數字，轉換為 VendorOption
          const seen = new Set<string>();
          const options: VendorOption[] = [];
          for (const v of list) {
            const venNo = v.VEN_No ?? v.Ven_No ?? v.Vdr_No ?? '';
            const venName = v.VEN_Name ?? v.Ven_Name ?? v.Vdr_Name ?? '';
            const venUniformRaw = v.VEN_Uniform ?? v.Ven_Uniform ?? v.Vdr_Uniform ?? v.Uniform ?? '';
            const venUniform = String(venUniformRaw ?? '').trim();
            if (!/^\d{8}$/.test(venUniform) || seen.has(venUniform)) continue;
            seen.add(venUniform);
            options.push({
              label: venName ? `${venUniform} ${venName}` : venUniform,
              value: venUniform,
              venNo,
              venName,
              venUniform,
            });
          }
          // 依 label 排序（可改依 value）
          options.sort((a, b) => a.label.localeCompare(b.label));
          return options;
        })
      );
  }
  /** 查詢 TDS1003 資料表（取得 STO_Uniform 等門市資訊） */
  queryFIN11010(params: { STO_StatusList?: string[] } = {}): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/queryFIN11010`, params)
  }

  queryVendorNoOptions(keyword = ''): Observable<VendorNoOption[]> {
    return this.queryVendorList(keyword ? { keyword } : {})
      .pipe(
        map(res => {
          const list = Array.isArray(res?.Data) ? res.Data : [];
          const seen = new Set<string>();
          const options: VendorNoOption[] = [];
          for (const v of list) {
            const no = (v.VEN_No ?? '').toString().trim();
            const name = (v.VEN_Name ?? '').toString().trim();
            const uni = (v.VEN_Uniform ?? '').toString().trim();
            if (!no || seen.has(no)) continue;
            seen.add(no);
            options.push({
              label: name ? `${no} ${name}` : no,
              value: no,
              venName: name,
              venUniform: uni,
            });
          }
          options.sort((a, b) => a.label.localeCompare(b.label));
          return options;
        })
      );
  }
}
