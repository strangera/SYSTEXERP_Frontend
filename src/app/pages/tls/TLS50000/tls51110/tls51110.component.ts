import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls51070Service } from '@service/api/tls/tls51070.service';
import { Tls51110Service } from '@service/api/tls/tls51110.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import {
  AddButton,
  createPaginationConfig,
  formatAmount,
} from '@shared/componentkit/table/table.model';
import { ErrorReportService } from '@shared/service/error-report.service';
import { saveAs } from 'file-saver';
import { AccordionModule } from 'primeng/accordion';
import { FileSelectEvent } from 'primeng/fileupload';
import { finalize } from 'rxjs';

interface LogoOption {
  No: string;
  Name: string;
  label?: string;
}

interface LogoBudget {
  id: number;
  LOGO_No: string;
  LOGO_CH_NAME?: string;
  YYYYMM: string;
  BUDGET: number;
  BUDGET_Cost: number | null;
  BUD_Status: string;
  BUD_Remark: string | null;
}

@Component({
  selector: 'app-tls51110',
  templateUrl: './tls51110.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    DropdownComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
export class TLS51110Component extends BasicQueryPageComponent<LogoBudget> implements OnInit {
  queryForm = this.formBuilder.group({
    LOGO_No: [''],
    YYYYMM: [''],
    YYYYMM2: [new Date(), Validators.required],
    ...createPaginationConfig([{ field: 'LOGO_No', order: 1 }]),
  });

  BUD_StatusOptions = getSYS1000Options('BUD_Status');

  columns: ReportColumn[] = [
    { field: 'LOGO_No', header: '品牌代碼', visible: true },
    { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true },
    { field: 'YYYYMM', header: '年月', visible: true },
    { field: 'BUDGET', header: '預算', visible: true, format: formatAmount },
    { field: 'BUDGET_Cost', header: '預算成本', visible: true, format: formatAmount },
    {
      field: 'BUD_Status',
      header: '審核狀態',
      visible: true,
      format: (value: string) =>
        this.BUD_StatusOptions.find(x => x.value === value)?.label ?? value,
    },
    { field: 'BUD_Remark', header: '備註說明', visible: true },
  ];
  LOGO_No_Option: LogoOption[] = [];
  totalRecords = 0;
  data: LogoBudget[] = [];
  selectedItems: LogoBudget[] = [];
  lastQueryBody: any = null;
  readonly query = (body: any) => this.apiService.queryTLS51110(body);
  editDisabled(rowData: LogoBudget) {
    return rowData.BUD_Status === "1";
  }
  actionLoadingId: string | number | null = null;

  // ====== Row Buttons ======
  addButton: AddButton[] = [
    {
      label: '單據審核',
      icon: 'pi pi-check-circle text-green-500',
      action: (row: LogoBudget) => {
        if (this.actionLoadingId) return;
        if (row.BUD_Status !== "0") {
          this.messageService.warnBubble('狀態不是「未審核」，無法審核');
          return;
        }
        this.statusChange(row, "1");
      },
      disabled: (row: LogoBudget) => row.BUD_Status === "1", // 已審核 → 審核按鈕 disable
    },
    {
      label: '反審核',
      icon: 'pi pi-undo text-orange-500',
      action: (row: LogoBudget) => {
        if (this.actionLoadingId) return;
        if (row.BUD_Status !== "1") {
          this.messageService.warnBubble('狀態不是「已審核」，無法反審核');
          return;
        }
        this.statusChange(row, "0");
      },
      disabled: (row: LogoBudget) => row.BUD_Status === "0", // 未審核 → 反審核按鈕 disable
    },
  ];


  constructor(
    private readonly apiService: Tls51110Service,
    private readonly tls51070Service: Tls51070Service,
    private readonly datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51110', '/TLS/TLS51110CRU', this.queryForm, (form) => this.onSubmit(form));
    this.tls51070Service.queryPLULOGO_DropDownList({}).subscribe(res => {
      this.LOGO_No_Option = res.Data.map((item: LogoOption) => ({
        ...item, label: `${item.No} - ${item.Name}`,
      }));
    });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();
      const body = {
        ...formValue,
        YYYYMM: this.datePipe.transform(formValue.YYYYMM2, 'yyyyMM'),
      }
      this.apiService.queryTLS51110(body).pipe(untilDestroyed(this), finalize(() => (this.loading = false))).subscribe((response) => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount || this.data.length;
        this.lastQueryBody = body;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
  private readonly erroreportService = inject(ErrorReportService);
  /** 匯入 Excel 並產生錯誤檔 */
  onImportExcel(event: FileSelectEvent) {
    const formData = new FormData();
    formData.append('file', event.files[0]);
    this.apiService.uploadTLS51110(formData).pipe(untilDestroyed(this)).subscribe(res => {
      const data = res?.Data;
      if (data?.ErrorFilePath) {
        this.erroreportService.showImportError(
          data.ErrorFilePath,
          `匯入失敗：成功 ${data.SuccessCount} 筆，失敗 ${data.ErrorCount} 筆`
        );
      } else {
        this.messageService.successBubble(`匯入成功，共 ${data?.SuccessCount} 筆`);
        this.onSubmit(this.queryForm); // 重新查詢
      }
    });
  }
  // 下載範例檔案
  onExportExcel() {
    this.apiService.downloadTemplate().subscribe((res: Blob) => {
      const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'TLS51110_Template.xlsx');
    });
  }
  statusChange(row: LogoBudget, status: string) {
    const id = row.id;
    if (id == null || Number.isNaN(Number(id))) {
      this.messageService.errorBubble(`找不到有效的 id`);
      return;
    }
    if (this.actionLoadingId) return;
    this.actionLoadingId = id;
    const payload = {
      id: Number(id),
      LOGO_No: row.LOGO_No,
      YYYYMM: row.YYYYMM,
      BUDGET: row.BUDGET,
      BUDGET_Cost: row.BUDGET_Cost ?? 0,
      BUD_Remark: row.BUD_Remark ?? '',
      BUD_Status: status === "1" ? "0" : "1"
    };
    this.apiService.approveTLS51110(payload).pipe(finalize(() => (this.actionLoadingId = null))).subscribe(() => {
      const msg = status === "1" ? '審核成功' : '反審核成功';
      this.onSubmit(this.queryForm);
      this.messageService.successBubble(`${msg}（ID: ${id}）`);
    });
  }
}
