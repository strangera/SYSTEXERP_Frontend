import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { POS2004DetailResponse, POS2023DAMResponse, POS2024DAMResponse, Tls56070Service } from '@service/api/tls/tls56070.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateMaxLength, validateMinNumber, validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { PanelModule } from 'primeng/panel';
import { TableModule } from "primeng/table";
import { finalize, merge } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-tls56070-cru',
  templateUrl: './tls56070-cru.component.html',
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
    AsyncPipe,
    TableEditComponent
  ]
})
export class TLS56070CRUComponent extends BasicCruPageComponent<POS2023DAMResponse> implements OnInit {
  dataForm = this.formBuilder.group({
    DAM_No: [{ value: '系統自動取號', disabled: true }], // 報廢單編號，readonly, 系統自動取號
    LOGO_No: [null, Validators.required], // 品牌代碼，下拉選項，必填
    HOS_No: [null, Validators.required], // 報廢倉別，下拉選項，必填
    APPLY_Date: [{ value: new Date(), disabled: true }], // 申請日期，預帶系統日期
    APPLY_USR_No: [{ value: this.authService.currentUserValue?.user_No, disabled: true }], // 申請人編號，預帶登入人員
    APPLY_USR_Name: [{ value: this.authService.currentUserValue?.user_Name, disabled: true }], // 申請人編號，預帶登入人員
    DAM_Remark: [null, [Validators.maxLength(200)]], // 報廢案由說明
    DAM_Status: [],

  });
  data: POS2024DAMResponse[] = []; // 用於表格顯示明細數據
  selectedItems: POS2024DAMResponse[] = []; // 用於表格選擇項目
  editColumns: EditColumn[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'NowHaveQty', header: '庫存數量' },
    { field: 'DAD_ConfirmQty', header: '數量', type: 'inputNumber', width: '100px', maxLength: 8, validate: [validateRequired, validateMinNumber(1)] },
    { field: 'UNIT_NAME', header: '商品單位' },
    { field: 'DAD_Remark', header: '單項說明', type: 'input', width: '120px', maxLength: 200, validate: [validateMaxLength(200)] },
  ];
  brandOptions = this.dropdown.queryPluLogo();
  warehouseOptions = this.dropdown.queryPos2034();
  constructor(
    private readonly tls56070Service: Tls56070Service,
    public readonly dropdown: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56070', this.dataForm);
    merge(this.dataForm.controls['LOGO_No'].valueChanges, this.dataForm.controls['HOS_No'].valueChanges).pipe(
      untilDestroyed(this)
    ).subscribe(() => {
      this.data = [];
    });
    if (!this.isFormCreateable) {
      this.dataForm.get('HOS_No')?.disable();
      this.dataForm.get('LOGO_No')?.disable();
      this.tls56070Service.queryPOS2024DAM({
        DAM_No: this.rowdata?.DAM_No,
        HOS_No: this.rowdata?.HOS_No
      }).pipe(untilDestroyed(this)).subscribe(response => {
        this.data = response.Data;
      })
    }
  }
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const valid = this.tableEditComponent.validateAndShowErrors();
      if (!valid) {
        this.loading = false;
        return;
      }
      const body = {
        ...frm.getRawValue(),
        id: this.isFormCreateable ? undefined : this.rowdata?.id,
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo,
        DAM_No: this.dataForm.controls.DAM_No.value ?? undefined,
        Details: this.data.map(d => ({
          ...d,
          SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo,
          id: this.isFormCreateable ? undefined : d.id ?? 0,
          DAM_No: this.dataForm.controls.DAM_No.value ?? undefined,
          HOS_No: this.dataForm.controls.HOS_No.value
        }))
      };
      const $request = this.isFormCreateable ? this.tls56070Service.insertTLS56070(body) : this.tls56070Service.updateTLS56070(body);
      $request.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
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
  // ------------------------------------ Dialog 邏輯 ------------------------------------
  dialogVisible = false;
  dialogQueryForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 商品管理編號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  dialogData: POS2004DetailResponse[] = [];
  selectedItemsDialog: POS2004DetailResponse[] = [];
  dialogColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'UNIT_NAME', header: '單位' },
    { field: 'PLU_SalePrc', header: '售價', format: formatAmount },
    { field: 'NowHaveQty', header: '庫存量', format: formatAmount },
  ]
  dialogLoading = false;

  onQuery(frm: FormGroup) {
    if (!this.dataForm.controls.LOGO_No.value || !this.dataForm.controls.HOS_No.value) {
      return;
    }
    const body = {
      ...frm.getRawValue(),
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      HOS_No: this.dataForm.controls.HOS_No.value,
    }
    this.dialogLoading = true;
    this.tls56070Service.queryPOS2004Detail(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
      this.dialogData = response.Data;
      this.totalRecords = response.TotalCount;
    })
  }

  saveDialog() {
    this.data = [...this.data, ...this.selectedItemsDialog.map((item) => ({
      ...item,
      id: 0,
      PLU_SalePrc_UNI: item.PLU_SalePrc_UNI ?? 0,
    }))];
    this.selectedItemsDialog = [];
    this.selectedItems = [];
    this.dialogVisible = false;
  }

  // ------------------------------------ 搜尋框邏輯 ------------------------------------
  suggestions: POS2004DetailResponse[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_No', header: '國際條碼/商品管理編號 - 商品名稱', mainDataField: true },
  ];
  onAutoCompleteInputChange(event: Record<'label', string>) {
    if (!this.dataForm.controls.LOGO_No.value || !this.dataForm.controls.HOS_No.value) {
      this.suggestions = [];
      return;
    }
    const body = {
      HOS_No: this.dataForm.controls.HOS_No.value,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      queryNo: event.label || '',
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_No', order: 1 }],
    }
    this.tls56070Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = [...results.Data.map((item) => ({
        ...item, label: item.PLU_No + '/' + item.PLU_MagNo + ' - ' + item.PLU_Name
      }))];
    });
  }
  isRowSelectable(event: POS2024DAMResponse): boolean {
    return !this.data || !this.data.some((item: POS2024DAMResponse) => item.PLU_MagNo === event.PLU_MagNo);
  }
}
