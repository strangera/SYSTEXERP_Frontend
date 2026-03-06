import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
// Shared
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ValidationService } from '@shared/service/validation.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { Option } from '@service/utility/dropdown-api.model';
//
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { Actions } from '@shared/service/permission-guard.service';

//3.1.3.1 資產維護作業
@UntilDestroy()
@Component({
  selector: 'app-ass13010',
  templateUrl: './ass13010.component.html',
  styleUrl: './ass13010.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, CalendarRangeQuickComponent, InputNumberRangeComponent, TableReportComponent, TranslateModule]
})
export class ASS13010Component extends BasicQueryPageComponent<any> implements OnInit {
  private validationService = inject(ValidationService);
  private dropdownApiService = inject(DropdownApiService);
  //
  queryForm = this.formBuilder.group({
    assetsCode: [], // 資產代號
    itemCode: [], // 品項編號
    original_assetsCode: [, [Validators.maxLength(20)]], // 原資產編號
    assetsStatus: [], // 資產狀態
    assetsType: [], // 資產類型
    purchaseNumber: [], // 採購單號
    //
    purchaseDateFrom: [], // 購入日期
    purchaseDateTo: [], // 購入日期
    original_priceFrom: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 原購入金額
    original_priceTo: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 原購入金額
    supplierCode: [], // 供應商編號
    //
    accounting_Borrow: [], // 所屬會計科目(借)
    accounting_Credit: [], // 所屬會計科目(貸)
    entryDateFrom: [], // 入帳日期
    entryDateTo: [], // 入帳日期
    //
    deviceCode: [, [Validators.maxLength(20)]], // 設備編號
    depreciation: [], // 折舊會計科目
    totalDepreciation: [], // 累計折舊科目
    //
    depreciationLifeFrom: [, [Validators.maxLength(8)]], // 折舊年限
    depreciationLifeTo: [, [Validators.maxLength(8)]], // 折舊年限
    residualFrom: [, [Validators.maxLength(8)]], // 預留殘值
    residualTo: [, [Validators.maxLength(8)]], // 預留殘值
    keepingPerson: [], // 保管人
    keepingUnit: [], // 保管單位
    user: [], // 使用人
    userUnit: [], // 使用單位
    //
    locationCode: [], // 位置代號
    maintenanceCode: [, [Validators.maxLength(11)]], // 維修合約編號
    disposalDateFrom: [], // 處份日期(變賣或報廢)
    disposalDateTo: [], // 處份日期(變賣或報廢)
    rentStatus: [], // 出借狀態
    //
    dispose_Manufacturers: [], // 處份廠商
    dispose_Manufacturers_Summons: [, [Validators.maxLength(12)]], // 處份傳票編號
    soldAmountFrom: [, [Validators.max(999999999999)]], // 變賣金額
    soldAmountTo: [, [Validators.max(999999999999)]], // 變賣金額
    //
    disposeRemark: [], // 處份說明(變賣或報廢)
    purchaseRemark: [], // 採購說明
  });
  // 查詢結果表格（序號、checkbox、管理由 app-table-report 內建）
  tableData = signal<any[]>([]);
  totalRecords = signal<number>(0);
  tableLoading = signal<boolean>(false);
  columns: ReportColumn[] = [
    { field: 'assetsCode', header: '資產代號' },
    { field: 'itemName', header: '品項名稱' },
    { field: 'assetsStatus', header: '資產狀態' },
    { field: 'assetsType', header: '資產類型' },
    { field: 'purchaseNumber', header: '採購單號' },
    { field: 'purchaseDate', header: '購入日期', format: formatDate },
    { field: 'original_price', header: '購入金額', format: (v: unknown) => formatAmount(Number(v ?? 0)) },
    { field: 'entryDate', header: '入帳日期', format: formatDate },
    { field: 'amortizationCode', header: '攤提代號' },
  ];
  // ----------------------------------------------------------------
  // 下拉選單（品項編號、採購單號來源待確認，先留空）
  itemCodeOptions: Option[] = [];
  assetsStatusOptions: Option[] = [
    { value: '1', label: '使用中' },
    { value: '3', label: '維修中' },
    { value: '4', label: '報廢' },
    { value: '5', label: '變賣' },
    { value: '7', label: '庫存中未使用' }
  ];
  assetsTypeOptions: Option[] = [
    { value: '1', label: '資產' },
    { value: '2', label: '列管品' }
  ];
  purchaseNumberOptions: Option[] = [];
  supplierCodeOptions: Option[] = []; // queryPOS2013（供應商編號、處分廠商）
  depreciationOptions: Option[] = []; // queryGLS1005_ledgerMD（會計科目借/貸、折舊、累計折舊）
  applicantCodeOptions: Option[] = []; // queryTBLUSER_Orgid（保管人、使用人）
  orgUnitOptions: Option[] = []; // querySYS3100（保管單位、使用單位）
  locationCodeOptions: Option[] = []; // queryPOS2002_DropDownList（位置代號）
  rentStatusOptions: Option[] = [
    { value: '1', label: '使用中' },
    { value: '6', label: '閒置中' }
  ];
  constructor() {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13010', 'ass/ass13010cru', this.queryForm, this.onSubmit.bind(this));
    this.loadDropdownOptions();
  }

  private loadDropdownOptions(): void {
    this.dropdownApiService.queryPos2013({ VEN_Flag: '' }).pipe(untilDestroyed(this)).subscribe(res => {
      this.supplierCodeOptions = res ?? [];
    });
    this.dropdownApiService.queryGls1005_ledgerMD().pipe(untilDestroyed(this)).subscribe(res => {
      this.depreciationOptions = res ?? [];
    });
    this.dropdownApiService.queryTblUserOrgid().pipe(untilDestroyed(this)).subscribe(res => {
      this.applicantCodeOptions = res ?? [];
    });
    this.dropdownApiService.querySys3100().pipe(untilDestroyed(this)).subscribe(res => {
      this.orgUnitOptions = res ?? [];
    });
    this.dropdownApiService.queryPos2002().pipe(untilDestroyed(this)).subscribe(res => {
      this.locationCodeOptions = res ?? [];
    });
  }

  onSubmit(frm: FormGroup): void {
    if (frm.valid && this.hasPermission(Actions.Query)) {
      // TODO: 查詢 API 整合
      // this.xxxService.query(frm.value).subscribe(...)
    }
  }

  onClearForm(): void {
    this.queryForm.reset();
  }
}
