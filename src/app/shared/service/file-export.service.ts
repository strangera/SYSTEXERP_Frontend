import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { Observable, tap } from 'rxjs'; // 引入必要的 RxJS 相關

@Injectable({
  providedIn: 'root'
})
export class FileExportService {

  constructor(private messageService: NotificationService) { }

  /**
   * 執行檔案匯出 Observable 的通用方法。
   * 它負責處理加載狀態、訂閱、錯誤提示和檔案下載的實際操作。
   * * @param exportObservable 呼叫後端 API 並回傳 HttpResponse<Blob> 的 Observable。
   * @param fileExtension 預期的檔案副檔名 (例如: '.pdf', '.xlsx')。
   * @param btnLoadingSetter 設定 Component 中 btnLoading 狀態的函數。
   * @returns Subscription 物件，用於手動管理訂閱 (如果需要)。
   */
  public executeFileExport(
    exportObservable: Observable<HttpResponse<Blob>>,
    fileExtension: string,
    btnLoadingSetter?: (isLoading: boolean) => void // 使用函數來設定元件的狀態
  ): Observable<HttpResponse<Blob>> {

    if (btnLoadingSetter) {
      btnLoadingSetter(true);
    }

    return exportObservable.pipe(
      tap({
        next: (response: HttpResponse<Blob>) => {
          this.handleFileExport(response, fileExtension);
        },
        error: (err) => {
          this.messageService.errorBubble('檔案匯出失敗，請重試或聯繫管理員。');
          console.error('File export error:', err);
        },
        finalize: () => btnLoadingSetter?.(false)
      })
    );
  }

  // 處理檔案匯出的通用邏輯
  private async handleFileExport(response: HttpResponse<Blob>, fileExtension: string): Promise<void> {
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = this.getFilenameFromHeader(contentDisposition, fileExtension);
    const blob = response.body;

    if (!blob || blob.size === 0) {
      this.messageService.warnBubble('沒有內容可下載。');
      return;
    }

    // 檢查瀏覽器是否支援 showSaveFilePicker
    if ('showSaveFilePicker' in window) {
      try {
        // 1. 彈出另存新檔對話框
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'Text Files',
            accept: { 'text/plain': [fileExtension] }, // 根據副檔名調整 MIME type
          }],
        });

        // 2. 寫入檔案
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();

        this.messageService.successBubble('檔案已儲存成功！');
      } catch (err) {
        // 使用者取消下載時會進到這裡
        console.log('User cancelled the save dialog');
      }
    } else {
      // 降級處理：如果瀏覽器不支援，使用原本的 <a> 標籤下載方式
      this.fallbackDownload(blob, filename);
    }
  }

  private fallbackDownload(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    this.messageService.successBubble('檔案已成功下載！');
  }

  // 輔助方法：從 header 獲取檔名 (邏輯不變)
  private getFilenameFromHeader(contentDisposition: string | null, defaultExtension: string): string {
    if (!contentDisposition) {
      return `download${defaultExtension}`;
    }

    const filenameStarMatch = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStarMatch && filenameStarMatch.length > 1) {
      const encodedFilename = filenameStarMatch[1];
      try {
        const decoded = decodeURIComponent(encodedFilename.replace(/^UTF-8''/, ''));
        return decoded;
      } catch (error) {
        console.error('Failed to decode filename*', error);
        return encodedFilename;
      }
    }

    const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition);
    if (filenameMatch && filenameMatch.length > 1) {
      try {
        return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
      } catch {
        return filenameMatch[1];
      }
    }

    return `download${defaultExtension}`;
  }
}
