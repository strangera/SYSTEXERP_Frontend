import { ChangeDetectionStrategy, Component, EventEmitter, Input, AfterViewInit, Output, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { DomSanitizer } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-img-upload',
  templateUrl: './img-upload.component.html',
  styleUrls: ['./img-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }), // 从上方开始
        animate('100ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })) // 平滑滑入
      ]),
      transition(':leave', [
        animate('100ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' })) // 向上滑出并消失
      ])
    ])
  ]
})
export class CustomFileUploadComponent implements AfterViewInit, OnInit {
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  @Input() multiple = true;
  @Input() accept = 'image/*';
  @Input() maxFileSize = 1024 * 1024; // 限制為 1MB (1048576 bytes)
  @Input() fileUploadMessage = `請上傳4:3比例的圖片(不符合將自動裁切)，大小限制 ${this.maxFileSize / (1024 * 1024)} MB/張`;
  @Input() fileLimit = 10;
  @Input() files: any[] = [];
  @Input() images: any[] = [];
  @Input() disabled = false;
  @Input() showEdit = false;
  @Output() uploadFiles = new EventEmitter<File[]>();
  @Output() selectedFiles = new EventEmitter<File[]>();
  @Output() imagesChange = new EventEmitter<any>();
  @Output() imagesDeleteChange = new EventEmitter<string[]>();

  showDelete = false;
  responsiveOptions: any[] | undefined;
  confirmDelete = new Set<string>();
  deleteImageList: string[] = [];
  readonly INVALID_FILE_SIZE_MESSAGE_SUMMARY = '檔案大小超過限制';
  readonly INVALID_FILE_SIZE_MESSAGE_DETAIL = '檔案大小超過限制';
  readonly INVALID_FILE_LIMIT_MESSAGE_SUMMARY = `最多上傳 ${this.fileLimit} 張圖片`;
  readonly INVALID_FILE_LIMIT_MESSAGE_DETAIL = `最多上傳 ${this.fileLimit} 張圖片`;
  readonly INVALID_FILE_TYPE_MESSAGE_SUMMARY = '檔案格式錯誤';
  readonly INVALID_FILE_TYPE_MESSAGE_DETAIL = '檔案格式錯誤';

  constructor(private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.responsiveOptions = [
      { breakpoint: '1399px', numVisible: 3, numScroll: 3 },
      { breakpoint: '991px', numVisible: 2, numScroll: 1 },
      { breakpoint: '767px', numVisible: 1, numScroll: 1 }
    ];
  }
  ngAfterViewInit() {
    if (this.files && this.files.length > 0) {
      this.fileUpload.files = [...this.files]; // 更新到 fileUpload 的 files
      this.updateFiles(this.files); // 同步到本地的 files 變數並觸發 uploadFiles
    }
  }
  // 更新檔案
  private updateFiles(files: File[]) {
    this.files = files;
    this.uploadFiles.emit(this.files);
  }
  // 選擇檔案
  onSelectedFiles(event: FileSelectEvent) { // 當選擇檔案時觸發
    let selectedFiles = [...event.currentFiles]; // 複製選擇的檔案

    // 若選擇的檔案超過限制，移除多餘的檔案
    if (selectedFiles.length > this.fileLimit) { // 檢查檔案數量是否超過限制
      const extraFiles = selectedFiles.slice(this.fileLimit); // 取得多餘的檔案
      extraFiles.forEach(file => { // 遍歷多餘的檔案
        const index = this.fileUpload.files.indexOf(file); // 找到檔案在 fileUpload 中的索引
        if (index > -1) { // 如果檔案存在於 fileUpload 中
          this.fileUpload.files.splice(index, 1); // 移除該檔案
        }
      });
      selectedFiles = selectedFiles.slice(0, this.fileLimit); // 保留限制數量內的檔案
    }
    // 確保每個文件都有類型
    selectedFiles = selectedFiles.filter(file => file.type); // 過濾掉沒有類型的檔案

    // 自動裁剪圖片到4:3
    selectedFiles.forEach(file => { // 遍歷每個選擇的檔案
      const reader = new FileReader(); // 創建 FileReader 來讀取檔案
      reader.onload = (e: any) => { // 當檔案讀取完成時
        const img = new Image(); // 創建 Image 物件
        img.onload = () => { // 當圖片加載完成時
          const canvas = document.createElement('canvas'); // 創建 canvas 元素
          const ctx = canvas.getContext('2d'); // 獲取 canvas 的 2D 繪圖上下文
          if (!ctx) return; // 如果沒有獲取到上下文，則返回
          const aspectRatio = 4 / 3; // 設定目標比例為 4:3
          let cropWidth = img.width; // 初始化裁剪寬度
          let cropHeight = img.height; // 初始化裁剪高度
          if (img.width / img.height > aspectRatio) { // 如果圖片寬高比大於目標比例
            cropWidth = img.height * aspectRatio; // 調整裁剪寬度
          } else { // 否則
            cropHeight = img.width / aspectRatio; // 調整裁剪高度
          }
          canvas.width = cropWidth; // 設定 canvas 寬度
          canvas.height = cropHeight; // 設定 canvas 高度
          ctx.drawImage( // 在 canvas 上繪製圖片
            img,
            (img.width - cropWidth) / 2,
            (img.height - cropHeight) / 2,
            cropWidth,
            cropHeight,
            0,
            0,
            cropWidth,
            cropHeight
          );
          canvas.toBlob(blob => { // 將 canvas 內容轉換為 Blob
            if (blob) { // 如果 Blob 存在
              const croppedFile = new File([blob], file.name, { type: file.type }); // 創建新的裁剪後的檔案
              // 檢查文件是否已經存在
              const isDuplicate = this.files.some(existingFile => existingFile.file.name === croppedFile.name && existingFile.file.size === croppedFile.size);
              if (!isDuplicate) {
                this.files.push({ // 將裁剪後的檔案加入 files 陣列
                  file: croppedFile,
                  objectURL: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(croppedFile)) // 生成安全的 URL
                });
                this.uploadFiles.emit(this.files.map(f => f.file)); // 發送上傳檔案事件
                this.cdr.detectChanges(); // 觸發變更檢測
              }
            }
          }, file.type); // 指定 Blob 的類型
        };
        img.src = e.target.result; // 設定圖片的來源
      };
      reader.readAsDataURL(file); // 讀取檔案為 Data URL
    });
  }

  // 刪除檔案
  onRemoveFile(event: any, file: File, removeFileCallback: any, index: number) {
    removeFileCallback(event, index);
    const updatedFiles = [...this.files];
    updatedFiles.splice(index, 1);
    if (updatedFiles.length === 0) {
      this.showDelete = false;
    }
    // 同步檔案
    this.updateFiles(updatedFiles);
  }

  choose(event: Event, callback: () => void) {
    callback();
  }

  onDeleteClick(image: { IMG_File: string }): void {
    if (this.confirmDelete.has(image.IMG_File)) {
      this.deleteImage(image); // 執行真正的刪除邏輯
    } else {
      this.confirmDelete.clear(); // 清空所有已確認的刪除狀態
      this.confirmDelete.add(image.IMG_File); // 設定當前點擊的為確認狀態
    }
  }
  onDeleteCancel(image: { IMG_File: string }): void {
    this.confirmDelete.delete(image.IMG_File); // 取消刪除狀態
  }
  deleteImage(image: any): void {
    this.images = this.images.filter(img => img.IMG_File !== image.IMG_File); // 刪除圖片
    this.confirmDelete.delete(image.IMG_File); // 刪除確認狀態
    this.deleteImageList.push(image.IMG_File);
    this.imagesChange.emit(this.images);
    this.imagesDeleteChange.emit(this.deleteImageList);
  }
}
