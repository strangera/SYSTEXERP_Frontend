import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { NgFor, NgIf } from '@angular/common';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

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
    NgFor,
    InputTextComponent,
    ButtonComponent,
    NgIf,
    TranslateModule
  ]
})
export class TLS2J020CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    bus_type: ['', Validators.required],
  });

  mode: CRUDStatus = CRUDStatus.Create; // 新增 or 編輯模式
  override formTitle = '';
  busTypeOptions: any[] = [];
  data: any[] = [];
  selectedItems: any[] = [];
  totalRecords = 0;
  createColumns: EditColumn[] = [
    { field: 'CHG_ItemName', header: '品項名稱', type: 'input', width: '200px' },
    {
      field: 'Item_TaxType', header: '稅別', type: 'dropdown', width: '150px',
      options: [
        { label: '應稅', value: 'T' },
        { label: '免稅', value: 'F' }
      ]
    },
  ];

  /**  編輯時使用的欄位配置（不同格式） */
  editColumns: EditColumn[] = [
    { field: 'CHG_ItemName', header: '品項名稱', type: 'input', width: '250px' },
    { field: 'Item_TaxType', header: '稅別', type: 'input', width: '150px' },
    { field: 'LastModifiedDate', header: '最後修改時間', type: 'input', width: '180px' },
  ];

  /**  動態決定顯示哪組欄位 */
  get columns(): EditColumn[] {
    return this.mode === CRUDStatus.Create ? this.createColumns : this.editColumns;
  }


  constructor(private dropDownListService: DropDownListService) {
    super();
  }

  ngOnInit(): void {
    // 取得狀態與資料
    const state = history.state;
    this.mode = state.crudstatus;
    const rowData = state.rowdata;

    // 初始化頁面
    this.initializePage('TLS2J020', this.dataForm);

    // 下拉選項
    this.loadOptions();

    if (this.mode === CRUDStatus.Edit && rowData) {
      this.formTitle = '編輯大分類換開品項';
      // 編輯模式不顯示上方 dropdown，只顯示明細表
      this.dataForm.patchValue(rowData);
      this.data = rowData.details ?? [];
    } else {
      this.formTitle = '新增大分類換開品項';
      this.dataForm.reset();
      this.data = [];
    }
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

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      this.loading = true;
      if (this.mode === CRUDStatus.Create) {
        console.log('新增資料:', form.value, this.data);
        // call 新增 API
      } else if (this.mode === CRUDStatus.Edit) {
        console.log('編輯資料:', form.value, this.data);
        // call 更新 API
      }
      this.loading = false;
    });
  }


}
