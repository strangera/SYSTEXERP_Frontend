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
import { TLS53010Data, TLS53010Service } from '@service/api/tls/tls53010.service';
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
    HOS_No: [''], // 倉別代碼
    LOGO_No: [''], // 品牌代碼
    PST_Date: [''], // 盤點基準日期
    PST_Remark: [''], // 備註
  });

  // 下拉選單
  hosOptions: any[] = [];   // 倉別選項
  logoOptions: any[] = [];  // 品牌選項
  // 盤點單狀態選項 TODO: 待定義
  pstStatusOptions: any[] = [
    { value: '0', label: '未完成' },
    { value: '1', label: '已完成' },
    { value: '2', label: '已取消' }
  ];

  // 明細table相關
  editColumns: EditColumn[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'UNIT_NAME', header: '單位' },
  ]

  data: any[] = [];
  selectedItems: any[] = [];

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

  dialogData: any[] = [];
  dialogSelectedItems: any[] = [];

  dialogColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'UNIT_NAME', header: '單位' },
    { field: 'PLU_BoxQty', header: '包裝入數' },
    { field: 'PLU_StockTaxType', header: '稅別', format: (value) => value === '0' ? '免稅' : '應稅' },
    { field: 'PLU_SalePrc_UNI', header: '單價' },
    { field: 'PLU_SalePrc', header: '售價' },
  ];

  onQuery(frm: FormGroup) {
    // this.dialogLoading = true;
    // const body = {
    //   ...frm.getRawValue(),
    //   VEN_No: this.dataForm.controls.VEN_No.value,
    //   LOGO_No: this.dataForm.controls.LOGO_No.value,
    // }
    // this.tls52010Service.queryPOS2004DetailByVenNo(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
    //   this.dialogData = response.Data;
    //   this.totalRecords = response.TotalCount;
    // })
  }

  saveDialog() {
    this.dialogVisible = false;
    this.data = [
      ...this.data,
      ...this.dialogSelectedItems.map(item => ({
        ...item,
        PLU_BoxQty: item.PLU_BoxQty === undefined || item.PLU_BoxQty === null ? 0 : item.PLU_BoxQty,
        POD_SubQty: 1,
        POD_Remark: ''
      }))
    ];
    this.dialogSelectedItems = [];
    this.selectedItems = [];
  }
  //#endregion

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
  }

  onSubmit(form: FormGroup): void {
    // const formValue = form.getRawValue();
    // this.handleSubmit(form, () => {
    //   switch (this.crudstatus) {
    //     case CRUDStatus.Create:
    //       if (this.canAdd()) {
    //         const rb: TLS53010InsertRequest = {
    //           PST_No: formValue.PST_No,
    //           HOS_No: formValue.HOS_No,
    //           LOGO_No: formValue.LOGO_No,
    //           PST_Date: this.datePipe.transform(formValue.PST_Date, 'yyyy-MM-dd') ?? '',
    //           PST_Status: formValue.PST_Status,
    //           PST_Remark: formValue.PST_Remark
    //         };
    //         this.tls53010Service.insertTLS53010(rb)
    //           .pipe(untilDestroyed(this), finalize(() => this.loading = false))
    //           .subscribe(() => {
    //             this.messageService.successBubble('新增成功');
    //             this.onCancel();
    //           });
    //       }
    //       break;
    //     case CRUDStatus.Edit:
    //       if (this.canEdit()) {
    //         const rb: TLS53010UpdateRequest = {
    //           ID: formValue.ID,
    //           PST_No: formValue.PST_No,
    //           HOS_No: formValue.HOS_No,
    //           LOGO_No: formValue.LOGO_No,
    //           PST_Date: this.datePipe.transform(formValue.PST_Date, 'yyyy-MM-dd') ?? '',
    //           PST_Status: formValue.PST_Status,
    //           PST_Remark: formValue.PST_Remark
    //         };
    //         this.tls53010Service.updateTLS53010(rb)
    //           .pipe(untilDestroyed(this), finalize(() => this.loading = false))
    //           .subscribe(() => {
    //             this.messageService.successBubble('更新成功');
    //             this.onCancel();
    //           });
    //       }
    //       break;
    //   }
    // });
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

  setReadOnlyFields() {
    // 盤點單編號不能修改
    this.dataForm.get('PST_No')?.disable();
  }

  generatePSTNo() {
    // 產生盤點單編號
    this.dataForm.patchValue({ PST_No: '系統自動產生' });
  }

  isRowSelectable(event: any): boolean {
    return !this.data || !this.data.some((item: any) => item.PLU_MagNo === event.PLU_MagNo);
  }
}