import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
// import { TLS12020Service } from '../../../service/api/tls/tls12020.service';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputTextareaComponent } from '@shared/componentkit';



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
    InputNumberComponent,
    EditorTextComponent,
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
    VEN_Boss: ['', [Validators.required, Validators.maxLength(12)]], // 聯絡人
    VEN_BossTel: ['', [Validators.required, Validators.maxLength(18)]], // 聯絡人電話(O)
    VEN_BossTitle: ['', [Validators.maxLength(15)]], // 聯絡人稱謂
    VEN_BossMobile: ['', [Validators.maxLength(18)]], // 聯絡人手機
    VEN_BossEmail: ['', [Validators.maxLength(60)]], // 聯絡人電子郵件
    VEN_Addr: ['', [Validators.maxLength(100)]], // 公司地址

    contact_Date: [null, [Validators.required]], // 訪談日期（必填）
    contact_Time: [null, [Validators.required]], // 訪談時間(24H)（必填）

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

  constructor(
    private fb: FormBuilder,
    private dropDownListService: DropDownListService,
    // private tls12020Service: TLS12020Service
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS12020', this.dataForm);

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
    //統編API
    this.dropDownListService.queryPOS2013_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.vendorUIDOptions = res.Data;
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

  onSubmit() {
    this.handleSubmit(this.dataForm, () => {
      console.log('Form submitted successfully');
    });
  }

};
