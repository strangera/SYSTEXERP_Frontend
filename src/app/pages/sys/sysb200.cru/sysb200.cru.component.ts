import { Component, OnInit } from '@angular/core';
import { Validators, FormArray, FormBuilder, FormControl, AbstractControl } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Tlsb200Model } from './tlsb200.model';
import { map, Observable } from 'rxjs';
import { Sysbc00Service } from './../../../service/api/sys/sysbc00.service';

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

    // 聯絡人 (多筆)
    contacts: this.formBuilder.array([]),

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
    this.addContact();
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

  // contacts FormArray
  get contacts(): FormArray {
    return this.dataForm.get('contacts') as FormArray;
  }

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

  approve() {
    this.dataForm.controls['VEN_Status'].setValue('1');
    this.messageService.successBubble('已通過審核');
  }

  unapprove() {

    this.dataForm.controls['VEN_Status'].setValue('0');
    this.messageService.successBubble('已取消審核');
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

  getFormControl(control: AbstractControl | null): FormControl {
    return control as FormControl;
  }

  onSubmit(form: any): void {
    this.handleSubmit(form, () => {
      const data = form.getRawValue();
      if (this.crudstatus === 'Create') {
        // this.apiService.create(data).subscribe(...)
      } else if (this.crudstatus === 'Edit') {
        // this.apiService.update(data).subscribe(...)
      }
    });
  }
}
