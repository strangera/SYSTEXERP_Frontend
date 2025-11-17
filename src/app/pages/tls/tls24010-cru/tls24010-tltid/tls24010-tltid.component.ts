import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { POS2004ForUpdateResponse, POS5007Data, Tls24010Service } from '@service/api/tls/tls24010.service';
import { DropDownListService, TltTalentChargeData } from '@service/utility/dropDownList.service';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, formatAmount } from '@shared/componentkit/table/table.model';
import { STORE_WAY } from '../tls24010-cru.model';

@UntilDestroy()
@Component({
  selector: 'app-tls24010-tltid', // 保持原有的 selector
  standalone: true,
  imports: [
    TableComponent
  ],
  templateUrl: './tls24010-tltid.component.html',
})
export class Tls24010TltidComponent implements OnInit, OnChanges {
  @Input() TXN_Date?: string;
  @Input() TLT_No?: string;
  @Input() data: POS5007Data[] = [];
  @Input() talent_id?: number//專櫃編號

  private previousData: POS5007Data[] = [];
  tltIdData: POS5007Data[] = [];

  columns: Column[] = [
    { field: 'PLU_MagNo', header: '商品編號/專櫃編號' },
    { field: 'PLU_Name', header: '商品名稱/櫃位名稱' },
    { field: 'TXN_Qty', header: '數量', format: formatAmount },
    { field: 'PLU_SalePrc', header: '單價金額', format: formatAmount },
    { field: 'Unitprice', header: '單價小計金額', format: formatAmount },
    { field: 'TXN_Disc', header: '單價折扣讓金額(負數)', format: formatAmount },
    { field: 'TXN_SaleAmt', header: '單價銷售金額', format: formatAmount },
    { field: 'tlt_id', header: '分類抽成類別', type: 'dropdown', options: [], optionLabel: 'label', optionValue: 'tlt_id' },
    { field: 'PLU_TaxType', header: '稅別', },
    { field: 'TXN_DiscName', header: '折扣別' },
  ]
  // 新增 currentColumns 以修正非同步載入的競態條件問題
  currentColumns: Column[] = [...this.columns];

  tlt_idOptions: TltTalentChargeData[] = []; //下拉選單 類別
  POS2004Options: POS2004ForUpdateResponse[] = []; //下拉選單 商品資料

  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly tls24010Service: Tls24010Service
  ) { }

  ngOnInit(): void {
    this.dropDownListService.queryTLTTALENT_CHARGE_DropDownList(this.talent_id).pipe(untilDestroyed(this)).subscribe((data) => {

      // --- 【新增的去重邏輯：根據 tlt_id 去重】 ---
      const seenTltIds = new Set<string | number>();
      const uniqueData = data.Data.filter(item => {
        // 假設 tlt_id 可能是字串或數字
        const id = item.tlt_id;
        const isDuplicate = seenTltIds.has(id);
        seenTltIds.add(id);
        return !isDuplicate; // 只保留未重複的項目
      });
      // --- 【去重邏輯結束】 ---

      // 將去重後的資料進行 map 轉換
      this.tlt_idOptions = uniqueData.map((item) => ({
        ...item,
        label: `${item.tlt_id} - ${item.tlt_id_desc}`
      }));

      // 更新 currentColumns 確保變動偵測生效
      // 【競態條件修正】: 建立新陣列來觸發變動偵測
      this.currentColumns = this.columns.map(col => {
        if (col.field === 'tlt_id') {
          // 返回一個包含新 options 的新物件
          return { ...col, options: this.tlt_idOptions };
        }
        return col;
      });
    })

    const txnDate = this.TXN_Date as unknown as Date
    const body = {
      Store_way: STORE_WAY.專櫃,
      TXN_Date: txnDate ? new Date(txnDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '',
      Keyword: this.TLT_No
    }

    this.tls24010Service.queryPOS2004ForUpdate(body).pipe(untilDestroyed(this)).subscribe((response) => {
      this.POS2004Options = response.Data;
      if (this.tltIdData.length > 0) {
        this.tltIdData = this.tltIdData.map((item) => ({
          ...item,
          PLU_TaxType: item.PLU_TaxType === '0' ? '免稅' : (item.PLU_TaxType === '1' ? '應稅' : item.PLU_TaxType),
          PLU_Name: this.POS2004Options.find((option) => option.TLT_No === item.PLU_MagNo)?.TLT_Name || '',
        }));
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const newData: POS5007Data[] = changes['data']?.currentValue;
    if (newData?.length > 0 && !this.isSameData(newData, this.previousData)) {
      this.tltIdData = newData.map((item) => ({
        ...item,
        PLU_TaxType: item.PLU_TaxType === '0' ? '免稅' : (item.PLU_TaxType === '1' ? '應稅' : item.PLU_TaxType),
        PLU_Name: this.POS2004Options.find((option) => option.TLT_No === item.PLU_MagNo)?.TLT_Name || '',
      }));

      this.previousData = newData; // 更新快取版本
    }
  }

  private isSameData(newData: POS5007Data[], oldData: POS5007Data[]): boolean {
    if (newData.length !== oldData.length) return false;
    return newData.every((item, index) => item.id === oldData[index]?.id);
  }
}
