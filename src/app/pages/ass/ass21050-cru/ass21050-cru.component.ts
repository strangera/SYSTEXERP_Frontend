import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS21030Service } from '@service/api/ass/ass21030.service';
import { ASS21050Service } from '@service/api/ass/ass21050.service';
import { IDropdownItem } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs/operators';
import { apiOption } from 'src/app/shared/models/sys/sysb000.model';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';

@Component({
  selector: 'app-ass21050-cru',
  templateUrl: './ass21050-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, ButtonComponent, TranslateModule]
})
export class ASS21050CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    id: [0], // 編輯時需要的 ID
    LOCATION_No: [{ value: '', disabled: false }], // 將根據模式動態禁用
    LOCATION_Name: ['', [Validators.maxLength(30)]],
    FLOOR_NO: [''],
    AREA_NO: [''],
    LOCATION_Remark: ['', [Validators.maxLength(200)]],
    mark: [''],
    Draw_X: [''],
    Draw_Y: [''],
    building_no: [''],
    NET_SPACE: ['']
  });
  floorNoOptions: IDropdownItem[] = [];
  areaNoOptions: IDropdownItem[] = [];
  buildingNoOptions: IDropdownItem[] = [];
  ENG_MeterNo_Option: apiOption[] = [];
  constructor(
    private ass21030Service: ASS21030Service,
    private ass21050Service: ASS21050Service,
    private dropDownListService: DropDownListService,
    private dropdownApiService: DropdownApiService,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('ASS21050', this.dataForm);
    this.loadOptions();
    this.setFieldStates();
  }

  /**
   * 設定欄位狀態（可編輯/禁用）
   */
  private setFieldStates(): void {
    if (this.isFormCreateable) {
      // 新增模式：設備位置編號禁用（後端自動給號）
      this.dataForm.controls.LOCATION_No.disable();
    } else {
      // 編輯模式：只允許修改特定欄位，其他為唯讀
      this.dataForm.controls.LOCATION_No.disable();
      this.dataForm.controls.FLOOR_NO.disable();
      this.dataForm.controls.AREA_NO.disable();
      this.dataForm.controls.building_no.disable();
      this.dataForm.controls.mark.disable();
    }
  }
  loadOptions() {
    // 查 取得能源表號
    this.ass21030Service.queryENG1001_ENG_MeterNo_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.ENG_MeterNo_Option = response.Data.map((item: any) => ({
        No: item.ENG_MeterNo,
        Name: item.ENG_MeterNo,
      }));
    });
    // 載入營業樓層選項
    this.dropdownApiService.querySys3900().subscribe(options => {
      this.floorNoOptions = options ?? [];
    });
    // 載入營業區域選項
    this.dropdownApiService.querySys3A00().subscribe(options => {
      this.areaNoOptions = options ?? [];
    });
    //館別
    this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.buildingNoOptions = res.Data.map(x => ({ label: x.Name, value: x.No, Name: x.Name, No: x.No }));
    });
  }
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();

      this.loading = true;

      let apiCall$;

      if (this.isFormCreateable) {
        // 新增模式
        const insertRequestBody = {
          LOCATION_Name: formValue.LOCATION_Name || '',
          building_no: formValue.building_no || '',
          FLOOR_NO: formValue.FLOOR_NO || '',
          AREA_NO: formValue.AREA_NO || '',
          Draw_X: formValue.Draw_X ? String(formValue.Draw_X).trim() : '',
          Draw_Y: formValue.Draw_Y ? String(formValue.Draw_Y).trim() : '',
          NET_SPACE: formValue.NET_SPACE ? String(formValue.NET_SPACE).trim() : '',
          LOCATION_Remark: formValue.LOCATION_Remark || ''
        };

        apiCall$ = this.ass21050Service.insertASS21050(insertRequestBody);
      } else {
        // 編輯模式
        const updateRequestBody = {
          id: formValue.id || 0,
          LOCATION_Name: formValue.LOCATION_Name || '',
          Draw_X: formValue.Draw_X || '',
          Draw_Y: formValue.Draw_Y || '',
          LOCATION_Remark: formValue.LOCATION_Remark || ''
        };
        apiCall$ = this.ass21050Service.updateASS21050(updateRequestBody);
      }

      apiCall$.pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      ).subscribe({
        next: (response: any) => {
          if (response && response.Status === '0000') {
            const successMessage = this.isFormCreateable ? '新增成功' : '修改成功';
            this.messageService.successBubble(response.Message || successMessage);
            this.onCancel();
          } else {
            const errorMessage = this.isFormCreateable ? '新增失敗' : '修改失敗';
            this.messageService.errorBubble(response?.Message || errorMessage);
          }
        },

      });
    });
  }
}
