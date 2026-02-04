import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IDropdownItem } from '@service/utility/dropdown-api.model';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { CustomFooterTableComponent } from '@shared/componentkit/custom-footer-table/customFooterTable.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { Column, formatAmount } from '@shared/componentkit/table/table.model';
import { validateRequired } from '@shared/componentkit/table/validate-field.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { TLS2C040Service } from '../../../service/api/tls/tls2c040.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

@Component({
  selector: 'app-tls2c040-cru',
  templateUrl: './tls2c040-cru.component.html',
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
    TableEditComponent,
    CustomFooterTableComponent
  ]
})
export class TLS2C040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    VouNo: [{ value: '', disabled: true }],                     // 傳票編號
    VouType: [{ value: '', disabled: true }],                   // 傳票種類
    SrcSheetType: [{ value: '', disabled: true }],              // 傳票型態
    VouDate: [{ value: '', disabled: true }],                   // 傳票日期
    Remark: ['', Validators.required],                          // 傳票摘要
    No: [{ value: '', disabled: true }],                        // 結帳單號
    PostFlag: [{ value: '', disabled: true }],                  // 傳票狀態
    CRT_USR_No: [{ value: '', disabled: true }],                // 建立人員
    CRT_Date: [{ value: '', disabled: true }],                  // 建立日期
    UPD_USR_No: [{ value: '', disabled: true }],                // 修改人員
    UPD_Date: [{ value: '', disabled: true }],                  // 修改日期
  });

  //#region 下拉選單選項
  // 傳票型態
  vouTypeOptions: IDropdownItem[] = [
    { No: '1', Name: '現金收入' },
    { No: '2', Name: '現金支出' },
    { No: '3', Name: '轉帳傳票' }
  ];
  // 傳票種類
  srcSheetTypeOptions: IDropdownItem[] = [];
  // 傳票狀態
  postFlagOptions: IDropdownItem[] = [
    { No: '0', Name: '作廢' },
    { No: '1', Name: '建立' },
    { No: '2', Name: '確認' },
    { No: '3', Name: '過帳' }
  ];
  //#endregion

  //#region 編輯明細table相關
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent
  editData: any[] = [];
  selectedItems: any[] = [];
  editFooterData = {
    debitAmount: 0, // 借方總金額
    creditAmount: 0, // 貸方總金額
  }

  editColumns: EditColumn[] = [
    { field: 'AccNo', header: '科目代號' },
    { field: 'AccNotes', header: '科目名稱' },
    { field: 'NoteDesc', header: '摘要', type: 'input', validate: [validateRequired], width: '250px' },
    {
      field: 'debitAmount', header: '借方金額',
      format: (v, i, r) => {
        if (r?.AccDC) {
          // 一般資料行
          return r.AccDC === 'D' ? formatAmount(r.AccAmt) : '0';
        } else {
          // footer 資料
          return v ? formatAmount(v) : '0';
        }
      },
    },
    {
      field: 'creditAmount', header: '貸方金額',
      format: (v, i, r) => {
        if (r?.AccDC) {
          // 一般資料行
          return r.AccDC === 'C' ? formatAmount(r.AccAmt) : '0';
        } else {
          // footer 資料
          return v ? formatAmount(v) : '0';
        }
      }
    },
    { field: 'ORG_ID', header: '組織代碼' },
    { field: 'ProjectNo', header: '活動代號' },
    { field: 'PTA', header: '立沖代號' }
  ];
  //#endregion

  //#region 檢視明細table相關
  detailData: any[] = [];
  totalRecords = 0;
  detailFooterData: any[] = [];

  detailColumns: Column[] = [
    { field: 'VOUNO', header: '應收帳款代號', visible: true },
    { field: 'SrcSheetType', header: '專案代號', visible: true },
    { field: 'org_id', header: '組織代碼', visible: true },
    { field: 'org_name', header: '組織名稱', visible: true },
    { field: 'CustomerNo', header: '客戶代碼', visible: true },
    { field: 'DetailNo', header: '廠商代碼', visible: true },
    { field: 'VouType', header: '傳票類型', visible: true },
    { field: 'sam_yyymm', header: '年月', visible: true },
    { field: 'sam_termno', header: '帳次', visible: true },
    { field: 'ar_amt', header: '應收帳款金額', visible: true, isTotal: true, format: formatAmount },
    { field: 'pta_amt', header: '沖帳金額', visible: true, format: formatAmount },
    { field: 'accno', header: '會計科目', visible: true },
    { field: 'ent_date', header: '立帳日期', visible: true },
    { field: 'perget_date', header: '預計收款日期', visible: true },
    { field: 'SrcVouNo', header: '原始憑證', visible: true },
    { field: 'notedesc', header: '備註', visible: true }
  ];
  //#endregion

  constructor(
    private tls2c040Service: TLS2C040Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2C040', this.dataForm);

    // 載入傳票種類
    this.dropDownListService.querySYS1000_DropDownList({ SYS_Type: 'entry_type' })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.srcSheetTypeOptions = response.Data;
      });

    // 編輯時 帶回明細資料
    if (this.crudstatus === CRUDStatus.Edit) {
      this.editData = this.rowdata._GLS6002List;
      this.editFooterData.debitAmount = this.totalDebitAmount;
      this.editFooterData.creditAmount = this.totalCreditAmount;
    }

    // 檢視時 帶回應收/應付資料
    if (this.crudstatus === CRUDStatus.Read) {
      // 應收
      if (this.queryData === '應收') {
        const req = {
          id: this.rowdata.id,
          PageSize: 20,
          PageIndex: 0,
          SortBy: []
        };
        this.tls2c040Service.queryTLS2C040_GLS6004(req)
          .pipe(untilDestroyed(this), finalize(() => this.loading = false))
          .subscribe(response => {
            this.detailData = response.Data._GLS6004List;
            this.totalRecords = response.TotalCount;
            this.detailFooterData = [{
              group_name: '總計',
              ar_amt: response.Data.Total_ar_amt
            }];
          });
      }
      // 應付
      else if (this.queryData === '應付') {
        // TODO: 待實作應付查詢
      }
    }
  }

  onSubmit(form: FormGroup): void {
    const formValue = form.getRawValue();
    // 送出前先驗證明細table
    const valid = this.tableEditComponent.validateAndShowErrors()
    if (!valid) {
      this.loading = false
      return;
    }
    this.handleSubmit(form, () => {
      // 僅更新傳票摘要
      if (this.crudstatus === CRUDStatus.Edit) {
        if (this.canEdit()) {
          const updateRequest = {
            id: this.rowdata.id,
            Remark: formValue.Remark || '',
            GLS6002List: this.editData.map(d => ({ id: d.id, NoteDesc: d.NoteDesc }))  // 傳票摘要
          };

          this.tls2c040Service.updateTLS2C040(updateRequest)
            .pipe(untilDestroyed(this), finalize(() => this.loading = false))
            .subscribe(() => {
              this.messageService.successBubble('修改成功');
              this.onCancel();  // 返回查詢頁
            });
        }
      }
    });
  }

  get totalDebitAmount() {
    return this.editData.reduce((sum, item) => sum + (item.AccDC === 'D' ? item.AccAmt : 0), 0);
  }

  get totalCreditAmount() {
    return this.editData.reduce((sum, item) => sum + (item.AccDC === 'C' ? item.AccAmt : 0), 0);
  }
}
