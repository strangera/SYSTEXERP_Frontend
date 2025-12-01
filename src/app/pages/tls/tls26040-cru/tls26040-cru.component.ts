import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { formatAmount, formatDate } from '@shared/componentkit/table2/table2.model';
import { ValidationService } from '@shared/service/validation.service';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { TLS26040Data, TLS26040DetailData, TLS26040Service } from '../../../service/api/tls/tls26040.service';
import { ECRNoService } from '../../../service/basic/queryPOS1002.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column } from '../../../shared/componentkit/table/table.model';

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
    CalendarComponent,
    InputTextComponent,
    InputNumberComponent,
    DialogComponent,
    CommonModule
  ]
})
export class TLS26040CRUComponent extends BasicCruPageComponent<TLS26040Data> implements OnInit {
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  dataForm = this.formBuilder.group({
    sad_date_start: [this.yesterday, [Validators.required]],                          // 預售日期_起
    sad_date_end: [this.yesterday, [Validators.required]],                            // 預售日期_迄
    tlt_noList: [[]],                                                                 // 專櫃編號清單(多選)
    IsNotlt_no: ['Y', [Validators.required]],                                         // 篩選條件
    ECR_NoList: [[]],                                                                 // 收銀機號清單(多選)
    TXN_No: ['', [Validators.maxLength(8), this.validationService.numberValidator]],  // 交易序號
  });

  dataForm2 = this.formBuilder.group({
    sad_preorder_date: [new Date(), [Validators.required]], // 結帳日期
    est_amount: [{ value: 0, disabled: true }],             // 預估結帳金額
  });

  totalRecords = 0;
  data: TLS26040Data[] = [];
  selectedItems: TLS26040Data[] = [];

  columns: Column[] = [
    { field: 'id', header: 'ID', visible: false },
    { field: 'sad_date', header: '預售日期', visible: true, format: formatDate },
    { field: 'tlt_no', header: '櫃別編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'TXN_TotSaleAmt', header: '業績金額', visible: true, format: formatAmount },
  ];

  // 專櫃編號選項
  tltNoOptions: any[] = [];
  // 收銀機號選項
  ECRNoOptions: any[] = [];
  // 篩選條件選項
  isNotltNoOptions = [
    { label: '包含所選的專櫃', value: 'Y' },
    { label: '排除所選的專櫃', value: 'N' }
  ];

  btnLoading = false;       // 結帳按鈕
  totalAmount: number = 0;  // 預售總金額

  constructor(
    private tls26040Service: TLS26040Service,
    private dropDownListService: DropDownListService,
    private validationService: ValidationService,
    private ECRNoService: ECRNoService,
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26040', this.dataForm);
    this.loadOptions();
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.tls26040Service.queryTLS26040Insert({
        ...frm.getRawValue(),
        sad_date_start: this.datePipe.transform(frm.value.sad_date_start, 'yyyy-MM-dd') ?? '',
        sad_date_end: this.datePipe.transform(frm.value.sad_date_end, 'yyyy-MM-dd') ?? '',
      })
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          // 將新資料與舊資料合併
          const newData = response.Data;
          const existingIds = new Set(this.data.map(item => item.id));

          // 過濾出不重複的資料
          const uniqueNewData = newData.filter(item => !existingIds.has(item.id));

          // 合併並排序
          this.data = [...this.data, ...uniqueNewData].sort((a, b) => {
            const dateA = new Date(a.sad_date).getTime();
            const dateB = new Date(b.sad_date).getTime();
            return dateA - dateB;
          });

          this.totalRecords = this.data.length;

          // 預售總金額加總
          this.totalAmount = this.data.reduce((sum, item) => sum + (item.TXN_TotSaleAmt ?? 0), 0);
        });
    });
  }

  // 結帳
  onCheckout(): void {
    if (this.selectedItems.length === 0 || this.dataForm2.invalid) return;

    this.btnLoading = true;

    const insertRequest = {
      sad_preorder_date: this.datePipe.transform(this.dataForm2.value.sad_preorder_date, 'yyyy-MM-dd') ?? '',
      idList: this.selectedItems.map(item => item.id),
      sad_date_start: this.datePipe.transform(this.dataForm.value.sad_date_start, 'yyyy-MM-dd') ?? '',
      sad_date_end: this.datePipe.transform(this.dataForm.value.sad_date_end, 'yyyy-MM-dd') ?? '',
    };

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

  loadOptions() {
    // 載入專櫃編號選項
    this.dropDownListService.queryTLTTALENT_DropDownList().subscribe((data) => {
      this.tltNoOptions = data.Data.map(item => ({
        label: `${item.No} - ${item.Name}`,
        value: item.No
      }));
    });
    // 載入收銀機號選項
    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = (data ?? []).map((x: any) => ({
        label: x.label,
        value: x.value,
      }));
    });
  }

  selectionChange(event: TLS26040Data[]) {
    this.dataForm2.controls.est_amount.setValue(event.reduce((sum, item) => sum + (item.TXN_TotSaleAmt ?? 0), 0));
  }

  // dialog 顯示相關
  dialogVisible = false;
  dialogLoading = false;
  dialogData: TLS26040DetailData[] = [];

  dialogColumns: Column[] = [
    { field: 'TXN_Date', header: '預售日期', visible: true, format: formatDate },
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'TXN_TotSaleAmt', header: '業績金額', visible: true, format: formatAmount },
  ];

  saveDialog() {
    this.dialogVisible = false;
    this.dialogData = [];
  }

  // 載入明細資料
  onDetail(event: any) {
    this.dialogLoading = true;
    this.tls26040Service.queryTLS26040Detail({
      sad_date: event.sad_date,
      tlt_no: event.tlt_no
    })
      .pipe(untilDestroyed(this), finalize(() => this.dialogLoading = false))
      .subscribe(response => {
        this.dialogData = response.Data;
        this.dialogVisible = true;
      });
  }

  // 取消按鈕
  reset(): void {
    this.data = [];
    this.selectedItems = [];
  }
}