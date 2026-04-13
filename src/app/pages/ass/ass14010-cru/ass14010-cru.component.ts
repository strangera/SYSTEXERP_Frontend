import { NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls51080Service } from '@service/api/tls/tls51080.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { apiOption } from '@shared/models/sys/sysb000.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { POS2034 } from '@shared/models/tls/tls000.model';
import { ValidationService } from '@shared/service/validation.service';
import { PanelModule } from 'primeng/panel';

//ass14010sample 倉庫設定檔
export interface ass14010sample {
  'id': string;
  'STO_No': string; // 公司編號/店號
  'HOS_No': string; // 倉庫代碼 STO_NO+HOS_NO唯一值 STO_NO+HOS_NO唯一值
  'HOS_NAME': string; // 倉庫名稱
  'org_id': string; // 組織代碼/組織名稱
  'org_name': string; // 部門名稱
  'building_no': string; // 館別代碼
  'HOS_Remark'?: string; // 備註說明

  'CRT_Date': Date;
  'CRT_USR_No': string;
  'CRT_USR_Name': string;
  'UPD_Date': Date;
  'UPD_USR_No': string;
  'UPD_USR_Name': string;

  'CanDel': boolean; //能否刪除(僅顯示)
}

//3.1.4.1  進貨發票建檔作業 CRU
@Component({
  selector: 'app-ass14010-cru',
  templateUrl: './ass14010-cru.component.html',
  styleUrl: './ass14010-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, NgIf, TranslateModule]
})
export class ASS14010CRUComponent extends BasicCruPageComponent<POS2034> implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [null], // 主鍵ID，新增時為null，編輯時為存在的ID
    // POS2034 倉庫設定檔
    STO_No: [{ value: null, disabled: true }], // 公司編號/店號
    HOS_No: ['', [Validators.required, Validators.maxLength(10), this.validationService.numberValidator]], // 倉庫代碼 STO_NO+HOS_NO唯一值
    HOS_NAME: ['', [Validators.required, Validators.maxLength(50)]], // 倉庫名稱
    org_id: ['', [Validators.required, Validators.maxLength(20)]], // 部門編號/分店
    building_no: ['', [Validators.maxLength(1), Validators.required]], // 館別
    HOS_Remark: ['', [Validators.maxLength(100)]], // 備註說明
  });
  //
  SYS3100_Options: apiOption[] = [];
  building_noOptions: apiOption[] = [];
  STO_NoOptions: apiOption[] = [];
  // ----------------------------------------------------------------
  constructor(
    private tls51080Service: Tls51080Service,
    private validationService: ValidationService,
    private readonly dropDownListService: DropDownListService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('ASS14010', this.dataForm);
    this.loadOptions();

    console.log('讀取資料', this.dataForm.value);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            const formValue = frm.getRawValue();
            this.tls51080Service.insertTLS51080(formValue).subscribe(() => {
              this.messageService.successBubble('新增成功');
              this.dataForm.reset();
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            const formValue = frm.getRawValue();
            this.tls51080Service.updateTLS51080(formValue).subscribe(() => {
              this.onCancel();
            });
          }
          break;
      }
    });
  }

  // 讀取dopropdown選項
  loadOptions() {
    {
      // 組織代碼 下拉
      this.dropDownListService.querySYS3100_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
        this.SYS3100_Options = res.Data.map(item => ({ ...item, Label: `${item.No} - ${item.Name}`, }));
        console.log('SYS3100_Options', this.SYS3100_Options);
      })

      // 館別 下拉
      this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
        this.building_noOptions = res.Data.map(item => ({ ...item, Label: `${item.No} - ${item.Name}`, }));
        console.log('館別', this.building_noOptions);
      })
    }
  }
}
