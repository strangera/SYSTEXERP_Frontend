import { Component, OnInit, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { ValidationService } from '../../../shared/service/validation.service';
//---------------------------------
import { AnnouncementUserService } from '../../../service/basic/announcement-user.service';
import { SalesTypeService } from './../../../service/basic/sales-type.service';
import { EventCodeService } from '../../../service/basic/event-code.service';
import { EventCategoryService } from '../../../service/basic/event-category.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';

// 2.2.13.6 專櫃活動設定暨審核作業CRU
@Component({
    selector: 'app-tls2d060-cru',
    templateUrl: './tls2d060-cru.component.html',
    styleUrl: './tls2d060-cru.component.scss',
    standalone: true,
    imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, DropdownComponent, CalendarRangeComponent, ButtonComponent, NgIf, TranslateModule]
})
export class TLS2D060CRUComponent extends BasicCrupageComponent implements OnInit {
  salesTypeOptions: any[] = [];
  deductionItemsOptions: any[] = [];
  eventOptions: any[] = [];
  eventCategoryOptions: any[] = [];
  departmentOptions: any[] = [];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    department: [, Validators.required], // 部門
    salesType: [, Validators.required], // 銷售類型
    deductionItems: [, Validators.required], // 扣款項目
    eventLarge: [, Validators.required], // 活動大分類
    eventMedium: [, Validators.required], // 活動中分類
    eventSmall: [, Validators.required], // 活動子檔期
    eventCategory: [, Validators.required], // 活動類型
    eventDateFrom: [, Validators.required], // 活動起訖
    eventDateTo: [, Validators.required], // 活動起訖
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
    //
    private validationService: ValidationService,
    private announcementUserService: AnnouncementUserService,
    private salesTypeService: SalesTypeService,
    private eventCodeService: EventCodeService,
    private eventCategoryService: EventCategoryService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '220068';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.announcementUserService.getSystemTypes().subscribe(data => {
      this.departmentOptions = data;
    });
    //
    this.eventCodeService.getSystemTypes().subscribe(data => {
      this.eventOptions = data;
    });
    //
    this.salesTypeService.getSystemTypes().subscribe(data => {
      this.salesTypeOptions = data;
      this.deductionItemsOptions = data;
    });
    //
    this.eventCategoryService.getSystemTypes().subscribe(data => {
      this.eventCategoryOptions = data;
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
      // name: ['', [Validators.required, Validators.maxLength(14)]], // Input Text
      // CashRegisterType: ['1', Validators.required], // 收銀機型態
      // SalesDate: ['', Validators.required], // 銷售日期
      // CashRegisterCode: ['', Validators.required], // 收銀機代號
      // TransactionSerialNumber: ['', Validators.required], // 交易流水號
      // CounterNumber: ['', Validators.required], // 專櫃編號
      // TwoPartInvoiceNumberStart: ['', Validators.required], // 二聯發票號碼(起號)
      // TwoPartInvoiceNumberEnd: ['', Validators.required], // 二聯發票號碼(迄號)
      // TaxableAmount: ['', Validators.required], // 應稅金額
      // TaxFreeAmount: ['', Validators.required], // 免稅金額
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
  }

  onClearForm() {
    this.dataForm.reset();  // 重置表單
  }

  onCancel() {
    this.router.navigate(['/TLS2000/TLS2D060']);
  }
  //-----------------------------------------------------------------------------------------------------------
}
