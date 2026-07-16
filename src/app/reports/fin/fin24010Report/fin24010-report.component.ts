import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin24010Service } from '@service/api/fin/fin24010.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { NotificationService } from '@shared/components/notification-message/notification.service';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { PanelModule } from 'primeng/panel';
import { filter, finalize, map, switchMap, tap } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-fin24010-report',
  standalone: true,
  templateUrl: './fin24010-report.component.html',
  imports: [
    NgIf, AsyncPipe, ReactiveFormsModule, FormsModule,
    TranslateModule, InputTextComponent, DropdownComponent,
    InputNumberComponent, CalendarComponent, PanelModule
  ]
})
export class FIN24010ReportComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly fin24010Service = inject(Fin24010Service);
  private readonly dropDown = inject(DropdownApiService);
  private readonly messageService = inject(NotificationService);

  // 下拉選單資料 (與原 CRU 一致)
  Org_IdOptions = this.dropDown.querySys3100();
  PayTypeOptions = [{ label: '電匯', value: '1' }, { label: '開票', value: '2' }, { label: '現金', value: '3' }];
  VEN_BNK_No_ParamOptions = this.dropDown.queryAps1001_DropDownList();
  CTRLYNOptions = [{ label: '是', value: 'Y' }, { label: '否', value: 'N' }];
  AccNoOptions = this.dropDown.queryGls1005();
  SubDetailNoOptions = this.dropDown.queryGLS1016();
  VEN_No_Options = this.dropDown.queryPos2013({ VEN_Flag: '' });
  ACP_StatusOptions = getSYS1000Options('ACP_Status');

  isLoading = signal(false);
  initialized = false;
  acpId = '';

  // 建立表單，所有欄位預設為唯讀
  dataForm = this.fb.group({
    ACP_No: [{ value: null, disabled: true }],
    org_id: [{ value: null, disabled: true }],
    ACP_YYYYMM: [{ value: null, disabled: true }],
    acp_termno: [{ value: null, disabled: true }],
    ACP_Date: [{ value: null, disabled: true }],
    VEN_No: [{ value: null, disabled: true }],
    VEN_Name: [{ value: null, disabled: true }],
    VEN_Uniform: [{ value: null, disabled: true }],
    AccNo: [{ value: null, disabled: true }],
    ACP_SourceNo: [{ value: null, disabled: true }],
    ACP_Amt: [{ value: null, disabled: true }],
    PTA_Amt: [{ value: null, disabled: true }],
    ACP_Balance: [{ value: null, disabled: true }],
    ACP_ReserveAmt: [{ value: null, disabled: true }],
    RetReserveAmt: [{ value: null, disabled: true }],
    VEN_PayType: [{ value: null, disabled: true }],
    Full_VEN_BNK_No: [{ value: null, disabled: true }],
    VEN_BNK_BranchNo: [{ value: null, disabled: true }],
    VEN_BankAccountNo: [{ value: null, disabled: true }],
    VEN_AccountName: [{ value: null, disabled: true }],
    ACP_ExpectPayDate: [{ value: null, disabled: true }],
    VEN_CheckTitle: [{ value: null, disabled: true }],
    VEN_CTRLYN: [{ value: null, disabled: true }],
    NoteDesc: [{ value: null, disabled: true }],
    VouNo: [{ value: null, disabled: true }],
    Vou_PostFlagName: [{ value: null, disabled: true }],
    ACP_Status: [{ value: null, disabled: true }],
    SubDetailNo: [{ value: null, disabled: true }]
  });

  ngOnInit(): void {
    this.route.queryParams.pipe(
      untilDestroyed(this),
      map(params => params['acpid']),
      filter(id => !!id),
      tap(id => {
        this.acpId = id;
        this.isLoading.set(true);
      }),
      switchMap(id => this.fin24010Service.queryFIN24010({ ACP_No: id }).pipe(
        finalize(() => this.isLoading.set(false))
      ))
    ).subscribe({
      next: (res) => {
        if (res.Data && res.Data.length > 0) {
          this.dataForm.patchValue(res.Data[0] as any);
        }
        this.initialized = true;
      },
      error: () => {
        this.messageService.warnBubble('載入應付帳款明細失敗');
        this.initialized = true;
      }
    });
  }
}
