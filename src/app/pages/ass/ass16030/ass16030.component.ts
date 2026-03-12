import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { NavigationExtras, Router } from '@angular/router';
// Services

// Shared
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
//import { AuthService } from '../../../service/system/auth.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
//import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { ASS16030Data } from '@service/api/ass/ass16030.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';

@Component({
  selector: 'app-ass16030',
  templateUrl: './ass16030.component.html',
  styleUrl: './ass16030.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, CalendarRangeComponent, CalendarComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class ASS16030Component extends BasicQueryPageComponent<ASS16030Data> implements OnInit {
  queryForm = this.formBuilder.group({
    bigCategoryCode: [],
    midCategoryCode: [],
    smallCategoryCode: [],
    Querybystatus: [],
    propertynumber: [],
    propertytype: [],
    Itemnumber: [],
    Accountcode: [],
    custodyunit: [],
    SApplicationdate: [],
    EApplicationdate: [],
    SReviewdate: [],
    EReviewdate: [],
    basedate: [],
    Inventoryordernumber: [],
    Inventorystatus: [],
    SInventorydate: [],
    EInventorydate: [],
    SClosingdate: [],
    EClosingdate: [],
    Counter: [],
    illustrate: [],
    Reporttype: [],
    Receiptnumber: [],
    Applicantcode: [],
    reviewer: [],
    Shippingdate: [],
    Kurabe: [],
    status: [],
    Departmentcode: [],

  });
  // Table data
  data: ASS16030Data[] = [];
  Reporttype = [{ value: 1, label: '全部' },
  { value: 2, label: '差異' },];
  // filteredData: any[] = [...this.data];
  columns = [
    { field: 'issuanceNote', header: '領用單號', visible: true },
    { field: 'applicantCode', header: '申請人代號', visible: true },
    { field: 'departmentCode', header: '部門代號', visible: true },
    { field: 'applicationDate', header: '申請日期', visible: true },
    { field: 'issuanceStatus', header: '領用單狀態', visible: true },
    { field: 'approver', header: '審核者', visible: true },
    { field: 'approvalDate', header: '審核日期', visible: true },
    { field: 'issuanceDate', header: '發料日期', visible: true },
    { field: 'detailCount', header: '明細筆數', visible: true },
  ];

  // Dropdown options
  Departmentcode = [
    { value: 1, label: 'D001' },
    { value: 2, label: 'D002' },
  ];
  Kurabe = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },
  ];
  Itemnumber = [

    { value: 1, label: '3A24210000001' },
    { value: 2, label: '3A24210000002' },
    { value: 3, label: '3A24210000003' },
    { value: 4, label: '3A24210000004' },
    { value: 5, label: '3A24210000005' },
    { value: 6, label: '3A24210000006' },
    { value: 7, label: '3A24210000007' },
    { value: 8, label: '3A24210000008' },
    { value: 9, label: '3A24210000009' },
    { value: 10, label: '3A24210000010' },
  ];
  Inventorystatus = [
    { value: 1, label: '盤點中' },
    { value: 2, label: '登錄完成' },
    { value: 3, label: '已結案' },

  ];
  Inventoryordenumber = [
    { value: 1, label: '202406002' },

  ];
  custodyunit = [
    { value: 1, label: '101000' },
    { value: 2, label: '102000' },
    { value: 3, label: '103000' },
    { value: 4, label: '104000' },
    { value: 5, label: '105000' },
    { value: 6, label: '106000' },
    { value: 7, label: '107000' },
    { value: 8, label: '108000' },
    { value: 9, label: '109000' },
    { value: 10, label: '10A000' },
  ];
  Accountcode = [
    { value: 1, label: '1501' },
    { value: 2, label: '150101' },
    { value: 3, label: '1511' },
    { value: 4, label: '151101' },
    { value: 5, label: '1512' },
    { value: 6, label: '151201' },
    { value: 7, label: '1521' },
    { value: 8, label: '152101' },
    { value: 9, label: '1522' },
    { value: 10, label: '152201' },
  ];
  reviewer = [
    { value: 1, label: '人員A' },
    { value: 2, label: '人員B' },
  ];
  usercode = [
    { value: 1, label: 'B001' },
    { value: 2, label: 'B002' },
    { value: 3, label: 'B003' },
    { value: 4, label: 'B004' },
    { value: 5, label: 'B005' },
  ];

  Querybystatus = [
    { value: 1, label: '移轉' },
    { value: 2, label: '報廢除帳' },
    { value: 3, label: '變賣除帳' },
    { value: 4, label: '新購' },
  ];
  assetCodeOptions = [
    { value: 1, label: '1A232300000010000001' },
    { value: 2, label: '1A232300000020000001' },
    { value: 3, label: '1A232300000040000001' },
    { value: 4, label: '1A232300000050000001' },
    { value: 5, label: '1A232300000060000001' },
    { value: 6, label: '1A232300000090000001' },
    { value: 7, label: '1A232400000010000001' },
    { value: 8, label: '1A232400000040000001' },
    { value: 9, label: '1A232400000060000001' },
  ];
  propertytype = [
    { value: 1, label: '資產' },
    { value: 2, label: '列管品' },
  ];
  status = [
    { value: 1, label: '領用申請' },
    { value: 2, label: '審核確認' },
    { value: 2, label: '領用發料' },
  ];

  constructor(
    // private router: Router,
    // private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    // private authService: AuthService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '310042';
    this.initializePage('ASS16030', '/ass/ass16030cru', this.queryForm, (form) => this.onSubmit(form));

  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    // if (frm.valid && this.canQuery()) {
    //   // Submit logic here
    // }

    this.loading = false;
    this.notificationService.unblockUi();

    // 查詢假資料
    this.data = [
      {
        issuanceNote: 'REC2600001',   // 領用單號
        applicantCode: 'B001',            // 申請人代號
        departmentCode: 'D010',           // 部門代號
        applicationDate: '2026-03-01',    // 申請日期
        issuanceStatus: '領用申請',          // 領用單狀態
        approver: '王主任',               // 審核者
        approvalDate: '',                 // 審核日期
        issuanceDate: '',                 // 發料日期
        detailCount: '3'                  // 明細筆數
      },
      {
        issuanceNote: 'REC2600002',
        applicantCode: 'B002',
        departmentCode: 'D020',
        applicationDate: '2026-03-02',
        issuanceStatus: '審核確認',
        approver: '李課長',
        approvalDate: '2026-03-03',
        issuanceDate: '',
        detailCount: '5'
      },
      {
        issuanceNote: 'REC2600003',
        applicantCode: 'B003',
        departmentCode: 'D030',
        applicationDate: '2026-03-04',
        issuanceStatus: '領用發料',
        approver: '陳經理',
        approvalDate: '2026-03-05',
        issuanceDate: '2026-03-06',
        detailCount: '2'
      },
      {
        issuanceNote: 'REC2600004',
        applicantCode: 'B004',
        departmentCode: 'D010',
        applicationDate: '2026-03-05',
        issuanceStatus: '審核確認',
        approver: '王主任',
        approvalDate: '2026-03-06',
        issuanceDate: '',
        detailCount: '4'
      },
      {
        issuanceNote: 'REC2600005',
        applicantCode: 'B005',
        departmentCode: 'D040',
        applicationDate: '2026-03-07',
        issuanceStatus: '領用發料',
        approver: '林襄理',
        approvalDate: '2026-03-08',
        issuanceDate: '2026-03-09',
        detailCount: '6'
      }
    ];
  }

  // onCreate() {
  //   if (this.canAdd()) {
  //     let extras: NavigationExtras = {
  //       state: {
  //         crudstatus: CRUDStatus.Create,
  //         queryform: this.queryForm,
  //       },
  //       skipLocationChange: true,
  //     };
  //     this.router.navigate(['FIN3000/FIN34030CRU'], extras);
  //   }
  // }

  // onEdit(data: any) {
  //   if (this.canEdit()) {
  //     let extras: NavigationExtras = {
  //       state: {
  //         crudstatus: CRUDStatus.Edit,
  //         rowdata: data,
  //         queryform: this.queryForm,
  //       },
  //       skipLocationChange: true,
  //     };
  //     this.router.navigate(['/demoCRU'], extras);
  //   }
  // }

  // onDetail(data: any) {
  //   let extras: NavigationExtras = {
  //     state: {
  //       crudstatus: CRUDStatus.Read,
  //       rowdata: data,
  //       queryform: this.queryForm,
  //     },
  //     skipLocationChange: true,
  //   };
  //   this.router.navigate(['/demoCRU'], extras);
  // }
}
