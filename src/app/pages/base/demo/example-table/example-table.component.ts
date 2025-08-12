import { Component, OnInit } from '@angular/core';
import { COMMON_IMPORTS } from '../demo-imports';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { AddButton, Column, formatAmount } from '@shared/componentkit/table/table.model';
import { TabViewModule } from 'primeng/tabview';
import { TableRowSelectEvent, TableRowUnSelectEvent } from 'primeng/table';
import { validateRequired } from '@shared/componentkit/table/validate-field.model';
import { ButtonModule } from 'primeng/button';

interface Data {
  id: number;
  field1: string;
  field2: string;
  field3: string;
  field4: string;
}

@Component({
  selector: 'app-example-table',
  standalone: true,
  imports: [
    COMMON_IMPORTS,
    TableComponent,
    TabViewModule,
    ButtonModule
  ],
  templateUrl: './example-table.component.html',
})
export class ExampleTableComponent extends BasicQueryPageComponent<unknown> implements OnInit {
  queryForm = this.formBuilder.group({});
  // ==基本table===================================================================================
  data1: Data[] = [
    { id: 1, field1: '資料11', field2: '資料21', field3: '資料31', field4: '資料41' },
    { id: 2, field1: '資料12', field2: '資料22', field3: '資料32', field4: '資料42' },
    { id: 3, field1: '資料13', field2: '資料23', field3: '資料33', field4: '資料43' },
    { id: 4, field1: '資料14', field2: '資料24', field3: '資料34', field4: '資料44' },
  ];
  columns1: Column[] = [
    { field: 'field1', header: '欄位1', visible: true },
    { field: 'field2', header: '欄位2', visible: true },
    { field: 'field3', header: '欄位3', visible: true },
    { field: 'field4', header: '欄位4', visible: true },
  ];
  // ==Checkbox===================================================================================
  data2: Data[] = [
    { id: 1, field1: 'A', field2: '資料21', field3: '資料31', field4: '資料41' },
    { id: 2, field1: 'B', field2: '資料22', field3: '資料32', field4: '資料42' },
    { id: 3, field1: 'C', field2: '資料23', field3: '資料33', field4: '資料43' },
    { id: 4, field1: 'D', field2: '資料24', field3: '資料34', field4: '資料44' },
  ];
  columns2: Column[] = [
    { field: 'field1', header: '欄位1', visible: true },
    { field: 'field2', header: '欄位2', visible: true },
    { field: 'field3', header: '欄位3', visible: true },
    { field: 'field4', header: '欄位4', visible: true },
  ];
  selectedItems2: Data[] = [];
  isRowSelectable2(rowData: Data): boolean { return rowData.field1 !== 'A'; }
  onSelect2(event: TableRowSelectEvent): void {
    this.messageService.infoBubble('選擇的資料: ' + event.data.field1, 'select事件');
  }
  onUnSelect2(event: TableRowUnSelectEvent): void {
    this.messageService.warnBubble('取消選擇的資料: ' + event.data.field1, 'unSelect事件');
  }
  onItemClick2(event: Data): void {
    this.messageService.infoBubble('點擊的資料: ' + event.field1, 'itemClick事件');
  }
  onSelectionChange2(event: Data[]): void {
    this.messageService.infoBubble('選擇變更: ' + event.map(item => item.field1).join(', '), 'selectionChange事件');
  }
  // ==排序===================================================================================
  data3: Data[] = [
    { id: 1, field1: 'A', field2: '資料21', field3: '資料31', field4: '資料41' },
    { id: 2, field1: 'B', field2: '資料22', field3: '資料32', field4: '資料42' },
    { id: 3, field1: 'C', field2: '資料23', field3: '資料33', field4: '資料43' },
    { id: 4, field1: 'D', field2: '資料24', field3: '資料34', field4: '資料44' },
  ];
  columns3: Column[] = [
    { field: 'field1', header: '欄位1', visible: true },
    { field: 'field2', header: '欄位2', visible: true },
    { field: 'field3', header: '欄位3', visible: true },
    { field: 'field4', header: '欄位4', visible: true },
  ];
  // ==群組Header===================================================================================
  data4 = [
    { id: 1, bank: 'Bank A', salesDate: '2024/01/01', cashRegister: '001', transactionId: 'TX123', originalCounter: 'A', updatedCounter: 'B', quantity: 10, price: 100, costPrice: 90, salesAmount: 1000 },
    { id: 2, bank: 'Bank B', salesDate: '2024/01/02', cashRegister: '002', transactionId: 'TX456', originalCounter: 'C', updatedCounter: 'D', quantity: 5, price: 200, costPrice: 180, salesAmount: 1000 },
    { id: 3, bank: 'Bank B', salesDate: '2024/01/03', cashRegister: '003', transactionId: 'TX789', originalCounter: 'E', updatedCounter: 'F', quantity: 8, price: 150, costPrice: 130, salesAmount: 1200 },
    { id: 4, bank: 'Bank A', salesDate: '2024/01/04', cashRegister: '004', transactionId: 'TX012', originalCounter: 'G', updatedCounter: 'H', quantity: 12, price: 120, costPrice: 100, salesAmount: 1440 }
  ];
  columns4: Column[] = [
    { field: 'bank', header: '館別' },
    { field: 'salesDate', header: '銷售日期', groupField: '111' },
    { field: 'cashRegister', header: '收銀機號', groupField: '111' },
    { field: 'transactionId', header: '交易序號' },
    { field: 'originalCounter', header: '原專櫃', groupField: '222' },
    { field: 'updatedCounter', header: '修正後專櫃', groupField: '222' },
    { field: 'quantity', header: '數量', format: formatAmount },
    { field: 'price', header: '單價' },
    { field: 'costPrice', header: '進價', format: formatAmount },
    { field: 'salesAmount', header: '銷售金額', format: formatAmount }
  ];
  columnGroup4 = [
    { field: '111', header: '銷售資訊' },
    { field: '222', header: '專櫃資訊' }
  ];
  // ==小計/總計===================================================================================
  data5 = [
    { id: 1, bank: 'Bank A', salesDate: '2024/01/01', cashRegister: '001', transactionId: 'TX123', originalCounter: 'A', updatedCounter: 'B', quantity: 10, price: 100, costPrice: 90, salesAmount: 1000 },
    { id: 2, bank: 'Bank B', salesDate: '2024/01/02', cashRegister: '002', transactionId: 'TX456', originalCounter: 'C', updatedCounter: 'D', quantity: 5, price: 200, costPrice: 180, salesAmount: 1000 },
    { id: 3, bank: 'Bank B', salesDate: '2024/01/03', cashRegister: '003', transactionId: 'TX789', originalCounter: 'E', updatedCounter: 'F', quantity: 8, price: 150, costPrice: 130, salesAmount: 1200 },
    { id: 4, bank: 'Bank A', salesDate: '2024/01/04', cashRegister: '004', transactionId: 'TX012', originalCounter: 'G', updatedCounter: 'H', quantity: 12, price: 120, costPrice: 100, salesAmount: 1440 }
  ];
  columns5: Column[] = [
    { field: 'bank', header: '館別' },
    { field: 'salesDate', header: '銷售日期' },
    { field: 'cashRegister', header: '收銀機號' },
    { field: 'transactionId', header: '交易序號' },
    { field: 'originalCounter', header: '原專櫃' },
    { field: 'updatedCounter', header: '修正後專櫃' },
    { field: 'quantity', header: '數量', isSubTotal: true, isTotal: true, format: formatAmount },
    { field: 'price', header: '單價' },
    { field: 'costPrice', header: '進價', isSubTotal: true, isTotal: true, format: formatAmount },
    { field: 'salesAmount', header: '銷售金額', isSubTotal: true, isTotal: true, format: formatAmount }
  ];
  // ==可編輯Table===================================================================================
  data6 = [
    { id: 1, bank: 'A', salesDate: '2024/01/01', cashRegister: '001', transactionId: 'TX123', originalCounter: 'A', updatedCounter: 'B', quantity: 10, price: 100, costPrice: 90, salesAmount: 1000, remark: '備註1' },
    { id: 2, bank: 'B', salesDate: '2024/01/02', cashRegister: '002', transactionId: 'TX456', originalCounter: 'C', updatedCounter: 'D', quantity: 5, price: 200, costPrice: 180, salesAmount: 1000, remark: '備註2' },
    { id: 3, bank: 'B', salesDate: '2024/01/03', cashRegister: '001', transactionId: 'TX789', originalCounter: 'E', updatedCounter: 'F', quantity: 8, price: 150, costPrice: 130, salesAmount: 1200, remark: '備註3' },
    { id: 4, bank: 'A', salesDate: '2024/01/04', cashRegister: '004', transactionId: 'TX012', originalCounter: 'G', updatedCounter: 'H', quantity: 12, price: 120, costPrice: 100, salesAmount: 1440, remark: '備註4' }
  ];
  columns6: Column[] = [
    {
      field: 'bank', header: '收銀機號', type: 'dropdown',
      options: [
        { label: 'Bank A', value: 'A' },
        { label: 'Bank B', value: 'B' },
        { label: 'Bank C', value: 'C' }
      ],
      optionLabel: 'label', optionValue: 'value', validate: [validateRequired]
    },
    { field: 'quantity', header: '數量', format: formatAmount, type: 'inputNumber' },
    { field: 'price', header: '單價' },
    { field: 'costPrice', header: '進價' },
    { field: 'salesAmount', header: '銷售金額', format: formatAmount },
    { field: 'remark', header: '備註', type: 'input' }
  ];
  selectedItems6 = [];
  defaultInsertData = {
    price: 100,
    costPrice: 90,
    salesAmount: 0,
  };
  rowEditDisabled = (rowData: any) => rowData.cashRegister === '001'; // 禁用編輯行的條件
  // ==展開式Table===================================================================================
  data7 = [
    {
      'id': 1, 'name': 'William', 'age': 35, '電子信箱': 'william36@example.com', 'city': 'Yilan', 'details': [
        { id: 1, description: '個人資料A', manufacturer: '台灣', quantity: 10, price: 1500, discount: 5, date: '2025/05/20', testbool: true },
        { id: 2, description: '個人資料B', manufacturer: '台灣', quantity: 5, price: 3000, discount: 10 },
        { id: 3, description: '個人資料C', manufacturer: '台灣', quantity: 10, price: 1500, discount: 5 },
      ]
    },
    {
      'id': 2, 'name': 'Sarah', 'age': 30, '電子信箱': 'sarah49@example.com', 'city': 'Tainan', 'details': [
        { id: 3, description: '個人資料C', manufacturer: '台灣', quantity: 3, price: 2000, discount: 0 }
      ]
    },
    { 'id': 3, 'name': 'Emily', 'age': 24, '電子信箱': 'emily82@example.com', 'city': 'New Taipei', 'details': [] },
    {
      'id': 4, 'name': 'Sarah', 'age': 23, '電子信箱': 'sarah51@example.com', 'city': 'Tainan', 'details': [
        { id: 4, description: '個人資料D', manufacturer: '台灣', quantity: 8, price: 1800, discount: 15 },
        { id: 5, description: '個人資料E', manufacturer: '台灣', quantity: 12, price: 500, discount: 0 }
      ]
    },
  ];
  columns7: Column[] = [
    { field: 'name', header: 'Name', visible: true },
    { field: 'age', header: 'Age', visible: true },
    { field: '電子信箱', header: '電子信箱', visible: true },
    { field: 'city', header: 'City', visible: true },
  ];
  expansionColumns7: Column[] = [
    { field: 'description', header: '描述' },
    { field: 'manufacturer', header: '製造商' },
    { field: 'quantity', header: '數量' },
    { field: 'price', header: '價格' },
    { field: 'discount', header: '折扣' },
    { field: 'date', header: '日期' },
  ];
  // ==管理設置===================================================================================
  data8 = [
    { id: 1, salesDate: '2024/01/01', transactionId: 'TX123', status: '01', quantity: 10, price: 100, costPrice: 90, salesAmount: 1000 },
    { id: 2, salesDate: '2024/01/02', transactionId: 'TX456', status: '02', quantity: 5, price: 200, costPrice: 180, salesAmount: 1000 },
    { id: 3, salesDate: '2024/01/03', transactionId: 'TX789', status: '03', quantity: 8, price: 150, costPrice: 130, salesAmount: 1200 },
    { id: 4, salesDate: '2024/01/04', transactionId: 'TX012', status: '04', quantity: 12, price: 120, costPrice: 100, salesAmount: 1440 }
  ];
  columns8: Column[] = [
    { field: 'salesDate', header: '銷售日期' },
    { field: 'transactionId', header: '交易序號' },
    { field: 'status', header: '狀態' },
    { field: 'quantity', header: '數量' },
    { field: 'price', header: '單價' },
    { field: 'costPrice', header: '進價' },
    { field: 'salesAmount', header: '銷售金額' }
  ];
  editDisabled8 = (rowData: any) => rowData.status === '04'; // 禁用編輯行的條件
  addButton8: AddButton[] = [
    { label: '審核', icon: 'pi pi-check', action: () => this.onReview(), disabled: (rowData) => rowData.status === '01' },
    { label: '反審核', icon: 'pi pi-times', action: () => this.onReverse(), disabled: (rowData) => rowData.status === '02' },
    { label: '取消', icon: 'pi pi-ban', action: () => this.onCancel(), disabled: (rowData) => rowData.status === '03' },
  ];
  buttonsLoading8 = false;
  onReview(): void {
    this.buttonsLoading8 = true;
    this.messageService.infoBubble('審核操作', '操作提示');
    setTimeout(() => {
      this.buttonsLoading8 = false;
    }, 1000);
  }
  onReverse(): void {
    this.buttonsLoading8 = true;
    this.messageService.infoBubble('反審核操作', '操作提示');
    setTimeout(() => {
      this.buttonsLoading8 = false;
    }, 1000);
  }
  onCancel(): void {
    this.buttonsLoading8 = true;
    this.messageService.infoBubble('取消操作', '操作提示');
    setTimeout(() => {
      this.buttonsLoading8 = false;
    }, 1000);
  }

  // ==基本table===================================================================================
  data: any[] = [
    {
      'id': 1, 'name': 'William', 'isdelete': true, 'age': 35, '電子信箱': 'william36@example.com', 'city': 'Yilan', 'details': [
        { id: 1, description: '個人資料A', manufacturer: '台灣', quantity: 10, price: 1500, discount: 5, date: '2025/05/20', testbool: true },
        { id: 2, description: '個人資料B', manufacturer: '台灣', quantity: 5, price: 3000, discount: 10 },
        { id: 3, description: '個人資料C', manufacturer: '台灣', quantity: 10, price: 1500, discount: 5 },
      ]
    },
    {
      'id': 2, 'name': 'Sarah', 'isdelete': false, 'age': 30, '電子信箱': 'sarah49@example.com', 'city': 'Tainan', 'details': [
        { id: 3, description: '個人資料C', manufacturer: '台灣', quantity: 3, price: 2000, discount: 0 }
      ]
    },
    { 'id': 3, 'name': 'Emily', 'isdelete': true, 'age': 24, '電子信箱': 'emily82@example.com', 'city': 'New Taipei', 'details': [] },
    {
      'id': 4, 'name': 'Sarah', 'isdelete': false, 'age': 23, '電子信箱': 'sarah51@example.com', 'city': 'Tainan', 'details': [
        { id: 4, description: '個人資料D', manufacturer: '台灣', quantity: 8, price: 1800, discount: 15 },
        { id: 5, description: '個人資料E', manufacturer: '台灣', quantity: 12, price: 500, discount: 0 }
      ]
    },
  ];
  columns: Column[] = [
    { field: 'name', header: 'Name', visible: true },
    { field: 'age', header: 'Age', visible: true },
    { field: '電子信箱', header: '電子信箱', visible: true },
    { field: 'city', header: 'City', visible: true },
  ];
  isRowSelectable(rowData: any): boolean {
    return rowData.isdelete;
  }
  constructor() {
    super();
  }
  ngOnInit(): void {

  }
}
