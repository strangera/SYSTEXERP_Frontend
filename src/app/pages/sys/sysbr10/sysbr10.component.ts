import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { AnnouncementCategoryService } from '../../../service/basic/announcement-category.service';
import { SYSBR10Service } from '../../../service/api/sys/sysbr10.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sysbr10',
  templateUrl: './sysbr10.component.html',
  styleUrls: ['./sysbr10.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    MultiSelectComponent,
    RadiobuttonComponent,
    InputTextComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class SYSBR10Component extends BasicQueryPageComponent<any> {
  // 下拉選單資料
  userStatusOptions: any[] = [];
  Pub_TypeOptions: any[] = [];
  roleCodeOptions: any[] = [];
  Role_NoOptions: any[] = [];
  User_NoOptions: any[] = [];
  Org_IDOptions: any[] = [];
  selectedItems: any[] = [];
  selectedRows: any[] = [];
  data: any[] = [];
  totalRecords = 0;

  YNOptions: any[] = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
  ];

  queryForm = this.formBuilder.group({
    Pub_StartDate_Start: [], // 公告開始日 (起)
    Pub_StartDate_End: [], // 公告開始日 (迄)
    Pub_EndDate_Start: [], // 公告結束日 (起)
    Pub_EndDate_End: [], // 公告結束日 (迄)
    Role_No: [[]], // 公告角色
    User_No: [[]], // 使用者代號
    Org_ID: [[]], // 組織代號
    Pub_Type: [[]], // 公告類型
    pub_enable: [], // 是否啟用
    Pub_Event: [], // 公告主題關鍵字
    ...createPaginationConfig,
  });

  columns: any[] = [
    {
      field: 'Pub_StartDate',
      header: '公告起始日期時間',
      visible: true,
      format: this.formatDateTime,
    },
    {
      field: 'Pub_EndDate',
      header: '公告結束日期時間',
      visible: true,
      format: this.formatDateTime,
    },
    { field: 'pub_enable', header: '是否啟動', visible: true },
    { field: 'Pub_Type', header: '公告類別', visible: true },
    { field: 'Pub_Event', header: '公告事項', visible: true },
  ];
  detailcolumns: any[] = [
    { field: 'User_No', header: '使用者編號', visible: true },
    { field: 'User_Name', header: '使用者名稱', visible: true },
    { field: 'Org_ID', header: '組織代碼', visible: true },
    { field: 'Org_Name', header: '組織名稱', visible: true },
    { field: 'Role_No', header: '角色代碼', visible: true },
    { field: 'Role_Name', header: '角色名稱', visible: true },
  ];
  formatDateTime(value: any): string {
    if (!value) return '';
    const date = new Date(value);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  constructor(
    private announcementCategoryService: AnnouncementCategoryService,
    private dropDownListService: DropDownListService,
    private sysbr10Service: SYSBR10Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSBR10', '/sys/sysbr10cru', this.queryForm,(form) => this.onSubmit(form));

    this.announcementCategoryService
      .Pub_TypeOptions()
      .subscribe((data) => (this.Pub_TypeOptions = data));

    this.dropDownListService.queryTBLUSER_DropDownList().subscribe((res) => {
      if (res?.Data) {
        this.User_NoOptions = res.Data.map((user) => ({
          value: user.No,
          label: user.Name,
        }));
      } else {
        this.User_NoOptions = [];
      }
    });

    this.dropDownListService.querySYS3100_DropDownList().subscribe((res) => {
      if (res?.Data) {
        this.Org_IDOptions = res.Data.map((user) => ({
          value: user.No,
          label: user.Name,
        }));
      } else {
        this.Org_IDOptions = [];
      }
    });
    this.dropDownListService.querytblRole_DropDownList().subscribe((res) => {
      this.Role_NoOptions =
        res?.Data?.map((user) => ({ value: user.No, label: user.Name })) || [];
      this.detailcolumns[2].options = this.Role_NoOptions;
    });
  }
  onRowExpand(row: any): void {
    if (!row?.id) return;

    this.sysbr10Service.querySYSBR10Detail(row.id).subscribe({
      next: (res) => {
        // 根據實際格式調整 Data 結構
        row.children = res?.Data || [];
      },
      error: () => {
        this.messageService.errorBubble('明細查詢失敗');
      },
    });
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const payload = { ...form.value };
    for (const key in payload) {
      if (typeof payload[key] === 'string') {
        payload[key] = payload[key].trim() || null;
      }
    }

    this.loading = true;
    this.messageService.blockUi();

    this.sysbr10Service.querySYSBR10(payload).subscribe({
      next: (res) => {
        this.data = res.Data || [];
        this.totalRecords = res.TotalCount || this.data.length;
        this.queryStateService.setQueryState(this.ProgNo, payload);

        if (this.data.length > 0) {
          // ✅ 並行查詢每一筆明細
          const detailRequests = this.data.map((row) =>
            this.sysbr10Service
              .querySYSBR10Detail(row.id)
              .pipe(tap((detailRes) => (row.children = detailRes?.Data || []))),
          );

          // 等待所有明細查詢完成
          forkJoin(detailRequests).subscribe({
            complete: () => {
             
              this.loading = false;
              this.messageService.unblockUi();
            },
            error: () => {
              this.messageService.errorBubble('部分明細查詢失敗');
              this.loading = false;
              this.messageService.unblockUi();
            },
          });
        } else {
          this.loading = false;
          this.messageService.unblockUi();
        }
      },
      error: () => {
        this.messageService.errorBubble('查詢錯誤');
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }
  onDelete(selectedItems: any[]): void {
    if (!selectedItems.length) return;

    const confirmed = window.confirm('是否確定刪除選取項目？');
    if (!confirmed) return;

    const idList = selectedItems.map((item) => item.id); // ✅ 用 id 批次刪除

    this.sysbr10Service.deleteSYSBR10(idList).subscribe({
      next: () => {
        this.messageService.successBubble('刪除成功');
        this.selectedItems = []; // ✅ 清空已選
        this.onSubmit(this.queryForm); // ✅ 重新查詢
      },
      error: () => {
        this.messageService.errorBubble('刪除失敗');
      },
    });
  }
  isRowSelectable = (rowData: any): boolean => {
    return true; // 或加條件 rowData.pub_enable === '1'
  };

  editDisabled = (rowData: any): boolean => {
    return false; // 或根據條件 return rowData.pub_enable !== '1';
  };

  dialogVisible = false;
  selectedRowForDisable: any = null;

  showDisableDialog(row: any): void {
    this.selectedRowForDisable = row;
    this.dialogVisible = true;
  }

  confirmDisable(): void {
    if (!this.selectedRowForDisable?.id) return;

    this.sysbr10Service
      .updateSYSBR10_PubEable({
        id: this.selectedRowForDisable.id,
        pub_enable: 'N',
      })
      .subscribe({
        next: () => {
          this.messageService.successBubble('狀態已更新為不啟用');
          this.dialogVisible = false;
          this.onSubmit(this.queryForm);
        },
        error: () => {
          this.messageService.errorBubble('更新失敗');
        },
      });
  }

  cancelDisable(): void {
    this.dialogVisible = false;
    this.selectedRowForDisable = null;
  }

  override onEdit(row: any): void {
    if (!row?.id) return;

    this.confirmationService.confirm({
      message: '是否將此筆資料的狀態改為【不啟用】？',
      header: '確認停用',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: '是',
      rejectLabel: '否',
      accept: () => {
        this.sysbr10Service
          .updateSYSBR10_PubEable({ id: row.id, pub_enable: 'N' })
          .subscribe({
            next: () => {
              this.messageService.successBubble('狀態已更新為不啟用');

              // ✅ 成功後查詢明細
              this.sysbr10Service.querySYSBR10Detail(row.id).subscribe({
                next: (res) => {
                  const detailList = res?.Data || [];

                  // ✅ 將主檔 + 明細一起導入編輯頁
                  const fullData = {
                    ...row,
                    DetailList: detailList,
                  };
                  this.navigateWithState(CRUDStatus.Edit, fullData);
                },
                error: () => {
                  this.messageService.errorBubble('載入明細失敗');
                },
              });
            },
            error: () => {
              this.messageService.errorBubble('更新失敗');
            },
          });
      },
      reject: () => {
        // 使用者按了 "否"，不做事
      },
    });
  }
}
