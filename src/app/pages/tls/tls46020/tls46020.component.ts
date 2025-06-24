import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS46020Item, TLS46020Service } from '../../../service/api/tls/tls46020.service';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { finalize } from 'rxjs';

// 2.4.6.2  POS環境變數維護作業
@Component({
  selector: 'app-tls46020',
  templateUrl: './tls46020.component.html',
})
export class TLS46020Component extends BasicQueryPageComponent<TLS46020Item> implements OnInit {
  queryForm = this.formBuilder.group({
    ECR_TmplNo: ['', [Validators.maxLength(20)]], // 環境變數編號
    ECR_TmplBegDate: [null], // 環境變數啟用日期
    ECR_TmplEndDate: [null], // 環境變數截止日期
    ECR_TmplDesc: ['', [Validators.maxLength(20)]], // 環境變數備註
    ...createPaginationConfig([{ field: 'ECR_TmplNo', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  data: TLS46020Item[] = [];
  columns: Column[] = [
    { field: 'ECR_TmplNo', header: '模版編號', visible: true },
    { field: 'ECR_TmplDesc', header: '模版備註', visible: true },
    { field: 'ECR_TmplBegDate', header: '模版啟用日期', visible: true },
    { field: 'ECR_TmplEndDate', header: '模版截止日期', visible: true },
    { field: 'ECR_SernoType', header: '交易序號使用方式', visible: true },
    { field: 'ECR_GUI_Type', header: '發票使用類別', visible: true },
    { field: 'ECR_TimeTickInvl', header: '系統對時間隔(秒)', visible: true },
    { field: 'ECR_MaxQty', header: '單筆交易數量上限', visible: true },
    { field: 'ECR_MaxAmt', header: '單筆交易金額上限', visible: true },
    { field: 'ECR_MaxItemAmt', header: '單筆交易最大金額限制', visible: true },
    { field: 'ECR_MaxDisc', header: '單筆交易最大折扣比率限制', visible: true },
    { field: 'ECR_EdcTimeout', header: '信用卡刷卡機連線時限(秒)', visible: true },
    { field: 'ECR_EdcSettle', header: '信用卡刷卡機連動日結', visible: true },
  ];

  constructor(
    private tls46020Service: TLS46020Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS46020', '/TLS/TLS46020CRU', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls46020Service.queryTLS46020(frm.value).pipe(finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
}
