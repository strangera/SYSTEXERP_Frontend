import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { Subscription } from 'rxjs';
import { Tls51070Service } from '../../../service/api/tls/tls51070.service';
import { Tls51110Service } from '../../../service/api/tls/tls51110.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { UserInfo } from '../../../shared/models/system/userInfo';
import { ExcelImportService, ImportExcelColumn } from '../../../shared/service/excel-import.service';
import { ValidationService } from '../../../shared/service/validation.service';
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
    BUD_Status: ['0'],
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

    // 設置預算金額監聽器
    this.setupBudgetListener();

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
    });
  }

  private setupBudgetListener(): void {
    // 監聽預算金額變更，自動設定成本欄位
    this.dataForm.get('BUDGET')?.valueChanges.subscribe(budgetValue => {
      console.log('預算金額變更:', budgetValue, '當前CRUD狀態:', this.crudstatus);

      if (budgetValue !== null && budgetValue !== undefined && budgetValue > 0) {
        const currentCost = this.dataForm.get('BUDGET_Cost')?.value;
        console.log('目前成本值:', currentCost);

        // 在新增模式下，總是更新成本欄位
        if (this.crudstatus === CRUDStatus.Create) {
          console.log('設定成本為:', budgetValue);
          this.dataForm.get('BUDGET_Cost')?.setValue(budgetValue, { emitEvent: false });
        }
      }
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
    const importExcelColumn: ImportExcelColumn[] = [
      { field: 'LOGO_No', header: '品牌代碼', type: 'string' },
      { field: 'LOGO_Name', header: '品牌名稱', type: 'string' },
      { field: 'YYYYMM', header: '年月(YYYYMM)', type: 'string' },
      { field: 'BUDGET', header: '預算', type: 'number' },
      { field: 'BUDGET_Cost', header: '成本', type: 'number' },
      { field: 'BUD_Remark', header: '備註(100字元)', type: 'string' },
    ]
    this.excelImportService.importExcel(file, importExcelColumn).then((data) => {
      console.log('匯入資料', data);
    });
  }
}
