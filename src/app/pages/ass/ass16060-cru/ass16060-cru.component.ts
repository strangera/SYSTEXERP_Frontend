import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  ASS16060CruRowData,
  ASS16060DetailItem,
  ASS16060InsertRequest,
  ASS16060Service,
} from '@service/api/ass/ass16060.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
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
export class ASS16060CRUComponent extends BasicCruPageComponent<ASS16060CruRowData> implements OnInit {
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
  public readonly itemOptions = signal<{ label: string; value: string }[]>([]);

  public readonly editColumns: EditColumn[] = [
    {
      field: 'GOODS_ID',
      header: '品項編號',
      type: 'dropdown',
      options: () => this.itemOptions(),
      optionLabel: 'label',
      optionValue: 'value',
      showClear: true,
    },
    {
      field: 'UNIT',
      header: '單位',
      type: 'input',
      maxLength: 8,
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

    // router state 序列化後日期變字串，檢視時轉回 Date
    if (this.isFormReadable && this.rowdata?.APPLY_DATE) {
      const ad = this.rowdata.APPLY_DATE;
      this.dataForm.patchValue(
        { APPLY_DATE: ad instanceof Date ? ad : new Date(ad) },
        { emitEvent: false },
      );
    }

    // 新增：確保表格有候選列
    if (this.crudstatus === CRUDStatus.Create && this.tableData().length === 0) {
      this.tableData.set([this.defaultNewItem()]);
    }
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
          })),
        );
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
