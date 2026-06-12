import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS13020Service } from '@service/api/ass/ass13020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { FileUploadComponent } from '@shared/componentkit/file-upload/file-upload.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { FileSelectEvent, FileUploadHandlerEvent } from 'primeng/fileupload';
import { finalize } from 'rxjs';
import { ImportASS13020ResponseData } from './ass13020.model';

// 3.1.3.2 資產轉入
@UntilDestroy()
@Component({
  selector: 'app-ass13020',
  templateUrl: './ass13020.component.html',
  styleUrl: './ass13020.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    FileUploadComponent,
    TranslateModule,
  ],
})
export class ASS13020Component extends BasicQueryPageComponent<unknown> implements OnInit {
  @ViewChild('fileUpload') fileUploadComponent!: FileUploadComponent;

  // TODO: 後端開欄位後再補傳工作表名稱
  queryForm = this.formBuilder.group({
    sheetName: [''],
  });

  selectedFile: File | null = null;

  constructor(private readonly ass13020Service: ASS13020Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13020');
  }

  onFileSelect(event: FileSelectEvent): void {
    this.selectedFile = event.files?.[0] ?? null;
  }

  onFileRemove(): void {
    this.selectedFile = null;
  }

  // 右上「轉入」按鈕入口
  onTransfer(): void {
    if (!this.selectedFile) {
      this.messageService.errorBubble('請先選擇要轉入的 Excel 檔案');
      return;
    }
    this.executeUpload(this.selectedFile);
  }

  // app-file-upload [customUpload] 觸發 (使用者也可在上傳元件內按「上傳」)
  handleCustomUpload(event: FileUploadHandlerEvent): void {
    const file = event.files?.[0];
    if (!file) return;
    this.executeUpload(file);
  }

  private executeUpload(file: File): void {
    this.loading = true;
    this.messageService.infoBubble('轉入中，請稍後...');

    this.ass13020Service
      .importASS13020(file)
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: (res: ApiResponse<ImportASS13020ResponseData>) => {
          if (res?.Status === '0000') {
            this.messageService.successBubble(`檔案 [${file.name}] 轉入成功`);
            this.resetUploadStatus();
          } else {
            this.messageService.errorBubble(res?.Message || res?.Error?.Message || '轉入失敗');
          }
        },
        error: () => this.messageService.errorBubble('轉入失敗，請洽系統管理員'),
      });
  }

  onClearForm(form?: FormGroup): void {
    (form ?? this.queryForm).reset();
    this.resetUploadStatus();
  }

  private resetUploadStatus(): void {
    this.selectedFile = null;
    this.fileUploadComponent?.clearFiles();
  }
}
