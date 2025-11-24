
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
// Shared
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

@Component({
  selector: 'app-fin63040',
  templateUrl: './fin63040.component.html',
  styleUrl: './fin63040.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, CalendarRangeComponent, InputTextComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class FIN63040Component extends BasicQpageComponent implements OnInit {



  queryForm = this.formBuilder.group({
    startdate: [],
    enddate: [],
    FNCCode: [],
    Accountcode: [],
    display: [],
    display2: [],
    Ticketnumber: [],
    Duesummonsnumber: [],
    status: [],
  });

  // Dropdown options
  statusOptions: any[] = [
    { value: 1, label: '未異動' },
    { value: 2, label: '到期' },
    { value: 3, label: '兌現' },
  ];
  FNCCodeOptions: any[] = [];
  AccountcodeOptions: any[] = [];
  displayOptions: any[] = [];
  displayOptions2: any[] = [];

  // Table data
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'ticketNumber', header: '票據號碼', visible: true },
    { field: 'vendorCode', header: '廠客代號', visible: true },
    { field: 'companyBankAccountCode', header: '公司銀行科目代號', visible: true },
    { field: 'issueDate', header: '開票日', visible: true },
    { field: 'dueDate', header: '到期日', visible: true },
    { field: 'cashDate', header: '兌現日', visible: true },
    { field: 'faceAmount', header: '票面金額', visible: true },
    { field: 'ticketHead', header: '票據抬頭', visible: true },
    { field: 'remark', header: '備註', visible: true },
    { field: 'status', header: '狀態', visible: true }
  ];




  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '160011';

  }



  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // Submit logic here
    }

    this.loading = false;
    this.notificationService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['FIN3000/FIN34030CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demoCRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demoCRU'], extras);
  }
  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }
}
