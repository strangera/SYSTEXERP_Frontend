import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { concatMap, finalize, from, tap } from 'rxjs';

// PrimeNG
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FileUploadHandlerEvent } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';

// 自定義組件與服務
import { FIN51011Data, FIN51011QueryPayload, FIN51011Service } from '@service/api/fin/fin51011.service';
import { TLS27010Service } from '@service/api/tls/tls27010.service'; // 保留原本的 Service
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { FileUploadComponent } from '@shared/components/file-upload/file-upload.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { ErrorReportService } from '@shared/service/error-report.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

@UntilDestroy()
@Component({
  selector: 'app-fin51011',
  templateUrl: './fin51011.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TableReportComponent,
    ProgressBarModule,
    FileUploadComponent,
    ButtonComponent
  ],
})
export class FIN51011Component extends BasicQueryPageComponent<unknown> implements OnInit {
  @ViewChild('fileUpload') fileUpload?: FileUploadComponent;

  private readonly errorReportService = inject(ErrorReportService);

  // --- 通用/原本上傳變數 ---
  queryForm = this.formBuilder.group({});
  files: File[] = [];
  allowedFileTypes = '.csv';

  // --- 彈窗查詢變數 ---
  displayDialog = false;
  searchFileName = '';
  fileList: FIN51011Data[] = [];
  selectedFiles: FIN51011Data[] = [];
  lastQueryBody: FIN51011QueryPayload | null = null;
  totalRecords = 0;
  isProcessing = false;
  processProgress = 0;

  cols: ReportColumn[] = [
    { field: 'FileName', header: '檔案名稱', align: 'left' },
    { field: 'LastWriteTime', header: '最後修改時間', align: 'center' },
    {
      field: 'download',
      header: '下載',
      type: 'button', // 使用 table-report 內建的按鈕樣式
      buttonLabel: '下載',
      align: 'center',
      width: '100px'
    }
  ];
  onDownload(rowData: FIN51011Data) {
    this.loading = true;
    this.fin51011Service.downloadFile(rowData.FileName)
      .pipe(
        finalize(() => this.loading = false),
        untilDestroyed(this)
      )
      .subscribe((blob) => {
        // 建立一個隱藏的 <a> 標籤來觸發下載
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = rowData.FileName; // 設定下載檔名
        a.click();
        URL.revokeObjectURL(objectUrl); // 釋放記憶體
      });
  }
  constructor(
    public fin51011Service: FIN51011Service,
    private tls27010Service: TLS27010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN51011');
  }

  // ==========================================
  // 邏輯 A：原本的手動上傳本地檔案 (含自動更名)
  // ==========================================
  handleCustomUpload(event: FileUploadHandlerEvent) {
    if (event.files && event.files.length > 0) {
      this.loading = true;

      // 取出第一個檔案（依照你的 API 設計目前一次處理一個）
      const fileToUpload = event.files[0];

      // 呼叫 FIN51011 專用的上傳 API，而不是 TLS27010
      this.fin51011Service.uploadFIN51011(fileToUpload)
        .pipe(
          untilDestroyed(this),
          finalize(() => this.loading = false)
        )
        .subscribe(res => {
          // 判斷回傳結果（注意：這裡要依照你的 ApiResponse 格式判斷）
          const uploadResult = res?.Data;
          if (res?.Status === '0000' && uploadResult?.Success) {
            this.messageService.successBubble(`檔案 [${fileToUpload.name}] 轉入成功，共 ${uploadResult.SuccessCount} 筆`);
            this.files = [];
            this.fileUpload?.fileUpload?.clear();
          } else {
            // 處理失敗邏輯（如顯示錯誤報告）
            if (uploadResult?.ErrorFilePath) {
              this.errorReportService.showImportError(uploadResult.ErrorFilePath, '檔案檢核失敗，請查看錯誤報告');
            } else {
              this.messageService.errorBubble(uploadResult?.Errors?.join('；') || '轉入失敗');
            }
          }
        });
    }
  }

  // ==========================================
  // 邏輯 B：新功能 - 伺服器檔案轉入
  // ==========================================
  openImportDialog() {
    this.displayDialog = true;
    this.fileList = [];
    this.searchFileName = '';
    this.selectedFiles = [];
    this.onSearch();
  }

  onSearch() {
    const body: FIN51011QueryPayload = {
      FileName: this.searchFileName,
      SortBy: [{ field: "FileName", order: -1 }]
    };
    this.loading = true;
    this.fin51011Service.queryFIN51011(body)
      .pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      )
      .subscribe(res => {
        this.fileList = res?.Data || [];
        this.totalRecords = this.fileList.length;
        this.lastQueryBody = body;
      });
  }

  onConfirmImport() {
    if (this.selectedFiles.length === 0) {
      return this.messageService.errorBubble('請至少勾選一個檔案');
    }

    const total = this.selectedFiles.length;
    let completed = 0;
    let failCount = 0;
    this.isProcessing = true;
    this.processProgress = 0;

    from(this.selectedFiles).pipe(
      concatMap(file => {
        return this.fin51011Service.uploadFIN51011FileName({ FileName: file.FileName }).pipe(
          tap(res => {
            completed++;
            this.processProgress = Math.round((completed / total) * 100);

            const uploadData = res?.Data;
            const isDataSuccess = res?.Status === '0000' && uploadData?.Success === true;

            if (!isDataSuccess) {
              failCount++;
              if (uploadData?.ErrorFilePath) {
                this.errorReportService.showImportError(
                  uploadData.ErrorFilePath,
                  `檔案 [${file.FileName}] 檢核失敗，請下載錯誤報告。`
                );
              } else {
                const errMsg = res?.Message || uploadData?.Errors?.join('；') || '轉入失敗';
                this.messageService.errorBubble(`檔案 [${file.FileName}]：${errMsg}`);
              }
            }
          })
        );
      }),
      untilDestroyed(this),
      finalize(() => {
        this.isProcessing = false;
        this.handleImportFinalResult(total, failCount);
      })
    ).subscribe();
  }

  private handleImportFinalResult(total: number, failCount: number) {
    if (failCount === 0) {
      this.messageService.successBubble(`共 ${total} 筆檔案，已全部轉入成功`);
      this.displayDialog = false;
    } else {
      const successCount = total - failCount;
      const msg = `轉入作業結束。成功：${successCount} 筆，失敗：${failCount} 筆。請修正失敗檔案後重新上傳。`;
      this.messageService.errorBubble(msg);
    }
    this.onSearch(); // 重新整理清單
  }
}
