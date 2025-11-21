import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { yesterday } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { TLS2A020Service } from '../../../service/api/tls/tls2a020.service';
import { ECRNoService } from '../../../service/basic/queryPOS1002.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatAmount } from '../../../shared/componentkit/table/table.model';

@Component({
  templateUrl: './tls2a020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    MultiSelectComponent,
    DropdownComponent,
    RadiobuttonComponent,
    ButtonComponent,
    TableComponent,
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
    SortOrder: ['ECR'],
    ...createPaginationConfig([{ field: 'TXN_Date', order: 1 }]),
  });


  columns: Column[] = [];
  data: any[] = [];
  selectedItems: any[] = [];
  totalRecords = 0;
  floorOptions: any[] = [];
  ECRNoOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];

  constructor(
    private locationOptionsService: LocationOptionsService,
    private ecrNoService: ECRNoService,
    private tls2a020Service: TLS2A020Service
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS2A020', '/TLS/TLS2A020cru', this.queryForm, (form) => this.onSubmit(form));

    const defaultSortOrder = this.queryForm.get('SortOrder')?.value ?? 'ECR';
    this.updateColumnsAndSortBy(defaultSortOrder);

    this.queryForm.get('SortOrder')?.valueChanges.subscribe((value) => {
      if (value) {
        this.updateColumnsAndSortBy(value);
      }
    });


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

  updateColumnsAndSortBy(sortOrder: string): { sortBy: string } {
    this.updateColumns(sortOrder);
    const sortBy = sortOrder === 'ECR' ? 'ECR_No' : 'PAY_NAME';
    return { sortBy };
  }

  updateColumns(sortOrder: string): void {
    const baseColumns: Column[] = [
      // {
      //   field: 'TXN_Date',
      //   header: '銷售日期',
      //   visible: true,
      //   format: (v) => formatDate(v, 'yyyy/MM/dd', 'en-US')
      // },
      {
        field: 'BOOK_PayAmt',
        header: '系統金額',
        visible: true,
        format: formatAmount
      },
      {
        field: 'Actual_ReceivedAmt',
        header: '實收金額',
        visible: true,
        format: formatAmount
      }
    ];

    const ecrColumn: Column = { field: 'ECR_No', header: '收銀機號', visible: true };
    const payToolColumn: Column = { field: 'PAY_NAME', header: '支付工具', visible: true };

    // 根據排序條件決定顯示順序
    this.columns = sortOrder === 'ECR'
      ? [baseColumns[0], ecrColumn, payToolColumn, ...baseColumns.slice(1)]
      : [baseColumns[0], payToolColumn, ecrColumn, ...baseColumns.slice(1)];
  }


}
