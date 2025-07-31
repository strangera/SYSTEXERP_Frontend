import { DropDownListService, IDropdownItem } from 'src/app/service/utility/dropDownList.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core'; // Add this import as requested
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { BusCrdTxnFgOptions, CheckOptions, CrdTxnFgOptions, CTBC_TxnCodeOptions, CTBC_TxnTypeOptions, POS611X_CONFIGS, POS611XOptions, queryFilterOptions, TxnTypeOptions } from './tls27040.model';
import { NgIf } from '@angular/common';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TLS27040Service } from '@service/api/tls/tls27040.service';
import { finalize } from 'rxjs';
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
    MultiSelectComponent,
    DropdownComponent,
    InputNumberRangeComponent,
    CalendarRangeComponent,
    TableComponent,
    TranslateModule,
    NgIf
  ]
})
export class TLS27040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    POS611X: ['', [Validators.required]], // 收單銀行
    // 共用
    ECR_NoList: [null],     // ECR編號
    TXN_NoList: [null],   // 交易編號
    TLT_NoList: [null],   // 專櫃編號
    // 聯合專用欄位
    NCML_TxnTypeList: [null],         // 銷售狀況
    NCML_PayCrdTypeList: [null],    // 卡別
    NCML_TxnAmt_Start: [null, [Validators.max(9999999999.99)]],       // 交易金額起 decimal 12, 2
    NCML_TxnAmt_End: [null, [Validators.max(9999999999.99)]],      // 交易金額迄 decimal 12, 2
    NCML_TxnDate_Start: [null],    // 交易日期起
    NCML_TxnDate_End: [null],    // 交易日期迄
    NCML_TxnTime_Start: [null],  // 交易時間起
    NCML_TxnTime_End: [null],  // 交易時間迄
    NCML_CrdNo: [''],       // 卡號
    NCML_TmID: [''],      //EDC號碼
    NCML_BatCloseDate_Start: [null], // 請款日期起
    NCML_BatCloseDate_End: [null], // 請款日期迄
    NCML_CrdTxnFgList: [null],      // 交易類別 資料型態，C=一般交易、I=分期交易、R=紅利交易
    NCML_CheckList: [null],       // 輸入狀態
    NCML_ApprovalCode: [''],  // 核准碼
    NCML_TermNoList: [null],      // 分期期數
    // 中信專用欄位 (若你有要加入查詢欄位)
    CTBC_TxnCode: [], // 銷售狀態
    CTBC_TxnAmtStart: [], // 交易金額起
    CTBC_TxnAmtEnd: [], // 交易金額迄
    CTBC_TxnTimeStart: [], // 交易時間起
    CTBC_TxnTimeEnd: [], // 交易時間迄
    CTBC_CrdNo: [], // 卡號
    CTBC_TmID: [], // EDC號碼
    CTBC_DateStart: [], // 請款日期起
    CTBC_DateEnd: [], // 請款日期迄
    CTBC_DataType: [],  // 交易類別 // 中信 資料型態，C=一般交易、I=分期交易、R=紅利交易 // 中信停車場只有一般交易
    CTBC_Check: [], // 輸入狀態
    CTBC_ApprovalCode: [],  // 核准碼
    CTBC_TermNo: [],  // 分期期數 // 中信-停車 無分期
    // 中信-停車專用欄位
    CTBC_TxnType: [], // 交易類型
    CTBC_TxnDateStart: [], // 交易日期起
    CTBC_TxnDateEnd: [], // 交易日期迄
    CTBC_BusDateStart: [], // 請款日期起
    CTBC_BusDateEnd: [], // 請款日期迄

    queryFilter: [], // 查詢篩選
    ...createPaginationConfig([{ field: 'ID', order: 1 }]),
  });
  totalRecords = 0;
  data: any[] = [];
  TxnTypeOptions = TxnTypeOptions;  // 銷售狀況
  PayCrdTypeOptions = [];           // 卡別
  CrdTxnFgOptions = CrdTxnFgOptions;             // 交易類別
  BusCrdTxnFgOptions = BusCrdTxnFgOptions
  CTBC_TxnCodeOptions = CTBC_TxnCodeOptions; // 銷售狀態
  CTBC_TxnTypeOptions = CTBC_TxnTypeOptions; // 交易類型
  CheckOptions = CheckOptions;                // 輸入狀態
  TermNoOptions = [];                // 分期期數
  POS611XOptions = POS611XOptions;             // 收單銀行
  queryFilterOptions = queryFilterOptions;             // 查詢篩選

  selectedBank: string | null = null;
  currentColumns: Column[] = [];
  visibleFields: string[] = [];

  ECR_NoListOptions: IDropdownItem[] = [];
  TXN_NoListOptions: IDropdownItem[] = [];
  TLT_NoListOptions: IDropdownItem[] = [];
  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly tls27040Service: TLS27040Service,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS27040', 'TLS/TLS27040cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();
    this.queryForm.get('POS611X')?.valueChanges.subscribe((bankCode: string | null) => {
      this.selectedBank = bankCode;
      const config = POS611X_CONFIGS[bankCode ?? ''] || { columns: [], formFields: [] };
      this.currentColumns = config.columns;
      this.visibleFields = config.formFields;
    });
    const defaultBank = this.queryForm.get('POS611X')?.value;
    if (defaultBank) {
      const config = POS611X_CONFIGS[defaultBank];
      this.currentColumns = config?.columns || [];
      this.visibleFields = config?.formFields || [];
    }
  }
  loadDropdownOptions() {
    this.dropDownListService.queryPOS1002_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.ECR_NoListOptions = res.Data.map(item => ({
        ...item, label: item.No + ' - ' + item.Name,
      }));
    });
    // this.dropDownListService.queryPOS1003_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
    //   this.TXN_NoListOptions = res.Data.map(item => ({
    //     ...item, label: item.No + ' - ' + item.Name,
    //   }));
    // });
    this.dropDownListService.queryTLTTALENT_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.TLT_NoListOptions = res.Data.map(item => ({
        ...item, label: item.No + ' - ' + item.Name,
      }));
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      switch (this.selectedBank) {
        case '0':
          this.tls27040Service.queryPOS6118(frm.value).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
            this.data = res.Data;
            this.totalRecords = res.TotalCount;
          });
          break;
        case '1':
          this.tls27040Service.queryPOS6119(frm.value).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
            this.data = res.Data;
            this.totalRecords = res.TotalCount;
          });
          break;
        case '2':
          this.tls27040Service.queryPOS6119P(frm.value).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
            this.data = res.Data;
            this.totalRecords = res.TotalCount;
          });
          break;
        default:
          break;
      }
    });
  }
}
