import { OrganizationNumberService } from './../../../service/basic/organization-number.service';
import { NeedPayTicketService } from './../../../service/basic/need-pay-ticket.service';
import { Component, OnInit, ViewEncapsulation, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { NgFor, NgIf } from '@angular/common';
import { ButtonDynamicallydeleteComponent } from '../../../shared/componentkit/button-dynamicallydelete/button-dynamicallydelete.component';
import { ButtonDynamicallyaddComponent } from '../../../shared/componentkit/button-dynamicallyadd/button-dynamicallyadd.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

//3.1.4.3  傳票審核傳送作業 CRU
@Component({
    selector: 'app-ass14030-cru',
    templateUrl: './ass14030-cru.component.html',
    styleUrl: './ass14030-cru.component.scss',
    standalone: true,
    imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, InputTextComponent, CalendarComponent, NgFor, ButtonDynamicallydeleteComponent, ButtonDynamicallyaddComponent, ButtonComponent, NgIf, TranslateModule]
})
export class ASS14030CRUComponent extends BasicCrupageComponent implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // ----------------------------------------------------------------
    subpoenaNumber: [], // 傳票編號
    subpoenaType: [], // 傳票種類
    type: [''], // 傳票型態
    subpoenaSummary: ['', [Validators.maxLength(50)]], // 傳票摘要
    subpoenaDate: [], // 傳票日期
    subpoenaStatus: [[] as number[]], // 傳票狀態
    checkoutNumber: [, [Validators.maxLength(12), this.validationService.numberValidator]], // 結帳單號
    builder: ['', [Validators.maxLength(10)]], // 建立者
    buildDate: [], // 建立日
    modifier: ['', [Validators.maxLength(10)]], // 修改者
    modifyDate: [], // 修改日

    items: this.formBuilder.array([
      this.createItem()
    ]),
  });
  // ----------------------------------------------------------------
  subpoenaTypeOptions: any[] = [
    { value: 1, label: '資材報廢' },
    { value: 2, label: '折舊' },
    { value: 3, label: '月結庫存' },
    { value: 4, label: '資材變賣' },
    { value: 5, label: '資材進貨' },
  ];

  subpoenaStatusOptions: any[] = [
    { value: 0, label: '未拋轉' },
    { value: 1, label: '已拋轉' },
    { value: 2, label: '已退回' },
  ];
  objectCodeOptions: any[] = [
    { value: 0, label: '698919301/台南紡織股份有限公司' },
    { value: 1, label: '698919302/統一企業股份有限公司' },
    { value: 2, label: '698919303/統正開發股份有限公司' },
  ];

  subjectCodeOptions: any[] = [];
  organizationOptions: any[] = [];
  //
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
    this.ProgNo = '310030';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.needPayTicketService.getNeedPayTickets().subscribe(data => {
      this.subjectCodeOptions = data;
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
      subjectCode: [, [Validators.required]], // 科目代號
      vendorCode: [''], // 廠商代號
      summary: [''], // 摘要
      debitAmount: [, [Validators.required, Validators.maxLength(15)]], // 借方金額
      creditAmount: [, [Validators.required, Validators.maxLength(15)]], // 貸方金額
      organizationCode: [, [Validators.required, Validators.maxLength(6)]], // 組織代號
      eventCode: [], // 活動代號
      flushCode: [, [Validators.maxLength(20)]], // 立沖代號
      objectCode: [, [Validators.maxLength(30)]], // 對像別編號
      objectKey: [, [Validators.maxLength(30)]], // 對帳KEY值
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
    this.router.navigate(['/ASS1000/ASS14030']);
  }
}
