import { Injectable } from '@angular/core';
import { TableQueryPayload } from '../table-report.model';

@Injectable()
export class TableReportDataFlowService {
  /**
   * 規範並格式化分頁請求的 Body 結構（純資料清洗）
   */
  public normalizeQueryBody(body: any) {
    if (!body) return body;
    const pageSize = body.pageSize ?? body.PageSize ?? 30;
    const pageIndex = body.pageIndex ?? body.PageIndex ?? 1;
    const { PageSize, PageIndex, pageSize: _pageSize, pageIndex: _pageIndex, ...rest } = body;
    // 大小寫兩種欄位都同步成同一組值，避免呼叫端只認其中一種大小寫時拿到沒更新過的舊值（見 loadMoreData/onSort 一直重打第一頁）
    return { ...rest, pageSize, pageIndex, PageSize: pageSize, PageIndex: pageIndex };
  }

  /**
   * 純前端自訂排序核心算法（不干涉元件狀態，純回傳排序後的陣列）
   */
  public executeClientSort(event: TableQueryPayload, data: any[]): any[] {
    if (!event.multiSortMeta) return data;
    const sortedData = [...data];
    sortedData.sort((data1, data2) => {
      for (const sortMeta of event.multiSortMeta) {
        const value1 = data1[sortMeta.field];
        const value2 = data2[sortMeta.field];
        let result = 0;
        if (value1 == null && value2 != null) result = -1;
        else if (value1 != null && value2 == null) result = 1;
        else if (value1 == null && value2 == null) { /* 兩者皆為 null，result 維持初始值 0 */ }
        else if (typeof value1 === 'string' && typeof value2 === 'string')
          result = value1.localeCompare(value2, undefined, { numeric: true, sensitivity: 'base' });
        else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

        if (result !== 0) return sortMeta.order * result;
      }
      return 0;
    });
    return sortedData;
  }
}
