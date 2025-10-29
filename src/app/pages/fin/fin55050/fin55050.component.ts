import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { FIN55050Service, FIN55050Data } from '../../../service/api/fin/fin55050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig, formatDate } from '@shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { FormsModule, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectComponent } from "@shared/componentkit/multi-select/multi-select.component";

@Component({
  selector: 'app-fin55050',
  templateUrl: './fin55050.component.html',
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
    RadiobuttonComponent,
    CheckboxModule,
    MultiSelectComponent
  ]
})
export class FIN55050Component extends BasicQueryPageComponent<FIN55050Data> implements OnInit {
  queryForm = this.formBuilder.group({
    VOUDATE_Start: [null],                          // 日期起
    VOUDATE_End: [null],                            // 日期迄
    ORG_ID: [null],       // 部門
    ProjectNo: [null],    // 活動代碼
    AccNo: [null],        // 科目代號
    VOUNO: [null, Validators.maxLength(16)],        // 傳票號碼
    DetailNo: [null],     // 廠商代號
    PTA: [null],          // 立沖代號
    SubDetailNo: [null],  // 對象別編號
    AccountKey: [null],   // 對帳KEY
    NoteDesc: [null],    // 摘要
    VOUCHER_KIND: [null], // 傳票型態
    PostFlag: [null],     // 傳票狀態
    isSubDetailNo: [null], // 是否為對象別
    ReportType: [null],    // 報表方式
    PrintType: [null],      // 列印類型
    ...createPaginationConfig([])
  });

  data: FIN55050Data[] = [];
  selectedItems: FIN55050Data[] = [];
  totalRecords = 0;

  columns: Column[] = [
    { field: 'ID', header: '序號', hidden: true },
    { field: 'VOUNO', header: '傳票號碼', visible: true },
    { field: 'DETAILNO', header: '廠商代號/簡稱', visible: true },
    { field: 'POSTFLAG', header: '狀態', visible: true },
    { field: 'ORG_ID', header: '部門', visible: true },
    { field: 'ORG_NAME', header: '部門名稱', visible: true },
    { field: 'ProjectNo', header: '活動', visible: true },
    { field: 'PTA', header: '立沖代號', visible: true },
    { field: 'NoteDesc', header: '摘要', visible: true },
    { field: 'D_AMT', header: '借方金額', visible: true },
    { field: 'C_AMT', header: '貸方金額', visible: true },
    { field: 'Balance', header: '餘額', visible: true },
  ];

  //#region 下拉選單資料
  ORG_IDOptions: any[] = []; // 部門
  ProjectNoOptions: any[] = []; // 活動代碼
  AccNoOptions: any[] = []; // 科目代號
  DetailNoOptions: any[] = []; // 廠商代號
  PostFlagOptions: any[] = [   // 傳票狀態
    { label: '作廢', value: '0' },
    { label: '建立', value: '1' },
    { label: '確認', value: '2' },
    { label: '過帳', value: '3' },
  ];
  SubDetailNoOptions: any[] = []; // 對象別編號 TODO: 未找到dropDown api
  VoucherKindOptions: any[] = [];  // 傳票型態 TODO: 未找到dropDown api
  //#endregion

  constructor(
    private fin55050Service: FIN55050Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN55050', 'fin/fin55050cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      this.fin55050Service.queryFIN55050(form.getRawValue())
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
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
        this.ORG_IDOptions = response.Data
          .map(item => ({
            label: `${item.No} - ${item.Name}`,
            value: item.No
          }));
      });
    // 活動代碼 TODO: 條件待確認
    this.dropDownListService.getActivityOptions({
      mid: 0,
      str_no: '10',
      pod_type: ['1', '2', '8'],
      pod_status: '1',
    })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.ProjectNoOptions = response.Data
          .map(item => ({
            label: `${item.pod_no} - ${item.pod_desc}`,
            value: item.pod_no
          }));
      });
    // 科目代號
    this.dropDownListService.queryGLS1005_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.AccNoOptions = response.Data
          .map(item => ({
            label: `${item.No} - ${item.Name}`,
            value: item.No
          }));
      });
    // 廠商代號
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.DetailNoOptions = response.Data
          .map(item => ({
            label: `${item.No} - ${item.Name}`,
            value: item.No
          }));
      });
  }
}