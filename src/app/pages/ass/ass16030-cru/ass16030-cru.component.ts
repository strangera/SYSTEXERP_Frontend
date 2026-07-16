import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import {
  ASS16030DetailItem,
  ASS16030InsertRequest,
  ASS16030QueryData,
  ASS16030UpdateRequest,
} from '@pages/ass/ass16030/ass16030.model';
import { ASS16030Service } from '@service/api/ass/ass16030.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import {
  validateDuplicate,
  validateMaxNumber,
} from '@shared/components/table-edit/validate-field.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { FileExportService } from '@shared/service/file-export.service';
import { toLocalIsoString } from '@shared/utils/object-utils';
import { PanelModule } from 'primeng/panel';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

/** 品項明細表格列的資料結構（含前端內部欄位） */
interface DetailRow {
  FASITEM_ID: number | null;
  UNIT: string | null;   // 單位代碼（SYS1000.UNIT），dropdown 對照 unitOptions 顯示名稱
  QTY: number | null;
  NOTES: string | null;
  // TODO: 待規格確認 GOODS_PRICE 來源（從 FASITEM 帶入？手動輸入？）暫送 0
  GOODS_PRICE: number;
}

@UntilDestroy()
@Component({
  selector: 'app-ass16030-cru',
  templateUrl: './ass16030-cru.component.html',
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TableEditComponent,
    TranslateModule,
    DropdownComponent,
    CalendarComponent,
  ],
})
export class ASS16030CRUComponent
  extends BasicCruPageComponent<ASS16030QueryData>
  implements OnInit {
  dataForm = this.formBuilder.group({
    EMP_ID: [null as string | null, [Validators.required]],
    ORG_ID: [null as string | null, [Validators.required]],
    APPLY_DATE: [null as Date | null, [Validators.required]],
    REQUIRE_DAYS: [null as number | null, [Validators.min(0), Validators.max(99)]],
    WH_ID: [null as string | null, [Validators.required]],
    NOTES: [null as string | null],
  });

  // 品項明細表格資料
  detailData: DetailRow[] = [];
  selectedRows: DetailRow[] = [];
  /** 進頁面當下載入的明細快照，供「取消」按鈕復原使用 */
  private initialDetailSnapshot: DetailRow[] = [];

  /** 列印申請單 PDF 的 loading 狀態 */
  printLoading = false;

  // Dropdown options（皆採用 `<code> - <name>` 格式）
  userOptions: Option[] = [];
  orgOptions: Option[] = [];
  whOptions: Option[] = [];
  fasitemOptions: Option[] = [];
  /** SYS1000.UNIT 對照：value=代碼、label=名稱（僅供「單位」欄位顯示用） */
  unitOptions: Option[] = [];

  columns: EditColumn[] = [
    {
      field: 'FASITEM_ID',
      header: '品項編號',
      type: 'dropdown',
      options: () => this.fasitemOptions,
      optionLabel: 'label',
      optionValue: 'value',
      validate: [validateDuplicate],
      onChange: (value: number, rowData: DetailRow) => {
        // 品項帶回 UNIT 代碼直接寫入 UNIT 欄位（dropdown 會用 unitOptions 顯示對應名稱）
        const item = this.fasitemOptions.find(x => x['value'] === value);
        rowData['UNIT'] = (item?.['UNIT'] as string | undefined) ?? null;
      },
    },
    {
      field: 'UNIT',
      header: '單位',
      type: 'dropdown',
      options: () => this.unitOptions,
      optionLabel: 'label',
      optionValue: 'value',
    },
    {
      field: 'QTY',
      header: '數量',
      type: 'inputNumber',
      validate: [validateMaxNumber(99999999)],
    },
    {
      field: 'NOTES',
      header: '單項說明',
      type: 'input',
    },
  ];

  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;

  constructor(
    private readonly ass16030Service: ASS16030Service,
    private readonly dropDownListService: DropDownListService,
    private readonly dropdownApiService: DropdownApiService,
    private readonly fileExportService: FileExportService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS16030', this.dataForm);
    this.loadDropdowns();

    if (this.crudstatus === CRUDStatus.Create) {
      // 新增時預設帶入目前登入者代號與今日日期
      this.dataForm.patchValue({
        EMP_ID: this.user?.user_No ?? null,
        APPLY_DATE: new Date(),
      });
    } else if (
      this.crudstatus === CRUDStatus.Edit ||
      this.crudstatus === CRUDStatus.Read
    ) {
      this.loadDetail(this.rowdata!);
    }
  }

  private loadDropdowns(): void {
    this.dropDownListService
      .queryTBLUSER_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.userOptions = (res?.Data ?? []).map(item => ({
          ...item,
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
      });

    this.dropDownListService
      .querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.orgOptions = (res?.Data ?? []).map(item => ({
          ...item,
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
      });

    this.dropDownListService
      .queryFAHOS_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const list = (res?.Data ?? []) as {
          WH_ID?: string | null;
          WH_NAME?: string | null;
        }[];
        this.whOptions = list.map(item => ({
          ...item,
          No: item.WH_ID ?? '',
          Name: item.WH_NAME ?? '',
          label: `${item.WH_ID ?? ''} - ${item.WH_NAME ?? ''}`,
          value: item.WH_ID ?? '',
        }));
      });

    // 品項下拉（使用 ASS0000/ASS1000 路由，response 含 UNIT/UNIT_NAME 供明細選取後自動帶入單位）
    this.dropdownApiService
      .queryFasItemAss1000Dropdown()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.fasitemOptions = res ?? [];
      });

    // SYS1000 UNIT 對照表：把品項帶回的 UNIT 代碼換成人類可讀名稱顯示
    this.dropdownApiService
      .querySys1000({ SYS_Type: 'UNIT' })
      .pipe(untilDestroyed(this))
      .subscribe(items => {
        this.unitOptions = (items ?? []).map(item => ({
          value: item.No,
          label: item.Name,
        }));
      });
  }

  /**
   * 載入明細資料（Edit / Read 模式）
   * 用 forkJoin 等品項下拉（為了 UNIT fallback）與 D endpoint（master + details）一起完成，
   * 避免品項 options 未到位時無法 fallback 取 UNIT。
   * SYS1000 UNIT 對照表由 loadDropdowns 訂閱、unitOptions 提供給 dropdown 顯示。
   */
  private loadDetail(rowdata: ASS16030QueryData): void {
    // 先用列表 rowdata 預填主檔（避免空表單閃爍）。MTAPPLY_ID 不在表單中，
    // Update payload 直接從 this.rowdata 取。
    this.dataForm.patchValue({
      EMP_ID: rowdata.EMP_ID,
      ORG_ID: rowdata.ORG_ID,
      APPLY_DATE: rowdata.APPLY_DATE ? new Date(rowdata.APPLY_DATE) : null,
      WH_ID: rowdata.WH_ID,
    });

    // 用 forkJoin 等品項下拉（為了 UNIT 對應）與 D endpoint master+details；
    // SYS1000 UNIT 對照表由 loadDropdowns 訂閱負責（shareReplay 共用）。
    forkJoin({
      opts: this.dropdownApiService.queryFasItemAss1000Dropdown(),
      res: this.ass16030Service.queryASS16030({
        MTAPPLY_ID: rowdata.MTAPPLY_ID,
      }),
    })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: ({ opts, res }) => {
          const fasitemOpts = opts ?? [];

          if (res.Status !== '0000') {
            this.messageService.errorBubble(
              res.Message ?? '載入單據資料失敗',
            );
            return;
          }
          const rows = res.Data ?? [];
          if (rows.length === 0) return;

          // 第一列含完整 master 欄位（含後端 JOIN 的 user_Name / Org_Name）
          const master = rows[0];
          this.dataForm.patchValue({
            EMP_ID: master.EMP_ID ?? rowdata.EMP_ID,
            ORG_ID: master.ORG_ID ?? rowdata.ORG_ID,
            APPLY_DATE: master.APPLY_DATE
              ? new Date(master.APPLY_DATE)
              : rowdata.APPLY_DATE
                ? new Date(rowdata.APPLY_DATE)
                : null,
            WH_ID: master.WH_ID ?? rowdata.WH_ID,
            // master 層 swagger 無 NOTES / REQUIRE_DAYS — 由後端帶在 detail 列或暫時不顯示
            // TODO: 待後端確認 master NOTES / REQUIRE_DAYS 是否補在另一欄
          });
          // detail 列：filter 掉「master-only」列（DETAIL_ID 為 null），並按 LINE_NUM 排序
          const detailRows = rows
            .filter(r => r.DETAIL_ID != null)
            .sort(
              (a, b) =>
                (a.LINE_NUM ?? Number.MAX_SAFE_INTEGER) -
                (b.LINE_NUM ?? Number.MAX_SAFE_INTEGER),
            );
          this.detailData = detailRows.map(r => {
            // UNIT 代碼優先用後端 detail row 的 Unit；fallback 才查品項下拉
            const fasItem = fasitemOpts.find(x => x['value'] === r.FASITEM_ID);
            const unitCode =
              r.Unit ?? (fasItem?.['UNIT'] as string | undefined) ?? null;
            return {
              FASITEM_ID: r.FASITEM_ID ?? null,
              UNIT: unitCode,
              QTY: r.QTY ?? null,
              // TODO: 待規格確認 GOODS_PRICE 來源；暫送 0
              GOODS_PRICE: r.GOODS_PRICE ?? 0,
              NOTES: r.NOTES ?? null,
            };
          });
          this.initialDetailSnapshot = this.detailData.map(d => ({ ...d }));
        },
      });
  }

  /**
   * 取消按鈕：將明細表格與選取狀態還原為進頁面當下的內容。
   * 主檔表單部分由 `app-button btnType="cancel" [form]="dataForm"` 內建機制 reset。
   */
  onCancelReset(): void {
    this.detailData = this.initialDetailSnapshot.map(d => ({ ...d }));
    this.selectedRows = [];
    this.submitted = false;
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      // 驗證明細表格
      const tableValid = this.tableEditComponent?.validateAndShowErrors() ?? true;
      if (!tableValid) {
        this.loading = false;
        return;
      }

      // DETAILS 至少一筆（API minItems: 1）
      if (this.detailData.length === 0) {
        this.messageService.warnBubble('品項明細至少需填寫一筆');
        this.loading = false;
        return;
      }

      const formVal = frm.getRawValue();
      const details: ASS16030DetailItem[] = this.detailData
        .filter(d => d.FASITEM_ID != null)
        .map(d => ({
          FASITEM_ID: d.FASITEM_ID as number,
          QTY: d.QTY ?? 0,
          // TODO: 待規格確認 GOODS_PRICE 來源；暫送 0
          GOODS_PRICE: d.GOODS_PRICE ?? 0,
          Unit: d.UNIT || null,
          NOTES: d.NOTES ?? null,
        }));

      if (details.length === 0) {
        this.messageService.warnBubble('品項明細至少需填寫一筆有效品項');
        this.loading = false;
        return;
      }

      if (this.isFormCreateable) {
        const payload: ASS16030InsertRequest = {
          EMP_ID: formVal.EMP_ID ?? '',
          ORG_ID: formVal.ORG_ID ?? '',
          APPLY_DATE: toLocalIsoString(formVal.APPLY_DATE) ?? '',
          REQUIRE_DAYS: formVal.REQUIRE_DAYS ?? null,
          WH_ID: formVal.WH_ID ?? '',
          NOTES: formVal.NOTES ?? null,
          DETAILS: details,
        };

        this.ass16030Service
          .insertASS16030(payload)
          .pipe(
            untilDestroyed(this),
            finalize(() => (this.loading = false)),
          )
          .subscribe({
            next: res => {
              if (res.Status === '0000') {
                this.messageService.successBubble('新增成功');
                this.onCancel();
              } else {
                this.messageService.errorBubble('新增失敗：' + (res.Message ?? ''));
              }
            },
          });
      } else if (this.isFormEditable) {
        // MTAPPLY_ID 不在表單欄位（規格 §6.2 未列），直接從導頁帶入的 rowdata 取。
        // NOTES / REQUIRE_DAYS：D endpoint master 沒有回傳這兩個欄位（spec 待後端補欄），
        // 若使用者沒動到欄位就送出 null，會把 DB 原值清掉。改為只在 control 為 dirty
        // （使用者實際編輯過）時才放入 payload，讓後端對未變更欄位保留原值。
        const payload: ASS16030UpdateRequest = {
          MTAPPLY_ID: this.rowdata?.MTAPPLY_ID ?? '',
          EMP_ID: formVal.EMP_ID ?? '',
          ORG_ID: formVal.ORG_ID ?? '',
          APPLY_DATE: toLocalIsoString(formVal.APPLY_DATE) ?? '',
          WH_ID: formVal.WH_ID ?? '',
          DETAILS: details,
        };
        if (this.dataForm.controls.REQUIRE_DAYS.dirty) {
          payload.REQUIRE_DAYS = formVal.REQUIRE_DAYS ?? null;
        }
        if (this.dataForm.controls.NOTES.dirty) {
          payload.NOTES = formVal.NOTES ?? null;
        }

        this.ass16030Service
          .updateASS16030(payload)
          .pipe(
            untilDestroyed(this),
            finalize(() => (this.loading = false)),
          )
          .subscribe({
            next: res => {
              if (res.Status === '0000') {
                this.messageService.successBubble('修改成功');
                this.onCancel();
              } else {
                this.messageService.errorBubble('修改失敗：' + (res.Message ?? ''));
              }
            },
          });
      }
    });
  }

  /** 列印申請單（PDF）— 透過 FileExportService 下載 */
  onPrint(): void {
    const mtapplyId = this.rowdata?.MTAPPLY_ID;
    if (!mtapplyId) {
      this.messageService.warnBubble('查無領用單號，無法列印');
      return;
    }
    this.fileExportService
      .executeFileExport(
        this.ass16030Service.exportPDFASS16030({ MTAPPLY_ID: mtapplyId }),
        '.pdf',
        loading => (this.printLoading = loading),
      )
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  /** 刪除明細列 */
  onDeleteDetail(rows: DetailRow[]): void {
    this.detailData = this.detailData.filter(item => !rows.includes(item));
    this.selectedRows = [];
  }
}
