import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '@shared/componentkit/table/table.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { CheckTls55010Data, Tls55010DateRequest, Tls55010Service } from '@service/api/tls/tls55010.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-tls55010',
  templateUrl: './tls55010.component.html',
  standalone: true,
  imports: [TableComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, ButtonComponent, TranslateModule]
})
export class TLS55010Component extends BasicQueryPageComponent<CheckTls55010Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    TXN_Date: [null as Date | null, Validators.required],
  });
  lastQuery: Tls55010DateRequest | null = null;
  data: CheckTls55010Data[] = [];
  columns: Column[] = [
    { field: 'cls_date', header: '交易日期' },
    { field: 'step_num', header: '檢查步驟' },
    { field: 'master_key', header: '主鍵值' },
    { field: 'check_result', header: '結果說明' },
  ];
  cls_date: string | null = null;

  constructor(
    private readonly tls55010Service: Tls55010Service,
    private readonly datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS55010', '/tls/tls55010cru');
    this.tls55010Service.getTLS55010Date().pipe(untilDestroyed(this)).subscribe((res) => {
      this.cls_date = res.Data.CLS_DATE;
      const closeDate = new Date(res.Data.CLS_DATE);
      closeDate.setDate(closeDate.getDate() + 1);
      this.queryForm.patchValue({ TXN_Date: closeDate });
    });
  }
  onQuery(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        TXN_Date: this.datePipe.transform(frm.value.TXN_Date, 'yyyy-MM-dd') || '',
      }
      this.tls55010Service.checkTLS55010(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.messageService.successBubble(res.Message);
        this.data = res.Data;
        this.lastQuery = body;
      });
    });
  }
  insertLoading = false;
  onSubmit(lastForm: Tls55010DateRequest | null) {
    if (!lastForm) {
      return;
    }
    this.tls55010Service.insertTLS55010(lastForm).pipe(untilDestroyed(this), finalize(() => this.insertLoading = false)).subscribe((res) => {
      this.messageService.successBubble(res.Message);
    });
  }
}
