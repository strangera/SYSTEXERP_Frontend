import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { QuerySysbq00Request, Sysbq00Data, Sysbq00DropDownItem, Sysbq00Service } from '../../../service/api/sys/sysbq00.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { formatDateTime } from '../../../others/component/table/table.model';

@Component({
  selector: 'app-sysbq00',
  templateUrl: './sysbq00.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    TranslateModule,
    TableReportComponent
  ],
})
export class SYSBQ00Component extends BasicQueryPageComponent<Sysbq00Data> implements OnInit {
  private readonly sysbq00Service = inject(Sysbq00Service);
  private readonly destroyRef = inject(DestroyRef);

  readonly data = signal<Sysbq00Data[]>([]);
  readonly totalRecords = signal(0);
  readonly selectedRows = signal<Sysbq00Data[]>([]);
  readonly lastQueryBody = signal<QuerySysbq00Request | null>(null);

  readonly tableQueryFunction = (params: QuerySysbq00Request) => this.sysbq00Service.querySYSBQ00(params);

  readonly queryForm = this.formBuilder.group({
    sys_type: [null as string | null],
    act_code: [null as string | null],
    data_type_desc: [''],
    pageSize: [1000],
    pageIndex: [1],
    SortBy: [[{ field: 'data_type', order: 1 }]],
  });

  private readonly allDropDownData = signal<Sysbq00DropDownItem[]>([]);
  private readonly selectedSysType = signal<string | null>(null);
  private initializingDropdowns = true;

  sysTypeOptions = computed(() =>
    this.allDropDownData().reduce<{ label: string; value: string }[]>((acc, item) => {
      if (!acc.some(x => x.value === item.parent_prog_no)) {
        acc.push({ label: `${item.parent_prog_no} ${item.parent_prog_name ?? ''}`, value: item.parent_prog_no });
      }
      return acc;
    }, [])
  );

  actCodeOptions = computed(() => {
    const sys = this.selectedSysType();
    if (!sys) return [];
    return this.allDropDownData()
      .filter(item => item.parent_prog_no === sys)
      .map(item => ({ label: `${item.child_prog_no} ${item.child_prog_name ?? ''}`, value: item.child_prog_no }));
  });

  readonly columns = [
    { field: 'sys_type', header: '系統別', visible: true, width: '70px' },
    { field: 'sys_type_name', header: '系統別名稱', visible: true },
    { field: 'data_type', header: '作業代碼', visible: true },
    { field: 'data_type_name', header: '作業名稱', visible: true },
    { field: 'line1', header: '簽核欄名稱1', visible: true },
    { field: 'line2', header: '簽核欄名稱2', visible: true },
    { field: 'line3', header: '簽核欄名稱3', visible: true },
    { field: 'line4', header: '簽核欄名稱4', visible: true },
    { field: 'line5', header: '簽核欄名稱5', visible: true },
    { field: 'CRT_Date', header: '建立時間', visible: false, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員編號', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員名稱', visible: false },
    { field: 'UPD_Date', header: '變更時間', visible: false, format: formatDateTime },
    { field: 'UPD_USR_No', header: '變更人員編號', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員名稱', visible: false },
  ];

  ngOnInit(): void {
    this.initializePage('SYSBQ00', 'SYS/SYSBQ00cru', this.queryForm, (form) => this.onSubmit(form));

    this.queryForm.controls.sys_type.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        this.selectedSysType.set(val);
        if (!this.initializingDropdowns) {
          this.queryForm.controls.act_code.reset(null);
        }
      });

    this.sysbq00Service.getSYSBQ00DropDown()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.allDropDownData.set(res.Data ?? []);
        // sync selectedSysType with any restored query state
        this.selectedSysType.set(this.queryForm.controls.sys_type.value);
        this.initializingDropdowns = false;
      });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.sysbq00Service.querySYSBQ00(frm.getRawValue() as QuerySysbq00Request)
        .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => (this.loading = false)))
        .subscribe(res => {
          this.data.set(res.Data);
          this.totalRecords.set(res.TotalCount ?? 0);
          this.lastQueryBody.set(frm.getRawValue() as QuerySysbq00Request);
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        });
    });
  }

  onDelete(rows: Sysbq00Data[]): void {
    this.messageService.confirm({
      header: '確定刪除？',
      message: `確定要刪除${rows.length}個選中的項目嗎？`,
      accept: () => {
        const idList = rows.map(r => r.id);
        if (!idList.length) return;
        this.loading = true;
        this.sysbq00Service.deleteSYSBQ00(idList)
          .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => (this.loading = false)))
          .subscribe(res => {
            this.messageService.successBubble(res.Message);
            this.onSubmit(this.queryForm);
          });
      }
    });
  }
}
