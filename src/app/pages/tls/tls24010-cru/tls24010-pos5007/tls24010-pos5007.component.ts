import { DecimalPipe, NgIf } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DropDownListService, POS2004Item, TLTTALENT_CHARGEData } from '../../../../service/utility/dropDownList.service';
import { POS5007Data } from '../../../../service/api/tls/tls24010.service';
import { ButtonModule } from 'primeng/button';
import { NotificationService } from '@shared/component/notification-message/notification.service';
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
export class Tls24010Pos5007Component implements OnInit, OnChanges {
  @Input() type?: string;
  @Input() TXN_GUIPaper?: string // 補登類別 補原機台='E' 手開二聯式發票='2'
  @Input() TLT_No?: string//專櫃編號
  @Input() TLT_Name?: string//專櫃名稱
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
  tlt_idOptions: TLTTALENT_CHARGEData[] = []; //下拉選單 類別
  trackByRow = (index: number, item: POS5007Data) => { return item?.id || index; }
  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly messageService: NotificationService
  ) {
  }
  ngOnInit(): void {
    switch (this.store_way) {
      case '2':// 自營櫃位
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
      case '1':// 專櫃櫃位
        this.POS2004Options = [
          {
            PLU_MagNo: this.TLT_No || '',
            PLU_No: this.TLT_No || '',
            PLU_Name: this.TLT_Name || '',
            label: `${this.TLT_No || ''} - ${this.TLT_Name || ''}`,
          }
        ];
        this.dropDownListService.queryTLTTALENT_CHARGE_DropDownList(this.talent_id).pipe(untilDestroyed(this)).subscribe((data) => {
          this.tlt_idOptions = data.Data.map((item) => ({ ...item, label: `${item.tlt_id} - ${item.tlt_id_desc}` }));
        })
        break;
      default: break;
    }
  }

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
    }
  }

  insertRow(): void {
    this.POS5007Data.push({
      id: this.index + 1,
      PLU_MagNo: this.store_way === '1' ? this.POS2004Options[0] : undefined,
      PLU_No: this.store_way === '1' ? this.POS2004Options[0].PLU_No : undefined,
      PLU_Name: this.store_way === '1' ? this.TLT_Name : undefined,
      TXN_Qty: 0,
      PLU_SalePrc: 0,
      TXN_Amt: 0,
      TXN_Disc: 0,
      TXN_SaleAmt: 0,
      tlt_id: undefined,
      PLU_TaxType: undefined,
      TXN_DiscCode: undefined,
    });
    this.index++;
  }

  deleteRow(rowData: POS5007Data[]): void {
    this.POS5007Data = this.POS5007Data.filter(item => !rowData.includes(item));
    this.POS5007SelectedItems = this.POS5007SelectedItems.filter(item => !rowData.includes(item));
  }

  onInput(event: POS5007Data) {
    event.TXN_Amt = (event.TXN_Qty || 0) * (event.PLU_SalePrc || 0);
    if (event.TXN_Disc !== undefined && event.TXN_Disc > 0) {
      event.TXN_Disc = -Math.abs(event.TXN_Disc);
    }
    event.TXN_SaleAmt = event.TXN_Amt + (event.TXN_Disc || 0);
  }
  onChangeTLT_ID(rowData: POS5007Data) {
    const item = this.tlt_idOptions.find((item) => item.tlt_id === rowData.tlt_id);
    rowData.PLU_TaxType = item?.cag_taxtype;
    rowData.TXN_DiscCode = item?.cag_barcode;
    rowData.TXN_DiscCode_Name = item?.cag_barcode_name;
  }
  onChangePLU_MagNo(rowData: POS5007Data) {
    console.log(rowData);
    if (!rowData.PLU_MagNo) {
      rowData.PLU_Name = undefined;
      rowData.PLU_SalePrc = undefined;
      return;
    }
    const show = rowData.PLU_MagNo as POS2004Item
    rowData.PLU_Name = show.PLU_Name;
    rowData.PLU_SalePrc = show.PLU_SalePrc;
  }
}
