import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN55070Data, Fin55070Service } from '@service/api/fin/fin55070.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ColumnGroup, formatAmount, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { Table, TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';

@Component({
  selector: 'app-fin55070',
  templateUrl: './fin55070.component.html',
  styleUrl: './fin55070.component.scss',
  standalone: true,
  imports: [TableReportComponent, ButtonModule, TableModule, CommonModule, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, RadiobuttonComponent, DropdownComponent, CheckboxModule, ButtonComponent, TranslateModule]
})
export class FIN55070Component extends BasicQueryPageComponent<FIN55070Data> implements OnInit {
  historyRequestBody: any;
  ORG_IDOptions = this.dropdown.querySys3100();
  AccNo_Options = this.fin55070Service.getAccNoList();
  queryForm = this.formBuilder.nonNullable.group({
    DateFrom: [new Date(), [Validators.required]],
    DateTo: [new Date(), [Validators.required]],
    Ledger_MD: [null],
    OrgId: [],
    AccNoFrom: [],
    AccNoTo: [],
    ShowAll: [false],
    PrintSign: [false],
  });

  typeOptions: any[] = [
    { value: null, label: '全部' },
    { value: '0', label: '統制' },
    { value: '1', label: '明細' },
  ];
  display = [
    { value: true, label: '顯示' },
    { value: false, label: '不顯示' },
  ]
  data: any[] = [];
  footerData = {
    Prior_DAmt: 0,
    Prior_CAmt: 0,
    Curr_DAmt: 0,
    Curr_CAmt: 0,
    Total_DAmt: 0,
    Total_CAmt: 0,
  };
  totalRecords = 0;
  columns: ReportColumn[] = [
    { field: 'AccNo', header: '科目代號', align: 'left' },
    { field: 'AccCname', header: '科目名稱', align: 'left' },
    { field: 'Prior_DAmt', header: '借方金額', groupField: '前期', format: formatAmount, align: 'right' },
    { field: 'Prior_CAmt', header: '貸方金額', groupField: '前期', format: formatAmount, align: 'right' },
    { field: 'Curr_DAmt', header: '借方金額', groupField: '本期', format: formatAmount, align: 'right' },
    { field: 'Curr_CAmt', header: '貸方金額', groupField: '本期', format: formatAmount, align: 'right' },
    { field: 'Total_DAmt', header: '借方金額', groupField: '累積', format: formatAmount, align: 'right' },
    { field: 'Total_CAmt', header: '貸方金額', groupField: '累積', format: formatAmount, align: 'right' },
  ];
  columnGroup: ColumnGroup[] = [
    { field: '前期', header: '前期' },
    { field: '本期', header: '本期' },
    { field: '累積', header: '累積' },
  ]
  constructor(
    public readonly fin55070Service: Fin55070Service,
    private readonly dropdown: DropdownApiService,

  ) {
    super(); // 呼叫父類建構子
  }
  ngOnInit(): void {
    this.initializePage('FIN55070', '/FIN/FIN55070', this.queryForm, (form) => this.onSubmit(form));
  }
  @ViewChild('dt') public dt!: Table;
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value
      }
      this.fin55070Service.queryFIN55070(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data
        this.footerData = response.Data.reduce((footer, row) => {
          footer.Prior_DAmt += Number(row.Prior_DAmt) || 0;
          footer.Prior_CAmt += Number(row.Prior_CAmt) || 0;
          footer.Curr_DAmt += Number(row.Curr_DAmt) || 0;
          footer.Curr_CAmt += Number(row.Curr_CAmt) || 0;
          footer.Total_DAmt += Number(row.Total_DAmt) || 0;
          footer.Total_CAmt += Number(row.Total_CAmt) || 0;
          return footer;
        }, this.footerData);
        this.historyRequestBody = body;
        this.totalRecords = response.TotalCount || this.data.length || 0;
      });
    });
  }
  onExportPDF() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.fin55070Service.exportFIN55070PDF(this.historyRequestBody).pipe(
      untilDestroyed(this),
      finalize(() => this.btnLoading = false)
    ).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.handleFileExport(response, '.pdf', '試算表');
      },
    });
  }
  btnLoading = false;
  onExportXLSX() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.fin55070Service.exportFIN55070Excel(this.historyRequestBody).pipe(
      untilDestroyed(this),
      finalize(() => this.btnLoading = false)
    ).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.handleFileExport(response, '.xlsx', '試算表');
      },
    });
  }

  getColumnSum(field: string): number {
    return this.data.reduce((sum, row) => sum + (Number(row[field]) || 0), 0);
  }

  isNumericColumn(field: string): boolean {
    return [
      'Prior_DAmt',
      'Prior_CAmt',
      'Curr_DAmt',
      'Curr_CAmt',
      'Total_DAmt',
      'Total_CAmt'
    ].includes(field);
  }

  private handleFileExport(resp: any, ext: string, baseName: string): void {
    const blob = resp?.body instanceof Blob ? resp.body : resp;
    const fileName = `${baseName}_${new Date().getTime()}${ext}`;
    if (blob && blob.size > 0) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService.warnBubble('沒有找到符合條件的資料，無法生成報表。');
    }
  }


}
