import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS2J020Service } from '@service/api/tls/tls2j020.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';

@Component({
  selector: 'app-tls2j020-cru',
  templateUrl: './tls2j020-cru.component.html',
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
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  dataForm = this.formBuilder.nonNullable.group({
    bus_type: [null, [Validators.required]],
  });
  busTypeOptions: any[] = [];
  editCHGItemOptions: any[] = []; // 編輯模式下的品項名稱選項
  Item_TaxTypeOptions = [{ label: '免稅', value: '0' }, { label: '應稅', value: '1' }];
  data: any[] = [];
  selectedItems: any[] = [];
  totalRecords = 0;
  createColumns: EditColumn[] = [
    {
      field: 'CHG_ItemName', header: '品項名稱', type: 'input', disabled: () => true, width: '100%',
      validate: [validateRequired]
    },
    {
      field: 'Item_TaxType', header: '稅別', type: 'dropdown', width: '150px',
      options: this.Item_TaxTypeOptions,
      optionLabel: 'label',
      optionValue: 'value',
      showClear: false,
      validate: [validateRequired]
    },
  ];
  /**  編輯 */
  editColumns: EditColumn[] = [
    { field: 'bus_type_label', header: '大分類代碼/名稱', width: '200px', },
    {
      field: 'CHG_ItemName',
      header: '品項名稱',
      type: 'dropdown',
      width: '100%',
      options: () => this.editCHGItemOptions,
      optionLabel: 'CHG_ItemName',
      optionValue: 'CHG_ItemName',
      showClear: false,
      validate: [validateRequired]
    },
    {
      field: 'Item_TaxType', header: '稅別', type: 'dropdown',
      options: this.Item_TaxTypeOptions,
      width: '100%',
      optionLabel: 'label',
      optionValue: 'value',
      showClear: false,
      validate: [validateRequired]
    },
  ];
  /**  查看 */
  readColumns: EditColumn[] = [
    { field: 'bus_type', header: '大分類代碼' },
    { field: 'bus_type_name', header: '大分類名稱' },
    { field: 'CHG_ItemName', header: '品項名稱' },
    { field: 'Item_TaxType', header: '稅別', format: (value) => value === '0' ? '免稅' : '應稅' },
  ];

  /**  動態決定顯示哪組欄位 */
  get columns(): EditColumn[] {
    switch (this.crudstatus) {
      case CRUDStatus.Create:
        return this.createColumns;
      case CRUDStatus.Edit:
        return this.editColumns;
      case CRUDStatus.Read:
        return this.readColumns;
      default:
        return [];
    }
  }

  constructor(
    private dropDownListService: DropDownListService,
    private tls2j020Service: TLS2J020Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2J020', this.dataForm);
    this.dropDownListService.queryTLTBUSTYPE_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.busTypeOptions = res.Data.map(item => ({ Name: `${item.No}-${item.Name}`, No: item.No }));
    });
    if (this.isFormCreateable) {
      this.formTitle = '新增大分類換開品項';
      this.tls2j020Service.queryTLS2J020_add({}).subscribe(res => this.data = res.Data);
    }
    else if (this.isFormEditable && this.rowdata) {
      this.formTitle = '編輯大分類換開品項';
      this.patchData(this.rowdata);
    }
    else if (this.isFormReadable && this.rowdata) {
      this.formTitle = '查看大分類換開品項';
      this.patchData(this.rowdata);
    }
  }
  patchData(rowData: any) {
    this.tls2j020Service.dropdownTLS2J020editCHG_ItemName({ ID: rowData.TDS1009_id }).pipe(untilDestroyed(this)).subscribe(res => {
      this.editCHGItemOptions = res.Data;
      this.data = [{ ...rowData, bus_type_label: rowData.bus_type + '-' + rowData.bus_type_name, }];
    });
  }
  /** 查詢*/
  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      const valid = this.tableEditComponent.validateAndShowErrors();
      if (!valid) {
        this.loading = false;
        return;
      };
      const v = form.value;
      if (this.isFormCreateable) {
        this.insertData(v.bus_type);
      } else if (this.isFormEditable) {
        this.updateData();
      }
    });
  }

  /** 新增資料 */
  insertData(busType: string) {
    const requestBody = {
      bus_type: busType,
      TLS2J020_Detail: this.selectedItems
    };
    this.loading = true;
    this.tls2j020Service.insertTLS2J020(requestBody).pipe(finalize(() => (this.loading = false)), untilDestroyed(this)).subscribe(res => {
      this.messageService.successBubble('新增成功');
      this.onCancel();
    });
  }

  /** 更新資料 */
  updateData() {
    const updateItem = this.data[0]; // 編輯模式通常只有一筆資料
    const requestBody = {
      id: updateItem.id || updateItem.ID || 0,
      tds1009_id: updateItem.tds1009_id || 0,
      bus_type: updateItem.bus_type_code || this.dataForm.get('bus_type')?.value || '', // 使用原始代碼
      CHG_ItemName: updateItem.CHG_ItemName.trim(),  // 使用後端期望的 Pascal Case
      Item_TaxType: updateItem.Item_TaxType.trim(),  // 使用後端期望的 Pascal Case
    };
    this.tls2j020Service.updateTLS2J020(requestBody).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
      this.messageService.successBubble('更新成功');
      this.onCancel();
    });
  }
}
