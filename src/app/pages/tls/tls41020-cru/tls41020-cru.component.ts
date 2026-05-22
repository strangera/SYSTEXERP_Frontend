import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { TLS41020Service } from '../../../service/api/tls/tls41020.service';
import { ECRNoService } from '../../../service/basic/queryPOS1002.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

@Component({
  selector: 'app-tls41020-cru',
  templateUrl: './tls41020-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    ButtonComponent,
    NgIf,
    TranslateModule,
    CalendarRangeComponent,
  ],
})
export class TLS41020CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  ECRNoOptions: any[] = [];
  EDC_Status_Option = [
    { value: 'A', label: '啟用' },
    { value: 'C', label: '停用' },
  ];

  // 抽出統一的 IP Pattern
  readonly ipPattern = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;

  dataForm = this.formBuilder.nonNullable.group({
    id: [''],
    SYS_StoreNo: [''],
    ECR_No: ['', [Validators.required, Validators.maxLength(10)]],
    EDC_BegDate: ['', Validators.required],
    EDC_EndDate: ['', Validators.required],
    EDC_Status1: ['', Validators.required],
    EDC_Status2: [''],
    EDC_Status3: [''],
    // ✅ 加入第 4、5 台狀態
    EDC_Status4: [''],
    EDC_Status5: [''],
    EDC_IP1: [
      '',
      [
        Validators.required,
        Validators.maxLength(20),
        Validators.pattern(this.ipPattern),
      ],
    ],
    EDC_IP2: ['', [Validators.maxLength(20), Validators.pattern(this.ipPattern)]], // 補上格式驗證
    EDC_IP3: ['', [Validators.maxLength(20), Validators.pattern(this.ipPattern)]], // 補上格式驗證
    // ✅ 加入第 4、5 台 IP 與格式驗證
    EDC_IP4: ['', [Validators.maxLength(20), Validators.pattern(this.ipPattern)]],
    EDC_IP5: ['', [Validators.maxLength(20), Validators.pattern(this.ipPattern)]],
    EDC_TmID1: ['', [Validators.required, Validators.maxLength(8)]],
    EDC_TmID2: ['', [Validators.maxLength(8)]],
    EDC_TmID3: ['', [Validators.maxLength(8)]],
    // ✅ 加入第 4、5 台端末機代碼
    EDC_TmID4: ['', [Validators.maxLength(8)]],
    EDC_TmID5: ['', [Validators.maxLength(8)]],
  });

  constructor(
    private tls41020Service: TLS41020Service,
    private ECRNoService: ECRNoService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS41020', this.dataForm);
    const id = this.dataForm.get('id')?.value;
    if (id != null) {
      this.dataForm.patchValue({ id: String(id) });
    }
    this.updateDisabledState();

    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions = res?.map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      })) || [];
    });
  }

  private updateDisabledState(): void {
    if (this.crudstatus === CRUDStatus.Edit) {
      const editableFields = [
        'EDC_BegDate',
        'EDC_EndDate',
        'EDC_Status',
        'ECR_TLT_No',
        'ECR_TLT_Name',
        'EDC_Status1',
        'EDC_Status2',
        'EDC_Status3',
        'EDC_Status4', // ✅ 編輯狀態解鎖
        'EDC_Status5', // ✅ 編輯狀態解鎖
        'EDC_IP1',
        'EDC_IP2',
        'EDC_IP3',
        'EDC_IP4', // ✅ 編輯狀態解鎖
        'EDC_IP5', // ✅ 編輯狀態解鎖
        'EDC_TmID1',
        'EDC_TmID2',
        'EDC_TmID3',
        'EDC_TmID4', // ✅ 編輯狀態解鎖
        'EDC_TmID5', // ✅ 編輯狀態解鎖
      ];
      Object.keys(this.dataForm.controls).forEach((key) => {
        const control = this.dataForm.get(key);
        if (editableFields.includes(key)) {
          control?.enable();
        } else {
          control?.disable();
        }
      });
    } else if (this.crudstatus === CRUDStatus.Read) {
      this.dataForm.disable();
    } else {
      this.dataForm.enable();
    }
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const payload = form.getRawValue();
      const userInfoStr = localStorage.getItem('UserInfo');
      const storeNo = userInfoStr ? JSON.parse(userInfoStr)?.SYS_StoreNo : null;
      if (this.crudstatus === CRUDStatus.Create && storeNo) {
        payload.SYS_StoreNo = storeNo;
      }

      const toDateOnly = (value: any): string => {
        if (!value) return '';
        const d = value instanceof Date ? value : new Date(value);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      };
      payload.EDC_BegDate = toDateOnly(payload.EDC_BegDate);
      payload.EDC_EndDate = toDateOnly(payload.EDC_EndDate);

      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            this.tls41020Service.insertTLS41020(payload).subscribe({
              next: () => {
                this.messageService.successBubble('新增成功');
                this.dataForm.reset();
              },
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            this.tls41020Service.updateTLS41020(payload).subscribe(() => {
              this.messageService.successBubble('更新成功');
              this.onCancel();
            });
          }
          break;
      }
    });
  }

  onClearForm(): void {
    this.dataForm.reset();
    this.updateDisabledState();
  }

  override onCancel(): void {
    sessionStorage.setItem('TLS41020_fromCru', '1');
    this.router.navigate(['/account/tls', 'tls41020'], {
      state: { fromCru: true },
    });
  }
}
