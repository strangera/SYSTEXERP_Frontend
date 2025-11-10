import { Component, Host, Input, OnChanges, Optional, SimpleChanges } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { POS2004ForUpdateResponse, POS5007Data, Tls24010Service } from '@service/api/tls/tls24010.service';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, formatAmount } from '@shared/componentkit/table/table.model';
import { STORE_WAY } from '../tls24010-cru.model';
import { AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { TLS24010CRUComponent } from '../tls24010-cru.component';
import { IDropdownItem } from '@service/utility/dropDownList.service';

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
      const updatedColumn = {
        ...this.columns[0], // 複製所有舊屬性
        optionLabel: 'TLT_No'  // 替換 options 屬性
      };
      // 替換整個 columns 陣列中的第一個元素
      this.columns = [
        updatedColumn,
        ...this.columns.slice(1) // 保持其他欄位不變
      ];
    }
  }
  private isSameData(newData: POS5007Data[], oldData: POS5007Data[]): boolean {
    if (newData.length !== oldData.length) return false;
    return newData.every((item, index) => item.id === oldData[index]?.id);
  }
  // 過濾PLU_MagNo
  filterPLU_MagNo(event: { rowData: POS5007Data, value: string }): void {
    const query = event.value.toLowerCase();

    if (!query || !this.store_way || !this.TXN_Date || !this.TLT_No || query.length < 6) {
      return;
    }
    const txnDate = this.TXN_Date as unknown as Date
    const formatToLocalISO = (date: Date) => {
      // 檢查 date 是否為有效的 Date 物件
      if (!date || isNaN(date.getTime())) {
        return '';
      }

      // 取得本地時間的年、月、日
      const year = date.getFullYear();
      // getMonth() 回傳 0-11，所以要 +1
      const month = date.getMonth() + 1;
      const day = date.getDate();

      // 格式化為 YYYY-MM-DD (確保月和日有兩位數，不足補零)
      const formattedMonth = String(month).padStart(2, '0');
      const formattedDay = String(day).padStart(2, '0');

      return `${year}-${formattedMonth}-${formattedDay}`;
    };
    const body = {
      Store_way: this.store_way,
      TXN_Date: txnDate ? formatToLocalISO(txnDate) : '',
      Keyword: query
    }
    this.tls24010Service.queryPOS2004ForUpdate(body).pipe(untilDestroyed(this)).subscribe((response) => {
      const newPOS2004Options = response.Data.map((item, index) => ({
        ...item,
        id: index,
        label: this.store_way === STORE_WAY.自營 ? `${item.PLU_MagNo} - ${item.PLU_No} - ${item.PLU_OrgPLUNo} - ${item.PLU_Name}` :
          `${item.TLT_No} - ${item.TLT_Name}`
      }));
      this.POS2004Options = newPOS2004Options;
      const updatedColumn = {
        ...this.columns[0], // 複製所有舊屬性
        options: newPOS2004Options // 替換 options 屬性
      };
      // 替換整個 columns 陣列中的第一個元素
      this.columns = [
        updatedColumn,
        ...this.columns.slice(1) // 保持其他欄位不變
      ];
    });
  }
  onFieldChange(event: { rowData: POS5007Data, field: string, value: AutoCompleteSelectEvent, index?: number }): void {
    console.log(event.rowData);
    if (this.store_way === STORE_WAY.自營) {
      const selectedItem = this.POS2004Options.find(item => item.PLU_MagNo === event.value?.value.PLU_MagNo);
      console.log(selectedItem);
      if (!selectedItem) { return; }
      event.rowData.PLU_Name = selectedItem.PLU_Name;
      event.rowData.TLT_No = selectedItem.TLT_No;
      event.rowData.Talent_ID = selectedItem.talent_id;
      event.rowData.Contract_No = selectedItem.Contract_No;
      event.rowData.Contract_SubNo = selectedItem.Contract_SubNo;
    } else if (this.store_way === STORE_WAY.專櫃) {
      const selectedItem = this.POS2004Options.find(item => item.talent_id === event.value?.value.talent_id);
      console.log(selectedItem);
      if (!selectedItem) { return; }
      event.rowData.PLU_Name = selectedItem.TLT_Name;
      event.rowData.PLU_No = selectedItem.TLT_No;
      event.rowData.TLT_No = selectedItem.TLT_No;
      event.rowData.Talent_ID = selectedItem.talent_id;
      event.rowData.Contract_No = selectedItem.Contract_No;
      event.rowData.Contract_SubNo = selectedItem.Contract_SubNo;
      event.rowData.tlt_id = selectedItem.tlt_id;
    }
  }
}
