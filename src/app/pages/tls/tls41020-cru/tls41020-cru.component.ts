import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { TranslateModule } from '@ngx-translate/core';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';
import { TLS41020Service } from '../../../service/api/tls/tls41020.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';

// 2.4.1.2 收銀機EDC資料維護 CRU
@Component({
  selector: 'app-tls41020-cru',
  templateUrl: './tls41020-cru.component.html',
  styleUrl: './tls41020-cru.component.scss',
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
export class TLS41020CRUComponent
  extends BasicCruPageComponent<any>
  implements OnInit
{
  ECRNoOptions: any[] = [];
  EDC_Status_Option = [
    { value: 'A', label: '啟用' },
    { value: 'C', label: '停用' },
  ];

  dataForm = this.formBuilder.nonNullable.group({
    id: [''],
    SYS_StoreNo: [''],
    ECR_No: ['', [Validators.required, Validators.maxLength(10)]],
    EDC_No: ['', [Validators.required, Validators.maxLength(10)]],
    EDC_BegDate: ['', Validators.required],
    EDC_EndDate: ['', Validators.required],
    EDC_Status1: ['', Validators.required],
    EDC_Status2: [''],
    EDC_Status3: [''],
    EDC_IP1: [
      '',
      [
        Validators.required,
        Validators.maxLength(20),
        Validators.pattern(
          /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/,
        ),
      ],
    ],
    EDC_IP2: ['', [Validators.maxLength(20)]],
    EDC_IP3: ['', [Validators.maxLength(20)]],
    EDC_TmID1: ['', [Validators.required, Validators.maxLength(8)]], // ✅ 必填
    EDC_TmID2: ['', [Validators.maxLength(8)]],
    EDC_TmID3: ['', [Validators.maxLength(8)]],
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
      this.ECRNoOptions =
        res?.map((x: any) => ({
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
        'EDC_IP1',
        'EDC_IP2',
        'EDC_IP3',
        'EDC_TmID1',
        'EDC_TmID2',
        'EDC_TmID3',
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
      this.dataForm.enable(); // 新增狀態全部開放
    }
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      let payload = form.getRawValue();

      // ✅ 從 localStorage 取得門市代號
      const userInfoStr = localStorage.getItem('UserInfo');
      const storeNo = userInfoStr ? JSON.parse(userInfoStr)?.SYS_StoreNo : null;

      if (this.crudstatus === CRUDStatus.Create && storeNo) {
        payload.SYS_StoreNo = storeNo;
      }

      // ✅ 將日期轉為 ISO 字串（去除毫秒部分）
      const toISOStringWithoutMs = (value: any): string =>
        value ? new Date(value).toISOString().split('.')[0] : '';

      payload.EDC_BegDate = toISOStringWithoutMs(payload.EDC_BegDate);
      payload.EDC_EndDate = toISOStringWithoutMs(payload.EDC_EndDate);

      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            this.tls41020Service.insertTLS41020(payload).subscribe({
              next: () => {
                this.messageService.successBubble('新增成功');
                this.dataForm.reset();
              },
              error: () => {
                // ✅ 所有錯誤統一顯示成收銀機號重複
                this.messageService.errorBubble('新增失敗：收銀機號重複');
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
}
