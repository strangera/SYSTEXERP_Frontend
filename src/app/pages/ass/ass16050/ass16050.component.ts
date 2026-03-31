import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
// Services

// Shared
import { TranslateModule } from '@ngx-translate/core';
import { ASS16050Data } from '@service/api/ass/ass16050.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

@Component({
  selector: 'app-ass16050',
  templateUrl: './ass16050.component.html',
  styleUrl: './ass16050.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, CalendarRangeComponent, CalendarComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class ASS16050Component extends BasicQueryPageComponent<ASS16050Data> implements OnInit {
  queryForm = this.formBuilder.group({
    bigCategoryCode: [],
    midCategoryCode: [],
    smallCategoryCode: [],
    Querybystatus: [],
    propertynumber: [],
    propertytype: [],
    itemCode: [],
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
    issueNo: [],
    applicantCode: [],
    reviewer: [],
    shippingDate: [],
    warehouse: [],
    status: [],
    departmentCode: [],

  });
  // Table data
  data: ASS16050Data[] = [];
  Reporttype = [{ value: 1, label: '全部' },
  { value: 2, label: '差異' },];
  filteredData = [...this.data];
  columns = [
    { field: 'issueNo', header: '領用單號', visible: true },
    { field: 'applicantCode', header: '申請人代號', visible: true },
    { field: 'departmentCode', header: '部門代號', visible: true },
    { field: 'applicationDate', header: '申請日期', visible: true },
    { field: 'issuanceStatus', header: '領用單狀態', visible: true },
    { field: 'approver', header: '審核者', visible: true },
    { field: 'approvalDate', header: '審核日期', visible: true },
    { field: 'shippingDate', header: '發料日期', visible: true },
    { field: 'detailCount', header: '明細筆數', visible: true },
  ];



  // Dropdown options
  departmentCode = [];
  warehouse = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },
  ];
  itemCode = [
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
  reviewer = [];
  usercode = [];
  bigCategoryOptions = [
    { value: 1, label: '裝潢工程' },
    { value: 2, label: '其他工程' },
    { value: 3, label: '電腦及電子零件產品' },
    { value: 4, label: '電力及照明系統' },
    { value: 5, label: '家電家俱設備' },
    { value: 6, label: '機消空電水零配件' },
    { value: 7, label: '辦公及營運庶務' },
    { value: 8, label: '印刷品(非廣告行銷)' },
    { value: 9, label: '印刷品(廣告行銷)' },
    { value: 10, label: '衛生及醫療庶務用品' },
  ];
  midCategoryOptions = [
    { value: 1, label: '室內裝潢工程' },
    { value: 2, label: '室內裝潢備品' },
    { value: 3, label: '弱電系統' },
    { value: 4, label: '房屋及建築設備' },
    { value: 5, label: '停車場設備' },
    { value: 6, label: '其他工程' },
    { value: 7, label: '機電消防工程' },
    { value: 8, label: '電子產品及零件' },
    { value: 9, label: '電子儀器設備' },
    { value: 10, label: '電子儀器設備-資產' },
  ];
  smallCategoryOptions = [
    { value: 1, label: '機電空調工程' },
    { value: 2, label: '水電消防工程' },
    { value: 3, label: '排油煙工程' },
    { value: 4, label: '商場高壓電節能工程' },
    { value: 5, label: '商場弱電系統工程' },
    { value: 6, label: '網路佈線工程' },
    { value: 7, label: '鐵路自動測試儀' },
    { value: 8, label: '風車零件' },
    { value: 9, label: '資收場回收用品' },
    { value: 10, label: '瓦斯鍋及滅斷設備工程' },
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
    private notificationService: NotificationService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('ASS16050', 'ass/ass16050cru', this.queryForm, (form) => this.onSubmit(form));
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

    this.data = [
      {
        id: '1',
        issueNo: 'REC2600001-01',
        applicantCode: '人資Team',
        departmentCode: '時薪測試人員',
        applicationDate: '2023/01/01',
        issuanceStatus: '領用申請',
        approver: '員工A',
        approvalDate: '2023/01/02',
        shippingDate: '2023/01/03',
        detailCount: '1'
      }
    ]
  }

  onSubmitQuery(frm: FormGroup) {
    this.onSubmit(frm);
    this.router.navigate(['ASS1000/ASS16050CRU']);
  }

  // onCreate() {
  //   if (this.canAdd()) {
  //     const extras: NavigationExtras = {
  //       state: {
  //         crudstatus: CRUDStatus.Create,
  //         queryform: this.queryForm,
  //       },
  //       skipLocationChange: true,
  //     };
  //     this.router.navigate(['ASS1000/ASS16050CRU'], extras);
  //   }
  // }

  // onEdit(data: any) {
  //   if (this.canEdit()) {
  //     const extras: NavigationExtras = {
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
  //   const extras: NavigationExtras = {
  //     state: {
  //       crudstatus: CRUDStatus.Read,
  //       rowdata: data,
  //       queryform: this.queryForm,
  //     },
  //     skipLocationChange: true,
  //   };
  //   this.router.navigate(['/demoCRU'], extras);
  // }
  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }
}
