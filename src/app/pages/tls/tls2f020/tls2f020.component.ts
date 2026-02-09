import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls2f020Service } from '@service/api/tls/tls2f020.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model'; // 引入 ReportColumn
import { formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

// 2.2.15.2 專櫃暫存應付帳款產生作業
@Component({
  selector: 'app-tls2f020',
  templateUrl: './tls2f020.component.html',
  standalone: true,
  imports: [TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, TranslateModule, MultiSelectComponent]
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
    pageSize: [30],
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
    { field: 'Voucher_Name', header: '傳票型態', visible: true },
    { field: 'SrcSheetNo', header: '來源編號', visible: true },
    { field: 'PostFlag_Desc', header: '傳票狀態', visible: true },
    { field: 'Trans_Status_Desc', header: '轉拋狀態', visible: true },
    { field: 'Remark', header: '備註', visible: true },
  ];



  constructor(
    private readonly dropdown: DropdownApiService,
    private readonly dropDownListService: DropDownListService,
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
    const initialVal = moneyCtrl.value as any;
    let initialMoney: string | null = null;
    if (Array.isArray(initialVal) && initialVal.length) initialMoney = String(initialVal[0]);
    else if (initialVal != null && initialVal !== '') initialMoney = String(initialVal);
    if (initialMoney) this.updateSamTermnoOptions(initialMoney);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.performQuery(frm);
    });
  }

  performQuery(frm: FormGroup) {
    this.errorMessage = null;
    const v = frm.value as any;
    const pageSize = v.pageSize ?? 0;
    const pageIndex = (v.pageIndex ?? 1);
    // Normalize sam_yyymm to 'yyyymm' (e.g. 202601)
    const sam_yyymm_val = v.sam_yyymm;
    let sam_yyymm = '';
    if (sam_yyymm_val) {
      if (typeof sam_yyymm_val === 'string') {
        const s = sam_yyymm_val.trim();
        if (/^\d{6}$/.test(s)) {
          sam_yyymm = s;
        } else {
          const d = new Date(s);
          if (!isNaN(d.getTime())) sam_yyymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
          else sam_yyymm = s;
        }
      } else if (sam_yyymm_val instanceof Date) {
        const d = sam_yyymm_val as Date;
        sam_yyymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else if (typeof sam_yyymm_val === 'number') {
        const d = new Date(sam_yyymm_val);
        if (!isNaN(d.getTime())) sam_yyymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
        else sam_yyymm = String(sam_yyymm_val);
      }
    }

    const params = {
      PageSize: pageSize,
      PageIndex: Math.max(0, pageIndex - 1),
      OrderBy: v.OrderBy ?? '',
      Offset: Math.max(0, (pageIndex - 1) * pageSize),
      SortBy: v.SortBy ?? [],
      sam_yyymm: sam_yyymm,
      COMM_MONEY_TYPE: Array.isArray(v.COMM_MONEY_TYPE) ? (v.COMM_MONEY_TYPE[0] ?? '') : (v.COMM_MONEY_TYPE ?? ''),
      sam_termno: v.sam_termno ?? null
    };

    this.tlsService.queryTLS2F020(params)
      .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          this.data = res?.Data ?? [];
          this.totalRecords = res?.TotalCount ?? 0;
        },

      });
  }

  errorMessage: string | null = null;

  // 覆寫新增/產生按鈕行為：直接呼叫 execTLS2F020
  override onCreate(): void {
    const v = this.queryForm.getRawValue() as any;
    // 轉換 sam_yyymm 為 yyyymm
    const sam_yyymm_val = v.sam_yyymm;
    let sam_yyymm = '';
    if (sam_yyymm_val) {
      if (typeof sam_yyymm_val === 'string') {
        const s = sam_yyymm_val.trim();
        if (/^\d{6}$/.test(s)) sam_yyymm = s;
        else {
          const d = new Date(s);
          if (!isNaN(d.getTime())) sam_yyymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
          else sam_yyymm = s;
        }
      } else if (sam_yyymm_val instanceof Date) {
        const d = sam_yyymm_val as Date;
        sam_yyymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else if (typeof sam_yyymm_val === 'number') {
        const d = new Date(sam_yyymm_val);
        if (!isNaN(d.getTime())) sam_yyymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
        else sam_yyymm = String(sam_yyymm_val);
      }
    }

    const sam_termno = v.sam_termno ?? null;
    if (!sam_yyymm) {
      this.messageService.warnBubble('請輸入 查核年月');
      return;
    }
    if (sam_termno == null) {
      this.messageService.warnBubble('請選擇 帳次');
      return;
    }

    const params = {
      sam_yyymm: sam_yyymm,
      sam_termno: sam_termno
    };

    this.loading = true;
    this.messageService.blockUi();

    this.tlsService.execTLS2F020(params)
      .pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); }))
      .subscribe({
        next: (res: any) => {
          this.messageService.successBubble(res?.Message ?? '產生完成');
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
  }

}
