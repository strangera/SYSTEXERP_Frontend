import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { LocationCodeService } from '../../../service/basic/locationcode.service';
import { FloorService } from '../../../service/basic/floor.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cpm25060',
  templateUrl: './cpm25060.component.html',
  styleUrl: './cpm25060.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, InputTextComponent, ButtonComponent, TranslateModule]
})
export class CPM25060Component extends BasicQpageComponent implements OnInit {


  queryForm = this.formBuilder.group({
    startYear: [],
    endYear: [],
    startQuarter: [],
    endQuarter: [],
    marketingCampaignCode: [],
    campaignName: [],
  });

  marketingCampaignOptions = [
    { value: '001', label: '活動檔期一' },
    { value: '002', label: '活動檔期二' }
  ];

  season = [
    { value: 1, label: '第一季' },
    { value: 2, label: '第二季' },
    { value: 3, label: '第三季' },
    { value: 4, label: '第四季' }
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private organizationNumberService: OrganizationNumberService,
    private locationCodeService: LocationCodeService,
    private floorService: FloorService,
    private userCodeService: UserCodeService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '520026';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

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

  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }

  onCreate() {
    if (this.canAdd()) {
      const extras: NavigationExtras = {
        state: { crudstatus: CRUDStatus.Create, queryform: this.queryForm },
        skipLocationChange: true
      };
      this.router.navigate(['FIN3000/FIN34030CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      const extras: NavigationExtras = {
        state: { crudstatus: CRUDStatus.Edit, rowdata: data, queryform: this.queryForm },
        skipLocationChange: true
      };
      this.router.navigate(['/demoCRU'], extras);
    }
  }

  onDetail(data: any) {
    const extras: NavigationExtras = {
      state: { crudstatus: CRUDStatus.Read, rowdata: data, queryform: this.queryForm },
      skipLocationChange: true
    };
    this.router.navigate(['/demoCRU'], extras);
  }
}
