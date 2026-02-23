import { AsyncPipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN41010Service } from '@service/api/fin/fin41010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { FileSelectEvent } from 'primeng/fileupload';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { FileUploadComponent } from '../../../shared/componentkit/file-upload/file-upload.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-fin41010',
  templateUrl: './fin41010.component.html',
  styleUrl: './fin41010.component.scss',
  standalone: true,
  imports: [
    AsyncPipe,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    FileUploadComponent,
    InputTextComponent,
    DropdownComponent,
    ButtonComponent,
    TranslateModule,
  ],
})
export class FIN41010Component extends BasicQueryPageComponent<unknown> implements OnInit {
  queryForm = this.formBuilder.group({
    year: [null, [Validators.required, Validators.maxLength(4)]],
    version: [null, [Validators.required, Validators.maxLength(1)]],
    orgId: [null as string | null, [Validators.required]],
  });

  orgOptions = this.dropdownApi.querySys3100();

  files: File[] = [];
  @ViewChild('fileUpload') fileUploadComponent!: FileUploadComponent;

  constructor(
    private readonly dropdownApi: DropdownApiService,
    private readonly fin41010Service: FIN41010Service,
    private readonly fileExportService: FileExportService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN41010');
  }

  onFileSelect(event: FileSelectEvent): void {
    this.files = [...event.files];
  }

  onFileRemove(): void {
    this.files = [];
  }

  private getSelectedFiles(): File[] {
    return this.fileUploadComponent?.fileUpload?.files ?? this.files;
  }

  onDownloadTemplate(): void {
    this.loading = true;
    this.messageService.infoBubble('範本下載中，請稍候...');
    this.fileExportService
      .executeFileExport(
        this.fin41010Service.downloadTemplate().pipe(untilDestroyed(this)),
        '.csv',
        (isLoading) => (this.loading = isLoading),
      )
      .subscribe();
  }

  onConvert(): void {
    const currentFiles = this.getSelectedFiles();
    if (currentFiles.length === 0) {
      this.messageService.warnBubble('請先選擇檔案');
      return;
    }
    this.handleSubmit(this.queryForm, () => {
      const { year, version, orgId } = this.queryForm.getRawValue();
      this.messageService.infoBubble('轉檔中，請稍候...');
      this.fin41010Service
        .convertFile(currentFiles[0], { year: year!, version: version!, orgId: orgId! })
        .pipe(
          finalize(() => (this.loading = false)),
          untilDestroyed(this),
        )
        .subscribe((res) => {
          this.messageService.successBubble(res.Message);
        });
    });
  }

  onApprove(): void {
    this.handleSubmit(this.queryForm, () => {
      const { year, version, orgId } = this.queryForm.getRawValue();
      this.messageService.infoBubble('審核中，請稍候...');
      this.fin41010Service
        .approve({ year: year!, version: version!, orgId: orgId! })
        .pipe(
          finalize(() => (this.loading = false)),
          untilDestroyed(this),
        )
        .subscribe((res) => {
          this.messageService.successBubble(res.Message);
        });
    });
  }

  onAntiApprove(): void {
    this.handleSubmit(this.queryForm, () => {
      const { year, version, orgId } = this.queryForm.getRawValue();
      this.messageService.infoBubble('反審核中，請稍候...');
      this.fin41010Service
        .antiApprove({ year: year!, version: version!, orgId: orgId! })
        .pipe(
          finalize(() => (this.loading = false)),
          untilDestroyed(this),
        )
        .subscribe((res) => {
          this.messageService.successBubble(res.Message);
        });
    });
  }
}
