import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DatePipe, NgIf } from '@angular/common'; // Add this import as requested
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TranslateModule } from '@ngx-translate/core';
import { POS6118Data, POS6119Data, POS6119PData, TLS27040Service } from '@service/api/tls/tls27040.service';
import { CheckOptions, CrdTxnFgOptions, CTBC_TxnCodeOptions, CTBC_TxnTypeOptions, PayCrdTypeOptions, POS611XOptions, TxnTypeOptions } from '../tls27040/tls27040.model';
import { SystemOptionsService } from '@service/system/sys1000.service';
import { finalize, Observable } from 'rxjs';
import { ApiResponse } from '@service/system/auth.service';
@Component({
  selector: 'app-tls27040-cru',
  templateUrl: './tls27040-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, InputNumberComponent, CalendarComponent, ButtonComponent, NgIf, TranslateModule]
})
export class TLS27040CRUComponent extends BasicCruPageComponent<POS6118Data | POS6119Data | POS6119PData> implements OnInit {
  POS611XOptions = POS611XOptions;
  POS6118dataForm = this.formBuilder.nonNullable.group({
    tableName: ['', [Validators.required, Validators.maxLength(64)]],
    ECR_No: ['', [Validators.required, Validators.maxLength(10)]], // 收銀機號
    TXN_No: [0, [Validators.required, Validators.max(99999999)]], // 交易流水號
    NCML_TxnDate: ['', [Validators.required]], // 銷售日期
    NCML_Date: [new Date(), [Validators.required]], // 請款日期
    TLT_No: ['', [Validators.required, Validators.maxLength(12)]], // 專櫃編號
    NCML_PayCrdType: [null, [Validators.required, Validators.maxLength(2)]], // 付款卡類別
    NCML_TxnType: [null, [Validators.required, Validators.maxLength(2)]], // 交易類別
    NCML_TxnAmt: [0, [Validators.required, Validators.max(999999999999)]], // 交易金額
    NCML_CrdNo: ['', [Validators.maxLength(32)]],  // 卡號
    NCML_TmID: ['', [Validators.maxLength(8)]], // 收銀機代號
    NCML_BatCloseDate: ['', [Validators.required]], // 批次結帳日期
    NCML_ApprovalCode: ['', [Validators.maxLength(6)]], // 批次結帳日期
    NCML_Check: ['', [Validators.required, Validators.maxLength(2)]], // 批次結帳日期
    NCML_CrdTxnFg: ['', [Validators.maxLength(1)]], // 卡交易類別
    NCML_TermNo: [null, [Validators.required, Validators.max(99)]], // 期數
    NCML_TxnTime: [null, [Validators.required]], // 銷售日期
  });
  POS6119dataForm = this.formBuilder.nonNullable.group({
    tableName: ['', [Validators.required, Validators.maxLength(64)]],
    ECR_No: ['', [Validators.required, Validators.maxLength(10)]], // 收銀機號
    TXN_No: [0, [Validators.required, Validators.max(99999999)]], // 交易流水號
    CTBC_TxnTime: ['', [Validators.required]], // 銷售日期
    TLT_No: ['', [Validators.required, Validators.maxLength(12)]], // 專櫃編號
    CTBC_Date: [new Date(), [Validators.required]],// 請款日期
    CTBC_DataType: [null, [Validators.maxLength(1)]], // 銷售日期
    CTBC_CrdNo: ['', [Validators.maxLength(19)]], // 卡號
    CTBC_TmID: ['', [Validators.required, Validators.maxLength(8)]], // 收銀機代號
    CTBC_TxnCode: ['', [Validators.required, Validators.maxLength(2)]],// 交易代碼
    CTBC_TxnAmt: [null, [Validators.required, Validators.max(999999999999)]],// 交易金額
    CTBC_PayDate: [null, [Validators.required]],// 銷售日期
    CTBC_ApprovalCode: ['', [Validators.maxLength(6)]],// 批次結帳日期
    CTBC_Check: ['', [Validators.required, Validators.maxLength(2)]],// 批次結帳日期
    CTBC_TermNo: ['', [Validators.maxLength(2)]],// 期數
  });
  POS6119PdataForm = this.formBuilder.nonNullable.group({
    tableName: ['', [Validators.required, Validators.maxLength(64)]],
    ECR_No: ['', [Validators.required, Validators.maxLength(10)]],// 收銀機號
    TXN_No: [0, [Validators.required, Validators.max(99999999)]],// 交易流水號
    CTBC_TxnDate: ['', [Validators.required]],// 銷售日期
    TLT_No: ['', [Validators.required, Validators.maxLength(12)]], // 專櫃編號
    CTBC_Date: [new Date(), [Validators.required]], // 請款日期
    CTBC_CrdNo: ['', [Validators.maxLength(19)]], // 卡號
    CTBC_TxnAmt: [0, [Validators.required, Validators.max(999999999999)]], // 交易金額
    CTBC_TxnType: ['', [Validators.maxLength(2)]],  // 交易類別
    CTBC_PayDate: [null, [Validators.required]], // 銷售日期
    CTBC_TmID: ['', [Validators.maxLength(8)]], // 收銀機代號
    CTBC_ApprovalCode: ['', [Validators.maxLength(6)]], // 批次結帳日期
    CTBC_Check: ['', [Validators.required, Validators.maxLength(2)]], // 批次結帳日期
  });
  PayCrdTypeOptions = PayCrdTypeOptions;
  TxnTypeOptions = TxnTypeOptions;
  CrdTxnFgOptions = CrdTxnFgOptions;
  CheckOptions = CheckOptions;
  CTBC_TxnCodeOptions = CTBC_TxnCodeOptions;
  CTBC_TxnTypeOptions = CTBC_TxnTypeOptions;
  TermNoOptions = SystemOptionsService.getOptions('T109')
  constructor(
    private readonly tls27040Service: TLS27040Service,
    private readonly datePipe: DatePipe
  ) { super(); }
  ngOnInit(): void {
    const state = this.router.lastSuccessfulNavigation?.extras.state;
    this.rowdata = state?.['rowdata']
    switch (this.rowdata?.tableName) {
      case 'POS6118':
        {
          this.initializePage('TLS27040', this.POS6118dataForm);
          const form = this.POS6118dataForm;
          form.get('tableName')?.disable();
          form.get('ECR_No')?.disable();
          form.get('TXN_No')?.disable();
          if (this.isFormCreateable) {
            form.get('NCML_TxnDate')?.setValue(this.rowdata?.TXN_Date);
            form.get('NCML_TxnDate')?.disable();
          }
          break;
        }
      case 'POS6119':
        {
          this.initializePage('TLS27040', this.POS6119dataForm);
          const form = this.POS6119dataForm;
          form.get('tableName')?.disable();
          form.get('ECR_No')?.disable();
          form.get('TXN_No')?.disable();
          if (this.isFormCreateable) {
            form.get('CTBC_TxnTime')?.setValue(this.rowdata?.TXN_Date);
            form.get('CTBC_TxnTime')?.disable();
          }
          break;
        }
      case 'POS6119P':
        {
          this.initializePage('TLS27040', this.POS6119PdataForm);
          const form = this.POS6119PdataForm;
          form.get('tableName')?.disable();
          form.get('ECR_No')?.disable();
          form.get('TXN_No')?.disable();
          if (this.isFormCreateable) {
            form.get('CTBC_TxnDate')?.setValue(this.rowdata?.TXN_Date);
            form.get('CTBC_TxnDate')?.disable();
          }
          break;
        }
    }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();
      let apiCall: Observable<ApiResponse<number>> | undefined = undefined;
      switch (this.rowdata?.tableName) {
        case 'POS6118':
          {
            const body = {
              ...formValue,
              NCML_Date: this.datePipe.transform(formValue.NCML_Date, 'yyyy-MM-dd'),
              NCML_BatCloseDate: this.datePipe.transform(formValue.NCML_BatCloseDate, 'yyyy-MM-dd'),
              NCML_TxnDate: this.datePipe.transform(formValue.NCML_TxnDate, 'yyyy-MM-dd'),
              NCML_TermNo: Number(formValue.NCML_TermNo),
            };
            if (this.isFormCreateable) {
              apiCall = this.tls27040Service.insertPOS6118(body);
            } else {
              apiCall = this.tls27040Service.updatePOS6118({ ID: this.rowdata?.ID as number, ...body });
            }
            break;
          }
        case 'POS6119':
          {
            const body = {
              ...formValue,
              CTBC_Date: this.datePipe.transform(formValue.CTBC_Date, 'yyyy-MM-dd'),
              CTBC_PayDate: this.datePipe.transform(formValue.CTBC_PayDate, 'yyyy-MM-dd'),
              CTBC_TermNo: Number(formValue.CTBC_TermNo),
            };
            if (this.isFormCreateable) {
              apiCall = this.tls27040Service.insertPOS6119(body);
            } else {
              apiCall = this.tls27040Service.updatePOS6119({ ID: this.rowdata?.ID as number, ...body });
            }
            break;
          }
        case 'POS6119P':
          {
            const body = {
              ...formValue,
              CTBC_Date: this.datePipe.transform(formValue.CTBC_Date, 'yyyy-MM-dd'),
              CTBC_TxnDate: this.datePipe.transform(formValue.CTBC_TxnDate, 'yyyy-MM-dd'),
              CTBC_PayDate: this.datePipe.transform(formValue.CTBC_PayDate, 'yyyy-MM-dd')
            };
            if (this.isFormCreateable) {
              apiCall = this.tls27040Service.insertPOS6119P(body);
            } else {
              apiCall = this.tls27040Service.updatePOS6119P({ ID: this.rowdata?.ID as number, ...body });
            }
            break;
          }
      }
      // 統一處理 API 呼叫，避免重複程式碼
      if (apiCall) {
        apiCall.pipe(finalize(() => this.loading = false)).subscribe(res => {
          this.messageService.successBubble(res.Message);
          this.onCancel();
        });
      }
    });
  }
}
