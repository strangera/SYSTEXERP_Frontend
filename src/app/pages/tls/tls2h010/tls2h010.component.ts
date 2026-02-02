/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsyncPipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls2h010Service } from '@service/api/tls/tls2h010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn, formatAmount, formatYN } from '@shared/componentkit/table-report/table-report.model'; // 引入 ReportColumn
import { AddButton, formatYYYYMM } from '@shared/componentkit/table/table.model';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import { finalize, forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';

// 2.2.17.1 租金發票套印作業
@Component({
  selector: 'app-tls2h010',
  templateUrl: './tls2h010.component.html',
  standalone: true,
  imports: [ButtonModule, InputNumberRangeComponent, CalendarComponent, SelectButtonModule, TableReportComponent, AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, CheckboxModule, TranslateModule]
})
export class TLS2H010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    // 分頁欄位
    pageSize: [30],
    pageIndex: [1],
    SamYyyymm: [new Date(), Validators.required],
    GuiNoStart: [null],
    GuiNoEnd: [null],
    TltNo: [''],
    SortBy: [[{ field: 'TltNo', order: 1 }]],
  });

  lastQueryBody: any = null;
  totalRecords = 0;
  data: any[] = [];
  selectedItems: any[] = [];
  tlt_noOptions = this.dropdown.queryTltTalent();
  addButton: AddButton[] = [];
  columns: ReportColumn[] = [
    { field: 'SamYyyymm', header: '結算年月', visible: true, format: formatYYYYMM },
    { field: 'TltNo', header: '專櫃編號', visible: true },
    { field: 'TltName', header: '櫃位名稱', visible: true },
    { field: 'ContractNo', header: '契約編號', visible: true },
    { field: 'ContractSubNo', header: '契約子號', visible: true },
    { field: 'PUR_GUIDate', header: '租金', visible: true, format: formatAmount, align: 'right' },
    { field: 'GuiAmt', header: '發票金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'GuiNo', header: '發票號碼', visible: true },
    { field: 'GuiPrintTimes', header: '發票列印次數', visible: true },
    { field: 'IsPrinted', header: '是否已列印', visible: true, format: formatYN },

  ];
  constructor(
    public readonly tls2h010Service: Tls2h010Service,
    private readonly dropdown: DropdownApiService,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
    this.addButton = [
      { label: '預覽列印', icon: 'fa fa-file-pdf text-blue-500', action: (rowData: any) => { this.previewPrint(rowData); }, disabled: (rowData: any) => !rowData?.GuiNo }
    ];
  }

  previewPrint(rowData: any): void {
    const params: any = {
      GuiNo: rowData?.GuiNo ?? '',
      SamYyyymm: rowData.SamYyyymm ?? '',
      TltNo: rowData?.TltNo ?? ''
    };

    this.loading = true;
    this.messageService.blockUi();
    this.tls2h010Service.PrintTLS2H(params).pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); }))
      .subscribe({
        next: (res: any) => {
          const url = res.Data?.Print_URL || '';
          if (url) {
            window.open(environment.ApiUrl + url);
          }
        },
      });
  }

  onReprint(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      if (!this.selectedItems || this.selectedItems.length === 0) {
        this.messageService.infoBubble('請選擇要列印的發票', '提示');
        return;
      }

      const toYYYYMM = (val: any): string | null => {
        if (val === null || val === undefined || val === '') return null;
        // If already a yyyymm string
        if (typeof val === 'string') {
          const digits = val.replace(/\D/g, '');
          if (/^\d{6}$/.test(digits)) return digits;
          if (/^\d{8}$/.test(digits)) return digits.substring(0, 6);
        }
        let d: Date;
        if (val instanceof Date) d = val;
        else d = new Date(val);
        if (isNaN(d.getTime())) return null;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        return `${y}${m}`;
      };

      const selectedSnapshot = this.selectedItems.map(x => ({ ...x }));
      const obs = this.selectedItems.map(row => {
        const params: any = {
          GuiNo: row?.GuiNo ?? '',
          SamYyyymm: toYYYYMM(row?.SamYyyymm) ?? '',
          TltNo: row?.TltNo ?? ''
        };
        return this.tls2h010Service.RePrintTLS2H010(params);
      });

      this.loading = true;
      this.messageService.blockUi();

      forkJoin(obs).pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); }))
        .subscribe({
          next: async (responses: HttpResponse<Blob>[]) => {
            const files: { filename: string, blob: Blob }[] = [];
            const errors: string[] = [];

            for (const res of responses) {
              const contentDisposition = res.headers.get('content-disposition') || '';
              const contentTypeHeader = res.headers.get('content-type') || res.body?.type || '';

              // If server returned JSON in blob (error), read and parse
              if ((contentTypeHeader && contentTypeHeader.indexOf('application/json') !== -1) || !res.body || (res.body.size === 0)) {
                try {
                  const text = await (res.body?.text?.() ?? Promise.resolve(''));
                  if (text) {
                    const parsed = JSON.parse(text);
                    if (parsed?.Message) errors.push(parsed.Message);
                    else errors.push('伺服器回傳錯誤');
                  } else {
                    errors.push('伺服器未回傳檔案');
                  }
                } catch (err) {
                  console.error('parse error', err);
                  errors.push('解析錯誤回應失敗');
                }
                continue;
              }

              // determine filename
              let filename = 'reprint.pdf';
              if (contentDisposition) {
                const match = contentDisposition.match(/filename\*=UTF-8''(.+?)(;|$)/);
                if (match && match[1]) filename = decodeURIComponent(match[1]);
                else {
                  const m2 = contentDisposition.match(/filename="?([^";]+)"?/);
                  if (m2 && m2[1]) filename = m2[1];
                }
              }

              const bodyContent = res.body ?? new Blob();
              const blob = bodyContent instanceof Blob ? bodyContent : new Blob([bodyContent as any], { type: 'application/pdf' });
              if (blob.size === 0) {
                errors.push(`${filename} 空檔`);
              } else {
                files.push({ filename, blob });
              }
            }

            if (files.length === 0) {
              // debug: log responses
              console.debug('RePrint responses:', responses);
              // fallback: package raw responses (preserve order using selectedSnapshot)
              const zip = new JSZip();
              responses.forEach((res, idx) => {
                const bodyContent = res.body ?? new Blob();
                const blob = bodyContent instanceof Blob ? bodyContent : new Blob([bodyContent as any]);
                const item = selectedSnapshot[idx] || {} as any;
                const name = item?.GuiNo ? `${item.GuiNo}.bin` : `file_${idx + 1}.bin`;
                zip.file(name, blob);
              });
              const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
              zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
                saveAs(content, `RePrintTLS2H_fallback_${timestamp}.zip`);
                this.messageService.errorBubble(errors.join('\n') || '伺服器未回傳可用檔案，已打包 raw 回應供檢查', '錯誤');
              });
              return;
            }

            if (files.length === 1) {
              saveAs(files[0].blob, files[0].filename);
            } else {
              const zip = new JSZip();
              files.forEach(f => zip.file(f.filename, f.blob));
              const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
              zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
                saveAs(content, `RePrintTLS2H_${timestamp}.zip`);
              });
            }

            if (errors.length > 0) {
              this.messageService.warnBubble(errors.join('\n'), '部分檔案失敗');
            }
          },

        });
    });
  }

  ngOnInit(): void {
    this.initializePage('TLS2H010', 'tls/tls2h010cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onCreateInvoice(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const toYYYYMM = (val: any): string | null => {
        if (val === null || val === undefined || val === '') return null;
        let d: Date;
        if (val instanceof Date) d = val;
        else d = new Date(val);
        if (isNaN(d.getTime())) return null;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        return `${y}${m}`;
      };
      const sam = toYYYYMM(frm.value.SamYyyymm);

      this.loading = true;
      this.tls2h010Service.generateTLS2H010({ SamYyyymm: sam }).pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); })).subscribe({
        next: () => {
          this.messageService.successBubble('產生發票成功', '完成');
          // 可按需重新查詢
        },
        error: (err) => {
          console.error('generateTLS2H010 error', err);
          this.messageService.errorBubble('產生發票失敗', '錯誤');
        }
      });
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      const pageSize = raw.pageSize ?? 0;
      const pageIndex = raw.pageIndex ?? 0;
      const toYYYYMM = (val: any): string | null => {
        if (val === null || val === undefined || val === '') return null;
        let d: Date;
        if (val instanceof Date) d = val;
        else d = new Date(val);
        if (isNaN(d.getTime())) return null;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        return `${y}${m}`;
      };

      const body = {
        PageSize: pageSize,
        PageIndex: pageIndex,
        OrderBy: '',
        Offset: (Math.max(pageIndex - 1, 0) * pageSize),
        SortBy: raw.SortBy || [],
        SamYyyymm: toYYYYMM(raw.SamYyyymm),
        TltNo: raw.TltNo,
      };

      this.tls2h010Service.queryTLS2H010(body)
        .pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); }))
        .subscribe(res => {
          this.data = res?.Data || [];
          this.lastQueryBody = body;
          this.totalRecords = res?.TotalCount || 0;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }


}
