import { NgIf } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '../../../shared/componentkit/input-textarea/input-textarea.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { formatAmount, ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { ValidationService } from '../../../shared/service/validation.service';

// 3.1.3.9 資產攤提作業 CRU
@UntilDestroy()
@Component({
  selector: 'app-ass13090-cru',
  templateUrl: './ass13090-cru.component.html',
  styleUrl: './ass13090-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberComponent,
    DropdownComponent,
    CalendarComponent,
    InputTextareaComponent,
    ButtonComponent,
    TableReportComponent,
    NgIf,
    TranslateModule,
  ],
})
export class ASS13090CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  private validationService = inject(ValidationService);
  private dropdownApiService = inject(DropdownApiService);
  private translate = inject(TranslateService);

  itemCodeOptions: Option[] = [];
  assetStatusOptions: Option[] = [];
  assetTypeOptions: Option[] = [];
  accountingCodeOptions: Option[] = [];
  orderNumberOptions: Option[] = [];
  supplierCodeOptions: Option[] = [];
  orgUnitOptions: Option[] = [];
  allUserOptionsWithOrg: Option[] = [];
  keepingPersonOptions: Option[] = [];
  userOptions: Option[] = [];
  locationCodeOptions: Option[] = [];

  /** 攤提紀錄（明細列表，API 就緒後改為查詢結果） */
  readonly amortRecordTableLoading = signal(false);
  amortRecordColumns: ReportColumn[] = [
    { field: 'amortStart', header: '攤提起始', visible: true },
    { field: 'amortEnd', header: '攤提結束', visible: true },
    {
      field: 'amortAmount',
      header: '攤提金額',
      visible: true,
      align: 'right',
      format: v => (v == null || v === '' ? '' : formatAmount(Number(v))),
    },
    { field: 'amortDate', header: '攤提日期', visible: true },
    { field: 'voucherNo', header: '傳票編號', visible: true },
    { field: 'revaluationNo', header: '重估單號', visible: true },
  ];
  amortRecordData: Record<string, unknown>[] = [];
  amortRecordTotal = 0;
  /** 取消鈕還原用：進頁當下表單快照 */
  private formBaseline: Record<string, unknown> | null = null;

  dataForm = this.formBuilder.group({
    assetsCode: [, [Validators.maxLength(20)]],
    itemCode: [],
    assetStatus: [, [Validators.maxLength(13)]],
    assetType: [, [Validators.maxLength(13)]],
    purchaseNumber: [],
    purchaseDate: [],
    purchaseAmount: [, [this.validationService.numberValidator, Validators.maxLength(8)]],
    alteredAmount: [, [this.validationService.numberValidator, Validators.maxLength(8)]],
    supplierCode: [, [Validators.maxLength(10)]],
    accounting_Borrow: [, [Validators.maxLength(8)]],
    accounting_Credit: [, [Validators.maxLength(8)]],
    entryDate: [],
    amortizedDate: [],
    depreciation: [],
    totalDepreciation: [],
    depreciationLife: [, [Validators.maxLength(8)]],
    alteredLife: [, [Validators.maxLength(8)]],
    depreciationLifeMM: [, [Validators.required, Validators.maxLength(8)]],
    residual: [, [Validators.maxLength(8)]],
    amortizedAmount: [, [Validators.maxLength(8)]],
    amortizedMonth: [, [Validators.maxLength(8)]],
    keepingPerson: [, [Validators.required]],
    keepingUnit: [],
    user: [],
    userUnit: [],
    locationCode: [],
    renewalNumber: [, [Validators.maxLength(25)]],
    renewalAmount: [, [Validators.required, Validators.maxLength(8)]],
    remark: [,],
  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13090', this.dataForm);
    if (this.crudstatus !== CRUDStatus.Create) {
      this.seedFormMockForEditRead();
    }
    this.applyEditFieldLock();
    queueMicrotask(() => this.captureFormBaseline());
    this.loadDropdownOptions();

    this.dataForm.controls.keepingUnit.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.updateKeepingPersonOptions();
      if (!this.allUserOptionsWithOrg.length) {
        return;
      }
      const unitVal = this.dataForm.controls.keepingUnit.value;
      const allowed = this.keepingPersonOptions.some(o => o.value === this.dataForm.controls.keepingPerson.value);
      if (unitVal != null && unitVal !== '' && !allowed) {
        this.dataForm.patchValue({ keepingPerson: undefined }, { emitEvent: false });
        this.dataForm.controls.keepingPerson.markAsPristine({ onlySelf: true });
      }
    });

    if (this.crudstatus !== CRUDStatus.Create) {
      this.seedAmortRecordMock();
    } else {
      this.amortRecordData = [];
      this.amortRecordTotal = 0;
    }

    this.dataForm.controls.userUnit.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.updateUserOptions();
      if (!this.allUserOptionsWithOrg.length) {
        return;
      }
      const unitVal = this.dataForm.controls.userUnit.value;
      const allowed = this.userOptions.some(o => o.value === this.dataForm.controls.user.value);
      if (unitVal != null && unitVal !== '' && !allowed) {
        this.dataForm.patchValue({ user: undefined }, { emitEvent: false });
        this.dataForm.controls.user.markAsPristine({ onlySelf: true });
      }
    });
  }

  private updateKeepingPersonOptions(): void {
    const unitVal = this.dataForm.controls.keepingUnit.value;
    if (unitVal == null || unitVal === '') {
      this.keepingPersonOptions = [...this.allUserOptionsWithOrg];
    } else {
      this.keepingPersonOptions = this.allUserOptionsWithOrg.filter(
        (o: Option) => (o as Option & { Org_ID?: string }).Org_ID === unitVal,
      );
    }
  }

  private updateUserOptions(): void {
    const unitVal = this.dataForm.controls.userUnit.value;
    if (unitVal == null || unitVal === '') {
      this.userOptions = [...this.allUserOptionsWithOrg];
    } else {
      this.userOptions = this.allUserOptionsWithOrg.filter(
        (o: Option) => (o as Option & { Org_ID?: string }).Org_ID === unitVal,
      );
    }
  }

  private loadDropdownOptions(): void {
    this.dropdownApiService
      .queryFasItemDropdown({})
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.itemCodeOptions = opts ?? []));

    this.dropdownApiService
      .querySys1000({ SYS_Type: 'ASSET_STATUS' })
      .pipe(untilDestroyed(this))
      .subscribe(list => {
        this.assetStatusOptions = (list ?? []).map(x => ({
          value: x.No,
          label: x.Name,
        }));
      });

    this.dropdownApiService
      .querySys1000({ SYS_Type: 'ASSET_TYPE' })
      .pipe(untilDestroyed(this))
      .subscribe(list => {
        this.assetTypeOptions = (list ?? []).map(x => ({
          value: x.No,
          label: `${x.No} - ${x.Name}`,
        }));
      });

    this.dropdownApiService
      .queryGls1005()
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.accountingCodeOptions = opts ?? []));

    this.dropdownApiService
      .queryPos2013({ VEN_Flag: '' })
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.supplierCodeOptions = opts ?? []));

    this.dropdownApiService
      .queryFAASSCHKM_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.orderNumberOptions = opts ?? []));

    this.dropdownApiService
      .querySys3100()
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.orgUnitOptions = opts ?? []));

    this.dropdownApiService
      .queryTblUserOrgid()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.allUserOptionsWithOrg = res ?? [];
        this.updateKeepingPersonOptions();
        this.updateUserOptions();
      });

    this.dropdownApiService
      .queryPos2002()
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.locationCodeOptions = opts ?? []));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.loading = false;
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            this.messageService.successBubble(this.translate.instant('success_message'));
            this.onCancel();
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            this.messageService.successBubble(this.translate.instant('updated-successfully'));
            this.onCancel();
          }
          break;
        default:
          break;
      }
    });
  }

  submitForm(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  /** 取消鈕：還原成進入頁面時的原始資料 */
  onCancelFormReset(): void {
    if (this.formBaseline == null) {
      return;
    }
    this.dataForm.reset(this.formBaseline);
    this.submitted = false;
    this.updateKeepingPersonOptions();
    this.updateUserOptions();
    this.applyEditFieldLock();
  }

  /** 編輯模式僅允許「續攤攤入金額」與「攤提備註」可編輯 */
  private applyEditFieldLock(): void {
    if (this.crudstatus !== CRUDStatus.Edit) {
      return;
    }

    const editable = new Set(['renewalAmount', 'remark']);
    for (const key of Object.keys(this.dataForm.controls) as Array<keyof typeof this.dataForm.controls>) {
      const ctrl = this.dataForm.controls[key];
      if (editable.has(key as string)) {
        ctrl.enable({ emitEvent: false });
      } else {
        ctrl.disable({ emitEvent: false });
      }
    }
  }

  private captureFormBaseline(): void {
    try {
      this.formBaseline = structuredClone(this.dataForm.getRawValue()) as Record<string, unknown>;
    } catch {
      this.formBaseline = { ...(this.dataForm.getRawValue() as Record<string, unknown>) };
    }
  }

  /** Edit/Read 假資料（API 未串接前先模擬） */
  private seedFormMockForEditRead(): void {
    const mockData: Record<string, unknown> = {
      assetsCode: '1A232300000010000001',
      itemCode: '1A23230000001',
      assetStatus: '1',
      assetType: '1',
      purchaseNumber: '201410300001',
      purchaseDate: new Date('2014-12-31'),
      purchaseAmount: 85819091,
      alteredAmount: 4092344,
      supplierCode: '152101',
      accounting_Borrow: '611602',
      accounting_Credit: '152011',
      entryDate: new Date('2014-12-31'),
      amortizedDate: new Date('2015-01-01'),
      depreciation: '611602',
      totalDepreciation: '152011',
      depreciationLife: 5,
      alteredLife: 0,
      depreciationLifeMM: 0,
      residual: 0,
      amortizedAmount: 8099892,
      amortizedMonth: 54,
      keepingPerson: '2014000016',
      keepingUnit: '102000',
      user: '2014000016',
      userUnit: '102000',
      locationCode: 'A100',
      renewalNumber: '1A23230000000001-01',
    };

    this.dataForm.patchValue(
      mockData as never,
      { emitEvent: false },
    );
  }

  /** TODO: 改為依資產代號查詢 API */
  private seedAmortRecordMock(): void {
    this.amortRecordData = [
      {
        id: 'ar1',
        seq: 1,
        amortStart: '201501',
        amortEnd: '201501',
        amortAmount: 1430318,
        amortDate: '2015/01/31',
        voucherNo: '20150131069',
        revaluationNo: '資產重估單號 : EV1505004',
      },
      {
        id: 'ar2',
        seq: 2,
        amortStart: '201502',
        amortEnd: '201502',
        amortAmount: 1428000,
        amortDate: '2015/02/28',
        voucherNo: '20150228071',
        revaluationNo: '',
      },
    ];
    this.amortRecordTotal = this.amortRecordData.length;
  }
}
