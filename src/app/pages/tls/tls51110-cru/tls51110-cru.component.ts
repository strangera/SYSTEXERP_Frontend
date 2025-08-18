import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { ValidationService } from '../../../shared/service/validation.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Tls51110Service } from '../../../service/api/tls/tls51110.service';
import { Subscription } from 'rxjs';
import { ExcelImportService } from '../../../shared/service/excel-import.service';
import { UserInfo } from '../../../shared/models/system/userInfo';
import { Tls51070Service } from '../../../service/api/tls/tls51070.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { NgIf } from '@angular/common';
export interface LogoBudget {
  id: [0];
  LOGO_No: string;
  YYYYMM: string;
  BUDGET: number;
  BUDGET_Cost: number;
  BUD_Status: string;
  BUD_Remark: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  CRT_Date?: string;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
  UPD_Date?: string;
}
interface LogoOption {
  No: string;
  Name: string;
  label?: string;
}
@Component({
  selector: 'app-tls51110-cru',
  templateUrl: './tls51110-cru.component.html',
  styleUrls: ['./tls51110-cru.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    DropdownComponent,
    InputNumberComponent,
    InputTextComponent,
    NgIf,
    TranslateModule,
  ],
})
export class TLS51110CRUComponent
  extends BasicCruPageComponent<LogoBudget>
  implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    id: [0],
    LOGO_No: ['', Validators.required],
    YYYYMM: [''],
    YYYYMM2: ['', Validators.required],
    BUDGET: [0, Validators.required],
    BUDGET_Cost: [0],
    BUD_Status: ['0'], // 預設未審核
    BUD_Remark: [''],
    CRT_USR_No: [''],
    CRT_USR_Name: [''],
    CRT_Date: [''],
    UPD_USR_No: [''],
    UPD_USR_Name: [''],
    UPD_Date: [''],
  });

  LOGO_No_Option: any[] = [];

  BUD_Status_Option: any = [
    { value: '0', label: '未審核' },
    { value: '1', label: '已審核' },
  ];

  private userSubscription: Subscription | undefined;
  userInfo: UserInfo | null = null;

  constructor(
    private excelImportService: ExcelImportService,
    private validationService: ValidationService,
    private translate: TranslateService,
    private apiService: Tls51110Service,
    private tls51070Service: Tls51070Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51110', this.dataForm);
    this.userSubscription = this.authService.user.subscribe(
      (userInfo: UserInfo | null) => {
        this.userInfo = userInfo;
        console.log(this.userInfo);
      },
    );
    this.tls51070Service.queryPLULOGO_DropDownList({}).subscribe({
      next: (res) => {
        this.LOGO_No_Option = res.Data.map((item: LogoOption) => ({
          ...item,
          label: `${item.No} - ${item.Name}`,
        }));
      },
      error: (err) => {
        console.error('載入品牌失敗', err);
      },
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();

      let formattedYYYYMM = '';
      if (formValue.YYYYMM2 instanceof Date) {
        const year = formValue.YYYYMM2.getFullYear();
        const month = ('0' + (formValue.YYYYMM2.getMonth() + 1)).slice(-2);
        formattedYYYYMM = `${year}${month}`;
      } else if (typeof formValue.YYYYMM === 'string') {
        formattedYYYYMM = formValue.YYYYMM.replace('/', '');
      }

      const body = {
        ...formValue,
        YYYYMM: formattedYYYYMM,
      };

      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            body.BUD_Status = '0';
            this.apiService.insertTLS51110(body).subscribe(() => {
              this.messageService.successBubble(
                this.translate.instant('success_message'),
              );
              this.dataForm.reset();
            });
          }
          break;

        case CRUDStatus.Edit:
          if (this.canEdit()) {
            this.apiService.updateTLS51110(body).subscribe(() => {
              this.messageService.successBubble(
                this.translate.instant('updated-successfully'),
              );
              this.onCancel();
            });
          }
          break;
      }
    });
  }

  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);

    if (rowdata.BUD_Status === '1') {
      this.dataForm.disable();
    } else {
      this.dataForm.enable();
    }
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }
  onFileChange(event: any) {
    const file = event.target.files[0];
    const columns = ['品牌代碼', '品牌名稱', '年月(YYYYMM)', '預算', '成本', '備註(100字元)'];
    this.excelImportService.importExcel(file, columns).then((data) => {
      console.log('匯入資料', data);
    });
  }
}
