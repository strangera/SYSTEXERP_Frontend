import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { POS6118Data, TLS27040Service } from '@service/api/tls/tls27040.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { finalize } from 'rxjs';
import { CheckOptions, CrdTxnFgOptions, PayCrdTypeOptions, POS6118_columns, queryFilterOptions, TxnTypeOptions } from '../tls27040.model';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { TranslateModule } from '@ngx-translate/core';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { SystemOptionsService } from '@service/system/sys1000.service';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls27040-pos6118',
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
  templateUrl: './tls27040-pos6118.component.html',
})
export class Tls27040POS6118Component extends BasicQueryPageComponent<POS6118Data> implements OnInit {
  @ViewChild('formTemplate', { static: true }) formTemplate!: TemplateRef<unknown>;
  @ViewChild('tableTemplate', { static: true }) tableTemplate!: TemplateRef<unknown>;
  @Input() selectedBank!: string;
  queryForm = this.formBuilder.group({
    ECR_No: ['', [Validators.maxLength(10)]], // ECR編號
    TXN_No: ['', [Validators.maxLength(8)]], // 交易編號
    TLT_No: ['', [Validators.maxLength(12)]], // 專櫃編號
    NCML_TxnTypeList: [null],         // 銷售狀況
    NCML_PayCrdTypeList: [null],    // 卡別
    NCML_TxnAmt_Start: [null, [Validators.max(9999999999)]],       // 交易金額起 decimal 12, 2
    NCML_TxnAmt_End: [null, [Validators.max(9999999999)]],      // 交易金額迄 decimal 12, 2
    NCML_TxnDate_Start: [null],    // 交易日期起
    NCML_TxnDate_End: [null],    // 交易日期迄
    NCML_TxnTime_Start: [null],  // 交易時間起
    NCML_TxnTime_End: [null],  // 交易時間迄
    NCML_CrdNo: ['', [Validators.maxLength(32)]],       // 卡號
    NCML_TmID: ['', [Validators.maxLength(8)]],      //EDC號碼
    NCML_BatCloseDate_Start: [null], // 請款日期起
    NCML_BatCloseDate_End: [null], // 請款日期迄
    NCML_CrdTxnFgList: [null],      // 交易類別 資料型態，C=一般交易、I=分期交易、R=紅利交易
    NCML_CheckList: [null],       // 輸入狀態
    NCML_ApprovalCode: ['', [Validators.maxLength(6)]],  // 核准碼
    NCML_TermNoList: [null],      // 分期期數
    radioBtn: [null], // 查詢篩選
    ...createPaginationConfig([{ field: 'ID', order: 1 }]),
  });
  totalRecords = 0;
  POS6118Data: POS6118Data[] = [];
  selectedItems: POS6118Data[] = [];
  POS6118_columns = POS6118_columns;
  TxnTypeOptions = TxnTypeOptions;
  PayCrdTypeOptions = PayCrdTypeOptions;
  CrdTxnFgOptions = CrdTxnFgOptions;
  CheckOptions = CheckOptions
  TermNoOptions = SystemOptionsService.getOptions('T109');
  queryFilterOptions = queryFilterOptions

  constructor(
    private readonly tls27040Service: TLS27040Service,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS27040', 'TLS/TLS27040cru', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls27040Service.queryPOS6118(frm.value).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.POS6118Data = res.Data.map(item => ({
          ...item,
          NCML_TermNo: String(item.NCML_TermNo),
          tableName: 'POS6118'
        }));
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, { ...frm.value, selectedBank: this.selectedBank });
      });
    });
  }

  onDelete(selectedItems: POS6118Data[]) {
    this.loading = true;
    const body = {
      idList: selectedItems.map(item => item.ID),
      tableName: 'POS6118'
    }
    this.tls27040Service.deleteTLS27040(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
      this.messageService.successBubble(res.Message);
      this.onSubmit(this.queryForm);
    });
  }
}
