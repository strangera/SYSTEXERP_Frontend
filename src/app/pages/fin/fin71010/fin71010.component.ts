import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN71010Service } from '@service/api/fin/fin71010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { map, tap } from 'rxjs';
import { finalize } from 'rxjs/internal/operators/finalize';

@Component({
  selector: 'app-fin71010',
  templateUrl: './fin71010.component.html',
  styleUrl: './fin71010.component.scss',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownTableComponent,
    InputNumberComponent,
    MenubarComponent,
    TableComponent,
  ],
})
export class FIN71010Component extends BasicQueryPageComponent<unknown> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    PayableExpense: new FormControl<number | void>(void 0),
    InputTaxCommon: new FormControl<number | void>(void 0),
    InputTaxFixedAsset: new FormControl<number | void>(void 0),
    ...createPaginationConfig([{ field: 'id', order: 1 }]),
  });
  public readonly qf = computed(() => this.queryForm.controls);


  public readonly tableData = signal<Record<string, any>[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(!1);

  public readonly loadingEffect = effect(() => {
    this.loading = this.tableLoading();
  });

  public opForm = this.formBuilder.group({
    accNo: new FormControl<string | void>(void 0),
    accName: new FormControl<string | void>(void 0),
    ...createPaginationConfig([{ field: 'id', order: 1 }]),
  });
  public opData = signal<unknown[]>([]);
  public opTotalRecords = computed(() => this.opData.length);
  public opLoading = !1;
  public opColumns: Column[] = [
    { field: '', header: '' },
  ];

  public fieldsConfig: FieldsConfig[] = [

  ];

  public readonly columns: Column[] = [
    { field: '', header: '' },
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
  // data: any[] = [
  //   { code: '216104', name: '應付費用-現金' },
  //   { code: '123203', name: '進項稅額-固定資產及費用' },
  //   { code: '110101', name: '庫存現金-營收及正負差' },
  //   { code: '110102', name: '庫存現金-其他收入' },
  //   { code: '110103', name: '庫存現金-財務部' },
  //   { code: '110111', name: '庫存現金-外幣' },
  //   { code: '110112', name: '庫存現金-人民幣' },
  //   { code: '110199', name: '庫存現金-其他' },
  //   { code: '110200', name: '零用金-樂經理室' },
  //   { code: '110201', name: '零用金-採購組' },
  //   { code: '110210', name: '零用金-技術服務部' },
  //   { code: '110220', name: '零用金-財務部' },
  // ];

  vendorOptions: any[] = [];

  constructor(
    public readonly service: FIN71010Service,
    private readonly logger: NGXLogger,
  ) {
    super();

    this.authService.getUserInfo() && (this.user = this.authService.getUserInfo());
  }

  public ngOnInit(): void {
    this.initializePage('FIN71010', 'FIN/FIN71010CRU', this.queryForm, this.onSubmit.bind(this));
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const payload = {
        ...this.queryForm.getRawValue(),
      };

      this.tableLoading.set(!0);
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      this.service.loadFIN71010(payload).pipe(
        tap(res => this.logger.debug(`onSubmit:`, [payload, res])),
        map(res => { if (res.Status === '0000') return res; throw new Error('查詢失敗'); }),
        finalize(() => this.tableLoading.set(!1)),
      ).subscribe({
        next: res => {
          this.tableData.set(res.Data || []);
          this.totalRecords.set(res.TotalCount || 0);
        },
        error: err => this.messageService.errorBubble(err.message || '查詢失敗'),
      });
    });
  }

  public onAutoCompleteInputChange(event: Record<string, any>): void {
    this.logger.debug(`onAutoCompleteInputChange:`, [event]);
  }

  public onformValueChanged(event: any): void {
    this.logger.debug(`onformValueChanged:`, [event]);
  }
}
