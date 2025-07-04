import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TLS51130Service } from '../../../service/api/tls/tls51130.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { DropDownListService } from '../../../service/api/dropdownservice/dropDownList.service';

@Component({
  selector: 'app-tls51130',
  templateUrl: './tls51130.component.html',
  styleUrls: ['./tls51130.component.scss'],
})
export class TLS51130Component extends BasicQueryPageComponent<any> {
  selectedItems: any[] = [];

  queryForm = this.formBuilder.group({
    LOGO_No: [''],
    CAT_LNo: [''],
    ...createPaginationConfig([{ field: 'LOGO_No', order: 1 }]),
  });

  data: any[] = [];
  totalRecords = 0;
  CAT_LOptions: any[] = [];
  LOGOOptions: any[] = [];

  columns: any[] = [
    { field: 'LOGO_No', header: '品牌', visible: true },
    { field: 'CAT_LNo', header: '大分類編號', visible: true },
    { field: 'CAT_LName', header: '大分類名稱', visible: true },
    { field: 'CAT_MNo', header: '中分類編號', visible: true },
    { field: 'CAT_MName', header: '中分類名稱', visible: true },
    { field: 'CAT_SNo', header: '小分類編號', visible: true },
    { field: 'CAT_SName', header: '小分類名稱', visible: true },
    { field: 'PLU_OrderPrcRate', header: '進貨折數', visible: true },
    { field: 'DISC_Remark', header: '備註', visible: true },
  ];

  constructor(
    private TLS51130Service: TLS51130Service,
    
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51130', '/tls/tls51130cru', this.queryForm);

    this.dropDownListService.queryPOS2003_DropDownList().subscribe((res) => {
      const nestedData = res?.Data || [];
      this.CAT_LOptions = nestedData.map((item) => ({
        label: item.Name,
        value: item.No,
      }));
    });

    this.dropDownListService.queryPLULOGO_HOS_No_DropDownList().subscribe((res: any) => {
      const nestedData = res?.Data || [];
      this.LOGOOptions = nestedData.map((item: { Name: string; No: string }) => ({
        label: item.Name,
        value: item.No,
      }));
    });
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    const formValue = { ...form.value };

    // 去除空字串並轉為 null
    Object.keys(formValue).forEach((key) => {
      if (typeof formValue[key] === 'string') {
        formValue[key] = formValue[key].trim() || null;
      }
    });

    this.loading = true;
    this.messageService.blockUi();

    this.TLS51130Service.queryTLS51130(formValue).subscribe({
      next: (res: any) => {
        if (res.Status === '0000') {
          this.data = res.Data || [];
          this.totalRecords = res.TotalCount || this.data.length;
          this.messageService.successBubble('查詢成功');
          this.queryStateService.setQueryState(this.ProgNo, formValue);
        } else {
          this.messageService.errorBubble(res.Message || '查詢失敗');
        }
      },
      error: () => {
        this.messageService.errorBubble('查詢錯誤');
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }

  onDelete(selectedItems: any[]): void {
    if (!selectedItems || !selectedItems.length) return;

    const confirmDelete = window.confirm('是否確定刪除選取項目？');
    if (!confirmDelete) return;

    const idList = selectedItems.map((item) => item.id);

    this.TLS51130Service.deleteTLS51130(idList).subscribe({
      next: () => {
        this.messageService.successBubble('刪除成功');
        this.onSubmit(this.queryForm); // 重新查詢
      },
      error: () => {
        this.messageService.errorBubble('刪除失敗');
      },
    });
  }
}
