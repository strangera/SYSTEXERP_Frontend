/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { finalize } from 'rxjs';
import { map, debounceTime } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import {
  IQueryPOS2004DetailRequest,
  IQueryPOS2004DetailResponse,
  Tls52010Service,
  IPOS2004DetailData,
} from '../../../service/api/tls/tls52010.service';
import {
  DropdownTableComponent,
  FieldsConfig,
} from '../../../shared/componentkit/dropdown-table/dropdown-table.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import {
  Column,
  createPaginationConfig,
  RowEditSaveEvent,
} from '../../../shared/componentkit/table/table.model';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Sys0110Service } from '@service/api/sys/sys0110.service';
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
    DialogComponent,
    DropdownTableComponent,
  ],
})
export class TLS56030CRUComponent
  extends BasicCruPageComponent<any>
  implements OnInit {
  // -------------------- Form --------------------
  dataForm = this.formBuilder.group({
    id: [0],
    SYS_StoreNo: ['', Validators.required],
    RPM_No: [{ value: '自動編號', disabled: true }],
    RPM_Type: [''],
    RPM_Status: [''],
    RPM_Remark: [''],
    APPLY_USR_No: [''],
    APPLY_USR_Name: [''],
    org_id: [''],
    APPLY_Date: [null],
    HOS_No: [{ value: null as string | null, disabled: true }, [Validators.required]],
    LOGO_No: ['0001', [Validators.required]],
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
  columns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_Unit', header: '單位編號' },
    { field: 'UNIT_NAME', header: '單位名稱' },
    { field: 'PLU_BoxQty', header: '包裝入數' },
    {
      field: 'PLU_StockTaxType',
      header: '稅別',
      format: (v) => (v === '0' ? '免稅' : '應稅'),
    },
    { field: 'POD_SubQty', header: '數量' },
    { field: 'PLU_SalePrc', header: '商品售價', type: 'inputNumber' },
    { field: 'PLU_SalePrc_UNI', header: '商品進價', type: 'inputNumber' },
    { field: 'POD_Remark', header: '備註', type: 'input' },
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
    { field: 'PLU_SalePrc_UNI', header: '單價', showSort: false },
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
    private tls56030Service: Tls56030Service
  ) {
    super();
  }

  // -------------------- Lifecycle --------------------
  ngOnInit(): void {
    this.initializePage('TLS56030', this.dataForm);

    if (this.isFormEditable) {
      this.dataForm.controls.LOGO_No.disable();
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

    this.dropDownListService.querySYS3100_join_POS1001_DropDownList()
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
      RPD_SalePrc: [data?.RPD_SalePrc ?? 0],
      RPD_Remark: [data?.RPD_Remark ?? ''],
      RPM_No: [data?.RPM_No ?? this.dataForm.controls.RPM_No.value],
      id: [data?.id ?? 0]
    });
  }

  // -------------------- Totals --------------------
  private calculateTotals(): void {
    const totalQuantity = this.data.reduce((sum, item) => sum + (item.POD_SubQty || 0), 0);
    const totalPrice = this.data.reduce(
      (sum, item) => sum + (item.POD_SubQty || 0) * (item.PLU_SalePrc || 0),
      0
    );
    console.log(`Total Quantity: ${totalQuantity}`);
    console.log(`Total Price: ${totalPrice}`);
  }

  // -------------------- Payload Builder --------------------
  private buildPayload(): any {
    const raw = this.dataForm.getRawValue();
    return {
      ...raw,
      Details: raw.Details.map((x: any) => ({
        SYS_StoreNo: raw.SYS_StoreNo,
        HOS_No: raw.HOS_No,
        PLU_MagNo: x.PLU_MagNo ?? '',
        PLU_No: x.PLU_No ?? '',
        PLU_Unit: x.PLU_Unit ?? '',
        PLU_BoxQty: x.PLU_BoxQty ?? 0,
        PLU_Name: x.PLU_Name ?? '',
        PLU_StockTaxType: x.PLU_StockTaxType ?? '',
        RPD_ConfirmQty: x.RPD_ConfirmQty ?? 0,
        RPD_SalePrc: x.RPD_SalePrc ?? 0,
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
                this.router.navigate(['/TLS/TLS56030']);
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
                this.router.navigate(['/TLS/TLS56030']);
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

  // -------------------- Dialog Save --------------------
  saveDialog() {
    this.dialogVisible = false;
    this.data = [
      ...this.data,
      ...this.selectedItemsDialog.map((item) => ({
        ...item,
        POD_SubQty: 0,
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

    const quantity = newData.POD_SubQty ? Math.max(0, newData.POD_SubQty) : 0;
    const unitPriceNet = newData.PLU_SalePrc_UNI || 0;
    const subtotalNet = Math.round(unitPriceNet * quantity);
    const salePrice = newData.PLU_SalePrc || 0;
    const totalPrice = Math.round(salePrice * quantity);

    const index = this.data.findIndex((x) => x.PLU_MagNo === newData.PLU_MagNo);
    if (index > -1) {
      this.data[index] = {
        ...this.data[index],
        POD_SubQty: quantity,
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
