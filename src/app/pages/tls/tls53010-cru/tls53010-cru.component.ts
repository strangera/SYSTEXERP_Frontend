import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { POS2004Info, QueryTLS53010POS2004Request, TLS53010Data, TLS53010InsertManualRequest, TLS53010Service, TLS53010UpdateRequest } from '@service/api/tls/tls53010.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { validateRequired } from '@shared/componentkit/table/validate-field.model';
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
    TableComponent,
    TableReportComponent
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

  //#region 編輯Table相關
  @ViewChild('editTable') editTable!: TableEditComponent;
  editData: POS2004Info[] = [];
  selectedEditItems: POS2004Info[] = [];
  editColumns: EditColumn[] = [
    {
      field: 'PLU_No',
      header: '國際條碼',
      width: '150px',
      type: 'input',
      onBlur: (rowData: POS2004Info, value: string, col: EditColumn, index: number) => this.onPLU_NoBlur(rowData, value, col, index),
      validate: [validateRequired],
    },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_MagNo', header: '商品管理編號' },

    { field: 'UNIT_NAME', header: '單位' },
  ]
  //#endregion

  //#region 檢視Table相關
  data: POS2004Info[] = [];
  selectedItems: POS2004Info[] = [];
  detailLoading = false;
  lastQueryBody: any;
  totalRecords = 0;
  columns: Column[] = [
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_MagNo', header: '商品管理編號', },
    { field: 'UNIT_NAME', header: '單位' },
  ]
  //#endregion

  constructor(
    public tls53010Service: TLS53010Service,
    private datePipe: DatePipe,
    private dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS53010', this.dataForm);
    this.loadOptions();
    this.loadHOSOptions();
    this.loadLOGOOptions();
    this.setReadOnlyFields();

    // 編輯跟檢視時 帶回明細資料
    if (this.crudstatus === CRUDStatus.Edit || this.crudstatus === CRUDStatus.Read) {
      this.loadDetailData();
    }
  }

  // 新增 or 編輯送出
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const valid = this.editTable.validateAndShowErrors();
      if (!valid) {
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

  // 載入下拉選單選項
  loadOptions() {
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

  // 載入倉別選項
  loadHOSOptions() {
    this.dropDownListService.getPOS2034Options()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.hosOptions = response.Data.map(item => ({
          value: item.No,
          label: `${item.No}-${item.Name}`
        }));
      });
  }

  // 載入品牌選項
  loadLOGOOptions() {
    this.dropDownListService.queryPLULOGO_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.logoOptions = response.Data.map(item => ({
          value: item.No,
          label: `${item.No}-${item.Name}`
        }));
      });
  }

  // 不可新增重複的商品管理編號
  isRowSelectable(event: POS2004Info): boolean {
    return !this.data.some((item: POS2004Info) => item.PLU_MagNo === event.PLU_MagNo)
      && !this.editData.some((item: POS2004Info) => item.PLU_MagNo === event.PLU_MagNo);
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

  // 分類下拉選項
  CAT_LNoOptions: any[] = [];   // 大分類代碼
  CAT_MNoOptions: any[] = [];   // 中分類代碼
  CAT_SNoOptions: any[] = [];   // 小分類代碼

  dialogData: POS2004Info[] = [];
  dialogSelectedItems: POS2004Info[] = [];
  dialogTotalRecords = 0;

  dialogColumns: Column[] = [
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'UNIT_NAME', header: '單位' },
    { field: 'PLU_BoxQty', header: '包裝入數' },
    { field: 'PLU_PageNum', header: '棚割編號' },
    { field: 'PLU_LocNo', header: '棚割序號' },
  ];

  onQuery(frm: FormGroup) {
    const queryRequest: QueryTLS53010POS2004Request = {
      ...frm.getRawValue(),
      LOGO_No: this.dataForm.get('LOGO_No')?.value || '',
      HOS_No: this.dataForm.get('HOS_No')?.value || '',
    };
    this.tls53010Service.queryTLS53010POS2004(queryRequest).pipe(untilDestroyed(this)).subscribe(response => {
      this.dialogData = response.Data;
      this.dialogTotalRecords = response.TotalCount;
    });
  }

  saveDialog() {
    this.dialogVisible = false;
    this.editData = [
      ...this.editData,
      ...this.dialogSelectedItems
    ];
    this.dialogSelectedItems = [];
    this.selectedEditItems = [];
  }
  //#endregion

  // 表單清除事件
  onClear() {
    this.selectedEditItems = [];
    this.dialogSelectedItems = [];
    this.editData = [];
    if (this.crudstatus === CRUDStatus.Create) {
      this.dialogData = [];
    }
  }

  // 設定不可編輯欄位
  setReadOnlyFields() {
    // 盤點單編號不能修改
    this.dataForm.get('PST_No')?.disable();
    // 編輯功能時 倉別代碼/品牌代碼不能修改
    if (this.crudstatus === CRUDStatus.Edit) {
      this.dataForm.get('HOS_No')?.disable();
      this.dataForm.get('LOGO_No')?.disable();
    }
  }

  // 表單重置
  resetForm() {
    this.dataForm.reset();
    this.data = [];
    this.dialogData = [];
    this.selectedItems = [];
    this.dialogSelectedItems = [];
    this.editData = [];
    this.selectedEditItems = [];
  }

  // 手動新增 Request
  get TLS53010InsertManualRequest(): TLS53010InsertManualRequest {
    return {
      HOS_No: this.dataForm.get('HOS_No')?.value || '',
      LOGO_No: this.dataForm.get('LOGO_No')?.value || '',
      PST_Date: this.datePipe.transform(this.dataForm.get('PST_Date')?.value, 'yyyy-MM-dd')!,
      PST_Remark: this.dataForm.get('PST_Remark')?.value || '',
      POS2004List: this.editData.map(item => ({
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

  // 更新 Request
  get TLS53010UpdateRequest(): TLS53010UpdateRequest {
    return {
      POS2033M_ID: this.rowdata!.id,
      PST_No: this.dataForm.get('PST_No')?.value || '',
      PST_Date: this.datePipe.transform(this.dataForm.get('PST_Date')?.value, 'yyyy-MM-dd')!,
      PST_Remark: this.dataForm.get('PST_Remark')?.value || '',
      POS2004List: this.editData.map(item => ({
        POS2033_ID: item.id || 0,
        PLU_MagNo: item.PLU_MagNo || '',
        PLU_No: item.PLU_No || '',
        PLU_Unit: item.PLU_Unit,
        PLU_BoxQty: item.PLU_BoxQty,
        PLU_Name: item.PLU_Name,
        PLU_PageNum: item.PLU_PageNum,
        PLU_LocNo: item.PLU_LocNo,
        Action: 'I',
      }))
    };
  }

  // 刪除 Request
  get TLS53010DeleteRequest(): TLS53010UpdateRequest {
    return {
      POS2033M_ID: this.rowdata!.id,
      PST_No: this.dataForm.get('PST_No')?.value || '',
      PST_Date: this.datePipe.transform(this.dataForm.get('PST_Date')?.value, 'yyyy-MM-dd')!,
      PST_Remark: this.dataForm.get('PST_Remark')?.value || '',
      POS2004List: this.selectedItems.map(item => ({
        POS2033_ID: item.id || 0,
        PLU_MagNo: item.PLU_MagNo || '',
        PLU_No: item.PLU_No || '',
        PLU_Unit: item.PLU_Unit,
        PLU_BoxQty: item.PLU_BoxQty,
        PLU_Name: item.PLU_Name,
        PLU_PageNum: item.PLU_PageNum,
        PLU_LocNo: item.PLU_LocNo,
        Action: 'D',
      }))
    };
  }

  // 查詢明細資料
  queryDetailFunction = (body: any) => {
    return this.tls53010Service.queryTLS53010Detail(body);
  };

  // 刪除明細資料
  onDelete(selectedItems: POS2004Info[]) {
    this.confirmationService.confirm({
      header: `已選擇 ${selectedItems.length} 筆資料，確定刪除？`,
      accept: () => {
        this.tls53010Service.updateTLS53010(this.TLS53010DeleteRequest)
          .pipe(untilDestroyed(this)).subscribe(() => {
            this.messageService.successBubble('刪除成功');
            // 刪除後從 data 移除選取的項目
            this.loadDetailData();
            this.selectedItems = [];
          });
      }
    });
  }

  // 手動輸入國際條碼 代回商品資料
  onPLU_NoBlur(rowData: POS2004Info, value: string, col: EditColumn, index: number) {
    const logoNo = this.dataForm.controls.LOGO_No.value;
    if (!logoNo || !value) {
      return;
    }
    const queryRequest: QueryTLS53010POS2004Request = {
      PLU_MagNo: value,      // 輸入商品管理編號/國際條碼都可以 模糊查詢
      LOGO_No: this.dataForm.get('LOGO_No')?.value || '',
      HOS_No: this.dataForm.get('HOS_No')?.value || '',
    };
    this.tls53010Service.queryTLS53010POS2004(queryRequest).pipe(untilDestroyed(this)).subscribe(response => {
      if (response.Data && response.Data.length > 0) {
        this.editData = [
          ...this.editData.slice(0, index), {
            PLU_MagNo: response.Data[0].PLU_MagNo,
            PLU_No: response.Data[0].PLU_No,
            PLU_Name: response.Data[0].PLU_Name,
            UNIT_NAME: response.Data[0].UNIT_NAME,
          },
          ...this.editData.slice(index + 1)
        ]
      } else {
        this.messageService.errorBubble('查無該商品資訊');
        this.editData[index] = {
          ...this.editData[index],
          PLU_MagNo: '',
        };
        this.editData = [...this.editData];
      }
    });
  }

  // 編輯表單整列驗證
  validateEntireRow = (rowData: POS2004Info): { isValid: boolean, errorMessage: string } => {
    const hasDuplicatePLU_MagNo = this.editData.filter(item => item.PLU_MagNo === rowData.PLU_MagNo).length > 1;
    const existsInData = this.data.some(item => item.PLU_MagNo === rowData.PLU_MagNo);
    if (existsInData) {
      return { isValid: false, errorMessage: '此商品已於明細中' };
    }
    if (hasDuplicatePLU_MagNo) {
      return { isValid: false, errorMessage: '商品管理編號重複' };
    }
    return { isValid: true, errorMessage: '' };
  };

  // 載入明細資料
  loadDetailData() {
    if (this.rowdata) {
      this.detailLoading = true;
      const payload = {
        MID: 0,
        PST_No: this.rowdata.PST_No,
        SYS_StoreNo: this.rowdata.SYS_StoreNo,
        HOS_No: this.rowdata.HOS_No,
        pageSize: 30,
        pageIndex: 1,
        SortBy: [],
      };

      // 先設定 lastQueryBody
      this.lastQueryBody = payload;

      this.tls53010Service.queryTLS53010Detail(payload)
        .pipe(untilDestroyed(this), finalize(() => this.detailLoading = false))
        .subscribe(response => {
          this.data = response.Data;
          // 更新 totalRecords 以啟用虛擬滾動
          this.totalRecords = response.TotalCount || response.Data.length;
        });
    }
  }

  // 倉別代碼變更時 帶出相應品牌
  onHOSNoChange(event: any) {
    if (!event) {
      // 重置倉別選項
      this.loadHOSOptions();
      return;
    }

    this.tls53010Service.queryLOGOaccorHOS({ HOS_No: event })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        const uniqueLogos = Array.from(
          new Map(response.Data.map(item => [item.LOGO_No, item])).values()
        );
        this.logoOptions = uniqueLogos.map(item => ({
          value: item.LOGO_No,
          label: `${item.LOGO_No}-${item.LOGO_CH_NAME}`
        }));

        const currentLogoNo = this.dataForm.get('LOGO_No')?.value;
        if (currentLogoNo && !this.logoOptions.some(option => option.value === currentLogoNo)) {
          // 使用 emitEvent: false 避免觸發 valueChanges
          this.dataForm.get('LOGO_No')?.setValue(null, { emitEvent: false });
        }
      });
  }

  // 品牌代碼變更時 帶出相應倉別
  onLOGONoChange(event: any) {
    if (!event) {
      // 重置品牌選項
      this.loadLOGOOptions();
      return;
    }

    this.tls53010Service.queryLOGOaccorHOS({ LOGO_No: event })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        const uniqueHOS = Array.from(
          new Map(response.Data.map(item => [item.HOS_No, item])).values()
        );
        this.hosOptions = uniqueHOS.map(item => ({
          value: item.HOS_No,
          label: `${item.HOS_No}-${item.HOS_NAME}`
        }));

        const currentHOSNo = this.dataForm.get('HOS_No')?.value;
        if (currentHOSNo && !this.hosOptions.some(option => option.value === currentHOSNo)) {
          // 使用 emitEvent: false 避免觸發 valueChanges
          this.dataForm.get('HOS_No')?.setValue(null, { emitEvent: false });
        }
      });
  }
}
