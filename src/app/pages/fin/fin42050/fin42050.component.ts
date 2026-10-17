import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN42050Data, FIN42050Service } from '@service/api/fin/fin42050.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { apiOption, option } from '@shared/models/sys/sysb000.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize } from 'rxjs';
import { createPaginationConfig, formatAmount, formatPercentage } from 'src/app/others/component/table/table.model';
import { TableReportComponent } from 'src/app/shared/components/table-report/table-report.component';
import { ReportColumn } from 'src/app/shared/components/table-report/table-report.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';

@Component({
  selector: 'app-fin42050',
  templateUrl: './fin42050.component.html',
  styleUrl: './fin42050.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    RadiobuttonComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    CommonModule,
    CalendarComponent,
    CheckboxModule,
    ButtonModule,
  ]
})
export class FIN42050Component extends BasicQueryPageComponent<FIN42050Data> implements OnInit {
  queryForm = this.formBuilder.group({
    ActualYM: [null, [Validators.required]],       // 實際值年月
    BudgetYM1: [null, [Validators.required]],      // 預算版本1年月
    BudgetVersion1: [null, [Validators.required]], // 預算版本1
    BudgetYM2: [null, [Validators.required]],      // 預算版本2年月
    BudgetVersion2: [null, [Validators.required]], // 預算版本2
    Org_ID: [null],                                // 部門（可空）
    IsCludeDownOrg: ['N'], // 是否含以下部門(Y=是/N=否)
    ReportType: [1, [Validators.required]],        // 類別：1=統制, 2=明細
    AmtUnit: [1, [Validators.required]],           // 單位金額表示：1=元, 2=千, 3=萬

    //分頁查詢
    ...createPaginationConfig([{ field: '', order: 1 }]), // 分頁和排序參數
  });

  OrgId_Options: option[] = [];
  ReportType_Options = [
    { value: 1, label: '統制' },
    { value: 2, label: '明細' },
  ];
  AmtUnit_Options = [
    { value: 1, label: '元' },
    { value: 2, label: '千' },
    { value: 3, label: '萬' },
  ];

  data: FIN42050Data[] = [];
  columns: ReportColumn[] = [
    { field: 'AccountCode', header: '科目代號', visible: true, align: 'left' },
    { field: 'AccountName', header: '科目名稱', visible: true, align: 'left' },
    { field: 'ActualAmount', header: '實際金額', visible: true, align: 'right', format: formatAmount },
    { field: 'ActualRatio', header: '實際佔比(%)', visible: true, align: 'right', format: (value) => formatPercentage(value, 2) },
    { field: 'Budget1Amount', header: '版本1金額', visible: true, align: 'right', format: formatAmount },
    { field: 'Budget1Ratio', header: '版本1佔比(%)', visible: true, align: 'right', format: (value) => formatPercentage(value, 2) },
    { field: 'Budget2Amount', header: '版本2金額', visible: true, align: 'right', format: formatAmount },
    { field: 'Budget2Ratio', header: '版本2佔比(%)', visible: true, align: 'right', format: (value) => formatPercentage(value, 2) },
    { field: 'BudgetVersionDiff', header: '版本差異值', visible: true, align: 'right', format: formatAmount },
  ];

  readonly totalRecords = signal<number>(0);
  lastQueryBody = null;
  btnPDFLoading = false;
  btnExcelLoading = false;

  constructor(
    private readonly fin42050Service: FIN42050Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN42050', '', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    const raw = frm.getRawValue();
    const payload = {
      ...raw,
      ActualYM: raw.ActualYM ? formatDate(raw.ActualYM, 'yyyyMM', 'en-US') : null,
      BudgetYM1: raw.BudgetYM1 ? formatDate(raw.BudgetYM1, 'yyyyMM', 'en-US') : null,
      BudgetYM2: raw.BudgetYM2 ? formatDate(raw.BudgetYM2, 'yyyyMM', 'en-US') : null,
      Org_Name: this.OrgId_Options.find(o => o.value === raw.Org_ID)?.label ?? null,
      PageSize: raw.PageSize ?? 30,
      PageIndex: raw.PageIndex ?? 1,
      OrderBy: raw.OrderBy,
      Offset: raw.Offset,
      SortBy: raw.SortBy,
    };

    console.log('payload:', payload);

    this.handleSubmit(frm, () => {
      this.fin42050Service.queryFIN42050(payload)
        .pipe(finalize(() => this.loading = false), untilDestroyed(this))
        .subscribe(response => {
          if (response.Status === '0000') {
            this.data = response.Data ?? [];
            // this.data = this.removeHeaderRows(response.Data ?? []);
            this.isEmptyRow(this.data);
            this.totalRecords.set(response.TotalCount);
            this.lastQueryBody = payload;
          } else {
            this.messageService.errorBubble(response.Message);
            this.totalRecords.set(response.TotalCount);
          }
        });
    });
  }

  exportPDF() {
    if (!this.lastQueryBody) return;
    this.btnPDFLoading = true;
    this.fin42050Service.exportPDFFIN42050(this.lastQueryBody)
      .pipe(finalize(() => this.btnPDFLoading = false))
      .subscribe(blob => this.downloadFile(blob, 'application/pdf', '預算版本比較表.pdf'));
  }

  exportExcel() {
    if (!this.lastQueryBody) return;
    this.btnExcelLoading = true;
    this.fin42050Service.exportExcelFIN42050(this.lastQueryBody)
      .pipe(finalize(() => this.btnExcelLoading = false))
      .subscribe(blob => this.downloadFile(blob, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '預算版本比較表.xlsx'));
  }

  loadOptions() {
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.OrgId_Options = res.Data.map((item: apiOption) => ({
          value: item.No,
          label: item.No + '-' + item.Name,
        }));
      });
  }

  private downloadFile(blob: Blob, type: string, fileName: string) {
    const newBlob = new Blob([blob], { type });
    const url = URL.createObjectURL(newBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  private removeHeaderRows(data: FIN42050Data[]): FIN42050Data[] {
    return data.filter(row => row.RowType !== 'HEADER');
  }

  private isEmptyRow(data: FIN42050Data[]) {
    for (const row of data) {
      if (row.RowType === 'HEADER') {
        row.ActualAmount = undefined;
        row.ActualRatio = undefined;
        row.Budget1Amount = undefined;
        row.Budget1Ratio = undefined;
        row.Budget2Amount = undefined;
        row.Budget2Ratio = undefined;
        row.BudgetVersionDiff = undefined;
      }
    }
  }

}