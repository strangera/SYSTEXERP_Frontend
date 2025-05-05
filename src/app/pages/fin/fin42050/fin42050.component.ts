import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { IfdisplayService } from './../../../service/basic/ifdisplay.service';
import { AnalysisdateCService } from './../../../service/basic/analysisdate-c.service';
import { FlippingstateService } from './../../../service/basic/flippingstate.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { VendorService } from '../../../service/basic/vendor.service';
import { FileType } from '../../../shared/componentkit/file-upload/file-upload.component';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';

@Component({
  selector: 'app-fin42050',
  templateUrl: './fin42050.component.html',
  styleUrl: './fin42050.component.scss'
})
export class FIN42050Component extends BasicQpageComponent implements OnInit {
  // Upload files
  fileType: FileType = FileType.PNG;
  uploadUrl: string = 'https://www.primefaces.org/cdn/api/upload.php';
  queryForm = this.formBuilder.group({
    year: [],
    version: [],
    organizationNumber: [, Validators.required],
    month: [],
    amountStart: [], // 金額 起
    amountEnd: [], // 金額 迄
    remark: [],
    status: [],
    department: [],
    unit: [],
    type: [],
    compareyear: [],
    version1: [],
    version2: [],
    year1: [],
    year2: [],
  });

  // Dropdown options

  FNCCodeOptions: any[] = [];
  AccountcodeOptions: any[] = [];
  departmentOptions: any[] = [];
  displayOptions2: any[] = [];
  AnalysisdateCOptions: any[] = [];
  vendorOptions: any[] = [];
  FlippingstateOptions: any[] = [];
  organizationNumberOptions: any[] = [];
  statusOptions: any[] = [{ value: 1, label: '是' },
  { value: 2, label: '否' }];
  unitOptions: any[] = [{ value: 1, label: '元' },
  { value: 2, label: '千' },
  { value: 3, label: '萬' }];
  typeOptions: any[] = [{ value: 1, label: '統制' },
  { value: 2, label: '明細' },];



  // Table data
  data: any[] = [

    // Other data
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'subjectCode', header: '科目代號', visible: true },
    { field: 'subjectName', header: '科目名稱', visible: true },
    { field: 'currentMonthActual', header: '2024年09月實際 - 金額', visible: true },
    { field: 'currentMonthRatio', header: '佔比(%)', visible: true },
    { field: 'version1', header: '2024年09月 版本1 - 金額', visible: true },
    { field: 'version1Ratio', header: '佔比(%)', visible: true },
    { field: 'versionDifference', header: '版本差異值', visible: true }
  ];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private IfdisplayService: IfdisplayService,
    private AnalysisdateCService: AnalysisdateCService,
    private vendorService: VendorService,
    private flippingstateService: FlippingstateService,
    private organizationNumberService: OrganizationNumberService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '140009';
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.IfdisplayService.getOptions().subscribe(
      (data) => (this.displayOptions2 = data)
    );
    this.AnalysisdateCService.getOptions().subscribe(
      (data) => (this.AnalysisdateCOptions = data)
    );
    this.vendorService.getVendors().subscribe((data) => {
      this.vendorOptions = data;
    });
    this.flippingstateService.getOptions().subscribe((data) => {
      this.FlippingstateOptions = data;
    });
    this.organizationNumberService.getOrganizationNumbers().subscribe((data) => {
      this.departmentOptions = data;
    });


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
    this.onSubmit(frm);
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['FIN4000/FIN42050CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }
}
