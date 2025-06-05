import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';


@Component({
  selector: 'app-tls24010-cru',
  templateUrl: './tls24010-cru.component.html',
  styleUrls: ['./tls24010-cru.component.scss']
})
export class TLS24010CRUComponent extends BasicCrupageComponent implements OnInit {


  loading = false;
  dataForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(10)]],
    age: ['', Validators.required],
    email: ['', [Validators.maxLength(50), Validators.required]],
    items: this.formBuilder.array([this.createItem()]),

    // New form controls
    supplementCategory: ['', Validators.required],
    saleDateStart: ['', Validators.required],
    saleDateEnd: ['', Validators.required],
    cashierCode: ['', Validators.required],
    counterCode: ['', Validators.required],
    transactionSerial: ['', Validators.required]
  });


  // Options for dropdowns
  supplementCategoryOptions: any[] = [];
  cashierOptions: any[] = [];
  counterCodeOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private translateService: TranslateService
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '220024';
    this.initializeForm();
    this.loadOptions();
  }

  initializeForm() {

  }

  loadOptions() {
    // These would be loaded from a service in a real application
    this.supplementCategoryOptions = [
      { label: 'Category 1', value: '1' },
      { label: 'Category 2', value: '2' }
    ];

    this.cashierOptions = [
      { label: 'Cashier 1', value: '1' },
      { label: 'Cashier 2', value: '2' }
    ];

    this.counterCodeOptions = [
      { label: 'Counter 1', value: '1' },
      { label: 'Counter 2', value: '2' }
    ];
  }

  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(14)]],
      CashRegisterType: ['1', Validators.required],
      SalesDate: ['', Validators.required],
      CashRegisterCode: ['', Validators.required],
      TransactionSerialNumber: ['', Validators.required],
      CounterNumber: ['', Validators.required],
      TwoPartInvoiceNumberStart: ['', Validators.required],
      TwoPartInvoiceNumberEnd: ['', Validators.required],
      TaxableAmount: ['', Validators.required],
      TaxFreeAmount: ['', Validators.required]
    });
  }

  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  onSubmit(frm: FormGroup) {
    this.notificationService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.notificationService.errorBubble(this.translateService.instant('form_error_message'));
      this.notificationService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          this.notificationService.successBubble(this.translateService.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          this.notificationService.successBubble(this.translateService.instant('updated-successfully'));
        }
        break;
    }

    this.notificationService.unblockUi();
    this.submitted = false;
  }

  onCancel() {
    this.router.navigate(['TLS2000/TLS24010']);
  }
  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }//CRU
}
