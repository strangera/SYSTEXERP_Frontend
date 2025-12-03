import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';

// PrimeNG 模組
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TableModule } from 'primeng/table';

// 匯入新的型別 ApiSqlHistoryEntry
import { DebugToggleService } from '../../services/debug-toggle.service';


/** 新增一個扁平化後的型別，供表格使用 */
interface FlatSqlDetail {
  apiUrl: string;
  sql: string;
  // timestamp: Date; // 可選：如果需要顯示時間
}

@Component({
  selector: 'app-debug-sql-display',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    BadgeModule,
    OverlayPanelModule,
    TableModule,
    ScrollPanelModule
  ],
  templateUrl: './debug-sql-display.component.html',
  styleUrl: './debug-sql-display.component.scss'
})
export class DebugSqlDisplayComponent {

  private readonly debugService = inject(DebugToggleService);

  // 1. 取得累積的 SQL 歷史記錄 (ApiSqlHistoryEntry[])
  public allApiHistory = this.debugService.allSqlHistory;

  // 修正處：tableData 現在是將 ApiSqlHistoryEntry[] 扁平化並排序的結果
  public tableData = computed<FlatSqlDetail[]>(() => {
    const history = this.allApiHistory();

    // 1. 扁平化數據：將 ApiSqlHistoryEntry[] 轉換為 FlatSqlDetail[]
    const flatData: FlatSqlDetail[] = [];
    history.forEach(entry => {
      // 針對該 API 呼叫產生的每條 SQL 語法，都建立一條包含 apiUrl 的記錄
      entry.sqlData.forEach(sqlItem => {
        flatData.push({
          apiUrl: entry.apiUrl,
          sql: sqlItem.sql,
          // timestamp: entry.timestamp // 如果需要
        });
      });
    });

    // 2. 反轉排序：確保最新的記錄在最上方
    return flatData.reverse();
  });


  // 修正處：sqlCount 現在計算扁平化後（即所有單條 SQL）的總筆數
  public sqlCount = computed(() => this.tableData().length);


  // 3. 判斷除錯開關狀態
  public isDebugEnabled = this.debugService.isDebugEnabled;


  /**
   * 當點擊按鈕，準備開啟 OverlayPanel 時觸發。
   * @param op OverlayPanel 實例
   */
  onToggle(event: Event, op: any): void {
    op.toggle(event);
  }
  /**
     * 新增功能：手動清除所有歷史記錄
     */
  onClearHistory(): void {
    this.debugService.clearHistory();
  }
  /**
   * 當點擊表格中的列時，複製 SQL 語法到剪貼簿
   * @param sqlDetail 選中的 SQL 記錄 (現在是 FlatSqlDetail)
   */
  onRowSelect(event: any): void {
    // 由於 FlatSqlDetail 包含 sql 屬性，這裡的邏輯可以保持不變
    const sqlDetail: FlatSqlDetail = event.data;
    if (sqlDetail && sqlDetail.sql) {
      navigator.clipboard.writeText(sqlDetail.sql)
        .then(() => {
          console.log('SQL 語法已複製到剪貼簿:', sqlDetail.sql);
          // 這裡可以加入一個 PrimeNG Toast/Message 來通知使用者
        })
        .catch(err => {
          console.error('複製失敗:', err);
        });
    }
  }

}
