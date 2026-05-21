import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Cpm11090Service, QueryCPM11090Request, QueryCPM11090Response } from '@service/api/cpm/cpm11090.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-cpm11090',
  standalone: true,
  imports: [CalendarRangeQuickComponent, TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, TranslateModule],
  templateUrl: './cpm11090.component.html'
})
export class Cpm11090Component extends BasicQueryPageComponent<QueryCPM11090Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    ByMissingPeople: [null, [Validators.maxLength(20)]],  // 被尋人姓名
    CollectionSites: [null, [Validators.maxLength(50)]],  // 集合地點
    RecDateFrom: [null, [Validators.required]],  // 登錄日期(起)
    RecDateTo: [null],  // 登錄日期(訖)
    PageSize: [30],
    PageIndex: [1],
  });
  data: QueryCPM11090Response[] = [];
  columns: ReportColumn[] = [
    { field: 'ByMissingPeople', header: '被尋人姓名' },
    { field: 'CollectionSites', header: '集合地點' },
    { field: 'SalutationName', header: '被尋人稱謂' },
    { field: 'BroadcastYN', header: '是否廣播' },
    { field: 'IsFinished', header: '是否結案' },
  ];
  totalRecords = 0;
  lastQuery: QueryCPM11090Request | null = null;
  constructor(
    public readonly cpm11090Service: Cpm11090Service,
    private readonly datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM11090', 'cpm/cpm11090cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.getRawValue(),
        RecDateFrom: this.datePipe.transform(frm.getRawValue().RecDateFrom, 'yyyy-MM-dd'),
        RecDateTo: this.datePipe.transform(frm.getRawValue().RecDateTo, 'yyyy-MM-dd'),
      }
      this.cpm11090Service.queryCPM11090(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.lastQuery = body;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      })
    })
  }
  isTableEditDisabled(rowdata: QueryCPM11090Response): boolean {
    return rowdata.IsFinished === '已結案';
  }
}
