import { AsyncPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11010Service } from '@service/api/ass/ass11010.service';
import { ASS11020Service } from '@service/api/ass/ass11020.service';
import { ASS11030Service } from '@service/api/ass/ass11030.service';
import { Fin11040Service, TDS1008Data } from '@service/api/fin/fin11040.service';
import { Tls51070Service } from '@service/api/tls/tls51070.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatDate } from '../../../shared/componentkit/table/table.model';
import { apiOption } from '../../../shared/models/sys/sysb000.model';
import { Ass15060Service } from './../../../service/api/ass/ass15060.service';
import { RadiobuttonComponent } from './../../../shared/componentkit/radiobutton/radiobutton.component';

// 財產變更記錄查詢

export interface ass15060 {
  ROW_NO: number; // 行號
  ASSET_ID: string; // 財產編號
  B_CLASS_NAME: string; // 大分類名稱
  M_CLASS_NAME: string; // 中分類名稱
  S_CLASS_NAME: string; // 小分類名稱
  ASSET_TYPE: string; // 財產類型
  ORG_ID: string; // 保管單位 ID
  HOLD_ORG_NAME: string; // 保管單位
  EMP_ID: string; // 保管人 ID
  HOLD_EMP_NAME: string; // 保管人
  MV_TYPE_NAME: string; // 變更類型

  UPD_USR_No: string; // 變更人員代碼
  UPD_USR_NAME: string; // 變更人員姓名
  HANDLE_DATE: Date; // 變更時間
}

@Component({
  selector: 'app-ass15060',
  templateUrl: './ass15060.component.html',
  styleUrl: './ass15060.component.scss',
  standalone: true,
  imports: [
    AsyncPipe,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    CalendarRangeQuickComponent,
    FormsModule,
    ReactiveFormsModule,
    RadiobuttonComponent,
    InputTextComponent,
    InputNumberRangeComponent,
    DropdownComponent,
    TableComponent,
    TranslateModule]
})
export class ASS15060Component extends BasicQueryPageComponent<ass15060> implements OnInit {
  // 查詢 (Hugo
  queryForm = this.formBuilder.group({
    MID: [(this.authService.getUserInfo()?.mid?.toString()) ?? '', [Validators.required, Validators.maxLength(1)]], // 商場編號
    STO_NO: [this.authService.getUserInfo()?.SYS_StoreNo ?? null, [Validators.required, Validators.maxLength(10)]], // 分店編號

    QUERY_MODE: [4, [Validators.min(1), Validators.max(4)]], // 查詢模式

    MV_TYPE: ['s', [Validators.maxLength(1)]], // 變更類型
    ASSET_ID: [null, [Validators.maxLength(20)]], // 財產編號
    DEPRE_YN: ['1', [Validators.maxLength(1)]], // 財產類型
    B_CLASS_ID: [null, [Validators.maxLength(1)]], // 大分類編號(先用自營的，之後再換成別支)
    M_CLASS_ID: [null, [Validators.maxLength(2)]], // 中分類編號
    S_CLASS_ID: [null, [Validators.maxLength(2)]], // 小分類編號
    GOODS_ID: [null, [Validators.maxLength(20)]], // 品項編號

    //分頁查詢
    ...createPaginationConfig([{ field: 'ASSET_ID', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  data: ass15060[] = [];
  columns: Column[] = [
    // { field: 'ROW_NO', header: '行號', visible: false },
    { field: 'ASSET_ID', header: '財產編號', visible: true },
    { field: 'B_CLASS_NAME', header: '大分類名稱', visible: true },
    { field: 'M_CLASS_NAME', header: '中分類名稱', visible: true },
    { field: 'S_CLASS_NAME', header: '小分類名稱', visible: true },
    { field: 'ASSET_TYPE', header: '財產類型', visible: true },
    { field: 'ORG_ID', header: '保管單位 ID', visible: true },
    { field: 'HOLD_ORG_NAME', header: '保管單位', visible: true },
    { field: 'EMP_ID', header: '保管人 ID', visible: true },
    { field: 'HOLD_EMP_NAME', header: '保管人', visible: true },
    { field: 'MV_TYPE_NAME', header: '變更類型', visible: true },
    { field: 'UPD_USR_No', header: '變更人員代碼', visible: true },
    { field: 'UPD_USR_NAME', header: '變更人員姓名', visible: true },
    { field: 'HANDLE_DATE', header: '變更時間', visible: true, format: formatDate },
  ];

  selectedItems: ass15060[] = [];// 多選項目

  largeOption: apiOption[] = [];
  middleOption: apiOption[] = [];
  smallOption: apiOption[] = [];
  QUERY_MODE_OPTIONS: { value: number; label: string }[] = [
    { value: 1, label: '移轉' },
    { value: 2, label: '報廢除帳' },
    { value: 3, label: '變異除障' },
    { value: 4, label: '新購' },
  ];
  assetTypeOptions: { value: string; label: string }[] = [
    { value: '1', label: '資產' },
    { value: '2', label: '列管品' },
  ];
  public readonly goodsIdOptions = signal<{ label: string; value: string }[]>([]);
  /** 財產編號下拉選項 */
  readonly assetOptions$ = this.dropdownApi.queryFAASSETChooseList_DropDownList();

  // ----------------------------------------------------------------
  constructor(
    private readonly tls51070Service: Tls51070Service,
    private readonly dropdownApi: DropdownApiService,
    private readonly fin11040Service: Fin11040Service, //品項
    private readonly ass11010Service: ASS11010Service, //大類
    private readonly ass11020Service: ASS11020Service, //中類
    private readonly ass11030Service: ASS11030Service, //小類
    private readonly ass15060Service: Ass15060Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS15060', 'FIN/FIN15060cru', this.queryForm, (form) => this.onSubmit(form));

    this.loadOptions();
    //初始導入所有大分類、中分類、小分類表單 (ass11030)
    this.loadCATOptions();

    // 監聽 大分類 是否為''
    this.queryForm.get('B_CLASS_ID')!.valueChanges.subscribe((newValue) => {
      // console.log('大分類變更為:', newValue);
      if (!newValue) {
        // 讀取整份 大分類、中分類、小分類 dropDown
        this.loadCATOptions();
      } else {
        // 若大分類為空 禁用中分類、小分類
        this.queryForm.get('M_CLASS_ID')?.enable();
        this.queryForm.get('S_CLASS_ID')?.enable();
      }
    });

    //觀察表單 中分類變化
    this.queryForm.get('B_CLASS_ID')?.valueChanges.subscribe((lno) => {
      if (lno) {
        console.log('觀察中分類變化', lno);
        const midPayload = {
          STO_NO: this.authService.getUserInfo()?.SYS_StoreNo ?? '', // 分店編號
          M_CLASS_ID: '',     // 中分類代碼
          M_CLASS_NAME: '',   // 中分類名稱
          B_CLASS_ID: lno,     // 大分類代碼
          B_CLASS_NAME: '',   // 大分類名稱
          NOTES_KEYWORD: ''  // 說明關鍵字
        };
        this.ass11020Service
          .queryASS11020(midPayload)
          .subscribe((res) => {
            this.middleOption = res.Data.map((item: any) => ({
              No: item.M_CLASS_ID,
              Name: item.M_CLASS_NAME,
              Label: item.M_CLASS_ID + '-' + item.M_CLASS_NAME,
            }));
            this.queryForm.get('M_CLASS_ID')?.setValue(null);
            this.queryForm.get('S_CLASS_ID')?.setValue(null);
            this.smallOption = [];
          });
      } else {
        this.middleOption = [];
        this.smallOption = [];
        this.queryForm.get('M_CLASS_ID')?.setValue(null);
        this.queryForm.get('S_CLASS_ID')?.setValue(null);
      }
    });
    //觀察表單 小分類變化
    this.queryForm.get('M_CLASS_ID')?.valueChanges.subscribe((mno) => {
      const lno = this.queryForm.get('B_CLASS_ID')?.value;
      if (lno && mno) {
        //新版api改成list傳送
        const requestPayload = {
          "STO_NO": this.authService.getUserInfo()?.SYS_StoreNo ?? '', // 分店編號
          "S_CLASS_ID": "",
          "S_CLASS_NAME": "",
          "M_CLASS_ID": mno,
          "M_CLASS_NAME": "",
          "B_CLASS_ID": lno,
          "B_CLASS_NAME": "",
          "NOTES_KEYWORD": ""
        };

        this.ass11030Service
          .queryASS11030(requestPayload)
          .subscribe((res) => {
            // 1. 先進行 map 轉換格式 (這邊後端回傳的小分類有重複，先進行去重處理)
            const mappedOptions = res.Data.map((item: any) => ({
              No: item.S_CLASS_ID,
              Name: item.S_CLASS_NAME,
              Label: item.S_CLASS_ID + '-' + item.S_CLASS_NAME,
            }));

            // 2. 使用 filter 避免重複的 No (即 S_CLASS_ID)
            this.smallOption = mappedOptions.filter((item, index, self) =>
              index === self.findIndex((t) => t.No === item.No)
            );

            this.queryForm.get('S_CLASS_ID')?.setValue(null);

            console.log('小分類 (已去重)', this.smallOption);
          });
      } else {
        this.smallOption = [];
        this.queryForm.get('S_CLASS_ID')?.setValue(null);
      }
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('財產變更request:', JSON.stringify(frm.value, null, 2));
      this.loading = false;
      this.ass15060Service.queryASS15060(frm.value).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.data = response.Data.Details || []; // 這邊後端多包了一層 Details
            console.log('Result', this.data);
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
          } else {
            console.error('API error:', response.Status, response.Message);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err: string) => {
          console.error('API error:', err);
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }

  // 列印明細
  btnLoading = false;
  onBtnToss(rowData: ass15060) {
    if (!rowData) {
      this.messageService.errorBubble('找不到該筆資料的 ID');
      return;
    }

    // 根據 API 需求包裝參數，對應您原本程式碼中的 PC_id
    // const formValue = { ID: rowData.id };

    this.btnLoading = true;
    // this.tls12010Service.exportTLS12010(formValue)
    //   .pipe(
    //     finalize(() => this.btnExcelLoading = false),
    //     untilDestroyed(this)
    //   )
    //   .subscribe({
    //     next: (blob: Blob) => {
    //       this.downloadFile(blob, `潛在客戶明細_${rowData.id}_${new Date().getTime()}.xlsx`);
    //       this.messageService.successBubble('匯出 Excel 成功');
    //     },
    //     error: (err) => {
    //       console.error(err);
    //       this.messageService.errorBubble('匯出失敗');
    //     }
    //   });
  }

  //讀取 大分類表單 (該情況禁止 中小下拉選擇)
  loadCATOptions() {
    {
      //查詢 大分類
      this.ass11010Service
        .queryASS11010({}).pipe(untilDestroyed(this))
        .subscribe((response) => {
          this.largeOption = response.Data.map((item: any) => ({
            No: item.CLASS_ID,
            Name: item.CLASS_NAME,
            Label: item.CLASS_ID + '-' + item.CLASS_NAME,
          }));
        });

      // 禁用中分類、小分類
      this.queryForm.get('M_CLASS_ID')?.disable();
      this.queryForm.get('S_CLASS_ID')?.disable();
    }
  }

  // 讀取 下拉
  loadOptions() {
    // 品項代碼 (GOODS_ID)
    console.log('讀取品項代碼下拉選單');
    // 品項代碼 (GOODS_ID)
    this.fin11040Service.queryFIN11040({ PageSize: 9999, PageIndex: 1 }).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const data: TDS1008Data[] = res.Data ?? [];
        const options = data
          .filter(item => item.INV_ItemNo != null && item.INV_ItemNo !== '')
          .map(item => ({
            label: `${item.INV_ItemNo} - ${item.INV_ItemName ?? ''}`,
            value: item.INV_ItemNo,
          }));
        this.goodsIdOptions.set(options);
      },
    });
  }
}
