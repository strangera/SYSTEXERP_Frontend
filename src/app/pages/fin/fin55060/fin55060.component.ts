import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { FIN55060Service, FIN55060Detail } from '../../../service/api/fin/fin55060.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { FormsModule, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MultiSelectComponent } from "@shared/componentkit/multi-select/multi-select.component";
import { TableSubheaderComponent } from "@shared/componentkit/table/table-subheader/table-subheader.component";

@Component({
  selector: 'app-fin55060',
  templateUrl: './fin55060.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TranslateModule,
    CalendarRangeComponent,
    MultiSelectComponent,
    TableSubheaderComponent
  ]
})
export class FIN55060Component extends BasicQueryPageComponent<FIN55060Detail> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_BDATE: [null, Validators.required],
    TXN_EDATE: [null, Validators.required],
    org_idList: [null],
    ProjectNoList: [null],
    AccNoList: [null],
    DetailNoList: [null],
    ...createPaginationConfig([])
  });

  data: FIN55060Detail[] = [];
  selectedItems: FIN55060Detail[] = [];
  totalRecords = 0;

  columns: Column[] = [
    { field: 'AccNo', header: '科目代號', visible: true },
    { field: 'AccCName', header: '科目名稱', visible: true },
    { field: 'DetailNo', header: '廠商代號', visible: true },
    { field: 'ORG_ID', header: '部門', visible: true },
    { field: 'Org_Name', header: '部門名稱', visible: true },
    { field: 'ProjectNo', header: '活動', visible: true },
    { field: 'Debit_Amt', header: '借方金額', visible: true, format: formatAmount },
    { field: 'Credit_Amt', header: '貸方金額', visible: true, format: formatAmount },
    { field: 'OpeningBal', header: '餘額', visible: true, format: formatAmount },
  ];

  //#region 下拉選單資料
  org_idListOptions: any[] = [];     // 部門
  ProjectNoListOptions: any[] = [];  // 活動
  AccNoListOptions: any[] = [];      // 科目代號
  DetailNoListOptions: any[] = [];   // 廠商代號
  //#endregion

  constructor(
    private fin55060Service: FIN55060Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN55060', 'fin/fin55060cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      this.fin55060Service.queryFIN55060(form.getRawValue())
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data.Datas;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });
  }

  loadOptions() {
    // 部門
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.org_idListOptions = response.Data
          .map(item => ({
            label: `${item.No} - ${item.Name}`,
            value: item.No
          }));
      });

    // 科目代號
    this.dropDownListService.queryGLS1005_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.AccNoListOptions = response.Data
          .map(item => ({
            label: `${item.No} - ${item.Name}`,
            value: item.No
          }));
      });

    // 活動
    this.dropDownListService.queryTALPORDERM_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        console.log(response);
        this.ProjectNoListOptions = response.Data
          .map(item => ({
            label: `${item.No} - ${item.Name}`,
            value: item.No
          }));
      });

    // 廠商代號
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.DetailNoListOptions = response.Data
          .map(item => ({
            label: `${item.No} - ${item.Name}`,
            value: item.No
          }));
      });
  }
}