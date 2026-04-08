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

/** SQL 語法高亮工具 */
const highlightSql = (sql: string): string => {
  if (!sql) return '';
  const keywords = /\b(SELECT|FROM|WHERE|AND|OR|ORDER BY|GROUP BY|INSERT|UPDATE|SET|DELETE|JOIN|LEFT|INNER|OUTER|ON|AS|WITH\(NOLOCK\)|UNION|ALL|TOP|DISTINCT|IN|BETWEEN|IS|NOT|NULL|OVER|PARTITION BY)\b/gi;
  const functions = /\b(SUM|COUNT|MAX|MIN|AVG|CONVERT|ISNULL|COALESCE|CAST|GETDATE|DATEFROMPARTS|EOMONTH|LEFT|RIGHT|TRIM|REPLICATE)\b/gi;
  const strings = /('[^']*')/g;
  const numbers = /\b(\d+)\b/g;

  return sql
    .replace(strings, '<span class="sql-string">$1</span>')
    .replace(keywords, '<span class="sql-keyword">$1</span>')
    .replace(functions, '<span class="sql-func">$1</span>')
    .replace(numbers, '<span class="sql-num">$1</span>');
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
