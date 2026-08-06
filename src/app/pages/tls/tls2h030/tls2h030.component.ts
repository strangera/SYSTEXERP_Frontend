/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls2h030Service } from '@service/api/tls/tls2h030.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
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
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';

// 2.2.17.1 租金發票套印作業
@Component({
  selector: 'app-tls2h030',
  templateUrl: './tls2h030.component.html',
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
    DropdownComponent,
    DialogComponent,
    CheckboxModule,
    TranslateModule,
    MultiSelectComponent
  ]
})
export class TLS2H030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    pageSize: [1000],
    pageIndex: [1],
    SamYyyymm: [new Date(), Validators.required],
    GuiNoStart: [null],
    GuiNoEnd: [null],
    TltNo: [null],
    COMM_MONEY_TYPE: [''],
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
  money_typeOptions = getSYS1000Options('money_type');
  SMTP_NoOptions = this.dropdown.queryNTY1001_DropDownList();
  dialogVisible = false;
  dialogLoading = false;
  columns: ReportColumn[] = [
    { field: 'SamYyyymm', header: '結算年月', visible: true, format: formatYYYYMM },
    { field: 'TltNo', header: '專櫃編號', visible: true },
    { field: 'TltName', header: '櫃位名稱', visible: true },
    { field: 'ContractNo', header: '契約編號', visible: true },
    { field: 'ContractSubNo', header: '版本編號', visible: true },
    { field: 'GuiAmt', header: '抽成發票金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'GuiNo', header: '發票號碼', visible: true },
    { field: 'GuiPrintTimes', header: '發票列印次數', visible: true },
    { field: 'IsPrinted', header: '是否已列印', visible: true, format: (v: any) => (v ? '是' : '否') },

  ];
  constructor(
    public readonly tls2h030Service: Tls2h030Service,
    private readonly dropdown: DropdownApiService,
  ) {
    super();
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

      this.tls2h030Service.RePrintTLS2H030({ selectList })
        .pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); }))
        .subscribe(res => {
          const filename = this.extractFilename(res.headers.get('content-disposition') || '', `抽成發票套印_${selectList[0].SamYyyymm}.pdf`);
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
      this.tls2h030Service.autoMailTLS2H030(body)
        .pipe(untilDestroyed(this), finalize(() => {
          this.loading = false;
          this.dialogLoading = false;
          this.dialogVisible = false;
        }))
        .subscribe(res => {
          this.messageService.successBubble(res.Message);
        });
    });
  }

  ngOnInit(): void {
    this.initializePage('TLS2H030', 'tls/tls2h030cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onCreateInvoice(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const sam = this.toYYYYMM(frm.value.SamYyyymm);

      this.loading = true;
      this.tls2h030Service.generateTLS2H030({ SamYyyymm: sam, MoneyType: frm.value.COMM_MONEY_TYPE }).pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); }))
        .subscribe({
          next: (res: any) => {
            try {
              if (res?.Data?.TotalCount > 0) {
                this.messageService.successBubble(`產生${res.Data.SuccessCount}張發票`, '成功');
              } else {
                this.messageService.warnBubble('本月無產生發票需求', '警告');
              }
            } catch (e) {
              console.error('generateTLS2H030 parse result error', e);
              this.messageService.successBubble('產生發票成功', '完成');
            }
            try { this.onSubmit(frm); } catch { /* ignore */ }
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
        TltNo: raw.TltNo,
        GuiNoStart: raw.GuiNoStart,
        GuiNoEnd: raw.GuiNoEnd,
        MoneyType: raw.COMM_MONEY_TYPE,
      };

      this.tls2h030Service.queryTLS2H030(body)
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

    const payload = {
      pageSize: formValue.pageSize || 1000,
      pageIndex: formValue.pageIndex || 1,
      SortBy: formValue.SortBy || [],
      SamYyyymm: this.toYYYYMM(formValue.SamYyyymm),
      TltNo: formValue.TltNo,
      GuiNoStart: formValue.GuiNoStart,
      GuiNoEnd: formValue.GuiNoEnd,
      MoneyType: formValue.COMM_MONEY_TYPE,
    };

    this.tls2h030Service.queryTLS2H030(payload).pipe(untilDestroyed(this)).subscribe({
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

    });
  }


}
