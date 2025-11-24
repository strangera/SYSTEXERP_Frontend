import { Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { environment } from '../../../../environments/environment';
import { FIN15100Service } from '../../../service/api/fin/fin15100.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';





@Component({
  selector: 'app-fin15100',
  templateUrl: './fin15100.component.html',
  styleUrls: ['./fin15100.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    TranslateModule,
    InputTextRangeComponent,
    InputTextComponent,
    TableModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    ButtonModule,
    CalendarComponent
  ],
})
export class FIN15100Component extends BasicQueryPageComponent<any> {

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];


  queryForm = this.formBuilder.group({
    INV_DeclareYM: [null, Validators.required], // 申報年月
    TXN_Ret_NoS: [null, [Validators.required, Validators.maxLength(20)]], // 退出/折讓單號(起)
    TXN_Ret_NoE: [null, [Validators.required, Validators.maxLength(20)]],   // 退出/折讓單號(迄)
    InvoiceTrack: ['', [Validators.maxLength(2)]],//字軌
    InvoiceNumberS: [null, [Validators.maxLength(8)]], //發票起始號碼
    InvoiceNumberE: [null, [Validators.maxLength(8)]], //發票結束號碼
  });





  constructor(
    private fin15100Service: FIN15100Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'FIN15100',
      '/fin/fin15100cru',
      this.queryForm,
      () => this.onSubmit()
    );


  }


  onSubmit(): void {
    this.submitted = true;
    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      return;
    }

    // 取表單值
    const f = this.queryForm.getRawValue();

    // 取 localStorage.UserInfo → mid、SYS_StoreNo
    const { mid, SYS_StoreNo } = this.getUserInfoFromLocal();

    const payload = {
      INV_DeclareYM: this.toYYYYMM(f.INV_DeclareYM),
      TXN_Ret_NoS: f.TXN_Ret_NoS ?? '',
      TXN_Ret_NoE: f.TXN_Ret_NoE ?? '',
      InvoiceTrack: f.InvoiceTrack ?? '',
      InvoiceNumberS: f.InvoiceNumberS ?? '',
      InvoiceNumberE: f.InvoiceNumberE ?? '',
      Mid: mid,
      STO_No: SYS_StoreNo,
    };

    this.loading = true;
    this.fin15100Service.printFIN15100(payload).subscribe({
      next: (res) => {
        this.loading = false;

        const rawUrl: string | undefined =
          res?.Data?.Print_URL ?? res?.Data?.[0]?.Print_URL;

        if (!rawUrl) {
          alert('取得列印網址失敗（Print_URL 為空）');
          console.error('API 回傳無 Print_URL：', res);
          return;
        }

        // 不做任何 encode，不用 URL()，只做字串相接
        const finalUrl = rawUrl.startsWith('http')
          ? rawUrl
          : this.joinUrlNoEncode(environment.ApiUrl, rawUrl);

        window.open(finalUrl, '_blank', 'noopener');
      },
      error: (err) => {
        this.loading = false;
        alert('查詢失敗，請稍後再試');
        console.error('PrintFIN15100 發生錯誤：', err);
      },
    });
  }
  private joinUrlNoEncode(base: string, path: string): string {
    const cleanBase = base.replace(/\/+$/, '');
    const cleanPath = String(path).replace(/^\/+/, '');
    return `${cleanBase}/${cleanPath}`;
  }

  /** 將相對或絕對的 Print_URL 轉為完整可開啟的網址 */
  private buildAbsoluteUrl(base: string, path: string): string {
    try {
      // new URL 會自動處理前後斜線；中文路徑可用 encodeURI
      const u = new URL(path, base).toString();
      return encodeURI(u);
    } catch {
      const cleanBase = base.replace(/\/+$/, '');
      const cleanPath = String(path).replace(/^\/+/, '');
      return encodeURI(`${cleanBase}/${cleanPath}`);
    }
  }


  /** 解析 localStorage.UserInfo，回傳 { mid, SYS_StoreNo } */
  private getUserInfoFromLocal(): { mid: number; SYS_StoreNo: string } {
    let mid = 0;
    let SYS_StoreNo = '';

    try {
      const raw = localStorage.getItem('UserInfo');
      if (raw) {
        const obj = JSON.parse(raw);
        // 依你的截圖欄位：mid 與 SYS_StoreNo
        mid = Number(obj?.mid ?? 0);
        SYS_StoreNo = String(obj?.SYS_StoreNo ?? '');
      }
    } catch (e) {
      console.error('解析 localStorage.UserInfo 失敗：', e);
    }

    return { mid, SYS_StoreNo };
  }

  /** 將 Month 選擇轉為 YYYYMM（支援 Date / 字串） */
  private toYYYYMM(val: any): string {
    if (!val) return '';
    if (val instanceof Date) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }
    // 支援 "2025-09" / "2025/09" / "202509" 等常見格式
    const s = String(val);
    const m = s.match(/^(\d{4})[\/\-]?(\d{2})/);
    if (m) return `${m[1]}${m[2]}`;
    return s; // fallback
  }
}
