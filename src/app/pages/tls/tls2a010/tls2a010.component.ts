import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent, DropdownComponent, MenubarComponent, TableComponent, CalendarComponent, InputTextRangeComponent } from '@shared/index';
import { AccordionModule } from 'primeng/accordion';
import { DropDownListService, IDropdownItem } from 'src/app/service/utility/dropDownList.service';
import { Column, createPaginationConfig } from 'src/app/shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

@Component({
  selector: 'app-tls2a010',
  templateUrl: './tls2a010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    TranslateModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarComponent,
    TableComponent,
    InputTextRangeComponent,
  ],
})
export class TLS2A010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_Date: [null, Validators.required],
    FLOOR_NO: [''],
    ECR_No_Start: [null, Validators.required],
    ECR_No_End: [null, Validators.required],
    PAY_NO: ['', Validators.required],
    building_no: [''],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });

  floorOptions: IDropdownItem[] = [];
  paymentToolOptions: IDropdownItem[] = [];
  contact_USR_NameOptions: IDropdownItem[] = [];
  buildingNoOptions: IDropdownItem[] = [];
  payNoToTypeMap = new Map<string, string>();
  selectedItems: any[] = [];
  data: any[] = [];
  totalRecords = 0;
  constructor(
    private dropDownListService: DropDownListService,
  ) {
    super();
  }
  columns: Column[] = [
    { header: '銷售日期', field: 'TXN_Date' },
    { header: '收銀機號', field: 'ECR_No' },
    { header: '付款別', field: 'PAY_NO' },
    { header: '專櫃編號', field: 'TLT_NO' },
    { header: '電腦金額', field: 'BOOK_PayAmt' },
    { header: '實際金額', field: 'ACT_PayAmt' },
    { header: '溢短金額', field: 'OVER_PayAmt' },
    { header: '修正後金額', field: 'MOD_PayAmt' },
    {
      header: '審核狀態',
      field: 'check_status',
      format: (v) => v === 'Y' ? '✅ 已審核' : v === 'N' ? '⛔ 未審核' : v
    },
    { header: '審核人員', field: 'check_usr_name' },
    { header: '審核時間', field: 'check_date' },
  ];

  ngOnInit(): void {
    this.initializePage('TLS2A010', 'TLS/TLS2A020cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();

    this.dropDownListService.querySYS3900_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.floorOptions = res.Data.map(item => ({ ...item, label: item.Name, value: item.No }));
    });

    this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.buildingNoOptions = res.Data.map(x => ({ label: x.Name, value: x.No, Name: x.Name, No: x.No }));
    });

    this.dropDownListService.queryPOS1006_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.paymentToolOptions = res.Data.map(x => {
        this.payNoToTypeMap.set(x.No ?? '', x.PAY_Type ?? '');
        return {
          label: x.Name,
          value: x.No,
          Name: x.Name,
          No: x.No,
        };
      });
    });

  }

  loadDropdownOptions() {
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.contact_USR_NameOptions = res.Data.map(item => ({ ...item, label: item.Name, value: item.No }));
    });
  }

  onSubmitQuery(form: FormGroup): void {
    form.patchValue({ pageIndex: 1 }); // 重新查詢從第一頁開始
    this.onSubmit(form);
  }


  onClearForm(): void {
    this.queryForm.reset();
    this.queryForm.patchValue({ pageIndex: 1, pageSize: 10 });
    this.submitted = false;
  }



  onSubmit(form: FormGroup): void {
    this.submitted = true;

    if (form.invalid) {
      console.warn('表單驗證未通過:', form.value);
      return;
    }

    console.log('查詢條件:', form.getRawValue());
    this.loading = true;
    this.submitted = true;
    if (form.invalid) return;

    this.loading = true;



  }
}
