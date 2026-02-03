import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
    LOST_DATE: [new Date(), [Validators.required,]],
    OFF_DATE: [null as Date | null],
    MSG_DATE: [new Date()],
    RECEIVE_DATE: [new Date()],
    DocType: ['', [Validators.required,]],
    Identity_KIND: [''],
    LOCATION: [''],
    SEQ_TYPE: [''],
    SEX: ['', [Validators.required,]],
    GOODS: ['', [Validators.required,]],
    BROADCAST_DATE: ['', [Validators.maxLength(400)]],
    BROADCAST_YN: ['N'],
    OTHER_GOODS: [{ value: this.user?.user_No, disabled: true }, [Validators.required, Validators.maxLength(20)]],
    REGISTRANT: ['', [Validators.required, Validators.maxLength(10)]],
    TEL: ['', [Validators.maxLength(10)]],
    MOBILE_PHONE: ['', [Validators.maxLength(10)]],
    ADDRESS: ['', [Validators.maxLength(100)]],
    RECAPTION_NAME: ['', [Validators.maxLength(10)]],
    RECAPTION_PHONE: ['', [Validators.maxLength(10)]],
    PROCESSING_USER: [{ value: this.user?.user_No, disabled: true }, [Validators.maxLength(20)]],
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
    { label: '是', value: 'Y' },
    { label: '否', value: 'N' },
  ];
  SPACE1Options = getSYS1000Options('LOCATION');
  // 為顯示 'No - Name' 格式，產生一份帶有格式化 label 的選項清單
  SPACE1OptionsLabelled = this.SPACE1Options.map(opt => ({ value: opt.value, label: `${opt.value} - ${opt.label}` }));
  USER5Options: any[] = [
    { Name: '遊客', No: '1' },
    { Name: '員工', No: '2' },
  ];
  USER6Options: any[] = [
    { Name: '男性', No: '1' },
    { Name: '女性', No: '2' },
  ];
  RebroadcastLoading = false;
  // 控制是否顯示「領回資訊」區塊
  showReceiveInfo = true;
  // 當從列表點選「領回」進入 CRU 時，只允許領回區塊可編輯，其餘欄位唯讀
  onlyReceiveEditable = false;
  // 模式：L = 遺失, F = 拾獲
  mode?: 'L' | 'F';

  private labelMap: Record<string, Record<string, string>> = {
    L: {
      LOST_DATE_HEADER: '遺失日期',
      SECTION_TITLE: '報失者基本資料',
      REGISTRANT: '報失者姓名',
      IDENTITY_KIND: '報失者身分別',
      SEX: '報失者性別',
    },
    F: {
      LOST_DATE_HEADER: '拾獲日期',
      SECTION_TITLE: '拾獲者基本資料',
      REGISTRANT: '拾獲者姓名',
      IDENTITY_KIND: '拾獲者身分別',
      SEX: '拾獲者性別',
    },
  };

  getLabel(key: string, defaultLabel: string): string {
    const m = this.mode ? this.labelMap[this.mode] : undefined;
    return (m && m[key]) ? m[key] : defaultLabel;
  }

  constructor(
    private dropdownApiService: DropdownApiService,
    private readonly cpm11070Service: CPM11070Service,
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();
  }


  ngOnInit(): void {
    this.initializePage('CPM11070', this.dataForm);
    // 讀取從查詢頁傳入的 mode
    this.mode = (this.rowdata as any)?.mode as any;
    const seqId = (this.rowdata as any)?.SeqId ?? (this.rowdata as any)?.SEQ_ID;
    const openMode = (this.rowdata as any)?._openMode as string | undefined;
    // 設定 DocType 預設值並鎖定（不可編輯）
    const defaultDoc = this.mode === 'F' ? 'F' : 'L';
    if (!seqId) {
      this.dataForm.patchValue({ DocType: defaultDoc });
      try { this.dataForm.controls.DocType.disable(); } catch { }
      // SEQ_TYPE 預設為 '1' (登錄)，並鎖定
      this.dataForm.patchValue({ SEQ_TYPE: '1' });
      try { this.dataForm.controls.SEQ_TYPE.disable(); } catch { }
      // OFF_DATE 在建立時不可編輯
      try { this.dataForm.controls.OFF_DATE.disable(); } catch { }
      // MSG_DATE 在建立時不可編輯
      try { this.dataForm.controls.MSG_DATE.disable(); } catch { }
      // 確保 OTHER_GOODS、PROCESSING_USER 在建立時預設為目前使用者
      try {
        const me = this.user?.user_No ?? '';
        const procCtrl = this.dataForm.controls.PROCESSING_USER as FormControl;
        const otherCtrl = this.dataForm.controls.OTHER_GOODS as FormControl;
        if (procCtrl?.value !== me) procCtrl?.setValue(me, { emitEvent: true });
        if (otherCtrl?.value !== me) otherCtrl?.setValue(me, { emitEvent: true });
        this.cdr.detectChanges();
      } catch { }
    }
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
          LOST_DATE: d.LOST_DATE ? new Date(d.LOST_DATE) : (d.FIND_DATE ? new Date(d.FIND_DATE) : new Date()),
          OFF_DATE: d.OFF_DATE ? new Date(d.OFF_DATE) : null,
          MSG_DATE: d.MSG_DATE ? new Date(d.MSG_DATE) : new Date(),
          RECEIVE_DATE: d.RECEIVE_DATE ? new Date(d.RECEIVE_DATE) : new Date(),
          DocType: d.DocType,
          Identity_KIND: d.Identity_KIND,
          LOCATION: d.LOCATION,
          SEQ_TYPE: d.SEQ_TYPE,
          SEX: d.SEX,
          GOODS: d.GOODS,
          BROADCAST_DATE: d.NOTES,
          BROADCAST_YN: d.BROADCAST_YN ?? 'N',

          OTHER_GOODS: d.OTHER_GOODS || d.SERVICE_USER,
          REGISTRANT: d.REGISTRANT,
          TEL: d.TEL,
          MOBILE_PHONE: d.MOBILE_PHONE,
          ADDRESS: d.ADDRESS,
          RECAPTION_NAME: d.RECAPTION_NAME,
          RECAPTION_PHONE: d.RECAPTION_PHONE,
          PROCESSING_USER: d.PROCESSING_USER,
        });
        // detail view: lock DocType control
        try { this.dataForm.controls.DocType.disable(); } catch { }
        // detail view: lock SEQ_TYPE (保持原值或設定為 '1' 若無)
        try {
          if (!this.dataForm.controls.SEQ_TYPE.value) {
            this.dataForm.patchValue({ SEQ_TYPE: d.SEQ_TYPE ?? '1' });
          }
          this.dataForm.controls.SEQ_TYPE.disable();
        } catch { }
        // detail view: lock OFF_DATE
        try { this.dataForm.controls.OFF_DATE.disable(); } catch { }
        // detail view: lock MSG_DATE
        try { this.dataForm.controls.MSG_DATE.disable(); } catch { }
        // 如果是從列表「領回」按鈕開啟，將表單除領回區塊外設為唯讀
        if (openMode === 'receive') {
          this.onlyReceiveEditable = true;
          // 若後端未帶 PROCESSING_USER，預設為目前登入者
          try {
            const me = this.user?.user_No ?? '';
            const procCtrl = this.dataForm.get('PROCESSING_USER');
            if (procCtrl && (procCtrl.value === null || procCtrl.value === undefined || procCtrl.value === '')) {
              procCtrl.setValue(me, { emitEvent: true });
            }
          } catch { }
          const editableKeys = ['RECEIVE_DATE', 'RECAPTION_NAME', 'RECAPTION_PHONE', 'PROCESSING_USER'];
          const controlKeys = Object.keys(this.dataForm.controls);
          controlKeys.forEach(k => {
            try {
              const ctrl = this.dataForm.get(k);
              if (!ctrl) return;
              if (!editableKeys.includes(k)) {
                ctrl.disable();
              } else {
                ctrl.enable();
              }
            } catch { }
          });
          // 對領回相關欄位加入必填驗證，以符合領回流程要求
          try {
            const rCtrl = this.dataForm.get('RECEIVE_DATE');
            const nameCtrl = this.dataForm.get('RECAPTION_NAME');
            const phoneCtrl = this.dataForm.get('RECAPTION_PHONE');
            const procCtrl = this.dataForm.get('PROCESSING_USER');
            if (rCtrl) {
              rCtrl.setValidators([Validators.required]);
              rCtrl.updateValueAndValidity();
            }
            if (nameCtrl) {
              nameCtrl.setValidators([Validators.required, Validators.maxLength(10)]);
              nameCtrl.updateValueAndValidity();
            }
            if (phoneCtrl) {
              phoneCtrl.setValidators([Validators.required, Validators.maxLength(10)]);
              phoneCtrl.updateValueAndValidity();
            }
            if (procCtrl) {
              procCtrl.setValidators([Validators.required, Validators.maxLength(20)]);
              procCtrl.updateValueAndValidity();
            }
          } catch { }
          this.showReceiveInfo = true;
        }
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
        this.loading = false;
        return;
      }
    }
    // 驗證通過後隱藏領回資訊區塊
    this.showReceiveInfo = false;
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
            this.loading = false;
            this.onCancel();
          } else {
            const errMsg = (res.Data as unknown as string) || res.Message || '已領回失敗';
            this.messageService.errorBubble(errMsg);
            this.showReceiveInfo = true;
            this.loading = false;
          }
        },
        error: () => {
          this.loading = false;
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
    // 點擊後先隱藏領回區塊
    this.showReceiveInfo = false;
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
            // 出錯時恢復顯示
            this.showReceiveInfo = true;
          }
        },
      });
  }

  onSubmit(frm: FormGroup): void {
    if (this.onlyReceiveEditable) {
      this.handleSubmit(frm, () => {
        this.onMarkReceived();
      });
      return;
    }

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
