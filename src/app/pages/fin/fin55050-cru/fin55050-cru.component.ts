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


  // 來自列表帶進來的 key
  vouNo = '';

  // 由 Store 解析（取不到也留在此頁面，顯示空表）
  header: { AccNo: string; AccCName: string; VouDate: string } | null = null;
  rows: any[] = [];

  // 抬頭四項：全部從 store meta 取
  meta: VoucherMeta | null = null;

  columns: Column[] = [
    { field: 'VouNo', header: '傳票號碼', visible: true },
    { field: 'Ven_Name', header: '廠商代號/簡稱', visible: true },
    { field: 'VouStatus', header: '狀態', visible: true },
    { field: 'ORG_ID', header: '部門', visible: true },
    { field: 'Org_Name', header: '部門名稱', visible: true },
    { field: 'ProjectNo', header: '活動', visible: true },
    { field: 'PTA', header: '立沖代號', visible: true },
    { field: 'NoteDesc', header: '摘要', visible: true },
    { field: 'AccAmt_D', header: '借方金額', visible: true, format: formatAmount },
    { field: 'AccAmt_C', header: '貸方金額', visible: true, format: formatAmount },
    { field: 'OpeningBal', header: '餘額', visible: true, format: formatAmount },
  ];

  constructor(
    
    private store: FIN55050Store,
    
  ) {super(); }

  ngOnInit(): void {
    const state = history.state ?? {};
    this.vouNo = state?.vouNo ?? '';
    console.log('[FIN55050-CRU] init with vouNo =', this.vouNo);

    const entry: VouNoIndexEntry | null = this.vouNo ? this.store.getByVouNo(this.vouNo) : null;
    this.meta = this.vouNo ? this.store.getMeta(this.vouNo) : null;

    if (entry && entry.rows?.length) {
      this.header = entry.parent;
      this.rows = entry.rows.map((r, i) => ({ __rowid: i, ...r }));
      console.log('[FIN55050-CRU] found entry rows =', entry.rows.length, 'header =', this.header, 'meta=', this.meta);
    } else {
      this.header = null;
      this.rows = [];
      console.log('[FIN55050-CRU] no entry found in store. stay on CRU. meta=', this.meta);
    }

    // 如果之後有型態來源，可補：
    // if (this.meta && !this.meta.vouType) this.store.setVoucherType(this.vouNo, 'RC/應收帳款收款沖帳傳票');
  }

  back(): void {
    this.router.navigate(['account/fin/fin55050']);
  }
}
