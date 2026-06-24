import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ApiMetrics, DebugToggleService } from '../../services/debug-toggle.service';

interface FlatSqlDetail {
  id: string;
  apiUrl: string;
  sql: string;
  displaySql: string;
  sqlPreview: string;
  timestamp: string;
  isFirstOfApi: boolean;
  metrics?: ApiMetrics;
}

/** SQL 語法高亮工具 - 強化版 */
const highlightSql = (sql: string): string => {
  if (!sql) return '';

  let result = sql
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const strings = /('[^']*')/g;
  const keywords = /\b(SELECT|FROM|WHERE|AND|OR|ORDER BY|GROUP BY|INSERT|UPDATE|SET|DELETE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|WITH\(NOLOCK\)|UNION|ALL|TOP|DISTINCT|IN|BETWEEN|IS|NOT|NULL|OVER|PARTITION BY|HAVING|EXISTS|CASE|WHEN|THEN|ELSE|END|INTO|VALUES|ANY|OFFSET|FETCH|NEXT|ROWS|ONLY)\b/gi;
  const functions = /\b(SUM|COUNT|MAX|MIN|AVG|CONVERT|ISNULL|COALESCE|CAST|GETDATE|DATEFROMPARTS|EOMONTH|LEFT|RIGHT|TRIM|REPLICATE|ABS|CEILING|FLOOR|ROUND|GETUTCDATE|DATEADD|DATEDIFF|DATENAME|DATEPART|ROW_NUMBER|RANK|DENSE_RANK)\b/gi;
  const variables = /(@\w+)/g;
  const numbers = /\b(\d+)\b/g;
  const operators = /([\+\-\*\/\=\!\<\>\,.;()])/g;

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
  imports: [CommonModule, ButtonModule, BadgeModule, DialogModule, TableModule],
  templateUrl: './debug-sql-display.component.html',
  styleUrl: './debug-sql-display.component.scss'
})
export class DebugSqlDisplayComponent {
  private readonly debugService = inject(DebugToggleService);
  private readonly messageService = inject(NotificationService);

  public allApiHistory = this.debugService.allSqlHistory;
  public isDebugEnabled = this.debugService.isDebugEnabled;
  public dialogVisible = signal(false);
  public filterText = signal('');
  private expandedKeys = signal(new Set<string>());

  public tableData = computed<FlatSqlDetail[]>(() => {
    const history = [...this.allApiHistory()].reverse();
    const flatData: FlatSqlDetail[] = [];

    history.forEach(entry => {
      entry.sqlData.forEach((sqlItem, index) => {
        const timeMatch = sqlItem.sql.match(/\[時間戳記\]: ([\d-:\. ]+)/);
        const timestamp = timeMatch ? timeMatch[1] : '';

        const lines = sqlItem.sql.replace(/^--.*$/gm, '').split('\n');
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

        const sqlPreview = cleanedSql.split('\n').find(l => l.trim())?.trim().slice(0, 120) ?? '';

        flatData.push({
          id: `${entry.apiUrl}__${timestamp}__${flatData.length}`,
          apiUrl: entry.apiUrl,
          sql: sqlItem.sql,
          displaySql: highlightSql(cleanedSql),
          sqlPreview,
          timestamp,
          isFirstOfApi: index === 0,
          metrics: entry.metrics
        });
      });
    });

    return flatData;
  });

  public filteredData = computed<FlatSqlDetail[]>(() => {
    const filter = this.filterText().toLowerCase().trim();
    if (!filter) return this.tableData();
    return this.tableData().filter(row =>
      row.apiUrl.toLowerCase().includes(filter) ||
      row.sql.toLowerCase().includes(filter)
    );
  });

  public sqlCount = computed(() => this.tableData().length);
  public filteredCount = computed(() => this.filteredData().length);

  toggleRow(id: string): void {
    this.expandedKeys.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  isExpanded(id: string): boolean {
    return this.expandedKeys().has(id);
  }

  expandAll(): void {
    this.expandedKeys.set(new Set(this.filteredData().map(r => r.id)));
  }

  collapseAll(): void {
    this.expandedKeys.set(new Set());
  }

  onClearHistory(): void {
    this.debugService.clearHistory();
    this.expandedKeys.set(new Set());
  }

  copySql(sql: string): void {
    if (!sql) return;
    navigator.clipboard.writeText(sql).then(() => {
      this.messageService.successBubble('SQL 語法已複製到剪貼簿');
    });
  }
}
