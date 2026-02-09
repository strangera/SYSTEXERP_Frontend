import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { Tls51060Service } from '../../../service/api/tls/tls51060.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { apiOption } from '../../../shared/models/sys/sysb000.model';
import { PluLogo } from '../../../shared/models/tls/tls000.model';
// Permissions
// Shared

// 2.5.1.6  品牌設定作業
@Component({
  selector: 'app-tls51060',
  templateUrl: './tls51060.component.html',
  styleUrl: './tls51060.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, MultiSelectComponent, TableComponent, TranslateModule]
})
export class TLS51060Component extends BasicQueryPageComponent<PluLogo>
  implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    // PLULOGO  商品品牌設定檔
    LOGO_No: ['', [Validators.maxLength(4)]], // 品牌代碼
    LOGO_CH_NAME: ['', [Validators.maxLength(50)]], // 品牌中文名稱
    LOGO_EN_NAME: ['', [Validators.maxLength(100)]], // 品牌英文名稱
    LOGO_Remark: ['', [Validators.maxLength(100)]], // 備註說明
    // PLU_OrderPrcRate: [, [Validators.maxLength(100)]], // 標準進貨折數 預設100
    HOS_No: [[], [Validators.maxLength(10)]], // 倉別代碼(建議倉別) POS2034倉庫設定檔(O)
    // VEN_No: ['', [Validators.maxLength(16)]], // 廠商編號 保留目前不使用

    // 20251014: 新增專櫃編號欄位
    // TLT_No: ['',[this.validationService.noChineseValidator, Validators.maxLength(12)]], // 專櫃編號

    //分頁查詢
    ...createPaginationConfig([{ field: 'LOGO_No', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  storageOptions: apiOption[] = [];

  data: PluLogo[] = [];
  columns: Column[] = [
    { field: 'LOGO_No', header: '品牌代碼', visible: true },
    { field: 'LOGO_CH_NAME', header: '品牌中文名稱', visible: true },
    { field: 'LOGO_EN_NAME', header: '品牌英文名稱', visible: true },
    { field: 'PLU_OrderPrcRate', header: '標準進貨折數', visible: false },
    { field: 'HOS_No', header: '建議倉別代碼', visible: true },
    { field: 'HOS_NAME', header: '建議倉別名稱', visible: true },
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'VEN_No', header: '廠商編號', visible: false },
    { field: 'LOGO_Remark', header: '備註說明', visible: true }
  ];

  selectedItems: PluLogo[] = [];// 多選項目

  // ----------------------------------------------------------------
  constructor(
    private tls51060Service: Tls51060Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51060', 'TLS/TLS51060cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('query', JSON.stringify(frm.value, null, 2));
      this.tls51060Service.queryTLS51060(frm.value).pipe(untilDestroyed(this)).subscribe({
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
  /* LOGODISC 品牌進貨折數設定檔*/
  /* LOGOBUDGET 品牌每月進貨限額設定檔*/
  /* POS2004 商品基本資料檔 */
  // 沒有該資料才可以刪除
  //-------------
  // 刪除項目
  onDelete(data: PluLogo | PluLogo[]): void {
    this.messageService.confirm({
      message: `是否確認刪除選中的品牌?`,
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

        //確認是否全部都可以刪除
        const canDelete = items.every((item) => item.CanDel);

        if (!canDelete) {
          console.error('Some items cannot be deleted');
          this.messageService.errorBubble('無法刪除：組織階層互相關連');
          return;
        }

        const deleteBody = {
          idList: idList, // 符合 API 的 idList 格式
        };
        this.tls51060Service.deleteTLS51060(deleteBody).pipe(untilDestroyed(this)).subscribe({
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

  loadOptions() {
    {
      //倉別 下拉選單
      this.tls51060Service
        .queryPOS2034_DropDownList({}).pipe(untilDestroyed(this))
        .subscribe((response) => {
          this.storageOptions = response.Data.map((item: apiOption) => ({
            No: item.No,
            Name: item.Name,
            Label: item.No + '-' + item.Name,
          }));

          console.log('storageOptions:', this.storageOptions);
        });
    }
  }

  isRowSelectable(rowData: PluLogo): boolean {
    return rowData.CanDel
  }

}
