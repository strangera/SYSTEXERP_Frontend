import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NotificationService } from '@shared/components/notification-message/notification.service';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { POS5007Data } from '../../../../service/api/tls/tls24010.service';
import { DropDownListService, IDropdownItem, POS2004Item, TltTalentChargeData } from '../../../../service/utility/dropDownList.service';
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
    FormsModule,
    ButtonModule,
    DecimalPipe
  ],
  templateUrl: './tls24010-pos5007.component.html',
  styleUrls: ['./tls24010-pos5007.component.scss']
})
export class Tls24010Pos5007Component implements OnChanges {
  @Input() type?: string;
  @Input() TXN_GUIPaper?: string // 補登類別 補原機台='E' 手開發票='2'
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
  TXN_DiscCodeOptions: TltTalentChargeData[] = []; //下拉選單 折扣別
  TLT_NoOptions: IDropdownItem[] = [];
  taxTypeOptions: { label: string, value: string }[] = [
    { label: '應稅', value: '1' },
    { label: '免稅', value: '0' }
  ];
  private readonly dropDownListService = inject(DropDownListService);
  private readonly messageService = inject(NotificationService);
  trackByRow = (index: number, item: POS5007Data) => { return item?.id || index; }
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
        PLU_Name: item.PLU_Name,
        tlt_id: item.tlt_id ? item.tlt_id : undefined
      }))];
      this.calculateLastYearTotal();
    }
    if (changes['TXN_Date']) {
      if (this.TXN_Date) {
        this.dropDownListService.queryTLTTALENT_ByContractDate_DropDownList(this.TXN_Date).pipe(untilDestroyed(this)).subscribe(options => {
          this.TLT_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
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
                if (this.isFormCreateable) {
                  this.insertRow();
                }
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
            const sourceData = (data.Data && data.Data.length > 0) ? data.Data : [
              // ★ 沒資料時：直接賦予預設值
              { tlt_id: "0", tlt_id_desc: "應稅", cag_taxtype: "1", cag_barcode: "000", cag_barcode_name: "正品" },
              { tlt_id: "1", tlt_id_desc: "免稅", cag_taxtype: "0", cag_barcode: "000", cag_barcode_name: "正品" }
            ];

            // 類別下拉：依 tlt_id 去重
            const uniqueTltId = sourceData.reduce((acc: TltTalentChargeData[], current) => {
              if (!acc.find((item: TltTalentChargeData) => item.tlt_id === current.tlt_id)) {
                acc.push(current);
              }
              return acc;
            }, []);
            this.tlt_idOptions = uniqueTltId.map((item) => ({
              ...item,
              label: `${item.tlt_id} - ${item.tlt_id_desc}`,
              tlt_id: item.tlt_id // 確保 optionValue 用的到
            }));

            // 折扣別下拉：依 cag_barcode 去重，跟 tls24010-discode 同一套資料來源與去重邏輯
            const seenBarcodes = new Set<string>();
            const uniqueBarcode = sourceData.filter((item) => {
              const isDuplicate = seenBarcodes.has(item.cag_barcode);
              seenBarcodes.add(item.cag_barcode);
              return !isDuplicate;
            });
            this.TXN_DiscCodeOptions = uniqueBarcode.map((item) => ({
              ...item,
              label: `${item.cag_barcode} - ${item.cag_barcode_name}`
            }));

            if (this.isFormCreateable) {
              this.insertRow();
            }
          });
          break;
        default: break;
      }
    }
  }

  getPLU_Name(rowData: POS5007Data): string {
    if (this.store_way === STORE_WAY.專櫃) {
      return this.TLT_Name || '';
    }
    return this.TLT_NoOptions.find(item => item.No === rowData.PLU_No)?.Name || '';
  }

  insertRow(): void {
    // 修正 index 累加
    this.index++;

    // 1. 決定基礎資料 (自營/專櫃共通)
    const newRow: POS5007Data = {
      id: this.index,
      PLU_MagNo: this.store_way === STORE_WAY.專櫃 ? this.POS2004Options[0] : undefined,
      PLU_No: this.store_way === STORE_WAY.專櫃 ? (this.TLT_No || '') : undefined,
      PLU_Name: this.store_way === STORE_WAY.專櫃 ? this.TLT_Name : undefined,
      TXN_Qty: 1,
      PLU_SalePrc: 0,
      TXN_Amt: 0,
      TXN_Disc: 0,
      TXN_SaleAmt: 0,
    };

    // 2. 處理類別與稅別相關邏輯 (主要針對專櫃模式)
    if (this.store_way === STORE_WAY.專櫃) {
      // 檢查是否有選項（包含我們在 ngOnChanges 塞入的預設值）
      if (this.tlt_idOptions && this.tlt_idOptions.length > 0) {
        const defaultoption = this.tlt_idOptions[0];
        newRow.tlt_id = defaultoption.tlt_id;
        newRow.tlt_id_desc = defaultoption.tlt_id_desc;
        newRow.PLU_TaxType = defaultoption.cag_taxtype || '1';
        newRow.TXN_DiscCode = defaultoption.cag_barcode || '000';
        newRow.TXN_DiscCode_Name = defaultoption.cag_barcode_name || '正品';
      }
    }

    this.POS5007Data = [...this.POS5007Data, newRow];
    this.calculateLastYearTotal();
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
    const selected = this.tlt_idOptions.find((item) => item.tlt_id === rowData.tlt_id);
    if (selected) {
      rowData.tlt_id_desc = selected.tlt_id_desc;
      rowData.PLU_TaxType = selected.cag_taxtype;
      rowData.TXN_DiscCode = selected.cag_barcode;
      rowData.TXN_DiscCode_Name = selected.cag_barcode_name;
    }
  }
  onChangeTXN_DiscCode(rowData: POS5007Data) {
    const selected = this.TXN_DiscCodeOptions.find((item) => item.cag_barcode === rowData.TXN_DiscCode);
    if (selected) {
      rowData.TXN_DiscCode_Name = selected.cag_barcode_name;
    }
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
  @Output() totalChange = new EventEmitter<number>();
  calculateLastYearTotal() {
    let total = 0;
    for (const row of this.POS5007Data) {
      total += row.TXN_SaleAmt || 0;
    }
    this.TXN_SaleAmtTotal = total;
    this.totalChange.emit(this.TXN_SaleAmtTotal);
  }

  getTXN_SaleAmtLength(row: POS5007Data): number {
    const amt = row.TXN_SaleAmt ?? 0;
    return Math.floor(Math.abs(amt)).toString().length;
  }
}
