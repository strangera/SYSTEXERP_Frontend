import { AsyncPipe } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN41010Service } from '@service/api/fin/fin41010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { FIN41010ImportRowError } from './fin41010.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ErrorReportService } from '@shared/service/error-report.service';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { FileSelectEvent } from 'primeng/fileupload';
import { finalize, tap } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';

@Component({
  selector: 'app-fin41010',
  templateUrl: './fin41010.component.html',
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



orgOptionList: any[] = [];

orgOptions = this.dropdownApi.querySys3100().pipe(
  tap((options) => {
    this.orgOptionList = options ?? [];
  }),
);
  files: File[] = [];
  @ViewChild('fileUpload') fileUploadComponent!: FileUploadComponent;

  private readonly errorReportService = inject(ErrorReportService);

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
  this.handleSubmit(this.queryForm, () => {
    const { year, version, orgId } = this.queryForm.getRawValue();

    const selectedOrg = this.orgOptionList.find(
      (item) => item.value === orgId,
    );

    const orgName = selectedOrg?.label ?? '';

    const filename = `BudgetSample_${year}_${orgId}_${orgName}.xlsx`;

    this.loading = true;

    this.fileExportService
      .executeFileExport(
        this.fin41010Service
          .exportYearBudget({
            BudgetYear: year!,
            BudgetVersion: version!,
            OrgId: orgId!,
          })
          .pipe(untilDestroyed(this)),
        '.xlsx',
        (isLoading) => (this.loading = isLoading),
        filename,
      )
      .subscribe();
  });
}

  onConvert(): void {
    const currentFiles = this.getSelectedFiles();
    if (currentFiles.length === 0) {
      this.messageService.warnBubble('請先選擇檔案');
      return;
    }
    this.handleSubmit(this.queryForm, () => {
      const { year, version, orgId } = this.queryForm.getRawValue();
      this.loading = true;
      this.fin41010Service
        .importYearBudget(currentFiles[0], {
          BudgetYear: year!,
          BudgetVersion: version!,
          OrgId: orgId!,
        })
        .pipe(
          finalize(() => (this.loading = false)),
          untilDestroyed(this),
        )
        .subscribe({
          next: (res) => {
            if (res.Status === '0000') {
              this.messageService.successBubble(
                res.Message ?? '匯入成功',
              );
            } else if (res.Data?.ErrorFilePath) {
              // 產得出錯誤檢查檔：跳出可下載的錯誤報告(原始檔標紅+錯誤原因欄)
              this.errorReportService.showImportError(
                res.Data.ErrorFilePath,
                res.Message ?? '資料檢核未通過，請下載錯誤報告並修正資料後重新上傳。',
              );
            } else {
              // 產不出錯誤檔時的保底：至少列出逐行原因
              this.messageService.errorBubble(
                this.buildImportErrorMessage(res.Message, res.Data?.Errors),
              );
            }
          },
          // 不需要寫 error callback：非2xx回應已由全局 errorInterceptor + ErrorHandlerService
          // 統一攔截並跳出錯誤提示 (見 core/interceptors/error.interceptor.ts)。
          // 這裡只要確保「業務驗證失敗」情境後端回200 (見Controller)，走得進 next 即可客製化顯示錯誤檔。
        });
    });
  }

  /** 將匯入錯誤明細組成可讀訊息：哪一行、什麼會科、什麼原因 */
  private buildImportErrorMessage(
    message: string | undefined,
    errors: FIN41010ImportRowError[] | null | undefined,
  ): string {
    if (!errors?.length) {
      return message ?? '匯入失敗';
    }
    const MAX_LINES = 10;
    const lines = errors
      .slice(0, MAX_LINES)
      .map((e) => `第 ${e.RowNumber} 行${e.AccNo ? `（會科 ${e.AccNo}）` : ''}：${e.Reason}`);
    if (errors.length > MAX_LINES) {
      lines.push(`...等共 ${errors.length} 筆資料有誤，請修正後重新匯入`);
    }
    return lines.join('\n');
  }

  onApprove(): void {
    this.handleSubmit(this.queryForm, () => {
      const { year, version, orgId } = this.queryForm.getRawValue();
      this.loading = true;
      this.fin41010Service
        .approveYearBudget({
          Action: 'A',
          BudgetYear: year!,
          BudgetVersion: version!,
          OrgId: orgId!,
        })
        .pipe(
          finalize(() => (this.loading = false)),
          untilDestroyed(this),
        )
        .subscribe({
          next: (res) => {
            if (res.Status === '0000') {
              this.messageService.successBubble(
                res.Message ?? '審核成功',
              );
            } else {
              this.messageService.errorBubble(
                res.Message ?? '審核失敗',
              );
            }
          },
        });
    });
  }

  onAntiApprove(): void {
    this.handleSubmit(this.queryForm, () => {
      const { year, version, orgId } = this.queryForm.getRawValue();
      this.loading = true;
      this.fin41010Service
        .approveYearBudget({
          Action: 'U',
          BudgetYear: year!,
          BudgetVersion: version!,
          OrgId: orgId!,
        })
        .pipe(
          finalize(() => (this.loading = false)),
          untilDestroyed(this),
        )
        .subscribe({
          next: (res) => {
            if (res.Status === '0000') {
              this.messageService.successBubble(
                res.Message ?? '反審核成功',
              );
            } else {
              this.messageService.errorBubble(
                res.Message ?? '反審核失敗',
              );
            }
          },
        });
    });
  }
}
