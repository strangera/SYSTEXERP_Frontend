/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { Column, formatAmount } from '@shared/componentkit/table/table.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { NgIf } from '@angular/common';
import { FIN55050Service } from '../../../service/api/fin/fin55050.service';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

type DetailRow = {
  VouDate?: string | null;
  VouNo?: string | null;
  VouType_Name?: string | null;
  VouStatus?: string | null;
  VoucherType_Name?: string | null;
  ACCNO?: string | null;
  AccCName?: string | null;
  Org_Name?: string | null;
  NoteDesc?: string | null;
  AccAmt_D?: number | null;
  AccAmt_C?: number | null;
  Ven_Name?: string | null;
  Remark?: string | null;
};

type VoucherMeta = {
  vouDate: string;
  vouType: string;
  vouNo: string;
  vouStatus: string;
};

@Component({
  selector: 'app-fin55050-cru',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    TranslateModule,
    TableComponent,
    NgIf
  ],
  templateUrl: './fin55050-cru.component.html'
})
export class FIN55050CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  override ProgNo = 'FIN55050';

  vouNo = '';
  rows: Array<DetailRow & { __rowid: number; AccSubject: string }> = [];
  meta: VoucherMeta | null = null;

  columns: Column[] = [
    { field: 'AccSubject', header: '會計科目', visible: true },
    { field: 'Ven_Name', header: '廠商代號/簡稱', visible: true },
    { field: 'Org_Name', header: '部門名稱', visible: true },
    { field: 'NoteDesc', header: '摘要', visible: true },
    { field: 'AccAmt_D', header: '借方金額', visible: true, format: formatAmount },
    { field: 'AccAmt_C', header: '貸方金額', visible: true, format: formatAmount },
    { field: 'Remark',   header: '備註',     visible: true },
  ];

  constructor(
    private fin55050Service: FIN55050Service,
    private route: ActivatedRoute,

  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = 'FIN55050';
    (this as any).initializePage?.(this.ProgNo, 'account/fin/fin55050');

    // 只用 sessionStorage 交接，讀到就清掉
    const handoff = this.readHandoff(); // { vouNo, fromRoute? }
    const vouNo = handoff?.vouNo
      ?? this.route.snapshot.queryParamMap.get('vouNo')    // 備援：若你偶爾仍帶 query
      ?? this.route.snapshot.paramMap.get('vouNo')         // 備援：若你有 /:vouNo 路由
      ?? '';

    if (handoff?.fromRoute) {
      (this as any).fromRoute = handoff.fromRoute;
    }

    if (vouNo) {
      this.vouNo = vouNo;
      this.loadDetail(vouNo);
    } else {
      this.messageService?.warnBubble?.('缺少傳票號碼（vouNo）。');
    }
  }

  /** 一次性讀取並清除 handoff */
private readHandoff(): { vouNo?: string; fromRoute?: string } | null {
  try {
    const raw = sessionStorage.getItem('FIN55050_CRU_HANDOFF');
    if (!raw) return null;
    sessionStorage.removeItem('FIN55050_CRU_HANDOFF'); // 讀完即清
    const obj = JSON.parse(raw) as { vouNo?: string; fromRoute?: string };
    console.log('[FIN55050CRU] handoff read:', obj);
    return obj;
  } catch {
    return null;
  }
}

  private loadDetail(vouNo: string): void {
    this.loading = true;

    this.fin55050Service
      .queryFIN55050Detail({ VouNo: vouNo })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (resp: any) => {
          const list: DetailRow[] = resp?.Data ?? resp ?? [];

          if (!Array.isArray(list) || list.length === 0) {
            this.rows = [];
            this.meta = null;
            this.messageService?.warnBubble?.('查無資料或傳票號碼不正確。');
            return;
          }

          const head = list[0] ?? {};
          const vouTypeName =
            (head as any).VoucherType_Name ??
            (head as any).VouType_Name ??
            '';

          this.meta = {
            vouDate: (head.VouDate ?? '') as string,
            vouType: vouTypeName,
            vouNo: (head.VouNo ?? vouNo) as string,
            vouStatus: (head.VouStatus ?? '') as string,
          };

          this.rows = list.map((r, idx) => ({
            ...r,
            __rowid: idx + 1,
            AccSubject: [r.ACCNO ?? '', r.AccCName ?? ''].filter(Boolean).join(' ')
          }));
        },
        error: (err) => {
          console.error('[FIN55050CRU] queryFIN55050Detail error:', err);
          this.rows = [];
          this.meta = null;
          this.messageService?.errorBubble?.('載入傳票明細失敗。');
        },
      });
  }

  back(): void {
    this.router.navigate(['account/fin/fin55050']);
  }
}
