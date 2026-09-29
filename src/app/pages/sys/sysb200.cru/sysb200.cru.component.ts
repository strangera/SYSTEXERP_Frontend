import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { TableComponent } from '../../../others/component/table/table.component';
import { Column } from '../../../others/component/table/table.model';
import {
  validateMaxLength,
  validateNoChinese,
} from '../../../others/component/table/validate-field.model';
import { Sysb200Service } from '../../../service/api/sys/sysb200.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';
import { Tlsb200Model } from './tlsb200.model';
function safeValidator(
  validator: (value: any, ...args: any[]) => { isValid: boolean; errorMessage: string[] }
) {
  return (value: any, rowData: any, data: any[], field: string, header: string) => {
    if (value == null) {
      return { isValid: true, errorMessage: [] }; // 空值直接過
    }
    return validator(value, rowData, data, field, header); // 交給共通處理
  };
}




@Component({
  selector: 'app-sysb200-cru',
  templateUrl: './sysb200.cru.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, RadiobuttonComponent, TableComponent, NgIf, TranslateModule, InputNumberComponent]
})

export class SYSB200CRUComponent extends BasicCruPageComponent<Tlsb200Model> implements OnInit {

  dataForm = this.formBuilder.nonNullable.group({
    // 基本資料
    VEN_No: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(14)]],
    VEN_Flag: ['', Validators.required],
    VEN_Uniform: ['', [
      Validators.maxLength(10),
      Validators.pattern(/^\d{8}$/)
    ]],
    VEN_RemitFeeMode: ['0', Validators.required],
    VEN_Name: ['', [Validators.required, Validators.maxLength(100)]],
    VEN_EngName: ['', Validators.maxLength(100)],
    VEN_ShortName: ['', Validators.maxLength(100)],

    // 公司資料
    VEN_Post: ['', Validators.maxLength(6)],
    VEN_Address: ['', [Validators.required, Validators.maxLength(100)]],
    VEN_GUIAddr: ['', Validators.maxLength(100)],
    VEN_Tel: ['', Validators.maxLength(15)],
    VEN_Fax: ['', Validators.maxLength(15)],
    VEN_Email: ['', Validators.maxLength(200)],
    VEN_GUIEmail: ['', Validators.maxLength(200)],

    // 付款資料
    VEN_PayType: ['', Validators.required],
    VEN_BankNo: ['', [Validators.maxLength(10)]],
    VEN_BankAccountNo: ['', Validators.maxLength(40)],
    VEN_AccountName: ['', Validators.maxLength(64)],
    VEN_PayConditionDay: [null, [Validators.required, Validators.min(0)]],

    // 其他資料
    VEN_Status: ['0', Validators.required],
    VEN_Remark: ['', Validators.maxLength(160)]
  });

  contacts: any[] = [];
  selectedRows: any[] = [];
  private originalContacts: any[] = [];
  private originalForm: any = null;
  isReadonly = false;

  columns: Column[] = [
    { field: 'VEN_Boss', header: '聯絡人', type: 'input', validate: [safeValidator(validateMaxLength(12))] },
    { field: 'VEN_BossTitle', header: '職稱', type: 'input', validate: [safeValidator(validateMaxLength(16))] },
    { field: 'VEN_BossID', header: '身份證字號', type: 'input', validate: [safeValidator(validateMaxLength(10)), safeValidator(validateNoChinese())] },
    { field: 'VEN_BossTel', header: '電話', type: 'input', validate: [safeValidator(validateMaxLength(15)), safeValidator(validateNoChinese())] },
    { field: 'VEN_BossAddr', header: '地址', type: 'input', validate: [safeValidator(validateMaxLength(100))] },
    { field: 'VEN_BossEmail', header: '電子郵件', type: 'input', validate: [safeValidator(validateMaxLength(60)), safeValidator(validateNoChinese())] },
  ];


  venderOptions: { label: string; value: string }[] = [];

  flagOptions = [
    { value: '1', label: '統一編號' },
    { value: '2', label: '身份證' },
    { value: '3', label: '護照證號' }
  ];

  remitFeeOptions = [
    { value: '0', label: '廠商負擔' },
    { value: '1', label: '公司負擔' }
  ];

  payTypeOptions = [
    { value: '1', label: '1-電匯' },
    { value: '2', label: '2-發票' },
    { value: '3', label: '3-現金' }
  ];

  statusOptions = [
    { label: '未審核', value: '0' },
    { label: '已審核', value: '1' }
  ];


  bankBranchOptions: { label: string; value: string; BNK_No: string; BNK_BranchNo: string }[] = [];

  constructor(
    override readonly formBuilder: FormBuilder,
    private sysb200Service: Sysb200Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB200', this.dataForm);

    // 載入銀行分行下拉選單
    this.sysb200Service.queryBankBranchDropdown().subscribe(res => {
      this.bankBranchOptions = (res.Data || []).map(item => ({
        label: `${item.BNK_No || ''}${item.BNK_BranchNo || ''} - ${item.BNK_Name || ''}${item.BNK_BranchName ? `(${item.BNK_BranchName})` : ''}`,
        value: (item.BNK_No || '') + (item.BNK_BranchNo || ''),
        BNK_No: item.BNK_No || '',
        BNK_BranchNo: item.BNK_BranchNo || ''
      }));

      // 編輯模式：等選單載入後再設定選中值（BNK_No+BNK_BranchNo 組合）
      const rowdata = this.rowdata as unknown as Record<string, unknown>;
      if (rowdata?.['VEN_BNK_No']) {
        this.dataForm.get('VEN_BankNo')?.setValue(
          String(rowdata['VEN_BNK_No'] || '') + String(rowdata['VEN_BNK_BranchNo'] || '')
        );
      }
    });

    // 儲存表單原始值快照（供取消還原用）
    this.originalForm = this.dataForm.getRawValue();

    this.dataForm.get('VEN_Flag')?.valueChanges.subscribe(value => {
      if (value === '1') {
        this.dataForm.get('VEN_Uniform')?.setValidators([
          Validators.required,
          Validators.maxLength(10),
          Validators.pattern(/^\d{8}$/) // 8 碼數字
        ]);
      } else if (value === '2') {
        this.dataForm.get('VEN_Uniform')?.setValidators([
          Validators.required,
          Validators.maxLength(10),
          Validators.pattern(/^[A-Z]{1}[0-9]{9}$/i) // 1 英文 + 9 碼數字
        ]);
      } else {
        this.dataForm.get('VEN_Uniform')?.clearValidators();
      }
      this.dataForm.get('VEN_Uniform')?.updateValueAndValidity();
    });

    const id = this.rowdata?.id
    if (id) {
      this.sysb200Service.querySYSB200Detail({ pos2013_id: id }).subscribe({
        next: (res) => {
          if (res.Data) {
            this.contacts = res.Data;
            this.originalContacts = JSON.parse(JSON.stringify(res.Data || []));
          }
          this.messageService.successBubble('資料載入完成');
        },

      });

    }

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
    this.dataForm.controls.VEN_No.disable();

  }

  resetTable() {
    this.contacts = [];
    this.selectedRows = [];
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      console.log("表單 valid 狀態：", form.valid);
      if (!form.valid) {
        this.messageService.warnBubble("請確認所有必填欄位皆已正確填寫");
        return;
      }

      this.loading = true;
    });


    // 處理 VEN_Uniform
    const flag = form.get('VEN_Flag')?.value;
    const uniform = form.get('VEN_Uniform')?.value;
    const uniformTrimmed = uniform?.trim();

    if (flag === '1') {
      const regex = /^[0-9]{8}$/;
      if (!regex.test(uniformTrimmed)) {
        this.messageService.warnBubble("統一編號格式錯誤（需為 8 碼數字）");
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

    // 驗證聯絡人身份證
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

    // 處理 VEN_No（如果是多選下拉，取第一個）
    const VEN_No = Array.isArray(form.get('VEN_No')?.value)
      ? form.get('VEN_No')?.value[0]
      : form.get('VEN_No')?.value;

    // 查找選中的銀行分行，取得 BNK_No 和 BNK_BranchNo
    const selectedBankValue = form.get('VEN_BankNo')?.value;
    const selectedBank = this.bankBranchOptions.find(b => b.value === selectedBankValue);

    // 組資料
    const data = {
      id: this.rowdata?.id ?? 0,
      ...form.getRawValue(),
      VEN_No: VEN_No,
      VEN_Uniform: uniformTrimmed === '' ? null : uniformTrimmed,
      VEN_PayConditionDay: Number(form.get('VEN_PayConditionDay')?.value),
      VEN_BNK_No: selectedBank?.BNK_No ?? null,
      VEN_BNK_BranchNo: selectedBank?.BNK_BranchNo ?? null,
      pOS20131Details: this.contacts.map(item => ({
        VEN_Boss: item.VEN_Boss,
        VEN_BossID: item.VEN_BossID?.trim() === '' ? null : item.VEN_BossID?.trim(),
        VEN_BossTitle: item.VEN_BossTitle,
        VEN_BossTel: item.VEN_BossTel,
        VEN_BossAddr: item.VEN_BossAddr,
        VEN_BossEmail: item.VEN_BossEmail,
        id: typeof item.id === 'number' ? item.id : 0
      }))

    };

    // 呼叫 API
    const apiCall$ = this.isFormCreateable
      ? this.sysb200Service.insertSYSB200(data)
      : this.sysb200Service.updateSYSB200(data);


    apiCall$
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.messageService.successBubble(this.crudstatus === 'Create' ? '新增成功' : '修改成功');

          // 設定回列表時自動刷新
          localStorage.setItem('refreshList', 'true');

          this.onCancel(); // 返回列表
        },

      });
  }
  onDataChange(event: any) {
    console.log('dataChange 觸發', event);
    this.contacts = event;
  }


}
