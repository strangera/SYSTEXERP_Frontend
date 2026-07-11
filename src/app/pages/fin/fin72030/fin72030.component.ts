// 零用金拋轉作業 (FIN72030)

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin72030Service } from '@service/api/fin/fin72030.service';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { catchError, distinctUntilChanged, finalize, of } from 'rxjs';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, formatAmountNo0 } from '../../../shared/componentkit/table/table.model';
import {
  FIN72030DetailResult,
  FIN72030QueryResult,
  PCS_RqstNoDropdownItem,
} from '../../../shared/models/fin/fin72030.model';

const DETAIL_COLUMNS: Column[] = [
  { field: 'SeqNo', header: '序號', visible: true, align: 'center' },
  { field: 'PCS_No', header: '編號', visible: true },
  { field: 'AccNo', header: '科目編號', visible: true },
  { field: 'AccCName', header: '科目名稱', visible: true },
  { field: 'VEN_No', header: '廠商編號', visible: true },
  { field: 'VEN_Name', header: '廠商名稱', visible: true },
  { field: 'NOTeDesc', header: '摘要', visible: true },
  { field: 'DebitAmt', header: '借方金額', visible: true, align: 'right', format: formatAmountNo0, isTotal: true },
  { field: 'CreditAmt', header: '貸方金額', visible: true, align: 'right', format: formatAmountNo0, isTotal: true },
  { field: 'ORG_ID', header: '組織代碼', visible: true },
  { field: 'ORG_Name', header: '組織名稱', visible: true },
  { field: 'PTA', header: '立沖代號', visible: true, align: 'center' },
  { field: 'ProjectNo', header: '活動代號', visible: true },
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
    TableComponent,
  ],
})
export class FIN72030Component
  extends BasicQueryPageComponent<FIN72030QueryResult>
  implements OnInit {
  queryForm = this.formBuilder.group({
    PCS_RqstNo: ['', Validators.required],
  });

  // 主檔顯示用唯讀 form（disable 後 app-input-text / app-calendar 會以唯讀樣式呈現）
  masterForm = this.formBuilder.group({
    Voucher_No: [''],
    Voucher_Type: [''],
    Voucher_Class: [''],
    Voucher_Date: [null as Date | null],
    Voucher_Desc: [''],
    CRT_Date: [null as Date | null],
    CRT_USR: [''],
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
    this.masterForm.disable();
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

    // CreditOrgID 未送，後端會以預設 100000 (全公司) 處理
    this.fin72030Service
      .postingFIN72030({
        PCS_RqstNo: this.queryForm.value.PCS_RqstNo!,
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
