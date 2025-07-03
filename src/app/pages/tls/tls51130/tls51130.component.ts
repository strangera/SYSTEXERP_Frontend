import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

import { TLS51130Service } from '../../../service/api/tls/tls51130.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { BigCategoryCodeService } from '../../../service/basic/big-category-code.service';
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
    ...createPaginationConfig([{ field: 'brand_no', order: 1 }]),
  });

  data: any[] = [];
  totalRecords = 0;
  bus_typeOptions: any[] = [];
  LOGOOptions: any[] = [];

  columns: any[] = [
    { field: 'brand_no', header: '品牌編號', visible: true },
    { field: 'brand_name', header: '品牌名稱', visible: true },
    { field: 'big_category', header: '大分類', visible: true },
    { field: 'mid_category', header: '中分類', visible: true },
    { field: 'small_category', header: '小分類', visible: true },
    { field: 'discount', header: '進貨折數', visible: true },
    { field: 'create_user', header: '建立人員', visible: true },
    { field: 'create_date', header: '建立日期', visible: true },
    { field: 'update_user', header: '修改人員', visible: true },
    { field: 'update_date', header: '修改日期', visible: true },
    { field: 'remark', header: '備註', visible: true },
  ];

  constructor(
    private TLS51130Service: TLS51130Service,
    private bigCategoryCodeService: BigCategoryCodeService,
    private dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51130', 'account/tls/tls51130cru', this.queryForm);
    this.bigCategoryCodeService
      .getSystemTypes()
      .subscribe((data) => (this.bus_typeOptions = data));
    this.dropDownListService
      .queryPLULOGO_HOS_No_DropDownList()
      .subscribe((res) => {
        const nestedData = res?.Data || [];
        this.LOGOOptions = nestedData.map((item) => ({
          label: item.Name,
          value: item.No,
        }));
      });
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    const formValue = { ...form.value };

    // 去除空字串並轉 null
    Object.keys(formValue).forEach((key) => {
      if (typeof formValue[key] === 'string') {
        formValue[key] = formValue[key].trim() || null;
      }
    });

    this.loading = true;
    this.messageService.blockUi();

    this.TLS51130Service.queryTLS51130(formValue).subscribe({
      next: (res) => {
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
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }

  onDelete(selectedItems: any[]): void {
    if (!selectedItems.length) return;
    const confirm = window.confirm('是否確定刪除選取項目？');
    if (!confirm) return;

    const idList = selectedItems.map((item) => item.id);

    this.TLS51130Service.deleteTLS51130(idList).subscribe({
      next: () => {
        this.messageService.successBubble('刪除成功');
        this.onSubmit(this.queryForm);
      },
      error: () => {
        this.messageService.errorBubble('刪除失敗');
      },
    });
  }
}
