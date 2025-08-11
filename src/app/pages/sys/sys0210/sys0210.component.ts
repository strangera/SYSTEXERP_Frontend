import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
// Shared
import { tblRole } from '../../../shared/models/sys/sysb000.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatDateTime } from '../../../shared/componentkit/table/table.model';
import { Sys0210Service } from '../../../service/api/sys/sys0210.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { ValidationService } from '@shared/service/validation.service';

@Component({
  selector: 'app-sys0210',
  templateUrl: './sys0210.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TableComponent,
    TranslateModule,
  ],
})
// 4-2-2-1角色基本資料維護
export class SYS0210Component extends BasicQueryPageComponent<tblRole>
  implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    Role_No: ['', [Validators.maxLength(10), this.validationService.alphanumericValidator]], // 角色代號
    Role_Name: ['', [Validators.maxLength(30)]], // 角色名稱
    Description: ['', [Validators.maxLength(50)]], // 角色註記

    //分頁查詢
    ...createPaginationConfig([{ field: 'Role_No', order: 1 }]), // 分頁和排序參數
  });

  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: tblRole[] = [];
  columns: Column[] = [
    { field: 'Role_No', header: '角色代號', visible: true },
    { field: 'Role_Name', header: '角色名稱', visible: true },
    { field: 'Description', header: '角色註記', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員編號', visible: true },
    { field: 'CRT_USR_Name', header: '建立人員名稱', visible: true },
    { field: 'UPD_Date', header: '變更日期', visible: true, format: formatDateTime },
    { field: 'UPD_USR_No', header: '變更員編號', visible: true },
    { field: 'UPD_USR_Name', header: '變更人員名稱', visible: true },
  ];
  // 多選項目
  selectedItems: tblRole[] = [];

  constructor(
    private readonly sys0210Service: Sys0210Service,
    private readonly validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0210', 'SYS/SYS0210cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.sys0210Service.queryRole(frm.value)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe((response) => {
          this.data = response.Data || [];
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        })
    });
  }

  // 刪除項目
  onDelete(data: tblRole[]): void {
    const idList = data.map(row => row.id).filter(id => id !== undefined && id !== null && typeof id === 'number');
    this.sys0210Service.deleteRole({ ids: idList }).subscribe({
      next: (response) => {
        if (response.Status === '0000') {
          this.messageService.successBubble(response.Message);
          this.onSubmit(this.queryForm);
        } else {
          this.messageService.errorBubble(response.Message);
        }
      },
    });
    this.selectedItems = [];
  }
}
