import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, convertDateToYYYYMM, createPaginationConfig, formatDate, formatYN, formatYYYYMM } from '@shared/componentkit/table/table.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { Tls2e020Data, Tls2e020Service, Tls2e020QueryBody } from '@service/api/tls/tls2e020.service'; // 確保 Tls2e020QueryBody 已被引入
import { getSYS1000Options } from '@service/system/sys1000.service';

// 2.2.14.2 專櫃抽成金額結算作業
@Component({
  selector: 'app-tls2e020',
  templateUrl: './tls2e020.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, TableComponent, TranslateModule]
})
export class TLS2E020Component extends BasicQueryPageComponent<Tls2e020Data> implements OnInit {
  // 完整的期別選項（基於您的描述）
  private readonly SAM_TERMNO_MAP = {
    '10': [1, 2, 3],
    '15': [1, 2],
    '30': [1]
  };

  // 下拉選單資料
  totalRecords = 0;
  money_typeOptions = getSYS1000Options('money_type');
  sam_termnoOptions: { value: number, label: string }[] = []; // 期別選項
  // 查詢表單
  queryForm = this.formBuilder.nonNullable.group({
    sam_yyymm: [new Date(), [Validators.required]], // 查詢年月
    money_type: [this.money_typeOptions[2]?.value || null as string | null, [Validators.required]], // 結帳方式 (使用 string|null 來匹配後端)
    sam_termno: [1, [Validators.required]], // 期別 (使用 number|null)
    ...createPaginationConfig([{ field: 'sam_yyymm', order: 1 }]), // 分頁和排序參數
  });


  // 表格資料
  data: Tls2e020Data[] = [];
  columns: Column[] = [
    { field: 'sam_yyymm', header: '結算年月', visible: true, format: formatYYYYMM }, // 假設您有這個格式化函數
    { field: 'sam_termno', header: '期別', visible: true },
    { field: 'sam_datebeg', header: '帳款期間-起日', visible: true, format: formatDate },
    { field: 'sam_dateend', header: '帳款期間-迄日', visible: true, format: formatDate },
    { field: 'sam_num', header: '結算家數', visible: true },
    { field: 'sam_confirm', header: '是否確認', visible: true, format: formatYN, exportFormat: [{ "Y": "是" }, { "N": "否" }] },
    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDate },
    { field: 'CRT_USR_No', header: '建立人員', visible: true },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: true },
    { field: 'salm_id', header: '結帳編號', visible: true },
  ];

  constructor(
    private readonly tls2e020Service: Tls2e020Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2E020');
    this.setupFormLinkage(); // 設定表單聯動
  }

  /**
   * 設定 money_type 與 sam_termno 的聯動邏輯
   */
  private setupFormLinkage(): void {
    this.queryForm.controls.money_type.valueChanges.pipe(untilDestroyed(this)).subscribe(moneyType => {
      this.updateSamTermnoOptions(moneyType);
      // 重設 sam_termno，避免選了不合法的組合
      this.queryForm.controls.sam_termno.setValue(1);
    });

    // 初始載入時，如果 money_type 有預設值，也要更新 sam_termno 選項
    const initialMoneyType = this.queryForm.controls.money_type.value;
    if (initialMoneyType) {
      this.updateSamTermnoOptions(initialMoneyType);
    }
  }

  /**
   * 根據 money_type 更新 sam_termno 的選項
   * @param moneyType 結帳方式的值 (e.g., "10", "15", "30")
   */
  private updateSamTermnoOptions(moneyType: string | null): void {
    if (moneyType && this.SAM_TERMNO_MAP[moneyType as keyof typeof this.SAM_TERMNO_MAP]) {
      // 根據 money_type 取得對應的期數陣列 (e.g., [1, 2, 3])
      const termNumbers = this.SAM_TERMNO_MAP[moneyType as keyof typeof this.SAM_TERMNO_MAP];

      // 轉換成 Dropdown 需要的格式 { label: string, value: number }
      this.sam_termnoOptions = termNumbers.map(num => ({
        label: `${num}`,
        value: num
      }));
    } else {
      this.sam_termnoOptions = [];
    }
  }

  // NOTE: 關於「選1就會顯示10 15 30」這個反向需求，
  // 通常不會在**查詢頁面**實現，因為這會限制 money_type 的選擇。
  // 如果確實需要，需要修改 Dropdown 元件使其支援反向選擇/過濾。
  // 在這裡，我們只實作「money_type 決定 sam_termno」的邏輯。

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 確保 sam_yyymm 被正確轉換，且 sam_termno 為數字
      const body = {
        ...frm.value,
        sam_yyymm: convertDateToYYYYMM(frm.value.sam_yyymm),
        sam_termno: frm.value.sam_termno as number, // 確保型別是 number
        money_type: Number(frm.value.money_type)
      } as Tls2e020QueryBody; // 轉換為正確的 Request Body 型別

      this.tls2e020Service.queryTls2e020(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
      });
    });
  }

  settleLoding = false;
  onSettle(frm: FormGroup) {
    // NOTE: executeTLS2E020 Request Body 需要 sam_yyymm, sam_termno, money_type, tlt_no
    // 您的 queryForm 沒有 tlt_no，請確保 execute 邏輯中 tlt_no 有正確的預設值或從其他地方取得。
    this.settleLoding = true;

    const body = {
      ...frm.value,
      sam_yyymm: convertDateToYYYYMM(frm.value.sam_yyymm),
      sam_termno: frm.value.sam_termno as number,
      money_type: frm.value.money_type as number,
      tlt_no: ''
    }

    this.tls2e020Service.executeTls2e020(body).pipe(finalize(() => this.settleLoding = false), untilDestroyed(this)).subscribe(res => {
      this.messageService.successBubble(`${res.Data.ErrMsg}`);
    });
  }
  lockLoding = false;
  onLock(frm: FormGroup) {
    this.lockLoding = true;
    const body = {
      ...frm.value,
      sam_yyymm: convertDateToYYYYMM(frm.value.sam_yyymm),
      money_type: String(frm.value.sam_termno),
      sam_termno: frm.value.money_type
    }
    this.tls2e020Service.lockTls2e020(body).pipe(finalize(() => this.lockLoding = false), untilDestroyed(this)).subscribe(res => {
      this.messageService.successBubble(res.Message)
    })
  }
}
