import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FileUploadModule, FileUploadEvent, FileRemoveEvent, FileSelectEvent, FileProgressEvent, FileUploadHandlerEvent, FileUploadErrorEvent, RemoveUploadedFileEvent, FileBeforeUploadEvent, FileSendEvent, FileUpload } from 'primeng/fileupload';
import { PrimeTemplate } from 'primeng/api';
import { NgIf, NgFor } from '@angular/common';
import { HttpHeaders } from '@angular/common/http'; // 引入 HttpHeaders
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FileUploadModule,
    PrimeTemplate,
    NgIf,
    NgFor,
    ButtonComponent
  ],
})
export class FileUploadComponent {
  @ViewChild(FileUpload) fileUpload?: FileUpload;
  @Input() label!: string;
  // 識別後端檔案請求參數的名稱。
  @Input() name!: string;
  // 上傳檔案的遠端 URL。
  @Input() url!: string;
  // 用於向 URL 發送檔案的 HTTP 方法，例如 "post" 或 "put"。
  @Input() method: 'post' | 'put' = 'post';
  // 是否允許一次選擇多個檔案。
  @Input() multiple = false;
  // 限制允許的檔案類型，可以是 MIME 類型或副檔名。
  @Input() accept!: string;
  // 禁用上傳功能。
  @Input() disabled = false;
  // 啟用後，檔案選擇完成後會自動開始上傳。
  @Input() auto = false;
  // 跨站存取控制請求是否應使用憑證 (如 cookies, 授權標頭)。
  @Input() withCredentials = false;
  // 允許的最大檔案大小 (位元組)。
  @Input() maxFileSize: number | null = null;
  // 檔案大小不符合限制時的錯誤訊息（摘要）。
  @Input() invalidFileSizeMessageSummary = '{0}：檔案大小無效，';
  // 檔案大小不符合限制時的錯誤訊息（詳細）。
  @Input() invalidFileSizeMessageDetail = '最大可上傳檔案大小為 {0}。';
  // 檔案類型不符合允許格式時的錯誤訊息（摘要）。
  @Input() invalidFileTypeMessageSummary = '{0}：檔案類型無效，';
  // 檔案類型不符合允許格式時的錯誤訊息（詳細）。
  @Input() invalidFileTypeMessageDetail = '允許的檔案類型為：{0}。';
  // 超過允許上傳檔案數量時的錯誤訊息（詳細）。
  @Input() invalidFileLimitMessageDetail = '最多僅能上傳 {0} 個檔案。';
  // 超過允許上傳檔案數量時的錯誤訊息（摘要）。
  @Input() invalidFileLimitMessageSummary = '超過檔案上傳數量限制，';
  // 元素的行內樣式。
  @Input() style: object | null = null;
  // 元素的 CSS 類別。
  @Input() styleClass!: string;
  // 圖片縮圖的寬度 (像素)。
  @Input() previewWidth = 50;
  // 選擇按鈕的標籤。
  @Input() chooseLabel!: string;
  // 上傳按鈕的標籤。
  @Input() uploadLabel!: string;
  // 取消按鈕的標籤。
  @Input() cancelLabel!: string;
  // 選擇按鈕的圖標。
  @Input() chooseIcon!: string;
  // 上傳按鈕的圖標。
  @Input() uploadIcon!: string;
  // 取消按鈕的圖標。
  @Input() cancelIcon!: string;
  // 是否顯示上傳按鈕。
  @Input() showUploadButton = true;
  // 是否顯示取消按鈕。
  @Input() showCancelButton = true;
  // 定義元件的 UI 模式 ("basic" 或 "advanced")。
  @Input() mode: 'basic' | 'advanced' = 'advanced';
  // HTTP 請求的標頭配置。
  @Input() headers!: HttpHeaders;
  // 是否使用自定義上傳 (uploadHandler 回調)。
  @Input() customUpload = false;
  // 最大允許上傳的檔案數量。
  @Input() fileLimit: number | null = null;
  // 上傳按鈕的 CSS 類別。
  @Input() uploadStyleClass!: string;
  // 取消按鈕的 CSS 類別。
  @Input() cancelStyleClass!: string;
  // 移除按鈕的 CSS 類別。
  @Input() removeStyleClass!: string;
  // 選擇按鈕的 CSS 類別。
  @Input() chooseStyleClass = 'w-auto';
  // 上傳中。
  @Input() loading = false;
  // 空狀態訊息。
  @Input() emptyMessage = '拖曳檔案到此處或點擊「選擇檔案」按鈕。';

  // 檔案上傳完成時觸發的回調事件。
  @Output() upload: EventEmitter<FileUploadEvent> = new EventEmitter<FileUploadEvent>();
  // 檔案被移除 (未上傳) 時觸發的回調事件。
  @Output() remove: EventEmitter<FileRemoveEvent> = new EventEmitter<FileRemoveEvent>();
  // 選擇檔案時觸發的回調事件。
  @Output() select: EventEmitter<FileSelectEvent> = new EventEmitter<FileSelectEvent>();
  // 檔案上傳進度更新時觸發的回調事件。
  @Output() progressFile: EventEmitter<FileProgressEvent> = new EventEmitter<FileProgressEvent>();
  // 在自定義上傳模式下，用於手動上傳檔案的回調事件。
  @Output() uploadHandler: EventEmitter<FileUploadHandlerEvent> = new EventEmitter<FileUploadHandlerEvent>();
  // 上傳錯誤時觸發的回調事件。
  @Output() errorFile: EventEmitter<FileUploadErrorEvent> = new EventEmitter<FileUploadErrorEvent>();
  // 已上傳的檔案被移除時觸發的回調事件。
  @Output() removeUploadedFile: EventEmitter<RemoveUploadedFileEvent> = new EventEmitter<RemoveUploadedFileEvent>();
  // 檔案上傳初始化前觸發的回調事件。
  @Output() beforeUpload: EventEmitter<FileBeforeUploadEvent> = new EventEmitter<FileBeforeUploadEvent>();
  // 請求發送到伺服器時觸發的回調事件。
  @Output() send: EventEmitter<FileSendEvent> = new EventEmitter<FileSendEvent>();

  progress = 0;

  handleUpload(event: FileUploadEvent) {
    console.log(event);
    this.progress = 0;
    this.upload.emit(event);
  }

  handleRemove(event: FileRemoveEvent) {
    console.log(event);
    this.remove.emit(event);
  }

  handleSelect(event: FileSelectEvent) {
    console.log(event);
    this.select.emit(event);
  }

  handleProgress(event: FileProgressEvent) {
    console.log(event);
    this.progress = event.progress;
    this.progressFile.emit(event);
  }

  handleCustomUpload(event: FileUploadHandlerEvent) {
    console.log(event);
    this.uploadHandler.emit(event);
  }

  handleError(event: FileUploadErrorEvent) {
    console.log(event);
    this.errorFile.emit(event);
  }

  handleRemoveUploadedFile(event: RemoveUploadedFileEvent) {
    console.log(event);
    this.removeUploadedFile.emit(event);
  }

  handleBeforeUpload(event: FileBeforeUploadEvent) {
    console.log(event);
    this.beforeUpload.emit(event);
  }

  handleSend(event: FileSendEvent) {
    console.log(event);
    this.send.emit(event);
  }

  // 添加公開的清空方法
  public clearFiles(): void {
    if (this.fileUpload) {
      this.fileUpload.clear();
      this.progress = 0;
    }
  }
}
