import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ITLS52050Data, POS2008Data, Tls52050Service } from '../../../service/api/tls/tls52050.service';
import { Column, RowEditSaveEvent } from '../../../shared/componentkit/table/table.model';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs';
import { Sys0110Service } from '../../../service/api/sys/sys0110.service';

@Component({
  selector: 'app-tls52050-cru',
  templateUrl: './tls52050-cru.component.html',
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
    costPriceDiscount: [0], // 進價折扣%
    costPriceAmount: [0], // 進價金額調整
    salePriceDiscount: [0], // 售價折扣%
    salePriceAmount: [0], // 售價金額調整
  });
  brandOptions: IDropdownItem[] = []; // 品牌代碼
  vendorOptions: IDropdownItem[] = []; // 廠商編號
  userOptions: { user_No: string; user_Name: string }[] = []; // 申請人員、審核人員、結案人員
  data: POS2008Data[] = [
    { id: 1, MID: "0", MAM_No: "MAM202310010001", SYS_StoreNo: "10", PLU_MagNo: "PLU202310010001", PLU_Name: "商品名稱", CAT_LNo: "01", CAT_MNo: "01", CAT_SNo: "01", PLU_OrderPrcRate: 50, PLU_OrderPrc: 1000, MAM_OrderPrc: 500, PLU_SalePrc: 1200, MAM_UnitPrc: 600, MAD_Remark: "單項說明", }
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
    { field: 'MAM_OrderPrc', header: '調整後進價', visible: true },
    { field: 'PLU_SalePrc', header: '調整前售價', visible: true },
    { field: 'MAM_UnitPrc', header: '調整後售價', visible: true },
    { field: 'MAD_Remark', header: '營運終止日', visible: true }
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
  onDelete(selectedRows: POS2008Data[]) {
    this.data = this.data.filter(row => !selectedRows.includes(row));
  }
  onRowEditSave(event: RowEditSaveEvent) {
  }
  // onShowDialog
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('query condition', frm.value);
    });
  }
}
