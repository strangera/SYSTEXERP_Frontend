import { Component, OnInit, ViewChild } from '@angular/core';
import { ColumnDef, ExpandableEditTableComponent } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { COMMON_IMPORTS } from '../demo-imports';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';

@Component({
  selector: 'app-example-table-bruce',
  standalone: true,
  imports: [
    COMMON_IMPORTS,
    ExpandableEditTableComponent,
  ],
  templateUrl: './example-table-bruce.component.html',
})
export class ExampleTableBruceComponent extends BasicQueryPageComponent<unknown> implements OnInit {
  @ViewChild(ExpandableEditTableComponent) expandableTable!: ExpandableEditTableComponent;
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
  // 展開式表格的欄位定義
  mainColumns: ColumnDef[] = [
    { field: 'name', header: '姓名', editable: true, type: 'text' },
    { field: 'age', header: '年齡', editable: true, type: 'number' },
    { field: 'email', header: 'Email', editable: true, type: 'text' },
    { field: 'city', header: '城市', editable: true, type: 'text' },
    { field: 'testbool', header: '是否', editable: true, type: 'checkbox' }
  ];
  // 詳細資料欄位定義
  detailColumns: ColumnDef[] = [
    { field: 'description', header: '詳細描述', editable: true, type: 'text' },
    { field: 'manufacturer', header: '來源', editable: true },
    { field: 'quantity', header: '數量', editable: true, type: 'number' },
    { field: 'price', header: '金額', editable: true, type: 'number' },
    { field: 'discount', header: '折扣(%)', editable: true, type: 'number' },
    { field: 'discount', header: '折扣(%)', editable: true, type: 'number' },
    { field: 'date', header: '日期', editable: true, type: 'date' },
    { field: 'testbool', header: '是否', editable: true, type: 'checkbox' }
  ]
  // 展開式表格的載入狀態
  expandLoading = false;
  // 預設新項目模板
  defaultNewPerson = {
    name: '',
    gender: '',
    age: 25,
    department: '',
    hireDate: new Date(),
    genderOptions: [
      { label: '男', value: '男' },
      { label: '女', value: '女' },
      { label: '其他', value: '其他' }
    ],
    details: []
  };
  // 預設新明細模板
  defaultNewDetail = {
    project: '',
    role: '',
    startDate: new Date(),
    endDate: null,
    performance: 0
  };  // 展開式表格的事件處理方法 - 修正為正確的參數類型
  // 注意：這些方法需要明確接收正確的事件類型
  onRowSave(event: any) {
    // 確認事件對象有預期的屬性
    if (event && 'oldData' in event && 'newData' in event) {
      console.log('儲存主表格行:', event);
      // 這裡可以加入實際的API儲存邏輯
    } else {
      console.warn('收到未預期的事件格式:', event);
    }
  }

  onRowCancel(event: any) {
    console.log('取消主表格編輯:', event);
  }

  onDetailSave(event: any) {
    // 確認事件對象有預期的屬性
    if (event && 'oldDetail' in event && 'newDetail' in event && 'parentData' in event) {
      console.log('儲存詳細資料:', event);
      // 這裡可以加入實際的API儲存邏輯
    } else {
      console.warn('收到未預期的事件格式:', event);
    }
  }

  onDetailCancel(event: any) {
    console.log('取消詳細資料編輯:', event);
  }

  // 新增人員事件 (新增)
  onAddPerson() {
    const newPerson = {
      ...this.defaultNewPerson,
      id: this.generatePersonId(),
      details: [] // 確保明細陣列存在
    };

    this.data.push(newPerson);

    // 自動進入編輯模式
    setTimeout(() => {
      const index = this.data.indexOf(newPerson);
      if (index >= 0) {
        this.expandableTable.onRowEditInit(newPerson, index);
      }
    }, 0);
  }

  onAddDetail(person: any) {
    console.log('新增明細，人員:', person);

    // 建立新明細物件
    const newDetail = {
      ...this.defaultNewDetail,
      id: this.generateDetailId(person),
      startDate: new Date()
    };

    // 確保details陣列存在
    if (!person.details) {
      person.details = [];
    }

    // 將新明細加入陣列
    person.details.unshift(newDetail);

    // 這裡可以加入新增成功訊息提示
  }

  // 生成新人員ID (新增)
  generatePersonId(): number {
    const maxId = Math.max(...this.data.map(p => p.id), 0);
    return maxId + 1;
  }

  // 生成新明細ID (新增)
  generateDetailId(person: any): number {
    if (!person.details || person.details.length === 0) {
      return 1;
    }
    const maxId = Math.max(...person.details.map((d: any) => d.id), 0);
    return maxId + 1;
  }
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
