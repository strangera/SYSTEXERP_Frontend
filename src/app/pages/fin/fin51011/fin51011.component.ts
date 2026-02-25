import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN51011Service } from '@service/api/fin/fin51011.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { FileUploadComponent } from '@shared/componentkit/file-upload/file-upload.component';
import { AccordionModule } from 'primeng/accordion';
import { FileUploadHandlerEvent } from 'primeng/fileupload';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
@Component({
  selector: 'app-fin51011',
  templateUrl: './fin51011.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, TranslateModule, FileUploadComponent],
})

export class FIN51011Component extends BasicQueryPageComponent<unknown> implements OnInit {
  @ViewChild(FileUploadComponent) fileUpload?: FileUploadComponent;
  queryForm = this.formBuilder.group({});
  files: File[] = [];
  // Only allow Excel files
  allowedFileTypes = '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel';

  constructor(
    private fin51011Service: FIN51011Service,
  ) { super() }

  ngOnInit(): void {
    this.initializePage('FIN51011');
  }

  handleCustomUpload(event: FileUploadHandlerEvent) {
    if (event.files && event.files.length > 0) {
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

      console.log('FIN51011 upload - files count:', renamedFiles.length);
      if (renamedFiles[0]) {
        console.log('FIN51011 upload - first file:', renamedFiles[0].name, 'size:', renamedFiles[0].size, 'type:', renamedFiles[0].type);
      }
      // Validate file extension and MIME for Excel
      const allowedExt = ['xlsx', 'xls'];
      const allowedMime = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      const first = renamedFiles[0];
      const ext = first?.name.split('.').pop()?.toLowerCase() || '';
      if (!allowedExt.includes(ext) || !allowedMime.includes(first.type)) {
        console.error('FIN51011 upload aborted: invalid file type', first?.name, first?.type);
        this.loading = false;
        this.messageService.errorBubble('僅接受 Excel 檔案 (.xlsx/.xls)');
        return;
      }
      const fileToUpload = renamedFiles[0];
      if (!fileToUpload || fileToUpload.size === 0) {
        console.error('FIN51011 upload aborted: empty file', fileToUpload);
        this.loading = false;
        this.messageService.errorBubble('上傳檔案為空');
        return;
      }

      this.fin51011Service.uploadFIN51011(fileToUpload).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.loading = false;
        console.log('FIN51011 upload response:', response);
        const dataIsObject = response && response.Data && typeof response.Data === 'object';
        const successFlag = (response && response.Status === '0000') || (dataIsObject && (response.Data as any).Success === true);
        if (!successFlag) {
          // Show error with backend message / details
          const errMsg = response?.Message || '上傳失敗';
          this.messageService.errorBubble(errMsg);
          try {
            const backendErrors = dataIsObject ? (response.Data as any).Errors : undefined;
            console.error('FIN51011 backend error details:', backendErrors || response);
          } catch (e) { /* ignore */ }
        } else {
          this.messageService.successBubble(response.Message || '上傳成功');
        }

        this.files = [];
        this.fileUpload?.fileUpload?.clear();
      }, err => {
        this.loading = false;
        console.error('FIN51011Service upload error:', err);
        this.messageService.errorBubble('上傳失敗（網路或伺服器錯誤）');
      });
    }
  }
}
