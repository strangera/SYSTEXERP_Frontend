import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS21020Service } from '@service/api/ass/ass21020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { PanelModule } from 'primeng/panel';
import { ASS21020Data, ASS21020Detail, ASS21020Update, ASS21020UpdateData } from '../ass21020/ass21020.model';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { NgIf } from '@angular/common';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { Option } from '@service/utility/dropdown-api.model';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { validateMinNumber, validateRequired } from '@shared/componentkit/table-edit/validate-field.model';

@Component({
  selector: 'app-ass21020-cru',
  templateUrl: './ass21020-cru.component.html',
  standalone: true,
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    PanelModule,
    FormsModule,
    ButtonComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    TableEditComponent,
    ButtonModule,
    DialogComponent,
    TableReportComponent,
    NgIf
  ]
})
export class ASS21020CRUComponent extends BasicCruPageComponent<ASS21020Data> implements OnInit {
  public readonly dataForm = this.formBuilder.nonNullable.group({
    ENG_Type: [null, [Validators.required]],
    ENG_MeterNo: [null, [Validators.required]],
    Location_No: [{ value: null, disabled: true }],
    Floor_No: [{ value: null, disabled: true }],
    Floor_Desc: [{ value: null, disabled: true }],
    building_No: [{ value: null, disabled: true }],
    building_DESC: [{ value: null, disabled: true }],
    Draw_X: [{ value: null, disabled: true }],
    Draw_Y: [{ value: null, disabled: true }],
  });

  ENG_TypeOptions = getSYS1000Options('ENG_Type');
  ENG_MeterNoOptions = this.dropdown.queryENG1001_ENG_MeterNo();
  public filteredENG_MeterNoOptions: Option[] = [];
  private allENG_MeterNoOptions: Option[] = [];
  TLT_NoOptions = this.dropdown.queryTLTTALENT_TLT_SPACE();
  public tltNoOptionsArray: Option[] = [];
  data: ASS21020Detail[] = [];
  selectedItems: ASS21020Detail[] = [];
  public readonly columns: EditColumn[] = [
    { field: 'TLT_No', header: '專櫃編號', },
    { field: 'TltName', header: '櫃位名稱', },
    { field: 'LocationNo', header: '位置編號', },
    { field: 'ApplyNo', header: '招募編號', },
    {
      field: 'ENG_Rate', header: '比率', type: 'inputNumber', min: 0, max: 100, maxFractionDigits: 2,
      validate: [validateRequired, validateMinNumber(1)],
    },
    { field: 'ENG_Remark', header: '備註', type: 'input', maxLength: 200, width: '100%' },
  ];

  constructor(
    public readonly service: ASS21020Service,
    private readonly dropdown: DropdownApiService
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('ASS21020', this.dataForm);

    // 1. 取得所有錶號資料並保存，同時初始化篩選
    this.ENG_MeterNoOptions.pipe(untilDestroyed(this)).subscribe(options => {
      this.allENG_MeterNoOptions = options || [];
      // 載入完畢後，執行一次篩選，使用當前的 ENG_Type 初始值 (通常是 null)
      this.filterMeterNoOptions(this.dataForm.controls.ENG_Type.value);

      // 【需求 1: 非建立模式 - 載入錶號附帶資訊】
      if (!this.isFormCreateable && this.rowdata && this.rowdata.ENG_MeterNo) {
        this.updateMeterNoRelatedFields(this.rowdata.ENG_MeterNo);
      }
    });

    // 2. 監聽 TLT_NoOptions (櫃位資料)
    this.TLT_NoOptions.pipe(untilDestroyed(this), finalize(() => this.dialogLoading = false)).subscribe(options => {
      this.tltNoOptionsArray = options || [];
      this.totalRecords = this.tltNoOptionsArray.length;
      this.dialogData = this.tltNoOptionsArray;

      // 【需求 2: 非建立模式 - 補齊明細資料】
      if (!this.isFormCreateable && this.rowdata && this.rowdata.Details) {
        this.updateDetailDataWithFullInfo(this.tltNoOptionsArray);
      }
    });

    // 3. 監聽 ENG_Type 變化來篩選錶號
    this.dataForm.controls.ENG_Type.valueChanges.pipe(untilDestroyed(this)).subscribe(engType => {
      this.filterMeterNoOptions(engType);
      // 當能源類型改變時，清空當前的錶號，避免選擇到錯誤的錶號
      this.dataForm.controls.ENG_MeterNo.patchValue(null);
    });

    // 4. 監聽 ENG_MeterNo 變化來更新附帶資訊 (與原邏輯相同，只是提取為方法)
    this.dataForm.controls.ENG_MeterNo.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((meterNo) => {
        this.updateMeterNoRelatedFields(meterNo);
      });

    // 5. 監聽 Dialog 查詢表單
    this.dialogQueryForm.valueChanges.pipe(untilDestroyed(this)).subscribe(query => {
      this.filterDialogData(query);
    });

    if (!this.isFormCreateable) {
      // 這裡保留原始的 data 初始化，但詳細資訊的補齊在 TLT_NoOptions 載入後處理
      this.data = this.rowdata?.Details || [];
      this.dataForm.disable(); // 非建立模式下禁用表單
    }
  }

  // 新增方法: 根據 ENG_MeterNo 更新相關欄位
  private updateMeterNoRelatedFields(meterNo: string | null): void {
    const selectedOption = this.allENG_MeterNoOptions.find(opt => opt.value === meterNo);

    // 使用 patchValue 更新相關的 form control
    this.dataForm.patchValue({
      Location_No: selectedOption?.['Location_No'] ?? '',
      Floor_No: selectedOption?.['Floor_No'] ?? '',
      Floor_Desc: selectedOption?.['Floor_Desc'] ?? '',
      building_No: selectedOption?.['building_No'] ?? '',
      building_DESC: selectedOption?.['building_DESC'] ?? '',
      Draw_X: selectedOption?.['Draw_X'] ?? '',
      Draw_Y: selectedOption?.['Draw_Y'] ?? '',
    });
  }

  // 新增方法: 補齊非建立模式的明細資料 (需求 2)
  private updateDetailDataWithFullInfo(tltOptions: Option[]): void {
    // 建立一個 map，方便快速查找
    const tltMap = new Map<number, Option>();
    tltOptions.forEach(opt => {
      // 假設 TalentId 是唯一的 key
      if (opt['TalentId']) {
        tltMap.set(opt['TalentId'] as number, opt);
      }
    });

    // 遍歷當前的 data (已由 rowdata.Details 初始化)
    this.data = this.data.map(detail => {
      const fullInfo = tltMap.get(detail.TalentId);

      if (fullInfo) {
        // 補齊 TltName, LocationNo, ApplyNo
        return {
          ...detail,
          TltName: fullInfo['TltName'] || detail.TltName || '',
          LocationNo: fullInfo['LocationNo'] || '',
          ApplyNo: fullInfo['ApplyNo'] || '',
          TltSpace: fullInfo['TltSpace'] || detail.TltSpace || 0,
        };
      }
      return detail; // 如果找不到，保留原資料
    });
    // 補齊資料後，重新計算總比率
    this.fieldChange();
  }

  // 根據能源類型代碼篩選可用的錶號選項
  private filterMeterNoOptions(engType: string | null): void {
    if (!engType) {
      // 如果沒有選擇能源類型，則顯示全部錶號
      this.filteredENG_MeterNoOptions = this.allENG_MeterNoOptions;
      return;
    }

    // 1. 根據能源類型代碼 (ENG_Type) 找出對應的中文描述
    const engTypeOption = this.ENG_TypeOptions.find(opt => opt.value === engType);
    const engTypeDesc = engTypeOption?.label; // 應該是 '水錶'/'電錶'/'瓦斯錶'
    console.log('engType:', engType, 'engTypeDesc:', engTypeDesc);

    if (engTypeDesc) {
      // 2. 使用中文描述來篩選錶號選項
      this.filteredENG_MeterNoOptions = this.allENG_MeterNoOptions.filter(
        item => item['ENG_Type'] === engTypeDesc
      );
      console.log('filteredENG_MeterNoOptions:', this.filteredENG_MeterNoOptions);
    } else {
      // 如果找不到對應的中文描述，顯示全部或清空（這裡選擇顯示全部作為安全機制）
      this.filteredENG_MeterNoOptions = this.allENG_MeterNoOptions;
    }
  }

  // 【修正 validateRow】: 檢查資料中是否有重複的 TLT_No (專櫃編號)
  validateRow = (rowData: ASS21020Detail): { isValid: boolean, errorMessage: string } => {
    const currentRowTLT_No = rowData.TLT_No;
    const rowIndex = this.data.indexOf(rowData);

    // 檢查當前的 TLT_No 是否在 data 陣列中其他行重複出現
    const isDuplicate = this.data.some((item, index) => {
      // 忽略正在驗證的這一行 (避免自己跟自己比較)
      if (index === rowIndex) {
        return false;
      }
      // 檢查專櫃編號是否重複
      return item.TLT_No === currentRowTLT_No;
    });

    if (isDuplicate) {
      return { isValid: false, errorMessage: `專櫃編號 (${currentRowTLT_No}) 已重複` };
    }

    return { isValid: true, errorMessage: '' };
  };

  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  public onSubmit(frm: FormGroup): void {
    this.handleSubmit(this.dataForm, () => {
      const headerData = frm.getRawValue(); // 取得 ENG_Type, ENG_MeterNo

      // 建構傳送給後端的 payload
      const payload: ASS21020UpdateData[] = this.data.map(detail => ({
        ENG_Type: headerData.ENG_Type,
        ENG_MeterNo: headerData.ENG_MeterNo,
        TLT_No: detail.TLT_No || '', // 確保非 null
        ENG_Rate: detail.ENG_Rate || 0, // 確保非 null
        ENG_Remark: detail.ENG_Remark || '', // 確保非 null
        TalentId: detail.TalentId || 0, // 【新增/重要】傳入 TalentId
      }));

      const updatePayload: ASS21020Update = { UpdateASS21020Datas: payload };

      // 【修正點】: 在進行 100% 檢查前，強制重新計算總比率，以防狀態不同步
      const rawTotal = this.data.reduce((total, item) => total + (item.ENG_Rate || 0), 0);
      this.totalPercent = this.roundToTwoDecimals(rawTotal);
      // --- 修正結束 ---

      // 檢查攤提比率是否為 100
      if (this.totalPercent !== 100) {
        this.messageService.errorBubble('攤提比率加總必須為 100%');
        this.loading = false;
        return;
      }

      // 必須先執行 TableEditComponent 的驗證 (包含重複專櫃編號檢查)
      const valid = this.tableEditComponent.validateAndShowErrors();
      if (!valid) {
        this.loading = false;
        return;
      }

      // 呼叫 Service
      this.service.updateASS21020(updatePayload).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe({
        next: (res) => {
          if (res.Data.IsUpdateSuccess) {
            this.messageService.successBubble('能源攤提設定更新成功');
            this.onCancel(); // 成功後導回查詢頁或刷新
          } else {
            this.messageService.errorBubble(res.Data.ErrorMsg);
          }
        },
      });
    });
  }

  dialogVisible = false;
  dialogLoading = true;
  dialogData: Option[] = [];
  selectedItemsDialog: Option[] = [];
  dialogColumns: ReportColumn[] = [
    { field: 'TltNo', header: '專櫃編號', },
    { field: 'TltName', header: '櫃位名稱', },
    { field: 'LocationNo', header: '位置編號', },
    { field: 'ApplyNo', header: '招募編號', },
  ];
  totalRecords = 0;
  dialogQueryForm = this.formBuilder.nonNullable.group({
    TltNo: [null],
    TltName: [null],
    LocationNo: [null],
    ApplyNo: [null],
  })
  isRowSelectable(row: ASS21020Detail): boolean {
    return !this.data || !this.data.some((item: ASS21020Detail) => item.TalentId === row.TalentId);
  }
  saveDialog() {
    this.dialogVisible = false;
    this.data = [...this.data, ...this.selectedItemsDialog.map(item => ({
      TalentId: item['TalentId'] as number,
      TLT_No: item['TltNo'],
      TltName: item['TltName'], // <-- 已包含 TltName
      ApplyNo: item['ApplyNo'], // <-- 已包含 ApplyNo
      LocationNo: item['LocationNo'], // <-- 已包含 LocationNo
      TltSpace: item['TltSpace'],
      ENG_Rate: 0,
      ENG_Remark: null,
    }))];
    this.selectedItemsDialog = [];
    this.fieldChange(); // 選擇完畢後重新計算總比率
  }
  totalPercent = 0;
  errorMsg = false;

  // 【保留】私有方法：將數值四捨五入到小數點後兩位 (用於手動輸入檢查)
  private roundToTwoDecimals(num: number): number {
    return Math.round(num * 100) / 100;
  }

  // 【修正】 onAutoCalculate：改用整數分配邏輯，確保總和為 100
  public onAutoCalculate(): void {
    if (this.data.length === 0) {
      this.totalPercent = 0;
      this.errorMsg = true;
      return;
    }

    const length = this.data.length;

    // 1. 計算基礎整數比率 (向下取整)
    const baseRate = Math.floor(100 / length); // 例如: 100 / 7 = 14

    // 2. 計算剩餘需要分配的量 (餘數)
    const remainder = 100 % length; // 例如: 100 % 7 = 2

    this.data = this.data.map((item, index) => {
      let rate = baseRate;

      // 3. 將餘數分配給前 'remainder' 筆資料 (每筆 +1)
      if (index < remainder) {
        rate += 1;
      }

      return {
        ...item,
        ENG_Rate: rate, // 確保是整數
      };
    });

    // 4. 總和保證是 100 (因為分配邏輯已確保)
    this.totalPercent = 100;
    this.errorMsg = false;
  }

  // 【保留】 fieldChange：處理手動輸入 (可能含小數)，計算總和時對結果進行四捨五入，確保比對精確度
  public fieldChange(): void {
    // 計算總和，並對結果進行捨入 (保留小數點後兩位)
    const rawTotal = this.data.reduce((total, item) => total + (item.ENG_Rate || 0), 0);
    this.totalPercent = this.roundToTwoDecimals(rawTotal);

    // 檢查捨入後的總和是否為 100
    this.errorMsg = this.totalPercent !== 100;
  }

  private filterDialogData(query: { TltNo?: string | null, TltName?: string | null, LocationNo?: string | null, ApplyNo?: string | null }): void {
    if (!this.tltNoOptionsArray || this.tltNoOptionsArray.length === 0) {
      this.dialogData = [];
      this.totalRecords = 0;
      return;
    }

    // 將所有的篩選條件轉換為小寫，並確保空值為空字串
    const tltNo = (query.TltNo || '').toLowerCase();
    const tltName = (query.TltName || '').toLowerCase();
    const locationNo = (query.LocationNo || '').toLowerCase();
    const applyNo = (query.ApplyNo || '').toLowerCase();

    const filteredData = this.tltNoOptionsArray.filter(item => {
      const itemTltNo = (item['TltNo'] || '').toLowerCase();
      const itemTltName = (item['TltName'] || '').toLowerCase();
      const itemLocationNo = (item['LocationNo'] || '').toLowerCase();
      const itemApplyNo = (item['ApplyNo'] || '').toLowerCase();

      // 檢查每個欄位是否包含篩選條件 (如果條件為空，則始終通過該條件的篩選)
      const tltNoMatch = itemTltNo.includes(tltNo);
      const tltNameMatch = itemTltName.includes(tltName);
      const locationNoMatch = itemLocationNo.includes(locationNo);
      const applyNoMatch = itemApplyNo.includes(applyNo);

      return tltNoMatch && tltNameMatch && locationNoMatch && applyNoMatch;
    });

    this.dialogData = filteredData;
    this.totalRecords = filteredData.length;
  }
}
