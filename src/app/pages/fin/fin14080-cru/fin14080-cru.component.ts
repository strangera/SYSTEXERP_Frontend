import { Component, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
//
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
//
import { ValidationService } from '../../../shared/service/validation.service';
import { TaxTypeService } from '../../../service/basic/tax-type.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';

//1.1.4.8 進項發票調整 CRU
@Component({
    selector: 'app-fin14080-cru',
    templateUrl: './fin14080-cru.component.html',
    styleUrl: './fin14080-cru.component.scss',
    standalone: true,
    imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, InputNumberComponent, CalendarComponent, ButtonComponent, NgIf, TranslateModule]
})
export class FIN14080CRUComponent extends BasicCrupageComponent implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    invoiceFormat: ['', [Validators.required, Validators.maxLength(2)]], // 發票格式
    wordTrack: ['', [Validators.maxLength(2)]], // 字軌
    invoiceNumber: [, [Validators.maxLength(8)]], // 發票號碼
    invoiceDate: [, [Validators.required]], // 發票日期
    declareYm: [, [Validators.required]], // 	申報年月
    vendorUid: [, [Validators.maxLength(10)]], // 廠商編號(統一編號)
    totalPrice: [, [this.validationService.numberValidator, Validators.required, Validators.maxLength(12)]], // 發票總金額
    nonTaxPrice: [, [this.validationService.numberValidator, Validators.required, Validators.maxLength(12)]], // 發票未稅金額
    taxPrice: [, [this.validationService.numberValidator, Validators.required, Validators.maxLength(10)]], // 發票稅額
    usage: [], // 發票用途
    taxType: [, [Validators.required]], // 課稅別
    deductionCode: [[] as number[]], // 扣扺代號
    category: [[] as number[]], // 類別區分
    certificateNumber: [, [Validators.maxLength(14)]], // 憑證單號
    summonsNumber: [, [Validators.maxLength(11)]], // 傳票號碼
    totalNumber: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 彙總張數
    plusRemark: ['', [Validators.maxLength(1)]], // 彙加註記
    remark: ['', [Validators.maxLength(100)]], // 備註
  });
  //
  // ----------------------------------------------------------------
  //
  usageOptions: any[] = [
    { value: 1, label: '營業用' },
    { value: 2, label: '共同使用' },
  ];
  taxTypeOptions: any[] = [];
  deductionCodeOptions: any[] = [
    { value: 1, label: '代表近項可扣抵之進貨及費用' },
    { value: 2, label: '代表近項可扣抵之固定資產' },
    { value: 3, label: '代表近項不可扣抵之進貨及費用' },
    { value: 4, label: '代表近項不可扣抵之固定資產' },
  ];
  categoryOptions: any[] = [
    { value: 1, label: '進貨及費用' },
    { value: 2, label: '固定資產' },
  ];
  formatOptions: any[] = [
    { value: 1, label: '21/進項三聯式、電子計算機統一發票' },
    { value: 2, label: '22/進項二聯式收銀機統一發票、載有稅額之其他憑證' },
    { value: 3, label: '25/進向三連式收銀機統一發票及一般稅額計算之電子發票' },
    { value: 4, label: '26/彙總登陸每張稅額五百元以下之盡項三聯式、電子計算機之統一發票' },
    { value: 5, label: '27/彙總登陸每張稅額五百元以下之盡項二聯式收銀雞統一發票、載有稅額之其他憑證' },
    { value: 6, label: '28/進項海關代徵營業稅繳納證' },
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
    this.ProgNo = '110023';
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

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
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
    this.router.navigate(['/FIN1000/FIN14080']);
  }
}
