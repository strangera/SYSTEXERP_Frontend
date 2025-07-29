import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
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


interface SalesRecord {
  paymentTool: string;
  actualShortfallAmount: number;
  preAuditShortfallAmount: number;
  receiptTotal: number;
  systemTotal: number;
  compareCD: 'Y' | 'N';
  compareAB: 'Y' | 'N';
}

@Component({
  selector: 'app-tls2a030',
  templateUrl: './tls2a030.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeQuickComponent, DropdownRangeComponent,
    ButtonComponent, TableComponent, TranslateModule]
})
export class TLS2A030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    SaleDateStart: [null, Validators.required],
    SaleDateEnd: [null, Validators.required],
    ECR_No: [null],
    ECR_No_Start: [null],
    ECR_No_End: [null],
    ...createPaginationConfig([{ field: 'paymentTool', order: 1 }])
  });

  data: SalesRecord[] = [];
  totalRecords = 0;
  selectedItems: SalesRecord[] = [];
  ECRNoOptions: any[] = [];
  // 表格欄位
  columns = [
    { field: 'PAY_NAME', header: '支付工具' },
    { field: 'OVER_PayAmt', header: '實際淨欠總額 (A)' },
    { field: 'PreAudit_OVER_PayAmt', header: '審核前淨欠總額 (B)' },
    { field: 'Actual_ReceivedAmt', header: '實收總額 (C)' },
    { field: 'BOOK_PayAmt', header: '系統帳 (D)' },
    {
      field: 'Compare_CD',
      header: '(C) 與 (D) 比較',
      format: (v: boolean) => v ? 'Y' : 'N'
    },
    {
      field: 'Compare_AB',
      header: '(A) 與 (B) 比較',
      format: (v: boolean) => v ? 'Y' : 'N'
    }
  ];


  constructor(
    private locationOptionsService: LocationOptionsService,
    private ECRNoService: ECRNoService,
    private tls2a030Service: TLS2A030Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2A030', undefined, this.queryForm, this.onSubmit.bind(this));
    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = data;
    });
  }


  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const payload = {
        PageSize: form.value.PageSize,
        PageIndex: form.value.PageIndex,
        OrderBy: form.value.OrderBy,
        Offset: form.value.Offset,
        SortBy: form.value.SortBy,
        SaleDateStart: form.value.tlt_bdate_start?.toISOString() ?? null,
        SaleDateEnd: form.value.tlt_bdate_end?.toISOString() ?? null,
        ECR_No_Start: form.value.ECR_No_Start ?? '',
        ECR_No_End: form.value.ECR_No_End ?? ''
      };

      this.tls2a030Service.queryTLS2A030(payload).subscribe({
        next: (res: any) => {
          const rawData = res?.Data ?? [];

          this.data = rawData.map((item: any) => ({
            ...item,
            Compare_CD: item.Compare_CD,
            Compare_AB: item.Compare_AB
          }));

          this.totalRecords = res.TotalCount ?? this.data.length;
          this.loading = false;
        },
        error: (err) => {
          console.error('TLS2A030 查詢失敗', err);
          this.loading = false;
        }
      });
    });
  }


}
