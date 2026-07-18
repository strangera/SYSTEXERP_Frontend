import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { finalize, map, Observable } from 'rxjs';
import { CPM11010Service, CPM11020Data } from '../../../service/api/cpm/cpm11020.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { TableComponent } from '../../../others/component/table/table.component';
import { Column, createPaginationConfig, formatDateTime } from '../../../others/component/table/table.model';
//

//5.1.1.2 客服設備資料維護作業
@Component({
  selector: 'app-cpm11020',
  templateUrl: './cpm11020.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, TableComponent, TranslateModule, AsyncPipe]
})
export class CPM11020Component extends BasicQueryPageComponent<CPM11020Data> implements OnInit {
  queryForm = this.formBuilder.group({
    Device_id: [null], // 設備代號
    Device_Name: ['', [Validators.maxLength(60)]], // 設備名稱
    ...createPaginationConfig([{ field: 'Device_ID', order: 1 }]), // 分頁和排序參數
  });

  totalRecords = 0;
  data: CPM11020Data[] = [];
  selectedItems: CPM11020Data[] = [];

  // 設備代號下拉選項 - 從 API 載入
  deviceOptions: Observable<{ label: string; value: string }[]> = this.cpm11020Service.queryDeviceListCPM11020().pipe(
    map(response =>
      response.Data.map(item => ({
        label: `${item.Device_id} - ${item.Device_Name}`,
        value: item.Device_id
      }))
    )
  );

  columns: Column[] = [
    { field: 'Device_ID', header: '設備代號', visible: true },
    { field: 'Device_Name', header: '設備名稱', visible: true },
    { field: 'Device_TotQty', header: '設備總量', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDateTime },
    { field: 'CRT_USR_Name', header: '建立人員', visible: true },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime },
    { field: 'UPD_USR_Name', header: '變更人員', visible: false },
  ];

  constructor(
    private readonly cpm11020Service: CPM11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM11020', 'cpm/cpm11020cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.cpm11020Service.queryCPM11010(frm.value)
        .pipe(
          finalize(() => this.loading = false),
          untilDestroyed(this)
        )
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        });
    });
  }

  onDelete(selectedItems: CPM11020Data[]) {
    this.messageService.confirm({
      header: `是否確認刪除 ${selectedItems.length} 筆資料？`,
      accept: () => {
        const idList = selectedItems.map(item => item.ID);
        this.cpm11020Service.deleteCPM11020({ IdList: idList })
          .pipe(untilDestroyed(this))
          .subscribe(() => {
            this.messageService.successBubble('刪除成功');
            this.onSubmit(this.queryForm);
          });
      }
    });
  }
}
