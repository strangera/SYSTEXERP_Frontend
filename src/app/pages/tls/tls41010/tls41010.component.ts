import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { TLS41010Service, QueryTLS41010Request, TLS41010Data } from '../../../service/api/tls/tls41010.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls41010',
  templateUrl: './tls41010.component.html',
})
export class TLS41010Component extends BasicQueryPageComponent<TLS41010Data> implements OnInit {
  queryForm = this.formBuilder.group({
    ECR_No: ['', [Validators.maxLength(10)]],      // 收銀機號
    ECR_Name: ['', [Validators.maxLength(20)]],
    ECR_TLT_No: ['', [Validators.maxLength(20)]],
    ECR_TLT_Name: ['', [Validators.maxLength(60)]],
    ECR_ActiveDateStart: [null],
    ECR_ActiveDateEnd: [null],
    ECR_CloseDateStart: [null],
    ECR_CloseDateEnd: [null],
    ECR_Status: [[]],
    ECR_AreaNo: ['', [Validators.maxLength(6)]],
    ECR_SubGroup: ['', [Validators.maxLength(20)]],
    ECR_LocNo: ['', [Validators.maxLength(10)]],
    ECR_Type: ['', [Validators.maxLength(2)]],
    ECR_SAL_Type: ['', [Validators.maxLength(8)]],
    ECR_GUI_Type: ['', [Validators.maxLength(2)]],
    ECR_USR_No: ['', [Validators.maxLength(8)]],
    ECR_USR_Name: ['', [Validators.maxLength(20)]],
    ECR_ComName: ['', [Validators.maxLength(64)]],
    ECR_IP: ['', [Validators.maxLength(20)]],
    ECR_SrvIP: ['', [Validators.maxLength(20)]],
    ECR_TmplNo: ['', [Validators.maxLength(8)]],
    ...createPaginationConfig([{ field: '', order: 1 }]),
  });

  data: TLS41010Data[] = [];
  selectedItems: TLS41010Data[] = [];
  totalRecords = 0;
  columns = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'ECR_Name', header: '收銀機名稱', visible: true },
    { field: 'ECR_TLT_No', header: '所屬專櫃編號', visible: true },
    { field: 'ECR_TLT_Name', header: '所屬專櫃名稱', visible: true },
    { field: 'ECR_Status', header: '狀態', visible: true },
    { field: 'ECR_ActiveDate', header: '啟用日期', visible: true },
    { field: 'ECR_CloseDate', header: '停用日期', visible: true },
    { field: 'ECR_IP', header: '網路IP', visible: true },
    { field: 'ECR_SrvIP', header: '後台主機IP', visible: true },
  ];

  constructor(private tls41010Service: TLS41010Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS41010', 'TLS/TLS41010CRU', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const value = frm.value;
      const body: QueryTLS41010Request = {
        ...value,
        PageSize: value.PageSize ?? 10,
        PageIndex: value.PageIndex ?? 1,
        SortBy: value.SortBy ?? [],
      };

      this.loading = true;
      this.tls41010Service.queryTLS41010(body).subscribe((res) => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.loading = false;
      });
    });
  }

  onDelete(data: TLS41010Data): void {
    // 可實作批次刪除或單筆刪除功能
  }
}
