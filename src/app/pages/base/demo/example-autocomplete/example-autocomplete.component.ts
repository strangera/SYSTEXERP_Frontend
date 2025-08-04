import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { COMMON_IMPORTS } from '../demo-imports';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { IQueryPOS2004DetailRequest, IQueryPOS2004DetailResponse, Tls52010Service } from '@service/api/tls/tls52010.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { AutoCompleteComponent } from '@shared/componentkit/app-autocomplete/app-autocomplete.component';

@Component({
  selector: 'app-example-autocomplete',
  standalone: true,
  imports: [
    COMMON_IMPORTS,
    DropdownTableComponent,
    InputTextComponent,
    AutoCompleteComponent,
  ],
  templateUrl: './example-autocomplete.component.html',
})
export class ExampleAutocompleteComponent extends BasicQueryPageComponent<unknown> implements OnInit {
  queryForm = this.formBuilder.group({
    queryNo: ['', Validators.required],
  });
  // ===================================================
  // 銀行測試表單
  bankTestForm = this.formBuilder.group({
    bank_id: ['', [Validators.required]]
  });
  // 銀行選項（模擬 API 資料）
  bankOptions: string[] = [
    '0041539 臺灣銀行內湖分行',
    '0041540 臺灣銀行松山分行',
    '0041541 臺灣銀行信義分行',
    '0041542 臺灣銀行大安分行',
    '0069021 合作金庫商業銀行台北分行',
    '0069022 合作金庫商業銀行板橋分行',
    '0069023 合作金庫商業銀行新莊分行',
    '0069024 合作金庫商業銀行三重分行',
    '0069025 合作金庫商業銀行中和分行',
    '0071021 第一商業銀行台北分行',
    '0071022 第一商業銀行忠孝分行',
    '0071023 第一商業銀行信義分行',
    '0071024 第一商業銀行南京分行',
    '0082021 華南商業銀行台北分行',
    '0082022 華南商業銀行敦化分行',
    '0082023 華南商業銀行南京分行',
    '0082024 華南商業銀行信義分行',
    '0111021 上海商業儲蓄銀行台北分行',
    '0111022 上海商業儲蓄銀行忠孝分行',
    '0111023 上海商業儲蓄銀行松江分行',
    '0121021 台北富邦銀行台北分行',
    '0121022 台北富邦銀行忠孝分行',
    '0121023 台北富邦銀行信義分行',
    '0121024 台北富邦銀行敦化分行'
  ];
  // 銀行測試狀態
  bankTestSubmitted = false;
  bankTestLoading = false;
  selectedBankInfo: any = null;
  // ========== 新增：載入銀行資料方法 ==========
  private loadBankData(): void {
    // 在實際專案中，這裡會從 API 載入
    // this.bankService.getBankBranches().subscribe(data => {
    //   this.bankOptions = data;
    // });
    console.log('載入銀行資料:', this.bankOptions.length, '筆');
  }
  // ========== 新增：銀行選擇事件處理 ==========
  /**
   * 選擇銀行時的處理
   */
  onBankSelect(option: any): void {
    console.log('選擇銀行:', option);
    this.selectedBankInfo = option;
    // 這裡可以加入額外的業務邏輯
    // 例如：載入對應的帳戶資訊、驗證銀行狀態等
    this.messageService.infoBubble(`已選擇: ${option.bankName} ${option.branchName}`);
  }
  // 取消選擇銀行時的處理
  onBankUnselect(): void {
    console.log('取消選擇銀行');
    this.selectedBankInfo = null;
    this.messageService.infoBubble('已清除銀行選擇');
  }
  // 銀行變更時的處理
  onBankChange(option: any): void {
    console.log('銀行選擇變更:', option);
  }
  // 測試銀行選擇功能
  testBankSelection(bankId: string): void {
    // 直接設定表單值來測試編輯模式
    this.bankTestForm.patchValue({
      bank_id: bankId
    });

    console.log('測試設定銀行代碼:', bankId);
    this.messageService.infoBubble(`測試設定銀行代碼: ${bankId}`);
  }

  /**
   * 清除銀行測試
   */
  clearBankTest(): void {
    this.bankTestForm.reset();
    this.selectedBankInfo = null;
    this.bankTestSubmitted = false;
    this.messageService.infoBubble('已清除銀行測試資料');
  }

  /**
   * 銀行測試表單提交
   */
  onBankTestSubmit(): void {
    this.bankTestSubmitted = true;
    this.bankTestLoading = true;

    if (this.bankTestForm.valid) {
      // 模擬 API 提交
      setTimeout(() => {
        const bankId = this.bankTestForm.get('bank_id')?.value;
        console.log('提交銀行測試資料:', {
          bankId: bankId,
          selectedBankInfo: this.selectedBankInfo
        });

        this.messageService.successBubble('銀行資料測試提交成功！');
        this.bankTestLoading = false;
      }, 1000);
    } else {
      this.messageService.warnBubble('請選擇銀行後再提交');
      this.bankTestLoading = false;
    }
  }
  // ===================================================
  opLoading = false;
  opForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 管理編號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  suggestions: IQueryPOS2004DetailResponse[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_MagNo', header: '管理編號', mainDataField: true },
  ];
  opData: IQueryPOS2004DetailResponse[] = [];// overlayPanel 裡面的table
  opColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
    { field: 'PLU_Name', header: '商品名稱' },
  ];
  opTotalRecords = 0;
  constructor(
    private readonly tls52010Service: Tls52010Service
  ) {
    super();
  }
  ngOnInit(): void {
    console.log('ExampleAutocompleteComponent initialized');
    this.loadBankData();
  }
  onAutoCompleteInputChange(event: any) {
    const body = {
      ...event,
      VEN_No: '',
      LOGO_No: '',
      queryNo: event.PLU_MagNo || '',
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_MagNo', order: 1 }],
    }
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = [...results.Data];
    });
  }
  onformValueChanged(event: IQueryPOS2004DetailRequest) {
    this.opLoading = true;
    const body = {
      queryNo: event.queryNo || '',
      PLU_Name: event.PLU_Name || '',
      VEN_No: '',
      LOGO_No: '',
    };
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.opData = [...results.Data]; // 更新data資料
      this.opTotalRecords = results.TotalCount;
      this.opLoading = false;
    });
  }
  // ===================================================
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      console.log('Form submitted:', frm.value);
    });
  }
}
