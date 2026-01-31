import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls2h030Service } from '@service/api/tls/tls2h030.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn, formatAmount } from '@shared/componentkit/table-report/table-report.model'; // 引入 ReportColumn
import { AddButton, formatYN, formatYYYYMM } from '@shared/componentkit/table/table.model';
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
  selector: 'app-tls2h030',
  templateUrl: './tls2h030.component.html',
  standalone: true,
  imports: [ButtonModule, InputNumberRangeComponent, CalendarComponent, SelectButtonModule, TableReportComponent, AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, CheckboxModule, TranslateModule]
})
export class TLS2H030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    // 分頁欄位
    pageSize: [30],
    pageIndex: [1],
    SamYyyymm: [new Date(), Validators.required],
    GuiNoStart: [null],
    GuiNoEnd: [null],
    TltNo: [''],
    COMM_MONEY_TYPE: [''],
    SortBy: [[{ field: 'TltNo', order: 1 }]],
  });

  lastQueryBody: any = null;
  totalRecords = 0;
  data: any[] = [];
  selectedItems: any[] = [];
  tlt_noOptions = this.dropdown.queryTltTalent();
  money_typeOptions = getSYS1000Options('money_type');
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
    { field: 'IsPrinted', header: '是否已列印', visible: true, format: formatYN },

  ];
  addButton: AddButton[] = [];
  constructor(
    public readonly tls2h030Service: Tls2h030Service,
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
      SamYyyymm: rowData?.SamYyyymm ?? '',
      TltNo: rowData?.TltNo ?? ''
    };

    this.loading = true;
    this.messageService.blockUi();
    this.tls2h030Service.PrintTLS2H(params).pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); }))
      .subscribe({
        next: (res: any) => {
          const url = res.Data?.Print_URL || '';
          if (url) {
            window.open(environment.ApiUrl + url);
          }
        },
      });
  }

  ngOnInit(): void {
    this.initializePage('TLS2H030', 'tls/tls2h030cru', this.queryForm, (form) => this.onSubmit(form));
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
      this.tls2h030Service.generateTLS2H030({ SamYyyymm: sam }).pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); }))
        .subscribe({
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
        GuiNoStart: raw.GuiNoStart,
        GuiNoEnd: raw.GuiNoEnd,
        COMM_MONEY_TYPE: raw.COMM_MONEY_TYPE,
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
      COMM_MONEY_TYPE: formValue.COMM_MONEY_TYPE,
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
