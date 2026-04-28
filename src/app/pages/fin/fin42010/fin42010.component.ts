import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownApiService } from './../../../service/utility/dropdown-api.service';
// Services
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { CommonModule } from '@angular/common';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN42010Data } from '@service/api/fin/fin42010.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { apiOption, option } from '@shared/models/sys/sysb000.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TableSubheaderComponent } from './fin42010-table/fin42010-table.component';

@Component({
  selector: 'app-fin42010',
  templateUrl: './fin42010.component.html',
  styleUrl: './fin42010.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    RadiobuttonComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    CommonModule,
    CalendarComponent,
    TableSubheaderComponent,
    ButtonModule]
})
export class FIN42010Component extends BasicQueryPageComponent<FIN42010Data> implements OnInit {
  queryForm = this.formBuilder.group({
    version: [null, [Validators.required]], //版本
    year: [null, [Validators.required]], //年
    department: [null], //部門
    unit: [null, [Validators.required]], // 金額單位表示
  });

  departmentOptions: option[] = [];
  unitOptions = [{ value: 1, label: '元' },
  { value: 2, label: '千' },
  { value: 3, label: '萬' }];

  data: FIN42010Data[] = [];
  filteredData = [...this.data];
  columns = [
    { field: 'subjectCode', header: '科目代號', visible: true },
    { field: 'subjectName', header: '科目名稱', visible: true },
    { field: 'january', header: '1月', visible: true },
    { field: 'february', header: '2月', visible: true },
    { field: 'march', header: '3月', visible: true },
    { field: 'april', header: '4月', visible: true },
    { field: 'may', header: '5月', visible: true },
    { field: 'june', header: '6月', visible: true },
    { field: 'july', header: '7月', visible: true },
    { field: 'august', header: '8月', visible: true },
    { field: 'september', header: '9月', visible: true },
    { field: 'october', header: '10月', visible: true },
    { field: 'november', header: '11月', visible: true },
    { field: 'december', header: '12月', visible: true },
    { field: 'totalBudget', header: '預算總金額', visible: true },
  ];

  // 控制變數
  btnLoading = false;

  constructor(
    private notificationService: NotificationService,
    private readonly dropdownApiService: DropdownApiService,
    private readonly dropDownListService: DropDownListService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN42010', 'fin/fin42010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();
    // if (frm.valid && this.canQuery()) {
    //   // Submit logic here
    // }
    this.loading = false;
    this.notificationService.unblockUi();
    // 模擬查詢結果
    this.data = [
      {
        subjectCode: '41',
        subjectName: '銷貨收入',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        totalBudget: 0
      },
      {
        subjectCode: '42',
        subjectName: '營業租金收入',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        totalBudget: 0
      },
      {
        subjectCode: '43',
        subjectName: '其他營業收入',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        totalBudget: 0
      },
      {
        subjectCode: '',
        subjectName: '營業收入',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        totalBudget: 0
      },
      {
        subjectCode: '51',
        subjectName: '銷貨成本',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        totalBudget: 0
      },
      {
        subjectCode: '52',
        subjectName: '其他營業支出',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        totalBudget: 0
      },
      {
        subjectCode: '',
        subjectName: '營業成本',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        totalBudget: 0
      },
      {
        subjectCode: '',
        subjectName: '營業毛利',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        totalBudget: 0
      },
      {
        subjectCode: '61',
        subjectName: '推銷費用',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        totalBudget: 0
      },
      {
        subjectCode: '62',
        subjectName: '管理費用',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        totalBudget: 0
      },
      {
        subjectCode: '',
        subjectName: '營業費用',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        totalBudget: 0
      },
      {
        subjectCode: '',
        subjectName: '營業淨利(淨損)',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        totalBudget: 0
      },
      {
        subjectCode: '71',
        subjectName: '營業外收入',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        totalBudget: 0
      },
      {
        subjectCode: '73',
        subjectName: '營業外收入',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        totalBudget: 0
      },
      {
        subjectCode: '74',
        subjectName: '營業外收入',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        totalBudget: 0
      },
      {
        subjectCode: '76',
        subjectName: '營業外支出',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        totalBudget: 0
      },
      {
        subjectCode: '',
        subjectName: '營業外收入及支出',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        totalBudget: 0
      },
      {
        subjectCode: '',
        subjectName: '稅前損益',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        totalBudget: 0
      },
      {
        subjectCode: '81',
        subjectName: '所得稅費用',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        totalBudget: 0
      },
      {
        subjectCode: '',
        subjectName: '所得稅費用',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        totalBudget: 0
      },
      {
        subjectCode: '',
        subjectName: '本期淨利(淨損)',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        totalBudget: 0
      }
    ];
  }

  //讀取下拉  
  loadOptions() {
    this.dropDownListService.querySYS3100_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.departmentOptions = res.Data.map((item: apiOption) => ({
        value: item.No,
        label: item.No + '-' + item.Name,
      }));
      console.log('res', res.Data);
    });
  }
}
