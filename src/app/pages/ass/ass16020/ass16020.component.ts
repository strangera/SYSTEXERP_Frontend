import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS16020Data } from '@service/api/ass/ass16020.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

@Component({
  selector: 'app-ass16020',
  templateUrl: './ass16020.component.html',
  styleUrl: './ass16020.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, CalendarRangeComponent, InputTextComponent, RadiobuttonComponent, ButtonComponent, TableComponent, TranslateModule, MultiSelectComponent]
})
export class ASS16020Component extends BasicQueryPageComponent<ASS16020Data> implements OnInit {
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
    Inventorystatus: [[1, 2]],  // 預設選取
    SInventorydate: [],
    EInventorydate: [],
    SClosingdate: [],
    EClosingdate: [],
    Counter: [],
    illustrate: [],
    Reporttype: [1],  // 預設選取
  });
  // Table data
  data: ASS16020Data[] = [];
  selectedItems: ASS16020Data[] = [];

  Reporttype = [
    { value: 1, label: '全部' },
    { value: 2, label: '差異' },
  ];
  columns = [
    { field: 'inventoryNumber', header: '盤點單號', visible: true },
    { field: 'inventoryStatus', header: '盤點狀態', visible: true },
    { field: 'inventoryDate', header: '盤點日期', visible: true },
    { field: 'closingDate', header: '結案日期', visible: true },
    { field: 'inventoryStaff', header: '盤點人員', visible: true },
  ];



  // Dropdown options
  Inventorystatus = [
    { value: 1, label: '盤點中' },
    { value: 2, label: '登錄完成' },
    { value: 3, label: '已結案' },

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
  usercode = [
    { value: 1, label: '人員A' },
    { value: 2, label: '人員B' },
  ];
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

  constructor(
    private notificationService: NotificationService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '310041';
    this.initializePage('ASS16020', 'ass/ass16020cru', this.queryForm, (form) => this.onSubmit(form));
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
        inventoryNumber: 'IV202603110001',
        inventoryStatus: '已結案',
        inventoryDate: '2026-03-01',
        closingDate: '',
        inventoryStaff: '王小明'
      },
      {
        inventoryNumber: 'IV202603110002',
        inventoryStatus: '盤點中',
        inventoryDate: '2026-03-03',
        closingDate: '',
        inventoryStaff: '陳美玲'
      },
      {
        inventoryNumber: 'IV202603110003',
        inventoryStatus: '登錄完成',
        inventoryDate: '2026-03-05',
        closingDate: '2026-03-06',
        inventoryStaff: '林志宏'
      },
      {
        inventoryNumber: 'IV202603110004',
        inventoryStatus: '登錄完成',
        inventoryDate: '2026-03-07',
        closingDate: '2026-03-08',
        inventoryStaff: '張雅婷'
      },
      {
        inventoryNumber: 'IV202603110005',
        inventoryStatus: '盤點中',
        inventoryDate: '2026-03-09',
        closingDate: '',
        inventoryStaff: '劉冠廷'
      }
    ]
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
