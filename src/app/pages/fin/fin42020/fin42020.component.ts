import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { DatePipe } from '@angular/common';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN42020Data, FIN42020Service, QueryFIN42020Request } from '@service/api/fin/fin42020.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize } from 'rxjs';
import { TableComponent } from '../../../others/component/table/table.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';
import { TableSubheaderComponent } from './fin42020-table/fin42020-table.component';

@Component({
  selector: 'app-fin42020',
  templateUrl: './fin42020.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ButtonModule, ReactiveFormsModule, CalendarComponent, CheckboxModule, DropdownComponent, RadiobuttonComponent, ButtonComponent, TableComponent, TranslateModule, TableSubheaderComponent]
})
export class FIN42020Component extends BasicQueryPageComponent<FIN42020Data> implements OnInit {
  queryForm = this.formBuilder.group({
    YM: ['', Validators.required],
    Org_ID: [],
    IsCludeDownOrg: ['N'], // 是否含以下部門(Y=是/N=否)
    ReportType: ['', Validators.required],
    AmtUnit: ['', Validators.required],
  });

  // Dropdown options
  ORG_ID_Options = signal<{ label: string; value: string }[]>([]);
  unitOptions = [{ value: 1, label: '元' },
  { value: 2, label: '千' },
  { value: 3, label: '萬' }];
  typeOptions = [{ value: 1, label: '統制' },
  { value: 2, label: '明細' },];

  // Table data
  data: FIN42020Data[] = [];
  filteredData = [...this.data];

  lastPrintQueryBody: QueryFIN42020Request | null = null;

  // 按鈕載入狀態
  exportPDFLoading = false;
  exportExcelLoading = false;

  constructor(
    private fin42020Service: FIN42020Service,
    private datePipe: DatePipe,
    private readonly fileExportService: FileExportService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '140006';
    this.initializePage('FIN42020', 'fin/fin42020cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      // 另組 payload，不要直接改 form.value
      const raw = form.getRawValue();
      const payload: QueryFIN42020Request = {
        ...raw,
        YM: this.datePipe.transform(raw.YM, 'yyyyMM') ?? '',
      };
      this.fin42020Service.queryFIN42020(payload)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.queryStateService.setQueryState(this.ProgNo, raw);
          this.lastPrintQueryBody = payload;
        });
    });

  }

  onExportPDF(): void {
    if (!this.data || this.data.length === 0) {
      return;
    }

    const req$ = this.fin42020Service.exportFIN42020PDF({ ...this.lastPrintQueryBody! });
    this.fileExportService
      .executeFileExport(req$, '.pdf', v => (this.exportPDFLoading = v))
      .subscribe();
  }

  onExportExcel(): void {
    if (!this.data || this.data.length === 0) {
      return;
    }

    const req$ = this.fin42020Service.exportFIN42020Excel({ ...this.lastPrintQueryBody! });
    this.fileExportService
      .executeFileExport(req$, '.excel', v => (this.exportExcelLoading = v))
      .subscribe();
  }


  /** 載入下拉選單選項 */
  private loadDropdownOptions(): void {
    // 部門代號
    this.fin42020Service.querySYS3100_DropDownList().subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
        this.ORG_ID_Options.set(options);
      },
    });
  }
}