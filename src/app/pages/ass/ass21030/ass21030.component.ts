import { LocationCodeService } from './../../../service/basic/locationcode.service';
import { FloorService } from './../../../service/basic/floor.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services

// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { BigCategoryService } from '../../../service/basic/big-category.service';
import { MidCategoryService } from '../../../service/basic/mid-category.service';
import { SmallCategoryService } from '../../../service/basic/small-category.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-ass21030',
  templateUrl: './ass21030.component.html',
  styleUrl: './ass21030.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class ASS21030Component extends BasicQpageComponent implements OnInit {
  ngOnInit(): void {
    this.ProgNo = '320003';
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.organizationNumberService.getOrganizationNumbers()
      .subscribe((data) => (this.Departmentcode = data));
    this.floorService.getFloors()
      .subscribe((data) => (this.floor = data));
    this.locationCodeService.getSystemTypes()
      .subscribe((data) => (this.location = data));
  }
  queryForm = this.formBuilder.group({
    bigCategoryCode: [],
    midCategoryCode: [],
    smallCategoryCode: [],
    Querybystatus: [],
    propertynumber: [],
    propertytype: [],
    Itemnumber: [],
    Sdate: [],
    Edate: [],
    Departmentcode: [],
    Kurabe: [],
    code: [],
    floor: [],
    location: [],
    illustrate: [],
    Placementinstructions: [],
    Energytype: [],
    equipmentLocationOptions: [],
    ironNumberOptions: [],
    remark: [],
    Counternumber: [],
    Counterclassification: [],
  });
  // Table data
  Energytype: any[] = [{ value: 1, label: '水費' },
  { value: 2, label: '電費' },
  { value: 3, label: '瓦斯費' },];
  Counternumber: any[] = [{ value: 1, label: '000001' },
  { value: 2, label: '000002' },
  { value: 3, label: '000003' },];
  Counterclassification: any[] = [{ value: 1, label: '商場' },
  ];
  data: any[] = [];
  equipmentLocationOptions: any[] = [
    { value: 1, label: '010A000001' },
    { value: 2, label: '010A000002' },
    { value: 3, label: '010A000003' },
    { value: 4, label: '010A000004' },
    { value: 5, label: '010B000001' },
    { value: 6, label: '010B000002' },
    { value: 7, label: '010B000003' },
  ];
  ironNumberOptions: any[] = [
    { value: 1, label: 'WB102' },
    { value: 2, label: 'WB103' },
    { value: 3, label: 'WB105' },
    { value: 4, label: 'WB106' },
    { value: 5, label: 'WB107' },
    { value: 6, label: 'WB108' },
    { value: 7, label: 'WB109' },
    { value: 8, label: 'WB110' },
    { value: 9, label: 'WB111' },
    { value: 10, label: 'WB112' },
  ];

  location: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'waterCourseCode', header: '水錶編號', visible: true },
    { field: 'counterCode', header: '專櫃編號', visible: true },
    { field: 'areaRatio', header: '面積比率(%)', visible: true },
    { field: 'counterCategory', header: '專櫃分類', visible: true },
    { field: 'remarks', header: '備註', visible: true },
  ];






  // Dropdown options
  floor: any[] = [];
  Kurabe: any[] = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },
  ];
  Departmentcode: any[] = [];
  usercode: any[] = [];
  bigCategoryOptions: any[] = [
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
  midCategoryOptions: any[] = [
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
  smallCategoryOptions: any[] = [
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
  Querybystatus: any[] = [
    { value: 1, label: '全部' },
    { value: 2, label: '只顯示低於安全庫存' },


  ];
  assetCodeOptions: any[] = [
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
  propertytype
    : any[] = [
      { value: 1, label: '資產' },
      { value: 2, label: '列管品' },
    ];
  Itemnumber
    : any[] = [

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
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private bigCategoryService: BigCategoryService,
    private midCategoryService: MidCategoryService,
    private smallCategoryService: SmallCategoryService,
    private organizationNumberService: OrganizationNumberService,
    private floorService: FloorService,
    private locationCodeService: LocationCodeService
  ) {
    super(); // 呼叫父類建構子
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
      this.router.navigate(['ASS2000/ASS21030CRU'], extras);
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
      this.router.navigate(['/demoCRU'], extras);
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
    this.router.navigate(['/demoCRU'], extras);
  }
  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }
}
