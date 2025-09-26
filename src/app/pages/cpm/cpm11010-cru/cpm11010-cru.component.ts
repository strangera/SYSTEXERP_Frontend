import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CPM11010Data, InsertCPM11010Request, UpdateCPM11010Request, CPM11010Service } from '../../../service/api/cpm/cpm11010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { NgIf } from '@angular/common';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { IDropdownItem, Option } from '@service/utility/dropdown-api.model';

@Component({
  selector: 'app-cpm11010-cru',
  templateUrl: './cpm11010-cru.component.html',
  styleUrl: './cpm11010-cru.component.scss',
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    TranslateModule
  ]
})
export class CPM11010CRUComponent extends BasicCruPageComponent<CPM11010Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    building_no: [null, Validators.required],   // 館別
    FLOOR_NO: [null, Validators.required],      // 營業樓層
    AREA_NO: [null, Validators.required],       // 營業區域
    Service_Id: ['系統自動產生'],    // 服務台位置編號
    Service_Name: ['', [Validators.required, Validators.maxLength(60)]] // 服務台位置名稱
  });

  // 下拉選單選項
  buildingNoOptions: IDropdownItem[] = [];
  floorNoOptions: IDropdownItem[] = [];
  areaNoOptions: IDropdownItem[] = [];

  constructor(
    private cpm11010Service: CPM11010Service,
    private dropdownApiService: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM11010', this.dataForm);
    this.loadOptions();
    this.dataForm.get('Service_Id')?.disable();
    if (this.crudstatus === CRUDStatus.Edit) {
      // 除了 Service_Name 其他欄位皆不可編輯
      this.dataForm.get('building_no')?.disable();
      this.dataForm.get('FLOOR_NO')?.disable();
      this.dataForm.get('AREA_NO')?.disable();
    }
  }

  onSubmit(form: FormGroup): void {
    const formValue = form.getRawValue();
    this.handleSubmit(form, () => {
      // 新增
      if (this.crudstatus === CRUDStatus.Create) {
        const insertRequest: InsertCPM11010Request = {
          building_no: formValue.building_no || '',
          FLOOR_NO: formValue.FLOOR_NO || '',
          AREA_NO: formValue.AREA_NO || '',
          Service_Name: formValue.Service_Name || ''
        }
        this.cpm11010Service.insertCPM11010(insertRequest)
          .pipe(untilDestroyed(this), finalize(() => this.loading = false))
          .subscribe(() => {
            this.messageService.successBubble('新增成功');
            this.dataForm.reset(); // 重置表單
          });
      }
      // 修改
      else if (this.crudstatus === CRUDStatus.Edit) {
        const updateRequest: UpdateCPM11010Request = {
          ID: this.rowdata?.ID!,
          Service_Name: formValue.Service_Name || ''
        }
        this.cpm11010Service.updateCPM11010(updateRequest)
          .pipe(untilDestroyed(this), finalize(() => this.loading = false))
          .subscribe(() => {
            this.messageService.successBubble('修改成功');
            this.onCancel();  // 返回查詢頁
          });
      }
    });
  }

  loadOptions() {
    // 載入館別選項
    this.dropdownApiService.querySys3800().subscribe(options => {
      this.buildingNoOptions = options ?? [];
    });
    // 載入營業樓層選項
    this.dropdownApiService.querySys3900().subscribe(options => {
      this.floorNoOptions = options ?? [];
    });
    // 載入營業區域選項
    this.dropdownApiService.querySys3A00().subscribe(options => {
      this.areaNoOptions = options ?? [];
    });
  }
}