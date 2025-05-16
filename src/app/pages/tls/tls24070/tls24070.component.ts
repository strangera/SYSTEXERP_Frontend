import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { CashierCodeService } from '../../../service/basic/cashier-code.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';

@Component({
  selector: 'app-tls24070',
  templateUrl: './tls24070.component.html',
  styleUrls: ['./tls24070.component.scss']
})
export class TLS24070Component extends BasicQpageComponent implements OnInit {
  queryForm = this.formBuilder.group({
    saleDateStart: ['', Validators.required],
    saleDateEnd: ['', Validators.required],
    cashierCode: ['', Validators.required],
    startSerialNumber: ['', Validators.required],
    endSerialNumber: ['', Validators.required],
    invoiceNumber: ['', Validators.required, Validators.maxLength(20)],
    selectedGroup: ['group1'], // Set default group
    test: ['', Validators.required]
  });
  cashierCodeOptions: any[] = [];
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'correctionItem', header: '修正項目', visible: true },
    { field: 'transactionDate', header: '交易日期', visible: true },
    { field: 'machineNumber', header: '收銀機號', visible: true },
    { field: 'transactionNumber', header: '交易序號', visible: true },
    { field: 'counterNumber', header: '專櫃編號/名稱', visible: true },
    { field: 'originalInvoiceStart', header: '原發票起號', visible: true },
    { field: 'originalInvoiceEnd', header: '原發票迄號', visible: true },
    { field: 'newInvoiceStart', header: '新發票起號', visible: true },
    { field: 'newInvoiceEnd', header: '新發票迄號', visible: true },
    { field: 'taxAmount', header: '應稅合計', visible: true },
    { field: 'taxFreeAmount', header: '免稅總金額', visible: true },
    { field: 'diplomatTaxFree', header: '外交官零稅', visible: true },
    { field: 'documentCount', header: '張數', visible: true },
    { field: 'transactionType', header: '交易型態', visible: true }
  ];
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private cashierCodeService: CashierCodeService
  ) {
    super();
    this.initializeForm();
  }

  ngOnInit(): void {
    this.ProgNo = '220030';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.cashierCodeService.getCashierCodes().subscribe(data => {
      this.cashierCodeOptions = data;
    });
    // Set default group to 'group1' and adjust controls accordingly
    this.onGroupSelect('group1');
  }

  initializeForm() {
    this.queryForm = this.formBuilder.group({
      saleDateStart: ['', Validators.required],
      saleDateEnd: ['', Validators.required],
      cashierCode: ['', Validators.required],
      startSerialNumber: ['', Validators.required],
      endSerialNumber: ['', Validators.required],
      invoiceNumber: ['', [Validators.required, Validators.maxLength(10)]],
      selectedGroup: ['group1'], // Set default group
      test: ['', Validators.required]
    });
    // Initially disable fields for group2 if needed
    this.disableFieldsForGroup2();
  }

  disableFieldsForGroup2() {
    const invoiceNumberControl = this.queryForm.get('invoiceNumber');
    if (invoiceNumberControl) {
      invoiceNumberControl.disable();
    }
  }

  onGroupSelect(group: string): void {
    const selectedGroupControl = this.queryForm.get('selectedGroup');
    if (selectedGroupControl) {
      selectedGroupControl.setValue(group);
    }

    const controlsToDisable = ['saleDateStart', 'saleDateEnd', 'cashierCode', 'startSerialNumber', 'endSerialNumber'];

    if (group === 'group1') {
      controlsToDisable.forEach(controlName => {
        const control = this.queryForm.get(controlName);
        if (control) {
          control.enable();
        }
      });
      this.safeDisable('invoiceNumber');
      this.safeDisable('test');
    } else {
      controlsToDisable.forEach(controlName => {
        const control = this.queryForm.get(controlName);
        if (control) {
          control.disable();
        }
      });
      this.safeEnable('invoiceNumber');
      this.safeEnable('test');
    }
  }

  // Helper methods to safely enable or disable controls
  private safeEnable(controlName: string): void {
    const control = this.queryForm.get(controlName);
    if (control) {
      control.enable();
    }
  }

  private safeDisable(controlName: string): void {
    const control = this.queryForm.get(controlName);
    if (control) {
      control.disable();
    }
  }

  onSubmit(frm: FormGroup): void {
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();
    if (frm.valid && this.canQuery()) {
      console.log(frm.value);
    }
    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  onClearForm(): void {
    this.queryForm.reset({ selectedGroup: 'group1' }); // Reset form and set default group
    this.onGroupSelect('group1');
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(this.router, CRUDStatus.Edit, data, this.cruPage);
    }
  }

  onDetail(data: any) {
    // Detail logic
  }
}
