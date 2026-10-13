import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputNumberComponent } from "@shared/components/input-number/input-number.component";
import { InputTextareaComponent } from '@shared/components/input-textarea/input-textarea.component';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { combineLatest, finalize, of } from 'rxjs';
import { debounceTime, startWith, switchMap } from 'rxjs/operators';
import { TLS12020Service } from '../../../service/api/tls/tls12020.service';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';

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
    // 先讓 user 輸入查詢條件，再向後端查明細
    vendorFlag: [''],
    vendorUniform: [''],
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
  // 當前選取或查到的完整廠商明細
  selectedVendorDetails: any = null;
  // store original values when editing
  private originalContactDate: string | null = null; // formatted via formatDateOnly
  private originalContactTime: string | null = null; // formatted via formatTime
  private originalID: number | null = null;
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
      // store original id and contact date/time defaults from the rowdata
      this.originalID = (this.rowdata as any).ID ?? null;
      this.originalContactDate = this.formatDateOnly(mapped.contact_Date);
      this.originalContactTime = this.formatTime(mapped.contact_Time);

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
                  // update stored originals to fresh values
                  this.originalID = (fresh as any).ID ?? this.originalID;
                  this.originalContactDate = this.formatDateOnly(freshMapped.contact_Date);
                  this.originalContactTime = this.formatTime(freshMapped.contact_Time);
                }
              }
            },
            error: () => { /* ignore errors silently */ }
          });
      }
    }
    this.loadDropdownOptions();
    // 初始載入下拉改為使用輕量的 POS2013 下拉（顯示中文+編號），避免一次載入大量資料
    this.dropDownListService.queryPOS2013_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      const data = (res?.Data) || [];
      const seen = new Set<string>();
      this.vendorUIDOptions = [];
      for (const item of data) {
        const baseNo = item.No ?? '';
        const name = item.Name ?? item.ShortName ?? '';
        const key = `${baseNo}|${name}`; // 去重依據仍為 No + Name
        if (seen.has(key)) continue;
        seen.add(key);
        const displayNo = item.VEN_No ?? baseNo; // 顯示 VEN_No（有則用）
        this.vendorUIDOptions.push({
          label: `${displayNo}-${name}`,
          value: baseNo,
          Name: name,
          No: baseNo,
          ShortName: item.ShortName,
          VEN_No: item.VEN_No,
        });
      }
    });
    //訪談人員api
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.contact_USR_NameOptions = res.Data;
    });
    //樓層API
    this.dropDownListService.querySYS3900_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.floorOptions = res.Data.map((item: any) => ({
        ...item,
        label: item.Name,  // 顯示名稱
        value: item.No     // 實際值
      }));
    });
    //業種API
    this.dropDownListService.queryTLTBUSTYPE_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      if (res?.Status === '0000') {
        this.industryCodeOptions = res.Data.map((item: any) => ({
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
    // 查詢機制改為：先讓 user 輸入 `vendorFlag` / `vendorUniform`，再查明細以避免初次載入過慢
    const flag$ = this.dataForm.get('vendorFlag')!.valueChanges.pipe(startWith(this.dataForm.get('vendorFlag')!.value));
    const uniform$ = this.dataForm.get('vendorUniform')!.valueChanges.pipe(startWith(this.dataForm.get('vendorUniform')!.value));

    combineLatest([flag$, uniform$])
      .pipe(
        debounceTime(300),
        untilDestroyed(this),
        switchMap(([flag, uniform]) => {
          const hasAny = (flag ?? '') !== '' || (uniform ?? '') !== '';
          if (!hasAny) return of({ Status: '0000', Data: [] });
          const vendorBody = { VEN_Flag: flag ?? '', VEN_Uniform: uniform ?? '' };
          return this.tls12020Service.queryTLS12010_POS2013(vendorBody);
        })
      )
      .subscribe(res => {
        if (res?.Status === '0000' && Array.isArray(res.Data)) {
          this.vendorUIDOptions = res.Data.map((item: any) => ({
            label: `${item.VEN_No || item.VEN_Uniform || ''} - ${item.VEN_Name || item.VEN_ShortName || ''}`,
            value: item.VEN_Uniform || item.VEN_No || '',
            Name: item.VEN_Name || item.VEN_ShortName || undefined,
            No: item.VEN_No ?? undefined,
            VEN_EngName: (() => {
              const raw = item.VEN_EngName ?? item.VEN_ShortName ?? undefined;
              if (raw === '') return '';
              if (typeof raw === 'string') {
                const validEng = /^[A-Za-z0-9 .,\-()]*$/;
                return validEng.test(raw) ? raw : undefined;
              }
              return undefined;
            })(),
            VEN_Address: item.VEN_Address ?? item.VEN_Addr ?? item.VEN_GUIAddr ?? undefined,
            ShortName: item.VEN_ShortName ?? undefined,
            raw: item,
          }));
        } else {
          this.vendorUIDOptions = [];
        }
      });

    // 選擇統編後自動帶入廠商名稱、英文名稱、公司地址
    this.dataForm.get('vendorUID')?.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(selectedNo => {
        const selected = this.vendorUIDOptions.find(v => v.value === selectedNo);
        if (!selected) {
          this.dataForm.patchValue({ vendorCName: '', vendorEName: '', VEN_Addr: '', VEN_Boss: '', VEN_BossTel: '', VEN_BossTitle: '', VEN_BossMobile: '', VEN_BossEmail: '', VEN_BossFax: '' }, { emitEvent: false });
          return;
        }

        // 如果下拉項已包含完整 raw（先前的行為），直接使用；否則向後端查明細再帶入
        const maybeRaw = (selected as any).raw;
        if (maybeRaw) {
          const raw = maybeRaw;
          // 存下完整明細供 template 或其他邏輯使用
          this.selectedVendorDetails = raw;
          const patch: any = {
            vendorUID: raw.VEN_Uniform || raw.VEN_No || selected.value || '',
            vendorCName: raw.VEN_Name || raw.VEN_ShortName || selected.Name || '',
            vendorEName: raw.VEN_EngName ?? raw.VEN_ShortName ?? '',
            VEN_Addr: raw.VEN_Address || raw.VEN_Addr || raw.VEN_GUIAddr || selected.VEN_Address || '',
            VEN_Boss: raw.VEN_ContactPerson || raw.CHARGE_STAFF || raw.VEN_Contact || '',
            VEN_BossTel: raw.VEN_Tel || raw.CHARGE_TEL || raw.ORDER_TEL || '',
            VEN_BossTitle: raw.VEN_CheckTitle || raw.CHARGE_TITLE || '',
            VEN_BossMobile: raw.VEN_BossMobile || raw.CHARGE_TEL || '',
            VEN_BossEmail: raw.VEN_Email || raw.VEN_GUIEmail || '',
            VEN_BossFax: raw.VEN_Fax || raw.VEN_GUIFax || '',
            // 以下為額外明細，若 form 無對應欄位，patchValue 會忽略；但完整物件已存在於 selectedVendorDetails
            VEN_No: raw.VEN_No,
            VEN_Uniform: raw.VEN_Uniform,
            VEN_RemitFeeMode: raw.VEN_RemitFeeMode,
            VEN_Post: raw.VEN_Post,
            VEN_PayType: raw.VEN_PayType,
            VEN_BNK_No: raw.VEN_BNK_No,
            VEN_BNK_BranchNo: raw.VEN_BNK_BranchNo,
            VEN_BankAccountNo: raw.VEN_BankAccountNo,
            VEN_AccountName: raw.VEN_AccountName,
            VEN_PayConditionDay: raw.VEN_PayConditionDay,
            VEN_Status: raw.VEN_Status,
            GUI_ID_WIRE: raw.GUI_ID_WIRE,
            VEN_Remark: raw.VEN_Remark,
          };

          this.dataForm.patchValue(patch, { emitEvent: false });
        } else {
          // 用選到的 value 去撈明細
          const vendorBody = { VEN_Flag: '', VEN_Uniform: selected.value };
          this.tls12020Service.queryTLS12010_POS2013(vendorBody).pipe(untilDestroyed(this)).subscribe(res => {
            if (res?.Status === '0000' && Array.isArray(res.Data) && res.Data.length) {
              const item = res.Data[0];
              // 將 raw 放回對應下拉選項，並存完整明細
              (selected as any).raw = item;
              this.selectedVendorDetails = item;
              const patch: any = {
                vendorUID: item.VEN_Uniform || item.VEN_No || selected.value || '',
                vendorCName: item.VEN_Name || item.VEN_ShortName || selected.Name || '',
                vendorEName: item.VEN_EngName ?? item.VEN_ShortName ?? '',
                VEN_Addr: item.VEN_Address || item.VEN_Addr || item.VEN_GUIAddr || selected.VEN_Address || '',
                VEN_Boss: item.VEN_ContactPerson || item.CHARGE_STAFF || item.VEN_Contact || '',
                VEN_BossTel: item.VEN_Tel || item.CHARGE_TEL || item.ORDER_TEL || '',
                VEN_BossTitle: item.VEN_CheckTitle || item.CHARGE_TITLE || '',
                VEN_BossMobile: item.VEN_BossMobile || item.CHARGE_TEL || '',
                VEN_BossEmail: item.VEN_Email || item.VEN_GUIEmail || '',
                VEN_BossFax: item.VEN_Fax || item.VEN_GUIFax || '',
                // 額外明細欄位同步入 form (若存在)
                VEN_No: item.VEN_No,
                VEN_Uniform: item.VEN_Uniform,
                VEN_RemitFeeMode: item.VEN_RemitFeeMode,
                VEN_Post: item.VEN_Post,
                VEN_PayType: item.VEN_PayType,
                VEN_BNK_No: item.VEN_BNK_No,
                VEN_BNK_BranchNo: item.VEN_BNK_BranchNo,
                VEN_BankAccountNo: item.VEN_BankAccountNo,
                VEN_AccountName: item.VEN_AccountName,
                VEN_PayConditionDay: item.VEN_PayConditionDay,
                VEN_CheckTitle: item.VEN_CheckTitle,
                VEN_Status: item.VEN_Status,
                GUI_ID_WIRE: item.GUI_ID_WIRE,
                VEN_Remark: item.VEN_Remark,
                CRT_Date: item.CRT_Date,
                CRT_USR_No: item.CRT_USR_No,
                CRT_USR_Name: item.CRT_USR_Name,
                UPD_Date: item.UPD_Date,
                UPD_USR_No: item.UPD_USR_No,
                UPD_USR_Name: item.UPD_USR_Name,
                CHARGE_STAFF: item.CHARGE_STAFF,
                CHARGE_TITLE: item.CHARGE_TITLE,
                CHARGE_PID: item.CHARGE_PID,
                CHARGE_TEL: item.CHARGE_TEL,
                CHARGE_ADDR: item.CHARGE_ADDR,
                CHARGE_EMAIL: item.CHARGE_EMAIL,
                ORDER_ADDR: item.ORDER_ADDR,
                ORDER_TEL: item.ORDER_TEL,
                ORDER_FAX: item.ORDER_FAX,
                FACTO_ADDR: item.FACTO_ADDR,
                FACTO_TEL: item.FACTO_TEL,
                FACTO_FAX: item.FACTO_FAX,
                DELIVERY: item.DELIVERY,
                RETURN_ORDER: item.RETURN_ORDER,
                DELIVERY_LIMIT: item.DELIVERY_LIMIT,
                VEN_ORDER_ADDR: item.VEN_ORDER_ADDR,
                VEN_ORDER_TEL: item.VEN_ORDER_TEL,
                VEN_ORDER_FAX: item.VEN_ORDER_FAX,
                VEN_FACTO_ADDR: item.VEN_FACTO_ADDR,
                VEN_FACTO_TEL: item.VEN_FACTO_TEL,
                VEN_FACTO_FAX: item.VEN_FACTO_FAX,
                VEN_DELIVERY: item.VEN_DELIVERY,
                VEN_RETURN_ORDER: item.VEN_RETURN_ORDER,
                VEN_DELIVERY_LIMIT: item.VEN_DELIVERY_LIMIT,
              };

              this.dataForm.patchValue(patch, { emitEvent: false });
            } else {
              this.dataForm.patchValue({ vendorCName: '', vendorEName: '', VEN_Addr: '', VEN_Boss: '', VEN_BossTel: '', VEN_BossTitle: '', VEN_BossMobile: '', VEN_BossEmail: '', VEN_BossFax: '' }, { emitEvent: false });
            }
          });
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
      this.contact_USR_NameOptions = res.Data.map((item: any) => ({
        ...item,
        label: item.Name,
        value: item.No
      }));
    });

    this.dropDownListService.querySYS3900_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.floorOptions = res.Data.map((item: any) => ({
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
    return `${yyyy}-${mm}-${dd}`;
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
    vendorUID: row.ven_uniform,
    vendorCName: row.VEN_Name,
    vendorEName: row.VEN_EngName,

    brand: row.tlt_name,
    bus_type: row.bus_type,

    VEN_Boss: row.VEN_ContactPerson,
    VEN_BossTel: row.VEN_BossTel,
    VEN_BossTitle: row.VEN_BossTitle,
    VEN_BossMobile: row.VEN_BossMobile,
    VEN_BossEmail: row.VEN_BossEmail,
    VEN_BossFax: row.VEN_BossFax,
    VEN_Addr: row.VEN_Addr,

    contact_Date: row.contact_Date
      ? new Date(row.contact_Date)
      : undefined,

    contact_Time: (() => {
      const t = row.contact_Time;

      if (!t) return undefined;

      if (t instanceof Date) {
        return t;
      }

      if (typeof t === 'string') {

        // DB 格式，例如 0930、1613
        if (/^\d{4}$/.test(t)) {
          const hh = parseInt(t.substring(0, 2), 10);
          const mm = parseInt(t.substring(2, 4), 10);

          const d = new Date();
          d.setHours(hh, mm, 0, 0);

          return d;
        }

        // 例如 09:30、16:13
        if (/^\d{2}:\d{2}$/.test(t)) {
          const [h, m] = t.split(':');

          const d = new Date();
          d.setHours(
            parseInt(h, 10),
            parseInt(m, 10),
            0,
            0
          );

          return d;
        }
      }

      return undefined;
    })(),

    building_no: row.building_no,
    willing_level: row.willing_level,
    FLOOR_NO: row.FLOOR_NO,
    LOCATION_No: row.LOCATION_No,

    contact_record: row.contact_record ?? '',
    contact_remarks: row.contact_remarks ?? '',

    // Dropdown 的 value 是 No，所以修改時要塞使用者代碼
    contact_USR_Name: row.contact_USR_No,
  };
}



  onSubmit(frm: FormGroup): void {
  this.handleSubmit(frm, () => {

    const formValue = frm.getRawValue();

    // formValue.contact_USR_Name 現在實際上是人員代碼 No
    const selectedContactUser = this.contact_USR_NameOptions.find(
      (item: any) => item.No === formValue.contact_USR_Name
    );

    const body = {
      ...formValue,

      ID: 0,

      ven_uniform: formValue.vendorUID,
      VEN_Name: formValue.vendorCName,
      VEN_EngName: formValue.vendorEName,
      VEN_ContactPerson: formValue.VEN_Boss,

      // 訪談人員代碼
      contact_USR_No: formValue.contact_USR_Name,

      // 訪談人員中文姓名
      contact_USR_Name: selectedContactUser?.Name ?? '',

      tlt_name: formValue.brand,
      bus_type: formValue.bus_type,

      VEN_BossTel: formValue.VEN_BossTel,
      VEN_BossTitle: formValue.VEN_BossTitle,
      VEN_BossMobile: formValue.VEN_BossMobile,
      VEN_BossEmail: formValue.VEN_BossEmail,
      VEN_BossFax: formValue.VEN_BossFax,
      VEN_Addr: formValue.VEN_Addr,

      contact_Date: this.formatDateOnly(formValue.contact_Date),
      contact_Time: this.formatTime(formValue.contact_Time),

      willing_level: formValue.willing_level,
      building_no: formValue.building_no,
      FLOOR_NO: formValue.FLOOR_NO,
      LOCATION_No: formValue.LOCATION_No,

      contact_record: formValue.contact_record,
      contact_remarks: formValue.contact_remarks,
    };

    const currentContactDate = body.contact_Date;
    const currentContactTime = body.contact_Time;

    const isSameDateTime =
      this.originalContactDate !== null &&
      this.originalContactTime !== null &&
      this.originalContactDate === currentContactDate &&
      this.originalContactTime === currentContactTime;

    if (isSameDateTime && this.originalID) {

      const updateBody = {
        ...body,
        ID: this.originalID
      };

      this.tls12020Service
        .updateTLS12020(updateBody)
        .pipe(finalize(() => (this.btnLoading = false)))
        .subscribe({
          next: (res) => {
            if (res.Status === '0000') {
              this.messageService.successBubble(
                this.translate.instant('更新成功')
              );
            } else {
              this.messageService.errorBubble(
                this.translate.instant('更新失敗') + '：' + (res.Message || '')
              );
            }

            this.onCancel();
          }
        });

    } else {

      this.tls12020Service
        .insertTLS12020(body)
        .pipe(finalize(() => (this.btnLoading = false)))
        .subscribe({
          next: (res) => {
            if (res.Status === '0000') {
              this.messageService.successBubble(
                this.translate.instant('新增成功')
              );

              this.dataForm.reset();
            } else {
              this.messageService.errorBubble(
                this.translate.instant('新增失敗') + '：' + (res.Message || '')
              );
            }

            this.onCancel();
          }
        });
    }
  });
}
  override onCancel(): void {
    this.router.navigate(
      ['/account/tls/tls12020'],
      { state: { fromRoute: '' } }
    );
  }

};
