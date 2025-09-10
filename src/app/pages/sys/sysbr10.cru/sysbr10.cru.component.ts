import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

import { Column } from '../../../shared/componentkit/table/table.model';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { AnnouncementCategoryService } from '../../../service/basic/announcement-category.service';
import { SYSBR10Service } from '../../../service/api/sys/sysbr10.service';

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
  implements OnInit
{
  // 是否進入表格時自動插入一列空白
  insertRowData = true;

  // —— 表格管理欄位開關（READ 模式會被自動關閉）——
  showInsert = true;
  showRowEdit = true;
  showDelete = true;
  showCheckBox = true;
  showEdit= true;
  showManage= true;

  // —— 其他 UI 與選項 —— 
  minDateToday: Date = new Date();
  Pub_TypeOptions: any[] = [];
  User_NoOptions: any[] = [];
  Org_IDOptions: any[] = [];
  Role_NoOptions: any[] = [];

  YNOptions: any[] = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
  ];

  // —— Master 表單 —— 
  dataForm = this.formBuilder.nonNullable.group({
    Pub_StartDate: [, Validators.required],
    Pub_EndDate:   [, Validators.required],
    pub_enable:    [, Validators.required], // ★ 新增 & 編輯都必填
    Pub_Type:      [, Validators.required],
    Pub_Event:     [, Validators.required],
    Pub_Description: [, Validators.required],
  });

  // —— Detail（表格） —— 
  detailList: any[] = [];

  detailcolumns: Column[] = [
    {
      field: 'User_No',
      header: '使用者編號',
      visible: true,
      type: 'dropdown',
      options: [],
      format: (_val: any, row?: any) =>
        this.labelOrValue(row?.User_Name, row?.User_No),
    },
    {
      field: 'Org_ID',
      header: '組織代碼',
      visible: true,
      type: 'dropdown',
      options: [],
      format: (_val: any, row?: any) =>
        this.labelOrValue(row?.Org_Name, row?.Org_ID),
    },
    {
      field: 'Role_No',
      header: '角色代號',
      visible: true,
      type: 'dropdown',
      options: [],
      format: (_val: any, row?: any) =>
        this.labelOrValue(row?.Role_Name, row?.Role_No),
    },
  ];

  // 如果改成 READ 顯示純文字，可切換到這組欄位
  detailcolumnsRead: Column[] = [
    { field: 'User_No', header: '使用者編號', visible: true },
    { field: 'Org_ID', header: '組織代碼', visible: true },
    { field: 'Role_No', header: '角色代號', visible: true },
  ];

  constructor(
    private dropDownListService: DropDownListService,
    private announcementCategoryService: AnnouncementCategoryService,
    private sysbr10Service: SYSBR10Service
  ) {
    super();
  }

  // —— Lifecycle —— 
  ngOnInit(): void {
    this.initializePage('SYSBR10', this.dataForm);
    {
  const src =
    (this.rowdata?.Pub_Description as string | undefined) ??
    (this.dataForm.controls.Pub_Description.value as string | undefined) ??
    '';
  const decoded = this.decodeIfBase64(src);
  this.dataForm.controls.Pub_Description.setValue(decoded as any, { emitEvent: false });
}

    // ★ 依模式設定 pub_enable 預設值（新增預設 Y；編輯帶現值，不在就預設 Y）
    const currentEnable =
      (this.rowdata?.pub_enable ??
       (this.rowdata as any)?.Pub_Enable ??
       (this.rowdata as any)?.pub_Enable ??
       null) as 'Y' | 'N' | null;

    if (this.isCreate) {
      if (!this.dataForm.controls.pub_enable.value) {
        this.dataForm.controls.pub_enable.setValue('Y' as any, { emitEvent: false });
      }
    } else {
      this.dataForm.controls.pub_enable.setValue((currentEnable ?? 'Y') as any, { emitEvent: false });
    }

    // READ 模式關閉表格管理欄（但依然維持下拉外觀）
    this.syncRowActionVisibility();

    // 明細載入（先用 rowdata，其次用 id 查）
    this.loadDetailForReadOrEdit();

    // 讓目前 detail 以「編輯外觀」呈現（READ/EDIT 都看得到 dropdown）
    this.applyEditorLook();

    // 上方「公告類別」選項
    this.announcementCategoryService
      .Pub_TypeOptions()
      .subscribe((data) => (this.Pub_TypeOptions = data ?? []));

    // 明細三個 dropdown 的 options
    this.dropDownListService.queryTBLUSER_DropDownList().subscribe((res) => {
      const opts = (res?.Data ?? []).map((u: any) => ({
        value: u.No,
        label: u.Name,
      }));
      this.User_NoOptions = opts;
      this.detailcolumns = this.detailcolumns.map((c) =>
        c.field === 'User_No' ? { ...c, options: opts } : c
      );
    });

    this.dropDownListService.querySYS3100_DropDownList().subscribe((res) => {
      const opts = (res?.Data ?? []).map((u: any) => ({
        value: u.No,
        label: u.Name,
      }));
      this.Org_IDOptions = opts;
      this.detailcolumns = this.detailcolumns.map((c) =>
        c.field === 'Org_ID' ? { ...c, options: opts } : c
      );
    });

    this.dropDownListService.querytblRole_DropDownList().subscribe((res) => {
      const opts = (res?.Data ?? []).map((u: any) => ({
        value: u.No,
        label: u.Name,
      }));
      this.Role_NoOptions = opts;
      this.detailcolumns = this.detailcolumns.map((c) =>
        c.field === 'Role_No' ? { ...c, options: opts } : c
      );
    });
  }

  // —— 便捷 Getter —— 
  get isCreate(): boolean {
    return this.crudstatus === CRUDStatus.Create;
  }
  get isRead(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  // 若你有在流程中切換 CRUD 狀態，可呼叫這個同步管理欄位顯示
  private syncRowActionVisibility(): void {
    if (this.isRead) {
      this.showInsert = false;
      this.showRowEdit = false;
      this.showDelete = false;
      this.showCheckBox = false;
      this.showEdit = false;
      this.showManage = false;
       
      
    } else {
      this.showInsert = true;
      this.showRowEdit = true;
      this.showDelete = true;
      this.showCheckBox = true;
      this.showEdit = true;
      this.showManage = true;
    }
  }

  // —— 提交流程 —— 
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const value = form.getRawValue();
   

      const masterId =
        this.crudstatus === CRUDStatus.Edit ? this.rowdata?.id ?? 0 : 0;

      // 組 DetailList
      const detailList = (this.detailList ?? []).map((row) => {
        const d: any = {};
        this.detailcolumns.forEach((col) => (d[col.field] = row[col.field] ?? null));
        d.id =
          typeof row.id === 'number' && row.id > 0 && String(row.id).length < 10
            ? row.id
            : 0;
        d.pos5101_id = masterId;
        return d;
      });

      const desiredEnable: 'Y' | 'N' = value.pub_enable as 'Y' | 'N';

      // —— 基本 payload（不含 pub_enable；編輯用，新增會另外加上）——
      const basePayload: any = {
        Pub_StartDate: value.Pub_StartDate,
        Pub_EndDate: value.Pub_EndDate,
        Pub_Type: value.Pub_Type,
        Pub_Event: value.Pub_Event,
        Pub_Description: value.Pub_Description,
        DetailList: detailList,
      };

      // —— 編輯流程：主檔更新（不含 pub_enable），再呼叫 Eable API —— 
// —— 編輯流程：主檔更新（不含 pub_enable），再呼叫 Enable API —— 
if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
  const updatePayload = { id: masterId, ...basePayload };

  this.loading = true;
  this.messageService?.blockUi?.();

  this.sysbr10Service.updateSYSBR10(updatePayload).subscribe({
    next: () => {
      this.sysbr10Service
        .updateSYSBR10_PubEable({ id: masterId, pub_enable: desiredEnable })
        .subscribe({
          next: () => {
            this.loading = false;
            this.messageService?.unblockUi?.();
            this.messageService?.successBubble?.('更新成功（含啟用狀態）');

            // ★ 清空 table
            this.detailList = [];

            this.onCancel();
          },
          error: () => {
            this.loading = false;
            this.messageService?.unblockUi?.();
          },
        });
    },
    error: () => {
      this.loading = false;
      this.messageService?.unblockUi?.();
    },
  });
  return;
}

// —— 新增流程：payload 需 **包含 pub_enable** —— 
if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
  const insertPayload = { ...basePayload, pub_enable: desiredEnable };

  this.loading = true;
  this.messageService?.blockUi?.();

  this.sysbr10Service.insertSYSBR10(insertPayload).subscribe({
    next: () => {
      this.loading = false;
      this.messageService?.unblockUi?.();
      this.messageService?.successBubble?.('新增成功');

      // ★ 清空表單與 table
      this.dataForm.reset();
      this.detailList = [];
    },
    error: () => {
      this.loading = false;
      this.messageService?.unblockUi?.();
    },
  });
}
    });
  }

  // —— 輔助：讓目前 detail 以編輯外觀呈現（READ/EDIT 都顯示 dropdown）——
  private applyEditorLook(): void {
    this.detailList = (this.detailList ?? []).map((r) => ({ ...r, _editing: true }));
  }
// —— Base64（支援 UTF-8）——
private decodeIfBase64(input?: string | null): string {
  if (!input) return '';
  try {
    // 嘗試以 Base64 解碼 -> UTF-8
    const bin = atob(input);
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    // 不是 Base64 或解碼失敗，就原樣回傳
    return input ?? '';
  }
}
private encodeToBase64(input?: string | null): string {
  const text = input ?? '';
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  bytes.forEach(b => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

  // —— 明細讀取（rowdata 優先，否則以 id 呼叫 API）——
  private loadDetailForReadOrEdit(): void {
    if (Array.isArray(this.rowdata?.DetailList) && this.rowdata!.DetailList.length > 0) {
      this.detailList = [...this.rowdata!.DetailList];
      return;
    }
    const id = this.rowdata?.id;
    if (!id) return;

    this.loading = true;
    this.messageService?.blockUi?.();
    this.sysbr10Service.querySYSBR10Detail(id).subscribe({
      next: (res) => {
        this.detailList = res?.Data ?? [];
        this.loading = false;
        this.messageService?.unblockUi?.();
      },
      error: () => {
        this.loading = false;
        this.messageService?.unblockUi?.();
       
      },
    });
  }

  // —— 小工具 —— 
  private labelOrValue(name: string | undefined, value: string | undefined) {
    return name?.toString()?.trim() || value || '';
  }
}
