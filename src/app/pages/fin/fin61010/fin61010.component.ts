import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import {
  FIN61010Data,
  FIN61010QueryRequest,
  FIN61010Service,
} from '../../../service/api/fin/fin61010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@UntilDestroy()
@Component({
  selector: 'app-fin61010',
  templateUrl: './fin61010.component.html',
  styleUrl: './fin61010.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    MultiSelectComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
export class FIN61010Component extends BasicQueryPageComponent<FIN61010Data> implements OnInit {
  queryForm = this.formBuilder.group({
    BNK_No: [''],
    CHK_StatusList: [[] as string[]],
    ...createPaginationConfig([{ field: 'BNK_No', order: 1 }]),
  });

  statusOptions = [
    { value: '0', label: '停用' },
    { value: '1', label: '手開' },
    { value: '2', label: '電腦' },
  ];

  bankNoOptions: { value: string; label: string }[] = [];

  totalRecords = 0;
  data: FIN61010Data[] = [];
  lastQueryBody?: FIN61010QueryRequest;

  columns: ReportColumn[] = [
    { field: 'id', header: '序號', visible: false },
    { field: 'mid', header: 'MID', visible: false },
    { field: 'BNK_No', header: '公司銀行代號', visible: true },
    { field: 'BNK_Name', header: '公司銀行名稱', visible: true },
    { field: 'CHK_Track', header: '前置碼', visible: true },
    { field: 'CHK_NumLen', header: '數字長度', visible: true },
    { field: 'CHK_BegNo', header: '起始碼', visible: true },
    { field: 'CHK_EndNo', header: '終止碼', visible: true },
    { field: 'CHK_LastUsedNo', header: '已用號碼', visible: true },
    {
      field: 'CHK_Status', header: '狀態', visible: true,
      format: (v: string) => this.statusOptions.find(o => o.value === v)?.label ?? v,
    },
    { field: 'CHK_UseDate', header: '起用日', visible: true },
    { field: 'CHK_StopDate', header: '停用日', visible: true },
  ];

  constructor(
    private fin61010Service: FIN61010Service,
    private dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN61010', 'fin/fin61010cru', this.queryForm, (frm) => this.onSubmit(frm));
    this.loadBankOptions();
  }

  private loadBankOptions(): void {
    this.dropdownApiService.queryAps1002().pipe(untilDestroyed(this)).subscribe(res => {
      this.bankNoOptions = (res ?? []).map(opt => ({
        value: opt.value,
        label: `${opt.value} - ${opt.label}`,
      }));
    });
  }

  queryFunction = (body: FIN61010QueryRequest) => {
    const raw = this.queryForm.getRawValue();
    const payload: FIN61010QueryRequest = {
      BNK_No: raw.BNK_No || undefined,
      CHK_StatusList: (raw.CHK_StatusList as string[])?.length ? (raw.CHK_StatusList as string[]) : undefined,
      PageSize: body.PageSize ?? 30,
      PageIndex: body.PageIndex ?? 1,
      SortBy: body.SortBy,
    };
    return this.fin61010Service.queryFIN61010(payload);
  };

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      this.lastQueryBody = {
        BNK_No: raw.BNK_No || undefined,
        CHK_StatusList: (raw.CHK_StatusList as string[])?.length ? (raw.CHK_StatusList as string[]) : undefined,
        PageSize: raw.pageSize ?? 30,
        PageIndex: raw.pageIndex ?? 1,
        SortBy: raw.SortBy,
      };
      this.loading = true;
      this.queryStateService.setQueryState(this.ProgNo, raw);
      this.fin61010Service
        .queryFIN61010(this.lastQueryBody)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe((response) => {
          this.data = response.Data ?? [];
          this.totalRecords = response.TotalCount ?? 0;
        });
    });
  }
}
