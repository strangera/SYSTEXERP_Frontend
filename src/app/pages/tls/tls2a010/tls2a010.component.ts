import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent, DropdownComponent, MenubarComponent, TableComponent, CalendarComponent, InputNumberRangeComponent } from '@shared/index';
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
    InputNumberRangeComponent,
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

  // 下拉選單選項
  floorOptions: IDropdownItem[] = [];
  paymentToolOptions: IDropdownItem[] = [];
  contact_USR_NameOptions: IDropdownItem[] = [];

  // 表格資料
  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];
  buildingNoOptions: IDropdownItem[] = [];


  columns: Column[] = [
    { header: '銷售日期', field: 'TXN_Date' },
    { header: '樓層', field: 'FLOOR_NO' },
    { header: '收銀機號', field: 'ECR_No' },
    { header: '付款別', field: 'PAY_NO' },
  ];

  constructor(
    private dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2A010', 'TLS/TLS2A020cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();
    //樓層API
    this.dropDownListService.querySYS3900_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.floorOptions = res.Data.map(item => ({
        ...item,
        label: item.Name,  // 顯示名稱
        value: item.No     // 實際值
      }));
    });
    //館別API
    this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.buildingNoOptions = res.Data.map(x => ({ label: x.Name, value: x.No, Name: x.Name, No: x.No }));
    });
    this.dropDownListService.queryPOS1006_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.paymentToolOptions = res.Data.map(x => ({
          label: x.Name,
          value: x.No,
          Name: x.Name,
          No: x.No
        }));
      });
  }

  loadDropdownOptions() {
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.contact_USR_NameOptions = res.Data.map(item => ({
        ...item,
        label: item.Name,
        value: item.No
      }));
    });

  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) return;

    form.getRawValue(); // Retrieve form data if needed in the future
    this.loading = true;

    // 假設你有對應的 service，可在此呼叫 API
    // this.yourService.queryData(formData).pipe(
    //   untilDestroyed(this),
    //   finalize(() => this.loading = false)
    // ).subscribe(res => {
    //   this.data = res.Data;
    //   this.totalRecords = res.TotalCount;
    // });
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


}
