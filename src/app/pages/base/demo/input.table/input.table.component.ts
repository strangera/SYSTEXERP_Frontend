import { Component, input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { LocationData, LocationForm, LocationService } from './location.service';
import { BasicQueryPageComponent } from '../../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { SystemTypeService } from '../../../../service/basic/system-type.service';
import { Column } from '../../../../shared/componentkit/table/table.model';
import { FieldsConfig } from '../../../../shared/componentkit/dropdown-table/dropdown-table.component';
import { ExpandableEditTableComponent } from '../../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';


// 定義展開式表格所需的資料結構
interface ProductDetail {
  id: number;
  description: string;
  manufacturer: string;
  quantity: number;
  price: number;
  discount: number;
}

// 定義欄位結構
interface ColumnDef {
  field: string;
  header: string;
  type?: string;
  editable?: boolean;
  hidden?: boolean;
  style?: string;
}

// 定義事件資料類型
interface RowSaveEvent {
  oldData: any;
  newData: any;
}

interface DetailSaveEvent {
  oldDetail: any;
  newDetail: any;
  parentData: any;
}

@Component({
  selector: 'app-input.table',
  templateUrl: './input.table.component.html',
  styleUrl: './input.table.component.scss'
})
export class InputTableComponent extends BasicQueryPageComponent<any> implements OnInit {
  // 在父組件中聲明
  @ViewChild(ExpandableEditTableComponent) expandableTable!: ExpandableEditTableComponent;

  queryForm = this.formBuilder.group({
    dateRangeQuick1: [null, [Validators.required]],
    dateRangeQuick2: [null, [Validators.required]],
    dropdownTable: ['', [Validators.required]], // Multi Level
    multiSelectTable: [[], [Validators.required]], // Multi Level
    text: ['', [Validators.required, Validators.maxLength(13)]], // Input Text
    textarea: ['', [Validators.required, Validators.maxLength(13)]], // Input Textarea
    number: [null, [Validators.required, Validators.maxLength(13)]], // Input number
    number1: [null, [Validators.required, Validators.maxLength(13)]], // Input number
    number2: [null, [Validators.required, Validators.maxLength(13)]], // Input number
    dropdown: [null, [Validators.required]], // Dropdown
    multiSelect: [null, [Validators.required]], // Dropdown
    timeOne: [null, [Validators.required]], // Dropdown
    timeRange1: [null, [Validators.required]], // Dropdown
    timeRange2: [null, [Validators.required]], // Dropdown
    dateOne: [null, [Validators.required]], // Dropdown
    dateRange1: [null, [Validators.required]], // Dropdown
    dateRange2: [null, [Validators.required]], // Dropdown
    dateTimeOne: [null, [Validators.required]], // Dropdown
    dateTimeRange1: [null, [Validators.required]], // Dropdown
    dateTimeRange2: [null, [Validators.required]], // Dropdown
    dateMonthOne: [null, [Validators.required]], // Dropdown
    dateMonthRange1: [null, [Validators.required]], // Dropdown
    dateMonthRange2: [null, [Validators.required]], // Dropdown
    dateYearOne: [null, [Validators.required]], // Dropdown
    dateYearRange1: [null, [Validators.required]], // Dropdown
    dateYearRange2: [null, [Validators.required]], // Dropdown
    radiolist: [null, [Validators.required]], // Dropdown
    editortext: [null, [Validators.required]], // Dropdown
  });
  // 表格
  data: any[] = [
    {
      'id': 1, 'name': 'William', 'isdelete': true, 'age': 35, 'email': 'william36@example.com', 'city': 'Yilan', 'details': [
        { id: 1, description: '個人資料A', manufacturer: '台灣', quantity: 10, price: 1500, discount: 5, date: '2025/05/20' },
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

  // 展開式表格的欄位定義
  mainColumns: ColumnDef[] = [
    { field: 'name', header: '姓名', editable: true, type: 'text' },
    { field: 'age', header: '年齡', editable: true, type: 'number' },
    { field: 'email', header: 'Email', editable: true, type: 'text' },
    { field: 'city', header: '城市', editable: true, type: 'text' }
  ];

  // 詳細資料欄位定義
  detailColumns: ColumnDef[] = [
    { field: 'description', header: '詳細描述', editable: true, type: 'text' },
    { field: 'manufacturer', header: '來源', editable: true },
    { field: 'quantity', header: '數量', editable: true, type: 'number' },
    { field: 'price', header: '金額', editable: true, type: 'number' },
    { field: 'discount', header: '折扣(%)', editable: true, type: 'number' },
    { field: 'date', header: '日期', editable: true, type: 'date' }
  ];

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
  };

  isRowSelectable(rowData: any): boolean {
    return rowData.isdelete;
  }
  // ----------------------------------------------------------------
  systemTypeOptions: any[] = [];

  constructor(
    private systemTypeService: SystemTypeService,
    private locationService: LocationService,) {
    super();
  }
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
  }
  onDelete(data: any) {
    console.log(data);
  }

  ngOnInit(): void {
    this.initializePage('900001', '/demo/demoInputTableCRU');
    this.systemTypeService.getSystemTypes().subscribe(data => {
      this.systemTypeOptions = data;
    });
    this.locationSubscribe();
  }
  // tree dropDown==================================
  memberList = [
    { id: '1', department: 'Department A', role: 'Owner', name: 'Amy Elsner', email: 'amy@email.com', phone: '0911111111' },
    { id: '2', department: 'Department A', role: 'Owner', name: 'Anna Fali', email: 'anna@email.com', phone: '0922222222' },
    { id: '3', department: 'Department A', role: 'Viewer', name: 'Asiya Javayant', email: 'asiya@email.com', phone: '0933333333' },
    { id: '4', department: 'Department B', role: 'Examiner', name: 'Bernardo Dominic', email: 'bernardo@email.com', phone: '0944444444' },
    { id: '5', department: 'Department B', role: 'Reviewer', name: 'Elwin Sharvill', email: 'elwin@email.com', phone: '0955555555' }]; // 從 API 或資料庫取得
  columnDefs = [
    { value: 'department', label: '部門' },
    { value: 'role', label: '角色' },
    { value: 'member', label: '成員' }
  ];

  onMembersSelected(selected: any[]) {
    console.log('從子元件選到的:', selected);
  }

  // dropdownTable==================================
  fieldsConfig: FieldsConfig[] = [
    { field: 'LOCATION_No', header: '位置編號', mainDataField: true },
    { field: 'FLOOR_NO', header: '樓層', format: (value: string) => this.floorOptions.find(option => option.value === value)?.label || value },
    { field: 'AREA_NO', header: '區域', format: (value: string) => this.RegionCodeOptions.find(option => option.value === value)?.label || value },
    { field: 'GROSS_SPACE', header: '營業坪數' },
  ];
  suggestions: LocationData[] = [];
  private searchInput$ = new Subject<any>();
  locationSubscribe() { // 自動建議(動態打API)延遲300ms
    this.searchInput$.pipe(debounceTime(300), switchMap((formValue: LocationForm) =>
      this.locationService.searchLocations(formValue))).subscribe((results) => {
        this.suggestions = [...results];
      });
  }
  onAutoCompleteInputChange(event: any) { // 當輸入值改變時，要跟訂閱說一下(我可能要打API了)
    this.searchInput$.next(event);
  }
  // 基本查詢選項
  BUILDING_NO_Options: any[] = [{ value: '01', label: '01' }, { value: '02', label: '02' }]
  floorOptions: any[] = [{ value: '16F', label: '16F' }, { value: '1F', label: '1F' }, { value: 'B1', label: 'B1' },];
  RegionCodeOptions: any[] = [{ value: 'Z', label: 'Z區' }, { value: 'A', label: 'A區' }, { value: 'B', label: 'B區' },];
  // overlayPanel 裡面的form
  dialogForm = this.formBuilder.group({
    LOCATION_No: ['', [Validators.maxLength(10)]], // 位置編號
    BUILDING_NO: [null], // 館別
    FLOOR_NO: [null], // 樓層
    AREA_NO: [null], // 區域
  })
  dialogData: LocationData[] = [];// overlayPanel 裡面的table
  // overlayPanel 欄位配置
  dialogColumns: Column[] = [
    { field: 'LOCATION_No', header: '位置編號' },
    { field: 'BUILDING_NO', header: '館別' },
    { field: 'FLOOR_NO', header: '樓層', format: (value: string) => this.floorOptions.find(option => option.value === value)?.label || value },
    { field: 'AREA_NO', header: '區域', format: (value: string) => this.RegionCodeOptions.find(option => option.value === value)?.label || value },
    { field: 'GROSS_SPACE', header: '營業坪數' },
  ];
  dialogloading = false;
  onformValueChanged(event: any) { //onformValueChanged的Form如何改變時，也要打API(但跟上面的一樣都用同一支API就可以)
    this.dialogloading = true;
    this.locationService.searchLocations(event).subscribe((results) => {
      this.dialogData = [...results]; // 更新data資料
      this.dialogloading = false;
    });
  }

  // 展開式表格的事件處理方法 - 修正為正確的參數類型
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
}
