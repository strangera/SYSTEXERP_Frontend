import { DropDownListService } from 'src/app/service/utility/dropDownList.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core'; // Add this import as requested
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '@shared/componentkit/table/table.model';
import { CheckOptions, CrdTxnFgOptions, POS611XOptions, queryFilterOptions, TxnTypeOptions } from './tls27040.model';
@Component({
  selector: 'app-tls27040',
  templateUrl: './tls27040.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, InputNumberRangeComponent, CalendarRangeComponent, TableComponent, TranslateModule]
})
export class TLS27040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    ECR_No: [],  // 收銀機號 POS5006.ECR_No
    TXN_No: [],  // 交易序號 POS5006.TXN_No
    TLT_No: [],  // 專櫃編號
    TxnType: [],  // 銷售狀況 "銷售狀況：00=一般銷售 04=退貨銷售"
    PayCrdType: [],  // 卡別 POS1006
    TxnAmtStart: [],  // 金額開始
    TxnAmtEnd: [],  // 金額結束
    TxnDateTimeStart: [],  // 銷售日期與時間開始
    TxnDateTimeEnd: [],  // 銷售日期與時間結束
    CrdNo: [],  // 卡號
    TmID: [],  // EDC號碼
    BatCloseDateStart: [],  // 請款日期開始
    BatCloseDateEnd: [],  // 請款日期結束
    CrdTxnFg: [],  // 交易類別：一般、分期、紅利
    Check: [],  // 輸入狀態 0=手刷補登 2=調整補登 3=CardPool欠落
    ApprovalCode: [],  // 授權碼
    TermNo: [],  // 分期期數 sys1000 T109
    POS611X: [],  // 收單銀行
    queryFilter: []  // 查詢篩選
  });
  totalRecords = 0;
  TxnTypeOptions = TxnTypeOptions;  // 銷售狀況
  PayCrdTypeOptions = [];           // 卡別
  CrdTxnFgOptions = CrdTxnFgOptions;             // 交易類別
  CheckOptions = CheckOptions;                // 輸入狀態
  TermNoOptions = [];                // 分期期數
  POS611XOptions = POS611XOptions;             // 收單銀行
  queryFilterOptions = queryFilterOptions;             // 查詢篩選

  data: any[] = [];
  columns: Column[] = [
    { field: 'cashRegisterCode', header: '收銀機代碼', visible: true },
    { field: 'transactionFlowCode', header: '交易流水號', visible: true },
    { field: 'counterCode', header: '專櫃編號', visible: true },
    { field: 'cardType', header: '卡別', visible: true },
    { field: 'amount', header: '金額', visible: true },
    { field: 'saleDate', header: '銷售日期', visible: true },
    { field: 'saleTime', header: '銷售時間', visible: true },
    { field: 'requestDate', header: '請款日期', visible: true },
    { field: 'cardNumber', header: '卡號', visible: true },
    { field: 'invoiceNumber', header: '發票號碼', visible: true },
    { field: 'edcCode', header: 'EDC號碼', visible: true },
    { field: 'approvalCode', header: '授權碼', visible: true },
    { field: 'saleStatus', header: '銷售狀況', visible: true },
    { field: 'transactionType', header: '交易類別', visible: true },
    { field: 'inputStatus', header: '輸入狀態', visible: true },
    { field: 'installmentCount', header: '分期期數', visible: true },
    { field: 'bank', header: '收單行', visible: true },
    { field: 'requestSource', header: '請款來源', visible: true },
    { field: 'creator', header: '建立者', visible: true },
    { field: 'creationDate', header: '建立日期', visible: true },
    { field: 'modifier', header: '修改者', visible: true },
    { field: 'modificationDate', header: '修改日期', visible: true },
  ];

  constructor(
    private readonly dropDownListService: DropDownListService
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS27040', 'TLS/TLS27040cru', this.queryForm, (form) => this.onSubmit(form));
    // this.dropDownListService.getPOS2034Options
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // Handle the form submission logic here
    });
  }
}
