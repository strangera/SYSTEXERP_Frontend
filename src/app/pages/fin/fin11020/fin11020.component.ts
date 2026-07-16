import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

// Services & Components
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { formatDateTime, formatYN, formatYYYYMM, ReportColumn } from '@shared/components/table-report/table-report.model';
import { ValidationService } from '@shared/service/validation.service';
import { transformOptionsForExport } from 'src/app/others/componentextends/basic-print/basic-print-data.component';
import { Fin11020Service, MainInvoiceData } from '../../../service/api/fin/fin11020.service';

// PrimeNG
import { AccordionModule } from 'primeng/accordion';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

// Shared
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextRangeComponent } from '../../../shared/components/input-text-range/input-text-range.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { YearMonthComponent } from './query-year-month.component';

@Component({
  selector: 'app-fin11020',
  templateUrl: './fin11020.component.html',
  standalone: true,
  imports: [
    YearMonthComponent, InputGroupModule, InputGroupAddonModule, MenubarComponent,
    FileUploadModule, ButtonComponent, AccordionModule, FormsModule,
    ReactiveFormsModule, InputTextComponent, InputTextRangeComponent,
    TableReportComponent, TranslateModule
  ]
})
export class FIN11020Component extends BasicQueryPageComponent<MainInvoiceData> implements OnInit {
  // --- Inject Services ---
  public readonly fin11020Service = inject(Fin11020Service);
  private readonly validationService = inject(ValidationService);
  private readonly destroyRef = inject(DestroyRef);

  // --- Reactive Form ---
  // 使用具名屬性更清楚
  queryForm = this.formBuilder.group({
    GUI_YYMM_start: [this.getDefaultYYYYMM(), [Validators.required]],
    GUI_YYMM_end: [this.getDefaultYYYYMM(), [Validators.required]],
    GUI_Track: [null, [this.validationService.guiTrackValidator, Validators.maxLength(2), Validators.minLength(2)]],
    GUI_No_start: [null, [Validators.maxLength(8), Validators.minLength(8), Validators.max(99999950)]],
    GUI_No_end: [null, [Validators.maxLength(8), Validators.minLength(8), Validators.max(99999999)]],
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[{ field: 'GUI_YYMM', order: 1 }, { field: 'GUI_SerNo', order: 1 }]],
  }, { validators: this.validationService.guiNumberRangeValidator('GUI_No_start', 'GUI_No_end') });

  // --- Signals for State ---
  data = signal<MainInvoiceData[]>([]);
  totalRecords = signal(0);
  uploadLoading = signal(false);
  selectedRows = signal<MainInvoiceData[]>([]);

  lastQueryBody: any = {};

  // --- Table Columns Configuration ---
  readonly columns: ReportColumn[] = [
    { field: 'GUI_YYMM', header: '發票年月', format: formatYYYYMM },
    { field: 'GUI_SerNo', header: '序號' },
    { field: 'GUI_Track', header: '字軌' },
    { field: 'GUI_BegNo', header: '發票起始號碼' },
    { field: 'GUI_EndNo', header: '發票結束號碼' },
    { field: 'GUI_TotQty', header: '發票張數' },
    { field: 'GUI_AssignQty', header: '發票號碼已分配張數' },
    { field: 'GUI_Status', header: '發票號碼狀態', format: (v) => getSYS1000('GUI_Status', v) },
    { field: 'GUI_Type', header: '發票類別', format: (v) => getSYS1000('GUI_Type', v) },
    { field: 'GUI_File', header: '匯入檔案名稱' },
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
  ];

  readonly subColumns: ReportColumn[] = [
    { field: 'STO_No', header: '分店編號' },
    { field: 'GUI_YYMM', header: '發票年月' },
    { field: 'GUI_Track', header: '字軌' },
    { field: 'GUI_BegNo', header: '發票起始號碼' },
    { field: 'GUI_EndNo', header: '發票結束號碼' },
    { field: 'GUI_Status', header: '發票號碼狀態', format: (v) => getSYS1000('GUI_Status', v) },
    { field: 'GUI_ProcStatus', header: '是否完成上傳', format: formatYN, exportFormat: transformOptionsForExport(getSYS1000Options('YES_NO')) },
    { field: 'GUI_ProcDate', header: '上傳日期', format: formatDateTime },
  ];

  ngOnInit(): void {
    // 必須呼叫父類別初始化
    this.initializePage('FIN11020', '/fin/fin11020cru', this.queryForm, (form) => this.onSubmit(form));

    // 自動同步結束年月
    this.queryForm.get('GUI_YYMM_start')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        if (val && !this.queryForm.get('GUI_YYMM_end')?.value) {
          this.queryForm.get('GUI_YYMM_end')?.setValue(val);
        }
      });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin11020Service.queryFIN11020(frm.value)
        .pipe(
          finalize(() => this.loading = false),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(res => {
          this.data.set(res.Data);
          this.totalRecords.set(res.TotalCount);
          this.lastQueryBody = frm.value;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        });
    });
  }

  onDelete(selectedRows: MainInvoiceData[]) {
    const ids = selectedRows.map(row => row.ID);
    this.messageService.confirm({
      header: '刪除確認',
      message: '是否刪除所選項目?',
      accept: () => {
        this.fin11020Service.deleteFIN11020(ids)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.onSubmit(this.queryForm);
            this.selectedRows.set([]);
          });
      }
    });
  }

  onFileUpload(event: FileSelectEvent) {
    const file = event.files[0];
    this.uploadLoading.set(true);
    this.fin11020Service.uploadFIN11020(file)
      .pipe(
        finalize(() => this.uploadLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.Data) {
          this.messageService.successBubble(res.Message);
        } else {
          this.messageService.errorBubble(res.Message);
        }
      });
  }

  // 強型別的控制項獲取方法，用於 HTML
  get controls() {
    return this.queryForm.controls;
  }

  // 輔助方法：獲取預設雙月格式
  private getDefaultYYYYMM(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = Math.floor(now.getMonth() / 2) * 2 + 1;
    return `${year}${month.toString().padStart(2, '0')}`;
  }

  isRowSelectable(row: MainInvoiceData) {
    return row.GUI_AssignQty === 0;
  }

  editDisabled(rowdata: MainInvoiceData) {
    return rowdata.GUI_AssignQty > 0;
  }
}