import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IUserResponse, Sys0110Service } from '@service/api/sys/sys0110.service';
import { SYS0760Service, userLoginErrorRequest, userLoginErrorResponse } from '@service/api/sys/sys0760.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { formatDateTime } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-sys0760',
  templateUrl: './sys0760.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarRangeComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    InputTextComponent
  ],
})
// 使用者異常登入報表
export class SYS0760Component extends BasicQueryPageComponent<userLoginErrorResponse> implements OnInit {
  queryForm = this.formBuilder.group({
    User_No: [''], // DropDown
    Description: ['', [Validators.required]], // DropDown
    From_IP: [''], // 日期限制 (start-end datetime yyyy/mm/dd)
    Start_Date: [null], // 日期限制 (start-end datetime yyyy/mm/dd)
    End_Date: [null], // Input Text
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'User_No', order: 1 }]],
  });
  totalRecords = 0
  userNoOptions: IUserResponse[] = [];
  lastQueryBody: userLoginErrorRequest | null = null;
  errotMsg: { value: string, label: string }[] = [
    { label: "錯誤使用者", value: "錯誤使用者" },
    { label: "密碼錯誤", value: "密碼錯誤" },
    { label: "使用者登入停用帳號", value: "使用者登入停用帳號" },
    { label: "密碼已過期", value: "密碼已過期" },
    { label: "使用者不在允許登入時間區間", value: "使用者不在允許登入時間區間" },
  ]
  data: userLoginErrorResponse[] = [];
  columns: ReportColumn[] = [
    { field: 'User_No', header: '使用者編號', visible: true },
    { field: 'Description', header: '事件代碼', visible: true },
    { field: 'From_IP', header: '登入者位址', visible: true },
    { field: 'Login_time', header: '登入時間', visible: true, format: formatDateTime },
  ];
  constructor(
    public readonly sys0760Service: SYS0760Service,
    private readonly sys0110Service: Sys0110Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0760', 'SYS/SYS0760CRU', this.queryForm, (form) => this.onSubmit(form));
    this.sys0110Service.queryAllUsers().pipe(untilDestroyed(this)).subscribe(response => {
      if (response.Data) {
        this.userNoOptions = response.Data.map((user: IUserResponse) => {
          return {
            ...user,
            label: user.user_No + ' - ' + user.user_Name
          }
        });
      }
    })
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const frmValue = frm.getRawValue() as userLoginErrorRequest;
      this.sys0760Service.queryUserLoginError(frmValue).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.data = res.Data ?? [];
        this.lastQueryBody = frmValue;
        this.totalRecords = res.TotalCount ?? 0;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      })
    });
  }
}
