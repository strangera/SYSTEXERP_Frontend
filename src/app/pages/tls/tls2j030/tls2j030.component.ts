import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { NgIf } from '@angular/common';
// import { TLS2j030Service } from '@service/api/tls/tls2j030.service';



// 2.2.18.3 後台發票換開補登作業
@Component({
  selector: 'app-tls2j030',
  templateUrl: './tls2j030.component.html',
  styleUrl: './tls2j030.component.scss',
  standalone: true,
  imports: [NgIf,TableComponent, ButtonComponent, DropdownComponent, CalendarRangeComponent, InputTextComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, TranslateModule]
})
export class TLS2J030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    CHG_No: ['', [Validators.maxLength(12)]],
    TXN_Date_Start: [''],
    TXN_Date_End: [''],
    GUI_INPUTDATE_Start: [new Date(), Validators.required],//換開日期起,必填
    GUI_INPUTDATE_End: [new Date(), Validators.required],//換開日期迄,必填
    TXN_GUIBegNo: ['', [Validators.maxLength(10)]],
    GUI_STATS: ['0'],
    ...createPaginationConfig([{ field: 'tlt_no', order: 1 }])
  });
  totalRecords = 0;
  data: any[] = [];
  selectedItems: any[] = [];
  isNotECR = false;


  GUI_STATS_Options = [
    { label: '正常', value: '0' },
    { label: '刪除', value: '1' }
  ];
  columns: Column[] = [
    { field: 'tlt_no', header: '換開編號', visible: true },
    { field: 'tlt_name', header: '換開日期', visible: true },
    { field: 'txn_TotGUI', header: '來源發票日期', visible: true },
    { field: 'txn_TotSaleAmt', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '交易序號', visible: true },
    { field: 'tlt_name', header: '來源發票號碼', visible: true },
    { field: 'tlt_no', header: '換開狀態', visible: true },
    { field: 'tlt_name', header: '刪除日期', visible: true },
    { field: 'tlt_no', header: '建立日期', visible: true },
    { field: 'tlt_name', header: '建立人員編號', visible: true },
    { field: 'tlt_no', header: '建立人員姓名', visible: true },
    { field: 'tlt_name', header: '變更日期', visible: true },
    { field: 'tlt_no', header: '變更人員編號', visible: true },
    { field: 'tlt_name', header: '變更人員姓名', visible: true },
  ];

  constructor(
    private dropDownListService: DropDownListService,
    // private tls2j030Service: TLS2j030Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2J030', 'TLS/TLS2J030cru', this.queryForm, (form) => this.onSubmit(form));

    // this.checkECRMachine();

  }
  // private checkECRMachine() {
  //   const ip = this.authService.currentUserValue?.client_ip;
  //   if (!ip) {
  //     this.isNotECR = true;
  //     return;
  //   }

  //   this.tls2j030Service.checkECR(ip).subscribe({
  //     next: (res) => {
  //       this.isNotECR = !res.isValid;
  //     },
  //     error: () => {
  //       this.isNotECR = true;
  //     },
  //   });
  // }



  onSubmit(frm: FormGroup) {
    if (this.isNotECR) return;
    this.handleSubmit(frm, () => {

    });
  }
}
