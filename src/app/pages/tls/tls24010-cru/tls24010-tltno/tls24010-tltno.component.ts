import { DatePipe } from '@angular/common';
import { Component, Host, Input, OnChanges, Optional, SimpleChanges } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { POS2004ForUpdateResponse, POS5007Data, Tls24010Service } from '@service/api/tls/tls24010.service';
import { getSYS1000 } from '@service/system/sys1000.service';
import { IDropdownItem } from '@service/utility/dropDownList.service';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { formatAmount } from '@others/component/table/table.model';
import { map, of } from 'rxjs';
import { TLS24010CRUComponent } from '../tls24010-cru.component';
import { STORE_WAY } from '../tls24010-cru.model';

@UntilDestroy()
@Component({
  selector: 'app-tls24010-tltno',
  standalone: true,
  imports: [
    TableEditComponent
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
  private readonly baseColumns: EditColumn[] = [
    {
      field: 'PLU_MagNo',
      header: '商品編號/專櫃編號',
      type: 'autoComplete',
      optionsAsync: true,
      options: (rowData: any, query: string) => this.getPLUOptionsAsync(query),
      templateLabel: 'label',
      optionLabel: this.store_way === STORE_WAY.專櫃 ? 'TLT_No' : 'PLU_MagNo'
    },
    { field: 'Contract_SubNo', header: '合約版本' },
    { field: 'PLU_Name', header: '商品名稱/櫃位名稱' },
    { field: 'TXN_Qty', header: '數量', format: formatAmount },
    { field: 'PLU_SalePrc', header: '單價金額', format: formatAmount },
    { field: 'Unitprice', header: '單價小計金額', format: formatAmount },
    { field: 'TXN_Disc', header: '單價折扣讓金額(負數)', format: formatAmount },
    { field: 'TXN_SaleAmt', header: '單價銷售金額', format: formatAmount },
  ];
  editColumn: EditColumn[] = [...this.baseColumns];
  POS2004Options: POS2004ForUpdateResponse[] = []; //下拉選單 商品資料
  private initialExistingIds = new Set<string | number>();
  constructor(
    private readonly tls24010Service: Tls24010Service,
    private readonly datePipe: DatePipe,
    @Optional() @Host() public tls24010?: TLS24010CRUComponent
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    const newData: POS5007Data[] = changes['data']?.currentValue;
    if (changes['data'] && newData) {
      this.initialExistingIds.clear();
      newData.forEach(item => {
        if (this.store_way === STORE_WAY.自營) {
          // 紀錄原始 MagNo
          const magNo = typeof item.PLU_MagNo === 'object' ? (item.PLU_MagNo as any).PLU_MagNo : item.PLU_MagNo;
          if (magNo) this.initialExistingIds.add(magNo);
        } else {
          // 紀錄原始 Talent_ID
          if (item.Talent_ID) this.initialExistingIds.add(item.Talent_ID);
        }
      });
    }
    if (newData?.length > 0 && !this.isSameData(newData, this.previousData)) {

      this.tltIdData = newData.map(item => {
        const isStoreWaySpecial = this.store_way === STORE_WAY.專櫃;

        // 1. 決定目前的 MagNo (如果是專櫃，就強迫拿 TLT_No；自營則拿原始 MagNo)
        const currentMagNo = typeof item.PLU_MagNo === 'object'
          ? (item.PLU_MagNo as any).PLU_MagNo
          : item.PLU_MagNo;

        //  關鍵邏輯分流：
        // 專櫃：TLT_No 是老大的，PLU_MagNo 也要吃它
        // 自營：各有各的，維持原狀
        const finalTLTNo = item.TLT_No || (isStoreWaySpecial ? currentMagNo : '');
        const finalMagNoForObject = isStoreWaySpecial ? finalTLTNo : currentMagNo;
        console.log(item);

        // 2. 包裝給父層使用的物件 (滿足 as POS2004Item)
        const wrappedObject = {
          PLU_MagNo: finalMagNoForObject,
          PLU_No: isStoreWaySpecial ? finalTLTNo : item.PLU_No, // 專櫃時 PLU_No 也補 TLT_No
          PLU_Name: item.PLU_Name,
          TLT_No: finalTLTNo,
          TLT_Name: item.PLU_Name,
          Contract_No: item.Contract_No,
          Contract_SubNo: item.Contract_SubNo,
          tlt_id: item.tlt_id || '0',
          talent_id: item.Talent_ID,
          cag_barcode: item.TXN_DiscCode || '000'
        };

        // 3. 回傳符合 POS5007Data 結構的物件
        return {
          ...item,
          TLT_No: finalTLTNo,
          PLU_MagNo: wrappedObject as any,
          PLU_Name: wrappedObject.PLU_Name,
        } as POS5007Data;
      });

      this.previousData = newData;
    }

    if (changes['store_way'] || changes['data']) {
      const isStore = this.store_way === STORE_WAY.專櫃;

      let newColumns = [...this.baseColumns];

      // 修正：動態切換第一欄的 optionLabel
      newColumns[0] = {
        ...newColumns[0],
        optionLabel: isStore ? 'TLT_No' : 'PLU_MagNo'
      };

      // 修正：重新加入不見的「專櫃模式專用欄位」
      if (isStore) {
        newColumns = [
          ...newColumns,
          { field: 'tlt_id_desc', header: '分類抽成類別', disabled: () => true },
          {
            field: 'PLU_TaxType',
            header: '稅別',
            format: (v) => getSYS1000('PLU_TaxType', v)
          },
          { field: 'TXN_DiscName', header: '折扣別', disabled: () => true },
        ];
      }

      this.editColumn = newColumns;
    }
  }
  private isSameData(newData: POS5007Data[], oldData: POS5007Data[]): boolean {
    if (newData.length !== oldData.length) return false;
    return newData.every((item, index) => item.id === oldData[index]?.id);
  }
  onFieldChange(event: { rowData: POS5007Data, field: string, value: any, index?: number }): void {
    // 取得選中的完整物件
    const selectedItem = event.value as POS2004ForUpdateResponse;
    if (!selectedItem) return;

    // 重要：為了讓父層的 `item.PLU_MagNo as POS2004Item` 能過關
    // 我們必須把選中的完整物件 assign 回這個 field
    event.rowData.PLU_MagNo = selectedItem as any;

    if (this.store_way === STORE_WAY.自營) {
      event.rowData.PLU_Name = selectedItem.PLU_Name;
      event.rowData.TLT_No = selectedItem.TLT_No;
      event.rowData.Talent_ID = selectedItem.talent_id;
      event.rowData.Contract_No = selectedItem.Contract_No;
      event.rowData.Contract_SubNo = selectedItem.Contract_SubNo;
    } else if (this.store_way === STORE_WAY.專櫃) {
      event.rowData.PLU_Name = selectedItem.TLT_Name;
      event.rowData.PLU_No = selectedItem.TLT_No;
      event.rowData.TLT_No = selectedItem.TLT_No;
      event.rowData.Talent_ID = selectedItem.talent_id;
      event.rowData.Contract_No = selectedItem.Contract_No;
      event.rowData.Contract_SubNo = selectedItem.Contract_SubNo;
      event.rowData.tlt_id = selectedItem.tlt_id;
    }
  }
  getPLUOptionsAsync(query: string) {
    const TXN_Date = this.datePipe.transform(this.TXN_Date, 'yyyy-MM-dd');
    if (!TXN_Date || !query || !this.store_way || query.length < 1) {
      return of([]);
    }

    const body = {
      Store_way: this.store_way,
      TXN_Date: TXN_Date,
      Keyword: query
    };

    return this.tls24010Service.queryPOS2004ForUpdate(body).pipe(
      map(response => {
        const formattedOptions = response.Data.map((item, index) => ({
          ...item,
          id: index,
          label: this.store_way === STORE_WAY.自營 ?
            `${item.PLU_MagNo} - ${item.PLU_No} - ${item.PLU_OrgPLUNo} - ${item.PLU_Name}` :
            `${item.TLT_No} - ${item.TLT_Name}`
        }));
        this.POS2004Options = formattedOptions;

        if (this.store_way === STORE_WAY.自營) {
          return formattedOptions.filter(item => !this.initialExistingIds.has(item.PLU_MagNo));
        } else if (this.store_way === STORE_WAY.專櫃) {
          return formattedOptions.filter(item => !this.initialExistingIds.has(item.talent_id));
        }
        return formattedOptions;
      })
    );
  }
}
