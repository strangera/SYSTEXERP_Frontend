
import { NgIf, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DropDownListService } from 'src/app/service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
@Component({
  selector: 'app-cpm11080',
  templateUrl: './cpm11080.component.html',
  standalone: true,
  imports: [DropdownComponent, NgStyle,
    NgIf, ButtonModule, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, ButtonComponent, TableComponent, TranslateModule]
})

export class CPM11080Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    VouDateFrom: [new Date(), [Validators.required]],
    VouDateTo: [new Date(), [Validators.required]],
    VouNoFrom: ['', [Validators.maxLength(12)]],
    VouNoTo: ['', [Validators.maxLength(12)]],
    VoucherType: [''],
    Subpoenastatus: [''],
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
    { field: 'VouNo', header: '類別', visible: true },
    { field: 'Voucher_Name', header: '失物類別', visible: true },
    { field: 'VouDate', header: '敘述', visible: true },
    { field: 'VouStatus', header: '紀錄編號', visible: true },
    { field: 'Remark', header: '登錄日期', visible: true },
    { field: 'VoucherType', header: '被尋人姓名', visible: true },
    { field: 'AccAmt', header: '被尋人稱謂', visible: true },
    { field: 'DetailCount', header: '集合地點', visible: true },
    { field: 'VoucherType', header: '被尋人姓名', visible: true },
    { field: 'AccAmt', header: '遺失者/拾獲者姓名', visible: true },
    { field: 'DetailCount', header: '已廣播', visible: true },
  ];

  SubpoenastatusOptions: any[] = [
    { No: 'L', Name: '遺失' },
    { No: 'F', Name: '拾獲' },
    { No: 'P', Name: '尋人' },
  ];



  constructor(
    private dropDownListService: DropDownListService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('CPM11080', '/CPM/CPM11080CRU', this.queryForm, (frm) => this.onSubmit(frm));

  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {


      // this.fin54025Service
      //   .queryFIN54025(payload)
      //   .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
      //   .subscribe({
      //     next: (res) => {
      //       if (res.Status === '0000') {
      //         this.data = res.Data || [];
      //         this.totalRecords = res.TotalCount || this.data.length;
      //       } else {
      //         this.messageService.errorBubble(res.Message || '查詢失敗');
      //       }
      //     },
      //   });
    });
  }

}
