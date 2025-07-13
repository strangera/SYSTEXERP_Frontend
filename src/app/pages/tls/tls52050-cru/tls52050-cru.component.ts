import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ITLS52050Data, POS2008Data, Tls52050Service } from '../../../service/api/tls/tls52050.service';
import { Column, createPaginationConfig, RowEditSaveEvent } from '../../../shared/componentkit/table/table.model';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { debounceTime, finalize, map } from 'rxjs';
import { Sys0110Service } from '../../../service/api/sys/sys0110.service';
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
import { NgIf } from '@angular/common';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import { DropdownTableComponent } from '../../../shared/componentkit/dropdown-table/dropdown-table.component';
import { TranslateModule } from '@ngx-translate/core';

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
    ],
})
export class TLS52050CRUComponent extends BasicCruPageComponent<ITLS52050Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    MAM_No: [{ value: '系統自動產生', disabled: true }],  // 變價單號
    VEN_No: ['', Validators.required], // 廠商代號
    LOGO_No: ['', Validators.required], // 品牌代號
    MAM_InvDesc: ['', Validators.required], // 進價變價單說明
    MAM_Method: [null, Validators.required], // 是否為永久變價
    MAM_BegDate: [(() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    })(), Validators.required],
    MAM_EndDate: [null, Validators.required], // 生效結束日期
    APPLY_USR_No: [{ value: null as string | null, disabled: true }], // 申請人
    APPLY_Date: [{ value: new Date(), disabled: true }], // 申請日期
    MAM_Status: [{ value: '0', disabled: true }],
    MAM_Type: [{ value: '3', disabled: true }],

    // 進價折扣、進價金額調整、售價折扣、售價金額調整
    costPriceDiscount: [0, [Validators.min(0), Validators.max(99)]], // 進價折扣%
    costPriceAmount: [0], // 進價金額調整
    salePriceDiscount: [0, [Validators.min(0), Validators.max(99)]], // 售價折扣%
    salePriceAmount: [0], // 售價金額調整
  });
  brandOptions: IDropdownItem[] = []; // 品牌代碼
  vendorOptions: IDropdownItem[] = []; // 廠商編號
  userOptions: { user_No: string; user_Name: string }[] = []; // 申請人員、審核人員、結案人員
  data: POS2008Data[] = [
    { id: 1, MID: "0", MAM_No: "MAM202310010001", SYS_StoreNo: "10", PLU_MagNo: "PLU202310010001", PLU_Name: "商品名稱", CAT_LNo: "01", CAT_MNo: "01", CAT_SNo: "01", PLU_OrderPrcRate: 50, PLU_OrderPrc: 33, MAM_OrderPrc: 500, PLU_SalePrc: 12, MAM_UnitPrc: 600, MAD_Remark: "單項說明", }
  ];
  selectedItems: POS2008Data[] = [];
  columns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'CAT_LNo', header: '大類代號', visible: true },
    { field: 'CAT_MNo', header: '中類代號', visible: true },
    { field: 'CAT_SNo', header: '小類代號', visible: true },
    { field: 'PLU_OrderPrcRate', header: '進價折數', visible: true },
    { field: 'PLU_OrderPrc', header: '調整前進價', visible: true },
    { field: 'MAM_OrderPrc', header: '調整後進價', visible: true, type: 'inputNumber' },
    { field: 'PLU_SalePrc', header: '調整前售價', visible: true },
    { field: 'MAM_UnitPrc', header: '調整後售價', visible: true, type: 'inputNumber' },
    { field: 'MAD_Remark', header: '營運終止日', visible: true, type: 'input' }
  ];
  constructor(
    private dropDownListService: DropDownListService,
    private tls52050Service: Tls52050Service,
    private sys0110Service: Sys0110Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS52050', this.dataForm);
    // 品牌代碼 (LOGO_No)
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.brandOptions = response.Data.map(brand => ({
        ...brand,
        label: `${brand.No} - ${brand.Name}`,
      }));
    });
    // 廠商編號 (VEN_No)
    this.dropDownListService.queryPOS2013_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.vendorOptions = response.Data.map(vendor => ({
        ...vendor,
        label: `${vendor.VEN_No} - ${vendor.Name}`,
      }));
    });
    // 申請人員、審核人員、結案人員 (共用人員下拉選單)
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this),
      map(response => response.Data.map(item => ({ user_Name: item.Name, user_No: item.No })))
    ).subscribe(options => {
      this.userOptions = options;
    });
    if (this.isFormCreateable) {
      this.dataForm.controls.APPLY_Date.setValue(new Date());
      this.userOptions = [{ user_No: this.user?.user_No || '', user_Name: this.user?.user_Name || '' }];
      this.dataForm.controls.APPLY_USR_No.setValue(this.userOptions[0]?.user_No || ''); // 假設用戶對象有 userName 屬性
    } else {
      this.sys0110Service.queryUser({ user_No: this.rowdata?.APPLY_USR_No }).pipe(untilDestroyed(this)).subscribe(response => {
        this.userOptions = response.Data.map(user => ({ user_No: user.user_No, user_Name: user.user_Name }));
      })
    }
    this.setupFormListeners();// 監聽方法
    this.setupMutualExclusiveControls('costPriceDiscount', 'costPriceAmount');
    this.setupMutualExclusiveControls('salePriceDiscount', 'salePriceAmount');
    this.setupPriceAdjustmentCalculation();
  }
  setupFormListeners() {
    // 監聽 MAM_Method 是否為永久變價
    this.dataForm.controls.MAM_Method.valueChanges.pipe(untilDestroyed(this)).subscribe(value => {
      this.dataForm.controls.MAM_EndDate.setValue(null);
      if (value === '1') {
        this.dataForm.controls.MAM_EndDate.disable();
      } else {
        this.dataForm.controls.MAM_EndDate.enable();
      }
    });
  }
  private setupMutualExclusiveControls(controlA: string, controlB: string): void {
    const controls: any = this.dataForm.controls;

    controls[controlA].valueChanges.pipe(untilDestroyed(this)).subscribe((value: number) => {
      const ctrlB = controls[controlB];
      if (value > 0) {
        if (!ctrlB.disabled) ctrlB.disable({ emitEvent: false });
      } else {
        if (ctrlB.disabled) ctrlB.enable({ emitEvent: false });
      }
    });

    controls[controlB].valueChanges.pipe(untilDestroyed(this)).subscribe((value: number) => {
      const ctrlA = controls[controlA];
      if (value > 0) {
        if (!ctrlA.disabled) ctrlA.disable({ emitEvent: false });
      } else {
        if (ctrlA.disabled) ctrlA.enable({ emitEvent: false });
      }
    });
  }
  private setupPriceAdjustmentCalculation(): void {
    const controls = this.dataForm.controls;

    // 監聽進價折扣%
    controls.costPriceDiscount.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((discount: number) => {
        if (discount > 0) {
          controls.costPriceAmount.setValue(0);
          controls.costPriceAmount.disable({ emitEvent: false });
          this.data.forEach(row => {
            row.MAM_OrderPrc = this.roundToTwo(row.PLU_OrderPrc * discount / 100);
          });
        } else {
          controls.costPriceAmount.enable({ emitEvent: false });
        }
      });

    // 監聽進價金額調整
    controls.costPriceAmount.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((adjustAmt: number) => {
        if (adjustAmt !== 0) {
          controls.costPriceDiscount.setValue(0);
          controls.costPriceDiscount.disable({ emitEvent: false });
          this.data.forEach(row => {
            row.MAM_OrderPrc = this.roundToTwo(row.PLU_OrderPrc + adjustAmt);
          });
        } else {
          controls.costPriceDiscount.enable({ emitEvent: false });
        }
      });

    // 監聽售價折扣%
    controls.salePriceDiscount.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((discount: number) => {
        if (discount > 0) {
          controls.salePriceAmount.setValue(0);
          controls.salePriceAmount.disable({ emitEvent: false });
          this.data.forEach(row => {
            row.MAM_UnitPrc = this.roundToInt(row.PLU_SalePrc * discount / 100);
          });
        } else {
          controls.salePriceAmount.enable({ emitEvent: false });
        }
      });

    // 監聽售價金額調整
    controls.salePriceAmount.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((adjustAmt: number) => {
        if (adjustAmt !== 0) {
          controls.salePriceDiscount.setValue(0);
          controls.salePriceDiscount.disable({ emitEvent: false });
          this.data.forEach(row => {
            row.MAM_UnitPrc = this.roundToInt(row.PLU_SalePrc + adjustAmt);
          });
        } else {
          controls.salePriceDiscount.enable({ emitEvent: false });
        }
      });
  }
  private roundToTwo(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private roundToInt(value: number): number {
    return Math.round(value);
  }

  onDelete(selectedRows: POS2008Data[]) {
    this.data = this.data.filter(row => !selectedRows.includes(row));
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
    { field: 'PLU_Unit', header: '單位編號' },
    { field: 'UNIT_NAME', header: '單位名稱' },
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
      if (value) {
        this.dropDownListService.queryPOS20031_DropDownList({ CAT_LNo: [value] }).pipe(untilDestroyed(this)).subscribe(response => {
          this.CAT_MNoOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
          this.dialogQueryForm.controls.CAT_MNo.enable();
        });
      } else {
        this.dialogQueryForm.controls.CAT_MNo.disable();
      }
      this.dialogQueryForm.controls.CAT_MNo.setValue(null); // 清空中分類選擇
      this.dialogQueryForm.controls.CAT_SNo.setValue(null); // 清空中分類選擇
    });
    // 監聽中分類變化
    this.dialogQueryForm.controls.CAT_MNo.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((value) => {
      if (value) {
        this.dropDownListService.queryPOS20032_DropDownList({ CAT_LNo: [this.dialogQueryForm.controls.CAT_LNo.value || ''], CAT_MNo: [value] }).pipe(untilDestroyed(this)).subscribe(response => {
          this.CAT_SNoOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
        });
        this.dialogQueryForm.controls.CAT_SNo.enable();
      } else {
        this.dialogQueryForm.controls.CAT_SNo.disable();
      }
      this.dialogQueryForm.controls.CAT_SNo.setValue(null); // 清空中分類選擇
    });
  }
  onQuery(frm: FormGroup) {
    this.dialogLoading = true;
    const body = {
      ...frm.getRawValue(),
      VEN_No: this.dataForm.controls.VEN_No.value,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
    }
    // this.tls52020Service.queryPOS2004DetailVENNoTLS52020(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
    //   this.dialogData = response.Data;
    //   this.totalRecords = response.TotalCount;
    // })
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
    { field: 'PLU_MagNo', header: '商品管理編號/國際條碼/廠商貨號', mainDataField: true },
    { field: 'PLU_Name', header: '商品名稱' },
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
    // this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
    //   this.suggestions = [...results.Data];
    // });
  }
  onformValueChanged(event: any) {
    this.opLoading = true;
    const body = {
      ...event,
      VEN_No: this.dataForm.controls.VEN_No.value,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
    };
    // this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
    //   this.opData = [...results.Data]; // 更新data資料
    //   this.opTotalRecords = results.TotalCount;
    //   this.opLoading = false;
    // });
  }
  // onShowDialog
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('query condition', frm.value);
    });
  }
}
