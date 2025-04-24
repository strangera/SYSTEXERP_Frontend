import { SystemTypeService } from './../../../service/basic/system-type.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../shared/service/validation.service';
import { FileType } from '../../../shared/componentkit/file-upload/file-upload.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

@Component({
  selector: 'app-input.table',
  templateUrl: './input.table.component.html',
  styleUrl: './input.table.component.scss'
})
export class InputTableComponent extends BasicQueryPageComponent<any> implements OnInit {
  // Upload files
  fileType: FileType = FileType.PNG;
  uploadUrl = 'https://www.primefaces.org/cdn/api/upload.php';
  //
  queryForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(13)]], // Input Text
    address: ['', [Validators.maxLength(10)]], // Inupt Number
    systemid: [, [Validators.required]], // Inupt Number
    posquickkeyid: [, [Validators.required]], // Inupt Number
    // ----------------------------------------------------------------
    money: [, [Validators.required, this.validationService.numberValidator]], // Input number
    startticket: [, [Validators.required, this.validationService.numberValidator]], // 發票張數 start Input number
    endticket: [, [Validators.required, this.validationService.numberValidator]], // 發票張數 end Input Text
    serialnumber: [, [Validators.maxLength(5),]], // Input serial number: this.validationService.exactLengthValidator(8)
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
    usagec: [,], // checkbox
    reviewc: [,], // checkbox
    // ----------------------------------------------------------------
    editortext: [,], // editor text
    // ----------------------------------------------------------------
    radiolist: [1, []], // 條件篩選, radioButton
  });
  // 表格
  data: any[] = [
    { 'name': 'William', 'isdelete': true, 'age': 35, 'email': 'william36@example.com', 'city': 'Yilan' },
    { 'name': 'Sarah', 'isdelete': false, 'age': 30, 'email': 'sarah49@example.com', 'city': 'Tainan' },
    { 'name': 'Emily', 'isdelete': true, 'age': 24, 'email': 'emily82@example.com', 'city': 'New Taipei' },
    { 'name': 'Sarah', 'isdelete': false, 'age': 23, 'email': 'sarah51@example.com', 'city': 'Tainan' },
  ];
  columns: any[] = [
    { field: 'name', header: 'Name', visible: true },
    { field: 'age', header: 'Age', visible: true },
    { field: 'email', header: 'Email', visible: true },
    { field: 'city', header: 'City', visible: true },
    // 其他欄位
  ];

  isRowSelectable(rowData: any): boolean {
    return rowData.isdelete;
  }
  // ----------------------------------------------------------------
  systemTypeOptions: any[] = [];

  constructor(
    private systemTypeService: SystemTypeService,
    private validationService: ValidationService,
  ) {
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
      // 提交邏輯 Service
      // this.xxxService.queryMachine(frm.value as xxxInterface)
      //   .subscribe((response: any) => {
      this.data = [
        { 'name': 'William', 'isdelete': true, 'age': 35, 'email': 'william36@example.com', 'city': 'Yilan' },
        { 'name': 'Sarah', 'isdelete': false, 'age': 30, 'email': 'sarah49@example.com', 'city': 'Tainan' },
        { 'name': 'Emily', 'isdelete': true, 'age': 24, 'email': 'emily82@example.com', 'city': 'New Taipei' },
        { 'name': 'Sarah', 'isdelete': false, 'age': 23, 'email': 'sarah51@example.com', 'city': 'Tainan' },
      ];
      //   });
    })
  }
  onDelete(data: any) {
    console.log(data);
  }
  onSystemTypeChange(selectedValue: any): void {
    console.log('選中的公告類型:', selectedValue);
  }
}
