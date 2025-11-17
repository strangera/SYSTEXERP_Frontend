
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { createPaginationConfig, formatDateToYYYY_MM_DD } from '@shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonModule } from 'primeng/button';
import { NgStyle, NgIf } from '@angular/common';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { DropDownListService, IDropdownItem } from 'src/app/service/utility/dropDownList.service';
import { Fin54025Service } from '@service/api/fin/fin54025.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-fin54025',
  templateUrl: './fin54025.component.html',
  styleUrl: './fin54025.component.scss',
  standalone: true,
  imports: [DropdownComponent, NgStyle,
    NgIf, ButtonModule, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberRangeComponent, CalendarRangeComponent, ButtonComponent, TableComponent, TranslateModule]
})

export class FIN54025Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    VouDateFrom: [new Date(), [Validators.required]],
    VouDateTo: [new Date(), [Validators.required]],
    VouNoFrom: ['', [Validators.maxLength(12)]],
    VouNoTo: ['', [Validators.maxLength(12)]],
    VoucherType: [''],
    ...createPaginationConfig([{ field: 'VouNo', order: 1 }]),
  });
  selectedItems: any[] = [];
  totalRecords = 0;
  data: any[] = [];
  btnLoading = false;
  selectAll = false;
  get selectedCount(): number {
    return this.selectedItems?.length ?? 0;
  }
  columns: any[] = [
    { field: 'VouNo', header: '傳票號碼', visible: true },
    { field: 'Voucher_Name', header: '傳票種類', visible: true },
    { field: 'VouDate', header: '傳票日期', visible: true },
    { field: 'VouStatus', header: '傳票狀態', visible: true },
    { field: 'Remark', header: '傳票摘要', visible: true },
    { field: 'VoucherType', header: '傳票型態', visible: true },
    { field: 'AccAmt', header: '傳票金額', visible: true },
    { field: 'DetailCount', header: '明細筆數', visible: true },
  ];

  Subpoenastatus: IDropdownItem[] = [];

  constructor(
    private dropDownListService: DropDownListService,
    private fin54025Service: Fin54025Service
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN54025', '/FIN/FIN54025CRU', this.queryForm, (frm) => this.onSubmit(frm));
    this.dropDownListService.queryGLS1010_DropDownList().subscribe((res) => {
      this.Subpoenastatus = res.Data;
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
      VouDateFrom: v.VouDateFrom ? formatDateToYYYY_MM_DD(v.VouDateFrom) : '',
      VouDateTo: v.VouDateTo ? formatDateToYYYY_MM_DD(v.VouDateTo) : '',
      VouNoFrom: v.VouNoFrom?.trim() || '',
      VouNoTo: v.VouNoTo?.trim() || '',
      VoucherType: v.VoucherType?.trim() || '',
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
            this.onSubmit(this.queryForm); // 反過帳後重新查詢
          } else {
            this.messageService.errorBubble(res.Message || '反過帳失敗');
          }
        },
        error: () => this.messageService.errorBubble('系統錯誤'),
      });
  }
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const v = frm.value;
      const payload = {
        ...v,
        VouDateFrom: v.VouDateFrom ? formatDateToYYYY_MM_DD(v.VouDateFrom) : '',
        VouDateTo: v.VouDateTo ? formatDateToYYYY_MM_DD(v.VouDateTo) : '',
        VouNoFrom: v.VouNoFrom?.trim() || '',
        VouNoTo: v.VouNoTo?.trim() || '',
        VoucherType: v.VoucherType?.trim() || '',
      };

      this.fin54025Service
        .queryFIN54025(payload)
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

}
