import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column } from '../../../shared/componentkit/table/table.model';
import { option } from '../../../shared/models/sys/sysb000.model';
import { PluUnit } from '../../../shared/models/tls/tls000.model';
import { Tls51050Service } from '../../../service/api/tls/tls51050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

// 2.5.1.5  商品單位設定
@Component({
  selector: 'app-tls51050',
  templateUrl: './tls51050.component.html',
  styleUrl: './tls51050.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, TableComponent, TranslateModule]
})
export class TLS51050Component extends BasicQueryPageComponent<PluUnit>
  implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    // PLUUNIT  商品單位設定檔
    UNIT_No: ['', [Validators.maxLength(2)]], // 單位代碼
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

  attributeOptions: option[] = [
    { 'value': "1", 'label': '基本單位' },
    { 'value': "2", 'label': '包裝單位' }
  ];

  data: PluUnit[] = [];
  columns: Column[] = [
    { field: 'UNIT_No', header: '單位代碼', visible: true },
    { field: 'UNIT_NAME', header: '單位名稱', visible: true },
    {
      field: 'UNIT_Attribute', header: '單位屬性', visible: true,
      format: (value: string) =>
        this.attributeOptions.find((option) => option.value === value)?.label ||
        value,
    },
    { field: 'UNIT_Remark', header: '備註說明', visible: true },
  ];

  selectedItems: PluUnit[] = [];// 多選項目

  // ----------------------------------------------------------------
  constructor(
    private tls51050Service: Tls51050Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51050', 'TLS/TLS51050cru', this.queryForm, (form) => this.onSubmit(form));
    // this.loadOptions();
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
  // 刪除項目
  onDelete(data: PluUnit | PluUnit[]): void {
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

    //確認是否全部都可以刪除
    // const canDelete = items.every((item) => item.CanDel);

    // if (!canDelete) {
    //   console.error('Some items cannot be deleted');
    //   this.messageService.errorBubble('無法刪除：組織階層互相關連');
    //   return;
    // }

    const deleteBody = {
      idList: idList, // 符合 API 的 idList 格式
    };
    this.tls51050Service.deleteTLS51050(deleteBody).subscribe({
      next: (response) => {
        if (response.Status === '0000') {
          this.messageService.successBubble('選中項目刪除成功');
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
  }

  loadOptions() {
    {
      //倉別 下拉選單
      // this.tls51060Service
      //   .queryPOS2034_DropDownList({})
      //   .subscribe((response) => {
      //     this.storageOptions = response.Data.map((item: apiOption) => ({
      //       No: item.No,
      //       Name: item.Name,
      //       Label: item.No + '-' + item.Name,
      //     }));

      //     console.log('storageOptions:', this.storageOptions);
      //   });
    }
  }

  isRowSelectable(rowData: PluUnit): boolean {
    return rowData.CanDel
  }
}
