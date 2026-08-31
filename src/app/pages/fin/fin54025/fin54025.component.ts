import { Location, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin54025Service } from '@service/api/fin/fin54025.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { createPaginationConfig, formatAmount, formatDateToYYYY_MM_DD } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { DropDownListService, IDropdownItem } from 'src/app/service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { InputNumberRangeComponent } from '../../../shared/components/input-number-range/input-number-range.component';
import { Fin29060TableSubheaderComponent } from '../fin55040/fin29060-table-subheader/fin29060-table-subheader.component';

@Component({
  selector: 'app-fin54025',
  templateUrl: './fin54025.component.html',
  standalone: true,
  imports: [DropdownComponent, NgStyle,
    ButtonModule, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberRangeComponent, CalendarRangeComponent, ButtonComponent, Fin29060TableSubheaderComponent, TranslateModule]
})

export class FIN54025Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    VouDateFrom: [null as Date | null],
    VouDateTo: [null as Date | null],
    VouNoFrom: [null, [Validators.maxLength(12)]],
    VouNoTo: [null, [Validators.maxLength(12)]],
    VoucherType: [''],
    ...createPaginationConfig([{ field: 'VouNo', order: 1 }]),
    PageSize: [30],
  });
  selectedItems: any[] = [];
  totalRecords = 0;
  data: any[] = [];
  btnLoading = false;
  lazyBatchSize = 30;
  lastQueryBody: any = null;
  selectAll = false;
  get selectedCount(): number {
    return this.selectedItems?.length ?? 0;
  }
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

  Subpoenastatus: IDropdownItem[] = [];

  constructor(
    private dropDownListService: DropDownListService,
    public readonly fin54025Service: Fin54025Service,
    private readonly location: Location,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN54025', '/FIN/FIN54025CRU', this.queryForm, (frm) => this.onSubmit(frm));
    this.dropDownListService.queryGLS1010_DropDownList().subscribe((res) => {
      this.Subpoenastatus = (res?.Data || []).map((item: any) => ({
        ...item,
        DisplayName: `${item.No}-${item.Name}`,
      }));
    });
  }
  /** 點擊「過帳」 */
  onReview(selectedItems: any[]): void {
    if (!selectedItems || selectedItems.length === 0) {
      this.messageService.warnBubble('請先勾選要反過帳的項目');
      return;
    }

    const v = this.queryForm.value;

    // 準備共用欄位
    const commonPart = {
      VouDateFrom: v.VouDateFrom ? formatDateToYYYY_MM_DD(v.VouDateFrom) : null,
      VouDateTo: v.VouDateTo ? formatDateToYYYY_MM_DD(v.VouDateTo) : null,
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
    this.fin54025Service
      .updateFIN54025(payload)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            this.messageService.successBubble('反過帳成功');
            this.selectedItems = [];
            this.selectAll = false;
            this.onSubmit(this.queryForm); // 反過帳後重新查詢
          } else {
            this.messageService.errorBubble(res.Message || '反過帳失敗');
          }
        },
      });
  }
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const v = frm.value;
      const fromDate = v.VouDateFrom ? new Date(v.VouDateFrom) : null;
      const toDate = v.VouDateTo ? new Date(v.VouDateTo) : null;
      const basePayload = {
        VouDateFrom: fromDate ? new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0) : null,
        VouDateTo: toDate ? new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59) : null,
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

      this.fin54025Service
        .queryFIN54025(this.lastQueryBody)
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

  onDetailWithColValue(event: { row: any; col: any; value: any }) {
    if (event.col.field === 'VouNo') {
      const vouNo = event.row?.VouNo;
      const handoff = {
        vouNo,
        fromRoute: globalThis.location.pathname,
        ts: Date.now(),
      };
      localStorage.setItem('FIN55050_CRU_HANDOFF', JSON.stringify(handoff));
      localStorage.setItem('FIN55050_CRU_PROGNO', 'FIN55050');
      const externalUrl = this.location.prepareExternalUrl('/account/fin/fin55050cru');
      const finalUrl = `${globalThis.location.origin}${externalUrl}`;
      globalThis.open(finalUrl, '_blank', 'noopener');
    }
  }

}
