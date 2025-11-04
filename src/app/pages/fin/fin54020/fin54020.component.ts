import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { formatDateToYYYY_MM_DD } from '../../../shared/componentkit/table/table.model';
import { createPaginationConfig } from '@shared/componentkit/table2/table2.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropDownListService, IDropdownItem } from 'src/app/service/utility/dropDownList.service';
import { Fin54020Service } from 'src/app/service/api/fin/fin54020.service';
import { ButtonModule } from 'primeng/button';
import { NgStyle, NgIf } from '@angular/common';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-fin54020',
  templateUrl: './fin54020.component.html',
  styleUrl: './fin54020.component.scss',
  standalone: true,
  imports:
    [NgStyle,
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
      TableComponent
    ],
})

export class FIN54020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    VouDateFrom: [new Date(), [Validators.required]],
    VouDateTo: [new Date(), [Validators.required]],
    VouNoFrom: ['', [Validators.maxLength(12)]],
    VouNoTo: ['', [Validators.maxLength(12)]],
    VoucherType: [''],
    ...createPaginationConfig([{ field: 'VouNo', order: 1 }]),
  });

  Subpoenastatus: IDropdownItem[] = [];
  actionLoadingId: string | number | null = null;
  selectedItems: any[] = [];
  totalRecords = 0;
  data: any[] = [];
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
  get selectedCount(): number {
    return this.selectedItems?.length ?? 0;
  }
  constructor(
    private dropDownListService: DropDownListService,
    private fin54020Service: Fin54020Service
  ) {
    super(); // 呼叫父類建構子
  }


  ngOnInit(): void {
    this.initializePage('FIN54020', '/FIN/FIN54020CRU', this.queryForm, (frm) => this.onSubmit(frm));
    this.dropDownListService.queryGLS1010_DropDownList().subscribe(res => {
      this.Subpoenastatus = res.Data;
    });

  }
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const v = frm.value;
      console.log('我的表單:', v);

      const payload = {
        ...v,
        VouDateFrom: v.VouDateFrom ? formatDateToYYYY_MM_DD(v.VouDateFrom) : '',
        VouDateTo: v.VouDateTo ? formatDateToYYYY_MM_DD(v.VouDateTo) : '',
        VouNoFrom: v.VouNoFrom?.trim() || '',
        VouNoTo: v.VouNoTo?.trim() || '',
        VoucherType: v.VoucherType?.trim() || '',
      };

      console.log('我擅自改變的樣子:', payload);



      this.fin54020Service.queryFIN54020(payload).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe({
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
  onReview(selectedItems: any[]): void {
    if (!selectedItems || selectedItems.length === 0) {
      this.messageService.warnBubble('請先勾選要審核的項目');
      return;
    }

    // // 依照 API 格式，包成 selectList
    // const payload = {
    //   PAY_Type: this.PAY_Type,
    //   selectList: selectedItems.map(item => ({
    //     ID: item.ID,
    //     PAY_NO: item.PAY_NO,
    //   }))
    // };
    // this.loading = true;
    // this.tls2a010Service.updateTLS2A010(payload).subscribe({
    //   next: () => {
    //     this.messageService.successBubble('審核完成');
    //     this.onSubmit(this.queryForm);
    //     this.loading = false;
    //   },
    // });
  }

}
