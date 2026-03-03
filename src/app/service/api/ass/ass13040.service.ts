import { Injectable } from '@angular/core';
import { ASS13040QueryRequest, ASS13040QueryRow } from '@pages/ass/ass13040/ass13040.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ASS13040Service {
  /**
   * API 規格尚未提供，先用可替換的查詢介面與暫代資料。
   * 後續只需替換此方法內部實作，不影響頁面呼叫端。
   */
  queryASS13040(body: ASS13040QueryRequest): Observable<ApiResponse<ASS13040QueryRow[]>> {
    const allRows = this.getMockRows();
    const filtered = allRows.filter(row => {
      if (body.SCRAP_FORM_NO && !row.SCRAP_FORM_NO.includes(body.SCRAP_FORM_NO)) return false;
      if (body.ITEM_NO && row.ITEM_NO !== body.ITEM_NO) return false;
      if (body.SCRAP_USER_NO && row.SCRAP_USER_NO !== body.SCRAP_USER_NO) return false;
      if (body.ORG_ID && row.ORG_ID !== body.ORG_ID) return false;
      if (body.SCRAP_STATUS && row.SCRAP_STATUS !== body.SCRAP_STATUS) return false;
      if (body.APPLY_DATE_S && row.APPLY_DATE < body.APPLY_DATE_S) return false;
      if (body.APPLY_DATE_E && row.APPLY_DATE > body.APPLY_DATE_E) return false;
      return true;
    });

    const pageSize = body.PageSize ?? 30;
    const pageIndex = body.PageIndex ?? 1;
    const start = (pageIndex - 1) * pageSize;
    const end = start + pageSize;
    const pageData = filtered.slice(start, end);
    const totalCount = filtered.length;
    const totalPage = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize);

    return of({
      Status: '0000',
      Data: pageData,
      Error: null,
      Meta: {
        Timestamp: new Date().toISOString(),
        RequestId: 'ASS13040-MOCK',
      },
      Message: 'OK',
      TotalCount: totalCount,
      TotalPage: totalPage,
    });
  }

  private getMockRows(): ASS13040QueryRow[] {
    return [
      {
        SCRAP_FORM_NO: 'SC24030001',
        ITEM_NO: 'FA0001',
        SCRAP_USER_NO: 'U001',
        ORG_ID: 'D001',
        APPLY_DATE: '2026-03-01',
        SCRAP_STATUS: '10',
        REMARK: '測試資料-1',
      },
      {
        SCRAP_FORM_NO: 'SC24030002',
        ITEM_NO: 'FA0002',
        SCRAP_USER_NO: 'U002',
        ORG_ID: 'D002',
        APPLY_DATE: '2026-03-02',
        SCRAP_STATUS: '20',
        REMARK: '測試資料-2',
      },
      {
        SCRAP_FORM_NO: 'SC24030003',
        ITEM_NO: 'FA0003',
        SCRAP_USER_NO: 'U003',
        ORG_ID: 'D003',
        APPLY_DATE: '2026-03-03',
        SCRAP_STATUS: '30',
        REMARK: '測試資料-3',
      },
    ];
  }
}
