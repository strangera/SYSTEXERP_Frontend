import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TLS12020Service } from '../../../service/api/tls/tls12020.service';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { ValidationService } from '@shared/service/validation.service';
import { PanelModule } from 'primeng/panel';
import { InputNumberComponent } from "@shared/componentkit/input-number/input-number.component";




@UntilDestroy()
@Component({
  selector: 'app-tls12020-cru',
  templateUrl: './tls12020-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    TranslateModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    CalendarComponent,
    PanelModule,
    InputTextareaComponent,
    InputNumberComponent
],
})

export class TLS12020CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.fb.nonNullable.group({
    vendorUID: ['', [Validators.required]], // 廠商統一編號（必填）
    vendorCName: ['', [Validators.required, Validators.maxLength(60)]], // 廠商名稱(中文)
    vendorEName: ['', [Validators.maxLength(60)]], // 廠商名稱(英文)
    brand: ['', [Validators.maxLength(30)]], // 品牌
    bus_type: [''], // 業腫
    VEN_Boss: ['', [Validators.required, Validators.maxLength(12)]], // 聯絡人
    VEN_BossTel: ['', [Validators.required, Validators.maxLength(18)]], // 聯絡人電話(O)
    VEN_BossTitle: ['', [Validators.maxLength(15)]], // 聯絡人稱謂
    VEN_BossMobile: ['', [Validators.maxLength(15)]], // 聯絡人手機
    VEN_BossEmail: ['', [Validators.maxLength(60)]], // 聯絡人電子郵件
    VEN_Addr: ['', [Validators.maxLength(100)]], // 公司地址

    contact_Date: [null], // 訪談日期（必填）
    contact_Time: [null], // 訪談時間(24H)（必填）
    building_no: [''], // 館別
    willing_level: ['', [Validators.required]], //
    FLOOR_NO: [''], // 樓層編號
    LOCATION_No: [null, [Validators.maxLength(60)]], // 擬洽位置編號

    contact_record: [''], // 洽談重點及洽談紀錄
    contact_remarks: [''], // 備註

    contact_USR_Name: ['admin', [Validators.required]], // 訪談人員（必填）
  });


  // 下拉選單 options
  vendorUIDOptions: IDropdownItem[] = [];
  industryCodeOptions: IDropdownItem[] = [];
  willinglevelOptions: IDropdownItem[] = [];
  floorOptions: IDropdownItem[] = [];
  interviewerOptions: IDropdownItem[] = [];
  contact_USR_NameOptions: IDropdownItem[] = [];
  LOCATION_Options: IDropdownItem[] = [];
  buildingNoOptions: IDropdownItem[] = [];

  constructor(
    private fb: FormBuilder,
    private dropDownListService: DropDownListService,
    private tls12020Service: TLS12020Service,
    private validationService: ValidationService,
    private translate: TranslateService,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS12020', this.dataForm);
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    if (this.rowdata) {
      const mapped = this.mapRowDataToForm(this.rowdata);
      this.dataForm.patchValue(mapped);
    }
    this.loadDropdownOptions();
    //訪談人員api
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.contact_USR_NameOptions = res.Data;
    });
    //樓層API
    this.dropDownListService.querySYS3900_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.floorOptions = res.Data.map(item => ({
        ...item,
        label: item.Name,  // 顯示名稱
        value: item.No     // 實際值
      }));
    });
    //業種API
    this.dropDownListService.queryTLTBUSTYPE_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      if (res?.Status === '0000') {
        this.industryCodeOptions = res.Data.map(item => ({
          ...item,
          label: item.Name,
          value: item.No
        }));
      }
    });
    //館別
    this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.buildingNoOptions = res.Data.map(x => ({ label: x.Name, value: x.No, Name: x.Name, No: x.No }));
    });
    //統編API
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.vendorUIDOptions = res.Data.map(item => ({
          label: `${item.Name} ${item.No}`, // 顯示中文+數字
          value: item.No,                   // 送出用的值
          Name: item.Name,                  // 加入 Name 屬性
          No: item.No                       // 加入 No 屬性
        }));
      });

    //位置編號
    this.dropDownListService.queryPOS2002_DropDownList().subscribe((res) => {
      if (res?.Status === '0000') {
        this.LOCATION_Options = res.Data || [];
      }
    });

    this.willinglevelOptions = [
      { No: '?', Name: '?', label: '未確認' },
      { No: 'A', Name: 'A', label: '交涉中(基本條件合意)' },
      { No: 'B', Name: 'B', label: '交涉中(反應良好)' },
      { No: 'C', Name: 'C', label: '交涉中(反應不好)' },
      { No: 'D', Name: 'D', label: '保留' },
      { No: 'F', Name: 'F', label: '無意進駐' },
    ];


  }

  loadDropdownOptions() {
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.contact_USR_NameOptions = res.Data.map(item => ({
        ...item,
        label: item.Name,
        value: item.No
      }));
    });

    this.dropDownListService.querySYS3900_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.floorOptions = res.Data.map(item => ({
        ...item,
        label: item.Name,
        value: item.No
      }));
    });
  }
  formatDateOnly(value: any): string | null {
    if (!value) return null;
    const d = new Date(value);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T00:00:00`;
  }

  formatTime(value: any): string | null {
    if (!value) return null;

    if (value instanceof Date) {
      const hh = String(value.getHours()).padStart(2, '0');
      const mm = String(value.getMinutes()).padStart(2, '0');
      return `${hh}${mm}`; // 傳回 "0930"
    }

    if (typeof value === 'string') {
      const [h, m] = value.split(':');
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      return `${hh}${mm}`; // 傳回 "1130"
    }

    return null;
  }

  private mapRowDataToForm(row: any) {
    return {
      vendorUID: row.ven_uniform,          // 廠商統一編號
      vendorCName: row.VEN_Name,           // 廠商名稱(中文)
      vendorEName: row.VEN_EngName,        // 廠商名稱(英文)
      brand: row.tlt_name,                 // 品牌
      bus_type: row.bus_type,              // 業種
      VEN_Boss: row.VEN_ContactPerson,     // 聯絡人
      VEN_BossTel: row.VEN_BossTel,        // 聯絡人電話
      VEN_BossTitle: row.VEN_BossTitle,    // 聯絡人稱謂
      VEN_BossMobile: row.VEN_BossMobile,  // 聯絡人手機
      VEN_BossEmail: row.VEN_BossEmail,    // 聯絡人電子郵件
      VEN_Addr: row.VEN_Addr,              // 公司地址
      contact_Date: row.contact_Date,      // 訪談日期
      contact_Time: row.contact_Time,      // 訪談時間
      building_no: row.building_no,        // 館別
      willing_level: row.willing_level,    // 意願等級
      FLOOR_NO: row.FLOOR_NO,              // 樓層編號
      LOCATION_No: row.LOCATION_No,        // 位置編號
      contact_record: row.contact_record,  // 洽談重點
      contact_remarks: row.contact_remarks,// 備註
      contact_USR_Name: row.contact_USR_Name, // 訪談人員
    };
  }



  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();
      const body = {
        ...formValue,
        ID: 0,
        ven_uniform: formValue.vendorUID,
        VEN_Name: formValue.vendorCName,
        VEN_EngName: formValue.vendorEName,
        VEN_ContactPerson: formValue.VEN_Boss,
        contact_USR_No: formValue.contact_USR_Name,
        tlt_name: formValue.brand,
        bus_type: formValue.bus_type,
        VEN_BossTel: formValue.VEN_BossTel,
        VEN_BossTitle: formValue.VEN_BossTitle,
        VEN_BossMobile: formValue.VEN_BossMobile,
        VEN_BossEmail: formValue.VEN_BossEmail,
        VEN_Addr: formValue.VEN_Addr,
        contact_Date: this.formatDateOnly(formValue.contact_Date), // 確保是 YYYY-MM-DDT00:00:00
        contact_Time: this.formatTime(formValue.contact_Time),
        FLOOR_NO: formValue.FLOOR_NO,
        LOCATION_No: formValue.LOCATION_No,
        contact_record: formValue.contact_record,
        contact_remarks: formValue.contact_remarks,
        contact_USR_Name: formValue.contact_USR_Name,
      };
      console.log('送出 contact_Time:', formValue.contact_Time);
      console.log('轉換後 contact_Time:', this.formatTime(formValue.contact_Time));

      this.tls12020Service.insertTLS12020(body).subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            this.messageService.successBubble(this.translate.instant('新增成功'));
            this.dataForm.reset();
          } else {
            this.messageService.errorBubble(this.translate.instant('新增失敗') + '：' + (res.Message || ''));
          }
        },
        error: (err) => {
          console.error('API 錯誤', err);
          this.messageService.errorBubble(this.translate.instant('API 發生錯誤'));
        }
      });
    });
  }



};
