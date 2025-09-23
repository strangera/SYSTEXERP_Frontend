import { Component, OnInit, computed } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN71020Service } from '@service/api/fin/fin71020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '@shared/componentkit/editor-text/editor-text.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { Column } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-fin71020',
  templateUrl: './fin71020.component.html',
  styleUrl: './fin71020.component.scss',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    EditorTextComponent,
    InputNumberRangeComponent,
    MenubarComponent,
  ]
})
export class FIN71020Component extends BasicQueryPageComponent<unknown> implements OnInit {

  public readonly queryForm = this.formBuilder.group({

  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly filteredData = computed(() => {
    {
      return this.service.FIN71020Data();
    }
  });

  public readonly totalRecords = computed(() => this.filteredData().length);

  public readonly columns: Column[] = [

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


  vendorOptions: any[] = [];

  constructor(
    public readonly service: FIN71020Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN71020', '/FIN/FIN71020CRU', this.queryForm, this.onSubmit.bind(this));
    const store = this.queryStateService.getQueryState(this.ProgNo);
    if (store?.value) this.queryForm.setValue(store.value);



    // this.ProgNo = '170002';
    // // Initialize dropdown options
    // this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // this.IfdisplayService.getOptions().subscribe(
    //   (data) => (this.displayOptions = data)
    // );
    // this.IfdisplayService.getOptions().subscribe(
    //   (data) => (this.displayOptions2 = data)
    // );
    // this.vendorService.getVendors().subscribe((data) => {
    //   this.vendorOptions = data;
    // });
    // this.userCodeService
    //   .getUserCode()
    //   .subscribe((data) => (this.usercode = data));
  }

  onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {

      this.service.loadFIN71020({
        ...this.queryForm.getRawValue(),
      }).pipe(
        finalize(() => this.loading = !1),
      ).subscribe();

      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
    });


    // console.log(frm.value);
    // this.submitted = true;
    // this.loading = true;
    // this.notificationService.blockUi();

    // if (frm.valid && this.canQuery()) {
    //   // Submit logic here
    // }

    // this.loading = false;
    // this.notificationService.unblockUi();
  }
}
