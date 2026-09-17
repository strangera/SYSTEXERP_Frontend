import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core'; // 新增 OnDestroy
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS21020Service } from '@service/api/ass/ass21020.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { validateMinNumber, validateRequired } from '@shared/components/table-edit/validate-field.model';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { debounceTime, finalize, Subject } from 'rxjs';
import { ASS21020Data, ASS21020Detail, ASS21020Update, ASS21020UpdateData } from '../ass21020/ass21020.model';

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
export class ASS21020CRUComponent extends BasicCruPageComponent<ASS21020Data> implements OnInit, OnDestroy { // 實作 OnDestroy

  public readonly dataForm = this.formBuilder.nonNullable.group({
    ENG_Type: [null, [Validators.required]],
    ENG_MeterNo: [null as string | null, [Validators.required]],
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
  lastQueryBody: any = {}; // 用於比較，防止重複查詢
  public readonly columns: EditColumn[] = [
    { field: 'TLT_No', header: '專櫃編號', type: 'custom' },
    { field: 'TLT_Name', header: '櫃位名稱', },
    // { field: 'LocationNo', header: '位置編號', },
    {
      field: 'ENG_Rate', header: '比率', type: 'inputNumber', min: 0, max: 100, maxFractionDigits: 2,
      validate: [validateRequired, validateMinNumber(1)],
    },
    // { field: 'ENG_Remark', header: '專櫃招募編號', type: 'input', maxLength: 200, width: '100%', disabled: () => true },
  ];

  // string 【修正】用於處理 Dialog 查詢的延遲 Subject (使用 protected 或 private 確保內部使用)
  protected dialogQuerySubject = new Subject<any>();

  constructor(
    public readonly service: ASS21020Service,
    private readonly dropdown: DropdownApiService,
    public readonly dropDownListService: DropDownListService, // 注入 DropDownListService
    private readonly cdr: ChangeDetectorRef
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('ASS21020', this.dataForm);

    // 1. 取得所有錶號資料並保存，同時初始化篩選
    this.ENG_MeterNoOptions.pipe(untilDestroyed(this)).subscribe(options => {
      this.allENG_MeterNoOptions = options || [];
      this.filterMeterNoOptions(this.dataForm.controls.ENG_Type.value);

      if (!this.isFormCreateable && this.rowdata && this.rowdata.ENG_MeterNo) {
        this.updateMeterNoRelatedFields(this.rowdata.ENG_MeterNo);
      }
    });

    // 2. 初始化 Dialog 相關屬性 (保持不變)
    this.tltNoOptionsArray = [];
    this.dialogData = [];
    this.totalRecords = 0;
    this.dialogLoading = false;

    // 3. 監聽 ENG_Type 變化來篩選錶號 (保持不變)
    if (this.isFormCreateable) {
      this.dataForm.controls.ENG_Type.valueChanges.pipe(untilDestroyed(this)).subscribe(engType => {
        this.filterMeterNoOptions(engType);
        this.dataForm.controls.ENG_MeterNo.patchValue(null);
      });
    }

    // 4. 監聽 ENG_MeterNo 變化來更新附帶資訊 (保持不變)
    this.dataForm.controls.ENG_MeterNo.valueChanges.pipe(untilDestroyed(this)).subscribe((meterNo) => {
      this.updateMeterNoRelatedFields(meterNo);
    });

    // 5. 監聽 Dialog 查詢表單 (改用 Debounce 呼叫 API)
    this.dialogQueryForm.valueChanges.pipe(untilDestroyed(this)).subscribe(query => {
      // 僅當 TltNo 變化時才發送，或當分頁/排序參數變化時發送
      this.dialogQuerySubject.next(query);
    });

    // 訂閱 Subject，應用 debounceTime(300ms) 後才呼叫 API
    this.dialogQuerySubject.pipe(debounceTime(300), untilDestroyed(this)).subscribe(query => {
      this.loadDialogData(query);
    });

    if (!this.isFormCreateable) {
      this.data = this.rowdata?.Details || [];
      this.dataForm.disable();
    }
  }

  // string 【新增】實作 OnDestroy 以清理 Subject 訂閱
  public ngOnDestroy(): void {
    // 由於您對 dialogQuerySubject 使用了 untilDestroyed(this)，
    // 只要 BasicCruPageComponent 或 Angular 本身有正確實現 OnDestroy，即可自動清理。
    // 為了程式碼的完整性，我們假設 BasicCruPageComponent 處理了大多數，但對於 Subject 還是手動清理一下。
    this.dialogQuerySubject.complete();
  }

  public openDialog(): void {
    this.editingRowIndex = -1;
    this.openDialogCore();
  }

  public openEditDialog(rowIndex: number): void {
    this.editingRowIndex = rowIndex;
    this.openDialogCore();
  }

  private openDialogCore(): void {
    const currentEngType = this.dataForm.controls.ENG_Type.value;
    if (!currentEngType) {
      this.messageService.errorBubble('請先選擇能源類型');
      return;
    }

    this.dialogVisible = true;
    this.dialogData = [];
    this.selectedItemsDialog = [];
    this.lastQueryBody = {};

    const initialQuery = {
      TltNo: null,
      ENG_Type: currentEngType,
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'tlt_no', order: 1 }],
    };

    this.dialogQueryForm.patchValue(initialQuery);
    this.loadDialogData(initialQuery);
  }

  // 新增方法: 根據 ENG_MeterNo 更新相關欄位 (保持不變)
  private updateMeterNoRelatedFields(meterNo: string | null): void {
    const selectedOption = this.allENG_MeterNoOptions.find(opt => opt.value === meterNo);

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

  // 根據能源類型代碼篩選可用的錶號選項 (保持不變)
  private filterMeterNoOptions(engType: string | null): void {
    if (!engType) {
      this.filteredENG_MeterNoOptions = this.allENG_MeterNoOptions;
      return;
    }

    const engTypeOption = this.ENG_TypeOptions.find(opt => opt.value === engType);
    const engTypeDesc = engTypeOption?.label;

    if (engTypeDesc) {
      this.filteredENG_MeterNoOptions = this.allENG_MeterNoOptions.filter(
        item => item['ENG_Type'] === engTypeDesc
      );
      console.log('filteredENG_MeterNoOptions:', this.filteredENG_MeterNoOptions);
    } else {
      this.filteredENG_MeterNoOptions = this.allENG_MeterNoOptions;
    }
  }

  // 【修正 validateRow】: 檢查資料中是否有重複的 TLT_No (專櫃編號) (保持不變)
  validateRow = (rowData: ASS21020Detail): { isValid: boolean, errorMessage: string } => {
    const currentRowTLT_No = rowData.TLT_No;
    const rowIndex = this.data.indexOf(rowData);

    const isDuplicate = this.data.some((item, index) => {
      if (index === rowIndex) {
        return false;
      }
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
      const headerData = frm.getRawValue();

      const payload: ASS21020UpdateData[] = this.data.map(detail => ({
        Id: detail.Id || 0,
        ENG_Type: headerData.ENG_Type,
        ENG_MeterNo: headerData.ENG_MeterNo,
        TLT_No: detail.TLT_No || '',
        ENG_Rate: detail.ENG_Rate || 0,
        ENG_Remark: detail.ENG_Remark || '',
        TalentId: detail.TalentId || 0,
      }));

      const updatePayload: ASS21020Update = { UpdateASS21020Datas: payload };

      const rawTotal = this.data.reduce((total, item) => total + (item.ENG_Rate || 0), 0);
      this.totalPercent = this.roundToTwoDecimals(rawTotal);

      if (this.totalPercent !== 100) {
        this.messageService.errorBubble('攤提比率加總必須為 100%');
        this.loading = false;
        return;
      }

      const valid = this.tableEditComponent.validateAndShowErrors();
      if (!valid) {
        this.loading = false;
        return;
      }

      this.service.updateASS21020(updatePayload).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe({
        next: (res) => {
          if (res.Data.IsUpdateSuccess) {
            // 只要有一筆Id不為0就是更新成功，Id都是0就是新增成功
            if (payload.some(item => item.Id !== 0)) {
              this.messageService.successBubble('能源攤提設定更新成功');
              this.onCancel();
            } else {
              this.messageService.successBubble('能源攤提設定新增成功');
              this.dataForm.reset();
              this.data = [];
              this.selectedItems = [];
            }
          } else {
            this.messageService.errorBubble(res.Data.ErrorMsg);
          }
        },
      });
    });
  }

  editingRowIndex = -1;

  dialogVisible = false;
  dialogLoading = true;
  dialogData: Option[] = [];
  selectedItemsDialog: Option[] = [];
  dialogColumns: ReportColumn[] = [
    { field: 'TltNo', header: '專櫃編號', },
    { field: 'TltName', header: '櫃位名稱', },
    { field: 'LocationNo', header: '位置編號', },
  ];
  totalRecords = 0;

  // string 【修正】移除不必要的預設值，在 openDialog 中設置
  dialogQueryForm = this.formBuilder.nonNullable.group({
    TltNo: [null as string | null],
    ENG_Type: [null as string | null], // 新增 ENG_Type
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[{ field: 'tlt_no', order: 1 }]],
  })

  // string 【修正】處理 TableReportComponent 的 lazyLoadData 事件
  public onDialogLazyLoad(event: any): void {
    // 將分頁/排序參數補到 dialogQueryForm，這將觸發 dialogQuerySubject -> loadDialogData
    this.dialogQueryForm.patchValue({
      pageSize: event.rows,
      pageIndex: (event.first / event.rows) + 1,
      // 統一 SortBy 格式
      SortBy: event.multiSortMeta || event.sortField && event.sortOrder ?
        (event.multiSortMeta || [{ field: event.sortField, order: event.sortOrder }]) :
        [{ field: 'tlt_no', order: 1 }]
    });
  }

  // string 【修正】: 使用 API 查詢 Dialog 資料 (增加防止重複查詢的邏輯)
  private loadDialogData(query: { TltNo?: string | null, ENG_Type?: string | null, pageSize?: number, pageIndex?: number, SortBy?: any[] }): void {

    const body = {
      TltNo: query.TltNo || '',
      ENG_Type: query.ENG_Type || '', // 新增 ENG_Type
      pageSize: query.pageSize || 30,
      pageIndex: query.pageIndex || 1,
      SortBy: query.SortBy || [{ field: 'tlt_no', order: 1 }],
    };

    // 比較當前查詢條件與上次是否一致，防止 debounce 後的重複查詢
    if (JSON.stringify(body) === JSON.stringify(this.lastQueryBody)) {
      return;
    }

    this.dialogLoading = true;
    this.lastQueryBody = body; // 更新最後的查詢條件

    // 呼叫 API 查詢
    this.dropDownListService.queryTLTTALENT_TLT_SPACE(body)
      .pipe(
        untilDestroyed(this),
        finalize(() => this.dialogLoading = false)
      )
      .subscribe((results) => {
        this.dialogData = results.Data as Option[];
        this.totalRecords = results.TotalCount;
      });
  }
  // ⬆️ 【修正結束】

  isRowSelectable(row: ASS21020Detail): boolean {
    if (this.editingRowIndex >= 0) {
      const currentTalentId = this.data[this.editingRowIndex]?.TalentId;
      if (row['TalentId'] === currentTalentId) return true;
    }
    return !this.data || !this.data.some((item: ASS21020Detail) => item.TalentId === row['TalentId']);
  }

  saveDialog() {
    this.dialogVisible = false;

    if (this.editingRowIndex >= 0 && this.selectedItemsDialog.length > 0) {
      const item = this.selectedItemsDialog[0];
      this.data = this.data.map((row, i) => i === this.editingRowIndex ? {
        ...row,
        TalentId: item['TalentId'] as number,
        TLT_No: item['TltNo'],
        TLT_Name: item['TltName'],
        ApplyNo: item['ApplyNo'],
        LocationNo: item['LocationNo'],
        TltSpace: item['TltSpace'],
        ENG_Remark: item['ApplyNo'] || null,
      } : row);
      this.editingRowIndex = -1;
    } else {
      this.data = [...this.data, ...this.selectedItemsDialog.map(item => ({
        Id: 0,
        TalentId: item['TalentId'] as number,
        TLT_No: item['TltNo'],
        TLT_Name: item['TltName'],
        ApplyNo: item['ApplyNo'],
        LocationNo: item['LocationNo'],
        TltSpace: item['TltSpace'],
        ENG_Rate: 0,
        ENG_Remark: item['ApplyNo'] || null,
      }))];
    }

    this.selectedItemsDialog = [];
    this.fieldChange();
  }
  totalPercent = 0;
  errorMsg = false;

  // 【保留】私有方法：將數值四捨五入到小數點後兩位
  private roundToTwoDecimals(num: number): number {
    return Math.round(num * 100) / 100;
  }

  // 【保留】 onAutoCalculate：改用整數分配邏輯
  public onAutoCalculate(): void {
    if (this.data.length === 0) {
      this.totalPercent = 0;
      this.errorMsg = true;
      return;
    }

    const length = this.data.length;

    const baseRate = Math.floor(100 / length);
    const remainder = 100 % length;

    this.data = this.data.map((item, index) => {
      let rate = baseRate;

      if (index < remainder) {
        rate += 1;
      }

      return {
        ...item,
        ENG_Rate: rate,
      };
    });

    this.totalPercent = 100;
    this.errorMsg = false;
    this.cdr.detectChanges();
  }

  // 【保留】 fieldChange：處理手動輸入
  public fieldChange(): void {
    const rawTotal = this.data.reduce((total, item) => total + (item.ENG_Rate || 0), 0);
    this.totalPercent = this.roundToTwoDecimals(rawTotal);

    this.errorMsg = this.totalPercent !== 100;
  }
}
