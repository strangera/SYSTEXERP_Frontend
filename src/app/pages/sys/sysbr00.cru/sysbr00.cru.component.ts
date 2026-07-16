import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { validateDuplicate, validateMaxLength, validateRequired } from '@others/component/table/validate-field.model';
import { ValidationService } from '@shared/service/validation.service';
import { ButtonDirective } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { forkJoin } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { SYSBR00Service } from '../../../service/api/sys/sysbr00.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { TableComponent } from '../../../others/component/table/table.component';

@Component({
  selector: 'app-sysbr00-cru',
  templateUrl: './sysbr00.cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    NgIf,
    TableComponent,
    InputGroupModule,
    InputTextModule,
    NgClass,
    ButtonDirective,
    TranslateModule
  ],
})
export class SYSBR00CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  // 表單定義
  dataForm = this.formBuilder.nonNullable.group({
    CITY_ID: [0], // 縣市ID
    CITY_No: [null, [Validators.required, Validators.maxLength(4), this.validation.alphanumericValidator]], // 縣市代號
    CITY_Name: [null, [Validators.required, Validators.maxLength(8)]], // 縣市名稱
    CITY_Group: [null, [Validators.maxLength(6)]], // 縣市群組
  });
  data: any = []; // 取得的資料
  selectedItems: any = []; // 選取的資料
  columns: any[] = [
    { field: 'AREA_No', header: '地區代號', validate: [validateDuplicate, validateMaxLength(4), validateRequired] },
    { field: 'AREA_Name', header: '地區名稱', type: 'input', validate: [validateDuplicate, validateMaxLength(12), validateRequired] },
    { field: 'POST_No', header: '郵遞區號', type: 'input', validate: [validateDuplicate, validateMaxLength(6), validateRequired] },
  ]
  city: any = []; // 縣市資料
  district: any = []; // 區域資料
  districtForm = this.formBuilder.nonNullable.group({
    AREA_No: ['', [Validators.required, Validators.maxLength(4)]], // 區域代號
    AREA_Name: ['', [Validators.required, Validators.maxLength(12)]], // 區域名稱
    POST_No: ['', [Validators.required, Validators.maxLength(6)]], // 郵遞區號
  });

  constructor(
    private readonly sysbr0Service: SYSBR00Service,
    private readonly validation: ValidationService
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('SYSBR00', this.dataForm);
    this.sysbr0Service.queryCities().subscribe(response => {
      this.city = response.Data;
    });
    if (!this.isFormCreateable) {
      this.initDistrict();
    }
  }

  initDistrict() {
    this.sysbr0Service.queryDistricts().subscribe(response => {
      this.district = response.Data;
      this.data = this.district.filter((item: any) => item.CITY_No === this.dataForm.value.CITY_No);
      this.data = this.data.map((item: any) => {
        return { ...item, id: uuidv4() };// 為每個項目生成唯一的ID
      });
      this.districtForm.controls['AREA_No'].setValidators([Validators.required, Validators.maxLength(4), this.duplicateCpnNoValidator(this.data.map((item: any) => item.AREA_No))]);
      this.districtForm.controls['AREA_Name'].setValidators([Validators.required, Validators.maxLength(12), this.duplicateCpnNoValidator(this.data.map((item: any) => item.AREA_Name))]);
      this.districtForm.controls['POST_No'].setValidators([Validators.required, Validators.maxLength(6), this.duplicateCpnNoValidator(this.data.map((item: any) => item.POST_No))]);
      this.districtForm.updateValueAndValidity(); // 確保驗證器生效
    });
  }

  onAddDistrict(districtForm: FormGroup): void {
    districtForm.markAllAsTouched();
    const { AREA_No, AREA_Name, POST_No } = districtForm.value;
    if (AREA_No && AREA_Name && POST_No && districtForm.valid) {
      this.sysbr0Service.insertArea(this.rowdata.CITY_No, districtForm.value).subscribe(() => {
        this.messageService.successBubble('地區新增成功', '新增成功');
        this.initDistrict();
        districtForm.reset();
      })
    }
  }

  duplicateCpnNoValidator(existingNos: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && existingNos.includes(control.value)) {
        return { duplicate: true }; // 設定 `duplicate` 錯誤
      }
      return null;
    };
  }
  onDelete(data: any): void {
    const deleteObservables = data.map((item: any) => this.sysbr0Service.deleteArea(item.AREA_ID));
    forkJoin(deleteObservables).subscribe(() => {
      this.messageService.successBubble('地區刪除成功', '刪除成功');
      this.initDistrict();
    });
  }
  onRowEditSave(data: any): void {
    const body = {
      AREA_ID: data.newData.AREA_ID,
      AREA_No: data.newData.AREA_No,
      AREA_Name: data.newData.AREA_Name,
      POST_No: data.newData.POST_No,
      CITY_No: this.rowdata.CITY_No,
    }
    this.sysbr0Service.updateArea(body).subscribe(res => {
      this.messageService.successBubble('地區更新成功', '更新成功');
      this.initDistrict();
    });
  }
  onSubmit(frm: FormGroup): void {
    if (this.isFormCreateable) {
      const cityNo = frm.value.CITY_No;
      const isDuplicate = this.city.some((item: any) => item.CITY_No === cityNo);
      if (!isDuplicate) {
        this.sysbr0Service.insertCity(frm.value).subscribe(() => {
          this.messageService.successBubble('縣市新增成功', '新增成功');
          frm.reset();
        });
      } else {
        this.messageService.errorBubble('縣市代號已存在，請重新輸入', '新增失敗');
      }
    } else if (this.isFormEditable) {
      const cityNo = frm.value.CITY_No;
      const isDuplicate = this.city.some((item: any) => {
        if (this.rowdata && item.CITY_No === this.rowdata.CITY_No) {
          return false; // 跳過當前編輯的項目
        }
        return item.CITY_No === cityNo;
      });
      if (!isDuplicate) {
        this.sysbr0Service.updateCity(frm.value).subscribe(() => {
          this.messageService.successBubble('縣市修改成功', '修改成功');
        });
      } else {
        this.messageService.errorBubble('縣市代號已存在，請重新輸入', '新增失敗');
      }
    }
  }


}
