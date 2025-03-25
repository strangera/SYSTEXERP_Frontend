import { SystemTypeService } from './../../../service/basic/system-type.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { FileType } from '../../../shared/componentkit/file-upload/file-upload.component';

const now = new Date();

@Component({
  selector: 'app-input.table',
  templateUrl: './input.table.component.html',
  styleUrl: './input.table.component.scss'
})
export class InputTableComponent extends BasicQpageComponent implements OnInit {
  // Upload files
  fileType: FileType = FileType.PNG;
  uploadUrl: string = 'https://www.primefaces.org/cdn/api/upload.php';
  //
  queryForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(13)]], // Input Text
    address: ['', [Validators.maxLength(10)]], // Inupt Number
    systemid: [, [Validators.required]], // Inupt Number
    posquickkeyid: [, [Validators.required]], // Inupt Number
    // ----------------------------------------------------------------
    money: [, [this.validationService.numberValidator]], // Input number
    startticket: [, [this.validationService.numberValidator]], // 發票張數 start Input number
    endticket: [, [this.validationService.numberValidator]], // 發票張數 end Input Text
    serialnumber: [, [Validators.maxLength(5), ]], // Input serial number: this.validationService.exactLengthValidator(8)
    startserialticket: [, [this.validationService.numberValidator]], // start serial number
    endserialticket: [, [this.validationService.numberValidator]], // end serial Text
    // ----------------------------------------------------------------
    systemtypedefault: [1, [Validators.required]], // DropDown default
    systemtype: [, [Validators.required]], // DropDown
    systemtypemulti: [[] as number[], [Validators.required]], // MultiSelect
    rolesmultilabel: [[], [Validators.required]], // MultiSelect
    // ----------------------------------------------------------------
    onetime: [, [Validators.required]], // 單選日限制 (datetime hh:ss)
    startbuttontime: [, [Validators.required]], // 單選日限制 (datetime hh:ss)
    endbuttontime: [, [Validators.required]], // 單選日限制 (datetime hh:ss)
    starttime: [, [Validators.required]], // 單選日限制 (datetime hh:ss)
    endtime: [, [Validators.required]], // 單選日限制 (datetime hh:ss)
    onedatedd: [, [Validators.required]], // 單選日限制 (datetime yyyy/mm/dd)
    onedatemm: [, [Validators.required]], // 單選月限制 (datetime yyyy/mm)
    twodatemm: [, [Validators.required]], // 單選月限制 (datetime yyyy/mm)
    onedatetyy: [, [Validators.required]], // 單選月限制 (datetime yyyy/mm)
    onedatetime: [, [Validators.required]], // 單選日期限制 (datetime yyyy/mm/dd)
    startdatemm: [, [Validators.required]], // 日期限制 (start-end datetime yyyy/mm)
    enddatemm: [, [Validators.required]], // 日期限制 (start-end datetime yyyy/mm)
    startdate: [, [Validators.required]], // 日期限制 (start-end datetime yyyy/mm/dd)
    enddate: [, [Validators.required]], // 日期限制 (start-end datetime yyyy/mm/dd)
    startdatetime: [, [Validators.required]], // 日期時間限制 (start-end datetime yyyy/mm/dd HH:mm)
    enddatetime: [, [Validators.required]], // 日期時間限制 (start-end datetime yyyy/mm/dd HH:mm)

    startqtr: [, [Validators.required]], // 日期時間限制 (start-end datetime yyyy/mm/dd HH:mm)
    endqtr: [, [Validators.required]], // 日期時間限制 (start-end datetime yyyy/mm/dd HH:mm)
    // ----------------------------------------------------------------
    usagec: [, ], // checkbox
    reviewc: [, ], // checkbox
    // ----------------------------------------------------------------
    editortext: [, ], // editor text
    // ----------------------------------------------------------------
    radiolist: [1, []], // 條件篩選, radioButton
  });
  // 下拉資料多個呈現
  // ----------------------------------------------------------------
  roles: any[] = [
    { id: 1, roleCode: 'ADMIN', roleName: 'Administrator' },
    { id: 2, roleCode: 'USER', roleName: 'User' },
    { id: 3, roleCode: 'GUEST', roleName: 'Guest' },
  ];
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    { 'name': 'William', 'isdelete': true, 'age': 35, 'email': 'william36@example.com', 'city': 'Yilan' },
    { 'name': 'Sarah', 'isdelete': false, 'age': 30, 'email': 'sarah49@example.com', 'city': 'Tainan' },
    { 'name': 'Emily', 'isdelete': true, 'age': 24, 'email': 'emily82@example.com', 'city': 'New Taipei' },
    { 'name': 'Sarah', 'isdelete': false, 'age': 23, 'email': 'sarah51@example.com', 'city': 'Tainan' },
    { 'name': 'William', 'isdelete': true, 'age': 34, 'email': 'william36@example.com', 'city': 'Kaohsiung' },
    { 'name': 'William', 'isdelete': false, 'age': 21, 'email': 'william95@example.com', 'city': 'Hsinchu' },
    { 'name': 'Michael', 'isdelete': false, 'age': 31, 'email': 'michael90@example.com', 'city': 'New Taipei' },
    { 'name': 'Sarah', 'isdelete': false, 'age': 23, 'email': 'sarah72@example.com', 'city': 'New Taipei' },
    { 'name': 'Michael', 'isdelete': false, 'age': 26, 'email': 'michael60@example.com', 'city': 'Changhua' },
    { 'name': 'Sarah', 'isdelete': true, 'age': 30, 'email': 'sarah46@example.com', 'city': 'Changhua' },
    { 'name': 'William', 'isdelete': true, 'age': 27, 'email': 'william64@example.com', 'city': 'Taipei' },
    { 'name': 'Sarah', 'isdelete': true, 'age': 34, 'email': 'sarah17@example.com', 'city': 'Hsinchu' },
    { 'name': 'Emily', 'isdelete': false, 'age': 26, 'email': 'emily99@example.com', 'city': 'Yilan' },
    { 'name': 'William', 'isdelete': false, 'age': 25, 'email': 'william73@example.com', 'city': 'Hsinchu' },
    { 'name': 'Sophia', 'isdelete': true, 'age': 34, 'email': 'sophia97@example.com', 'city': 'Chiayi' },
    { 'name': 'William', 'isdelete': true, 'age': 34, 'email': 'william49@example.com', 'city': 'Keelung' },
    { 'name': 'Emily', 'isdelete': false, 'age': 36, 'email': 'emily12@example.com', 'city': 'Taipei' },
    { 'name': 'Jessica', 'isdelete': true, 'age': 28, 'email': 'jessica33@example.com', 'city': 'Chiayi' },
    { 'name': 'David', 'isdelete': true, 'age': 22, 'email': 'david81@example.com', 'city': 'Hsinchu' },
    { 'name': 'Olivia', 'isdelete': false, 'age': 28, 'email': 'olivia61@example.com', 'city': 'Hsinchu' },
    { 'name': 'David', 'isdelete': true, 'age': 21, 'email': 'david4@example.com', 'city': 'Keelung' },
    { 'name': 'Olivia', 'isdelete': true, 'age': 28, 'email': 'olivia74@example.com', 'city': 'Hsinchu' },
    { 'name': 'Emily', 'isdelete': false, 'age': 23, 'email': 'emily4@example.com', 'city': 'Tainan' },
    { 'name': 'Jessica', 'isdelete': true, 'age': 25, 'email': 'jessica9@example.com', 'city': 'Changhua' },
    { 'name': 'David', 'isdelete': true, 'age': 22, 'email': 'david81@example.com', 'city': 'Hsinchu' },
    { 'name': 'Olivia', 'isdelete': false, 'age': 25, 'email': 'olivia50@example.com', 'city': 'Yilan' },
    { 'name': 'Michael', 'isdelete': false, 'age': 30, 'email': 'michael12@example.com', 'city': 'Taichung' },
    { 'name': 'Sophia', 'isdelete': false, 'age': 26, 'email': 'sophia11@example.com', 'city': 'Chiayi' },
    { 'name': 'William', 'isdelete': false, 'age': 24, 'email': 'william90@example.com', 'city': 'Kaohsiung' },
    { 'name': 'James', 'isdelete': false, 'age': 35, 'email': 'james67@example.com', 'city': 'Taichung' },
    { 'name': 'Sarah', 'isdelete': true, 'age': 21, 'email': 'sarah60@example.com', 'city': 'Tainan' },
    { 'name': 'Daniel', 'isdelete': true, 'age': 39, 'email': 'daniel54@example.com', 'city': 'New Taipei' },
    { 'name': 'William', 'isdelete': false, 'age': 28, 'email': 'william71@example.com', 'city': 'Keelung' },
    { 'name': 'Olivia', 'isdelete': false, 'age': 31, 'email': 'olivia21@example.com', 'city': 'Kaohsiung' },
    { 'name': 'William', 'isdelete': false, 'age': 30, 'email': 'william36@example.com', 'city': 'New Taipei' },
    { 'name': 'Sophia', 'isdelete': true, 'age': 23, 'email': 'sophia40@example.com', 'city': 'Kaohsiung' },
    { 'name': 'Sarah', 'isdelete': false, 'age': 25, 'email': 'sarah97@example.com', 'city': 'Changhua' },
    { 'name': 'William', 'isdelete': true, 'age': 35, 'email': 'william36@example.com', 'city': 'Yilan' }
  ];
  columns: any[]= [
    { field: 'name', header: 'Name', visible: true },
    { field: 'age', header: 'Age', visible: true },
    { field: 'email', header: 'Email', visible: true },
    { field: 'city', header: 'City', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  systemTypeOptions: any[] = [];

  // 模擬的資料
  tableColumns = [
    { field: 'id', header: 'ID', visible: true },
    { field: 'code', header: '代碼', visible: true },
    { field: 'name', header: '名稱', visible: true }
  ];

  tableData = [
    { id: 1, code: 'A001', name: '資料一' },
    { id: 2, code: 'A002', name: '資料二' },
    { id: 3, code: 'A003', name: '資料三' }
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private systemTypeService: SystemTypeService,
    private validationService: ValidationService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '900001';
    this.cruPage = '/demo/demoInputTableCRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    // ----------------------------------------------------------------
    this.systemTypeService.getSystemTypes().subscribe(data => {
      this.systemTypeOptions = data;

      // 全選填入
      /*let allSystemValues = this.systemTypeOptions.map(system => system.value);
      this.queryForm.patchValue({
        systemtypemulti: allSystemValues
      });*/
    });

    this.systemTypeOptions = [
      { "value": "4101", "label": "公司基本資料維護作業 (4101)" },
      { "value": "4102", "label": "廠商基本資料維護作業 (4102)" },
      { "value": "4103", "label": "組織階層設定作業 (4103)" },
      { "value": "4104", "label": "組織碼設定作業 (4104)" },
      { "value": "4105", "label": "區域基本資料維護作業 (4105)" },
      { "value": "4106", "label": "樓層基本資料維護作業 (4106)" },
      { "value": "4107", "label": "業種基本資料維護作業 (4107)" },
      { "value": "4108", "label": "商品類別維護作業 (4108)" },
      { "value": "4109", "label": "小分類維護作業 (4109)" },
      { "value": "4110", "label": "銀行基本資料維護作業 (4110)" },
      { "value": "4111", "label": "參數資料設定維護 (4111)" },
      { "value": "4112", "label": "簽核權限設定維護 (4112)" },
      { "value": "4113", "label": "縣市區域資料維護作業 (4113)" }
  ];
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    this.data = [
      { 'name': 'William', 'isdelete': true, 'age': 35, 'email': 'william36@example.com', 'city': 'Yilan' },
      { 'name': 'Sarah', 'isdelete': false, 'age': 30, 'email': 'sarah49@example.com', 'city': 'Tainan' },
      { 'name': 'Emily', 'isdelete': true, 'age': 24, 'email': 'emily82@example.com', 'city': 'New Taipei' },
      { 'name': 'Sarah', 'isdelete': false, 'age': 23, 'email': 'sarah51@example.com', 'city': 'Tainan' },
      { 'name': 'William', 'isdelete': true, 'age': 34, 'email': 'william36@example.com', 'city': 'Kaohsiung' },
      { 'name': 'William', 'isdelete': false, 'age': 21, 'email': 'william95@example.com', 'city': 'Hsinchu' },
      { 'name': 'Michael', 'isdelete': false, 'age': 31, 'email': 'michael90@example.com', 'city': 'New Taipei' },
      { 'name': 'Sarah', 'isdelete': false, 'age': 23, 'email': 'sarah72@example.com', 'city': 'New Taipei' },
      { 'name': 'Michael', 'isdelete': false, 'age': 26, 'email': 'michael60@example.com', 'city': 'Changhua' },
      { 'name': 'Sarah', 'isdelete': true, 'age': 30, 'email': 'sarah46@example.com', 'city': 'Changhua' },
      { 'name': 'William', 'isdelete': true, 'age': 27, 'email': 'william64@example.com', 'city': 'Taipei' },
      { 'name': 'Sarah', 'isdelete': true, 'age': 34, 'email': 'sarah17@example.com', 'city': 'Hsinchu' },
      { 'name': 'Emily', 'isdelete': false, 'age': 26, 'email': 'emily99@example.com', 'city': 'Yilan' },
      { 'name': 'William', 'isdelete': false, 'age': 25, 'email': 'william73@example.com', 'city': 'Hsinchu' },
      { 'name': 'Sophia', 'isdelete': true, 'age': 34, 'email': 'sophia97@example.com', 'city': 'Chiayi' },
      { 'name': 'William', 'isdelete': true, 'age': 34, 'email': 'william49@example.com', 'city': 'Keelung' },
      { 'name': 'Emily', 'isdelete': false, 'age': 36, 'email': 'emily12@example.com', 'city': 'Taipei' },
      { 'name': 'Jessica', 'isdelete': true, 'age': 28, 'email': 'jessica33@example.com', 'city': 'Chiayi' },
      { 'name': 'David', 'isdelete': true, 'age': 22, 'email': 'david81@example.com', 'city': 'Hsinchu' },
      { 'name': 'Olivia', 'isdelete': false, 'age': 28, 'email': 'olivia61@example.com', 'city': 'Hsinchu' },
      { 'name': 'David', 'isdelete': true, 'age': 21, 'email': 'david4@example.com', 'city': 'Keelung' },
      { 'name': 'Olivia', 'isdelete': true, 'age': 28, 'email': 'olivia74@example.com', 'city': 'Hsinchu' },
      { 'name': 'Emily', 'isdelete': false, 'age': 23, 'email': 'emily4@example.com', 'city': 'Tainan' },
      { 'name': 'Jessica', 'isdelete': true, 'age': 25, 'email': 'jessica9@example.com', 'city': 'Changhua' },
      { 'name': 'David', 'isdelete': true, 'age': 22, 'email': 'david81@example.com', 'city': 'Hsinchu' },
      { 'name': 'Olivia', 'isdelete': false, 'age': 25, 'email': 'olivia50@example.com', 'city': 'Yilan' },
      { 'name': 'Michael', 'isdelete': false, 'age': 30, 'email': 'michael12@example.com', 'city': 'Taichung' },
      { 'name': 'Sophia', 'isdelete': false, 'age': 26, 'email': 'sophia11@example.com', 'city': 'Chiayi' },
      { 'name': 'William', 'isdelete': false, 'age': 24, 'email': 'william90@example.com', 'city': 'Kaohsiung' },
      { 'name': 'James', 'isdelete': false, 'age': 35, 'email': 'james67@example.com', 'city': 'Taichung' },
      { 'name': 'Sarah', 'isdelete': true, 'age': 21, 'email': 'sarah60@example.com', 'city': 'Tainan' },
      { 'name': 'Daniel', 'isdelete': true, 'age': 39, 'email': 'daniel54@example.com', 'city': 'New Taipei' },
      { 'name': 'William', 'isdelete': false, 'age': 28, 'email': 'william71@example.com', 'city': 'Keelung' },
      { 'name': 'Olivia', 'isdelete': false, 'age': 31, 'email': 'olivia21@example.com', 'city': 'Kaohsiung' },
      { 'name': 'William', 'isdelete': false, 'age': 30, 'email': 'william36@example.com', 'city': 'New Taipei' },
      { 'name': 'Sophia', 'isdelete': true, 'age': 23, 'email': 'sophia40@example.com', 'city': 'Kaohsiung' },
      { 'name': 'Sarah', 'isdelete': false, 'age': 25, 'email': 'sarah97@example.com', 'city': 'Changhua' },
      { 'name': 'William', 'isdelete': true, 'age': 35, 'email': 'william36@example.com', 'city': 'Yilan' },
      { 'name': 'Sarah', 'isdelete': false, 'age': 30, 'email': 'sarah49@example.com', 'city': 'Tainan' },
      { 'name': 'Emily', 'isdelete': true, 'age': 24, 'email': 'emily82@example.com', 'city': 'New Taipei' },
      { 'name': 'Sarah', 'isdelete': false, 'age': 23, 'email': 'sarah51@example.com', 'city': 'Tainan' },
      { 'name': 'William', 'isdelete': true, 'age': 34, 'email': 'william36@example.com', 'city': 'Kaohsiung' },
      { 'name': 'William', 'isdelete': false, 'age': 21, 'email': 'william95@example.com', 'city': 'Hsinchu' },
      { 'name': 'Michael', 'isdelete': false, 'age': 31, 'email': 'michael90@example.com', 'city': 'New Taipei' },
      { 'name': 'Sarah', 'isdelete': false, 'age': 23, 'email': 'sarah72@example.com', 'city': 'New Taipei' },
      { 'name': 'Michael', 'isdelete': false, 'age': 26, 'email': 'michael60@example.com', 'city': 'Changhua' },
      { 'name': 'Sarah', 'isdelete': true, 'age': 30, 'email': 'sarah46@example.com', 'city': 'Changhua' },
      { 'name': 'William', 'isdelete': true, 'age': 27, 'email': 'william64@example.com', 'city': 'Taipei' },
      { 'name': 'Sarah', 'isdelete': true, 'age': 34, 'email': 'sarah17@example.com', 'city': 'Hsinchu' },
      { 'name': 'Emily', 'isdelete': false, 'age': 26, 'email': 'emily99@example.com', 'city': 'Yilan' },
      { 'name': 'William', 'isdelete': false, 'age': 25, 'email': 'william73@example.com', 'city': 'Hsinchu' },
      { 'name': 'Sophia', 'isdelete': true, 'age': 34, 'email': 'sophia97@example.com', 'city': 'Chiayi' },
      { 'name': 'William', 'isdelete': true, 'age': 34, 'email': 'william49@example.com', 'city': 'Keelung' },
      { 'name': 'Emily', 'isdelete': false, 'age': 36, 'email': 'emily12@example.com', 'city': 'Taipei' },
      { 'name': 'Jessica', 'isdelete': true, 'age': 28, 'email': 'jessica33@example.com', 'city': 'Chiayi' },
      { 'name': 'David', 'isdelete': true, 'age': 22, 'email': 'david81@example.com', 'city': 'Hsinchu' },
      { 'name': 'Olivia', 'isdelete': false, 'age': 28, 'email': 'olivia61@example.com', 'city': 'Hsinchu' },
      { 'name': 'David', 'isdelete': true, 'age': 21, 'email': 'david4@example.com', 'city': 'Keelung' },
      { 'name': 'Olivia', 'isdelete': true, 'age': 28, 'email': 'olivia74@example.com', 'city': 'Hsinchu' },
      { 'name': 'Emily', 'isdelete': false, 'age': 23, 'email': 'emily4@example.com', 'city': 'Tainan' },
      { 'name': 'Jessica', 'isdelete': true, 'age': 25, 'email': 'jessica9@example.com', 'city': 'Changhua' },
      { 'name': 'David', 'isdelete': true, 'age': 22, 'email': 'david81@example.com', 'city': 'Hsinchu' },
      { 'name': 'Olivia', 'isdelete': false, 'age': 25, 'email': 'olivia50@example.com', 'city': 'Yilan' },
      { 'name': 'Michael', 'isdelete': false, 'age': 30, 'email': 'michael12@example.com', 'city': 'Taichung' },
      { 'name': 'Sophia', 'isdelete': false, 'age': 26, 'email': 'sophia11@example.com', 'city': 'Chiayi' },
      { 'name': 'William', 'isdelete': false, 'age': 24, 'email': 'william90@example.com', 'city': 'Kaohsiung' },
      { 'name': 'James', 'isdelete': false, 'age': 35, 'email': 'james67@example.com', 'city': 'Taichung' },
      { 'name': 'Sarah', 'isdelete': true, 'age': 21, 'email': 'sarah60@example.com', 'city': 'Tainan' },
      { 'name': 'Daniel', 'isdelete': true, 'age': 39, 'email': 'daniel54@example.com', 'city': 'New Taipei' },
      { 'name': 'William', 'isdelete': false, 'age': 28, 'email': 'william71@example.com', 'city': 'Keelung' },
      { 'name': 'Olivia', 'isdelete': false, 'age': 31, 'email': 'olivia21@example.com', 'city': 'Kaohsiung' },
      { 'name': 'William', 'isdelete': false, 'age': 30, 'email': 'william36@example.com', 'city': 'New Taipei' },
      { 'name': 'Sophia', 'isdelete': true, 'age': 23, 'email': 'sophia40@example.com', 'city': 'Kaohsiung' },
      { 'name': 'Sarah', 'isdelete': false, 'age': 25, 'email': 'sarah97@example.com', 'city': 'Changhua' }
      // 其他資料
    ];

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      // Service
      // this.xxxService.queryMachine(frm.value as xxxInterface)
      //  .subscribe((response: any) => {
      //    this.rows = response.xxx;
      // });
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }
  // ----------------------------------------------------------------
  onCreate() {
    if (this.canAdd()) {
      this.navigateWithState(this.router, CRUDStatus.Create, null, this.cruPage);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(this.router, CRUDStatus.Edit, data, this.cruPage);
    }
  }

  onDetail(data: any) {
    this.navigateWithState(this.router, CRUDStatus.Read, data, this.cruPage);
  }
  // ----------------------------------------------------------------
  onDelete(data: any) {
    console.log(data);
  }

  onSystemTypeChange(selectedValue: any): void {
    console.log('選中的公告類型:', selectedValue);
    // 在這裡處理選中的值，您可以更新表單或執行其他邏輯
  }
}
