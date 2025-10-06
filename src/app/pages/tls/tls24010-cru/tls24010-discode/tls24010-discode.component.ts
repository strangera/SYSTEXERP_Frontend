import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { POS2004ForUpdateResponse, POS5007Data, Tls24010Service } from '@service/api/tls/tls24010.service';
import { DropDownListService, TltTalentChargeData } from '@service/utility/dropDownList.service';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, formatAmount } from '@shared/componentkit/table/table.model';
import { STORE_WAY } from '../tls24010-cru.model';
@UntilDestroy()
@Component({
  selector: 'app-tls24010-discode',
  standalone: true,
  imports: [
    TableComponent
  ],
  templateUrl: './tls24010-discode.component.html',
})
export class Tls24010DiscodeComponent implements OnInit, OnChanges {
  @Input() TXN_Date?: string;
  @Input() TLT_No?: string;
  @Input() data: POS5007Data[] = [];
  @Input() talent_id?: number//專櫃編號
  private previousData: POS5007Data[] = [];
  discodeData: POS5007Data[] = [];
  columns: Column[] = [
    { field: 'PLU_MagNo', header: '商品編號/專櫃編號' },
    { field: 'PLU_Name', header: '商品名稱/櫃位名稱' },
    { field: 'TXN_Qty', header: '數量', format: formatAmount },
    { field: 'PLU_SalePrc', header: '單價金額', format: formatAmount },
    { field: 'Unitprice', header: '單價小計金額', format: formatAmount },
    { field: 'TXN_Disc', header: '單價折扣讓金額(負數)', format: formatAmount },
    { field: 'TXN_SaleAmt', header: '單價銷售金額', format: formatAmount },
    { field: 'tlt_id_desc', header: '分類抽成類別' },
    { field: 'PLU_TaxType', header: '稅別', },
    { field: 'TXN_DiscCode', header: '折扣別', type: 'dropdown', options: [], optionLabel: 'label', optionValue: 'cag_barcode', filter: false },
  ]
  TXN_DiscCodeOptions: TltTalentChargeData[] = [];
  POS2004Options: POS2004ForUpdateResponse[] = []; //下拉選單 商品資料
  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly tls24010Service: Tls24010Service
  ) { }
  ngOnInit(): void {
    this.dropDownListService.queryTLTTALENT_CHARGE_DropDownList(this.talent_id).pipe(untilDestroyed(this)).subscribe((data) => {
      this.TXN_DiscCodeOptions = data.Data.map((item) => ({ ...item, label: `${item.cag_barcode} - ${item.cag_barcode_name}` }));
      this.columns.find(col => col.field === 'TXN_DiscCode')!.options = this.TXN_DiscCodeOptions;
    })
    const txnDate = this.TXN_Date as unknown as Date
    const body = {
      Store_way: STORE_WAY.專櫃,
      TXN_Date: txnDate ? new Date(txnDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '',
      TLT_No: this.TLT_No
    }
    this.tls24010Service.queryPOS2004ForUpdate(body).pipe(untilDestroyed(this)).subscribe((response) => {
      this.POS2004Options = response.Data;
      if (this.discodeData.length > 0) {
        this.discodeData = this.discodeData.map((item) => ({
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
      this.discodeData = newData.map((item) => ({
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
