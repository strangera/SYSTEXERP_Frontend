/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls2h010Service } from '@service/api/tls/tls2h010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextRangeComponent } from '@shared/components/input-text-range/input-text-range.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn, formatAmount } from '@shared/components/table-report/table-report.model'; // 引入 ReportColumn
import { formatYYYYMM } from '@others/component/table/table.model';
import { saveAs } from 'file-saver';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import { finalize, map } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

// 2.2.17.1 租金發票套印作業
@Component({
  selector: 'app-tls2h010',
  templateUrl: './tls2h010.component.html',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextRangeComponent,
    CalendarComponent,
    SelectButtonModule,
    TableReportComponent,
    AsyncPipe,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CheckboxModule,
    TranslateModule,
    MultiSelectComponent,
    DialogComponent,
    DropdownComponent
  ]
})
export class TLS2H010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    // 分頁欄位
    pageSize: [1000],
    pageIndex: [1],
    SamYyyymm: [new Date(), Validators.required],
    GuiNoStart: [null],
    GuiNoEnd: [null],
    TltNo: [null],
    SortBy: [[{ field: 'TltNo', order: 1 }]],
  });

  dialogForm = this.formBuilder.group({
    SMTP_No: [null, [Validators.required]],
  });

  lastQueryBody: any = null;
  totalRecords = 0;
  data: any[] = [];
  selectedItems: any[] = [];
  tlt_noOptions = this.dropdown.queryTltTalent();
  SMTP_NoOptions = this.dropdown.queryNTY1001_DropDownList();
  dialogVisible = false;
  dialogLoading = false;
  columns: ReportColumn[] = [
    { field: 'SamYyyymm', header: '結算年月', visible: true, format: formatYYYYMM },
    { field: 'TltNo', header: '專櫃編號', visible: true },
    { field: 'TltName', header: '櫃位名稱', visible: true },
    { field: 'ContractNo', header: '契約編號', visible: true },
    { field: 'ContractSubNo', header: '版本編號', visible: true },
    { field: 'GuiAmt', header: '租金發票金額', visible: true, format: formatAmount, align: 'right' },
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

  private toYYYYMM(val: any): string | null {
    if (val === null || val === undefined || val === '') return null;
    if (typeof val === 'string') {
      const digits = val.replace(/\D/g, '');
      if (/^\d{6}$/.test(digits)) return digits;
      if (/^\d{8}$/.test(digits)) return digits.substring(0, 6);
    }
    const d = val instanceof Date ? val : new Date(val);
    if (isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}${m}`;
  }

  private buildSelectList(): { GuiNo: string; SamYyyymm: string; TltNo: string }[] {
    return this.selectedItems.map(row => ({
      GuiNo: row?.GuiNo ?? '',
      SamYyyymm: this.toYYYYMM(row?.SamYyyymm) ?? '',
      TltNo: row?.TltNo ?? ''
    }));
  }

  private buildAutoMailSelectList(): { GuiNo: string; SamYyyymm: string; TltNo: string; VEN_Name: string; email: string }[] {
    return this.selectedItems.map(row => ({
      GuiNo: row?.GuiNo ?? '',
      SamYyyymm: this.toYYYYMM(row?.SamYyyymm) ?? '',
      TltNo: row?.TltNo ?? '',
      VEN_Name: row?.VEN_Name ?? '',
      email: row?.email ?? ''
    }));
  }

  private extractFilename(contentDisposition: string, fallback: string): string {
    const match = /filename\*=UTF-8''(.+?)(;|$)/.exec(contentDisposition) || /filename="?([^";]+)"?/.exec(contentDisposition);
    return match?.[1] ? decodeURIComponent(match[1]) : fallback;
  }

  onReprint(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      if (!this.selectedItems || this.selectedItems.length === 0) {
        this.messageService.infoBubble('請選擇要列印的發票', '提示');
        return;
      }

      const selectList = this.buildSelectList();

      this.loading = true;
      this.messageService.blockUi();

      this.tls2h010Service.RePrintTLS2H010({ selectList })
        .pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); }))
        .subscribe(res => {
          const filename = this.extractFilename(res.headers.get('content-disposition') || '', `租金發票套印_${selectList[0].SamYyyymm}.pdf`);
          saveAs(res.body ?? new Blob(), filename);
          this.selectedItems = [];
          this.onSubmit(this.queryForm);
        });
    });
  }

  autoMail(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const body = {
        SMTP_No: frm.value.SMTP_No,
        selectList: this.buildAutoMailSelectList()
      };

      this.dialogLoading = true;
      this.tls2h010Service.autoMailTLS2H010(body)
        .pipe(untilDestroyed(this), finalize(() => {
          this.dialogLoading = false;
          this.dialogVisible = false;
          this.loading = false;
        }))
        .subscribe(res => {
          this.messageService.successBubble(res.Message);
        });
    });
  }

  ngOnInit(): void {
    this.initializePage('TLS2H010', 'tls/tls2h010cru', this.queryForm, (form) => this.onSubmit(form));
    // 初始化 lastQueryBody，確保 table-report 在尚未查詢前也能響應排序操作
    try {
      const raw = this.queryForm.getRawValue();
      this.lastQueryBody = {
        pageSize: raw.pageSize ?? 1000,
        pageIndex: raw.pageIndex ?? 1,
        SortBy: raw.SortBy ?? [],
      };
    } catch { }
  }

  onCreateInvoice(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const sam = this.toYYYYMM(frm.value.SamYyyymm);

      this.loading = true;
      this.tls2h010Service.generateTLS2H010({ SamYyyymm: sam }).pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); })).subscribe({
        next: (res: any) => {
          if (res?.Data?.TotalCount > 0) {
            this.messageService.successBubble(`產生${res.Data.SuccessCount}張發票`, '成功');
          } else {
            this.messageService.warnBubble('本月無產生發票需求', '警告');
          }
          this.onSubmit(frm);
        },
      });
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      const pageSize = raw.pageSize ?? 0;
      const pageIndex = raw.pageIndex ?? 0;

      const body = {
        pageSize: pageSize,
        pageIndex: pageIndex,
        SortBy: raw.SortBy || [],
        SamYyyymm: this.toYYYYMM(raw.SamYyyymm),
        GuiNoStart: raw.GuiNoStart ?? null,
        GuiNoEnd: raw.GuiNoEnd ?? null,
        TltNo: raw.TltNo,
      };

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
