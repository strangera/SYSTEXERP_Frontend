/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';

// CRU base
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import {
  ApiResponse,
  Fin64010Service,
  FIN64010DetailRow,
  FIN64010UpdateRequest,
} from '../../../service/api/fin/fin64010.service';

@UntilDestroy()
@Component({
  selector: 'app-fin64010cru',
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

  /** 是否可編輯：已拋轉/已兌現/已退票 => false */
  isEditable = true;

  // 下拉
  vendorOptions: any[] = [];
  bankKeyOptions: any[] = [];      // BNK_Key = BNK_No+BNK_BranchNo（單選必填）
  colleAccountOptions: any[] = []; // 託收帳戶 APS1002.BNK_id（非支票存款）
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
  ];

  dataForm = this.formBuilder.group({
    id: [null as number | null, Validators.required],

    // 必填
    BNK_Key: ['' as string, Validators.required],
    BNK_AccNo: ['' as string, Validators.required],
    CHK_No: ['' as string, Validators.required],
    CHK_Amt: [null as any, Validators.required],
    CHK_ExpireDate: [null as Date | null, Validators.required],
    CHK_ReceDate: [null as Date | null, Validators.required],
    VEN_No: ['' as string, Validators.required],
    CHK_Status: ['' as string, Validators.required],
    COL_BNK_id: ['' as string, Validators.required],

    // optional
    CHK_Type: ['' as string],
    Ticket_YN: ['' as string],
    CHK_Comment: ['' as string],
    ORG_ID: ['' as string],
    ProjectNo: ['' as string],
    RCV_No: ['' as string],
    CHK_PreDate: [null as Date | null],

    // 狀態日期
    CHK_ColleDate: [null as Date | null],
    CHK_CashDate: [null as Date | null],
    CHK_BackDate: [null as Date | null],

    // 顯示用(多為只讀)
    VEN_Name: ['' as string],
    BNK_Name: ['' as string],
    BNK_BranchName: ['' as string],
    CHK_BNK_AccName: ['' as string],

    Tran_Status: ['' as string],
    Tran_Status_Name: ['' as string],
    CHK_Status_Name: ['' as string],
    VouNo: ['' as string],
  });

  constructor(
    private fin64010Service: Fin64010Service,
    private dropDownListService: DropDownListService,
    private dropdownApiService: DropdownApiService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN64010', this.dataForm);

    // 下拉：廠客
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const rows = Array.isArray(res?.Data) ? res.Data : [];
        this.vendorOptions = rows.map((x: any) => ({
          label: `${x.No} - ${x.Name}`,
          value: x.No,
        }));
      });

    // 下拉：組織
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.orgOptions = (res?.Data ?? []).map((x: any) => ({
          label: `${x.No} - ${x.Name}`,
          value: x.No,
        }));
      });

    // 下拉：活動
    this.dropDownListService.queryTALPORDERM_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const rows = Array.isArray(res?.Data) ? res.Data : [];
        this.projectOptions = rows.map((x: any) => ({
          label: `${x.No} - ${x.Name}`,
          value: x.No,
        }));
      });

    /**
     * 下拉：銀行代號(全省銀行代號) BNK_Key
     * TODO: 依你實際 API 名稱替換
     */
    if ((this.dropdownApiService as any)?.queryAPS1004_BankKey_DropDownList) {
      (this.dropdownApiService as any).queryAPS1004_BankKey_DropDownList()
        .pipe(untilDestroyed(this))
        .subscribe((res: any) => {
          const rows = Array.isArray(res?.Data) ? res.Data : [];
          this.bankKeyOptions = rows.map((x: any) => ({
            value: String(x.BNK_Key ?? x.No ?? ''),
            label: String(x.Name ?? `${x.BNK_Key ?? ''} - ${x.BNK_Name ?? ''} ${x.BNK_BranchName ?? ''}`),
            raw: x,
          })).filter((x: any) => x.value);
        });
    }

    /**
     * 下拉：託收帳戶(APS1002.BNK_id)，且必須 BNK_AccType <> '1'
     * TODO: 依你實際 API 名稱替換
     */
    if ((this.dropdownApiService as any)?.queryAPS1002_ColleAccount_DropDownList) {
      (this.dropdownApiService as any).queryAPS1002_ColleAccount_DropDownList()
        .pipe(untilDestroyed(this))
        .subscribe((res: any) => {
          const rows = Array.isArray(res?.Data) ? res.Data : [];
          const filtered = rows.filter((x: any) => String(x.BNK_AccType ?? '') !== '1');
          this.colleAccountOptions = filtered.map((x: any) => ({
            value: String(x.BNK_id ?? x.No ?? ''),
            label: `${x.BNK_DepositAccNo ?? ''} - ${x.BNK_AccName ?? ''}`,
            raw: x,
          })).filter((x: any) => x.value);
        });
    }

    // 狀態自動帶：有託收日=>狀態2，無託收日=>狀態1
    this.dataForm.controls.CHK_ColleDate.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(d => {
        if (this.crudstatus === CRUDStatus.Edit || this.crudstatus === CRUDStatus.Create) {
          const cur = String(this.dataForm.controls.CHK_Status.value ?? '');
          if (d && (!cur || cur === '1')) this.dataForm.patchValue({ CHK_Status: '2' }, { emitEvent: false });
          if (!d && cur === '2') this.dataForm.patchValue({ CHK_Status: '1' }, { emitEvent: false });
        }
      });

    // 讀取 detail（Edit/Read 都會進）
    this.loadDetailByRoute();
  }

  private loadDetailByRoute(): void {
    // ✅ 修正：base 是 activatedRoute，不是 route
    const id = Number(this.activatedRoute.snapshot.queryParamMap.get('Id'));
    if (!Number.isFinite(id)) return;

    const compNo = this.activatedRoute.snapshot.queryParamMap.get('CompNo') ?? undefined;

    this.loading = true;
    this.fin64010Service.queryFIN64010Detail({ Id: id, CompNo: compNo })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          const row: FIN64010DetailRow = res?.Data as any;

          const bnkKey = String((row as any)?.BNK_No ?? (row as any)?.BNK_Key ?? '');

          this.dataForm.patchValue({
            id: (row as any)?.id ?? id,

            BNK_Key: bnkKey,
            BNK_AccNo: (row as any)?.BNK_AccNo ?? '',
            CHK_No: (row as any)?.CHK_No ?? '',
            CHK_Amt: (row as any)?.CHK_Amt ?? null,
            CHK_ExpireDate: (row as any)?.CHK_ExpireDate ? new Date((row as any).CHK_ExpireDate) : null,
            CHK_ReceDate: (row as any)?.CHK_ReceDate ? new Date((row as any).CHK_ReceDate) : null,
            VEN_No: (row as any)?.VEN_No ?? '',
            CHK_Status: (row as any)?.CHK_Status ?? '',

            CHK_Type: (row as any)?.CHK_Type ?? '',
            Ticket_YN: (row as any)?.Ticket_YN ?? '',
            CHK_Comment: (row as any)?.CHK_Comment ?? '',
            ORG_ID: (row as any)?.ORG_ID ?? '',
            ProjectNo: (row as any)?.ProjectNo ?? '',
            RCV_No: (row as any)?.RCV_No ?? '',
            CHK_PreDate: (row as any)?.CHK_PreDate ? new Date((row as any).CHK_PreDate) : null,

            CHK_ColleDate: (row as any)?.CHK_ColleDate ? new Date((row as any).CHK_ColleDate) : null,
            CHK_CashDate: (row as any)?.CHK_CashDate ? new Date((row as any).CHK_CashDate) : null,
            CHK_BackDate: (row as any)?.CHK_BackDate ? new Date((row as any).CHK_BackDate) : null,

            VEN_Name: (row as any)?.VEN_Name ?? '',
            BNK_Name: (row as any)?.BNK_Name ?? '',
            BNK_BranchName: (row as any)?.BNK_BranchName ?? '',
            CHK_BNK_AccName: (row as any)?.CHK_BNK_AccName ?? '',

            Tran_Status: (row as any)?.Tran_Status ?? '',
            Tran_Status_Name: (row as any)?.Tran_Status_Name ?? '',
            CHK_Status_Name: (row as any)?.CHK_Status_Name ?? '',
            VouNo: (row as any)?.VouNo ?? '',
          }, { emitEvent: false });

          // 託收帳戶先不回填（因 detail 不一定回 BNK_id）
          this.dataForm.patchValue({ COL_BNK_id: '' }, { emitEvent: false });

          this.applyReadonlyRules();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('FIN64010 detail error:', err);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private applyReadonlyRules(): void {
    const tran = String(this.dataForm.controls.Tran_Status.value ?? '');
    const chk = String(this.dataForm.controls.CHK_Status.value ?? '');
    this.isEditable = !(tran === '2' || chk === '3' || chk === '5');

    const readonlyFields = [
      'VEN_Name', 'BNK_Name', 'BNK_BranchName', 'CHK_BNK_AccName',
      'Tran_Status_Name', 'CHK_Status_Name', 'VouNo',
    ];
    readonlyFields.forEach((k) => this.dataForm.get(k)?.disable({ emitEvent: false }));

    if (this.crudstatus === CRUDStatus.Read) {
      this.dataForm.disable({ emitEvent: false });
      return;
    }

    if (!this.isEditable) {
      this.dataForm.disable({ emitEvent: false });
      return;
    }

    this.dataForm.get('id')?.disable({ emitEvent: false });
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

  onSubmit(frm: any): void {
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.dataForm.markAllAsTouched();
      return;
    }

    if (!this.isEditable) return;

    const chkStatus = String(this.dataForm.value.CHK_Status ?? '');
    const colleDate = this.dataForm.value.CHK_ColleDate;
    const cashDate = this.dataForm.value.CHK_CashDate;
    const backDate = this.dataForm.value.CHK_BackDate;

    if (chkStatus === '2' && !colleDate) return;
    if (chkStatus === '3' && !cashDate) return;
    if (chkStatus === '5' && !backDate) return;

    // ✅ 你 base 裡有 user: UserInfo
    const updUserNo = (this.user as any)?.USR_No ?? (this.user as any)?.UserNo ?? '';
    const updUserName = (this.user as any)?.USR_Name ?? (this.user as any)?.UserName ?? '';

    if (!updUserNo || !updUserName) {
      this.messageService?.warnBubble?.('找不到使用者資訊(UPD_USR_No/Name)，請確認 AuthService currentUserValue 欄位。');
      return;
    }

    const raw = this.dataForm.getRawValue();
    const payload: FIN64010UpdateRequest = {
      Id: Number(raw.id),

      BNK_Key: String(raw.BNK_Key ?? '').trim(),
      BNK_AccNo: String(raw.BNK_AccNo ?? '').trim(),

      CHK_No: String(raw.CHK_No ?? '').trim(),
      CHK_Amt: Number(raw.CHK_Amt),

      CHK_ExpireDate: String(this.toYmd(raw.CHK_ExpireDate)),
      CHK_ReceDate: String(this.toYmd(raw.CHK_ReceDate)),

      VEN_No: String(raw.VEN_No ?? '').trim(),

      CHK_Status: String(raw.CHK_Status ?? '').trim(),
      COL_BNK_id: String(raw.COL_BNK_id ?? '').trim(),

      CHK_Type: (raw.CHK_Type ?? '') || null,
      Ticket_YN: (raw.Ticket_YN ?? '') || null,
      CHK_Comment: (raw.CHK_Comment ?? '') || null,
      ORG_ID: (raw.ORG_ID ?? '') || null,
      ProjectNo: (raw.ProjectNo ?? '') || null,
      RCV_No: (raw.RCV_No ?? '') || null,
      CHK_PreDate: this.toYmd(raw.CHK_PreDate),

      CHK_ColleDate: this.toYmd(raw.CHK_ColleDate),
      CHK_CashDate: this.toYmd(raw.CHK_CashDate),
      CHK_BackDate: this.toYmd(raw.CHK_BackDate),

      UPD_USR_No: updUserNo,
      UPD_USR_Name: updUserName,
    };

    this.loading = true;
    this.fin64010Service.updateFIN64010(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          if ((res as any)?.IsSuccess === false) return;
          this.onCancel();
        },
        error: (err: any) => {
          console.error('FIN64010 update error:', err);
        },
        complete: () => {
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }
}
