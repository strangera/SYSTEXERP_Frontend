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
import { InputTextareaComponent } from '@shared/componentkit';
import { ValidationService } from '@shared/service';




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
    InputTextareaComponent
  ],
})
export class TLS12020CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.fb.nonNullable.group({
    vendorUID: ['', [Validators.required]], // 廠商統一編號（必填）
    vendorCName: ['', [Validators.required, Validators.maxLength(60)]], // 廠商名稱(中文)
    vendorEName: ['', [Validators.maxLength(60)]], // 廠商名稱(英文)
    brand: ['', [Validators.maxLength(30)]], // 品牌
    bus_type: ['', [Validators.required]], // 大分類（必填）
    VEN_Boss: ['', [Validators.required, Validators.maxLength(20)]], // 聯絡人
    VEN_BossTel: ['', [Validators.required, Validators.maxLength(18)]], // 聯絡人電話(O)
    VEN_BossTitle: ['', [Validators.maxLength(15)]], // 聯絡人稱謂
    VEN_BossMobile: ['', [Validators.maxLength(18)]], // 聯絡人手機
    VEN_BossEmail: ['', [Validators.maxLength(60)]], // 聯絡人電子郵件
    VEN_Addr: ['', [Validators.maxLength(100)]], // 公司地址

    contact_Date: [null, [Validators.required]], // 訪談日期（必填）
    contact_Time: [null, [Validators.required]], // 訪談時間(24H)（必填）
    building_no: ['', [Validators.required]],
    willing_level: ['', [Validators.required]], // 意願等級（必填）
    FLOOR_NO: ['', [Validators.required]], // 樓層編號（必填）
    LOCATION_No: [null, [Validators.maxLength(60)]], // 擬洽位置編號

    contact_record: [''], // 洽談重點及洽談紀錄
    contact_remarks: [''], // 備註

    contact_USR_Name: ['', [Validators.required]], // 訪談人員（必填）
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
    //大分類API
    this.dropDownListService.queryPOS2003_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.industryCodeOptions = res.Data;
    });
    //館別
    this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.buildingNoOptions = res.Data.map(x => ({ label: x.Name, value: x.No, Name: x.Name, No: x.No }));
    });
    //統編API
    this.dropDownListService.queryPOS2013_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.vendorUIDOptions = res.Data;
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
        contact_Date: formValue.contact_Date,
        contact_Time: formValue.contact_Time,
        willing_level: formValue.willing_level,
        building_no: formValue.building_no,
        FLOOR_NO: formValue.FLOOR_NO,
        LOCATION_No: formValue.LOCATION_No,
        contact_record: formValue.contact_record,
        contact_remarks: formValue.contact_remarks,
        contact_USR_Name: formValue.contact_USR_Name,
      };

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
