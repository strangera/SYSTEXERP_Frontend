import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin63050DetailData, Fin63050ListData, Fin63050Service } from '@service/api/fin/fin63050.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/components/input-textarea/input-textarea.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-fin63050-cru',
  templateUrl: './fin63050-cru.component.html',
  standalone: true,
  imports: [AsyncPipe, InputTextareaComponent, InputNumberComponent, CalendarComponent, DropdownComponent, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, ButtonComponent, NgIf, TranslateModule]
})
export class FIN63050CRUComponent extends BasicCruPageComponent<Fin63050ListData> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    CheckNo: [{ value: '', disabled: true }, [Validators.required]],          // 票據號碼 (Key值，不可改)
    VendorNo: [{ value: '', disabled: true }],         // 廠客代號
    VEN_Name: [{ value: '', disabled: true }],         // 廠客名稱
    CompanyAccNo: [{ value: '', disabled: true }],     // 公司銀行科目代號
    CompanyAccName: [{ value: '', disabled: true }],   // 公司銀行科目名稱
    IssueDate: [{ value: null as Date | null, disabled: true }],        // 開票日
    ExpireDate: [{ value: null as Date | null, disabled: true }],       // 到期日
    PayDate: [null as Date | null],                                     // 兌現日 (可更新)
    WithdrawDate: [null as Date | null, [Validators.required]],                                // 撤票日 (可更新)
    CheckAmount: [{ value: null as number | null, disabled: true }],      // 票面金額
    CheckTitle: [null as string | null, [Validators.required]],                                  // 票據抬頭 (可更新)
    NoEndorseYn: [null as string | null, [Validators.required]],                                 // 票據禁止背書轉讓 (可更新)
    Remark: [null as string | null, [Validators.required]],                                      // 備註 (可更新)
    OrgId: [{ value: '', disabled: true }],            // 組織代號
    StatusFlag: [null as string | null, [Validators.required]],                                  // 票據狀態 (可更新)
    VouNo_paid: [{ value: '', disabled: true }],       // 已拋轉傳票號碼
    CheckStatus: [{ value: '', disabled: true }],      // 狀態
    PickupType: [null as string | null, [Validators.required]],                                  // 領取狀態 (可更新)
    PickupDate: [null as Date | null],                                  // 領取日期 (可更新)
    ProjectNo: [{ value: '', disabled: true }],        // 活動代號
    PamNo: [{ value: '', disabled: true }],            // 應付票據開票單號
    VoucherNoIssued: [{ value: '', disabled: true }],  // 傳票號碼
  });
  orgOptions$ = this.dropdownApi.querySys3100();
  CheckStatusOptions = getSYS1000Options('CheckStatus');
  StatusFlagOptions = getSYS1000Options('StatusFlag');
  PickupTypeOptions = getSYS1000Options('PickupType');
  constructor(
    private readonly fin63050Service: Fin63050Service,
    private readonly dropdownApi: DropdownApiService,
    private readonly datePipe: DatePipe
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('FIN63050', this.dataForm);
    if (this.rowdata) {
      this.fin63050Service.queryFIN63050Detail({ ChkNo: this.rowdata.CheckNo }).pipe(untilDestroyed(this)).subscribe(response => {
        if (!response.Data.ErrorMsg) {
          this.dataForm.patchValue(response.Data.QueryData as Fin63050DetailData);
        } else {
          this.messageService.errorBubble(response.Data.ErrorMsg);
        }
      })
    }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const rawValue = frm.getRawValue();

      const data = {
        CheckNo: rawValue.CheckNo,
        CheckTitle: rawValue.CheckTitle,
        NoEndorseYn: rawValue.NoEndorseYn,
        Remark: rawValue.Remark,
        StatusFlag: rawValue.StatusFlag,
        PickupType: rawValue.PickupType,
        PickupDate: this.datePipe.transform(rawValue.PickupDate, 'yyyy-MM-dd') || null,
        PayDate: this.datePipe.transform(rawValue.PayDate, 'yyyy-MM-dd') || null,
        WithdrawDate: this.datePipe.transform(rawValue.WithdrawDate, 'yyyy-MM-dd') || null
      };

      this.fin63050Service.updateFIN63050(data)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.messageService.successBubble(response.Message);
          this.onCancel();
        });
    });
  }
}
