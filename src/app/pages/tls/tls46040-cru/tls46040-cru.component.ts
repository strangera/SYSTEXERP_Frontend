import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { ECRNoService } from '@service/basic/ECRNo.service';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { Validators } from '@angular/forms';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';

// 2.4.6.4 收銀機異動排程維護 CRU
@Component({
  selector: 'app-tls46040-cru',
  templateUrl: './tls46040-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, PanelModule, DropdownComponent,  CalendarComponent, FormsModule, MultiSelectComponent, ReactiveFormsModule, ButtonComponent,TranslateModule, InputTextComponent]
})
export class TLS46040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  ECR_FLD_IDOptions: any[] = [];
  dataForm = this.formBuilder.nonNullable.group({
    ECR_SchNo: ['', Validators.required], // 排程編號
    ECR_SchDate: ['', Validators.required], // 設定啟用日期(起)
    ECR_SchStatus: [[], Validators.required], // 排程狀態
    ECR_No: [[], Validators.required], // 收銀機編號
    ECR_SchFinTime:  [{ value: null, disabled: true }], // 排程作業完成時間
    ECR_FLD_ID: [[]], // 異動類型
    ECR_FLD_NewVal:  [{ value: null, disabled: true }], // 新機台內容
    ECR_FLD_OrgVal: [''] // 原機台內容
  });
  // ----------------------------------------------------------------
  ECRNoOptions: any[] = [];
  ECR_SchStatus_Options: any[] = [
    { value: 'A', label: '啟用' }, // 預設值為A
    { value: 'C', label: '取消' },
  ];

  constructor(
    private ECRNoService: ECRNoService,
    private translate: TranslateService,
    private dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS46040', this.dataForm);
    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = data;
    });
    // 串 SYS1000 下拉選單
    const params = { SYS_Type: 'ECR_FLD_ID' };
    this.dropDownListService.querySYS1000_DropDownList(params).subscribe(res => {
      if (res && res.Data) {
        this.ECR_FLD_IDOptions = res.Data.map(item => ({
          label: `${item.Name}`,
          value: item.No
        }));
      }
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => { });
  }
}
