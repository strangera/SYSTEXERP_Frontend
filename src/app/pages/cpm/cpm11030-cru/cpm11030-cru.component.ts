import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

import {
  Cpm11030Service,
  Cpm11030CruPayload,
} from '../../../service/api/cpm/cpm11030.service';

@Component({
  selector: 'app-cpm11030-cru',
  templateUrl: './cpm11030-cru.component.html',
  styleUrl: './cpm11030-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    // InputNumberComponent,
    CalendarRangeComponent,
    InputTextComponent,
    DropdownComponent,
    ButtonComponent,
    NgIf,
    TranslateModule,
  ],
})
export class CPM11030CRUComponent
  extends BasicCruPageComponent<any>
  implements OnInit
{
  readonly CRUD = CRUDStatus;

  

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    recordCode: [null as number | null, [Validators.maxLength(14)]], // 記錄編號(對應 Loan_No，可讓後端自產)
    borrowDateFrom: [null as Date | null], // 出借日期(起) → 會當作 Loan_Date
    borrowDateTo: [null as Date | null],   // 出借日期(迄) 預留不用送後端
    name: ['', [Validators.maxLength(20)]], // 姓名(借用人)

    staffName: ['', [Validators.maxLength(10)]], // 出借處理人員
    phone: ['', [Validators.maxLength(20)]],     // 連絡電話
    paperType: [null as string | null],         // 證件類型編號

    paperCode: ['', [Validators.maxLength(20)]], // 證件編號
    equipmentName: [null as string | null],      // 設備名稱/編號
    deviceCode: ['', [Validators.maxLength(10)]], // 設備編號(預留)

    counterCode: [null as string | null], // 服務台位置編號 (Service_Id)
  });

  // ----------------------------------------------------------------
  // 下拉選項，之後可以改成呼叫 SYS1000 / CSS2001 的真實資料
  paperTypeOptions: { value: string; label: string }[] = [
    { value: '01', label: '身分證' },
    { value: '02', label: '健保卡' },
    { value: '03', label: '駕照' },
    { value: '04', label: '護照' },
    { value: '05', label: '其他' },
  ];

  equipmentNameOptions: { value: string; label: string }[] = [
    { value: '01', label: '奇哥Joie輕便娃娃車' },
    { value: '02', label: '愛心輪椅' },
  ];

  counterCodeOptions: { value: string; label: string }[] = [
    { value: '11A001', label: '11A001/服務諮詢台' },
    { value: '12A001', label: '12A001/VIP室' },
    { value: '12D001', label: '12D001/總機' },
    { value: '15A001', label: '15A001/顧客服務中心' },
  ];

  constructor(
    private cpm11030Service: Cpm11030Service,
  ) {
    super();
  }

  ngOnInit(): void {
    // 交給 BasicCruPageComponent 處理：讀取 router state / crudstatus / formTitle / rowdata / disable
    this.initializePage('CPM11030', this.dataForm);
    this.updateDisabledState();
  }

  /** 依 CRUD 模式調整可編輯欄位 */
  private updateDisabledState(): void {
    if (this.crudstatus === CRUDStatus.Read) {
      // Read 模式：完全唯讀（BasicCru 已經 disable 過一次，這裡只是保險再呼叫）
      if (!this.useReadonlyInsteadOfDisable) {
        this.dataForm.disable();
      }
    } else if (this.crudstatus === CRUDStatus.Edit) {
      // Edit：全部打開後，鎖住記錄編號（不允許改 Loan_No）
      this.dataForm.enable();
      this.dataForm.get('recordCode')?.disable();
    } else {
      // Create：全部可輸入，但記錄編號交給後端產生，所以先鎖住
      this.dataForm.enable();
      this.dataForm.get('recordCode')?.disable();
    }
  }

  /** Date / string → yyyy-MM-dd */
  private toYMD(input: any): string | null {
    if (!input) return null;
    if (input instanceof Date) {
      const y = input.getFullYear();
      const m = String(input.getMonth() + 1).padStart(2, '0');
      const d = String(input.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    const dt = new Date(input);
    if (isNaN(dt.getTime())) return null;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /** 把畫面欄位轉成後端需要的 CSS3001 payload */
  private buildPayload(raw: any): Cpm11030CruPayload {
    // Loan_Date：優先用 borrowDateFrom，沒填就 borrowDateTo，再不然就今天
    const loanDate =
      raw.borrowDateFrom ??
      raw.borrowDateTo ??
      new Date();

    const loanDateStr = this.toYMD(loanDate)!;

    // 設備：從下拉找出代碼/名稱
    let deviceId = '';
    let deviceName = '';
    if (raw.equipmentName != null) {
      const hit = this.equipmentNameOptions.find(
        (x) => String(x.value) === String(raw.equipmentName)
      );
      deviceId = hit ? String(hit.value) : String(raw.equipmentName);
      deviceName = hit?.label ?? '';
    }

    // 證件類型
    const certType = raw.paperType ? String(raw.paperType) : '';

    const payload: Cpm11030CruPayload = {
      // Edit 模式可以帶 recordCode 當 Loan_No，Create 可不送交由後端產生流水號
      Loan_No: raw.recordCode ?? undefined,
      Loan_Date: loanDateStr,
      Service_Id: raw.counterCode ?? '',
      User_Name: raw.name ?? '',
      Cert_Type: certType,
      Cert_No: raw.paperCode ?? '',
      Loan_Phone: raw.phone ?? '',
      Loan_USR_Name: raw.staffName ?? '',
      Device_ID: deviceId,
      Device_Name: deviceName || undefined,
    };

    return payload;
  }

  /** Submit（Create / Edit 共用） */
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const raw = form.getRawValue();
      const payload = this.buildPayload(raw);

      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            this.cpm11030Service.insertCPM11030(payload).subscribe(() => {
              this.messageService.successBubble('新增成功');
              this.onCancel(); // 使用 BasicCruPageComponent 的 onCancel，會帶著 fromRoute 回去
            });
          }
          break;

        case CRUDStatus.Edit:
          if (this.canEdit()) {
            this.cpm11030Service.updateCPM11030(payload).subscribe(() => {
              this.messageService.successBubble('更新成功');
              this.onCancel();
            });
          }
          break;
      }
    });
  }

  /** 判斷唯讀（給 template 用，如果你要控制某些共通元件的 [readonly]） */
  get isRead(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }
}
