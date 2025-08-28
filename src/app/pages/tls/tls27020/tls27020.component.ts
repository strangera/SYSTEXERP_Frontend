import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS27020Data, TLS27020Service } from '@service/api/tls/tls27020.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';

@Component({
  selector: 'app-tls27020',
  templateUrl: './tls27020.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, InputNumberComponent, TableComponent, TranslateModule, MultiSelectComponent]
})
export class TLS27020Component extends BasicQueryPageComponent<TLS27020Data> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_Date: [null],  // 銷售日期
    TLT_NOList: [null], // 專櫃編號
    ECR_NoList: [null],       // 收銀機號
    ACT_PayAmt: [null, [Validators.max(99999999)]],
    ...createPaginationConfig([{ field: 'id', order: 1 }]),
  });
  totalRecords = 0;
  data: TLS27020Data[] = [];
  columns: Column[] = [
    { field: 'TXN_Date', header: '交易日期', format: formatDate },
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'TLT_NO', header: '專櫃編號' },
    { field: 'ACT_PayAmt_ori', header: '實收金額', format: formatAmount },
    { field: 'crt_usr_name', header: '建立人員姓名' }
  ];
  ECR_NoOptions: { No: string, Name: string, label: string; }[] = [];
  TLTTALENT_DropDownList: { No: string, Name: string, label: string; }[] = [];
  constructor(
    private readonly dropDownList: DropDownListService,
    private readonly tls27020Service: TLS27020Service
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS27020', 'TLS/TLS27020cru', this.queryForm, (form) => this.onSubmit(form));
    this.dropDownList.queryPOS1002_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.ECR_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
    this.dropDownList.queryTLTTALENT_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.TLTTALENT_DropDownList = res.Data.map(item => ({
        ...item, label: `${item.No} - ${item.Name}`
      }));
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls27020Service.queryTLS27020(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
      });
    });
  }
}
