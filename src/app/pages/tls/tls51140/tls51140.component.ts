import { DeleteTLS51140Request, QueryTLS51140ResponseData, Tls51140Service } from '@service/api/tls/tls51140.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';

@Component({
  selector: 'app-tls51140',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule
  ],
  templateUrl: './tls51140.component.html'
})
export class Tls51140Component extends BasicQueryPageComponent<QueryTLS51140ResponseData> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    ECR_No: [null],
    TLT_NO: [null],
    ...createPaginationConfig([{ field: 'TLT_NO', order: 1 }]), // 分頁和排序參數，將預設排序改為 TLT_NO
  });
  totalRecords = 0;
  data: QueryTLS51140ResponseData[] = [];
  columns: Column[] = [
    { field: 'TLT_NO', header: '專櫃編號' },
    { field: 'TLT_Name', header: '專櫃名稱' },
    { field: 'HOS_No', header: '倉庫代碼' },
    { field: 'HOS_Name', header: '倉庫名稱' },
  ];
  ECR_NoOptions: IDropdownItem[] = [];
  TLT_NoOptions: IDropdownItem[] = [];

  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly tls51140Service: Tls51140Service, // 注入 tls51140Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51140', 'tls/tls51140cru', this.queryForm, (form) => this.onSubmit(form));
    this.dropDownListService.queryTLTTALENT_StoreWay_DropDownList({ store_way: '2' }).pipe(untilDestroyed(this)).subscribe(options => {
      this.TLT_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
    this.dropDownListService.queryPOS1002ECR_TypeDropDownList({ ECR_Type: '1' }).pipe(untilDestroyed(this)).subscribe(options => {
      this.ECR_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const request = this.queryForm.getRawValue();
      this.tls51140Service.queryTLS51140(request).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
      });
    });
  }
  onDelete(event: QueryTLS51140ResponseData[]) {
    if (!event || !event.length) {
      return;
    }
    // 正確地建立後端期望的 Request 物件
    const request: DeleteTLS51140Request = {
      TLT_NO_List: event.map(item => item.TLT_NO)
    };

    this.loading = true; // 顯示載入狀態
    this.tls51140Service.deleteTLS51140(request).pipe(
      untilDestroyed(this),
      finalize(() => this.loading = false) // 結束時關閉載入狀態
    ).subscribe(res => {
      if (res.Status === '0000') {
        this.messageService.successBubble(res.Message);
        this.onSubmit(this.queryForm);
      } else {
        this.messageService.errorBubble(res.Message);
      }
    });
  }
}
