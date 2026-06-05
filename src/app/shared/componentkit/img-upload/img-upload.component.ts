import { animate, style, transition, trigger } from '@angular/animations';
import { NgFor, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { FileSelectEvent, FileUpload, FileUploadModule } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
import { TooltipModule } from 'primeng/tooltip';

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
  ],
  standalone: true,
  imports: [NgIf, CarouselModule, PrimeTemplate, ImageModule, Button, FileUploadModule, TooltipModule, NgFor]
})
export class ImgUploadComponent implements AfterViewInit, OnInit {
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  @Input() multiple = true;                                           // 可以多選
  @Input() accept = 'image/*';                                        // csv, txt
  @Input() maxFileSize = 1024 * 1024; // 限制為 1MB (1048576 bytes)
  @Input() fileUploadMessage = `請上傳4:3比例的圖片(不符合將自動裁切)，大小限制 ${this.maxFileSize / (1024 * 1024)} MB/張`;
  @Input() fileLimit = 10;
  @Input() files: any[] = [];
  @Input() images: any[] = [];
  @Input() disabled = false;
  @Input() showEdit = true;
  @Input() title = '上傳圖片';
  @Input() emptyMessage = '請選擇要上傳的圖片';
  @Input() deleteTooltip = '刪除圖片';
  @Input() selectLabel = '選擇圖片';
  @Input() labelsRemoveFile = '立即刪除圖片';
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
  readonly INVALID_FILE_LIMIT_MESSAGE_SUMMARY = `最多上傳 ${this.fileLimit} 個文件`;
  readonly INVALID_FILE_LIMIT_MESSAGE_DETAIL = `最多上傳 ${this.fileLimit} 個文件`;
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
  trackByUploadFile(index: number, item: any) {
    return item?._tempId || index;
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
    // 自動裁剪圖片到4:3
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          const aspectRatio = 4 / 3;
          let cropWidth = img.width;
          let cropHeight = img.height;
          if (img.width / img.height > aspectRatio) {
            cropWidth = img.height * aspectRatio;
          } else {
            cropHeight = img.width / aspectRatio;
          }
          canvas.width = cropWidth;
          canvas.height = cropHeight;
          ctx.drawImage(
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

          canvas.toBlob(blob => {
            if (blob) {
              const croppedFile = new File([blob], file.name, { type: file.type });

              // 檢查文件是否已經存在
              const isDuplicate = this.files.some(existingFile =>
                existingFile.file.name === croppedFile.name &&
                existingFile.file.size === croppedFile.size
              );

              if (!isDuplicate) {
                // 修改點：直接儲存純網址字串與唯一 tempId，完全移除 bypassSecurity
                const blobUrl = URL.createObjectURL(croppedFile);

                this.files.push({
                  file: croppedFile,
                  objectURL: blobUrl, // 這裡存純字串即可
                  _tempId: `upload_${crypto.randomUUID()}` // 使用安全 UUID 做 trackBy
                });
                this.uploadFiles.emit(this.files.map(f => f.file));
                this.cdr.detectChanges();
              }
            }
          }, file.type);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // 刪除檔案
  onRemoveFile(event: any, file: File, removeFileCallback: any, index: number) {
    removeFileCallback(event, index);
    const updatedFiles = [...this.files];

    // 順手釋放該圖片佔用的瀏覽器暫存記憶體，防範 Memory Leak
    const targetFile = updatedFiles[index];
    if (targetFile?.objectURL) {
      URL.revokeObjectURL(targetFile.objectURL);
    }

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
  getFileIconClass(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pi pi-file-pdf text-red-500';
      case 'doc':
      case 'docx':
        return 'pi pi-file-word text-blue-500';
      case 'xls':
      case 'xlsx':
        return 'pi pi-file-excel text-green-500';
      case 'ppt':
      case 'pptx':
        return 'pi pi-file text-orange-500';
      case 'txt':
        return 'pi pi-file';
      default:
        return 'pi pi-file text-gray-400';
    }
  }
}
