import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CPM11070DetailData, CPM11070Service } from '@service/api/cpm/cpm11070.service';
import { getSYS1000Options, SystemOptionsService } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
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
    REC_DATE: [new Date(), [Validators.required,]],
    LOST_DATE: [new Date(), [Validators.required,]],
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
    BROADCAST_YN: ['N'],
    OTHER_GOODS: [this.user?.user_No, [Validators.required, Validators.maxLength(20)]],
    REGISTRANT: ['', [Validators.required, Validators.maxLength(10)]],
    TEL: ['', [Validators.maxLength(10)]],
    MOBILE_PHONE: ['', [Validators.maxLength(10)]],
    ADDRESS: ['', [Validators.maxLength(100)]],
    RECAPTION_NAME: ['', [Validators.maxLength(10)]],
    RECAPTION_PHONE: ['', [Validators.maxLength(10)]],
    PROCESSING_USER: [{ value: '', disabled: true }, [Validators.maxLength(20)]],
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
    { label: '已廣播', value: 'Y', disabled: true }, // 預設「已廣播」不能手動點選
    { label: '待廣播', value: null, disabled: false },
    { label: '不廣播', value: 'N', disabled: false },
  ];
  // Y=已廣播、N=不廣播、NULL=待廣播
  SPACE1Options = getSYS1000Options('LOCATION');
  // 為顯示 'No - Name' 格式，產生一份帶有格式化 label 的選項清單
  SPACE1OptionsLabelled: any[] = [];
  USER5Options: any[] = [
    { Name: '遊客', No: '1' },
    { Name: '員工', No: '2' },
  ];
  USER6Options: any[] = [
    { Name: '男性', No: '1' },
    { Name: '女性', No: '2' },
  ];
  ProcessingUserOptions: any[] = [];
  RebroadcastLoading = false;
  showReceiveInfo = true;
  onlyReceiveEditable = false;
  mode?: 'L' | 'F';
  // 開啟模式來源（例如 'receive' 或 'transfer'）
  openMode?: string | undefined;

  get showRebroadcastButton(): boolean {
    if (!this.isFormEditable) return false;
    try {
      const seqType = (this.dataForm?.getRawValue && this.dataForm.getRawValue().SEQ_TYPE) ?? this.dataForm.controls.SEQ_TYPE?.value;
      if (seqType === '4' || seqType === '6') return false; // 已領回 or 轉出
    } catch { }
    if (this.openMode === 'receive' || this.openMode === 'transfer') return false;
    return true;
  }

  private afterCreateClearForm(): void {
    try {
      this.dataForm.reset();
      const defaultDoc = this.mode === 'F' ? 'F' : 'L';
      const me = this.user?.user_No ?? '';

      try { this.dataForm.controls.SEQ_ID.setValue('系統自動產生'); } catch { }
      try { this.dataForm.controls.SEQ_ID.disable(); } catch { }

      try { this.dataForm.patchValue({ DocType: defaultDoc }); } catch { }
      try { this.dataForm.controls.DocType.disable(); } catch { }

      try { this.dataForm.patchValue({ SEQ_TYPE: '1' }); } catch { }
      try { this.dataForm.controls.SEQ_TYPE.disable(); } catch { }

      try { this.dataForm.controls.REC_DATE.setValue(new Date()); } catch { }
      try { this.dataForm.controls.LOST_DATE.setValue(new Date()); } catch { }

      try { this.dataForm.controls.OFF_DATE.setValue(null); } catch { }
      try { this.dataForm.controls.OFF_DATE.disable(); } catch { }

      try { this.dataForm.controls.MSG_DATE.setValue(null); } catch { }
      try { this.dataForm.controls.MSG_DATE.disable(); } catch { }

      try { this.dataForm.controls.BROADCAST_YN.setValue('N'); } catch { }
      try { this.dataForm.controls.BROADCAST_YN.enable(); } catch { }

      try { this.dataForm.controls.OTHER_GOODS.setValue(me); } catch { }
      try { this.dataForm.controls.PROCESSING_USER.setValue(me); } catch { }
      try { this.dataForm.controls.PROCESSING_USER.disable(); } catch { }

      this.showReceiveInfo = true;
      this.onlyReceiveEditable = false;

      this.submitted = false;
      this.loading = false;
      this.cdr.detectChanges();
    } catch (e) {
      try { this.onCancel(); } catch { }
    }
  }

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
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }


  ngOnInit(): void {
    this.initializePage('CPM11070', this.dataForm);
    try {
      this.systemDataService.refreshSystemCodeByType('LOCATION')
        .pipe(untilDestroyed(this))
        .subscribe({
          next: () => {
            // 後端回傳並更新 localStorage + SystemOptionsService cache（由 service 處理）
            try {
              SystemOptionsService.refreshCache();
            } catch { }
            this.SPACE1Options = getSYS1000Options('LOCATION');
            this.SPACE1OptionsLabelled = this.SPACE1Options.map(opt => ({ value: opt.value, label: `${opt.value} - ${opt.label}` }));
            this.cdr.detectChanges();
          },
          error: () => {
            // 若後端更新失敗，fallback 從 localStorage 重新讀取快取
            try { SystemOptionsService.refreshCache(); } catch { }
            this.SPACE1Options = getSYS1000Options('LOCATION');
            this.SPACE1OptionsLabelled = this.SPACE1Options.map(opt => ({ value: opt.value, label: `${opt.value} - ${opt.label}` }));
            this.cdr.detectChanges();
          }
        });
    } catch (e) {
      try { SystemOptionsService.refreshCache(); } catch { }
      this.SPACE1Options = getSYS1000Options('LOCATION');
      this.SPACE1OptionsLabelled = this.SPACE1Options.map(opt => ({ value: opt.value, label: `${opt.value} - ${opt.label}` }));
    }

    // 載入物品類別下拉（頁面層容錯：若 filter API 失敗則抓全部再過濾）
    this.loadLostGoodsTypeOptions();
    // 載入協助顧客領回處理人員下拉（共用人員清單）
    try {
      this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
        this.ProcessingUserOptions = (options?.Data || []).map((item: any) => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
        this.cdr.detectChanges();
      });
    } catch (e) {
      this.ProcessingUserOptions = [];
    }
    // 讀取從查詢頁傳入的 mode
    this.mode = (this.rowdata as any)?.mode as any;
    const seqId = (this.rowdata as any)?.SeqId ?? (this.rowdata as any)?.SEQ_ID;
    const openMode = (this.rowdata as any)?._openMode as string | undefined;
    this.openMode = openMode;
    // 設定 DocType 預設值並鎖定（不可編輯）
    const defaultDoc = this.mode === 'F' ? 'F' : 'L';
    if (!seqId) {
      this.dataForm.patchValue({ DocType: defaultDoc });
      try { this.dataForm.controls.DocType.disable(); } catch { }
      // 建立模式：確保 BROADCAST_YN 可編輯
      try { this.dataForm.controls.BROADCAST_YN.enable(); } catch { }
      // SEQ_TYPE 預設為 '1' (登錄)，並鎖定
      this.dataForm.patchValue({ SEQ_TYPE: '1' });
      try { this.dataForm.controls.SEQ_TYPE.disable(); } catch { }
      // OFF_DATE 在建立時不可編輯
      try { this.dataForm.controls.OFF_DATE.disable(); } catch { }
      // MSG_DATE 在建立時設為 null 並不可編輯
      try { this.dataForm.patchValue({ MSG_DATE: null }); } catch { }
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
          REC_DATE: d.REC_DATE ? new Date(d.REC_DATE) : undefined,
          LOST_DATE: d.LOST_DATE ? new Date(d.LOST_DATE) : (d.FIND_DATE ? new Date(d.FIND_DATE) : new Date()),
          OFF_DATE: d.OFF_DATE ? new Date(d.OFF_DATE) : null,
          MSG_DATE: d.MSG_DATE ? new Date(d.MSG_DATE) : null,
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
        });

        try {
          const recvCtrl = this.dataForm.get('RECEIVE_DATE');
          if (d.RECEIVE_DATE) {
            recvCtrl?.setValue(new Date(d.RECEIVE_DATE));
          } else {
            recvCtrl?.reset();
          }
        } catch { }

        try {
          const procCtrl = this.dataForm.get('PROCESSING_USER') as FormControl;
          if (d.PROCESSING_USER) {
            procCtrl?.setValue(d.PROCESSING_USER);
          } else {
            procCtrl?.reset();
          }
        } catch { }
        // 若為一般編輯模式，領回資訊區塊應為唯讀（disabled）
        try {
          if (this.isFormEditable) {
            const recvKeys = ['RECEIVE_DATE', 'RECAPTION_NAME', 'RECAPTION_PHONE', 'PROCESSING_USER'];
            recvKeys.forEach(k => {
              try {
                const ctrl = this.dataForm.get(k);
                // 若是透過「領回」開啟，不要先 reset（後續會預設值並 enable）
                if (this.openMode === 'receive') {
                  try { /* leave value as-is; enable/validators handled in receive block */ } catch { }
                } else {
                  try { ctrl?.reset(); } catch { }
                }
                try { ctrl?.disable(); } catch { }
              } catch { }
            });
          }
        } catch { }
        // detail view: lock DocType control
        try { this.dataForm.controls.DocType.disable(); } catch { }
        // detail view: lock SEQ_TYPE (保持原值或設定為 '1' 若無)
        try {
          if (!this.dataForm.controls.SEQ_TYPE.value) {
            this.dataForm.patchValue({ SEQ_TYPE: d.SEQ_TYPE ?? '1' });
          }
          this.dataForm.controls.SEQ_TYPE.disable();
        } catch { }
        try { this.dataForm.controls.OFF_DATE.disable(); } catch { }
        try { this.dataForm.controls.MSG_DATE.disable(); } catch { }
        try {
          const b = d.BROADCAST_YN;
          if (b === '') {
            this.dataForm.controls.BROADCAST_YN.disable();
          } else {
            try { this.dataForm.controls.BROADCAST_YN.enable(); } catch { }
          }
        } catch { }
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
          // 若後端未帶 RECEIVE_DATE，預設為現在時間
          try {
            const me = this.user?.user_No ?? '';
            const rCtrl = this.dataForm.get('RECEIVE_DATE');
            if (rCtrl && (rCtrl.value === null || rCtrl.value === undefined)) {
              rCtrl.setValue(new Date(), { emitEvent: true });
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
        // 如果是從列表「轉出」按鈕開啟，僅允許使用者設定轉出日期
        if (openMode === 'transfer') {
          try {
            const editableKeys = ['OFF_DATE'];
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
            const offCtrl = this.dataForm.get('OFF_DATE');
            if (offCtrl && !offCtrl.value) {
              offCtrl.setValue(new Date(), { emitEvent: true });
            }
            const seqTypeCtrl = this.dataForm.get('SEQ_TYPE');
            if (seqTypeCtrl && seqTypeCtrl.value !== '6') {
              seqTypeCtrl.setValue('6', { emitEvent: true });
            }
            try { offCtrl?.setValidators([Validators.required]); offCtrl?.updateValueAndValidity(); } catch { }

            this.showReceiveInfo = false;
          } catch { }
        }
      });
    }
  }

  private loadLostGoodsTypeOptions(): void {
    try {
      this.systemDataService.refreshSystemCodeByType('LOST_GOODS_TYPE')
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (res: any) => {
            const hasData = Array.isArray(res) && res.length > 0;
            if (hasData) {
              this.Type2Options = getSYS1000Options('LOST_GOODS_TYPE');
              this.cdr.detectChanges();
            } else {
              this.systemDataService.queryAllSystemCode().pipe(untilDestroyed(this)).subscribe(resp => {
                const all = resp?.Data ?? [];
                const items = (all as any[]).filter(i => i.SYS_Type === 'LOST_GOODS_TYPE');
                this.Type2Options = (items || []).map(i => ({ value: i.SYS_Code, label: i.SYS_Name }));
                this.cdr.detectChanges();
              });
            }
          },
          error: () => {
            this.systemDataService.queryAllSystemCode().pipe(untilDestroyed(this)).subscribe(resp => {
              const all = resp?.Data ?? [];
              const items = (all as any[]).filter(i => i.SYS_Type === 'LOST_GOODS_TYPE');
              this.Type2Options = (items || []).map(i => ({ value: i.SYS_Code, label: i.SYS_Name }));
              this.cdr.detectChanges();
            });
          }
        });
    } catch (e) {
      try { SystemOptionsService.refreshCache(); } catch { }
      this.Type2Options = getSYS1000Options('LOST_GOODS_TYPE');
      this.cdr.detectChanges();
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
      if (field.value === null || field.value === undefined || (typeof field.value === 'string' && field.value === '')) {
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
            this.messageService.successBubble('領回成功');
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
          // 新增時明確傳空值給後端（避免預設值被送出）
          RECEIVE_DATE: null,
          RECAPTION_NAME: raw.RECAPTION_NAME,
          RECAPTION_PHONE: raw.RECAPTION_PHONE,
          PROCESSING_USER: null,
          REGISTRANT: raw.REGISTRANT,
          Identity_KIND: raw.Identity_KIND,
          SEX: raw.SEX,
          TEL: raw.TEL,
          MOBILE_PHONE: raw.MOBILE_PHONE,
          ADDRESS: raw.ADDRESS,
        };

        // 若為 null，從 payload 中移除屬性，嘗試避免後端自動填入預設值
        const cleanPayload: any = { ...payload };
        if (cleanPayload.RECEIVE_DATE === null) delete cleanPayload.RECEIVE_DATE;
        if (cleanPayload.PROCESSING_USER === null) delete cleanPayload.PROCESSING_USER;

        this.cpm11070Service.createCPM11070(cleanPayload)
          .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
          .subscribe({
            next: (res) => {
              if (res.Status === '0000') {
                this.messageService.successBubble(res.Message || '新增成功');
                // 清空表單但保留建立頁面的預設值與鎖定狀態
                this.afterCreateClearForm();
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
          SEQ_TYPE: raw.SEQ_TYPE,
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
                // 根據開啟模式顯示不同成功訊息
                if (this.openMode === 'receive') {
                  this.messageService.successBubble('領回成功');
                } else if (this.openMode === 'transfer') {
                  this.messageService.successBubble('轉出成功');
                } else {
                  this.messageService.successBubble('修改成功');
                }
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
