import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PluUnit, Tls51050Service } from '@service/api/tls/tls51050.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { createPaginationConfig } from '@others/component/table/table.model';
import { option } from '@shared/models/sys/sysb000.model';
import { AccordionModule } from 'primeng/accordion';

// 2.5.1.5  商品單位設定
@Component({
  selector: 'app-tls51050',
  templateUrl: './tls51050.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, TableReportComponent, TranslateModule]
})
export class TLS51050Component extends BasicQueryPageComponent<PluUnit>
  implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    // PLUUNIT  商品單位設定檔
    UNIT_No: ['', [Validators.maxLength(2)]], // 單位編碼
    UNIT_NAME: ['', [Validators.maxLength(40)]], // 單位名稱
    // UNIT_Attribute: ['', [Validators.maxLength(1)]], // 單位屬性 1基本單位 2包裝單位
    // CHILD_UNIT: ['', [Validators.maxLength(2)]], // 子項單位代號 --沒有使用
    // CHILD_QTY: [,[this.validationService.numberValidator]], // 子項單位數量 --沒有使用

    UNIT_Remark: ['', [Validators.maxLength(100)]], // 備註說明

    //分頁查詢
    ...createPaginationConfig([{ field: 'UNIT_No', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  lastQueryBody: any = null;

  attributeOptions: option[] = [
    { 'value': "1", 'label': '基本單位' },
    { 'value': "2", 'label': '包裝單位' }
  ];

  data: PluUnit[] = [];
  columns: ReportColumn[] = [
    { field: 'UNIT_No', header: '單位編碼', visible: true },
    { field: 'UNIT_NAME', header: '單位名稱', visible: true },
    { field: 'UNIT_Attribute_Name', header: '單位屬性名稱', visible: true },
    { field: 'UNIT_Remark', header: '備註說明', visible: true },
  ];

  selectedItems: PluUnit[] = [];// 多選項目

  readonly query = (body: any) => this.tls51050Service.queryTLS51050(body);

  // ----------------------------------------------------------------
  constructor(
    private tls51050Service: Tls51050Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51050', 'TLS/TLS51050cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

      console.log('query condition', frm.value);
      this.tls51050Service.queryTLS51050(frm.value).subscribe({
        next: (response) => {
          // console.log('回傳階層:', response.Data);
          if (response.Status === '0000') {
            this.data = response.Data || [];
            console.log('Result', this.data);
            this.totalRecords = response.TotalCount || response.Data.length;
            this.lastQueryBody = frm.value;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
          } else {
            console.error('API error:', response.Status, response.Message);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err: string) => {
          console.error('API error:', err);
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }

  //---刪除檢查---
  //-------------
  onDelete(data: PluUnit | PluUnit[]): void {
    this.messageService.confirm({
      message: `是否確認刪除選中的商品單位?`,
      header: `確認刪除`,
      accept: () => {
        console.log('Delete data:', JSON.stringify(data, null, 2));

        const items = Array.isArray(data) ? data : [data];
        if (items.length === 0) {
          console.error('No items to delete');
          this.messageService.errorBubble('無法刪除：沒有選中的項目');
          return;
        }

        // 收集所有有效的 ID
        const idList = items
          .filter((item) => item && item.id != null && item.id !== undefined)
          .map((item) => item.id);

        if (idList.length === 0) {
          console.error('No valid IDs to delete');
          this.messageService.errorBubble('無法刪除：選中的項目缺少有效 ID');
          return;
        }

        const deleteBody = {
          idList: idList, // 符合 API 的 idList 格式
        };
        this.tls51050Service.deleteTLS51050(deleteBody).subscribe({
          next: (response) => {
            if (response.Status === '0000') {
              this.messageService.successBubble('刪除成功');
            } else {
              console.error('API error:', response.Status, response.Message);
              this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
            }
          },
          error: (err: string) => {
            console.error('API error:', err);
            this.messageService.errorBubble('刪除失敗');
          },
          complete: () => {
            this.onSubmit(this.queryForm);
          },
        });

        this.selectedItems = [];
      },
    });
  }

  isRowSelectable(rowData: PluUnit): boolean {
    return rowData.CanDel
  }
}
