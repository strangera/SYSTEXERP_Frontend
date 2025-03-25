import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';


@Component({
  selector: 'app-cpm25020',
  templateUrl: './cpm25020.component.html',
  styleUrls: ['./cpm25020.component.scss'],
})
export class CPM25020Component extends BasicQpageComponent implements OnInit {


  queryForm = this.formBuilder.group({
    marketingCampaignCode: [],
    campaignName: [],
    suppliesCondition: [],
    returnStatus: [],
  });

  marketingCampaignOptions = [
    { value: '001', label: '春季促銷' },
    { value: '002', label: '夏季活動' },
  ];

  suppliesConditionOptions = [
    { value: 1, label: '請購' },
    { value: 2, label: '借用' },
    { value: 3, label: '贈送' },
    { value: 4, label: '租賃' },
  ];

  returnStatusOptions = [
    { value: 1, label: '未歸還' },
    { value: 2, label: '部分歸還' },
    { value: 3, label: '全部歸還' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,

  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '520022';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);


  
  }

  onSubmit(form: FormGroup): void {
    console.log(form.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (form.valid && this.canQuery()) {
      // 提交的邏輯在此處處理
    }

    this.loading = false;
    this.notificationService.unblockUi();
  }

  onSubmitQuery(form: FormGroup): void {
    this.onSubmit(form);
  }

  onClearForm(): void {
    this.queryForm.reset();
  }

  onCreate(): void {
    if (this.canAdd()) {
      const extras: NavigationExtras = {
        state: { crudstatus: CRUDStatus.Create, queryform: this.queryForm },
        skipLocationChange: true,
      };
      this.router.navigate(['FIN3000/FIN34030CRU'], extras);
    }
  }

  onEdit(data: any): void {
    if (this.canEdit()) {
      const extras: NavigationExtras = {
        state: { crudstatus: CRUDStatus.Edit, rowdata: data, queryform: this.queryForm },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }

  onDetail(data: any): void {
    const extras: NavigationExtras = {
      state: { crudstatus: CRUDStatus.Read, rowdata: data, queryform: this.queryForm },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
}
