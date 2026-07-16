import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS13020Service } from '@service/api/ass/ass13020.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { FileUploadComponent } from '@shared/components/file-upload/file-upload.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { AccordionModule } from 'primeng/accordion';
import { FileSelectEvent, FileUploadHandlerEvent } from 'primeng/fileupload';
import { finalize } from 'rxjs';

// 3.1.3.2 資產轉入
@UntilDestroy()
@Component({
  selector: 'app-ass13020',
  templateUrl: './ass13020.component.html',
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

  queryForm = this.formBuilder.group({
    sheetName: [null as string | null, Validators.required],
  });

  selectedFile: File | null = null;
  checkPassed = false;

  constructor(private readonly ass13020Service: ASS13020Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13020');

    // 工作表名稱變動時，需重新檢查
    this.queryForm.controls.sheetName.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => (this.checkPassed = false));
  }

  onFileSelect(event: FileSelectEvent): void {
    this.selectedFile = event.files?.[0] ?? null;
    this.checkPassed = false;
  }

  onFileRemove(): void {
    this.selectedFile = null;
    this.checkPassed = false;
  }

  // file-upload 元件內「上傳」按鈕觸發 → 跑前置檢查
  handleCustomUpload(event: FileUploadHandlerEvent): void {
    const file = event.files?.[0];
    if (!file) return;
    this.submitted = true;
    if (this.queryForm.invalid) {
      this.messageService.errorBubble('請輸入工作表名稱');
      return;
    }
    this.executeCheck(file);
  }

  // 「轉入」按鈕入口
  onTransfer(): void {
    if (!this.checkPassed || !this.selectedFile) return;
    this.executeImport(this.selectedFile);
  }

  private executeCheck(file: File): void {
    const sheetName = this.queryForm.controls.sheetName.value!;
    this.loading = true;

    this.ass13020Service
      .checkImportASS13020(file, sheetName)
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: res => {
          if (res?.Status !== '0000') {
            this.checkPassed = false;
            this.messageService.errorBubble(res?.Message ?? '檢查失敗');
            return;
          }
          if (res.Data?.ResultCode !== 0) {
            this.checkPassed = false;
            this.messageService.errorBubble(res.Data?.Message ?? '檔案格式檢查未通過');
            return;
          }
          this.checkPassed = true;
          this.messageService.successBubble(res.Data?.Message ?? '檢查通過，可點擊「轉入」進行匯入');
        },
      });
  }

  private executeImport(file: File): void {
    const sheetName = this.queryForm.controls.sheetName.value!;
    this.loading = true;

    this.ass13020Service
      .importASS13020(file, sheetName)
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: res => {
          if (res?.Status !== '0000') {
            this.messageService.errorBubble(res?.Message ?? '轉入失敗');
            return;
          }
          const data = res.Data;
          if (data?.ResultCode === 0) {
            this.messageService.successBubble(
              `轉入完成（成功 ${data.SuccessCount ?? 0} 筆 / 失敗 ${data.FailCount ?? 0} 筆）`,
            );
            this.resetUploadStatus();
          } else {
            this.messageService.errorBubble(data?.Message ?? '轉入失敗');
          }
        },
      });
  }

  onClearForm(form?: FormGroup): void {
    (form ?? this.queryForm).reset();
    this.submitted = false;
    this.resetUploadStatus();
  }

  private resetUploadStatus(): void {
    this.selectedFile = null;
    this.checkPassed = false;
    this.fileUploadComponent?.clearFiles();
  }
}
