import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AddButton, Column, createPaginationConfig, formatDate } from '@others/component/table/table.model';
import { ASS16010Data, ASS16010Service, QueryASS16010Request, QueryFAINVENTORYMRequest } from '@service/api/ass/ass16010.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

@Component({
  selector: 'app-ass16010',
  templateUrl: './ass16010.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, TranslateModule, ButtonModule, TableReportComponent]
})
export class ASS16010Component extends BasicQueryPageComponent<ASS16010Data> implements OnInit {
  queryForm = this.formBuilder.group({
    INV_ID: [],   // 盤點單號
    ...createPaginationConfig([])
  });

  data: ASS16010Data[] = [];
  selectedItems: ASS16010Data[] = [];
  public readonly totalRecords = signal<number>(0);

  // 列印按鈕載入狀態
  exportPdfLoading = false;

  columns: Column[] = [
    { field: 'INV_ID', header: '盤點單號', visible: true },
    { field: 'INV_DATE', header: '盤點日期', visible: true, format: formatDate },
  ];

  /** 管理列額外按鈕：匯出 PDF */
  addButton: AddButton[] = [
    {
      label: '匯出 PDF',
      icon: 'pi pi-file-pdf',
      action: (row: QueryASS16010Request) => this.onExportPDF(row),
      disabled: (row: QueryASS16010Request) =>
        row.INV_ID == null || !this.hasPermission('60'),
    },
  ];

  constructor(
    private ass16010Service: ASS16010Service,
    private readonly fileExportService: FileExportService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '310040';
    this.initializePage('ASS16010', '/ass/ass16010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();
  }

  INV_ID_Options = signal<{ label: string | undefined; value: string | undefined }[]>([]);

  onSubmit(form: FormGroup) {
    console.log(form.value);

    this.handleSubmit(form, () => {
      this.ass16010Service.queryASS16010(form.value)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords.set(response.TotalCount);
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });
  }

  isDetailDisabled = (): boolean => false;

  onExportPDF(selectedItems: QueryASS16010Request): void {
    if (!this.data || this.data.length === 0) {
      return;
    }

    const req$ = this.ass16010Service.exportPDFASS16010({ ...selectedItems });
    this.fileExportService
      .executeFileExport(req$, '.pdf', v => (this.exportPdfLoading = v))
      .subscribe();
  }


  /**
     * 載入下拉選單選項
     */
  private loadDropdownOptions(): void {
    // 申請人代號
    const req: QueryFAINVENTORYMRequest = { IS_ALL_STATUS: 'Y' };
    this.ass16010Service.queryFAINVENTORYM_DropDownList(req).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.INV_ID}`,
          value: item.INV_ID,
        }));
        this.INV_ID_Options.set(options);
      },
    });


  }
}
