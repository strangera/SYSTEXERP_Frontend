import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { formatAmount, formatDate } from '@others/component/table/table.model';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { TLS2C040Service, UpdateTLS2C040Request } from '../../../service/api/tls/tls2c040.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

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
    TableReportComponent
  ]
})
export class TLS2C040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    TransVouNo: [{ value: '', disabled: true }],                 // 傳票編號
    VouType: [{ value: '', disabled: true }],                   // 傳票種類
    SrcSheetType: [{ value: '', disabled: true }],              // 傳票型態
    VouDate: [{ value: '', disabled: true }],                   // 傳票日期
    Remark: ['', Validators.required],                          // 傳票摘要
    No: [{ value: '', disabled: true }],                        // 結帳單號
    Trans_Status: [{ value: '', disabled: true }],                  // 傳票狀態
    CRT_USR_No: [{ value: '', disabled: true }],                // 建立人員
    CRT_Date: [{ value: '', disabled: true }],                  // 建立日期
    UPD_USR_No: [{ value: '', disabled: true }],                // 修改人員
    UPD_Date: [{ value: '', disabled: true }],                  // 修改日期
  });

  vouTypeOptions = getSYS1000Options('VouType');
  srcSheetTypeOptions = getSYS1000Options('ENTRY_TYPE')
    .filter(option => option.value !== 'WT' && option.value !== 'WD' && option.value !== 'PNC')
    .map(option => {
      const name = option.value === 'PN' ? '進貨帳款' : option.label;
      return {
        value: option.value,
        label: name,
        Display: `${option.value} - ${name}`
      };
    });
  transStatusOptions = getSYS1000Options('Trans_Status');
  private ledgerOptions$ = this.dropDown.queryGls1005_ledgerMD();
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent
  data: any[] = [];
  footerData: any = {};
  columns: ReportColumn[] = [];
  editColumns: EditColumn[] = [
    {
      field: 'AccNo', header: '科目代號', width: '200px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true,
      options: () => this.ledgerOptions$, // 使用科目代號 API
      optionLabel: 'value',                        // 顯示選中的代碼
      optionValue: 'value',                        // 綁定的值
      templateLabel: 'label',                      // 下拉清單顯示 "代碼 - 名稱"
      showClear: false,
      onChange: (value: any, rowData: any) => {
        if (value) {
          this.dropDown.queryGls1005_ledgerMD().subscribe(options => {
            const selected = options?.find(opt => opt.value === value);
            if (selected) {
              rowData.AccNotes = selected['Name'];
              rowData._dataStatus = 'modified';
            }
          });
        } else {
          rowData.AccCName = null;
        }
      }
    },
    { field: 'AccNotes', header: '科目名稱', textAlign: 'left' },
    { field: 'NoteDesc', header: '摘要', textAlign: 'left', type: 'input' },
    { field: 'DAccAmt', header: '借方金額', format: formatAmount, textAlign: 'right' },
    { field: 'CAccAmt', header: '貸方金額', format: formatAmount, textAlign: 'right' },
    { field: 'ORG_ID', header: '組織編號/名稱', textAlign: 'left', type: 'dropdown', options: this.dropDown.querySys3100(), optionsAsync: true, optionLabel: 'label', optionValue: 'value' },
    { field: 'ProjectNo', header: '活動代號', textAlign: 'left' },
    { field: 'PTA', header: '立沖代號' },
  ];
  totalRecords = 0;
  readonly arColumns: ReportColumn[] = [
    { field: 'VOUNO', header: '應收帳款代號', align: 'left' },
    { field: 'ProjectNo', header: '專案代號', align: 'left', width: '40px' },
    { field: 'org_id', header: '組織代碼', align: 'left', width: '40px' },
    { field: 'org_name', header: '組織名稱', align: 'left' },
    { field: 'CustomerNo', header: '客戶代碼', align: 'left' },
    { field: 'DetailNo', header: '廠商代號', align: 'left' },
    // 後端回傳 VouType = GLS1010.Voucher_Name（依傳票型態/種類對應的中文名稱）
    { field: 'VouType', header: '傳票類型', align: 'left' },
    { field: 'sam_yyymm', header: '年月', align: 'left', width: '40px' },
    { field: 'sam_termno', header: '帳次', align: 'left', width: '40px' },
    { field: 'ar_amt', header: '應收帳款金額', format: formatAmount, isTotal: true, align: 'right' },
    { field: 'pta_amt', header: '沖帳金額', format: formatAmount, align: 'right' },
    { field: 'accno', header: '會計科目', align: 'left' },
    { field: 'ent_date', header: '立帳日期', align: 'left', format: formatDate },
    { field: 'perget_date', header: '預計收款日期', align: 'left', format: formatDate },
    { field: 'SrcVouNo', header: '原始憑證', align: 'left' },
    { field: 'notedesc', header: '備註', align: 'left' },
  ];
  readonly apColumns: ReportColumn[] = [
    { field: 'VOUNO', header: '應付帳款代號', align: 'left' },
    { field: 'ProjectNo', header: '專案代號', align: 'left', width: '40px' },
    { field: 'org_id', header: '組織代碼', align: 'left', width: '40px' },
    { field: 'org_name', header: '組織名稱', align: 'left' },
    { field: 'CustomerNo', header: '客戶代碼', align: 'left' },
    { field: 'DetailNo', header: '廠商代號', align: 'left' },
    // 後端回傳 VouType = GLS1010.Voucher_Name（依傳票型態/種類對應的中文名稱）
    { field: 'VouType', header: '傳票類型', align: 'left' },
    { field: 'sam_yyymm', header: '年月', align: 'left', width: '40px' },
    { field: 'sam_termno', header: '帳次', align: 'left', width: '40px' },
    { field: 'ap_amt', header: '應付帳款金額', format: formatAmount, isTotal: true, align: 'right' },
    { field: 'pta_amt', header: '沖帳金額', format: formatAmount, align: 'right' },
    { field: 'accno', header: '會計科目', align: 'left' },
    { field: 'ent_date', header: '立帳日期', align: 'left', format: formatDate },
    { field: 'perget_date', header: '預計付款日期', align: 'left', format: formatDate },
    { field: 'SrcVouNo', header: '原始憑證', align: 'left' },
    { field: 'notedesc', header: '備註', align: 'left' },
    // { field: 'AP_Status', header: '狀態', align: 'left' },
  ];

  constructor(
    private tls2c040Service: TLS2C040Service,
    private dropDown: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2C040', this.dataForm);
    if (this.rowdata) {
      const id = this.rowdata?.id;
      if (this.queryData === '應付') {
        this.columns = this.apColumns;
        this.tls2c040Service.queryTLS2C040_GLS6005({ id }).pipe(untilDestroyed(this)).subscribe(res => {
          this.data = res.Data?._GLS6005List || [];
          this.footerData = { ap_amt: res.Data?.Total_AP_Amt };
          this.totalRecords = this.data.length;
        });
      } else if (this.queryData === '應收') {
        this.columns = this.arColumns;
        this.tls2c040Service.queryTLS2C040_GLS6004({ id }).pipe(untilDestroyed(this)).subscribe(res => {
          this.data = res.Data?._GLS6004List || [];
          this.footerData = { ar_amt: res.Data?.Total_ar_amt };
          this.totalRecords = this.data.length;
        });

      } else {
        const main = this.rowdata;
        this.data = main._GLS6002List.map((item: any) => ({
          ...item,
          DAccAmt: item.AccDC === 'D' ? item.AccAmt : 0,
          CAccAmt: item.AccDC === 'C' ? item.AccAmt : 0,
        }));
        this.calculateDefaultFooter();
        this.totalRecords = this.data.length;
      }
    }
  }
  private calculateDefaultFooter() {
    this.footerData = this.data.reduce((acc, cur) => {
      if (cur.AccDC === 'D') acc.DAccAmt += (cur.AccAmt || 0);
      if (cur.AccDC === 'C') acc.CAccAmt += (cur.AccAmt || 0);
      return acc;
    }, { DAccAmt: 0, CAccAmt: 0 });
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      if (this.queryData === '應收' || this.queryData === '應付') return;
      const formValue = form.getRawValue();
      const request: UpdateTLS2C040Request = {
        id: this.rowdata.id,
        Remark: formValue.Remark,
        GLS6002List: this.data.map(d => ({
          id: d.id,
          NoteDesc: d.NoteDesc,
          AccNo: d.AccNo,
          ORG_ID: d.ORG_ID
        }))
      };

      this.loading = true;
      this.tls2c040Service.updateTLS2C040(request)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(() => {
          this.messageService.successBubble('更新成功');
          this.onCancel();
        });
    });
  }
}
