import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { yesterday } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { TLS2A020Service } from '../../../service/api/tls/tls2a020.service';
import { ECRNoService } from '../../../service/basic/queryPOS1002.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { createPaginationConfig, formatAmount } from '../../../shared/componentkit/table/table.model';
import { LocationOptionsService } from '../../../shared/services/dropdownservice/location-options.service';

@Component({
  templateUrl: './tls2a020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    DropdownComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    DropdownComponent
  ],
})

export class TLS2A020Component extends BasicQueryPageComponent<any> implements OnInit {
  // 表單
  queryForm = this.formBuilder.group({
    TXN_Date: [yesterday, [Validators.required]],
    tlt_floor: [''],
    ECR_No: [''],
    tlt_building: [''],
    ...createPaginationConfig([{ field: 'TXN_Date', order: 1 }]),
    pageSize: [1000],
  });

  columns: ReportColumn[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'PAY_Name', header: '未審核工具', visible: true },
    { field: 'BOOK_PayAmt', header: '系統金額', visible: true, format: formatAmount },
    { field: 'Actual_ReceivedAmt', header: '實收金額', visible: true, format: formatAmount },
  ];
  data: any[] = [];
  selectedItems: any[] = [];
  totalRecords = 0;
  historyRequestBody: any;
  floorOptions: any[] = [];
  ECRNoOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];

  constructor(
    private locationOptionsService: LocationOptionsService,
    private ecrNoService: ECRNoService,
    public tls2a020Service: TLS2A020Service
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS2A020', '/TLS/TLS2A020cru', this.queryForm, (form) => this.onSubmit(form));

    // 下拉選單資料載入
    this.ecrNoService.getECRNo().subscribe({
      next: (res) => this.ECRNoOptions = res,
      error: () => this.messageService.errorBubble('載入收銀機號失敗')
    });

    this.locationOptionsService.getBuildingOptions().subscribe({
      next: (res) => {
        this.BUILDING_NO_Options = res.map((item: any) => ({
          label: item.name || item.BUILDING_NAME || item.label,
          value: item.code || item.BUILDING_NO || item.value
        }));
      },
      error: () => this.messageService.errorBubble('載入館別選單失敗')
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
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const raw = form.value;

      const params = {
        ...raw,
        TXN_Date: formatDate(raw.TXN_Date, 'yyyy-MM-dd', 'en-US'),
      };

      // 設定最後查詢條件給 app-table-report 使用
      this.historyRequestBody = params;

      this.tls2a020Service.queryTLS2A020(params).subscribe({
        next: (res) => {
          this.data = res.Data ?? [];
          this.totalRecords = res.TotalCount ?? 0;
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err) => {
          console.error('TLS2A020 查詢失敗', err);
          this.loading = false;
          this.messageService.unblockUi();
          this.messageService.errorBubble('查詢失敗');
        }
      });
    });
  }
}
