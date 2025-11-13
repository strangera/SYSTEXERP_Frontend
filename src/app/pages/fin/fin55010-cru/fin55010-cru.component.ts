/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { NgIf } from '@angular/common';
import { MenuItem } from 'primeng/api';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, formatAmount } from '@shared/componentkit/table/table.model';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { FIN55050Service } from '@service/api/fin/fin55050.service';

type DetailRow = {
  VouDate?: string | null;
  VouNo?: string | null;
  VouType_Name?: string | null;
  VouStatus?: string | null;
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
  selector: 'app-fin55010-cru',
  standalone: true,
  imports: [MenubarComponent, TableComponent, TranslateModule, NgIf],
  templateUrl: './fin55010-cru.component.html'
})
export class FIN55010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  override ProgNo = 'FIN55010';

  // ✅ 給 Menubar 用的自訂麵包屑
  crumbs: MenuItem[] = [
    { label: '人資財會模組' },
    { label: '總帳管理系統' },
    { label: '報表查詢' },
    { label: '傳票列印', disabled: true }
  ];

  vouNo = '';
  initialized = false;
  meta: VoucherMeta | null = null;
  rows: Array<DetailRow & { __rowid: number; AccSubject: string }> = [];

  columns: Column[] = [
    { field: 'AccSubject', header: '會計科目', visible: true },
    { field: 'Ven_Name', header: '廠商代號/簡稱', visible: true },
    { field: 'Org_Name', header: '部門名稱', visible: true },
    { field: 'NoteDesc', header: '摘要', visible: true },
    { field: 'AccAmt_D', header: '借方金額', visible: true, format: formatAmount },
    { field: 'AccAmt_C', header: '貸方金額', visible: true, format: formatAmount },
    { field: 'Remark', header: '備註', visible: true },
  ];

  constructor(private fin55050Service: FIN55050Service) {
    super();
  }

  ngOnInit(): void {
    // 1) ProgNo：優先讀 localStorage；沒有就回寫預設值
    try {
      const savedProg = localStorage.getItem('FIN55010_CRU_PROGNO');
      this.ProgNo = savedProg && savedProg.trim() ? savedProg : 'FIN55010';
      if (!savedProg) localStorage.setItem('FIN55010_CRU_PROGNO', this.ProgNo);
    } catch {
      this.ProgNo = 'FIN55010';
      try { localStorage.setItem('FIN55010_CRU_PROGNO', this.ProgNo); } catch { }
    }

    // 2) 初始化頁面（註冊 Menubar 權限路徑）
    try {
      this.initializePage(this.ProgNo);
    } catch (err) {
      this.messageService?.warnBubble?.('頁面初始化失敗。');
    }
    this.initialized = true;

    // 3) 讀取交接資料（vouNo）
    const handoff = this.readHandoffLocal();
    const vouNo = handoff?.vouNo ?? '';
    if (handoff?.fromRoute) (this as any).fromRoute = handoff.fromRoute;

    if (vouNo) {
      this.vouNo = vouNo;
      this.loadDetailAndClearOnSuccess(vouNo);
    } else {
      this.messageService?.warnBubble?.('缺少傳票號碼（vouNo）。');
    }
  }

  private readHandoffLocal(): { vouNo?: string; fromRoute?: string } | null {
    try {
      const raw = localStorage.getItem('FIN55010_CRU_HANDOFF');
      if (!raw) return null;
      const obj = JSON.parse(raw);
      return { vouNo: obj?.vouNo, fromRoute: obj?.fromRoute };
    } catch {
      return null;
    }
  }

  private loadDetailAndClearOnSuccess(vouNo: string): void {
    this.loading = true;
    this.fin55050Service
      .queryFIN55050Detail({ VouNo: vouNo })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (resp: any) => {
          const list: DetailRow[] = resp?.Data._VoucherDetails ?? [];
          if (!list.length) {
            this.rows = [];
            this.meta = null;
            this.messageService?.warnBubble?.('查無資料或傳票號碼不正確。');
            return;
          }
          const head = list[0];
          this.meta = {
            vouDate: head.VouDate ?? '',
            vouType: head.VouType_Name ?? '',
            vouNo: head.VouNo ?? vouNo,
            vouStatus: head.VouStatus ?? '',
          };
          this.rows = list.map((r, i) => ({
            ...r,
            __rowid: i + 1,
            AccSubject: [r.ACCNO ?? '', r.AccCName ?? ''].filter(Boolean).join(' ')
          }));
          // 清除 handoff（避免舊資料干擾）
          localStorage.removeItem('FIN55010_CRU_HANDOFF');
        },
        error: () => this.messageService?.errorBubble?.('載入傳票明細失敗。'),
      });
  }

  back(): void {
    this.router.navigate(['/account/fin/fin55010']);
    // 或：this.router.navigateByUrl('/account/fin/fin55010');
  }
}