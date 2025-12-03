import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { POS2004Info, QueryTLS53010POS2004Request, TLS53010Data, TLS53010DetailQueryRequest, TLS53010InsertManualRequest, TLS53010Service, TLS53010UpdateRequest } from '@service/api/tls/tls53010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { ValidationService } from '@shared/service/validation.service';
import { PanelModule } from 'primeng/panel';
import { debounceTime, finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

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
  get yesterday(): Date {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  }

  dataForm = this.formBuilder.nonNullable.group({
    PST_No: ['系統自動產生'], // 盤點單編號
    HOS_No: [null, Validators.required], // 倉別代碼 - 必填
    LOGO_No: [null, Validators.required], // 品牌代碼 - 必填
    PST_Date: [this.yesterday.toString(), Validators.required], // 盤點基準日期 - 必填
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
    { field: 'PLU_Unit', header: '單位', format: (v, i, r) => r.UNIT_NAME },
  ]

  data: POS2004Info[] = [];
  selectedItems: POS2004Info[] = [];
  detailLoading = false;

  constructor(
    private tls53010Service: TLS53010Service,
    private datePipe: DatePipe,
    private validationService: ValidationService,
    private dropDownListService: DropDownListService,
    private dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS53010', this.dataForm);
    this.loadOptions();
    this.setReadOnlyFields();

    // 編輯跟檢視時 帶回明細資料
    if (this.crudstatus === CRUDStatus.Edit || this.crudstatus === CRUDStatus.Read) {
      if (this.rowdata) {
        this.detailLoading = true;
        const payload: TLS53010DetailQueryRequest = {
          MID: 0,
          PST_No: this.rowdata.PST_No,
          SYS_StoreNo: this.rowdata.SYS_StoreNo,
          HOS_No: this.rowdata.HOS_No
        };
        this.tls53010Service.queryTLS53010Detail(payload)
          .pipe(untilDestroyed(this), finalize(() => this.detailLoading = false))
          .subscribe(response => {
            this.data = response.Data;
          });
      }
    }
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      // 檢核 data 至少要有一筆
      if (this.data.length < 1) {
        this.messageService.errorBubble('請新增至少一筆明細資料');
        this.loading = false;
        return;
      }
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            this.tls53010Service.insertTLS53010Manual(this.TLS53010InsertManualRequest)
              .pipe(untilDestroyed(this), finalize(() => this.loading = false))
              .subscribe(() => {
                this.messageService.successBubble('新增成功');
                this.resetForm();
              });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            this.tls53010Service.updateTLS53010(this.TLS53010UpdateRequest)
              .pipe(untilDestroyed(this), finalize(() => this.loading = false))
              .subscribe(() => {
                this.messageService.successBubble('更新成功');
                this.resetForm();
                this.onCancel();
              });
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
      if (value && this.dialogQueryForm.controls.CAT_LNo.value) {
        this.dropDownListService.queryPOS20032_DropDownList({
          CATList: [
            {
              CAT_LNo: this.dialogQueryForm.controls.CAT_LNo.value,
              CAT_MNo: value
            }
          ]
        }).pipe(untilDestroyed(this)).subscribe(response => {
          this.CAT_SNoOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
        });
        this.dialogQueryForm.controls.CAT_SNo.enable();
      } else {
        this.dialogQueryForm.controls.CAT_SNo.disable();
      }
      this.dialogQueryForm.controls.CAT_SNo.setValue(null); // 清空中分類選擇
    });
  }

  // 不可新增重複的商品管理編號
  isRowSelectable(event: POS2004Info): boolean {
    return !this.data.some((item: POS2004Info) => item.PLU_MagNo === event.PLU_MagNo);
  }

  // 新增全品項 僅新增時可用
  insertTLS53010(form: FormGroup) {
    this.handleSubmit(form, () => {
      if (this.canAdd()) {
        const payload = {
          ...form.getRawValue(),
          PST_Date: this.datePipe.transform(form.get('PST_Date')?.value, 'yyyy-MM-dd') || null
        }
        this.tls53010Service.insertTLS53010(payload)
          .pipe(untilDestroyed(this), finalize(() => this.loading = false))
          .subscribe(() => {
            this.messageService.successBubble('新增全品項完成');
            this.resetForm();
            this.onCancel();
          });
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
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]) // 分頁和排序參數
  });

  totalRecords = 0;

  // 分類下拉選項
  CAT_LNoOptions: any[] = [];   // 大分類代碼
  CAT_MNoOptions: any[] = [];   // 中分類代碼
  CAT_SNoOptions: any[] = [];   // 小分類代碼

  dialogData: POS2004Info[] = [];
  dialogSelectedItems: POS2004Info[] = [];

  dialogColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'UNIT_NAME', header: '單位' },
    { field: 'PLU_BoxQty', header: '包裝入數' },
    { field: 'PLU_PageNum', header: '棚割編號' },
    { field: 'PLU_LocNo', header: '棚割序號' },
  ];

  onQuery(frm: FormGroup) {
    const queryRequest: QueryTLS53010POS2004Request = {
      ...frm.getRawValue(),
      LOGO_No: this.dataForm.get('LOGO_No')?.value || '',
    };
    this.tls53010Service.queryTLS53010POS2004(queryRequest).pipe(untilDestroyed(this)).subscribe(response => {
      this.dialogData = response.Data;
      this.totalRecords = response.TotalCount;
    });
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
    this.selectedItems = [];
    this.dialogSelectedItems = [];
    if (this.crudstatus === CRUDStatus.Create) {
      this.data = [];
      this.dialogData = [];
    }
  }

  get TLS53010InsertManualRequest(): TLS53010InsertManualRequest {
    return {
      HOS_No: this.dataForm.get('HOS_No')?.value || '',
      LOGO_No: this.dataForm.get('LOGO_No')?.value || '',
      PST_Date: this.datePipe.transform(this.dataForm.get('PST_Date')?.value, 'yyyy-MM-dd')!,
      PST_Remark: this.dataForm.get('PST_Remark')?.value || '',
      POS2004List: this.data.map(item => ({
        PLU_MagNo: item.PLU_MagNo,
        PLU_No: item.PLU_No,
        PLU_Unit: item.PLU_Unit,
        PLU_BoxQty: item.PLU_BoxQty,
        PLU_Name: item.PLU_Name,
        PLU_PageNum: item.PLU_PageNum,
        PLU_LocNo: item.PLU_LocNo,
      }))
    };
  }

  setReadOnlyFields() {
    // 盤點單編號不能修改
    this.dataForm.get('PST_No')?.disable();
    // 編輯功能時 倉別代碼/品牌代碼不能修改
    if (this.crudstatus === CRUDStatus.Edit) {
      this.dataForm.get('HOS_No')?.disable();
      this.dataForm.get('LOGO_No')?.disable();
    }
  }

  resetForm() {
    this.dataForm.reset();
    this.data = [];
    this.dialogData = [];
    this.selectedItems = [];
    this.dialogSelectedItems = [];
  }

  get TLS53010UpdateRequest(): TLS53010UpdateRequest {
    return {
      POS2033M_ID: this.rowdata!.id,
      PST_No: this.dataForm.get('PST_No')?.value || '',
      PST_Date: this.datePipe.transform(this.dataForm.get('PST_Date')?.value, 'yyyy-MM-dd')!,
      PST_Remark: this.dataForm.get('PST_Remark')?.value || '',
      POS2004List: this.data.map(item => ({
        POS2033_ID: item.id || 0,
        PLU_MagNo: item.PLU_MagNo || '',
        PLU_No: item.PLU_No || '',
        PLU_Unit: item.PLU_Unit,
        PLU_BoxQty: item.PLU_BoxQty,
        PLU_Name: item.PLU_Name,
        PLU_PageNum: item.PLU_PageNum,
        PLU_LocNo: item.PLU_LocNo,
      }))
    };
  }
}
