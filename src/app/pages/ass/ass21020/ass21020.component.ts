
import { Component, OnInit, computed, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS21020Service } from '@service/api/ass/ass21020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-ass21020',
  templateUrl: './ass21020.component.html',
  styleUrl: './ass21020.component.scss',
  standalone: true,
  imports: [
    PanelModule,
    AccordionModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    MultiSelectComponent,
    MenubarComponent,
    ButtonComponent,
    TableComponent,
  ],
})
export class ASS21020Component extends BasicQueryPageComponent<unknown> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    eng_type: new FormControl<string[] | undefined>(void 0),
    eng_meterNo: new FormControl<string | undefined>(void 0),
    location_no: new FormControl<string | undefined>(void 0),
    tlt_no: new FormControl<string | undefined>(void 0),
    eng_rate: new FormControl<number | undefined>(0),
    department_name: new FormControl<string | undefined>(void 0),
    business_area: new FormControl<string | undefined>(void 0),
    business_area_ratio: new FormControl<number | undefined>(void 0),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  private readonly meterNoSignal = toSignal(this.qf().eng_meterNo.valueChanges);
  private readonly tltNoSignal = toSignal(this.qf().tlt_no.valueChanges);

  public readonly meterNoEffect = effect(() => {
    const meterNo = this.meterNoSignal();
    if (!meterNo) return void this.qf().location_no.patchValue(void 0);
    this.service.queryByMeterNo(meterNo);
  }, { allowSignalWrites: !0 });

  public readonly tltNoEffect = effect(() => {
    const tltNo = this.tltNoSignal();
    if (!tltNo) return;
    this.service.queryByTltNo(tltNo);
  });

  public readonly columns: Column[] = [
    { field: 'energyType', header: '能源類型' },
    { field: 'slotNumber', header: '錢號' },
    { field: 'deviceLocationCode', header: '設備位置編號' },
    { field: 'remarks', header: '備註' },
  ];

  constructor(
    public service: ASS21020Service,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('ASS21020', '/ASS/ASS21020CRU', this.queryForm, this.onSubmit.bind(this));

    this.service.loadEngType();
    this.service.loadLocationNo();
    this.service.loadASS21020({});

    // this.ProgNo = '320002';
    // Initialize dropdown options
    // this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // this.organizationNumberService.getOrganizationNumbers()
    //   .subscribe((data) => (this.Departmentcode = data));
    // this.floorService.getFloors()
    //   .subscribe((data) => (this.floor = data));
    // this.locationCodeService.getSystemTypes()
    //   .subscribe((data) => (this.location = data));
  }
  // // Table data
  // Energytype: any[] = [{ value: 1, label: '水費' },
  // { value: 2, label: '電費' },
  // { value: 3, label: '瓦斯費' },];
  // data: any[] = [];
  // equipmentLocationOptions: any[] = [
  //   { value: 1, label: '010A000001' },
  //   { value: 2, label: '010A000002' },
  //   { value: 3, label: '010A000003' },
  //   { value: 4, label: '010A000004' },
  //   { value: 5, label: '010B000001' },
  //   { value: 6, label: '010B000002' },
  //   { value: 7, label: '010B000003' },
  // ];
  // ironNumberOptions: any[] = [
  //   { value: 1, label: 'EB101' },
  //   { value: 2, label: 'EB103' },
  //   { value: 3, label: 'EB105' },
  //   { value: 4, label: 'EB107' },
  //   { value: 5, label: 'EB109' },
  //   { value: 6, label: 'EB110' },
  //   { value: 7, label: 'EB111' },
  // ];
  // location: any[] = [];
  // filteredData: any[] = [...this.data];
  // columns: any[] = [
  //   { field: 'energyType', header: '能源類型', visible: true },
  //   { field: 'slotNumber', header: '錢號', visible: true },
  //   { field: 'deviceLocationCode', header: '設備位置編號', visible: true },
  //   { field: 'remarks', header: '備註', visible: true },
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

  public onSubmitQuery(): void {
    this.onSubmit(this.queryForm);
  }

  public onSubmit(frm: FormGroup): void {
    console.log(frm.value);
  }

  public onClear(): void {

  }

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
  // onClearForm() {
  //   this.queryForm.reset(); // 重置表單
  // }
}
