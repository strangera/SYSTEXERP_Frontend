import { Component, OnInit, ViewChild } from '@angular/core';
import { COMMON_IMPORTS } from '../demo-imports';
import { ImgUploadComponent } from '@shared/componentkit/img-upload/img-upload.component';
import { FileUploadComponent } from '@shared/componentkit/file-upload/file-upload.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { FormGroup, Validators } from '@angular/forms';
import { FileUploadHandlerEvent } from 'primeng/fileupload';

@Component({
  selector: 'app-example-upload',
  standalone: true,
  imports: [
    COMMON_IMPORTS,
    ImgUploadComponent,
    FileUploadComponent
  ],
  templateUrl: './example-upload.component.html',
})
export class ExampleUploadComponent extends BasicQueryPageComponent<unknown> implements OnInit {
  @ViewChild(FileUploadComponent) fileUpload?: FileUploadComponent;
  queryForm = this.formBuilder.group({
    text: ['', Validators.required],
  });
  files: File[] = [];
  allowedFileTypes = '.csv,.txt';

  files2: File[] = [];        // 上傳的檔案
  images: any[] = []; // 圖片List editable, readable
  confirmDeleteImages: string[] = []; // 確定刪除的圖片
  constructor() {
    super();
  }

  ngOnInit(): void {

  }
  handleCustomUpload(event: FileUploadHandlerEvent) {
    if (event.files && event.files.length > 0) {
      const clientIp = this.authService.getUserInfo()?.client_ip || '';
      this.loading = true;
      const renamedFiles: File[] = event.files.map(originalFile => {
        const uniform = this.authService.currentUserValue?.STR_Uniform || '';
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2); // Get last 2 digits
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const formattedDate = `${year}${month}${day}`;

        const extension = originalFile.name.split('.').pop()?.toLowerCase(); // csv or txt
        const newName = `TSCDM${uniform}_${formattedDate}.${extension}`;

        return new File([originalFile], newName, {
          type: originalFile.type,
          lastModified: originalFile.lastModified,
        });
      });
      // 打API上傳檔案
    }
  }
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {

    });
  }
}
