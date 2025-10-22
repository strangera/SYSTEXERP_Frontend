import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TranslateModule } from '@ngx-translate/core'; // Add this import as requested
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CheckOptions, columns, CrdTxnFgOptions, PayCrdTypeOptions, POS611XOptions, queryFilterOptions, TxnTypeOptions } from './tls27040.model';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TLS27040Data, TLS27040Service } from '@service/api/tls/tls27040.service';
import { finalize } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { todayStart } from '@shared/models/system/query-form.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { SystemOptionsService } from '@service/system/sys1000.service';
@Component({
  selector: 'app-tls27040',
  templateUrl: './tls27040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TranslateModule,
    DropdownModule,
    TableReportComponent,
    MultiSelectComponent,
    InputNumberRangeComponent,
    CalendarRangeComponent,
    RadiobuttonComponent
  ]
})
export class TLS27040Component extends BasicQueryPageComponent<TLS27040Data> implements OnInit {
  queryForm = this.formBuilder.group({
    tableNameList: [null],
    ECR_No: [null, [Validators.maxLength(10)]], // ECR編號
    TXN_No: [null, [Validators.maxLength(8)]], // 交易編號
    TLT_No: [null, [Validators.maxLength(12)]], // 專櫃編號
    TxnTypeList: [null],         // 銷售狀況
    PayCrdTypeList: [null],    // 卡別
    TxnAmt_Start: [null, [Validators.max(9999999999)]],       // 交易金額起 decimal 12, 2
    TxnAmt_End: [null, [Validators.max(9999999999)]],      // 交易金額迄 decimal 12, 2
    TxnDate_Start: [null],    // 交易日期起
    TxnDate_End: [null],    // 交易日期迄
    TxnTime_Start: [todayStart],  // 交易時間起
    TxnTime_End: [todayStart],  // 交易時間迄
    CrdNo: [null, [Validators.maxLength(32)]],       // 卡號
    TmID: [null, [Validators.maxLength(8)]],      //EDC號碼
    BatCloseDate_Start: [null], // 請款日期起
    BatCloseDate_End: [null], // 請款日期迄
    CrdTxnFgList: [null],      // 交易類別 資料型態，C=一般交易、I=分期交易、R=紅利交易
    CheckList: [null],       // 輸入狀態
    ApprovalCode: [null, [Validators.maxLength(6)]],  // 核准碼
    TermNoList: [null],      // 分期期數
    radioBtn: [null], // 查詢篩選
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'ID', order: 1 }]],
  });
  data: TLS27040Data[] = [];
  selectedItems: TLS27040Data[] = [];
  columns: ReportColumn[] = columns;
  totalRecords = 0;
  lastQueryBody: any;
  POS611XOptions = POS611XOptions;             // 收單銀行
  TxnTypeOptions = TxnTypeOptions;
  PayCrdTypeOptions = PayCrdTypeOptions;
  CrdTxnFgOptions = CrdTxnFgOptions;
  CheckOptions = CheckOptions;
  TermNoOptions = SystemOptionsService.getOptions('T109');
  queryFilterOptions = queryFilterOptions;
  constructor(
    public readonly tls27040Service: TLS27040Service,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS27040', 'tls/tls27040cru', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value
      }
      this.tls27040Service.queryTLS27040(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.data = res.Data.length > 0 ? res.Data.map(item => ({
          ...item,
          dataKey: item.ID + item.tableName
        })) : [];
        this.totalRecords = res.TotalCount;
        this.lastQueryBody = body;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
  onDelete(selectedItems: TLS27040Data[]) {
    this.loading = true;
    const body = {
      selectList: selectedItems.map(item => ({
        id: item.ID,
        tableName: item.tableName
      })),
    }
    this.tls27040Service.deleteTLS27040(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
      this.messageService.successBubble(res.Message);
      this.onSubmit(this.queryForm);
    });
  }
}
