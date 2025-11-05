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
  ) {
    super();
  }

ngOnInit(): void {
  // 1) 先決定 ProgNo（從 localStorage 補上，讀不到就用預設）
  try {
    const savedProg = localStorage.getItem('FIN55050_CRU_PROGNO');
    this.ProgNo = savedProg && savedProg.trim() ? savedProg : 'FIN55050';
  } catch {
    this.ProgNo = 'FIN55050';
  }

  // 2) 立即初始化 Menubar／權限（⚠️ CRU 這邊用單一參數）
  (this as any).initializePage?.(this.ProgNo);

  // 3) 讀取交接資料後載入明細
  const handoff = this.readHandoffLocal(); // { vouNo, fromRoute? }
  const vouNo = handoff?.vouNo ?? '';

  if (handoff?.fromRoute) {
    (this as any).fromRoute = handoff.fromRoute;
  }

  if (vouNo) {
    this.vouNo = vouNo;
    this.loadDetailAndClearOnSuccess(vouNo);
  } else {
    this.messageService?.warnBubble?.('缺少傳票號碼（vouNo）。');
  }
}



  /** 從 localStorage 讀（不立刻刪） */
  private readHandoffLocal(): { vouNo?: string; fromRoute?: string } | null {
    try {
      const raw = localStorage.getItem('FIN55050_CRU_HANDOFF');
      if (!raw) return null;
      const obj = JSON.parse(raw) as { vouNo?: string; fromRoute?: string; ts?: number };
      console.log('[FIN55050CRU] handoff read (localStorage):', obj);
      return { vouNo: obj?.vouNo, fromRoute: obj?.fromRoute };
    } catch (err) {
      this.messageService?.warnBubble?.('讀取交接資料失敗。');
      return null;
    }
  }

  /** 取到資料且 API 成功回來之後，再清除 handoff，避免「刪太快」 */
  private loadDetailAndClearOnSuccess(vouNo: string): void {
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

          // ✅ API 成功＋資料呈現後再清除 handoff
          try { localStorage.removeItem('FIN55050_CRU_HANDOFF'); } catch {}
        },
        error: (err) => {
          console.error('[FIN55050CRU] queryFIN55050Detail error:', err);
          this.rows = [];
          this.meta = null;
          this.messageService?.errorBubble?.('載入傳票明細失敗。');
          // 失敗時保留 handoff，讓重整仍可讀到
        },
      });
  }

  back(): void {
    // 若有自訂返回按鈕可接自家邏輯；這裡用簡單的 history
    history.back();
  }
}
