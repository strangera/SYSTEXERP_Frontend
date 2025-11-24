import { DatePipe, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin11200Service } from '@service/api/fin/fin11200.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { Column, createPaginationConfig, formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { Button, ButtonDirective } from 'primeng/button';
import { finalize } from 'rxjs';
import { FIN11210Data, FIN11210Service } from '../../../service/api/fin/fin11210.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

@Component({
  selector: 'app-fin11210',
  templateUrl: './fin11210.component.html',
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
    MultiSelectComponent,
    ButtonComponent,
    Button,
    ButtonDirective,
    NgStyle
  ]
})
export class FIN11210Component extends BasicQueryPageComponent<FIN11210Data> implements OnInit {
  queryForm = this.formBuilder.group({
    ECR_No: [null],     // 收銀機號
    ARG_No: [null],     // 參數代號
    ARG_Desc: [null],  // 參數說明
    ...createPaginationConfig([])
  });

  data: FIN11210Data[] = [];
  selectedItems: FIN11210Data[] = [];
  totalRecords = 0;

  ECR_No_Options: any[] = [
    { Name: '全機台', No: 'ALL' }
  ];
  ARG_No_Options: any[] = [];

  columns: Column[] = [
    { field: 'ID', header: '序號', hidden: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'ARG_No', header: '參數代號', visible: true },
    { field: 'ARG_Data', header: '參數內容', visible: true },
    { field: 'ARG_Desc', header: '參數說明', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDate },
    { field: 'CRT_USR_No', header: '建立人員', visible: true },
    { field: 'CRT_USR_Name', header: '建立人員名稱', visible: true },
    { field: 'UPD_Date', header: '變更日期', visible: true, format: formatDate },
    { field: 'UPD_USR_No', header: '變更人員', visible: true },
    { field: 'UPD_USR_Name', header: '變更人員名稱', visible: true },
  ];

  constructor(
    private fin11210Service: FIN11210Service,
    private fin11200Service: Fin11200Service,
    private dropDownListService: DropDownListService,
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11210', 'fin/fin11210cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      this.fin11210Service.queryFIN11210(form.getRawValue())
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });
  }

  onDelete(selectedItems: FIN11210Data[]) {
    this.confirmationService.confirm({
      header: `是否確認刪除 ${selectedItems.length} 筆資料？`,
      accept: () => {
        const idList = selectedItems.map(item => item.ID);
        this.fin11210Service.deleteFIN11210({ idList })
          .pipe(untilDestroyed(this))
          .subscribe(() => {
            this.messageService.successBubble('刪除成功');
            this.onSubmit(this.queryForm);
          });
      }
    });
  }

  loadOptions() {
    // 取得收銀機號下拉選單資料
    this.dropDownListService.queryPOS1002_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.ECR_No_Options.push(...response.Data);
      });
    // 取得參數代號下拉選單資料
    this.dropDownListService.querySYS1000_DropDownList({ SYS_Type: 'ARG_NO' })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.ARG_No_Options = response.Data
          .map(item => ({
            No: item.No,
            Name: `${item.No} - ${item.Name}`
          }));
      });
  }
}