import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Fin35010Service } from '@service/api/fin/fin35010.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-fin35010-cru',
  templateUrl: './fin35010-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, CalendarComponent, NgIf, TranslateModule]
})
export class FIN35010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    depositSerialNumberStart: [], // 保證金序號
    depositSerialNumberEnd: [],

    vendorCode: [], // 廠商編號
    counterCode: [], // 專櫃編號
    documentType: [], // 單據別
    amountStart: [], // 金額
    amountEnd: [],

    receiptDate: [], // 收款日期
    receiptDateEnd: [],

    depositDueDate: [], // 保證金到期日
    depositDueDateEnd: [],

    checkNumber: [], // 支票號碼
    financialInstitution: [], // 金融機構
    summary: [], // 摘要

    status: [], // 狀態
    statusChangeDate: [], // 狀態變更日期
    statusChangeDateEnd: [],

    debitAccount: [], // 收款會計科目(借)
    creditAccount: [], // 保證金會計科目(貸)

    voucherNumberStart: [], // 傳票編號
    voucherNumberEnd: [],

    clearingCode: [], // 立沖代號
    sourceSystem: [], // 來源系統別
    recruitmentNumberStart: [], // 專櫃招募編號
    recruitmentNumberEnd: [],

    depositType: [], // 保證金類型
    organizationCode: [], // 組織代號
    targetCode: [], // 對象別編號
    reconciliationKey: [], // 對帳KEY值
    depositSerialNumber: [],
    billDueDate: [],
    EbillDueDate: [],
    isPostVoucher: [],
    recruitmentNumber: [],
    voucherNumber: [],
    amount: [],
  });
  CashRegisterTypeItems: any[] = [
    { label: '業主', value: '1' },
    { label: '非業主', value: '2' },
  ];
  debitAccount: any[] = [
    { value: 1, label: '110302' },
  ];
  creditAccount: any[] = [
    { value: 1, label: '110301' },
    { value: 2, label: '110302' },
  ];
  isPostVoucher: any[] = [
    { value: 1, label: '是' },
    { value: 2, label: '否' },
  ];
  vendorCodeOptions: any[] = [
    { value: 1, label: '00000000-1' },
    { value: 2, label: '00000000-2' },
    { value: 3, label: '00000000-3' },
    { value: 4, label: '00000000-4' },
    { value: 5, label: '00000000-5' },
    { value: 6, label: '00000000-7' },
    { value: 7, label: '00000000-8' },
    { value: 8, label: '00852492-1' },
    { value: 9, label: '01052878-1' },
    { value: 10, label: '01508949-1' },
  ];
  documentTypeOptions: any[] = [
    { value: 1, label: '現金' },
    { value: 2, label: '支票' },
    { value: 3, label: '商業本票' },
  ];
  financialInstitutionOptions: any[] = [
    { value: 1, label: '000000' },
    { value: 2, label: '000022' },
    { value: 3, label: '0040037' },
    { value: 4, label: '0040059' },
    { value: 5, label: '0040071' },
    { value: 6, label: '0040082' },
    { value: 7, label: '0040093' },
    { value: 8, label: '0040107' },
    { value: 9, label: '0040118' },
    { value: 10, label: '0040129' },
  ];
  statusOptions: any[] = [
    { value: 1, label: '建立' },

  ];
  depositTypeOptions: any[] = [
    { value: 1, label: '押金' },
    { value: 2, label: '履約保證金' },
    { value: 3, label: '施工保證金' },
  ];
  organizationCodeOptions: any[] = [
    { value: 1, label: '全公司' },
    { value: 2, label: '稽核室' },
    { value: 3, label: '經營企劃部(停用)' },
    { value: 4, label: '行政Team(停用)' },
    { value: 5, label: '公關Team(停用)' },
    { value: 6, label: '營企Team(停用)' },
    { value: 7, label: '電子商務team(停用)' },
    { value: 8, label: '外商Team(停用)' },
    { value: 9, label: '個資小組' },
    { value: 10, label: '品牌代理小組(停用)' },
  ];
  targetCodeOptions: any[] = [
    { value: 1, label: '臺南紡織股份有限公司' },
    { value: 2, label: '統一企業股份有限公司' },
    { value: 3, label: '統正開發股份有限公司' },
  ];
  constructor(
    public readonly fin35010Service: Fin35010Service
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('FIN35010', this.dataForm);
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => { });
  }
}
