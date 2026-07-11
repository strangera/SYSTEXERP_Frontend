import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '@shared/service/validation.service';
import { SortMeta } from 'primeng/api';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { Sysb100m } from '../../../shared/models/sys/sysb000.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { Sysb100Service } from './../../../service/api/sys/sysb100.service';

@Component({
  selector: 'app-sysb100.cru',
  templateUrl: './sysb100.cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    NgIf,
    TranslateModule,
  ],
})
//4.1.1.1 公司基本資料維護作業 CRU
export class SYSB100CRUComponent
  extends BasicCruPageComponent<Sysb100m>
  implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    id: [], // ID
    SYS_StoreNo: ['', [Validators.required, Validators.maxLength(10)]], // 公司編號/店號
    STR_Uniform: ['', [Validators.required, Validators.maxLength(8), this.validationService.numberValidator]], // 統一編號 (0805新增數字驗證)
    SYS_StoreName: ['', [Validators.required, Validators.maxLength(60)]], // 公司名稱(中文)
    SYS_StoreNameENG: ['', [Validators.maxLength(60), this.validationService.noChineseValidator]], // 公司名稱(英文)
    STO_TaxNo: ['', [Validators.required, Validators.maxLength(10), this.validationService.noChineseValidator]], // 稅籍編號 (0805新增 非中文 驗證)
    STO_ManagerName: ['', [Validators.required, Validators.maxLength(12)]], // 負責人
    STO_ContactName: ['', [Validators.required, Validators.maxLength(12)]], // 聯絡人
    STO_ContactTel: ['', [Validators.required, Validators.maxLength(15), this.validationService.numberValidator]], // 聯絡人電話
    STO_ContactFax: ['', [Validators.required, Validators.maxLength(15), this.validationService.numberValidator]], // 聯絡人傳真
    STO_Addr: ['', [Validators.required, Validators.maxLength(100)]], // 公司(營業處)地址(中文)
    STO_AddrENG: ['', [Validators.maxLength(100), this.validationService.noChineseValidator]], // 公司(營業處)地址(英文)
    STO_RegAddr: ['', [Validators.required, Validators.maxLength(100)]], // 公司登記地址(中文)
    STO_RegAddrENG: ['', [Validators.maxLength(100), this.validationService.noChineseValidator]], // 公司登記地址(英文)
    STO_BRN: ['', [Validators.maxLength(10), this.validationService.noChineseValidator]], // 營業登記證號 (0805新增 非中文 驗證)
    STO_Tel: ['', [Validators.maxLength(15), this.validationService.numberValidator]], // 公司電話
    STO_Fax: ['', [Validators.maxLength(15), this.validationService.numberValidator]], // 公司傳真
    STO_PostCode: ['', [Validators.required, Validators.maxLength(6), this.validationService.numberValidator]], // 郵遞區號
    STO_MailTel: ['', [Validators.maxLength(15), this.validationService.numberValidator]], // 郵寄電話
    STO_MailFax: ['', [Validators.maxLength(15), this.validationService.numberValidator]], // 郵寄傳真
    STO_MailAddr: ['', [Validators.maxLength(100)]], // 郵寄地址
    STO_InvoiceAddr: ['', [Validators.maxLength(100)]], // 發票地址
    STO_Email: ['', [Validators.maxLength(100), Validators.email]], // 電子郵件
    STO_URL: ['', [Validators.maxLength(100), this.validationService.noChineseValidator]], // 公司網址 (0805新增 非中文 驗證)
  });

  constructor(
    private sysb100Service: Sysb100Service,
    private validationService: ValidationService) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB100', this.dataForm);
  }

  onSubmit(frm: FormGroup) {
    // 修改：使用父類的 handleSubmit 方法
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            //如果公司資料已經存在則不允許新增(只能一筆)
            const querydataForm = this.formBuilder.group({
              SYS_StoreNo: ['', [Validators.maxLength(10)]], // 公司編號/店號
              STR_Uniform: ['', [Validators.maxLength(8)]], // 統一編號
              SYS_StoreName: ['', [Validators.maxLength(60)]], // 公司名稱(中文)
              SYS_StoreNameENG: ['', [Validators.maxLength(60)]], // 公司名稱(英文)
              STO_TaxNo: ['', [Validators.maxLength(10)]], // 稅籍編號
              STO_ManagerName: ['', [Validators.maxLength(12)]], // 負責人
              STO_ContactName: ['', [Validators.maxLength(12)]], // 聯絡人
              STO_ContactTel: ['', [Validators.maxLength(15)]], // 聯絡人電話
              STO_ContactFax: ['', [Validators.maxLength(15)]], // 聯絡人傳真
              STO_Addr: ['', [Validators.maxLength(100)]], // 公司(營業處)地址(中文)
              STO_AddrENG: ['', [Validators.maxLength(100)]], // 公司(營業處)地址(英文)
              STO_RegAddr: ['', [Validators.maxLength(100)]], // 公司登記地址(中文)
              STO_RegAddrENG: ['', [Validators.maxLength(100)]], // 公司登記地址(英文)
              STO_BRN: ['', [Validators.maxLength(10)]], // 營業登記證號
              STO_Tel: ['', [Validators.maxLength(15)]], // 公司電話
              STO_Fax: ['', [Validators.maxLength(15)]], // 公司傳真
              STO_PostCode: ['', [Validators.maxLength(6)]], // 郵遞區號
              STO_MailTel: ['', [Validators.maxLength(15)]], // 郵寄電話
              STO_MailFax: ['', [Validators.maxLength(15)]], // 郵寄傳真
              STO_MailAddr: ['', [Validators.maxLength(100)]], // 郵寄地址
              STO_InvoiceAddr: ['', [Validators.maxLength(100)]], // 發票地址
              STO_Email: ['', [Validators.maxLength(100)]], // 電子郵件
              STO_URL: ['', [Validators.maxLength(100)]], // 公司網址

              //分頁查詢
              pageSize: [10],
              pageIndex: [0],
              SortBy: [[{ field: 'SYS_StoreNo', order: 1 }] as SortMeta[]],
            });

            this.sysb100Service
              .querySYSB100(querydataForm.value)
              .subscribe((response) => {
                if (response) {
                  console.log('已存在公司資料');
                  this.messageService.errorBubble('已存在公司資料,不可新增');
                } else {
                  console.log('不存在公司資料');
                  this.sysb100Service.insertSYSB100(frm.value).subscribe(() => {
                    this.messageService.successBubble('新增成功');
                    // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
                    this.dataForm.reset(); // 重置表單
                  });
                }
              });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            this.sysb100Service.updateSYSB100(frm.value).subscribe(() => {
              this.messageService.successBubble('更新成功');
              this.onCancel(); // 更新成功後返回查詢頁面
            });
          }
          break;
      }
    });
  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
  }
}
