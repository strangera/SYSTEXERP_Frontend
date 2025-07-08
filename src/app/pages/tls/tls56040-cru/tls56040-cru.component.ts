import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { IssuanceTypeService } from '../../../service/basic/issuance-type.service';
import { IssuanceNoteStatusService } from '../../../service/basic/issuance-note-status.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';


@Component({
  selector: 'app-tls56040-cru',
  templateUrl: './tls56040-cru.component.html',
  styleUrl: './tls56040-cru.component.scss'
})
export class TLS56040CRUComponent {
  ProgNo: string = '250035';
  funInfo?: FunsrightInfo;



  loading: boolean = false;
  submitted: boolean = false;
  formTitle: string = '';   //CRU
  showConfirm: boolean = false;//CRU
  crudstatus: CRUDStatus = CRUDStatus.Read;//CRU

  dataForm = this.formBuilder.group({
    issuanceNoteCode: [{ value: '自動編號', disabled: true }],
    generalCode: [],
    inwarehouseCode: [, Validators.required],
    exwarehouseCode: [, Validators.required],
    brandCode: [, Validators.required],

    issuanceType: [],
    issuanceNoteStatus: [],
    applicantCode: [],
    approverCode: [],
    applicationDateFrom: [, Validators.required],
    applicationDateTo: [],
    approvalDateFrom: [],
    approvalDateTo: [],
    remark: [],
    organizationNumber: [],
    issuanceReturnCode: [{ value: '自動編號', disabled: true }],
    amount: [],
    quantity: [],
  });

  // Dropdown options
  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];
  issuanceTypeOptions: any[] = [];
  issuanceNoteStatusOptions: any[] = [];
  applicantCodeOptions: any[] = [];
  approverCodeOptions: any[] = [];
  organizationNumberOptions: any[] = [];  // Updated dropdown for 部門編號

  // Table data
  data: any[] = [
    {
      sequence: 1,
      isNew: true,
      aboveNew: true,
      productManagementCodeName: 'Product A',
      productPrice: 200.0,
      currentStock: 50,
      claimQuantity: 5,
      itemRemarks: 'Some remarks',
    },
    {
      sequence: 2,
      isNew: false,
      aboveNew: false,
      productManagementCodeName: 'Product B',
      productPrice: 150.0,
      currentStock: 30,
      claimQuantity: 3,
      itemRemarks: 'Other remarks',
    },
    // Add other data as needed
  ];

  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'sequence', header: '序號', visible: true },
    { field: 'isNew', header: '是否新增', visible: true },
    { field: 'aboveNew', header: '以上新增', visible: true },
    { field: 'productManagementCodeName', header: '商品管理編號/名稱', visible: true },
    { field: 'productPrice', header: '商品售價', visible: true },
    { field: 'currentStock', header: '目前庫存', visible: true },
    { field: 'claimQuantity', header: '領用數量', visible: true },
    { field: 'itemRemarks', header: '單項備註', visible: true },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private warehouseService: WarehouseService,
    private brandCodeService: BrandCodeService,
    private issuanceTypeService: IssuanceTypeService,
    private issuanceNoteStatusService: IssuanceNoteStatusService,
    private userCodeService: UserCodeService,
    private authService: AuthService,
    private organizationNumberService: OrganizationNumberService,  // Updated this service
  ) { }

  ngOnInit(): void {
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.warehouseService.getWarehouseOptions().subscribe((data) => (this.warehouseOptions = data));
    this.brandCodeService.getSystemTypes().subscribe((data) => (this.brandCodeOptions = data));
    this.issuanceTypeService.getIssuanceTypes().subscribe((data) => (this.issuanceTypeOptions = data));
    this.issuanceNoteStatusService.getIssuanceNoteStatuses().subscribe((data) => (this.issuanceNoteStatusOptions = data));
    this.organizationNumberService.getOrganizationNumbers().subscribe((data) => (this.organizationNumberOptions = data));  // Updated dropdown initialization for 部門編號
    this.userCodeService.getUserCode().subscribe((data) => {
      this.applicantCodeOptions = data;
      this.approverCodeOptions = data;
    });
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };//CRU

    switch (state.crudstatus) {
      case CRUDStatus.Create:
        this.formTitle = '新增資料';
        this.showConfirm = this.canAdd();
        break;
      case CRUDStatus.Edit:
        console.log(state.rowdata);
        this.formTitle = '編輯資料';
        this.showConfirm = this.canEdit();
        this.Edit(state.rowdata);
        break;
      case CRUDStatus.Read:
        this.formTitle = '顯示資料';
        this.Read(state.rowdata);
        break;
    }//CRU
  }
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  canQuery(): boolean {
    return true;
  }

  canAdd(): boolean {
    return true;
  }

  canEdit(): boolean {
    return true;
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // Submit logic here
    }

    this.loading = false;
    this.notificationService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset();  // 重置表單
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          dataForm: this.dataForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS5000/TLS56040'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          dataForm: this.dataForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoinputtableCRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        dataForm: this.dataForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoinputtableCRU'], extras);
  }
  get isFormEditable(): boolean {
    return (this.crudstatus === CRUDStatus.Create && this.canAdd()) || (this.crudstatus === CRUDStatus.Edit && this.canEdit());
  }//CRU

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }//CRU

  onCancel() {
    this.router.navigate(['TLS5000/TLS56040']);
  }//CRU
}
