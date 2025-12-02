import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { AccordionModule } from 'primeng/accordion';
import { Tls51080Service } from '../../../service/api/tls/tls51080.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatDate } from '../../../shared/componentkit/table/table.model';
import { apiOption } from '../../../shared/models/sys/sysb000.model';
import { POS2034 } from '../../../shared/models/tls/tls000.model';

// 2.5.1.8  分倉資料處理
@Component({
  selector: 'app-tls51080',
  templateUrl: './tls51080.component.html',
  styleUrl: './tls51080.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, TableComponent, TranslateModule]
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
      field: 'org_id', header: '部門編號', visible: true
      , format: (value: string) =>
        this.SYS3100_Options.find((option) => option.No === value)?.No ||
        value,
    },
    {
      field: 'org_name', header: '部門名稱', visible: true
      , format: (value: string) =>
        this.SYS3100_Options.find((option) => option.No === value)?.Name ||
        value,
    },
    {
      field: 'building_no', header: '館別', visible: true, format: (value: string) => // 館別只顯示名稱(不用編碼)
        this.building_noOptions.find((option) => option.No === value)?.Name ||
        value,
    },
    { field: 'HOS_Remark', header: '備註說明', visible: true },

    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDate },
    { field: 'CRT_USR_No', header: '建立人員代碼', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDate },
    { field: 'UPD_USR_No', header: '變更人員代碼', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false }
  ];

  selectedItems: POS2034[] = [];// 多選項目

  // ----------------------------------------------------------------
  constructor(
    private tls51080Service: Tls51080Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51080', 'TLS/TLS51080cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      //查詢時去除org_id中/以後的部分
      // if (frm.value.org_id) {
      //   frm.value.org_id = frm.value.org_id.split('/')[0];
      // }

      console.log('分倉request:', JSON.stringify(frm.value, null, 2));
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
  // 到處都有倉別的資料，先不允許刪除
  //-------------
  // 刪除項目(到處都有倉別的資料，先不允許刪除)
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
      // 組織代碼 下拉
      this.dropDownListService.querySYS3100_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
        this.SYS3100_Options = res.Data.map(item => ({ ...item, Label: `${item.No} - ${item.Name}`, }));
        console.log('組織', this.SYS3100_Options);
      })
      // 館別 下拉
      this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
        this.building_noOptions = res.Data.map(item => ({ ...item, Label: `${item.No} - ${item.Name}`, }));
        console.log('館別', this.building_noOptions);
      })
    }
  }

  isRowSelectable(rowData: POS2034): boolean {
    return rowData.CanDel
  }
}
