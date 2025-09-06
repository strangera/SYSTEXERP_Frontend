import { ValidationService } from '@shared/service/validation.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ITLS52050Data, Tls52050Service } from '../../../service/api/tls/tls52050.service';
import { Column, createPaginationConfig, RowEditSaveEvent } from '../../../shared/componentkit/table/table.model';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { debounceTime, distinctUntilChanged, finalize, merge, Observable, of, switchMap } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextareaComponent } from '../../../shared/componentkit/input-textarea/input-textarea.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { AsyncPipe, NgIf } from '@angular/common';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import { DropdownTableComponent } from '../../../shared/componentkit/dropdown-table/dropdown-table.component';
import { TranslateModule } from '@ngx-translate/core';
import { tomorrow } from '@shared/models/system/query-form.model';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { columnGroup, columns } from './tls52050-cru.model';
import { Tls52010Service } from '@service/api/tls/tls52010.service';
import { Tls52020Service } from '@service/api/tls/tls52020.service';

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
    AsyncPipe
  ],
})
export class TLS52050CRUComponent extends BasicCruPageComponent<ITLS52050Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    MAM_No: [{ value: '系統自動產生', disabled: true }],  // 變價單號
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
  brandOptions?: Observable<Option[] | null>;   // 品牌
  vendorOptions?: Observable<Option[] | null>;  // 廠商編號
  data: any[] = [
    { id: 1, MID: "0", MAM_No: "MAM202310010001", SYS_StoreNo: "10", PLU_MagNo: "PLU202310010001", PLU_Name: "商品名稱", CAT_LNo: "01", CAT_MNo: "01", CAT_SNo: "01", PLU_OrderPrcRate: 50, PLU_OrderPrc: 500, MAM_OrderPrc: 0, PLU_SalePrc: 450, MAM_UnitPrc: 0, MAD_Remark: "單項說明", }
  ];
  selectedItems: any[] = [];
  columns = columns;
  columnGroup = columnGroup;
  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly tls52050Service: Tls52050Service,
    private readonly tls52010Service: Tls52010Service,
    private readonly tls52020Service: Tls52020Service,
    public readonly dropdown: DropdownApiService,
    private readonly validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS52050', this.dataForm);
    this.brandOptions = this.dropdown.queryPluLogo();// 品牌代碼 (LOGO_No)
    this.vendorOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });// 廠商編號 (VEN_No)
    // 監聽 MAM_Method 是否為永久變價
    this.dataForm.controls.MAM_Method.valueChanges.pipe(untilDestroyed(this)).subscribe(value => {
      const MAM_EndDate = this.dataForm.controls.MAM_EndDate;
      MAM_EndDate.setValue(null);
      if (value === '1') {
        MAM_EndDate.disable();
      } else {
        MAM_EndDate.enable();
      }
    });
    this.setupFormLogic();
    this.setupDialogLogic();
  }
  private setupFormLogic(): void {
    const controls = this.dataForm.controls;
    controls.MAM_Method.valueChanges.pipe(untilDestroyed(this), distinctUntilChanged()).subscribe(value => {
      const isPermanent = value === '1';
      controls.MAM_EndDate.setValue(null);
      if (isPermanent) {
        controls.MAM_EndDate.disable()
      } else {
        controls.MAM_EndDate.enable();
      }
    });
    this.setupPriceFields('costPriceDiscount', 'costPriceAmount', this.roundToTwo);
    this.setupPriceFields('salePriceDiscount', 'salePriceAmount', this.roundToInt);
  }
  private setupPriceFields(discountControl: string, amountControl: string, roundingFn: (value: number) => number): void {
    const controls: any = this.dataForm.controls;
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
          row[discountControl === 'costPriceDiscount' ? 'MAM_OrderPrc' : 'MAM_UnitPrc'] = roundingFn(originalPrice * discountCtrl.value / 100);
        } else if (hasAmountValue) {
          const originalPrice = amountControl === 'costPriceAmount' ? row.PLU_OrderPrc : row.PLU_SalePrc;
          row[amountControl === 'costPriceAmount' ? 'MAM_OrderPrc' : 'MAM_UnitPrc'] = roundingFn(originalPrice + amountCtrl.value);
        } else { // 還原成0
          row[discountControl === 'costPriceDiscount' ? 'MAM_OrderPrc' : 'MAM_UnitPrc'] = 0;
        }
      });
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
      if (mNo) {
        this.dialogQueryForm.controls.CAT_SNo.enable();
        return this.dropDownListService.queryPOS20032_DropDownList({ CAT_LNo: [this.dialogQueryForm.controls.CAT_LNo.value || ''], CAT_MNo: [mNo] });
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
  onRowEditSave(event: RowEditSaveEvent) {
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
  dialogData: any[] = [];
  selectedItemsDialog: any[] = [];
  dialogColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'UNIT_NAME', header: '單位' },
    { field: 'PLU_BoxQty', header: '包裝入數' },
    { field: 'PLU_StockTaxType', header: '稅別', format: (value) => value === '0' ? '免稅' : '應稅' },
    { field: 'PLU_SalePrc_UNI', header: '單價', showSort: false },
    { field: 'PLU_SalePrc', header: '售價' },
  ]
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
      if (value) {
        this.dropDownListService.queryPOS20032_DropDownList({ CAT_LNo: [this.dialogQueryForm.controls.CAT_LNo.value || ''], CAT_MNo: [value] }).pipe(untilDestroyed(this)).subscribe(response => {
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
      ...frm.getRawValue(),
      VEN_No: this.dataForm.controls.VEN_No.value,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
    }
    this.tls52020Service.queryPOS2004DetailVENNoTLS52020(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
      this.dialogData = response.Data;
      this.totalRecords = response.TotalCount;
    })
  }
  saveDialog() {
    this.dialogVisible = false;
    this.data = [...this.data, ...this.selectedItemsDialog.map(item => ({
      ...item,
      CRN_SubQty: 0,
      CRN_BuyPrc: item.PLU_SalePrc_UNI,
      CRN_SalePrc: item.PLU_SalePrc,
      CRN_Remark: ''
    }))];
    this.selectedItemsDialog = [];
    this.selectedItems = [];
  }
  isRowSelectable(event: any): boolean {
    return !this.data || !this.data.some((item: any) => item.PLU_MagNo === event.PLU_MagNo);
  }
  opLoading = false;
  opForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 商品管理編號/國際條碼/廠商貨號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  suggestions: any[] = [];
  fieldsConfig: any[] = [
    { field: 'PLU_MagNo', header: '商品管理編號/國際條碼/廠商貨號 - 商品名稱', mainDataField: true },
  ];
  opData: any[] = [];// overlayPanel 裡面的table
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
    }
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.dialogData = [...results.Data.map(item => ({
        ...item,
        label: item.PLU_MagNo + '/' + item.PLU_No + '/' + item.PLU_OrgPLUNo + ' - ' + item.PLU_Name
      }))];
      this.suggestions = [...this.dialogData];
    });
  }
  onformValueChanged(event: any) {
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
  // onShowDialog
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('query condition', frm.value);
      console.log('this.data', this.data);
      const body = {
        ...frm.value,
        details: this.data.map(item => ({
          PLU_MagNo: item.PLU_MagNo,
          PLU_OrderPrcRate: item.PLU_OrderPrcRate,
          PLU_OrderPrc: item.PLU_OrderPrc,
          MAM_OrderPrc: item.MAM_OrderPrc,
          PLU_SalePrc: item.PLU_SalePrc,
          MAM_UnitPrc: item.MAM_UnitPrc
        }))
      }
      console.log('body', body);
    });
  }
}
