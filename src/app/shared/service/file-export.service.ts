import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileExportService {

  constructor(private messageService: NotificationService) { }

  /**
   * 執行檔案匯出的通用方法
   */
  public executeFileExport(
    exportObservable: Observable<HttpResponse<Blob>>,
    fileExtension: string,
    btnLoadingSetter?: (isLoading: boolean) => void
  ): Observable<HttpResponse<Blob>> {

    if (btnLoadingSetter) {
      btnLoadingSetter(true);
    }

    return exportObservable.pipe(
      tap({
        next: (response: HttpResponse<Blob>) => {
          this.downloadFile(response, fileExtension);
        },
        error: (err) => {
          this.messageService.errorBubble('檔案匯出失敗，請重試或聯繫管理員。');
          console.error('File export error:', err);
        },
        finalize: () => {
          if (btnLoadingSetter) {
            btnLoadingSetter(false);
          }
        }
      })
    );
  }

  /**
   * 核心下載邏輯：使用最穩定的 ObjectURL 方案
   */
  private downloadFile(response: HttpResponse<Blob>, defaultExtension: string): void {
    const blob = response.body;

    if (!blob || blob.size === 0) {
      this.messageService.warnBubble('目前無資料可供下載。');
      return;
    }

    // 1. 取得檔名
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = this.getFilenameFromHeader(contentDisposition, defaultExtension);

    // 2. 建立 Blob URL (指定正確的 MIME Type)
    // 如果後端沒傳 Content-Type，則使用傳入的副檔名預設值
    const contentType = response.headers.get('Content-Type') || blob.type;
    const downloadBlob = new Blob([blob], { type: contentType });

    // 3. 執行下載
    const url = window.URL.createObjectURL(downloadBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // 某些瀏覽器需要將 element 加入 DOM 才能觸發 click
    document.body.appendChild(link);
    link.click();

    // 4. 清理資源
    // 使用微秒延遲確保瀏覽器已經開始下載流程
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 200);

    this.messageService.successBubble('檔案匯出成功！');
  }

  /**
   * 精準解析 Content-Disposition 中的檔名
   */
  private getFilenameFromHeader(contentDisposition: string | null, defaultExtension: string): string {
    if (!contentDisposition) {
      return `export_${new Date().getTime()}${defaultExtension}`;
    }

    let filename = '';

    // 優先處理 filename* (RFC 5987)，解決中文亂碼
    const filenameStarMatch = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStarMatch && filenameStarMatch[1]) {
      const parts = filenameStarMatch[1].split("''");
      if (parts.length === 2) {
        filename = decodeURIComponent(parts[1]);
      }
    }

    // 若無 filename*，則找普通的 filename
    if (!filename) {
      const filenameMatch = /filename="?([^";]+)"?/.exec(contentDisposition);
      if (filenameMatch && filenameMatch[1]) {
        filename = decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
      }
    }

    return filename || `download_${new Date().getTime()}${defaultExtension}`;
  }
}
