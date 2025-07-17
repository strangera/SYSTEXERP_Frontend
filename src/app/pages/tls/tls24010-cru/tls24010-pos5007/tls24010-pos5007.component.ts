import { NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
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
    ButtonModule
  ],
  templateUrl: './tls24010-pos5007.component.html',
  styleUrls: ['./tls24010-pos5007.component.scss']
})
export class Tls24010Pos5007Component implements OnInit {
  @Input() TXN_GUIPaper?: string // 補登類別 補原機台='E' 手開二聯式發票='2'
  @Input() TLT_No?: string//專櫃編號
  @Input() TLT_Name?: string//專櫃名稱
  @Input() store_way?: string// 1為專櫃 2=自營
  @Input() talent_id?: number//專櫃編號
  index = 1
  POS5007Data: POS5007Data[] = [];
  POS5007SelectedItems: POS5007Data[] = [];
  POS2004Options: POS2004Item[] = []; //下拉選單 商品資料
  tlt_idOptions: TLTTALENT_CHARGEData[] = []; //下拉選單 類別
  trackByRow = (index: number, item: POS5007Data) => { return item?.id || index; }
  constructor(
    private readonly dropDownListService: DropDownListService,
  ) { }
  ngOnInit(): void {
    switch (this.store_way) {
      case '1':// 自營櫃位
        {
          if (this.TLT_No) {
            this.dropDownListService.queryPOS2004_DropDownList(this.TLT_No).pipe(untilDestroyed(this)).subscribe((data) => {
              this.POS2004Options = data.Data;
            })
          }
          this.dropDownListService.queryTLTTALENT_CHARGE_DropDownList(this.talent_id).pipe(untilDestroyed(this)).subscribe((data) => {
            this.tlt_idOptions = data.Data.map((item) => ({ ...item, label: `${item.tlt_id} - ${item.tlt_id_desc}` }));
          })
          break;
        }
      case '2':// 專櫃櫃位
        break;
      default: break;
    }
    //TODO: 5. 再去取 TLTTALENT_CHARGEM.CAG_TAXTYPE 專櫃抽成主檔
    //TODO: 6. 再去取 讀取TLTTALENT_CHARGED.CAG_BARCODE 專櫃抽成主檔
  }

  insertRow(): void {
    this.POS5007Data.push({
      id: this.index + 1,
      PLU_MagNo: undefined,
      PLU_No: undefined,
      TXN_Qty: 0,
      PLU_SalePrc: 0,
      TXN_Amt: 0,
      TXN_Disc: 0,
      TXN_SaleAmt: 0,
      TLT_ID: undefined,
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
    event.TXN_SaleAmt = event.TXN_Amt - (event.TXN_Disc || 0);
  }
  onChangeTLT_ID(rowData: POS5007Data) {
    const item = this.tlt_idOptions.find((item) => item.tlt_id === rowData.TLT_ID);
    rowData.PLU_TaxType = item?.cag_taxtype;
    rowData.TXN_DiscCode = item?.cag_barcode;
    rowData.TXN_DiscCode_Name = item?.cag_barcode_name;
  }
}
