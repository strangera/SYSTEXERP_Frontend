import { AsyncPipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS2G010Service } from '@service/api/tls/tls2g010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { convertDateToYYYYMM } from '@shared/componentkit/table/table.model';
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
        window.open(url, '_blank');
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
      this.tls2g010Service.importBudget(event.files[0]).pipe(untilDestroyed(this)).subscribe(res => {
        if (res.Data.IsImportSuccess) {
          this.messageService.successBubble('上傳成功');
          this.files = [];
          this.queryForm.get('worksheetName')?.setValue('系統帶入(excel檔名)');
          this.fileUploadComponent.clearFiles();
        } else {
          this.messageService.errorBubble(res.Data.ErrorMsg || '上傳失敗');
        }
        this.loading = false;
      });
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
        window.open(url, '_blank');
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
        window.open(url, '_blank');
      });
    });
  }
}
