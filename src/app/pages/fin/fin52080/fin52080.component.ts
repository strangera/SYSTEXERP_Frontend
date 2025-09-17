import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatDateTime } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '@shared/service/validation.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { FIN15090Service } from '@service/api/fin/fin15090.service';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { apiOption } from '@shared/models/sys/sysb000.model';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';

export interface testDorm {
  AccNo: string, // 科目代號
  AccCname: string, // 科目名稱
  AccEname: string, // 科目英文名稱
  AccDC: string, // 借/貸
  Ledger_MD: string, // 統制/明細
  ClassNo: string, // 三碼代號
  ABAT_YN: string, // 是否為沖帳代號
  Voucher_Type: string, // 傳票格式
  Budget_YN: string, // 是否為預算科目
  Org_YN: string, // 是否設定部門代號
  rest_value: number, // 折舊攤提年限
  rest_value2: number, // 殘值年限
  Input_YN: string, // 是否可輸

  //---可能也會需要下面這些---
  CRT_Date?: Date,
  CRT_USR_No?: string,
  CRT_USR_Name?: string,
  UPD_Date?: Date,
  UPD_USR_No?: string,
  UPD_USR_Name?: string,
}

@Component({
  selector: 'app-fin52080',
  templateUrl: './fin52080.component.html',
  styleUrl: './fin52080.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    DropdownComponent,
    MultiSelectComponent,
    InputTextComponent,
    InputNumberComponent,
    InputTextRangeComponent,
    TableComponent,
    TranslateModule
  ]
})
// 
export class FIN52080Component extends BasicQueryPageComponent<testDorm> implements OnInit {
  queryForm = this.formBuilder.group({
      //會計科目代號維護
      AccNo: ['', [Validators.maxLength(8)]], //  科目代號
      AccCname: ['', [ Validators.maxLength(40)]], // 科目名稱
      AccEname: ['', [Validators.maxLength(50) ]], // 科目英文名稱 (非必填)
      AccDC: [[]], //  借/貸
      Ledger_MD: [[]], //  統制/明細
      ClassNo: [[]], //  三碼代號
      ABAT_YN: [[]], //  是否為沖帳代號
      Voucher_Type: [[]], //  傳票格式
      Budget_YN: [[]], //  是否為預算科目
      Org_YN: [[]], //  是否設定部門代號
      rest_value: [null, [ Validators.maxLength(10),this.validationService.numberValidator]], //  折舊攤提年限
      rest_value2: [null, [ Validators.maxLength(10),this.validationService.numberValidator]], //  殘值年限
      Input_YN: [[]], //  是否可輸
                    
      ...createPaginationConfig([{ field: 'AccNo', order: 1 }]), // 分頁和排序參數
    });
    
    ClassNo_Option: apiOption[] = [ //中類代碼
      {No: '1', Name: '下拉1'},
      {No: '2', Name: '下拉2'},
      {No: '3', Name: '下拉3'}
    ]

    AccDC_Option: apiOption[] = [ // 借/貸
      {No: '0', Name: '借'},
      {No: '1', Name: '貸'}
    ]

    Ledger_MD_Option: apiOption[] = [ // 統制/明細
      {No: '0', Name: '統制'},
      {No: '1', Name: '明細'}
    ]

    whether_Option: apiOption[] = [ // 是否
      {No: 'Y', Name: '是'},
      {No: 'N', Name: '否'}
    ]

    Voucher_Type_Option: apiOption[] = [ // 傳票格式
      {No: '0', Name: '無特定'},
      {No: '1', Name: '應付票據'},
      {No: '2', Name: '應收票據'},
      {No: '3', Name: '應付帳款'},

      {No: '4', Name: '應收帳款'},
      {No: '5', Name: '進項稅額'},
      {No: '6', Name: '銷項稅額'},
      {No: '7', Name: '銀行存款'},

      {No: 'A', Name: '應付費用'},
      {No: 'B', Name: '代收稅款'},
      {No: 'C', Name: '固定資產'},
      {No: 'D', Name: '現金'},
      {No: 'E', Name: '應收保證票據'}
    ]
              
    totalRecords = 0;// 分頁和排序參數 // 排序需要
    data: testDorm[] = [];
    selectedRows: testDorm[] = [];
                      
    columns: Column[] = [ //先放可視範圍內的
      { field: 'AccNo', header: '科目代號', visible: true }, // 科目代號
      { field: 'AccCname', header: '科目名稱', visible: true }, // 科目名稱
      { field: 'AccEname', header: '科目英文名稱', visible: true }, // 科目英文名稱
      { field: 'AccDC', header: '借/貸', visible: true, options: this.AccDC_Option }, // 借/貸
      { field: 'Ledger_MD', header: '統制/明細', visible: true, options: this.Ledger_MD_Option }, // 統制/明細
      { field: 'ClassNo', header: '三碼代號', visible: true }, // 三碼代號
      { field: 'ABAT_YN', header: '是否為沖帳代號', visible: true }, // 是否為沖帳代號
      { field: 'Voucher_Type', header: '傳票格式', visible: true, options: this.Voucher_Type_Option }, // 傳票格式
      { field: 'Budget_YN', header: '是否為預算科目', visible: true, options: this.whether_Option }, // 是否為預算科目
      { field: 'Org_YN', header: '是否設定部門代號', visible: true, options: this.whether_Option }, // 是否設定部門代號
      { field: 'Input_YN', header: '是否可輸', visible: true, options: this.whether_Option }, // 是否可輸
              
      { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime }, // 建立日期
      { field: 'CRT_USR_No', header: '建立人員', visible: false }, // 建立人員
      { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false }, // 建立人員姓名
      { field: 'CRT_Date', header: '變更日期', visible: false, format: formatDateTime }, // 變更日期
      { field: 'CRT_USR_No', header: '變更人員', visible: false }, // 變更人員
      { field: 'CRT_USR_Name', header: '變更人員姓名', visible: false }, // 變更人員姓名
    ];
              
    constructor(
      private fin15090Service: FIN15090Service,
      private validationService: ValidationService
      ) {
        super(); // 呼叫父類建構子
    }
                
    ngOnInit(): void {
      this.initializePage('FIN52080', '/FIN/FIN52080cru', this.queryForm, (form) => this.onSubmit(form));
    }
                
    onSubmit(frm: FormGroup) {
      this.handleSubmit(frm, () => {
        const body = {
           ...frm.value,
        }
              
        console.log('對象及對帳維護作業 request', body);
        
              // Voucher_Type: string, // 傳票格式
              // Budget_YN: string, // 是否為預算科目
              // Org_YN: string, // 是否設定部門代號
              // rest_value: number, // 折舊攤提年限
              // rest_value2: number, // 殘值年限
              // Input_YN: string, // 是否可輸

        this.data = [
          { 
            "AccNo": "1101",
            "AccCname": "庫存現金",
            "AccEname": "",
            "AccDC": "0",
            "Ledger_MD": "0",
            "ClassNo": '110',
            "ABAT_YN": "N",
            "Voucher_Type": "0",
            "Budget_YN": "N",
            "Org_YN": "Y",
            "rest_value": 1,
            "rest_value2":1,
            "Input_YN": "N"
          }
        ];
        
        this.loading = false;
              
        // this.fin15090Service.PrintFIN15090(body).pipe(untilDestroyed(this)).subscribe({
        //   next: (response) => {
        //     this.data = response.Data;
        //     console.log('對象及對帳維護作業 response', response);
        //     this.totalRecords = response.TotalCount;
        //     this.queryStateService.setQueryState(this.ProgNo, frm.value);
        //     this.loading = false;
        //   },
        //   error: () => { this.loading = false; },
        // });
      });
    }
    // 刪除控制_Grace 9/9: 
    // GLS6002 GLS3002若有對象別編號不可刪除
    onDelete(selectedRows: testDorm[]) {
      // const ids = selectedRows.map(row => row.id);
      // this.fin14010Service.deleteFIN11020(ids).pipe(untilDestroyed(this)).subscribe({
      //   next: () => {
      //     this.onSubmit(this.queryForm);
      //     this.selectedRows = [];
      //   },
      //   error: () => { this.loading = false; },
      // });
    }
                
    isRowSelectable(row: testDorm) {
      // return row.CanDel;
      return true
    }
}
