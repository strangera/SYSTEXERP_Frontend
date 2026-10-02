import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin54045Service } from '@service/api/fin/fin54045.service';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';

@Component({
  selector: 'app-fin54045',
  templateUrl: './fin54045.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, ButtonComponent, TranslateModule, InputTextComponent, TableReportComponent]
})
export class FIN54045Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    vendorSName: ['', Validators.required],
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
    public readonly fin54045Service: Fin54045Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN54045', 'fin/fin54045cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const yearValue = this.queryForm.get('vendorSName')?.value;
      const closeYear = this.datePipe.transform(yearValue, 'yyyy') || '';
      const body = closeYear ? { CloseYEAR: closeYear } : {};

      this.fin54045Service.queryFIN54045(body)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.lastQueryBody = body;
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());

          const respAny = response as any;
          const vendorFromResp = (respAny?.VendorSName ?? respAny?.vendorSName ?? respAny?.Data?.VendorSName ?? respAny?.Data?.vendorSName) as string | undefined;
          if (vendorFromResp) {
            this.queryForm.patchValue({ vendorSName: vendorFromResp });
            this.queryForm.get('vendorSName')?.disable();
          } else {
            this.queryForm.get('vendorSName')?.enable();
          }
        });
    });
  }

  defineDateCheckout(): void {
    if (this.queryForm.invalid) {
      this.submitted = true;
      return;
    }

    const yearValue = this.queryForm.get('vendorSName')?.value;
    const closeYear = yearValue ? (this.datePipe.transform(yearValue, 'yyyy') ?? '') : '';

    if (!closeYear) {
      this.messageService.warnBubble('請輸入年分');
      return;
    }

    const payload = { CloseYEAR: closeYear };
    this.loading = true;
    this.fin54045Service.executeFIN54045(payload)
      .pipe(untilDestroyed(this), finalize(() => this.loading = false))
      .subscribe(res => {
        this.messageService.successBubble(res.Message || '執行完成');
        this.onSubmit(this.queryForm);
      });
  }
}
