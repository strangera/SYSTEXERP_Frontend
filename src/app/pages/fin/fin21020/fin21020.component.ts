import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { Fin21020Service, IFin21020Data, IQueryFin21020Request } from '@service/api/fin/fin21020.service';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';

// 1.2.1.2 費率對照維護
@Component({
  selector: 'app-fin21020',
  templateUrl: './fin21020.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputNumberRangeComponent, TableComponent, TranslateModule]
})
export class FIN21020Component extends BasicQueryPageComponent<IFin21020Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    BNK_No: [null], // 公司銀行科目代號
    Remit_BAmount_Start: [null as number | null, [Validators.max(9999999999)]], // 金額下限 - 轉帳最低金額(起)
    Remit_BAmount_End: [null as number | null, [Validators.max(9999999999)]], // 金額下限 - 轉帳最低金額(迄)
    Remit_UAmount_Start: [null as number | null, [Validators.max(9999999999)]], // 金額上限 - 轉帳最高金額(起)
    Remit_UAmount_End: [null as number | null, [Validators.max(9999999999)]], // 金額上限 - 轉帳最高金額(迄)
    Remit_Fee: [null as number | null, [Validators.max(999999)]], // 廠商負擔電匯手續費
    Comp_Remit_Fee: [null as number | null, [Validators.max(999999)]], // 公司負擔電匯手續費
    Cash_Back_Amt: [null as number | null, [Validators.max(999999)]], // 廠商負擔電匯手續費回饋收入
    ...createPaginationConfig([{ field: 'BNK_No', order: 1 }, { field: 'id', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  data: IFin21020Data[] = [];
  columns: Column[] = [
    { field: 'BNK_No', header: '公司銀行科目代號' },
    { field: 'Remit_BAmount', header: '金額下限', format: formatAmount },
    { field: 'Remit_UAmount', header: '金額上限', format: formatAmount },
    { field: 'Remit_Fee', header: '廠商負擔電匯手續費', format: formatAmount },
    { field: 'Comp_Remit_Fee', header: '公司負擔電匯手續費', format: formatAmount },
    { field: 'Cash_Back_Amt', header: '廠商負擔電匯手續費回饋收入', format: formatAmount },
  ];
  bankCodeOptions: IDropdownItem[] = [];

  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly fin21020Service: Fin21020Service, // 注入新的 service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN21020', 'fin/fin21020cru', this.queryForm, (form) => this.fin21020Service.queryFIN21020(form as IQueryFin21020Request));
    this.dropDownListService.queryGLS1005For1103_DropDownList().pipe(untilDestroyed(this)).subscribe(data => {
      this.bankCodeOptions = data.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin21020Service.queryFIN21020(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      })
    });
  }
}
