import { DecimalPipe, NgIf } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DropDownListService, IDropdownItem, POS2004Item, TltTalentChargeData } from '../../../../service/utility/dropDownList.service';
import { POS5007Data } from '../../../../service/api/tls/tls24010.service';
import { ButtonModule } from 'primeng/button';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { STORE_WAY } from '../tls24010-cru.model';
@UntilDestroy()
@Component({
  selector: 'app-tls24010-pos5007',
  standalone: true,
  imports: [
    TableModule,
    DividerModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    NgIf,
    FormsModule,
    ButtonModule,
    DecimalPipe
  ],
  templateUrl: './tls24010-pos5007.component.html',
  styleUrls: ['./tls24010-pos5007.component.scss']
})
export class Tls24010Pos5007Component implements OnChanges {
  @Input() type?: string;
  @Input() TXN_GUIPaper?: string // 補登類別 補原機台='E' 手開二聯式發票='2'
  @Input() TLT_No?: string//專櫃編號
  @Input() TLT_Name?: string//專櫃名稱
  @Input() TXN_Date?: string//專櫃名稱
  @Input() store_way?: string// 1為專櫃 2=自營
  @Input() talent_id?: number//專櫃編號
  @Input() data: POS5007Data[] = []
  @Input() isFormCreateable?: boolean
  @Input() isFormEditable?: boolean
  @Input() isFormReadable?: boolean
  index = 1
  POS5007Data: POS5007Data[] = [];
  POS5007SelectedItems: POS5007Data[] = [];
  POS2004Options: POS2004Item[] = []; //下拉選單 商品資料
  tlt_idOptions: TltTalentChargeData[] = []; //下拉選單 類別
  TLT_NoOptions: IDropdownItem[] = [];
  trackByRow = (index: number, item: POS5007Data) => { return item?.id || index; }
  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly messageService: NotificationService
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue.length > 0 && !this.isFormCreateable) {
      this.POS5007Data = [...this.data.map((item, index) => ({
        ...item,
        id: index + 1,
        TXN_Amt: (item.TXN_Qty || 0) * (item.PLU_SalePrc || 0),
        PLU_MagNo: {
          PLU_MagNo: item.PLU_MagNo,
          PLU_No: item.PLU_No,
          PLU_Name: item.PLU_Name,
          PLU_SalePrc: item.PLU_SalePrc,
          label: item.PLU_Name ? `${item.PLU_MagNo} - ${item.PLU_Name}` : undefined
        } as POS2004Item,
        tlt_id: item.tlt_id ? item.tlt_id : undefined
      }))];
      this.calculateLastYearTotal();
    }
    if (changes['TXN_Date']) {
      if (this.TXN_Date) {
        this.dropDownListService.queryTLTTALENT_ByContractDate_DropDownList(this.TXN_Date).pipe(untilDestroyed(this)).subscribe(options => {
          this.TLT_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
          console.log(this.TLT_NoOptions);
        });
      }
    }
    if (changes['store_way']) {
      switch (this.store_way) {
        case STORE_WAY.自營:// 自營櫃位
          if (this.TLT_No) {
            this.dropDownListService.queryPOS2004_DropDownList(this.TLT_No).pipe(untilDestroyed(this)).subscribe((data) => {
              if (data.Data.length > 0) {
                this.POS2004Options = data.Data.map((item) => ({
                  ...item,
                  label: `${item.PLU_MagNo} - ${item.PLU_Name}`
                }));
              } else {
                this.messageService.errorBubble('此專櫃無銷售商品', '無法新增');
              }
            })
          }
          break;
        case STORE_WAY.專櫃:// 專櫃櫃位
          this.POS2004Options = [
            {
              PLU_MagNo: this.TLT_No || '',
              PLU_No: this.TLT_No || '',
              PLU_Name: this.TLT_Name || '',
              label: `${this.TLT_No || ''} - ${this.TLT_Name || ''}`,
            }
          ];
          this.dropDownListService.queryTLTTALENT_CHARGE_DropDownList(this.talent_id).pipe(untilDestroyed(this)).subscribe((data) => {
            // 1. 先進行去重處理
            const uniqueData = data.Data.reduce((acc: TltTalentChargeData[], current) => {
              if (!acc.find((item: TltTalentChargeData) => item.tlt_id === current.tlt_id)) {
                acc.push(current);
              }
              return acc;
            }, []);
            this.tlt_idOptions = uniqueData.map((item) => ({
              ...item,
              label: `${item.tlt_id} - ${item.tlt_id_desc}`
            }));
            if (this.isFormCreateable) {
              this.insertRow();
            }
          })
          break;
        default: break;
      }
    }
  }

  getPLU_Name(rowData: POS5007Data): string {
    return this.TLT_NoOptions.find(item => item.No === rowData.PLU_No)?.Name || '';
  }

  insertRow(): void {
    this.POS5007Data.push({
      id: this.index + 1,
      PLU_MagNo: this.store_way === STORE_WAY.專櫃 ? this.POS2004Options[0] : undefined,
      PLU_No: this.store_way === STORE_WAY.專櫃 ? this.POS2004Options[0].PLU_No : undefined,
      PLU_Name: this.store_way === STORE_WAY.專櫃 ? this.TLT_Name : undefined,
      TXN_Qty: 1,
      PLU_SalePrc: 0,
      TXN_Amt: 0,
      TXN_Disc: 0,
      TXN_SaleAmt: 0,
      tlt_id: this.tlt_idOptions[0]?.tlt_id,
      PLU_TaxType: this.tlt_idOptions[0]?.cag_taxtype ?? '0',
      TXN_DiscCode: this.tlt_idOptions[0]?.cag_barcode,
      TXN_DiscCode_Name: this.tlt_idOptions[0]?.cag_barcode_name
    });
    this.index++;
  }

  deleteRow(rowData: POS5007Data[]): void {
    this.POS5007Data = this.POS5007Data.filter(item => !rowData.includes(item));
    this.POS5007SelectedItems = this.POS5007SelectedItems.filter(item => !rowData.includes(item));
    this.calculateLastYearTotal();
  }

  onInput(event: POS5007Data) {
    event.TXN_Amt = (event.TXN_Qty || 0) * (event.PLU_SalePrc || 0);
    event.TXN_SaleAmt = event.TXN_Amt + (event.TXN_Disc || 0);
    this.calculateLastYearTotal();
  }
  onChangeTLT_ID(rowData: POS5007Data) {
    const item = this.tlt_idOptions.find((item) => item.tlt_id === rowData.tlt_id);
    rowData.PLU_TaxType = item?.cag_taxtype;
    rowData.TXN_DiscCode = item?.cag_barcode;
    rowData.TXN_DiscCode_Name = item?.cag_barcode_name;
  }
  onChangePLU_MagNo(rowData: POS5007Data) {
    if (!rowData.PLU_MagNo) {
      rowData.PLU_Name = undefined;
      rowData.PLU_SalePrc = undefined;
      return;
    }
    const show = rowData.PLU_MagNo as POS2004Item
    rowData.PLU_Name = show.PLU_Name;
    rowData.PLU_SalePrc = show.PLU_SalePrc;
  }
  TXN_SaleAmtTotal = 0;
  calculateLastYearTotal() {
    let total = 0;
    for (const row of this.POS5007Data) {
      total += row.TXN_SaleAmt || 0;
    }
    this.TXN_SaleAmtTotal = total;
  }

  getTXN_SaleAmtLength(row: POS5007Data): number {
    const amt = row.TXN_SaleAmt ?? 0;
    return Math.floor(Math.abs(amt)).toString().length;
  }

  getAllowedMaxLength(row: POS5007Data, field: 'TXN_Qty' | 'PLU_SalePrc' | 'TXN_Disc'): number {
    const MAX_TOTAL_LENGTH = 10;
    const currentAmtLength = this.getTXN_SaleAmtLength(row);
    // 你可以用最簡單方式先全部統一扣掉目前長度
    const remain = MAX_TOTAL_LENGTH - currentAmtLength;
    // 最小設定為 1，不然會出現 maxlength 為 0 導致無法輸入
    return Math.max(remain, 1);
  }
}
