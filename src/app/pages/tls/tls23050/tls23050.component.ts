import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { TLS23050Service } from '../../../service/api/tls/tls23050.service';
import { TypeService } from '../../../service/basic/type.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { finalize } from 'rxjs/operators';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { ButtonModule } from 'primeng/button';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-tls23050',
  templateUrl: './tls23050.component.html',
  styleUrls: ['./tls23050.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    RadiobuttonComponent,
    MultiSelectComponent,
    DropdownComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    TableComponent,
    CalendarComponent,
    ButtonModule, // ✅ p-button 匯出按鈕
  ],
})
export class TLS23050Component extends BasicQueryPageComponent<any> {

  data: any[] = [];
  totalRecords = 0;

  // ✅ 匯出用
  btnLoading = false;
  historyRequestBody: any | null = null;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // 表單：單日日期 + 多個條件
  queryForm = this.formBuilder.group({
    TXN_Date: [this.yesterday, [Validators.required]],
    rece_yn: [null],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    ECR_No: [],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });

  WhetherOptions: any[] = [
    { value: null, label: '全部' },
    { value: 'Y', label: '使用業主發票' },
    { value: 'N', label: '非使用業主發票' },
  ];
  typeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];

  constructor(
    private tls23050Service: TLS23050Service,
    private typeService: TypeService,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23050', 'tls/tls23050', this.queryForm, (form) => this.onSubmit(form));

    this.typeService.getTypeOptions().subscribe(data => this.typeOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);

    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);

    this.tls11010Service.getOrgOptions().subscribe(data => {
      this.OrganizationCodeOptions = (data ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    this.ECRNoService.getECRNo().subscribe(data => {
      this.ECRNoOptions = (data ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
  }

  // 送出查詢
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.value as any;

      // ✅ 單日轉起迄（起=00:00:00；迄=23:59:59）
      const TXN_DateStart = this.toIso(val?.TXN_Date, false);
      const TXN_DateEnd   = this.toIso(val?.TXN_Date, true);

      const payload: any = {
        ...val,
        TXN_DateStart,
        TXN_DateEnd,
        // 分頁/排序（沿用共用 table）
        pageSize : val?.pageSize,
        pageIndex: val?.pageIndex,
        SortBy   : val?.SortBy,
      };

      // 清理空值
      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (v === '' || v === null || v === undefined) delete payload[k];
        if (Array.isArray(v) && v.length === 0) delete payload[k];
      });

      // ✅ 匯出沿用同一份參數
      this.historyRequestBody = { ...payload };

      this.loading = true;
      this.messageService?.blockUi();

      this.tls23050Service.queryTLS23050(payload).pipe(
        finalize(() => {
          this.loading = false;
          this.messageService?.unblockUi();
        })
      ).subscribe({
        next: (res) => {
          // 後端回傳結構：Data[0].tLS23050Details（依你原本程式）
          const first = Array.isArray(res?.Data) && res.Data.length > 0 ? res.Data[0] : null;
          const details = Array.isArray(first?.tLS23050Details) ? first.tLS23050Details : [];
          this.data = details;
          this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : details.length;
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
        }
      });
    });
  }

  /** 將單日欄位轉成本地時區 ISO；endOfDay=true 會設成 23:59:59.999 */
  private toIso(val: any, endOfDay = false): string | undefined {
    if (!val) return undefined;
    const d = typeof val === 'string' ? new Date(val) : (val as Date);
    if (isNaN(d.getTime())) return undefined;
    if (endOfDay) d.setHours(23, 59, 59, 999);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19);
  }

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  // ===== 匯出 =====

  onExportPDF(): void {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.tls23050Service.exportTLS23050PDF(this.historyRequestBody).pipe(
      finalize(() => this.btnLoading = false)
    ).subscribe({
      next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.pdf')
    });
  }

  onExportXLSX(): void {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.tls23050Service.exportTLS23050Excel(this.historyRequestBody).pipe(
      finalize(() => this.btnLoading = false)
    ).subscribe({
      next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.xlsx')
    });
  }

  private handleFileExport(response: HttpResponse<Blob>, fileExtension: string): void {
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = this.getFilenameFromHeader(contentDisposition, fileExtension);
    const blob = response.body;

    if (blob && blob.size > 0) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
    }
  }

  private getFilenameFromHeader(contentDisposition: string | null, defaultExtension: string): string {
    if (!contentDisposition) return `download${defaultExtension}`;

    const filenameStarMatch = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStarMatch && filenameStarMatch.length > 1) {
      const encodedFilename = filenameStarMatch[1];
      try {
        const decoded = decodeURIComponent(encodedFilename.replace(/^UTF-8''/, ''));
        return decoded;
      } catch {
        return encodedFilename;
      }
    }

    const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition);
    if (filenameMatch && filenameMatch.length > 1) {
      try {
        return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
      } catch {
        return filenameMatch[1];
      }
    }

    return `download${defaultExtension}`;
  }

  // ===== 表格欄位 =====
  columns = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'TXN_TotPayAmt', header: '總金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt10', header: '現金', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt41', header: '聯合連線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt42', header: '聯合離線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt12', header: '聯合紅利', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt81', header: '[信用卡]中信停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt43', header: '中信連線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt44', header: '中信離線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt14', header: '中信紅利', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt82', header: '[一卡通]停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt52', header: '一卡通', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt20', header: '禮券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt62', header: '商品提貨單', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt77', header: '感熱紙抵用券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt71', header: '商品抵用券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt30', header: '貴賓提貨單(應收帳款)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt73', header: '外來禮券(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt72', header: '外來提貨單(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt74', header: '活動券(自營)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt75', header: '折價券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt76', header: '現抵', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt24', header: '禮券餘額代卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt25', header: '提貨單餘代卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt07', header: '會員折抵', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt55', header: 'LINE Pay', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt83', header: '[LINE Pay]停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt78', header: 'APP抵用券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt79', header: 'APP提貨單', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt21', header: 'APP禮券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt53', header: '悠遊卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt56', header: '一卡通錢包', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt57', header: '台灣Pay', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt58', header: '南紡錢包', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt59', header: '即享券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt60', header: '喜客券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt22', header: '[外來提貨單]高夢', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt23', header: '[外來禮券]高夢', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'PreSale_Received', header: '預售訂金', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'PreSale_Checkout', header: '預售實收結帳', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_OverAmt', header: '溢收金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_ReturnAmt', header: '退貨金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_ExchangeAmt', header: '換貨金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_CancelAmt', header: '作廢金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true }
  ];
}
