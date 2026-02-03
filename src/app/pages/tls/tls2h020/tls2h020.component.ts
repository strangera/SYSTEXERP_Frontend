import { AsyncPipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls2h020Service } from '@service/api/tls/tls2h020.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AddButton, ReportColumn, formatAmount } from '@shared/componentkit/table-report/table-report.model'; // 引入 ReportColumn
import { formatYYYYMM } from '@shared/componentkit/table/table.model';
import { saveAs } from 'file-saver';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';

// 2.2.17.1 租金發票套印作業
@Component({
  selector: 'app-tls2h020',
  templateUrl: './tls2h020.component.html',
  standalone: true,
  imports: [ButtonModule, InputTextRangeComponent, CalendarComponent, SelectButtonModule, TableReportComponent, AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, CheckboxModule, TranslateModule]
})
export class TLS2H020Component extends BasicQueryPageComponent<any> implements OnInit {
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
    { field: 'GuiAmt', header: '代扣款發票金額', visible: true, format: formatAmount, align: 'right' },
    //  { field: 'GuiAmt', header: '發票金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'GuiNo', header: '發票號碼', visible: true },
    { field: 'GuiPrintTimes', header: '發票列印次數', visible: true },
    { field: 'IsPrinted', header: '是否已列印', visible: true, format: (v: any) => (v ? '是' : '否') },
  ];
  constructor(
    public readonly tls2h020Service: Tls2h020Service,
    private readonly dropdown: DropdownApiService,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
    this.addButton = [
      { label: '預覽列印', icon: 'fa fa-file-pdf text-blue-500', action: (rowData: any) => { this.previewPrint(rowData); }, disabled: (rowData: any) => !rowData?.GuiNo }
    ];
  }

  onReprint(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      if (!this.selectedItems || this.selectedItems.length === 0) {
        this.messageService.infoBubble('請選擇要列印的發票', '提示');
        return;
      }

      const toYYYYMM = (val: any): string | null => {
        if (val === null || val === undefined || val === '') return null;
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

      this.tls2h020Service.RePrintTLS2H020(payload).pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); }))
        .subscribe({
          next: async (res: HttpResponse<Blob>) => {
            const contentDisposition = res.headers.get('content-disposition') || '';
            const contentTypeHeader = res.headers.get('content-type') || res.body?.type || '';

            if ((contentTypeHeader && contentTypeHeader.indexOf('application/json') !== -1) || !res.body || (res.body.size === 0)) {
              try {
                const text = await (res.body?.text?.() ?? Promise.resolve(''));
                if (text) {
                  const parsed = JSON.parse(text);
                  const msg = parsed?.Message || '伺服器回傳錯誤';
                } else {
                  this.messageService.errorBubble('伺服器未回傳檔案', '錯誤');
                }
              } catch (err) {
                this.messageService.errorBubble('解析錯誤回應失敗', '錯誤');
              }
              return;
            }

            let filename = `RePrintTLS2H020_${new Date().toISOString().replace(/[:.]/g, '-')}`;
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
                try { this.onSubmit(this.queryForm); } catch (e) { }
              } else {
                const textHeader = String.fromCharCode.apply(null, Array.from(header));
                if (textHeader.startsWith('%PDF')) {
                  if (!filename.toLowerCase().endsWith('.pdf')) filename += '.pdf';
                  saveAs(blob, filename);
                  try { this.onSubmit(this.queryForm); } catch (e) { }
                } else {
                  if (contentTypeHeader.indexOf('pdf') !== -1) {
                    if (!filename.toLowerCase().endsWith('.pdf')) filename += '.pdf';
                    saveAs(blob, filename);
                    try { this.onSubmit(this.queryForm); } catch (e) { }
                  } else if (contentTypeHeader.indexOf('zip') !== -1) {
                    if (!filename.toLowerCase().endsWith('.zip')) filename += '.zip';
                    saveAs(blob, filename);
                    try { this.onSubmit(this.queryForm); } catch (e) { }
                  } else {
                    if (!filename.toLowerCase().match(/\.(pdf|zip)$/)) filename += '.bin';
                    saveAs(blob, filename);
                    try { this.onSubmit(this.queryForm); } catch (e) { }
                  }
                }
              }
            } catch (err) {
              saveAs(blob, filename + '.bin');
              try { this.onSubmit(this.queryForm); } catch (e) { }
            }
          },

        });
    });
  }

  previewPrint(rowData: any): void {
    const params: any = {
      GuiNo: rowData?.GuiNo ?? '',
      SamYyyymm: rowData?.SamYyyymm ?? '',
      TltNo: rowData?.TltNo ?? ''
    };

    this.loading = true;
    this.messageService.blockUi();
    this.tls2h020Service.PrintTLS2H(params).pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); }))
      .subscribe({
        next: (res: any) => {
          const url = res.Data?.Print_URL || '';
          if (url) {
            window.open(environment.ApiUrl + url);
          }
        },
        error: (err: any) => {
          this.messageService.errorBubble(err?.message || '預覽列印失敗');
        }
      });
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
      this.tls2h020Service.generateTLS2H020({ SamYyyymm: sam }).pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); }))
        .subscribe({
          next: (res: any) => {
            try {
              if (res?.Data?.TotalCount > 0) {
                this.messageService.successBubble(`產生${res.Data.SuccessCount}張發票`, '成功');
              } else {
                this.messageService.warnBubble('本月無產生發票需求', '警告');
              }
            } catch (e) {
              console.error('generateTLS2H020 parse result error', e);
              this.messageService.successBubble('產生發票成功', '完成');
            }
            try { this.onSubmit(frm); } catch (e) { /* ignore */ }
          },
        });
    });
  }
  ngOnInit(): void {
    this.initializePage('TLS2H020', 'tls/tls2h020cru', this.queryForm, (form) => this.onSubmit(form));
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
        GuiNoStart: raw.GuiNoStart,
        GuiNoEnd: raw.GuiNoEnd,
      };

      this.tls2h020Service.queryTLS2H020(body)
        .pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); }))
        .subscribe(res => {
          this.data = res?.Data || [];
          this.lastQueryBody = body;
          this.totalRecords = res?.TotalCount || 0;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  /** 支援 table lazy load / 滾動分頁（上捲觸發） */
  override onLazyLoadData(event: any, frm: FormGroup) {
    super.onLazyLoadData(event, frm);
    this.queryStateService.setQueryState(this.ProgNo, frm.value);

    this.loading = true;
    const formValue = frm.value;
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

    const payload = {
      PageSize: formValue.pageSize || 30,
      PageIndex: formValue.pageIndex || 1,
      OrderBy: formValue.SortBy?.[0]?.field || '',
      Offset: (Math.max((formValue.pageIndex || 1) - 1, 0) * (formValue.pageSize || 30)),
      SortBy: formValue.SortBy || [],
      SamYyyymm: toYYYYMM(formValue.SamYyyymm),
      TltNo: formValue.TltNo,
      GuiNoStart: formValue.GuiNoStart,
      GuiNoEnd: formValue.GuiNoEnd,
    };

    this.tls2h020Service.queryTLS2H020(payload).pipe(untilDestroyed(this)).subscribe({
      next: (res) => {
        const incoming = res?.Data || [];
        const pageIndex = formValue.pageIndex || 1;
        if (pageIndex > 1) {
          this.data = [...(this.data || []), ...incoming];
        } else {
          this.data = incoming;
        }
        this.totalRecords = res?.TotalCount ?? this.data.length;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }


}
