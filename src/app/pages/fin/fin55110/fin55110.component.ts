import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonModule } from 'primeng/button';
import { AsyncPipe } from '@angular/common';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { FIN55110Service } from '@service/api/fin/fin55110.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize, Observable } from 'rxjs';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';

@Component({
  selector: 'app-fin55110',
  templateUrl: './fin55110.component.html',
  styleUrl: './fin55110.component.scss',
  standalone: true,
  imports: [
    TableReportComponent,
    AsyncPipe,
    ButtonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    ButtonComponent,
    TranslateModule
  ]
})
export class FIN55110Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    SSubpoenadate: [new Date(), [Validators.required]],
    ESubpoenadate: [new Date(), [Validators.required]],
    OrgList: [''],
    MajorList: [''],
    ...createPaginationConfig([{ field: 'ECR_Group', order: 1 }]),
  });

  ORG_IDOptions = this.dropdown.querySys3100();
  AccNoOptions: IDropdownItem[] = [];
  columns: any[] = [];
  data: any[] = [];
  totalRecords = 0;
  lastQueryBody: any = {};
  queryFunction: (body: any) => Observable<any>;
  btnLoading1 = false;
  btnLoading2 = false;
  constructor(
    private dropdown: DropdownApiService,
    private dropDownListService: DropDownListService,
    private fin55110Service: FIN55110Service
  ) {
    super();
    this.queryFunction = (body) => this.fin55110Service.queryFIN55110(body);
  }

  ngOnInit(): void {
    this.initializePage('FIN55110', '/FIN/FIN55110CRU', this.queryForm, (frm) => this.onSubmit(frm));

    // 取得會計科目下拉
    this.dropDownListService.queryGLS1005_DropDownList().subscribe((res) => {
      this.AccNoOptions = (res?.Data || []).map((item: any) => ({
        value: item.No,
        label: `${item.No}-${item.Name}`,
        No: item.No,
        Name: item.Name
      }));
    });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const formValue = frm.value;
      const startDate = new Date(formValue.SSubpoenadate);
      const endDate = new Date(formValue.ESubpoenadate);

      const payload = {
        FromYear: startDate.getFullYear(),
        FromMonth: startDate.getMonth() + 1,
        ToYear: endDate.getFullYear(),
        ToMonth: endDate.getMonth() + 1,
        OnlyPosted: true,
        OrgList: formValue.OrgList ? [formValue.OrgList] : [],
        MajorList: formValue.MajorList ? [formValue.MajorList] : [],
        pageIndex: 1,
        pageSize: 30,
      };

      this.loading = true;
      this.lastQueryBody = payload;

      this.fin55110Service
        .queryFIN55110(payload)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            if (res?.Status === '0000' && res.Data) {
              const data = Array.isArray(res.Data) ? res.Data : [res.Data];
              this.data = data;
              this.totalRecords = res.TotalCount || data.length;

              const monthSet = new Set<string>();
              data.forEach((item: { MonthlyAmounts?: Record<string, number> }) => {
                Object.keys(item.MonthlyAmounts || {}).forEach(key => monthSet.add(key));
              });
              const monthKeys = Array.from(monthSet).sort((a, b) => a.localeCompare(b));
              this.columns = [
                { field: 'AccNo', header: '會計科目代號' },
                { field: 'AccCName', header: '會計科目名稱' },
                ...monthKeys.map((key) => ({
                  field: `MonthlyAmounts.${key}`,
                  header: key,
                  format: (_: any, __: number, row: any) =>
                    (row.MonthlyAmounts?.[key] ?? 0).toLocaleString()
                })),
                { field: 'TotalAmount', header: '查詢期間合計', format: (v: any) => v?.toLocaleString?.() },
                { field: 'GrandTotal', header: '總計', format: (v: any) => v?.toLocaleString?.() },
                { field: 'Percent', header: '百分比' }
              ];

            } else {
              this.data = [];
              this.columns = [];
            }
          },

        });
    });
  }
  /** 匯出 PDF */
  onExportPDF(): void {
    if (!this.lastQueryBody) return;
    this.btnLoading1 = true;

    this.fin55110Service
      .exportFIN55110PDF({ ...this.lastQueryBody, IsPDF: true })
      .pipe(finalize(() => (this.btnLoading1 = false)))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = '日記帳表.pdf';
          a.click();
          window.URL.revokeObjectURL(url);
        },

      });
  }

  /** 匯出 XLSX */
  onExportXLSX(): void {
    if (!this.lastQueryBody) return;
    this.btnLoading2 = true;

    this.fin55110Service
      .exportFIN55110({ ...this.lastQueryBody, IsExcel: true })
      .pipe(finalize(() => (this.btnLoading2 = false)))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = '日記帳表.xlsx';
          a.click();
          window.URL.revokeObjectURL(url);
        },

      });
  }

}
