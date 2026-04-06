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

// 2.5.1.6 品牌設定作業  CRU
@Component({
  selector: 'app-tls51080-cru',
  templateUrl: './tls51080-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, NgIf, TranslateModule]
})
export class TLS51080CRUComponent extends BasicCruPageComponent<POS2034>
  implements OnInit {
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
    this.initializePage('TLS51080', this.dataForm);
    this.loadOptions();

    console.log('讀取資料', this.dataForm.value);

    //因此作業不可刪除，倉庫代碼 不可異動
    if (this.crudstatus == CRUDStatus.Edit) {
      this.dataForm.get('HOS_No')?.disable();
    }
  }

  onSubmit(frm: FormGroup) {
    // 送出前去除org_id中/以後的部分
    if (frm.value.org_id) {
      frm.value.org_id = frm.value.org_id.split('/')[0];
    }

    // 使用父類別的 handleSubmit 來處理驗證與泡泡訊息
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
