import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { FIN13010Service } from '../../../service/api/fin/fin13010.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

@Component({
  selector: 'app-fin13010',
  templateUrl: './fin13010.component.html',
  styleUrls: ['./fin13010.component.scss']
})
export class FIN13010Component extends BasicQueryPageComponent<any> {
  taxNumberOptions: any[] = [
    { value: '701702007', label: '701702007' },
    { value: '703902223', label: '703902223' },
  ];

  queryForm = this.formBuilder.group({
    onedatemm: [null],        // 申報年月
    startSalesDate: [null],   // 領用日期(起)
    endSalesDate: [null],     // 領用日期(迄)
    taxNumber: [null],        // 稅籍編號
    Year: ['2025'],             // 查詢年
    Month: ['01'],            // 查詢月
    TXN_Ret_No_Start: [null], // 退出/折讓單號(起)
    TXN_Ret_No_End: [null],   // 退出/折讓單號(迄)
    PUR_GUINo: [null], // 字軌
    PUR_GUINo_Start: [null],
    PUR_GUINo_End: [null],
    PUR_GUIDate_Start: [null], // 領用日期(起)
    PUR_GUIDate_End: [null],   // 領用日期(迄)
    ...createPaginationConfig([{ field: 'startSalesDate', order: 1 }])
  });

  data: any[] = [];
  totalRecords = 0;

  columns: any[] = [
    { field: 'col1', header: '發票年月', visible: true },
    { field: 'col2', header: '申報年月', visible: true },
    { field: 'col3', header: '類別', visible: true },
    { field: 'col4', header: '字軌', visible: true },
    { field: 'col5', header: '發票號碼(起)', visible: true },
    { field: 'col6', header: '發票號碼(迄)', visible: true },
    { field: 'col7', header: '領用機號', visible: true },
    { field: 'col8', header: '領用單位', visible: true },
    { field: 'col9', header: '領用日期', visible: true },
    { field: 'col10', header: '繳回機台', visible: true },
    { field: 'col11', header: '繳回日期', visible: true },
    { field: 'col12', header: '發票狀態', visible: true },
    { field: 'col13', header: '裝箱箱號', visible: true }
  ];

  constructor(private fin13010Service: FIN13010Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13010', 'FIN13010cru', this.queryForm);

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

    this.fin13010Service.queryFIN13010(payload).subscribe({
      next: (res) => {
        if (res.Status === '0000') {
          this.data = res.Data || [];
          this.totalRecords = res.TotalCount || this.data.length;
          this.queryStateService.setQueryState(this.ProgNo, payload);
          this.messageService.successBubble('查詢成功');
        } else {
          this.messageService.errorBubble('查詢失敗');
        }
      },
      error: () => {
        this.messageService.errorBubble('查詢錯誤');
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      }
    });
  }



  onClearForm(): void {
    this.queryForm.reset();
  }
}
