import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Tlsb200Model } from './tlsb200.model';
import { map, Observable, finalize } from 'rxjs';
import { Sysbc00Service } from './../../../service/api/sys/sysbc00.service';
import { Column } from '../../../shared/componentkit/table/table.model';
import {
  validateMaxLength,
} from '../../../shared/models/system/validate-field.model';

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

    // 付款資料
    VEN_PayType: ['', Validators.required],
    VEN_BankNo: ['', [Validators.maxLength(10)]],
    VEN_BankAccountNo: ['', Validators.maxLength(40)],
    VEN_AccountName: ['', Validators.maxLength(64)],
    VEN_PayConditionDay: ['', Validators.required],

    // 其他資料
    VEN_Status: ['0', Validators.required],
    VEN_Remark: ['', Validators.maxLength(160)]
  });

  // 聯絡人表格資料
  contacts: any[] = [];
  selectedRows: any[] = [];

  columns: Column[] = [
    { field: 'VEN_Boss', header: '聯絡人', type: 'input', validate: [validateMaxLength(12)] },
    { field: 'VEN_BossTitle', header: '職稱', type: 'input', validate: [validateMaxLength(16)] },
    { field: 'VEN_BossID', header: '身份證字號', type: 'input', validate: [validateMaxLength(10)] },
    { field: 'VEN_BossTel', header: '電話', type: 'input', validate: [validateMaxLength(15)] },
    { field: 'VEN_BossAddr', header: '地址', type: 'input', validate: [validateMaxLength(100)] },
    { field: 'VEN_BossEmail', header: '電子郵件', type: 'input', validate: [validateMaxLength(60)] },
  ];

  flagOptions = [
    { value: '1', label: '統一編號' },
    { value: '2', label: '身份證' }
  ];

  remitFeeOptions = [
    { value: '1', label: '廠商負擔' },
    { value: '2', label: '公司負擔' }
  ];

  payTypeOptions = [
    { value: '1', label: '電匯' },
    { value: '2', label: '發票' },
    { value: '3', label: '現金' }
  ];

  statusOptions = [
    { label: '未審核', value: '0' },
    { label: '已審核', value: '1' }
  ];

  bankOptions$!: Observable<any[]>;

  constructor(
    override readonly formBuilder: FormBuilder,
    private sysbc00Service: Sysbc00Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB200', this.dataForm);
    this.loadBankOptions();
  }

  loadBankOptions() {
    this.bankOptions$ = this.sysbc00Service.querySYSBC00({}).pipe(
      map(res => (res.Data ?? []).map(item => ({
        label: `${item.BNK_No} ${item.BNK_Name}`,
        value: item.BNK_No
      })))
    );
  }

  approve() {
    this.dataForm.controls['VEN_Status'].setValue('1');
    this.messageService.successBubble('已通過審核');
  }

  unapprove() {
    this.dataForm.controls['VEN_Status'].setValue('0');
    this.messageService.successBubble('已取消審核');
  }

  copyAddress() {
    this.dataForm.controls['VEN_GUIAddr'].setValue(this.dataForm.controls['VEN_Address'].value);
  }

  resetTable() {
    this.contacts = [];
    this.selectedRows = [];
  }

  onDelete(rows: any[]) {
    this.contacts = this.contacts.filter(item => !rows.includes(item));
    this.selectedRows = [];
  }

  onSubmit(form: FormGroup): void {
    console.log("表單 valid 狀態：", form.valid);
    if (!form.valid) {
      this.messageService.warnBubble("請確認所有必填欄位皆已正確填寫");
      return;
    }

    this.loading = true;

    const data = {
      ...form.getRawValue(),
      contacts: this.contacts
    };

    // 模擬 API 呼叫
    const apiCall$ = this.crudstatus === 'Create'
      ? this.sysbc00Service.insertSYSBC00(data) //新增 API
      : this.sysbc00Service.updateSYSBC00(data); //修改 API

    apiCall$
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.messageService.successBubble(this.crudstatus === 'Create' ? '新增成功' : '修改成功');
          this.onCancel(); // 或者 reset，或跳轉
        },
        error: () => {
          this.messageService.errorBubble('送出失敗，請稍後再試');
        }
      });
  }
}
