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
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { TLS22020Service } from '../../../service/api/tls/tls22020.service';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { creditCardColumns, creditCardGroup, TLS22020Data, payNoDataList } from './tls22020.model';
import { CommonModule } from '@angular/common';

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
    TableComponent,
    TranslateModule,
    DropdownRangeComponent,
    CommonModule
  ],
})

export class TLS22020Component extends BasicQueryPageComponent<any> implements OnInit {

  queryForm = this.formBuilder.group({
    ECR_No: [null],
    TXN_Date: [null, [Validators.required]],
    ECR_No_Start: [null],
    ECR_No_End: [null],
    status1: [null],
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


  // 下拉選單選項
  whetherOptions: any[] = [];
  totalRecords = 0;
  statusOptions = [
    { label: '是', value: 'Y' },
    { label: '否', value: 'N' }
  ];
  selectedColumns = creditCardColumns;
  columnGroup = creditCardGroup;
  totalRow: TLS22020Data = {
    ECR_No: '',
    TLT_NO: '',
    tlt_name: '',
  };
  total: Record<string, number> = {
    TXN_Total: 0,
    SLE_Total: 0,
    Diff_Total: 0,
  };


  calcTotal(data: TLS22020Data[]) {
    this.total = {
      TXN_Total: 0,
      SLE_Total: 0,
      Diff_Total: 0,
    };

    for (const item of data) {
      for (const pay of payNoDataList) {
        const payNo = pay.Pay_No;
        for (const type of ['TXN_PayAmt', 'SLE_PayAmt', 'Diff_PayAmt']) {
          const key = `${type}_${payNo}`;
          this.total[key] = (this.total[key] || 0) + (item[key] || 0);
        }
      }

      this.total['TXN_Total'] += item['TXN_Total'] || 0;
      this.total['SLE_Total'] += item['SLE_Total'] || 0;
      this.total['Diff_Total'] += item['Diff_Total'] || 0;
    }
  }



  constructor(

    private validationService: ValidationService,
    private whetherService: WhetherService,
    private ECRNoService: ECRNoService,

    private tls22020Service: TLS22020Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS22020', '/TLS/TLS22020cru', this.queryForm, (form) => this.onSubmit(form));
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.whetherService.getWhetherOptions().subscribe(data => {
      this.whetherOptions = data;
    });
    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = data;
    });
  }

  onSubmit(form: FormGroup): void {
    console.log('表單提交:', form.value);
    this.handleSubmit(form, () => {
      const params = {
        ...form.value,
        TXN_Date: form.value.TXN_Date.toLocaleDateString('en-CA'),
      };

      this.tls22020Service.queryTLS22020(params).subscribe({
        next: (res) => {
          const flatData = (res.Data ?? []).map((item: any) => {
            const row: any = {
              ECR_No: item.ECR_No,
              tlt_no: item.tlt_no,
              tlt_name: item.tlt_name,
              TXN_Total: item.Total_Txn_PayAmt,
              SLE_Total: item.Total_SLE_PayAmt,
              Diff_Total: item.Total_Diff_PayAmt,
            };

            for (const pay of item.pay_NoDataList) {
              const payNo = pay.Pay_No;
              row[`TXN_PayAmt_${payNo}`] = pay.TXN_PayAmt;
              row[`SLE_PayAmt_${payNo}`] = pay.SLE_PayAmt;
              row[`Diff_PayAmt_${payNo}`] = pay.Diff_PayAmt;
            }

            return row;
          });

          this.data = flatData;
          this.totalRecords = res.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, params);
          this.calcTotal(this.data);
          this.loading = false;
        },
        error: (err) => {
          console.error('TLS22020 查詢失敗', err);
          this.loading = false;
        }
      });

    });
  }


}



