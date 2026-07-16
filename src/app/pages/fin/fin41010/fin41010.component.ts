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
    this.handleSubmit(this.queryForm, () => {
      const { year, version, orgId } = this.queryForm.getRawValue();
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
          '.csv',
          (isLoading) => (this.loading = isLoading),
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
            } else {
              this.messageService.errorBubble(
                res.Message ?? '匯入失敗',
              );
            }
          },
        });
    });
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
