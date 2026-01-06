import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { FIN11050Data, FIN11050QueryRequest, Fin11050Service } from '../../../service/api/fin/fin11050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-fin11050',
  templateUrl: './fin11050.component.html',
  styleUrl: './fin11050.component.scss',
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
  ]
})
export class FIN11050Component extends BasicQueryPageComponent<FIN11050Data> implements OnInit {
  queryForm = this.formBuilder.group({
    INV_GUIType: ['', [Validators.maxLength(2)]],        // 發票格式代號
    INV_GUIName: ['', [Validators.maxLength(100)]],      // 發票格式名稱
    ...createPaginationConfig([{ field: 'INV_GUIType', order: 1 }]) // 分頁和排序參數
  });

  totalRecords = 0;
  data: FIN11050Data[] = [];
  selectedItems: FIN11050Data[] = [];

  columns: Column[] = [
    { field: 'id', header: '序號', visible: false },
    { field: 'INV_GUIType', header: '發票格式代號', visible: true },
    { field: 'INV_GUIName', header: '發票格式名稱', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: false },
    { field: 'CRT_USR_No', header: '建立人員編號', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員名稱', visible: false },
    { field: 'UPD_Date', header: '更新日期', visible: false },
    { field: 'UPD_USR_No', header: '更新人員編號', visible: false },
    { field: 'UPD_USR_Name', header: '更新人員名稱', visible: false },
    { field: 'mid', header: '關聯ID', visible: false }
  ];

  constructor(
    private fin11050Service: Fin11050Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11050', 'fin/fin11050cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    const queryRequest: FIN11050QueryRequest = {
      ...frm.value,
    };

    this.handleSubmit(frm, () => {
      this.fin11050Service.queryFIN11050(queryRequest)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.totalRecords = response.TotalCount || this.data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
          } else {
            this.messageService.errorBubble(`查詢失敗: ${response.Message}`);
          }
        });
    });
  }

  onDelete(selectedItems: FIN11050Data[]) {
    this.messageService.confirm({
      header: `是否確認刪除 ${selectedItems.length} 筆資料？`,
      accept: () => {
        const INV_GUITypeList = selectedItems.map(item => item.INV_GUIType);
        this.fin11050Service.deleteFIN11050({ INV_GUITypeList })
          .pipe(untilDestroyed(this))
          .subscribe(() => {
            this.messageService.successBubble('刪除成功');
            this.onSubmit(this.queryForm);
          });
      }
    });
  }
}