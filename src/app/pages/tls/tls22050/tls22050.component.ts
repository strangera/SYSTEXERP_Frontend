import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { Tls22050Service } from '../../../service/api/tls/tls22050.service';
import { Column, ColumnGroup, createPaginationConfig } from 'src/app/shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls22050',
  templateUrl: './tls22050.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    CalendarRangeComponent,
    DropdownModule,
    ButtonComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class TLS22050Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    status1: ['all'],
    status2: ['ALL'],
    salesDate: [new Date()],
    startdate: [new Date()],
    enddate: [new Date()],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });

  data: any[] = [];
  filteredData: any[] = [];
  totalRecords = 0;

  salesMinDate: Date | null = null;
  salesMaxDate: Date | null = null;

  bookPayCntSum = 0;
  actPayAmtSum = 0;
  overPayAmtSum = 0;
  isTotal = true;
  statusOptions = [
    { label: '全部', value: 'all' },
    { label: '一般', value: 'ordinary' },
    { label: '停管', value: 'stop' },
  ];
  status2Options = [
    { label: '全部', value: 'ALL' },
    { label: '連線', value: 'Y' },
    { label: '離線', value: 'N' },
  ];

  columns: Column[] = [
    { field: 'PAY_Name', header: '支付工具', visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    {
      field: 'BOOK_PayAmt',
      header: '系統金額',
      visible: true,
      groupField: 'TOTAL',
      isTotal: true,
      fractionDigits: 2,
    },
    {
      field: 'ACT_PayAmt',
      header: '實收金額',
      visible: true,
      groupField: 'TOTAL',
      isTotal: true,
      fractionDigits: 2,
    },
    {
      field: 'OVER_PayAmt',
      header: '帳差',
      visible: true,
      groupField: 'TOTAL',
      isTotal: true,
      fractionDigits: 2,
    },
  ];


  columnGroup: ColumnGroup[] = [
    { field: 'TOTAL', header: '金額資訊' },
  ];

  constructor(private tls22050Service: Tls22050Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS22050', '/TLS/TLS22050cru', this.queryForm, (form) =>
      this.onSubmit(form)
    );

    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.queryForm.get('salesDate')?.valueChanges.subscribe((val) => {
      if (val) {
        const selected = new Date(val);
        const year = selected.getFullYear();
        const month = selected.getMonth();

        this.salesMinDate = new Date(year, month, 1);
        this.salesMaxDate = new Date(year, month + 1, 0);

        this.queryForm.patchValue({
          startdate: this.salesMinDate,
          enddate: this.salesMaxDate,
        });
      }
    });
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const raw = form.getRawValue();

      const payload = {
        request: {
          PageSize: raw.PageSize,
          PageIndex: raw.PageIndex,
          OrderBy: raw.OrderBy,
          Offset: raw.Offset,
          SortBy: raw.SortBy,
          TXN_DateStart:
            raw.startdate instanceof Date
              ? raw.startdate.toISOString().split('T')[0]
              : null,
          TXN_DateEnd:
            raw.enddate instanceof Date
              ? raw.enddate.toISOString().split('T')[0]
              : null,
          POS_TypeList: raw.status1 !== 'all' ? [raw.status1] : [],
          VOU_CheckList: raw.status2 !== 'ALL' ? [raw.status2] : [],
        },
      };

      this.tls22050Service.queryTLS22050(payload).subscribe({
        next: (res) => {
          this.data = (res.Data ?? []).flatMap((group: { PAY_Name: string; _DetailList: any[] }) =>
            (group._DetailList ?? []).map((detail) => ({
              PAY_Name: group.PAY_Name,
              ...detail,
            }))
          );

          this.filteredData = [...this.data];
          this.totalRecords = res.TotalCount ?? this.data.length;
          this.loading = false;
          this.bookPayCntSum = this.data.reduce((sum, cur) => sum + Number(cur.BOOK_PayAmt || 0), 0);
          this.actPayAmtSum = this.data.reduce((sum, cur) => sum + Number(cur.ACT_PayAmt || 0), 0);
          this.overPayAmtSum = this.data.reduce((sum, cur) => sum + Number(cur.OVER_PayAmt || 0), 0);

        },
        error: (err) => {
          console.error('TLS22050 查詢失敗', err);
          this.loading = false;
        },
      });
    });
  }

}
