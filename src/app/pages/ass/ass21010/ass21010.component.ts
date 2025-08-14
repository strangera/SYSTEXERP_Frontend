
import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationExtras } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ASS21010Service } from '@service/api/ass/ass21010.service';
import { FloorService } from '@service/basic/floor.service';
import { OrganizationNumberService } from '@service/basic/organization-number.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { DropdownOption } from '@shared/models/api/base-api.interface';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-ass21010',
  templateUrl: './ass21010.component.html',
  styleUrl: './ass21010.component.scss',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    ButtonComponent,
    InputTextComponent,
    DropdownComponent,
    MultiSelectComponent,
    TableComponent,
  ],
})
export class ASS21010Component extends BasicQueryPageComponent<unknown> implements OnInit {
  public queryForm = new FormGroup({
    type: new FormControl<string[]>([]),
    meterNo: new FormControl<string[]>([]),
    locationNo: new FormControl<string[]>([]),
    remark: new FormControl<string>(''),
    // bigCategoryCode: new FormControl([]),
    // midCategoryCode: new FormControl([]),
    // smallCategoryCode: new FormControl([]),
    // Querybystatus: new FormControl([]),
    // propertynumber: new FormControl([]),
    // propertytype: new FormControl([]),
    // Itemnumber: new FormControl([]),
    // Sdate: new FormControl([]),
    // Edate: new FormControl([]),
    // Departmentcode: new FormControl([]),
    // Kurabe: new FormControl([]),
    // code: new FormControl([]),
    // floor: new FormControl([]),
    // location: new FormControl([]),
    // illustrate: new FormControl([]),
    // Placementinstructions: new FormControl([]),
  });

  public readonly df = computed(() => this.queryForm.controls);

  private readonly dfChanges = toSignal(this.queryForm.valueChanges);

  public readonly queryEffect = effect(() => {
    const data = this.dfChanges();
    console.log(`Query form changes:`, [data]);
  });

  public readonly columns: Column[] = [
    { field: 'eng_type', header: '能源類型' },
    { field: 'eng_meterNo', header: '錶號' },
    { field: 'location_no', header: '設備位置編號' },
    { field: 'eng_remark', header: '備註' },
  ];


  // // Table data
  // data: any[] = [];
  // location: any[] = [];
  // filteredData: any[] = [...this.data];
  // columns: any[] = [
  //   { field: 'slotLocationCode', header: '錢號位置編號', visible: true },
  //   { field: 'floor', header: '樓層', visible: true },
  //   { field: 'zone', header: '區域', visible: true },
  //   { field: 'xCoordinate', header: '平面圖X座標', visible: true },
  //   { field: 'yCoordinate', header: '平面圖Y座標', visible: true },
  //   { field: 'remarks', header: '說明', visible: true },
  // ];





  // // Dropdown options
  // floor: any[] = [];
  // Kurabe: any[] = [
  //   { value: 1, label: '001' },
  //   { value: 2, label: '002' },
  // ];
  // Departmentcode: any[] = [];
  // usercode: any[] = [];
  // bigCategoryOptions: any[] = [
  //   { value: 1, label: '裝潢工程' },
  //   { value: 2, label: '其他工程' },
  //   { value: 3, label: '電腦及電子零件產品' },
  //   { value: 4, label: '電力及照明系統' },
  //   { value: 5, label: '家電家俱設備' },
  //   { value: 6, label: '機消空電水零配件' },
  //   { value: 7, label: '辦公及營運庶務' },
  //   { value: 8, label: '印刷品(非廣告行銷)' },
  //   { value: 9, label: '印刷品(廣告行銷)' },
  //   { value: 10, label: '衛生及醫療庶務用品' },
  // ];
  // midCategoryOptions: any[] = [
  //   { value: 1, label: '室內裝潢工程' },
  //   { value: 2, label: '室內裝潢備品' },
  //   { value: 3, label: '弱電系統' },
  //   { value: 4, label: '房屋及建築設備' },
  //   { value: 5, label: '停車場設備' },
  //   { value: 6, label: '其他工程' },
  //   { value: 7, label: '機電消防工程' },
  //   { value: 8, label: '電子產品及零件' },
  //   { value: 9, label: '電子儀器設備' },
  //   { value: 10, label: '電子儀器設備-資產' },
  // ];
  // smallCategoryOptions: any[] = [
  //   { value: 1, label: '機電空調工程' },
  //   { value: 2, label: '水電消防工程' },
  //   { value: 3, label: '排油煙工程' },
  //   { value: 4, label: '商場高壓電節能工程' },
  //   { value: 5, label: '商場弱電系統工程' },
  //   { value: 6, label: '網路佈線工程' },
  //   { value: 7, label: '鐵路自動測試儀' },
  //   { value: 8, label: '風車零件' },
  //   { value: 9, label: '資收場回收用品' },
  //   { value: 10, label: '瓦斯鍋及滅斷設備工程' },
  // ];
  // Querybystatus: any[] = [
  //   { value: 1, label: '全部' },
  //   { value: 2, label: '只顯示低於安全庫存' },


  // ];
  // assetCodeOptions: any[] = [
  //   { value: 1, label: '1A232300000010000001' },
  //   { value: 2, label: '1A232300000020000001' },
  //   { value: 3, label: '1A232300000040000001' },
  //   { value: 4, label: '1A232300000050000001' },
  //   { value: 5, label: '1A232300000060000001' },
  //   { value: 6, label: '1A232300000090000001' },
  //   { value: 7, label: '1A232400000010000001' },
  //   { value: 8, label: '1A232400000040000001' },
  //   { value: 9, label: '1A232400000060000001' },
  // ];
  // propertytype
  //   : any[] = [
  //     { value: 1, label: '資產' },
  //     { value: 2, label: '列管品' },
  //   ];
  // Itemnumber
  //   : any[] = [

  //     { value: 1, label: '3A24210000001' },
  //     { value: 2, label: '3A24210000002' },
  //     { value: 3, label: '3A24210000003' },
  //     { value: 4, label: '3A24210000004' },
  //     { value: 5, label: '3A24210000005' },
  //     { value: 6, label: '3A24210000006' },
  //     { value: 7, label: '3A24210000007' },
  //     { value: 8, label: '3A24210000008' },
  //     { value: 9, label: '3A24210000009' },
  //     { value: 10, label: '3A24210000010' },
  //   ];



  constructor(
    public readonly service: ASS21010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS21010', '/ASS/ASS21010CRU', this.queryForm, this.onSubmit.bind(this));

    this.service.loadEngType();
    this.service.loadEngMeterNo();
    this.service.loadLocationNo();
    this.service.loadASS21010({});



    // // Initialize dropdown options
    // this.organizationNumberService.getOrganizationNumbers()
    //   .subscribe((data) => (this.Departmentcode = data));
    // this.floorService.getFloors()
    //   .subscribe((data) => (this.floor = data));
    // // this.locationCodeService.getSystemTypes()
    // //   .subscribe((data) => (this.location = data));
  }

  public canQuery(): boolean {
    return !0;
  }

  public canAdd(): boolean {
    return !0;
  }

  public canEdit(): boolean {
    return !0;
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    // this.submitted = true;
    // this.loading = true;
    // this.notificationService.blockUi();

    // if (frm.valid && this.canQuery()) {
    //   // Submit logic here
    // }

    // this.loading = false;
    // this.notificationService.unblockUi();
  }

  onSubmitQuery() {
    this.onSubmit(this.queryForm);
  }

  onClear() {
    this.queryForm.reset(); // 重置表單
  }
}
