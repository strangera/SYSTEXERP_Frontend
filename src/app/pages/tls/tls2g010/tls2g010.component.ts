import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadComponent } from '../../../shared/componentkit/file-upload/file-upload.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { FileSelectEvent, FileUploadHandlerEvent } from 'primeng/fileupload';
import { DividerModule } from 'primeng/divider';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { finalize, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Option } from '@service/utility/dropdown-api.model';
import { IDropdownItem } from '@service/utility/dropDownList.service';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TLS2G010Service } from '@service/api/tls/tls2g010.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { environment } from 'src/environments/environment';
import { convertDateToYYYYMM } from '@shared/componentkit/table/table.model';

// 2.2.16.1 專櫃預估業績轉入作業
@Component({
  selector: 'app-tls2g010',
  templateUrl: './tls2g010.component.html',
  standalone: true,
  imports: [MultiSelectComponent, AsyncPipe, CalendarComponent, DividerModule, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, FileUploadComponent, InputTextComponent, TranslateModule]
})
export class TLS2G010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    worksheetName: [{ value: '系統帶入(excel檔名)', disabled: true }], // 工作表名稱
    BudgetYYMM: [null, [Validators.required]],
    BuildingNos: [null],
    FloorNos: [null],
    SectionNos: [null],
  });
  // 館別 樓層 組織代碼 下拉
  buildingOptions?: Observable<IDropdownItem[] | null>;
  floorOptions?: Observable<IDropdownItem[] | null>;
  sectionOptions?: Observable<Option[] | null>;

  files: File[] = [];

  constructor(
    private readonly dropdownApiService: DropdownApiService,
    private readonly tls2g010Service: TLS2G010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2G010', '/TLS/TLS2G010cru', this.queryForm, (form) => this.onSubmit(form));
    this.buildingOptions = this.dropdownApiService.querySys3800();
    this.floorOptions = this.dropdownApiService.querySys3900();
    this.sectionOptions = this.dropdownApiService.querySys3100();
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        BudgetYYMM: convertDateToYYYYMM(frm.value.BudgetYYMM),
      }
      this.loading = true;
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
    this.loading = true;
    if (event.files && event.files.length > 0) {
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
      this.loading = true;
      this.tls2g010Service.downloadOrgTemplate(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        const url = `${environment.ApiUrl}${res.Data.PrintTPLURL}`;
        window.open(url, '_blank');
      });
    });
  }

  // 空白範本下載
  onDownloadBlankTemplate() {
    this.loading = true;
    this.tls2g010Service.downloadEmptyTemplate().pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
      const url = `${environment.ApiUrl}${res.Data.PrintTPLURL}`;
      window.open(url, '_blank');
    });
  }
}
