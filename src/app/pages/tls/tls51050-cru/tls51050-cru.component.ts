import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { PluUnit } from '../../../shared/models/tls/tls000.model';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { option } from '../../../shared/models/sys/sysb000.module';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { Tls51050Service } from '../../../service/API/tls/tls51050.service';
//

// 2.5.1.5 商品單位設定  CRU
@Component({
  selector: 'app-tls51050-cru',
  templateUrl: './tls51050-cru.component.html',
  styleUrl: './tls51050-cru.component.scss'
})
export class TLS51050CRUComponent extends BasicCruPageComponent<PluUnit>
  implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // PLUUNIT  商品單位設定檔
    id: [],
    UNIT_No: ['', [Validators.maxLength(2)]], // 單位代碼
    UNIT_NAME: ['', [Validators.maxLength(40)]], // 單位名稱
    UNIT_Attribute: ["1", [Validators.maxLength(1)]], // 單位屬性 1基本單位 2包裝單位 (預設1，目前只有基本單位沒有包裝單位)
    // CHILD_UNIT: ['', [Validators.maxLength(2)]], // 子項單位代號 --沒有使用
    // CHILD_QTY: [, [this.validationService.numberValidator]], // 子項單位數量 --沒有使用

    UNIT_Remark: ['', [Validators.maxLength(100)]], // 備註說明

    //分頁查詢
    ...createPaginationConfig([{ field: 'UNIT_No', order: 1 }]), // 分頁和排序參數
  });

  //
  attributeOptions: option[] = [
    { 'value': "1", 'label': '基本單位' },
    { 'value': "2", 'label': '包裝單位' }
  ];
  allquery: PluUnit[] = [];

  // ----------------------------------------------------------------
  constructor(
    private tls51050Service: Tls51050Service) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS51050', this.dataForm);
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    //--檢查--
    // 新增時
    // 單位屬性：預設1 基本單位，目前只有基本單位沒有包裝單位
    //--------
    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          console.log('insert', frm.value);
          this.tls51050Service.insertTLS51050(frm.value).subscribe(() => {
            this.messageService.successBubble('新增成功');
            // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
            this.dataForm.reset(); // 重置表單
          });
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          console.log('update', frm.value);
          this.tls51050Service.updateTLS51050(frm.value).subscribe(() => {
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
    // {
    //   this.tls51060Service
    //     .queryPOS2034_DropDownList({})
    //     .subscribe((response) => {
    //       this.storageOptions = response.Data.map((item: apiOption) => ({
    //         No: item.No,
    //         Name: item.Name,
    //         Label: item.No + '-' + item.Name,
    //       }));
    //     });
    // }
  }
}
