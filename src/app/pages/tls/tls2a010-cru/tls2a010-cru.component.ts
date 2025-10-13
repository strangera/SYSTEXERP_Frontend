import { Component, OnInit } from '@angular/core';
import { Column, formatAmount, formatDate } from '../../../shared/componentkit/table/table.model';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';
import { PanelModule } from 'primeng/panel';
import { TLS2A010Data } from '../tls2a010/tls2a010.model';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { Tls2a010Service } from 'src/app/service/api/tls/tls2a010.service';
import { createPaginationConfig } from 'src/app/shared/componentkit/table/table.model';
import { Router } from '@angular/router';
import { CustomFooterTableComponent } from '@shared/componentkit/custom-footer-table/customFooterTable.component';


@Component({
  selector: 'app-tls2a010-cru',
  templateUrl: './tls2a010-cru.component.html',
  styleUrls: ['./tls2a010-cru.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    AccordionModule,
    TranslateModule,
    ReactiveFormsModule,
    TooltipModule,
    CustomFooterTableComponent
  ],
})
export class TLS2A010CRUComponent extends BasicCruPageComponent<TLS2A010Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    TXN_Date: [''],
    ECR_No: [''],
    PAY_NO: [''],
    ...createPaginationConfig([{ field: 'TXN_No', order: 1 }]),
  });

  footerData: any[] = [];

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
    // 信用卡
    '12': 'CREDIT', '14': 'CREDIT', '41': 'CREDIT',
    '42': 'CREDIT', '43': 'CREDIT', '44': 'CREDIT',

    // 有價券
    '20': 'VOUCHER', '24': 'VOUCHER', '25': 'VOUCHER',
    '26': 'VOUCHER', '27': 'VOUCHER', '30': 'VOUCHER',
    '62': 'VOUCHER', '71': 'VOUCHER', '72': 'VOUCHER',
    '73': 'VOUCHER',

    // 電子支付
    '52': 'TPAY', '54': 'TPAY', '55': 'TPAY', '57': 'TPAY',

    // 作廢發票
    '99': 'VOID',
  };

  columns: Column[] = [
    { field: 'group_name', header: '總計',hidden: true },
    { field: 'TXN_Date', header: '日期', format: formatDate },
    { field: 'ECR_No', header: '收銀機代號' },
    { field: 'TXN_No', header: '交易序號' },
    { field: 'TLT_NO', header: '專櫃編號' },
    { field: 'tlt_name', header: '櫃位名稱' },
    { field: 'PAY_NO', header: '付款方式' },
    { field: 'CRD_No', header: '付款卡號' },
    { field: 'TXN_PayAmt', header: '付款金額', isTotal: true, format: formatAmount },
    {
      field: 'check_status',
      header: '審核狀態',
      type: 'dropdown',
      options: (row: any) => {
        const category = this.payNoCategory[row.PAY_NO];
        return this.checkStatusOptions[category] || [];
      },
      optionLabel: 'label',
      optionValue: 'value',
    },
    {
      field: 'check_remark',
      header: '備註',
      type: 'input',
      validate: [
        (value: any) => {
          if (!value) return { isValid: true, errorMessage: [] };
          const isValid = value.toString().length <= 10;
          return {
            isValid,
            errorMessage: ['最多只能輸入 10 個字', '備註'],
          };
        },
      ],
    },
  ];

  totalRecords = 0;
  data: any[] = [];
  PAY_Type = '';
  ID = '';

  constructor(
    private tls2a010Service: Tls2a010Service,
    private Router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2A010', this.dataForm);

    const nav = history.state as any;
    if (nav?.rowdata) {
      const row = nav.rowdata;
      this.PAY_Type = row.PAY_Type || '';
      this.ID = row.ID || '';

      // 保存完整的 rowdata 以供 API 查詢使用
      console.log('接收到的 rowdata:', row);

      this.loadAllData();
    }
  }

  /** 載入所有資料 */
  private loadAllData(): void {
    this.loading = true;

    const nav = history.state as any;
    const rowData = nav?.rowdata;
    const queryParams = {
      PageSize: 999, // 設定一個大數值來獲取所有資料
      PageIndex: 1,
      OrderBy: "TXN_No",
      Offset: 0,
      SortBy: [
        {
          field: "TXN_No",
          order: 1
        }
      ],
      ID: this.ID ? parseInt(this.ID) : 0,
      TXN_Date: "",
      ECR_No: "",
      PAY_NO: rowData?.PAY_NO || rowData?.PAY_Type || "",
      PAY_Type: this.PAY_Type || ""
    };


    this.tls2a010Service.queryDetailTLS2A010(queryParams).subscribe({
      next: (response) => {
        if (response.Status === '0000') {
          this.data = (response.Data.mainData ?? []).map((item: any) => ({
            ...item,
            TXN_Date: this.formatDate(item.TXN_Date),
            check_status: item.check_status ?? '1'
          }));

          this.footerData = (response.Data.totalData ?? []).map((f: any) => ({
            ...f,
            group_name: f.group_name || '總計',
          }));

          this.totalRecords = response.TotalCount || this.data.length;
          console.log('載入完整資料:', this.data.length, '筆，總計:', this.totalRecords);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('載入資料失敗:', error);
        this.loading = false;
      }
    });
  }

  /** 格式化日期字串 → 回傳 Date 物件 */
  private formatDate(dateStr: any): Date | null {
    if (!dateStr) return null;

    // 如果已經是 Date 物件，直接回傳
    if (dateStr instanceof Date) {
      return dateStr;
    }

    // 轉成字串處理
    const str = String(dateStr);

    // 後端回傳 "08/01/2025 00:00:00" → MM/dd/yyyy
    if (str.includes('/')) {
      const [mm, dd, yyyy] = str.split(' ')[0].split('/');
      return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    }

    // 其他情況 (例如 ISO 2025-08-20T03:26:30.911Z)
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }


  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const payload = {
        PAY_Type: this.PAY_Type,
        ID: this.ID,
        selectList: this.data.map(item => ({
          id: item.id,
          TXN_Date: item.TXN_Date, //  轉成 YYYY/MM/DD
          ECR_No: item.ECR_No ?? '',
          TXN_No: item.TXN_No ?? 0,
          PAY_NO: item.PAY_NO ?? '',
          TXN_Item: item.TXN_Item ?? 0,
          CRD_No: item.CRD_No ?? '',
          CPN_No: item.CPN_No ?? '',
          TXN_PayDesc: item.TXN_PayDesc ?? '',
          TXN_PayAmt: item.TXN_PayAmt ?? 0,
          check_status: item.check_status ?? '1',
          check_remark: item.check_remark ?? ''
        }))
      };

      console.log('送出新增 payload:', payload);

      this.loading = true;

      this.tls2a010Service.insertTLS2A010(payload).subscribe({
        next: () => {
          this.messageService.successBubble('新增成功');
          this.loading = false;
          this.onCancel();
        },
      });
    });
  }

  onFieldChange(event: any) {
    console.log('欄位變更:', event);
  }
}
