import { Sysb100Service } from './../../../service/sysb/sysb100.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Sysb100m } from '../module/sysb000.module';

@Component({
  selector: 'app-sysb100.cru',
  templateUrl: './sysb100.cru.component.html',
  styleUrl: './sysb100.cru.component.scss',
})
//4.1.1.1 公司基本資料維護作業 CRU
export class SYSB100CRUComponent
  extends BasicCruPageComponent<Sysb100m>
  implements OnInit
{
  dataForm = this.formBuilder.nonNullable.group({
    id: [0], // ID
    SYS_StoreNo: [, [Validators.required, Validators.maxLength(8)]], // 公司編號/店號
    SYS_StoreName: ['', [Validators.required, Validators.maxLength(60)]], // 公司名稱(中文)
    SYS_StoreNameENG: ['', [Validators.maxLength(60)]], // 公司名稱(英文)

    STR_Uniform: [, [Validators.required, Validators.maxLength(8)]], // 統一編號
    STO_TaxNo: [, [Validators.required, Validators.maxLength(9)]], // 稅籍編號
    STO_ManagerName: ['', [Validators.required, Validators.maxLength(12)]], // 負責人

    STO_ContactName: ['', [Validators.required, Validators.maxLength(12)]], // 聯絡人
    STO_ContactTel: ['', [Validators.required, Validators.maxLength(15)]], // 聯絡人電話
    STO_ContactFax: ['', [Validators.required, Validators.maxLength(15)]], // 聯絡人傳真

    STO_Addr: ['', [Validators.required, Validators.maxLength(100)]], // 公司(營業處)地址(中文)
    STO_AddrENG: ['', [Validators.maxLength(100)]], // 公司(營業處)地址(英文)
    STO_RegAddr: ['', [Validators.required, Validators.maxLength(100)]], // 公司登記地址(中文)
    STO_RegAddrENG: ['', [Validators.maxLength(100)]], //公司登記地址(英文)
    STO_BRN: [, [Validators.maxLength(10)]], // 營業登記證號
    STO_PostCode: [, [Validators.required, Validators.maxLength(5)]], // 郵遞區號

    STO_Tel: ['', [Validators.maxLength(15)]], // 公司電話
    STO_Fax: ['', [Validators.maxLength(15)]], // 公司傳真

    STO_MailTel: ['', [Validators.maxLength(15)]], // 郵寄電話
    STO_MailFax: ['', [Validators.maxLength(15)]], // 郵寄傳真
    STO_MailAddr: ['', [Validators.maxLength(100)]], // 郵寄地址

    STO_InvoiceAddr: ['', [Validators.maxLength(60)]], // 發票地址
    STO_Email: ['', [Validators.maxLength(100)]], // 電子郵件
    STO_URL: ['', [Validators.maxLength(60)]], // 公司網址

    CRT_USR_No: [''],
    CRT_USR_Name: [''],
  });

  constructor(private sysb100Service: Sysb100Service) {
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
            console.log('Create');
            this.sysb100Service.insertSYSB100(frm.value).subscribe(() => {
              this.messageService.successBubble('新增成功');
              this.onCancel(); // 新增成功後返回查詢頁面
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            console.log('Edit');
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
