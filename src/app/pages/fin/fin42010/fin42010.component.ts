import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// Services
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { TranslateModule } from '@ngx-translate/core';
import { FIN42010Data } from '@service/api/fin/fin42010.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

@Component({
  selector: 'app-fin42010',
  templateUrl: './fin42010.component.html',
  styleUrl: './fin42010.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, RadiobuttonComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class FIN42010Component extends BasicQueryPageComponent<FIN42010Data> implements OnInit {
  // Upload files
  fileType = '';
  uploadUrl = 'https://www.primefaces.org/cdn/api/upload.php';
  queryForm = this.formBuilder.group({
    year: [],
    version: [],
    organizationNumber: ['', Validators.required],
    month: [],
    amountStart: [], // 金額 起
    amountEnd: [], // 金額 迄
    remark: [],
    status: [],
    department: [],
    unit: [],
  });

  // Dropdown options
  FNCCodeOptions = [];
  AccountcodeOptions = [];
  departmentOptions = [];
  displayOptions2 = [];
  AnalysisdateCOptions = [];
  vendorOptions = [];
  FlippingstateOptions = [];
  organizationNumberOptions = [];
  statusOptions = [{ value: 1, label: '是' },
  { value: 2, label: '否' }];
  unitOptions = [{ value: 1, label: '元' },
  { value: 2, label: '千' },
  { value: 3, label: '萬' }];


  // Table data
  data: FIN42010Data[] = [];
  filteredData = [...this.data];
  columns = [
    { field: 'subjectCode', header: '科目代號', visible: true },
    { field: 'subjectName', header: '科目名稱', visible: true },
    { field: 'january', header: '1月', visible: true },
    { field: 'february', header: '2月', visible: true },
    { field: 'march', header: '3月', visible: true },
    { field: 'april', header: '4月', visible: true },
    { field: 'may', header: '5月', visible: true },
    { field: 'june', header: '6月', visible: true },
    { field: 'july', header: '7月', visible: true },
    { field: 'august', header: '8月', visible: true },
    { field: 'september', header: '9月', visible: true },
    { field: 'october', header: '10月', visible: true },
    { field: 'november', header: '11月', visible: true },
    { field: 'december', header: '12月', visible: true },
    { field: 'totalBudget', header: '預算總金額', visible: true },
  ];

  constructor(
    // private router: Router,
    // private formBuilder: FormBuilder,
    private notificationService: NotificationService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '140005';
    this.initializePage('FIN42010', 'fin/fin42010cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    // if (frm.valid && this.canQuery()) {
    //   // Submit logic here
    // }

    this.loading = false;
    this.notificationService.unblockUi();

    // 模擬查詢結果
    this.data = [
      {
        subjectCode: '41',
        subjectName: '銷貨收入',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        totalBudget: 0
      },
    ];
    this.filteredData = [...this.data];
  }

  // onCreate() {
  //   if (this.canAdd()) {
  //     const extras: NavigationExtras = {
  //       state: {
  //         crudstatus: CRUDStatus.Create,
  //         queryform: this.queryForm,
  //       },
  //       skipLocationChange: true,
  //     };
  //     this.router.navigate(['FIN3000/FIN34030CRU'], extras);
  //   }
  // }

  // onEdit(data: any) {
  //   if (this.canEdit()) {
  //     const extras: NavigationExtras = {
  //       state: {
  //         crudstatus: CRUDStatus.Edit,
  //         rowdata: data,
  //         queryform: this.queryForm,
  //       },
  //       skipLocationChange: true,
  //     };
  //     this.router.navigate(['/demoCRU'], extras);
  //   }
  // }

  // onDetail(data: any) {
  //   const extras: NavigationExtras = {
  //     state: {
  //       crudstatus: CRUDStatus.Read,
  //       rowdata: data,
  //       queryform: this.queryForm,
  //     },
  //     skipLocationChange: true,
  //   };
  //   this.router.navigate(['/demoCRU'], extras);
  // }
}
