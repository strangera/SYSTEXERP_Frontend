import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin24020Service } from '@service/api/fin/fin24020.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, formatDate, formatYN } from '@shared/componentkit/table/table.model';
import { QueryStateService } from '@shared/service/query-state.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize, map } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { formatAmount, formatYYYYMM } from './../../../shared/componentkit/table-report/table-report.model';
//1.3.2.1 應收帳款維護
@Component({
  selector: 'app-fin24020',
  templateUrl: './fin24020.component.html',
  standalone: true,
  imports: [AsyncPipe, CalendarRangeQuickComponent, TableComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, CalendarComponent, InputNumberRangeComponent, InputTextComponent, ButtonComponent, TranslateModule]
})
export class FIN24020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    ACP_No: [null, [Validators.maxLength(14)]],
    VEN_No: [null],
    ACP_YYYYMM: [null],
    Acp_TermNo: [null, [Validators.maxLength(2)]],
    RetDate_To: [null],
    RetDate_From: [null],
    RetAmt_To: [null],
    RetAmt_From: [null],
    PayGenerated: [null],
    Remark: [null, [Validators.maxLength(200)]],
  });
  pageSize = 30;
  pageIndex = 1;
  sortBy = '';
  totalRecords = 0;
  data: any[] = [];
  lastQueryBody: any | null = null;
  expansionRowsPerPageOptions: number[] = [30, 60, 90, 120, 150];
  detailColumns: ReportColumn[] = [
    // { field: 'ACP_No', header: '應付ID' },
    { field: 'ACP_YYYYMM', header: '應付帳款年月', format: formatYYYYMM },
    { field: 'acp_termno', header: '帳次' },
    // { field: 'VEN_No', header: '廠商編號' },
    // { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'ACP_Amt', header: '應付金額', format: formatAmount, align: 'right' },
    { field: 'ACP_BalanceAmt', header: '應付帳款餘額', format: formatAmount, align: 'right' },
    { field: 'RET_Amt', header: '退保留款金額', format: formatAmount, align: 'right' },
    { field: 'RET_Date', header: '退保留款日期', format: formatDate },
    { field: 'STATUS', header: '是否已付款', format: formatYN },
  ];
  columns: ReportColumn[] = [
    { field: 'ACP_No', header: '應付ID' },
    { field: 'VEN_No', header: '廠商編號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'ACP_YYYYMM', header: '應付帳款年月', format: formatYYYYMM },

  ];
  VEN_No_ParamOptions = this.dropDown.queryPos2013({ VEN_Flag: '' }); // 廠商編號
  PTA_KeyOptions = [
    { label: '是', value: 'Y' },
    { label: '否', value: 'N' },

  ];
  constructor(
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe,
    public readonly fin24020Service: Fin24020Service,
    override readonly queryStateService: QueryStateService,
  ) {
    super();
  }

  editDisabledByVouNo = (rowData: any): boolean => {
    if (!rowData) {
      return false;
    }
    const hasVouNo = !!rowData.VouNo;
    const isPayGeneratedYes = rowData.STATUS === '是';
    return hasVouNo || isPayGeneratedYes;
  }

  ngOnInit(): void {
    this.initializePage('FIN24020', 'fin/FIN24020cru', this.queryForm, (form) => this.onSubmit(form));
    const state = this.router.lastSuccessfulNavigation?.extras.state;
    if (state?.['queryConditions']) {
      try { this.queryForm.patchValue(state['queryConditions'], { emitEvent: false }); } catch (e) { /* ignore */ }
    }

  }

  queryFIN24020WithStatusLabel(body: any) {
    return this.fin24020Service.queryFIN24020(body).pipe(
      map((res: any) => {
        const wrappers = res?.Data ?? [];
        const mappedRows = wrappers.map((w: any) => {
          const row = { ...(w.Data ?? {}), Details: w.Details ?? [] } as any;
          row.STATUS = this.PTA_KeyOptions.find(opt => String(opt.value) === String(row.STATUS))?.label ?? row.STATUS;
          return row;
        });
        return { ...res, Data: mappedRows };
      })
    );
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      let acpYyyymm = '';
      const rawAcpYyyymm = frm.value.ACP_YYYYMM;
      if (rawAcpYyyymm) {
        const formatted = this.datePipe.transform(rawAcpYyyymm, 'yyyyMM');
        acpYyyymm = formatted ?? '';
      }
      const rawRetFrom = frm.value.RetDate_From;
      const rawRetTo = frm.value.RetDate_To;
      const retDateFrom = rawRetFrom
        ? this.datePipe.transform(rawRetFrom, 'yyyy-MM-dd')
        : null;
      const retDateTo = rawRetTo
        ? this.datePipe.transform(rawRetTo, 'yyyy-MM-dd')
        : null;

      const body: any = {
        PageSize: this.pageSize,
        PageIndex: this.pageIndex,
        Offset: 0,
        OrderBy: this.sortBy ?? '',
        SortBy: (this as any).sortMeta ?? (this.sortBy ? [{ field: this.sortBy, order: (this as any).sortOrder ?? 1 }] : []),
        ACP_No: frm.value.ACP_No ?? '',
        VEN_No: frm.value.VEN_No ?? '',
        ACP_YYYYMM: acpYyyymm,
        Acp_TermNo: frm.value.Acp_TermNo ?? null,
        RetDate_From: retDateFrom,
        RetDate_To: retDateTo,
        RetAmt_From: frm.value.RetAmt_From ?? null,
        RetAmt_To: frm.value.RetAmt_To ?? null,
        PayGenerated: frm.value.PayGenerated ?? '',
        Remark: frm.value.Remark ?? ''
      };

      try { this.queryStateService.setQueryState(this.ProgNo, body); } catch (e) { /* ignore */ }

      try { this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue()); } catch (e) { /* ignore */ }

      this.queryFIN24020WithStatusLabel(body)
        .pipe(finalize(() => this.loading = false), untilDestroyed(this))
        .subscribe(response => {
          const rows = response.Data ?? [];
          this.data = rows;
          this.totalRecords = response.TotalCount ?? 0;
          this.lastQueryBody = body;
        });
    });
  }

  handleLazyLoad(event: any) {
    if (!event) return;
    this.pageIndex = event.pageIndex ?? this.pageIndex ?? 1;
    this.pageSize = event.pageSize ?? this.pageSize ?? 30;
    // 處理排序：table 會傳入 SortBy (array of SortMeta)，取第一個欄位作為主要排序欄
    try {
      const sb = event.SortBy ?? event.SortBy ?? null;
      if (sb && Array.isArray(sb) && sb.length > 0) {
        this.sortBy = String(sb[0].field || '');
      } else {
        this.sortBy = '';
      }
    } catch (e) {
      this.sortBy = '';
    }
    // 觸發查詢，保留當前 queryForm 條件
    this.onSubmit(this.queryForm);
  }

  override onDetail(row: any, queryConditions?: any) {
    super.onDetail(row, queryConditions);
  }
  printColumns: Column[] = [
    { field: 'ACP_No', header: '應付ID' },
    { field: 'VEN_No', header: '廠客代號' },
    { field: 'VEN_Name', header: '廠客名稱' },
    { field: 'ACP_YYYYMM', header: '應付帳款年月' },
    { field: 'acp_termno', header: '帳次' },
    { field: 'ACP_Amt', header: '應付金額', format: formatAmount },
    { field: 'ACP_BalanceAmt', header: '應付帳款餘額', format: formatAmount },
    { field: 'RET_Amt', header: '退保留款金額', format: formatAmount },
    { field: 'RET_Date', header: '退保留款日期', format: formatDate },
    { field: 'STATUS', header: '是否已付款', format: formatYN }
  ];
  onExport(event: string) {
  }
}
