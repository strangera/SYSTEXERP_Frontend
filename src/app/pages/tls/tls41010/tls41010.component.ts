import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { TLS41010Service, TLS41010Data } from '../../../service/api/tls/tls41010.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { columns, guiTypeOptions, salTypeOptions, sernoTypeOptions, statusOptions, typeOptions } from './tls41010.model';
import { finalize } from 'rxjs';

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
    ECR_Status: [null],
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
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });
  statusOptions = statusOptions;
  typeOptions = typeOptions;
  guiTypeOptions = guiTypeOptions;
  salTypeOptions = salTypeOptions;
  sernoTypeOptions = sernoTypeOptions;

  data: TLS41010Data[] = [];
  selectedItems: TLS41010Data[] = [];
  totalRecords = 0;
  columns = columns;

  constructor(private tls41010Service: TLS41010Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS41010', 'TLS/TLS41010cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      this.tls41010Service.queryTLS41010(frm.value).pipe(finalize(() => this.loading = false)).subscribe((res) => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
      });
    });
  }


  onDelete(data: TLS41010Data | TLS41010Data[]): void {
    const deleteIds = Array.isArray(data) ? data.map((d) => d.id) : [data.id];
    if (deleteIds.length === 0) return;
    this.loading = true;
    this.tls41010Service.deleteTLS41010(deleteIds).pipe(finalize(() => this.loading = false)).subscribe({
      next: () => {
        this.messageService.successBubble('刪除成功');
        this.onSubmit(this.queryForm);
      },
    });
  }
}
