import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls2e060Data, Tls2e060QueryBody, Tls2e060Service } from '@service/api/tls/tls2e060.service';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatDateTime, ReportColumn } from '@shared/components/table-report/table-report.model';
import { convertDateToYYYYMM, formatAmount, formatDate } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';

// 2.2.14.6 專櫃結帳前調整作業
@Component({
  selector: 'app-tls2e060',
  templateUrl: './tls2e060.component.html',
  standalone: true,
  imports: [TableReportComponent, InputTextComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, TranslateModule]
})
export class TLS2E060Component extends BasicQueryPageComponent<Tls2e060Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    adj_no: [null, [Validators.maxLength(12)]],
    adj_date: [null],
    sam_yyymm: [null],
    pageSize: [1000],
    pageIndex: [1],
    SortBy: [[{ field: 'CRT_Date', order: -1 }]],
  });
  lastQueryBody: Tls2e060QueryBody | null = null;
  adj_taxtypeOptions = getSYS1000Options('adj_taxtype'); // 調整稅別選項
  totalRecords = 0;
  data: Tls2e060Data[] = [];
  selectedItems: Tls2e060Data[] = [];
  columns: ReportColumn[] = [
    { field: 'adj_no', header: '調整單號', visible: true },
    { field: 'adj_date', header: '調整日期', visible: true, format: formatDate },
    { field: 'sam_yyymm', header: '調整年月', visible: true, format: (v) => convertDateToYYYYMM(v) },
    { field: 'money_type_desc', header: '結帳方式', visible: true },
    { field: 'sam_termno', header: '帳次', visible: true },
    { field: 'contract_no', header: '契約編號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'adj_taxtype', header: '調整稅別', visible: true, format: (v) => getSYS1000('PLU_TaxType', v) }, // 0=免稅, 1=應稅
    { field: 'adj_amount', header: '調整金額', visible: true, format: formatAmount },
    { field: 'remarks', header: '備註', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員名稱', visible: false },
    { field: 'UPD_Date', header: '修改日期', visible: false, format: formatDateTime },
    { field: 'UPD_USR_No', header: '修改人員', visible: false },
    { field: 'UPD_USR_Name', header: '修改人員名稱', visible: false },
  ];
  constructor(
    public readonly tls2e060Service: Tls2e060Service,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2E060', '/tls/tls2e060cru', this.queryForm, () => this.onSubmit(this.queryForm));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.getRawValue(),
        adj_date: this.datePipe.transform(frm.value.adj_date, 'yyyy-MM-dd'),
        sam_yyymm: this.datePipe.transform(frm.value.sam_yyymm, 'yyyyMM'),
      };
      this.tls2e060Service.queryTls2e060(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.lastQueryBody = body;
        this.data = response.Data || [];
        this.totalRecords = response.TotalCount || 0;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  isRowSelectable(row: Tls2e060Data) {
    return row.sale_lock !== 'Y';
  }

  editDisabled(row: Tls2e060Data) {
    return row.sale_lock === 'Y';
  }

  onDelete(selectedItems: Tls2e060Data[]) {
    this.messageService.confirm({
      header: `是否確認刪除 ${selectedItems.length} 筆資料？`,
      accept: () => {
        this.tls2e060Service.deleteTls2e060({
          adj_nos: selectedItems.map(item => item.adj_no)
        }).subscribe((res) => {
          if (res.Status === '0000') {
            this.messageService.successBubble('刪除成功');
            this.selectedItems = [];
            this.onSubmit(this.queryForm);
          } else {
            this.messageService.errorBubble(res.Message);
          }
        });
      }
    });
  }
}
