import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { POS5008Data } from '../../../../service/api/tls/tls24010.service';
import { Column } from '../../../../shared/componentkit/table/table.model';
import { CRD_TypeOptions, POS5008Columns } from '../tls24010-cru.model';
import { DropDownListService, IDropdownItem } from '../../../../service/utility/dropDownList.service';
import { SystemOption } from '../../../../shared/models/sys/sys1000.model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SystemOptionsService } from '../../../../service/system/sys1000.service';

@UntilDestroy()
@Component({
  selector: 'app-tls24010-pos5008',
  standalone: true,
  imports: [
    TableModule,
    DividerModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    NgIf,
    FormsModule
  ],
  templateUrl: './tls24010-pos5008.component.html',
  styleUrls: ['./tls24010-pos5008.component.scss']
})
export class Tls24010Pos5008Component implements OnInit {
  POS5008Data: POS5008Data[] = [];
  POS5008SelectedItems: POS5008Data[] = [];
  POS5008Columns: Column[] = POS5008Columns;
  trackByRow = (index: number, item: POS5008Data) => { return item?.id || index; }
  CRD_TypeOptions = CRD_TypeOptions; //下拉選單 信用卡別
  PAY_TypeOptions: IDropdownItem[] = []; //下拉選單 付款別
  sys_typeOptions: SystemOption[] = []; // 下拉選單 分期數
  constructor(
    private readonly dropDownListService: DropDownListService,
  ) { }
  ngOnInit(): void {
    //--付款明細------------------------------------------------------
    this.dropDownListService.queryPOS1006_DropDownList().pipe(untilDestroyed(this)).subscribe((res) => {
      this.PAY_TypeOptions = res.Data.map((item) => ({ ...item, label: item.Name }));
      this.POS5008Data = res.Data.map((item, index) => {
        return { ID: index, PAY_No: item.No, PAY_Name: item.Name, PAY_Type: item.PAY_Type };
      });
      this.sys_typeOptions = SystemOptionsService.getOptions('T111');
    });
  }
  getPlaceholder(payType: string): string {
    switch (payType) {
      case '0': return '請輸入信用卡卡號';
      case 'A': return '請輸入應收付款對象';
      default: return '請輸入券號';
    }
  }

  getMaxLength(payType: string): number {
    switch (payType) {
      case '0': return 20; // CRD_No
      case 'A': return 100; // TXN_PayDesc
      default: return 50; // TXN_CouponNo
    }
  }
}
