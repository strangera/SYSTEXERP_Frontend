import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownOption } from '../../../shared/models/api/base-api.interface';
import { DatePipe, NgIf } from '@angular/common';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { debounceTime, finalize } from 'rxjs';
import { ValidationService } from '@shared/service/validation.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { POS2004Info, TLS53010Data, TLS53010DetailQueryRequest, TLS53010InsertManualRequest, TLS53010Service } from '@service/api/tls/tls53010.service';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { Column, formatAmount } from '@shared/componentkit/table/table.model';
import { getSYS1000 } from '@service/system/sys1000.service';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls53010-cru',
  templateUrl: './tls53010-cru.component.html',
  styleUrl: './tls53010-cru.component.scss',
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    TranslateModule,
    InputTextareaComponent,
    TableEditComponent,
    DialogComponent,
    TableComponent
  ]
})
export class TLS53010CRUComponent extends BasicCruPageComponent<TLS53010Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    PST_No: [''], // 盤點單編號
    HOS_No: ['', Validators.required], // 倉別代碼 - 必填
    LOGO_No: ['', Validators.required], // 品牌代碼 - 必填
    PST_Date: ['', Validators.required], // 盤點基準日期 - 必填
    PST_Remark: [''], // 盤點備註
  });

  // 下拉選單
  hosOptions: any[] = [];   // 倉別選項
  logoOptions: any[] = [];  // 品牌選項

  // 明細table相關
  editColumns: EditColumn[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_Unit', header: '單位' },
  ]

  data: POS2004Info[] = [];
  selectedItems: POS2004Info[] = [];

  constructor(
    private tls53010Service: TLS53010Service,
    private datePipe: DatePipe,
    private validationService: ValidationService,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS53010', this.dataForm);
    this.loadOptions();
    this.setReadOnlyFields();

    if (this.crudstatus === 'Create') {
      // 新增時產生盤點單編號
      this.generatePSTNo();
    }

    // 如果是編輯動作 載入明細並帶入表格
    if (this.crudstatus === CRUDStatus.Edit && this.rowdata) {
      const payload: TLS53010DetailQueryRequest = {
        MID: 0,
        PST_No: this.rowdata.PST_No,
        SYS_StoreNo: this.rowdata.SYS_StoreNo,
        HOS_No: this.rowdata.HOS_No
      };
      this.tls53010Service.queryTLS53010Detail(payload)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
        });
    }
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            this.tls53010Service.insertTLS53010Manual(this.TLS53010InsertManualRequest)
              .pipe(untilDestroyed(this), finalize(() => this.loading = false))
              .subscribe(() => {
                this.messageService.successBubble('新增成功');
                this.dataForm.reset();
                this.data = [];
                this.selectedItems = [];
                this.dialogSelectedItems = [];
              });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // TODO: 待後端api完成
          }
          break;
      }
    });
  }

  loadOptions() {
    // 倉別選項
    this.dropDownListService.getPOS2034Options()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.hosOptions = response.Data.map(item => ({
          value: item.No,
          label: `${item.No}-${item.Name}`
        }));
      });

    // 品牌選項
    this.dropDownListService.queryPLULOGO_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.logoOptions = response.Data.map(item => ({
          value: item.No,
          label: `${item.No}-${item.Name}`
        }));
      });
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

  isRowSelectable(event: POS2004Info): boolean {
    return !this.data.some((item: POS2004Info) => item.PLU_MagNo === event.PLU_MagNo);
  }

  // 新增全品項
  insertTLS53010(form: FormGroup) {
    this.handleSubmit(form, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            this.tls53010Service.insertTLS53010(form.getRawValue())
              .pipe(untilDestroyed(this), finalize(() => this.loading = false))
              .subscribe(() => {
                this.messageService.successBubble('新增成功');
                this.dataForm.reset();
              });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // TODO: 待後端api完成
          }
          break;
      }
    });
  }

  //#region 商品明細選擇dialog相關
  dialogVisible = false;
  dialogLoading = false;

  dialogQueryForm = this.formBuilder.group({
    PLU_MagNo: ['', [Validators.maxLength(20)]], // 商品管理編號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    CAT_LNo: [null], // 大分類代碼
    CAT_MNo: [{ value: null, disabled: true }], // 中分類代碼
    CAT_SNo: [{ value: null, disabled: true }], // 小分類代碼
    // 分頁及排序
    pageSize: [20],
    pageIndex: [1],
    SortBy: [[{ field: 'PLU_MagNo', order: 1 }]],
  });

  totalRecords = 0;

  // 分類下拉選項
  PLU_MagNoOptions: any[] = []; // 商品管理編號/國際條碼/廠商貨號
  CAT_LNoOptions: any[] = [];   // 大分類代碼
  CAT_MNoOptions: any[] = [];   // 中分類代碼
  CAT_SNoOptions: any[] = [];   // 小分類代碼

  dialogData: POS2004Info[] = [];
  dialogSelectedItems: POS2004Info[] = [];

  dialogColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_Unit', header: '單位' },
    { field: 'PLU_BoxQty', header: '包裝入數' },
    { field: 'PLU_PageNum', header: '棚割編號' },
    { field: 'PLU_LocNo', header: '棚割序號' },
  ];

  onQuery(frm: FormGroup) {
    // TODO: 先用模擬資料
    this.dialogData = [
      { PLU_MagNo: '001', PLU_Name: '商品1', PLU_No: '1234567890123', PLU_Unit: '個', PLU_BoxQty: 10, PLU_PageNum: '1', PLU_LocNo: 1 },
      { PLU_MagNo: '002', PLU_Name: '商品2', PLU_No: '1234567890124', PLU_Unit: '個', PLU_BoxQty: 20, PLU_PageNum: '1', PLU_LocNo: 1 },
      { PLU_MagNo: '003', PLU_Name: '商品3', PLU_No: '1234567890125', PLU_Unit: '個', PLU_BoxQty: 30, PLU_PageNum: '1', PLU_LocNo: 1 },
    ];
  }

  saveDialog() {
    this.dialogVisible = false;
    this.data = [
      ...this.data,
      ...this.dialogSelectedItems
    ];
    this.dialogSelectedItems = [];
    this.selectedItems = [];
  }
  //#endregion

  clearDetail() {
    if (this.crudstatus === CRUDStatus.Create) {
      this.data = [];
      this.selectedItems = [];
      this.dialogSelectedItems = [];
    }
  }

  get TLS53010InsertManualRequest(): TLS53010InsertManualRequest {
    return {
      ...this.dataForm.getRawValue(),
      POS2004List: this.data
    };
  }

  setReadOnlyFields() {
    // 盤點單編號不能修改
    this.dataForm.get('PST_No')?.disable();
  }

  generatePSTNo() {
    // 產生盤點單編號
    this.dataForm.patchValue({ PST_No: '系統自動產生' });
  }
}