import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-fin28010-cru',
  templateUrl: './fin28010-cru.component.html',
  styleUrl: './fin28010-cru.component.scss',
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
export class FIN28010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    INV_YN: [''],                                      // 是否補發票
    VouNo: [''],                    // 傳票編號
    VouType: [''],                    // 傳票種類
    SrcSheetType: [''],                // 傳票型態
    VouDate: [''],                     // 傳票日期
    Remark: [''],                         // 傳票摘要
    No: [''],                       // 結帳單號
    PostFlag: [''],                     // 傳票狀態
    CRT_USR_No: [''],                // 建立人員
    CRT_Date: [''],                  // 建立日期
    UPD_USR_No: [''],                // 修改人員
    UPD_Date: [''],                  // 修改日期
  });


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
  INV_YNOptions: IDropdownItem[] = [
    { No: 'Y', Name: '補發票' },
    { No: 'N', Name: '不補發票' }
  ];
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

    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN28010', this.dataForm);

    // 載入傳票種類
    this.dropDownListService.querySYS1000_DropDownList({ SYS_Type: 'entry_type' })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.srcSheetTypeOptions = response.Data;
      });

  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {


      // this.fin54025Service
      //   .queryFIN54025(payload)
      //   .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
      //   .subscribe({
      //     next: (res) => {
      //       if (res.Status === '0000') {
      //         this.data = res.Data || [];
      //         this.totalRecords = res.TotalCount || this.data.length;
      //       } else {
      //         this.messageService.errorBubble(res.Message || '查詢失敗');
      //       }
      //     },
      //   });
    });
  }

}
