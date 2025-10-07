import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { CPM11060Service, CPM11060Data } from '../../../service/api/cpm/cpm11060.service';
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
  selector: 'app-cpm11060',
  templateUrl: './cpm11060.component.html',
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
export class CPM11060Component extends BasicQueryPageComponent<CPM11060Data> implements OnInit {
  queryForm = this.formBuilder.group({
    SYS_Code: ['', Validators.maxLength(60)],   // 遺拾物品地點代碼
    SYS_Name: ['', Validators.maxLength(60)],   // 遺拾物品地點名稱
    ...createPaginationConfig([])
  });

  data: CPM11060Data[] = [];
  selectedItems: CPM11060Data[] = [];
  totalRecords = 0;

  columns: Column[] = [
    { field: 'ID', header: '序號', hidden: true },
    { field: 'SYS_Code', header: '遺拾物品地點代碼', visible: true },
    { field: 'SYS_Name', header: '遺拾物品地點名稱', visible: true },
    { field: 'CRT_Date', header: '建立日期', hidden: true, format: formatDate },
    { field: 'CRT_USR_No', header: '建立人員', hidden: true },
    { field: 'CRT_USR_Name', header: '建立人員名稱', hidden: true },
    { field: 'UPD_Date', header: '變更日期', hidden: true, format: formatDate },
    { field: 'UPD_USR_No', header: '變更人員', hidden: true },
    { field: 'UPD_USR_Name', header: '變更人員名稱', hidden: true }
  ];

  constructor(
    private cpm11060Service: CPM11060Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM11060', 'cpm/cpm11060cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(form: FormGroup) {
    this.cpm11060Service.queryCPM11060(form.getRawValue())
      .pipe(untilDestroyed(this), finalize(() => this.loading = false))
      .subscribe(response => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
      });
  }

  onDelete(selectedItems: CPM11060Data[]) {
    this.confirmationService.confirm({
      header: `是否確認刪除 ${selectedItems.length} 筆資料？`,
      accept: () => {
        const idList = selectedItems.map(item => item.ID);
        this.cpm11060Service.deleteCPM11060({ idList })
          .pipe(untilDestroyed(this))
          .subscribe(() => {
            this.messageService.successBubble('刪除成功');
            this.onSubmit(this.queryForm);
          });
      }
    });
  }
}