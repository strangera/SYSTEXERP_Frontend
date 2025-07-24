import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadComponent } from '../../../shared/componentkit/file-upload/file-upload.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { FileUploadHandlerEvent } from 'primeng/fileupload';
import { TLS27030Service } from '@service/api/tls/tls27030.service';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
@Component({
  selector: 'app-tls27030',
  templateUrl: './tls27030.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, FileUploadComponent, TranslateModule]
})
export class TLS27030Component extends BasicQueryPageComponent<unknown> implements OnInit {
  @ViewChild('fileUpload1') fileUpload1?: FileUploadComponent;
  @ViewChild('fileUpload2') fileUpload2?: FileUploadComponent;
  @ViewChild('fileUpload3') fileUpload3?: FileUploadComponent;
  queryForm = this.formBuilder.group({});
  allowedFileTypes = '.csv,.txt';
  files1: File[] = [];
  files2: File[] = [];
  files3: File[] = [];
  constructor(
    private tls27030Service: TLS27030Service
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS27030', 'TLS/TLS27030cru');
  }
  handleCustomUpload(event: FileUploadHandlerEvent, type: string) {
    if (event.files && event.files.length > 0) {
      const clientIp = this.authService.getUserInfo()?.client_ip || '';
      this.loading = true;
      const renamedFiles: File[] = event.files.map(originalFile => {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2); // Get last 2 digits
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const formattedDate = `${year}${month}${day}`;
        const extension = originalFile.name.split('.').pop()?.toLowerCase(); // csv or txt
        const newName = this.getNewName(type, formattedDate, extension);

        return new File([originalFile], newName, {
          type: originalFile.type,
          lastModified: originalFile.lastModified,
        });
      });

      this.tls27030Service.uploadTLS27030(renamedFiles, clientIp, type).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.loading = false;
        this.messageService.successBubble(response.Message);
        switch (type) {
          case 'NCML':
            this.files1 = [];
            this.fileUpload1?.fileUpload?.clear();
            break;
          case 'CTBC':
            this.files2 = [];
            this.fileUpload2?.fileUpload?.clear();
            break;
          case 'CTBCPrk':
            this.files3 = [];
            this.fileUpload3?.fileUpload?.clear();
            break;
        }
      });
    }
  }

  getNewName(type: string, formattedDate: string, extension?: string): string {
    switch (type) {
      case 'NCML': // 0101M159.DAT
        return `${formattedDate.slice(-4)}M159.${extension}`;
      case 'CTBC': // 20240106GMLOG.TXT
        return `${formattedDate}GMLOG.${extension}`;
      case 'CTBCPrk': // mmdd.xls or xlsx
        return `${formattedDate.slice(-4)}.${extension}`;
      default:
        return `unknown`;
    }
  }
}
