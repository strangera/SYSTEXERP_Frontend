import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent, DropdownComponent, MenubarComponent, TableComponent, CalendarComponent, InputTextRangeComponent } from '@shared/index';
import { AccordionModule } from 'primeng/accordion';
import { DropDownListService, IDropdownItem } from 'src/app/service/utility/dropDownList.service';
import { Column, createPaginationConfig } from 'src/app/shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Button } from 'primeng/button';
import { NgStyle, NgIf } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';


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
    Button,
    NgStyle,
    NgIf,
    TooltipModule
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
  ECR_Options: { label: string; value: string }[] = [];
  floorOptions: IDropdownItem[] = [];
  paymentToolOptions: IDropdownItem[] = [];
  contact_USR_NameOptions: IDropdownItem[] = [];
  buildingNoOptions: IDropdownItem[] = [];
  payNoToTypeMap = new Map<string, string>();
  selectedItems: any[] = [];
  selectionMode = 'single';
  data: any[] = [];
  totalRecords = 0;
  PAY_NO = '';
  TXN_Date = '';
  todayDisplay = '';
  addButtons = [
    {
      label: '缺單審核',
      icon: 'pi pi-exclamation-triangle',
      action: (rowData: any) => this.onEdit(rowData),
      disabled: (rowData: any) => rowData.isMissing !== 'Y'
    }
  ];
  IsPrint = true;



  constructor(
    private dropDownListService: DropDownListService,

  ) {
    super();
  }
  columns: Column[] = [
    { header: '收銀機代號', field: 'ECR_No' },
    { header: '專櫃編號', field: 'TLT_NO' },
    { header: '專櫃名稱', field: 'tlt_name' },
    { header: '付款別', field: 'PAY_NO' },

    { header: '系統帳', field: 'BOOK_PayAmt' },
    { header: '實收帳', field: 'ACT_PayAmt' },
    { header: '系統/實收帳差異', field: 'OVER_PayAmt' },
    { header: '修正後金額', field: 'MOD_PayAmt' },
    {
      header: '審核狀態',
      field: 'check_status',
      format: (v) => v === 'Y' ? '已審核' : v === 'N' ? '未審核' : v
    },
    { header: '審核人員', field: 'check_usr_name' },
    {
      header: '是否有缺單', field: 'isMissing',
      format: (v) => v === 'Y' ? '是' : v === 'N' ? '否' : v
    },
  ];

  ngOnInit(): void {
    this.initializePage('TLS2A010', 'TLS/TLS2A010cru', this.queryForm, (form) => this.onSubmit(form));
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
    const today = new Date();
    const mm = today.getMonth() + 1; // 月份是從 0 開始的
    const dd = today.getDate();
    this.todayDisplay = `${mm}/${dd}`;


  }
  get selectedCount(): number {
    return this.selectedItems?.length ?? 0;
  }
  loadDropdownOptions() {
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.contact_USR_NameOptions = res.Data.map(item => ({ ...item, label: item.Name, value: item.No }));
    });
  }
  onAbnormalClick(row: any): void {
    console.log('缺單被點擊:', row);

  }
  // onMissingClick(rowData: any): void {
  //   console.log('跳轉 CRU 缺單處理頁面:', rowData);
  //   this.router.navigate(['/TLS/TLS2A020cru'], { queryParams: { ECR_No: rowData.ECR_No, TXN_Date: rowData.TXN_Date } });
  // }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) return;

    this.loading = true;

    setTimeout(() => {
      this.data = [
        {
          id: 1,
          TXN_Date: '2025-07-23',
          ECR_No: 'ECR001',
          PAY_NO: '信用卡',
          TLT_NO: 'A01',
          tlt_name: '貓咪世界',
          BOOK_PayAmt: 1100,
          ACT_PayAmt: 1030,
          OVER_PayAmt: 70,
          MOD_PayAmt: 1030,
          check_status: 'N',
          check_usr_name: 'MEOW',
          isMissing: 'N',
          PAY_NAME: '信用卡',
          Settle_Date: '2025/07/25'
        },
        {
          id: 2,
          TXN_Date: '2025-07-22',
          ECR_No: 'ECR002',
          PAY_NO: '信用卡',
          TLT_NO: 'A02',
          tlt_name: '貓砂盆專賣',
          BOOK_PayAmt: 1200,
          ACT_PayAmt: 1110,
          OVER_PayAmt: 90,
          MOD_PayAmt: 1110,
          check_status: 'Y',
          check_usr_name: 'HANNAH',
          check_date: '2025-07-23 00:00:00',
          abnormalCheck: 'N',
          isMissing: 'Y',
          PAY_NAME: '現金',
          Settle_Date: '2025/07/24'
        },
      ];

      //抓第一筆資料設定
      const first = this.data[0];
      this.PAY_NO = first?.PAY_NO || '';
      this.TXN_Date = first?.TXN_Date || '';

      // 顯示當天的 mm/dd
      const today = new Date();
      this.todayDisplay = `${today.getMonth() + 1}/${today.getDate()}`;

      this.totalRecords = this.data.length;
      this.loading = false;
    }, 800);
  }
  onReview(selectedItems: any[]): void {
    console.log('Reviewing selected items:', selectedItems);
    // Add your logic for reviewing the selected items here
  }

}
