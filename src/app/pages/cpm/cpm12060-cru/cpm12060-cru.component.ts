import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Cpm12060Service } from '@service/api/cpm/cpm12060.service';
import { CalenderoneComponent } from '@shared/componentkit/calenderone/calenderone.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { option } from '@shared/models/sys/sysb000.model';
import { PanelModule } from 'primeng/panel';
import { CPM11010Service, CPM11020Data, CPM11020DetailItem, InsertCPM11020Request, UpdateCPM11020Request } from '../../../service/api/cpm/cpm11020.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '../../../shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '../../../shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '../../../shared/componentkit/table-edit/validate-field.model';

//5.1.2.6  顧客意見處理狀況表 CRU
@Component({
  selector: 'app-cpm12060-cru',
  standalone: true,
  templateUrl: './cpm12060-cru.component.html',
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    ButtonComponent,
    NgIf,
    TranslateModule,
    TableEditComponent,
    DropdownComponent,
    CalenderoneComponent
  ]
})
export class CPM12060CRUComponent extends BasicCruPageComponent<CPM11020Data> implements OnInit {
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;

  dataForm = this.formBuilder.nonNullable.group({
    SEQ_ID: ['', [Validators.required, Validators.maxLength(20)]], // 單號
    CUST_NAME: ['', [Validators.required, Validators.maxLength(60)]], // 客戶名稱
    SEX: ['', [Validators.required, Validators.maxLength(2)]], // 性別
    COMPLAIN_DATE: [null, [Validators.required]], // 提供日期
    ORG_ID: ['', [Validators.required, Validators.maxLength(10)]], // 處理單位
    STATUS: ['', [Validators.required, Validators.maxLength(1)]], // 處理狀態(S:已建立,W:已派單,Y:處理中,Z:結案)
    ANSWER_DATE_MM: ['', [Validators.maxLength(4)]], // 處理-時
  });

  // 處理狀態 下拉選單
  statusOptions: option[] = [
    { label: '已建立', value: 'S' },
    { label: '已派單', value: 'W' },
    { label: '處理中', value: 'Y' },
    { label: '結案', value: 'Z' },
  ]
  // 性別 下拉選單
  SEXOptions: option[] = [
    { label: '男', value: 'M' },
    { label: '女', value: 'F' },
  ]

  // 表格編輯欄位定義
  editColumns: EditColumn[] = [
    {
      field: 'Service_Id',
      header: '服務台位置',
      width: '200px',
      type: 'dropdown',
      options: [],
      optionLabel: 'label',
      optionValue: 'value',
      validate: [validateRequired, this.validateUniqueServiceId.bind(this)],
    },
    {
      field: 'Device_Qty',
      header: '分配設備數量',
      type: 'inputNumber',
      width: '150px',
      validate: [validateRequired],
    },
  ];

  originalData: CPM11020DetailItem[] = [];
  originalMainData: { Device_ID: string; Device_Name: string; Device_TotQty: string } | null = null;
  data: CPM11020DetailItem[] = [];
  selectedItems: CPM11020DetailItem[] = [];

  constructor(
    private readonly cpm11020Service: CPM11010Service,
    private readonly cpm12060Service: Cpm12060Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM12060', this.dataForm);

    // 載入服務台位置下拉選項
    // this.cpm11020Service.queryCPM10010()
    //   .pipe(untilDestroyed(this))
    //   .subscribe(response => {
    //     this.serviceLocationOptions = (response.Data || []).map(item => ({
    //       label: `${item.Service_Id} - ${item.Service_Name}`,
    //       value: item.Service_Id
    //     }));

    //     // 更新 editColumns 中的 options
    //     const serviceLocationColumn = this.editColumns.find(col => col.field === 'Service_Id');
    //     if (serviceLocationColumn) {
    //       serviceLocationColumn.options = this.serviceLocationOptions;
    //     }
    //   });

    // 載入主檔資料
    const id = 1; //目前沒給，先用預設的
    this.cpm12060Service.queryCPM12060_Main({ ID: id })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        console.log('主檔資料:', response.Data);
      });

    // 載入明細資料
    this.cpm12060Service.queryCPM12060_Detail({ ID: id })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        console.log('明細資料:', response.Data);
      });

    if (!this.isFormCreateable) {
      this.loadDetailData();
    }
  }

  loadDetailData(): void {
    const id = this.rowdata?.ID;
    if (!id) return;

    this.cpm11020Service.queryCPM11020Detail({ ID: id })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        if (response.Data) {
          const detail = response.Data;

          // 儲存原始主表單資料
          this.originalMainData = {
            Device_ID: detail.MainData.Device_ID,
            Device_Name: detail.MainData.Device_Name,
            Device_TotQty: detail.MainData.Device_TotQty.toString(),
          };

          // 填充主表單資料
          // this.dataForm.patchValue(this.originalMainData);

          // 填充明細資料
          if (detail.Details && detail.Details.length > 0) {
            this.data = [...detail.Details];
            this.originalData = [...detail.Details];
          }
        }
      });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      // 驗證明細至少要有一筆（排除已刪除的）
      const activeData = this.data.filter(item => item._dataStatus !== 'deleted');
      if (activeData.length === 0) {
        this.messageService.errorBubble('明細至少要有一筆');
        this.loading = false;
        return;
      }

      // 驗證表格欄位
      const valid = this.tableEditComponent.validateAndShowErrors();
      if (!valid) {
        this.loading = false;
        return;
      }

      const formValue = frm.getRawValue();

      // 根據新增/修改模式準備不同的請求資料
      if (this.isFormCreateable) {
        // 新增模式
        const insertRequest: InsertCPM11020Request = {
          Device_ID: formValue.Device_ID,
          Device_Name: formValue.Device_Name,
          Device_TotQty: Number(formValue.Device_TotQty),
          Details: this.data.map(item => ({
            Service_Id: item.Service_Id,
            Device_Qty: item.Device_Qty,
          }))
        };

        console.log('新增請求資料:', insertRequest);

        // this.cpm11020Service.insertCPM11020(insertRequest)
        //   .pipe(
        //     untilDestroyed(this)
        //   )
        //   .subscribe({
        //     next: () => {
        //       this.messageService.successBubble('新增成功');
        //       this.loading = false;
        //       // 新增成功後重置表單
        //       this.dataForm.reset();
        //       this.data = [];
        //       this.selectedItems = [];
        //     },
        //     error: () => {
        //       this.loading = false;
        //     }
        //   });
      } else {
        // 修改模式 - 使用 dataStatus 追蹤變更
        const updateRequest: UpdateCPM11020Request = {
          ID: this.rowdata?.ID || 0,
          Device_ID: formValue.Device_ID,
          Device_Name: formValue.Device_Name,
          Device_TotQty: Number(formValue.Device_TotQty),
          Details: this.data.map(item => ({
            ID: item.ID,  // 帶上明細ID
            Service_Id: item.Service_Id,
            Device_Qty: item.Device_Qty,
            _dataStatus: item._dataStatus || 'original'  // 帶上狀態
          }))
        };

        console.log('更新請求資料:', updateRequest);

        // this.cpm11020Service.updateCPM11020(updateRequest)
        //   .pipe(
        //     untilDestroyed(this)
        //   )
        //   .subscribe({
        //     next: () => {
        //       this.messageService.successBubble('修改成功');
        //       this.loading = false;
        //       this.onCancel();
        //     },
        //     error: () => {
        //       this.loading = false;
        //     }
        //   });
      }
    });
  }

  onDataChange(newData: CPM11020DetailItem[]): void {
    this.data = newData;
    // this.calculateDeviceTotQty();
  }

  onReset(): void {
    // 恢復主表單資料
    if (this.originalMainData) {
      // this.dataForm.patchValue(this.originalMainData);
    } else {
      this.dataForm.reset();
    }

    // 恢復明細資料
    this.data = [...this.originalData];

    // 重新計算設備總量
    // this.calculateDeviceTotQty();
  }

  // 計算設備總量（排除已刪除的明細）
  // calculateDeviceTotQty(): void {
  //   const totalQty = this.data
  //     .filter(item => item._dataStatus !== 'deleted')  // 排除已刪除的明細
  //     .reduce((sum, item) => sum + (item.Device_Qty || 0), 0);
  //   this.dataForm.patchValue({
  //     Device_TotQty: totalQty.toString()
  //   });
  // }

  // 驗證服務台位置不能重複
  validateUniqueServiceId(value: string, rowData: CPM11020DetailItem, _data: CPM11020DetailItem[], _field: string, _header: string): { isValid: boolean; errorMessage: string[] } {
    if (!value) return { isValid: true, errorMessage: [] }; // 空值由 validateRequired 處理

    // 檢查是否有其他行（排除當前行和已刪除的明細）使用了相同的 Service_Id
    const duplicate = this.data.some(item =>
      item !== rowData &&  // 排除當前行
      item._dataStatus !== 'deleted' &&  // 排除已刪除的明細
      item.Service_Id === value
    );

    return {
      isValid: !duplicate,
      errorMessage: duplicate ? ['服務台位置不可重複'] : []
    };
  }
}
