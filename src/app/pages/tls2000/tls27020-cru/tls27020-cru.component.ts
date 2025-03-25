import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';

@Component({
  selector: 'app-tls27020-cru',
  templateUrl: './tls27020-cru.component.html',
  styleUrls: ['./tls27020-cru.component.scss']
})
export class TLS27020CRUComponent extends BasicCrupageComponent implements OnInit {

  // 收銀機型態選項
  CashRegisterTypeItems: any[] = [
    { label: '業主', value: '1' },
    { label: '非業主', value: '2' },
  ];

  // 表單
  dataForm = this.formBuilder.group({
    saleDate: ['', Validators.required], // 銷售日期
    cashRegisterNumber: ['', Validators.required], // 收銀機號
    barcode: ['', Validators.required], // 條碼
    magneticCardNumber: ['', Validators.required], // 磁卡編號
    counterNumber: ['', Validators.required], // 專櫃編號
    counterName: ['', Validators.required], // 專櫃名稱
    amount: ['', Validators.required], // 金額
    items: this.formBuilder.array([
      this.createItem()
    ]),
  });

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '220040';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    // ----------------------------------------------------------------
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };

    switch (state.crudstatus) {
      // 創建
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.accordionTabCss= 'create-accordionTab';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.accordionTabCss= 'edit-accordionTab';
        this.crudstatus = CRUDStatus.Edit;
        this.showConfirm = this.canEdit();
        this.Edit(state.rowdata);
        break;
      // 讀檔
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        this.Read(state.rowdata);
        break;
    }

    console.log(this.accordionTabCss);
  }

  // 下拉選單項目
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  // 表單項目
  createItem(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(14)]], // 名稱
      CashRegisterType: ['1', Validators.required], // 收銀機型態
      SalesDate: ['', Validators.required], // 銷售日期
      CashRegisterCode: ['', Validators.required], // 收銀機代號
      TransactionSerialNumber: ['', Validators.required], // 交易流水號
      CounterNumber: ['', Validators.required], // 專櫃編號
      TwoPartInvoiceNumberStart: ['', Validators.required], // 二聯發票號碼(起號)
      TwoPartInvoiceNumberEnd: ['', Validators.required], // 二聯發票號碼(迄號)
      TaxableAmount: ['', Validators.required], // 應稅金額
      TaxFreeAmount: ['', Validators.required], // 免稅金額
    });
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onRemoveItem(index: number): void {
    this.items.removeAt(index);
  }

  Edit(rowdata: any): void {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any): void {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  // 提交表單
  onSubmit(frm: FormGroup): void {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.errorBubble(this.translate.instant('form_error_message'));
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          this.messageService.successBubble(this.translate.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          this.messageService.successBubble(this.translate.instant('updated-successfully'));
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  onCancel(): void {
    this.router.navigate(['TLS2000/TLS27020']);
  }


}
