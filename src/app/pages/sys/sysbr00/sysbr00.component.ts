import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { SYSBR00Service } from '../../../service/api/sys/sysbr00.service';
import { finalize } from 'rxjs/operators';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

const QUERY_STORAGE_KEY = 'sysbr00Query';

@Component({
  selector: 'app-sysbr00',
  templateUrl: './sysbr00.component.html',
  styleUrls: ['./sysbr00.component.scss'],
})
export class SYSBR00Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    
    CITY_No: [''],
    CITY_Name: [''],
    CITY_Group: [''],
    ...createPaginationConfig([{ field: 'CITY_No', order: 1 }])
  });

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];

  columns: any[] = [
    { field: 'CITY_No', header: '縣市代號', visible: true },
    { field: 'CITY_Name', header: '縣市名稱', visible: true },
    { field: 'CITY_Group', header: '群組', visible: true },
  ];

  constructor(private sysbr00Service: SYSBR00Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSBR00', '/sys/sysbr00cru', this.queryForm);
    this.handleQueryRestore(this.queryForm, QUERY_STORAGE_KEY, (form) => this.onSubmit(form));
  }

 onSubmit(form: FormGroup): void {
  this.submitted = true;
  if (form.invalid) {
    this.messageService.warnBubble('請完整填寫查詢條件');
    return;
  }

  const payload = { ...form.value };
  for (const key in payload) {
    if (typeof payload[key] === 'string') {
      payload[key] = payload[key].trim();
      if (payload[key] === '') payload[key] = null;
    }
  }

  this.loading = true;
  this.messageService.blockUi();

  this.sysbr00Service.queryCitiesByCondition(payload).pipe(
    finalize(() => {
      this.loading = false;
      this.messageService.unblockUi();
    })
  ).subscribe({
    next: (res) => {
      this.data = res.Data || [];
      this.totalRecords = res.TotalCount || this.data.length;

      if (!this.data.length) {
        this.messageService.warnBubble('查無資料');
      } else {
        this.messageService.successBubble('查詢成功');
      }

      this.queryStateService.setQueryState(QUERY_STORAGE_KEY, payload);
    },
    error: () => {
      this.messageService.errorBubble('查詢錯誤');
    }
  });
}
override onEdit(row: any): void {
this.navigateWithState(CRUDStatus.Edit, {
  ...row,
  original_CITY_No: row.CITY_No,
  original_CITY_Name: row.CITY_Name
});

}

  onClearForm(): void {
    this.queryForm.reset();
  }
  deleteRow(rows: any[]): void {
  this.confirmationService.confirm({
    header: '刪除資料',
    message: '確定要刪除選取的縣市資料？',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      rows.forEach((row) => {
        this.sysbr00Service.deleteCity(row.CITY_ID).subscribe(() => {
          this.messageService.successBubble('刪除成功');
          this.onSubmit(this.queryForm); // 重新查詢
        });
      });
    },
  });
}

}
