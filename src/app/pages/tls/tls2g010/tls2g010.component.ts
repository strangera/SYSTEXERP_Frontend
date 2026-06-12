import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS2G010Service } from '@service/api/tls/tls2g010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { convertDateToYYYYMM } from '@shared/componentkit/table/table.model';
import { ErrorReportService } from '@shared/service/error-report.service';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';
import { FileSelectEvent, FileUploadHandlerEvent } from 'primeng/fileupload';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { FileUploadComponent } from '../../../shared/componentkit/file-upload/file-upload.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-tls2g010',
  templateUrl: './tls2g010.component.html',
  standalone: true,
  imports: [MultiSelectComponent, AsyncPipe, CalendarComponent, DividerModule, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, FileUploadComponent, InputTextComponent, TranslateModule]
})
export class TLS2G010Component extends BasicQueryPageComponent<unknown> implements OnInit {
  queryForm = this.formBuilder.group({
    worksheetName: [{ value: '系統帶入(excel檔名)', disabled: true }], // 工作表名稱
    BudgetYYMM: [null, [Validators.required]],
    BuildingNos: [null],
    FloorNos: [null],
    SectionNos: [null],
  });
  // 館別 樓層 組織代碼 下拉
  buildingOptions = this.dropdownApiService.querySys3800();
  floorOptions = this.dropdownApiService.querySys3900();
  sectionOptions = this.dropdownApiService.querySys3100();

  files: File[] = [];
  private readonly errorReportService = inject(ErrorReportService);
  constructor(
    private readonly dropdownApiService: DropdownApiService,
    private readonly tls2g010Service: TLS2G010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2G010', '/TLS/TLS2G010cru', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        BudgetYYMM: convertDateToYYYYMM(frm.value.BudgetYYMM),
      }
      this.messageService.infoBubble('匯出檔產生中，請稍後...');
      this.tls2g010Service.generateExportFile(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        const url = `${environment.ApiUrl}${res.Data.PrintBudgetURL}`;
        globalThis.open(url, '_blank');
      });
    });
  }
  onFileSelect(event: FileSelectEvent) {
    this.files = event.files
    this.queryForm.get('worksheetName')?.setValue(event.files[0].name);
  }
  onFileRemove() {
    this.queryForm.get('worksheetName')?.setValue('系統帶入(excel檔名)');
    this.files = [];
  }
  @ViewChild('fileUpload') fileUploadComponent!: FileUploadComponent;
  handleCustomUpload(event: FileUploadHandlerEvent) {
    if (event.files && event.files.length > 0) {
      this.loading = true;
      this.messageService.infoBubble('上傳中，請稍後...');

      this.tls2g010Service.importBudget(event.files[0])
        .pipe(
          untilDestroyed(this),
          finalize(() => this.loading = false)
        )
        .subscribe(res => {
          const data = res.Data;

          // 核心判斷邏輯
          if (data.IsImportSuccess) {
            this.messageService.successBubble('上傳成功');
            this.resetUploadStatus();
          } else {
            // 如果後端回傳了錯誤檔路徑
            if (data.ErrorFilePath) {
              this.errorReportService.showImportError(
                data.ErrorFilePath,
                `匯入完畢。成功：${data.SuccessCount} 筆，失敗：${data.ErrorCount} 筆。`
              );
              // 同樣重設上傳狀態，讓使用者看清楚 Toast
              this.resetUploadStatus();
            } else {
              // 一般錯誤提示
              this.messageService.errorBubble(data.ErrorMsg || '上傳失敗');
            }
          }
          this.loading = false;
        });
    }
  }

  /** 重設上傳元件狀態的私有方法 */
  private resetUploadStatus() {
    this.files = [];
    this.queryForm.get('worksheetName')?.setValue('系統帶入(excel檔名)');
    if (this.fileUploadComponent) {
      this.fileUploadComponent.clearFiles();
    }
  }
  // 組織範本下載
  onDownloadTemplate(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        BudgetYYMM: convertDateToYYYYMM(frm.value.BudgetYYMM),
      }
      this.messageService.infoBubble('組織範本下載中，請稍後...');
      this.tls2g010Service.downloadOrgTemplate(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        const url = `${environment.ApiUrl}${res.Data.PrintTPLURL}`;
        globalThis.open(url, '_blank');
      });
    });
  }

  // 空白範本下載
  onDownloadBlankTemplate(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        BudgetYYMM: convertDateToYYYYMM(frm.value.BudgetYYMM),
      }
      this.messageService.infoBubble('空白範本下載中，請稍後...');
      this.tls2g010Service.downloadEmptyTemplate(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        const url = `${environment.ApiUrl}${res.Data.PrintTPLURL}`;
        globalThis.open(url, '_blank');
      });
    });
  }
}
