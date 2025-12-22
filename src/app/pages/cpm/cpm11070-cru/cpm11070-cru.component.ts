import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CPM11070DetailData, CPM11070Service } from '@service/api/cpm/cpm11070.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-cpm11070-cru',
  templateUrl: './cpm11070-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    CalendarRangeComponent,
    DropdownComponent,
    TranslateModule,
    RadiobuttonComponent,
    InputTextareaComponent,
    PanelModule,
    NgIf,
    CalendarComponent
  ],
})
export class CPM11070CRUComponent extends BasicCruPageComponent<CPM11070DetailData> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    SEQ_ID: [{ value: '系統自動產生', disabled: true }],
    REC_DATE: [null as Date | null, [Validators.required,]],
    LOST_DATE: [null as Date | null, [Validators.required,]],
    OFF_DATE: [null as Date | null],
    MSG_DATE: [null as Date | null],
    RECEIVE_DATE: [null as Date | null],
    DocType: ['', [Validators.required,]],
    Identity_KIND: [''],
    LOCATION: [''],
    SEQ_TYPE: [''],
    SEX: ['', [Validators.required,]],
    GOODS: ['', [Validators.required,]],
    BROADCAST_DATE: ['', [Validators.maxLength(400)]],
    BROADCAST_YN: [''],
    KEY_USER: [{ value: this.user?.user_No, disabled: true }, [Validators.required,]],
    OTHER_GOODS: ['', [Validators.required, Validators.maxLength(20)]],
    REGISTRANT: ['', [Validators.required, Validators.maxLength(10)]],
    TEL: ['', [Validators.maxLength(10)]],
    MOBILE_PHONE: ['', [Validators.maxLength(10)]],
    ADDRESS: ['', [Validators.maxLength(100)]],
    RECAPTION_NAME: ['', [Validators.maxLength(10)]],
    RECAPTION_PHONE: ['', [Validators.maxLength(10)]],
    PROCESSING_USER: ['', [Validators.maxLength(20)]],
  });
  selectedItems: any[] = [];
  totalRecords = 0;
  data: any[] = [];
  Type1Options: any[] = [
    { No: 'L', Name: '遺失' },
    { No: 'F', Name: '拾獲' },
  ];
  Type3Options: any[] = [
    { Name: '登錄', No: '1' },
    { Name: '已通知', No: '3' },
    { Name: '領回', No: '4' },
    { Name: '轉出', No: '6' },
  ];
  Type2Options = getSYS1000Options('LOST_GOODS_TYPE');
  SPACE3Options: any[] = [ //是否廣播
    { label: '已廣播', value: 'Y' },
    { label: '不廣播', value: 'N' },
  ];
  SPACE1Options = getSYS1000Options('LOCATION');
  USER5Options: any[] = [
    { Name: '遊客', No: '1' },
    { Name: '員工', No: '2' },
  ];
  USER6Options: any[] = [
    { Name: '男性', No: '1' },
    { Name: '女性', No: '2' },
  ];
  RebroadcastLoading = false;

  constructor(
    private dropdownApiService: DropdownApiService,
    private readonly cpm11070Service: CPM11070Service,
  ) {
    super();
  }


  ngOnInit(): void {
    this.initializePage('CPM11070', this.dataForm);
    const seqId = (this.rowdata as any)?.SeqId ?? (this.rowdata as any)?.SEQ_ID;
    if (seqId) {
      this.cpm11070Service.queryCPM11070Detail({ SeqId: seqId }).subscribe(res => {
        if (res.Status !== '0000' || !res.Data) {
          this.messageService.errorBubble(res.Message || '載入明細失敗');
          return;
        }
        const d = res.Data;
        this.dataForm.patchValue({
          SEQ_ID: d.SEQ_ID,
          REC_DATE: d.REC_DATE ? new Date(d.REC_DATE) : null,
          LOST_DATE: d.LOST_DATE ? new Date(d.LOST_DATE) : null,
          OFF_DATE: d.OFF_DATE ? new Date(d.OFF_DATE) : null,
          MSG_DATE: d.MSG_DATE ? new Date(d.MSG_DATE) : null,
          RECEIVE_DATE: d.RECEIVE_DATE ? new Date(d.RECEIVE_DATE) : null,
          DocType: d.DocType,
          Identity_KIND: d.Identity_KIND,
          LOCATION: d.LOCATION,
          SEQ_TYPE: d.SEQ_TYPE,
          SEX: d.SEX,
          GOODS: d.GOODS,
          BROADCAST_DATE: d.BROADCAST_DATE,
          BROADCAST_YN: d.BROADCAST_YN,
          KEY_USER: d.KEY_USER,
          OTHER_GOODS: d.OTHER_GOODS,
          REGISTRANT: d.REGISTRANT,
          TEL: d.TEL,
          MOBILE_PHONE: d.MOBILE_PHONE,
          ADDRESS: d.ADDRESS,
          RECAPTION_NAME: d.RECAPTION_NAME,
          RECAPTION_PHONE: d.RECAPTION_PHONE,
          PROCESSING_USER: d.PROCESSING_USER,
        });
      });
    }
  }

  onMarkReceived(): void {
    const raw = this.dataForm.getRawValue();
    const requiredFields = [
      { value: raw.RECEIVE_DATE, label: '領回日期' },
      { value: raw.RECAPTION_NAME, label: '領回人姓名' },
      { value: raw.RECAPTION_PHONE, label: '領回人聯絡電話' },
      { value: raw.PROCESSING_USER, label: '協助顧客領回處理人員' },
    ];

    for (const field of requiredFields) {
      if (field.value === null || field.value === undefined || field.value === '') {
        this.messageService.errorBubble(`「${field.label}」為必填`);
        return;
      }
    }
    const payload = {
      SEQ_ID: raw.SEQ_ID,
      RECEIVE_DATE: raw.RECEIVE_DATE,
      RECAPTION_NAME: raw.RECAPTION_NAME,
      RECAPTION_PHONE: raw.RECAPTION_PHONE,
      PROCESSING_USER: raw.PROCESSING_USER,
    };

    this.cpm11070Service.finishedCPM11070(payload)
      .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            this.messageService.successBubble(res.Message || '已標記為已領回');
            this.onCancel();
          } else {
            const errMsg = (res.Data as unknown as string) || res.Message || '已領回失敗';
            this.messageService.errorBubble(errMsg);
          }
        },
      });
  }

  onRebroadcast(): void {
    const raw = this.dataForm.getRawValue();
    const seqId = raw.SEQ_ID;

    if (!seqId || seqId === '系統自動產生') {
      this.messageService.errorBubble('尚未產生登錄編號，無法重新廣播');
      return;
    }

    this.RebroadcastLoading = true;
    this.cpm11070Service.broadcastCPM11070({ SEQ_ID: String(seqId) })
      .pipe(untilDestroyed(this), finalize(() => (this.RebroadcastLoading = false)))
      .subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            this.messageService.successBubble(res.Message || '重新廣播成功');
            this.onCancel();
          } else {
            const errMsg = (res.Data as unknown as string) || res.Message || '重新廣播失敗';
            this.messageService.errorBubble(errMsg);
          }
        },
      });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();

      if (this.isFormCreateable) {
        const payload = {
          REC_DATE: raw.REC_DATE,
          LOCATION: raw.LOCATION,
          DocType: raw.DocType,
          LOST_OR_FIND_DATE: raw.LOST_DATE,
          GOODS: raw.GOODS,
          OFF_DATE: raw.OFF_DATE,
          BROADCAST_YN: raw.BROADCAST_YN,
          SERVICE_USER: raw.OTHER_GOODS,
          MSG_DATE: raw.MSG_DATE,
          NOTES: raw.BROADCAST_DATE,
          RECEIVE_DATE: raw.RECEIVE_DATE,
          RECAPTION_NAME: raw.RECAPTION_NAME,
          RECAPTION_PHONE: raw.RECAPTION_PHONE,
          PROCESSING_USER: raw.PROCESSING_USER,
          REGISTRANT: raw.REGISTRANT,
          Identity_KIND: raw.Identity_KIND,
          SEX: raw.SEX,
          TEL: raw.TEL,
          MOBILE_PHONE: raw.MOBILE_PHONE,
          ADDRESS: raw.ADDRESS,
        };

        this.cpm11070Service.createCPM11070(payload)
          .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
          .subscribe({
            next: (res) => {
              if (res.Status === '0000') {
                this.messageService.successBubble(res.Message || '新增成功');
                this.onCancel();
              } else {
                const errMsg = (res.Data as unknown as string) || res.Message || '新增失敗';
                this.messageService.errorBubble(errMsg);
              }
            },
          });
        return;
      }

      // 編輯：updateCPM11070
      if (this.isFormEditable) {
        // 狀態對應的日期檢查
        const seqType = raw.SEQ_TYPE;
        if (seqType === '3' && !raw.MSG_DATE) {
          this.messageService.errorBubble('已通知狀態時，必須填寫通知日期');
          this.loading = false;
          return;
        }
        if (seqType === '4' && !raw.RECEIVE_DATE) {
          this.messageService.errorBubble('已領回狀態時，必須填寫領回日期');
          this.loading = false;
          return;
        }
        if (seqType === '6' && !raw.OFF_DATE) {
          this.messageService.errorBubble('轉出狀態時，必須填寫轉出日期');
          this.loading = false;
          return;
        }

        const locationLabel = this.SPACE1Options.find(opt => opt.value === raw.LOCATION)?.label ?? raw.LOCATION;

        let notes: string = raw.BROADCAST_DATE || '';
        if (seqType === '6' && raw.OFF_DATE) {
          const off = raw.OFF_DATE as Date;
          const y = off.getFullYear();
          const m = String(off.getMonth() + 1).padStart(2, '0');
          const d = String(off.getDate()).padStart(2, '0');
          const appendText = `${y}/${m}/${d}已轉出`;
          if (!notes?.includes(appendText)) {
            notes = notes ? `${notes}\n${appendText}` : appendText;
          }
        }

        const updatePayload = {
          SEQ_ID: raw.SEQ_ID,
          LOCATION: locationLabel,
          OFF_DATE: raw.OFF_DATE,
          SERVICE_USER: raw.OTHER_GOODS,
          MSG_DATE: raw.MSG_DATE,
          BROADCAST_YN: raw.BROADCAST_YN,
          NOTES: notes,
          RECEIVE_DATE: raw.RECEIVE_DATE,
          RECAPTION_NAME: raw.RECAPTION_NAME,
          RECAPTION_PHONE: raw.RECAPTION_PHONE,
          PROCESSING_USER: raw.PROCESSING_USER,
          REGISTRANT: raw.REGISTRANT,
          Identity_KIND: raw.Identity_KIND,
          SEX: raw.SEX,
          TEL: raw.TEL,
          MOBILE_PHONE: raw.MOBILE_PHONE,
          ADDRESS: raw.ADDRESS,
        };

        this.cpm11070Service.updateCPM11070(updatePayload)
          .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
          .subscribe({
            next: (res) => {
              if (res.Status === '0000') {
                this.messageService.successBubble(res.Message || '修改成功');
                this.onCancel();
              } else {
                const errMsg = (res.Data as unknown as string) || res.Message || '修改失敗';
                this.messageService.errorBubble(errMsg);
              }
            },
          });
      }
    });
  }

}
