import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { formatAmount, formatDate, formatDateToYYYY_MM_DD } from '@others/component/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs';
import { Tls2a010Service } from 'src/app/service/api/tls/tls2a010.service';
@Component({
  selector: 'app-tls2a060-cru',
  templateUrl: './tls2a060-cru.component.html',
  styleUrls: ['./tls2a060-cru.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    AccordionModule,
    TooltipModule,
    TranslateModule,
    ReactiveFormsModule,
    TableEditComponent
  ]
})
export class TLS2A060CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  @ViewChild(TableEditComponent) tableEdit!: TableEditComponent;
  paymentToolOptions: any[] = []; // 全部付款方式下拉清單
  payNoMap: Record<string, string> = {}; // 對照表: No -> Name

  dataForm = this.formBuilder.nonNullable.group({
    ID: [''],
    TXN_Date: [''],
    ECR_No: [''],
    PAY_NO: [''],
    PAY_Type: [''],
  });

  data: any[] = [];
  PAY_Type = '';
  ID = '';

  /** 審核狀態下拉選單 */
  checkStatusOptions: Record<string, any[]> = {
    CREDIT: [
      { label: '已繳回', value: '1' },
      { label: '信用卡缺單', value: '2' },
      { label: '信用卡未簽', value: '3' },
      { label: '其他異常', value: '4' },
    ],
    VOUCHER: [
      { label: '已繳回', value: '1' },
      { label: '其他異常', value: '4' },
      { label: '遺失券', value: '5' },
    ],
    TPAY: [
      { label: '已繳回', value: '1' },
      { label: '其他異常', value: '4' },
    ],
    VOID: [
      { label: '已繳回', value: '1' },
      { label: '發票未繳回', value: '6' },
    ],
  };

  /** PAY_NO 對應分類 */
  payNoCategory: Record<string, string> = {
    '12': 'CREDIT', '14': 'CREDIT', '41': 'CREDIT', '42': 'CREDIT', '43': 'CREDIT', '44': 'CREDIT',
    '20': 'VOUCHER', '24': 'VOUCHER', '25': 'VOUCHER', '26': 'VOUCHER', '27': 'VOUCHER',
    '30': 'VOUCHER', '62': 'VOUCHER', '71': 'VOUCHER', '72': 'VOUCHER', '73': 'VOUCHER',
    '52': 'TPAY', '54': 'TPAY', '55': 'TPAY', '57': 'TPAY',
    '99': 'VOID',
  };

  columns: EditColumn[] = [
    {
      field: 'TXN_Date',
      header: '日期',
      textAlign: 'center',
      format: formatDate
    },
    { field: 'ECR_No', header: '收銀機代號', textAlign: 'center', type: undefined },
    { field: 'TXN_No', header: '交易序號', textAlign: 'center', type: undefined },
    { field: 'TLT_No', header: '專櫃編號', textAlign: 'center', type: undefined },
    { field: 'tlt_name', header: '櫃位名稱', textAlign: 'center', type: undefined },
    {
      field: 'PAY_NO',
      header: '付款方式',
      textAlign: 'center',
      format: (_: any, __?: number, row?: any) => this.payNoMap[row?.PAY_NO] || row?.PAY_NO || '',
    },
    { field: 'CRD_No', header: '付款卡號', textAlign: 'center', type: undefined },
    { field: 'TXN_PayAmt', header: '付款金額', textAlign: 'right', type: undefined, format: formatAmount },
    {
      field: 'check_status',
      header: '審核狀態',
      type: 'dropdown',
      textAlign: 'center',
      optionLabel: 'label',
      optionValue: 'value',
      options: (row: any) => {
        const category = this.payNoCategory[row.PAY_NO];
        return this.checkStatusOptions[category] || [];
      }
    },
    {
      field: 'check_remark',
      header: '備註',
      type: 'input',
      textAlign: 'left',
      maxLength: 10,
      width: '200px',
      validate: [
        (value: any) => {
          if (!value) return { isValid: true, errorMessage: [] };
          const isValid = value.toString().length <= 10;
          return {
            isValid,
            errorMessage: ['備註最多 10 個字'],
          };
        },
      ],
    },
  ];
  footerData: any;

  constructor(
    private tls2a010Service: Tls2a010Service,
    private dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2A060', this.dataForm);

    // 載入付款方式清單
    this.dropDownListService.querySYS1000_DropDownList({ SYS_Type: 'FIN_PAY_Type' })
      .pipe(untilDestroyed(this))
      .subscribe(sysRes => {
        const sysOptions = sysRes.Data.map(item => ({
          label: `${item.No ?? ''}-${item.Name ?? ''}`,
          value: item.No,
          Name: item.Name,
          No: item.No
        }));

        this.dropDownListService.queryPOS1006_DropDownList()
          .pipe(untilDestroyed(this))
          .subscribe(posRes => {
            const payNoToTypeMap = new Map<string, string>();
            posRes.Data.forEach(x => {
              payNoToTypeMap.set(x.No ?? '', x.PAY_Type ?? '');
            });

            this.paymentToolOptions = sysOptions.map(opt => ({
              ...opt,
              PAY_Type: payNoToTypeMap.get(opt.No) ?? ''
            }));

            this.payNoMap = this.paymentToolOptions.reduce((acc, cur) => {
              acc[cur.No] = cur.Name;
              return acc;
            }, {} as Record<string, string>);

            const nav = history.state as any;
            if (nav?.rowdata) {
              const row = nav.rowdata;
              this.PAY_Type = row.PAY_Type || '';
              this.ID = row.ID || '';
              this.loadAllData();
            }
          });
      });

    this.crudstatus = CRUDStatus.Edit;
  }


  /** 載入資料 */
  loadAllData(): void {
    this.loading = true;
    this.tls2a010Service.queryDetailTLS2A010(this.dataForm.value).subscribe({
      next: (response) => {
        if (response.Status === '0000') {
          this.data = (response.Data.mainData ?? []).map((item: any) => ({
            ...item,
            TXN_Date: this.formatDate(item.TXN_Date),
            check_status: item.check_status ?? '1',
          }));
          this.footerData = {
            TXN_PayAmt: this.data.reduce((sum, item) => sum + (item.TXN_PayAmt || 0), 0),
          };
        }
        this.loading = false;
      },
    });
  }

  /** 日期字串轉換 */
  private formatDate(dateStr: any): Date | null {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;
    const str = String(dateStr);
    if (str.includes('/')) {
      const [mm, dd, yyyy] = str.split(' ')[0].split('/');
      return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  /** 儲存 */
  onSubmit(frm: FormGroup) {
    const payload = {
      PAY_Type: this.PAY_Type ?? '',
      selectList: this.data.map(item => ({
        id: item.id ?? 0,
        TXN_Date: formatDateToYYYY_MM_DD(item.TXN_Date),
        ECR_No: item.ECR_No ?? '',
        TXN_No: item.TXN_No ?? 0,
        PAY_NO: item.PAY_NO ?? '',
        TXN_Item: item.TXN_Item ?? 0,
        CRD_No: item.CRD_No ?? '',
        CPN_No: item.CPN_No ?? '',
        TXN_PayDesc: item.TXN_PayDesc ?? '',
        TXN_PayAmt: item.TXN_PayAmt ?? 0,
        check_status: item.check_status ?? '',
        check_remark: item.check_remark ?? '',
        dataStatus: item.dataStatus
      })),
    };
    this.handleSubmit(frm, () => {
      this.tls2a010Service.insertTLS2A010(payload).pipe(finalize(() => this.loading = false)).subscribe({
        next: () => {
          this.messageService.successBubble('審核成功');
          this.messageService.unblockUi();
          this.onCancel();
        },
      });
    })
  }
}
