/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';

import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';

import { TableReportComponent } from '@shared/components/table-report/table-report.component';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../others/component/table/table.model';

import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { TLS11020Service } from '../../../service/api/tls/tls11020.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';

@Component({
  selector: 'app-tls11020',
  templateUrl: './tls11020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    MultiSelectComponent,
    TranslateModule,
    TableReportComponent,
  ],
})
export class TLS11020Component extends BasicQueryPageComponent<any> implements OnInit {
  data: any[] = [];
  selectedItems: any[] = [];
  totalRecords = 0;

  lastQueryBody: any = null;
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;

  // 給 table-report 用：由它內部呼叫（lazy 分頁/排序用）
  queryTLS11020Fn = (body: any) => this.tls11020Service.queryTLS11020(body);
  /** 023 這筆不允許勾選、不允許編輯 */
  private isBlockedRow = (row: any): boolean => String(row?.CAP_Item ?? '').trim() === '023';

  /** 給 app-table-report 用：控制 checkbox 是否可勾 */
  isRowSelectable = (row: any): boolean => !this.isBlockedRow(row);

  /** 給 app-table-report 用：控制「編輯」按鈕 disabled */
  editDisabled = (row: any): boolean => this.isBlockedRow(row);

  // 如果你也想讓「查看/明細」一起鎖：
  // detailDisabled = (row: any): boolean => this.isBlockedRow(row);


  // 下拉
  deductionCategoryOptions = [
    { value: 'A', label: 'A-一次扣款' },
    { value: 'B', label: 'B-每月扣款' },
    { value: 'C', label: 'C-平均分攤' },
    { value: 'D', label: 'D-比率分攤' },
    { value: 'Z', label: 'Z-其他扣款' },
  ];

  guiFlagOptions = [
    { label: '開立', value: 'Y' },
    { label: '不開立', value: 'N' },
  ];

  taxTypeOptions = [
    { label: '免稅', value: '0' },
    { label: '應稅', value: '1' },
  ];

  isCommonlyUsedOptions = [
    { label: '常用', value: 'Y' },
    { label: '不常用', value: 'N' },
  ];

  accountOptions: any[] = [];
  capSaletypeOptions: any[] = [];
  edcBankOptions: any[] = [];
  instmsTypeOptions: any[] = [];
  payNoOptions: any[] = [];
  payNoVoucherOptions: { label: string; value: string }[] = [];
  calcTypeOptions: any[] = [];

  queryForm = this.formBuilder.group({
    CAP_Item: ['', [Validators.maxLength(3)]],
    CAP_Name: ['', [Validators.maxLength(40)]],
    CAP_BaseRate: ['', [Validators.maxLength(5)]],
    CAP_Type: [[] as string[]],
    CAP_Remark: ['', [Validators.maxLength(160)]],
    GUI_FLAG: [[] as string[]],
    AccNo: [[] as string[]],
    IsCommonlyUsed: [[] as string[]],
    ...createPaginationConfig([{ field: 'CAP_Item', order: 1 }]),
  });

  columns: any[] = [
    { field: 'CAP_Item', header: '扣款項目編號', visible: true, align: 'left' },
    {
      field: 'CAP_Type',
      header: '扣款類別',
      visible: true,
      align: 'left',
      format: (value: any) =>
        this.getLabelFromOptions(value, this.deductionCategoryOptions),
      exportFormat: this.deductionCategoryOptions.map((o) => ({
        [o.value]: o.label,
      })),
    },
    { field: 'CAP_Name', header: '扣款項目名稱', visible: true, align: 'left' },
    {
      field: 'CAP_SALETYPE',
      header: '銷售類型',
      visible: true,
      align: 'left',
      format: (value: any) => this.getLabelFromOptions(value, this.capSaletypeOptions),
    },
    {
      field: 'EDC_BANK',
      header: '收單行',
      visible: true,
      align: 'left',
      format: (value: any) => this.getLabelFromOptions(value, this.edcBankOptions),
    },
    {
      field: 'INSTMS_TYPE',
      header: '分期期數',
      visible: true,
      align: 'left',
      format: (value: any) => this.getLabelFromOptions(value, this.instmsTypeOptions),
    },
    {
      field: 'PAY_NO',
      header: '支付別編號',
      visible: true,
      align: 'left',
      format: (value: any) => {
        if (!value) return '';
        const allOptions = [...this.payNoOptions, ...this.payNoVoucherOptions];
        return String(value).split(',')
          .map(code => this.getLabelFromOptions(code.trim(), allOptions))
          .join('、');
      },
    },
    {
      field: 'CALC_TYPE',
      header: '券類計算方式',
      visible: true,
      align: 'left',
      format: (value: any) => this.getLabelFromOptions(value, this.calcTypeOptions),
    },
    { field: 'OVER_BASE_RATE', header: '超過基準比率', visible: true, align: 'right' },
    { field: 'DOWN_PAYMENT', header: '超過基準金額', visible: true, align: 'right' },
    {
      field: 'CALC_SOURCE',
      header: '是否是活動',
      visible: true,
      align: 'left',
      format: (value: string | null) => {
        if (value === null || value === undefined || value === '') return '';
        return value === '0' ? '否' : value === '1' ? '是' : value;
      },
    },
    { field: 'CAP_BaseRate', header: '分攤比率', visible: true, align: 'right' },
    { field: 'AccNo', header: '會計科目代碼', visible: true, align: 'left' },
    { field: 'AccCName', header: '會計科目名稱', visible: true, align: 'left' },
    {
      field: 'GUI_FLAG',
      header: '是否開立發票',
      visible: true,
      align: 'left',
      format: (value: any) => this.getLabelFromOptions(value, this.guiFlagOptions),
      exportFormat: this.guiFlagOptions.map((o) => ({ [o.value]: o.label })),
    },
    {
      field: 'CAP_TaxType',
      header: '課稅別',
      visible: true,
      align: 'left',
      format: (value: any) => this.getLabelFromOptions(value, this.taxTypeOptions),
      exportFormat: this.taxTypeOptions.map((o) => ({ [o.value]: o.label })),
    },
    {
      field: 'IsCommonlyUsed',
      header: '是否常用',
      visible: true,
      align: 'left',
      format: (value: any) =>
        this.getLabelFromOptions(value, this.isCommonlyUsedOptions),
      exportFormat: this.isCommonlyUsedOptions.map((o) => ({
        [o.value]: o.label,
      })),
    },
    { field: 'Print_Area', header: '扣款項目合約列印區分', visible: true, align: 'left' },
    { field: 'CAP_Remark', header: '備註', visible: true, align: 'left' },
  ];

  constructor(
    private tls11020Service: TLS11020Service,
    private readonly dropdownApiService: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'TLS11020',
      'tls/tls11020cru',
      this.queryForm,
      (f) => this.onSubmit(f)
    );

    this.dropdownApiService.querySys1000({ SYS_Type: 'CAP_SALETYPE' }).subscribe((data) => {
      this.capSaletypeOptions = (data ?? []).map((x: any) => ({ label: x.Name, value: x.No }));
    });
    this.dropdownApiService.querySys1000({ SYS_Type: 'EDC_Bank' }).subscribe((data) => {
      this.edcBankOptions = (data ?? []).map((x: any) => ({ label: x.Name, value: x.No }));
    });
    this.dropdownApiService.querySys1000({ SYS_Type: 'instms_type' }).subscribe((data) => {
      this.instmsTypeOptions = (data ?? []).map((x: any) => ({ label: x.Name, value: x.No }));
    });
    this.dropdownApiService.querySys1000({ SYS_Type: 'pay_no' }).subscribe((data) => {
      this.payNoOptions = (data ?? []).map((x: any) => ({ label: x.Name, value: x.No }));
    });
    this.dropdownApiService.queryPos1006().subscribe((data) => {
      this.payNoVoucherOptions = (data ?? [])
        .filter(x => x.PAY_Type === '6' || x.PAY_Type === 'F')
        .map(x => ({ label: x.Name, value: x.No }));
    });
    this.dropdownApiService.querySys1000({ SYS_Type: 'CALC_TYPE' }).subscribe((data) => {
      this.calcTypeOptions = (data ?? []).map((x: any) => ({ label: x.Name, value: x.No }));
    });

    // 會計科目下拉（若你 table 需要 exportFormat 對照）
    this.dropdownApiService.queryGls1005().subscribe((data) => {
      this.accountOptions = (data ?? []).map((x: any) => ({
        label: x.Name,
        formLabel: `${x.No} - ${x.Name}`,
        value: x.No,
      }));

      const mapAcc = this.accountOptions.map((o: any) => ({
        [String(o.value)]: String(o.label),
      }));

      // 如果你欄位是 AccNo / AccCName 之類，依你實際欄位調整
      this.columns = this.columns.map((c) =>
        c.field === 'AccNo' ? { ...c, exportFormat: mapAcc } : c
      );
    });
  }

  /** 給 API 用的 payload 轉換 */
  private buildApiPayload(formValue: any): any {
    const payload: any = { ...formValue };

    // 空字串 -> null
    if (payload.CAP_Item === '') payload.CAP_Item = null;
    if (payload.CAP_Name === '') payload.CAP_Name = null;
    if (payload.CAP_BaseRate === '') payload.CAP_BaseRate = null;
    if (payload.CAP_Remark === '') payload.CAP_Remark = null;
    // MultiSelect：統一轉成代碼陣列
    const toCodeArray = (arr: any[]): string[] =>
      (arr || [])
        .map((x: any) => {
          if (x == null) return '';
          if (typeof x === 'string' || typeof x === 'number') return String(x);
          if (typeof x === 'object' && 'value' in x) return String(x.value);
          return '';
        })
        .filter((v) => v !== '');

    if (Array.isArray(payload.CAP_Type)) {
      payload.CAP_Type = toCodeArray(payload.CAP_Type);
    }
    // 單選語意：只有選 1 個才有意義，0 個或全選皆視為不篩選
    const toSingleOrNull = (arr: any[]): string | null => {
      const codes = toCodeArray(arr);
      return codes.length === 1 ? codes[0] : null;
    };

    payload.GUI_FLAG = toSingleOrNull(payload.GUI_FLAG);
    payload.IsCommonlyUsed = toSingleOrNull(payload.IsCommonlyUsed);

    if (Array.isArray(payload.AccNo)) {
      payload.AccNo = toCodeArray(payload.AccNo);
    }

    return payload;
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const raw = form.getRawValue();
      const payload = this.buildApiPayload(raw);

      this.lastQueryBody = { ...payload };
      this.tls11020Service.queryTLS11020(payload).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe({
        next: (res: any) => {
          if (res.Status === '0000') {
            this.data = res?.Data || [];
            this.totalRecords = res?.TotalCount || this.data.length;
            this.queryStateService.setQueryState(this.ProgNo, raw);
          }
        },
      });
    });
  }

  onDelete(selectedItems: any[]) {
    if (!selectedItems?.length) return;

    const idList = selectedItems
      .filter(item => item && item.id != null)
      .map(item => item.id);

    if (idList.length === 0) {
      this.messageService.warnBubble('未找到有效的刪除項目');
      return;
    }

    this.messageService.confirm({
      message: '是否確認刪除所選扣款項目資料?',
      header: '確認刪除',
      accept: () => {
        this.loading = true;
        this.tls11020Service.deleteTLS11020(idList).subscribe({
          next: (response: any) => {
            if (response?.Status === '0000') {
              this.messageService.successBubble('刪除成功');
              this.selectedItems = [];
              this.onSubmit(this.queryForm);
            } else {
              this.messageService.errorBubble(`刪除失敗: ${response?.Message}`);
            }
          },
          error: () => {
            this.messageService.errorBubble('刪除失敗');
          },
          complete: () => {
            this.loading = false;
          },
        });
      }
    });
  }

  getLabelFromOptions(value: any, options: any[]): string {
    return options.find((opt) => String(opt.value) === String(value))?.label ?? String(value ?? '');
  }
}
