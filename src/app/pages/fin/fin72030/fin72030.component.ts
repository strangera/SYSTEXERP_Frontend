// 零用金拋轉作業 (FIN72030)

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import {
  FIN72030Detail1NoteDescItem,
  FIN72030DetailResult,
  FIN72030QueryResult,
  Fin72030Service,
  PCS_RqstNoDropdownItem,
} from '@service/api/fin/fin72030.service';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { catchError, distinctUntilChanged, finalize, of } from 'rxjs';

import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { TableEditComponent } from '../../../shared/components/table-edit/table-edit.component';
import { formatAmountNo0, formatDateToYYYY_MM_DD } from '../../../others/component/table/table.model';

/** 進項稅額 123203 / 應付費用-現金 216104 為 SP_FIN72030VouDetail 自動產生筆，摘要走 Detail2/Detail3NoteDesc；其餘為費用明細逐筆摘要，走 Detail1NoteDescList */
const TAX_ACC_NO = '123203';
const CASH_ACC_NO = '216104';

const DETAIL_COLUMNS: EditColumn[] = [
  { field: 'SeqNo', header: '序號', textAlign: 'center', disabled: () => true },
  { field: 'PCS_No', header: '編號', disabled: () => true },
  { field: 'AccNo', header: '科目編號', disabled: () => true },
  { field: 'AccCName', header: '科目名稱', disabled: () => true },
  { field: 'VEN_No', header: '廠商編號', disabled: () => true },
  { field: 'VEN_Name', header: '廠商名稱', disabled: () => true },
  { field: 'NOTeDesc', header: '摘要', type: 'input' },
  { field: 'DebitAmt', header: '借方金額', textAlign: 'right', format: formatAmountNo0, aggregate: 'sum', disabled: () => true },
  { field: 'CreditAmt', header: '貸方金額', textAlign: 'right', format: formatAmountNo0, aggregate: 'sum', disabled: () => true },
  { field: 'ORG_ID', header: '組織代碼', disabled: () => true },
  { field: 'ORG_Name', header: '組織名稱', disabled: () => true },
  { field: 'PTA', header: '立沖代號', textAlign: 'center', disabled: () => true },
  { field: 'ProjectNo', header: '活動代號', disabled: () => true },
];

@UntilDestroy()
@Component({
  selector: 'app-fin72030',
  templateUrl: './fin72030.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    AccordionModule,
    PanelModule,
    MenubarComponent,
    ButtonComponent,
    CalendarComponent,
    DropdownComponent,
    InputTextComponent,
    TableEditComponent,
  ],
})
export class FIN72030Component
  extends BasicQueryPageComponent<FIN72030QueryResult>
  implements OnInit {
  queryForm = this.formBuilder.group({
    PCS_RqstNo: ['', Validators.required],
  });

  // 主檔顯示用 form：Voucher_Date 開放使用者修改（PM 需求），其餘欄位 disable 後以唯讀樣式呈現
  masterForm = this.formBuilder.group({
    Voucher_No: [{ value: '', disabled: true }],
    Voucher_Type: [{ value: '', disabled: true }],
    Voucher_Class: [{ value: '', disabled: true }],
    Voucher_Date: [null as Date | null],
    Voucher_Desc: [{ value: '', disabled: true }],
    CRT_Date: [{ value: null as Date | null, disabled: true }],
    CRT_USR: [{ value: '', disabled: true }],
  });

  rqstNoOptions: PCS_RqstNoDropdownItem[] = [];
  detailData: FIN72030DetailResult[] = [];
  hasResult = false;
  postingLoading = false;

  readonly columns = DETAIL_COLUMNS;

  constructor(private readonly fin72030Service: Fin72030Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN72030', undefined, this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();

    this.queryForm.controls.PCS_RqstNo.valueChanges
      .pipe(distinctUntilChanged(), untilDestroyed(this))
      .subscribe(() => this.resetResult());
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const user = this.authService.currentUserValue;
      this.fin72030Service
        .queryFIN72030({
          SYS_StoreNo: user?.SYS_StoreNo ?? '',
          PCS_RqstNo: frm.value.PCS_RqstNo,
          LoginUsrNo: user?.user_No ?? '',
          LoginUsrName: user?.user_Name ?? '',
        })
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.loading = false;
            this.messageService.unblockUi();
          }),
          catchError((err) => {
            this.messageService.errorBubble(err?.error?.Error?.Message ?? '查詢失敗，請稍後再試');
            return of(null);
          })
        )
        .subscribe((res) => {
          if (res?.Status === '0000' && res.Data?.MasterData) {
            this.applyResult(res.Data);
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
          } else {
            this.resetResult();
          }
        });
    });
  }

  onPosting(): void {
    if (this.postingLoading || !this.hasResult) return;

    this.postingLoading = true;

    const { detail1, detail2, detail3 } = this.buildNoteDescOverrides();

    // CreditOrgID 未送，後端會以預設 100000 (全公司) 處理
    this.fin72030Service
      .postingFIN72030({
        PCS_RqstNo: this.queryForm.value.PCS_RqstNo!,
        VouDate: formatDateToYYYY_MM_DD(this.masterForm.getRawValue().Voucher_Date ?? ''),
        Detail1NoteDescList: detail1,
        Detail2NoteDesc: detail2,
        Detail3NoteDesc: detail3,
      })
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.postingLoading = false)),
        catchError((err) => {
          this.messageService.errorBubble(err?.error?.Error?.Message ?? '拋轉失敗，請稍後再試');
          return of(null);
        })
      )
      .subscribe((res) => {
        if (res?.Status === '0000' && res.Data?.Voucher_No) {
          this.messageService.successBubble(`拋轉成功，傳票號碼：${res.Data.Voucher_No}`);
          // 拋轉後傳票號碼從「系統自動給號」變為實際號碼；下拉中已拋轉的單號需重抓
          this.onSubmit(this.queryForm);
          this.loadDropdownOptions();
        }
      });
  }

  loadDropdownOptions(): void {
    this.fin72030Service
      .getPCS_RqstNoDropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.rqstNoOptions = res?.Data ?? [];
      });
  }

  /** 把畫面上使用者編輯後的明細摘要，依科目編號拆成 SP_FIN72030Posting 對應的三種覆寫參數 */
  private buildNoteDescOverrides(): {
    detail1: FIN72030Detail1NoteDescItem[];
    detail2: string | null;
    detail3: string | null;
  } {
    const detail1: FIN72030Detail1NoteDescItem[] = [];
    let detail2: string | null = null;
    let detail3: string | null = null;

    for (const row of this.detailData) {
      if (row.AccNo === TAX_ACC_NO) {
        detail2 = row.NOTeDesc;
      } else if (row.AccNo === CASH_ACC_NO) {
        detail3 = row.NOTeDesc;
      } else if (row.PCS_No) {
        detail1.push({ PCS_No: row.PCS_No, PCS_SeqNo: row.PCS_SeqNo ?? 0, NoteDesc: row.NOTeDesc });
      }
    }

    return { detail1, detail2, detail3 };
  }

  resetResult(): void {
    this.masterForm.reset();
    this.detailData = [];
    this.hasResult = false;
  }

  private applyResult(data: FIN72030QueryResult): void {
    const master = data.MasterData!;
    // patchValue 會忽略 form 沒有的 key (CRT_USR_No / CRT_USR_Name)，故可直接 spread
    this.masterForm.patchValue({
      ...master,
      Voucher_Date: master.Voucher_Date ? new Date(master.Voucher_Date) : null,
      CRT_Date: master.CRT_Date ? new Date(master.CRT_Date) : null,
      CRT_USR: `${master.CRT_USR_No} ${master.CRT_USR_Name}`.trim(),
    });
    this.detailData = data.DetailList ?? [];
    this.hasResult = true;
  }
}
