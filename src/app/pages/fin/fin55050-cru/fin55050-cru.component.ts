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
    const state = history.state ?? {};
    this.vouNo = state?.vouNo ?? '';
    if (!this.vouNo) {
      this.messageService?.warnBubble?.('未帶入傳票號碼。');
      return;
    }

    this.loading = true;
    // 直接打明細 API
    this.fin55050Service
      .queryFIN55050Detail({ VouNo: this.vouNo })
      .subscribe({
        next: (resp: any) => {
          const list: DetailRow[] = (resp?.Data ?? []) as DetailRow[];

          // 設定表頭 meta（以第一筆為準）
          const first = list[0] ?? {};
          this.meta = {
            vouDate: (first.VouDate ?? '') as string,
            vouType: (first.VoucherType_Name ?? first.VouType_Name ?? '') as string,
            vouNo: this.vouNo,
            vouStatus: (first.VouStatus ?? '') as string,
          };

          // 明細列
          this.rows = list.map((r, i) => ({
            __rowid: i,
            AccSubject: `${r.ACCNO ?? ''} ${r.AccCName ?? ''}`.trim(),
            ...r,
          }));
        },
        error: () => {
          this.messageService?.warnBubble?.('讀取傳票明細失敗。');
          this.rows = [];
          this.meta = {
            vouDate: '',
            vouType: '',
            vouNo: this.vouNo,
            vouStatus: '',
          };
        }
      }).add(() => (this.loading = false));
  }

  back(): void {
    this.router.navigate(['account/fin/fin55050']);
  }
}
