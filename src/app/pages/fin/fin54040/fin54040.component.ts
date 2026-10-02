import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin54040Service } from '@service/api/fin/fin54040.service';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';

@Component({
  selector: 'app-fin54040',
  templateUrl: './fin54040.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, ButtonComponent, TranslateModule, TableReportComponent]
})
export class FIN54040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    onedatedd: ['', Validators.required],
    pageSize: [1000],
    pageIndex: [1],
    SortBy: [[{ field: 'cls_date', order: -1 }]],
  });

  data: any[] = [];
  lastQueryBody: any;
  selectedItems: any[] = [];
  totalRecords = 0;

  columns: ReportColumn[] = [
    { field: 'id', header: 'ID', visible: false },
    { field: 'mid', header: 'MID', visible: false },
    { field: 'cls_type', header: '結算型態', visible: true },
    { field: 'cls_date', header: '結算年月', visible: true },
    { field: 'check_result', header: '結果說明', visible: true },
  ];

  constructor(
    private datePipe: DatePipe,
    public readonly fin54040Service: Fin54040Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN54040', 'fin/fin54040cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const selectedDate = this.queryForm.get('onedatedd')?.value;
      const closeYear = this.datePipe.transform(selectedDate, 'yyyy') || '';
      const body = closeYear ? { CloseYEAR: closeYear } : {};

      this.fin54040Service.queryFIN54040(body)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.lastQueryBody = body;
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
          this.messageService.successBubble(response.Message || '查詢成功');
        });
    });
  }

  defineDateCheckout(): void {
    if (this.queryForm.invalid) {
      this.submitted = true;
      return;
    }

    const dateControl = this.queryForm.get('onedatedd');
    const selectedDate = dateControl?.value;

    const closeYear = this.datePipe.transform(selectedDate, 'yyyy') || '';
    if (!closeYear) {
      this.messageService.warnBubble('請先選擇年份');
      return;
    }

    const payload = { CloseYEAR: closeYear };
    this.loading = true;
    this.fin54040Service.executeFIN54040(payload)
      .pipe(untilDestroyed(this), finalize(() => this.loading = false))
      .subscribe(res => {
        this.messageService.successBubble(res.Message || '執行完成');
        this.onSubmit(this.queryForm);
      });
  }
}
