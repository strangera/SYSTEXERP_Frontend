import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { FIN13050Service } from '../../../service/api/fin/fin13050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '@shared/service/validation.service';

@Component({
  selector: 'app-fin13050-cru',
  standalone: true,
  templateUrl: './fin13050-cru.component.html',
  styleUrls: ['./fin13050-cru.component.scss'],
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    NgIf,
    TranslateModule,
    CalendarComponent,
  ],
})
export class FIN13050CRUComponent
  extends BasicCruPageComponent<any>
  implements OnInit
{
  @Output() fieldChange = new EventEmitter<any>();

  // 下拉選單
  invoicePurposeOptions = [
    { label: '營業用', value: '營業用' }, // 後端 PUR_DirectType: string（你目前用中文字串，OK）
    { label: '共同使用', value: '共同使用' },
  ];
  PUR_VoucherTypeOptions: any[] = [
    { value: '21', label: '進項三聯式、電子計算機統一發票' },
    { value: '22', label: '進項二聯式收銀機統一發票、載有稅額之其他憑證' },
    { value: '25', label: '進項三聯式收銀機統一發票及一般稅額計算之電子發票' },
    {
      value: '26',
      label: '彙總登錄每張稅額伍佰元以下之進項三聯式、電子計算機統一發票',
    },
    {
      value: '27',
      label:
        '彙總登錄每張稅額伍佰元以下之進項二聯式收銀機統一發票、載有稅額之其他憑證',
    },
    { value: '28', label: '進項海關代徵營業稅繳納證' },
  ];

  deductOptions = [
    { label: '代表進項可扣抵之進貨及費用', value: 'A' },
    { label: '代表進項可扣抵之固定資產', value: 'B' },
    { label: '代表進項不可扣抵之進貨及費用', value: 'C' },
    { label: '代表進項不可扣抵之固定資產', value: 'D' },
  ];

  typeOptions = [
    { label: '進貨及費用', value: 'E' },
    { label: '固定資產', value: 'F' },
  ];

  taxTypeOptions = [
    { label: '免稅', value: '0' },
    { label: '應稅', value: '1' },
    { label: '零稅', value: '2' },
  ];

  constructor(
    private fin13050Service: FIN13050Service,
    private validationService: ValidationService,
  ) {
    super();
  }

  /**
   * dataForm 完全比照 insertFIN13050Request 欄位命名
   * - 其中 mid / STO_No / PUR_Uniform 由系統自動帶入，不顯示在 UI
   * - 必填規則：實務上至少需要發票格式、日期、申報年月、金額群（總/未稅/稅）、課稅別
   */
  dataForm = this.formBuilder.group({
    // 系統欄位（不顯示；由 localStorage.UserInfo 帶）
    id: [{ value: null, disabled: true }], // 新增：後端主鍵
    mid: [0], // 商場編號 number($double)
    STO_No: [''], // 分店編號 string（nullable）
    PUR_Uniform: [''], // 自家統一編號 string（nullable）

    // 其他可選系統欄位（先給預設/空值）
    ACP_Type: [''], // 應付帳款類型 string（nullable）
    PUR_GUIStatus: [''], // 發票狀態 string（nullable）
    PUR_GUIBalance: [0], // 已沖金額 number($double)
    PUR_SeqNo: [0], // 項次 number($double)

    // ====== 使用者輸入區（同名對應） ======
    PUR_VoucherType: ['', Validators.required], // 發票格式 string
    PUR_GUITrack: [''], // 字軌 string（nullable）
    PUR_GUINo: [''], // 發票號碼 string（nullable）

    // 日期類：畫面使用 Calendar，送出時轉 ISO 字串
    PUR_GUIDate: [null as any, Validators.required], // 發票日期 string($date-time)

    // 年月類：用 dateMonthOne（yyyyMM），送出時維持字串（例如 "202509"）
    PUR_RepYYYYMM: [
      null,
      [
        this.validationService.oddMonthValidator,
        this.validationService.minMonthValidator,
      ],
    ],

    // 供應商資訊
    PUR_VenNo: [''], // 廠商編號 string（nullable）
    PUR_VenName: [''], // 廠商名稱 string（nullable）
    PUR_VenUniform: [''], // 廠商統一編號 string（nullable）

    // 金額
    PUR_Amt: [null as any, Validators.required], // 發票總金額 number($double)
    PUR_Net: [null as any, Validators.required], // 發票未稅金額 number($double)
    PUR_Tax: [null as any, Validators.required], // 發票稅額 number($double)

    // 其他屬性
    PUR_DirectType: [''], // 發票用途 string（nullable）
    PUR_TaxType: ['', Validators.required], // 課稅別 string（nullable）
    PUR_DiscNo: [''], // 扣抵代號 string（nullable）
    PUR_Type: [''], // 類別區分 string（nullable）

    // 單號/系統別/備註
    Source_Doc_No: [''], // 憑證單號 string（nullable）
    Voucher_No: [''], // 傳票號碼 string（nullable）
    SAL_Type: [''], // 系統別 string（nullable）
    PUR_Remark: [''], // 備註 string（nullable）
  });

ngOnInit(): void {
  this.initializePage('FIN13050', this.dataForm);

  const u = this.getUserInfo();
  this.dataForm.patchValue({
    mid: Number(u?.mid) || 0,
    STO_No: u?.SYS_StoreNo ?? '',
    PUR_Uniform: u?.STR_Uniform ?? '',
  });

  // 將畫面上的 PUR_GUINo 去掉字軌
  const track = this.dataForm.get('PUR_GUITrack')?.value;
  const no = this.dataForm.get('PUR_GUINo')?.value;
  const trimmed = this.stripGuiTrackFromNo(track, no);
  if (trimmed !== null && trimmed !== no) {
    this.dataForm.patchValue({ PUR_GUINo: trimmed });
  }

  this.updateDisabledState();
}

  /** 依 CRUD 狀態切換欄位啟用/停用 */
  private updateDisabledState(): void {
    if (this.crudstatus === CRUDStatus.Edit) {
      const editable = [
        'PUR_GUIDate',
        'PUR_RepYYYYMM',
        'PUR_Tax',
        'Voucher_No',
        'PUR_Remark',
      ];
      Object.keys(this.dataForm.controls).forEach((k) => {
        if (k === 'id') return this.dataForm.get(k)?.disable();
        editable.includes(k)
          ? this.dataForm.get(k)?.enable()
          : this.dataForm.get(k)?.disable();
      });
    } else if (this.crudstatus === CRUDStatus.Read) {
      this.dataForm.disable();
    } else {
      this.dataForm.enable();
      this.dataForm.get('id')?.disable(); // 新增模式也禁用 id
    }
  }

  /** 送出：直接依照同名欄位組 payload，日期與數值做型別處理 */
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const fv = form.getRawValue(); // 會包含 disabled 欄位
      const u = this.getUserInfo();
      const cleanGuiNo = this.stripGuiTrackFromNo(
        fv.PUR_GUITrack,
        fv.PUR_GUINo,
      );
      const payload = {
        // 系統欄位以 UserInfo 優先（避免被使用者改動）
        mid: Number(u?.mid) || Number(fv.mid) || 0,
        STO_No: u?.SYS_StoreNo ?? fv.STO_No ?? null,
        PUR_Uniform: u?.STR_Uniform ?? fv.PUR_Uniform ?? null,

        // 其他（沿用表單值；必要時做型別轉換）
        ACP_Type: fv.ACP_Type ?? null,
        PUR_GUIStatus: fv.PUR_GUIStatus ?? null,
        PUR_GUIBalance:
          fv.PUR_GUIBalance != null ? Number(fv.PUR_GUIBalance) : 0,
        PUR_SeqNo: fv.PUR_SeqNo != null ? Number(fv.PUR_SeqNo) : 0,

        PUR_VoucherType: fv.PUR_VoucherType ?? null,
        PUR_GUITrack: fv.PUR_GUITrack ?? null,
        PUR_GUINo: cleanGuiNo,
        PUR_GUIDate: fv.PUR_GUIDate
          ? new Date(fv.PUR_GUIDate).toISOString()
          : null,
          PUR_RepYYYYMM: this.toYYYYMM(fv.PUR_RepYYYYMM),  // 👈 一律轉成 6 

        PUR_VenNo: fv.PUR_VenNo ?? null,
        PUR_VenName: fv.PUR_VenName ?? null,
        PUR_VenUniform: fv.PUR_VenUniform ?? null,

        PUR_Amt: fv.PUR_Amt != null ? Number(fv.PUR_Amt) : 0,
        PUR_Net: fv.PUR_Net != null ? Number(fv.PUR_Net) : 0,
        PUR_Tax: fv.PUR_Tax != null ? Number(fv.PUR_Tax) : 0,

        PUR_DirectType: fv.PUR_DirectType ?? null,
        PUR_TaxType: fv.PUR_TaxType ?? null,
        PUR_DiscNo: fv.PUR_DiscNo ?? null,
        PUR_Type: fv.PUR_Type ?? null,

        Source_Doc_No: fv.Source_Doc_No ?? null,
        Voucher_No: fv.Voucher_No ?? null,
        SAL_Type: fv.SAL_Type ?? null,
        PUR_Remark: fv.PUR_Remark ?? null,
        id: fv.id ?? this.rowdata?.id ?? null,
      };
 if (payload.PUR_RepYYYYMM) {
      payload.PUR_RepYYYYMM = this.toYYYYMM(payload.PUR_RepYYYYMM);
    }
      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        const { id, ...forInsert } = payload;
        this.fin13050Service.insertFIN13050(payload).subscribe(() => {
          this.messageService.successBubble('新增成功');
          this.dataForm.reset();
          // 重帶系統欄位
          const uu = this.getUserInfo();
          this.dataForm.patchValue({
            mid: Number(uu?.mid) || 0,
            STO_No: uu?.SYS_StoreNo ?? '',
            PUR_Uniform: uu?.STR_Uniform ?? '',
          });
          this.updateDisabledState();
        });
      } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        this.fin13050Service.updateFIN13050(payload).subscribe(() => {
          this.messageService.successBubble('更新成功');
          this.onCancel();
        });
      }
    });
  }

  // 讀取本機使用者資訊
  private getUserInfo(): any {
    try {
      const raw = localStorage.getItem('UserInfo');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
  /** 把 Date / ISO 字串 / 'YYYY-MM' / 'YYYY/MM' / 'YYYYMM' 轉成 'YYYYMM' */
 
  // ✅ 接受 null / undefined，回傳 string | null
private stripGuiTrackFromNo(
  guiTrack: string | null | undefined,
  guiNo: string | null | undefined
): string | null {
  const no = (guiNo ?? '').toString().trim();
  if (!no) return null;

  const track = (guiTrack ?? '').toString().trim();
  if (track && no.toUpperCase().startsWith(track.toUpperCase())) {
    const rest = no.substring(track.length);
    return rest || null; // 避免回傳空字串
  }

  const rest = no.replace(/^[A-Za-z]{2}/, '');
  return rest || null;
}
/** 把 Date / ISO 字串 / 'YYYY-MM' / 'YYYY/MM' / 'YYYYMM' / 'YYYYMMDD' 統一成 'YYYYMM' */
private toYYYYMM(input: any): string | null {
  if (!input && input !== 0) return null;

  // Date 物件
  if (input instanceof Date && !isNaN(input.getTime())) {
    const yyyy = input.getFullYear();
    const mm = String(input.getMonth() + 1).padStart(2, '0');
    return `${yyyy}${mm}`;
  }

  // 轉字串 → 去掉所有非數字 → 只留前 6 碼
  const digits = String(input).replace(/\D/g, ''); // 例如 '202506/01' → '20250601'
  if (digits.length >= 6) return digits.slice(0, 6);
  return null;
}

}
