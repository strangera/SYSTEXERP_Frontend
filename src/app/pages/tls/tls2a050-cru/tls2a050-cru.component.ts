import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import { QueryTLS22050Response, Tls22050Service } from 'src/app/service/api/tls/tls22050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

interface ParentQueryRow {
  TXN_Date: string | null;
}

interface DetailRow {
  PAY_Name: string;
  ECR_No: string | null;
  TXN_No: number | null;
  BOOK_PayAmt: number;
  ACT_PayAmt: number;
  OVER_PayAmt: number;
  isTotal: boolean;
  rowspan: number;
}

@Component({
  selector: 'app-tls2a050-cru',
  templateUrl: './tls2a050-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    TranslateModule,
    TableModule,
    DecimalPipe,
  ],
})
export class TLS2A050CRUComponent extends BasicCruPageComponent<ParentQueryRow> implements OnInit {
  private readonly tls22050Service = inject(Tls22050Service);
  private readonly destroyRef = inject(DestroyRef);

  txnDate: string | null = null;
  detailData: DetailRow[] = [];

  ngOnInit(): void {
    this.initializePage('TLS2A050');
    const date = this.rowdata?.TXN_Date ?? null;
    if (!date) {
      this.messageService.errorBubble('缺少查詢日期');
      return;
    }
    this.txnDate = date;
    this.fetchDetails(date);
  }

  private fetchDetails(txnDate: string): void {
    // Backend SQL uses Convert(varchar,date,120) = @TXN_Date → yyyy-MM-dd format
    const dateParam = txnDate.replaceAll(/\//g, '-');
    this.loading = true;
    this.tls22050Service.queryTLS22050({
      TXN_Date: dateParam,
      pageIndex: 1,
      pageSize: 99999,
    })
    .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading = false))
    .subscribe({
      next: (res) => {
        if (res.Status === '0000' || res.Status === 0) {
          const queryData = res.Data ?? [];
          if (queryData.length === 0) {
            this.messageService.errorBubble('查無資料');
            this.detailData = [];
            return;
          }
          this.detailData = this.flattenRows(queryData);
        } else {
          this.messageService.errorBubble(`查詢失敗: ${res.Message}`);
        }
      },
    });
  }

  private flattenRows(queryData: QueryTLS22050Response[]): DetailRow[] {
    const rows: DetailRow[] = [];
    for (const payGroup of queryData) {
      const details = payGroup._DetailList ?? [];
      details.forEach((detail, index) => {
        rows.push({
          PAY_Name: payGroup.PAY_Name,
          ECR_No: detail.ECR_No,
          TXN_No: detail.TXN_No,
          BOOK_PayAmt: detail.BOOK_PayAmt,
          ACT_PayAmt: detail.ACT_PayAmt,
          OVER_PayAmt: detail.OVER_PayAmt,
          isTotal: false,
          rowspan: index === 0 ? details.length : 0,
        });
      });
      rows.push({
        PAY_Name: payGroup.PAY_Name,
        ECR_No: null,
        TXN_No: null,
        BOOK_PayAmt: payGroup.BOOK_PayCnt_Sum,
        ACT_PayAmt: payGroup.ACT_PayAmt_Sum,
        OVER_PayAmt: payGroup.OVER_PayAmt_Sum,
        isTotal: true,
        rowspan: 0,
      });
    }
    return rows;
  }
}
