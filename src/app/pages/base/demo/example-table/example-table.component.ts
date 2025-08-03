import { Component, OnInit } from '@angular/core';
import { COMMON_IMPORTS } from '../demo-imports';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, formatAmount } from '@shared/componentkit/table/table.model';

@Component({
  selector: 'app-example-table',
  standalone: true,
  imports: [
    COMMON_IMPORTS,
    TableComponent,
  ],
  templateUrl: './example-table.component.html',
})
export class ExampleTableComponent extends BasicQueryPageComponent<unknown> implements OnInit {
  queryForm = this.formBuilder.group({
    text: ['', Validators.required],
  });

  // 表格
  data: any[] = [
    {
      'id': 1, 'name': 'William', 'isdelete': true, 'age': 35, 'email': 'william36@example.com', 'city': 'Yilan', 'details': [
        { id: 1, description: '個人資料A', manufacturer: '台灣', quantity: 10, price: 1500, discount: 5, date: '2025/05/20', testbool: true },
        { id: 2, description: '個人資料B', manufacturer: '台灣', quantity: 5, price: 3000, discount: 10 },
        { id: 3, description: '個人資料C', manufacturer: '台灣', quantity: 10, price: 1500, discount: 5 },
        { id: 4, description: '個人資料D', manufacturer: '台灣', quantity: 5, price: 3000, discount: 10 },
        { id: 5, description: '個人資料E', manufacturer: '台灣', quantity: 10, price: 1500, discount: 5 },
        { id: 6, description: '個人資料F', manufacturer: '台灣', quantity: 5, price: 3000, discount: 10 }
      ]
    },
    {
      'id': 2, 'name': 'Sarah', 'isdelete': false, 'age': 30, 'email': 'sarah49@example.com', 'city': 'Tainan', 'details': [
        { id: 3, description: '個人資料C', manufacturer: '台灣', quantity: 3, price: 2000, discount: 0 }
      ]
    },
    { 'id': 3, 'name': 'Emily', 'isdelete': true, 'age': 24, 'email': 'emily82@example.com', 'city': 'New Taipei', 'details': [] },
    {
      'id': 4, 'name': 'Sarah', 'isdelete': false, 'age': 23, 'email': 'sarah51@example.com', 'city': 'Tainan', 'details': [
        { id: 4, description: '個人資料D', manufacturer: '台灣', quantity: 8, price: 1800, discount: 15 },
        { id: 5, description: '個人資料E', manufacturer: '台灣', quantity: 12, price: 500, discount: 0 }
      ]
    },
  ];
  columns: Column[] = [
    { field: 'name', header: 'Name', visible: true },
    { field: 'age', header: 'Age', visible: true },
    { field: 'email', header: 'Email', visible: true },
    { field: 'city', header: 'City', visible: true },
  ];
  isRowSelectable(rowData: any): boolean {
    return rowData.isdelete;
  }
  dataGroup = [
    { id: 1, bank: 'Bank A', salesDate: '2024/01/01', cashRegister: '001', transactionId: 'TX123', originalCounter: 'A', updatedCounter: 'B', quantity: 10, price: 100, costPrice: 90, salesAmount: 1000 },
    { id: 2, bank: 'Bank B', salesDate: '2024/01/02', cashRegister: '002', transactionId: 'TX456', originalCounter: 'C', updatedCounter: 'D', quantity: 5, price: 200, costPrice: 180, salesAmount: 1000 },
    { id: 3, bank: 'Bank B', salesDate: '2024/01/03', cashRegister: '003', transactionId: 'TX789', originalCounter: 'E', updatedCounter: 'F', quantity: 8, price: 150, costPrice: 130, salesAmount: 1200 },
    { id: 4, bank: 'Bank A', salesDate: '2024/01/04', cashRegister: '004', transactionId: 'TX012', originalCounter: 'G', updatedCounter: 'H', quantity: 12, price: 120, costPrice: 100, salesAmount: 1440 }
  ];
  columns2: Column[] = [
    { field: 'bank', header: '館別' },
    { field: 'salesDate', header: '銷售日期', groupField: '111' },
    { field: 'cashRegister', header: '收銀機號', groupField: '111' },
    { field: 'transactionId', header: '交易序號' },
    { field: 'originalCounter', header: '原專櫃', groupField: '222' },
    { field: 'updatedCounter', header: '修正後專櫃', groupField: '222' },
    { field: 'quantity', header: '數量', isSubTotal: true, isTotal: true, format: formatAmount },
    { field: 'price', header: '單價' },
    { field: 'costPrice', header: '進價', isSubTotal: true, isTotal: true, format: formatAmount },
    { field: 'salesAmount', header: '銷售金額', isSubTotal: true, isTotal: true, format: formatAmount }
  ];
  columnGroup = [
    { field: '111', header: '銷售資訊' },
    { field: '222', header: '專櫃資訊' }
  ];
  constructor() {
    super();
  }
  ngOnInit(): void {

  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {

    });
  }
}
