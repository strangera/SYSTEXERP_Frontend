import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS32040DetailRequest, TLS32040DetailResponse, TLS32040Request, TLS32040Service } from '@service/api/tls/tls32040.service';
import { IDropdownItem } from '@service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Column, formatAmount, formatPercentage } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

@Component({
  selector: 'app-tls32040-cru',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    TableModule,
    TableReportComponent,
    TranslateModule,
    ButtonModule
  ],
  templateUrl: './tls32040-cru.component.html'
})
export class Tls32040CRUComponent extends BasicCruPageComponent<TLS32040DetailResponse> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    //點選的主檔response
    RowType: [null], // 列別：'TEAM' / 'TeamSum' / 'BUILDING' / 'TOTAL'
    TeamId: [null], // 單位代碼（TEAM / 館別 / 總計用)
    TeamName: [null], // 單位名稱（TEAM / 館別 / 總計顯示用）
    OrgId: [null], // 樓組代碼
    OrgName: [null], // 樓組名稱
    Base_Target: [null], // 本期銷售目標
    Base_SaleAmt: [null], // 本期銷售金額
    Base_AchieveRate: [null], // 本期達成率（銷售金額 / 目標）
    Base_TxnCnt: [null], // 本期交易筆數
    Base_AvgTicket: [null], // 本期客單價（銷售金額 / 來客數)
    Comp_SaleAmt: [null], // 上期銷售金額
    Comp_TxnCnt: [null], // 上期交易筆數
    Comp_AvgTicket: [null], // 上期客單價
    Growth_SaleAmtPct: [null], // 成長比(銷售金額成長率)
    Diff_SaleAmt: [null], // 銷售金額差異（本期 - 上期
    Diff_TxnCnt: [null], // 交易筆數差異
    Diff_AvgTicket: [null], // 客單價差異
    Space: [null], // 營業坪數（坪）
    Base_DaySpaceEff: [null], // 本期日平均坪效（每坪每日銷售

  });
  totalRecords = 0;
  data: TLS32040DetailResponse[] = [];
  historyRequestBody: TLS32040DetailRequest | null = null; //歷史查詢條件

  columns: Column[] = [
    { field: 'RowType', header: '列別', visible: true, align: 'left' },
    { field: 'TeamId', header: '單位代碼', visible: true, align: 'left' },
    { field: 'TeamName', header: '單位名稱', visible: true, align: 'left' },
    { field: 'OrgId', header: '樓組代碼', visible: true, align: 'left' },
    { field: 'OrgName', header: '樓組名稱', visible: true, align: 'left' },
    { field: 'Base_Target', header: '本期銷售目標', visible: true, format: formatAmount, align: 'right' },
    { field: 'Base_SaleAmt', header: '本期銷售金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'Base_AchieveRate', header: '本期達成率', visible: true, format: (value) => formatPercentage(value, 2), align: 'right' },
    { field: 'Base_TxnCnt', header: '本期交易筆數', visible: true, format: formatAmount, align: 'right' },
    { field: 'Base_AvgTicket', header: '本期客單價', visible: true, format: formatAmount, align: 'right' },

    { field: 'Comp_SaleAmt', header: '上期銷售金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'Comp_TxnCnt', header: '上期交易筆數', visible: true, format: formatAmount, align: 'right' },
    { field: 'Comp_AvgTicket', header: '上期客單價', visible: true, format: formatAmount, align: 'right' },
    { field: 'Growth_SaleAmtPct', header: '成長比', visible: true, format: (value) => formatPercentage(value, 2), align: 'right' },

    { field: 'Diff_SaleAmt', header: '銷售金額差異', visible: true, format: formatAmount, align: 'right' },
    { field: 'Diff_TxnCnt', header: '交易筆數差異', visible: true, format: formatAmount, align: 'right' },
    { field: 'Diff_AvgTicket', header: '客單價差異', visible: true, format: formatAmount, align: 'right' },
    { field: 'Space', header: '營業坪數', visible: true, format: formatAmount, align: 'right' },

    { field: 'Base_DaySpaceEff', header: '本期日平均坪效', visible: true, format: formatAmount, align: 'right' },
    { field: 'BaseCustCnt', header: '本期顧客數', visible: true, format: formatAmount, align: 'right' },
    { field: 'CompCustCnt', header: '上期顧客數', visible: true, format: formatAmount, align: 'right' },
    { field: 'TotalSpace', header: '總坪數', visible: true, format: formatAmount, align: 'right' },
    { field: 'BaseDays', header: '基準天數', visible: true, format: formatAmount, align: 'right' },
  ];
  tlt_kind_Option = [
    { value: "1", label: "正櫃" },
    { value: "2", label: "臨時櫃" },
    { value: "3", label: "特賣會" },
    { value: "4", label: "虛擬櫃" },
  ]
  tlt_term_type = [
    { value: "1", label: "固定租金" },
    { value: "2", label: "底租抽成取高者" },
    { value: "3", label: "一般抽成" },
    { value: "4", label: "包底抽成" },
    { value: "5", label: "層級抽成" },
    { value: "6", label: "包底加層級" },
  ]
  tlt_building_Option: IDropdownItem[] = []; // 館別
  tlt_floor_Option: IDropdownItem[] = []; // 樓層
  area_no_Option: IDropdownItem[] = []; // 區域
  bus_type_Option: IDropdownItem[] = []; // 大分類
  bus_class_Option: IDropdownItem[] = []; // 中分類
  bus_sclass_Option: IDropdownItem[] = []; // 小分類
  org_id_Option: IDropdownItem[] = []; // 組織

  //查詢頁查詢條件
  queryConditions!: TLS32040Request;

  // ----------------------------------------------------------------
  constructor(
    public readonly tls32040Service: TLS32040Service,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS32040', this.dataForm);
    const state = this.router.lastSuccessfulNavigation?.extras.state;
    this.queryConditions = state?.['queryConditions'];
    console.log('這是前面的查詢條件', this.queryConditions);
    console.log('讀取資料', this.dataForm.value);

    // 重新讀取類別資料
    if (this.queryConditions) {
      this.queryTLS32040Detail(); // 查詢單組織業績之資料
    } else {
      this.messageService.errorBubble('請返回查詢頁重新操作');
    }
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
  }

  btnLoading = false;
  onReport(isExcel: boolean) {
    const formValue = {
      ...this.queryConditions,
      IsExcel: isExcel,
      IsMerge: true,
      OrgId: this.dataForm.get('OrgId')?.value ?? '',
      BaseDateFrom: formatDate(this.queryConditions.BaseDateFrom, 'yyyy-MM-dd', 'en-US'),
      BaseDateTo: formatDate(this.queryConditions.BaseDateTo, 'yyyy-MM-dd', 'en-US'),
      CompareDateFrom: formatDate(this.queryConditions.CompareDateFrom, 'yyyy-MM-dd', 'en-US'),
      CompareDateTo: formatDate(this.queryConditions.CompareDateTo, 'yyyy-MM-dd', 'en-US'),
    };

    console.log('單組織之營業報表print請求', formValue);

    this.btnLoading = false;
    console.log('送出print請求_api尚未提供');
    // this.tls31020Service.printTLS31020Detail(formValue).pipe(finalize(() => this.btnLoading = false), untilDestroyed(this))
    //   .subscribe(res => {
    //     this.messageService.successBubble(res.Message);
    //     if (res.Data && res.Data.Print_URL) {
    //       const downloadUrl = environment.ApiUrl + res.Data.Print_URL;
    //       window.open(downloadUrl, '_blank');
    //     }
    //   });
  }

  queryTLS32040Detail() {
    // 把 OrgId 從 string[] 轉成 string
    const request = {
      ...this.queryConditions,
      OrgId: this.dataForm.get('OrgId')?.value ?? '',
      BaseDateFrom: formatDate(this.queryConditions.BaseDateFrom, 'yyyy-MM-dd', 'en-US'),
      BaseDateTo: formatDate(this.queryConditions.BaseDateTo, 'yyyy-MM-dd', 'en-US'),
      CompareDateFrom: formatDate(this.queryConditions.CompareDateFrom, 'yyyy-MM-dd', 'en-US'),
      CompareDateTo: formatDate(this.queryConditions.CompareDateTo, 'yyyy-MM-dd', 'en-US'),

      FloorList: ([] as string[]).concat(this.queryConditions.FloorList || []).join(','),
      AreaList: ([] as string[]).concat(this.queryConditions.AreaList || []).join(','),

      BusTypeList: this.toArray(this.queryConditions.BusTypeList).map((x: any) =>
        x.bus_type ?? ''
      ),

      BusClassList: this.toArray(this.queryConditions.BusClassList).map((item: any) => ({
        BusType: item.bus_type ?? '',
        BusClass: item.No ?? ''
      })),
      // 結果範例：[["10", "01", "001"], ["10", "01", "002"]]
      BusSClassList: this.toArray(this.queryConditions.BusSClassList).map((item: any) => ({
        BusType: item.bus_type ?? '',
        BusClass: item.CAT_MNo ?? '',
        BusSClass: item.No ?? ''
      })),

      TltKindList: ([] as string[]).concat(this.queryConditions.TltKindList || []).join(','),
      OrgList: ([] as string[]).concat(this.queryConditions.OrgList || []).join(','),
      TltNoList: ([] as string[]).concat(this.queryConditions.TltNoList || []).join(','),
      TermTypeList: ([] as string[]).concat(this.queryConditions.TermTypeList || []).join(','),
      BuildingList: ([] as string[]).concat(this.queryConditions.BuildingList || []).join(','),
      AmtTaxMode: ([] as string[]).concat(this.queryConditions.AmtTaxMode || []).join(','),
      ReceFilter: ([] as string[]).concat(this.queryConditions.ReceFilter || []).join(','),
    } as TLS32040DetailRequest;

    console.log('單組織之營業報表request', request);
    // console.log('單組織之營業報表request', JSON.stringify(request, null, 2));

    this.tls32040Service.queryTLS32040Detail(request).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
      console.log('單組織之營業報表response', res.Data);
      this.data = res.Data ?? [];               // 查詢資料
      this.historyRequestBody = request;        // 查詢條件
      console.log('明細資料', res.Data);
      this.totalRecords = res.TotalCount;        // 等候端
    })
  }

  toArray(value: any): any[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').filter(x => x);
    return [];
  }
}
