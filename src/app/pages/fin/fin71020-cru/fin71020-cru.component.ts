import { UserCodeService } from './../../../service/basic/user-code.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-fin71020-cru',
    templateUrl: './fin71020-cru.component.html',
    styleUrls: ['./fin71020-cru.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, EditorTextComponent, ButtonComponent, NgIf, TranslateModule]
})
export class FIN71020CRUComponent extends BasicCrupageComponent implements OnInit {

  // Define form structure
  dataForm = this.formBuilder.nonNullable.group({
    usercode: ['', Validators.required], // 保管人代碼
    feespayable: ['', Validators.required], // 應付費用
    PettyAmount: [null, Validators.required], // 零用金額度 Start
    ePettyAmount: [null, Validators.required], // 零用金額度 End
    description: [''], // 說明
    // Define a dynamic array for additional items
    items: this.formBuilder.array([this.createItem()]),
  });

  // Options for dropdowns
  usercodeOptions = [
    { label: 'User 1', value: '1' },
    { label: 'User 2', value: '2' }
  ];

  feespayableOptions = [
    { label: 'Expense 1', value: '1' },
    { label: 'Expense 2', value: '2' }
  ];

  // Control flow variables


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private userCodeService: UserCodeService,
  ) {
    super();  // Call parent constructor
  }

  ngOnInit(): void {
    // Initialize program number and permissions
    this.ProgNo = '170002';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.userCodeService.getUserCode().subscribe(
      (data) => (this.usercodeOptions = data)
    );
    // Handle different CRUD states
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };

    switch (state.crudstatus) {
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.accordionTabCss = 'create-accordionTab';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.accordionTabCss = 'edit-accordionTab';
        this.crudstatus = CRUDStatus.Edit;
        this.showConfirm = this.canEdit();
        this.Edit(state.rowdata);
        break;
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        this.Read(state.rowdata);
        break;
    }
  }

  // Get the form array for dynamic items
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  // Get specific form control from the dynamic form array
  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  // Create an item in the form array
  createItem(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(14)]], // Input Text
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

  // Remove an item from the form array
  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  // Edit method to patch the form with existing data
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  // Read method to view the data and disable the form
  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  // Add a new item to the form array
  onAddItem(): void {
    this.items.push(this.createItem());
  }

  // Handle form submission
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

  // Trigger form submission
  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  // Cancel action
  onCancel() {
    this.router.navigate(['FIN7000/FIN71020']);
  }
}
