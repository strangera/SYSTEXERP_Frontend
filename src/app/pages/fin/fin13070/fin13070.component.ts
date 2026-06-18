import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { FIN13070Data, FIN13070Service, FIN13070UpdateRequest } from '../../../service/api/fin/fin13070.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatAmount, formatDate, formatToSixDigits } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-fin13070',
  templateUrl: './fin13070.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, InputTextRangeComponent, ButtonComponent, TableComponent, TranslateModule, MultiSelectComponent]
})
export class FIN13070Component extends BasicQueryPageComponent<FIN13070Data> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_Date: ['', Validators.required], // 發票日期
    ECR_NoList: [[]], // 收銀機號清單 (多選)
    TXN_GUINo_Start: ['', [Validators.maxLength(10)]], // 發票號碼(起)
    TXN_GUINo_End: ['', [Validators.maxLength(10)]], // 發票號碼(訖)
    ...createPaginationConfig([]) // 分頁和排序參數
  });

  totalRecords = 0;
  data: FIN13070Data[] = [];
  selectedItems: FIN13070Data[] = [];

  columns: Column[] = [
    { field: 'ID', header: 'ID', visible: false },
    { field: 'TXN_Date', header: '發票日期', visible: true, format: formatDate },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true, format: formatToSixDigits },
    { field: 'TXN_GUINo', header: '發票號碼', visible: true },
    { field: 'TXN_SaleAmt', header: '銷售金額', visible: true, format: formatAmount },
    {
      field: 'INV_Cancel', header: '發票狀態', visible: true,
      format: (value: string) => value === 'Y' ? '作廢' : '正常'
    },
    { field: 'TXN_VoidDT', header: '作廢日期', visible: true, format: formatDate },
  ];

  // 下拉選單 options
  cashierNoOptions: any = [];
  invoiceStatusOptions: any[] = [];

  constructor(
    private fin13070Service: FIN13070Service,
    private readonly dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13070', 'fin/fin13070cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin13070Service.queryFIN13070(frm.value)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        });
    });
  }

  loadOptions() {
    // 取得收銀機號選項
    this.dropdownApiService.queryPos1002().subscribe((res) => {
      this.cashierNoOptions = res;
    });
  }

  onDelete(event: FIN13070Data[]) {
    this.messageService.confirm({
      message: `確定要取消作廢 ${event.length} 筆發票嗎？`,
      accept: () => {
        const updateRequest: FIN13070UpdateRequest = {
          selectList: event.map(item => ({ ID: item.ID! }))
        };

        this.fin13070Service.updateFIN13070(updateRequest)
          .pipe(untilDestroyed(this))
          .subscribe({
            next: (response) => {
              this.messageService.successBubble('發票取消作廢成功');
              // 重新查詢資料
              this.onSubmit(this.queryForm);
              // 清空選取項目
              this.selectedItems = [];
            }
          });
      }
    });
  }
}