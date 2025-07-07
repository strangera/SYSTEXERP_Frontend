import { Component, OnInit } from '@angular/core';
import { Validators, FormArray, FormBuilder, FormControl, AbstractControl } from '@angular/forms';
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

    contacts: this.formBuilder.array([]),


    VEN_PayType: ['', Validators.required],
    VEN_BNK_No: ['', Validators.required],
    VEN_BankAccountNo: ['', Validators.maxLength(40)],
    VEN_AccountName: ['', Validators.maxLength(64)],
    VEN_PayConditionDay: ['', Validators.required],

    VEN_CheckTitle: ['', Validators.maxLength(20)],
    VEN_Remark: ['', Validators.maxLength(160)]
  });


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
  constructor(override readonly formBuilder: FormBuilder) {
    super();
  }


  ngOnInit(): void {
    this.initializePage('SYSB200', this.dataForm);
    this.addContact();
  }

  // 取出 contacts FormArray
  get contacts(): FormArray {
    return this.dataForm.get('contacts') as FormArray;
  }

  // 建立單一聯絡人群組
  createContactGroup() {
    return this.formBuilder.group({
      VEN_Boss: ['', Validators.maxLength(12)],
      VEN_BossTitle: ['', Validators.maxLength(16)],
      VEN_BossID: ['', Validators.maxLength(10)],
      VEN_BossTel: ['', Validators.maxLength(15)],
      VEN_BossAddr: ['', Validators.maxLength(100)],
      VEN_BossEmail: ['', Validators.maxLength(60)]
    });
  }

  addContact() {
    this.contacts.push(this.createContactGroup());
  }

  removeContact(index: number) {
    this.contacts.removeAt(index);
  }

  copyAddress() {
    this.dataForm.controls['VEN_GUIAddr'].setValue(this.dataForm.controls['VEN_Address'].value);
  }

  // 模板裡強制轉型
  getFormControl(control: AbstractControl | null): FormControl {
    return control as FormControl;
  }

  onSubmit(form: any): void {
    this.handleSubmit(form, () => {
      const data = form.getRawValue();
      if (this.crudstatus === 'Create') {
        // 呼叫 API 新增
      } else if (this.crudstatus === 'Edit') {
        // 呼叫 API 更新
      }
    });
  }
}
