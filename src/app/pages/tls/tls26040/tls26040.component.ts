import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, Observable } from 'rxjs';
import { TLS26040Service, TLS26040Data } from '../../../service/api/tls/tls26040.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig, formatDate } from '../../../shared/componentkit/table/table.model';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-tls26040',
  templateUrl: './tls26040.component.html',
  styleUrl: './tls26040.component.scss',
  standalone: true,
  imports: [
    MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    CalendarRangeComponent, InputTextComponent, TableComponent, TranslateModule, MultiSelectComponent, DropdownComponent
  ]
})
export class TLS26040Component extends BasicQueryPageComponent<TLS26040Data> implements OnInit {
  queryForm = this.formBuilder.group({
    sad_date_start: [''],                           // 銷售日期_起
    sad_date_end: [''],                             // 銷售日期_迄
    tlt_noList: [[]],                                 // 專櫃編號(多選)
    sad_preorder_date_start: [null],                  // 結帳日期_起
    sad_preorder_date_end: [null],                    // 結帳日期_迄
    batch_no: ['', [Validators.maxLength(12)]],       // 批號
    IsNotlt_no: ['Y', [Validators.required]],        // 篩選條件
    ...createPaginationConfig([{ field: 'sad_date', order: -1 }])
  });

  totalRecords = 0;
  data: TLS26040Data[] = [];
  selectedItems: TLS26040Data[] = [];

  columns: Column[] = [
    { field: 'id', header: 'ID', visible: false },
    { field: 'sad_date', header: '預售日期', visible: true, format: formatDate },
    { field: 'sad_preorder_date', header: '結帳日期', visible: true, format: formatDate },
    { field: 'tlt_no', header: '櫃別編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'batch_no', header: '批號', visible: true },
    { field: 'sad_preorder_amt', header: '金額', visible: true, format: (value: number) => value.toLocaleString() },
  ];

  // 展開詳細資料的欄位定義
  expansionColumns: Column[] = [
    { field: 'TXN_Date', header: '預售日期', visible: true, format: formatDate },
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'TXN_TotSaleAmt', header: '業績金額', visible: true, format: (value: number) => value.toLocaleString() },
  ];

  // 專櫃編號選項
  tltNoOptions: any = [];

  isNotltNoOptions = [
    { label: '包含所選的專櫃', value: 'Y' },
    { label: '排除所選的專櫃', value: 'N' }
  ];

  constructor(
    private tls26040Service: TLS26040Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26040', 'tls/tls26040cru', this.queryForm, (form) => this.onSubmit(form));
    // 載入專櫃編號選項
    this.dropDownListService.queryTLTTALENT_DropDownList().subscribe((data) => {
      this.tltNoOptions = data.Data.map(item => ({
        label: `${item.No} - ${item.Name}`,
        value: item.No
      }));
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls26040Service.queryTLS26040(frm.value)
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  loadDetails = (rowData: TLS26040Data): Observable<any> => {
    return this.tls26040Service.queryTLS26040Detail({
      sad_date: rowData.sad_date,
      tlt_no: rowData.tlt_no
    })
  };
}