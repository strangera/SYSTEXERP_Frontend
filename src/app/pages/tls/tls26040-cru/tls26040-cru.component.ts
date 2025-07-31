import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { TLS26040Data, TLS26040Data2, TLS26040Service } from '../../../service/api/tls/tls26040.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { NgIf } from '@angular/common';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { finalize } from 'rxjs';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';

@Component({
  selector: 'app-tls26040-cru',
  templateUrl: './tls26040-cru.component.html',
  styleUrl: './tls26040-cru.component.scss',
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    CalendarRangeComponent,
    TableComponent,
    CalendarComponent
  ]
})
export class TLS26040CRUComponent extends BasicCruPageComponent<TLS26040Data> implements OnInit {
  dataForm = this.formBuilder.group({
    preOrderDateFrom: ['', Validators.required],      // 預售日期(起)
    preOrderDateTo: ['', Validators.required],        // 預售日期(訖)
    transactionNo: [''],                               // 交易序號
    receivingMachineNo: [''],                         // 收銀機號
    counterCode: [''],                                // 專櫃編號
  });

  dataForm2 = this.formBuilder.group({
    checkoutDate: ['', Validators.required],          // 結帳日期
  });


  totalRecords = 0;
  data: TLS26040Data2[] = [];
  selectedItems: TLS26040Data2[] = [];

  columns: Column[] = [
    { field: 'preOrderDate', header: '預告日期', visible: true },
    { field: 'counterCode', header: '櫃別編號', visible: true },
    { field: 'receivingMachineNo', header: '收銀機號', visible: true },
    { field: 'transactionNo', header: '交易序號', visible: true },
    { field: 'amount', header: '業績金額', visible: true }
  ];

  constructor(
    private tls26040Service: TLS26040Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26040', this.dataForm);
  }

  onSubmit(frm: FormGroup): void {
    const request = {
      ...frm.value
    };
    this.handleSubmit(frm, () => {
      this.tls26040Service.queryTLS26040_2(request)
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
        });
    });
  }

  onCheckout(): void {
    // TODO: 更新資料
  }
}