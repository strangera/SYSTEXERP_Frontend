import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TLS41010Service } from '@service/api/tls/tls41010.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { ValidationService } from '@shared/service/validation.service';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { TLS41020Data, TLS41020Service } from '../../../service/api/tls/tls41020.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';

@Component({
  selector: 'app-tls41020-cru',
  templateUrl: './tls41020-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    ButtonComponent,
    NgIf,
    TranslateModule,
    CalendarRangeComponent,
    AsyncPipe,
  ],
})
export class TLS41020CRUComponent extends BasicCruPageComponent<TLS41020Data> implements OnInit {
  private readonly tls41020Service = inject(TLS41020Service);
  private readonly tls41010Service = inject(TLS41010Service);
  private readonly dropDown = inject(DropdownApiService);
  private readonly datePipe = inject(DatePipe);
  private readonly validationService = inject(ValidationService);
  ECRNoOptions = this.dropDown.queryPos1002();
  EDC_Status_Option = getSYS1000Options('EDC_Status1');
  dataForm = this.formBuilder.nonNullable.group({
    id: [''],
    SYS_StoreNo: [this.authService.currentUserValue?.SYS_StoreNo || '10'],
    ECR_No: [null, [Validators.required, Validators.maxLength(10)]],
    EDC_BegDate: ['', Validators.required],
    EDC_EndDate: ['', Validators.required],
    EDC_Status1: [null, Validators.required],
    EDC_Status2: [null],
    EDC_Status3: [null],
    EDC_Status4: [null],
    EDC_Status5: [null],
    EDC_IP1: ['', [Validators.required, Validators.maxLength(20), this.validationService.ipValidator,],],
    EDC_IP2: ['', [Validators.maxLength(20), this.validationService.ipValidator]], // 補上格式驗證
    EDC_IP3: ['', [Validators.maxLength(20), this.validationService.ipValidator]], // 補上格式驗證
    EDC_IP4: ['', [Validators.maxLength(20), this.validationService.ipValidator]],
    EDC_IP5: ['', [Validators.maxLength(20), this.validationService.ipValidator]],
    EDC_TmID1: ['', [Validators.required, Validators.maxLength(8)]],
    EDC_TmID2: ['', [Validators.maxLength(8)]],
    EDC_TmID3: ['', [Validators.maxLength(8)]],
    EDC_TmID4: ['', [Validators.maxLength(8)]],
    EDC_TmID5: ['', [Validators.maxLength(8)]],
  });

  constructor() { super(); }

  ngOnInit(): void {
    this.initializePage('TLS41020', this.dataForm);
    this.dataForm.get('ECR_No')?.valueChanges.subscribe(ecrNo => {
      if (ecrNo) {
        this.fetchECRData(ecrNo);
      }
    });
    if (!this.isFormCreateable) this.dataForm.get('ECR_No')?.disable();
  }
  private fetchECRData(ecrNo: string): void {
    // 使用 TLS41010Service 查詢單筆收銀機資料
    // 假設 API 的參數名稱為 ECR_No，如果 API 是用 QueryTLS41010Request，請確保篩選條件正確
    this.tls41010Service.queryTLS41010({ ECR_No: ecrNo }).subscribe(res => {
      if (res?.Data && res.Data.length > 0) {
        const ecrData = res.Data[0];
        this.dataForm.patchValue({
          EDC_BegDate: ecrData.ECR_ActiveDate || '',
          EDC_EndDate: ecrData.ECR_ExpireDate || '',
        });
      }
    });
  }
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const payload = form.getRawValue();
      payload.EDC_BegDate = this.datePipe.transform(payload.EDC_BegDate, 'yyyy-MM-dd') || '';
      payload.EDC_EndDate = this.datePipe.transform(payload.EDC_EndDate, 'yyyy-MM-dd') || '';
      const requestPayload$ = this.isFormCreateable ? this.tls41020Service.insertTLS41020(payload) : this.tls41020Service.updateTLS41020({ ...payload, id: this.rowdata?.id || 0 });
      requestPayload$.pipe(finalize(() => this.loading = false)).subscribe(() => {
        const successMessage = this.isFormCreateable ? '新增成功' : '更新成功';
        this.messageService.successBubble(successMessage);
        if (this.isFormCreateable) {
          this.dataForm.reset();
        } else {
          this.onCancel();
        }
      })
    });
  }
}
