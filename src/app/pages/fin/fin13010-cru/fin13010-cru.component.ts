import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { FIN13010Service } from '../../../service/api/fin/fin13010.service';

@Component({
  selector: 'app-fin13010-cru',
  templateUrl: './fin13010-cru.component.html',
  styleUrls: ['./fin13010-cru.component.scss']
})
export class FIN13010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
voucherTypeOptions = [
  { label: '23 - 三聯式/電子計算機/三聯收銀', value: 23 },
  { label: '24 - 二聯收銀/載有稅額之憑證', value: 24 },
];

taxTypeOptions = [
  { label: '免稅', value: '0' },
  { label: '應稅', value: '1' },
  { label: '零稅', value: '2' },
];

creditTypeOptions = [
  { label: '折讓', value: '1' },
  { label: '退出', value: '2' },
];


  dataForm = this.formBuilder.nonNullable.group({
    PUR_GUINo: [''],
    PUR_GUIDate: ['', Validators.required],
    PUR_VoucherType: [''],
    PUR_RepYYYYMM: [''],
    PUR_TaxType: [''],
    PUR_Net: [],
    PUR_Tax: [],
    PUR_Amt: [],
    Remain_Amt: [],
    Inv_Date: [''],
    Inv_Net: [],
    Inv_Tax: [],
    History_RetAmt: [],
    Credit_Type: [''],
    TXN_Ret_No: [''],
    Source_Doc_No: [''],
    Voucher_No: ['']
  });

  constructor(private apiService: FIN13010Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13010', this.dataForm);
    this.updateDisabledState();
  }

  // ✅ 僅允許特定欄位可編輯
  private updateDisabledState(): void {
    if (this.crudstatus === CRUDStatus.Edit) {
      const editableFields = [
        'PUR_GUIDate',
        'PUR_RepYYYYMM',
        'PUR_Tax',
        'Source_Doc_No',
        'Credit_Type',
        'PUR_Net',
        'PUR_Amt',
        'Voucher_No'
      ];
      Object.keys(this.dataForm.controls).forEach(key => {
        const control = this.dataForm.get(key);
        if (editableFields.includes(key)) {
          control?.enable();
        } else {
          control?.disable();
        }
      });
    } else if (this.crudstatus === CRUDStatus.Read) {
      this.dataForm.disable();
    } else {
      this.dataForm.enable(); // Create 模式
    }
  }

  clearFormExcept(): void {
    const keepValues = ['PUR_GUINo'];
    const patch: any = { };
    keepValues.forEach(key => {
      patch[key] = this.dataForm.get(key)?.value;
    });

    this.dataForm.reset();
    this.dataForm.patchValue(patch);
    this.updateDisabledState();
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const formValue = form.getRawValue();

      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            this.apiService.insertFIN13010(formValue).subscribe(() => {
              this.messageService.successBubble('新增成功');
              this.dataForm.reset();
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            this.apiService.updateFIN13010(formValue).subscribe(() => {
              this.messageService.successBubble('更新成功');
              this.onCancel();
            });
          }
          break;
      }
    });
  }
}
