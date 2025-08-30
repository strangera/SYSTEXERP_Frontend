import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { FileUploadHandlerEvent } from 'primeng/fileupload';
import { TLS27010Service } from '@service/api/tls/tls27010.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { FileUploadComponent } from '@shared/componentkit/file-upload/file-upload.component';
@Component({
  selector: 'app-tls27010',
  templateUrl: './tls27010.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, TranslateModule, FileUploadComponent],
})
export class TLS27010Component extends BasicQueryPageComponent<unknown> implements OnInit {
  @ViewChild(FileUploadComponent) fileUpload?: FileUploadComponent;
  queryForm = this.formBuilder.group({});
  files: File[] = [];
  allowedFileTypes = '.csv,.txt';
  constructor(
    private tls27010Service: TLS27010Service,
  ) { super() }
  ngOnInit(): void {
    this.initializePage('TLS27010', 'tls/tls27010cru');
  }
  handleCustomUpload(event: FileUploadHandlerEvent) {
    if (event.files && event.files.length > 0) {
      const clientIp = this.authService.currentUserValue?.client_ip || '';
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

      this.tls27010Service.uploadTLS27010(renamedFiles, clientIp).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.loading = false;
        this.messageService.successBubble(response.Message);
        this.files = [];
        this.fileUpload?.fileUpload?.clear();
      });
    }
  }
}
