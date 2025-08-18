import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize, Observable } from 'rxjs';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column } from '../../../shared/componentkit/table/table.model';
import { TLS26020Data, TLS26020Service } from '../../../service/api/tls/tls26020.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from "../../../shared/componentkit/multi-select/multi-select.component";
import { Tls11010Service } from '@service/api/tls/tls11010.service';
import { FloorService } from '@service/basic/floor.service';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { Tls51080Service } from '@service/api/tls/tls51080.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-tls26020',
  templateUrl: './tls26020.component.html',
  styleUrl: './tls26020.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TableComponent,
    TranslateModule,
    CalendarRangeComponent,
    MultiSelectComponent,
    InputTextComponent
  ]
})
export class TLS26020Component extends BasicQueryPageComponent<TLS26020Data> implements OnInit {
  readonly enddate: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  readonly startdate: Date = (() => {
    const d = new Date(this.enddate);
    d.setMonth(d.getMonth() - 1);
    return d;
  })();

  queryForm = this.formBuilder.group({
    Sale_DateStart: [this.startdate, Validators.required],
    Sale_DateEnd: [this.enddate, Validators.required],
    tlt_building: [[]],
    Org_ID: [[]],
    Org_Name: [''],
    tlt_floor: [[]],
    ...createPaginationConfig([{ field: 'tlt_no', order: 1 }]) // 修正排序欄位
  });

  totalRecords = 0;
  data: TLS26020Data[] = [];
  selectedItems: TLS26020Data[] = [];

  // 修正 columns 根據實際 API 回應
  columns: Column[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
    { field: 'txn_TotGUI', header: '發票金額', visible: true, format: (value: number) => value.toLocaleString(), isTotal: true },
    { field: 'txn_TotSaleAmt', header: '業績金額', visible: true, format: (value: number) => value.toLocaleString(), isTotal: true }
  ];

  // 展開詳細資料的欄位定義
  expansionColumns: Column[] = [
    { field: 'TXN_DATE', header: '交易日期', visible: true, format: (value: any) => value ? this.datePipe.transform(value, 'yyyy/MM/dd') : '' },
    { field: 'ECR_NO', header: '機號', visible: true },
    { field: 'TXN_NO', header: '交易序號', visible: true },
    { field: 'TXN_GUIBegNo_Pre', header: '字軌', visible: true },
    { field: 'TXN_GUIBegNo', header: '發票起始號碼', visible: true },
    { field: 'TXN_GUIEndNo', header: '發票結束號碼', visible: true },
    { field: 'TXN_TotGUI', header: '發票金額', visible: true, format: (value: number) => value.toLocaleString() },
    { field: 'TXN_TotSaleAmt', header: '業績金額', visible: true, format: (value: number) => value.toLocaleString() }
  ];

  // 下拉選單選項
  floorOptions: any[] = [];
  buildingOptions: any[] = [];
  orgOptions: any[] = [];

  constructor(
    private tls26020Service: TLS26020Service,
    private tls11010Service: Tls11010Service,
    private floorService: FloorService,
    private tls51080Service: Tls51080Service,
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26020', 'tls/tls26020cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls26020Service.queryTLS26020(frm.value)
        .pipe(finalize(() => this.loading = false))
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
  }

  loadDetails = (rowData: TLS26020Data): Observable<any> => {
    return this.tls26020Service.queryTLS26020Detail({
      tlt_no: rowData.tlt_no,
      Sale_DateStart: this.datePipe.transform(this.queryForm.controls.Sale_DateStart.value, 'yyyy-MM-dd') ?? '',
      Sale_DateEnd: this.datePipe.transform(this.queryForm.controls.Sale_DateEnd.value, 'yyyy-MM-dd') ?? ''
    })
  };
}
