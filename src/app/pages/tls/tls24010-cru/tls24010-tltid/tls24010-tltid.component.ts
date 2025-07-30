import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { POS5007Data } from '@service/api/tls/tls24010.service';
import { DropDownListService, TLTTALENT_CHARGEData } from '@service/utility/dropDownList.service';
import { TableComponent } from '@shared/componentkit';
import { Column, formatAmount } from '@shared/componentkit/table/table.model';
@UntilDestroy()
@Component({
  selector: 'app-tls24010-tltid',
  standalone: true,
  imports: [
    TableComponent
  ],
  templateUrl: './tls24010-tltid.component.html',
})
export class Tls24010TltidComponent implements OnInit, OnChanges {
  @Input() data: POS5007Data[] = [];
  @Input() talent_id?: number//專櫃編號
  private previousData: POS5007Data[] = [];
  tltIdData: POS5007Data[] = [];
  columns: Column[] = [
    { field: 'PLU_MagNo', header: '商品編號/專櫃編號' },
    { field: 'PLU_Name', header: '商品名稱/櫃位名稱' },
    { field: 'TXN_Qty', header: '數量', format: formatAmount },
    { field: 'Unitprice', header: '單價金額', format: formatAmount },
    { field: 'PLU_SalePrc', header: '單價小計金額', format: formatAmount },
    { field: 'TXN_Disc', header: '單價折扣讓金額(負數)', format: formatAmount },
    { field: 'TXN_SaleAmt', header: '單價銷售金額', format: formatAmount },
    { field: 'PRM_TLT_ID', header: '修正前-分類抽成類別', },
    { field: 'tlt_id', header: '分類抽成類別', type: 'dropdown', options: [], optionLabel: 'label', optionValue: 'tlt_id' },
    { field: 'PLU_TaxType', header: '稅別', },
    { field: 'TXN_DiscName', header: '折扣別', },
  ]
  tlt_idOptions: TLTTALENT_CHARGEData[] = []; //下拉選單 類別
  constructor(
    private readonly dropDownListService: DropDownListService,
  ) { }
  ngOnInit(): void {
    this.dropDownListService.queryTLTTALENT_CHARGE_DropDownList(this.talent_id).pipe(untilDestroyed(this)).subscribe((data) => {
      this.tlt_idOptions = data.Data.map((item) => ({ ...item, label: `${item.tlt_id} - ${item.tlt_id_desc}` }));
      this.columns.find(col => col.field === 'tlt_id')!.options = this.tlt_idOptions;
    })
  }
  ngOnChanges(changes: SimpleChanges): void {
    const newData: POS5007Data[] = changes['data']?.currentValue;

    if (newData?.length > 0 && !this.isSameData(newData, this.previousData)) {
      this.tltIdData = newData.map((item) => ({
        ...item,
        PRM_TLT_ID: item.tlt_id,
        PLU_TaxType: item.PLU_TaxType === '0' ? '免稅' : (item.PLU_TaxType === '1' ? '應稅' : item.PLU_TaxType),
      }));

      this.previousData = newData; // 更新快取版本
    }
  }
  private isSameData(newData: POS5007Data[], oldData: POS5007Data[]): boolean {
    if (newData.length !== oldData.length) return false;
    return newData.every((item, index) => item.id === oldData[index]?.id);
  }
}
