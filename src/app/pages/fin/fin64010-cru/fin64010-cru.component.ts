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

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import {
  ApiResponse,
  Fin64010Service,
  FIN64010DetailRow,
  FIN64010UpdateRequest,
} from '../../../service/api/fin/fin64010.service';

import { Fin26010Service, Aps1002BankDropDownRow } from '../../../service/api/fin/fin26010.service';

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

  /** 是否可編輯：已拋轉 / 已兌現 / 已退票 => false */
  isEditable = true;

  // 下拉
  vendorOptions: any[] = [];
  bankNoOptions: any[] = [];         // 票面銀行代號(全省銀行代號) -> BNK_Key
  colleAccountOptions: any[] = [];   // 託收帳戶(公司銀行資料) -> COL_BNK_id
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
    Id: [null as number | null, Validators.required],

    // 後端必填
    BNK_Key: ['' as string, Validators.required],       // 票面銀行
    BNK_AccNo: ['' as string, Validators.required],     // 票據上的帳號
    CHK_No: ['' as string, Validators.required],
    CHK_Amt: [null as any, Validators.required],
    CHK_ExpireDate: [null as Date | null, Validators.required],
    CHK_ReceDate: [null as Date | null, Validators.required],
    VEN_No: ['' as string, Validators.required],
    CHK_Status: ['' as string, Validators.required],
    COL_BNK_id: ['' as string, Validators.required],    // 託收帳戶

    // optional
    CHK_Type: ['' as string],
    Ticket_YN: ['' as string],
    CHK_Comment: ['' as string],
    ORG_ID: ['' as string],
    ProjectNo: ['' as string],
    RCV_No: ['' as string],
    CHK_PreDate: [null as Date | null],

    // 狀態日期(後端有條件必填)
    CHK_ColleDate: [null as Date | null],
    CHK_CashDate: [null as Date | null],
    CHK_BackDate: [null as Date | null],

    // 顯示用(通常只讀)
    VEN_Name: ['' as string],
    BNK_Name: ['' as string],
    BNK_BranchName: ['' as string],
    BNK_AccName: ['' as string], // 託收銀行名稱(後端明細欄位 BNK_AccName)

    Tran_Status: ['' as string],
    Tran_Status_Name: ['' as string],
    CHK_Status_Name: ['' as string],
    VouNo: ['' as string],
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
        const rows = Array.isArray(res?.Data) ? res.Data : [];
        this.orgOptions = rows.map((x: any) => ({
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

    // 下拉：票面銀行代號(全省銀行代號) -> BNK_Key
    this.dropdownApiService.queryAps1001({ SearchKeyword: '' })
      .pipe(untilDestroyed(this))
      .subscribe((response: any) => {
        const list = Array.isArray(response)
          ? response
          : (Array.isArray(response?.Data) ? response.Data : []);
        this.bankNoOptions = list
          .map((x: any) => ({
            value: String(x.No ?? ''),
            label: `${x.No ?? ''} - ${x.Name ?? ''}`,
            raw: x,
          }))
          .filter((x: any) => x.value);
      });

    // 下拉：託收帳戶(公司銀行資料) -> COL_BNK_id
    // 用 APS1002 下拉，並排除 BNK_AccType='1'
    this.fin26010Service.queryAPS1002DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<Aps1002BankDropDownRow[]>) => {
          const list = Array.isArray(res?.Data) ? res.Data : [];
          const filtered = list.filter((x: any) => String((x as any)?.BNK_AccType ?? '') !== '1');

          // ⚠️ 後端 updateFIN64010Request：COL_BNK_id maxLength=8，通常對應 APS1002.BNK_id
          this.colleAccountOptions = filtered
            .map((x: any) => ({
              value: String((x as any).BNK_id ?? (x as any).No ?? ''),
              label: `${x.BNK_DepositAccNo ?? ''} - ${x.ACCCNAME ?? ''}`,
              raw: x,
            }))
            .filter((x: any) => x.value);
        },
        error: () => (this.colleAccountOptions = []),
      });

    // ✅ 最後才載入明細：避免 options 載入順序導致 dropdown 顯示問題
    this.loadDetailByRoute();
  }

  /** ✅ 把後端回傳統一整理成「單筆明細」 */
  private normalizeDetailRow(res: any): FIN64010DetailRow | null {
    const data = res?.Data;

    // 常見回傳型態容錯
    let row: any = null;
    if (Array.isArray(data)) row = data[0];
    else if (data && Array.isArray(data?.QueryData)) row = data.QueryData[0];
    else if (data && data?.Data) row = data.Data;
    else row = data;

    // ✅ 必須像明細才算：避免把查詢結果/空物件拿來覆寫
    const looksLikeDetail =
      row && (row.CHK_No || row.BNK_No || row.VEN_No || row.CHK_Amt != null);

    return looksLikeDetail ? (row as FIN64010DetailRow) : null;
  }

  private loadDetailByRoute(): void {
    const id = Number(this.activatedRoute.snapshot.queryParamMap.get('Id'));
    if (!Number.isFinite(id)) {
      // 沒 Id（例如 Create）也要套用 readonly 規則
      this.applyReadonlyRules();
      return;
    }

    this.loading = true;

    this.fin64010Service.queryFIN64010Detail({ Id: id })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          const row = this.normalizeDetailRow(res);

          // ✅ 拿不到正確明細：不要 patch，避免把 initializePage 的 rowdata 清空
          if (!row) {
            console.warn('[FIN64010] detail response shape unexpected, skip patchValue to avoid clearing form.', (res as any)?.Data);
            this.applyReadonlyRules();
            this.loading = false;
            this.cdr.detectChanges();
            return;
          }

          this.dataForm.patchValue({
            Id: (row as any)?.id ?? (row as any)?.ID ?? id,

            BNK_Key: String((row as any)?.BNK_No ?? ''),           // 票面銀行代號
            BNK_AccNo: String((row as any)?.BNK_AccNo ?? ''),      // 票據上的帳號
            CHK_No: String((row as any)?.CHK_No ?? ''),
            CHK_Amt: (row as any)?.CHK_Amt ?? null,

            CHK_ExpireDate: (row as any)?.CHK_ExpireDate ? new Date((row as any).CHK_ExpireDate) : null,
            CHK_ReceDate: (row as any)?.CHK_ReceDate ? new Date((row as any).CHK_ReceDate) : null,

            VEN_No: String((row as any)?.VEN_No ?? ''),
            CHK_Status: String((row as any)?.CHK_Status ?? ''),

            COL_BNK_id: String((row as any)?.COL_BNK_id ?? ''),

            CHK_Type: String((row as any)?.CHK_Type ?? ''),
            Ticket_YN: String((row as any)?.Ticket_YN ?? ''),
            CHK_Comment: String((row as any)?.CHK_Comment ?? ''),
            ORG_ID: String((row as any)?.ORG_ID ?? ''),
            ProjectNo: String((row as any)?.ProjectNo ?? ''),
            RCV_No: String((row as any)?.RCV_No ?? ''),

            CHK_PreDate: (row as any)?.CHK_PreDate ? new Date((row as any).CHK_PreDate) : null,

            CHK_ColleDate: (row as any)?.CHK_ColleDate ? new Date((row as any).CHK_ColleDate) : null,
            CHK_CashDate: (row as any)?.CHK_CashDate ? new Date((row as any).CHK_CashDate) : null,
            CHK_BackDate: (row as any)?.CHK_BackDate ? new Date((row as any).CHK_BackDate) : null,

            VEN_Name: String((row as any)?.VEN_Name ?? ''),
            BNK_Name: String((row as any)?.BNK_Name ?? ''),
            BNK_BranchName: String((row as any)?.BNK_BranchName ?? ''),
            BNK_AccName: String((row as any)?.BNK_AccName ?? ''),

            Tran_Status: String((row as any)?.Tran_Status ?? ''),
            Tran_Status_Name: String((row as any)?.Tran_Status_Name ?? ''),
            CHK_Status_Name: String((row as any)?.CHK_Status_Name ?? ''),
            VouNo: String((row as any)?.VouNo ?? ''),
          }, { emitEvent: false });

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

    // 依你原本規格：拋轉(2)/兌現(3)/退票(5)不可改
    this.isEditable = !(tran === '2' || chk === '3' || chk === '5');

    // 顯示用欄位 disable
    ['VEN_Name', 'BNK_Name', 'BNK_BranchName', 'BNK_AccName', 'Tran_Status_Name', 'CHK_Status_Name', 'VouNo']
      .forEach((k) => this.dataForm.get(k)?.disable({ emitEvent: false }));

    if (this.crudstatus === CRUDStatus.Read) {
      this.dataForm.disable({ emitEvent: false });
      return;
    }
    if (!this.isEditable) {
      this.dataForm.disable({ emitEvent: false });
      return;
    }

    // Id 通常不可改
    this.dataForm.get('Id')?.disable({ emitEvent: false });
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

    const chkStatus = String(this.dataForm.getRawValue().CHK_Status ?? '');
    const colleDate = this.dataForm.getRawValue().CHK_ColleDate;
    const cashDate = this.dataForm.getRawValue().CHK_CashDate;
    const backDate = this.dataForm.getRawValue().CHK_BackDate;

    // 對齊後端 Controller 驗證
    if (chkStatus === '2' && !colleDate) return;
    if (chkStatus === '3' && !cashDate) return;
    if (chkStatus === '5' && !backDate) return;

    const raw = this.dataForm.getRawValue();

    const payload: FIN64010UpdateRequest = {
      Id: Number(raw.Id),

      BNK_Key: String(raw.BNK_Key ?? '').trim(),
      BNK_AccNo: String(raw.BNK_AccNo ?? '').trim(),
      CHK_No: String(raw.CHK_No ?? '').trim(),
      CHK_Amt: Number(raw.CHK_Amt),

      CHK_ExpireDate: String(this.toYmd(raw.CHK_ExpireDate)),
      CHK_ReceDate: String(this.toYmd(raw.CHK_ReceDate)),

      VEN_No: String(raw.VEN_No ?? '').trim(),
      CHK_Status: String(raw.CHK_Status ?? '').trim(),
      COL_BNK_id: String(raw.COL_BNK_id ?? '').trim(),

      CHK_Type: raw.CHK_Type ? String(raw.CHK_Type) : null,
      Ticket_YN: raw.Ticket_YN ? String(raw.Ticket_YN) : null,
      CHK_Comment: raw.CHK_Comment ? String(raw.CHK_Comment) : null,
      ORG_ID: raw.ORG_ID ? String(raw.ORG_ID) : null,
      ProjectNo: raw.ProjectNo ? String(raw.ProjectNo) : null,
      RCV_No: raw.RCV_No ? String(raw.RCV_No) : null,
      CHK_PreDate: this.toYmd(raw.CHK_PreDate),

      CHK_ColleDate: this.toYmd(raw.CHK_ColleDate),
      CHK_CashDate: this.toYmd(raw.CHK_CashDate),
      CHK_BackDate: this.toYmd(raw.CHK_BackDate),
    };

    this.loading = true;

    this.fin64010Service.updateFIN64010(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (_res: ApiResponse<any>) => {
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
