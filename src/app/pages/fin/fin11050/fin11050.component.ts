import { Component, OnInit } from '@angular/core';
import { FIN11050, Fin11050Service } from '../../../service/api/fin/fin11050.service';
import { Validators, FormGroup } from '@angular/forms';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

@Component({
  selector: 'app-fin11050',
  templateUrl: './fin11050.component.html',
  styleUrl: './fin11050.component.scss'
})

export class FIN11050Component extends BasicQueryPageComponent<FIN11050> implements OnInit {
  queryForm = this.formBuilder.group({
    format_code: ['', [Validators.maxLength(2)]],        // 格式代號
    format_name: ['', [Validators.maxLength(100)]],      // 格式名稱
    ...createPaginationConfig([{ field: 'format_code', order: 1 }]), // 分頁和排序參數
  });

  totalRecords = 0;
  data: FIN11050[] = [];
  columns: Column[] = [
    { field: 'format_code', header: '格式代號', visible: true },
    { field: 'format_name', header: '格式名稱', visible: true }
  ];

  selectedItems: FIN11050[] = [];

  constructor(private fin11050Service: Fin11050Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11050', 'fin/fin11050cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin11050Service.queryFIN11050(frm.value).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.totalRecords = response.TotalCount || this.data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
          } else {
            this.messageService.errorBubble(`查詢失敗: ${response.Message}`);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err: string) => {
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }

  isRowSelectable(rowData: FIN11050): boolean {
    return true;
  }
}
