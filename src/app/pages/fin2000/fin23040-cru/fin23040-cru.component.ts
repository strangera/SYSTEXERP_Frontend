import { Component, OnInit, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { NeedPayTicketService } from '../../../service/basic/need-pay-ticket.service';
import { VendorService } from '../../../service/basic/vendor.service';
import { TaxTypeService } from '../../../service/basic/tax-type.service';
import { CounterCodeService } from '../../../service/basic/counter-code.service';

//1.2.3.4 暫付款核銷作業 CRU
@Component({
  selector: 'app-fin23040-cru',
  templateUrl: './fin23040-cru.component.html',
  styleUrl: './fin23040-cru.component.scss'
})
export class FIN23040CRUComponent extends BasicCrupageComponent implements OnInit{
  //
  accountingCodeOptions: any[] = [];
  detailedCategoryOptions: any[] = [
    { value: 0, label: '發票' },
    { value: 1, label: '收據' },
    { value: 2, label: '不抵扣憑證' },
  ];
  invoiceFormatOptions:any[]=[
    { value: 1, label: '21/進項三聯式、電子計算機統一發票' },
    { value: 2, label: '22/進項二聯式收銀機統一發票、載有稅額之其他憑證' },
    { value: 3, label: '25/進向三連式收銀機統一發票及一般稅額計算之電子發票' },
    { value: 4, label: '26/彙總登陸每張稅額五百元以下之盡項三聯式、電子計算機之統一發票' },
    { value: 5, label: '27/彙總登陸每張稅額五百元以下之盡項二聯式收銀雞統一發票、載有稅額之其他憑證' },
    { value: 6, label: '28/進項海關代徵營業稅繳納證' },
  ];
  vendorUIDOptions: any[] = [];
  usageOptions:any[]=[
    { value: 1, label: '營業用' },
    { value: 2, label: '共同使用' },
  ];
  taxTypeOptions:any[]=[];
  eventCodeOptions: any[] = [];
  deductionCodeOptions:any[]=[
    { value: 1, label: '代表近項可扣抵之進貨及費用' },
    { value: 2, label: '代表近項可扣抵之固定資產' },
    { value: 3, label: '代表近項不可扣抵之進貨及費用' },
    { value: 4, label: '代表近項不可扣抵之固定資產' },
  ];
  categoryOptions:any[]=[
    { value: 1, label: '進貨及費用' },
    { value: 2, label: '固定資產' },
  ];

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    writeOffSheetNumber: [, [Validators.required, Validators.maxLength(13)]], // 核銷單號
    advanceSheetNumber: [, [Validators.required, Validators.maxLength(13)]], // 預支單號
    advanceAmount: [, [Validators.maxLength(10)]], // 預支金額
    // ----------------------------------------------------------------
    items: this.formBuilder.array([
      this.createItem()
    ]),
  });
  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private validationService: ValidationService,
    //
    private needPayTicketService: NeedPayTicketService,
    private vendorService: VendorService,
    private taxTypeService: TaxTypeService,
    private counterCodeService: CounterCodeService,
    ) {
      super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '120010';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.needPayTicketService.getNeedPayTickets().subscribe(data => {
      this.accountingCodeOptions = data;
    });
    //
    this.vendorService.getVendors().subscribe(data => {
      this.vendorUIDOptions = data;
    });
    //
    this.taxTypeService.getTaxTypes().subscribe(data => {
      this.taxTypeOptions = data;
    });
    //
    this.counterCodeService.getCounterCodes().subscribe(data => {
      this.eventCodeOptions = data;
    });
    // ----------------------------------------------------------------
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };

    switch (state.crudstatus) {
      // 創建
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
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
  }

  // ----------------------------------------------------------------
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }
  // ----------------------------------------------------------------
  createItem(): FormGroup {
    return this.formBuilder.group({
      accountingCode: [,[Validators.required]], // 會計科目代號
      summary: ['', [Validators.required, Validators.maxLength(30)]], // 項目摘要
      detailedCategory: [,[Validators.required]], // 明細類別
      invoiceFormat: [], // 發票格式
      invoiceNumber: [, [this.validationService.numberValidator, Validators.maxLength(10)]], // 發票/收據號碼
      invoiceDate: [, [Validators.required]], // 發票日期
      declareYm: [, [Validators.required]], // 申報年月
      vendorUID: [], // 廠商統一編號
      usage: [], // 發票用途
      totalPrice: [, [Validators.maxLength(12)]], // 發票總金額
      taxType: [, [Validators.required]], // 課稅別
      nonTaxPrice: [, [this.validationService.numberValidator, Validators.maxLength(12), Validators.required]], // 發票未稅金額
      taxPrice: [, [this.validationService.numberValidator, Validators.maxLength(10)]], // 發票稅額
      eventCode: [], // 活動代碼
      deductionCode: [], // 扣扺代號
      category: [], // 類別區分
      totalNumber: [, [this.validationService.numberValidator, Validators.maxLength(5)]], // 彙總張數
    });
  }
  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }
  // ----------------------------------------------------------------
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onSubmit(frm: FormGroup){
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid){
      this.messageService.errorBubble(this.translate.instant('form_error_message'));
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          // this.storeService.addMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(this.translate.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // this.storeService.updateMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(this.translate.instant('updated-successfully'));
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }//CRU

  onCancel() {
    this.router.navigate(['/FIN2000/FIN23040']);
  }
  //--------------------------------------------------------------------------------------------------------------
}
