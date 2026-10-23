import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { formatAmount, formatDate } from '@others/component/table/table.model';
import { ValidationService } from '@shared/service/validation.service';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { TLS26040Data, TLS26040DetailData, TLS26040Service } from '../../../service/api/tls/tls26040.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { TableComponent } from '../../../others/component/table/table.component';
import { Column, formatToSixDigits } from '../../../others/component/table/table.model';

@Component({
  selector: 'app-tls26040-cru',
  templateUrl: './tls26040-cru.component.html',
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
    CommonModule,
    ButtonComponent,
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
  totalAmount = 0;  // 預售總金額

  constructor(
    private tls26040Service: TLS26040Service,
    private dropDownListService: DropDownListService,
    private validationService: ValidationService,
    private readonly dropdownApiService: DropdownApiService,
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
          // 後端 id 不唯一，改用前端組合鍵作為表格選取識別
          this.data = (response.Data ?? []).map(r => ({ ...r, rowKey: `${r.sad_date}_${r.tlt_no}_${r.batch_no}_${r.talent_id}` }));
          this.totalRecords = this.data.length;
          // 預售總金額加總
          this.totalAmount = this.data.reduce((sum, item) => sum + (item.TXN_TotSaleAmt ?? 0), 0);
          // 如果資料已經在結帳區塊，則從查詢結果中移除
          this.data = this.data.filter(item => !this.checkoutData.some(ckItem => ckItem.rowKey === item.rowKey));
        });
    });
  }

  // 結帳
  onCheckout(): void {
    if (this.selectedCheckoutItems.length === 0 || this.dataForm2.invalid) return;

    const insertRequest = {
      sad_preorder_date: this.datePipe.transform(this.dataForm2.value.sad_preorder_date, 'yyyy-MM-dd') ?? '',
      sad_date_start: this.datePipe.transform(this.dataForm.value.sad_date_start, 'yyyy-MM-dd') ?? '',
      sad_date_end: this.datePipe.transform(this.dataForm.value.sad_date_end, 'yyyy-MM-dd') ?? '',
      insList: this.selectedCheckoutItems.map(item => ({
        id: item.id,
        sad_date: this.datePipe.transform(item.sad_date, 'yyyy-MM-dd') ?? '',
        talent_id: item.talent_id,
        tlt_no: item.tlt_no,
      })),
    };

    this.messageService.confirm({
      header: `確認結帳 ${this.selectedCheckoutItems.length} 筆資料？`,
      accept: () => {
        this.btnLoading = true;
        this.tls26040Service.insertTLS26040(insertRequest)
          .pipe(untilDestroyed(this), finalize(() => this.btnLoading = false))
          .subscribe(() => {
            this.messageService.successBubble('新增成功');
            // 返回查詢頁
            this.onCancel();
          });
      },
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
    this.dropdownApiService.queryPos1002().subscribe((data) => {
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
    { field: 'TXN_No', header: '交易序號', visible: true, format: formatToSixDigits },
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

  //#region 結帳選定資料
  checkoutData: TLS26040Data[] = [];
  selectedCheckoutItems: TLS26040Data[] = [];
  checkoutColumns: Column[] = [
    { field: 'id', header: 'ID', visible: false },
    { field: 'sad_date', header: '預售日期', visible: true, format: formatDate },
    { field: 'tlt_no', header: '櫃別編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'TXN_TotSaleAmt', header: '業績金額', visible: true, format: formatAmount },
  ];

  onAdd() {
    // 將資料加到TLS26040_Checkout
    this.checkoutData = [...this.checkoutData, ...this.selectedItems];
    this.selectedItems = [];
    // 移除所選的資料
    this.data = this.data.filter(item => !this.checkoutData.some(ckItem => ckItem.rowKey === item.rowKey));
  }

  onRemove(event: TLS26040Data[]) {
    const keysToRemove = new Set(event.map(item => item.rowKey));
    this.checkoutData = this.checkoutData.filter(item => !keysToRemove.has(item.rowKey));
    this.selectedCheckoutItems = [];
    // 把移除的資料加回 data 但重複的不要加
    const itemsToAddBack = event.filter(item => !this.data.some(dataItem => dataItem.rowKey === item.rowKey));
    this.data = [...this.data, ...itemsToAddBack];
    // 重新排序 data 依預售日期由小至大
    this.data.sort((a, b) => (a.sad_date! > b.sad_date! ? 1 : -1));
  }

  isRowSelectable(rowData: TLS26040Data): boolean {
    if (!this.selectedCheckoutItems) return true;
    // 如果該列資料已存在於 checkoutData 中，則不可選取
    return !this.checkoutData.some(item => item.rowKey === rowData.rowKey);
  }
  //#endregion
}
