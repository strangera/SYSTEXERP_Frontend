import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column, formatDate, formatAmount } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from "../../../shared/componentkit/multi-select/multi-select.component";
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TLS26030Data, TLS26030Service } from '@service/api/tls/tls26030.service';
import { Tls11010Service } from '@service/api/tls/tls11010.service';
import { FloorService } from '@service/basic/floor.service';
import { Tls51080Service } from '@service/api/tls/tls51080.service';
import { DatePipe } from '@angular/common';
import { untilDestroyed } from '@ngneat/until-destroy';
import { DropDownListService } from '@service/utility/dropDownList.service';

@Component({
  selector: 'app-tls26030',
  templateUrl: './tls26030.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    MultiSelectComponent,
    TableComponent,
    TranslateModule,
    InputTextComponent,
  ]
})
export class TLS26030Component extends BasicQueryPageComponent<TLS26030Data> implements OnInit {
  readonly enddate: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  readonly startdate: Date = (() => {
    const d = new Date();
    d.setMonth(0, 1); // 1月1號
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  queryForm = this.formBuilder.group({
    Sale_DateStart: [this.startdate, Validators.required],
    Sale_DateEnd: [this.enddate, Validators.required],
    tlt_building: [[]],                               // 館別
    Org_ID: [[]],                                     // 組織代號
    Org_Name: [''],                                   // 組織名稱
    tlt_floor: [[]],                                  // 樓層
    SYS_StoreNo: ['10'],                               // 新增：店號
    ECR_No: [[]],
    TLT_No: [[]],
    ...createPaginationConfig([{ field: 'TXN_Date', order: -1 }, { field: 'ECR_No', order: 1 }, { field: 'TXN_No', order: -1 }])
  });

  totalRecords = 0;
  data: TLS26030Data[] = [];
  selectedItems: TLS26030Data[] = [];

  columns: Column[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: formatDate },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
    { field: 'TXN_TotSaleAmt', header: '預售金額', visible: true, format: formatAmount, isTotal: true },
    { field: 'Recog_Amt', header: '認列金額', visible: true, format: formatAmount, isTotal: true },
    { field: 'Batch_No', header: '認列批號', visible: true },
    { field: 'Preorder_status', header: '預售狀態', visible: true },
    { field: 'CANCEL_Date', header: '作廢/退貨日期', visible: true, format: formatDate },
    { field: 'CANCEL_ECR_No', header: '作廢/退貨機號', visible: true },
    { field: 'CANCEL_TXN_No', header: '作廢/退貨序號', visible: true },
    { field: 'Close_Date', header: '結帳日期', visible: true, format: formatDate },
    { field: 'Close_Ecr_No', header: '結帳機號', visible: true },
    { field: 'Close_Txn_No', header: '結帳序號', visible: true },
    // 隱藏不需要顯示的欄位
    { field: 'ORG_ID', header: '組織代號', visible: false },
    { field: 'Org_Name', header: '組織名稱', visible: false }
  ];

  // 下拉選單選項
  floorOptions: any[] = [];
  buildingOptions: any[] = [];
  orgOptions: any[] = [];
  ecrOptions: any[] = [];
  tltOptions: any[] = [];

  constructor(
    private tls26030Service: TLS26030Service,
    private tls11010Service: Tls11010Service,
    private floorService: FloorService,
    private tls51080Service: Tls51080Service,
    private datePipe: DatePipe,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26030', 'tls/tls26030cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls26030Service.queryTLS26030(frm.value)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  loadOptions() {
    // 加載館別選項
    this.tls11010Service.getBuildingOptions().subscribe((data) => {
      this.buildingOptions = data;
    });

    // 加載樓層選項
    this.floorService.getFloors().subscribe((data) => {
      this.floorOptions = data;
    });

    // 組織代碼下拉
    this.tls51080Service
      .querySYS3100_DropDownList({})
      .subscribe((response) => {
        this.orgOptions = response.Data;
      });

    // 收銀機號下拉
    this.dropDownListService.queryPOS1002_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.ecrOptions = options.Data.map(item => ({
        label: item.Name,
        value: item.No
      }));
    });

    // 專櫃編號下拉
    this.dropDownListService.queryTLTTALENT_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.tltOptions = options.Data.map(item => ({
        label: `${item.No} - ${item.Name}`,
        value: item.No
      }));
    });
  }
}
