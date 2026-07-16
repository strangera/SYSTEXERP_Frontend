import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls2f020Service } from '@service/api/tls/tls2f020.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model'; // 引入 ReportColumn
import { formatDate } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';

// 2.2.15.2 專櫃暫存應付帳款產生作業
@Component({
  selector: 'app-tls2f020',
  templateUrl: './tls2f020.component.html',
  standalone: true,
  imports: [TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, TranslateModule]
})
export class TLS2F020Component extends BasicQueryPageComponent<any> implements OnInit {
  private readonly SAM_TERMNO_MAP: Record<string, number[]> = {
    '10': [1, 2, 3],
    '15': [1, 2],
    '30': [1]
  };
  queryForm = this.formBuilder.nonNullable.group({
    sam_yyymm: [new Date(), Validators.required],
    sam_termno: [1],
    COMM_MONEY_TYPE: ['30'],
    // 分頁欄位
    pageSize: [1000],
    pageIndex: [1],
    SortBy: [[{ field: 'VouDate', order: 1 }]],
  });

  totalRecords = 0;
  data: any[] = [];
  money_typeOptions = getSYS1000Options('money_type');
  sam_termnoOptions: { value: number, label: string }[] = []; // 期別選項

  columns: ReportColumn[] = [
    { field: 'VouDate', header: '傳票日期', visible: true, format: formatDate },
    { field: 'SrcSheetType', header: '傳票型態代碼', visible: true },
    { field: 'Voucher_Name', header: '傳票型態名稱', visible: true },
    { field: 'PostFlag_Desc', header: '傳票狀態', visible: true },
    { field: 'Remark', header: '備註', visible: true },
  ];

  constructor(
    private readonly tlsService: Tls2f020Service,

  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS2F020', 'tls/tls2f020cru', this.queryForm, (form) => this.onSubmit(form));

    // 根據 COMM_MONEY_TYPE 的第一個值決定期別選項（支援多選或單選）
    const moneyCtrl = this.queryForm.controls.COMM_MONEY_TYPE as any;
    moneyCtrl.valueChanges.pipe(untilDestroyed(this)).subscribe((val: any) => {
      let moneyType: string | null = null;
      if (Array.isArray(val) && val.length) moneyType = String(val[0]);
      else if (val != null && val !== '') moneyType = String(val);
      this.updateSamTermnoOptions(moneyType);
      // 不自動設定 sam_termno 的預設值
    });
    // 初始載入時也更新一次
    const initialVal = moneyCtrl.value;
    let initialMoney: string | null = null;
    if (Array.isArray(initialVal) && initialVal.length) initialMoney = String(initialVal[0]);
    else if (initialVal != null && initialVal !== '') initialMoney = String(initialVal);
    if (initialMoney) this.updateSamTermnoOptions(initialMoney);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.value;
      const pageSize = formValue.pageSize ?? 0;
      const pageIndex = (formValue.pageIndex ?? 1);

      let sam_yyymm_string = '';
      if (formValue.sam_yyymm) {
        const date = new Date(formValue.sam_yyymm);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        sam_yyymm_string = `${year}${month}`;
      }

      const params = {
        PageSize: pageSize,
        PageIndex: Math.max(0, pageIndex - 1),
        OrderBy: formValue.OrderBy ?? '',
        Offset: Math.max(0, (pageIndex - 1) * pageSize),
        SortBy: formValue.SortBy ?? [],
        sam_yyymm: sam_yyymm_string,
        money_type: formValue.COMM_MONEY_TYPE ?? null,
        sam_termno: formValue.sam_termno ?? null,
      };

      this.tlsService.queryTLS2F020(params)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe((res) => {
          this.data = res?.Data ?? [];
          this.totalRecords = res?.TotalCount ?? 0;
        });
    });
  }

  // 覆寫新增/產生按鈕行為：直接呼叫 execTLS2F020
  override onCreate(): void {
    const formValue = this.queryForm.getRawValue();
    // 轉換 sam_yyymm 為 yyyymm
    let sam_yyymm_string = '';
    if (formValue.sam_yyymm) {
      const date = new Date(formValue.sam_yyymm);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      sam_yyymm_string = `${year}${month}`;
    }

    const sam_termno = formValue.sam_termno ?? null;
    const money_type = formValue.COMM_MONEY_TYPE ?? null;
    if (!sam_yyymm_string) {
      this.messageService.warnBubble('請輸入 結帳年月');
      return;
    }
    if (money_type == null) {
      this.messageService.warnBubble('請選擇 結帳方式');
      return;
    }
    if (sam_termno == null) {
      this.messageService.warnBubble('請選擇 帳次');
      return;
    }

    const params = {
      sam_yyymm: sam_yyymm_string,
      money_type: money_type,
      sam_termno: sam_termno,
    };

    this.loading = true;
    this.messageService.blockUi();

    this.tlsService.execTLS2F020(params)
      .pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); }))
      .subscribe({
        next: (res) => {
          const errCode = res?.Data?.ErrCode ?? 0;
          const errMsg = res?.Data?.ErrMsg ?? '';
          if (errCode !== 0) {
            // SP 回傳錯誤（例如：傳票已拋轉，不可重覆產生）
            this.messageService.errorBubble(errMsg || '產生失敗');
            return;
          }
          this.messageService.successBubble(errMsg || '產生完成');
          // 產生成功後自動重新查詢，讓畫面顯示最新(覆蓋後)的傳票資料
          this.onSubmit(this.queryForm);
        },

      });
  }

  private updateSamTermnoOptions(moneyType: string | null): void {
    if (moneyType && this.SAM_TERMNO_MAP[moneyType]) {
      const termNumbers = this.SAM_TERMNO_MAP[moneyType];
      this.sam_termnoOptions = termNumbers.map(num => ({ label: `${num}`, value: num }));
    } else {
      this.sam_termnoOptions = [];
    }
    // 如果沒有可用的期別或目前值不在選項中，清除 sam_termno 的值（避免顯示為虛化但未清除）
    const ctrl = this.queryForm.controls.sam_termno as any;
    const cur = ctrl?.value;
    const availableValues = this.sam_termnoOptions.map(o => o.value);
    if (this.sam_termnoOptions.length === 0 || (cur != null && !availableValues.includes(cur))) {
      try { ctrl.setValue(null); } catch { ctrl.setValue(undefined); }
    }
  }

}
