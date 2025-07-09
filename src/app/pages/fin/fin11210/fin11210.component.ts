import { Component, OnInit } from '@angular/core';
import { FIN11210 } from '../../../service/api/fin/fin11210.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { FIN11210Service } from '../../../service/api/fin/fin11210.service';

@Component({
  selector: 'app-fin11210',
  templateUrl: './fin11210.component.html',
  styleUrl: './fin11210.component.scss'
})
export class FIN11210Component extends BasicQueryPageComponent<FIN11210> implements OnInit {
  queryForm = this.formBuilder.group({
    code: ['', [Validators.maxLength(3)]], // 金資中心銀行代碼
    ...createPaginationConfig([{ field: 'code', order: 0 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  data: FIN11210[] = [];
  selectedItems: FIN11210[] = [];
  columns: Column[] = [
    { field: 'code', header: '參數代碼', visible: true },
    { field: 'description', header: '參數說明', visible: true },
    { field: 'content', header: '參數內容', visible: true },
  ];

  constructor(
    private FIN11210Service: FIN11210Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11210', 'fin/fin11210cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.FIN11210Service.queryFIN11210(frm.value).pipe(finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    })
  }

  isRowSelectable(rowData: FIN11210): boolean {
    return true;
  }
}
