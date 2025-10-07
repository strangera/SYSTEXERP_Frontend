/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

import { FIN13060Service } from '../../../service/api/fin/fin13060.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { QueryYearMonthComponent } from '../../../shared/componentkit/query-year-month/query-year-month.component';
import { FIN13050Service } from '@service/api/fin/fin13050.service';
import { CalenderoneComponent } from '@shared/componentkit/calenderone/calenderone.component';

type YM = string | null;

/** Typed Forms：每個欄位都給明確的 FormControl 型別 */
interface Fin13060CruForm {
  mid: FormControl<number | null>;
  SYS_StoreNo: FormControl<string | null>;

  ECR_No: FormControl<string | null>;
  TXN_No: FormControl<number | null>;
  TXN_GUIPaper: FormControl<string | null>;

  INV_NoneTax: FormControl<string | null>;
  INV_Cancel: FormControl<'N' | 'Y' | null>;

  INV_GUIType: FormControl<string | null>;
  INV_GUITrack: FormControl<string | null>;
  INV_GUINumber: FormControl<string | null>;

  TXN_Date: FormControl<Date | string | null>;
  INV_DeclareYM: FormControl<YM>;

  TXN_SaleAmt: FormControl<number | null>;
  TXN_Net: FormControl<number | null>;
  TXN_Tax: FormControl<number | null>;

  PLU_TaxType: FormControl<string | null>;

  Source_Doc_No: FormControl<string | null>;
  Voucher_No: FormControl<string | null>;
  SAL_Type: FormControl<string | null>;
  AssetType: FormControl<string | null>;
  INV_Remark: FormControl<string | null>;
  Tlt_No: FormControl<string | null>;
  Ven_No: FormControl<string | null>;

  ID: FormControl<number | null>;
}

@Component({
  selector: 'app-fin13060-cru',
  standalone: true,
  templateUrl: './fin13060-cru.component.html',
  styleUrls: ['./fin13060-cru.component.scss'],
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    QueryYearMonthComponent,
    NgIf,
    TranslateModule,
    CalendarComponent,
    CalenderoneComponent,
  ],
})
export class FIN13060CRUComponent
  extends BasicCruPageComponent<any>
  implements OnInit
{
  @Output() fieldChange = new EventEmitter<any>();

  // 下拉選項
  PUR_VoucherTypeOptions: any[] = [
    
  ];

  taxTypeOptions = [
   
  ];

  SAL_TypeOptions = [

  ];

  AssetNoteOptions = [

  ];

  CounterOptions: any[] = []; // 專櫃
  INV_NoneTaxOptions: any[] = [];
  INV_CancelOptions: any[] = [
    { label: '否', value: 'N' },
    { label: '是', value: 'Y' },
  ];  

  INV_GUITypeOptions: any[] = [];

  /** 完整 Typed FormGroup —— 讓 template 可用 dataForm.controls.欄位 直接取用 */
  dataForm: FormGroup<Fin13060CruForm> = new FormGroup<Fin13060CruForm>({
    mid: new FormControl<number | null>({ value: null, disabled: true }, { validators: [Validators.required] }),
    SYS_StoreNo: new FormControl<string | null>({ value: null, disabled: true }, { validators: [Validators.required] }),

    ECR_No: new FormControl<string | null>('', { validators: [Validators.required] }),
    TXN_No: new FormControl<number | null>(null, { validators: [Validators.required] }),
    TXN_GUIPaper: new FormControl<string | null>('', { validators: [Validators.required] }),

    INV_NoneTax: new FormControl<string | null>('0'),
    INV_Cancel: new FormControl<'N' | 'Y' | null>('N'),

    INV_GUIType: new FormControl<string | null>(null, { validators: [Validators.required] }),
    INV_GUITrack: new FormControl<string | null>('', { validators: [Validators.required] }),
    INV_GUINumber: new FormControl<string | null>('', { validators: [Validators.required] }),

    TXN_Date: new FormControl<Date | string | null>(null, { validators: [Validators.required] }),
    INV_DeclareYM: new FormControl<YM>('', { validators: [Validators.required] }),

    TXN_SaleAmt: new FormControl<number | null>(null, { validators: [Validators.required] }),
    TXN_Net: new FormControl<number | null>(null, { validators: [Validators.required] }),
    TXN_Tax: new FormControl<number | null>(null, { validators: [Validators.required] }),

    PLU_TaxType: new FormControl<string | null>(null, { validators: [Validators.required] }),

    Source_Doc_No: new FormControl<string | null>(null),
    Voucher_No: new FormControl<string | null>(null),
    SAL_Type: new FormControl<string | null>(null),
    AssetType: new FormControl<string | null>(null),
    INV_Remark: new FormControl<string | null>(null),
    Tlt_No: new FormControl<string | null>(null),
    Ven_No: new FormControl<string | null>(null),

    ID: new FormControl<number | null>(null),
  });

  constructor(
    private fin13060Service: FIN13060Service,
    private counterNameService: CounterNameService,
    private fin13050Service: FIN13050Service,
  ) {
    super();
  }

  ngOnInit(): void {
  this.initializePage('FIN13060', this.dataForm);
  this.hydrateStoreInfoFromLocalStorage(); // mid、SYS_StoreNo 由 localStorage 帶入

  // 專櫃清單
  this.counterNameService.getCounters().subscribe((res) => {
    this.CounterOptions =
      res?.map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      })) ?? [];
  });

  // 零稅銷售註記清單 + 載入後預設為「否」
  this.fin13050Service
    .querySYS1000DropDownList('INV_NoneTax')
    .subscribe((res) => {
      const list = res?.Data ?? [];
      this.INV_NoneTaxOptions = list.map((x: any) => ({
        value: String(x.No),   // No -> value
        label: String(x.Name), // Name -> label
      }));

      // 只在「新增」且目前沒有值時，預設為「否」
      if (
        this.crudstatus === CRUDStatus.Create &&
        !this.dataForm.controls.INV_NoneTax.value
      ) {
        const defaultNo =
          this.INV_NoneTaxOptions.find(o => o.label?.includes('否'))?.value ??
          this.INV_NoneTaxOptions.find(o => o.value === '0')?.value ??
          null;

        if (defaultNo !== null) {
          this.dataForm.controls.INV_NoneTax.setValue(defaultNo, { emitEvent: false });
        }
      }
    });
        this.fin13060Service.queryAPS2002DropDownList().subscribe((res) => {
    const list = res?.Data ?? [];
    this.INV_GUITypeOptions = list.map(x => ({
      value: String(x.No),
      label: String(x.Name),
    }));
  });

  this.updateDisabledState();
}


  /** 從 localStorage.UserInfo 取 mid、SYS_StoreNo（依你的頁面截圖鍵名做容錯） */
  private hydrateStoreInfoFromLocalStorage(): void {
    try {
      const raw = localStorage.getItem('UserInfo');
      if (!raw) return;
      const obj = JSON.parse(raw);

      const mid = Number(obj?.mid ?? obj?.Mid ?? 0);
      const store = String(obj?.SYS_StoreNo ?? obj?.STR_StoreNo ?? obj?.StoreNo ?? '');

      this.dataForm.patchValue({
        mid: isNaN(mid) ? 0 : mid,
        SYS_StoreNo: store || null,
      });
    } catch {
      // ignore
    }
  }

  private toDateOnlyString(d: any): string | null {
    if (!d) return null;
    const date = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(date?.getTime?.())) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  private normalize(v: any): string | null {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    return s === '' ? null : s;
  }

  private updateDisabledState(): void {
    if (this.crudstatus === CRUDStatus.Read) {
      this.dataForm.disable();
      return;
    }
    this.dataForm.enable();
    // mid、SYS_StoreNo 永遠唯讀
    this.dataForm.controls.mid.disable();
    this.dataForm.controls.SYS_StoreNo.disable();
  }

  onSubmit(form: FormGroup<Fin13060CruForm>): void {
    this.handleSubmit(form, () => {
      const raw = form.getRawValue(); // typed 取值

      const payload = {
        mid: Number(raw.mid ?? 0),
        SYS_StoreNo: this.normalize(raw.SYS_StoreNo),

        ECR_No: this.normalize(raw.ECR_No),
        TXN_No: raw.TXN_No != null ? Number(raw.TXN_No) : null,
        TXN_GUIPaper: this.normalize(raw.TXN_GUIPaper),

        INV_NoneTax: this.normalize(raw.INV_NoneTax),
        INV_Cancel: this.normalize(raw.INV_Cancel),

        INV_GUIType: this.normalize(raw.INV_GUIType),
        INV_GUITrack: this.normalize(raw.INV_GUITrack),
        INV_GUINumber: this.normalize(raw.INV_GUINumber),

        TXN_Date: this.toDateOnlyString(raw.TXN_Date),
        INV_DeclareYM: this.normalize(raw.INV_DeclareYM),

        TXN_SaleAmt: raw.TXN_SaleAmt != null ? Number(raw.TXN_SaleAmt) : null,
        TXN_Net: raw.TXN_Net != null ? Number(raw.TXN_Net) : null,
        TXN_Tax: raw.TXN_Tax != null ? Number(raw.TXN_Tax) : null,

        PLU_TaxType: this.normalize(raw.PLU_TaxType),

        Source_Doc_No: this.normalize(raw.Source_Doc_No),
        Voucher_No: this.normalize(raw.Voucher_No),
        SAL_Type: this.normalize(raw.SAL_Type),
        AssetType: this.normalize(raw.AssetType),
        INV_Remark: this.normalize(raw.INV_Remark),
        Tlt_No: this.normalize(raw.Tlt_No),
        Ven_No: this.normalize(raw.Ven_No),
      } as const;

      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        this.fin13060Service.insertFIN13060(payload).subscribe(() => {
          this.messageService.successBubble('新增成功');
          this.dataForm.reset();
          this.hydrateStoreInfoFromLocalStorage();
          this.updateDisabledState();
        });
      } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        const id = form.controls.ID.getRawValue();
        const upd = id != null ? { ...payload, ID: Number(id) } : payload;
        this.fin13060Service.updateFIN13060(upd).subscribe(() => {
          this.messageService.successBubble('更新成功');
          this.onCancel();
        });
      }
    });
  }
}
