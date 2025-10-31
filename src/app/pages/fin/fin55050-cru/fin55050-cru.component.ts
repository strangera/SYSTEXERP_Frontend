/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { Column, formatAmount } from '@shared/componentkit/table/table.model';
import { FIN55050Store, VouNoIndexEntry, VoucherMeta } from '../fin55050/fin55050.store';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { NgIf } from '@angular/common';

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
  header: { AccNo: string; AccCName: string; VouDate: string } | null = null;
  rows: any[] = [];
  meta: VoucherMeta | null = null;

  columns: Column[] = [
    { field: 'AccSubject', header: '會計科目', visible: true },
    { field: 'Ven_Name', header: '廠商代號/簡稱', visible: true },
    { field: 'VouStatus', header: '狀態', visible: true },
    { field: 'NoteDesc', header: '摘要', visible: true },
    { field: 'AccAmt_D', header: '借方金額', visible: true, format: formatAmount },
    { field: 'AccAmt_C', header: '貸方金額', visible: true, format: formatAmount },
    { field: 'OpeningBal', header: '餘額', visible: true, format: formatAmount },
  ];

  constructor(
    private store: FIN55050Store,
   
  ) {
    super();
  }

  ngOnInit(): void {
    const state = history.state ?? {};
    this.vouNo = state?.vouNo ?? '';
    console.log('[FIN55050-CRU] init with vouNo =', this.vouNo);

    const entry: VouNoIndexEntry | null = this.vouNo ? this.store.getByVouNo(this.vouNo) : null;
    this.meta = this.vouNo ? this.store.getMeta(this.vouNo) : null;

    if (entry && entry.rows?.length) {
      this.header = entry.parent;
      this.rows = entry.rows.map((r, i) => ({
        __rowid: i,
        ...r,
        AccSubject: `${entry.parent.AccNo} ${entry.parent.AccCName}`, // ✅ 合併顯示用
      }));

      console.log(
        '[FIN55050-CRU] found entry rows =',
        entry.rows.length,
        'header =',
        this.header,
        'meta=',
        this.meta
      );
    } else {
      this.header = null;
      this.rows = [];
      console.log('[FIN55050-CRU] no entry found in store. stay on CRU. meta=', this.meta);
    }
  }

  back(): void {
    this.router.navigate(['account/fin/fin55050']);
  }
}
