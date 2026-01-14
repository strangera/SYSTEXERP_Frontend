/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Sys0110Service } from '@service/api/sys/sys0110.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { PanelModule } from 'primeng/panel';
import {
  IPOS2004DetailData,
  IQueryPOS2004DetailRequest,
  IQueryPOS2004DetailResponse,
  Tls52010Service,
} from '../../../service/api/tls/tls52010.service';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import {
  DropdownTableComponent,
  FieldsConfig,
} from '../../../shared/componentkit/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import {
  Column,
  createPaginationConfig,
  RowEditSaveEvent,
} from '../../../shared/componentkit/table/table.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { Tls56030Service } from './../../../service/api/tls/TLS56030.service';

@UntilDestroy()
@Component({
  selector: 'app-tls56030-cru',
  templateUrl: './tls56030-cru.component.html',
  styleUrl: './tls56030-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    ButtonComponent,
    NgIf,
    TranslateModule,
    TableComponent,
    TableEditComponent,
    DialogComponent,
    DropdownTableComponent,
    InputTextareaComponent
  ],
})
export class TLS56030CRUComponent
  extends BasicCruPageComponent<any>
  implements OnInit {
  // -------------------- Form --------------------
  dataForm = this.formBuilder.group({
    id: [0],
    SYS_StoreNo: [''],
    RPM_No: [{ value: '自動編號', disabled: true }],
    RPM_Type: [''],
    RPM_Status: [''],
    RPM_Remark: ['', [Validators.maxLength(200)]],
    APPLY_USR_No: [this.authService.currentUserValue?.user_No ?? ''],
    APPLY_USR_Name: [],
    org_id: [''],
    APPLY_Date: [new Date()],
    HOS_No: ['', [Validators.required]],
    LOGO_No: ['', [Validators.required]],
    VEN_No: [''],
    Details: this.formBuilder.array([])
  });

  // -------------------- Options --------------------
  issuanceTypeOptions: { label: string; value: string }[] = [];
  userOptions: { label: string; value: string }[] = [];
  brandOptions: IDropdownItem[] = [];
  warehouseOptions: IDropdownItem[] = [];
  departmentOptions: { label: string, value: string }[] = [];

  // -------------------- Table (main) --------------------
  data: IPOS2004DetailData[] = [];
  selectedItems: IPOS2004DetailData[] = [];
  editColumns: EditColumn[] = [
    {
      field: 'PLU_No', header: '國際條碼', width: '150px', type: 'input',
      onBlur: (rowData: IPOS2004DetailData, value: string, col: EditColumn, index: number) => this.onPLU_NoBlur(rowData, value, col, index),
      validate: [validateRequired]
    },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_MagNo', header: '商品編號' },
    { field: 'PLU_SalePrc', header: '商品售價' },
    { field: 'PLU_StockTaxType', header: '目前庫存' },
    { field: 'RPD_SaleAmt', header: '領退數量' },
    { field: 'RPD_Remark', header: '備註', type: 'input' },
  ];

  // -------------------- Dialog --------------------
  dialogVisible = false;
  dialogLoading = false;
  selectedItemsDialog: IPOS2004DetailData[] = [];
  dialogData: IPOS2004DetailData[] = [];
  opLoading = false;
  totalRecords = 0;

  dialogQueryForm = this.formBuilder.group({
    PLU_MagNo: ['', [Validators.maxLength(20)]],
    PLU_Name: ['', [Validators.maxLength(60)]],
    VEN_No: [''],
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]),
  });

  dialogColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_Unit', header: '單位編號' },
    { field: 'UNIT_NAME', header: '單位名稱' },
    {
      field: 'PLU_StockTaxType',
      header: '稅別',
      format: (v) => (v === '0' ? '免稅' : '應稅'),
    },
    { field: 'RPD_SaleTax', header: '單價', showSort: false },
    { field: 'PLU_SalePrc', header: '售價' },
  ];

  suggestions: IQueryPOS2004DetailResponse[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_MagNo', header: '商品管理編號/國際條碼/廠商貨號', mainDataField: true },
    { field: 'PLU_Name', header: '商品名稱' },
  ];
  opData: IQueryPOS2004DetailResponse[] = [];
  opColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
    { field: 'PLU_Name', header: '商品名稱' },
  ];
  opTotalRecords = 0;
  opForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]],
    PLU_Name: ['', [Validators.maxLength(60)]],
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]),
  });

  constructor(
    private notificationService: NotificationService,
    private translate: TranslateService,
    private dropDownListService: DropDownListService,
    private tls52010Service: Tls52010Service,
    private cdr: ChangeDetectorRef,
    private sys0110Service: Sys0110Service,
    private tls56030Service: Tls56030Service,
    private fb: FormBuilder// Inject FormBuilder
  ) {
    super();
  }

  // -------------------- Lifecycle --------------------
  ngOnInit(): void {

    this.initializePage('TLS56030', this.dataForm);

    // 編輯狀態 → 部分欄位 disable
    if (this.isFormEditable) {
      this.dataForm.controls['RPM_No']?.disable();
    }


    if (!this.isFormCreateable) {
      const rpmNo = this.rowdata?.RPM_No ?? '';

      if (rpmNo) {
        const payload = { RPM_No: rpmNo };

        this.tls56030Service.queryPOS2024RTN(payload).subscribe({
          next: (res) => {
            const rows = res?.Data ?? [];
            this.data = rows.map((row: any) => ({
              ...row,
              // 關鍵：後端回傳的是 RPD_SalePrc，要對應到前端 Table 使用的 PLU_SalePrc
              PLU_SalePrc: row.PLU_SalePrc ?? row.RPD_SalePrc ?? 0
            }));
            this.totalRecords = this.data.length;
          },
          error: (err) => {
            console.error('查詢 POS2024RTN 失敗:', err);
          }
        });

      }
    }



    // 人員
    this.dropDownListService
      .queryTBLUSER_DropDownList()
      .pipe(
        untilDestroyed(this),
        map((resp) => resp.Data.map((x) => ({ label: x.Name, value: x.No })))
      )
      .subscribe((opts) => (this.userOptions = opts));

    // 類別
    this.issuanceTypeOptions = [
      { label: '贈品領用', value: '1' },
      { label: '公關活動', value: '2' },
    ];

    this.dropDownListService.queryPLULOGO_HOS_No_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.brandOptions = response.Data;
        this.dataForm.controls.LOGO_No.valueChanges
          .pipe(debounceTime(300), untilDestroyed(this))
          .subscribe(logoNo => {
            if (logoNo) {
              const HOS_No = this.brandOptions.find(opt => opt.No === logoNo)?.HOS_No || null;
              this.dataForm.controls.HOS_No.setValue(HOS_No);
              this.dataForm.controls.HOS_No.enable();
            } else {
              this.dataForm.controls.HOS_No.setValue(null);
              this.dataForm.controls.HOS_No.disable();
            }
            this.data = [];
            this.selectedItems = [];
            this.calculateTotals();
            this.dialogData = [];
          });
      });

    this.dropDownListService.getPOS2034Options()
      .pipe(untilDestroyed(this))
      .subscribe(response => this.warehouseOptions = response.Data);

    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.departmentOptions = (response.Data || []).map(item => ({
          label: item.Name,
          value: item.No
        }));
      });
  }

  // -------------------- Form Helpers --------------------
  get details(): FormArray {
    return this.dataForm.get('Details') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.details.at(index).get(controlName) as FormControl;
  }
  createDetail(data?: any): FormGroup {
    return this.formBuilder.group({
      PLU_MagNo: [data?.PLU_MagNo ?? ''],
      PLU_No: [data?.PLU_No ?? ''],
      PLU_Unit: [data?.PLU_Unit ?? ''],
      PLU_BoxQty: [data?.PLU_BoxQty ?? 0],
      PLU_Name: [data?.PLU_Name ?? ''],
      PLU_StockTaxType: [data?.PLU_StockTaxType ?? ''],
      RPD_ConfirmQty: [data?.RPD_ConfirmQty ?? 0],
      PLU_SalePrc: [data?.PLU_SalePrc ?? 0],
      RPD_Remark: [data?.RPD_Remark ?? ''],
      RPM_No: [data?.RPM_No ?? this.dataForm.controls.RPM_No.value],
      id: [data?.id ?? 0]
    });
  }

  // -------------------- Totals --------------------
  public calculateTotals(): void {
    const totalQuantity = this.data.reduce((sum, item) => sum + (item.POD_SaleAmt || 0), 0);
    const totalPrice = this.data.reduce(
      (sum, item) => sum + (item.POD_SaleAmt || 0) * (item.PLU_SalePrc || 0),
      0
    );
    console.log(`Total Quantity: ${totalQuantity}`);
    console.log(`Total Price: ${totalPrice}`);
  }

  // -------------------- Row Validation --------------------
  public validateEntireRow = (rowData: IPOS2004DetailData): { isValid: boolean; errorMessage: string } => {
    const hasDuplicatePLU_MagNo = this.data.some((item: IPOS2004DetailData) =>
      item.PLU_MagNo === rowData.PLU_MagNo && item._TABLE_KEY !== rowData._TABLE_KEY
    );
    if (hasDuplicatePLU_MagNo) {
      return { isValid: false, errorMessage: '商品管理編號重複' };
    }
    return { isValid: true, errorMessage: '' };
  };

  // -------------------- Payload Builder --------------------
  private buildPayload(): any {
    const raw = this.dataForm.getRawValue();
    return {
      ...raw,
      SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo ?? '',
      Details: this.data.map((x: any) => ({
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo ?? '',
        PLU_TaxType: x.PLU_TaxType ?? '',
        HOS_No: raw.HOS_No,
        PLU_MagNo: x.PLU_MagNo ?? '',
        PLU_No: x.PLU_No ?? '',
        PLU_Unit: x.PLU_Unit ?? '',
        PLU_BoxQty: x.PLU_BoxQty ?? 0,
        PLU_Name: x.PLU_Name ?? '',
        PLU_StockTaxType: x.PLU_StockTaxType ?? '',
        RPD_ConfirmQty: x.RPD_ConfirmQty ?? 0,
        // 關鍵：前端顯示 PLU_SalePrc，後端要 RPD_SalePrc
        RPD_SalePrc: x.PLU_SalePrc ?? x.RPD_SalePrc ?? 0,
        RPD_Remark: x.RPD_Remark ?? '',
        RPM_No: raw.RPM_No,
        id: x.id ?? 0
      }))
    };
  }

  // -------------------- Submit --------------------
  onSubmit(frm: FormGroup): void {
    this.notificationService.blockUi();
    this.submitted = true;

    if (frm.invalid) {
      this.notificationService.errorBubble(this.translate.instant('form_error_message'));
      this.notificationService.unblockUi();
      return;
    }

    const payload = this.buildPayload();

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        this.tls56030Service.insertTLS56030(payload)
          .pipe(finalize(() => this.notificationService.unblockUi()), untilDestroyed(this))
          .subscribe({
            next: (res) => {
              if (res.Status === '0000') {
                this.notificationService.successBubble(this.translate.instant('success_message'));
                this.onCancel();
              } else {
                this.notificationService.errorBubble(res.Message || '新增失敗');
              }
            },
            error: (err) => this.notificationService.errorBubble('新增失敗: ' + err.message)
          });
        break;

      case CRUDStatus.Edit:
        this.tls56030Service.updateTLS56030(payload)
          .pipe(finalize(() => this.notificationService.unblockUi()), untilDestroyed(this))
          .subscribe({
            next: (res) => {
              if (res.Status === '0000') {
                this.notificationService.successBubble(this.translate.instant('updated-successfully'));
                this.onCancel();
              } else {
                this.notificationService.errorBubble(res.Message || '更新失敗');
              }
            },
            error: (err) => this.notificationService.errorBubble('更新失敗: ' + err.message)
          });
        break;
    }

    this.submitted = false;
  }

  submitForm(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  // -------------------- Dialog Query (AutoComplete) --------------------
  onAutoCompleteInputChange(event: any) {
    const body = {
      ...event,
      RPM_No: this.dataForm.controls.RPM_No.value,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      queryNo: event.PLU_MagNo || '',
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_MagNo', order: 1 }],
    };
    this.tls52010Service
      .queryPOS2004Detail(body)
      .pipe(untilDestroyed(this))
      .subscribe((results) => {
        this.suggestions = [...results.Data];
      });
  }

  // -------------------- Dialog Query (Overlay Panel Table) --------------------
  onformValueChanged(event: IQueryPOS2004DetailRequest) {
    this.opLoading = true;

    const body = {
      ...event,
      RPM_No: this.dataForm.controls.RPM_No.value,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      VEN_No: this.dataForm.controls.VEN_No.value,
    };

    this.tls52010Service
      .queryPOS2004Detail(body)
      .pipe(untilDestroyed(this))
      .subscribe((results) => {
        this.opData = [...results.Data];
        this.opTotalRecords = results.TotalCount;
        this.opLoading = false;
      });
  }

  onPLU_NoBlur(rowData: IPOS2004DetailData, value: string, col: EditColumn, index: number) {
    const logoNo = this.dataForm.controls.LOGO_No.value;
    if (!logoNo || !value) {
      return;
    }

    const body = {
      PageSize: 1,
      PageIndex: 1,
      SortBy: [],
      queryNo: value,
      PLU_Name: '',
      LOGO_No: logoNo,
      HOS_No: this.dataForm.controls.HOS_No.value,
      VEN_No: this.dataForm.controls.VEN_No?.value ?? null,
    } as IQueryPOS2004DetailRequest;

    setTimeout(() => {
      if (!this.dataForm.controls.LOGO_No.value || !value) return;
      this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
        if (results.Data && results.Data.length > 0) {
          const newData = results.Data[0];
          const buyPrc = newData.PLU_SalePrc_UNI || 0;
          const salePrc = newData.PLU_SalePrc || 0;
          const taxType = newData.PLU_StockTaxType;
          const subQty = 1;

          const buyNet = Math.round(subQty * buyPrc);
          const buyTax = taxType === '1' ? Math.round(buyNet * 0.05) : 0;
          const buyAmt = buyNet + buyTax;
          const saleAmt = Math.round(subQty * salePrc);
          const saleTax = newData.PLU_TaxType === '1' ? Math.round((saleAmt || 0) / 21) : 0;

          const updatedRow: IQueryPOS2004DetailResponse = {
            ...newData,
            id: 0,
            PLU_MagNo: newData.PLU_MagNo,
            PLU_Name: newData.PLU_Name,
            PLU_No: newData.PLU_No,
            UNIT_NAME: newData.UNIT_NAME,
            PLU_BoxQty: newData.PLU_BoxQty || 0,
            PLU_StockTaxType: newData.PLU_StockTaxType,
            PLU_TaxType: newData.PLU_TaxType,
            PLU_SalePrc_UNI: buyPrc,
            PLU_SalePrc: salePrc,
            POD_SubQty: subQty,
            POD_BuyNet: buyNet,
            POD_BuyTax: buyTax,
            POD_BuyAmt: buyAmt,
            POD_SaleAmt: saleAmt,
            POD_SaleTax: saleTax,
            POD_Remark: ''
          } as any;

          const currentRow = this.data[index];
          if (currentRow) {
            Object.assign(currentRow, updatedRow);
          }
          this.data = [...this.data];
          this.calculateTotals();
          this.cdr.detectChanges();
        } else {
          this.notificationService.errorBubble('查無該商品資訊');
          const currentRow = this.data[index];
          if (currentRow) {
            Object.assign(currentRow, {
              PLU_MagNo: '',
              PLU_Name: '',
              PLU_No: '',
              UNIT_NAME: '',
              PLU_BoxQty: 0,
              PLU_StockTaxType: '',
              PLU_TaxType: '',
              PLU_SalePrc_UNI: 0,
              PLU_SalePrc: 0,
              RPD_SaleAmt: 0,
              POD_BuyNet: 0,
            });
          }
          this.data = [...this.data];
          this.calculateTotals();
          this.cdr.detectChanges();
        }
      });
    }, 50);
  }

  // -------------------- Dialog Save --------------------
  saveDialog() {
    this.dialogVisible = false;
    this.data = [
      ...this.data,
      ...this.selectedItemsDialog.map((item) => ({
        ...item,
        RPD_SaleAmt: 0,
        POD_Remark: '',
      })),
    ];
    this.selectedItemsDialog = [];
    this.selectedItems = [];
    this.calculateTotals();
  }

  // -------------------- Dialog 主查詢按鈕 --------------------
  onQuery(frm: FormGroup) {
    this.dialogLoading = true;

    const body = {
      ...frm.getRawValue(),
      RPM_No: this.dataForm.controls.RPM_No.value,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      VEN_No: this.dataForm.controls.VEN_No.value,
    };

    this.tls52010Service
      .queryPOS2004DetailByVenNo(body)
      .pipe(finalize(() => (this.dialogLoading = false)), untilDestroyed(this))
      .subscribe((response) => {
        this.dialogData = response.Data;
        this.opTotalRecords = response.TotalCount;
      });
  }

  // -------------------- Table Helpers --------------------
  isRowSelectable(row: IPOS2004DetailData): boolean {
    return !this.data || !this.data.some((x) => x.PLU_MagNo === row.PLU_MagNo);
  }

  onRowEditSave(event: RowEditSaveEvent) {
    const newData: IPOS2004DetailData = event.newData;

    const quantity = newData.POD_SaleAmt ? Math.max(0, newData.POD_SaleAmt) : 0;
    const unitPriceNet = newData.POD_SaleAmt || 0;
    const subtotalNet = Math.round(unitPriceNet * quantity);
    const salePrice = newData.PLU_SalePrc || 0;
    const totalPrice = Math.round(salePrice * quantity);

    const index = this.data.findIndex((x) => x.PLU_MagNo === newData.PLU_MagNo);
    if (index > -1) {
      this.data[index] = {
        ...this.data[index],
        // POD_SaleAmt: quantity,
        POD_BuyNet: subtotalNet,
        POD_SaleAmt: totalPrice,
      };
      this.data = [...this.data];
      this.cdr.detectChanges();
    }

    this.calculateTotals();
  }
  onDelete(): void {
    // Add your logic for handling delete action here
    console.log('Delete action triggered');
  }
}
