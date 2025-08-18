import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, effect, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TLS26080Service } from '@service/api/tls/tls26080.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { ExcelImportService } from '@shared/service/excel-import.service';
import { FileUpload, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { PanelModule } from 'primeng/panel';
import * as XLSX from 'xlsx';
import { TLS26080Data, TLS26080Detail } from '../tls26080/tls26080.model';

@Component({
  selector: 'app-tls26080-cru',
  templateUrl: './tls26080-cru.component.html',
  styleUrl: './tls26080-cru.component.scss',
  standalone: !0,
  imports: [
    FileUploadModule,
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    CalendarComponent,
    CalendarRangeComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    TableComponent,
  ]
})
export class TLS26080CRUComponent extends BasicCruPageComponent<TLS26080Data> implements OnInit {

  public dataForm = this.formBuilder.nonNullable.group({
    pod_no: new FormControl<string>('自動給號', [Validators.maxLength(10)]), // 活動單號
    pod_desc: new FormControl<string | undefined>(void 0, [Validators.required]), // 活動名稱
    pod_sdate: new FormControl<Date>(this.service.dateS, [Validators.required]), // 起始日期(起)
    pod_edate: new FormControl<Date>(this.service.dateE, [Validators.required]), // 起始日期(迄)
    pod_busdate: new FormControl<Date | undefined>(void 0, [Validators.required]), // 活動正檔日期
    pod_status: new FormControl<string>(ApprovalStatus.未核准), // 核准狀態
    pod_type: new FormControl<'1' | '2' | '8'>('2'), // 活動類型
    org_id: new FormControl<string | undefined>(void 0), // 部門
  });
  public readonly df = computed(() => this.dataForm.controls);

  public calcDateType = [
    { label: '活動起始日至截止日', value: 'Y' },
    { label: '正檔日至截止日', value: 'N' }
  ];

  private fileSignal = signal<any[]>([]);
  public fileUpload = viewChild.required<FileUpload>('fileUpload');

  private podNoSignal = toSignal(this.df().pod_no.valueChanges);
  private podDescSignal = toSignal(this.df().pod_desc.valueChanges);

  private readonly selectedCampaign = computed(() => {
    const podDesc = this.podDescSignal();
    return this.service.campaignData().find(campaign => campaign.CampaignId === podDesc);
  });

  // private counterData = new Map<string, CounterData>();
  // private deductionData = new Map<string, DeductionItem>();

  // public selectedCounter?: CounterData;

  /** 抓取全部podNos */
  private readonly podNosEffect = effect(() => {
    this.podNos.clear();
    for (const item of this.service.TLS26080Data()) this.podNos.add(item.pod_no);
    console.log(`podNos:`, [this.service.TLS26080Data(), Array.from(this.podNos)]);
  });

  /** 根據選擇的活動名稱更新表單 */
  private readonly campaignEffect = effect(() => {
    const podDesc = this.podDescSignal();
    if (!podDesc || !this.selectedCampaign()) return;
    const result = this.podNos.has(podDesc)
      ? Array.from(this.podNos).filter(podNo => podNo !== podDesc)
      : Array.from(this.podNos);
    this.dataForm.patchValue({
      pod_no: this.selectedCampaign()!.CampaignId,
      pod_sdate: new Date(this.selectedCampaign()!.StartTime),
      pod_edate: new Date(this.selectedCampaign()!.EndTime),
    }, { emitEvent: !0 });
    this.service.loadCampaignCounter(result);
    console.log(`campaignEffect:`, [podDesc, result]);
  }, { allowSignalWrites: !0 });

  /** 根據選擇的活動名稱更新專櫃資料 */
  private readonly campaignCounterEffect = effect(() => {
    const data = this.service.campaignCounterData();
    const formData = this.dataForm.value;
    if (!data?.length || !this.selectedCampaign()) return;
    let result: TLS26080Detail[] = [];
    for (const item of data) {
      result.push({
        pod_no: this.selectedCampaign()!.CampaignId,
        pod_type: this.selectedCampaign()!.AccountingType,
        calc_date_type: 'Y',
        talent_id: item.talent_id,
        tlt_id: item.ProductType,
        tlt_name: item.tlt_name,
        tlt_no: item.CounterCode,
        tpy_rate: 0.1,
      });
    }
    this.service.TLS26080Detail.set(result);
  }, { allowSignalWrites: !0 });

  /** 初始化靜態資料 */
  public readonly staticDataEffect = effect(() => {
    const detail = this.service.TLS26080Detail();
    if (!detail) return;
    TLS26080CRUComponent.staticDetailData = detail;
    this.staticDataEffect.destroy(); // 只需執行一次
  });

  // 環友資料表
  campaignColumns: Column[] = [
    { field: 'CampaignId', header: '活動編號' },
    { field: 'CampaignName', header: '活動名稱' },
    { field: 'StartTime', header: '活動開始時間', format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'EndTime', header: '活動結束時間', format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'AccountingType', header: '帳務拆分類別' },
    { field: 'Remark', header: '活動備註' },
  ];

  // 環友專櫃資料表
  // campaignCounterColumns: Column[] = [
  //   { field: 'CounterCode', header: '專櫃編號' },
  //   { field: 'ProductType', header: '專櫃抽成類別' },
  // ];

  // 專櫃資料表
  public counterColumns: Column[] = [
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '櫃位名稱' },
    { field: 'tlt_id', header: '抽成類別' },
    {
      field: 'calc_date_type',
      header: '預售起日計算',
      visible: !0,
      type: 'dropdown',
      optionShowClear: !1,
      options: () => this.calcDateType,
      format: v => v === 'Y' ? '活動起始日至截止日' : '正檔日至截止日',
    },
    {
      field: 'tpy_rate',
      header: '抽成率',
      visible: !0,
      type: 'input',
      validate: [this.numValidator],
      suffix: '%',
    },
  ];

  // 扣款項目資料表
  // deductionColumns: Column[] = [
  //   { field: 'itemCode', header: '扣款項目編號' },
  //   { field: 'itemName', header: '扣款項目名稱' },
  //   { field: 'amountOrRate', header: '金額/比率' }
  // ];

  // 靜態資料: 用於表單初始化和重置
  private static staticData: TLS26080Data;
  private static staticDetailData: TLS26080Detail[];
  private podNos = new Set<string>();

  constructor(
    public readonly service: TLS26080Service,
    private readonly datePipe: DatePipe,
    private readonly excelImportService: ExcelImportService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('TLS26080', this.dataForm);
    if (this.crudstatus !== CRUDStatus.Create) this.service.loadTLS26080Detail(this.rowdata!.pod_no || '');
    // this.service.loadTLS26080({ pod_sdate: this.df().pod_sdate.value!, pod_edate: this.df().pod_edate.value! });
    this.service.loadAPS1003(['E']);
    this.service.loadCampaignData();
    TLS26080CRUComponent.staticData = this.dataForm.value as TLS26080Data;
    console.log(`init:`, [this.rowdata, this.crudstatus, this.dataForm.value]);
  }

  public onClear(): void {
    this.crudstatus === CRUDStatus.Edit
      ? this.dataForm.reset(TLS26080CRUComponent.staticData)
      : this.dataForm.reset({
        pod_no: '自動給號',
        pod_sdate: this.service.dateS,
        pod_edate: this.service.dateE,
        pod_status: ApprovalStatus.未核准,
      });
    this.crudstatus === CRUDStatus.Edit
      ? this.service.TLS26080Detail.set(TLS26080CRUComponent.staticDetailData)
      : this.service.TLS26080Detail.set([]);
  };

  public onSubmitQuery(): void {
    this.onSubmit(this.dataForm);
  };

  // 表單提交
  public onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      console.log(`submit:`, [frm.value, this.service.TLS26080Detail()]);
      this.confirmationService.confirm({
        message: '是否確認存檔?',
        accept: () => {
          this.service.insertTLS26080({
            ...frm.value,
            TALPORDERD_VOUCHERDetails: Array.from(this.service.TLS26080Detail()),
          });
          // this.messageService.successBubble('存檔成功');
        },
        reject: () => this.messageService.infoBubble('已取消存檔')
      });
    });
  }

  private numValidator(value: any): { isValid: boolean; errorMessage: string[]; } {
    console.log(`numValidator:`, [value]);

    // 檢查是否為有效數字
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) return { isValid: !1, errorMessage: ['請輸入有效的數字', '抽成率驗證錯誤'] };

    // 檢查範圍是否在 0~100 之間
    if (num < 0 || num > 100) return { isValid: !1, errorMessage: ['請輸入有效的數字', '抽成率驗證錯誤'] };

    // 檢查小數點位數是否不超過一位
    const decimalPlaces = (num.toString().split('.')[1] || '').length;
    return { isValid: decimalPlaces <= 1, errorMessage: ['請輸入有效的數字', '抽成率驗證錯誤'] };
  }

  public onBlurCounter(event: any): void {
    this.dataForm.valid
      ? this.messageService.successBubble('專櫃資料已更新')
      : this.messageService.warnBubble('請檢查專櫃資料是否正確');
    console.log(`onBlurCounter:`, [event, this.dataForm.value]);
  }

  public async handleUpload(event: FileUploadHandlerEvent): Promise<void> {
    const data = await this.excelImportService.importExcel(event.files[0], ['專櫃編號', '櫃位名稱', '抽成類別', '抽成類別名稱', '正檔起日計算', 'D16', 'D17', '備註']);
    this.fileSignal.set(data);
    this.fileUpload().clear();
    console.log(`excel import:`, [data]);
  }

  public onExportExcelTemplate(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([
      ['專櫃編號', '櫃位名稱', '抽成類別', '抽成類別名稱', '正檔起日計算', 'D16', 'D17', '備註'],
    ]);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'export_template.xlsx');
    console.log(`export excel template:`, []);
  }








  // // 專櫃選擇事件
  // private onCounterSelect(counter: CounterData): void {
  //   this.selectedCounter = counter;
  //   this.loadDeductionItems(counter.counterCode);
  // }

  // // 載入扣款項目
  // private loadDeductionItems(counterCode: string): void {
  //   // this.deductionData = this.mockDeductionData[counterCode] || [];
  // }

  // // 新增專櫃 - 修復加入 counterName
  // private onAddCounter(): void {
  //   const newId = this.counterData.size + 1;
  //   const newCounter: CounterData = {
  //     id: newId,
  //     counterCode: '',
  //     counterName: '',
  //     itemCode: '',
  //     commissionTypeCode: '',
  //     commissionTypeName: '',
  //     presaleStartCalculation: '',
  //     contractStartDate: '',
  //     contractEndDate: '',
  //     operationStartDate: '',
  //     operationEndDate: '',
  //     deductionItems: ''
  //   };
  //   this.counterData.set(String(newId), newCounter);
  // }

  // // 刪除專櫃
  // public onDeleteCounter(counter: CounterData): void {
  //   for (const [key, value] of this.counterData.entries()) {
  //     if (value.id === counter.id) { this.counterData.delete(key); break; }
  //   }
  //   if (this.selectedCounter?.id !== counter.id) return;
  //   this.selectedCounter = void 0;
  //   this.deductionData.clear();
  // }

  // // 新增扣款項目 - 修復加入 counterName
  // private onAddDeductionItem(): void {
  //   if (!this.selectedCounter) return void this.messageService.warnBubble('請先選擇專櫃');

  //   const newItem: DeductionItem = {
  //     id: new Date().getTime(), // 使用時間戳作為暫時 ID
  //     counterCode: this.selectedCounter.counterCode,
  //     counterName: this.selectedCounter.counterName, // 加入 counterName
  //     itemCode: '',
  //     itemName: '',
  //     amountOrRate: 0,
  //     isRate: !1
  //   };

  //   this.deductionData.set(String(newItem.id), newItem);

  //   // 更新 mock 資料
  //   // if (!this.mockDeductionData[this.selectedCounter.counterCode]) {
  //   //   this.mockDeductionData[this.selectedCounter.counterCode] = [];
  //   // }
  //   // this.mockDeductionData[this.selectedCounter.counterCode].push(newItem);
  // }

  // // 刪除扣款項目
  // private onDeleteDeductionItem(item: DeductionItem): void {
  //   for (const [key, value] of this.deductionData.entries()) {
  //     if (value.id === item.id) { this.deductionData.delete(key); break; }
  //   }

  //   // 更新 mock 資料
  //   // if (this.selectedCounter) {
  //   //   this.mockDeductionData[this.selectedCounter.counterCode] =
  //   //     this.mockDeductionData[this.selectedCounter.counterCode]?.filter(d => d.id !== item.id) || [];
  //   // }
  // }
}
