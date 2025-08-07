import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { TLS26040Data, TLS26040Service } from '../../../service/api/tls/tls26040.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { NgIf } from '@angular/common';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { finalize } from 'rxjs';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-tls26040-cru',
  templateUrl: './tls26040-cru.component.html',
  styleUrl: './tls26040-cru.component.scss',
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    TableComponent,
    MultiSelectComponent,
    DropdownComponent,
    CalendarComponent
  ]
})
export class TLS26040CRUComponent extends BasicCruPageComponent<TLS26040Data> implements OnInit {
  dataForm = this.formBuilder.group({
    sad_date_start: [null, [Validators.required]],      // 銷售日期_起
    sad_date_end: [null, [Validators.required]],        // 銷售日期_迄
    tlt_noList: [[]],                                   // 專櫃編號清單(多選)
    IsNotlt_no: [null, [Validators.required]],          // 篩選條件
  });

  dataForm2 = this.formBuilder.group({
    sad_preorder_date: [null, [Validators.required]],      // 結帳日期
  });

  totalRecords = 0;
  data: TLS26040Data[] = [];
  selectedItems: TLS26040Data[] = [];

  columns: Column[] = [
    { field: 'id', header: 'ID', visible: false },
    { field: 'sad_date', header: '預售日期', visible: true },
    { field: 'sad_preorder_date', header: '結帳日期', visible: true },
    { field: 'tlt_no', header: '櫃別編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'batch_no', header: '批號', visible: true },
    { field: 'sad_preorder_amt', header: '金額', visible: true, format: (value: number) => value.toLocaleString() },
  ];

  // 展開詳細資料的欄位定義
  expansionColumns: Column[] = [
    { field: 'TXN_Date', header: '預售日期', visible: true },
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'TXN_TotSaleAmt', header: '業績金額', visible: true, format: (value: number) => value.toLocaleString() },
  ];

  // 專櫃編號選項
  tltNoOptions: any[] = [];

  isNotltNoOptions = [
    { label: '包含所選的專櫃', value: 'Y' },
    { label: '排除所選的專櫃', value: 'N' }
  ];

  btnLoading = false;

  constructor(
    private tls26040Service: TLS26040Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26040', this.dataForm);
    // 載入專櫃編號選項
    this.dropDownListService.queryTLTTALENT_DropDownList().subscribe((data) => {
      this.tltNoOptions = data.Data.map(item => ({
        label: `${item.No} - ${item.Name}`,
        value: item.No
      }));
    });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.tls26040Service.queryTLS26040Insert(frm.value)
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.addDetailData(this.data); // 添加展開明細資料
        });
    });
  }

  // 為每一筆主資料載入詳細資料
  addDetailData(data: TLS26040Data[]) {
    data.forEach(item => {
      this.tls26040Service.queryTLS26040Detail({
        sad_date: item.sad_date,
        tlt_no: item.tlt_no
      }).pipe(untilDestroyed(this)).subscribe(response => {
        item.details = response.Data;
      });
    });
  }

  onCheckout(): void {
    if (this.selectedItems.length === 0 || this.dataForm2.invalid) return;

    const insertRequest = {
      sad_preorder_date: this.dataForm2.value.sad_preorder_date ?? '',
      idList: this.selectedItems.map(item => item.id),
      sad_date_start: this.dataForm.value.sad_date_start ?? '',
      sad_date_end: this.dataForm.value.sad_date_end ?? '',
    };

    this.btnLoading = true;
    this.tls26040Service.insertTLS26040(insertRequest)
      .pipe(finalize(() => this.btnLoading = false))
      .subscribe(response => {
        this.messageService.successBubble('結帳成功');
        // 重新查詢資料
        this.onSubmit(this.dataForm);
        // 清空選取項目
        this.selectedItems = [];
      });
  }

  onDetail(rowData: TLS26040Data): void {
    console.log('查看明細', rowData);
    // this.router.navigate(['/tls/tls26040-detail', rowData.id]);
  }
}