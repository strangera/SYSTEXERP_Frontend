import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS17100Service } from '@service/api/ass/ass17100.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs/operators';
import { QueryASS17100Request, QueryASS17100Response } from './ass17100.model';

/** 耗材進耗存報表（查詢＋匯出 PDF） */
@UntilDestroy()
@Component({
  selector: 'app-ass17100',
  templateUrl: './ass17100.component.html',
  standalone: true,
  providers: [DatePipe],
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    ButtonModule,
  ],
})
export class ASS17100Component extends BasicQueryPageComponent<QueryASS17100Response> implements OnInit {
  readonly queryForm = this.formBuilder.nonNullable.group({
    DATE_S: [null as Date | null, Validators.required],
    DATE_E: [null as Date | null, Validators.required],
    WH_ID: [null as string | null],
    GOODS_ID: [null as string | null, Validators.required],
  });

  data: QueryASS17100Response[] = [];
  totalRecords = 0;
  exportLoading = false;

  warehouseOptions: { label: string; value: string }[] = [];
  goodsIdOptions: { label: string; value: string }[] = [];

  readonly columns: ReportColumn[] = [
    { field: 'TRANS_DATE', header: '日期', visible: true },
    { field: 'OPEN_QTY', header: '期初數量', visible: true, },
    { field: 'IN_QTY', header: '本期進貨', visible: true, },
    { field: 'ISSUE_QTY', header: '本期領用量', visible: true, },
    { field: 'RETURN_QTY', header: '本期退料', visible: true, },
    { field: 'ADJUST_QTY', header: '本期調整', visible: true, },
    { field: 'TRANSFER_QTY', header: '本期調撥', visible: true, },
    { field: 'DAMAGE_QTY', header: '本期報廢', visible: true, },
    { field: 'CLOSE_QTY', header: '本期期末', visible: true, },
  ];

  constructor(
    private readonly service: ASS17100Service,
    private readonly dropdownApi: DropdownApiService,
    private readonly dropDownListService: DropDownListService,
    private readonly datePipe: DatePipe,
    private readonly fileExportService: FileExportService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS17100', '', this.queryForm, frm => this.onSubmit(frm));
    this.loadDropdowns();
  }

  private loadDropdowns(): void {
    this.dropDownListService
      .queryFAHOS_DropDownList({})
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res.Status !== '0000') return;
        const list = res.Data ?? [];
        this.warehouseOptions = list
          .filter(x => (x.WH_ID ?? '').toString().trim() !== '')
          .map(x => ({
            value: (x.WH_ID ?? '').toString(),
            label: `${x.WH_ID ?? ''} - ${x.WH_NAME ?? ''}`.trim(),
          }));
      });

    this.dropdownApi
      .queryAss11040Dropdown()
      .pipe(untilDestroyed(this))
      .subscribe(options => {
        if (!options?.length) {
          this.goodsIdOptions = [];
          return;
        }
        this.goodsIdOptions = options
          .filter(o => String(o.value ?? '').trim() !== '')
          .map(o => ({
            value: String(o.value ?? ''),
            label: o.label ?? String(o.value ?? ''),
          }));
      });
  }

  private buildQueryBody(): QueryASS17100Request {
    const raw = this.queryForm.getRawValue();
    const dateS = raw.DATE_S ? this.datePipe.transform(raw.DATE_S, 'yyyy-MM-dd') ?? undefined : undefined;
    const dateE = raw.DATE_E ? this.datePipe.transform(raw.DATE_E, 'yyyy-MM-dd') ?? undefined : undefined;
    return {
      DATE_S: dateS ?? null,
      DATE_E: dateE ?? null,
      WH_ID: raw.WH_ID?.trim() ? raw.WH_ID : null,
      WH_NAME: null,
      GOODS_ID: raw.GOODS_ID?.trim() ? raw.GOODS_ID : null,
    };
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const body = removeEmptyValues(this.buildQueryBody());

      this.loading = true;
      this.service
        .queryASS17100(body)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe((res: ApiResponse<QueryASS17100Response[]>) => {
          if (res?.Status === '0000') {
            const rows = res.Data ?? [];
            this.data = rows.map((row, i) => ({
              ...row,
              ROW_UID: `${row.SEQ_NO ?? ''}_${row.TRANS_DATE ?? ''}_${i}`,
            }));
            this.totalRecords = res.TotalCount ?? this.data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
          } else {
            this.data = [];
            this.totalRecords = 0;
          }
        });
    });
  }

  onExportPdf(): void {
    if (this.queryForm.invalid) {
      this.submitted = true;
      this.messageService.warnBubble('請填寫統計日期（起訖）與品項編號');
      return;
    }

    const body = this.buildQueryBody();
    const export$ = this.service.exportPDFASS17100(body);
    this.fileExportService
      .executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', v => (this.exportLoading = v))
      .subscribe();
  }
}
