import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { concatMap, finalize, from, tap } from 'rxjs';

// PrimeNG
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';

// 自定義組件與服務
import { FIN51011Data, FIN51011Service } from '@service/api/fin/fin51011.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
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
    CommonModule, MenubarComponent, AccordionModule, FormsModule,
    ReactiveFormsModule, TranslateModule, DialogModule, ButtonModule,
    InputTextModule, TableReportComponent, ProgressBarModule
  ],
})
export class FIN51011Component extends BasicQueryPageComponent<unknown> implements OnInit {
  // 注入錯誤報告服務
  private readonly errorReportService = inject(ErrorReportService);

  // 彈窗控制
  displayDialog = false;

  // 查詢與列表資料
  searchFileName = '';
  fileList: FIN51011Data[] = [];
  selectedFiles: FIN51011Data[] = [];
  totalRecords = 0;

  // 進度條狀態
  isProcessing = false;
  processProgress = 0;

  // 定義表格欄位
  cols: ReportColumn[] = [
    { field: 'FileName', header: '檔案名稱', align: 'left' },
    { field: 'LastWriteTime', header: '最後修改時間', align: 'center' }
  ];

  constructor(private fin51011Service: FIN51011Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN51011');
  }

  /** 打開彈窗 */
  openImportDialog() {
    this.displayDialog = true;
    this.fileList = [];
    this.searchFileName = '';
    this.selectedFiles = [];
  }

  /** 彈窗內的查詢按鈕 */
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

  /** 確定轉入 (多筆單發) */
  onConfirmImport() {
    if (this.selectedFiles.length === 0) {
      return this.messageService.errorBubble('請至少勾選一個檔案');
    }

    const total = this.selectedFiles.length;
    let completed = 0;
    let failCount = 0;

    this.isProcessing = true;
    this.processProgress = 0;

    // 使用 from + concatMap 確保一隻打完才打下一隻
    from(this.selectedFiles).pipe(
      concatMap(file => {
        console.log(`[開始處理] ${file.FileName}`);
        return this.fin51011Service.uploadFIN51011FileName({ FileName: file.FileName }).pipe(
          tap(res => {
            completed++;
            this.processProgress = Math.round((completed / total) * 100);

            // 判斷邏輯：Status 要 0000 且 Data.Success 要為 true
            const uploadData = res?.Data;
            const isDataSuccess = res?.Status === '0000' && uploadData?.Success === true;

            if (!isDataSuccess) {
              failCount++;

              // 使用統一的 ErrorReportService 顯示錯誤並提供下載
              if (uploadData?.ErrorFilePath) {
                this.errorReportService.showImportError(
                  uploadData.ErrorFilePath,
                  `檔案 [${file.FileName}] 檢核失敗，請下載錯誤報告。`
                );
              } else {
                // 如果後端沒給檔案，給一個一般的錯誤提示
                const errMsg = res?.Message || uploadData?.Errors?.join('；') || '轉入失敗';
                this.messageService.errorBubble(`檔案 [${file.FileName}]：${errMsg}`);
              }
            } else {
              console.log(`[處理成功] ${file.FileName}`, res);
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

  /** 處理最終結果顯示 */
  private handleImportFinalResult(total: number, failCount: number) {
    if (failCount === 0) {
      // 全部成功
      this.messageService.successBubble(`共 ${total} 筆檔案，已全部轉入成功`);
      this.displayDialog = false;
      this.onSearch(); // 重新整理清單
    } else {
      // 有部分失敗
      const successCount = total - failCount;
      const msg = `轉入作業結束。成功：${successCount} 筆，失敗：${failCount} 筆。請修正失敗檔案後重新上傳。`;
      this.messageService.errorBubble(msg);
    }
  }
}
