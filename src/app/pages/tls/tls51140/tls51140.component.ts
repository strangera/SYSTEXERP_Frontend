import { QueryTLS51140ResponseData, Tls51140Service } from '@service/api/tls/tls51140.service';
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
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls51140',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule
  ],
  templateUrl: './tls51140.component.html'
})
export class Tls51140Component extends BasicQueryPageComponent<QueryTLS51140ResponseData> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    ECR_No: [null],
    TLT_No: [null],
    ...createPaginationConfig([{ field: 'TLT_NO', order: 1 }]), // 分頁和排序參數，將預設排序改為 TLT_NO
  });
  totalRecords = 0;
  data: QueryTLS51140ResponseData[] = [];
  columns: Column[] = [
    { field: 'TLT_NO', header: '專櫃編號' },
    { field: 'TLT_Name', header: '專櫃名稱' },
    { field: 'ECR_No', header: '收銀機號', visible: false },
    { field: 'ECR_Name', header: '收銀機名稱', visible: false }, // 新增 ECR_Name
    { field: 'HOS_No', header: '倉庫代碼', visible: false },
    { field: 'HOS_Name', header: '倉庫名稱', visible: false }, // 新增 HOS_Name
    { field: 'Remark', header: '備註說明', visible: false },
    { field: 'Store_way', header: '專櫃配合方式', format: () => '自營' },
    { field: 'Approve_status', header: '合約狀態', format: () => '已審核' },
    { field: 'CRT_Date', header: '建立日期', visible: false }, // 新增 type
    { field: 'CRT_USR_No', header: '建立人員', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false }, // 新增 type
    { field: 'UPD_USR_No', header: '變更人員', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false },
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

    this.dropDownListService.queryPOS1002_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      if (options.Data) {
        this.ECR_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
      }
    });

    this.dropDownListService.queryTLTTALENT__StoreWay2_Approve_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      if (options.Data) {
        this.TLT_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
      }
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const request = this.queryForm.getRawValue();
      this.tls51140Service.queryTLS51140(request).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
      });
    });
  }
}
