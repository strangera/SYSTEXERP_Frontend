import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN71020Service } from '@service/api/fin/fin71020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { FIN71020Data } from './fin71020.model';

@Component({
  selector: 'app-fin71020',
  templateUrl: './fin71020.component.html',
  styleUrl: './fin71020.component.scss',
  standalone: !0,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputNumberRangeComponent,
    InputTextareaComponent,
    MenubarComponent,
    TableComponent,
  ]
})
export class FIN71020Component extends BasicQueryPageComponent<FIN71020Data> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    usrNo: this.formBuilder.control<string | void>(void 0),
    SKeepQuotaAmt: this.formBuilder.control<number | void>(void 0),
    EKeepQuotaAmt: this.formBuilder.control<number | void>(void 0),
    remark: this.formBuilder.control<string | void>(void 0),
    orgId: this.formBuilder.control<string | void>(void 0),
    ...createPaginationConfig([{ field: 'Keep_UsrNo', order: 1 }]),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<FIN71020Data[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(!1);

  public readonly loadingEffect = effect(() => {
    this.loading = this.tableLoading()
      || this.service.usrLoading()
      || this.service.orgLoading();
  });

  public readonly columns: Column[] = [
    { field: 'Keep_UsrNo', header: '保管人代碼' },
    { field: 'Keep_QuotaAmt', header: '零用金額度' },
    { field: 'Keep_Remark', header: '說明' },
  ];

  // Dropdown options
  // usercode: any[] = [];
  // Feespayable: any[] = [
  //   { value: 210101, label: '銀行短期借款' },
  //   { value: 210201, label: '應付商業本票-中華' },
  //   { value: 210202, label: '應付商業本票-合庫' },
  //   { value: 210203, label: '應付商業本票-聯邦' },
  //   { value: 210301, label: '應付商業本票折價' },
  //   { value: 210401, label: '一年或一年營業週期內到期長期負債' },
  //   { value: 2111, label: '應付票據' },
  //   { value: 211101, label: '應付票據-專櫃' },
  //   { value: 211102, label: '應付票據-自營' },
  //   { value: 211103, label: '應付票據-固資及費用' },
  // ];
  // Inputtax: any[] = [
  //   { value: 1, label: '1101_庫存現金' },
  //   { value: 2, label: '110101_庫存現金-營收及正負差' },
  //   { value: 3, label: '110102_庫存現金-其他收入' },
  //   { value: 4, label: '110103_庫存現金-財務部' },
  //   { value: 5, label: '110111_庫存現金-外幣' },
  //   { value: 6, label: '110112_庫存現金-人民幣' },
  //   { value: 7, label: '110199_庫存現金-其他' },
  //   { value: 8, label: '1102_零用金' },
  //   { value: 9, label: '110200_零用金-總經理室' },
  //   { value: 10, label: '110201_零用金-採購組' }
  // ];
  // statusOptions: any[] = [
  //   { value: 1, label: '未異動' },
  //   { value: 2, label: '到期' },
  //   { value: 3, label: '兌現' },
  // ];
  // FNCCodeOptions: any[] = [];
  // AccountcodeOptions: any[] = [];
  // displayOptions: any[] = [];
  // displayOptions2: any[] = [];
  // Billingordernumber: any[] = [
  //   { value: 1, label: 'B20150208001' },
  //   { value: 2, label: 'B20150208002' },
  //   { value: 3, label: 'B20150410001' },
  // ];
  // // Table data
  // data: any[] = [];
  // filteredData: any[] = [...this.data];
  // columns: any[] = [
  //   { field: 'custodianCode', header: '保管人代碼', visible: true },
  //   { field: 'pettyCashAmount', header: '零用金額度', visible: true },
  //   { field: 'description', header: '說明', visible: true }
  // ];
  // vendorOptions: any[] = [];

  constructor(
    public readonly service: FIN71020Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN71020', '/FIN/FIN71020CRU', this.queryForm, this.onSubmit.bind(this));

    this.service.getKeepUsrNo();
    this.service.getKeepOrgId();

    this.logger.debug(`init:`, []);
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const raw = { ...this.queryForm.getRawValue() };
      const payload = Object.fromEntries(Object.entries(raw).filter(([_, v]) =>
        v !== null && v !== undefined && (!(Array.isArray(v)) || v.length > 0)
      ));

      this.tableLoading.set(!0);
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      this.logger.debug(`submit:`, [raw, payload]);
      this.service.loadFIN71020(payload).pipe(
        finalize(() => this.tableLoading.set(!1)),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.tableData.set(res.Data || []);
          this.totalRecords.set(res.TotalCount || 0);
        },
      });
    });
  }
}
