import { Component, OnInit } from '@angular/core';
import { FIN12020Data, FIN12020QueryRequest, FIN12020Service } from '../../../service/api/fin/fin12020.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { DropdownOption } from '../../../shared/models/api/base-api.interface';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-fin12020',
    templateUrl: './fin12020.component.html',
    styleUrl: './fin12020.component.scss',
    standalone: true,
    imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, InputTextComponent, InputTextRangeComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class FIN12020Component extends BasicQueryPageComponent<FIN12020Data> implements OnInit {
  queryForm = this.formBuilder.group({
    invoice_month: [''], // 發票年月
    invoice_month_start: ['', Validators.required], // 發票年月(起)
    invoice_month_end: ['', Validators.required], // 發票年月(迄)
    invoice_type: [''], // 發票類別
    prefix: ['', [Validators.maxLength(2)]], // 字軌
    invoice_no: ['', [Validators.maxLength(8)]], // 發票號碼
    invoice_no_start: [''], // 發票號碼(起)
    invoice_no_end: [''], // 發票號碼(迄)
    cashier_no: [''], // 收銀機代號
    invoice_status: [''], // 發票狀態
    usage_type: [''], // 使用別
    ...createPaginationConfig([{ field: 'invoice_month', order: -1 }]), // 分頁和排序參數
  });

  totalRecords = 0;
  data: FIN12020Data[] = [];
  selectedItems: FIN12020Data[] = [];
  columns: Column[] = [
    { field: 'invoice_month', header: '發票年月', visible: true },
    { field: 'prefix', header: '字軌', visible: true },
    { field: 'invoice_no_start', header: '發票號碼(起)', visible: true },
    { field: 'invoice_no_end', header: '發票號碼(迄)', visible: true },
    { field: 'next_invoice_no', header: 'NEXT發票配號號碼', visible: true },
    { field: 'usage_type', header: '使用別', visible: true },
    { field: 'invoice_status', header: '使用狀態', visible: true },
  ];

  // 下拉選單 options
  invoiceTypeOptions: DropdownOption[] = [];
  cashierNoOptions: DropdownOption[] = [];
  invoiceStatusOptions: DropdownOption[] = [];
  usageTypeOptions: DropdownOption[] = [];

  constructor(private fin12020Service: FIN12020Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN12020', 'fin/fin12020cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin12020Service.queryFIN12020(frm.value as FIN12020QueryRequest)
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        });
    });
  }

  loadOptions() {
    // 這裡可以載入下拉選單的 options
    // 暫時先用假資料，實際應該從服務端獲取
    this.invoiceTypeOptions = [
      { No: '一般發票', Name: '01' },
      { No: '特種發票', Name: '02' },
      { No: '電子發票', Name: '03' }
    ];
    this.cashierNoOptions = [
      { No: '收銀機1', Name: '001' },
      { No: '收銀機2', Name: '002' },
      { No: '收銀機3', Name: '003' }
    ];
    this.invoiceStatusOptions = [
      { No: '未使用', Name: '0' },
      { No: '已使用', Name: '1' },
      { No: '已作廢', Name: '2' }
    ];
    this.usageTypeOptions = [
      { No: '一般', Name: '01' },
      { No: '特殊', Name: '02' }
    ];
  }
}