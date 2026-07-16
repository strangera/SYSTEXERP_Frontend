import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import {
  FIN62040Data,
  FIN62040Service,
  QueryFIN62040Request
} from '@service/api/fin/fin62040.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { Column, formatAmount } from '@others/component/table/table.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-fin62040',
  templateUrl: './fin62040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    ButtonModule,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TableReportComponent,
    TranslateModule,
    CalendarComponent
  ]
})
export class FIN62040Component extends BasicQueryPageComponent<FIN62040Data> implements OnInit {
  queryForm = this.formBuilder.group({
    StartDate: [null, Validators.required],
    EndDate: [null, Validators.required],
  });

  data: FIN62040Data[] = [];
  totalRecords = 0;
  btnLoading = false;

  historyRequestBody: QueryFIN62040Request | null = null;

  columns: Column[] = [
    { field: 'AccNo', header: '科目代號' },
    { field: 'AccCName', header: '科目名稱' },
    { field: 'BNK_AccNo', header: '帳號' },
    { field: 'BNK_NAME', header: '銀行名稱' },
    { field: 'BNK_AccName', header: '戶名' },
    { field: 'BegAmt', header: '前期結餘', format: formatAmount },
    { field: 'DebitAmt', header: '借方金額', format: formatAmount },
    { field: 'CreditAmt', header: '貸方金額', format: formatAmount },
    { field: 'EndAmt', header: '期末結餘', format: formatAmount }
  ];

  constructor(
    public readonly fin62040Service: FIN62040Service,
    private readonly fileExportService: FileExportService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN62040', '', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const body = form.getRawValue() as QueryFIN62040Request;

      this.fin62040Service.queryFIN62040(body)
        .pipe(
          untilDestroyed(this),
          finalize(() => this.loading = false)
        )
        .subscribe(response => {

          this.data = this.addGroupRows(response.Data ?? []);

          this.totalRecords = this.data.length;

          this.historyRequestBody = body;

          this.queryStateService.setQueryState(this.ProgNo, body);

        });
    });
  }
  private addGroupRows(rows: FIN62040Data[]): FIN62040Data[] {
    const result: FIN62040Data[] = [];

    rows.forEach(row => {

      switch (row.AccNo) {

        case '110301':
          result.push({
            BNK_NAME: '銀行存款'
          });
          break;

        case '112101':
          result.push({
            BNK_NAME: '應收票據'
          });
          break;

        case '2111':
          result.push({
            BNK_NAME: '應付票據'
          });
          break;
      }

      result.push(row);
    });

    return result;
  }
  onExportPDF(): void {
    if (!this.historyRequestBody) return;

    const export$ = this.fin62040Service.exportFIN62040PDF(this.historyRequestBody);

    this.fileExportService
      .executeFileExport(
        export$.pipe(untilDestroyed(this)),
        '.pdf',
        (isLoading) => this.btnLoading = isLoading
      )
      .subscribe();
  }

  onExportXLSX(): void {
    if (!this.historyRequestBody) return;

    const export$ = this.fin62040Service.exportFIN62040Excel(this.historyRequestBody);

    this.fileExportService
      .executeFileExport(
        export$.pipe(untilDestroyed(this)),
        '.xlsx',
        (isLoading) => this.btnLoading = isLoading
      )
      .subscribe();
  }
}