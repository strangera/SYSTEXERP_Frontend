import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputNumberComponent } from "@shared/componentkit/input-number/input-number.component";
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { TLS12020Service } from '../../../service/api/tls/tls12020.service';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

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
    vendorEName: ['', [Validators.maxLength(60), Validators.pattern(/^[A-Za-z0-9 .,\-()]*$/)]], // 廠商名稱(英文) 只允許英文與數字及常用符號
    brand: ['', [Validators.maxLength(30)]], // 品牌
    bus_type: [''], // 業腫
    VEN_Boss: ['', [Validators.required, Validators.maxLength(12)]], // 聯絡人
    VEN_BossTel: ['', [Validators.required, Validators.maxLength(18)]], // 聯絡人電話(O)
    VEN_BossTitle: ['', [Validators.maxLength(15)]], // 聯絡人稱謂
    VEN_BossMobile: ['', [Validators.maxLength(15)]], // 聯絡人手機
    VEN_BossEmail: ['', [Validators.maxLength(60), Validators.pattern(/^[A-Za-z0-9._%+-@]*$/)]], // 聯絡人電子郵件 只允許英文與常用符號
    VEN_Addr: ['', [Validators.maxLength(100)]], // 公司地址
    VEN_BossFax: ['', [Validators.maxLength(18)]], // 聯絡人傳真
    contact_Date: [new Date(), [Validators.required]], // 訪談日期（必填）
    contact_Time: [new Date(), [Validators.required]], // 訪談時間(24H) 預設為現在時間（必填）
    building_no: [''], // 館別
    willing_level: ['', [Validators.required]], //
    FLOOR_NO: [''], // 樓層編號
    LOCATION_No: [null, [Validators.maxLength(60)]], // 擬洽位置編號
    contact_record: [''], // 洽談重點及洽談紀錄
    contact_remarks: [''], // 備註
    contact_USR_Name: ['admin', [Validators.required]], // 訪談人員（必填）
  });


  // 下拉選單 options
  vendorUIDOptions: (IDropdownItem & { VEN_EngName?: string; VEN_Address?: string; ShortName?: string })[] = [];
  industryCodeOptions: IDropdownItem[] = [];
  willinglevelOptions: IDropdownItem[] = [];
  floorOptions: IDropdownItem[] = [];
  interviewerOptions: IDropdownItem[] = [];
  contact_USR_NameOptions: IDropdownItem[] = [];
  LOCATION_Options: IDropdownItem[] = [];
  buildingNoOptions: IDropdownItem[] = [];
  btnLoading = false;
  constructor(
    private fb: FormBuilder,
    private dropDownListService: DropDownListService,
    private tls12020Service: TLS12020Service,
    private translate: TranslateService,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS12020', this.dataForm);
    // (debug logs removed)
    if (this.rowdata) {
      const mapped = this.mapRowDataToForm(this.rowdata);
      // mapped prepared
      this.dataForm.patchValue(mapped);

      // 若 navigation state 的 rowdata 只是一份快取，為保險起見以 ID 向後端抓最新完整資料再覆蓋
      const id = (this.rowdata as any).ID;
      if (id) {
        this.tls12020Service.queryTLS12020({ ID: id })
          .pipe(untilDestroyed(this))
          .subscribe({
            next: (res) => {
              if (res?.Status === '0000' && Array.isArray(res.Data) && res.Data.length) {
                const fresh = res.Data[0];
                // 只有當後端回傳的第一筆與我們要求的 ID 相同時，才用後端回傳覆蓋表單
                if ((fresh as any).ID === id) {
                  const freshMapped = this.mapRowDataToForm(fresh);
                  this.dataForm.patchValue(freshMapped);
                }
              }
            },
            error: () => { /* ignore errors silently */ }
          });
      }
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
        // 保留原始後端欄位，方便之後自動帶入
        this.vendorUIDOptions = res.Data.map(item => ({
          label: `${item.No} - ${item.Name}`, // 顯示中文+數字
          value: item.No,                      // 送出用的值
          Name: item.Name,                     // 中文名稱
          No: item.No,                         // 編號
          // 處理英文名稱：若後端回傳空字串，保留空字串；若回傳值只有允許的英文/數字/常用符號才視為有效，否則不提供（undefined）
          VEN_EngName: (() => {
            const raw = (item as any).VEN_EngName ?? item.ShortName ?? undefined;
            if (raw === '') return '';
            if (typeof raw === 'string') {
              const validEng = /^[A-Za-z0-9 .,\-()]*$/;
              return validEng.test(raw) ? raw : undefined;
            }
            return undefined;
          })(),
          VEN_Address: (item as any).VEN_Address ?? undefined,
          ShortName: item.ShortName ?? undefined,
        }));
      });

    // 選擇統編後自動帶入廠商名稱、英文名稱、公司地址
    this.dataForm.get('vendorUID')?.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(selectedNo => {
        const selected = this.vendorUIDOptions.find(v => v.value === selectedNo);
        if (selected) {
          const patch: any = {
            vendorCName: selected.Name ?? '',
            VEN_Addr: selected.VEN_Address ?? ''
          };

          // 只有當 vendor Eng 名稱為空字串或經過驗證為英文格式時，才覆蓋 vendorEName
          if (selected.VEN_EngName !== undefined) {
            patch.vendorEName = selected.VEN_EngName; // 可能為 '' 或有效英文字串
          }

          this.dataForm.patchValue(patch, { emitEvent: false });
        } else {
          this.dataForm.patchValue({ vendorCName: '', vendorEName: '', VEN_Addr: '' }, { emitEvent: false });
        }
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
      VEN_BossFax: row.VEN_BossFax,        // 聯絡人傳真
      VEN_Addr: row.VEN_Addr,              // 公司地址
      contact_Date: row.contact_Date ? new Date(row.contact_Date) : undefined,      // 訪談日期 (轉 Date)
      contact_Time: (() => {
        const t = row.contact_Time;
        if (!t) return undefined;
        // 可能格式: "1613" 或 "16:13" 或 已是 Date
        if (t instanceof Date) return t;
        if (typeof t === 'string') {
          if (/^\d{4}$/.test(t)) {
            const hh = parseInt(t.substring(0, 2), 10);
            const mm = parseInt(t.substring(2, 4), 10);
            const d = new Date();
            d.setHours(hh, mm, 0, 0);
            return d;
          }
          if (/^\d{2}:\d{2}$/.test(t)) {
            const [h, m] = t.split(':');
            const d = new Date();
            d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
            return d;
          }
        }
        return undefined;
      })(),      // 訪談時間 (轉 Date)
      building_no: row.building_no,        // 館別
      willing_level: row.willing_level,    // 意願等級
      FLOOR_NO: row.FLOOR_NO,              // 樓層編號
      LOCATION_No: row.LOCATION_No,        // 位置編號
      contact_record: row.contact_record ?? '',  // 洽談重點
      contact_remarks: row.contact_remarks ?? '',// 備註
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
        VEN_BossFax: formValue.VEN_BossFax,
        VEN_Addr: formValue.VEN_Addr,
        contact_Date: this.formatDateOnly(formValue.contact_Date), // 確保是 YYYY-MM-DDT00:00:00
        contact_Time: this.formatTime(formValue.contact_Time),
        FLOOR_NO: formValue.FLOOR_NO,
        LOCATION_No: formValue.LOCATION_No,
        contact_record: formValue.contact_record,
        contact_remarks: formValue.contact_remarks,
        contact_USR_Name: formValue.contact_USR_Name,
      };

      this.tls12020Service
        .insertTLS12020(body)
        .pipe(finalize(() => (this.btnLoading = false)))
        .subscribe({
          next: (res) => {
            if (res.Status === '0000') {
              this.messageService.successBubble(this.translate.instant('新增成功'));
              this.dataForm.reset();
            } else {
              this.messageService.errorBubble(this.translate.instant('新增失敗') + '：' + (res.Message || ''));
            }
            this.onCancel();
          },

        });
    });
  }
  override onCancel(): void {
    this.router.navigate(
      ['/account/tls/tls12020'],
      { state: { fromRoute: '' } }
    );
  }

};
