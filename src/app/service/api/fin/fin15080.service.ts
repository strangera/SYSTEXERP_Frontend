import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FIN15080Service {
  constructor(private http: HttpClient) {}

  /** 列印 FIN15080 */
  printFIN15080(data: {
    Mid: number;
    STO_No: string;
    REP_GUIYM: string;
    REP_TaxNo: string;
  }): Observable<any> {
    const url = `${environment.ApiUrl}/FIN0000/INV1000/PrintFIN15080`;
    return this.http.post<any>(url, data);
  }

  /**
   * 稅籍下拉（依門市）
   * API: /Share/queryTDS1003_STO_TaxNo_DropDownList
   * req: { mid: number, STO_No: string }
   * res.Data[0].TDS1003STO_TaxNos: [{ STO_TaxNo, STO_No, STO_TaxName, ... }]
   * 這裡直接把 STO_TaxName → label、STO_TaxNo → value 對應好
   */
getStoTaxNoOptions(req: { mid: number; STO_No: string }): Observable<
   Array<{
    label: string;
    value: string;
    REP_BegGUIYM?: string;
    REP_EndGUIYM?: string;
    STO_No?: string;
    STO_Status?: string;   // ⬅️ 新增
  }>
> {
  const url = `${environment.ApiUrl}/Share/queryTDS1003_STO_TaxNo_DropDownList`;
  return this.http.post<any>(url, req).pipe(
    map((res) => {
      const rows = res?.Data?.TDS1003STO_TaxNos ?? [];
      return rows.map((x: any) => ({
        label: x?.STO_TaxName ?? '',     // 給 app-multi-select 顯示
        value: x?.STO_TaxNo ?? '',       // 給 app-multi-select 值
        // ↓ 這些是方便你之後要用期間或其他欄位時可存放的附加資訊
        REP_BegGUIYM: x?.REP_BegGUIYM ?? '',
        REP_EndGUIYM: x?.REP_EndGUIYM ?? '',
        STO_No: x?.STO_No ?? '',
        STO_Status: x?.STO_Status ?? '', // ⬅️ 把狀態一起存起來
        
      }));
    })
  );
}
}
