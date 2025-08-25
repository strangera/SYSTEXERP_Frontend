import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, convertDateToYYYYMM, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { option } from '@shared/models/sys/sysb000.model';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { JsonPipe } from '@angular/common';
//
/** TDS1002 營業人銷售額與稅額申報書檔 */
export interface TDS1002 {
  // 這個table有點神奇，沒有id(先新增一個)
  id: number;

  /** 分店編號 */
  STO_No: string;

  /** 資料所屬年月 */
  REP_GUIYM: string;

  /** 資料別 (1代表401；3代表403；4代表404) */
  REP_DataType?: string | null;

  /** 統一編號 */
  REP_Uniform?: string | null;

  /** 申報次數 (1代表總繳代號0或2；5代表總繳代號1) */
  REP_Times?: string | null;

  /** 稅籍編號 */
  REP_TaxNo: string;

  /** 總繳代號 (0單一機構/分別申報；1總機構彙總；2各單位分別申報) */
  REP_OrgCode?: string | null;

  /** 申報種類 (1按期；2按月) */
  REP_MonthType?: string | null;

  /** 縣市別 (A台北市；F台北縣) */
  REP_CityCode?: string | null;

  /** 營業人名稱 */
  REP_TaxName?: string | null;

  /** 負責人姓名 */
  REP_ManagerName?: string | null;

  /** 營業地址 */
  REP_Addr?: string | null;

  /** 使用發票份數 */
  REP_GuiCnt?: number | null;

  /** (31)三聯式發票、電子計算機發票 */
  REP_SalSAmt_31?: number | null;
  /** (35)收銀機發票(三聯式) */
  REP_SalSAmt_35?: number | null;
  /** (32)二聯式發票、收銀機發票(二聯式) */
  REP_SalSAmt_32?: number | null;
  /** (36)免用發票 */
  REP_SalSAmt_36?: number | null;
  /** (33、34)退回及折讓 */
  REP_SalSAmt_RE?: number | null;
  /** 應稅銷售額合計 */
  REP_SalSAmt_Sum?: number | null;

  /** (31)三聯式發票、電子計算機發票 */
  REP_SalTaxAmt_31?: number | null;
  /** (35)收銀機發票(三聯式) */
  REP_SalTaxAmt_35?: number | null;
  /** (32)二聯式發票、收銀機發票(二聯式) */
  REP_SalTaxAmt_32?: number | null;
  /** (36)免用發票 */
  REP_SalTaxAmt_36?: number | null;
  /** (33、34)退回及折讓 */
  REP_SalTaxAmt_RE?: number | null;
  /** 應稅稅額合計 */
  REP_SalTaxAmt_Sum?: number | null;

  /** 零稅率銷售額 - 不使用 */
  REP_SalZeoTaxAmt_31?: number | null;
  /** 零稅率銷售額 - 非經海關出口應附證明文件者 */
  REP_SalZeoTaxAmt_35?: number | null;
  /** 零稅率銷售額 - 不使用 */
  REP_SalZeoTaxAmt_32?: number | null;
  /** 零稅率銷售額 - 經海關出口免附證明文件者 */
  REP_SalZeoTaxAmt_36?: number | null;
  /** 零稅率銷售額 - 退回及折讓 */
  REP_SalZeoTaxAmt_RE?: number | null;
  /** 零稅率銷售額合計 */
  REP_SalZeoTaxAmt_Sum?: number | null;

  /** 免稅銷售額 (31) */
  REP_SalNoTaxAmt_31?: number | null;
  /** 免稅銷售額 (35) */
  REP_SalNoTaxAmt_35?: number | null;
  /** 免稅銷售額 (32) */
  REP_SalNoTaxAmt_32?: number | null;
  /** 免稅銷售額 (36) */
  REP_SalNoTaxAmt_36?: number | null;
  /** 免稅銷售額 - 退回及折讓 */
  REP_SalNoTaxAmt_RE?: number | null;
  /** 免稅銷售額合計 */
  REP_SalNoTaxAmt_Sum?: number | null;

  /** 特種飲食25% 銷售額 */
  REP_SalSPSAmt_25?: number | null;
  /** 特種飲食15% 銷售額 */
  REP_SalSPSAmt_15?: number | null;
  /** 銀行保險及信託投資-專屬本業收入2% 銷售額 */
  REP_SalSPSAmt_2?: number | null;
  /** 銀行保險及信託投資-非專屬本業收入5% 銷售額 */
  REP_SalSPSAmt_5?: number | null;
  /** 再保收入 1% 銷售額 */
  REP_SalSPSAmt_1?: number | null;
  /** 特種免稅收入 */
  REP_SalSPSAmt_No?: number | null;
  /** 特種 - 退回及折讓 */
  REP_SalSPSAmt_RE?: number | null;
  /** 特種銷售額合計 */
  REP_SalSPSAmt_Sum?: number | null;

  /** 特種飲食25% 稅額 */
  REP_SalSPTax_25?: number | null;
  /** 特種飲食15% 稅額 */
  REP_SalSPTax_15?: number | null;
  /** 銀行保險及信託投資-專屬本業收入2% 稅額 */
  REP_SalSPTax_2?: number | null;
  /** 銀行保險及信託投資-非專屬本業收入5% 稅額 */
  REP_SalSPTax_5?: number | null;
  /** 再保收入 1% 稅額 */
  REP_SalSPTax_1?: number | null;
  /** 特種 - 退回及折讓 稅額 */
  REP_SalSPTax_RE?: number | null;
  /** 特種銷售稅額合計 */
  REP_SalSPTax_Sum?: number | null;

  /** 銷售額總計 = 應稅 + 零稅率 + 免稅 + 特種 */
  REP_SalTotalSaleAmt?: number | null;

  /** 內含銷售土地 */
  REP_SalLand?: number | null;
  /** 內含銷售固定資產 */
  REP_SalAssets?: number | null;

  /** 進貨及費用金額 - (21、26)統一發票扣抵聯 */
  REP_PurAmt_f21?: number | null;
  /** (25)三聯式收銀機發票扣抵聯 */
  REP_PurAmt_f25?: number | null;
  /** (22、27)其他憑證 */
  REP_PurAmt_f22?: number | null;
  /** (28)海關代徵營業稅 */
  REP_PurAmt_f28?: number | null;
  /** (23、24、29)退出、折讓等 */
  REP_PurAmt_fRE?: number | null;

  /** 進貨及費用稅額 - (21、26)統一發票扣抵聯 */
  REP_PurTax_f21?: number | null;
  REP_PurTax_f25?: number | null;
  REP_PurTax_f22?: number | null;
  REP_PurTax_f28?: number | null;
  REP_PurTax_fRE?: number | null;

  /** 固定資產金額 */
  REP_PurAmt_c21?: number | null;
  REP_PurAmt_c25?: number | null;
  REP_PurAmt_c22?: number | null;
  REP_PurAmt_c28?: number | null;
  REP_PurAmt_cRE?: number | null;

  /** 固定資產稅額 */
  REP_PurTax_c21?: number | null;
  REP_PurTax_c25?: number | null;
  REP_PurTax_c22?: number | null;
  REP_PurTax_c28?: number | null;
  REP_PurTax_cRE?: number | null;

  /** 進貨及費用金額合計 */
  REP_PurAmt_fSum?: number | null;
  /** 進貨及費用稅額合計 */
  REP_PurTax_fSum?: number | null;
  /** 固定資產金額合計 */
  REP_PurAmt_cSum?: number | null;
  /** 固定資產稅額合計 */
  REP_PurTax_cSum?: number | null;

  /** 進貨及費用總額 */
  REP_PurfTotalSaleAmt?: number | null;
  /** 固定資產總額 */
  REP_PurcTotalSaleAmt?: number | null;

  /** 不得扣抵比例 */
  REP_NotToCounteractRate?: number | null;
  /** 得扣抵之進項稅額 */
  REP_ToCounteractTax?: number | null;

  /** 進口免稅貨物 */
  REP_PurImportNoTax?: number | null;
  /** 購買國外勞務給付額 */
  REP_PurBuyExternal?: number | null;
  /** 購買國外勞務-應比例計算進項稅額 */
  REP_PurBuyExternal75?: number | null;
  /** 購買國外勞務-應納稅額 */
  REP_PurBuyExternal76?: number | null;

  /** 1. 本期(月)銷項稅額合計 */
  REP_TaxSum01?: number | null;
  /** 2. 進口貨物應納稅額 */
  REP_TaxSum02?: number | null;
  /** 3. 購買國外勞務應納稅額 */
  REP_TaxSum03?: number | null;
  /** 4. 特種稅額計算應納稅額 */
  REP_TaxSum04?: number | null;
  /** 5. 中途歇業/年底補徵 */
  REP_TaxSum05?: number | null;
  /** 6. 小計(1+3+4+5) */
  REP_TaxSum06?: number | null;
  /** 7. 得扣抵進項稅額合計 */
  REP_TaxSum07?: number | null;
  /** 8. 上期累積留抵稅額 */
  REP_TaxSum08?: number | null;
  /** 9. 中途歇業/年底退稅 */
  REP_TaxSum09?: number | null;
  /** 10. 小計(7+8+9) */
  REP_TaxSum10?: number | null;
  /** 11. 本期應實繳稅額(6-10) */
  REP_TaxSum11?: number | null;
  /** 12. 本期申報留抵稅額(10-6) */
  REP_TaxSum12?: number | null;
  /** 13. 得退稅限額合計 */
  REP_TaxSum13?: number | null;
  /** 14. 本期應退稅額 */
  REP_TaxSum14?: number | null;
  /** 15. 本期累積留抵稅額(12-14) */
  REP_TaxSum15?: number | null;

  /** 免稅出口區/保稅區銷售額 */
  REP_NoPublishInvoice?: number | null;

  // 能否刪除
  CanDel: boolean;
}

//1.1.4.3 形成申報書
@Component({
    selector: 'app-fin14030',
    templateUrl: './fin14030.component.html',
    styleUrl: './fin14030.component.scss',
    standalone: true,
    imports: [
          MenubarComponent,
          ButtonComponent,
          Button, // dialog
          JsonPipe, // dialog
          DialogModule, // dialog
          AccordionModule,
          FormsModule,
          ReactiveFormsModule,
          CalendarComponent,
          DropdownComponent,
          TableComponent,
          TranslateModule]
})
export class FIN14030Component extends BasicQueryPageComponent<unknown> implements OnInit {
  queryForm = this.formBuilder.group({
    INV_DeclareYM: [null, Validators.required], //申報年月
    REP_TaxNo: [null, Validators.required], //稅籍編號

    ...createPaginationConfig([{ field: 'INV_DeclareYM', order: 1 }]), // 分頁和排序參數
  });

  // ---彈出視窗控制選項---
  showDialog = false;        // 控制 dialog 開關
  dialogData: any = {};      // 用來存放送出後的 form 值
  auditMode: '審核' | '反審核' = '審核'; // 標題用，可根據需求切換

  totalRecords = 0; // 總記錄數
  data: Record<string, string>[] = [];
  selectedItems: Record<string, string> = {}; // 用於儲存選中的項目

  REP_TaxNo_Options: option[] = [
    {label: '選項1', value: '1'},
    {label: '選項2', value: '2'},
  ]; //稅籍編號 選項
  
  columns: Column[] = [
    { field: 'field', header: '欄位' }, // 欄位定義
  ];
  constructor() {
    super();
  }
  ngOnInit(): void {
    this.initializePage('FIN14030', '/FIN/FIN14030cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        INV_DeclareYM: convertDateToYYYYMM(frm.value.INV_DeclareYM),
      }
      
      console.log('申報request', body);

      // 這裡彈窗顯示
      this.dialogData = body;
      this.auditMode = '審核';   // 或者根據狀態切換 '反審核'
      this.showDialog = true;
      
      // this.fin14010Service.queryFIN11020(body).pipe(untilDestroyed(this)).subscribe({
      //   next: (response) => {
      //     this.data = response.Data.map((item: TDS1002) => ({
      //       ...item,
      //       REP_GUIYM: convertYYYYMMToDate(item.REP_GUIYM)
      //     }));
      //     this.totalRecords = response.TotalCount;
      //     this.queryStateService.setQueryState(this.ProgNo, frm.value);
      //     this.loading = false;
      //   },
      //   error: () => { this.loading = false; },
      // });
    });
  }

  // 彈出視窗控制
   confirmAction() {
    console.log(`${this.auditMode} 確認`, this.dialogData);
    this.showDialog = false;
  }

  cancelAction() {
    this.showDialog = false;
  }
}
