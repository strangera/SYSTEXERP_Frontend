import { saveAs } from 'file-saver';
import { WhetherService } from './../../../service/basic/whether.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { TLS22020Service } from '../../../service/api/tls/tls22020.service';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { creditCardColumns, creditCardGroup, TLS22020Data } from './tls22020.model';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { HttpResponse } from '@angular/common/http';
import { CustomFooterTableComponent } from '@shared/componentkit/custom-footer-table/customFooterTable.component';

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
@Component({
  templateUrl: './tls22020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    DropdownModule,
    ButtonComponent,
    TranslateModule,
    DropdownRangeComponent,
    CommonModule,
    ButtonModule,
    CustomFooterTableComponent

  ],
})

export class TLS22020Component extends BasicQueryPageComponent<any> implements OnInit {

  queryForm = this.formBuilder.group({
    ECR_No: [null],
    TXN_Date: [yesterday, [Validators.required]],
    ECR_No_Start: [null],
    ECR_No_End: [null],
    IsZeroShow: [null],
    TXN_DateStart: [null as Date | null],
    TXN_DateEnd: [null as Date | null],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });

  // 表格資料
  data: TLS22020Data[] = [];
  ECRNoOptions: any[] = [];
  columns: any[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },

  ];
  footerData: any[] = [];
  private skipAutoQueryOnce = false;
  exportExcelLoading = false;
  // 下拉選單選項
  whetherOptions: any[] = [];
  totalRecords = 0;
  statusOptions = [
    { label: '是', value: 'Y' },
    { label: '否', value: 'N' }
  ];
  selectedColumns = creditCardColumns;
  columnGroup = creditCardGroup;
  total: Record<string, number> = {
    TXN_Total: 0,
    SLE_Total: 0,
    Diff_Total: 0,
  };

  constructor(

    private validationService: ValidationService,
    private whetherService: WhetherService,
    private ECRNoService: ECRNoService,

    private tls22020Service: TLS22020Service,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS22020', '/TLS/TLS22020cru', this.queryForm);
    this.whetherService.getWhetherOptions().subscribe(data => {
      this.whetherOptions = data;
    });
    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = data;
    });
    // 自動預帶 ECR_No_End
    this.queryForm.controls.ECR_No_Start.valueChanges.subscribe(val => {
      const endVal = this.queryForm.controls.ECR_No_End.value;
      if (val && (!endVal || endVal === '' || endVal === undefined || endVal === null)) {
        this.queryForm.controls.ECR_No_End.setValue(val, { emitEvent: false });
      }
    });
    const state = this.router.lastSuccessfulNavigation?.extras.state;
    const isFromRelatedRoute = state?.['fromRoute']?.includes(this.ProgNo.toLowerCase());
    if (isFromRelatedRoute) {
      this.skipAutoQueryOnce = true;
      const savedData = this.queryStateService.getQueryStateValue(this.ProgNo + '_data') ?? [];
      if (savedData.length === 0) return;

      this.data = savedData.Data.QueryData;
      this.totalRecords = savedData.TotalCount ?? this.data.length;

      // footerData 總計
      this.footerData = [{ group_name: '總計', ...savedData.Data.SumData }];
    }
  }

  onSubmit(form: FormGroup): void {
    if (this.skipAutoQueryOnce) {
      this.skipAutoQueryOnce = false;
      return;
    }

    this.handleSubmit(form, () => {
      this.tls22020Service.queryTLS22020(form.value).subscribe({
        next: (res) => {
          const flatData = (res.Data?.QueryData ?? []).map((item: any) => {
            const row: any = {
              ECR_No: item.ECR_No,
              tlt_no: item.tlt_no,
              tlt_name: item.tlt_name,
              Total_Txn_PayAmt: item.Total_Txn_PayAmt,
              Total_SLE_PayAmt: item.Total_SLE_PayAmt,
              Total_Diff_PayAmt: item.Total_Diff_PayAmt,
            };
            for (const pay of item.pay_NoDataList || []) {
              const payNo = pay.Pay_No;
              row[`TXN_PayAmt_${payNo}`] = pay.TXN_PayAmt;
              row[`SLE_PayAmt_${payNo}`] = pay.SLE_PayAmt;
              row[`Diff_PayAmt_${payNo}`] = pay.Diff_PayAmt;
            }
            return row;
          });

          this.data = flatData;
          this.totalRecords = res.TotalCount ?? flatData.length;

          // footerData 總計
          this.footerData = [{ group_name: '總計', ...res.Data?.SumData }];

          // 保留查詢狀態
          this.queryStateService.setQueryState(this.ProgNo, form.value);
          this.queryStateService.setQueryState(this.ProgNo + '_data', res);

          this.loading = false;
        },
        error: (err) => {
          console.error('查詢 TLS22020 失敗:', err);
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
      queryTLS22020Request: {
        ...raw,
        TXN_DateStart: raw.TXN_DateStart
          ? `${raw.TXN_DateStart.getFullYear()}-${(raw.TXN_DateStart.getMonth() + 1).toString().padStart(2, '0')}-${raw.TXN_DateStart.getDate().toString().padStart(2, '0')}`
          : null,
        TXN_DateEnd: raw.TXN_DateEnd
          ? `${raw.TXN_DateEnd.getFullYear()}-${(raw.TXN_DateEnd.getMonth() + 1).toString().padStart(2, '0')}-${raw.TXN_DateEnd.getDate().toString().padStart(2, '0')}`
          : null,
        pageSize: this.totalRecords
      },
    }

    this.exportExcelLoading = true;
    this.tls22020Service.exportTLS22020(payload).subscribe({
      next: (response: HttpResponse<Blob>) => {
        if (response.body) {
          const contentDisposition = response.headers.get('content-disposition');
          let filename = `${payload.FileName}.xlsx`; // 副檔名改為 .xlsx
          if (contentDisposition) {
            const filenameRegex = /filename\*=UTF-8''(.+?)(?:\.xlsx)?$|filename="(.+?)(?:\.xlsx)?"$/;  //  正則匹配.xlsx
            const matches = contentDisposition.match(filenameRegex);
            if (matches) {
              filename = matches[1] || matches[2] || filename;
              filename = decodeURIComponent(filename);
            }
            filename = filename.replace(/["']/g, '');
          }
          const blob = new Blob([response.body], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); // 正確的 MIME 類型
          saveAs(blob, filename);
        } else {
          console.error("Response body is empty!");
        }
        this.exportExcelLoading = false;
      },
      error: (err) => {
        console.error('TLS22050 匯出失敗', err);
        this.exportExcelLoading = false;
      },
    });
  };
}







