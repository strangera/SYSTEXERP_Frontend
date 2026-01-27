import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IQueryPOS2004DetailResponse } from '@service/api/tls/tls52010.service';
import { IQueryTLS56080Response, ITLS56080Detail, Tls56080Service } from '@service/api/tls/tls56080.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatAmount, RowEditSaveEvent } from '@shared/componentkit/table/table.model';
import { validateMinNumber, validateRequired } from '@shared/componentkit/table/validate-field.model';
import { PanelModule } from 'primeng/panel';
import { TableModule } from "primeng/table";
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

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
    DropdownTableComponent,
  ]
})
export class TLS56080CRUComponent extends BasicCruPageComponent<IQueryTLS56080Response> implements OnInit {
  // 主檔表單定義
  dataForm = this.formBuilder.group({
    TRD_No: [{ value: '系統自動取號', disabled: true }], // 同業調撥編號，readonly
    HOS_No: [null, [Validators.required]], // 倉別，必填
    VEN_No: [null, [Validators.required]], // 廠商編號，必填
    LOGO_No: [null, [Validators.required]], // 品牌代碼，必填
    TRD_Reason: [null, [Validators.required]], // 調撥原因，必填
    IN_TotBuyAmt: [{ value: 0, disabled: true }], // 調入總金額，readonly
    OUT_TotBuyAmt: [{ value: 0, disabled: true }], // 調出總金額，readonly
    DIFF_TotBuyAmt: [{ value: 0, disabled: true }], // 差異金額，readonly
    APPLY_Date: [{ value: new Date(), disabled: true }], // 申請日期
    APPLY_USR_No: [{ value: this.authService.currentUserValue?.user_No, disabled: true }], // 申請人員
    APPLY_USR_Name: [{ value: '', disabled: true }], // 申請人員
    TRD_Remark: [null, [Validators.maxLength(200)]], // 備註
  });
  data: ITLS56080Detail[] = [];
  originalData: ITLS56080Detail[] = [];
  selectedItems: ITLS56080Detail[] = [];
  columns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'PLU_Unit', header: '商品單位', visible: true },
    { field: 'PLU_BoxQty', header: '包裝入數', visible: true },
    { field: 'TRD_Type', header: '調出/調入', visible: true, type: 'dropdown', options: [{ label: '調出', value: '0' }, { label: '調入', value: '1' }], validate: [validateRequired], required: true },
    { field: 'TRD_Qty', header: '數量', visible: true, type: 'inputNumber', validate: [validateRequired, validateMinNumber(1)], required: true },
    { field: 'PLU_SalePrc', header: '單價', visible: true, format: formatAmount },
    { field: 'TRD_Amt', header: '小計', visible: true, format: formatAmount },
    { field: 'TRD_Remark', header: '單項備註', visible: true, type: 'input' },
  ];

  brandOptions: { label: string; value: string }[] = [];
  warehouseOptions: { label: string; value: string }[] = [];
  vendorOptions: { label: string; value: string }[] = [];
  reasonOptions = getSYS1000Options('TRD_Reason');
  userOptions: { label: string; value: string }[] = [];
  totalRecords = 0;

  constructor(
    private readonly tls56080Service: Tls56080Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56080', this.dataForm);
    this.loadDropdownOptions();
    if (!this.isFormCreateable && this.rowdata && this.rowdata.TRD_No) {
      this.dataForm.get('HOS_No')?.disable();
      this.dataForm.get('VEN_No')?.disable();
      this.dataForm.get('LOGO_No')?.disable();
      this.tls56080Service.querySTORETRADED({
        TRD_No: this.rowdata?.TRD_No,
        OUT_HOS_No: this.rowdata?.HOS_No
      }).pipe(untilDestroyed(this)).subscribe(response => {
        this.data = response.Data
        this.originalData = response.Data;
      });
    }
    // 監聽品牌、倉別、廠商變動，清空明細資料
    this.dataForm.controls['LOGO_No'].valueChanges.pipe(untilDestroyed(this)).subscribe(() => { this.data = []; this.calculateTotals(); });
    this.dataForm.controls['HOS_No'].valueChanges.pipe(untilDestroyed(this)).subscribe(() => { this.data = []; this.calculateTotals(); });
  }

  loadDropdownOptions(): void {
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(options => {
      this.warehouseOptions = options.Data.map(item => ({ label: item.Name, value: item.No }));
    });
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.brandOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
    this.dropDownListService.queryPOS2013_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.vendorOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.userOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
  }


  dialogVisible = false;
  dialogQueryForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 商品管理編號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  dialogData: IQueryPOS2004DetailResponse[] = [];
  selectedItemsDialog: IQueryPOS2004DetailResponse[] = [];
  dialogColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'UNIT_NAME', header: '單位' },
    { field: 'PLU_SalePrc', header: '售價', format: formatAmount },
    { field: 'NowHaveQty', header: '庫存量' },
  ];
  dialogLoading = false;
  onQuery(frm: FormGroup) {
    this.dialogLoading = true;
    const body = {
      ...frm.getRawValue(),
      HOS_No: this.dataForm.controls.HOS_No.value,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
    }
    this.tls56080Service.queryPOS2004Detail(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
      this.dialogData = response.Data;
      this.totalRecords = response.TotalCount;
    })
  }

  saveDialog(): void {
    this.dialogVisible = false;
    this.data = [
      ...this.data,
      ...this.selectedItemsDialog.map(item => ({
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo ?? '',
        HOS_No: this.dataForm.controls.HOS_No.value || '',
        PLU_MagNo: item.PLU_MagNo,
        PLU_No: item.PLU_No,
        PLU_Unit: item.PLU_Unit,
        UNIT_NAME: item.UNIT_NAME,
        PLU_BoxQty: item.PLU_BoxQty === null ? 0 : item.PLU_BoxQty,
        PLU_Name: item.PLU_Name,
        TRD_Type: '',
        PLU_SalePrc: item.PLU_SalePrc_UNI,
        TRD_Qty: 0,
        TRD_Amt: 0,
        TRD_Remark: '',
      }))
    ];
    this.selectedItemsDialog = [];
    this.selectedItems = [];
    this.calculateTotals();
  }

  suggestions: IQueryPOS2004DetailResponse[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_No', header: '國際條碼/商品管理編號/廠商貨號', mainDataField: true },
  ];
  onAutoCompleteInputChange(event: Record<'label', string>) {
    const body = {
      HOS_No: this.dataForm.controls.HOS_No.value || '',
      LOGO_No: this.dataForm.controls.LOGO_No.value || '',
      queryNo: event.label || '',
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_No', order: 1 }],
    }
    this.tls56080Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = [...results.Data.map(item => ({
        ...item,
        label: item.PLU_No + '/' + item.PLU_MagNo + '/' + item.PLU_OrgPLUNo + ' - ' + item.PLU_Name
      }))];
    });
  }
  onRowEditSave(event: RowEditSaveEvent): void {
    const editedItem = event.newData;
    if (editedItem.PLU_SalePrc && editedItem.TRD_Qty) {
      editedItem.TRD_Amt = editedItem.TRD_Qty * editedItem.PLU_SalePrc;
    } else {
      editedItem.TRD_Amt = 0;
    }
    this.calculateTotals();
  }

  calculateTotals(): void {
    let inTotal = 0;
    let outTotal = 0;

    this.data.forEach(item => {
      if (item.TRD_Type === '0') {
        outTotal += item.TRD_Amt || 0;
      } else {
        inTotal += item.TRD_Amt || 0;
      }
    });
    const diffTotal = Math.abs(inTotal - outTotal);
    this.dataForm.patchValue({
      IN_TotBuyAmt: inTotal,
      OUT_TotBuyAmt: outTotal,
      DIFF_TotBuyAmt: diffTotal,
    });
  }

  onDelete(selectedRows: ITLS56080Detail[]): void {
    this.data = this.data.filter(row => !selectedRows.includes(row));
    this.calculateTotals();
  }

  onSubmit(frm: FormGroup): void {
    // 檢查差異金額是否為0
    if (frm.get('DIFF_TotBuyAmt')?.value !== 0) {
      this.messageService.errorBubble('調出金額與調入金額不一致', '無法新增！');
      return;
    }
    // 如果有一筆Type為空就錯
    if (this.data.some(item => item.TRD_Type === '' || item.TRD_Type === null || item.TRD_Type === undefined)) {
      this.messageService.errorBubble('請選擇調出或調入', '無法新增');
      return;
    }
    // 每一筆資料的數量都必須大於0
    if (this.data.some(item => item.TRD_Qty <= 0)) {
      this.messageService.errorBubble('數量必須大於0', '無法新增');
      return;
    }
    // 檢查明細是否為空
    if (this.data.length === 0) {
      this.messageService.errorBubble('請至少新增一筆商品明細！', '無法新增！');
      return;
    }

    this.handleSubmit(frm, () => {
      this.loading = true;
      const body = {
        id: this.isFormCreateable ? undefined : this.rowdata?.id,
        TRD_No: this.isFormCreateable ? undefined : this.rowdata?.TRD_No,
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
        HOS_No: frm.getRawValue().HOS_No,
        VEN_No: frm.getRawValue().VEN_No,
        LOGO_No: frm.getRawValue().LOGO_No,
        TRD_Reason: frm.getRawValue().TRD_Reason,
        IN_TotBuyAmt: frm.getRawValue().IN_TotBuyAmt,
        OUT_TotBuyAmt: frm.getRawValue().OUT_TotBuyAmt,
        DIFF_TotBuyAmt: frm.getRawValue().DIFF_TotBuyAmt,
        APPLY_Date: frm.getRawValue().APPLY_Date,
        APPLY_USR_No: frm.getRawValue().APPLY_USR_No,
        TRD_Remark: frm.getRawValue().TRD_Remark,
        Details: this.data.map((item: ITLS56080Detail) => ({
          SYS_StoreNo: item.SYS_StoreNo,
          HOS_No: item.HOS_No,
          PLU_MagNo: item.PLU_MagNo,
          PLU_No: item.PLU_No,
          PLU_Unit: item.PLU_Unit,
          PLU_BoxQty: item.PLU_BoxQty,
          PLU_Name: item.PLU_Name,
          TRD_Type: item.TRD_Type,
          PLU_SalePrc: item.PLU_SalePrc,
          TRD_Qty: item.TRD_Qty,
          TRD_Amt: item.TRD_Amt,
          TRD_Remark: item.TRD_Remark,
          id: this.isFormCreateable ? undefined : item.id,
          TRD_No: this.isFormCreateable ? undefined : item.TRD_No,
        })),
      }
      const request$ = this.isFormCreateable
        ? this.tls56080Service.insertTLS56080(body)
        : this.tls56080Service.updateTLS56080(body);
      request$.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
        this.messageService.successBubble(response.Message);
        this.onCancel();
      });
    });
  }
  isRowSelectable(event: IQueryPOS2004DetailResponse): boolean {
    return !this.data || !this.data.some((item: ITLS56080Detail) => item.PLU_MagNo === event.PLU_MagNo);
  }
}
