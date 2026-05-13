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
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { Option } from '@service/utility/dropdown-api.model';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import {
  validateDuplicate,
  validateMaxNumber,
} from '@shared/componentkit/table-edit/validate-field.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs/operators';

/** 品項明細表格列的資料結構（含前端內部欄位） */
interface DetailRow {
  FASITEM_ID: number | null;
  UNIT: string;
  QTY: number | null;
  NOTES: string | null;
  // TODO: 待規格確認 GOODS_PRICE 來源（從 FASITEM 帶入？手動輸入？）暫送 0
  GOODS_PRICE: number;
}

@UntilDestroy()
@Component({
  selector: 'app-ass16030-cru',
  templateUrl: './ass16030-cru.component.html',
  styleUrl: './ass16030-cru.component.scss',
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
  implements OnInit
{
  dataForm = this.formBuilder.group({
    MTAPPLY_ID: [null as string | null], // 唯讀，修改時由 rowdata 帶入；新增時由後端產生
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

  // Dropdown options（皆採用 `<code> - <name>` 格式）
  userOptions: Option[] = [];
  orgOptions: Option[] = [];
  whOptions: Option[] = [];
  fasitemOptions: Option[] = [];

  columns: EditColumn[] = [
    {
      field: 'FASITEM_ID',
      header: '品項編號',
      type: 'dropdown',
      options: () => this.fasitemOptions,
      optionLabel: 'label',
      optionValue: 'value',
      validate: [validateDuplicate],
      onChange: (rowData: DetailRow, value: number) => {
        // 選取品項後自動帶入 UNIT
        const item = this.fasitemOptions.find(x => x['value'] === value);
        // TODO: 待 queryFASITEM response 確認包含 UNIT 後自動帶入；若無則以空字串處理
        rowData['UNIT'] = (item?.['UNIT'] as string | undefined) ?? '';
      },
    },
    {
      field: 'UNIT',
      header: '單位',
      type: 'input',
      maxLength: 8,
      disabled: () => true, // 唯讀，由品項選取 onChange 帶入
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
    private ass16030Service: ASS16030Service,
    private dropDownListService: DropDownListService,
    private dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS16030', this.dataForm);
    this.loadDropdowns();

    if (
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

    // 品項下拉（使用 dropdown-api.service.ts，符合 data-display-conventions skill 規範）
    this.dropdownApiService
      .queryFasItemDropdown()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.fasitemOptions = res ?? [];
      });
  }

  /**
   * 載入明細資料（Edit / Read 模式）
   * TODO: 待後端提供領用單詳情 API 後改用單筆查詢；
   *       目前以再呼叫一次 queryASS16030（帶 MTAPPLY_ID filter）取得扁平結構，
   *       filter 出該單號的所有明細列組裝 DetailRow[]。
   */
  private loadDetail(rowdata: ASS16030QueryData): void {
    // 先用 rowdata 的主檔欄位填入 form
    this.dataForm.patchValue({
      MTAPPLY_ID: rowdata.MTAPPLY_ID,
      EMP_ID: rowdata.EMP_ID,
      ORG_ID: rowdata.ORG_ID,
      APPLY_DATE: rowdata.APPLY_DATE ? new Date(rowdata.APPLY_DATE) : null,
      WH_ID: rowdata.WH_ID,
      NOTES: rowdata.NOTES ?? null,
    });

    // 查詢明細：以 MTAPPLY_ID 做 filter 取得扁平結構
    this.ass16030Service
      .queryASS16030({ MTAPPLY_ID: rowdata.MTAPPLY_ID, PageSize: 1000, PageIndex: 1 })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          const rows = (res.Data ?? []).filter(
            r => r.MTAPPLY_ID === rowdata.MTAPPLY_ID && r.FASITEM_ID != null,
          );

          this.detailData = rows.map(r => ({
            FASITEM_ID: r.FASITEM_ID ?? null,
            UNIT:
              (this.fasitemOptions.find(x => x['value'] === r.FASITEM_ID)?.[
                'UNIT'
              ] as string | undefined) ?? '',
            QTY: r.QTY ?? null,
            // TODO: 待規格確認 GOODS_PRICE 來源；暫送 0
            GOODS_PRICE: r.GOODS_PRICE ?? 0,
            NOTES: r.NOTES ?? null,
          }));
          // 保留初始載入的明細快照，供「取消」復原使用
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
          APPLY_DATE: formVal.APPLY_DATE
            ? new Date(formVal.APPLY_DATE).toISOString()
            : '',
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
        const payload: ASS16030UpdateRequest = {
          MTAPPLY_ID: formVal.MTAPPLY_ID ?? '',
          EMP_ID: formVal.EMP_ID ?? '',
          ORG_ID: formVal.ORG_ID ?? '',
          APPLY_DATE: formVal.APPLY_DATE
            ? new Date(formVal.APPLY_DATE).toISOString()
            : '',
          REQUIRE_DAYS: formVal.REQUIRE_DAYS ?? null,
          WH_ID: formVal.WH_ID ?? '',
          NOTES: formVal.NOTES ?? null,
          DETAILS: details,
        };

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

  /** 列印申請單（PDF）— stub */
  onPrint(): void {
    // TODO: 待後端 API 上線 — Swagger 中尚無 /ASS0000/ASS1000/exportPDFASS16030
    this.messageService.warnBubble('列印申請單 API 尚未上線，請等待後端完成後再試');
  }

  /** 刪除明細列 */
  onDeleteDetail(rows: DetailRow[]): void {
    this.detailData = this.detailData.filter(item => !rows.includes(item));
    this.selectedRows = [];
  }
}
