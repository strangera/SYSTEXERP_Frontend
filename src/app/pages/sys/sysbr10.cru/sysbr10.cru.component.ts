import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { AnnouncementCategoryService } from '../../../service/basic/announcement-category.service';
import { SYSBR10Service } from '../../../service/api/sys/sysbr10.service';
import { Column } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { NgIf } from '@angular/common';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sysbr10.cru',
  templateUrl: './sysbr10.cru.component.html',
  styleUrls: ['./sysbr10.cru.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    RadiobuttonComponent,
    DropdownComponent,
    InputTextComponent,
    EditorTextComponent,
    NgIf,
    TableComponent,
    TranslateModule,
  ],
})
export class SYSBR10CRUComponent
  extends BasicCruPageComponent<any>
  implements OnInit {
  showInsert = true;
  showRowEdit = true;
  insertRowData = true;
  showDelete = true;
  showCheckBox = true;

  minDateToday: Date = new Date(); // 今天日期
  Pub_TypeOptions: any[] = [];
  User_NoOptions: any[] = [];
  Org_IDOptions: any[] = [];
  Role_NoOptions: any[] = [];

  YNOptions: any[] = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
  ];

  dataForm = this.formBuilder.nonNullable.group({
    Pub_StartDate: [, Validators.required],
    Pub_EndDate: [, Validators.required],
    pub_enable: [, Validators.required],
    Pub_Type: [, Validators.required],
    Pub_Event: [, Validators.required],
    Pub_Description: [, Validators.required],
  });
  detailList: any[] = []; // 初始化空陣列
  detailcolumns: Column[] = [
  {
    field: 'User_No',
    header: '使用者編號',
    visible: true,
    type: 'dropdown',
    options: [],
    format: (_val: any, row?: any) => this.labelOrValue(row?.User_Name, row?.User_No),
  },
  {
    field: 'Org_ID',
    header: '組織代碼',
    visible: true,
    type: 'dropdown',
    options: [],
    format: (_val: any, row?: any) => this.labelOrValue(row?.Org_Name, row?.Org_ID),
  },
  {
    field: 'Role_No',
    header: '角色代號',
    visible: true,
    type: 'dropdown',
    options: [],
    format: (_val: any, row?: any) => this.labelOrValue(row?.Role_Name, row?.Role_No),
  },
];

  constructor(
    private dropDownListService: DropDownListService,
    private announcementCategoryService: AnnouncementCategoryService,
    private sysbr10Service: SYSBR10Service,
  ) {
    super();
  }

ngOnInit(): void {
  this.initializePage('SYSBR10', this.dataForm);

  // 只在父層使用的小工具：把目前 detailList 的每列標記為編輯外觀
  const applyEditorLook = () => {
    this.detailList = (this.detailList ?? []).map(r => ({ ...r, _editing: true }));
  };

  // 1) 明細來源：先吃 rowdata 帶進來的，沒有就用 id 查一次
  const hasDetail =
    Array.isArray(this.rowdata?.DetailList) && this.rowdata!.DetailList.length > 0;

  if (hasDetail) {
    this.detailList = [...this.rowdata!.DetailList];
    applyEditorLook(); // ★ 直接讓表格以編輯樣渲染（才能看到 dropdown）
  } else if (this.rowdata?.id) {
    this.loading = true;
    this.messageService?.blockUi?.();
    this.sysbr10Service.querySYSBR10Detail(this.rowdata.id).subscribe({
      next: (res) => {
        this.detailList = res?.Data ?? [];
        this.loading = false;
        this.messageService?.unblockUi?.();
        applyEditorLook(); // ★ 載入後套編輯樣
      },
      error: () => {
        this.loading = false;
        this.messageService?.unblockUi?.();
        this.messageService?.errorBubble?.('讀取明細失敗');
      },
    });
  } else {
    // 沒有 id / 沒有明細就維持現況（例如創建模式下用預設插入列）
    applyEditorLook();
  }

  // 2) 上方「公告類別」選項
  this.announcementCategoryService.Pub_TypeOptions()
    .subscribe(data => (this.Pub_TypeOptions = data ?? []));

  // 3) 表格三個 dropdown 的 options
  this.dropDownListService.queryTBLUSER_DropDownList().subscribe((res) => {
    const opts = (res?.Data ?? []).map((u: any) => ({ value: u.No, label: u.Name }));
    this.User_NoOptions = opts;
    // 不可變賦值，觸發子層重渲染
    this.detailcolumns = this.detailcolumns.map(c =>
      c.field === 'User_No' ? { ...c, options: opts } : c
    );
  });

  this.dropDownListService.querySYS3100_DropDownList().subscribe((res) => {
    const opts = (res?.Data ?? []).map((u: any) => ({ value: u.No, label: u.Name }));
    this.Org_IDOptions = opts;
    this.detailcolumns = this.detailcolumns.map(c =>
      c.field === 'Org_ID' ? { ...c, options: opts } : c
    );
  });

  this.dropDownListService.querytblRole_DropDownList().subscribe((res) => {
    const opts = (res?.Data ?? []).map((u: any) => ({ value: u.No, label: u.Name }));
    this.Role_NoOptions = opts;
    this.detailcolumns = this.detailcolumns.map(c =>
      c.field === 'Role_No' ? { ...c, options: opts } : c
    );
  });

  // 4) 若一開始就有預設插入列（空白 1~N 列），也讓它們呈現 dropdown 外觀
  applyEditorLook();
}


  get isCreate(): boolean {
    return this.crudstatus === CRUDStatus.Create;
  }

// sysbr10.cru.component.ts (僅示範 onSubmit 內關鍵段)
onSubmit(form: FormGroup): void {
  this.handleSubmit(form, () => {
    const value = form.getRawValue();

    const masterId = this.crudstatus === CRUDStatus.Edit ? (this.rowdata?.id ?? 0) : 0;

    // 先組 DetailList（跟你原本的一樣）
    const detailList = this.detailList.map((row) => {
      const d: any = {};
      this.detailcolumns.forEach((col) => (d[col.field] = row[col.field] ?? null));
      d.id = (typeof row.id === 'number' && row.id > 0 && String(row.id).length < 10) ? row.id : 0;
      d.pos5101_id = masterId;
      return d;
    });

    // ✅ 組 payload：不含 pub_enable
  

    const desiredEnable: 'Y' | 'N' = value.pub_enable as 'Y' | 'N';
      const payload = {
      id: masterId,
      Pub_StartDate: value.Pub_StartDate,
      Pub_EndDate: value.Pub_EndDate,
      Pub_Type: value.Pub_Type,
      Pub_Event: value.Pub_Event,
      Pub_Description: value.Pub_Description,
      pub_enable: desiredEnable,     
      DetailList: detailList,
    } as any;
    if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
  this.loading = true;
  this.sysbr10Service.insertSYSBR10(payload).subscribe({
    next: (res) => {
      this.loading = false;
      this.messageService.successBubble('新增成功');
      this.dataForm.reset();
    },
    error: () => {
      this.loading = false;
      this.messageService.errorBubble('新增失敗');
    },
  });
  return;
}

    // -------- 編輯流程 --------
    if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
      this.loading = true;
      this.sysbr10Service.updateSYSBR10(payload).subscribe({
        next: (res) => {
          // 主檔/明細 OK 後，再用「專用 API」切換啟用
          this.sysbr10Service.updateSYSBR10_PubEable({ id: masterId, pub_enable: desiredEnable }).subscribe({
            next: () => {
              this.loading = false;
              this.messageService.successBubble('更新成功（含啟用狀態）');
              this.onCancel();
            },
            error: () => {
              this.loading = false;
              this.messageService.errorBubble('主檔已更新，但啟用狀態更新失敗');
            },
          });
        },
        error: () => {
          this.loading = false;
          this.messageService.errorBubble('更新失敗');
        },
      });
      return;
    }
      this.announcementCategoryService
      .Pub_TypeOptions()
      .subscribe((data) => (this.Pub_TypeOptions = data));

    // -------- 新增流程 --------
    if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
      this.loading = true;
      this.sysbr10Service.insertSYSBR10(payload).subscribe({
        next: (res) => {
          const newId = res?.Data?.id ?? 0; // 依你後端回傳調整
          if (!newId) {
            this.loading = false;
            this.messageService.successBubble('新增成功（未取得 id，略過啟用狀態設定）');
            this.dataForm.reset();
            return;
          }

          // 新增成功後，再設定啟用狀態
          this.sysbr10Service.updateSYSBR10_PubEable({ id: newId, pub_enable: desiredEnable }).subscribe({
            next: () => {
              this.loading = false;
              this.messageService.successBubble('新增成功（含啟用狀態）');
              this.dataForm.reset();
            },
            error: () => {
              this.loading = false;
              this.messageService.errorBubble('新增成功，但啟用狀態設定失敗');
            },
          });
        },
        error: () => {
          this.loading = false;
          this.messageService.errorBubble('新增失敗');
        },
      });
    }
  });
}

private forceEditorLookForRead(): void {
  if (!this.isRead) return;
  this.detailList = (this.detailList ?? []).map(r => ({ ...r, _editing: true }));
}


// 讀取模式：純文字顯示（不依賴 options，不會空白）
detailcolumnsRead: Column[] = [
  { field: 'User_No',  header: '使用者編號', visible: true },
  { field: 'Org_ID',   header: '組織代碼',  visible: true },
  { field: 'Role_No',  header: '角色代號',  visible: true },
];
get detailColsForView(): Column[] {
  return this.isRead ? this.detailcolumnsRead : this.detailcolumns;
}

  // ✅ 用 getter 判斷是否檢視模式
  get isRead(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }
  private labelOrValue(name: string | undefined, value: string | undefined) {
  return name?.toString()?.trim() || value || '';
}

// ✅ 補在 class 裡
private loadDetailForReadOrEdit(): void {
  // 已帶進來就直接用
  if (this.rowdata?.DetailList?.length) {
    this.detailList = [...this.rowdata.DetailList];
    return;
  }

  // 沒帶就用 id 查
  const id = this.rowdata?.id;
  if (!id) return; // 沒 id 就不查（可視需求加提醒）

  this.loading = true;
  this.messageService.blockUi();
  this.sysbr10Service.querySYSBR10Detail(id).subscribe({
    next: (res) => {
      this.detailList = res?.Data || [];
      this.loading = false;
      this.messageService.unblockUi();
    },
    error: () => {
      this.loading = false;
      this.messageService.unblockUi();
      this.messageService.errorBubble('讀取明細失敗');
    },
  });
}

}
