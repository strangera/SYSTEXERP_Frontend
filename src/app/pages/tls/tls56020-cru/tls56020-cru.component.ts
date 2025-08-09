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
import { map } from 'rxjs/operators';
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
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Sys0110Service } from '@service/api/sys/sys0110.service';
import { debounceTime } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-tls56020-cru',
  templateUrl: './tls56020-cru.component.html',
  styleUrl: './tls56020-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    EditorTextComponent,
    CalendarComponent,
    ButtonComponent,
    NgIf,
    TranslateModule,
    TableComponent,
    DialogComponent,
    DropdownTableComponent,
  ],
})
export class TLS56020CRUComponent
  extends BasicCruPageComponent<any>
  implements OnInit {
  // -------------------- Form --------------------
  dataForm = this.formBuilder.group({
    SPM_No: [{ value: '自動編號', disabled: true }],
    SPM_Type: [],
    SPM_remark: [],
    APPLY_USR_No: [],
    org_id: [],
    APPLY_Date_Start: [],
    HOS_No: [{ value: null as string | null, disabled: true }, [Validators.required]], // 倉別 (與 POS2016.HOS_No 對應)
    HOS_NoList: [],
    LOGO_No: ['0001', [Validators.required]],

    VEN_No: [''], // ⬅ 後端需要（queryPOS2004DetailByVenNo）

    items: this.formBuilder.array([this.createItem()]),
  });

  // -------------------- Options --------------------
  issuanceTypeOptions: { label: string; value: string }[] = [];
  userOptions: { label: string; value: string }[] = [];
  brandOptions: IDropdownItem[] = []; // 品牌下拉選單選項
  warehouseOptions: IDropdownItem[] = []; // 倉別下拉選單選項
  departmentOptions: { label: string, value: string }[] = []; // 部門下拉選單選項

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
    { field: 'POD_SubQty', header: '數量'},
    { field: 'PLU_SalePrc', header: '商品售價',type: 'inputNumber' },
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
    PLU_MagNo: ['', [Validators.maxLength(20)]], // 商品管理編號
    PLU_Name: ['', [Validators.maxLength(60)]],  // 商品名稱
    VEN_No: [''],                                // ⬅ 後端需要
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
  opData: IQueryPOS2004DetailResponse[] = []; // overlayPanel 裡面的 table
  opColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
    { field: 'PLU_Name', header: '商品名稱' },
  ];
  opTotalRecords = 0; // ⬅ 供 dialog table 使用
  opForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 商品管理編號/國際條碼/廠商貨號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  constructor(
    private notificationService: NotificationService,
    private translate: TranslateService,
    private dropDownListService: DropDownListService,
    private tls52010Service: Tls52010Service,
    private cdr: ChangeDetectorRef,
    private sys0110Service: Sys0110Service
  ) {
    super();
  }

  // -------------------- Lifecycle --------------------
  ngOnInit(): void {
    this.initializePage('TLS56020', this.dataForm);

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

    // 領用類別
    this.issuanceTypeOptions = [
      { label: '贈品領用', value: '1' },
      { label: '公關活動', value: '2' },
    ];
    this.dropDownListService.queryPLULOGO_HOS_No_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
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

    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(response => {
      this.warehouseOptions = response.Data;
    });
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
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      PLU_MagNo: [],
      RPD_SalePrc: [],
      stocknum: [],
      SPM_TotQty: [],
      remark: [],
    });
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onRemoveItem(index: number): void {
    this.items.removeAt(index);
  }

  Edit(rowdata: any): void {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any): void {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
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

  // -------------------- Submit --------------------
  onSubmit(frm: FormGroup): void {
    this.notificationService.blockUi();
    this.submitted = true;

    if (frm.invalid) {
      this.notificationService.errorBubble(this.translate.instant('form_error_message'));
      this.notificationService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          this.notificationService.successBubble(this.translate.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          this.notificationService.successBubble(this.translate.instant('updated-successfully'));
        }
        break;
    }

    this.notificationService.unblockUi();
    this.submitted = false;

    this.handleSubmit(frm, () => {
      this.notificationService.successBubble(this.translate.instant('submit-success'));
      this.loading = false;
    });
  }

  submitForm(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  // -------------------- Dialog Query (AutoComplete) --------------------

  onAutoCompleteInputChange(event: any) {
    const body = {
      ...event,
      SPM_No: this.dataForm.controls.SPM_No.value,
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
      SPM_No: this.dataForm.controls.SPM_No.value,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      VEN_No: this.dataForm.controls.VEN_No.value, // ⬅ 加上供應商
    };

    this.tls52010Service
      .queryPOS2004Detail(body)
      .pipe(untilDestroyed(this))
      .subscribe((results) => {
        this.opData = [...results.Data];
        this.opTotalRecords = results.TotalCount; // ⬅ 用對
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

  onDelete() {
    this.calculateTotals();
  }

  // -------------------- Dialog 主查詢按鈕 --------------------
  onQuery(frm: FormGroup) {
    this.dialogLoading = true;

    const body = {
      ...frm.getRawValue(),
      SPM_No: this.dataForm.controls.SPM_No.value,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      VEN_No: this.dataForm.controls.VEN_No.value, // ⬅ 必填給後端
    };

    this.tls52010Service
      .queryPOS2004DetailByVenNo(body)
      .pipe(finalize(() => (this.dialogLoading = false)), untilDestroyed(this))
      .subscribe((response) => {
        this.dialogData = response.Data;
        this.opTotalRecords = response.TotalCount; // ⬅ 用對
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
}
