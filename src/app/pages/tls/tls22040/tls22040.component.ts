import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, AddButton } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { yesterday } from '@shared/models/system/query-form.model';
import { Tls22040Service } from '../../../service/api/tls/tls22040.service';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

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
  queryForm = this.formBuilder.group({
    TXN_DateStart: [yesterday, Validators.required],
    TXN_DateEnd: [yesterday, Validators.required],
    ...createPaginationConfig([{ field: 'PAY_Name', order: 1 }]),
  });

  data: any[] = [];
  totalRecords = 0;

  columnGroup4 = [
    { field: '111', header: '開立電子發票' },
    { field: '222', header: '上送到Tumkey目錄' },
    { field: '333', header: 'Tumkey DB 回覆時間' }
  ];

  columns: Column[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, groupField: '111' },
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

  /** 判斷是否可以檢視明細 */
  canShowDetail = (rowData: any): boolean => {
    return !!rowData.DiffNum && rowData.DiffNum > 0;
  };

  addButton: AddButton[] = [
    {
      label: '查看明細',
      icon: 'pi pi-eye',
      action: (rowData: any) => {
        this.onDetail(rowData);
      },
      disabled: (rowData: any) => !this.canShowDetail(rowData)
    }
  ];

  ngOnInit(): void {
    this.initializePage('TLS22040', 'TLS/TLS22040cru', this.queryForm, (form) => this.onSubmit(form));
  }

  /** yyyy/MM/dd 格式化 (避免時區錯位) */
  private formatDate(d: any): string {
    if (!d) return '';
    const date = new Date(d);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  }

  /** 查詢結果顯示格式 yyyy-MM-dd */
  private formatToYMD(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      const parts = dateStr.split(' ')[0].replace(/\//g, '/');
      return parts;
    }
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /** 查詢主表 */
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.submitted = true;
      if (frm.invalid) return;
      this.loading = true;
      const raw = frm.value;

      const payload = {
        PageSize: 0,
        PageIndex: 0,
        OrderBy: 'PAY_Name',
        Offset: 0,
        SortBy: [],
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
          this.loading = false;
          // 儲存查詢狀態
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        },
      });
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
        // 傳遞當前的查詢條件，讓返回時能恢復狀態
        this.navigateWithState(CRUDStatus.Edit, rowdataWithDetail, this.queryForm.getRawValue());
      },
    });
  }

}
