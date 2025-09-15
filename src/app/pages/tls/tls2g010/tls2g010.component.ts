import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { Component, OnInit } from '@angular/core';
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
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Option } from '@service/utility/dropdown-api.model';
import { IDropdownItem } from '@service/utility/dropDownList.service';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';

// 2.2.16.1 專櫃預估業績轉入作業
@Component({
  selector: 'app-tls2g010',
  templateUrl: './tls2g010.component.html',
  standalone: true,
  imports: [MultiSelectComponent, AsyncPipe, CalendarComponent, DropdownComponent, DividerModule, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, FileUploadComponent, InputTextComponent, TranslateModule]
})
export class TLS2G010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    worksheetName: [{ value: '系統帶入(excel檔名)', disabled: true }], // 工作表名稱
    budget_yymm: [null, [Validators.required]],
    building_no: [null],
    FLOOR_NO: [null],
    section_no: [null],
  });
  // 館別 樓層 組織代碼 下拉
  buildingOptions?: Observable<IDropdownItem[] | null>;
  floorOptions?: Observable<IDropdownItem[] | null>;
  sectionOptions?: Observable<Option[] | null>;

  files: File[] = [];

  constructor(
    private readonly dropdownApiService: DropdownApiService
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

    })
  }
  onFileSelect(event: FileSelectEvent) {
    this.files = event.files
    this.queryForm.get('worksheetName')?.setValue(event.files[0].name);
  }
  onFileRemove() {
    this.queryForm.get('worksheetName')?.setValue('系統帶入(excel檔名)');
    this.files = [];
  }
  handleCustomUpload(event: FileUploadHandlerEvent) {
    if (event.files && event.files.length > 0) {
    }
  }
}
