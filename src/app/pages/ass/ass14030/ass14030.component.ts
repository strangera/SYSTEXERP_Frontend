import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS14030Service } from '@service/api/ass/ass14030.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ASS14030QueryRow, QueryASS14030Request } from './ass14030.model';

//3.1.4.3  傳票審核傳送作業
@Component({
  selector: 'app-ass14030',
  templateUrl: './ass14030.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    CalendarRangeComponent,
    DropdownComponent,
    InputTextComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
export class ASS14030Component extends BasicQueryPageComponent<ASS14030QueryRow> implements OnInit {
  public readonly service = inject(ASS14030Service);
  private readonly destroyRef = inject(DestroyRef);

  queryForm = this.formBuilder.group({
    SrcSheetType: [[] as string[]], // 傳票種類
    VouDateS: [null as Date | null], // 傳票日期 起
    VouDateE: [null as Date | null], // 傳票日期 迄
    Trans_Status: [null as string | null], // 傳票狀態
    ORI_SLIP: ['', [Validators.maxLength(20)]], // 結帳單號
    pageSize: [1000],
    pageIndex: [1],
    SortBy: [[{ field: 'VouDate', order: -1 }]],
  });

  totalRecords = 0;
  data: ASS14030QueryRow[] = [];
  lastQueryBody: QueryASS14030Request | null = null; // 給 app-table-report 內部分頁/排序直接呼叫 queryFunction 用

  srcSheetTypeOptions = [
    { value: 'PC', label: '資材報廢' },
    { value: 'PD', label: '折舊' },
    { value: 'PM', label: '月結庫存' },
    { value: 'PS', label: '資材變賣' },
    { value: 'PU', label: '資材進貨' },
  ];

  transStatusOptions = [
    { value: '0', label: '未拋轉' },
    { value: '1', label: '已拋轉' },
  ];

  columns: ReportColumn[] = [
    { field: 'PayType', header: '應收(付)明細暫存資料', visible: true, type: 'link' },
    { field: 'VouNo', header: '傳票編號', visible: true },
    { field: 'Voucher_Name', header: '傳票種類', visible: true },
    { field: 'RECEIPT_INS_ID', header: '發票維護單號', visible: true },
    { field: 'VouDate', header: '傳票日期', visible: true, format: formatDate },
    { field: 'Trans_Status', header: '傳票狀態', visible: true },
    { field: 'Remark', header: '傳票摘要', visible: true },
    { field: 'ORI_SLIP', header: '結帳單號', visible: true },
  ];

  ngOnInit(): void {
    this.initializePage('ASS14030', 'ass/ass14030cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      const body: QueryASS14030Request = {
        ...raw,
        SrcSheetType: (raw.SrcSheetType ?? []).join(',') || null,
      };
      this.service.queryASS14030(body).pipe(
        this.withLoading(),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.lastQueryBody = body;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  onDetailData(row: ASS14030QueryRow): void {
    this.onDetail(row, this.queryForm.value);
  }

  onEditData(row: ASS14030QueryRow): void {
    this.onEdit(row, this.queryForm.value);
  }

  onLinkClick(event: { rowData: ASS14030QueryRow; field: string }): void {
    const receiptInsId = event.rowData?.RECEIPT_INS_ID;
    if (!receiptInsId) return;
    this.router.navigate(['/account/ass/ass14030paydetail'], {
      state: { RECEIPT_INS_ID: receiptInsId, fromRoute: this.router.url },
    });
  }
}
