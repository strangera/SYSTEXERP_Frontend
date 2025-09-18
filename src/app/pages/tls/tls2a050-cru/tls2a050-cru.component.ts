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
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { Column, formatAmount } from '@shared/componentkit/table/table.model';
import { ButtonModule } from 'primeng/button';
import { Tls2A050Service } from 'src/app/service/api/tls/tls2a050.service';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-tls2a050-cru',
  templateUrl: './tls2a050-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
    TableModule,
    CommonModule,
    TagModule
  ],
})
export class TLS2A050CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm!: FormGroup;

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];
  detailData: any[] = [];

  columns: Column[] = [
    { field: 'PAY_Name', header: '付款別', visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    {
      field: 'BOOK_PayAmt',
      header: '系統金額',
      visible: true,
      format: formatAmount,
    },
    {
      field: 'ACT_PayAmt',
      header: '實收金額',
      visible: true,
      format: formatAmount,
    },
    {
      field: 'OVER_PayAmt',
      header: '帳差',
      visible: true,
      format: formatAmount,
    },
  ];

  constructor(
    private fb: FormBuilder,
    private tls2A050Service: Tls2A050Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.dataForm = this.fb.group({});
    this.initializePage('TLS2A050', this.dataForm);

    const state = history.state;
    const TXN_Date = state?.crudstatus?.TXN_Date;

    if (TXN_Date) {
      const payload = {
        PageSize: 0,
        PageIndex: 0,
        OrderBy: "TXN_Date",
        Offset: 0,
        SortBy: [],
        TXN_Date: TXN_Date,
        POS_TypeList: [],
        VOU_CheckList: []
      };

      this.tls2A050Service.queryTLS22050(payload).subscribe({
        next: (res) => {
          if (res.Status === '0000' || res.Status === 0) {
            this.detailData = [];

            (res.Data || []).forEach((group: any) => {
              // push 明細列
              (group._DetailList || []).forEach((d: any) => {
                this.detailData.push({
                  ...d,
                  PAY_Name: group.PAY_Name,
                  isDetail: true
                });
              });

              // push 小計列
              this.detailData.push({
                PAY_Name: group.PAY_Name,
                isTotal: true,
                BOOK_PayAmt: group.BOOK_PayCnt_Sum ?? 0,
                ACT_PayAmt: group.ACT_PayAmt_Sum ?? 0,
                OVER_PayAmt: group.OVER_PayAmt_Sum ?? 0
              });
            });

            console.log('展平後 detailData:', this.detailData);
          } else {
            this.messageService.errorBubble(`查詢失敗: ${res.Message}`);
          }
        },
        error: (err) => {
          console.error('API 錯誤:', err);
        }
      });
    }
  }
}
