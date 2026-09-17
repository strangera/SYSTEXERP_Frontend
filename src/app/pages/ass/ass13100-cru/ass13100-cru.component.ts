import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS13100Service } from '@service/api/ass/ass13100.service';
import { IDropdownItem, Pos2002LocationItem, Sys1000Query } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { finalize } from 'rxjs/operators';
import { PaginatorModule } from 'primeng/paginator';
import {
  ASS13100DetailRow,
  ASS13100GenerateUnitRow,
  ASS13100UpdateItem,
  InsertASS13100Request,
  InventoryGenerateMode,
  InventoryGenerateModeColNotes,
} from '../ass13100/ass13100.model';

@Component({
  selector: 'app-ass13100-cru',
  templateUrl: './ass13100-cru.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextComponent,
    TableEditComponent,
    DropdownComponent,
    CalendarComponent,
    RadioButtonModule,
    PaginatorModule,
    CheckboxModule,
  ],
})
export class ASS13100CRUComponent extends BasicCruPageComponent<ASS13100DetailRow> implements OnInit {


  detailPageIndex = 1;
detailPageSize = 30;
detailFirst = 0;
detailTotalRecords = 0;
  /** 編輯/明細用主檔 Form（清點單號、清點日期、狀態，供更新 API 使用） */
  readonly dataForm = this.formBuilder.group({
    CHK_ID: new FormControl<string | null>({ value: null, disabled: true }),
    CHK_DATE: new FormControl<Date | null>(null),
    STATUS: new FormControl<string | null>(null),
  });

  /** 編輯/明細用清點明細資料 */
  detailRows: ASS13100DetailRow[] = [];
  private originalDetailRows: ASS13100DetailRow[] = [];
  /** 主檔 ID（來自 rowdata 或 detail 回傳，供更新/結案使用） */
  private mainIdFromDetail: number | null = null;
  chkStatusOptions: { label: string; value: string }[] = [];
  statusOptions: { label: string; value: string }[] = [];
  locationOptions: { label: string; value: string }[] = [];
  detailColumns: EditColumn[] = [
    { field: 'ID', header: 'ID', type: 'input', disabled: () => true },
    { field: 'ASSET_ID', header: '資產編號', type: 'input', disabled: () => true },
    { field: 'GOODS_NAME', header: '品項名稱', type: 'input', disabled: () => true },
    { field: 'ASSET_STATUS_NAME', header: '資產狀態(清點前)', type: 'input', disabled: () => true },
    {
      field: 'CHK_STATUS',
      header: '資產狀態(清點後)',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => this.chkStatusOptions,
    },
    {
      field: 'LOCATION_ID',
      header: '位置代碼',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => this.locationOptions,
    },
    {
      field: 'NOTES',
      header: '註記',
      type: 'input',
    },
  ];

  /** 是否為新增模式（僅新增時顯示新增 panel） */
  get isCreateMode(): boolean {
    return this.crudstatus === CRUDStatus.Create && !(this.rowdata as { CHK_ID?: string } | null)?.CHK_ID;
  }

  /** 新增模式：產生方式與條件表單（含 API 欄位 COL_NOTES、CHK_DATE、AllOrg） */
  readonly generateForm = this.formBuilder.group({
    Mode: new FormControl<InventoryGenerateMode>('KEEPER_ORG'),
    IncludeAllOrg: new FormControl<boolean>(false),
    ParentOrg_ID: new FormControl<string | null>(null),
    CHK_DATE: new FormControl<Date | null>(null),
  });

  /** 新增模式：單位/人員清點設定表格 */
  generateRows: ASS13100GenerateUnitRow[] = [];
  generateColumns: EditColumn[] = [];

  orgOptions: { label: string; value: string }[] = [];
  inventoryEmpOptions: { label: string; value: string }[] = [];
  allUserOptionsForGenerate: { label: string; value: string }[] = [];
  private allInventoryEmpOptionsByOrg: { label: string; value: string; Org_ID?: string }[] = [];
  private previousGenerateMode: InventoryGenerateMode = 'KEEPER_ORG';
  displayGenerateMode: InventoryGenerateMode = 'KEEPER_ORG';

  /** 是否存在尚未填寫清點狀態的明細，用於控制「結案」按鈕 disabled 狀態 */
  get hasRowWithEmptyStatus(): boolean {
    return this.detailRows.some(row => !row.CHK_STATUS);
  }

  constructor(
    private readonly service: ASS13100Service,
    private readonly dropdownApi: DropdownApiService,
  ) {
    super();
  }

  /** 編輯/明細模式：載入下拉選項 */
  private loadDetailDropdowns(): void {
    this.dropdownApi
      .querySys1000({ SYS_Type: 'CHK_STATUS' } as Sys1000Query)
      ?.subscribe((list: IDropdownItem[] | null) => {
        this.chkStatusOptions = (list ?? []).map(x => ({
          label: x.Name,
          value: x.No,
        }));
      });

    this.dropdownApi
      .queryPos2002Location()
      ?.subscribe((list: Pos2002LocationItem[] | null) => {
        this.locationOptions = (list ?? []).map(x => ({
          label: x.location_no + '-' + x.tlt_floor,
          value: x.location_no ?? '',
        }));
      });
    this.dropdownApi
      .querySys1000({ SYS_Type: 'ASSET_CHK_STATUS' } as Sys1000Query)
      ?.subscribe((list: IDropdownItem[] | null) => {
        this.statusOptions = (list ?? []).map(x => ({
          label: x.Name,
          value: x.No,
        }));
      });
  }

  ngOnInit(): void {
    this.initializePage('ASS13100', this.dataForm);

    const row = this.rowdata as { CHK_ID?: string; ID?: number; CHK_DATE?: string; STATUS?: string } | null | undefined;
    const id = row?.ID;

    if (id != null) {
      // 編輯/明細：有主檔 ID，載入明細
      this.dataForm.patchValue({
        CHK_ID: row?.CHK_ID ?? null,
        CHK_DATE: row?.CHK_DATE ? new Date(row.CHK_DATE) : null,
        STATUS: row?.STATUS ?? null,
      });
      this.loadDetailDropdowns();
      this.loadDetail(id);
    } else if (this.crudstatus === CRUDStatus.Create) {
      // 新增模式：顯示新增 panel，不導回查詢頁
      this.loadCreatePanelDropdowns();
      this.generateColumns = this.buildGenerateColumnsByMode(this.generateForm.getRawValue().Mode ?? 'KEEPER_ORG');
      this.previousGenerateMode = 'KEEPER_ORG';
      this.displayGenerateMode = 'KEEPER_ORG';
      this.generateForm.controls.IncludeAllOrg.valueChanges.subscribe(() => {
        const currentMode = this.displayGenerateMode;
        this.generateColumns = this.buildGenerateColumnsByMode(currentMode);
      });
      this.generateForm.controls.ParentOrg_ID.valueChanges.subscribe(parentOrgId => {
        const mode = this.displayGenerateMode;
        if (mode === 'KEEPER_EMP' || mode === 'USER_EMP') {
          if (parentOrgId) {
            const filtered = this.allInventoryEmpOptionsByOrg.filter(x => !x.Org_ID || x.Org_ID === parentOrgId);
            this.inventoryEmpOptions = filtered.map(x => ({ label: x.label, value: x.value }));
          } else {
            this.inventoryEmpOptions = [];
          }
        }
      });
    } else {
      // 無主檔 ID 且非新增（異常），導回查詢頁
      this.messageService.warnBubble('缺少主檔 ID，無法載入明細');
      this.router.navigate(['account/ass/ass13100']);
    }
  }

  /** 取得主檔 ID（rowdata 來自查詢列或新增成功後 state；或 detail 載入後寫入 mainIdFromDetail） */
  private get mainId(): number | null {
    const fromRow = (this.rowdata as { ID?: number } | null | undefined)?.ID;
    if (fromRow != null && typeof fromRow === 'number') {
      return fromRow;
    }
    return this.mainIdFromDetail;
  }

  /** 載入新增 panel 下拉選項 */
  private loadCreatePanelDropdowns(): void {
    this.dropdownApi.querySys3100()?.subscribe(list => {
      this.orgOptions = (list ?? []).map(x => ({ label: x.label, value: x.value }));
    });
    this.dropdownApi.queryTblUser()?.subscribe((options: { label: string; value: string }[] | null) => {
      this.allUserOptionsForGenerate = (options ?? []).map(x => ({ label: x.label, value: x.value }));
    });
    this.dropdownApi.queryTblUserOrgid()?.subscribe(list => {
      const options = (list ?? []).map(x => {
        const orgId = (x as Record<string, unknown>)['Org_ID'];
        return {
          label: x.label,
          value: x.value,
          Org_ID: typeof orgId === 'string' ? orgId : undefined,
        };
      });
      this.allInventoryEmpOptionsByOrg = options;
      this.inventoryEmpOptions = options.map(o => ({ label: o.label, value: o.value }));
    });
  }

  private buildGenerateColumnsByMode(mode: InventoryGenerateMode): EditColumn[] {
    const columns: EditColumn[] = [];
    const includeAllOrg = this.generateForm.getRawValue().IncludeAllOrg ?? false;

    if (mode === 'KEEPER_ORG' || mode === 'USER_ORG') {
      if (!includeAllOrg) {
        columns.push({
          field: 'Org_ID',
          header: '部門代碼',
          type: 'dropdown',
          optionLabel: 'label',
          optionValue: 'value',
          options: () => this.orgOptions,
        });
      }
    }

    if (mode === 'KEEPER_EMP' || mode === 'USER_EMP') {
      columns.push({
        field: 'Emp_ID',
        header: '員工代碼',
        type: 'dropdown',
        optionLabel: 'label',
        optionValue: 'value',
        options: () => this.inventoryEmpOptions,
      });
    }

    columns.push(
      {
        field: 'InventoryEmp_ID_1',
        header: '清點員工代碼1',
        type: 'dropdown',
        optionLabel: 'label',
        optionValue: 'value',
        options: () => this.allUserOptionsForGenerate,
      },
      {
        field: 'InventoryEmp_ID_2',
        header: '清點員工代碼2',
        type: 'dropdown',
        optionLabel: 'label',
        optionValue: 'value',
        options: () => this.allUserOptionsForGenerate,
      },
    );

    return columns;
  }

  /** 新增模式：重置產生條件與單位/人員清點設定（不返回查詢頁） */
  onResetGenerate(): void {
    this.generateForm.reset({
      Mode: 'KEEPER_ORG',
      IncludeAllOrg: false,
      ParentOrg_ID: null,
    });

    this.generateRows = [];
    this.previousGenerateMode = 'KEEPER_ORG';
    this.displayGenerateMode = 'KEEPER_ORG';
    this.generateColumns = this.buildGenerateColumnsByMode('KEEPER_ORG');
  }

  /** 新增模式：切換清點產生方式（有資料時確認後才更新） */
  onModeChange(nextMode: InventoryGenerateMode): void {
    if (this.previousGenerateMode === nextMode) {
      return;
    }
    const hasRows = this.generateRows.length > 0;

    const applyModeChange = (): void => {
      this.generateForm.patchValue({ Mode: nextMode });
      this.generateRows = [];
      this.generateColumns = this.buildGenerateColumnsByMode(nextMode);
      this.previousGenerateMode = nextMode;
      this.displayGenerateMode = nextMode;
    };

    if (!hasRows) {
      applyModeChange();
      return;
    }

    this.messageService.confirm({
      header: '確認切換產生方式',
      message: '切換清點產生方式將清空下方單位/人員清點設定，是否繼續？',
      accept: () => {
        applyModeChange();
      },
    });
  }

  /** 新增模式：產生清點單（呼叫新增 API） */
  onGenerateInventory(): void {
    const mode = this.generateForm.getRawValue().Mode;
    if (!mode) {
      this.messageService.warnBubble('請選擇清點單產生方式');
      return;
    }

    if (!this.generateRows.length) {
      this.messageService.warnBubble('請先新增至少一筆單位/人員清點設定');
      return;
    }

    const isOrgMode = mode === 'KEEPER_ORG' || mode === 'USER_ORG';
    const isEmpMode = mode === 'KEEPER_EMP' || mode === 'USER_EMP';
    const includeAllOrg = this.generateForm.getRawValue().IncludeAllOrg ?? false;

    for (let i = 0; i < this.generateRows.length; i++) {
      const row = this.generateRows[i];

      const rowNo = i + 1;
      const orgId = String(row.Org_ID ?? '').trim();
      const empId = String(row.Emp_ID ?? '').trim();
      const chkEmp1 = String(row.InventoryEmp_ID_1 ?? '').trim();
      const chkEmp2 = String(row.InventoryEmp_ID_2 ?? '').trim();

      if (isOrgMode && !includeAllOrg && !orgId) {
        this.messageService.warnBubble(`第${rowNo}筆：部門代碼為必填`);
        return;
      }
      if (isEmpMode && !empId) {
        this.messageService.warnBubble(`第${rowNo}筆：員工代碼為必填`);
        return;
      }
      if (!chkEmp1) {
        this.messageService.warnBubble(`第${rowNo}筆：清點員工代碼1為必填`);
        return;
      }
      if (!chkEmp2) {
        this.messageService.warnBubble(`第${rowNo}筆：清點員工代碼2為必填`);
        return;
      }
    }

    const raw = this.generateForm.getRawValue();
    const chkDate = raw.CHK_DATE;
    if (!chkDate) {
      this.messageService.warnBubble('請選擇清點日期');
      return;
    }

    const body: InsertASS13100Request = {
      COL_NOTES: this.mapGenerateModeToColNotes(raw.Mode),
      CHK_DATE: chkDate.toISOString(),
      AllOrg: raw.IncludeAllOrg ?? false,
      GenList: this.generateRows.map(r => ({
        ORG_ID: r.Org_ID ?? null,
        EMP_ID: r.Emp_ID ?? null,
        CHK_EMP_ID: r.InventoryEmp_ID_1 ?? null,
        CHK_EMP_ID2: r.InventoryEmp_ID_2 ?? null,
      })),
    };

    this.loading = true;
    this.service
      .insertASS13100(body)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(res => {
        if (res?.Status === '0000' && res.Data) {
          const chkId = res.Data.CHK_ID;
          const id = res.Data.FAASSCHECKM_ID;
          this.messageService.confirm({
            header: '清點單產生完成',
            message: `清點單號：${chkId}`,
            acceptLabel: '前往明細',
            rejectLabel: '關閉',
            accept: () => {
              this.router.navigate(['account/ass/ass13100'], {
                state: { openDetailCHK_ID: chkId, openDetailID: id },
              });
            },
            reject: () => {
              this.router.navigate(['account/ass/ass13100']);
            },
          });
        } else {
          this.messageService.errorBubble(res?.Message ?? res?.Data?.ErrMsg ?? '產生清點單失敗');
        }
      });
  }

  private mapGenerateModeToColNotes(mode: InventoryGenerateMode | null | undefined): string {
    return mode ? InventoryGenerateModeColNotes[mode] : '';
  }

  /** 載入清點單明細 */
 private loadDetail(
  id: number,
  pageIndex: number = 1,
  pageSize: number = 30
): void {
  this.loading = true;

  this.service
    .queryDetailASS13100({
      ID: id,
      PageIndex: pageIndex,
      PageSize: pageSize,
    })
    .pipe(finalize(() => (this.loading = false)))
    .subscribe(res => {
      if (res?.Status === '0000' && res.Data) {
        const details = res.Data.Details ?? [];

        this.detailRows = details.map(detail => ({
          ...detail,
          CHK_STATUS: detail.CHK_STATUS ?? null,
          LOCATION_ID: detail.LOCATION_ID ?? null,
          NOTES: detail.NOTES ?? null,
        }));

        this.detailPageIndex = pageIndex;
        this.detailPageSize = pageSize;
        this.detailFirst = (pageIndex - 1) * pageSize;

        this.detailTotalRecords =
          res.Data.TotalCount ??
          res.TotalCount ??
          0;

        const master = res.Data.Master;

        this.dataForm.patchValue({
          CHK_ID:
            master?.CHK_ID ??
            this.dataForm.getRawValue().CHK_ID,

          CHK_DATE:
            master?.CHK_DATE
              ? new Date(master.CHK_DATE)
              : this.dataForm.getRawValue().CHK_DATE,

          STATUS:
            master?.STATUS ??
            this.dataForm.getRawValue().STATUS,
        });

        if (master?.ID != null) {
          this.mainIdFromDetail = master.ID;
        }

        this.originalDetailRows =
          JSON.parse(JSON.stringify(this.detailRows));
      } else {
        this.detailRows = [];
        this.originalDetailRows = [];
        this.detailTotalRecords = 0;
      }
    });
}
onDetailPageChange(event: any): void {
  const id = this.mainId;

  if (id == null) {
    return;
  }

  const pageSize = event.rows ?? 30;
  const pageIndex = Math.floor((event.first ?? 0) / pageSize) + 1;

  this.detailFirst = event.first ?? 0;
  this.detailPageSize = pageSize;
  this.detailPageIndex = pageIndex;

  this.loadDetail(id, pageIndex, pageSize);
}
  /** 取消：恢復進入頁面時資料 */
  onCancelDetail(): void {
    this.detailRows = JSON.parse(JSON.stringify(this.originalDetailRows));
  }

  /** 確認：呼叫修改 API */
  onConfirm(): void {
    const id = this.mainId;
    if (id == null) {
      this.messageService.errorBubble('缺少主檔 ID，無法儲存');
      return;
    }

    const firstEmptyStatusIndex = this.detailRows.findIndex(r => !String(r.CHK_STATUS ?? '').trim());
    if (firstEmptyStatusIndex !== -1) {
      this.messageService.warnBubble(`資產狀態(清點後)為必填`);
      return;
    }

    const raw = this.dataForm.getRawValue();
    const chkDate = raw.CHK_DATE;
    const status = raw.STATUS ?? '';
    if (!chkDate) {
      this.messageService.warnBubble('請選擇清點日期');
      return;
    }

    const items: ASS13100UpdateItem[] = this.detailRows
      .filter(r => r.ID != null && typeof r.ID === 'number')
      .map(r => ({
        ID: r.ID as number,
        CHK_STATUS: r.CHK_STATUS ?? null,
        LOCATION_ID: r.LOCATION_ID ?? null,
        NOTES: r.NOTES ?? null,
      }));

    this.loading = true;
    this.service
      .updateASS13100({
        ID: id,
        CHK_DATE: chkDate.toISOString(),
        STATUS: status,
        Items: items,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(res => {
        if (res?.Status === '0000') {
          this.messageService.successBubble('修改成功');
          this.onCancel();
        } else {
          this.messageService.errorBubble(res?.Message ?? '修改失敗');
        }
      });
  }

  /** 結案：所有明細清點狀態都需有值，呼叫 approveASS13100 */
  onClose(): void {
    const hasEmptyStatus = this.detailRows.some(x => !x.CHK_STATUS);
    if (hasEmptyStatus) {
      this.messageService.warnBubble('仍有明細清點狀態未填寫，無法結案');
      return;
    }

    const id = this.mainId;
    if (id == null) {
      this.messageService.errorBubble('缺少主檔 ID，無法結案');
      return;
    }

    this.messageService.confirm({
      header: '確認結案',
      message: '是否確認結案此清點單？',
      accept: () => {
        this.loading = true;
        this.service
          .approveASS13100({ ID: id })
          .pipe(finalize(() => (this.loading = false)))
          .subscribe(res => {
            if (res?.Status === '0000') {
              this.messageService.successBubble('結案成功');
              this.onCancel();
            } else {
              this.messageService.errorBubble(res?.Message ?? '結案失敗');
            }
          });
      },
    });
  }
}
