import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QuerySYS0791Request, SYS0791QueryData, Sys0791Service } from '@service/api/sys/sys0791.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown'; // 還原引入 PrimeNG 下拉元件
import { finalize } from 'rxjs';
import { getSYS1000Options } from 'src/app/service/system/sys1000.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { ReportColumn } from '../../../shared/components/table-report/table-report.model';

@Component({
  selector: 'app-sys0791',
  templateUrl: './sys0791.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    ButtonModule,
    DropdownModule, // 掛載原生模組
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
// 作業使用率查詢
export class SYS0791Component extends BasicQueryPageComponent<SYS0791QueryData> implements OnInit {
  private readonly dropdownApi = inject(DropdownApiService);
  public readonly sys0791Service = inject(Sys0791Service);
  private readonly datePipe = inject(DatePipe);
  private readonly destroyRef = inject(DestroyRef);

  // 獨立管理的狀態，預設值為 1
  readonly selectedQueryAngle = signal<string>('1');

  queryForm = this.formBuilder.group({
    DateS: [null as Date | string | null, Validators.required],
    DateE: [null as Date | string | null, Validators.required],
    UserNo: [null as string | null],
    RoleNo: [null as string | null],
    OrgId: [null as string | null],
    Prog1: [null as string | null],
    Prog2: [null as string | null],
    Prog3: [null as string | null],
    pageSize: [1000],
    pageIndex: [1],
    SortBy: [[{ field: 'ID', order: -1 }]],
  });

  data: SYS0791QueryData[] = [];
  lastQueryBody: QuerySYS0791Request | null = null;
  public readonly totalRecords = signal<number>(0);

  // Field 直接對齊後端回傳的原始欄位名稱
  columns: ReportColumn[] = [
    { field: 'UserNo', header: '使用者編號', visible: true, showSort: true },
    { field: 'UserName', header: '使用者名稱', visible: true },
    { field: 'org_id', header: '組織編號', visible: true, showSort: true },
    { field: 'Org_Name', header: '組織名稱', visible: true },
    { field: 'prog_no1', header: '主系統編號', visible: true, showSort: true },
    { field: 'prog_name1', header: '主系統名稱', visible: true },
    { field: 'prog_no2', header: '子系統編號', visible: true, showSort: true },
    { field: 'prog_name2', header: '子系統名稱', visible: true },
    { field: 'prog_no3', header: '作業編號', visible: true, showSort: true },
    { field: 'prog_name3', header: '作業名稱', visible: true },
    { field: 'usetimes', header: '使用者使用次數', visible: true, showSort: true },
    { field: 'userate', header: '使用者使用率', visible: true },
    { field: 'orgtimes', header: '組織使用次數', visible: true, showSort: true },
    { field: 'orgrate', header: '組織使用率', visible: true },
  ];

  readonly queryAngleOptions = getSYS1000Options('SYS0791_TYPE');
  userOptions = signal(this.dropdownApi.queryTblUser());
  roleOptions = signal(this.dropdownApi.queryTblRole());
  orgOptions = signal(this.dropdownApi.querySys3100());

  mainSystemOptions = signal<Option[]>([]);
  subSystemOptions = signal<Option[]>([]);
  jobNumberOptions = signal<Option[]>([]);

  readonly subSystemDisabled = signal<boolean>(true);
  readonly jobNumberDisabled = signal<boolean>(true);

  ngOnInit(): void {
    this.initializePage('SYS0791');
    this.loadProgOptions(1, undefined, this.mainSystemOptions);
    this.watchProgCascade();
  }

  // 當修改下拉選單角度時，直接觸發提交
  onAngleChange(): void {
    this.onSubmit();
  }

  // 清除按鈕額外確保角度欄位重置
  onClearForm(): void {
    this.selectedQueryAngle.set('1');
  }

  onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const raw = this.queryForm.getRawValue();
      const body = {
        ...raw,
        Type: Number(this.selectedQueryAngle()), // 帶入當前 Header Dropdown 的 Signal 數值
        DateS: this.datePipe.transform(raw.DateS, 'yyyy-MM-dd'),
        DateE: this.datePipe.transform(raw.DateE, 'yyyy-MM-dd'),
      } as QuerySYS0791Request;

      this.sys0791Service.querySYS0791(body)
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

  private watchProgCascade(): void {
    this.queryForm.controls.Prog1.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((prog1) => {
        this.queryForm.patchValue({ Prog2: null, Prog3: null }, { emitEvent: false });
        this.subSystemOptions.set([]);
        this.jobNumberOptions.set([]);
        this.subSystemDisabled.set(!prog1);
        this.jobNumberDisabled.set(true);
        if (prog1) {
          this.loadProgOptions(2, prog1, this.subSystemOptions);
        }
      });

    this.queryForm.controls.Prog2.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((prog2) => {
        this.queryForm.patchValue({ Prog3: null }, { emitEvent: false });
        this.jobNumberOptions.set([]);
        this.jobNumberDisabled.set(!prog2);
        if (prog2) {
          this.loadProgOptions(2, prog2, this.jobNumberOptions);
        }
      });
  }

  private loadProgOptions(
    type: number,
    progNo: string | null | undefined,
    target: WritableSignal<Option[]>,
  ): void {
    this.sys0791Service.getProgList({ Type: type, ProgNo: progNo })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        const options = (res.Data ?? []).map((item) => ({
          label: `${item.prog_no} - ${item.prog_name}`,
          value: item.prog_no,
        }));
        target.set(options);
      });
  }
}
