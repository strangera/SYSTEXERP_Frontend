import { OrganizationNumberService } from './../../../service/basic/organization-number.service';
import { Component, OnInit, ViewEncapsulation, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
//
import { ValidationService } from '../../../shared/service/validation.service';
import { NeedPayTicketService } from '../../../service/basic/need-pay-ticket.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { NgFor, NgIf } from '@angular/common';


import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

//3.1.1.9 資材中分類會計科目維護作業 CRU
@Component({
  selector: 'app-ass11090-cru',
  templateUrl: './ass11090-cru.component.html',
  styleUrl: './ass11090-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, InputNumberComponent, EditorTextComponent, NgFor, ButtonComponent, NgIf, TranslateModule]
})
export class ASS11090CRUComponent extends BasicCrupageComponent implements OnInit {
  //
  bigCategoryCodeOptions: any[] = [
    { value: 1, label: 'A/裝潢工程' },
    { value: 2, label: 'B/其他工程' },
    { value: 3, label: 'C/電腦及電子零件產品' },
    { value: 4, label: 'D/電力及照明系統' },
    { value: 5, label: 'E/家電家具設備' },
    { value: 6, label: 'F/機消空電水零配件' },
    { value: 7, label: 'G/辦公及營運庶務' },
    { value: 8, label: 'K/印刷品(非廣告行銷)' },
  ];
  //
  midCategoryCodeOptions: any[] = [
    { value: 23, label: '室內裝潢工程' },
    { value: 24, label: '室內裝潢備品' },
    { value: 21, label: '弱電系統' },
    { value: 22, label: '房屋和建築設備' },
    { value: 23, label: '停車場設備' },
    { value: 24, label: '其他工程' },
    { value: 25, label: '機電消防工程' },
    { value: 22, label: '電子產品及零件' },
  ];

  accounting_Borrow_Options: any[] = [
    { value: 1, label: '150101/土地' },
    { value: 2, label: '151101/房屋' },
    { value: 3, label: '151201/累積折舊_房屋' },
    { value: 4, label: '152101/裝潢設備' },
    { value: 5, label: '152201/累積折舊_裝潢設備' },
    { value: 6, label: '153101/運輸設備' },
  ];

  accounting_Credit_Options: any[] = [
    { value: 1, label: '213101/應負帳款_專櫃' },
    { value: 2, label: '213102/應負帳款_自營' },
    { value: 3, label: '213103/應負帳款_固資及費用' },
    { value: 4, label: '213104/應負帳款_EC專櫃' },
    { value: 5, label: '213105/應負帳款_品牌' },
  ];

  tax_Borrow_Options: any[] = [
    { value: 1, label: '123201/進項稅額_專櫃' },
    { value: 2, label: '213102/進項稅額_自營' },
    { value: 3, label: '213103/進項稅額_固資及費用' },
    { value: 4, label: '213104/進項稅額_EC' },
    { value: 5, label: '213105/進項稅額_品牌' },
  ];

  costOptions: any[] = [];
  organizationOptions: any[] = [];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    bigCategoryCode: [, [Validators.required]], // 大分類代碼
    bigCategoryName: ['', [Validators.required, Validators.maxLength(32)]], // 大分類名稱
    midCategoryCode: [, [Validators.required]], // 中分類代碼
    midCategoryName: ['', [Validators.required, Validators.maxLength(32)]], // 中分類名稱
    // 採買入帳科目
    accounting_Borrow: [, [Validators.required]], // 所屬會計科目(借)
    accountName_accBorrow: ['', [Validators.maxLength(40)]], // 會計科目名稱_所屬會計科目(借)
    //
    accounting_Credit: [, [Validators.required]], // 所屬會計科目(貸)
    accountName_accCredit: ['', [Validators.maxLength(40)]], // 會計科目名稱_所屬會計科目(貸)
    tax_Borrow: [], // 進項稅額科目(借)
    accountName_taxBorrow: ['', [Validators.maxLength(40)]], // 會計科目名稱_進項稅額科目(借)
    //
    cost: [], // 費用科目
    accountName_cost: ['', [Validators.maxLength(40)]], // 會計科目名稱_費用科目
    depreciation: [, [Validators.maxLength(8)]], // 折舊科目(借)
    accountName_depreciation: ['', [Validators.maxLength(40)]], //  會計科目名稱_折舊科目(借)
    totalDepreciation: [, [Validators.maxLength(8)]], // 累計折舊科目(貸)
    accountName_totalDepreciation: ['', [Validators.maxLength(40)]], // 會計科目名稱_累計折舊科目(貸)
    //
    depreciationLife: [, [Validators.maxLength(2)]], // 折舊年限
    //
    remark: [,], // 說明
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
    private organizationNumberService: OrganizationNumberService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310009';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.needPayTicketService.getNeedPayTickets().subscribe(data => {
      this.costOptions = data;
    });
    //
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => {
      this.organizationOptions = data;
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
        this.accordionTabCss = 'create-accordionTab';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.accordionTabCss = 'edit-accordionTab';
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
      accountingName: [, [Validators.required]], // 會計科目(借)
      subjectName: [, [Validators.required]], // 科目名稱
      organizationCode: ['', [Validators.required, Validators.maxLength(6)]], //組織代號
      organizationName: [, [Validators.required]], // 科目名稱
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

  onSubmit(frm: FormGroup) {
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
    this.router.navigate(['/ASS1000/ASS11090']);
  }
}
