import { Component, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
//
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
//
import { ValidationService } from '../../../shared/service/validation.service';
import { TaxTypeService } from '../../../service/basic/tax-type.service';

//1.1.4.9 銷項發票調整 CRU
@Component({
  selector: 'app-fin14090-cru',
  templateUrl: './fin14090-cru.component.html',
  styleUrl: './fin14090-cru.component.scss'
})
export class FIN14090CRUComponent extends BasicCrupageComponent implements OnInit{
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    wordTrack: ['', [Validators.maxLength(2)]], // 字軌
    invoiceNumber: [, [Validators.maxLength(8)]], // 發票號碼
    invoiceDate: [,[Validators.required]], // 	發票日期
    declareYm: [,[Validators.required]], // 	申報年月
    counterID: [, [Validators.maxLength(6)]], // 專櫃編號
    factoryID: [, [Validators.maxLength(10)]], // 廠客代號
    salesPersonUid: [, [Validators.required, Validators.maxLength(8)]], // 銷售人統一編號
    buyerPersonUid: [, [Validators.required, Validators.maxLength(8)]], // 買受人統一編號
    invoiveFormat: ['', [Validators.required, Validators.maxLength(2)]], // 發票格式
    totalPrice: [, [this.validationService.numberValidator, Validators.required, Validators.maxLength(8)]], // 發票總金額
    taxType: [,[Validators.required]], // 課稅別
    nonTaxPrice: [, [this.validationService.numberValidator, Validators.required, Validators.maxLength(8)]], // 發票未稅金額
    taxPrice: [, [this.validationService.numberValidator, Validators.required, Validators.maxLength(8)]], // 稅額
    certificateNumber: [, [Validators.maxLength(10)]], // 憑證單號
    summonsNumber: [, [Validators.maxLength(11)]], // 傳票號碼
    assetsRemrk: [], // 資產註記
    remark: ['', [Validators.maxLength(100)]], // 備註
  });
  //
  // ----------------------------------------------------------------
  //
  taxTypeOptions:any[]=[];
  assetsRemrkOptions:any[]=[
    { value: 1, label: '固定資產' },
    { value: 2, label: '土地' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private validationService: ValidationService,
    //
    private taxTypeService: TaxTypeService,
    ) {
      super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '110024';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.taxTypeService.getTaxTypes().subscribe(data => {
      this.taxTypeOptions = data;

      // 全選填入
      // let allSystemValues = this.taxTypeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   taxType: allSystemValues
      // });
    });
    // ----------------------------------------------------------------
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
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onSubmit(frm: FormGroup){
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid){
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
    this.onSubmit(frm);
  }

  onCancel() {
    this.router.navigate(['/FIN1000/FIN14090']);
  }
}
