import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FloorService } from '../../../service/basic/floor.service';
import { MachinedisplayService } from '../../../service/basic/machinedisplay.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownModule } from 'primeng/dropdown';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { Tls22010Service } from '../../../service/api/tls/tls22010.service';
import { createPaginationConfig, Column, formatAmount } from 'src/app/shared/componentkit/table/table.model';
import { ButtonModule } from 'primeng/button';
import { yesterday } from '@shared/models/system/query-form.model';
import { NgIf } from '@angular/common';
import { CustomFooterTableComponent } from '@shared/componentkit/custom-footer-table/customFooterTable.component';
import { finalize } from 'rxjs';



@Component({
  templateUrl: './tls22010.component.html',
  styleUrls: ['./tls22010.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    MultiSelectComponent,
    DropdownModule,
    RadiobuttonComponent,
    ButtonComponent,
    TranslateModule,
    ButtonModule,
    NgIf,
    CustomFooterTableComponent
  ],
})
export class TLS22010Component extends BasicQueryPageComponent<any> implements OnInit {
  first = 0;
  queryForm = this.formBuilder.group({
    TXN_DATE: [yesterday, { validators: [Validators.required], updateOn: 'change' }],
    floor_noList: [[]],
    ECR_NoList: [[]],
    ShowStatus: ['1'],
    status1: [''],
    status2: [''],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });

  selectedItems: any[] = [];
  totalRecords = 0;
  data: any[] = [];
  statusSummary = {
    LDataButZZero: 0,
    ZNotMatchL: 0,
    NoTxnMachine: 0
  };
  TXN_Date = '';
  // ------ 欄位定義 ------
  columns7: Column[] = [
    { header: '總計', field: 'group_name', hidden: true },
    { field: 'ECR_No_Display', header: '收銀機號', visible: true, type: 'html' },
    { field: 'AREA_NO', header: '區域', visible: true },
    { field: 'FLOOR_NO', header: '樓層', visible: true },
    { field: 'TXN_TotSaleAmt', header: '銷售金額 (A)', visible: true, format: formatAmount, isTotal: true },
    { field: 'sad_preorder_Amt', header: '預購金額', visible: true, format: formatAmount, isTotal: true },
    { field: 'sad_settle_Amt', header: '預購結帳 (C2)', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_TotSaleAmt_Sum', header: '銷售小計(D) = (A)', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_TotExtraAmt', header: '代收/付金額 (L)', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_TotHaveTax', header: '已開發票金額 (E)', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_TotOver', header: '已開找零 (K)', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_ChangeHaveTax', header: '已開溢付 (I)', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_TotGUI', header: '發票總金額 (F)', visible: true, format: formatAmount, isTotal: true },
    { field: 'GUI_NET', header: '發票未稅金額 (M)', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_TotTax', header: '發票稅額 (N)', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_TotGUISaleNoTax', header: '發票免稅金額 (O)', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_TotOver_Sum', header: '溢收 (G)', visible: true, format: formatAmount, isTotal: true },
    { field: 'GUI_REFUND', header: '折讓 (J)', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_TotPayAmt', header: '付款金額(H)=(D)+(G)-(C2)-(K)', visible: true, format: formatAmount, isTotal: true },
    { field: 'SLE_SaleAmt', header: 'Z 報表總金額', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_Mode_P', header: '後台(作廢/補登)', visible: true, isTotal: true },
    { field: 'Status_Code', header: '狀態', visible: true },
  ];

  statusOptions = [
    { label: '全部', value: 'all' },
    { label: '正常', value: 'normal' },
    { label: '異常', value: 'abnormal' },
  ];

  exportExcelLoading = false;
  floorOptions: any[] = [];
  machinedisplayOptions: any[] = [];
  ECRNoOptions: any[] = [];
  footerData: any[] = [];
  private skipAutoQueryOnce = false;

  constructor(
    private floorService: FloorService,
    private machineDisplayService: MachinedisplayService,
    private ECRNoService: ECRNoService,
    private tls22010Service: Tls22010Service,
  ) {
    super();
  }

  // --------- 生命週期 ----------
  ngOnInit(): void {
    this.initializePage('TLS22010', '/TLS/TLS22010cru', this.queryForm);
    // 下拉選項
    this.floorService.getFloors().subscribe((data) => (this.floorOptions = data));
    this.machineDisplayService.getMachinedisplay().subscribe((data) => (this.machinedisplayOptions = data));
    this.ECRNoService.getECRNo().subscribe((data) => (this.ECRNoOptions = data));
    const state = this.router.lastSuccessfulNavigation?.extras.state;
    const isFromRelatedRoute = state?.['fromRoute']?.includes(this.ProgNo.toLowerCase());
    if (isFromRelatedRoute) {
      this.skipAutoQueryOnce = true;
      // // 還原查詢條件（含分頁、機號等）
      // const savedForm = this.queryStateService.getQueryStateValue(this.ProgNo);
      // if (savedForm) {
      //   this.queryForm.patchValue(savedForm);
      //   // 還原分頁資訊
      //   if (savedForm.pageIndex) this.queryForm.get('pageIndex')?.setValue(savedForm.pageIndex);
      //   if (savedForm.pageSize) this.queryForm.get('pageSize')?.setValue(savedForm.pageSize);
      // }
      // 還原資料
      const res = this.queryStateService.getQueryStateValue(this.ProgNo + '_data') ?? [];
      if (res.length > 0) {
        this.processResponseData(res);
      }
    }
  }

  /** 避免時區影響：以本地時間組 YYYY-MM-DD */
  private toYMD(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // --------- 事件 ----------
  onSubmit(frm: FormGroup) {
    if (this.skipAutoQueryOnce) {
      this.skipAutoQueryOnce = false;
      return;
    }
    this.handleSubmit(frm, () => {
      this.tls22010Service.queryTLS22010(frm.value).pipe(finalize(() => this.loading = false)).subscribe({
        next: (res) => {
          this.processResponseData(res);
          // 保留「表單值」到查詢狀態（initializePage 才能正確還原 Date 型別）
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
          this.queryStateService.setQueryState(this.ProgNo + '_data', res);
        },
      });
    });
  }


  // 處理response data資料
  private processResponseData(res: any) {
    if (res?.Data?.queryTLS22010_DataList?.length > 0 && res.Data.queryTLS22010_DataList[0].TXN_DATE) {
      this.TXN_Date = res.Data.queryTLS22010_DataList[0].TXN_DATE;
    } else {
      this.TXN_Date = '';
    }
    this.data = res.Data.queryTLS22010_DataList.map((item: any) => {
      let iconHtml = '';
      switch (item.Status_Code) {
        case '#':
          iconHtml = '<span class="text-red-500 mr-1">#</span>';
          break;
        case '@':
          iconHtml = '<span class="text-red-500 mr-1">@</span>';
          break;
        case '!':
          iconHtml = '<span class="text-red-500 mr-1">!</span>';
          break;
      }
      return {
        ...item,
        ECR_No_Display: `${iconHtml}${item.ECR_No}`
      };
    });
    this.footerData = [{ group_name: '總計', ...res.Data.queryTLS22010_Sum }];
    this.totalRecords = res?.TotalCount ?? this.data.length;
  }
}
