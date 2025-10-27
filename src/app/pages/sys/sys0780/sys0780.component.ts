import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { SystemTypeDetailService } from '../../../service/basic/system-type-detail.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-sys0780',
  templateUrl: './sys0780.component.html',
  styleUrls: ['./sys0780.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    ButtonComponent,
    TranslateModule,
  ],
})
// 作業權限申請表
export class SYS0780Component extends BasicQpageComponent implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    systemTypeDetail: ['', [Validators.required]], // DropDown
  });
  // Options
  systemTypeDetailOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private systemTypeDetailService: SystemTypeDetailService
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '420015';
    // 初始化權限資訊
    this.systemTypeDetailService.getSystemTypes().subscribe((data) => {
      this.systemTypeDetailOptions = data;
    });
  }

  onSubmitNext(frm: FormGroup) {
    this.onNext(frm);
  }

  onNext(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      this.router.navigate(['/SYS0000/SYS0310CRU']);
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }
}
