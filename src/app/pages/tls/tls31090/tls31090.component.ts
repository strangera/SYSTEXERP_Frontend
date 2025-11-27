import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo } from '../../../shared/models/system/funsrightInfo';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';


import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls31090',
  templateUrl: './tls31090.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, RadiobuttonComponent, NgIf, CalendarRangeComponent, DropdownComponent, ButtonComponent, TableComponent, TranslateModule]
})

export class TLS31090Component {

  // 程式編號
  ProgNo: string = '230009';
  // 權限變數
  funInfo?: FunsrightInfo;




  // 查詢表單
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    radiolist: [1, []], // 條件篩選, radioButton
    floor: [],  // 樓層
    region: [], //區域
    tax: [], //稅別
    type: [],
    organizationCode: [],  // 專櫃編號
    businessTypeCode: [],  // 大分類
    commissionType: [], // 抽成方式
    onedatedd: [],
    onedateyy: [],
    radio1: [],
    onedatemm: [],
    startdatetime: [], enddatetime: [],
    counterCode: [],  // 專櫃編號
  });

  daterangeOptions: any[] = [
    { value: 1, label: '全時段顯示' },
    { value: 2, label: '交易時間' },

  ];



  organizationOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  commissionTypeOptions: any[] = [];
  TypeOptions: any[] = [];

  counterCodeOptions: any[] = [];
  taxOptions: any[] = [];
  operationsOptions: any[] = [];
  selectedOption: string = '1'; // 預設選擇的欄位

  // 表格資料
  data: any[] = [];

  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: '1', header: '樓層名稱', visible: true },
    { field: '2', header: '營業目標', visible: true },
    { field: '3', header: '營業實績', visible: true },
    { field: '4', header: '達成率', visible: true },
    { field: '5', header: '營業目標佔比', visible: true },
    { field: '6', header: '營業實績佔比', visible: true },
    { field: '7', header: '交易筆數', visible: true },
    { field: '8', header: '客單價', visible: true },
    { field: '9', header: '坪數', visible: true },
    { field: '10', header: '坪效', visible: true },
    { field: '11', header: '營業實績', visible: true },
    { field: '12', header: '營業實績佔比', visible: true },
    { field: '13', header: '臨時櫃業績佔比', visible: true },
  ];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
  ) { }


  ngOnInit(): void {


    //
  }

  canQuery(): boolean {
    return true;
  }

  canAdd(): boolean {
    return true;
  }

  canEdit(): boolean {
    return true;
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
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

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm
        },
        skipLocationChange: true
      };
      this.router.navigate(['/demoCRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm
        },
        skipLocationChange: true
      };
      this.router.navigate(['/demoCRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm
      },
      skipLocationChange: true
    };
    this.router.navigate(['/demoCRU'], extras);
  }


  onSystemTypeChange(selectedValue: any): void {
    this.selectedOption = selectedValue
  }
}
