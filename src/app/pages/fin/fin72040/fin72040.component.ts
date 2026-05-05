import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { formatDate } from '@pages/tls/tls12040-v2/utils';
import { fin72040Data } from '@service/api/fin/fin72040.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { formatAmount } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { AddButton, Column } from '../../../shared/componentkit/table/table.model';
import { Fin72040Service } from './../../../service/api/fin/fin72040.service';

@Component({
  selector: 'app-fin72040',
  templateUrl: './fin72040.component.html',
  styleUrl: './fin72040.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    CalendarRangeQuickComponent,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberRangeComponent,
    DropdownComponent,
    TableComponent,
    TranslateModule]
})
export class FIN72040Component extends BasicQueryPageComponent<fin72040Data> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    // 檔案說明:
    //  POS2064M 收支主檔(I/O)
    //  POS2064 收支明細檔(I/O) 
    //  tblUser 使用者資料檔(O)
    SYS_StoreNo: [this.authService.currentUserValue?.SYS_StoreNo || null, [Validators.required]], // 公司編號/店號(必填)
    PCS_RqstNo: [null, [Validators.required]], // TC+YYYYMMDDXXXX, 必填

    //分頁查詢
    // ...createPaginationConfig([{ field: 'PCS_RqstNo', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  PCS_RqstNo_Options: {
    PCS_RqstNo: string, // 請款單號
    PCS_RqstDate: Date, // 請款日期
    Keep_UsrNo: string // 保管人員編號
  }[] = [];

  data: fin72040Data[] = [];
  sumData: fin72040Data | null = null;
  columns: Column[] = [
    { field: 'RowType', header: '列類型', visible: false },
    { field: 'IDX', header: '主檔唯一識別碼', visible: true },
    { field: 'SeqNo', header: '顯示項次', visible: true },
    { field: 'RqstNo', header: '傳票號碼', visible: true },
    { field: 'TotAmt', header: '申請金額', visible: true, format: formatAmount },
    { field: 'PCS_Date', header: '零用金申請日期', visible: true, format: formatDate },
    { field: 'PCS_UsrNo', header: '申請人員工編號', visible: true },
    { field: 'PCS_UsrName', header: '申請人姓名', visible: true },
  ];

  selectedItems: fin72040Data[] = [];// 多選項目

  addButton: AddButton[] = [
    {
      label: '確定撥補',
      icon: 'fa-regular fa-file-pdf',
      action: (rowData) => this.onBtnToss(rowData), // 傳入 rowData 並指定非 Excel
      loading: () => this.btnLoading
    }
  ];

  // ----------------------------------------------------------------
  constructor(
    private readonly dropdownApiService: DropdownApiService,
    private readonly fin72040Service: Fin72040Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN72040', 'FIN/FIN72040cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('撥補request:', JSON.stringify(frm.value, null, 2));
      this.loading = false;
      this.fin72040Service.queryFIN72040(frm.value).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.data = response.Data.Detail || [];
            this.sumData = response.Data.Total;
            console.log('Result', response);
            this.totalRecords = response.TotalCount;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
          } else {
            console.error('API error:', response.Status, response.Message);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err: string) => {
          console.error('API error:', err);
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }

  // 撥補
  btnLoading = false;
  onBtnToss(rowData: fin72040Data) {
    if (!rowData || !rowData.IDX) {
      this.messageService.errorBubble('找不到該筆資料的 ID');
      return;
    }

    const iDXList = this.selectedItems.map(item => item.IDX).join(',');
    const payload = {
      IDXList: iDXList, // 勾選撥補的主檔 ID 清單，以逗號分隔 (必填) 例如: "123,124,125"
      // PCS_RqstNo: rowData.RqstNo, // 
    };

    this.btnLoading = true;
    this.fin72040Service.reimFIN72040(payload).subscribe({
      next: (response) => {
        if (response.Status === '0000') {
          console.log('Result', response.Message);

        } else {
          console.error('API error:', response.Status, response.Message);
        }
        this.loading = false;
        this.messageService.unblockUi();
      },
      error: (err: string) => {
        console.error('API error:', err);
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }

  loadOptions() {
    // 支出請款單號 下拉
    this.fin72040Service.POS2064MPCS_RqstNoDropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      const list = Array.isArray(response.Data) ? response.Data : [];
      this.PCS_RqstNo_Options = list.map((item: any) => {
        return {
          PCS_RqstNo: item.PCS_RqstNo,
          PCS_RqstDate: item.PCS_RqstDate,
          Keep_UsrNo: item.Keep_UsrNo,
        };
      });
      console.log('支出請款單號 下拉:', this.PCS_RqstNo_Options);
    });
  }
}
