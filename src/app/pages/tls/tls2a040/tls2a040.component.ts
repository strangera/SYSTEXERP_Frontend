import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Column } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { DropdownModule } from 'primeng/dropdown';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ECRNoService } from '@service/basic/ECRNo.service';
import { WhetherService } from '@service/basic/whether.service';
import { DisplayService } from '@service/basic/display.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { HttpClient } from '@angular/common/http';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { yesterday } from '@shared/models/system/query-form.model';
import { Tls2a040Service } from '@service/api/tls/tls2a040.service';
import { createPaginationConfig } from 'src/app/shared/componentkit/table/table.model';

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
    ECR_No: [null],                // 收銀機號
    TXN_No: [null],                // 交易序號
    TXN_Date_Start: [yesterday, Validators.required],
    TXN_Date_End: [yesterday, Validators.required],
    TXN_PayAmt_Start: [null],         // 金額範圍起
    TXN_PayAmt_End: [null],           // 金額範圍迄
    check_statusList: [[]],                  // 狀況
    CRD_No: [null],     // 信用卡卡號
    Floor_No: [null],              // 樓層
    Building_No: [null],           // 館別
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),

  });

  data: any[] = [];
  totalRecords = 0;
  listZeroDifferenceOptions: any[] = [];
  columns: Column[] = [
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'TXN_No', header: '交易序號' },
    { field: 'TXN_Date', header: '銷售日期' },
    { field: 'tlt_name', header: '專櫃名稱' },
    { field: 'TXN_PayAmt', header: '金額' },
    { field: 'check_status', header: '狀況' },
    { field: 'CRD_No', header: '信用卡卡號' },
    { field: 'Floor_No', header: '樓層' },
    { field: 'Building_No', header: '館別' },
    { field: 'check_remark', header: '備註' }
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
    private dropDownListService: DropDownListService,
    private http: HttpClient,
    private tls2a040Service: Tls2a040Service
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

    // 館別
    this.dropDownListService.querySYS3800_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.buildingNoOptions = res.Data.map(x => ({
          label: x.Name,
          value: x.No,
          Name: x.Name,
          No: x.No
        }));
      });
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      this.loading = true;

      this.tls2a040Service.queryTLS2A040(form.value).subscribe({
        next: (res) => {
          this.data = res.Data ?? [];
          this.totalRecords = res.TotalCount ?? this.data.length;
          this.loading = false;

          // 儲存查詢條件
          this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
        },
        error: (err) => {
          console.error('TLS2A040 查詢失敗', err);
          this.messageService.errorBubble('查詢失敗，請稍後再試');
          this.loading = false;
        }
      });
    });
  }
}
