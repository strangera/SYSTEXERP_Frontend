import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { TLS2A030Service } from '../../../service/api/tls/tls2a030.service';
import { formatAmount } from '../../../shared/components/table-report/table-report.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { DayGroup, DayPayToolRow, DayTotal, TLS2A030ByDayState } from './tls2a030-byday.model';

@Component({
  selector: 'app-tls2a030-byday',
  standalone: true,
  templateUrl: './tls2a030-byday.component.html',
  imports: [CommonModule, MenubarComponent, ButtonComponent, AccordionModule, TranslateModule],
})
export class TLS2A030ByDayComponent extends BasicQueryPageComponent<DayPayToolRow> implements OnInit {
  private readonly service = inject(TLS2A030Service);
  private readonly destroyRef = inject(DestroyRef);

  readonly formatAmount = formatAmount;

  dayGroups: DayGroup[] = [];
  totalData: DayTotal | null = null;
  queryContext: TLS2A030ByDayState | null = null;
  loaded = false;

  ngOnInit(): void {
    this.initializePage('TLS2A030');

    const state = this.router.lastSuccessfulNavigation?.extras.state as TLS2A030ByDayState | undefined;
    if (!state?.SaleDateStart || !state?.SaleDateEnd) {
      this.messageService.warnBubble('缺少查詢日期區間，請由溢欠彙總表重新進入。');
      return;
    }
    this.queryContext = state;
    this.loadData();
  }

  private loadData(): void {
    if (!this.queryContext) return;
    this.loading = true;
    this.service.queryTLS2A030_ByDay({
      SaleDateStart: this.queryContext.SaleDateStart,
      SaleDateEnd: this.queryContext.SaleDateEnd,
      ECR_No_Start: this.queryContext.ECR_No_Start,
      ECR_No_End: this.queryContext.ECR_No_End,
      PageSize: 999999,
      PageIndex: 1,
      SortBy: [],
    }).pipe(
      this.withLoading(() => (this.loaded = true)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(res => {
      const groups: DayGroup[] = res?.Data?.QueryData ?? [];
      // 後端 TXN_Date 型別是 string，由 Dapper 依伺服器當地文化(zh-TW)把 DateTime 轉成
      // 「2026/5/1 上午 12:00:00」這種格式，不是 ISO；這裡統一轉成 yyyy-MM-dd 再往下用，
      // 避免把伺服器語系格式原封不動送回後端當 SaleDate 解析失敗。
      this.dayGroups = groups.map(g => ({ ...g, TXN_Date: this.toIsoDate(g.TXN_Date) }));
      this.totalData = res?.Data?.payAmtTotalData ?? null;
    });
  }

  /** 把「2026/5/1 上午 12:00:00」或已是 ISO 格式的日期字串，統一轉成 yyyy-MM-dd */
  private toIsoDate(raw: string): string {
    if (!raw) return raw;
    const zhTwMatch = /^(\d{4})\/(\d{1,2})\/(\d{1,2})/.exec(raw);
    if (zhTwMatch) {
      const [, y, m, d] = zhTwMatch;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    const parsed = new Date(raw);
    if (isNaN(parsed.getTime())) return raw;
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
  }

  onSelectPayTool(day: DayGroup, row: DayPayToolRow): void {
    if (!this.queryContext) return;
    this.router.navigate(['/account/tls/tls2a030bydayandpayno'], {
      state: {
        TXN_Date: day.TXN_Date,
        PAY_NO: row.PAY_NO,
        PAY_NAME: row.PAY_NAME,
        ECR_No_Start: this.queryContext.ECR_No_Start,
        ECR_No_End: this.queryContext.ECR_No_End,
        SaleDateStart: this.queryContext.SaleDateStart,
        SaleDateEnd: this.queryContext.SaleDateEnd,
        fromRoute: this.router.url,
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/account/tls/tls2a030'], { state: { fromRoute: this.router.url } });
  }

  compareLabel(v: string): string {
    return v === 'O' ? '〇' : '✖';
  }
}
