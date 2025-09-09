/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { Table2Component } from '@shared/componentkit/table2/table2.component';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs/operators';
import { TLS23080Service } from '../../../service/api/tls/tls23080.service';
import { ButtonComponent } from '@shared/componentkit/button/button.component';

@Component({
  selector: 'app-tls23080-cru',
  templateUrl: './tls23080-cru.component.html',
  styleUrls: ['./tls23080-cru.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    Table2Component,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent
  ],
})
export class TLS23080CRUComponent extends BasicCruPageComponent<any> {
  // 表格資料
  data: any[] = [];
  totalRecords = 0;
 

  // Table2
  readonly tableKey = 'TLS23080CRU';
  readonly columns = [
    { field: 'ECR_No',  header: '收銀機號', visible: true },
    { field: 'tlt_no',  header: '專櫃代號', visible: true },
    { field: 'tlt_name',header: '專櫃名稱', visible: true, style: 'text-left' },

    // 現金
    { field: 'TXN_PayAmt10', header: '現金', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },

    // 聯信
    { field: 'UnionGeneral', header: '聯信(一般)', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'UnionAE',      header: '聯信(AE)',   style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'UnionDiner',   header: '聯信(Diners)', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },

    // 中信
    { field: 'CTBCGeneral', header: '中信(一般)', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'CTBCAE',      header: '中信(AE)',   style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'CTBCDiner',   header: '中信(Diners)', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },

    // 中信-停車場
    { field: 'CTBCParkingGeneral', header: '中信-停車(一般)', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'CTBCParkingAE',      header: '中信-停車(AE)',   style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'CTBCParkingDiner',   header: '中信-停車(Diners)', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },

    // 其它支付（照你提供的欄位）
    { field: 'TXN_PayAmt52', header: '一卡通', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt82', header: '一卡通-停車場', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt20', header: '禮券', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt62', header: '商品提貨單', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt77', header: '感熱紙抵用券', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt71', header: '商品抵用券', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt30', header: '貴賓提貨單(應收帳款)', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt73', header: '外來禮券(抵用券)', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt72', header: '外來提貨單(抵用券)', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt74', header: '活動券(自營)', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt75', header: '折價券', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt76', header: '現抵', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt24', header: '禮券餘代卡', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt25', header: '提貨單餘代卡', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt07', header: '會員折抵', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt55', header: 'LINE Pay', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt83', header: 'LINE Pay-停車場', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt78', header: 'APP抵用券', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt79', header: 'APP提貨單', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt21', header: 'APP禮券', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt53', header: '悠遊卡', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt56', header: '一卡通錢包 iPASS MONEY', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt57', header: '台灣Pay', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt58', header: '南紡錢包', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt59', header: '即享券', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt60', header: '喜客券', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt22', header: '外來提貨單-高夢', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt23', header: '外來禮券-高夢', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },

    // 總金額
    { field: 'TXN_TotPayAmt', header: '總金額', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
  ];

  constructor(
    private tls23080Service: TLS23080Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23080', this.formBuilder.group({}));

    const state = history.state;
    const txDate = state?.criteria?.TXN_Date; // 由列表頁帶入
    if (!txDate) {
      this.messageService?.warnBubble('沒有查詢條件（日期），請從列表頁重新進入。');
      return;
    }

    this.loading = true;
    this.tls23080Service.queryTLS23080Detail({ TXN_Date: txDate }).subscribe({
      next: (res) => {
        const list = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);
        this.data = list.map((r:any, i:any) => ({ ...r, _rowKey: `${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${i}` }));
        this.totalRecords = this.data.length;
      },
      error: () => {
        this.data = []; this.totalRecords = 0;
      },
      complete: () => { this.loading = false; }
    });
  }

  

  money(val: any) {
    const n = Number(val ?? 0);
    return Number.isFinite(n) ? n.toLocaleString('en-US') : '';
  }
}
