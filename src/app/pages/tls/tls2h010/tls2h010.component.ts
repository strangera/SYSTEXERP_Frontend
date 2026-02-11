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
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn, formatAmount } from '@shared/componentkit/table-report/table-report.model'; // 引入 ReportColumn
import { AddButton, formatYYYYMM } from '@shared/componentkit/table/table.model';
import { saveAs } from 'file-saver';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import { finalize, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';

// 2.2.17.1 租金發票套印作業
@Component({
  selector: 'app-tls2h010',
  templateUrl: './tls2h010.component.html',
  standalone: true,
  imports: [ButtonModule, InputTextRangeComponent, CalendarComponent, SelectButtonModule, TableReportComponent, AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, CheckboxModule, TranslateModule]
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
    { field: 'ContractSubNo', header: '版本編號', visible: true },
    { field: 'PUR_GUIDate', header: '租金', visible: true, format: formatAmount, align: 'right' },
    { field: 'GuiAmt', header: '發票金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'GuiNo', header: '發票號碼', visible: true },
    { field: 'GuiPrintTimes', header: '發票列印次數', visible: true },
    { field: 'IsPrinted', header: '是否已列印', visible: true, format: (v: any) => (v ? '是' : '否') },

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

  // Wrapper for table-report: convert SortBy array into OrderBy string for backend
  queryWithSort(body: any) {
    const params = { ...body };
    try {
      const sort = params.SortBy ?? params.sortBy ?? [];
      if (Array.isArray(sort) && sort.length > 0) {
        const parts = sort.map((s: any) => {
          const field = s.field ?? s.fieldName ?? s.SortField ?? '';
          const order = s.order === -1 ? 'DESC' : 'ASC';
          return `${field} ${order}`;
        }).filter((p: string) => p.trim().length > 0);
        if (parts.length > 0) params.OrderBy = parts.join(',');
      }
    } catch { }
    return this.tls2h010Service.queryTLS2H010(params).pipe(map((res: any) => {
      try {
        const sort = params.SortBy ?? params.sortBy ?? [];
        if (Array.isArray(sort) && sort.length > 0 && res && Array.isArray(res.Data)) {
          res.Data = this.applySortToArray(res.Data, sort);
        }
      } catch { }
      return res;
    }));
  }

  private applySortToArray(arr: any[], sort: any[]): any[] {
    if (!Array.isArray(arr) || !Array.isArray(sort) || sort.length === 0) return arr;
    const cmp = (a: any, b: any, field: string, dir: number) => {
      const va = a?.[field];
      const vb = b?.[field];
      if (va == null && vb == null) return 0;
      if (va == null) return -1 * dir;
      if (vb == null) return 1 * dir;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      if (sa < sb) return -1 * dir;
      if (sa > sb) return 1 * dir;
      return 0;
    };
    const copy = [...arr];
    copy.sort((a, b) => {
      for (const s of sort) {
        const field = s.field ?? s.fieldName ?? s.SortField ?? '';
        const dir = s.order === -1 ? -1 : 1;
        const r = cmp(a, b, field, dir);
        if (r !== 0) return r;
      }
      return 0;
    });
    return copy;
  }

  private buildOrderByFromSort(sort: any): string {
    try {
      const arr = sort ?? [];
      if (!Array.isArray(arr) || arr.length === 0) return '';
      const parts = arr.map((s: any) => {
        const field = s.field ?? s.fieldName ?? s.SortField ?? '';
        const order = s.order === -1 ? 'DESC' : 'ASC';
        return `${field} ${order}`;
      }).filter((p: string) => p.trim().length > 0);
      return parts.join(',');
    } catch {
      return '';
    }
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

      const selectList = this.selectedItems.map(row => ({
        GuiNo: row?.GuiNo ?? '',
        SamYyyymm: toYYYYMM(row?.SamYyyymm) ?? '',
        TltNo: row?.TltNo ?? ''
      }));

      const payload = { selectList };

      this.loading = true;
      this.messageService.blockUi();

      this.tls2h010Service.RePrintTLS2H010(payload).pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); }))
        .subscribe({
          next: async (res: HttpResponse<Blob>) => {
            const errors: string[] = [];

            const contentDisposition = res.headers.get('content-disposition') || '';
            const contentTypeHeader = res.headers.get('content-type') || res.body?.type || '';

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
            } else {
              // determine filename
              let filename = `RePrintTLS2H_${new Date().toISOString().replace(/[:.]/g, '-')}`;
              if (contentDisposition) {
                const match = contentDisposition.match(/filename\*=UTF-8''(.+?)(;|$)/);
                if (match && match[1]) filename = decodeURIComponent(match[1]);
                else {
                  const m2 = contentDisposition.match(/filename="?([^";]+)"?/);
                  if (m2 && m2[1]) filename = m2[1];
                }
              }
              const blob = res.body ?? new Blob();
              try {
                const arr = await blob.slice(0, 8).arrayBuffer();
                const header = new Uint8Array(arr);
                const headerText = Array.from(header).map(b => b.toString(16).padStart(2, '0')).join('');
                const first4 = headerText.slice(0, 8).toUpperCase();
                if (first4.startsWith('504B0304')) {
                  if (!filename.toLowerCase().endsWith('.zip')) filename += '.zip';
                  saveAs(blob, filename);
                  try { this.onSubmit(this.queryForm); } catch (e) { /* ignore */ }
                } else {
                  const textHeader = String.fromCharCode.apply(null, Array.from(header));
                  if (textHeader.startsWith('%PDF')) {
                    if (!filename.toLowerCase().endsWith('.pdf')) filename += '.pdf';
                    saveAs(blob, filename);
                    try { this.onSubmit(this.queryForm); } catch (e) { /* ignore */ }
                  } else {
                    if (contentTypeHeader.indexOf('pdf') !== -1) {
                      if (!filename.toLowerCase().endsWith('.pdf')) filename += '.pdf';
                      saveAs(blob, filename);
                      try { this.onSubmit(this.queryForm); } catch (e) { /* ignore */ }
                    } else if (contentTypeHeader.indexOf('zip') !== -1) {
                      if (!filename.toLowerCase().endsWith('.zip')) filename += '.zip';
                      saveAs(blob, filename);
                      try { this.onSubmit(this.queryForm); } catch (e) { /* ignore */ }
                    } else {
                      if (!filename.toLowerCase().match(/\.(pdf|zip)$/)) filename += '.bin';
                      saveAs(blob, filename);
                      try { this.onSubmit(this.queryForm); } catch (e) { /* ignore */ }
                    }
                  }
                }
              } catch (err) {
                console.error('sniff error', err);
                // fallback save
                saveAs(blob, filename + '.bin');
                try { this.onSubmit(this.queryForm); } catch (e) { /* ignore */ }
              }
            }
            if (errors.length > 0) {
              this.messageService.errorBubble(errors.join('\n') || '列印失敗', '錯誤');
            }
          },
        });
    });
  }

  ngOnInit(): void {
    this.initializePage('TLS2H010', 'tls/tls2h010cru', this.queryForm, (form) => this.onSubmit(form));
    // 初始化 lastQueryBody，確保 table-report 在尚未查詢前也能響應排序操作
    try {
      const raw = this.queryForm.getRawValue();
      this.lastQueryBody = {
        PageSize: raw.pageSize ?? 30,
        PageIndex: raw.pageIndex ?? 1,
        SortBy: raw.SortBy ?? [],
      };
    } catch { }
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
        next: (res: any) => {
          try {
            if (res?.Data?.TotalCount > 0) {
              this.messageService.successBubble(`產生${res.Data.SuccessCount}張發票`, '成功');
            } else {
              this.messageService.warnBubble('本月無產生發票需求', '警告');
            }
          } catch (e) {
            console.error('generateTLS2H010 parse result error', e);
            this.messageService.successBubble('產生發票成功', '完成');
          }
          try { this.onSubmit(frm); } catch (e) { /* ignore */ }
        },

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
        GuiNoStart: raw.GuiNoStart ?? null,
        GuiNoEnd: raw.GuiNoEnd ?? null,
        TltNo: raw.TltNo,
      };

      // Ensure OrderBy is populated from SortBy for back-end compatibility
      try { body.OrderBy = this.buildOrderByFromSort(body.SortBy); } catch { body.OrderBy = ''; }

      this.tls2h010Service.queryTLS2H010(body)
        .pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); }))
        .subscribe(res => {
          try {
            const sort = body.SortBy || [];
            if (Array.isArray(sort) && sort.length > 0 && res && Array.isArray(res.Data)) {
              this.data = this.applySortToArray(res.Data, sort);
            } else {
              this.data = res?.Data || [];
            }
          } catch {
            this.data = res?.Data || [];
          }
          this.lastQueryBody = body;
          this.totalRecords = res?.TotalCount || 0;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }


}
