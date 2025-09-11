import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { FIN11090Data, FIN11090RestoreAndUploadRequest, Fin11090Service } from '../../../service/api/fin/fin11090.service';
import { ECRNoService } from '@service/basic/ECRNo.service';
import { ValidationService } from '@shared/service/validation.service';
import {
  AddButton,
  Column,
  createPaginationConfig,
  formatAmount,
  formatDate
} from '../../../shared/componentkit/table/table.model';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';

@Component({
  selector: 'app-fin11090',
  templateUrl: './fin11090.component.html',
  styleUrl: './fin11090.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    InputTextComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    MultiSelectComponent
  ]
})
export class FIN11090Component extends BasicQueryPageComponent<FIN11090Data> implements OnInit {

  // 表單定義
  queryForm = this.formBuilder.group({
    TXN_Date: ['', Validators.required],
    ECR_No: [[], Validators.required],
    TXN_No: ['', [
      Validators.required,
      Validators.maxLength(6),
      this.validationService.numberValidator
    ]],
    TXN_GUITrack: ['', [Validators.maxLength(2)]],
    TXN_GUINo: ['', [Validators.maxLength(8)]],
    ...createPaginationConfig([{ field: 'TXN_Date', order: -1 }]),
  });

  // 資料屬性
  totalRecords = 0;
  data: FIN11090Data[] = [];
  selectedItems: FIN11090Data[] = [];
  POS_NOSOptions: { value: string; label: string; }[] = [];

  // 表格欄位定義
  columns: Column[] = [
    {
      field: 'TXN_Date',
      header: '銷售日期',
      visible: true,
      format: formatDate
    },
    {
      field: 'ECR_No',
      header: '收銀機號',
      visible: true
    },
    {
      field: 'TXN_No',
      header: '交易序號',
      visible: true
    },
    {
      field: 'TXN_GUINo',
      header: '發票號碼',
      visible: true
    },
    {
      field: 'TXN_SaleAmt',
      header: '銷售金額',
      visible: true,
      format: formatAmount
    },
    {
      field: 'INV_RCancel',
      header: '開立狀態',
      visible: true,
      format: (value: string) => value === 'Y' ? '作廢' : '正常'
    },
    {
      field: 'SaleReturn_Status',
      header: '折讓狀態',
      visible: true,
      format: (value: string) => value === 'Y' ? '作廢' : '正常(已銷退)'
    },
    {
      field: 'TXN_VoidDT',
      header: '作廢日期',
      visible: true,
      format: formatDate
    }
  ];

  confirmBtnLoading = false;

  constructor(
    private fin11090Service: Fin11090Service,
    private eCRNoService: ECRNoService,
    private validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    // 初始化頁面
    this.initializePage('FIN11090', 'fin/fin11090cru', this.queryForm, (form) => this.onSubmit(form));

    // 載入收銀機選項
    this.eCRNoService.getECRNo()
      .pipe(untilDestroyed(this))
      .subscribe(data => {
        this.POS_NOSOptions = data.map((item: { value: string; label: string; }) => ({
          ...item,
          label: `${item.value} - ${item.label}`
        }));
      });
  }

  /**
   * 提交查詢表單
   */
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin11090Service.queryFIN11090(frm.value)
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        });
    });
  }

  /**
   * 判斷資料列是否可選擇
   */
  isRowSelectable(rowData: FIN11090Data): boolean {
    // 檢查銷退狀態：SaleReturn_Status = 'N' 時
    // 此發票已輸入銷退作業，所以不可執行發票作廢還原
    if (rowData.SaleReturn_Status === 'N') {
      return false;
    }
    return true;
  }


  /**
   * 作廢還原操作
   */
  onConfirm(rowData: FIN11090Data[]) {
    this.messageService.confirm({
      header: '是否執行作廢還原',
      accept: () => {
        // 將選中的資料轉換為 API 請求格式
        const payload: FIN11090RestoreAndUploadRequest[] = rowData.map(item => ({
          TXN_Date: item.TXN_Date || '',
          ECR_No: item.ECR_No || '',
          TXN_No: item.TXN_No?.toString() || '',
          SaleReturn_Status: item.SaleReturn_Status || ''
        }));

        this.confirmBtnLoading = true;

        // 呼叫 API
        this.fin11090Service.restoreAndUploadFIN11090(payload)
          .pipe(
            finalize(() => this.confirmBtnLoading = false),
            untilDestroyed(this)
          )
          .subscribe({
            next: (response) => {
              this.messageService.successBubble('作廢還原成功');
              // 成功後重新查詢資料
              this.onSubmit(this.queryForm);
              // 清空已選擇的項目
              this.selectedItems = [];
            }
          });
      }
    });
  }
}
