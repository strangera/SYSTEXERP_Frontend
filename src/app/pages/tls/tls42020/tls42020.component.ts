import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { FileUploadComponent } from '@shared/componentkit/file-upload/file-upload.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatDateTime, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatAmount } from '@others/component/table/table.model';
import { ErrorReportService } from '@shared/service/error-report.service'; // 匯入 ErrorReportService
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { FileUploadHandlerEvent } from 'primeng/fileupload';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { TLS42020Data, TLS42020DetailQueryRequest, TLS42020Service } from '../../../service/api/tls/tls42020.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { formatDate } from '../tls2f010-cru/tls2f010-table-report.model';

@Component({
  selector: 'app-tls42020',
  templateUrl: './tls42020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    TableReportComponent,
    TranslateModule,
    DialogComponent,
    FileUploadComponent,
    RadiobuttonComponent,
    CalendarComponent,
    ButtonModule,
    AsyncPipe
  ]
})
export class TLS42020Component extends BasicQueryPageComponent<TLS42020Data> implements OnInit {
  // 使用 inject 注入 Service
  private readonly fb = inject(FormBuilder);
  public readonly tls42020Service = inject(TLS42020Service);
  private readonly datePipe = inject(DatePipe);
  private readonly dropDown = inject(DropdownApiService);
  private readonly errorReportService = inject(ErrorReportService);

  @ViewChild('fileUpload') fileUploadComponent!: FileUploadComponent;

  queryForm = this.fb.group({
    menuType: [null],
    TLT_No: [null],
    SBM_BegDate: [null],
    SBM_EndDate: [null],
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: "TLT_No", order: 0 }]],
  });

  lastQueryBody: any;
  totalRecords = 0;
  data: TLS42020Data[] = [];
  selectedItems: TLS42020Data[] = [];

  queryForm2 = this.fb.group({
    uploadType: ['0', Validators.required],
  });

  dialogVisible = false;
  uploadTypeOptions = [
    { label: '先刪除後新增', value: '0' },
    { label: '更新', value: '1' },
    { label: '新增', value: '2' }
  ];

  menuTypeOptions = getSYS1000Options('SBM_Type');
  tltNoOptions = this.dropDown.queryTltTalent();

  columns: ReportColumn[] = [
    { field: 'SBM_Type', header: '菜單類別', format: value => getSYS1000('SBM_Type', value) },
    { field: 'TLT_No', header: '專櫃編號' },
    { field: 'TLT_Name', header: '專櫃名稱' },
    { field: 'SBM_BegDate', header: '起始日期', format: formatDate },
    { field: 'SBM_EndDate', header: '結束日期', format: formatDate },
    { field: 'crt_date', header: '建立日期', visible: false, format: formatDateTime },
    { field: 'upd_date', header: '更新日期', visible: false, format: formatDateTime }
  ];

  expansionColumns: ReportColumn[] = [
    { field: 'SBM_BtnNo', header: '菜單按鍵序號' },
    { field: 'PLU_MagNo', header: '商品管理碼' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_FixPrc', header: '商品定價', format: formatAmount },
    { field: 'PLU_SalePrc', header: '商品售價', format: formatAmount },
  ];

  constructor(private readonly fileExportService: FileExportService) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS42020', 'tls/tls42020cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.tls42020Service.queryTLS42020(frm.getRawValue())
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.lastQueryBody = frm.getRawValue();
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  loadDetails = (rowData: TLS42020Data): Observable<any> => {
    const request: TLS42020DetailQueryRequest = {
      MID: rowData.mid,
      STO_No: rowData.STO_No,
      SBM_Type: rowData.SBM_Type?.toString() ?? '',
      TLT_No: rowData.TLT_No,
      SBM_BegDate: this.datePipe.transform(rowData.SBM_BegDate, 'yyyy-MM-ddTHH:mm:ss') ?? '',
    };
    return this.tls42020Service.queryTLS42020Detail(request);
  };

  onDelete(selectedItems: TLS42020Data[]) {
    this.messageService.confirm({
      header: `是否確認刪除 ${selectedItems.length} 筆資料？`,
      accept: () => {
        this.tls42020Service.deleteTLS42020({ idList: selectedItems.map(item => item.id) }).subscribe(() => {
          this.messageService.successBubble('刪除成功');
          this.onSubmit(this.queryForm);
        });
      }
    });
  }

  /** * 檔案上傳事件 - 改為 ErrorReportService 處理方式
   */
  onFileUpload(event: FileUploadHandlerEvent) {
    const file = event.files[0];
    const formData = new FormData();
    formData.append('file', file);
    // 這裡維持你原本 Service 接收參數的順序，但採用類似 TLS51110 的錯誤判斷
    this.tls42020Service.uploadTLS42020(file, this.queryForm2.value.uploadType!)
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const data = res?.Data;

        // 判斷是否有錯誤檔路徑
        if (data?.ErrorFilePath) {
          this.errorReportService.showImportError(
            data.ErrorFilePath,
            `匯入失敗：成功 ${data.SuccessCount} 筆，失敗 ${data.ErrorCount} 筆`
          );
          this.fileUploadComponent.clearFiles(); // 檢核失敗也清空檔案
        } else if (data?.SkippedFilePath) {
          // 部分資料因業務卡控(重疊/查無對應)被略過，提供下載清單查看略過原因
          this.errorReportService.showImportError(
            data.SkippedFilePath,
            `匯入完成：成功 ${data.SuccessCount} 筆，略過 ${data.SkippedCount} 筆，請下載清單查看略過原因`,
            '部分資料未匯入'
          );
          this.fileUploadComponent.clearFiles();
          this.dialogVisible = false;
          this.onSubmit(this.queryForm);
        } else if (res.Status !== '0000') {
          this.messageService.errorBubble(res.Message);
        } else {
          this.messageService.successBubble(`匯入成功，共 ${data?.SuccessCount || 0} 筆`);
          this.fileUploadComponent.clearFiles();
          this.dialogVisible = false;
          this.onSubmit(this.queryForm); // 重新查詢
        }
      });
  }

  /** * 下載範例檔案 - 改用 saveAs
   */
  /**
 * 下載範例檔案 - 直接處理 Blob
 */
  downloadTemplate() {
    this.tls42020Service.downloadRule()
    const export$ = this.tls42020Service.downloadRule();
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.btnLoading = isLoading).subscribe();
  }

  btnLoading = false;
  onUpload() {
    this.btnLoading = true;
    this.tls42020Service.ExecSpFuncTLS42020({ idList: this.selectedItems.map(item => item.id) })
      .pipe(untilDestroyed(this), finalize(() => this.btnLoading = false))
      .subscribe(() => {
        this.messageService.successBubble('下傳成功');
        this.onSubmit(this.queryForm);
      });
  }
}
