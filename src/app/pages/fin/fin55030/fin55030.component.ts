import { AsyncPipe, formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin55070Service } from '@service/api/fin/fin55070.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { FIN55050Service } from '../../../service/api/fin/fin55050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { fin55030request, fin55030response, Fin55030Service } from './../../../service/api/fin/fin55030.service';

export interface GroupedFIN55030Detail extends fin55030response {
  AccNo: string;
  AccCName: string;
  VouDate: string;
}

@Component({
  selector: 'app-fin55030',
  templateUrl: './fin55030.component.html',
  styleUrl: './fin55030.component.scss',
  standalone: true,
  imports: [
    AsyncPipe,
    AccordionModule,
    ButtonComponent,
    ButtonModule,
    MultiSelectComponent,
    MenubarComponent,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    DropdownRangeComponent,
    InputNumberRangeComponent,
    InputTextRangeComponent,
    InputTextComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule
  ]
})

// FIN55030 立沖科目餘額表
export class FIN55030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    VouDate_Start: [new Date(), [Validators.required]], // 日期 GLS3001.VOUDATE
    VouDate_End: [new Date(), [Validators.required]],
    ORG_ID: [''],   // 部門代碼 GLS3001.ORG_ID
    AccNo_Start: [''], // 科目代號 GLS3003.ACCNO
    AccNo_End: [''],
    DetailNo_Start: [''], // 廠商代號 GLS3001.DetailNo
    DetailNo_End: [''],
    PTA_Start: [''], // 立沖代號 GLS3003.PTA
    PTA_End: [''],
    SubDetailNo: [''], // 對象別編號 GLS3002.SubDetailNo (目前都是null)
    PostFlag: [''], // 傳票狀態 GLS3001.PostFlag (0.作廢 1.建立 2.確認 3.過帳)
    IsSubDetail: [true], // 是否為對象別(是-->IS NOT NULL, 否-->IS NULL)

    ...createPaginationConfig([{ field: 'PTA', order: 1 }]),
  });
  columns: Column[] = [
    { field: 'VouDate', header: '傳票日期', visible: true },
    { field: 'VouNo', header: '傳票號碼', visible: true },
    { field: 'ORG_ID', header: '部門名稱', visible: true },
    { field: 'DetailNo', header: '廠商代號', visible: true },
    { field: 'PTA', header: '立沖編號', visible: true },
    { field: 'PTA1', header: '借方金額(餘額)', visible: true },
    { field: 'PTA2', header: '貸方金額(餘額)', visible: true }
  ];
  data: fin55030response[] = [];
  totalRecords = 0;
  AccNo_Options: any[] = [];
  ORG_IDOptions: any[] = [];
  VenNoOptions: any[] = [];
  TargetNoListOptions: any[] = [];
  PostFlagOptions = [
    { label: '作廢', value: '0' },
    { label: '建立', value: '1' },
    { label: '確認', value: '2' },
    { label: '過帳', value: '3' }
  ];
  ifOptions = [
    { label: '是', value: true },
    { label: '否', value: false }
  ]

  btn_pdf_Loading = false;
  btn_excel_Loading = false;

  constructor(
    private dropdown: DropdownApiService,
    public readonly fin55070Service: Fin55070Service,
    private dropDownListService: DropDownListService,
    private fin55050Service: FIN55050Service,
    private fin55030Service: Fin55030Service,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN55030', '/FIN/FIN55030CRU', this.queryForm, (frm) => this.onSubmit(frm));
    this.loadOptions();
  }
  loadOptions() {
    this.fin55070Service.getAccNoList().subscribe(res => {
      this.AccNo_Options = res;
    });
    this.dropdown.querySys3100().subscribe(res => {
      this.ORG_IDOptions = res || [];
    });
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.VenNoOptions = response.Data.map((item: any) => ({ Name: `${item.No}-${item.Name}`, No: item.No }));
      });
    this.fin55050Service.queryGLS1016_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.TargetNoListOptions = response.Data?.map((item: any) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        })) ?? [];
      });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const rawValue = frm.getRawValue();
      const formValue = {
        ...rawValue,
        VouDate_Start: formatDate(rawValue.VouDate_Start, 'yyyy-MM-dd', 'en-US'),
        VouDate_End: formatDate(rawValue.VouDate_End, 'yyyy-MM-dd', 'en-US')
      } as fin55030request;
      console.log('立沖科目餘額表查詢請求', formValue);

      this.fin55030Service.queryFIN55030(formValue).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        // this.data = res.Data ?? [];               // 查詢資料
        console.log('查詢', res);
        // console.log('查詢結果', this.data);
        // this.totalRecords = res.TotalCount;
        // this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      })
    });
  }

  // 列印 PDF 或 Excel
  printPDF(isPDF: boolean) {
    const rawValue = this.queryForm.getRawValue();
    const formValue = {
      ...rawValue,
      VouDate_Start: formatDate(rawValue.VouDate_Start, 'yyyy-MM-dd', 'en-US'),
      VouDate_End: formatDate(rawValue.VouDate_End, 'yyyy-MM-dd', 'en-US')
    }

    if (isPDF) {
      this.btn_pdf_Loading = true;
      this.fin55030Service.exportFIN55030PDF(formValue).pipe(finalize(() => this.btn_pdf_Loading = false))
        .subscribe(blob => {
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          const url = URL.createObjectURL(pdfBlob);
          window.open(url, '_blank');
        });
    } else {
      this.btn_excel_Loading = true;
      this.fin55030Service.exportFIN55030Excel(formValue).pipe(finalize(() => this.btn_excel_Loading = false))
        .subscribe(blob => {
          const excelBlob = new Blob([blob], { type: 'application/vnd.ms-excel' });
          const url = URL.createObjectURL(excelBlob);
          window.open(url, '_blank');
        });
    }
  }
}
