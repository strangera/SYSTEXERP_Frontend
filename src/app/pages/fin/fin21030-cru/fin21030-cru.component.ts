import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { Fin21030Service } from 'src/app/service/api/fin/fin21030.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';

@Component({
  selector: 'app-fin21030-cru',
  templateUrl: './fin21030-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    AccordionModule,
    InputNumberComponent,
    TranslateModule,
    NgIf,
    CalendarRangeComponent,

  ],
})
export class FIN21030CRUComponent extends BasicCruPageComponent<any> implements OnInit {

  dataForm = this.formBuilder.nonNullable.group({
    GUI_ID_WIRE: [''], //匯款統編
    VEN_DiscDateB: [null],
    VEN_DiscDateE: [null],
    VEN_No: ['', [Validators.maxLength(14)]],                              // 廠商編號
    VEN_Name: ['', [Validators.maxLength(100)]],       // 廠商名稱 (後端有這個)
    VEN_ShortName: ['', [Validators.maxLength(20)]],                       // 廠商簡稱
    VEN_Post: ['', [Validators.maxLength(5)]],                            // 郵遞區號
    VEN_Address: ['', [Validators.maxLength(100)]],                         // 郵寄地址
    VEN_Boss: ['', [Validators.maxLength(20)]],                            // 聯絡人
    VEN_Tel: ['', [Validators.maxLength(20)]],                             // 電話
    VEN_Fax: ['', [Validators.maxLength(20)]],                             // 傳真
    VEN_Uniform: [''],                         // 統一編號
    VEN_RemitFeeMode: [''],                    // 郵電負擔模式
    VEN_DiscYN: [[]],                          // 貼現廠商 (單一字串)
    VEN_CTRLYN: [[]],                          // 禁止背書轉讓 (單一字串)
    VEN_PayType: [''],                         // 付款方式 (單一字串)
    VEN_BNK_No: ['', [Validators.maxLength(5)]],                          // 廠商匯款銀行代號
    VEN_BankAccountNo: ['', [Validators.maxLength(50)]],                   // 廠商銀行帳號
    VEN_AccountName: ['', [Validators.maxLength(80)]],                     // 廠商帳戶名稱
    VEN_PayConditionDay: [null],                  // 付款期限
    VEN_CheckTitle: [''],                      // 票據抬頭
    VEN_Status: [''],
  });
  roles: any[] = [
    { id: 1, roleCode: 'ADMIN', roleName: 'Administrator' },
    { id: 2, roleCode: 'USER', roleName: 'User' },
    { id: 3, roleCode: 'GUEST', roleName: 'Guest' },
  ];

  remitFeeOptions = getSYS1000Options('VEN_RemitFeeMode');

  // ====== Table / Options ======
  approvalOptions: { label: string; value: string }[] = [
    { label: '未審核', value: '0' },
    { label: '已審核', value: '1' },
  ];

  VEN_DiscYNOptions: { label: string; value: string }[] = [
    { label: '是', value: 'Y' },
    { label: '否', value: 'N' },
  ];
  VEN_CTRLYNOptions: { label: string; value: string }[] = [
    { label: '是', value: 'Y' },
    { label: '否', value: 'N' }
  ];
  VEN_PayTypeOptions: { label: string; value: string }[] = [
    { label: '電匯', value: '1' },
    { label: '開票', value: '2' },
    { label: '現金', value: '3' }
  ];
  constructor(
    private fin21030Service: Fin21030Service,
    private readonly datePipe: DatePipe,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('FIN21030', this.dataForm);
    console.log('details', this.rowdata);

    if (this.rowdata) {
      this.dataForm.patchValue({
        ...this.rowdata,
        VEN_DiscYN: this.toYN(this.rowdata.VEN_DiscYN),
        VEN_CTRLYN: this.toYN(this.rowdata.VEN_CTRLYN),
      });
      this.dataForm.get('VEN_No')?.setValue(
        `${this.rowdata.VEN_No} - ${this.rowdata.VEN_Name}`

      );

      Object.keys(this.dataForm.controls).forEach(key => {
        if (!['VEN_Post', 'VEN_DiscYN', 'GUI_ID_WIRE', 'VEN_CTRLYN', 'VEN_DiscDateB', 'VEN_DiscDateE'].includes(key)) {
          this.dataForm.get(key)?.disable();
        }
      });
    }

  }
  private toYN(v: unknown): string {
    const s = Array.isArray(v) ? v[0] : v;
    return s === '是' || s === 'Y' ? 'Y' : s === '否' || s === 'N' ? 'N' : '';
  }

  onSubmit(frm: FormGroup) {
    if (frm.valid) {
      const raw = frm.getRawValue();

      const payload = {
        id: this.rowdata?.id ?? 0,
        VEN_No: this.rowdata?.VEN_No ?? '',
        VEN_Post: raw.VEN_Post || '',
        VEN_DiscYN: this.toYN(raw.VEN_DiscYN),
        VEN_CTRLYN: this.toYN(raw.VEN_CTRLYN),
        VEN_DiscDateB: this.datePipe.transform(raw.VEN_DiscDateB, 'yyyy-MM-dd'),
        VEN_DiscDateE: this.datePipe.transform(raw.VEN_DiscDateE, 'yyyy-MM-dd'),
        GUI_ID_WIRE: raw.GUI_ID_WIRE || '',
      };
      this.fin21030Service.updateFIN21030(payload).subscribe({
        next: res => {
          console.log('更新成功', res);
          this.messageService.successBubble('更新成功');
          this.onCancel();
        },

      });
    }
  }
}
