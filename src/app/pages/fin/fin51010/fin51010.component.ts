import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { createPaginationConfig } from '@others/component/table/table.model';
import { Fin51010Service, QueryFIN51010CountResponse, QueryFIN51010Request, QueryFIN51010Response } from '@service/api/fin/fin51010.service';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { toLocalDateTimeString } from '@shared/utils/object-utils';
import { Accordion, AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { finalize } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

export interface SystemGroup {
  key: string;
  name: string;
  icon: string;
  items: QueryFIN51010CountResponse[];
  totalCnt: number;
}

@Component({
  selector: 'app-fin51010',
  templateUrl: './fin51010.component.html',
  standalone: true,
  imports: [
    ButtonModule,
    NgClass,
    NgIf,
    DataViewModule,
    NgFor,
    AsyncPipe,
    TableReportComponent,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarRangeComponent,
    InputTextComponent,
    ButtonComponent,
    TranslateModule
  ]
})
export class FIN51010Component extends BasicQueryPageComponent<QueryFIN51010Response> implements OnInit {
  @ViewChild('queryAccordion') queryAccordion!: Accordion;

  queryForm = this.formBuilder.group({
    SrcSheetType: [null as string | null, [Validators.required]],
    VouDate_From: [null],
    VouDate_To: [null],
    Trans_Status: [null as string | null],
    PostFlag: [null as string | null],
    VouNo: [null, [Validators.maxLength(12)]],
    Remark: [null, [Validators.maxLength(200)]],
    AccNo: [null, [Validators.maxLength(14)]],
    DetailNo: [null, [Validators.maxLength(20)]],
    NoteDesc: [null, [Validators.maxLength(160)]],
    SubDetailNo: [null, [Validators.maxLength(30)]],
    ...createPaginationConfig([{ field: 'VouDate', order: 1 }]),
  });

  // 下拉選單 Options
  SrcSheetTypeOptions = this.dropDown.queryGls1010();
  TransStatusOptions = getSYS1000Options('Trans_Status');
  PostFlagOptions = getSYS1000Options('PostFlag').filter(({ value }) => value !== '2');
  AccNoOptions = this.dropDown.queryGls1005_ledgerMD();
  DetailNoOptions = this.dropDown.queryPos2013({ VEN_Flag: '' });
  SubDetailNoOptions = this.dropDown.queryGLS1016();

  data: QueryFIN51010Response[] = [];
  selectedItems: QueryFIN51010Response[] = [];
  totalRecords = 0;
  lastQuery: QueryFIN51010Request | null = null;
  btnLoading = false;

  columns: ReportColumn[] = [
    { field: 'SrcSheetType', header: '傳票型態', align: 'left', width: '80px' },
    { field: 'Voucher_Name', header: '傳票名稱', align: 'left', width: '80px' },
    { field: 'VouDate', header: '傳票日期', format: formatDate, align: 'left', width: '80px' },
    { field: 'Remark', header: '傳票摘要', align: 'left' },
    { field: 'Debit_Amt', header: '借方金額', format: formatAmount, align: 'right' },
    { field: 'Credit_Amt', header: '貸方金額', format: formatAmount, align: 'right' },
    { field: 'PostFlag', header: '傳票狀態', format: (value: string) => getSYS1000('PostFlag', value), align: 'left', width: '80px' },
    { field: 'Trans_Status', header: '拋轉狀態', format: (value: string) => getSYS1000('Trans_Status', value), align: 'left', width: '80px' },
    { field: 'TransVouNo', header: '傳票編號', align: 'center', width: '80px' },
  ];

  countData: QueryFIN51010CountResponse[] = [];
  groupedCountData: SystemGroup[] = [];

  /** 計算所有未拋轉總筆數 */
  get totalUnTransferredCount(): number {
    return this.countData.reduce((sum, item) => sum + (item.CNT || 0), 0);
  }

  constructor(
    public readonly fin51010Service: Fin51010Service,
    private readonly dropDown: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN51010', 'fin/fin51010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadSheetTypeCount();
  }

  /** 載入憑證種類與儀表板 */
  loadSheetTypeCount() {
    this.fin51010Service.queryFIN51010Count('1').pipe(untilDestroyed(this)).subscribe(res => {
      if (res.Data) {
        this.countData = res.Data;
        this.processGroupedCountData(res.Data);
      }
    });
  }

  /** 將統計數據依系統別規則進行分組與排序 */
  private processGroupedCountData(data: QueryFIN51010CountResponse[]) {
    const groupsConfig = [
      {
        key: 'HR',
        name: '人資系統',
        icon: 'pi pi-users',
        match: (type: string) => type.startsWith('H')
      },
      {
        key: 'COUNTER',
        name: '專櫃系統',
        icon: 'pi pi-shopping-bag',
        match: (type: string) => ['SD', 'MR', 'MD', 'PR', 'PN', 'PT'].includes(type)
      },
      {
        key: 'SELF',
        name: '自營系統',
        icon: 'pi pi-store',
        match: (type: string) => type.startsWith('W')
      },
      {
        key: 'EC',
        name: '電子商務系統',
        icon: 'pi pi-shopping-cart',
        match: (type: string) => type.startsWith('E')
      },
      {
        key: 'TICKET',
        name: '禮券系統',
        icon: 'pi pi-ticket',
        match: (type: string) => type === 'GF'
      },
      {
        key: 'MATERIAL',
        name: '資材系統',
        icon: 'pi pi-box',
        match: (type: string) => ['PC', 'PD', 'PM', 'PS', 'PU'].includes(type)
      },
    ];

    const groupMap = new Map<string, QueryFIN51010CountResponse[]>();
    groupsConfig.forEach(g => groupMap.set(g.key, []));
    const otherItems: QueryFIN51010CountResponse[] = [];

    data.forEach(item => {
      const type = (item.SrcSheetType || '').toUpperCase();
      let matched = false;

      for (const config of groupsConfig) {
        if (config.match(type)) {
          groupMap.get(config.key)!.push(item);
          matched = true;
          break;
        }
      }

      if (!matched) {
        otherItems.push(item);
      }
    });

    const result: SystemGroup[] = groupsConfig
      .map(config => {
        const items = groupMap.get(config.key) || [];
        return {
          key: config.key,
          name: config.name,
          icon: config.icon,
          items,
          totalCnt: items.reduce((sum, i) => sum + (i.CNT || 0), 0)
        };
      })
      .filter(g => g.items.length > 0);

    if (otherItems.length > 0) {
      result.push({
        key: 'OTHER',
        name: '其他系統',
        icon: 'pi pi-th-large',
        items: otherItems,
        totalCnt: otherItems.reduce((sum, i) => sum + (i.CNT || 0), 0)
      });
    }

    this.groupedCountData = result;
  }

  /** 儀表板點擊事件：帶入種類並自動查詢 */
  onSelectType(item: QueryFIN51010CountResponse) {
    this.queryForm.patchValue({
      SrcSheetType: item.SrcSheetType,
      Trans_Status: '0',
      PostFlag: '1',
      VouNo: null,
      NoteDesc: null
    });

    if (this.queryAccordion) {
      this.queryAccordion.tabs[0].selected = false;
    }
    this.onSubmit(this.queryForm);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body: QueryFIN51010Request = {
        ...frm.value,
        VouDate_From: toLocalDateTimeString(frm.value.VouDate_From),
        VouDate_To: toLocalDateTimeString(frm.value.VouDate_To, true)
      };
      this.fin51010Service.queryFIN51010(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.lastQuery = body;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  /** 執行拋轉作業 */
  onTransfer() {
    if (this.selectedItems.length === 0) return;

    const imbalanced = this.selectedItems.filter(item => item.Debit_Amt !== item.Credit_Amt);
    if (imbalanced.length > 0) {
      const details = imbalanced.map(item => `${formatDate(item.VouDate)}／${item.SrcSheetType}／${item.Remark}`).join('<br>');
      setTimeout(() => {
        this.messageService.confirm({
          header: '借貸不平衡，無法拋轉',
          message: `下列 ${imbalanced.length} 筆傳票借貸不平衡，請修正後再拋轉：<br><br>${details}`,
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: '確定',
          showRejectButton: false
        });
      }, 0);
      return;
    }

    this.messageService.confirm({
      header: '拋轉確認',
      message: '是否拋轉所選項目?',
      accept: () => {
        const idList = this.selectedItems.map(item => item.id).join(',');
        const body = { GLS6001_IDList: idList };
        this.btnLoading = true;
        this.fin51010Service.transferFIN51010(body).pipe(
          finalize(() => {
            this.btnLoading = false;
          }),
          untilDestroyed(this)
        ).subscribe(res => {
          const msg = res.Data.ErrMsg || '';
          const isSuccess = res.Data.ErrCode === 0 && msg.includes('傳票編號');
          if (isSuccess) {
            const formattedMsg = msg.replaceAll('\n', '<br>');
            setTimeout(() => {
              this.messageService.confirm({
                header: '拋轉成功',
                message: formattedMsg,
                icon: 'pi pi-check-circle',
                acceptLabel: '確定',
                showRejectButton: false,
                accept: () => {
                  this.selectedItems = [];
                  this.onSubmit(this.queryForm);
                  this.loadSheetTypeCount();
                }
              });
            }, 200);
          } else {
            setTimeout(() => {
              this.messageService.confirm({
                header: '拋轉失敗',
                message: res.Data.ErrCode === 0 ? '拋轉異常：未產生傳票編號。' : msg,
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: '關閉',
                showRejectButton: false
              });
            }, 200);
          }
        });
      }
    });
  }

  onVoid() {
    if (this.selectedItems.length === 0) return;
    this.messageService.confirm({
      header: '作廢確認',
      message: '是否作廢所選項目?',
      accept: () => {
        const idList = this.selectedItems.map(item => item.id).join(',');
        const body = { GLS6001_IDList: idList };
        this.btnLoading = true;
        this.fin51010Service.voidFIN51010(body).pipe(
          finalize(() => {
            this.btnLoading = false;
          }),
          untilDestroyed(this)
        ).subscribe(res => {
          setTimeout(() => {
            this.messageService.confirm({
              header: '作廢成功',
              message: res.Data.ErrMsg || '資料已成功作廢！',
              icon: 'pi pi-check-circle',
              acceptLabel: '確定',
              showRejectButton: false,
              accept: () => {
                this.selectedItems = [];
                this.onSubmit(this.queryForm);
                this.loadSheetTypeCount();
              }
            });
          }, 200);
        });
      }
    });
  }

  /** 判斷是否「拋轉傳票」按鈕應禁用 */
  get isTransferDisabled(): boolean {
    if (this.data.length === 0 || this.selectedItems.length === 0) {
      return true;
    }
    return this.selectedItems.some(item => item.Trans_Status === '1');
  }

  /** 判斷是否「作廢」按鈕應禁用 */
  get isVoidDisabled(): boolean {
    if (this.data.length === 0 || this.selectedItems.length === 0) {
      return true;
    }
    return this.selectedItems.some(item => item.PostFlag === '0');
  }

  /** 判斷單筆資料是否禁用編輯（用於表格內的操作列） */
  isEditDisabled = (rowData: QueryFIN51010Response): boolean => {
    return rowData?.Trans_Status === '1';
  };

  /** 讀取HR傳票資料 */
  hrLoading = false;
  onReadHR() {
    this.hrLoading = true;
    this.fin51010Service.importHRVouFIN51010().pipe(
      finalize(() => this.hrLoading = false),
      untilDestroyed(this)
    ).subscribe((res) => {
      if (res.Data?.ErrCode === 0) {
        this.messageService.successBubble(res.Data.ErrMsg);
        this.loadSheetTypeCount();
        this.queryForm.patchValue({
          SrcSheetType: 'HR',
        });
        this.onSubmit(this.queryForm);
      } else {
        this.messageService.errorBubble(res.Data?.ErrMsg);
      }
    });
  }
}