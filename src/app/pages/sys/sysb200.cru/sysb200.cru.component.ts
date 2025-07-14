import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Tlsb200Model } from './tlsb200.model';
import { map, Observable, finalize } from 'rxjs';
import { Sysbc00Service } from './../../../service/api/sys/sysbc00.service';
import { Column } from '../../../shared/componentkit/table/table.model';
import { Sysb200Service } from '../../../service/api/sys/sysb200.service';
import { validateMaxLength } from '../../../shared/models/system/validate-field.model';

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

  contacts: any[] = [];
  selectedRows: any[] = [];
  isReadonly = false;

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
    { value: '2', label: '身份證' },
    { value: '3', label: '護照證號' }
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
    private sysb200Service: Sysb200Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB200', this.dataForm);
    const id = this.activatedRoute.snapshot.queryParamMap.get('id');

    if (id) {
      this.sysb200Service.querySYSB200Detail({ pos2013_id: Number(id) }).subscribe({
        next: (res) => {
          this.dataForm.patchValue(res.Data);
          if (res.Data.contacts) {
            this.contacts = res.Data.contacts;
          }
          this.messageService.successBubble('資料載入完成');
        },
        error: () => {
          this.messageService.errorBubble('載入明細失敗');
        }
      });
    }

    this.loadBankOptions();

    if (this.crudstatus === 'Create') {
      this.isReadonly = false;
    } else {
      if (this.dataForm.get('VEN_Status')?.value === '1') {
        this.dataForm.disable();
        this.isReadonly = true;
      } else {
        this.isReadonly = false;
        this.dataForm.get('VEN_Status')?.disable();
        this.dataForm.get('VEN_No')?.disable();
      }
    }
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

  onSubmit(form: FormGroup): void {
    console.log("表單 valid 狀態：", form.valid);
    if (!form.valid) {
      this.messageService.warnBubble("請確認所有必填欄位皆已正確填寫");
      return;
    }

    this.loading = true;

    const flag = form.get('VEN_Flag')?.value;
    const uniform = form.get('VEN_Uniform')?.value;
    const uniformTrimmed = uniform?.trim();

    if (flag === '1') {
      const regex = /^[0-9]{8}$/;
      if (!regex.test(uniformTrimmed)) {
        this.messageService.warnBubble("統一編號格式錯誤，需為 8 碼數字");
        this.loading = false;
        return;
      }
    }

    if (flag === '2') {
      const regex = /^[A-Z]{1}[0-9]{9}$/i;
      if (!regex.test(uniformTrimmed)) {
        this.messageService.warnBubble("身份證格式錯誤，需為 1 英文 + 9 碼數字");
        this.loading = false;
        return;
      }
    }

    const contactsValid = this.contacts.every(item => {
      if (!item.VEN_BossID || item.VEN_BossID.trim() === '') return true;
      const regex = /^[A-Z]{1}[0-9]{9}$/i;
      return regex.test(item.VEN_BossID.trim());
    });

    if (!contactsValid) {
      this.messageService.warnBubble("聯絡人身份證號格式錯誤，需為 1 英文 + 9 碼數字，或留空");
      this.loading = false;
      return;
    }
    const data = {
      ...form.getRawValue(),
      VEN_Uniform: uniformTrimmed === '' ? null : uniformTrimmed,
      VEN_PayConditionDay: Number(form.get('VEN_PayConditionDay')?.value),
      pOS20131Details: this.contacts.map(item => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { ID, ...rest } = item;
        return {
          ...rest,
          VEN_BossID: item.VEN_BossID?.trim() === '' ? null : item.VEN_BossID?.trim(),
          id: item.id ?? 0
        };
      })
    };

    const apiCall$ = this.crudstatus === 'Create'
      ? this.sysb200Service.insertSYSB200(data)
      : this.sysb200Service.updateSYSB200(data);

    apiCall$
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.messageService.successBubble(this.crudstatus === 'Create' ? '新增成功' : '修改成功');
          this.onCancel();
        },
        error: () => {
          this.messageService.errorBubble('送出失敗，請稍後再試');
        }
      });
  }

}
