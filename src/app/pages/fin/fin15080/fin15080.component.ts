/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FIN15080Service } from '../../../service/api/fin/fin15080.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { YearMonthComponent } from '../fin11020/query-year-month.component';

interface StoTaxNoOption {
  label: string;
  value: string;
  REP_BegGUIYM?: string;
  REP_EndGUIYM?: string;
  STO_No?: string;
  STO_Status?: string;
  STO_TaxNo?: string;
  STO_TaxName?: string;
}

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
    DropdownComponent,
    TableModule,
    ButtonModule,
    YearMonthComponent,
  ],
})
export class FIN15080Component extends BasicQueryPageComponent<any> implements OnInit {
  stoTaxNoOptions: StoTaxNoOption[] = [];
  pageReady = false;

  queryForm = this.formBuilder.group({
    DeclareYM: [this.getDefaultDeclareYM(), Validators.required],
    Business_ID: ['' as string, Validators.required],
  });

  constructor(private readonly fin15080Service: FIN15080Service) {
    super();
  }

  ngOnInit(): void {
    this.pageReady = false;

    this.initializePage(
      'FIN15080',
      '/fin/fin15080cru',
      this.queryForm,
      () => this.onSubmit()
    );

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
        next: (rows) => {
          this.stoTaxNoOptions = this.buildStoTaxNoOptions(rows);

          const active =
            this.stoTaxNoOptions.find((x) => String(x.STO_Status).trim() === '1') ??
            this.stoTaxNoOptions[0];

          if (active) {
            this.queryForm.controls.Business_ID.setValue(active.value);
          }
        },
        error: (err) => {
          console.error('取得稅籍下拉失敗：', err);
          this.stoTaxNoOptions = [];
          this.messageService.errorBubble('稅籍清單取得失敗');
        },
      });
  }

  /** 整理稅籍選項：顯示 稅籍編號-公司名稱，不顯示日期，稅籍編號重複只留一筆 */
  private buildStoTaxNoOptions(rows: any[]): StoTaxNoOption[] {
    const map = new Map<string, StoTaxNoOption>();

    for (const x of rows) {
      const taxNo = String(x?.STO_TaxNo ?? '').trim();
      const taxName = String(x?.STO_TaxName ?? '').trim();
      const status = String(x?.STO_Status ?? '').trim();

      if (!taxNo) continue;

      const option: StoTaxNoOption = {
        label: `${taxNo}-${taxName}`,
        value: taxNo,
        REP_BegGUIYM: String(x?.REP_BegGUIYM ?? '').trim(),
        REP_EndGUIYM: String(x?.REP_EndGUIYM ?? '').trim(),
        STO_No: String(x?.STO_No ?? '').trim(),
        STO_Status: status,
        STO_TaxNo: taxNo,
        STO_TaxName: taxName,
      };

      const exists = map.get(taxNo);

      // 沒有重複：直接放
      if (!exists) {
        map.set(taxNo, option);
        continue;
      }

      // 有重複：如果新資料是啟用狀態，就取代舊資料
      if (status === '1') {
        map.set(taxNo, option);
      }
    }

    return Array.from(map.values());
  }

  /** 列印 */
  onSubmit(): void {
    this.submitted = true;

    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const f = this.queryForm.getRawValue();
    const { mid, SYS_StoreNo } = this.getUserInfoFromLocal();

    const selectedTaxNo = String(f.Business_ID ?? '').trim();

    if (!selectedTaxNo) {
      this.messageService.warnBubble('請選擇稅籍編號');
      return;
    }

    const payload = {
      Mid: mid,
      STO_No: SYS_StoreNo,
      REP_GUIYM: this.toYYYYMM(f.DeclareYM),
      REP_TaxNo: selectedTaxNo,
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
          this.messageService.errorBubble('取得列印網址失敗（printURL 為空）');
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

  private getUserInfoFromLocal(): { mid: number; SYS_StoreNo: string } {
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

  private toYYYYMM(val: any): string {
    if (!val) return '';
    if (val instanceof Date) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }

    const s = String(val).trim();

    // 移除可能的分隔符，直接取前 6 位數字
    const cleanS = s.replace(/[\/\-]/g, '');

    // 如果長度大於等於 6，且前 6 位是數字，則回傳
    if (cleanS.length >= 6 && /^\d{6}/.test(cleanS)) {
      return cleanS.substring(0, 6);
    }

    return s; // 或回傳預設值
  }

  private joinUrlNoEncode(base: string, path: string): string {
    // 使用 while 或 if 檢查字尾是否為斜線，是的話就切除
    let cleanBase = base.trim();
    if (cleanBase.endsWith('/')) {
      cleanBase = cleanBase.slice(0, -1);
    }

    // 字首斜線同樣可以用原生方法處理
    let cleanPath = path.trim();
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.slice(1);
    }

    return `${cleanBase}/${cleanPath}`;
  }

  private getDefaultDeclareYM(): string {
    const now = new Date();
    const year = now.getFullYear();

    let month = now.getMonth() + 1;

    if (month % 2 === 1) {
      month = month + 1;
    }

    const mm = String(month).padStart(2, '0');
    return `${year}${mm}`;
  }
}
