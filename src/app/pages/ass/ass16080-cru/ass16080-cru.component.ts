/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgIf } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';

import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import {
  ASS16080Service,
  QueryASS16080Response,
  QueryDetailASS16080Result,
  UpdateInASS16080Request,
  UpdateOutASS16080Request,
} from '../../../service/api/ass/ass16080.service';

import { ASS11100Service } from '@service/api/ass/ass11100.service';
import { DropDownListService } from '@service/utility/dropDownList.service';

import { FIN32020TableEditComponent } from '../../fin/fin32020-cru/fin32020table-edit/fin32020table-edit.component';
import { EditColumn } from '../../fin/fin32020-cru/fin32020table-edit/fin32020table-edit.model';

@UntilDestroy()
@Component({
  selector: 'app-ass16080-cru',
  templateUrl: './ass16080-cru.component.html',
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
export class ASS16080CRUComponent
  extends BasicCruPageComponent<QueryASS16080Response>
  implements OnInit
{
  public readonly whIdOptions = signal<{ label: string; value: string }[]>([]);
  empIdOptions: { value: string; label: string }[] = [];
  orgIdOptions: { value: string; label: string }[] = [];

  pageTitle = '調撥作業';
  detailTitle = '調撥作業明細';

  dataForm = this.formBuilder.nonNullable.group({
    ID: [null as number | null],
    WHMOVE_ID: [{ value: '', disabled: true } as any],
    WHMOVE_STATUS: [{ value: '', disabled: true } as any],
    OUT_WH_ID: [null as string | null, [Validators.required]],
    IN_WH_ID: [null as string | null, [Validators.required]],
    EMP_ID: [null as string | null, [Validators.required]],
    ORG_ID: [null as string | null, [Validators.required]],
    APPLY_DATE: [null as Date | null, [Validators.required]],
    NOTES: [''],
  });

  detailData: any[] = [];
  detailLoading = false;

  detailColumns: EditColumn[] = [
    {
      field: 'GOODS_ID',
      header: '品項編號',
      type: 'input',
      width: '180px',
      textAlign: 'left',
      disabled: () => true,
    },
    {
      field: 'GOODS_NAME',
      header: '品項名稱',
      type: 'input',
      width: '220px',
      textAlign: 'left',
      disabled: () => true,
    },
    {
      field: 'UNIT',
      header: '單位',
      type: 'input',
      width: '100px',
      textAlign: 'left',
      disabled: () => true,
    },
    {
      field: 'QTY',
      header: '調撥數量',
      type: 'inputNumber',
      width: '120px',
      textAlign: 'right',
      disabled: () => true,
    },
    {
      field: 'OUTGODS_QTY',
      header: '實際出庫數量',
      type: 'inputNumber',
      width: '140px',
      textAlign: 'right',
      min: 0,
      minFractionDigits: 0,
      maxFractionDigits: 2,
      validate: [
        (value, rowData, _data, _field, header) => {
          const num = Number(value ?? 0);
          const qty = Number(rowData?.QTY ?? 0);

          if (!(Number.isFinite(num) && num >= 0)) {
            return {
              isValid: false,
              errorMessage: [`${header}不可小於 0`],
            };
          }

          if (Number.isFinite(qty) && num > qty) {
            return {
              isValid: false,
              errorMessage: [`${header}不可大於調撥數量`],
            };
          }

          return {
            isValid: true,
            errorMessage: [],
          };
        },
      ],
    },
    {
      field: 'NOTES',
      header: '備註',
      type: 'input',
      width: '220px',
      textAlign: 'left',
      disabled: () => true,
    },
  ];

  constructor(
    private readonly ass16080Service: ASS16080Service,
    private readonly ass11100Service: ASS11100Service,
    private readonly dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS16080', this.dataForm);
    this.loadDropdownOptions();

    if (this.rowdata?.WHMOVE_ID) {
      this.loadDetail();
    }
  }

  get isEditMode(): boolean {
    return this.crudstatus === CRUDStatus.Edit;
  }

  /**
   * 狀態碼假設：
   * 2 = 已審核  -> 可調撥出庫
   * 3 = 已調撥  -> 可調撥入庫
   * 4 = 已收貨確認
   */
  get canUpdateOut(): boolean {
    const status = String(this.dataForm.controls.WHMOVE_STATUS.getRawValue() ?? '');
    return this.isEditMode && status === '2';
  }

  get canUpdateIn(): boolean {
    const status = String(this.dataForm.controls.WHMOVE_STATUS.getRawValue() ?? '');
    return this.isEditMode && status === '3';
  }

  onBack(): void {
  this.router.navigate(['account/ass/ass16080'], {
    state: { fromCru: true },
  });
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
 const toOpt = (items: { No?: string; Name?: string }[]) =>
      (items ?? []).map(item => ({
        label: `${item.No ?? ''} - ${item.Name ?? ''}`,
        value: item.No ?? '',
      }));
    this.dropDownListService
      .querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res.Status !== '0000') return;
        this.orgIdOptions = toOpt(res.Data ?? []);
      });
    }

  private patchFromDetail(data: QueryDetailASS16080Result): void {
    const master = data?.Master;
    const details = data?.Details ?? [];
    const status = String(master?.WHMOVE_STATUS ?? '');

    if (status === '2') {
      this.pageTitle = '調撥出庫作業';
      this.detailTitle = '調撥出庫明細';
    } else if (status === '3') {
      this.pageTitle = '調撥入庫作業';
      this.detailTitle = '調撥入庫明細';
    } else {
      this.pageTitle = '調撥作業';
      this.detailTitle = '調撥作業明細';
    }

    this.dataForm.patchValue({
      ID: master?.ID ?? null,
      WHMOVE_ID: master?.WHMOVE_ID ?? '',
      WHMOVE_STATUS: master?.WHMOVE_STATUS ?? '',
      OUT_WH_ID: master?.OUT_WH_ID ?? null,
      IN_WH_ID: master?.IN_WH_ID ?? null,
      EMP_ID: master?.EMP_ID ?? null,
      ORG_ID: master?.ORG_ID ?? null,
      APPLY_DATE: master?.APPLY_DATE ? new Date(master.APPLY_DATE) : null,
      NOTES: master?.NOTES ?? '',
    });

    this.detailData = details.map((d) => ({
      RowNo: d.RowNo ?? null,
      DetailID: d.DetailID ?? null,
      GOODS_ID: d.GOODS_ID ?? null,
      GOODS_NAME: d.GOODS_NAME ?? null,
      UNIT: d.UNIT ?? null,
      QTY: d.QTY ?? null,
      OUTGODS_QTY: d.OUTGODS_QTY ?? d.QTY ?? null,
      NOTES: d.NOTES ?? '',
    }));
  }

  private loadDetail(): void {
    this.loading = true;

    this.ass16080Service
      .queryDetailASS16080({
        WHMOVE_ID: String(this.rowdata?.WHMOVE_ID ?? ''),
      })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          const data = res?.Data;
          if (data) {
            this.patchFromDetail(data);
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('ASS16080 queryDetail error:', err);
          this.loading = false;
        },
      });
  }

  onDetailDataChange(data: any[]): void {
    this.detailData = data ?? [];
  }

  private buildUpdateOutPayload(): UpdateOutASS16080Request {
    const raw = this.dataForm.getRawValue();

    return {
      WHMOVE_ID: String(raw.WHMOVE_ID ?? '').trim() || null,
      Details: (this.detailData ?? []).map((row) => ({
        DetailID: Number(row?.DetailID ?? 0),
        QTY: Number(row?.OUTGODS_QTY ?? 0),
      })),
    };
  }

  private buildUpdateInPayload(): UpdateInASS16080Request {
    const raw = this.dataForm.getRawValue();

    return {
      WHMOVE_ID: String(raw.WHMOVE_ID ?? '').trim() || null,
      Details: (this.detailData ?? []).map((row) => ({
        DetailID: Number(row?.DetailID ?? 0),
        QTY: Number(row?.OUTGODS_QTY ?? 0),
      })),
    };
  }

  private afterSaveSuccess(): void {
  this.loading = false;
  this.submitted = false;

  this.router.navigate(['account/ass/ass16080'], {
    queryParams: { refresh: 1 },
    state: { fromCru: true },
  });
}

  onUpdateOut(): void {
    const payload = this.buildUpdateOutPayload();

    this.loading = true;
    this.ass16080Service.updateOutASS16080(payload).subscribe({
      next: () => this.afterSaveSuccess(),
      error: (err) => {
        console.error('ASS16080 updateOut error:', err);
        this.loading = false;
      },
    });
  }

  onUpdateIn(): void {
    const payload = this.buildUpdateInPayload();

    this.loading = true;
    this.ass16080Service.updateInASS16080(payload).subscribe({
      next: () => this.afterSaveSuccess(),
      error: (err) => {
        console.error('ASS16080 updateIn error:', err);
        this.loading = false;
      },
    });
  }

  override onCancel(): void {
    if (this.rowdata?.WHMOVE_ID) {
      this.loadDetail();
      this.submitted = false;
      return;
    }

    super.onCancel();
  }
}