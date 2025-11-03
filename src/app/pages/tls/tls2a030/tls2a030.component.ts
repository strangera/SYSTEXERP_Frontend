import { formatAmount } from 'src/app/shared/componentkit/table/table.model';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { TLS2A030Service } from '../../../service/api/tls/tls2a030.service';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { yesterday } from '@shared/models/system/query-form.model';
import { CustomFooterTableComponent } from '@shared/componentkit/custom-footer-table/customFooterTable.component';
import { ButtonModule } from 'primeng/button';

interface SalesRecord {
  PAY_NAME: string;
  OVER_PayAmt: number;
  PreAudit_OVER_PayAmt: number;
  Actual_ReceivedAmt: number;
  BOOK_PayAmt: number;
  Compare_CD: 'Y' | 'N' | 'O' | 'X';
  Compare_AB: 'Y' | 'N' | 'O' | 'X';
}

@Component({
  selector: 'app-tls2a030',
  templateUrl: './tls2a030.component.html',
  styleUrls: ['./tls2a030.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CustomFooterTableComponent,
    CalendarRangeQuickComponent,
    DropdownRangeComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    ButtonModule
  ]
})
export class TLS2A030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    SaleDateStart: [yesterday, Validators.required],
    SaleDateEnd: [yesterday, Validators.required],
    ECR_No: [null as string | null],
    ECR_No_Start: [null as string | null],
    ECR_No_End: [null as string | null],
    ...createPaginationConfig([{ field: 'PAY_NO', order: 1 }])
  });

  footerData: any[] = [];
  private skipAutoQueryOnce = false;
  data: SalesRecord[] = [];
  totalRecords = 0;
  selectedItems: SalesRecord[] = [];
  ECRNoOptions: any[] = [];
  btnLoading2 = false;
  // 表格欄位
  columns: Column[] = [
    { field: 'PAY_NAME', header: '支付工具', visible: true },
    { field: 'OVER_PayAmt', header: '實際溢欠總額 (A)', visible: true, format: formatAmount, isTotal: true },
    { field: 'PreAudit_OVER_PayAmt', header: '審核前溢欠總額 (B)', visible: true, format: formatAmount, isTotal: true },
    { field: 'Actual_ReceivedAmt', header: '實收總額 (C)', visible: true, format: formatAmount, isTotal: true },
    { field: 'BOOK_PayAmt', header: '系統帳 (D)', visible: true, format: formatAmount, isTotal: true },
    {
      field: 'Compare_CD',
      header: '(C) 與 (D) 比較',
      htmlFormat: true,
      format: (v: any) =>
        v === true || v === 'Y' || v === 'O'
          ? '<span class="circle">〇</span>'
          : '<span class="cross">✖</span>',
      visible: true,
    },
    {
      field: 'Compare_AB',
      header: '(A) 與 (B) 比較',
      htmlFormat: true,
      format: (v: any) =>
        v === true || v === 'Y' || v === 'O'
          ? '<span class="circle">〇</span>'
          : '<span class="cross">✖</span>',
      visible: true,
    }
  ];

  constructor(
    private locationOptionsService: LocationOptionsService,
    private ECRNoService: ECRNoService,
    private tls2a030Service: TLS2A030Service,
    private http: HttpClient
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2A030', '/TLS/TLS2A030cru', this.queryForm, (form) => this.onSubmit(form));

    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = data;
    });
  }

  onExportExcel(): void {
    const raw = this.queryForm.getRawValue();

    const payload = {
      SaleDateStart:
        raw.SaleDateStart instanceof Date
          ? raw.SaleDateStart.toISOString()
          : raw.SaleDateStart ?? null,
      SaleDateEnd:
        raw.SaleDateEnd instanceof Date
          ? raw.SaleDateEnd.toISOString()
          : raw.SaleDateEnd ?? null,
      ECR_No_Start: raw.ECR_No_Start?.trim() ?? '',
      ECR_No_End: raw.ECR_No_End?.trim() ?? '',
      PageSize: 999999,
      PageIndex: 1,
      SortBy: [],
      IsExcel: true,
    };


    console.log('匯出 payload:', payload);
    this.btnLoading2 = true;

    this.tls2a030Service.exportTLS2A030(payload).subscribe({
      next: (res) => {
        const blob = new Blob([res.body], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const contentDisposition = res.headers.get('content-disposition');
        let filename = '溢欠彙總表.xlsx';
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?([^"]+)"?/);
          if (match) filename = decodeURIComponent(match[1]);
        }
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        this.btnLoading2 = false;
      },
    });
  }



  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      this.tls2a030Service.queryTLS2A030(form.value).subscribe({
        next: (res) => {
          const main = res?.Data?.mainData ?? [];
          const total = res?.Data?.totalData?.[0] ?? null;

          // 綁定主資料
          this.data = main.map((it: any) => ({
            ...it,
            Compare_CD: it?.Compare_CD,
            Compare_AB: it?.Compare_AB
          }));

          // 綁定總計
          if (total) {
            this.footerData = [
              {
                group_name: '總計',
                OVER_PayAmt: total.OVER_Total_PayAmt,
                PreAudit_OVER_PayAmt: total.PreAudit_OVER_Total_PayAmt,
                Actual_ReceivedAmt: total.Actual_ReceivedAmt_Total,
                BOOK_PayAmt: total.BOOK_Total_PayAmt,
                Compare_CD: '',
                Compare_AB: ''
              }
            ];
          } else {
            this.footerData = [];
          }

          this.totalRecords = res?.TotalCount ?? this.data.length;
          this.loading = false;
        },
      });
    });
  }

}
