import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatDate } from '../../../shared/componentkit/table/table.model';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize, Observable, of } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { untilDestroyed } from '@ngneat/until-destroy';
import { CardModule } from 'primeng/card';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TabViewModule } from 'primeng/tabview';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { TLS2C020Data, TLS2C020Service } from '@service/api/tls/tls2-c020.service';
import { TLS2C010Service } from '@service/api/tls/tls2-c010.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { CheckboxModule } from 'primeng/checkbox';

export interface CheckData {
  checkOrder: string;
  checkContent: string;
  isPassed: string;
  details?: TLS2C020Data[];
}

interface ResponseData {
  QueryData: TLS2C020Data[];
  QueryData1: TLS2C020Data[];
  QueryData2: TLS2C020Data[];
  QueryData3: TLS2C020Data[];
  QueryData4: TLS2C020Data[];
  QueryData5: TLS2C020Data[];
  QueryData6: TLS2C020Data[];
  QueryData7: TLS2C020Data[];
  QueryData8: TLS2C020Data[];
  QueryData9: TLS2C020Data[];
  QueryData10: TLS2C020Data[];
  QueryData11: TLS2C020Data[];
  QueryData12: TLS2C020Data[];
}


@Component({
  selector: 'app-tls2c020',
  templateUrl: './tls2c020.component.html',
  styleUrl: './tls2c020.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, ButtonComponent, TranslateModule, CardModule, ScrollPanelModule, TabViewModule,
    TableComponent, ButtonComponent, DropdownComponent, CheckboxModule
  ]
})
export class TLS2C020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    cls_date: ['2025/08/27'], // 日期
    ECR_No: [''], // 收銀機代碼
    checkDuplicateInvoice: [true], // 是否檢核發票重複 - changed from ["Y"] to [true]
    ...createPaginationConfig([]) // 分頁和排序參數
  });

  closeDate = ''; // 最近關帳日期
  responseData: ResponseData | null = null;

  // 原始的檢查項目資料（不會被修改）
  private readonly originalData: CheckData[] = [
    { checkOrder: '1', checkContent: '檢查收銀機對帳查詢是否有不平的資料', isPassed: '' },
    { checkOrder: '2', checkContent: '檢查發票金額是否為應稅金額 + 免稅金額的加總(不含訂金)', isPassed: '' },
    { checkOrder: '3', checkContent: '檢查發票金額 01 -> 金額等於大於0，03 -> 金額小於等於0', isPassed: '' },
    { checkOrder: '4', checkContent: '檢查折扣開放區間是否重複', isPassed: '' },
    { checkOrder: '5', checkContent: '交易有某個專櫃代號但合約檔沒有', isPassed: '' },
    { checkOrder: '6', checkContent: '檢核POS終止日期過期', isPassed: '' },
    { checkOrder: '7', checkContent: '比對有(現金,信用卡)實收資料，卻無系統帳的', isPassed: '' },
    { checkOrder: '8', checkContent: '只檢核單日發票號碼是否重複', isPassed: '' },
    { checkOrder: '9', checkContent: '比對有Z帳無銷售資料，請確認是否是銷售資料欠落', isPassed: '' },
    { checkOrder: '10', checkContent: '檢查交易發票是否存在於發票主檔', isPassed: '' },
    { checkOrder: '11', checkContent: '檢核系統帳與實收帳是否等於溢收欠金額', isPassed: '' },
    { checkOrder: '12', checkContent: '檢核合約抽成類別是否尚未設定', isPassed: '' },
  ];

  // 顯示用的資料（會被更新）
  data: CheckData[] = [];

  columns: Column[] = [
    { field: 'checkOrder', header: '檢查順序', hidden: true },
    { field: 'checkContent', header: '檢查內容', visible: true },
    { field: 'isPassed', header: '是否通過', visible: true },
  ];

  expansionColumns: Column[] = [
    { field: 'cls_date', header: '交易日期', visible: true, format: formatDate },
    { field: 'check_result', header: '結果說明', visible: true }
  ]

  ECR_NoOptions: any[] = []; // 收銀機代碼下拉選單選項

  constructor(
    private datePipe: DatePipe,
    private cd: ChangeDetectorRef,
    private tls2c020Service: TLS2C020Service,
    private tls2c010Service: TLS2C010Service,
    private dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2C020', 'tls/tls2c020cru', this.queryForm, (form) => this.onSubmit(form));
    // 取得最近關帳日期
    this.tls2c010Service.getTLS2C010Date()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.closeDate = response.Data.CLS_DATE || '';
        // cls_date 為 closeDate - 1 天
        const nextDate = new Date(this.closeDate);
        nextDate.setDate(nextDate.getDate() - 1);
        this.queryForm.patchValue({ cls_date: this.datePipe.transform(nextDate, 'yyyy/MM/dd') || '' });
      });
    // 載入下拉選單選項
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls2c020Service.queryTLS2C020(
        {
          ECR_No: frm.value.ECR_No || '',
          cls_date: this.datePipe.transform(frm.value.cls_date, 'yyyy-MM-dd') || '',
          checkDuplicateInvoice: frm.value.checkDuplicateInvoice
        })
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = this.updateData(response.Data);
          this.responseData = response.Data as ResponseData;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
          this.cd.detectChanges();
        });
    });
  }

  loadOptions() {
    // 讀取下拉選單選項
    this.dropDownListService.queryPOS1002_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.ECR_NoOptions = res.Data.map((item: any) => ({
          label: item.Name,
          value: item.No
        }));
        this.cd.detectChanges();
      });
  }

  updateData(responseData: ResponseData): CheckData[] {
    // 根據 checkDuplicateInvoice 的值決定要處理的資料
    let dataToProcess = this.originalData;
    if (!this.queryForm.value.checkDuplicateInvoice) {
      // 如果不檢核發票重複，過濾掉第8項
      dataToProcess = this.originalData.filter(item => item.checkOrder !== '8');
    }

    return dataToProcess.map(item => {
      const queryDataKey = `QueryData${item.checkOrder}` as keyof ResponseData;
      const details = responseData[queryDataKey] || [];

      return {
        ...item,
        isPassed: details.length > 0 ? '有問題' : 'OK',
        details: details // 預先設定每一行的詳細資料
      };
    });
  }
}