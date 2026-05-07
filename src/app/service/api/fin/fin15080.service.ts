import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FIN15080Service {
  constructor(private http: HttpClient) { }

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
    {
      label: string;
      value: string;       // 唯一 key（避免相同 STO_TaxNo 被視為同一筆）
      REP_BegGUIYM?: string;
      REP_EndGUIYM?: string;
      STO_No?: string;
      STO_Status?: string;
      STO_TaxNo?: string;  // ⬅️ 真正的稅籍編號另外存
      STO_TaxName?: string;
    }[]
  > {
    const url = `${environment.ApiUrl}/Share/queryTDS1003_STO_TaxNo_DropDownList`;
    return this.http.post<any>(url, req).pipe(
      map((res) => {
        const rows = res?.Data?.TDS1003STO_TaxNos ?? [];
        return rows.map((x: any) => {
          const taxNo = x?.STO_TaxNo ?? '';
          const taxName = x?.STO_TaxName ?? '';
          const beg = x?.REP_BegGUIYM ?? '';
          const end = x?.REP_EndGUIYM ?? '';
          const period = beg
            ? `${beg}~${end || ''}` // end 空就顯示成 201412~
            : '';

          // 顯示文字：STO_TaxNo/STO_TaxName/REP_BegGUIYM~REP_EndGUIYM
          // 例如：703902223/南紡流通事業股份有限公司/202012~
          const label = `${taxNo}-${taxName}`;

          // value 做成唯一 key，避免相同 STO_TaxNo 被視為同一筆
          // 例如：703902223_202012_
          const uniqueValue = `${taxNo}_${beg}_${end}`;

          return {
            label,
            value: uniqueValue,
            REP_BegGUIYM: beg,
            REP_EndGUIYM: end,
            STO_No: x?.STO_No ?? '',
            STO_Status: x?.STO_Status ?? '',
            STO_TaxNo: taxNo,   // 真正稅籍編號留在這裡，送報表時用
            STO_TaxName: taxName,
          };
        });
      })
    );
  }

}
