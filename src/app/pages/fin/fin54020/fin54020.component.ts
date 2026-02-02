import { Location, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { formatAmount } from '@shared/componentkit/table-report/table-report.model';
import { createPaginationConfig } from '@shared/componentkit/table2/table2.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { Fin54020Service } from 'src/app/service/api/fin/fin54020.service';
import { DropDownListService, IDropdownItem } from 'src/app/service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { formatDateToYYYY_MM_DD } from '../../../shared/componentkit/table/table.model';
import { Fin29060TableSubheaderComponent } from '../fin29060/fin29060-table-subheader/fin29060-table-subheader.component';

@Component({
  selector: 'app-fin54020',
  templateUrl: './fin54020.component.html',
  styleUrl: './fin54020.component.scss',
  standalone: true,
  imports: [
    NgStyle,
    NgIf,
    ButtonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputTextComponent,
    InputNumberRangeComponent,
    DropdownComponent,
    CalendarRangeComponent,
    TranslateModule,
    Fin29060TableSubheaderComponent,
  ],
})
export class FIN54020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    VouDateFrom: [new Date(), [Validators.required]],
    VouDateTo: [new Date(), [Validators.required]],
    VouNoFrom: [null, [Validators.maxLength(12)]],
    VouNoTo: [null, [Validators.maxLength(12)]],
    VoucherType: [''],
    ...createPaginationConfig([{ field: 'VouNo', order: 1 }]),
  });

  Subpoenastatus: IDropdownItem[] = [];
  totalRecords = 0;
  data: any[] = [];
  selectedItems: any[] = [];
  selectAll = false;
  btnLoading = false;
  lazyBatchSize = 20;
  lastQueryBody: any = null;

  columns: any[] = [
    { field: 'VouNo', header: '傳票號碼', visible: true, type: 'detail' },
    { field: 'Voucher_Name', header: '傳票種類', visible: true },
    { field: 'VouDate', header: '傳票日期', visible: true },
    { field: 'VouStatus', header: '傳票狀態', visible: true },
    { field: 'Remark', header: '傳票摘要', visible: true },
    { field: 'VoucherType', header: '傳票型態', visible: true },
    { field: 'VoucherTypeName', header: '傳票型態名稱', visible: true },
    { field: 'AccAmt', header: '傳票金額', visible: true, format: formatAmount, style: 'text-right' },
    { field: 'DetailCount', header: '明細筆數', visible: true },
  ];

  get selectedCount(): number {
    return this.selectedItems?.length ?? 0;
  }

  constructor(
    private dropDownListService: DropDownListService,
    private readonly location: Location,
    public readonly fin54020Service: Fin54020Service,

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN54020', '/FIN/FIN54020CRU', this.queryForm, (frm) => this.onSubmit(frm));
    this.dropDownListService.queryGLS1010_DropDownList().subscribe((res) => {
      this.Subpoenastatus = (res?.Data || []).map((item: any) => ({
        ...item,
        DisplayName: `${item.No}-${item.Name}`,
      }));
    });
  }

  onDetailWithColValue(event: { row: any; col: any; value: any }) {
    if (event.col.field === 'VouNo') {
      const vouNo = event.row?.VouNo;
      const handoff = {
        vouNo,
        fromRoute: window.location.pathname,
        ts: Date.now(),
      };
      localStorage.setItem('FIN55050_CRU_HANDOFF', JSON.stringify(handoff));
      localStorage.setItem('FIN55050_CRU_PROGNO', 'FIN55050');
      const externalUrl = this.location.prepareExternalUrl('/account/fin/fin55050cru');
      const finalUrl = `${window.location.origin}${externalUrl}`;
      window.open(finalUrl, '_blank', 'noopener');
    }
  }

  /** 查詢 */
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const v = frm.value;
      const basePayload = {
        VouDateFrom: v.VouDateFrom,
        VouDateTo: v.VouDateTo,
        VouNoFrom: (v.VouNoFrom ?? '').toString().trim(),
        VouNoTo: (v.VouNoTo ?? '').toString().trim(),
        VoucherType: (v.VoucherType ?? '').toString().trim(),
        SortBy: v.SortBy,
      };

      const pageSize = this.lazyBatchSize;
      this.lastQueryBody = {
        ...basePayload,
        pageIndex: 1,
        pageSize,
      };

      this.fin54020Service
        .queryFIN54020(this.lastQueryBody)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            if (res.Status === '0000') {
              this.data = res.Data || [];
              this.totalRecords = res.TotalCount || this.data.length;
            } else {
              this.messageService.errorBubble(res.Message || '查詢失敗');
            }
          },
        });
    });
  }

  /** 點擊「過帳」 */
  onReview(selectedItems: any[]): void {
    if (!selectedItems || selectedItems.length === 0) {
      this.messageService.warnBubble('請先勾選要過帳的項目');
      return;
    }

    const v = this.queryForm.value;

    // 準備共用欄位
    const commonPart = {
      VouDateFrom: v.VouDateFrom ? formatDateToYYYY_MM_DD(v.VouDateFrom) : '',
      VouDateTo: v.VouDateTo ? formatDateToYYYY_MM_DD(v.VouDateTo) : '',
      VouNoFrom: (v.VouNoFrom ?? '').toString().trim(),
      VouNoTo: (v.VouNoTo ?? '').toString().trim(),
      VoucherType: (v.VoucherType ?? '').toString().trim(),
    };

    // 判斷是否為全選
    const payload = {
      SelectAll: this.selectAll,
      ...commonPart,
      VouNoList: this.selectAll
        ? [] // 全選時不用傳 List
        : selectedItems.map((item) => item.VouNo), // 部分選擇時傳 VouNo 清單
    };

    console.log('Update payload:', payload);

    this.btnLoading = true;
    this.fin54020Service
      .updateFIN54020(payload)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            this.messageService.successBubble('過帳成功');
            // 成功後清空勾選與全選狀態，避免後續筆數維持亮燈
            this.selectedItems = [];
            this.selectAll = false;
            this.onSubmit(this.queryForm); // 過帳後重新查詢
          } else {
            this.messageService.errorBubble(res.Message || '過帳失敗');
          }
        },

      });
  }
}
