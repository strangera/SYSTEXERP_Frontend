import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { IDropdownItem } from '@service/utility/dropDownList.service';
import { MultiSelectComponent } from '@shared/componentkit';
import { ITLS27050Data, TLS27050Service } from '@service/api/tls/tls27050.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls27050',
  templateUrl: './tls27050.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, MultiSelectComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class TLS27050Component extends BasicQueryPageComponent<ITLS27050Data> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_Date: [null, [Validators.required]], // 銷售日期
    PAY_TypeList: [], // 支付工具別
    ...createPaginationConfig([{ field: 'id', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  pos1006DropDownList: IDropdownItem[] = [
    { No: '1', Name: '現金' },
    { No: '0', Name: '信用卡' },
  ];
  data: ITLS27050Data[] = [];
  columns: Column[] = [
    { field: 'PAY_NO', header: '付款別編號' },
    { field: 'PAY_Name', header: '付款別名稱' },
    { field: 'TLT_NO', header: '專櫃編號' },
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'ACT_PayAmt', header: '金額' }, // 實際金額(來自相關對帳檔)
  ];
  constructor(
    private readonly tls27050Service: TLS27050Service,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS27050', 'TLS/TLS27050cru', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls27050Service.queryTLS27050(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
      });
    });
  }
}
