
import { Component, computed, effect, OnInit, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS21010Service, EngType } from '@service/api/ass/ass21010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ASS2100ENGMeterType } from './ass21010.model';

@Component({
  selector: 'app-ass21010',
  templateUrl: './ass21010.component.html',
  styleUrl: './ass21010.component.scss',
  standalone: !0,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    ButtonComponent,
    InputTextComponent,
    MultiSelectComponent,
    TableComponent,
  ],
})
export class ASS21010Component extends BasicQueryPageComponent<unknown> implements OnInit {

  public queryForm = this.formBuilder.group({
    ENG_Type: new FormControl<EngType[] | undefined>(void 0),
    ENG_MeterNo: new FormControl<string[] | undefined>(void 0),
    Location_No: new FormControl<string[] | undefined>(void 0),
    ENG_Remark: new FormControl<string | undefined>(void 0),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  // 變化追蹤
  private readonly qfSignal = toSignal(this.queryForm.valueChanges);
  private readonly engTypeSignal = toSignal(this.qf().ENG_Type.valueChanges);
  private readonly engMeterSignal = toSignal(this.qf().ENG_MeterNo.valueChanges);
  private readonly locationSignal = toSignal(this.qf().Location_No.valueChanges);
  private readonly engRemarkSignal = toSignal(this.qf().ENG_Remark.valueChanges);

  public readonly tableData = signal<ASS2100ENGMeterType[]>([]);

  public readonly qfEffect = effect(() => {
    console.log(`qfEffect:`, [this.qfSignal()]);
  });

  public readonly tableEffect = effect(() => {
    const types = this.engTypeSignal() || [];
    const meters = this.engMeterSignal() || [];
    const locs = this.locationSignal() || [];
    console.log(`tableEffect:`, [types, meters, locs]);
    if (!0) return;

    this.tableData.set(this.service.engMeterNoSignal().filter(item => {
      const matchesType = !types?.length || types.includes(item.ENG_Type);
      const matchesMeter = !meters?.length || meters.includes(item.ENG_MeterNo);
      const matchesLocation = !locs?.length || locs.includes(item.Location_No);
      return matchesType && matchesMeter && matchesLocation;
    }));
  }, { allowSignalWrites: !0 });

  public readonly tableInitEffect = effect(() => {
    const data = this.service.engMeterNoSignal();
    if (!data?.length) return;
    this.tableData.set(data);
    this.tableInitEffect.destroy();
  }, { allowSignalWrites: !0 });

  public readonly columns: Column[] = [
    { field: 'ENG_Type', header: '能源類型' },
    { field: 'ENG_MeterNo', header: '錶號' },
    { field: 'Location_No', header: '設備位置編號' },
    { field: 'ENG_Remark', header: '備註' },
  ];

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

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const types = this.engTypeSignal() || [];
      const meters = this.engMeterSignal() || [];
      const locs = this.locationSignal() || [];

      this.tableData.set(this.service.engMeterNoSignal().filter(item => {
        const matchesType = !types?.length || types.includes(item.ENG_Type);
        const matchesMeter = !meters?.length || meters.includes(item.ENG_MeterNo);
        const matchesLocation = !locs?.length || locs.includes(item.Location_No);
        return matchesType && matchesMeter && matchesLocation;
      }));

      console.log(`onSubmit:`, [types, meters, locs, this.tableData]);
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
      this.loading = !1;
    });
  }

  public override onCreate(data?: unknown): void {
    this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
    super.onCreate(data);
  };

  onClear() {
    this.queryForm.reset();
  }


  // // Table data
  // data: any[] = [];
  // location: any[] = [];
  // filteredData: any[] = [...this.data];
  // columns: any[] = [
  //   { field: 'slotLocationCode', header: '錶號位置編號', visible: true },
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
}
