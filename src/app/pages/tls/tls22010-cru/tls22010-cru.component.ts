import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { UserInfo } from '../../../shared/models/system/userInfo';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Tls22010Service } from '../../../service/api/tls/tls22010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
// import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { ValidationService } from '../../../shared/service/validation.service';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
// import { AuthService } from '../../../service/system/auth.service';

@Component({
  selector: 'app-tls22010-cru',
  templateUrl: './tls22010-cru.component.html',
  styleUrls: ['./tls22010-cru.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    // ButtonComponent,
    TableComponent,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
    AccordionModule
  ]
})
export class TLS22010CRUComponent extends BasicCruPageComponent<any> implements OnInit, OnDestroy {

  queryForm: FormGroup;
  data: any[] = [];
  totalRecords = 0;
  // loading = false;
  columns7: Column[] = [
    { field: 'TXN_No', header: '交易序號' },
    { field: 'TXN_GUIBegNo', header: '起始發票號' },
    { field: 'TXN_GUIEndNo', header: '結束發票號' },
    { field: 'TXN_TotSaleAmt', header: '銷售金額 (A)' },
    { field: 'sad_preorder_Amt', header: '預購金額' },
    { field: 'sad_settle_Amt', header: '預購結帳 (C2)' },
    { field: 'TXN_TotSaleAmt_Sum', header: '銷售小計(D) = (A)' },
    { field: 'TXN_TotExtraAmt', header: '代收/付金額 (L)' },
    { field: 'TXN_TotHaveTax', header: '已開發票金額 (E)' },
    { field: 'TXN_ChangeHaveTax', header: '已開溢付 (K)' },
    { field: 'TXN_TotOver', header: '已匯送付 (I)' },
    { field: 'TXN_TotGUI', header: '發票總金額 (F)' },
    { field: 'GUI_NET', header: '發票未稅金額 (M)' },
    { field: 'TXN_TotTax', header: '發票稅額 (N)' },
    { field: 'TXN_TotGUISaleNoTax', header: '發票免稅金額 (O)' },
    { field: 'TXN_TotOver_Sum', header: '溢收 (G)' },
    { field: 'GUI_REFUND', header: '折讓 (J)' },
    { field: 'TXN_TotPayAmt', header: '付款金額(H)' }
  ];
  userInfo: UserInfo | null = null;
  userSubscription: Subscription | null = null;

  constructor(
    private validationService: ValidationService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private tls22010Service: Tls22010Service,
    // private authService: AuthService

  ) {
    super();

    this.queryForm = this.fb.group({
      TXN_Date: [null],
      floor_noList: [[]],
      ECR_No: [''],

    });
  }

  ngOnInit(): void {
    // this.initializePage('TLS22010', this.queryForm);
    this.queryForm.get('ECR_No')?.disable();
    this.userSubscription = this.authService.user.subscribe((userInfo: UserInfo | null) => {
      this.userInfo = userInfo;
      console.log(this.userInfo);
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  onSubmit(): void {
    // this.handleSubmit(() => {
    //   const formValue = this.queryForm.getRawValue();
    //   const params = {
    //      ...formValue,
    //    ECR_No: this.userInfo?.ECR_No
    //   };

    //   this.loading = true;
    //   this.apiService.queryTLS22010(params).subscribe({
    //     next: (res) => {
    //       this.data = res.Data ?? [];
    //       this.totalRecords = res.TotalCount ?? 0;
    //       this.loading = false;
    //       this.queryStateService.setQueryState(this.ProgNo, params);
    //     },
    //     error: (err) => {
    //       console.error('查詢失敗', err);
    //       this.loading = false;
    //     }
    //   });
    // });
  }

}


