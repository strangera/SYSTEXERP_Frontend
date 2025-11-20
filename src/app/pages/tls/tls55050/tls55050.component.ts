import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { FunsrightInfo } from '../../../shared/models/system/funsrightInfo';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-tls55050',
  templateUrl: './tls55050.component.html',
  styleUrl: './tls55050.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, ButtonComponent, TranslateModule]
})
export class TLS55050Component {
  ProgNo: string = '250030';
  funInfo?: FunsrightInfo;



  loading: boolean = false;
  submitted: boolean = false;

  queryForm = this.formBuilder.group({

    billingYearMonth: [],
  });

  // Dropdown options
  vendorOptions: any[] = [];

  // Table data
  data: any[] = [
    { name: 'John', age: 25, email: 'john@example.com' },
    { name: 'Jane', age: 30, email: 'jane@example.com' },
    // Other data
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'name', header: 'Name', visible: true },
    { field: 'age', header: 'Age', visible: true },
    { field: 'email', header: 'Email', visible: true },
    // Other columns
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    // Initialize dropdown options
    // this.funInfo = this.authService.getUserPermissions(this.ProgNo);

  }

  canQuery(): boolean {
    return true;
  }

  canAdd(): boolean {
    return true;
  }

  canEdit(): boolean {
    return true;
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
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
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
      this.router.navigate(['/demoCRU'], extras);
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
}
