import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// Shared
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { Sysb300Service } from '../../../service/api/sys/sysb300.service';
import { Sysb400Service } from '../../../service/api/sys/sysb400.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { TableComponent } from '../../../others/component/table/table.component';
import { Column, createPaginationConfig } from '../../../others/component/table/table.model';
import { apiOption, option, Sysb400m } from '../../../shared/models/sys/sysb000.model';


// 組織碼設定作業
@Component({
  selector: 'app-sysb400',
  templateUrl: './sysb400.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class SYSB400Component
  extends BasicQueryPageComponent<Sysb400m>
  implements OnInit {

  queryForm = this.formBuilder.group({
    // SYS3100 組織碼設定作業
    org_id: ['', Validators.maxLength(6)], // 組織代碼
    org_name: ['', Validators.maxLength(40)], // 組織名稱
    level_id: ['', Validators.maxLength(2)], // 組織階層代碼
    stop_flag: ['', Validators.maxLength(1)], // 是否停用

    //分頁查詢
    ...createPaginationConfig([{ field: 'org_id', order: 1 }]), // 分頁和排序參數
  });

  upgroup_Options: apiOption[] = [];
  whetherOptions: option[] = [];
  org_Option: apiOption[] = [];

  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: Sysb400m[] = [];

  columns: Column[] = [
    { field: 'org_id', header: '組織代碼', visible: true },
    { field: 'org_name', header: '組織名稱', visible: true },
    {
      field: 'level_id',
      header: '組織階層代碼',
      visible: true,
      format: (value: string) =>
        this.upgroup_Options.find((option) => option.No === value)?.No ||
        value,
    },
    {
      field: 'level_name',
      header: '組織階層名稱',
      visible: true,
      format: (value: string) =>
        this.upgroup_Options.find((option) => option.No === value)?.Name ||
        value,
    },
    {
      field: 'p_org_id', header: '上層組織代碼', visible: true,
      format: (value: string) =>
        this.org_Option.find((option) => option.No === value)?.No ||
        value,
    },
    {
      field: 'p_org_id', header: '上層組織名稱', visible: true,
      format: (value: string) =>
        this.org_Option.find((option) => option.No === value)?.Name ||
        value,
    },
    {
      field: 'p_level_id',
      header: '上層組織階層代碼',
      visible: true,
      format: (value: string) =>
        this.upgroup_Options.find((option) => option.No === value)?.No ||
        value,
    },
    {
      field: 'p_level_name',
      header: '上層組織階層名稱',
      visible: true,
      format: (value: string) =>
        this.upgroup_Options.find((option) => option.No === value)?.Name ||
        value,
    },
    {
      field: 'stop_flag',
      header: '是否停用',
      visible: true,
      format: (value: string) =>
        this.whetherOptions.find((option) => option.value === value)?.label ||
        value,
    },
  ];
  selectedItems: Sysb400m[] = []; // 多選項目

  constructor(
    private sysb300Service: Sysb300Service,
    private sysb400Service: Sysb400Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB400', 'SYS/SYSB400cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      console.log('查詢條件', frm.value);
      this.sysb400Service.querySYSB400(frm.value).subscribe({
        next: (response) => {
          console.log('API response:', response);
          if (response.Status === '0000') {
            this.data = response.Data || [];
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

  // 刪除項目
  onDelete(data: Sysb400m | Sysb400m[]): void {
    this.messageService.confirm({
      message: `是否確認刪除選中的組織碼?`,
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
        this.sysb400Service.deleteSYSB400(deleteBody).subscribe({
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
      },
    });
  }

  loadOptions() {
    // 所有組織階層
    this.sysb300Service.querySYSB300_DropDownList({}).subscribe((response) => {
      this.upgroup_Options = response.Data.map((item: any) => ({
        No: item.No,
        Name: item.Name,
        Label: item.No + '-' + item.Name,
      }));
    });

    this.whetherOptions = [
      { value: 'Y', label: '是' },
      { value: 'N', label: '否' },
    ];

    // 所有組織代碼
    this.sysb400Service.querySYS3100_DropDownList().subscribe((response) => {
      this.org_Option = response.Data.map(item => ({
        No: item.No,
        Name: item.Name,
        Label: item.No + '-' + item.Name,
      }));
      console.log('組織代碼drop 查詢結果', this.org_Option);
    });
  }

  gotoGraph() {
    //導引到sysb400.os
    this.router.navigate(['account/sys/sysb400os']);
  }

  isRowSelectable(rowData: Sysb400m): boolean {
    return rowData.CanDel
  }
}
