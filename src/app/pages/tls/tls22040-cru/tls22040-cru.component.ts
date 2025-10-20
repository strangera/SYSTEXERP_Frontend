/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { Tls22040Service } from '../../../service/api/tls/tls22040.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { Column } from '@shared/componentkit/table/table.model';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-tls22040-cru',
  templateUrl: './tls22040-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    TableComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
  ],
})
export class TLS22040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm!: FormGroup;

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];

  columns: Column[] = [
    { field: 'TXN_Date', header: '銷售日期' },
    { field: 'MIG_Type', header: '發票類別代碼' },
    { field: 'MIG_Type_Name', header: '發票類別名稱' },
    { field: 'ECR_No', header: '機台編號' },
    { field: 'TXN_No', header: '交易序號' },
    { field: 'TXN_GUINo', header: '發票號碼' },
  ];

  constructor(
    private fb: FormBuilder,
    private tls22040Service: Tls22040Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.dataForm = this.fb.group({});
    this.initializePage('TLS22040', this.dataForm);

    const stateData = history.state as any;
    console.log('CRU 收到的 stateData:', stateData.rowdata.details);

    if (stateData.rowdata?.details) {

      this.data = stateData.rowdata.details.map((item: any, index: number) => ({
        ...item,
        id: index + 1
      }));
      this.totalRecords = this.data.length;
    }
    console.log('CRU data details:', this.data);
  }
  onReview(rows: any[]): void {
    if (!rows || rows.length === 0) {
      this.messageService.warnBubble('沒有資料可重送');
      return;
    }

    this.loading = true;
    // 貓貓版本
    // const uniqueRows = rows.filter(
    //   (item, index, self) =>
    //     index === self.findIndex(
    //       t => t.TXN_No === item.TXN_No && t.MIG_Type === item.MIG_Type
    //     )
    // );

    // const payload = {
    //   crtMigs: uniqueRows.map(item => ({
    //     STO_No: this.authService.currentUserValue?.SYS_StoreNo ?? '',
    //     ECR_No: item.ECR_No ?? '',
    //     TXN_Date: item.TXN_Date ? item.TXN_Date.replace(/-/g, '/') : '',
    //     TXN_No: item.TXN_No ?? '',
    //     MIG_Type: item.MIG_Type ?? ''
    //   }))
    // };
    const payload = {
      crtMigs: rows.map(item => ({
        STO_No: this.authService.currentUserValue?.SYS_StoreNo ?? '',
        ECR_No: item.ECR_No ?? '',
        TXN_Date: item.TXN_Date ? item.TXN_Date.replace(/-/g, '/') : '',
        TXN_No: item.TXN_No ?? '',
        MIG_Type: item.MIG_Type ?? ''
      }))
    }
    this.tls22040Service.callSpCrtMig(payload).subscribe({
      next: () => {
        this.messageService.successBubble('重送成功');
        this.loading = false;
      },
      error: (err) => {
        console.error('重送失敗:', err);
        this.messageService.errorBubble('重送失敗');
        this.loading = false;
      },
    });
  }



}
