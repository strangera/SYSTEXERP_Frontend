import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Tlsb200Model } from './tlsb200.model';

@Component({
  selector: 'app-sysb200-cru',
  templateUrl: './sysb200.cru.component.html',
  styleUrls: ['./sysb200.cru.component.scss']
})
export class SYSB200CRUComponent extends BasicCruPageComponent<Tlsb200Model> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    // 基本資料
    VEN_No: ['', [Validators.required, Validators.maxLength(14)]],
    VEN_Flag: [[]],
    VEN_Uniform: ['', Validators.maxLength(10)],
    VEN_RemitFeeMode: ['', Validators.required],
    VEN_Name: ['', [Validators.required, Validators.maxLength(60)]],
    VEN_EngName: ['', Validators.maxLength(60)],
    VEN_ShortName: ['', Validators.maxLength(10)],

    // 公司資料
    VEN_Post: ['', Validators.maxLength(6)],
    VEN_Address: ['', Validators.maxLength(100)],
    VEN_GUIAddr: ['', Validators.maxLength(100)],
    VEN_Tel: ['', Validators.maxLength(15)],
    VEN_Fax: ['', Validators.maxLength(15)],
    VEN_Email: ['', Validators.maxLength(60)],
    VEN_GUIEmail: ['', Validators.maxLength(60)],

    // 聯絡人
    VEN_Boss: ['', Validators.maxLength(12)],
    VEN_BossTitle: ['', Validators.maxLength(16)],
    VEN_BossID: ['', Validators.maxLength(10)],
    VEN_BossAddr: ['', Validators.maxLength(100)],
    VEN_BossEmail: ['', Validators.maxLength(60)],

    // 付款資料
    VEN_PayType: ['', Validators.required],
    VEN_BNK_No: ['', Validators.required],
    VEN_BankAccountNo: ['', Validators.maxLength(40)],
    VEN_AccountName: ['', Validators.maxLength(64)],
    VEN_PayConditionDay: ['', Validators.required],

    // 其他資料
    VEN_CheckTitle: ['', Validators.maxLength(20)],
    VEN_Remark: ['', Validators.maxLength(160)]
  });

  // 下拉選項資料
  flagOptions = [
    { value: '1', label: '統一編號' },
    { value: '2', label: '身份證' }
  ];

  remitFeeOptions = [
    { value: '1', label: '廠商負擔' },
    { value: '2', label: '公司負擔' }
  ];

  payTypeOptions = [
    { value: '1', label: '匯款' },
    { value: '2', label: '支票' }
  ];

  bankCodeOptions = [
    { value: '004', label: '台灣銀行' },
    { value: '005', label: '土地銀行' }
  ];

  constructor(
    // private apiService: TlsB200Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB200', this.dataForm);
  }

  onSubmit(form: any): void {
    this.handleSubmit(form, () => {
      const data = form.getRawValue();
      if (this.crudstatus === 'Create') {
        // this.apiService.create(data).subscribe(() => {
        //   this.messageService.successBubble('新增成功');
        //   this.onCancel();
        // });
      } else if (this.crudstatus === 'Edit') {
        // this.apiService.update(data).subscribe(() => {
        //   this.messageService.successBubble('更新成功');
        //   this.onCancel();
        // });
      }
    });
  }
}
