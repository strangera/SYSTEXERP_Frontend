import { Component, Host, Input, OnChanges, Optional, SimpleChanges } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { POS2004ForUpdateResponse, POS5007Data, Tls24010Service } from '@service/api/tls/tls24010.service';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, formatAmount } from '@shared/componentkit/table/table.model';
import { STORE_WAY } from '../tls24010-cru.model';
import { AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { TLS24010CRUComponent } from '../tls24010-cru.component';
import { IDropdownItem, POS2004Item } from '@service/utility/dropDownList.service';

@UntilDestroy()
@Component({
  selector: 'app-tls24010-tltno',
  standalone: true,
  imports: [
    TableComponent
  ],
  templateUrl: './tls24010-tltno.component.html',
})
export class Tls24010TltnoComponent implements OnChanges {
  @Input() data: POS5007Data[] = [];
  @Input() talent_id?: number;
  @Input() store_way?: string;
  @Input() TXN_Date?: string;
  @Input() TLT_No?: string;
  @Input() Keyword?: string;
  @Input() TLT_NoOptions?: IDropdownItem[] = [];
  private previousData: POS5007Data[] = [];
  tltIdData: POS5007Data[] = [];
  columns: Column[] = [
    { field: 'PLU_MagNo', header: '商品編號/專櫃編號', type: 'autoComplete', options: [], templateLabel: 'label', optionLabel: 'PLU_MagNo' },
    { field: 'PLU_Name', header: '商品名稱/櫃位名稱' },
    { field: 'TXN_Qty', header: '數量', format: formatAmount },
    { field: 'PLU_SalePrc', header: '單價金額', format: formatAmount },
    { field: 'Unitprice', header: '單價小計金額', format: formatAmount },
    { field: 'TXN_Disc', header: '單價折扣讓金額(負數)', format: formatAmount },
    { field: 'TXN_SaleAmt', header: '單價銷售金額', format: formatAmount },
  ]
  POS2004Options: POS2004ForUpdateResponse[] = []; //下拉選單 商品資料
  constructor(
    private readonly tls24010Service: Tls24010Service,
    @Optional() @Host() public tls24010?: TLS24010CRUComponent
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    const newData: POS5007Data[] = changes['data']?.currentValue;
    if (newData?.length > 0 && !this.isSameData(newData, this.previousData)) {
      this.tltIdData = newData;
      this.previousData = newData; // 更新快取版本
    }

    if (changes['store_way']?.currentValue === STORE_WAY.專櫃) {
      this.columns = [
        ...this.columns,
        { field: 'tlt_id_desc', header: '分類抽成類別' },
        { field: 'PLU_TaxType', header: '稅別', format: (value: string) => value === '0' ? '免稅' : (value === '1' ? '應稅' : value) },
        { field: 'TXN_DiscName', header: '折扣別', },
      ]
    }
  }
  private isSameData(newData: POS5007Data[], oldData: POS5007Data[]): boolean {
    if (newData.length !== oldData.length) return false;
    return newData.every((item, index) => item.id === oldData[index]?.id);
  }
  // 過濾PLU_MagNo
  filterPLU_MagNo(event: { rowData: POS5007Data, value: string }): void {
    const query = event.value.toLowerCase();
    if (!query || !this.store_way || !this.TXN_Date || !this.TLT_No || query.length < 9) {
      return;
    }
    const txnDate = this.TXN_Date as unknown as Date
    const body = {
      Store_way: this.store_way,
      TXN_Date: txnDate ? txnDate.toISOString().split('T')[0] : '',
      Keyword: query
    }
    this.tls24010Service.queryPOS2004ForUpdate(body).pipe(untilDestroyed(this)).subscribe((response) => {
      const newPOS2004Options = response.Data.map((item, index) => ({
        ...item,
        id: index,
        label: `${item.PLU_MagNo} - ${item.PLU_No} - ${item.PLU_OrgPLUNo} - ${item.PLU_Name}`
      }));
      const updatedColumn = {
        ...this.columns[0], // 複製原有屬性
        options: newPOS2004Options // 賦予新的 options
      };
      this.columns = [
        updatedColumn, // 放入更新後的 column
        ...this.columns.slice(1) // 放入其他未變動的 columns
      ];
    });
  }
  onFieldChange(event: { rowData: POS5007Data, field: string, value: AutoCompleteSelectEvent, index?: number }): void {
    const selectedItem = this.POS2004Options.find(item => item.PLU_MagNo === event.value?.value.PLU_MagNo);
    if (selectedItem) {
      event.rowData.PLU_Name = selectedItem.PLU_Name;
      event.rowData.TLT_No = selectedItem.TLT_No;
      event.rowData.PLU_No = selectedItem.PLU_No;
      event.rowData.Talent_ID = selectedItem.talent_id;
      event.rowData.Contract_No = selectedItem.Contract_No;
      event.rowData.Contract_SubNo = selectedItem.Contract_SubNo;
    }
    if (this.store_way === STORE_WAY.專櫃) {
      const selectedItem = this.POS2004Options.find(item => item.id === (event.value as unknown as POS2004Item).id);
      if (selectedItem) {
        event.rowData.tlt_id_desc = selectedItem.tlt_id_desc;
        event.rowData.TXN_DiscName = selectedItem.cag_barcode_name;
      }
    }
  }
}
