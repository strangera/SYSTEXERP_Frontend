import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin32010Service } from '@service/api/fin/fin32010.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-fin32010-cru',
  templateUrl: './fin32010-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    NgIf,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    InputTextComponent,
    DropdownComponent,
    InputNumberComponent,
    AsyncPipe,
    CalendarComponent
  ]
})
export class FIN32010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  // 下拉選單/多選列表的 Options 宣告 (參考查詢頁面)
  Org_IdOptions = this.dropDown.querySys3100(); // 組織代碼
  VEN_BNK_No_ParamOptions = this.dropDown.queryAps1001NoBranch(); // 匯款銀行代號
  AccNoOptions = this.dropDown.queryGls1005(); // 會計科目代號
  SubDetailNoOptions = this.dropDown.queryGLS1016(); // 對象別編號
  VEN_No_Options = this.dropDown.queryPos2013({ VEN_Flag: '' }); // 廠商編號
  VouStatusOptions = getSYS1000Options('VOU_Status'); // 傳票狀態
  ACP_Status_ParamOptions = getSYS1000Options('ACP_Status'); // 應收狀態
  dataForm = this.formBuilder.nonNullable.group({
    ARS_ID: [{ value: null, disabled: true }],
    ARS_Amt: [{ value: null, disabled: true }],
    PTA_Amt: [{ value: null, disabled: true }],
    ARS_BalAmt: [{ value: null, disabled: true }],
    ARS_Date: [{ value: null, disabled: true }],
    PTA_Date: [{ value: null, disabled: false }],
    CustInfo: [{ value: null, disabled: true }],
    NoteDesc: [{ value: null, disabled: false }],
    VouNo: [{ value: null, disabled: true }],
    VouStatus: [{ value: null, disabled: false }],
    ARS_StatusName: [null],
    Sam_Yyymm: [{ value: null as unknown as Date | null, disabled: true }],
    Sam_TermNo: [{ value: null, disabled: true }],
    ORG_ID: [{ value: null, disabled: true }],
    CustNo: [{ value: null, disabled: true }],
    CustName: [null],
    Uniform_No: [{ value: null, disabled: true }],
    AccNo: [{ value: null, disabled: true }],
    ARS_SourceNo: [null],
    ARS_StatusCode: [{ value: null, disabled: false }],
    SubDetailNo: [{ value: null, disabled: true }],
    PTA_Key: [{ value: null, disabled: true }],
    AcctKey: [{ value: null }],
    PostFlagCode: [{ value: null, disabled: true }],
  })

  constructor(
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe,
    public readonly fin32010Service: Fin32010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN32010', this.dataForm);

    // 如果是從 fin34030 以新分頁方式開啟（localStorage handoff），透過 API 查詢並填表單
    const handoff = this.readHandoffLocal();
    if (handoff?.arsId && !this.rowdata) {
      this.loading = true;
      this.fin32010Service.queryFIN32010({ ARS_No: handoff.arsId })
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe({
          next: res => {
            const data = res?.Data?.[0];
            if (data) {
              this.dataForm.patchValue(data);
              this.convertSamYyymmToDate(data['Sam_Yyymm']);
              this.dataForm.disable();
            } else {
              this.messageService.warnBubble('查無資料。');
            }
            localStorage.removeItem('FIN32010_CRU_HANDOFF');
          },
          error: () => {
            this.messageService.errorBubble('載入應收帳款資料失敗。');
            localStorage.removeItem('FIN32010_CRU_HANDOFF');
          }
        });
      return;
    }

    // 如果後端回傳為 yyyyMM 字串（例如 "202512"），將其轉為 Date 物件以便日曆元件正確顯示為 yyyy-mm
    this.convertSamYyymmToDate(this.dataForm.get('Sam_Yyymm')?.value);
  }

  private readHandoffLocal(): { arsId?: string; fromRoute?: string } | null {
    try {
      const raw = localStorage.getItem('FIN32010_CRU_HANDOFF');
      if (!raw) return null;
      const obj = JSON.parse(raw);
      return { arsId: obj?.arsId, fromRoute: obj?.fromRoute };
    } catch {
      return null;
    }
  }

  private convertSamYyymmToDate(samVal: any): void {
    if (typeof samVal === 'string') {
      const nums = (samVal as string).replace(/\D/g, '');
      if (nums.length === 6) {
        const y = parseInt(nums.substring(0, 4), 10);
        const m = parseInt(nums.substring(4, 6), 10);
        if (!isNaN(y) && !isNaN(m)) {
          this.dataForm.patchValue({ Sam_Yyymm: new Date(y, m - 1, 1) });
        }
      }
    }
  }

  onSubmit(form: FormGroup): void {
    const rawPta = form.get('PTA_Date')?.value;
    let ptaDate: string | null = null;
    if (rawPta) {
      const d = new Date(rawPta);
      if (!isNaN(d.getTime())) {
        ptaDate = this.datePipe.transform(d, 'yyyy-MM-dd') ?? null;
      } else {
        ptaDate = this.datePipe.transform(rawPta, 'yyyy-MM-dd') ?? null;
      }
    } else {
      ptaDate = null;
    }

    const rawStatus = form.get('ARS_StatusCode')?.value ?? form.get('ARS_StatusName')?.value ?? '';
    const normalizeStatus = (s: any): string => {
      if (s === null || s === undefined || s === '') return '';
      const v = String(s).trim();
      // handle old flags
      if (v.toLowerCase() === 'n') return '0';
      if (v.toLowerCase() === 'y') return '2';
      // handle sys1000 codes like '10' -> '0', '20' -> '2'
      if (!isNaN(Number(v))) {
        const num = Number(v);
        if (num === 10) return '0';
        if (num === 20) return '2';
        // if already 0/2, keep
        if (num === 0) return '0';
        if (num === 2) return '2';
      }
      // fallback: return first char
      return v.charAt(0);
    };

    const updateBody = {
      ARS_No: form.get('ARS_No')?.value ?? form.get('ARS_ID')?.value ?? '',
      PTA_Date: ptaDate,
      NoteDesc: form.get('NoteDesc')?.value ?? '',
      ARS_Status: normalizeStatus(rawStatus),
      AcctKey: form.get('AcctKey')?.value ?? null
    };

    this.loading = true;
    this.fin32010Service.updateFIN32010(updateBody)
      .pipe(untilDestroyed(this), finalize(() => this.loading = false))
      .subscribe(res => {
        this.messageService.successBubble(res.Message);
        this.onCancel();
      }, err => {
        console.error('updateFIN32010 failed', err);
      });
  }
}
