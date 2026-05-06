/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { FIN15080Service } from '../../../service/api/fin/fin15080.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { environment } from '../../../../environments/environment';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
type StoTaxNoOption = {
  label: string;
  value: string;
  REP_BegGUIYM?: string;
  REP_EndGUIYM?: string;
  STO_No?: string;
  STO_Status?: string;
  STO_TaxNo?: string;
};

@Component({
  selector: 'app-fin15080',
  templateUrl: './fin15080.component.html',
  styleUrls: ['./fin15080.component.scss'],
  standalone: true,
  imports: [
     CommonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    TranslateModule,
    MultiSelectComponent,
    TableModule,
    ButtonModule,
    YearMonthComponent,
  ],
})
export class FIN15080Component extends BasicQueryPageComponent<any> {
  // 下拉選單資料
  stoTaxNoOptions: StoTaxNoOption[] = [];

  // 控制畫面是否顯示
  pageReady = false;

  queryForm = this.formBuilder.group({
    DeclareYM: [this.getDefaultDeclareYM(), Validators.required],
    Business_ID: [null, Validators.required],
  });

  constructor(private fin15080Service: FIN15080Service) {
    super();
  }

  ngOnInit(): void {
    // 一開始先隱藏畫面
    this.pageReady = false;

    this.initializePage(
      'FIN15080',
      '/fin/fin15080cru',
      this.queryForm,
      () => this.onSubmit()
    );

    // 載入下拉
    this.loadStoTaxNoOptions();
  }

  /** 載入稅籍下拉 */
  private loadStoTaxNoOptions(): void {
  const { mid, SYS_StoreNo } = this.getUserInfoFromLocal();

  this.pageReady = false;
  this.loading = true;

  this.fin15080Service
    .getStoTaxNoOptions({
      mid,
      STO_No: SYS_StoreNo,
    })
    .pipe(
      finalize(() => {
        this.loading = false;
        this.pageReady = true;
      })
    )
    .subscribe({
      next: (opts) => {
        this.stoTaxNoOptions = opts ?? [];

        const active = this.stoTaxNoOptions.find(
          (x) => x.STO_Status === '1'
        );

        if (active) {
          this.queryForm.patchValue({
            Business_ID: [active.value] as any,
          });
        }
      },
      error: (err) => {
        console.error('取得稅籍下拉失敗：', err);
        this.stoTaxNoOptions = [];
        this.messageService.errorBubble('稅籍清單取得失敗');
      },
    });
}
  /** 查詢 */
  onSubmit(): void {
    this.submitted = true;

    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const f = this.queryForm.getRawValue();
    const { mid, SYS_StoreNo } = this.getUserInfoFromLocal();

    const selectedKey = Array.isArray(f.Business_ID)
      ? (f.Business_ID[0] ?? '')
      : (f.Business_ID ?? '');

    if (!selectedKey) {
      this.messageService.warnBubble('請選擇稅籍編號');
      return;
    }

    const selectedOption = this.stoTaxNoOptions.find(
      (o) => o.value === selectedKey
    );

    const taxNo = selectedOption?.STO_TaxNo ?? '';

    if (!taxNo) {
      this.messageService.errorBubble('找不到對應的稅籍編號');
      console.error(
        'selectedKey:',
        selectedKey,
        'selectedOption:',
        selectedOption
      );
      return;
    }

    const payload = {
      Mid: mid,
      STO_No: SYS_StoreNo,
      REP_GUIYM: this.toYYYYMM(f.DeclareYM),
      REP_TaxNo: taxNo,
    };

    this.loading = true;
    this.messageService.blockUi();

    this.fin15080Service.printFIN15080(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.messageService.unblockUi();

        const urlFromData =
          res?.Data?.[0]?.printURL ??
          res?.Data?.printURL ??
          res?.printURL;

        if (!urlFromData) {
          this.messageService.errorBubble(
            '取得列印網址失敗（printURL 為空）'
          );
          console.error('API 回傳無 printURL：', res);
          return;
        }

        const finalUrl = urlFromData.startsWith('http')
          ? urlFromData
          : this.joinUrlNoEncode(environment.ApiUrl, urlFromData);

        window.open(finalUrl, '_blank', 'noopener');
      },

      error: (err) => {
        this.loading = false;
        this.messageService.unblockUi();

        this.messageService.errorBubble('列印失敗，請稍後再試');

        console.error('PrintFIN15080 發生錯誤：', err);
      },
    });
  }

  /** 解析 localStorage.UserInfo */
  private getUserInfoFromLocal(): {
    mid: number;
    SYS_StoreNo: string;
  } {
    let mid = 0;
    let SYS_StoreNo = '';

    try {
      const raw = localStorage.getItem('UserInfo');

      if (raw) {
        const obj = JSON.parse(raw);

        mid = Number(obj?.mid ?? 0);
        SYS_StoreNo = String(obj?.SYS_StoreNo ?? '');
      }
    } catch (e) {
      console.error('解析 localStorage.UserInfo 失敗：', e);
    }

    return { mid, SYS_StoreNo };
  }

  /** 月份轉 YYYYMM */
  private toYYYYMM(val: any): string {
    if (!val) return '';

    if (val instanceof Date) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');

      return `${y}${m}`;
    }

    const s = String(val);

    const m = s.match(/^(\d{4})[\/\-]?(\d{2})/);

    if (m) {
      return `${m[1]}${m[2]}`;
    }

    return s;
  }

  /** URL 組合 */
  private joinUrlNoEncode(base: string, path: string): string {
    const cleanBase = base.replace(/\/+$/, '');
    const cleanPath = String(path).replace(/^\/+/, '');

    return `${cleanBase}/${cleanPath}`;
  }

  /** 預設申報年月 */
  private getDefaultDeclareYM(): string {
    const now = new Date();

    const year = now.getFullYear();

    let month = now.getMonth() + 1;

    // 奇數月自動 +1
    if (month % 2 === 1) {
      month = month + 1;
    }

    const mm = String(month).padStart(2, '0');

    return `${year}${mm}`;
  }
}