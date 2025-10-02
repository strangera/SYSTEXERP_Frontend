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
    { field: 'AcctNo', header: '科目代號' },
    {
      field: 'Remark', header: '摘要', type: 'input', validate: [validateRequired], width: '250px'
    },
    { field: 'DebitAmt', header: '借方金額', format: formatAmount },
    { field: 'CreditAmt', header: '貸方金額', format: formatAmount },
    { field: 'OrgCode', header: '組織代碼' },
    { field: 'ActivityNo', header: '活動代號' },
    { field: 'OffsetNo', header: '立沖代號' }
  ]

  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent
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
      this.loadDetailData();
    }
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

  onSubmit(form: FormGroup): void {
    const formValue = form.getRawValue();
    this.handleSubmit(form, () => {
      // 送出前先驗證明細table
      const valid = this.tableEditComponent.validateAndShowErrors()
      if (!valid) {
        this.loading = false
        return;
      }
      // 僅更新傳票摘要
      if (this.crudstatus === CRUDStatus.Edit) {
        const updateRequest = {
          ID: this.rowdata?.ID!,
          Remark: formValue.Remark || ''
        }
        // 這裡需要根據實際 API 調整更新方法
        // this.tls2c040Service.updateTLS2C040(updateRequest)
        //   .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        //   .subscribe(() => {
        //     this.messageService.successBubble('修改成功');
        //     this.onCancel();  // 返回查詢頁
        //   });

        // 暫時模擬成功
        this.messageService.successBubble('修改成功');
        this.onCancel();
      }
    });
  }

  loadDetailData(): void {
    this.data = [
      { AcctNo: '1001', Remark: '現金收入', DebitAmt: 1000, CreditAmt: 0, OrgCode: 'A01', ActivityNo: 'ACT100', OffsetNo: '' },
      { AcctNo: '2001', Remark: '銷貨收入', DebitAmt: 0, CreditAmt: 1000, OrgCode: 'A01', ActivityNo: 'ACT100', OffsetNo: '' }
    ]
  }
}