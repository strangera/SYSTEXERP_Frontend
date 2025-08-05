import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column } from '../../../shared/componentkit/table/table.model';
import { TLS26020Data, TLS26020QueryRequest, TLS26020Service } from '../../../service/api/tls/tls26020.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from "../../../shared/componentkit/multi-select/multi-select.component";
import { Tls11010Service } from '@service/api/tls/tls11010.service';
import { FloorService } from '@service/basic/floor.service';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { Tls51080Service } from '@service/api/tls/tls51080.service';
import { apiOption } from '@shared/models/sys/sysb000.module';

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
    InputTextRangeComponent,
    CalendarRangeComponent,
    MultiSelectComponent,
    InputTextComponent
  ]
})
export class TLS26020Component extends BasicQueryPageComponent<TLS26020Data> implements OnInit {
  queryForm = this.formBuilder.group({
    Sale_DateStart: ['', Validators.required],        // 銷售日期(起)
    Sale_DateEnd: ['', Validators.required],          // 銷售日期(訖)
    tlt_building: [[],],          // 館別
    Org_Name: [[], '',],              // 組織名稱
    tlt_floor: [[],],             // 樓層
    ...createPaginationConfig([{ field: 'id', order: 1 }])
  });

  totalRecords = 0;
  data: TLS26020Data[] = [];
  selectedItems: TLS26020Data[] = [];

  columns: Column[] = [
    { field: 'tlt_building', header: '館別', visible: false },
    { field: 'Building_desc', header: '館別', visible: true },
    { field: 'Org_Name', header: '組織名稱', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'location_no', header: '位置編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'sad_preorder_money', header: '預售金額', visible: true, format: (value: number) => value.toLocaleString() },
    { field: 'sad_sale_amt', header: '銷售金額', visible: true, format: (value: number) => value.toLocaleString() },
    { field: 'sad_preorder_amt', header: '預售累積', visible: true, format: (value: number) => value.toLocaleString() }
  ];

  floorOptions: any[] = [];

  buildingOptions: any[] = [];

  orgOptions: any[] = [];

  constructor(
    private tls26020Service: TLS26020Service,
    private tls11010Service: Tls11010Service,
    private floorService: FloorService,
    private tls51080Service: Tls51080Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26020', 'tls/tls26020', this.queryForm, (form) => this.onSubmit(form));
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

}