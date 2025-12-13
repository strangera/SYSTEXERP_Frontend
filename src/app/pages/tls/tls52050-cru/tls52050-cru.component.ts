import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IPOS2004DetailData, Tls52010Service } from '@service/api/tls/tls52010.service';
import { getSYS1000 } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateMinNumber, validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { tomorrow } from '@shared/models/system/query-form.model';
import { ValidationService } from '@shared/service/validation.service';
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';
import { debounceTime, distinctUntilChanged, finalize, merge, of, switchMap } from 'rxjs';
import { IInsertTLS52050Detail, IQueryTLS52050DetailData, IQueryTLS52050DetailRequest, ITLS52050Data, IUpdateTLS52050Detail, Tls52050Service } from '../../../service/api/tls/tls52050.service';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import { DropdownTableComponent, FieldsConfig } from '../../../shared/componentkit/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '../../../shared/componentkit/input-textarea/input-textarea.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { columnGroup } from './tls52050-cru.model';

@Component({
  selector: 'app-tls52050-cru',
  templateUrl: './tls52050-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    InputTextareaComponent,
    CalendarRangeComponent,
    CheckboxModule,
    CalendarComponent,
    InputNumberComponent,
    TableComponent,
    NgIf,
    DialogComponent,
    DropdownTableComponent,
    TranslateModule,
    AsyncPipe,
    TableEditComponent
  ],
})
export class TLS52050CRUComponent extends BasicCruPageComponent<ITLS52050Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    MAM_No: [{ value: '系統自動產生', disabled: true }], // 變價單號
    VEN_No: [null, [Validators.required]], // 廠商代號
    LOGO_No: [null, [Validators.required]], // 品牌代碼
    MAM_Method: ['H'], // 是否為永久變價
    MAM_BegDate: [tomorrow, [Validators.required, this.validationService.timeGreaterThanValidator(new Date())]], // 生效起始日期
    MAM_EndDate: [null, [Validators.required, this.validationService.timeGreaterThanValidator(new Date())]], // 生效結束日期
    MAM_Remark: ['', [Validators.required]], // 進價變價單說明
    MAM_Status: ['0'],
    MAM_Type: ['3'],
    MAM_Source: ['1'],
    MAM_DateType: ['1'],
    MAM_Week1: ['N'],
    MAM_Week2: ['N'],
    MAM_Week3: ['N'],
    MAM_Week4: ['N'],
    MAM_Week5: ['N'],
    MAM_Week6: ['N'],
    MAM_Week7: ['N'],
    MAM_Day: [0],
    APPLY_Date: [{ value: new Date(), disabled: true }], // 申請日期
    APPLY_USR_No: [{ value: this.authService.currentUserValue?.user_No, disabled: true }], // 申請人
    // 進價折扣、進價金額調整、售價折扣、售價金額調整
    costPriceDiscount: [0, [Validators.min(0), Validators.max(99)]], // 進價折扣%
    costPriceAmount: [0], // 進價金額調整
    salePriceDiscount: [0, [Validators.min(0), Validators.max(99)]], // 售價折扣%
    salePriceAmount: [0], // 售價金額調整
  },);
  brandOptions = this.dropdown.queryPluLogo(); // 品牌
  vendorOptions = this.dropdown.queryPos2013({ VEN_Flag: '' }); // 廠商編號
  originalData: IInsertTLS52050Detail[] | IUpdateTLS52050Detail[] = [];
  data: IInsertTLS52050Detail[] | IUpdateTLS52050Detail[] = [];
  selectedItems: IInsertTLS52050Detail[] | IUpdateTLS52050Detail[] = [];
  editColumns: EditColumn[] = [
    {
      field: 'PLU_No', header: '國際條碼',
      width: '150px',
      type: 'input',
      onBlur: (rowData: IPOS2004DetailData, value: string, col: EditColumn, index: number) => this.onPLU_MagNoBlur(rowData, value, col, index),
      validate: [validateRequired],
    },
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'CAT_LNo', header: '大分類代號' },
    { field: 'CAT_LName', header: '大分類名稱' },
    { field: 'CAT_MNo', header: '中分類代號' },
    { field: 'CAT_MName', header: '中分類名稱' },
    { field: 'CAT_SNo', header: '小分類代號' },
    { field: 'CAT_SName', header: '小分類名稱' },
    { field: 'PLU_OrderPrcRate', header: '進價折數' },
    { field: 'PLU_OrderPrc', header: '調整前進價', groupField: 'OrderPrc' },
    { field: 'MAM_OrderPrc', header: '調整後進價', type: 'inputNumber', groupField: 'OrderPrc', width: '100px', maxLength: 8, minFractionDigits: 2, maxFractionDigits: 2, validate: [validateRequired, validateMinNumber(1)] },
    { field: 'PLU_SalePrc', header: '調整前售價', groupField: 'SalePrc' },
    { field: 'MAM_UnitPrc', header: '調整後售價', type: 'inputNumber', groupField: 'SalePrc', width: '100px', maxLength: 8, validate: [validateRequired, validateMinNumber(1)] },
    { field: 'MAD_Remark', header: '單項說明', type: 'input', width: '120px', maxLength: 200 }
  ];
  columnGroup = columnGroup;
  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly tls52050Service: Tls52050Service,
    private readonly tls52010Service: Tls52010Service,
    public readonly dropdown: DropdownApiService,
    private readonly validationService: ValidationService,
    private readonly cdr: ChangeDetectorRef
  ) {
    super();
  }
  validateEntireRow = (rowData: IInsertTLS52050Detail): { isValid: boolean, errorMessage: string; } => {
    const hasDuplicatePLU_MagNo = this.data.some((item: IInsertTLS52050Detail) =>
      item.PLU_MagNo === rowData.PLU_MagNo && item._TABLE_KEY !== rowData._TABLE_KEY);
    if (hasDuplicatePLU_MagNo) {
      return { isValid: false, errorMessage: '商品管理編號重複' };
    }

    return { isValid: true, errorMessage: '' };
  };
  onPLU_MagNoBlur(rowData: IPOS2004DetailData, value: string, col: EditColumn, index: number) {
    const venNo = this.dataForm.controls.VEN_No.value;
    const logoNo = this.dataForm.controls.LOGO_No.value;

    if (!venNo || !logoNo || !value) {
      return;
    }
    const body = {
      VEN_No: venNo,
      queryNo: value,
      LOGO_No: logoNo,
    };

    // 1. 將整個非同步流程延遲執行
    setTimeout(() => {
      // 再次檢查，防止延遲期間欄位被清除
      if (!this.dataForm.controls.VEN_No.value || !this.dataForm.controls.LOGO_No.value || !value) {
        return;
      }

      this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
        if (results.Data && results.Data.length > 0) {
          const newData = results.Data[0];
          const body2 = { // 使用 body2 避免與外部的 body 混淆
            VEN_No: venNo,
            LOGO_No: logoNo,
            PLU_MagNo: newData.PLU_MagNo,
          };
          this.tls52050Service.queryTLS52050Detail(body2).pipe(untilDestroyed(this)).subscribe((results2) => {
            const detailData = results2.Data[0];

            const updatedProps = {
              // 這是您從結果中構建的新物件屬性
              ID: 0,
              PLU_MagNo: detailData.PLU_MagNo,
              PLU_No: detailData.PLU_No,
              PLU_Name: detailData.PLU_Name,
              CAT_LNo: detailData.CAT_LNo,
              CAT_LName: detailData.CAT_LName,
              CAT_MNo: detailData.CAT_MNo,
              CAT_MName: detailData.CAT_MName,
              CAT_SNo: detailData.CAT_SNo,
              CAT_SName: detailData.CAT_SName,
              PLU_OrderPrcRate: Number(detailData.PLU_OrderPrcRate),
              PLU_OrderPrc: Number(detailData.PLU_OrderPrc),
              MAM_OrderPrc: Number(detailData.PLU_OrderPrc), // 注意這裡使用的是 PLU_OrderPrc
              PLU_SalePrc: Number(detailData.PLU_SalePrc),
              MAM_UnitPrc: Number(detailData.PLU_SalePrc), // 注意這裡使用的是 PLU_SalePrc
              MAD_Remark: ''
            };

            // *** 修正點 1：使用 Object.assign 在原地更新行物件的屬性 ***
            Object.assign(this.data[index], updatedProps);

            // *** 修正點 2：替換 data 的引用，通知通用表格元件更新 ***
            this.data = [...this.data];
            this.cdr.detectChanges();
          });
        } else {
          this.messageService.errorBubble('查無該商品資訊');

          // *** 修正點 3：使用 Object.assign 在原地清空欄位值 ***
          Object.assign(this.data[index], {
            PLU_MagNo: '',
            PLU_OrderPrcRate: 0,
            PLU_OrderPrc: 0,
            MAM_OrderPrc: 0,
            PLU_SalePrc: 0,
            MAM_UnitPrc: 0,
            MAD_Remark: ''
          });

          // *** 修正點 4：替換 data 的引用，通知通用表格元件更新 ***
          this.data = [...this.data];
          this.cdr.detectChanges();
        }
      });
    }, 50); // 延遲 50 毫秒

  }

  ngOnInit(): void {
    this.initializePage('TLS52050', this.dataForm);
    // 監聽 MAM_Method 是否為永久變價
    this.dataForm.controls.MAM_Method.valueChanges.pipe(untilDestroyed(this)).subscribe(value => {
      if (!this.isFormCreateable) {
        return;
      }
      const MAM_EndDate = this.dataForm.controls.MAM_EndDate;
      MAM_EndDate.setValue(null);
      if (value === '1') {
        MAM_EndDate.disable();
      } else {
        MAM_EndDate.enable();
      }
    });
    if (!this.isFormCreateable) {
      if (this.rowdata?.MAM_Status === '0') {
        this.dataForm.controls.VEN_No.disable();
        this.dataForm.controls.LOGO_No.disable();
        if (this.dataForm.controls.MAM_BegDate.value < new Date()) {
          this.dataForm.controls.MAM_BegDate.disable();
          this.dataForm.controls.MAM_EndDate.disable();
          this.dataForm.controls.MAM_Method.disable();
        }
      }
      if (this.rowdata?.MAM_Method === '1') {
        this.dataForm.controls.MAM_EndDate.disable();
      }
      if (this.rowdata?.MAM_No) {
        this.tls52050Service.queryTLS52050UpdateDetail(this.rowdata?.MAM_No).pipe(untilDestroyed(this)).subscribe(response => {
          this.data = response.Data.map(item => ({ ...item, id: Number(item.id) }));
          this.originalData = JSON.parse(JSON.stringify(this.data));
        });
      }
    }
    this.setupFormLogic();
    this.setupDialogLogic();
  }
  private setupFormLogic(): void {
    this.dataForm.controls.LOGO_No.valueChanges.pipe(untilDestroyed(this), distinctUntilChanged()).subscribe(value => {
      if (value) {
        this.vendorOptions = this.dropdown.queryPos2013LOGO_No({ LOGO_No: value });
      } else {
        this.vendorOptions = of([]);
      }
    });
    this.dataForm.controls.MAM_Method.valueChanges.pipe(untilDestroyed(this), distinctUntilChanged()).subscribe(value => {
      const isPermanent = value === '1';
      this.dataForm.controls.MAM_EndDate.setValue(null);
      if (isPermanent) {
        this.dataForm.controls.MAM_EndDate.disable();
      } else {
        this.dataForm.controls.MAM_EndDate.enable();
      }
    });
    this.setupPriceFields('costPriceDiscount', 'costPriceAmount', this.roundToTwo);
    this.setupPriceFields('salePriceDiscount', 'salePriceAmount', this.roundToInt);
  }
  private setupPriceFields(discountControl: string, amountControl: string, roundingFn: (value: number) => number): void {
    const controls: Record<string, AbstractControl> = this.dataForm.controls;
    const discountCtrl = controls[discountControl];
    const amountCtrl = controls[amountControl];
    merge(discountCtrl.valueChanges, amountCtrl.valueChanges).pipe(untilDestroyed(this), distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))).subscribe(() => {
      const hasDiscountValue = discountCtrl.value;
      const hasAmountValue = amountCtrl.value;
      if (hasDiscountValue) {
        amountCtrl.disable({ emitEvent: false });
      } else {
        amountCtrl.enable({ emitEvent: false });
      }
      if (hasAmountValue) {
        discountCtrl.disable({ emitEvent: false });
      } else {
        discountCtrl.enable({ emitEvent: false });
      }
      this.data.forEach(row => {
        if (hasDiscountValue) {
          const originalPrice = discountControl === 'costPriceDiscount' ? row.PLU_OrderPrc : row.PLU_SalePrc;
          row[discountControl === 'costPriceDiscount' ? 'MAM_OrderPrc' : 'MAM_UnitPrc'] = roundingFn((originalPrice ?? 0) * discountCtrl.value / 100);
        } else if (hasAmountValue) {
          const originalPrice = amountControl === 'costPriceAmount' ? row.PLU_OrderPrc : row.PLU_SalePrc;
          row[amountControl === 'costPriceAmount' ? 'MAM_OrderPrc' : 'MAM_UnitPrc'] = roundingFn(originalPrice + amountCtrl.value);
        } else { // 還原成0
          row[discountControl === 'costPriceDiscount' ? 'MAM_OrderPrc' : 'MAM_UnitPrc'] = 0;
        }
      });
      this.data = [...this.data];
    });
  }
  private setupDialogLogic(): void {
    this.dropDownListService.queryPOS2003_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.CAT_LNoOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
    this.dialogQueryForm.controls.CAT_LNo.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), untilDestroyed(this), switchMap(lNo => {
      if (lNo) {
        this.dialogQueryForm.controls.CAT_MNo.enable();
        this.dialogQueryForm.controls.CAT_MNo.setValue(null);
        this.dialogQueryForm.controls.CAT_SNo.setValue(null);
        return this.dropDownListService.queryPOS20031_DropDownList({ CAT_LNo: [lNo] });
      } else {
        this.dialogQueryForm.controls.CAT_MNo.disable();
        this.dialogQueryForm.controls.CAT_SNo.disable();
        return of(null);
      }
    })
    ).subscribe(response => {
      this.CAT_MNoOptions = response ? response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` })) : [];
    });

    this.dialogQueryForm.controls.CAT_MNo.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), untilDestroyed(this), switchMap(mNo => {
      if (mNo && this.dialogQueryForm.controls.CAT_LNo.value) {
        this.dialogQueryForm.controls.CAT_SNo.enable();
        return this.dropDownListService.queryPOS20032_DropDownList({
          CATList: [
            {
              CAT_LNo: this.dialogQueryForm.controls.CAT_LNo.value,
              CAT_MNo: mNo
            }
          ]
        });
      } else {
        this.dialogQueryForm.controls.CAT_SNo.disable();
        return of(null);
      }
    })).subscribe(response => {
      this.CAT_SNoOptions = response ? response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` })) : [];
    });
  }
  private roundToTwo(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private roundToInt(value: number): number {
    return Math.round(value);
  }
  dialogVisible = false;
  dialogQueryForm = this.formBuilder.group({
    PLU_MagNo: ['', [Validators.maxLength(20)]], // 商品管理編號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    CAT_LNo: [null], // 大分類代碼
    CAT_MNo: [{ value: null, disabled: true }], // 中分類代碼
    CAT_SNo: [{ value: null, disabled: true }], // 小分類代碼
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  CAT_LNoOptions: IDropdownItem[] = [];
  CAT_MNoOptions: IDropdownItem[] = [];
  CAT_SNoOptions: IDropdownItem[] = [];
  dialogData: IQueryTLS52050DetailData[] = [];
  selectedItemsDialog: IQueryTLS52050DetailData[] = [];
  dialogColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'UNIT_NAME', header: '單位' },
    { field: 'PLU_BoxQty', header: '包裝入數' },
    { field: 'PLU_StockTaxType', header: '稅別', format: (value) => getSYS1000('PLU_StockTaxType', value) },
    { field: 'PLU_OrderPrc', header: '單價', showSort: false },
    { field: 'PLU_SalePrc', header: '售價' },
  ];
  dialogLoading = false;
  loadDialogData() {
    // 獲取大分類下拉選項
    this.dropDownListService.queryPOS2003_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.CAT_LNoOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
    });
    // 監聽大分類變化
    this.dialogQueryForm.controls.CAT_LNo.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((value) => {
      this.dialogQueryForm.controls.CAT_MNo.setValue(null); // 清空中分類選擇
      this.dialogQueryForm.controls.CAT_SNo.setValue(null); // 清空中分類選擇
      if (value) {
        this.dropDownListService.queryPOS20031_DropDownList({ CAT_LNo: [value] }).pipe(untilDestroyed(this)).subscribe(response => {
          this.CAT_MNoOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
          this.dialogQueryForm.controls.CAT_MNo.enable();
        });
      } else {
        this.dialogQueryForm.controls.CAT_MNo.disable();
      }
    });
    // 監聽中分類變化
    this.dialogQueryForm.controls.CAT_MNo.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((value) => {
      this.dialogQueryForm.controls.CAT_SNo.setValue(null); // 清空中分類選擇
      if (value && this.dialogQueryForm.controls.CAT_LNo.value) {
        this.dropDownListService.queryPOS20032_DropDownList({
          CATList: [
            {
              CAT_LNo: this.dialogQueryForm.controls.CAT_LNo.value,
              CAT_MNo: value
            }
          ]
        }).pipe(untilDestroyed(this)).subscribe(response => {
          this.CAT_SNoOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
        });
        this.dialogQueryForm.controls.CAT_SNo.enable();
      } else {
        this.dialogQueryForm.controls.CAT_SNo.disable();
      }
    });
  }
  onQuery(frm: FormGroup) {
    this.dialogLoading = true;
    const body = {
      VEN_No: this.dataForm.controls.VEN_No.value,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      ...frm.getRawValue(),
    } as IQueryTLS52050DetailRequest;
    this.tls52050Service.queryTLS52050Detail(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
      this.dialogData = response.Data;
      this.totalRecords = response.TotalCount;
    });
  }
  saveDialog() {
    this.dialogVisible = false;
    this.data = [...this.data, ...this.selectedItemsDialog.map(item => ({
      ID: 0,
      PLU_MagNo: item.PLU_MagNo,
      PLU_Name: item.PLU_Name,
      CAT_LNo: item.CAT_LNo,
      CAT_LName: item.CAT_LName,
      CAT_MNo: item.CAT_MNo,
      CAT_MName: item.CAT_MName,
      CAT_SNo: item.CAT_SNo,
      CAT_SName: item.CAT_SName,
      PLU_OrderPrcRate: Number(item.PLU_OrderPrcRate),
      PLU_OrderPrc: Number(item.PLU_OrderPrc),
      MAM_OrderPrc: Number(item.PLU_OrderPrc),
      PLU_SalePrc: Number(item.PLU_SalePrc),
      MAM_UnitPrc: Number(item.PLU_SalePrc), // *** 已修改：預設為調整前售價 ***
      MAD_Remark: ''
    }))];
    this.selectedItemsDialog = [];
    this.selectedItems = [];
  }
  isRowSelectable(event: IInsertTLS52050Detail): boolean {
    return !this.data || !this.data.some((item: IInsertTLS52050Detail) => item.PLU_MagNo === event.PLU_MagNo);
  }
  opLoading = false;
  opForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 商品管理編號/國際條碼/廠商貨號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  suggestions: { PLU_MagNo: string, PLU_No: string, PLU_OrgPLUNo: string, PLU_Name: string; }[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_MagNo', header: '商品管理編號/國際條碼/廠商貨號 - 商品名稱', mainDataField: true },
  ];
  opData: { PLU_MagNo: string, PLU_No: string, PLU_OrgPLUNo: string, PLU_Name: string; }[] = [];// overlayPanel 裡面的table
  opColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
    { field: 'PLU_Name', header: '商品名稱' },
  ];
  opTotalRecords = 0;
  onAutoCompleteInputChange(event: any) {
    const body = {
      ...event,
      VEN_No: this.dataForm.controls.VEN_No.value,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      queryNo: event.PLU_MagNo || '',
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_MagNo', order: 1 }],
    };
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = [...results.Data.map(item => ({
        ...item,
        label: item.PLU_MagNo + '/' + item.PLU_No + '/' + item.PLU_OrgPLUNo + ' - ' + item.PLU_Name
      }))];
    });
  }
  onformValueChanged(event: { queryNo: string, PLU_Name: string, pageIndex: number, pageSize: number, SortBy: { field: string, order: number; }[]; }) {
    this.opLoading = true;
    const body = {
      ...event,
      VEN_No: this.dataForm.controls.VEN_No.value,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
    };
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.opData = [...results.Data]; // 更新data資料
      this.opTotalRecords = results.TotalCount;
      this.opLoading = false;
    });
  }
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  // onShowDialog
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const valid = this.tableEditComponent.validateAndShowErrors();
      if (!valid) {
        this.loading = false;
        return;
      }
      const body = {
        ...frm.getRawValue(),
        ID: this.isFormCreateable ? undefined : Number(this.rowdata?.Id),
        MAM_No: this.isFormCreateable ? undefined : this.rowdata?.MAM_No,
        details: this.data.map(item => ({
          ID: Number(item.id) || 0,
          PLU_MagNo: item.PLU_MagNo,
          PLU_OrderPrcRate: item.PLU_OrderPrcRate,
          PLU_OrderPrc: item.PLU_OrderPrc,
          MAM_OrderPrc: item.MAM_OrderPrc,
          PLU_SalePrc: item.PLU_SalePrc,
          MAM_UnitPrc: item.MAM_UnitPrc,
          MAD_Remark: item.MAD_Remark
        }))
      };
      const $request = this.isFormCreateable ? this.tls52050Service.insertTLS52050(body) : this.tls52050Service.updateTLS52050(body);
      $request.pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.messageService.successBubble(response.Message);
        if (this.isFormCreateable) {
          this.dataForm.reset();
          this.data = [];
        } else {
          this.onCancel();
        }
      });
    });
  }
  onReset() {
    this.data = JSON.parse(JSON.stringify(this.originalData));
  }
}
