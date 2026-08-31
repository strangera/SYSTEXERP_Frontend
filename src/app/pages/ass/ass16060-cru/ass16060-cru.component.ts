import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  ASS16060MasterDisplayRow,
  ASS16060MasterRow,
} from '@pages/ass/ass16060/ass16060.model';
import {
  ASS16060DetailItem,
  ASS16060InsertRequest,
  ASS16060Service,
} from '@service/api/ass/ass16060.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextareaComponent } from '@shared/components/input-textarea/input-textarea.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { NotificationService } from '@shared/components/notification-message/notification.service';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';

/** 領用退料 CRU — 明細列（畫面僅序號+四欄；序號由 table-edit 內建） */
export interface ASS16060TableItem {
  GOODS_ID?: string;
  /** 僅 UI；後端 DetailTable 欄位未定，暫不送出 */
  UNIT?: string;
  QTY?: number;
  /** 單項說明 → API DetailTable.NOTES */
  NOTES?: string;
}

@UntilDestroy()
@Component({
  selector: 'app-ass16060-cru',
  templateUrl: './ass16060-cru.component.html',
  styleUrl: './ass16060-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarComponent,
    InputTextareaComponent,
    ButtonComponent,
    TableEditComponent,
  ],
})
export class ASS16060CRUComponent extends BasicCruPageComponent<ASS16060MasterDisplayRow> implements OnInit {
  public readonly dataForm = this.formBuilder.nonNullable.group({
    WH_ID: new FormControl<string | null>(null, [Validators.required]),
    RETURN_EMP_ID: new FormControl<string | null>(null, [Validators.required]),
    ORG_ID: new FormControl<string | null>(null, [Validators.required]),
    APPLY_DATE: new FormControl<Date | null>(null, [Validators.required]),
    REMARK: new FormControl<string | null>(null),
  });

  public readonly df = computed(() => this.dataForm.controls);

  public readonly tableLoading = signal<boolean>(false);
  public readonly tableData = signal<ASS16060TableItem[]>([]);
  selectedItems: ASS16060TableItem[] = [];

  public readonly warehouseOptions = signal<{ label: string; value: string }[]>([]);
  public readonly returnEmpOptions = signal<{ label: string; value: string; Name?: string }[]>([]);
  public readonly orgOptions = signal<{ label: string; value: string; Name?: string }[]>([]);
  public readonly itemOptions = signal<{ label: string; value: string; unit?: string; unitName?: string }[]>([]);

  public readonly editColumns: EditColumn[] = [
    {
      field: 'GOODS_ID',
      header: '品項編號',
      type: 'dropdown',
      options: () => this.itemOptions(),
      optionLabel: 'label',
      optionValue: 'value',
      showClear: true,
      onChange: (value: string | null, row: ASS16060TableItem) => {
        const match = this.itemOptions().find((opt) => opt.value === value);
        row.UNIT = match ? match.unitName : '';
      },
    },
    {
      field: 'UNIT',
      header: '單位',
      type: 'input',
      maxLength: 8,
      textAlign: 'left',
      disabled: () => true,
    },
    {
      field: 'QTY',
      header: '數量',
      type: 'inputNumber',
      min: 0,
      max: 99_999_999,
      maxLength: 12,
      maxFractionDigits: 4,
      placeholder: '數量',
    },
    {
      field: 'NOTES',
      header: '單項說明',
      type: 'input',
    },
  ];

  constructor(
    private readonly service: ASS16060Service,
    private readonly dropDownListService: DropDownListService,
    private readonly dropdownApi: DropdownApiService,
    private readonly notification: NotificationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS16060', this.dataForm);
    this.loadDropdownOptions();

    // 新增：確保表格有候選列
    if (this.crudstatus === CRUDStatus.Create && this.tableData().length === 0) {
      this.tableData.set([this.defaultNewItem()]);
    }

    // 檢視：先用 router state 的 row 填表頭，再打 queryASS16060 補主檔覆寫+明細
    if (this.isFormReadable && this.rowdata?.MTRETURN_ID) {
      this.patchMasterForm(this.rowdata);
      this.loadDetail(this.rowdata.MTRETURN_ID);
    }
  }

  /** router state 的列表 row → 表頭 form（覆寫主檔欄位） */
  private patchMasterForm(row: ASS16060MasterRow): void {
    this.dataForm.patchValue({
      WH_ID: row.WH_ID ?? null,
      RETURN_EMP_ID: row.EMP_ID ?? null,
      ORG_ID: row.ORG_ID ?? null,
      APPLY_DATE: this.toLocalDate(row.RETURN_DATE),
    });
  }

  /** 用 MTRETURN_ID 呼叫 queryASS16060 取主檔+明細 — 覆寫表頭並填入明細 table */
  private loadDetail(mtreturnId: string): void {
    this.tableLoading.set(true);
    this.service
      .queryASS16060({ MTRETURN_ID: mtreturnId, PageSize: 999, PageIndex: 1 })
      .pipe(
        finalize(() => this.tableLoading.set(false)),
        untilDestroyed(this),
      )
      .subscribe({
        next: (res) => {
          if (res.Status !== '0000') {
            this.notification.errorBubble(res.Message || '取得明細失敗');
            return;
          }
          const rows = res.Data ?? [];
          // 用 rows[0] 覆寫主檔欄位（後端為準）；若該欄位後端沒回則保留 router state 帶過來的值
          if (rows.length > 0) {
            const head = rows[0];
            const ctrls = this.dataForm.controls;
            this.dataForm.patchValue({
              WH_ID: head.WH_ID ?? ctrls.WH_ID.value,
              RETURN_EMP_ID: head.EMP_ID ?? ctrls.RETURN_EMP_ID.value,
              ORG_ID: head.ORG_ID ?? ctrls.ORG_ID.value,
              APPLY_DATE: head.RETURN_DATE
                ? this.toLocalDate(head.RETURN_DATE)
                : ctrls.APPLY_DATE.value,
              REMARK: head.NOTES ?? null,
            });
          }
          // 把所有 detail rows 轉成明細 table items
          this.tableData.set(
            rows.map((row): ASS16060TableItem => {
              const match = this.itemOptions().find((opt) => opt.value === row.GOODS_ID);
              return {
                GOODS_ID: row.GOODS_ID ?? undefined,
                UNIT: match ? match.unitName : undefined,
                QTY: row.QTY ?? undefined,
                NOTES: row.NOTES ?? undefined,
              };
            })
          );
        },
        error: () => {
          this.notification.errorBubble('取得明細失敗');
        },
      });
  }

  /** `YYYY-MM-DD` 純日期 → 當地零時 Date（避免 UTC 漂移）；其他交給 new Date */
  private toLocalDate(value: string | Date | null | undefined): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date(value);
  }

  private loadDropdownOptions(): void {
    this.dropDownListService
      .queryFAHOS_DropDownList({})
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        if (res.Status !== '0000' || !res.Data) return;
        const opts = res.Data.filter((x) => x.WH_ID != null && x.WH_ID !== '').map((x) => ({
          label: `${x.WH_ID} - ${x.WH_NAME ?? ''}`,
          value: x.WH_ID!,
        }));
        this.warehouseOptions.set(opts);
      });

    this.dropDownListService
      .queryTBLUSER_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        if (res.Status !== '0000' || !res.Data) return;
        const options = res.Data.map((item) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
          Name: item.Name,
        }));
        this.returnEmpOptions.set(options);
      });

    this.dropDownListService
      .querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        if (res.Status !== '0000' || !res.Data) return;
        const options = res.Data.map((item) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
          Name: item.Name,
        }));
        this.orgOptions.set(options);
      });

    this.dropdownApi
      .queryFasItemDropdown({})
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        const list = opts ?? [];
        this.itemOptions.set(
          list.map((o) => ({
            label: String(o.label ?? o.value),
            value: String(o.value),
            unit: String(o['UNIT'] ?? ''),
            unitName: String(o['UNIT_NAME'] ?? o['UNIT'] ?? ''),
          })),
        );
        // 若表格已載入明細，補上品項單位名稱
        const current = this.tableData();
        if (current.length > 0) {
          this.tableData.set(
            current.map((item) => {
              const match = this.itemOptions().find((opt) => opt.value === item.GOODS_ID);
              return {
                ...item,
                UNIT: match ? match.unitName : item.UNIT,
              };
            })
          );
        }
      });
  }

  public defaultNewItem(): ASS16060TableItem {
    return {
      GOODS_ID: undefined,
      UNIT: undefined,
      QTY: undefined,
      NOTES: undefined,
    };
  }

  public onTableInsert(): void {
    const current = this.tableData();
    this.tableData.set([...current, this.defaultNewItem()]);
  }

  /** 取消時清空明細（表頭由 app-button cancel 的 form.reset 處理） */
  public clearDetailTable(): void {
    this.tableData.set([this.defaultNewItem()]);
    this.selectedItems = [];
  }

  private detailRowHasAny(item: ASS16060TableItem): boolean {
    const str = (v: unknown) => v != null && String(v).trim() !== '';
    return str(item.GOODS_ID) || item.QTY != null || str(item.UNIT) || str(item.NOTES);
  }

  private toReturnDateIso(date: Date | string | null): string {
    if (date == null) return new Date().toISOString();
    if (date instanceof Date) return date.toISOString();
    const d = new Date(date);
    return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }

  private buildDetailTable(items: ASS16060TableItem[]): ASS16060DetailItem[] {
    const rows = items.filter((item) => this.detailRowHasAny(item));
    let line = 1;
    const out: ASS16060DetailItem[] = [];
    for (const item of rows) {
      out.push({
        LINE_NUM: line++,
        GOODS_ID: item.GOODS_ID?.trim() ? item.GOODS_ID : null,
        QTY: item.QTY != null ? Number(item.QTY) : null,
        GOODS_PRICE: null,
        TAX_CODE: null,
        AMT: null,
        CHECK_QTY: null,
        NOTES: item.NOTES?.trim() ? item.NOTES.trim() : null,
      });
    }
    return out;
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      if (!this.isFormCreateable) {
        this.loading = false;
        return;
      }

      const raw = this.dataForm.getRawValue();
      const tableItems = this.tableData();

      this.tableLoading.set(true);

      const detailTable = this.buildDetailTable(tableItems);

      const insertPayload: ASS16060InsertRequest = {
        MID: 0,
        STO_NO: '',
        WH_ID: raw.WH_ID ?? '',
        EMP_ID: raw.RETURN_EMP_ID ?? '',
        ORG_ID: raw.ORG_ID ?? '',
        RETURN_DATE: this.toReturnDateIso(raw.APPLY_DATE),
        NOTES: raw.REMARK?.trim() ? raw.REMARK.trim() : undefined,
        CRT_USR_No: this.authService.currentUserValue?.user_No ?? '',
        DetailTable: detailTable,
      };

      this.service
        .insertASS16060(insertPayload)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          }),
        )
        .subscribe({
          next: (res) => {
            if (res.Status !== '0000') {
              this.notification.errorBubble(res.Message || '新增失敗');
              return;
            }
            this.notification.successBubble('新增成功');
            this.onCancel();
          },
          error: () => {
            this.notification.errorBubble('新增時發生錯誤');
          },
        });
    });
  }
}
