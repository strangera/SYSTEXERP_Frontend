import { DropdownApiService } from '@service/utility/dropdown-api.service';

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { FIN55020Data, Fin55020Service } from '@service/api/fin/fin55020.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { AsyncPipe } from '@angular/common';
import { formatAmount, formatDate } from '@shared/componentkit/table/table.model';
@Component({
  selector: 'app-fin55020',
  templateUrl: './fin55020.component.html',
  standalone: true,
  imports: [AsyncPipe, InputTextComponent, TableReportComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, ButtonComponent, TranslateModule]
})
export class FIN55020Component extends BasicQueryPageComponent<FIN55020Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    VOUDATE_Start: [new Date(), [Validators.required]],
    VOUDATE_End: [new Date(), [Validators.required]],
    ORG_ID: [],
    ProjectNo: [],
    vouno: [null, [Validators.maxLength(12)]],
    DetailNo: [],
    VOUCHER_KIND: [],
    PostFlag: [],
  });
  ORG_IDOptions = this.dropdown.querySys3100();
  ProjectNoOptions = this.dropdown.queryTALPORDERM_DropDownList();
  DetailNoOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
  VOUCHER_KINDOptions = getSYS1000Options('Voucher_Type');
  PostFlagOptions = getSYS1000Options('PostFlag');
  totalRecords = 0;
  historyRequestBody: any;
  data: FIN55020Data[] = [];
  columns: ReportColumn[] = [
    { field: 'VouDate', header: '傳票日期', format: formatDate },
    { field: 'VouNo', header: '傳票號碼' },
    { field: 'PostFlag', header: '狀態', format: (value: string) => getSYS1000('PostFlag', value) },
    { field: 'AccCName', header: '科目名稱' },
    { field: 'ORG_ID', header: '部門' },
    { field: 'Org_Name', header: '部門名稱' },
    { field: 'ProjectNo', header: '活動' },
    { field: 'NoteDesc', header: '摘要' },
    { field: 'D_AMT', header: '借方金額', format: formatAmount },
    { field: 'C_AMT', header: '貸方金額', format: formatAmount },
    { field: 'PTA', header: '立沖代號' }
  ];

  constructor(
    public readonly fin55020Service: Fin55020Service,
    private readonly dropdown: DropdownApiService
  ) {
    super(); // 呼叫父類建構子
  }
  ngOnInit(): void {
    this.initializePage('FIN55020', 'fin/fin55020cru');
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        pageSize: 30,
        pageIndex: 1,
        SortBy: [{ field: 'VouDate', order: 1 }, { field: 'VouNo', order: 1 }]
      }
      this.fin55020Service.queryFIN55020(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.historyRequestBody = body;
      });
    });
  }
}
