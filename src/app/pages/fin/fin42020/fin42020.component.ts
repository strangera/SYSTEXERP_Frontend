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
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TableSubheaderComponent } from './fin42020-table/fin42020-table.component';

@Component({
  selector: 'app-fin42020',
  templateUrl: './fin42020.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ButtonModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, RadiobuttonComponent, ButtonComponent, TableComponent, TranslateModule, TableSubheaderComponent]
})
export class FIN42020Component extends BasicQueryPageComponent<FIN42020Data> implements OnInit {
  queryForm = this.formBuilder.group({
    YM: ['', Validators.required],
    Org_ID: [],
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
      form.value.YM = this.datePipe.transform(form.value.YM, 'yyyyMM');
      this.fin42020Service.queryFIN42020(form.value)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
          this.lastPrintQueryBody = form.getRawValue();
        });
    });

  }

  onExportPDF(): void {
    if (!this.data || this.data.length === 0) {
      return;
    }

    const raw = this.lastPrintQueryBody!;
    const printRequest: QueryFIN42020Request = {
      ...raw,
      YM: this.datePipe.transform(raw.YM, 'yyyyMM') ?? ''
    };

    const req$ = this.fin42020Service.exportFIN42020PDF({ ...printRequest });
    this.fileExportService
      .executeFileExport(req$, '.pdf', v => (this.exportPDFLoading = v))
      .subscribe();
  }

  onExportExcel(): void {
    if (!this.data || this.data.length === 0) {
      return;
    }

    const raw = this.lastPrintQueryBody!;
    const printRequest: QueryFIN42020Request = {
      ...raw,
      YM: this.datePipe.transform(raw.YM, 'yyyyMM') ?? ''
    };

    const req$ = this.fin42020Service.exportFIN42020Excel({ ...printRequest });
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