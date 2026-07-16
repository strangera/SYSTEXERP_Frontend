import { NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { PluLogo, Tls51060Service } from '@service/api/tls/tls51060.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { apiOption, Sysb300m } from '@shared/models/sys/sysb000.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { ValidationService } from '@shared/service/validation.service';
import { PanelModule } from 'primeng/panel';
//

// 2.5.1.6 品牌設定作業  CRU
@Component({
  selector: 'app-tls51060-cru',
  templateUrl: './tls51060-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, InputNumberComponent, DropdownComponent, NgIf, TranslateModule]
})
export class TLS51060CRUComponent extends BasicCruPageComponent<PluLogo>
  implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // PLULOGO  商品品牌設定檔
    id: [],
    LOGO_No: ['', [Validators.required, Validators.maxLength(4), this.validationService.numberValidator]], // 品牌代碼
    LOGO_CH_NAME: ['', [Validators.required, Validators.maxLength(50)]], // 品牌中文名稱
    LOGO_EN_NAME: ['', [Validators.maxLength(100)]], // 品牌英文名稱
    LOGO_Remark: ['', [Validators.maxLength(100)]], // 備註說明
    PLU_OrderPrcRate: [100, [Validators.maxLength(10)]], // 標準進貨折數 預設100
    HOS_No: ['', [Validators.maxLength(10)]], // 建議倉別代碼/名稱 POS2034倉庫設定檔(O)
    // VEN_No: ['', [Validators.maxLength(16)]], // 廠商編號 保留目前不使用

    // 20251014: 新增 專櫃編號欄位
    TLT_No: ['', [this.validationService.noChineseValidator, Validators.maxLength(12)]], // 專櫃編號

    CanDel: [null],  //能否刪除(僅顯示) 卡控
  });
  //
  storageOptions: apiOption[] = [];
  TLT_No_Option: any[] = []; // 專櫃編號
  allquery: Sysb300m[] = [];

  // ----------------------------------------------------------------
  constructor(
    private tls51060Service: Tls51060Service,
    private validationService: ValidationService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS51060', this.dataForm);
    this.loadOptions();
    console.log('dataform', this.dataForm.value);

    // 0626新增 卡控 編輯的卡控 同 [刪除] ，若不可刪除也不可編輯 品牌代碼、標準進貨折數
    const canDelValue = this.dataForm.get('CanDel')?.value as unknown as boolean;
    if (canDelValue === false) {
      this.dataForm.get('LOGO_No')?.disable();            // 品牌代碼不可編輯
      //!!! Issue【標準進貨折數】同原系統不可反黑，需可開放修改
      // this.dataForm.get('PLU_OrderPrcRate')?.disable();   // 標準進貨折數不可編輯
    }
  }

  onSubmit(frm: FormGroup) {
    // 使用父類別的 handleSubmit 來處理驗證與泡泡訊息
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            const formValue = frm.getRawValue();
            this.tls51060Service.insertTLS51060(formValue).subscribe(() => {
              this.messageService.successBubble('新增成功');
              this.dataForm.reset();
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            const formValue = frm.getRawValue();
            this.tls51060Service.updateTLS51060(formValue).subscribe(() => {
              this.onCancel();
            });
          }
          break;
      }
    });
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
  }

  // 讀取dopropdown選項
  loadOptions() {
    {
      this.tls51060Service
        .queryPOS2034_DropDownList({}).pipe(untilDestroyed(this))
        .subscribe((response) => {
          this.storageOptions = response.Data.map((item: apiOption) => ({
            No: item.No,
            Name: item.Name,
            Label: item.No + '-' + item.Name,
          }));
        });

      // 查詢 專櫃編號(這邊要用這支_後端提供的queryTLTTALENT_ByStoreWay2AndApprove2_DropDownList )
      this.tls51060Service.queryTLTTALENT_ByStoreWay2AndApprove2_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
        this.TLT_No_Option = response.Data.map((item: any) => ({
          No: item.No, // 專櫃編號代碼
          Label: item.No + '-' + item.Name, // 組合成顯示用的Label
        }));
        console.log('專櫃編號代碼:', response.Data);
      });
    }
  }
}
