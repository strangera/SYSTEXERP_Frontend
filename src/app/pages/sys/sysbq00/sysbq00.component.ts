import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, formatDateTime } from '../../../shared/componentkit/table/table.model';
import { Sysbq00Service, Sysbq00Data } from '../../../service/api/sys/sysbq00.service';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-sysbq00',
  templateUrl: './sysbq00.component.html',
})
export class SYSBQ00Component extends BasicQueryPageComponent<Sysbq00Data> implements OnInit {
  queryForm = this.formBuilder.group({
    data_type: ['', [Validators.maxLength(10)]],          // 資料型態
    data_type_desc: ['', [Validators.maxLength(200)]],     // 資料型態的描述 (line1, line2, line3, line4, line5)
    ...createPaginationConfig([{ field: 'data_type', order: 1 }]) // 分頁和排序
  });

  totalRecords = 0;
  data: Sysbq00Data[] = [];
  selectedRows: Sysbq00Data[] = [];

  columns = [
    { field: 'data_type', header: '資料型態', visible: true },
    { field: 'line1', header: '第一行資料', visible: true },
    { field: 'line2', header: '第二行資料', visible: true },
    { field: 'line3', header: '第三行資料', visible: true },
    { field: 'line4', header: '第四行資料', visible: true },
    { field: 'line5', header: '第五行資料', visible: true },
    { field: 'CRT_Date', header: '建立時間', visible: true, format: formatDateTime },
    { field: 'CRT_USR_Name', header: '建立人員編號', visible: true },
    { field: 'CRT_USR_No', header: '建立人員名稱', visible: true },
    { field: 'UPD_Date', header: '變更時間', visible: true, format: formatDateTime },
    { field: 'UPD_USR_Name', header: '變更人員編號', visible: true },
    { field: 'UPD_USR_No', header: '變更人員名稱', visible: true },
  ];


  constructor(
    private sysbq00Service: Sysbq00Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSBQ00', 'SYS/SYSBQ00cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      this.sysbq00Service.querySYSBQ00(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data
        this.totalRecords = res.TotalCount || 0;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  onDelete(rows: Sysbq00Data[]) {
    const idList = rows.map(r => r.id).filter((id): id is number => id !== undefined);
    if (idList.length === 0) return;
    this.loading = true;
    this.sysbq00Service.deleteSYSBQ00(idList).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
      this.messageService.successBubble(res.Message);
      this.onSubmit(this.queryForm); // 重新查詢
    });
  }
}
