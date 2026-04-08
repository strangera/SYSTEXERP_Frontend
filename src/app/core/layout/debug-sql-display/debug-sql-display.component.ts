import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TableModule } from 'primeng/table';
import { DebugToggleService } from '../../services/debug-toggle.service';

interface FlatSqlDetail {
  apiUrl: string;
  sql: string;
  displaySql: string;
  timestamp: string;
}

/** SQL 語法高亮工具 - 強化版 */
const highlightSql = (sql: string): string => {
  if (!sql) return '';

  // 1. 先處理基礎 HTML 轉義，避免 SQL 裡的 < > 影響渲染
  let result = sql
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 2. 定義匹配規則
  const strings = /('[^']*')/g;
  const keywords = /\b(SELECT|FROM|WHERE|AND|OR|ORDER BY|GROUP BY|INSERT|UPDATE|SET|DELETE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|WITH\(NOLOCK\)|UNION|ALL|TOP|DISTINCT|IN|BETWEEN|IS|NOT|NULL|OVER|PARTITION BY|HAVING|EXISTS|CASE|WHEN|THEN|ELSE|END|INTO|VALUES|ANY|OFFSET|FETCH|NEXT|ROWS|ONLY)\b/gi;
  const functions = /\b(SUM|COUNT|MAX|MIN|AVG|CONVERT|ISNULL|COALESCE|CAST|GETDATE|DATEFROMPARTS|EOMONTH|LEFT|RIGHT|TRIM|REPLICATE|ABS|CEILING|FLOOR|ROUND|GETUTCDATE|DATEADD|DATEDIFF|DATENAME|DATEPART|ROW_NUMBER|RANK|DENSE_RANK)\b/gi;
  const variables = /(@\w+)/g;
  const numbers = /\b(\d+)\b/g;
  // 修正：Operators 不要動到 <span> 的關鍵字，我們改用簡單的顏色區分
  const operators = /([\+\-\*\/\=\!\<\>\,.;()])/g;

  // 3. 執行取代 (順序很重要)
  // 先把符號包起來，但後續的 replace 會把標籤內的內容再包一層，這沒關係
  result = result.replace(operators, '<span class="sql-op">$1</span>');
  result = result.replace(strings, '<span class="sql-string">$1</span>');
  result = result.replace(keywords, '<span class="sql-keyword">$1</span>');
  result = result.replace(functions, '<span class="sql-func">$1</span>');
  result = result.replace(variables, '<span class="sql-var">$1</span>');
  result = result.replace(numbers, '<span class="sql-num">$1</span>');

  return result;
};

@Component({
  selector: 'app-debug-sql-display',
  standalone: true,
  imports: [CommonModule, ButtonModule, BadgeModule, OverlayPanelModule, TableModule, ScrollPanelModule],
  templateUrl: './debug-sql-display.component.html',
  styleUrl: './debug-sql-display.component.scss'
})
export class DebugSqlDisplayComponent {
  private readonly debugService = inject(DebugToggleService);
  private messageService = inject(NotificationService);

  public allApiHistory = this.debugService.allSqlHistory;
  public isDebugEnabled = this.debugService.isDebugEnabled;

  public tableData = computed<FlatSqlDetail[]>(() => {
    const history = this.allApiHistory();
    const flatData: FlatSqlDetail[] = [];

    history.forEach(entry => {
      entry.sqlData.forEach(sqlItem => {
        // 提取時間
        const timeMatch = sqlItem.sql.match(/\[時間戳記\]: ([\d-:\. ]+)/);
        const timestamp = timeMatch ? timeMatch[1] : '';

        // 1. 清理：移除註解
        const lines = sqlItem.sql.replace(/^--.*$/gm, '').split('\n');

        // 2. 縮排優化 (Dedent)
        const minIndent = lines
          .filter(l => l.trim().length > 0)
          .reduce((min, line) => {
            const match = line.match(/^(\s*)/);
            return match ? Math.min(min, match[1].length) : min;
          }, Infinity);

        const cleanedSql = lines
          .map(line => line.substring(minIndent === Infinity ? 0 : minIndent))
          .join('\n')
          .trim();

        // 3. 套用語法高亮
        const displaySql = highlightSql(cleanedSql);

        flatData.push({
          apiUrl: entry.apiUrl,
          sql: sqlItem.sql,
          displaySql: displaySql,
          timestamp: timestamp
        });
      });
    });
    return flatData.reverse();
  });

  public sqlCount = computed(() => this.tableData().length);

  onToggle(event: Event, op: any): void {
    op.toggle(event);
  }

  onClearHistory(): void {
    this.debugService.clearHistory();
  }

  copySql(sql: string): void {
    if (!sql) return;
    navigator.clipboard.writeText(sql).then(() => {
      this.messageService.successBubble('SQL 語法已複製到剪貼簿');
    });
  }
}
