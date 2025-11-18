import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { NgIf } from '@angular/common';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { TLS2J020Service } from '@service/api/tls/tls2j020.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls2j020-cru',
  templateUrl: './tls2j020-cru.component.html',
  styleUrls: ['./tls2j020-cru.component.scss'],
  standalone: true,
  imports: [
    TableEditComponent,
    DropdownComponent,
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    NgIf,
    TranslateModule
  ]
})
export class TLS2J020CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    bus_type: [''],
  });
  mode: CRUDStatus = CRUDStatus.Create; // 新增 or 編輯模式
  override formTitle = '';
  busTypeOptions: any[] = [];
  data: any[] = [];
  selectedItems: any[] = [];
  totalRecords = 0;
  createColumns: EditColumn[] = [
    { field: 'CHG_ItemName', header: '品項名稱', type: 'input', width: '200px', disabled: () => true },
    {
      field: 'Item_TaxType', header: '稅別', type: 'dropdown', width: '150px',
      options: [
        { label: '免稅', value: '0' },
        { label: '應稅', value: '1' }
      ],
      optionLabel: 'label',
      optionValue: 'value',
      showClear: false
    },
  ];
  /**  編輯 */
  editColumns: EditColumn[] = [
    {
      field: 'bus_type',
      header: '大分類代碼',
      type: 'dropdown',
      width: '200px',
      options: () => this.busTypeOptions,
      optionLabel: 'Name',
      optionValue: 'No',
      showClear: false
    },
    { field: 'CHG_ItemName', header: '品項名稱', type: 'input', width: '250px' },
    {
      field: 'Item_TaxType', header: '稅別', type: 'dropdown', width: '150px',
      options: [
        { label: '免稅', value: '0' },
        { label: '應稅', value: '1' }
      ],
      optionLabel: 'label',
      optionValue: 'value',
      showClear: false
    },
  ];

  /**  查看 */
  readColumns: EditColumn[] = [
    { field: 'bus_type', header: '大分類代碼', type: 'input', width: '100px', disabled: () => true },
    { field: 'bus_type_name', header: '大分類名稱', type: 'input', width: '120px', disabled: () => true },
    { field: 'CHG_ItemName', header: '品項名稱', type: 'input', width: '250px', disabled: () => true },
    {
      field: 'Item_TaxType', header: '稅別', type: 'dropdown', width: '150px',
      options: [
        { label: '免稅', value: '0' },
        { label: '應稅', value: '1' }
      ],
      optionLabel: 'label',
      optionValue: 'value',
      showClear: false,
      disabled: () => true
    },
  ];

  /**  動態決定顯示哪組欄位 */
  get columns(): EditColumn[] {
    if (this.mode === CRUDStatus.Create) {
      return this.createColumns;
    } else if (this.mode === CRUDStatus.Edit) {
      return this.editColumns;
    } else if (this.mode === CRUDStatus.Read) {
      return this.readColumns;
    }
    return this.editColumns;
  }

  constructor(
    private dropDownListService: DropDownListService,
    private tls2j020Service: TLS2J020Service
  ) {
    super();
  }

  ngOnInit(): void {
    const state = history.state;
    this.mode = state.crudstatus;
    const rowData = state.rowdata;

    this.initializePage('TLS2J020', this.dataForm);

    this.loadOptions();

    if (this.mode === CRUDStatus.Create) {
      this.formTitle = '新增大分類換開品項';
      this.dataForm.reset();
      this.data = [];
      this.setupCreateModeQuery();
    }
    else if (this.mode === CRUDStatus.Edit && rowData) {
      this.formTitle = '編輯大分類換開品項';
      this.patchEditData(rowData);
    }
    else if (this.mode === CRUDStatus.Read && rowData) {
      this.formTitle = '查看大分類換開品項';
      this.patchReadData(rowData);
    }
  }
  patchEditData(rowData: any) {
    this.dataForm.patchValue({
      bus_type: rowData.bus_type
    });

    this.data = [{
      id: rowData.id,
      ID: rowData.id,
      tds1009_id: rowData.tds1009_id || 0,
      bus_type: rowData.bus_type,
      bus_type_name: rowData.bus_type_name,
      CHG_ItemName: rowData.CHG_ItemName,
      Item_TaxType: rowData.Item_TaxType,
      Item_TaxType_Desc: rowData.Item_TaxType_Desc,
      LastModifiedDate: rowData.LastModifiedDate
    }];
  }
  patchReadData(rowData: any) {
    this.dataForm.patchValue({
      bus_type: rowData.bus_type
    });

    this.data = [{
      id: rowData.id,
      ID: rowData.id,
      tds1009_id: rowData.tds1009_id || 0,
      bus_type: rowData.bus_type,
      bus_type_name: rowData.bus_type_name,
      CHG_ItemName: rowData.CHG_ItemName,
      Item_TaxType: rowData.Item_TaxType,
      Item_TaxType_Desc: rowData.Item_TaxType_Desc,
      LastModifiedDate: rowData.LastModifiedDate
    }];
  }

  setupCreateModeQuery() {
    this.dataForm.controls.bus_type.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(busType => {
        if (busType) {
          this.loadCreateItems(busType);
        } else {
          this.data = [];
        }
      });
  }
  loadOptions() {
    this.dropDownListService.queryTLTBUSTYPE_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.busTypeOptions = response.Data.map((item: any) => ({
          Name: `${item.No}-${item.Name}`,
          No: item.No
        }));
      });
  }
  loadCreateItems(busType: string) {
    const payload = {
      ID: busType
    };

    this.loading = true;

    this.tls2j020Service
      .dropdownTLS2J020editCHG_ItemName(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            this.data = res.Data ?? [];
            this.totalRecords = this.data.length;
          } else {
            this.data = [];
            this.totalRecords = 0;
            this.messageService.errorBubble(res.Message || '查詢失敗');
          }
        }
      });
  }

  /** 查詢*/
  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      const v = form.value;
      if (this.mode === CRUDStatus.Create) {
        // 新增
        if (!v.bus_type) {
          this.messageService.errorBubble('請選擇大分類', '缺少必要資料');
          return;
        }
        if (!this.data || this.data.length === 0) {
          this.messageService.errorBubble('請先查詢品項資料', '缺少明細資料');
          return;
        }
        this.insertData(v.bus_type);
      } else if (this.mode === CRUDStatus.Edit) {
        // 編輯模式執行更新邏輯
        this.updateData();
      } else if (this.mode === CRUDStatus.Read) {
        // 詳細查看模式：不執行任何操作
        return;
      }
    });
  }

  /** 查詢指定大分類的品項資料 */
  queryItems(busType: string) {
    const payload = {
      bus_type: [busType],
      CHG_ItemName: null,
      Item_TaxType: null
    };
    this.loading = true;
    this.tls2j020Service
      .queryTLS2J020(payload)
      .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
      .subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            this.data = res.Data || [];
            this.totalRecords = res.TotalCount || this.data.length;
          } else {
            this.messageService.errorBubble(res.Message || '查詢失敗');
            this.data = [];
            this.totalRecords = 0;
          }
        },
      });
  }

  /** 查詢按鈕點擊事件 */
  onQuery() {
    const busType = this.dataForm.get('bus_type')?.value;
    if (!busType) {
      this.messageService.errorBubble('請先選擇大分類', '缺少必要條件');
      return;
    }
    this.queryItems(busType);
  }

  /** 新增資料 */
  insertData(busType: string) {
    // 只使用被選中的資料，並過濾掉空的資料行
    const selectedValidData = this.selectedItems.filter(item =>
      item.CHG_ItemName && item.CHG_ItemName.trim() !== '' &&
      item.Item_TaxType && item.Item_TaxType.trim() !== ''
    );
    if (selectedValidData.length === 0) {
      this.messageService.errorBubble('請選擇至少一筆完整的資料', '沒有選中的有效資料');
      return;
    }

    // 符合後端新的 API 格式
    const requestBody = {
      bus_type: busType,
      TLS2J020_Detail: selectedValidData.map(item => ({
        ID: item.ID || 0,
        tds1009_id: item.tds1009_id || 0,
        CHG_ItemName: item.CHG_ItemName ? item.CHG_ItemName.trim() : '',
        Item_TaxType: item.Item_TaxType ? item.Item_TaxType.trim() : ''
      }))
    };
    this.loading = true;
    this.tls2j020Service
      .insertTLS2J020(requestBody)
      .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
      .subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            this.messageService.successBubble('新增成功');
            this.onCancel();
          } else {
            this.messageService.errorBubble(res.Message || '新增失敗');
          }
        },

      });
  }

  /** 更新資料 */
  updateData() {
    // 編輯模式：直接使用 table-edit 中的資料（通常只有一筆）
    if (!this.data || this.data.length === 0) {
      this.messageService.errorBubble('沒有可更新的資料');
      return;
    }
    const updateItem = this.data[0]; // 編輯模式通常只有一筆資料

    // 驗證必要欄位
    if (!updateItem.CHG_ItemName || updateItem.CHG_ItemName.trim() === '') {
      this.messageService.errorBubble('品項名稱不能為空');
      return;
    }
    if (!updateItem.Item_TaxType || updateItem.Item_TaxType.trim() === '') {
      this.messageService.errorBubble('稅別不能為空');
      return;
    }

    // 準備更新 API 的資料格式 - 符合後端要求
    const requestBody = {
      id: updateItem.id || updateItem.ID || 0,
      tds1009_id: updateItem.tds1009_id || 0,
      bus_type: this.dataForm.get('bus_type')?.value || updateItem.bus_type || '',
      CHG_ItemName: updateItem.CHG_ItemName.trim(),  // 使用後端期望的 Pascal Case
      Item_TaxType: updateItem.Item_TaxType.trim(),  // 使用後端期望的 Pascal Case
      upd_date: new Date().toISOString(),
      upd_usr_no: this.authService.currentUserValue?.user_No || '',
      upd_usr_name: this.authService.currentUserValue?.user_Name || ''
    };

    this.loading = true;
    this.tls2j020Service
      .updateTLS2J020(requestBody)
      .pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (res: any) => {
          if (res.Status === '0000') {
            this.messageService.successBubble('更新成功');
            this.onCancel();
          } else {
            this.messageService.errorBubble(res.Message || '更新失敗');
          }
        },
      });
  }

}
