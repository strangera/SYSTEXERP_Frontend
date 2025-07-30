import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { POS5008Data } from '@service/api/tls/tls24010.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { TableComponent } from '@shared/componentkit';
import { Column, formatAmount } from '@shared/componentkit/table/table.model';

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
    { field: 'PAY_Name', header: '付款別(修正前)', },
    { field: 'PAY_No', header: '付款別', type: 'dropdown', options: [], optionLabel: 'label', optionValue: 'No' },
    // { field: 'PAY_Type', header: '付款別', },
    { field: 'TXN_PayAmt', header: '金額', format: formatAmount },
    { field: 'CRD_Name', header: '信用卡別' },
    { field: 'CRD_NoTXN_CouponNoTXN_PayDesc', header: '信用卡卡號/券號/應收付款對象', },
    { field: 'TERM_Name', header: '分期數' },
  ]
  PAY_TypeOptions: IDropdownItem[] = [];

  constructor(
    private readonly dropDownListService: DropDownListService,
  ) { }

  ngOnInit(): void {
    this.dropDownListService.queryPOS1006_DropDownList().pipe(untilDestroyed(this)).subscribe((res) => {
      this.PAY_TypeOptions = res.Data.map(item => ({ ...item, label: item.Name }));
      this.columns.find(col => col.field === 'PAY_No')!.options = this.PAY_TypeOptions;
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    const newData: POS5008Data[] = changes['data']?.currentValue;

    if (newData?.length > 0 && !this.isSameData(newData, this.previousData)) {
      this.payNoData = newData.map((item) => ({
        ...item,
        PAY_No: '', // 依需求設定
        CRD_NoTXN_CouponNoTXN_PayDesc:
          item.PAY_Type === '0' ? item.CRD_No || '' :
            item.PAY_Type === 'A' ? item.TXN_PayDesc || '' :
              item.TXN_CouponNo || item.TXN_PayDesc || item.CRD_No || '',
      }));

      this.previousData = newData; // 更新快取版本
    }
  }

  private isSameData(newData: POS5008Data[], oldData: POS5008Data[]): boolean {
    if (newData.length !== oldData.length) return false;
    return newData.every((item, index) => item.ID === oldData[index]?.ID);
  }
}
