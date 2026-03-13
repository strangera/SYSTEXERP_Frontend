import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS13100Service } from '@service/api/ass/ass13100.service';
import { IDropdownItem, Sys1000Query } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { finalize } from 'rxjs/operators';
import {
  ASS13100DetailRow,
  ASS13100GenerateRequest,
  ASS13100GenerateUnitRow,
  InventoryGenerateMode,
} from '../ass13100/ass13100.model';

@Component({
  selector: 'app-ass13100-cru',
  templateUrl: './ass13100-cru.component.html',
  styleUrl: './ass13100-cru.component.scss',
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
    RadioButtonModule,
    CheckboxModule,
  ],
})
export class ASS13100CRUComponent extends BasicCruPageComponent<ASS13100DetailRow> implements OnInit {
  /** 固定欄位 Form（目前僅清點單號） */
  readonly dataForm = this.formBuilder.group({
    InventoryNo: new FormControl<string | null>({ value: null, disabled: true }),
  });

  /** 編輯/明細用清點明細資料 */
  detailRows: ASS13100DetailRow[] = [];
  private originalDetailRows: ASS13100DetailRow[] = [];
  inventoryAssetStatusOptions: { label: string; value: string }[] = [];
  locationOptions: { label: string; value: string }[] = [];
  detailColumns: EditColumn[] = [
    { field: 'AssetNo', header: '財產編號', type: 'input', disabled: () => true },
    { field: 'AssetCode', header: '資產代號', type: 'input', disabled: () => true },
    { field: 'ItemNo', header: '品項編號', type: 'input', disabled: () => true },
    {
      field: 'InventoryAssetStatus',
      header: '資產狀態(清點後)',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => this.inventoryAssetStatusOptions,
    },
    {
      field: 'LocationCode',
      header: '位置代碼',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => this.locationOptions,
    },
    {
      field: 'Remark',
      header: '註記',
      type: 'input',
    },
  ];

  /** 是否為新增模式（僅新增時顯示新增 panel） */
  get isCreateMode(): boolean {
    return this.crudstatus === CRUDStatus.Create && !(this.rowdata as { InventoryNo?: string } | null)?.InventoryNo;
  }

  /** 新增模式：產生方式與條件表單 */
  readonly generateForm = this.formBuilder.group({
    Mode: new FormControl<InventoryGenerateMode>('KEEPER_ORG'),
    IncludeAllOrg: new FormControl<boolean>(false),
    ParentOrg_ID: new FormControl<string | null>(null),
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

  /** 是否存在尚未填寫資產狀態的明細，用於控制「結案」按鈕 disabled 狀態 */
  get hasRowWithEmptyStatus(): boolean {
    return this.detailRows.some(row => !row.InventoryAssetStatus);
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
        this.inventoryAssetStatusOptions = (list ?? []).map(x => ({
          label: x.Name,
          value: x.No,
        }));
      });

    this.dropdownApi
      .queryPos2002Location()
      ?.subscribe((list: IDropdownItem[] | null) => {
        this.locationOptions = (list ?? []).map(x => ({
          label: x.Name,
          value: x.No,
        }));
      });
  }

  ngOnInit(): void {
    this.initializePage('ASS13100', this.dataForm);

    const inventoryNo = (this.rowdata as { InventoryNo?: string } | null | undefined)?.InventoryNo;

    if (inventoryNo) {
      // 編輯/明細：有清點單號，載入明細
      this.dataForm.patchValue({ InventoryNo: inventoryNo });
      this.loadDetailDropdowns();
      this.loadDetail(inventoryNo);
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
      // 無清點單號且非新增（異常），導回查詢頁
      this.router.navigate(['account/ass/ass13100']);
    }
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
    const raw = this.generateForm.getRawValue();
    const body: ASS13100GenerateRequest = {
      Mode: raw.Mode ?? 'KEEPER_ORG',
      IncludeAllOrg: raw.IncludeAllOrg ?? false,
      ParentOrg_ID: raw.ParentOrg_ID ?? null,
      Units: this.generateRows,
    };

    if (!body.Units.length) {
      this.messageService.warnBubble('請先新增至少一筆單位/人員清點設定');
      return;
    }

    this.loading = true;
    this.service
      .insertASS13100(body)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(res => {
        if (res?.Status === '0000' && res.Data) {
          const inventoryNo = res.Data.InventoryNo;
          this.messageService.confirm({
            header: '清點單產生完成',
            message: `清點單號：${inventoryNo}`,
            acceptLabel: '前往明細',
            rejectLabel: '關閉',
            accept: () => {
              this.router.navigate(['account/ass/ass13100'], {
                state: { openDetailInventoryNo: inventoryNo },
              });
            },
            reject: () => {
              this.router.navigate(['account/ass/ass13100']);
            },
          });
        } else {
          this.messageService.errorBubble(res?.Message ?? '產生清點單失敗');
        }
      });
  }

  /** 載入清點單明細 */
  private loadDetail(inventoryNo: string): void {
    this.loading = true;
    this.service
      .detailASS13100(inventoryNo)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(res => {
        if (res?.Status === '0000' && res.Data) {
          this.detailRows = res.Data.Details ?? [];
          this.originalDetailRows = JSON.parse(JSON.stringify(this.detailRows));
        } else {
          this.detailRows = [];
          this.originalDetailRows = [];
        }
      });
  }

  /** 取消：恢復進入頁面時資料 */
  onCancelDetail(): void {
    this.detailRows = JSON.parse(JSON.stringify(this.originalDetailRows));
  }

  /** 確認：呼叫修改 API */
  onConfirm(): void {
    const inventoryNo = this.dataForm.getRawValue().InventoryNo;
    if (!inventoryNo) {
      this.messageService.errorBubble('缺少清點單號，無法儲存');
      return;
    }

    this.loading = true;
    this.service
      .updateASS13100({
        InventoryNo: inventoryNo,
        Details: this.detailRows,
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

  /** 結案：所有明細資產狀態都需有值 */
  onClose(): void {
    const hasEmptyStatus = this.detailRows.some(x => !x.InventoryAssetStatus);
    if (hasEmptyStatus) {
      this.messageService.warnBubble('仍有明細資產狀態未填寫，無法結案');
      return;
    }

    const inventoryNo = this.dataForm.getRawValue().InventoryNo;
    if (!inventoryNo) {
      this.messageService.errorBubble('缺少清點單號，無法結案');
      return;
    }

    this.messageService.confirm({
      header: '確認結案',
      message: '是否確認結案此清點單？',
      accept: () => {
        this.loading = true;
        this.service
          .closeASS13100({ InventoryNo: inventoryNo })
          .pipe(finalize(() => (this.loading = false)))
          .subscribe(res => {
            if (res?.Status === '0000') {
              this.messageService.successBubble('結案成功');
            } else {
              this.messageService.errorBubble(res?.Message ?? '結案失敗');
            }
          });
      },
    });
  }
}
