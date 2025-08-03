import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { POS2004ForUpdateResponse, POS5007Data, Tls24010Service } from '@service/api/tls/tls24010.service';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, formatAmount } from '@shared/componentkit/table/table.model';
import { STORE_WAY } from '../tls24010-cru.model';
import { AutoCompleteSelectEvent } from 'primeng/autocomplete';

@UntilDestroy()
@Component({
  selector: 'app-tls24010-tltno',
  standalone: true,
  imports: [
    TableComponent
  ],
  templateUrl: './tls24010-tltno.component.html',
})
export class Tls24010TltnoComponent implements OnInit, OnChanges {
  @Input() data: POS5007Data[] = [];
  @Input() talent_id?: number;
  @Input() store_way?: string;
  @Input() TXN_Date?: string;
  @Input() TLT_No?: string;
  @Input() Keyword?: string;
  private previousData: POS5007Data[] = [];
  tltIdData: POS5007Data[] = [];
  columns: Column[] = [
    { field: 'PLU_MagNo', header: '商品編號/專櫃編號', type: 'autoComplete', options: [], optionLabel: 'PLU_MagNo', optionValue: 'PLU_MagNo' },
    { field: 'PLU_Name', header: '商品名稱/櫃位名稱' },
    { field: 'TXN_Qty', header: '數量', format: formatAmount },
    { field: 'Unitprice', header: '單價金額', format: formatAmount },
    { field: 'PLU_SalePrc', header: '單價小計金額', format: formatAmount },
    { field: 'TXN_Disc', header: '單價折扣讓金額(負數)', format: formatAmount },
    { field: 'TXN_SaleAmt', header: '單價銷售金額', format: formatAmount },
  ]
  POS2004Options: POS2004ForUpdateResponse[] = []; //下拉選單 商品資料
  constructor(
    private readonly tls24010Service: Tls24010Service
  ) { }
  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
    const newData: POS5007Data[] = changes['data']?.currentValue;

    if (newData?.length > 0 && !this.isSameData(newData, this.previousData)) {
      this.tltIdData = newData.map((item) => ({
        ...item,
        PLU_TaxType: item.PLU_TaxType === '0' ? '免稅' : (item.PLU_TaxType === '1' ? '應稅' : item.PLU_TaxType),
      }));

      this.previousData = newData; // 更新快取版本
    }

    if (changes['store_way']?.currentValue === STORE_WAY.專櫃) {
      this.columns = [
        ...this.columns,
        { field: 'tlt_id', header: '分類抽成類別' },
        { field: 'PLU_TaxType', header: '稅別', },
        { field: 'TXN_DiscName', header: '折扣別', },
      ]
    }
  }
  private isSameData(newData: POS5007Data[], oldData: POS5007Data[]): boolean {
    if (newData.length !== oldData.length) return false;
    return newData.every((item, index) => item.id === oldData[index]?.id);
  }

  filterCountry(event: { rowData: POS5007Data, value: string }): void {
    const query = event.value.toLowerCase();
    if (!query || !this.store_way || !this.TXN_Date || !this.TLT_No || query.length < 5) {
      return;
    }
    const body = {
      Store_way: this.store_way,
      TXN_Date: this.TXN_Date,
      TLT_No: this.TLT_No,
      Keyword: query
    }
    this.tls24010Service.queryPOS2004ForUpdate(body) // !!! 還是留意一下這段api，太多資料會爆炸
      .pipe(untilDestroyed(this))
      .subscribe((response) => {
        this.POS2004Options = response.Data;
        this.columns[0].options = this.POS2004Options;
      });
  }
  onFieldChange(event: { rowData: POS5007Data, field: string, value: AutoCompleteSelectEvent }): void {
    if (event.field === 'PLU_MagNo') {
      const selectedItem = this.POS2004Options.find(item => item.PLU_MagNo === event.value?.value.PLU_MagNo);
      if (selectedItem) {
        event.rowData.PLU_Name = selectedItem.PLU_Name;
      }
    }
  }
}
