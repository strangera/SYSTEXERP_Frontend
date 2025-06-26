import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { apiOption, Sysb300m } from '../../../shared/models/sys/sysb000.module';
import { PluLogo } from '../../../shared/models/tls/tls000.model';
import { Tls51060Service } from '../../../service/api/tls/tls51060.service';
//

// 2.5.1.6 品牌設定作業  CRU
@Component({
  selector: 'app-tls51060-cru',
  templateUrl: './tls51060-cru.component.html',
  styleUrl: './tls51060-cru.component.scss'
})
export class TLS51060CRUComponent extends BasicCruPageComponent<PluLogo>
  implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // PLULOGO  商品品牌設定檔
    id: [],
    LOGO_No: ['', [Validators.required, Validators.maxLength(4)]], // 品牌編碼
    LOGO_CH_NAME: ['', [Validators.required, Validators.maxLength(50)]], // 品牌中文名稱
    LOGO_EN_NAME: ['', [Validators.maxLength(100)]], // 品牌英文名稱
    LOGO_Remark: ['', [Validators.maxLength(100)]], // 備註說明
    PLU_OrderPrcRate: [100, [Validators.required, Validators.maxLength(10)]], // 標準進貨折數 預設100
    HOS_No: ['', [Validators.maxLength(10)]], // 倉別代碼(建議倉別) POS2034倉庫設定檔(O)
    // VEN_No: ['', [Validators.maxLength(16)]], // 廠商編號 保留目前不使用

    CanDel: [null],  //能否刪除(僅顯示) 卡控
  });
  //
  storageOptions: apiOption[] = [];
  allquery: Sysb300m[] = [];

  // ----------------------------------------------------------------
  constructor(private tls51060Service: Tls51060Service) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS51060', this.dataForm);
    this.loadOptions();
    console.log('dataform', this.dataForm.value);

    // 0626新增 卡控 編輯的卡控 同 [刪除] ，若不可刪除也不可編輯 品牌代碼、標準進貨折數
    const canDelValue = this.dataForm.get('CanDel')?.value as unknown as boolean;
    if (canDelValue === false) {
      this.dataForm.get('LOGO_No')?.disable();            // 品牌編碼不可編輯
      this.dataForm.get('PLU_OrderPrcRate')?.disable();   // 標準進貨折數不可編輯
    }
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    //--檢查--
    // 品牌編號：為唯一值。
    // 品牌標準進貨折數：文字型態，長度１０，可輸入數字及小數點。例如91.25折時，輸入91.25
    //                                    預設１００，若為７７折時，輸入７７。
    //                                    可輸入到小數點以下2位。
    //
    //--------
    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          console.log('insert', frm.value);
          this.tls51060Service.insertTLS51060(frm.value).subscribe(() => {
            this.messageService.successBubble('新增成功');
            // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
            this.dataForm.reset(); // 重置表單
          });
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          console.log('update', frm.value);
          this.tls51060Service.updateTLS51060(frm.value).subscribe(() => {
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
      this.tls51060Service
        .queryPOS2034_DropDownList({})
        .subscribe((response) => {
          this.storageOptions = response.Data.map((item: apiOption) => ({
            No: item.No,
            Name: item.Name,
            Label: item.No + '-' + item.Name,
          }));
        });
    }
  }
}
