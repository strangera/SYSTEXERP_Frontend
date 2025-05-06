import { SystemTypeService } from './../../../service/basic/system-type.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-input.table',
  templateUrl: './input.table.component.html',
  styleUrl: './input.table.component.scss'
})
export class InputTableComponent extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
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
    { 'name': 'William', 'isdelete': true, 'age': 35, 'email': 'william36@example.com', 'city': 'Yilan' },
    { 'name': 'Sarah', 'isdelete': false, 'age': 30, 'email': 'sarah49@example.com', 'city': 'Tainan' },
    { 'name': 'Emily', 'isdelete': true, 'age': 24, 'email': 'emily82@example.com', 'city': 'New Taipei' },
    { 'name': 'Sarah', 'isdelete': false, 'age': 23, 'email': 'sarah51@example.com', 'city': 'Tainan' },
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
  // ----------------------------------------------------------------
  systemTypeOptions: any[] = [];

  constructor(private systemTypeService: SystemTypeService,) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('900001', '/demo/demoInputTableCRU');
    this.systemTypeService.getSystemTypes().subscribe(data => {
      this.systemTypeOptions = data;
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.data = [
        { 'name': 'William', 'isdelete': true, 'age': 35, 'email': 'william36@example.com', 'city': 'Yilan' },
        { 'name': 'Sarah', 'isdelete': false, 'age': 30, 'email': 'sarah49@example.com', 'city': 'Tainan' },
        { 'name': 'Emily', 'isdelete': true, 'age': 24, 'email': 'emily82@example.com', 'city': 'New Taipei' },
        { 'name': 'Sarah', 'isdelete': false, 'age': 23, 'email': 'sarah51@example.com', 'city': 'Tainan' },
      ];
    })
  }
  onDelete(data: any) {
    console.log(data);
  }

  // dialog==================================
  visibleDialog = false;
  dialogForm = this.formBuilder.group({
    CashRegisterCode: ['', [Validators.maxLength(13)]], // 收銀機代號
    counterCode: ['', [Validators.maxLength(13)]], // 專櫃編號
    counterName: ['', [Validators.maxLength(13)]], // 專櫃名稱
    BUILDING_NO: [null], // 館別
    FLOOR_NO: [null], // 樓層
    AREA_NO: [null], // 區域
  })
  BUILDING_NO_Options: any[] = [
    { value: 1, label: '1館' },
    { value: 2, label: '2館' },
  ];
  floorOptions: any[] = [
    { value: 1, label: 'B1' },
    { value: 2, label: '1F' },
    { value: 3, label: '2F' },
  ];
  RegionCodeOptions: any[] = [
    { value: 1, label: 'A區' },
    { value: 2, label: 'B區' },
    { value: 3, label: 'C區' },
  ];
  dialogColumns: Column[] = [
    { field: 'CashRegisterCode', header: '收銀機代號' },
    { field: 'counterCode', header: '專櫃編號' },
    { field: 'counterName', header: '專櫃名稱' },
    { field: 'BUILDING_NO', header: '館別', format: (value: any) => this.BUILDING_NO_Options.find(option => option.value === value)?.label || value },
    { field: 'FLOOR_NO', header: '樓層', format: (value: any) => this.floorOptions.find(option => option.value === value)?.label || value },
    { field: 'AREA_NO', header: '區域', format: (value: any) => this.RegionCodeOptions.find(option => option.value === value)?.label || value },
  ];
  dialogData: any = [];
  selectedItemsDialog: any = [];
  dialogIsLoading = false;
  onDialogQuery(frm: FormGroup) {
    console.log(frm.value);
    this.dialogIsLoading = true;
    setTimeout(() => {
      this.dialogData = [
        { CashRegisterCode: '001', counterCode: 'A01', counterName: '櫃檯1', BUILDING_NO: 1, FLOOR_NO: 1, AREA_NO: 1 },
        { CashRegisterCode: '002', counterCode: 'A02', counterName: '櫃檯2', BUILDING_NO: 1, FLOOR_NO: 2, AREA_NO: 2 },
        { CashRegisterCode: '003', counterCode: 'A03', counterName: '櫃檯3', BUILDING_NO: 2, FLOOR_NO: 3, AREA_NO: 3 },
        { CashRegisterCode: '004', counterCode: 'A04', counterName: '櫃檯4', BUILDING_NO: 2, FLOOR_NO: 1, AREA_NO: 1 },
      ];
      this.dialogIsLoading = false;
    }, 1000);
  }
  onDialogSubmit() {

  }
}
