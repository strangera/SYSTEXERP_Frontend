import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { Column, ColumnGroup } from 'src/app/shared/componentkit/table/table.model';
import { ButtonModule } from 'primeng/button';
import { NgClass } from '@angular/common';
import { MultiSelectComponent } from "@shared/componentkit/multi-select/multi-select.component";
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';


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
    ButtonModule,
    NgClass,
    MultiSelectComponent
  ],
})
export class TLS22050Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    POS_TypeList: [['']],
    VOU_CheckList: [null],
    salesDate: [null as Date | null, { disabled: true }],
    TXN_DateStart: [null as Date | null],
    TXN_DateEnd: [null as Date | null],
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
  exportExcelLoading = false;

  statusOptions = [
    { label: '一般', value: '' },
    { label: '停管', value: 'PKNG' },
    { label: '會員APP', value: 'APP' },
  ];
  VOU_Check_Options = [
    { label: '連線', value: "1" },
    { label: '離線', value: "2" },
    { label: '大宗兌回', value: "3" },
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
      format: formatAmount,
    },
    {
      field: 'ACT_PayAmt',
      header: '實收金額',
      visible: true,
      groupField: 'TOTAL',
      isTotal: true,
      format: formatAmount,
    },
    {
      field: 'OVER_PayAmt',
      header: '帳差',
      visible: true,
      groupField: 'TOTAL',
      isTotal: true,
      format: formatAmount,
    },
  ];

  columnGroup: ColumnGroup[] = [
    { field: 'TOTAL', header: '金額資訊' },
  ];

  constructor(
    private tls22050Service: Tls22050Service,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS22050', '/TLS/TLS22050cru', this.queryForm, (form) =>
      this.onSubmit(form)
    );
    this.queryForm.get('salesDate')?.valueChanges.subscribe((val) => {
      if (val instanceof Date) {
        const year = val.getFullYear();
        const month = val.getMonth();
        this.salesMinDate = new Date(year, month, 1);
        this.salesMaxDate = new Date(year, month + 1, 0);

        this.queryForm.patchValue({
          TXN_DateStart: this.salesMinDate,
          TXN_DateEnd: this.salesMaxDate,
        });
        setTimeout(() => {
          this.queryForm.patchValue({
            TXN_DateStart: this.salesMinDate,
            TXN_DateEnd: this.salesMaxDate,
          });
        });
      }
    });
    this.queryForm.patchValue({ salesDate: new Date() });
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const raw = form.getRawValue();
      console.log(raw.TXN_DateStart?.toISOString().split('T'));
      const payload = {
        ...raw,
        TXN_DateStart: raw.TXN_DateStart
          ? `${raw.TXN_DateStart.getFullYear()}-${(raw.TXN_DateStart.getMonth() + 1).toString().padStart(2, '0')}-${raw.TXN_DateStart.getDate().toString().padStart(2, '0')}`
          : null,
        TXN_DateEnd: raw.TXN_DateEnd
          ? `${raw.TXN_DateEnd.getFullYear()}-${(raw.TXN_DateEnd.getMonth() + 1).toString().padStart(2, '0')}-${raw.TXN_DateEnd.getDate().toString().padStart(2, '0')}`
          : null,
      };

      this.tls22050Service.queryTLS22050(payload).subscribe({
        next: (res) => {
          this.data = (res.Data ?? []).flatMap((group: any) =>
            (group._DetailList ?? []).map((detail: any) => ({ PAY_Name: group.PAY_Name, ...detail }))
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

  exportReport = () => {
    const raw = this.queryForm.getRawValue();

    const payload = {
      FileName: "string",
      ReportTitle: "string",
      queryTLS22050Request: {
        ...raw,
        TXN_DateStart: raw.TXN_DateStart
          ? `${raw.TXN_DateStart.getFullYear()}-${(raw.TXN_DateStart.getMonth() + 1).toString().padStart(2, '0')}-${raw.TXN_DateStart.getDate().toString().padStart(2, '0')}`
          : null,
        TXN_DateEnd: raw.TXN_DateEnd
          ? `${raw.TXN_DateEnd.getFullYear()}-${(raw.TXN_DateEnd.getMonth() + 1).toString().padStart(2, '0')}-${raw.TXN_DateEnd.getDate().toString().padStart(2, '0')}`
          : null,
      },
    }

    this.exportExcelLoading = true;
    this.tls22050Service.exportTLS22050(payload).subscribe({
      next: (res: Blob) => {
        const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${payload.FileName}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        this.exportExcelLoading = false;
      },
      error: (err) => {
        console.error('TLS22050 匯出失敗', err);
        this.exportExcelLoading = false;
      },
    });
  };
}

function formatAmount(value: number): string {
  if (isNaN(value)) return '';
  const isInteger = Number.isInteger(value);
  return value.toLocaleString('en-US', {
    minimumFractionDigits: isInteger ? 0 : 2,
    maximumFractionDigits: 2,
  });
}
