/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { Table2Component } from '@shared/componentkit/table2/table2.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';

import { TLS23060Service } from '../../../service/api/tls/tls23060.service';

@Component({
  selector: 'app-tls23060-cru',
  templateUrl: './tls23060-cru.component.html',
  styleUrls: ['./tls23060-cru.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    Table2Component,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
  ],
})
export class TLS23060CRUComponent extends BasicCruPageComponent<any> {
  // Table2 資料
  data: any[] = [];
  totalRecords = 0;
  

  // Table2 基本設定
  readonly tableKey = 'TLS23060CRU';

  // 欄位（固定 + 明細金額）
  readonly columns = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: (v: string) => this.formatDate(v) },
    { field: 'ECR_No',   header: '收銀機號', visible: true },
    { field: 'tlt_no',   header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },

    // 總金額（最前面顯示）
    { field: 'TXN_TotPayAmt', header: '總金額', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },

    // 支付明細
    { field: 'TXN_PayAmt10', header: '現金', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt41', header: '聯信連線', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt42', header: '聯信離線', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt12', header: '聯信紅利', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },

    { field: 'TXN_PayAmt81', header: '中信-停車場', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt43', header: '中信連線', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt44', header: '中信離線', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt14', header: '中信紅利', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },

    { field: 'TXN_PayAmt82', header: '一卡通-停車場', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_PayAmt52', header: '一卡通', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },

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

    { field: 'TXN_PrePayAmt', header: '預售訂金', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_OverAmt',  header: '溢收', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_ReturnAmt', header: '退貨', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
    { field: 'TXN_CancelAmt', header: '作廢', style: 'text-right', isTotal: true, format: (v:any)=>this.money(v) },
  ];

  constructor(
    private tls23060Service: TLS23060Service,
  ) {
    super();
  }

  ngOnInit(): void {
    // 初始化頁面（權限/標題/返回路徑等）
    this.initializePage('TLS23060', this.formBuilder.group({}));

    const state = history.state || {};
    const q = state?.queryFormValue ||
              state?.queryForm ||
              state?.queryConditions ||
              state?.criteria ||
              {};

    // 從多個來源「抓到一個」 ECR_No（後端 Detail 必填、字串）
    const ecrNo = this.pickEcrNo(state, q);
    if (!ecrNo) {
      this.messageService?.warnBubble?.('需要收銀機號 (ECR_No)。請從列表選擇某台收銀機後再查看明細。');
      // 回上一頁以避免空白畫面
      this.onCancel();
      return;
    }

    // 日期（必須要有，否則後端會以 Min/Max 判斷）
    const startISO = this.toIso(q?.TXN_DateStart || q?.dateStart || q?.TXN_Date || q?.TXN_DateFrom, false);
    const endISO   = this.toIso(q?.TXN_DateEnd   || q?.dateEnd   || q?.TXN_Date || q?.TXN_DateTo,   true);

    // 組 payload（不含 Offset / OrderBy）
    const payload: any = {
      TXN_DateStart: startISO,
      TXN_DateEnd:   endISO,
      rece_yn:       q?.rece_yn ?? undefined,
      ECR_No:        ecrNo,                    // <== 必填且字串
      tlt_no:        this.pickOne(q?.tlt_no) ?? state?.rowdata?.tlt_no ?? undefined, // 允許字串；若來自陣列取第一筆
      tlt_building:  Array.isArray(q?.tlt_building) ? q.tlt_building : undefined,
      tlt_floor:     Array.isArray(q?.tlt_floor) ? q.tlt_floor : undefined,
      org_id:        Array.isArray(q?.org_id) ? q.org_id : undefined,

      // 排序與分頁（僅提供 SortBy；不傳 Offset/OrderBy）
      SortBy: Array.isArray(q?.SortBy) ? q.SortBy : [{ field: 'ECR_No', order: 1 }],
      pageIndex: q?.pageIndex ?? 1,
      pageSize:  q?.pageSize  ?? 1000,
    };

    // 清掉空值/空陣列
    Object.keys(payload).forEach((k) => {
      const v = payload[k];
      if (v === '' || v == null) delete payload[k];
      if (Array.isArray(v) && v.length === 0) delete payload[k];
    });

    this.loading = true;
    this.tls23060Service.queryTLS23060Detail(payload).pipe(
      finalize(() => (this.loading = false))
    ).subscribe({
      next: (res: any) => {
        const data = res?.Data;
        const wrapper = Array.isArray(data) ? (data[0] ?? {}) : (data ?? {});
        const details =
          wrapper?.tLS23060Details ??
          wrapper?.TLS23060Details ??
          wrapper?.tls23060Details ??
          [];

        this.data = (Array.isArray(details) ? details : []).map((r: any, i: number) => ({
          ...r,
          _rowKey: `${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${i}`,
        }));

        this.totalRecords = this.data.length;

        if (!this.totalRecords) {
          this.messageService?.warnBubble?.('查無明細資料，請返回列表調整查詢條件。');
        }
      },
      error: (err) => {
        console.error('TLS23060_Detail 查詢失敗', err);
        this.data = [];
        this.totalRecords = 0;
        this.messageService?.errorBubble?.('查詢明細失敗');
      }
    });
  }

  /** 取 Detail API 要求的 ECR_No（字串）。來源優先序：state.rowdata.ECR_No > criteria.ECR_No（若陣列取第 1 筆） */
  private pickEcrNo(state: any, q: any): string | undefined {
    const fromRow = state?.rowdata?.ECR_No ?? state?.data?.ECR_No ?? state?.row?.ECR_No;
    const fromQ   = q?.ECR_No;

    let val: any = fromRow ?? fromQ;
    if (Array.isArray(val)) val = val.find((x) => !!x) ?? '';
    if (typeof val === 'number') val = String(val);
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) return undefined;
      return trimmed.length > 10 ? trimmed.slice(0, 10) : trimmed; // 後端 MaxLength(10)
    }
    return undefined;
  }

  /** 允許來源是陣列則取第一筆；字串則回傳；其他回 undefined */
  private pickOne(v: any): string | undefined {
    if (Array.isArray(v)) return v.find((x) => !!x)?.toString();
    if (v == null) return undefined;
    return v.toString();
  }

  /** 金額格式 */
  money(val: any) {
    const n = Number(val ?? 0);
    return Number.isFinite(n) ? n.toLocaleString('en-US') : '0';
  }

  /** 日期：YYYY/MM/DD */
  private formatDate(val: string): string {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val ?? '';
    const yyyy = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}/${MM}/${dd}`;
  }

  /** 轉 ISO（本地時間去時區；endOfDay=true → 23:59:59.999） */
  private toIso(val: any, endOfDay = false): string | undefined {
    if (!val) return undefined;
    const d = typeof val === 'string' ? new Date(val) : (val as Date);
    if (isNaN(d.getTime())) return undefined;
    if (endOfDay) d.setHours(23, 59, 59, 999);
    // 去時區偏移
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19);
  }
}
