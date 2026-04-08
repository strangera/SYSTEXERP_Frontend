/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgIf } from '@angular/common';
import { Component, OnInit, signal, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { Fin11040Service } from '@service/api/fin/fin11040.service';
import {
  ASS16090Service,
  Ass16090ApproveRequest,
  Ass16090DetailResponse,
  Ass16090InsertRequest,
  Ass16090Row,
  Ass16090UpdateRequest,
  Ass16090VoidRequest,
} from '../../../service/api/ass/ass16090.service';

import { ASS11100Service } from '@service/api/ass/ass11100.service';
import { DropDownListService } from '@service/utility/dropDownList.service';

/** 直接共用 FIN32020 的 table-edit */
import { FIN32020TableEditComponent } from '../../fin/fin32020-cru/fin32020table-edit/fin32020table-edit.component';
import {
  EditColumn,
  FieldChangeEvent,
} from '../../fin/fin32020-cru/fin32020table-edit/fin32020table-edit.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';

@UntilDestroy()
@Component({
  selector: 'app-ass16090-cru',
  templateUrl: './ass16090-cru.component.html',
  styleUrl: './ass16090-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    CalendarComponent,
    InputTextComponent,
    DropdownComponent,
    ButtonComponent,
    TranslateModule,
    FIN32020TableEditComponent,
  ],
})
export class ASS16090CRUComponent
  extends BasicCruPageComponent<Ass16090Row>
  implements OnInit
{
  /** 倉別選項 */
  public readonly whIdOptions = signal<{ label: string; value: string }[]>([]);

  /** 品項下拉 */
  goodsIdOptions: { value: string; label: string }[] = [];

  /** 申請人下拉 */
  empIdOptions: { value: string; label: string }[] = [];

  /** 部門下拉 */
  orgIdOptions: { value: string; label: string }[] = [];

  /** 主檔表單 */
  dataForm = this.formBuilder.nonNullable.group({
    ID: [null as number | null],
    DAMAGEM_ID: [{ value: '系統自動帶入', disabled: true } as any],
    WH_ID: [null as string | null, [Validators.required, Validators.maxLength(20)]],
    EMP_ID: [null as string | null, [Validators.required, Validators.maxLength(20)]],
    ORG_ID: [null as string | null, [Validators.required, Validators.maxLength(20)]],
    APPLY_DATE: [null as Date | null, [Validators.required]],
    NOTES: ['', [Validators.maxLength(200)]],
  });

  /** 明細資料（table-edit 綁定用） */
  detailData: any[] = [];
  detailLoading = false;

  /** 預設空白列 */
  defaultDetailRow = {
    LINE_NUM: null,
    GOODS_ID: null,
    GOODS_NAME: null,
    GOODS_UNIT_NAME: null,
    QTY: null,
    NOTES: '',
  };

  qtyFormat(value: any): string {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num)) return '0';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  /** 明細欄位 */
  detailColumns: EditColumn[] = [
    {
      field: 'GOODS_ID',
      header: '品項編號',
      type: 'dropdown',
      width: '220px',
      textAlign: 'left',
      options: () => this.goodsIdOptions,
      optionLabel: 'label',
      optionValue: 'value',
      placeholder: '請選擇品項編號',
      showClear: true,
      validate: [
        (value, _rowData, _data, _field, header) => {
          const v = String(value ?? '').trim();
          return {
            isValid: !!v,
            errorMessage: !!v ? [] : [`${header}不可為空白`],
          };
        },
      ],
    },
    {
      field: 'GOODS_NAME',
      header: '品項名稱',
      type: 'input',
      width: '220px',
      textAlign: 'left',
      maxLength: 100,
      placeholder: '請輸入品項名稱',
    },
    {
      field: 'GOODS_UNIT_NAME',
      header: '單位',
      type: 'input',
      width: '120px',
      textAlign: 'left',
      maxLength: 20,
      placeholder: '請輸入單位',
    },
    {
      field: 'QTY',
      header: '報廢數量',
      type: 'inputNumber',
      width: '140px',
      textAlign: 'right',
      min: 0,
      minFractionDigits: 0,
      maxFractionDigits: 2,
      format: this.qtyFormat,
      validate: [
        (value, _rowData, _data, _field, header) => {
          const num = Number(value ?? 0);
          return {
            isValid: Number.isFinite(num) && num > 0,
            errorMessage:
              Number.isFinite(num) && num > 0 ? [] : [`${header}需大於 0`],
          };
        },
      ],
    },
    {
      field: 'NOTES',
      header: '明細說明',
      type: 'input',
      width: '240px',
      textAlign: 'left',
      maxLength: 200,
      placeholder: '請輸入明細說明',
    },
  ];

  @ViewChild(FIN32020TableEditComponent)
  detailTableEdit!: FIN32020TableEditComponent;

  constructor(
    private readonly ass16090Service: ASS16090Service,
    private readonly ass11100Service: ASS11100Service,
    private readonly fin11040Service: Fin11040Service,
    private readonly dropdownApiService: DropdownApiService,
    private readonly dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS16090', this.dataForm);

    this.loadDropdownOptions();

    if (this.rowdata?.ID || this.rowdata?.DAMAGEM_ID) {
      this.loadDetail();
    } else {
      this.detailData = [{ ...this.defaultDetailRow, LINE_NUM: 1 }];

      if (this.crudstatus === CRUDStatus.Create) {
        this.dataForm.patchValue({ APPLY_DATE: new Date() });
      }
    }
  }

  get isEditMode(): boolean {
    return this.crudstatus === CRUDStatus.Edit;
  }

  private loadDropdownOptions(): void {
    this.ass11100Service
      .queryASS11100({ PageSize: 9999, PageIndex: 1 })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          if (res.Status !== '0000') return;

          const options = (res.Data ?? [])
            .filter((item) => item.WH_ID != null && item.WH_ID !== '')
            .map((item) => ({
              label: `${item.WH_ID} - ${item.WH_NAME ?? ''}`,
              value: item.WH_ID!,
            }));

          this.whIdOptions.set(options);
        },
      });

    this.dropDownListService
      .queryTBLUSER_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        const list = res.Data ?? [];
        this.empIdOptions = list.map(
          (item: { No?: string; Name?: string }) => ({
            value: item.No ?? '',
            label: `${item.No ?? ''} - ${item.Name ?? ''}`,
          })
        );
      });

    this.dropDownListService
      .queryPOS2013_DropDownList({})
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        const list = res.Data ?? [];
        this.orgIdOptions = list.map(
          (item: { No?: string; Name?: string }) => ({
            value: item.No ?? '',
            label: `${item.No ?? ''} - ${item.Name ?? ''}`,
          })
        );
      });

    this.dropdownApiService
      .queryAss11040Dropdown()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.goodsIdOptions = (res ?? []).map((item: any) => ({
          value: item.No ?? item.value ?? '',
          label: item.Name
            ? `${item.No ?? ''} - ${item.Name ?? ''}`
            : item.label ?? '',
        }));
      });
  }

  get totalQty(): number {
    return (this.detailData || []).reduce((sum: number, row: any) => {
      const n = Number(row?.QTY ?? 0);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
  }

  /** yyyy-MM-dd */
  private formatDateToYMD(
    date: Date | string | null | undefined
  ): string | null {
    if (!date) return null;

    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return null;

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /** yyyy-MM-ddT00:00:00，符合 Swagger 的 date-time */
  private formatDateToDateTime(
    date: Date | string | null | undefined
  ): string | null {
    const ymd = this.formatDateToYMD(date);
    return ymd ? `${ymd}T00:00:00` : null;
  }

  private formatDateTimeToIso(date: Date): string {
    return date.toISOString();
  }

  private patchFromDetail(data: Ass16090DetailResponse): void {
    this.dataForm.patchValue({
      ID: data?.ID ?? null,
      DAMAGEM_ID: data?.DAMAGEM_ID ?? '',
      WH_ID: data?.WH_ID ?? null,
      EMP_ID: data?.EMP_ID ?? null,
      ORG_ID: data?.ORG_ID ?? null,
      APPLY_DATE: data?.APPLY_DATE ? new Date(data.APPLY_DATE) : null,
      NOTES: data?.NOTES ?? '',
    });

    const list = (data?.Details ?? []).map((d, idx) => ({
      D_ID: d.D_ID ?? null,
      DAMAGEM_M_ID: d.DAMAGEM_M_ID ?? data?.ID ?? null,
      LINE_NUM: d.LINE_NUM ?? idx + 1,
      GOODS_ID: d.GOODS_ID ?? null,
      GOODS_NAME: d.GOODS_NAME ?? null,
      GOODS_UNIT: d.GOODS_UNIT ?? null,
      GOODS_UNIT_NAME: d.GOODS_UNIT_NAME ?? null,
      QTY: d.QTY ?? null,
      NOTES: d.NOTES ?? '',
    }));

    if (this.crudstatus === CRUDStatus.Read) {
      this.detailData = list;
      return;
    }

    this.detailData =
      list.length > 0 ? list : [{ ...this.defaultDetailRow, LINE_NUM: 1 }];
  }

  private loadDetail(): void {
    this.loading = true;

    this.ass16090Service
      .queryDetailASS16090({
        MID: 0,
        ID: this.rowdata?.ID ?? null,
        DAMAGEM_ID: this.rowdata?.DAMAGEM_ID ?? null,
      })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          const data = res?.Data;
          if (data) {
            this.patchFromDetail(data);
          } else {
            this.detailData = [{ ...this.defaultDetailRow, LINE_NUM: 1 }];
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('ASS16090 queryDetail error:', err);
          this.loading = false;
        },
      });
  }

  onDetailDataChange(data: any[]): void {
    this.detailData = (data ?? []).map((row, idx) => ({
      ...row,
      LINE_NUM: idx + 1,
    }));
  }

  onDetailFieldChange(_event: FieldChangeEvent): void {}

  onDetailDelete(_: any): void {
    this.reCalcLineNum();
  }

  private reCalcLineNum(): void {
    this.detailData = (this.detailData || []).map((row, idx) => ({
      ...row,
      LINE_NUM: idx + 1,
    }));
  }

  private syncDetailDataFromTableEdit(): void {
    if (!this.detailTableEdit) return;

    this.detailData = this.detailTableEdit._tableData
      .filter((item: any) => !item._isAutoInsertCandidate)
      .map((item: any, idx: number) => ({
        ...item,
        LINE_NUM: idx + 1,
      }));
  }

  /** Insert/Update 明細只送 Swagger 要的欄位 */
  private buildDetailList(): Array<{
    LINE_NUM: number;
    GOODS_ID: string | null;
    QTY: number | null;
    NOTES: string | null;
  }> {
    this.syncDetailDataFromTableEdit();

    return (this.detailData || []).map((row, idx) => ({
      LINE_NUM: idx + 1,
      GOODS_ID: row?.GOODS_ID ? String(row.GOODS_ID).trim() : null,
      QTY:
        row?.QTY !== null && row?.QTY !== undefined && row?.QTY !== ''
          ? Number(row.QTY)
          : null,
      NOTES: row?.NOTES ?? null,
    }));
  }

  private validateDetailData(): boolean {
    this.syncDetailDataFromTableEdit();

    const rows = this.detailData || [];
    if (!rows.length) {
      this.messageService?.warnBubble?.('請至少輸入一筆明細');
      return false;
    }

    const validRows = rows.filter((r) => {
      const goodsId = String(r?.GOODS_ID ?? '').trim();
      const qty = Number(r?.QTY ?? 0);
      return goodsId && Number.isFinite(qty) && qty > 0;
    });

    if (!validRows.length) {
      this.messageService?.warnBubble?.('請至少輸入一筆完整明細');
      return false;
    }

    return true;
  }

  /** Insert 依 Swagger */
  private buildInsertPayload(): Ass16090InsertRequest {
    const raw = this.dataForm.getRawValue();

    return {
      MID: 0,
      STO_NO: null,
      WH_ID: raw.WH_ID ?? '',
      EMP_ID: raw.EMP_ID ?? '',
      ORG_ID: raw.ORG_ID ?? '',
      APPLY_DATE: this.formatDateToDateTime(raw.APPLY_DATE)!,
      NOTES: raw.NOTES || null,
      DetailList: this.buildDetailList(),
      CRT_USR_No: null,
      CRT_USR_Name: null,
      UPD_USR_No: null,
      UPD_USR_Name: null,
    };
  }

  /** Update 依 Swagger */
  private buildUpdatePayload(): Ass16090UpdateRequest {
    const raw = this.dataForm.getRawValue();

    return {
      ID: Number(raw.ID ?? this.rowdata?.ID ?? 0),
      MID: 0,
      STO_NO: null,
      WH_ID: raw.WH_ID ?? '',
      EMP_ID: raw.EMP_ID ?? '',
      ORG_ID: raw.ORG_ID ?? '',
      APPLY_DATE: this.formatDateToDateTime(raw.APPLY_DATE)!,
      NOTES: raw.NOTES || null,
      DetailList: this.buildDetailList(),
      UPD_USR_No: null,
      UPD_USR_Name: null,
    };
  }

  private buildApprovePayload(): Ass16090ApproveRequest {
    const raw = this.dataForm.getRawValue();

    return {
      MID: 0,
      STO_NO: null,
      ID: Number(raw.ID ?? this.rowdata?.ID ?? 0),
      APRV_EMP_ID: raw.EMP_ID ?? null,
      APRV_DATE: this.formatDateTimeToIso(new Date()),
      UPD_USR_No: null,
      UPD_USR_Name: null,
    };
  }

  private buildVoidPayload(): Ass16090VoidRequest {
    const raw = this.dataForm.getRawValue();

    return {
      MID: 0,
      STO_NO: null,
      ID: Number(raw.ID ?? this.rowdata?.ID ?? 0),
      UPD_USR_No: null,
      UPD_USR_Name: null,
    };
  }

  onApprove(): void {
    if (!this.isEditMode) return;

    const payload = this.buildApprovePayload();
    this.loading = true;

    this.ass16090Service
      .approveASS16090(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: () => this.afterSaveSuccess(),
        error: (err) => {
          console.error('ASS16090 approve error:', err);
          this.loading = false;
        },
      });
  }

  onVoid(): void {
    if (!this.isEditMode) return;

    const payload = this.buildVoidPayload();
    this.loading = true;

    this.ass16090Service
      .voidASS16090(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: () => this.afterSaveSuccess(),
        error: (err) => {
          console.error('ASS16090 void error:', err);
          this.loading = false;
        },
      });
  }

  private afterSaveSuccess(): void {
    this.loading = false;
    this.submitted = false;

    this.router.navigate(['account/ass/ass16090'], {
      queryParams: { refresh: 1 },
      state: { fromCru: true },
    });
  }

  onBack(): void {
    this.router.navigate(['account/ass/ass16090'], {
      state: { fromCru: true },
    });
  }

  onSubmit(frm: FormGroup): void {
    this.submitted = true;

    if (frm.invalid) {
      frm.markAllAsTouched();
      return;
    }

    if (!this.validateDetailData()) {
      return;
    }

    this.loading = true;

    if (this.crudstatus === CRUDStatus.Create) {
      const payload = this.buildInsertPayload();

      this.ass16090Service
        .insertASS16090(payload)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: () => this.afterSaveSuccess(),
          error: (err) => {
            console.error('ASS16090 insert error:', err);
            this.loading = false;
          },
        });
      return;
    }

    if (this.crudstatus === CRUDStatus.Edit) {
      const payload = this.buildUpdatePayload();

      this.ass16090Service
        .updateASS16090(payload)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: () => this.afterSaveSuccess(),
          error: (err) => {
            console.error('ASS16090 update error:', err);
            this.loading = false;
          },
        });
      return;
    }

    this.loading = false;
  }
}