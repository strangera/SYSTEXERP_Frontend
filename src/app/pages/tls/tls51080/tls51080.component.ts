import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column } from '../../../shared/componentkit/table/table.model';
import { apiOption } from '../../../shared/models/sys/sysb000.module';
import { POS2034 } from '../../../shared/models/tls/tls000.model';
import { Tls51080Service } from '../../../service/API/tls/tls51080.service';

// 2.5.1.8  分倉資料處理
@Component({
  selector: 'app-tls51080',
  templateUrl: './tls51080.component.html',
  styleUrl: './tls51080.component.scss'
})
export class TLS51080Component extends BasicQueryPageComponent<POS2034> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    // POS2034 倉庫設定檔
    // STO_No: ['', [Validators.maxLength(10)]], // 公司編號/店號
    HOS_No: ['', [Validators.maxLength(10)]], // 倉庫代碼 STO_NO+HOS_NO唯一值
    HOS_NAME: ['', [Validators.maxLength(50)]], // 倉庫名稱
    HOS_Remark: ['', [Validators.maxLength(100)]], // 備註說明
    org_id: ['', [Validators.maxLength(20)]], // 組織代碼/所屬部門
    // building_no: ['', [Validators.maxLength(1)]], // 館別代碼

    //分頁查詢
    ...createPaginationConfig([{ field: 'HOS_No', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  org_idOptions: apiOption[] = [];
  SYS3100_Options: apiOption[] = [];
  building_noOptions: apiOption[] = [];

  data: POS2034[] = [];
  columns: Column[] = [
    { field: 'STO_No', header: '公司編號/店號', visible: false },
    { field: 'HOS_No', header: '倉庫代碼', visible: true },
    { field: 'HOS_NAME', header: '倉庫名稱', visible: true },
    {
      field: 'org_id', header: '組織代碼/所屬部門', visible: true
      , format: (value: string) =>
        this.SYS3100_Options.find((option) => option.No === value)?.Label ||
        value,
    },
    {
      field: 'building_no', header: '館別代碼', visible: true, format: (value: string) =>
        this.building_noOptions.find((option) => option.No === value)?.Label ||
        value,
    },
    { field: 'HOS_Remark', header: '備註說明', visible: true }
  ];

  selectedItems: POS2034[] = [];// 多選項目

  // ----------------------------------------------------------------
  constructor(private tls51080Service: Tls51080Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51080', 'TLS/TLS51080CRU', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      //查詢時去除org_id中/以後的部分
      if (frm.value.org_id) {
        frm.value.org_id = frm.value.org_id.split('/')[0];
      }
      this.tls51080Service.queryTLS51080(frm.value).subscribe({
        next: (response) => {
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
  onDelete(data: POS2034 | POS2034[]): void {
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
    this.tls51080Service.deleteTLS51080(deleteBody).subscribe({
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
      // 部門下拉
      this.tls51080Service
        .querySYS3100_join_POS1001_DropDownList({})
        .subscribe((response) => {
          this.org_idOptions = response.Data.map((item: apiOption) => ({
            No: item.No,
            Name: item.Name,
            Label: item.No + '-' + item.Name,
          }));

          // this.org_idOptions = [{ No: '102130', Name: '測試', Label: '102130-測試' }];

          console.log('org_idOptions:', this.org_idOptions);
        });


      // 組織代碼下拉
      this.tls51080Service
        .querySYS3100_DropDownList({})
        .subscribe((response) => {
          this.SYS3100_Options = response.Data.map((item: apiOption) => ({
            No: item.No,
            Name: item.Name,
            Label: item.No + '-' + item.Name,
          }));

          console.log('SYS3100_Options:', this.SYS3100_Options);
        });
      // 讀取館別代碼選項
      this.tls51080Service
        .querySYS3800_DropDownList({})
        .subscribe((response) => {
          this.building_noOptions = response.Data.map((item: apiOption) => ({
            No: item.No,
            Name: item.Name,
            Label: item.No + '-' + item.Name,
          }));
        });
    }
  }

  isRowSelectable(rowData: POS2034): boolean {
    return rowData.CanDel
  }
}
