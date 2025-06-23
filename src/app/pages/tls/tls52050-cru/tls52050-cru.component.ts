import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// Services
import { VendorService } from '../../../service/basic/vendor.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tls52050-cru',
  templateUrl: './tls52050-cru.component.html',
  styleUrl: './tls52050-cru.component.scss'
})
export class TLS52050CRUComponent extends BasicCrupageComponent implements OnInit {

  // ProgNo: string = '250018';
  // funInfo?: FunsrightInfo;
  // // Permissions
  // a
  // 
  // 
  // loading: boolean = false;
  // submitted: boolean = false;

  dataForm = this.formBuilder.group({
    priceChangeOrderNumber: [{ value: '自動編號', disabled: true }],  // 變價單號
    brandCode: [, Validators.required],
    vendorCode: [, Validators.required],
    priceChangeDescription: [],
    startDate: [],
    applicationDate: [],
    applicantCode: [],
    costPriceDiscount: [],
    costPriceAdjustment: [],
    salePriceDiscount: [],
    salePriceAdjustment: [],
    // ----------------------------------------------------------------
    items: this.formBuilder.array([
      this.createItem()
    ]),
  });

  // Dropdown options
  brandCodeOptions: any[] = [];
  vendorOptions: any[] = [];
  userCodeOptions: any[] = [];
  // formTitle: string = '';   //CRU
  // showConfirm: boolean = false;//CRU
  // crudstatus: CRUDStatus = CRUDStatus.Read;//CRU


  // Table data
  data: any[] = [
    { projectNumber: '001', projectName: '專櫃A', activity: '促銷活動', startDate: '2023-01-01', endDate: '2023-01-31', executionStartDate: '2023-01-01', executionEndDate: '2023-01-31' },
    { projectNumber: '002', projectName: '專櫃B', activity: '新品發布', startDate: '2023-02-01', endDate: '2023-02-28', executionStartDate: '2023-02-01', executionEndDate: '2023-02-28' }
  ];

  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'projectNumber', header: '專櫃編號', visible: true },
    { field: 'projectName', header: '櫃位名稱', visible: true },
    { field: 'activity', header: '活動', visible: true },
    { field: 'startDate', header: '開始起始日', visible: true },
    { field: 'endDate', header: '開始終止日', visible: true },
    { field: 'executionStartDate', header: '營運起始日', visible: true },
    { field: 'executionEndDate', header: '營運終止日', visible: true }
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private vendorService: VendorService,
    private brandCodeService: BrandCodeService,
    private userCodeService: UserCodeService,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '250018';
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.vendorService.getVendors().subscribe(data => this.vendorOptions = data);
    this.brandCodeService.getSystemTypes().subscribe(data => this.brandCodeOptions = data);
    this.userCodeService.getUserCode().subscribe(data => this.userCodeOptions = data);
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

    }//CRU
  }

  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  //
  createItem(): FormGroup {
    return this.formBuilder.group({

      mgname: [],
      bigC: [{ value: '自動帶入', disabled: true }],
      midC: [{ value: '自動帶入', disabled: true }],
      smallC: [{ value: '自動帶入', disabled: true }],
      discount: [{ value: '自動帶入', disabled: true }],
      padjprice: [{ value: '自動帶入', disabled: true }],
      aadjprice: [],
      padjsaleprice: [{ value: '自動帶入', disabled: true }],
      aadjsaleprice: [],
      descript: [],

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
    this.onSubmit(frm);
  }

  onCancel() {
    this.router.navigate(['TLS5000/TLS52050']);
  }


}
