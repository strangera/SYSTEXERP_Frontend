import { HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { NotificationService } from '@shared/components/notification-message/notification.service';
import { MessageService } from 'primeng/api'; // 需引入 PrimeNG 原生 MessageService
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileExportService {
  private readonly messageService = inject(NotificationService);
  private readonly primengMessageService = inject(MessageService);
  // 用於暫存待存檔的資料
  private pendingBlob: Blob | null = null;
  private pendingFilename = '';

  public executeFileExport(
    exportObservable: Observable<HttpResponse<Blob>>,
    fileExtension: string,
    btnLoadingSetter?: (isLoading: boolean) => void,
    customFilename?: string // 新增參數
  ): Observable<HttpResponse<Blob>> {
    if (btnLoadingSetter) btnLoadingSetter(true);

    return exportObservable.pipe(
      tap({
        next: (response: HttpResponse<Blob>) => {
          // 將自定義檔名傳遞下去
          this.handleResponse(response, fileExtension, false, customFilename);
        },
        error: (err) => {
          this.messageService.errorBubble('檔案匯出失敗，請重試。');
          console.error('File export error:', err);
        },
        finalize: () => btnLoadingSetter?.(false)
      })
    );
  }


  public executePdfPrint(
    pdfObservable: Observable<HttpResponse<Blob>>,
    btnLoadingSetter?: (isLoading: boolean) => void
  ): Observable<HttpResponse<Blob>> {
    btnLoadingSetter?.(true);

    return pdfObservable.pipe(
      tap({
        next: (response: HttpResponse<Blob>) => {
          const blob = response.body;
          if (!blob || blob.size === 0) {
            this.messageService.warnBubble('目前無資料可供列印。');
            return;
          }
          this.printPdfBlob(blob);
        },
        error: () => this.messageService.errorBubble('列印失敗，請重試。'),
        finalize: () => btnLoadingSetter?.(false)
      })
    );
  }

  private printPdfBlob(blob: Blob) {
    const url = globalThis.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    iframe.src = url;
    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        globalThis.URL.revokeObjectURL(url);
        iframe.remove();
      }, 60000);
    };
    document.body.appendChild(iframe);
  }

  public handleResponse(
    response: HttpResponse<Blob>,
    fileExtension: string,
    saveAs = false,
    customFilename?: string // 新增參數
  ) {
    const blob = response.body;
    if (!blob || blob.size === 0) {
      this.messageService.warnBubble('目前無資料可供下載。');
      return;
    }

    // 邏輯：優先使用傳入的 customFilename，若無則從 Header 抓，最後才用預設值
    let filename = customFilename;

    if (!filename) {
      const contentDisposition = response.headers.get('Content-Disposition');
      filename = this.getFilenameFromHeader(contentDisposition, fileExtension);
    } else if (!filename.toLowerCase().endsWith(fileExtension.toLowerCase())) {
      filename += fileExtension;
    }
    const contentType = response.headers.get('Content-Type');

    // 1. 先執行自動下載 (保底：存到瀏覽器預設下載目錄)
    this.fallbackDownload(blob, filename, contentType);

    // 2. 判斷是否需要「另存新檔」流程：
    // 條件：手動指定 saveAs 為 true，或者是特定的副檔名 (如 .txt)
    const needsManualSave = saveAs || fileExtension.toLowerCase() === '.txt';

    if (needsManualSave) {
      // 暫存資料，供後續 savePendingFile 使用
      this.pendingBlob = blob;
      this.pendingFilename = filename;

      // 彈出黑底 Toast 詢問
      this.primengMessageService.add({
        key: 'confirm',
        sticky: true,
        severity: 'custom',
        summary: saveAs ? '檔案已準備就緒' : '檔案已自動下載',
        detail: saveAs
          ? `您可以點擊「另存新檔」指定儲存位置。`
          : `報表：${filename} 已存至下載目錄。您也可以點擊另存新檔指定儲存位置。`
      });
    }
  }

  /**
   * 被 Component 呼叫的另存新檔方法 (由使用者點擊按鈕觸發)
   */
  public async savePendingFile(): Promise<void> {
    if (!this.pendingBlob) return;

    if ('showSaveFilePicker' in globalThis) {
      try {
        const handle = await (globalThis as any).showSaveFilePicker({
          suggestedName: this.pendingFilename,
          types: [{
            description: '純文字檔案',
            accept: { 'text/plain': ['.txt'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(this.pendingBlob);
        await writable.close();
        this.messageService.successBubble('檔案儲存成功！');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          this.fallbackDownload(this.pendingBlob, this.pendingFilename);
        }
      }
    } else {
      this.fallbackDownload(this.pendingBlob, this.pendingFilename);
    }
    this.clearPending();
  }

  public clearPending() {
    this.pendingBlob = null;
    this.pendingFilename = '';
    this.primengMessageService.clear('confirm');
  }

  private fallbackDownload(blob: Blob, filename: string, contentType?: string | null) {
    const url = globalThis.URL.createObjectURL(new Blob([blob], { type: contentType || 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      globalThis.URL.revokeObjectURL(url);
      a.remove();
    }, 200);
  }

  private getFilenameFromHeader(contentDisposition: string | null, defaultExtension: string): string {
    if (!contentDisposition) return `export_${Date.now()}${defaultExtension}`;
    let filename = '';
    const filenameStarMatch = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStarMatch?.[1]) {
      const parts = filenameStarMatch[1].split("''");
      if (parts.length === 2) filename = decodeURIComponent(parts[1]);
    }
    if (!filename) {
      const filenameMatch = /filename="?([^";]+)"?/.exec(contentDisposition);
      if (filenameMatch?.[1]) filename = decodeURIComponent(filenameMatch[1].replaceAll('+', ' '));
    }
    return filename || `download${defaultExtension}`;
  }
}
