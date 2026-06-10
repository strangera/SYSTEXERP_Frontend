
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS2J020Service } from '@service/api/tls/tls2j020.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { AccordionModule } from 'primeng/accordion';
import { finalize, Observable } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

// 2.2.18.2 大分類換開品項維護作業
@Component({
  selector: 'app-tls2j020',
  templateUrl: './tls2j020.component.html',
  standalone: true,
  imports: [MultiSelectComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, TableReportComponent, TranslateModule]
})
export class TLS2J020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    CHG_ItemName: ['', [Validators.maxLength(10)]],
    bus_type: [[]],
    Item_TaxType: [['1']],
    pageSize: [1000],
    pageIndex: [1],
  });

  selectedItems: any[] = [];
  totalRecords = 0;
  data: any[] = [];
  deleteLoading = false;
  busTypeOptions: any[] = [];
  Item_TaxType_Option = [
    { label: '免稅', value: '0' },
    { label: '應稅', value: '1' }
  ];
  columns: ReportColumn[] = [
    { field: 'id', header: 'ID', visible: false, showSort: true },
    {
      field: 'bus_type',
      header: '大分類代碼',
      visible: true,
      showSort: true,
    },
    {
      field: 'bus_type_name',
      header: '大分類名稱',
      visible: true,
      showSort: true,
    },
    { field: 'CHG_ItemName', header: '品項名稱', visible: true, showSort: true },
    { field: 'Item_TaxType_Desc', header: '稅別', visible: true, showSort: true },
    // 其他欄位
  ];

  lastQueryBody: any = {};

  queryFunction = (body: any): Observable<any> => {
    return this.tls2j020Service.queryTLS2J020(body);
  };

  constructor(
    private dropDownListService: DropDownListService,
    private tls2j020Service: TLS2J020Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2J020', '/TLS/TLS2J020CRU', this.queryForm, (frm) => this.onSubmit(frm));
    this.loadOptions();
  }
  loadOptions() {
    this.dropDownListService.queryTLTBUSTYPE_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.busTypeOptions = response.Data.map((item: any) => ({ Name: `${item.No}-${item.Name}`, No: item.No }));
      });
  }
  /** 查詢 */
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const v = frm.value;
      const payload = {
        bus_type: v.bus_type?.length ? v.bus_type : [],
        CHG_ItemName: v.CHG_ItemName?.trim() || '',
        Item_TaxType: v.Item_TaxType?.length ? v.Item_TaxType : [],
        pageSize: v.pageSize || 1000,
        pageIndex: v.pageIndex || 1,
        SortBy: v.SortBy || [{ field: 'id', order: 1 }],
      };

      this.lastQueryBody = payload;

      this.loading = true;
      this.tls2j020Service
        .queryTLS2J020(payload)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            if (res.Status === '0000') {
              this.data = res.Data || [];
              this.totalRecords = res.TotalCount || this.data.length;
              // 儲存查詢狀態
              this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
            } else {
              this.messageService.errorBubble(res.Message || '查詢失敗');
              this.data = [];
              this.totalRecords = 0;
            }
          },
        });
    });
  }

  /** 詳細查看 */
  override onDetail(data: any) {
    this.navigateWithState(CRUDStatus.Read, data);
  }

  /** 刪除功能 */
  onDelete(): void {
    if (this.selectedItems.length === 0) {
      this.messageService.warnBubble('請先選擇要刪除的資料');
      return;
    }
    const selectedIds = this.selectedItems.map(item => item.id);
    const confirmMessage = `確定要刪除所選的 ${this.selectedItems.length} 筆資料嗎？`;

    this.messageService.confirm({
      message: confirmMessage,
      header: '確認刪除',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: '確定',
      rejectLabel: '取消',
      accept: () => {
        this.executeDelete(selectedIds);
      }
    });
  }
  /** 執行刪除 */
  private executeDelete(idList: number[]): void {
    const body = { idList };
    this.deleteLoading = true;
    this.tls2j020Service.deleteTLS2J020(body)
      .pipe(
        untilDestroyed(this),
        finalize(() => this.deleteLoading = false)
      )
      .subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.messageService.successBubble('刪除成功');
            this.selectedItems = [];
            // 刪除成功後重新查詢資料
            if (this.lastQueryBody && Object.keys(this.lastQueryBody).length > 0) {
              this.refreshData();
            }
          } else {
            this.messageService.errorBubble(`刪除失敗：${response.Message || '系統錯誤'}`);
          }
        },
      });
  }

  /** 重新整理資料 */
  private refreshData(): void {
    this.loading = true;
    this.tls2j020Service
      .queryTLS2J020(this.lastQueryBody)
      .pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            this.data = res.Data || [];
            this.totalRecords = res.TotalCount || this.data.length;
          } else {
            this.messageService.errorBubble(res.Message || '重新查詢失敗');
          }
        },
      });
  }

}
