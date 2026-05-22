import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS13020Service } from '@service/api/ass/ass13020.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { FileSelectEvent, FileUploadHandlerEvent } from 'primeng/fileupload';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { FileUploadComponent } from '../../../shared/componentkit/file-upload/file-upload.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { AccordionModule } from 'primeng/accordion';

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
  @ViewChild('fileUpload') fileUploadComponent?: FileUploadComponent;

  queryForm = this.formBuilder.group({
    sheetName: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9_-]+$/)]],
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
    this.submitted = true;
    if (this.queryForm.invalid) {
      this.messageService.errorBubble('請輸入正確的工作表名稱（限英文或數字）');
      return;
    }
    if (!this.selectedFile) {
      this.messageService.errorBubble('請先選擇要轉入的 Excel 檔案');
      return;
    }
    this.executeUpload(this.selectedFile);
  }

  // app-file-upload [customUpload] 觸發 (使用者也可在上傳元件內按「上傳」)
  handleCustomUpload(event: FileUploadHandlerEvent): void {
    this.submitted = true;
    if (this.queryForm.invalid) {
      this.messageService.errorBubble('請輸入正確的工作表名稱（限英文或數字）');
      return;
    }
    const file = event.files?.[0];
    if (!file) return;
    this.executeUpload(file);
  }

  private executeUpload(file: File): void {
    const sheetName = this.queryForm.controls.sheetName.value ?? '';
    this.loading = true;
    this.messageService.infoBubble('轉入中，請稍後...');

    this.ass13020Service
      .uploadASS13020(file, sheetName)
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: (res) => {
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
    this.submitted = false;
    this.resetUploadStatus();
  }

  private resetUploadStatus(): void {
    this.selectedFile = null;
    this.fileUploadComponent?.clearFiles();
  }
}
