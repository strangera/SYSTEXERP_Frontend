import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';

@Component({
  selector: 'app-tls21020-cru',
  templateUrl: './tls21020-cru.component.html',
  styleUrls: ['./tls21020-cru.component.scss'],
})
export class TLS21020CRUComponent extends BasicCrupageComponent implements OnInit {
  CashRegisterTypeItems: any[] = [
    { label: '業主', value: '1' },
    { label: '非業主', value: '2' },
  ];

  receivableVendorItems: any[] = [
    { label: '南紡流通服務台', value: 'A' },
    { label: '南紡流通-特殊交易', value: 'B' },
  ];

  organizationCodeItems: any[] = [
    { label: '全公司', value: '1' },
    { label: '稽核室', value: '2' },
  ];

  accountingSubjectItems: any[] = [
    { label: '應收帳款-現金', value: '1' },
    { label: '應收帳款-一卡通', value: '2' },
  ];

  // Form Initialization
  dataForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(10)]],
    age: [],
    email: ['', [Validators.maxLength(50), Validators.required]],
    items: this.formBuilder.array([this.createItem()]), // Initialize with one item
  });

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
  ) {
    super(); // Call the parent constructor
  }

  ngOnInit(): void {
    // Initialize
    this.ProgNo = '220002';

    // Set user permissions
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus;
      rowdata: any;
    };

    // Determine the CRUD status and set form title and CSS class accordingly
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

  // Get FormArray for items
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  // Get FormControl based on index and controlName
  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  // Create new form group for item
  createItem(): FormGroup {
    return this.formBuilder.group({
      itemName: [], // 項目名稱
      accountingSubject: [], // 會計科目
      organizationCode: [], // 組織代碼
      voucherRemarks: ['', Validators.maxLength(100)], // 傳票備註
      contractOrganizationSplit: [], // 是否依合約拆立組織
      relatedPartyAccounting: [], // 區分關係人會科
      receivableVendor: [], // 應收廠商
      paymentDays: ['', [Validators.pattern('^[0-9]*$')]], // 付款天數
    });
  }

  // Remove an item from FormArray
  onRemoveItem(index: number): void {
    this.items.removeAt(index);
  }

  // Add a new item to FormArray
  onAddItem(): void {
    this.items.push(this.createItem());
  }

  // Edit the form with provided rowdata
  Edit(rowdata: any): void {
    this.dataForm.patchValue(rowdata);
  }

  // Read the form with provided rowdata
  Read(rowdata: any): void {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  // Submit the form
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
          // Implement add logic here
          this.messageService.successBubble(this.translate.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // Implement update logic here
          this.messageService.successBubble(this.translate.instant('updated-successfully'));
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  // Submit the form on button click
  submitForm(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  // Cancel and navigate back to listing
  onCancel(): void {
    this.router.navigate(['TLS2000/TLS21020']);
  }
}
