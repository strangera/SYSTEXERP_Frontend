import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Cpm11090Service, QueryCPM11090Response } from '@service/api/cpm/cpm11090.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
@Component({
  selector: 'app-cpm11090-cru',
  templateUrl: './cpm11090cru.component.html',
  standalone: true,
  imports: [RadiobuttonComponent, CalendarComponent, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, ButtonComponent, NgIf, TranslateModule]
})
export class CPM11090CRUComponent extends BasicCruPageComponent<QueryCPM11090Response> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    SeqId: [null as unknown as string], // 登錄編號
    BY_MISSING_PEOPLE: [null as string | null, [Validators.required, Validators.maxLength(20)]], // 被尋人姓名
    SalutationCode: [null as string | null], // 被尋人稱謂
    COLLECTION_SITES: [null as string | null, [Validators.required, Validators.maxLength(50)]], // 集合地點
    MISSING_PEOPLE: [null as string | null, [Validators.maxLength(20)]], // 尋人者
    RelationsCode: [null as string | null], // 與被尋人關係
    REC_DATE: [new Date(), [Validators.required]], // 登錄日期
    BROADCAST_YN: ['N'], // 預設為 N // 是否傳播
    IsFinished: [{ value: false, disabled: true }] // 是否結案
  });
  SALUTATIONOPTIONS = getSYS1000Options('SALUTATION');
  RELATIONSOPTIONS = getSYS1000Options('RELATIONS');
  broadcastOptions = [
    { label: '已廣播', value: 'Y', disabled: true }, // 預設「已廣播」不能手動點選
    { label: '待廣播', value: null, disabled: false },
    { label: '不廣播', value: 'N', disabled: false },
  ];
  constructor(
    private readonly cpm11090Service: Cpm11090Service,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM11090', this.dataForm);

    if (!this.isFormCreateable) {
      const seqId = String(this.dataForm.getRawValue().SeqId);
      this.cpm11090Service.getCPM11090Detail(seqId)
        .pipe(untilDestroyed(this))
        .subscribe(response => {
          const dbData = response.Data;
          this.dataForm.patchValue(dbData);

          // --- 核心邏輯控制 ---
          const control = this.dataForm.get('BROADCAST_YN');

          if (dbData.IsFinished || dbData.BROADCAST_YN === 'Y') {
            // 如果已結案 或 已經是已廣播，整組 Radio 不能點
            control?.disable();
          } else {
            // 如果是待廣播或不廣播，確保組件是可用的
            control?.enable();
            // 此時「已廣播」選項會因為陣列裡的 disabled: true 而無法被選取
          }
        });
    }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const rawValue = frm.getRawValue(); // 使用 getRawValue 獲取包含被 disabled 的欄位值
      const params = {
        ...rawValue,
        seQ_ID: this.isFormCreateable ? undefined : String(rawValue.SeqId),
        by_MISSING_PEOPLE: rawValue.BY_MISSING_PEOPLE,
        SALUTATION: rawValue.SalutationCode,
        collectioN_SITES: rawValue.COLLECTION_SITES,
        missinG_PEOPLE: rawValue.MISSING_PEOPLE,
        relations: rawValue.RelationsCode,
        reC_DATE: this.datePipe.transform(rawValue.REC_DATE, 'yyyy-MM-dd') || '',
        BROADCAST_YN: rawValue.BROADCAST_YN
      };
      const $request = this.isFormCreateable ? this.cpm11090Service.insertCPM11090(params) : this.cpm11090Service.updateCPM11090(params);
      $request.pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.messageService.successBubble(response.Message);
        if (this.isFormCreateable) {
          this.dataForm.reset();
        } else {
          this.onCancel();
        }
      })
    })
  }
  RebroadcastLoading = false;
  onRebroadcast() {
    this.RebroadcastLoading = true;
    this.cpm11090Service.broadcastCPM11090(String(this.dataForm.getRawValue().SeqId)).pipe(
      untilDestroyed(this), finalize(() => this.RebroadcastLoading = false)
    ).subscribe(response => {
      this.messageService.successBubble(response.Message);
      this.onCancel();
    });
  }
  CloseLoading = false;
  onClose() {
    this.CloseLoading = true;
    this.cpm11090Service.finishedCPM11090({ seQ_ID: String(this.dataForm.getRawValue().SeqId) }).pipe(
      untilDestroyed(this), finalize(() => this.CloseLoading = false)
    ).subscribe(response => {
      this.messageService.successBubble(response.Message);
      this.onCancel();
    });
  }
}
