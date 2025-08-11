import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { apiOption } from '../../../shared/models/sys/sysb000.model';
import { POS2034 } from '../../../shared/models/tls/tls000.model';
import { Tls51080Service } from '../../../service/api/tls/tls51080.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

// 2.5.1.6 品牌設定作業  CRU
@Component({
  selector: 'app-tls51080-cru',
  templateUrl: './tls51080-cru.component.html',
  styleUrl: './tls51080-cru.component.scss',
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
    HOS_No: ['', [Validators.required, Validators.maxLength(10)]], // 倉庫代碼 STO_NO+HOS_NO唯一值
    HOS_NAME: ['', [Validators.required, Validators.maxLength(50)]], // 倉庫名稱
    org_id: ['', [Validators.required, Validators.maxLength(20)]], // 部門編號/分店
    building_no: ['', [Validators.maxLength(1)]], // 館別
    HOS_Remark: ['', [Validators.maxLength(100)]], // 備註說明
  });
  //
  org_idOptions: apiOption[] = [];
  building_noOptions: apiOption[] = [];
  STO_NoOptions: apiOption[] = [];
  // ----------------------------------------------------------------
  constructor(private tls51080Service: Tls51080Service) {
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
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    // 送出前去除org_id中/以後的部分
    if (frm.value.org_id) {
      frm.value.org_id = frm.value.org_id.split('/')[0];
    }

    const formValue = frm.getRawValue();
    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          console.log('insert', formValue);
          this.tls51080Service.insertTLS51080(formValue).subscribe(() => {
            this.messageService.successBubble('新增成功');
            // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
            this.dataForm.reset(); // 重置表單
          });
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          console.log('update', formValue);
          this.tls51080Service.updateTLS51080(formValue).subscribe(() => {
            // this.messageService.successBubble('更新成功');
            this.onCancel(); // 儲存後，會返回列表
          });
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
  }

  // 讀取dopropdown選項
  loadOptions() {
    {
      // 組織代碼/所屬部門 SYS3100 JOIN POS1001
      this.tls51080Service
        .querySYS3100_join_POS1001_DropDownList({})
        .subscribe((response) => {
          this.org_idOptions = response.Data.map((item: apiOption) => ({
            No: item.No,
            Name: item.Name,
            Label: item.No + '-' + item.Name,
          }));

          // 如果org_id有資料進來，找出對應的完整No
          if (this.dataForm.value.org_id) {
            const matched = this.org_idOptions.find(opt => opt.No.startsWith(this.dataForm.value.org_id + '/'));
            if (matched) {
              this.dataForm.patchValue({
                org_id: matched.No,  // 將org_id從 '0001' 改成 '0001/1000'
              });
            }
          }
        });

      // 讀取館別代碼選項
      this.tls51080Service
        .querySYS3800_DropDownList({})
        .subscribe((response) => {
          this.building_noOptions = response.Data.map((item: apiOption) => ({
            No: item.No,
            Name: item.Name,
            Label: item.No + '-' + item.Name,
          }));

          console.log('館別', this.building_noOptions);
        });


      //如果org_id有資料進來 找出對應的Label 並補上/後面的部分
    }
  }
}
