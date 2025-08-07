import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { POS6119Data, TLS27040Service } from '@service/api/tls/tls27040.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { finalize } from 'rxjs';
import { CheckOptions, CrdTxnFgOptions, CTBC_TxnCodeOptions, POS6119_columns, queryFilterOptions } from '../tls27040.model';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { SystemOptionsService } from '@service/system/sys1000.service';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls27040-pos6119',
  standalone: true,
  imports: [
    ButtonComponent,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    MultiSelectComponent,
    InputNumberRangeComponent,
    CalendarRangeComponent,
    TranslateModule,
    RadiobuttonComponent,
    TableComponent
  ],
  templateUrl: './tls27040-pos6119.component.html',
})
export class Tls27040POS6119Component extends BasicQueryPageComponent<POS6119Data> implements OnInit {
  @ViewChild('formTemplate', { static: true }) formTemplate!: TemplateRef<unknown>;
  @ViewChild('tableTemplate', { static: true }) tableTemplate!: TemplateRef<unknown>;
  queryForm = this.formBuilder.group({
    ECR_No: ['', [Validators.maxLength(10)]], // ECR編號
    TXN_No: ['', [Validators.maxLength(8)]], // 交易編號
    TLT_No: ['', [Validators.maxLength(12)]], // 專櫃編號
    CTBC_TxnCodeList: [null], // 銷售狀態
    CTBC_TxnAmt_Start: [null, [Validators.max(9999999999)]], // 交易金額起
    CTBC_TxnAmt_End: [null, [Validators.max(9999999999)]], // 交易金額迄
    CTBC_TxnTime_Start: [null], // 交易時間起
    CTBC_TxnTime_End: [null], // 交易時間迄
    CTBC_CrdNo: ['', [Validators.maxLength(32)]], // 卡號
    CTBC_TmID: ['', [Validators.maxLength(8)]], // EDC號碼
    CTBC_Date_Start: [null], // 請款日期起
    CTBC_Date_End: [null], // 請款日期迄
    CTBC_DataTypeList: [null],  // 交易類別 // 中信 資料型態，C=一般交易、I=分期交易、R=紅利交易 // 中信停車場只有一般交易
    CTBC_CheckList: [null], // 輸入狀態
    CTBC_ApprovalCode: ['', [Validators.maxLength(6)]],  // 核准碼
    CTBC_TermNoList: [],  // 分期期數 // 中信-停車 無分期
    radioBtn: [null], // 查詢篩選
    ...createPaginationConfig([{ field: 'ID', order: 1 }]),
  });
  totalRecords = 0;
  POS6119Data: POS6119Data[] = [];
  selectedItems: POS6119Data[] = [];
  POS6119_columns = POS6119_columns;
  CTBC_TxnCodeOptions = CTBC_TxnCodeOptions
  TermNoOptions = SystemOptionsService.getOptions('T109');
  queryFilterOptions = queryFilterOptions
  CrdTxnFgOptions = CrdTxnFgOptions
  CheckOptions = CheckOptions

  constructor(
    private readonly tls27040Service: TLS27040Service,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS27040', 'TLS/TLS27040cru', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls27040Service.queryPOS6119(frm.value).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.POS6119Data = res.Data;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
  onDelete(selectedItems: POS6119Data[]) {
    this.loading = true;
    const body = {
      idList: selectedItems.map(item => item.ID),
      tableName: 'POS6119'
    }
    this.tls27040Service.deleteTLS27040(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
      this.messageService.successBubble(res.Message);
      this.onSubmit(this.queryForm);
    });
  }
}
