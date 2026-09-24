import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN55110Service } from '@service/api/fin/fin55110.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { createPaginationConfig } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize, Observable } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';

@Component({
  selector: 'app-fin55110',
  templateUrl: './fin55110.component.html',
  standalone: true,
  imports: [
    TableReportComponent,
    ButtonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    MultiSelectComponent,
    ButtonComponent,
    CheckboxModule,
    TranslateModule
  ]
})
export class FIN55110Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    SSubpoenadate: [new Date(), [Validators.required]],
    ESubpoenadate: [new Date(), [Validators.required]],
    OrgList: [[] as string[]],
    IsCludeDownOrg: ['N'],
    MajorList: [[] as string[]],
    ...createPaginationConfig([{ field: 'ECR_Group', order: 1 }]),
  });

  orgOptions: { value: string; label: string }[] = [];
  AccNoOptions: IDropdownItem[] = [];
  columns: any[] = [];
  data: any[] = [];
  totalRecords = 0;
  lastQueryBody: any = {};
  queryFunction: (body: any) => Observable<any>;
  btnLoading1 = false;
  btnLoading2 = false;
  footerData: any = null;
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

    // 取得部門下拉
    this.dropdown.querySys3100().pipe(untilDestroyed(this)).subscribe(opts => {
      this.orgOptions = (opts || []) as { value: string; label: string }[];
    });

    // 取得科目大分類下拉 (GLS1003)，只顯示 4~9
    this.dropDownListService.queryGLS1003_DropDownList().subscribe((res) => {
      const majorCodes = ['4', '5', '6', '7', '8', '9'];
      this.AccNoOptions = (res?.Data || [])
        .filter((item: IDropdownItem) => majorCodes.includes(item.No as string))
        .map((item: IDropdownItem) => ({
          value: item.No as string,
          label: `${item.No}-${item.Name}`,
          No: item.No as string,
          Name: item.Name as string,
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
        OrgList: formValue.OrgList || [],
        IsCludeDownOrg: formValue.IsCludeDownOrg || 'N',
        MajorList: formValue.MajorList || [],
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

              const orgList: string[] = formValue.OrgList || [];
              // SQL 已算好的大分類合計列，直接用於 footer（最可靠）
              const totalRows = data.filter((row: any) => row.AccNo?.includes('合計'));
              // 明細列：用於 per-org OrgTotals footer
              const detailRows = data.filter((row: any) => !row.AccNo?.includes('合計'));
              const footer: any = {};

              this.columns = [
                { field: 'AccNo', header: '會計科目代號' },
                { field: 'AccCName', header: '會計科目名稱', align: 'left' },
                ...monthKeys.map((key) => {
                  const flatKey = `MonthlyAmounts.${key}`;
                  // 從大分類合計列加總每月金額（SQL 已算好，直接取用）
                  footer[flatKey] = totalRows.reduce((s: number, r: any) => s + (Number(r.MonthlyAmounts?.[key]) || 0), 0);
                  return {
                    field: flatKey,
                    header: key,
                    align: 'right' as const,
                    format: (value: any, __?: number, row?: any) =>
                      row != null
                        ? (row.MonthlyAmounts?.[key] ?? 0).toLocaleString()
                        : (value ?? 0).toLocaleString()
                  };
                }),
              ];

              if (orgList.length === 0) {
                footer['TotalAmount'] = totalRows.reduce((s: number, r: any) => s + (Number(r.TotalAmount) || 0), 0);
                this.columns.push(
                  { field: 'TotalAmount', header: '查詢期間合計\n(全部)', align: 'right', format: (v: number) => v?.toLocaleString?.() }
                );
              } else {
                for (const orgId of orgList) {
                  const label = this.orgOptions.find(o => o.value === orgId)?.label ?? orgId;
                  const capturedOrgId = orgId;
                  const flatKey = `OrgTotals.${capturedOrgId}`;
                  footer[flatKey] = detailRows.reduce((s: number, r: any) => s + (Number(r.OrgTotals?.[capturedOrgId]) || 0), 0);
                  this.columns.push({
                    field: flatKey,
                    header: `查詢期間合計\n${label}`,
                    align: 'right' as const,
                    format: (value: any, __?: number, row?: any) =>
                      row != null
                        ? (row.OrgTotals?.[capturedOrgId] ?? 0).toLocaleString()
                        : (value ?? 0).toLocaleString()
                  });
                }
              }

              footer['GrandTotal'] = totalRows.reduce((s: number, r: any) => s + (Number(r.GrandTotal) || 0), 0);
              this.columns.push(
                { field: 'GrandTotal', header: '總計', align: 'right', format: (v: number) => v?.toLocaleString?.() },
                { field: 'Percent', header: '百分比', align: 'right' }
              );
              this.footerData = footer;

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
      .exportFIN55110PDF(this.lastQueryBody)
      .pipe(finalize(() => (this.btnLoading1 = false)))
      .subscribe({
        next: (blob) => {
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = '部門科目明細表.pdf';
          a.click();
          globalThis.URL.revokeObjectURL(url);
        },

      });
  }

  /** 匯出 XLSX */
  onExportXLSX(): void {
    if (!this.lastQueryBody) return;
    this.btnLoading2 = true;

    this.fin55110Service
      .exportFIN55110(this.lastQueryBody)
      .pipe(finalize(() => (this.btnLoading2 = false)))
      .subscribe({
        next: (blob) => {
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = '部門科目明細表.xlsx';
          a.click();
          globalThis.URL.revokeObjectURL(url);
        },

      });
  }

}
