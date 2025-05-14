import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { LocationData, LocationForm, LocationService } from './location.service';
import { BasicQueryPageComponent } from '../../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { SystemTypeService } from '../../../../service/basic/system-type.service';
import { Column } from '../../../../shared/componentkit/table/table.model';
import { FieldsConfig } from '../../../../shared/componentkit/dropdown-table/dropdown-table.component';

@Component({
  selector: 'app-input.table',
  templateUrl: './input.table.component.html',
  styleUrl: './input.table.component.scss'
})
export class InputTableComponent extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    dateRangeQuick1: [null, [Validators.required]],
    dateRangeQuick2: [null, [Validators.required]],
    multiLevel: ['', [Validators.required]], // Multi Level
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
}
