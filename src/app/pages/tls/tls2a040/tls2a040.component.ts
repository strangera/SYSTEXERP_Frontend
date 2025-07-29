import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Column } from '@shared/componentkit/table/table.model';
import { ButtonComponent, CalendarRangeQuickComponent, DropdownComponent, InputNumberComponent, InputNumberRangeComponent, MenubarComponent, MultiSelectComponent, TableComponent } from '@shared/index';
// import { TLS2A010Service } from '@services/api/tls/tls2a010.service';
import { AccordionModule } from 'primeng/accordion';
import { DropdownModule } from 'primeng/dropdown';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ECRNoService } from '@service/basic/ECRNo.service';
import { WhetherService } from '@service/basic/whether.service';
import { DisplayService } from '@service/basic/display.service';
// import { Tls22030Service } from '@service/api/tls/tls22030.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { HttpClient } from '@angular/common/http';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-tls22030',
  templateUrl: './tls2a040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    DropdownModule,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    DropdownComponent,
    InputNumberComponent,
    CalendarRangeQuickComponent,
    InputNumberRangeComponent
  ],

})
export class TLS2A040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    ECR_No: [null],
    TXN_No: [null],
    TXN_DateStart: [null, Validators.required],
    TXN_DateEnd: [null, Validators.required],
    casherFrom: [null],
    casherTo: [null],
    status: [[]],
    SYS_DisplayCredit: [null],
    FLOOR_NO: [null],
    building_no: [null],
  });
  data: any[] = [];
  totalRecords = 0;
  listZeroDifferenceOptions: any[] = [];
  columns: Column[] = [
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'TXN_No', header: '交易序號' },
    { field: 'TXN_Date', header: '銷售日期' },
    { field: 'TXN_Amt', header: '金額' },
    { field: 'status', header: '狀況' },
    { field: 'SYS_DisplayCredit', header: '信用卡卡號' },
    { field: 'FLOOR_NO', header: '樓層' },
    { field: 'building_no', header: '館別' },
  ];


  // 下拉選單資料
  ECRNoOptions: any[] = [];
  statusOptions = [
    { label: '信用卡缺單', value: '2' },
    { label: '信用卡未簽名', value: '3' },
    { label: '其他異常', value: '4' },
    { label: '遺失券', value: '5' },
    { label: '發票未繳回', value: '6' }
  ];
  floorOptions: any[] = [];
  buildingNoOptions: IDropdownItem[] = [];


  constructor(
    private locationOptionsService: LocationOptionsService,
    private ECRNoService: ECRNoService,
    private whetherService: WhetherService,
    private displayService: DisplayService,
    // private tls2a040Service: Tls2a040Service,
    private dropDownListService: DropDownListService,
    // private service: Tls2a040Service,
    private http: HttpClient,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2A040', '/TLS/TLS2A040cru', this.queryForm, (form) => this.onSubmit(form));
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.whetherService.getWhetherOptions().subscribe((data) => {
      this.listZeroDifferenceOptions = data;
    });
    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = data;
    });
    this.locationOptionsService.getFloorOptions().subscribe({
      next: (res) => {
        this.floorOptions = res.map((item: any) => ({
          label: item.name || item.FLOOR_NAME || item.label,
          value: item.code || item.FLOOR_NO || item.value
        }));
      },
      error: () => this.messageService.errorBubble('載入樓層選單失敗')
    });
    //館別
    this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.buildingNoOptions = res.Data.map(x => ({ label: x.Name, value: x.No, Name: x.Name, No: x.No }));
    });

  }



  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      // this.tls2a040Service.queryTLS2a040(form.value).subscribe({
      //   next: (res) => {
      //     this.data = res.Data ?? [];
      //     this.totalRecords = res.TotalCount;
      //     this.loading = false;
      //     this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
      //   },
      //   error: (err) => {
      //     console.error('TLS22030 查詢失敗', err);
      //     this.loading = false;
      //   }
      // });

    });
  }
}


