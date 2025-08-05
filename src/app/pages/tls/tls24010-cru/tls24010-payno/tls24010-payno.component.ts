import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { POS5008Data } from '@service/api/tls/tls24010.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { CRD_TypeOptions } from '../tls24010-cru.model';
import { SystemOptionsService } from '@service/system/sys1000.service';

@UntilDestroy()
@Component({
  selector: 'app-tls24010-payno',
  standalone: true,
  imports: [
    TableComponent
  ],
  templateUrl: './tls24010-payno.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tls24010PaynoComponent implements OnInit, OnChanges {
  @Input() data: POS5008Data[] = [];
  payNoData: POS5008Data[] = [];
  private previousData: POS5008Data[] = [];
  columns: Column[] = [
    { field: 'ID', header: 'ID', hidden: true },
    { field: 'PAY_No', header: '付款別', type: 'dropdown', options: [], optionLabel: 'label', optionValue: 'PAY_No', disabled: (rowData) => Number(rowData.ID) !== 0 },
    { field: 'TXN_PayAmt', header: '金額', type: 'inputNumber' },
    { field: 'CRD_Type', header: '信用卡別', type: 'dropdown', options: CRD_TypeOptions, optionLabel: 'label', optionValue: 'value', disabled: (rowData) => rowData.PAY_Type !== "0" },
    { field: 'CRD_NoTXN_CouponNoTXN_PayDesc', header: '信用卡卡號/券號/應收付款對象', type: 'input' },
    { field: 'TERM_No', header: '分期數', type: 'dropdown', options: SystemOptionsService.getOptions('T109'), optionLabel: 'SYS_Name', optionValue: 'SYS_Code', disabled: (rowData) => rowData.PAY_Type !== "0" },
  ]
  PAY_TypeOptions: IDropdownItem[] = [];
  defaultInsertData: POS5008Data = {
    ID: 0,
    PAY_No: undefined,
    PAY_Name: undefined,
    TXN_PayAmt: undefined,
    CRD_Type: undefined,
    CRD_No: undefined,
    TXN_CouponNo: undefined,
    TXN_PayDesc: undefined,
    TERM_No: undefined,
    PAY_Type: undefined,
    CRD_NoTXN_CouponNoTXN_PayDesc: undefined
  };

  constructor(
    private readonly dropDownListService: DropDownListService,
  ) { }

  ngOnInit(): void {
    this.dropDownListService.queryPOS1006_DropDownList().pipe(untilDestroyed(this)).subscribe((res) => {
      this.PAY_TypeOptions = res.Data.map(item => ({
        ...item,
        PAY_No: item.No,
        PAY_Name: item.Name,
        label: item.Name
      }));
      this.columns.find(col => col.field === 'PAY_No')!.options = this.PAY_TypeOptions;
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    const newData: POS5008Data[] = changes['data']?.currentValue;

    if (newData?.length > 0 && !this.isSameData(newData, this.previousData)) {
      this.payNoData = newData.map((item) => {
        const mappedPAYType = this.PAY_TypeOptions.find(i => i.No === item.PAY_No)?.PAY_Type;
        return {
          ...item,
          TERM_No: String(item.TERM_No),
          PAY_Type: mappedPAYType,
          CRD_NoTXN_CouponNoTXN_PayDesc:
            mappedPAYType === '0' ? item.CRD_No || '' :
              mappedPAYType === 'A' ? item.TXN_PayDesc || '' :
                item.TXN_CouponNo || '',
        };
      });
      this.previousData = newData; // 更新快取版本
    }
  }

  private isSameData(newData: POS5008Data[], oldData: POS5008Data[]): boolean {
    if (newData.length !== oldData.length) return false;
    return newData.every((item, index) => item.ID === oldData[index]?.ID);
  }

  onFieldChange(event: { rowData: POS5008Data, field: string, value: string, index?: number }): void {
    const selectedItem = this.PAY_TypeOptions.find(item => item.No === event.rowData.PAY_No);
    if (selectedItem) {
      event.rowData.PAY_Type = selectedItem.PAY_Type;
      if (event.field === 'PAY_No') {
        event.rowData.TXN_PayAmt = undefined;
        event.rowData.CRD_Type = undefined;
        event.rowData.CRD_NoTXN_CouponNoTXN_PayDesc = undefined;
        event.rowData.TERM_No = undefined;
      }
    }
  }

  isRowSelectable(rowData: POS5008Data): boolean {
    return rowData.ID === 0;
  }
}
