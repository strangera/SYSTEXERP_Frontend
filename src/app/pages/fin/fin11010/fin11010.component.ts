import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column } from '../../../shared/componentkit/table/table.model';
import { apiOption } from '../../../shared/models/sys/sysb000.module';
import { FIN11010, Fin11010Service } from '../../../service/api/fin/fin11010.service';

@Component({
  selector: 'app-fin11010',
  templateUrl: './fin11010.component.html',
  styleUrl: './fin11010.component.scss'
})
export class FIN11010Component extends BasicQueryPageComponent<FIN11010> implements OnInit {
  queryForm = this.formBuilder.group({
    tax_id: ['', [Validators.maxLength(8)]],          // 營業人統編
    tax_name: ['', [Validators.maxLength(60)]],       // 營業人名稱
    address: ['', [Validators.maxLength(100)]],       // 營業地址
    main_code: [''],                                  // 總繳代號
    review_status: [''],                              // 審核狀態
    declare_month_start: [''],                        // 申報年月(起)
    declare_month_end: [''],                          // 申報年月(訖)
    ...createPaginationConfig([{ field: 'tax_id', order: 1 }]), // 分頁和排序參數
  });

  totalRecords = 0;

  mainCodeOptions: apiOption[] = [];
  reviewStatusOptions: apiOption[] = [
    { No: 'Y', Name: '是', Label: '是' },
    { No: 'N', Name: '否', Label: '否' }
  ];

  data: FIN11010[] = [];
  columns: Column[] = [
    { field: 'tax_id', header: '營業人統編', visible: true },
    { field: 'tax_name', header: '營業人名稱', visible: true },
    { field: 'city_type', header: '縣市別', visible: true },
    { field: 'address', header: '營業地址', visible: true },
    { field: 'main_code', header: '總繳代號', visible: true },
    {
      field: 'deduct_type', header: '直接扣抵法(Y/N)', visible: true,
      format: (value: string) => value === 'Y' ? 'Y' : value === 'N' ? 'N' : value
    },
    {
      field: 'review_status', header: '審核狀態', visible: true,
      format: (value: string) => value === 'Y' ? '是' : value === 'N' ? '否' : value
    },
    { field: 'declare_month_start', header: '申報年月起', visible: true },
    { field: 'declare_month_end', header: '申報年月迄', visible: true },
  ];

  selectedItems: FIN11010[] = [];

  constructor(private fin11010Service: Fin11010Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11010', 'FIN/FIN11010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin11010Service.queryFIN11010(frm.value).subscribe({
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

  onExport(): void {
    // 匯出申報資料
    // 實作請呼叫API或服務
    this.fin11010Service.exportFIN11010(this.queryForm.value).subscribe({
      next: (response) => {
        if (response.Status === '0000') {
          this.messageService.successBubble('匯出成功');
        } else {
          this.messageService.errorBubble(`匯出失敗: ${response.Message}`);
        }
      },
      error: () => {
        this.messageService.errorBubble('匯出失敗');
      }
    });
  }

  onDelete(data: FIN11010 | FIN11010[]): void {
    // 視需求開放刪除
  }

  loadOptions() {
    this.fin11010Service.getMainCodeOptions().subscribe((response) => {
      this.mainCodeOptions = response.Data.map((item: apiOption) => ({
        No: item.No,
        Name: item.Name,
        Label: `${item.No}-${item.Name}`,
      }));
    });
  }

  isRowSelectable(rowData: FIN11010): boolean {
    return true;
  }
}