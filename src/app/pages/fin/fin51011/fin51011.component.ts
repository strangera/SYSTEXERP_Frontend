import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS27010Service } from '@service/api/tls/tls27010.service';
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
  allowedFileTypes = '.csv,.txt';

  constructor(
    private tls27010Service: TLS27010Service,
  ) { super() }

  ngOnInit(): void {
    this.initializePage('FIN51011');
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
