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
  PUR_TaxType: ['', Validators.required],
  PUR_Net: [undefined as any],
  PUR_Tax: [undefined as any],
  PUR_Amt: [undefined as any],
  Remain_Amt: [undefined as any],
  Inv_Date: [''],
  Inv_Net: [undefined as any],
  Inv_Tax: [undefined as any],
  History_RetAmt: [undefined as any],
  Credit_Type: [''],
  TXN_Ret_No: ['系統自動帶入', Validators.required], // ✅ 簡寫
  Source_Doc_No: [''],
  Voucher_No: ['']
});



  constructor(private apiService: FIN13010Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13010', this.dataForm);
    this.updateDisabledState();
     this.setupAutoAmountCalculation(); // ⬅️ 新增這行
     this.setupRemainAmountCalculation(); 
       this.dataForm.get('TXN_Ret_No')?.disable();
       this.dataForm.get('PUR_VoucherType')?.disable();
       this.dataForm.get('PUR_TaxType')?.disable();
       this.dataForm.get('Inv_Tax')?.disable();
        this.dataForm.get('History_RetAmt')?.disable();
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
  private setupAutoAmountCalculation(): void {
  const netControl = this.dataForm.get('PUR_Net');
  const taxControl = this.dataForm.get('PUR_Tax');
  const amtControl = this.dataForm.get('PUR_Amt');

  if (netControl && taxControl && amtControl) {
    netControl.valueChanges.subscribe(() => this.calculateTotalAmount());
    taxControl.valueChanges.subscribe(() => this.calculateTotalAmount());
  }
}

private calculateTotalAmount(): void {
  const net = this.dataForm.get('PUR_Net')?.value || 0;
  const tax = this.dataForm.get('PUR_Tax')?.value || 0;
  this.dataForm.get('PUR_Amt')?.setValue(net + tax, { emitEvent: false });
}
private setupRemainAmountCalculation(): void {
  const amtControl = this.dataForm.get('PUR_Amt');
  const historyControl = this.dataForm.get('History_RetAmt');
  const remainControl = this.dataForm.get('Remain_Amt');

  if (amtControl && historyControl && remainControl) {
    amtControl.valueChanges.subscribe(() => this.calculateRemainAmount());
    historyControl.valueChanges.subscribe(() => this.calculateRemainAmount());
  }
}

private calculateRemainAmount(): void {
  const amt = this.dataForm.get('PUR_Amt')?.value || 0;
  const history = this.dataForm.get('History_RetAmt')?.value || 0;
  this.dataForm.get('Remain_Amt')?.setValue(amt - history, { emitEvent: false });
}


}
