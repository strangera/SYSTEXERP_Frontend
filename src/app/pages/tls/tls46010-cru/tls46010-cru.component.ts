import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { ValidationService } from '../../../shared/service/validation.service';
import { TranslateService } from '@ngx-translate/core';
// import { Tls46010Service } from '../../../service/api/tls/tls46010.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Tls46010Service } from '../../../service/api/tls/tls46010.service';
import { Subscription } from 'rxjs';
import { UserInfo } from '../../../shared/models/system/userInfo';
export interface Pos10015 {
  id: number;
  SYS_StoreNo: string;
  SYS_SrvNo: string;
  SYS_SrvIP: string;
  SYS_SrvPort: number;
  SYS_SrvStatus: 'A' | 'C'; //主機狀態,「A.啟用」與「C.停用」,預設值為「A」
  SYS_SrvName?: string;
  SYS_SrvUsrID?: string;
  SYS_SrvUsrPwd?: string;
  SYS_SRVDDir?: string;
  SYS_SRVUDir?: string;
  SYS_MyPOSDDir?: string;
  SYS_MyPOSUDir?: string;
  SYS_SRVDDirClt?: string;
  SYS_SRVUDirClt?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  CRT_Date?: string;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
  UPD_Date?: string;
}


@Component({
  selector: 'app-tls46010-cru',
  templateUrl: './tls46010-cru.component.html',
  styleUrls: ['./tls46010-cru.component.scss']
})
export class TLS46010CRUComponent extends BasicCruPageComponent<Pos10015> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    id: [0],
    SYS_SrvNo: ['', [Validators.required, Validators.maxLength(8)]],
    SYS_SrvStatus: ['A', [Validators.required]],
    SYS_SrvIP: ['', [Validators.required, Validators.maxLength(40)]],
    SYS_SrvPort: [20, [Validators.required]],
    SYS_SrvName: [''],
    SYS_SrvUsrID: [''],
    SYS_SrvUsrPwd: [''],
    SYS_SRVDDir: [''],
    SYS_SRVUDir: [''],
    SYS_MyPOSDDir: [''],
    SYS_MyPOSUDir: [''],
    SYS_SRVDDirClt: [''],
    SYS_SRVUDirClt: [''],
    CRT_USR_No: [''],
    CRT_USR_Name: [''],
    CRT_Date: [''],
    UPD_USR_No: [''],
    UPD_USR_Name: [''],
    UPD_Date: ['']
  });

  SYS_SrvStatus_Option: any = [
    { value: 'A', label: '啟用' },
    { value: 'C', label: '停用' }
  ];
  private userSubscription: Subscription | undefined; // 使用者訂閱
  userInfo: UserInfo | null = null;
  constructor(
    private validationService: ValidationService,
    private translate: TranslateService,
    private apiService: Tls46010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS46010', this.dataForm);
    // 禁止編輯店號
    this.dataForm.get('SYS_StoreNo')?.disable();
    this.userSubscription = this.authService.user.subscribe((userInfo: UserInfo | null) => {
      this.userInfo = userInfo;
      console.log(this.userInfo);
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue(); // ✅ 包含 disabled 欄位
      const body = {
        ...formValue,
        SYS_StoreNo: this.userInfo?.SYS_StoreNo
      }
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            this.apiService.insertTLS0000(body).subscribe(() => {
              this.messageService.successBubble(this.translate.instant('success_message'));
              this.dataForm.reset();
            });
          }
          break;

        case CRUDStatus.Edit:
          if (this.canEdit()) {
            this.apiService.updateTLS46010(body).subscribe(() => {
              this.messageService.successBubble(this.translate.instant('updated-successfully'));
              this.onCancel();
            });
          }
          break;
      }
    });
  }

  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  // onCancel() {
  //   this.router.navigate(['/TLS4000/TLS46010']);
  // }
}
