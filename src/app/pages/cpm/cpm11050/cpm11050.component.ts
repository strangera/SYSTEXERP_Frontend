import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { CPM11050Service, CPM11050Data } from '../../../service/api/cpm/cpm11050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig, formatDate } from '@shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { FormsModule, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-cpm11050',
  templateUrl: './cpm11050.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TableComponent,
    TranslateModule
  ]
})
export class CPM11050Component extends BasicQueryPageComponent<CPM11050Data> implements OnInit {
  queryForm = this.formBuilder.group({
    SYS_Code: ['', Validators.maxLength(60)],   // 物品類別代碼
    SYS_Name: ['', Validators.maxLength(60)],   // 物品類別名稱
    ...createPaginationConfig([])
  });

  data: CPM11050Data[] = [];
  selectedItems: CPM11050Data[] = [];
  totalRecords = 0;

  columns: Column[] = [
    { field: 'ID', header: '序號', hidden: true },
    { field: 'SYS_Code', header: '物品類別代碼', visible: true },
    { field: 'SYS_Name', header: '物品類別名稱', visible: true },
    { field: 'CRT_Date', header: '建立日期', hidden: true, format: formatDate },
    { field: 'CRT_USR_No', header: '建立人員', hidden: true },
    { field: 'CRT_USR_Name', header: '建立人員名稱', hidden: true },
    { field: 'UPD_Date', header: '變更日期', hidden: true, format: formatDate },
    { field: 'UPD_USR_No', header: '變更人員', hidden: true },
    { field: 'UPD_USR_Name', header: '變更人員名稱', hidden: true }
  ];

  constructor(
    private cpm11050Service: CPM11050Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM11050', 'cpm/cpm11050cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      this.cpm11050Service.queryCPM11050(form.getRawValue())
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });
  }

  onDelete(selectedItems: CPM11050Data[]) {
    this.confirmationService.confirm({
      header: `是否確認刪除 ${selectedItems.length} 筆資料？`,
      accept: () => {
        const idList = selectedItems.map(item => item.ID);
        this.cpm11050Service.deleteCPM11050({ idList })
          .pipe(untilDestroyed(this))
          .subscribe(() => {
            this.messageService.successBubble('刪除成功');
            this.onSubmit(this.queryForm);
          });
      }
    });
  }
}