/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';

import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import {
  ApiResponse,
  Aps1002DropdownItem,
  FIN64010DetailRow,
  Fin64010Service,
  FIN64010InsertRequest,
  FIN64010UpdateRequest,
} from '../../../service/api/fin/fin64010.service';

import { Fin26010Service } from '../../../service/api/fin/fin26010.service';

@UntilDestroy()
@Component({
  selector: 'app-fin64010-cru',
  templateUrl: './fin64010-cru.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PanelModule,

    MenubarComponent,
    ButtonComponent,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
  ],
})
export class FIN64010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  CRUDStatus = CRUDStatus;

  /** 是否可編輯：拋轉 / 兌現 / 退票 => false */
  isEditable = true;

  // 下拉
  vendorOptions: any[] = [];
  bankNoOptions: any[] = [];      // 全省銀行代號（票面銀行 BNK_Key）
  colleBankOptions: any[] = [];   // 託收銀行代號（若你仍要顯示）
  colBankAccOptions: any[] = [];  // 託收帳戶（COL_BNK_id）
  orgOptions: any[] = [];
  projectOptions: any[] = [];

  chkTypeOptions = [
    { value: '1', label: '支票' },
    { value: '2', label: '本票' },
    { value: '3', label: '匯票' },
  ];

  ticketYNOptions = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
  ];

  chkStatusOptions = [
    { value: '0', label: '作廢' },
    { value: '1', label: '未異動' },
    { value: '2', label: '託收' },
    { value: '3', label: '兌現' },
    { value: '4', label: '撤票' },
    { value: '5', label: '退票' },
    { value: 'R', label: '僅記錄' },
  ];

  /** ✅ 對齊後端 updateFIN64010Request 必填 */
  dataForm = this.formBuilder.group({
    Id: [null as number | null, Validators.required],
    mid: ['' as string],

    CHK_No: ['' as string, Validators.required],
    VEN_No: ['' as string, Validators.required],

    // ✅ 後端要 BNK_Key
    BNK_Key: ['' as string, Validators.required],

    // ✅ 後端要 BNK_AccNo（票據上的帳號）
    BNK_AccNo: ['' as string, Validators.required],

    // ✅ 後端要 COL_BNK_id（託收帳戶）
    COL_BNK_id: ['' as string, Validators.required],

    CHK_ColleDate: [null as Date | null],
    CHK_BNK_No: ['' as string], // 顯示用：託收銀行代號(非後端必填)

    CHK_ReceDate: [null as Date | null, Validators.required],
    Sales_Id: ['' as string],
    RCV_No: ['' as string],

    CHK_ExpireDate: [null as Date | null, Validators.required],
    CHK_PreDate: [null as Date | null],
    CHK_CashDate: [null as Date | null],

    CHK_Amt: [null as any, Validators.required],

    Ticket_YN: ['' as string],
    CHK_Type: ['' as string],
    CHK_Comment: ['' as string],

    ORG_ID: ['' as string],
    ProjectNo: ['' as string],

    CHK_Status: ['' as string, Validators.required],
    TranStatus: ['' as string],
    // 顯示用
    Tran_Status: ['' as string],
    AccName: ['' as string],
    VouNo: ['' as string],
    ObjectType: ['' as string],
    ObjectKey: ['' as string],
    Tran_Status_Name: ['' as string],
  });

  constructor(
    private fin64010Service: Fin64010Service,
    private dropDownListService: DropDownListService,
    private dropdownApiService: DropdownApiService,
    private fin26010Service: Fin26010Service,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN64010', this.dataForm);

    if (this.crudstatus === CRUDStatus.Create) {
      this.setupCreateDefaults();
    } else {
      // ✅ 先補 Id（避免 raw.Id 是 null）
      const routeId = this.getRouteId();
      const listRow: any = (history as any)?.state?.rowdata;
      const stateId = Number(listRow?.ID ?? listRow?.Id ?? listRow?.id);

      const finalId = routeId ?? (Number.isFinite(stateId) && stateId > 0 ? stateId : null);
      if (finalId) {
        this.dataForm.get('Id')?.setValue(finalId, { emitEvent: false });
      }

      this.patchFromListRowIfNeeded();
    }
    // 1) 廠客
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const rows = Array.isArray(res?.Data) ? res.Data : [];
        this.vendorOptions = rows.map((x: any) => ({
          label: `${x.VEN_No} - ${x.Name}`,
          value: x.VEN_No,
        }));
      });

    // 2) 組織
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const rows = Array.isArray(res?.Data) ? res.Data : [];
        this.orgOptions = rows.map((x: any) => ({
          label: `${x.No} - ${x.Name}`,
          value: x.No,
        }));
      });

    // 3) 活動
    this.dropDownListService.queryTALPORDERM_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const rows = Array.isArray(res?.Data) ? res.Data : [];
        this.projectOptions = rows.map((x: any) => ({
          label: `${x.No} - ${x.Name}`,
          value: x.No,
        }));
      });

    // 4) 票面銀行(全省銀行代號) → BNK_Key
    //    queryAps1001 已回傳 Option[]（value = BNK_No+BNK_BranchNo 7碼），直接使用
    this.dropdownApiService.queryAps1001({ SearchKeyword: '' })
      .pipe(untilDestroyed(this))
      .subscribe((options) => {
        this.bankNoOptions = options ?? [];
        this.colleBankOptions = options ?? [];
      });

    // 5) 託收帳戶（COL_BNK_id）
    //    ⚠️ 這裡我用 APS1002 下拉：value 用 BNK_DepositAccNo
    //    如果你後端 COL_BNK_id 其實要 APS1002 的 id，請把 value 改成 x.id



    this.fin64010Service.queryAPS1002_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<Aps1002DropdownItem[]>) => {
          const list = Array.isArray(res?.Data) ? res.Data : [];

          this.colBankAccOptions = list
            .filter((x: any) => {
              const accType = String(x?.BNK_AccType ?? '').trim();
              const bnkId = String(x?.BNK_id ?? '').trim();
              const depositAccNo = String(x?.BNK_DepositAccNo ?? '').trim();

              return (
                accType !== '1' &&
                !!bnkId &&
                !!depositAccNo
              );
            })
            .map((x: any) => ({
              label: `${x.BNK_id} - ${x.BNK_DepositAccNo} - ${x.ACCCNAME ?? ''}`,
              value: String(x.BNK_id).trim(),
              raw: x,
            }));

        },
        error: () => {
          this.colBankAccOptions = [];
        },
      });


    // ✅ 最後載明細（避免 patch 時 options 未就緒）；新增模式沒有明細可載，直接套用鎖定規則
    if (this.crudstatus === CRUDStatus.Create) {
      this.applyReadonlyRules();
    } else {
      this.loadDetailByRoute();
    }
  }

  /** 新增模式：收票日預設今天、收票業務員帶入登入者且鎖定、票據狀態鎖定為 R(僅記錄) */
  private setupCreateDefaults(): void {
    this.dataForm.get('Id')?.clearValidators();
    this.dataForm.get('Id')?.updateValueAndValidity({ emitEvent: false });

    const user = this.authService.currentUserValue;
    this.dataForm.patchValue({
      CHK_ReceDate: new Date(),
      Sales_Id: user?.user_No ?? '',
      CHK_Status: 'R',
    }, { emitEvent: false });

    this.dataForm.get('CHK_Status')?.disable({ emitEvent: false });

    // 自行新增(狀態R僅記錄)不會走託收/兌現流程，SP_FIN64010Insert 也沒有這兩個參數，鎖住避免使用者誤填卻沒被儲存
    this.dataForm.get('CHK_ColleDate')?.disable({ emitEvent: false });
    this.dataForm.get('CHK_CashDate')?.disable({ emitEvent: false });
  }

  private normalizeDetailRow(res: any): FIN64010DetailRow | null {
    const row = res?.Data?.QueryData ?? null;
    return (row?.CHK_No || row?.BNK_No || row?.VEN_No || row?.CHK_Amt != null)
      ? (row as FIN64010DetailRow)
      : null;
  }

  private loadDetailByRoute(): void {
    const routeId = this.getRouteId();
    const listRow: any = (history as any)?.state?.rowdata;
    const stateId = Number(listRow?.ID ?? listRow?.Id ?? listRow?.id);

    const id = routeId ?? (Number.isFinite(stateId) && stateId > 0 ? stateId : null);
    if (!id) {
      console.warn('[FIN64010] missing Id (route/state both empty)');
      this.applyReadonlyRules();
      return;
    }

    this.loading = true;

    this.fin64010Service.queryFIN64010Detail({ Id: id })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          const row = this.normalizeDetailRow(res);
          if (!row) {
            this.applyReadonlyRules();
            this.loading = false;
            this.cdr.detectChanges();
            return;
          }

          this.dataForm.patchValue({
            Id:           Number((row as any)?.ID ?? (row as any)?.Id ?? (row as any)?.id ?? id),
            CHK_No:       String(row.CHK_No ?? ''),
            VEN_No:       String(row.VEN_No ?? ''),
            BNK_Key:      String(row.BNK_No ?? ''),   // SP 回傳 BNK_No = BNK_No+BNK_BranchNo（7碼，修 SP 後正確）
            BNK_AccNo:    String(row.BNK_AccNo ?? ''),
            COL_BNK_id:   String(row.CHK_BNK_No ?? ''),
            CHK_ReceDate:  row.CHK_ReceDate  ? new Date(row.CHK_ReceDate)  : null,
            CHK_ExpireDate: row.CHK_ExpireDate ? new Date(row.CHK_ExpireDate) : null,
            CHK_PreDate:   row.CHK_PreDate   ? new Date(row.CHK_PreDate)   : null,
            CHK_CashDate:  row.CHK_CashDate  ? new Date(row.CHK_CashDate)  : null,
            CHK_ColleDate: row.CHK_ColleDate ? new Date(row.CHK_ColleDate) : null,
            CHK_Amt:      row.CHK_Amt ?? null,
            Ticket_YN:    String(row.Ticket_YN ?? ''),
            CHK_Type:     String(row.CHK_Type ?? ''),
            CHK_Comment:  String(row.CHK_Comment ?? ''),
            ORG_ID:       String(row.ORG_ID ?? ''),
            ProjectNo:    String(row.ProjectNo ?? ''),
            RCV_No:       String(row.RCV_No ?? ''),
            CHK_Status:   String(row.CHK_Status ?? ''),
            TranStatus:   String(row.Tran_Status ?? ''),
            AccName:      String(row.AccName ?? ''),
            VouNo:        String(row.VouNo ?? ''),
          }, { emitEvent: false });

          this.applyReadonlyRules();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('FIN64010 detail error:', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }
  tranStatusOptions = [
    { value: '0', label: '建立' },
    { value: '1', label: '確認' },
    { value: '2', label: '拋轉' },
  ];

  private applyReadonlyRules(): void {
    const tran = String(this.dataForm.controls.TranStatus.value ?? '');
    const chk = String(this.dataForm.controls.CHK_Status.value ?? '');

    // 依規格：拋轉(2) / 兌現(3) / 退票(5) 不可改
    this.isEditable = !(tran === '2' || chk === '3' || chk === '5');

    // 顯示用欄位 disable
    ['TranStatus', 'AccName', 'VouNo', 'ObjectType', 'ObjectKey']
      .forEach(k => this.dataForm.get(k)?.disable({ emitEvent: false }));

    if (this.crudstatus === CRUDStatus.Read) {
      this.dataForm.disable({ emitEvent: false });
      return;
    }
    if (!this.isEditable) {
      this.dataForm.disable({ emitEvent: false });
      return;
    }

    // Id/mid 不可改
    this.dataForm.get('Id')?.disable({ emitEvent: false });
    this.dataForm.get('mid')?.disable({ emitEvent: false });
  }

  private toYmd(d: Date | string | null | undefined): string | null {
    if (!d) return null;
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt.getTime())) return null;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  onSubmit(_frm: any): void {
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
      return;
    }

    if (this.crudstatus === CRUDStatus.Create) {
      this.submitCreate();
      return;
    }

    if (!this.isEditable) return;

    const raw = this.dataForm.getRawValue();

    // ✅ 安全取 Id（避免 Number(null)=0）
    const idVal = this.dataForm.get('Id')?.value ?? this.getRouteId();
    const id = Number(idVal);
    if (!Number.isFinite(id) || id <= 0) {
      console.warn('[FIN64010] submit blocked: invalid Id', idVal, raw);
      return;
    }

    // 狀態=託收/兌現/退票 時日期必填（對齊後端 controller）
    const chkStatus = String(raw.CHK_Status ?? '');
    if (chkStatus === '2' && !raw.CHK_ColleDate) return;
    if (chkStatus === '3' && !raw.CHK_CashDate) return;
    if (chkStatus === '5' && !(raw as any)?.CHK_BackDate) {
      // 你表單目前沒放 CHK_BackDate 欄位，若要退票流程，請加上
      // 這裡先不擋死，避免你暫時沒做退票日 UI
    }

    // ✅ 依後端 updateFIN64010Request 組 payload
    const payload: FIN64010UpdateRequest = {
      Id: Number(raw.Id),

      BNK_Key: String(raw.BNK_Key ?? '').trim(),
      BNK_AccNo: String(raw.BNK_AccNo ?? '').trim(),
      COL_BNK_id: String(raw.COL_BNK_id ?? '').trim(),

      CHK_No: String(raw.CHK_No ?? '').trim(),
      VEN_No: String(raw.VEN_No ?? '').trim(),

      CHK_Amt: Number(raw.CHK_Amt),

      CHK_ReceDate: this.toYmd(raw.CHK_ReceDate) ?? '',
      CHK_ExpireDate: this.toYmd(raw.CHK_ExpireDate) ?? '',

      CHK_Status: String(raw.CHK_Status ?? '').trim(),

      // optional
      CHK_PreDate: this.toYmd(raw.CHK_PreDate),
      CHK_ColleDate: this.toYmd(raw.CHK_ColleDate),
      CHK_CashDate: this.toYmd(raw.CHK_CashDate),

      Ticket_YN: raw.Ticket_YN ? String(raw.Ticket_YN) : null,
      CHK_Type: raw.CHK_Type ? String(raw.CHK_Type) : null,
      CHK_Comment: raw.CHK_Comment ? String(raw.CHK_Comment) : null,

      ORG_ID: raw.ORG_ID ? String(raw.ORG_ID) : null,
      ProjectNo: raw.ProjectNo ? String(raw.ProjectNo) : null,
      RCV_No: raw.RCV_No ? String(raw.RCV_No) : null,
    };

    this.loading = true;

    this.fin64010Service.updateFIN64010(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (_res: ApiResponse<any>) => this.onCancel(),
        error: (err: any) => {
          console.error('FIN64010 update error:', err);
          this.loading = false;
          this.cdr.detectChanges();
        },
        complete: () => {
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  /** 新增模式送出：狀態固定為 R(僅記錄)；mid/STO_No/建立人由後端依登入 Token 帶入 */
  private submitCreate(): void {
    const raw = this.dataForm.getRawValue();

    const payload: FIN64010InsertRequest = {
      BNK_Key: String(raw.BNK_Key ?? '').trim(),
      BNK_AccNo: String(raw.BNK_AccNo ?? '').trim(),
      COL_BNK_id: String(raw.COL_BNK_id ?? '').trim(),

      CHK_No: String(raw.CHK_No ?? '').trim(),
      VEN_No: String(raw.VEN_No ?? '').trim(),

      CHK_Amt: Number(raw.CHK_Amt),

      CHK_ReceDate: this.toYmd(raw.CHK_ReceDate) ?? '',
      CHK_ExpireDate: this.toYmd(raw.CHK_ExpireDate) ?? '',

      CHK_PreDate: this.toYmd(raw.CHK_PreDate),

      Ticket_YN: raw.Ticket_YN ? String(raw.Ticket_YN) : null,
      CHK_Type: raw.CHK_Type ? String(raw.CHK_Type) : null,
      CHK_Comment: raw.CHK_Comment ? String(raw.CHK_Comment) : null,

      ORG_ID: raw.ORG_ID ? String(raw.ORG_ID) : null,
      ProjectNo: raw.ProjectNo ? String(raw.ProjectNo) : null,
      RCV_No: raw.RCV_No ? String(raw.RCV_No) : null,
    };

    this.loading = true;

    this.fin64010Service.insertFIN64010(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (_res: ApiResponse<boolean>) => this.onCancel(),
        error: (err: any) => {
          console.error('FIN64010 insert error:', err);
          this.loading = false;
          this.cdr.detectChanges();
        },
        complete: () => {
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private patchFromListRowIfNeeded(): void {
    const listRow: any = (history as any)?.state?.rowdata;
    if (!listRow) return;

    // 只在「目前表單還是空」時才補（避免覆蓋使用者已輸入的內容）
    const curBank = String(this.dataForm.controls.BNK_Key.value ?? '').trim();
    if (!curBank) {
      const bnkNo = String(listRow.BNK_No ?? '').trim();
      const bnkBranch = String(listRow.BNK_BranchNo ?? '').trim();
      const bnk = String(listRow.BNK_Key ?? (bnkBranch ? bnkNo + bnkBranch : bnkNo)).trim();
      if (bnk) this.dataForm.controls.BNK_Key.patchValue(bnk, { emitEvent: false });
    }

    const curVen = String(this.dataForm.controls.VEN_No.value ?? '').trim();
    if (!curVen) {
      const ven = String(listRow.VEN_No ?? '').trim();
      if (ven) this.dataForm.controls.VEN_No.patchValue(ven, { emitEvent: false });
    }
    const curTran = String(this.dataForm.controls.TranStatus.value ?? '').trim();
    if (!curTran) {
      const tran = String(listRow.Tran_Status ?? listRow.TranStatus ?? '').trim();
      if (tran) this.dataForm.controls.TranStatus.patchValue(tran, { emitEvent: false });
    }
    const curChk = String(this.dataForm.controls.CHK_No.value ?? '').trim();
    if (!curChk) {
      const chk = String(listRow.CheckNo ?? listRow.CHK_No ?? '').trim();
      if (chk) this.dataForm.controls.CHK_No.patchValue(chk, { emitEvent: false });
    }
  }
  private getRouteId(): number | null {
    const qp = this.activatedRoute.snapshot.queryParamMap;
    const v = qp.get('Id') || qp.get('ID') || qp.get('id'); // ✅ 同時支援
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  override onCancel(): void {
    this.router.navigate(['/account/fin', 'fin64010'], {
      state: { fromCru: true },
    });
  }
}
