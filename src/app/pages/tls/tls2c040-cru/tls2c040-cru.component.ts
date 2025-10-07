import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { TLS2C040Service } from '../../../service/api/tls/tls2c040.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { NgIf } from '@angular/common';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { IDropdownItem } from '@service/utility/dropdown-api.model';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table/validate-field.model';
import { formatAmount } from '@shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls2c040-cru',
  templateUrl: './tls2c040-cru.component.html',
  styleUrl: './tls2c040-cru.component.scss',
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
    TableEditComponent
  ]
})
export class TLS2C040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    VouNo: [''],                                               // 傳票編號
    VouType: [''],                                             // 傳票種類
    SrcSheetType: [''],                                        // 傳票型態
    VouDate: [''],                                             // 傳票日期
    Remark: ['', Validators.required],                         // 傳票摘要
    No: [''],                                                  // 結帳單號
    PostFlag: [''],                                            // 傳票狀態
    CRT_USR_No: [''],                                          // 建立人員
    CRT_Date: [''],                                            // 建立日期
    UPD_USR_No: [''],                                          // 修改人員
    UPD_Date: [''],                                           // 修改日期
  });

  // 下拉選單選項
  // 傳票型態
  vouTypeOptions: IDropdownItem[] = [
    { No: '1', Name: '現金收入' },
    { No: '2', Name: '現金支出' },
    { No: '3', Name: '轉帳傳票' }
  ];
  // 傳票種類
  srcSheetTypeOptions: IDropdownItem[] = [
    { No: 'SD', Name: '每日營收傳票' },
    { No: 'MR', Name: '租金傳票' },
    { No: 'MD', Name: '代扣款傳票' },
    { No: 'PR', Name: '抽成傳票' },
    { No: 'PN', Name: '進貨帳款-暫估應付傳票' },
    { No: 'PNC', Name: '進貨帳款-成本結轉' },
    { No: 'PT', Name: '每日營收傳票' },
    { No: 'WD', Name: '自營日結暫存傳票' },
  ];
  // 傳票狀態
  postFlagOptions: IDropdownItem[] = [
    { No: '0', Name: '作廢' },
    { No: '1', Name: '建立' },
    { No: '2', Name: '確認' },
    { No: '3', Name: '過帳' }
  ];

  // 明細table相關
  editColumns: EditColumn[] = [
    {
      field: 'AccNo', header: '科目代號',
      format: (v, i, r) => `${v}-${r.AccNotes}`,
    },
    { field: 'NoteDesc', header: '摘要' },
    {
      field: 'AccAmt', header: '借方金額',
      format: (v, i, r) => r.AccDC === 'D' ? formatAmount(v) : '0',
    },
    {
      field: 'AccAmt', header: '貸方金額',
      format: (v, i, r) => r.AccDC === 'C' ? formatAmount(v) : '0'
    },
    { field: 'ORG_ID', header: '組織代碼' },
    { field: 'ProjectNo', header: '活動代號' },
    { field: 'PTA', header: '立沖代號' }
  ]

  data: any[] = [];
  selectedItems: any[] = [];

  constructor(
    private tls2c040Service: TLS2C040Service,
    private dropdownApiService: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2C040', this.dataForm);
    this.setupFormControls();
    // 編輯時 帶回明細資料
    if (this.crudstatus === CRUDStatus.Edit || this.crudstatus === CRUDStatus.Read) {
      this.data = this.rowdata._GLS6002List;
    }
  }

  onSubmit(form: FormGroup): void {
    const formValue = form.getRawValue();
    this.handleSubmit(form, () => {
      // 僅更新傳票摘要
      if (this.crudstatus === CRUDStatus.Edit) {
        const updateRequest = {
          id: this.rowdata.id,
          Remark: formValue.Remark || ''
        }
        this.tls2c040Service.updateTLS2C040(updateRequest)
          .pipe(untilDestroyed(this), finalize(() => this.loading = false))
          .subscribe(() => {
            this.messageService.successBubble('修改成功');
            this.onCancel();  // 返回查詢頁
          });
      }
    });
  }

  setupFormControls(): void {
    // 除了傳票摘要以外，其他欄位皆不可編輯
    this.dataForm.get('VouNo')?.disable();
    this.dataForm.get('VouType')?.disable();
    this.dataForm.get('SrcSheetType')?.disable();
    this.dataForm.get('VouDate')?.disable();
    this.dataForm.get('No')?.disable();
    this.dataForm.get('PostFlag')?.disable();
    this.dataForm.get('CRT_USR_No')?.disable();
    this.dataForm.get('CRT_Date')?.disable();
    this.dataForm.get('UPD_USR_No')?.disable();
    this.dataForm.get('UPD_Date')?.disable();
  }
}