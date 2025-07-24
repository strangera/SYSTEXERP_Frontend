import { Component, OnInit } from '@angular/core';
import { Column } from '../../../shared/componentkit/table/table.model';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent, MenubarComponent, TableComponent } from '@shared/index';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-tls2a010-cru',
  templateUrl: './tls2a010-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    TranslateModule,
    ReactiveFormsModule,
    TableComponent,
    TooltipModule
  ],
})

export class TLS2A010CRUComponent extends BasicCruPageComponent<ITLS2A010Data> implements OnInit {
  columns: Column[] = [
    {
      field: 'isChecked',
      header: '是否審核？',
      type: 'checkbox',
      label: '', // 不顯示文字
    },

    { field: 'TXN_Date', header: '日期' },
    { field: 'ECR_No', header: '收銀機代號' },
    { field: 'TXN_No', header: '交易序號' },
    { field: 'TLT_NO', header: '專櫃編號' },
    { field: 'tlt_name', header: '專櫃名稱' },
    { field: 'TXN_GUINo', header: '發票號碼' },
    { field: 'CRD_No', header: '付款卡號' },
    { field: 'TXN_PayAmt', header: '付款金額', type: 'inputNumber' },

    {
      field: 'check_status',
      header: '審核狀態',
      type: 'dropdown',
      options: [
        { label: '已撥回', value: 1 },
        { label: '信用卡缺單', value: 2 },
        { label: '信用卡未簽', value: 3 },
        { label: '其他異常', value: 4 }
      ],
      optionLabel: 'label',
      optionValue: 'value',
    },
    {
      field: 'check_Remark',
      header: '備註',
      type: 'input'
    }
  ];


}
constructor(

) {
  super();  // 呼叫父類建構子
}
ngOnInit(): void {
    this.initializePage('TLS2A010', this.dataForm);
}

function constructor() {
  throw new Error('Function not implemented.');
}
