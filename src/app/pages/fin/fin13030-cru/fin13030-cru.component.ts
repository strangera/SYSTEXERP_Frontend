import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { formatYYYYMM } from '@others/component/table/table.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { FIN13030Data, FIN13030GetZeroTaxGUIRequest, FIN13030GetZeroTaxGUIResponse, FIN13030InsertRequest, FIN13030Service, FIN13030UpdateRequest } from '../../../service/api/fin/fin13030.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { ValidationService } from '../../../shared/service/validation.service';

@Component({
  selector: 'app-fin13030-cru',
  templateUrl: './fin13030-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    CalendarComponent,
    InputNumberComponent,
    DropdownComponent,
    NgIf
  ],
})
export class FIN13030CRUComponent extends BasicCruPageComponent<FIN13030Data> implements OnInit {
  dataForm = this.formBuilder.group({
    ID: [0], // 主鍵ID 隱藏欄位
    INV_GUITrack: [''], // 發票字軌
    INV_GUINo: ['', [Validators.required, Validators.maxLength(10)]], // 發票號碼
    INV_GUIDate: ['', Validators.required], // 發票日期
    INV_YM: ['', Validators.required], // 資料所屬年月
    INV_DeclareYM: ['', Validators.required], // 申報年月
    // 顯示欄位（畫面顯示 YYYY/MM），實際送出使用 INV_YM / INV_DeclareYM
    INV_YM_Display: [''],
    INV_DeclareYM_Display: [''],
    INV_Name: ['', [Validators.maxLength(60)]], // 買受人名稱
    GoodsOrServicesName: ['', Validators.maxLength(100)], // 貨物或勞務名稱
    GoodsQty: [1, [this.validationService.numberValidator]], // 貨物或勞務數量
    ExportMethod: ['', Validators.required], // 外銷方式
    INV_PassType: [null as string | null, Validators.required], // 通關方式註記
    INV_DocName: ['', [Validators.required, Validators.maxLength(20)]], // 證明文件名稱
    INV_DocNo: ['', [Validators.required, Validators.maxLength(10)]], // 證明文件號碼
    NonCustomsExportAmt: [null as number | null, [this.validationService.numberValidator]], // 非經海關出口金額
    INV_ExportType: [''], // 出口報單類別
    INV_ExportNo: ['', [Validators.maxLength(10)]], // 出口報單號碼
    CustomsExportAmt: [null as number | null, [this.validationService.numberValidator]], // 經海關出口金額
    ExportDate: ['', Validators.required], // 輸出或結匯日期
    INV_Remark: ['', Validators.maxLength(100)], // 備註
    INV_GUIType: [''], // 發票類別（由 zeroTaxGUI 填入）
    INV_ZeroTax: [''], // 零稅率註記（由 zeroTaxGUI 填入）
    INV_SeqNo: [0], // 序號（由 zeroTaxGUI 填入）
  });

  zeroTaxGUIData!: FIN13030GetZeroTaxGUIResponse;

  // 外銷方式選項
  exportMethodOptions = getSYS1000Options('ExportMethod');
  // 出口報單類別選項
  exportTypeOptions = getSYS1000Options('INV_ExportType');
  // 通關方式註記選項
  invPassTypeOptions = [
    { label: '1.適用零稅率非經海關出口應附證明文件之銷項', value: '1' },
    { label: '2.適用零稅率經海關出口免附證明文件之銷項', value: '2' }
  ];

  constructor(
    private fin13030Service: FIN13030Service,
    private validationService: ValidationService,
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13030', this.dataForm);
    if (this.crudstatus === CRUDStatus.Create) {
      const state = this.router.lastSuccessfulNavigation?.extras.state;
      this.zeroTaxGUIData = state?.['rowdata'];
      this.dataForm.patchValue({
        INV_GUITrack: this.zeroTaxGUIData.INV_GUITrack,
        INV_GUINo: this.zeroTaxGUIData.INV_GUINo,
        INV_GUIDate: this.zeroTaxGUIData.INV_GUIDate,
        INV_YM: this.zeroTaxGUIData.INV_YM,
        INV_DeclareYM: this.zeroTaxGUIData.INV_DeclareYM,
        INV_YM_Display: formatYYYYMM(this.zeroTaxGUIData.INV_YM),
        INV_DeclareYM_Display: formatYYYYMM(this.zeroTaxGUIData.INV_DeclareYM),
        INV_PassType: '1', // 預設通關方式註記為 1
      });
      this.handlePassTypeChange('1');
      this.getZeroTaxGUIData(this.dataForm);
    }
    else if (this.crudstatus === CRUDStatus.Edit || this.crudstatus === CRUDStatus.Read) {
      const stateRow = this.rowdata as any;
      if (stateRow) {
        this.dataForm.patchValue({
          INV_GUITrack: stateRow.INV_GUITrack ?? this.dataForm.value.INV_GUITrack,
          INV_YM: stateRow.INV_YM ?? this.dataForm.value.INV_YM,
          INV_DeclareYM: stateRow.INV_DeclareYM ?? this.dataForm.value.INV_DeclareYM,
          INV_YM_Display: formatYYYYMM(stateRow.INV_YM ?? this.dataForm.value.INV_YM),
          INV_DeclareYM_Display: formatYYYYMM(stateRow.INV_DeclareYM ?? this.dataForm.value.INV_DeclareYM),
          INV_GUIType: stateRow.INV_GUIType ?? this.dataForm.value.INV_GUIType,
          INV_ZeroTax: stateRow.INV_ZeroTax ?? this.dataForm.value.INV_ZeroTax,
          INV_SeqNo: stateRow.INV_SeqNo ?? this.dataForm.value.INV_SeqNo
        });
      }
      this.getZeroTaxGUIData(this.dataForm);
    }
    this.setUnEditableFields();
    this.setupPassTypeListener();
  }

  onSubmit(form: FormGroup): void {
    const formValue = form.getRawValue();
    console.log('[FIN13030 CRU] onSubmit called', {
      valid: form.valid,
      raw: formValue,
      crudstatus: this.crudstatus,
      canAdd: this.canAdd?.() ?? null,
      isFormCreateable: this.isFormCreateable,
      isFormEditable: this.isFormEditable,
    });

    this.handleSubmit(form, () => {
      console.log('[FIN13030 CRU] handleSubmit callback entered', { crudstatus: this.crudstatus });
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            const rb: FIN13030InsertRequest = {
              INV_GUINo: formValue.INV_GUINo,
              INV_YM: this.normalizeYM(formValue.INV_YM),
              INV_DeclareYM: this.normalizeYM(formValue.INV_DeclareYM),
              INV_Name: formValue.INV_Name,
              GoodsOrServicesName: formValue.GoodsOrServicesName,
              GoodsQty: formValue.GoodsQty,
              ExportMethod: formValue.ExportMethod,
              INV_DocName: formValue.INV_DocName,
              INV_DocNo: formValue.INV_DocNo,
              NonCustomsExportAmt: formValue.NonCustomsExportAmt,
              INV_ExportType: formValue.INV_ExportType,
              INV_ExportNo: formValue.INV_ExportNo,
              CustomsExportAmt: formValue.CustomsExportAmt,
              ExportDate: formValue.ExportDate,
              INV_Remark: formValue.INV_Remark,
              INV_PassType: formValue.INV_PassType,
              INV_GUITrack: formValue.INV_GUITrack ?? this.zeroTaxGUIData?.INV_GUITrack ?? '',
              INV_GUIType: formValue.INV_GUIType ?? this.zeroTaxGUIData?.INV_GUIType ?? '',
              INV_ZeroTax: formValue.INV_ZeroTax ?? this.zeroTaxGUIData?.INV_ZeroTax ?? '',
              INV_SeqNo: formValue.INV_SeqNo ?? this.zeroTaxGUIData?.INV_SeqNo ?? 0
            };
            this.fin13030Service.insertFIN13030(rb)
              .pipe(untilDestroyed(this), finalize(() => this.loading = false))
              .subscribe({
                next: () => {
                  this.messageService.successBubble('新增成功');
                  this.loading = false;
                  this.submitted = false;
                  this.messageService.unblockUi();
                  this.onCancel();
                },
              });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            const rb: FIN13030UpdateRequest = {
              ID: formValue.ID,
              INV_GUINo: formValue.INV_GUINo,
              INV_YM: this.normalizeYM(formValue.INV_YM),
              INV_DeclareYM: this.normalizeYM(formValue.INV_DeclareYM),
              INV_Name: formValue.INV_Name,
              GoodsOrServicesName: formValue.GoodsOrServicesName,
              GoodsQty: formValue.GoodsQty,
              ExportMethod: formValue.ExportMethod,
              INV_DocName: formValue.INV_DocName,
              INV_DocNo: formValue.INV_DocNo,
              NonCustomsExportAmt: formValue.NonCustomsExportAmt,
              INV_ExportType: formValue.INV_ExportType,
              INV_ExportNo: formValue.INV_ExportNo,
              CustomsExportAmt: formValue.CustomsExportAmt,
              ExportDate: formValue.ExportDate,
              INV_Remark: formValue.INV_Remark,
              INV_PassType: formValue.INV_PassType,
              INV_GUITrack: formValue.INV_GUITrack ?? this.zeroTaxGUIData?.INV_GUITrack ?? '',
              INV_GUIType: formValue.INV_GUIType ?? this.zeroTaxGUIData?.INV_GUIType ?? '',
              INV_ZeroTax: formValue.INV_ZeroTax ?? this.zeroTaxGUIData?.INV_ZeroTax ?? '',
              INV_SeqNo: formValue.INV_SeqNo ?? this.zeroTaxGUIData?.INV_SeqNo ?? 0
            };

            this.fin13030Service.updateFIN13030(rb)
              .pipe(untilDestroyed(this), finalize(() => this.loading = false))
              .subscribe({
                next: () => {
                  this.messageService.successBubble('更新成功');
                  this.loading = false;
                  this.submitted = false;
                  this.messageService.unblockUi();
                  this.onCancel();
                },
              });
          }
          break;
      }
    });
  }

  private setUnEditableFields(): void {
    this.dataForm.get('INV_GUITrack')?.disable();
    this.dataForm.get('INV_GUIType')?.disable();
    this.dataForm.get('INV_ZeroTax')?.disable();
    this.dataForm.get('INV_SeqNo')?.disable();
    this.dataForm.get('INV_GUINo')?.disable();
    this.dataForm.get('INV_GUIDate')?.disable();
    this.dataForm.get('INV_YM')?.disable();
    this.dataForm.get('INV_DeclareYM')?.disable();
    this.dataForm.get('INV_YM_Display')?.disable();
    this.dataForm.get('INV_DeclareYM_Display')?.disable();
  }

  /**
   * 設置通關方式註記的監聽器
   */
  private setupPassTypeListener(): void {
    this.dataForm.get('INV_PassType')?.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value: string | null) => {
        this.handlePassTypeChange(value);
      });
  }

  /**
   * 處理通關方式註記變更
   * @param passType 通關方式註記值 ('1' 或 '2')
   */
  private handlePassTypeChange(passType: string | null): void {
    const invAmt = this.zeroTaxGUIData?.INV_Amt || 0;

    if (passType === '1') {
      // 選擇 1：預設帶入「非經海關出口金額」，「經海關出口金額」disable 並金額變成 0
      this.dataForm.patchValue({
        NonCustomsExportAmt: invAmt,
        CustomsExportAmt: 0
      });
      this.dataForm.get('NonCustomsExportAmt')?.enable();
      this.dataForm.get('CustomsExportAmt')?.disable();
    } else if (passType === '2') {
      // 選擇 2：預設帶入「經海關出口金額」，「非經海關出口金額」disable 並金額變成 0
      this.dataForm.patchValue({
        NonCustomsExportAmt: 0,
        CustomsExportAmt: invAmt
      });
      this.dataForm.get('NonCustomsExportAmt')?.disable();
      this.dataForm.get('CustomsExportAmt')?.enable();
    }
  }

  getZeroTaxGUIData(form: FormGroup): void {
    // 後端SplitGuiNo要求10碼(字軌2碼+號碼8碼)才能正確切出字軌/號碼查詢，這裡要組合字軌+號碼，不能只送8碼號碼
    const raw = form.getRawValue();
    const fullGUINo = `${raw.INV_GUITrack ?? ''}${raw.INV_GUINo ?? ''}`;
    const rb: FIN13030GetZeroTaxGUIRequest = {
      INV_GUINo_B: fullGUINo,
      INV_GUINo_E: fullGUINo,
      INV_GUIDate_B: raw.INV_GUIDate,
      INV_GUIDate_E: raw.INV_GUIDate,
      INV_YM_B: raw.INV_YM,
      INV_YM_E: raw.INV_YM,
      INV_DeclareYM_B: raw.INV_DeclareYM,
      INV_DeclareYM_E: raw.INV_DeclareYM
    };

    this.fin13030Service.queryFIN13030_GetZeroTaxGUI(rb).subscribe(response => {
      this.zeroTaxGUIData = response.Data[0];
      const z: any = this.zeroTaxGUIData ?? {};
      // 支援兩種回傳格式：INV_YM_B / INV_YM
      const ym = z.INV_YM_B ?? z.INV_YM;
      const declareYm = z.INV_DeclareYM_B ?? z.INV_DeclareYM;
      if (ym) {
        this.dataForm.patchValue({ INV_YM: ym, INV_YM_Display: formatYYYYMM(ym) });
        this.dataForm.get('INV_YM')?.disable({ emitEvent: false });
        this.dataForm.get('INV_YM_Display')?.disable({ emitEvent: false });
      }
      if (declareYm) {
        this.dataForm.patchValue({ INV_DeclareYM: declareYm, INV_DeclareYM_Display: formatYYYYMM(declareYm) });
        this.dataForm.get('INV_DeclareYM')?.disable({ emitEvent: false });
        this.dataForm.get('INV_DeclareYM_Display')?.disable({ emitEvent: false });
      }
      // 若回傳字軌或類型也希望填入，可在此同步
      if (z.INV_GUITrack) {
        this.dataForm.patchValue({ INV_GUITrack: z.INV_GUITrack });
        this.dataForm.get('INV_GUITrack')?.disable({ emitEvent: false });
      }
      if (z.INV_GUIType) {
        this.dataForm.patchValue({ INV_GUIType: z.INV_GUIType });
      }
      if (z.INV_ZeroTax) {
        this.dataForm.patchValue({ INV_ZeroTax: z.INV_ZeroTax });
      }
      if (typeof z.INV_SeqNo !== 'undefined') {
        this.dataForm.patchValue({ INV_SeqNo: z.INV_SeqNo });
      }
      // 新增流程才自動帶入證明文件號碼，編輯/明細已由既有資料回填，避免覆蓋
      if (this.crudstatus === CRUDStatus.Create && z.TXN_REMARK) {
        this.dataForm.patchValue({ INV_DocNo: z.TXN_REMARK });
      }
    });
  }

  private normalizeYM(val: any): string {
    if (!val && val !== 0) return '';
    if (typeof val === 'string' && /^\d{6}$/.test(val)) return val;
    try {
      const d = new Date(val);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    } catch (e) {
      return '';
    }
  }
}
