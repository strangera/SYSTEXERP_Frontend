import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { UserInfo } from '../../../shared/models/system/userInfo';
import { Tls22010Service } from '../../../service/api/tls/tls22010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { ValidationService } from '../../../shared/service/validation.service';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
export interface ITxnData {
  TXN_DATE: string,
  ECR_No: string,
  building_no: string,
  AREA_NO: string,
  FLOOR_NO: string,
  TXN_TotSaleAmt: number,
  sad_preorder_Amt: number,
  sad_settle_Amt: number,
  TXN_TotSaleAmt_Sum: number,
  TXN_TotExtraAmt: number,
  TXN_TotHaveTax: number,
  TXN_ChangeHaveTax: number,
  TXN_TotOver: number,
  TXN_TotGUI: number,
  GUI_NET: number,
  TXN_TotTax: number,
  TXN_TotGUISaleNoTax: number,
  TXN_TotOver_Sum: number,
  GUI_REFUND: number,
  TXN_TotPayAmt: number,
  SLE_SaleAmt: number,
  TXN_Mode_P: number,
  Status_Code: string
}

@Component({
  selector: 'app-tls22010-cru',
  templateUrl: './tls22010-cru.component.html',
  styleUrls: ['./tls22010-cru.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    TableComponent,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
    AccordionModule,
    ButtonComponent,

  ]
})
export class TLS22010CRUComponent extends BasicCruPageComponent<ITxnData> implements OnInit {
  formatNumber(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    if (Number.isNaN(num)) return String(value); // 不是數字就原樣回傳
    // 不固定小數位，僅做千分位；小數若有就保留
    return num.toLocaleString('en-US', { maximumFractionDigits: 20 });
  }

  queryForm = this.formBuilder.group({
    TXN_Date: ['', Validators.required],
    ECR_No: [''],
    FLOOR_NO: [null as string | null]
  });

  data: ITxnData[] = [];
  totalRecords = 0;
  selectedItems: ITxnData[] = [];
  columnscru: Column[] = [
    { field: 'TXN_No', header: '交易序號' },
    { field: 'TXN_GUIBegNo', header: '起始發票號' },
    { field: 'TXN_GUIEndNo', header: '結束發票號' },
    { field: 'TXN_TotSaleAmt', header: '銷售金額 (A)', format: (v) => this.formatNumber(v) },
    { field: 'sad_preorder_Amt', header: '預購金額', format: (v) => this.formatNumber(v) },
    { field: 'sad_settle_Amt', header: '預購結帳 (C2)', format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotSaleAmt_Sum', header: '銷售小計(D) = (A)', format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotExtraAmt', header: '代收/付金額 (L)', format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotHaveTax', header: '已開發票金額 (E)', format: (v) => this.formatNumber(v) },
    { field: 'TXN_ChangeHaveTax', header: '已開溢付 (K)', format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotOver', header: '已匯送付 (I)', format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotGUI', header: '發票總金額 (F)', format: (v) => this.formatNumber(v) },
    { field: 'GUI_NET', header: '發票未稅金額 (M)', format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotTax', header: '發票稅額 (N)', format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotGUISaleNoTax', header: '發票免稅金額 (O)', format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotOver_Sum', header: '溢收 (G)', format: (v) => this.formatNumber(v) },
    { field: 'GUI_REFUND', header: '折讓 (J)', format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotPayAmt', header: '付款金額(H)', format: (v) => this.formatNumber(v) }
  ];
  userInfo: UserInfo | null = null;
  userSubscription: Subscription | null = null;

  constructor(
    private validationService: ValidationService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private apiService: Tls22010Service,
    private route: ActivatedRoute

  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS22010', this.queryForm);
    this.queryForm.get('ECR_No')?.disable();
    this.userSubscription = this.authService.user.subscribe((userInfo: UserInfo | null) => {
      this.userInfo = userInfo;
      console.log(this.userInfo);
    });

    const TXN_Date = this.rowdata?.TXN_DATE;
    const ECR_No = this.rowdata?.ECR_No;
    const FLOOR_NO = this.rowdata?.FLOOR_NO;


    // if (!TXN_Date || !ECR_No || !FLOOR_NO) return;

    // （可選）把參數帶回表單
    this.queryForm.patchValue({
      TXN_Date,
      ECR_No,
      FLOOR_NO
    });

    const body = {
      TXN_Date: TXN_Date?.replace(/-/g, ''), // 後端若吃 yyyyMMdd
      ECR_No,
      FLOOR_NO

    };

    console.log('呼叫 body:', body);

    this.loading = true;
    this.apiService.queryTLS22010_Detail(body).subscribe({
      next: (res) => {
        console.log('回傳:', res);
        this.data = res?.Data ?? [];
        this.totalRecords = res?.TotalCount ?? this.data.length;
        this.loading = false;


        const viewOnly = true; // Set to true or false based on your requirements
        if (viewOnly) this.queryForm.disable(); // 查看模式鎖表單
      },
      error: (err) => {
        console.error('失敗:', err);
        this.loading = false;
      }
    });
  }




  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue(); // 會把 disabled 的 ECR_No 一起拿到
      const toYmd = (v: any) => {
        if (!v) return null;
        if (v instanceof Date) {
          const y = v.getFullYear();
          const m = String(v.getMonth() + 1).padStart(2, '0');
          const d = String(v.getDate()).padStart(2, '0');
          return `${y}${m}${d}`;
        }
        return v; // 已經是字串就直接帶過去
      };

      const body = {
        request: {
          TXN_Date: toYmd(raw.TXN_Date),
          ECR_No: raw.ECR_No || null,
          floor_noList: Array.isArray(raw.floor_noList) ? raw.floor_noList : []
        }
      };

      this.loading = true;
      this.apiService.queryTLS22010(body).subscribe({
        next: (res) => {
          this.data = res?.Data ?? [];
          this.totalRecords = res?.TotalCount ?? this.data.length;
          this.loading = false;
          this.selectedItems = [];
        },
        error: (err) => {
          console.error('TLS22010 查詢失敗', err);
          this.loading = false;
        }
      });
    });
  }


}
