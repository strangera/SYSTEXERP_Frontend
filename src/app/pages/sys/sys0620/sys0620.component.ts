import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QuerySYS0620Request, SYS0620QueryData, Sys0620Service } from '@service/api/sys/sys0620.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { formatDateTime, ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';

@Component({
  selector: 'app-sys0620',
  templateUrl: './sys0620.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    ButtonModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    AsyncPipe
  ],
})
// 角色基本資料異動查詢
export class SYS0620Component extends BasicQueryPageComponent<SYS0620QueryData> implements OnInit {
  private readonly dropdownApi = inject(DropdownApiService);
  public readonly sys0620Service = inject(Sys0620Service);
  private readonly datePipe = inject(DatePipe);
  private readonly destroyRef = inject(DestroyRef);

  queryForm = this.formBuilder.group({
    StartDate: [null as Date | string | null, Validators.required], // 變更時間起(必填)
    EndDate: [null as Date | string | null, Validators.required],   // 變更時間迄(必填)
    UserNo: [null as string | null],                                // 異動使用者代碼
    RoleCode: [null as string | null]                              // 角色代碼
  });

  data: SYS0620QueryData[] = [];
  lastQueryBody: QuerySYS0620Request | null = null;
  public readonly totalRecords = signal<number>(0);

  // 對齊後端 Dto 的屬性名稱
  columns: ReportColumn[] = [
    { field: 'ID', header: '序號', visible: true, showSort: true },
    { field: 'UserName', header: '使用者名稱', visible: true, showSort: true },
    { field: 'RoleName', header: '角色名稱', visible: true, showSort: true },
    { field: 'ActionStatus', header: '異動狀態', visible: true, showSort: true },
    { field: 'LogTime', header: '紀錄時間', visible: true, showSort: true, format: formatDateTime },
    { field: 'CreateUserName', header: '建立者名稱', visible: true, showSort: true },
  ];

  // 下拉選單來源
  userOptions = signal(this.dropdownApi.queryTblUser());   // queryTBLUSER_DropDownList()
  roleOptions = signal(this.dropdownApi.queryTblRole());   // querytblRole_DropDownList()

  ngOnInit(): void {
    this.initializePage('SYS0620');
  }

  onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const raw = this.queryForm.getRawValue();
      const body = {
        ...raw,
        StartDate: raw.StartDate,
        EndDate: raw.EndDate,
      } as QuerySYS0620Request;

      this.sys0620Service.querySYS0620(body)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => (this.loading = false))
        )
        .subscribe((res) => {
          this.lastQueryBody = body;
          this.data = res.Data ?? [];
          this.totalRecords.set(res.TotalCount ?? this.data.length);
        });
    });
  }
}
