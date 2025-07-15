import { Component, Input, ViewEncapsulation, } from '@angular/core';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { FileUploadModule } from 'primeng/fileupload';
import { NgIf, NgFor } from '@angular/common';

interface UploadEvent {
  originalEvent: Event;
  files: File[];
}
/*
  1. 副檔名格式：
  .jpg：接受 JPEG 圖片檔案。
  .png：接受 PNG 圖片檔案。
  .pdf：接受 PDF 文件檔案。
  .docx：接受 Microsoft Word 文件檔案。
  <p-fileUpload name="myfile" url="./upload.php" accept=".jpg,.png,.pdf,.docx" />
*/
/*
  2. MIME 類型：
  image/jpeg：接受 JPEG 圖片檔案。
  image/png：接受 PNG 圖片檔案。
  application/pdf：接受 PDF 文件檔案。
  application/msword：接受 Microsoft Word 文件檔案 (.doc)。
  application/vnd.openxmlformats-officedocument.wordprocessingml.document：接受 Microsoft Word 文件檔案 (.docx)。
  <p-fileUpload name="myfile" url="./upload.php" accept="image/jpeg, image/png, application/pdf" />
*/
/*
  3. 通配符格式：
  image/*：接受所有圖片格式（如 JPEG、PNG、GIF 等）。
  audio/*：接受所有音訊格式（如 MP3、WAV 等）。
  video/*：接受所有影片格式（如 MP4、AVI 等）。
  *//*：接受所有格式檔案。
<p-fileUpload name="myfile" url="./upload.php" accept="image/*,video/*" />
*/
export enum FileType {
  JPG = '.jpg',
  PNG = '.png',
  PDF = '.pdf',
  EXCEL = '.xlsx',
}

@Component({
    selector: 'app-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrl: './file-upload.component.scss',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        FileUploadModule,
        PrimeTemplate,
        NgIf,
        NgFor,
    ],
})
export class FileUploadComponent {
  @Input() fileType: string = FileType.PNG;
  @Input() uploadUrl: string = 'https://www.primefaces.org/cdn/api/upload.php';
  uploadedFiles: any[] = [];
  chooseLab: string = '選擇檔案';
  uploadLab: string = '上傳';
  cancelLab: string = '取消';
  fileszie: number = 3145728; // 3MB = 3 * 1,024(KB) * 1,024(bytes) = 3,145,728 bytes。

  constructor(
    private messageService: MessageService,
  ) { }

  onUpload(event: any) { // UploadEvent
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }

    this.messageService.add({ severity: 'info', summary: 'File Uploaded', detail: '' });
  }
}
