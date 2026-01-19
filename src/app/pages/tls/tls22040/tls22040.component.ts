import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { formatDate } from '@shared/componentkit/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { yesterday } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { Tls22040Service } from '../../../service/api/tls/tls22040.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { AddButton, Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls22040',
  templateUrl: './tls22040.component.html',
  styleUrls: ['./tls22040.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class TLS22040Component extends BasicQueryPageComponent<any> implements OnInit {
  multiSortMeta = [{ field: 'TXN_Date', order: 1 }];
  queryForm = this.formBuilder.group({
    TXN_DateStart: [yesterday, Validators.required],
    TXN_DateEnd: [yesterday, Validators.required],
    ...createPaginationConfig(this.multiSortMeta),
  });

  data: any[] = [];
  totalRecords = 0;
  columnGroup4 = [
    { field: '111', header: '開立電子發票' },
    { field: '222', header: '上送到Tumkey目錄' },
    { field: '333', header: 'Tumkey DB 回覆時間' }
  ];

  columns: Column[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, groupField: '111', format: formatDate },
    { field: 'MIG_Type', header: '發票類型', visible: true, groupField: '111' },
    { field: 'MIG_Type_Name', header: '發票類型名稱', visible: false },
    { field: 'InvoiceNum', header: '發票張數', visible: true, groupField: '111' },
    { field: 'LastBagTime', header: '最後打包時間', visible: true, groupField: '222' },
    { field: 'UpMaxNum', header: '上傳大平台筆數', visible: true, groupField: '333' },
    { field: 'LastUpTime', header: '最後上傳大平台筆數', visible: true, groupField: '333' },
    { field: 'DiffNum', header: '差異筆數', visible: true },
  ];

  constructor(private tls22040Service: Tls22040Service) {
    super();
  }

  canShowDetail = (rowData: any): boolean => {
    return !!rowData.DiffNum && rowData.DiffNum > 0;
  };

  addButton: AddButton[] = [
    {
      label: '查看明細',
      icon: 'pi pi-eye',
      action: (rowData: any) => this.onDetail(rowData),
      disabled: (rowData: any) => !this.canShowDetail(rowData)
    }
  ];

  ngOnInit(): void {
    this.initializePage('TLS22040', 'TLS/TLS22040cru', this.queryForm, (form) => this.onSubmit(form));
  }

  private formatDate(d: any): string {
    if (!d) return '';
    const date = new Date(d);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  }

  private formatToYMD(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.split(' ')[0];
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.submitted = true;
      if (frm.invalid) return;
      this.loading = true;
      const raw = frm.value;

      const payload = {
        PageSize: frm.value.pageSize || 20,
        PageIndex: frm.value.pageIndex || 1,
        Offset: 0,
        OrderBy: frm.value.SortBy?.[0]?.field || this.multiSortMeta[0].field,
        SortBy: frm.value.SortBy || this.multiSortMeta,
        TXN_DateStart: this.formatDate(raw.TXN_DateStart),
        TXN_DateEnd: this.formatDate(raw.TXN_DateEnd),
      };

      this.tls22040Service.queryTLS22040(payload).subscribe({
        next: (res) => {
          this.data = (res?.Data ?? []).map((x: any) => ({
            ...x,
            TXN_Date: this.formatToYMD(x.TXN_Date),
            canDetail: !!x.DiffNum && x.DiffNum > 0,
          }));

          this.totalRecords = res?.TotalCount ?? this.data.length;
          // 更新排序狀態和表單參數
          this.multiSortMeta = payload.SortBy;
          frm.patchValue({
            pageSize: payload.PageSize,
            pageIndex: payload.PageIndex,
            SortBy: payload.SortBy
          }, { emitEvent: false });
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    });
  }

  /**  load → 後端分頁 + 排序 */
  override onLazyLoadData(event: any, frm: FormGroup) {
    // 先呼叫父類別的 onLazyLoadData 來更新表單
    super.onLazyLoadData(event, frm);

    // 儲存查詢狀態
    this.queryStateService.setQueryState(this.ProgNo, frm.value);

    this.loading = true;

    // 使用表單中已更新的值
    const formValue = frm.value;
    const payload = {
      PageSize: formValue.pageSize || 20,
      PageIndex: formValue.pageIndex || 1,
      Offset: 0,
      OrderBy: formValue.SortBy?.[0]?.field ?? 'TXN_Date',
      SortBy: formValue.SortBy ?? this.multiSortMeta,
      TXN_DateStart: this.formatDate(formValue.TXN_DateStart),
      TXN_DateEnd: this.formatDate(formValue.TXN_DateEnd),
    };

    this.tls22040Service.queryTLS22040(payload).subscribe({
      next: (res) => {
        this.data = (res?.Data ?? []).map((x: any) => ({
          ...x,
          TXN_Date: this.formatToYMD(x.TXN_Date),
          canDetail: !!x.DiffNum && x.DiffNum > 0,
        }));

        this.totalRecords = res?.TotalCount ?? this.data.length;
        // 更新排序狀態
        this.multiSortMeta = payload.SortBy;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  override onDetail(row: any): void {
    if (!row.canDetail) {
      this.messageService?.warnBubble?.('此筆差異為 0，無法查看明細');
      return;
    }

    const payload = {
      PageSize: 0,
      PageIndex: 0,
      OrderBy: 'TXN_Date',
      Offset: 0,
      SortBy: [],
      TXN_Date: this.formatDate(row.TXN_Date),
      MIG_Type: row.MIG_Type,
    };

    this.tls22040Service.queryTLS22040_Detail(payload).subscribe({
      next: (res) => {
        const detailData = res?.Data ?? [];
        const rowdataWithDetail = { ...row, details: detailData };
        this.navigateWithState(CRUDStatus.Edit, rowdataWithDetail, this.queryForm.getRawValue());
      },
    });
  }

}
