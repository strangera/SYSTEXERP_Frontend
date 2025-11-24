import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

@Component({
  selector: 'app-fin41030',
  templateUrl: './fin41030.component.html',
  styleUrl: './fin41030.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class FIN41030Component extends BasicQpageComponent implements OnInit {
  // Upload files
  fileType: string = '';
  uploadUrl: string = 'https://www.primefaces.org/cdn/api/upload.php';
  queryForm = this.formBuilder.group({
    year: [],
    version: [],
    organizationNumber: [, Validators.required],
    month: [],
    amountStart: [], // 金額 起
    amountEnd: [], // 金額 迄
    remark: [],
    status: [],
  });

  // Dropdown options

  FNCCodeOptions: any[] = [];
  AccountcodeOptions: any[] = [];
  displayOptions: any[] = [];
  displayOptions2: any[] = [];
  AnalysisdateCOptions: any[] = [];
  vendorOptions: any[] = [];
  FlippingstateOptions: any[] = [];
  organizationNumberOptions: any[] = [];
  statusOptions: any[] = [{ value: 1, label: '是' },
  { value: 1, label: '否' }
  ];
  // Table data
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'year', header: '年度', visible: true },
    { field: 'version', header: '版本', visible: true },
    { field: 'reviewStatus', header: '審核狀態', visible: true },
  ];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '140003';
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
    this.router.navigate(['FIN4000/FIN41030CRU']);
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
      this.router.navigate(['FIN4000/FIN41030CRU'], extras);
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
    this.queryForm.reset(); // 重置表單
  }
}
