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
import { FIN51011Data, FIN51011Service } from '@service/api/fin/fin51011.service';
import { TLS27010Service } from '@service/api/tls/tls27010.service'; // 保留原本的 Service
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { FileUploadComponent } from '@shared/componentkit/file-upload/file-upload.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { ErrorReportService } from '@shared/service/error-report.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';

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
  totalRecords = 0;
  isProcessing = false;
  processProgress = 0;

  cols: ReportColumn[] = [
    { field: 'FileName', header: '檔案名稱', align: 'left' },
    { field: 'LastWriteTime', header: '最後修改時間', align: 'center' }
  ];

  constructor(
    private fin51011Service: FIN51011Service,
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
      const clientIp = this.authService.currentUserValue?.client_ip || '';
      this.loading = true;

      const renamedFiles: File[] = event.files.map(originalFile => {
        const uniform = this.authService.currentUserValue?.STR_Uniform || '';
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const formattedDate = `${year}${month}${day}`;
        const extension = originalFile.name.split('.').pop()?.toLowerCase();
        const newName = `TSCDM${uniform}_${formattedDate}.${extension}`;

        return new File([originalFile], newName, {
          type: originalFile.type,
          lastModified: originalFile.lastModified,
        });
      });

      this.tls27010Service.uploadTLS27010(renamedFiles, clientIp)
        .pipe(
          untilDestroyed(this),
          finalize(() => this.loading = false)
        )
        .subscribe(response => {
          this.messageService.successBubble(response.Message);
          this.files = [];
          this.fileUpload?.fileUpload?.clear();
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
  }

  onSearch() {
    this.loading = true;
    this.fin51011Service.queryFIN51011({ FileName: this.searchFileName })
      .pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      )
      .subscribe(res => {
        this.fileList = res?.Data || [];
        this.totalRecords = this.fileList.length;
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
