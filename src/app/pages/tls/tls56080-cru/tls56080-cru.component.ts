import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { NgIf } from '@angular/common';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { Column, createPaginationConfig, RowEditSaveEvent } from '@shared/componentkit/table/table.model';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from "primeng/table";
import { DropDownListService } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { finalize } from 'rxjs';
import { Tls56080Service } from '@service/api/tls/tls56080.service';

interface ITransferDetail {
  id?: number;
  PLU_MagNo: string;
  PLU_Name: string;
  PLU_No: string;
  PLU_Unit: string;
  PLU_PackQty: number;
  IO_Type: 'IN' | 'OUT';
  TRD_Qty: number;
  TRD_Prc: number;
  TRD_BuyNet: number;
  TRD_Remark: string;
}

@Component({
  selector: 'app-tls56080-cru',
  templateUrl: './tls56080-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    NgIf,
    TranslateModule,
    TableModule,
    InputTextareaComponent,
    TableComponent,
    DialogComponent,
    InputNumberRangeComponent
  ]
})
export class TLS56080CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  // 主檔表單定義
  dataForm = this.formBuilder.group({
    TRD_No: [{ value: '系統自動取號', disabled: true }], // 同業調撥編號，readonly
    LOGO_No: [null, Validators.required], // 品牌編號，必填
    HOS_No: [null, Validators.required], // 倉別，必填
    VEN_No: [null, Validators.required], // 廠商編號，必填
    IN_TotBuyAmt: [{ value: 0, disabled: true }], // 調入總金額，readonly
    OUT_TotBuyAmt: [{ value: 0, disabled: true }], // 調出總金額，readonly
    DIFF_TotBuyAmt: [{ value: 0, disabled: true }], // 差異金額，readonly
    TRD_Reason: [null, Validators.required], // 調撥原因，必填
    TRD_Remark: [null, [Validators.maxLength(200)]], // 備註
    APPLY_Date: [{ value: new Date(), disabled: true }], // 申請日期
    APPLY_USR_No: [{ value: '', disabled: true }], // 申請人員
  });

  data: ITransferDetail[] = [];
  selectedItems: ITransferDetail[] = [];
  columns: Column[] = [
    { field: 'MVD_SeqNo', header: '項次', visible: true },
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'PLU_Unit', header: '商品單位', visible: true },
    { field: 'PLU_PackQty', header: '包裝入數', visible: true },
    { field: 'IO_Type', header: '調出/調入', visible: true, type: 'dropdown', options: [{ label: '調出', value: 'OUT' }, { label: '調入', value: 'IN' }] },
    { field: 'TRD_Qty', header: '數量', visible: true, type: 'inputNumber' },
    { field: 'TRD_Prc', header: '單價', visible: true, type: 'inputNumber' },
    { field: 'TRD_BuyNet', header: '小計', visible: true },
    { field: 'TRD_Remark', header: '單項備註', visible: true, type: 'input' },
  ];

  brandOptions: { label: string; value: string }[] = [];
  warehouseOptions: { label: string; value: string }[] = [];
  vendorOptions: { label: string; value: string }[] = [];
  reasonOptions: { label: string; value: string }[] = [
    { label: '庫存過高', value: '1' },
    { label: '同業調貨', value: '2' },
    { label: '同業缺貨', value: '3' },
    { label: '其它', value: '4' },
    { label: '特殊', value: '5' },
  ];
  userOptions: { label: string; value: string }[] = [];

  dialogVisible = false;
  dialogLoading = false;
  dialogQueryForm = this.formBuilder.group({
    PLU_SalePrc_min: [null],
    PLU_SalePrc_max: [null],
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]),
  });
  dialogData: any[] = [];
  totalRecords = 0;
  selectedItemsDialog: any[] = [];
  dialogColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_Unit', header: '單位' },
    { field: 'TRD_Prc', header: '售價' },
    { field: 'STK_CurrentQty', header: '庫存量' },
  ];

  constructor(
    private readonly tls56080Service: Tls56080Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56080', this.dataForm);
    this.loadDropdownOptions();
    this.dataForm.patchValue({ APPLY_USR_No: this.authService.currentUserValue?.user_No });

    // 監聽品牌、倉別、廠商變動，清空明細資料
    this.dataForm.controls['LOGO_No'].valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.resetDetailData());
    this.dataForm.controls['HOS_No'].valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.resetDetailData());
    this.dataForm.controls['VEN_No'].valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.resetDetailData());
  }

  loadDropdownOptions(): void {
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(options => {
      this.warehouseOptions = options.Data.map(item => ({ label: item.Name, value: item.No }));
    });
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.brandOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
    // this.dropDownListService.queryPOS2010Options().pipe(untilDestroyed(this)).subscribe(options => {
    //   this.vendorOptions = options.Data.map(item => ({ label: `${item.VEN_No} - ${item.VEN_Name}`, value: item.VEN_No }));
    // });
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.userOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
  }

  onQuery(frm: FormGroup): void {
    if (!this.dataForm.controls.LOGO_No.value || !this.dataForm.controls.HOS_No.value) {
      alert('請先選擇品牌和倉別！');
      return;
    }

    this.dialogLoading = true;
    const body = {
      ...frm.getRawValue(),
      SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      HOS_No: this.dataForm.controls.HOS_No.value,
    };

    // 模擬API呼叫
    // this.tls56080Service.queryGoodsByPriceRange(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
    //   this.dialogData = response.Data;
    //   this.totalRecords = response.TotalCount;
    // });

    this.dialogLoading = false;
    this.dialogData = [
      { PLU_MagNo: 'G001', PLU_Name: '商品C', PLU_No: '111222', PLU_Unit: '件', PLU_PackQty: 1, PLU_SalePrc: 250, STK_CurrentQty: 20 },
      { PLU_MagNo: 'G002', PLU_Name: '商品D', PLU_No: '333444', PLU_Unit: '個', PLU_PackQty: 6, PLU_SalePrc: 150, STK_CurrentQty: 15 },
    ];
    this.totalRecords = this.dialogData.length;
  }

  saveDialog(): void {
    this.dialogVisible = false;
    const newItems = this.selectedItemsDialog.map(item => ({
      ...item,
      MVD_SeqNo: this.data.length + 1,
      IO_Type: 'IN', // 預設為調入
      TRD_Qty: 0,
      TRD_Prc: item.PLU_SalePrc,
      TRD_BuyNet: 0,
      TRD_Remark: '',
    }));
    this.data = [...this.data, ...newItems];
    this.selectedItemsDialog = [];
    this.calculateTotals();
  }

  onRowEditSave(event: RowEditSaveEvent): void {
    const editedItem = event.data;
    if (editedItem.TRD_Qty && editedItem.TRD_Prc) {
      editedItem.TRD_BuyNet = editedItem.TRD_Qty * editedItem.TRD_Prc;
    } else {
      editedItem.TRD_BuyNet = 0;
    }
    this.calculateTotals();
  }

  calculateTotals(): void {
    let inTotal = 0;
    let outTotal = 0;

    this.data.forEach(item => {
      if (item.IO_Type === 'IN') {
        inTotal += item.TRD_BuyNet || 0;
      } else {
        outTotal += item.TRD_BuyNet || 0;
      }
    });

    const diffTotal = Math.abs(inTotal - outTotal);

    this.dataForm.patchValue({
      IN_TotBuyAmt: inTotal,
      OUT_TotBuyAmt: outTotal,
      DIFF_TotBuyAmt: diffTotal,
    });
  }

  resetDetailData(): void {
    this.data = [];
    this.calculateTotals();
  }

  onSubmit(frm: FormGroup): void {
    // 檢查差異金額是否為0
    if (frm.get('DIFF_TotBuyAmt')?.value !== 0) {
      alert('調出金額與調入金額不一致，無法新增！');
      return;
    }

    // 檢查明細是否為空
    if (this.data.length === 0) {
      alert('請至少新增一筆商品明細！');
      return;
    }

    this.handleSubmit(frm, () => {
      this.loading = true;
      const body = {
        master: frm.getRawValue(),
        details: this.data
      };

      // 模擬API呼叫
      console.log('同業調撥提交資料：', body);
      // this.tls56080Service.addTransfer(body).pipe(
      //   finalize(() => this.loading = false),
      //   untilDestroyed(this)
      // ).subscribe(response => {
      //   if (response.success) {
      //     alert('新增成功！');
      //     this.onCancel();
      //   } else {
      //     alert('新增失敗：' + response.message);
      //   }
      // });

      this.loading = false;
      alert('新增成功！');
      this.onCancel();
    });
  }

}
