import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
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
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';


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

  ],
})
export class TLS12020CRUComponent extends BasicQueryPageComponent<any> implements OnInit {
  dataForm: FormGroup = this.fb.group({
    vendorUID: ['', Validators.required],
    vendorCName: ['', Validators.required],
    vendorEName: [''],
    brand: [''],
    bus_type: [''],
    VEN_Boss: [''],
    VEN_BossTel: [''],
    VEN_BossTitle: [''],
    VEN_BossMobile: [''],
    VEN_BossEmail: [''],
    VEN_Addr: [''],
    contact_Date: [null],
    contact_Time: [null],
    willing_level: [''],
    FLOOR_NO: [''],
    LOCATION_No: [null],
    contact_record: [''],
    contact_remarks: [''],
    interviewer: [''],
  });


  isFormReadable = false;
  formTitle = '訪談資料';

  // 下拉選單 options
  vendorUIDOptions: IDropdownItem[] = [];
  industryCodeOptions: IDropdownItem[] = [];
  willinglevelOptions: IDropdownItem[] = [];
  floorOptions: IDropdownItem[] = [];
  interviewerOptions: IDropdownItem[] = [];

  constructor(
    private fb: FormBuilder,
    private dropDownListService: DropDownListService
  ) {
    super();
  }
  ngOnInit(): void {
    const state = history.state;

    // 訪談狀態處理
    if (state?.crudstatus === CRUDStatus.Read) {
      this.isFormReadable = true;
      this.dataForm.disable();
    }

    if (state?.rowdata) {
      this.dataForm.patchValue(state.rowdata);
    }

    // 初始化 options（可根據實際需求呼叫 service）
    this.loadDropdownOptions();
  }

  loadDropdownOptions() {
    // Example: 呼叫 DropDown service
    this.dropDownListService.queryVendorUIDOptions().pipe(untilDestroyed(this)).subscribe(res => {
      this.vendorUIDOptions = res.Data;
    });

    this.dropDownListService.queryIndustryOptions().pipe(untilDestroyed(this)).subscribe(res => {
      this.industryCodeOptions = res.Data;
    });

    this.dropDownListService.queryWillingLevelOptions().pipe(untilDestroyed(this)).subscribe(res => {
      this.willinglevelOptions = res.Data;
    });

    this.dropDownListService.queryFloorOptions().pipe(untilDestroyed(this)).subscribe(res => {
      this.floorOptions = res.Data;
    });

    this.dropDownListService.queryInterviewerOptions().pipe(untilDestroyed(this)).subscribe(res => {
      this.interviewerOptions = res.Data;
    });
  }

  onSubmit(frm: FormGroup) {
    this.submitted = true;
    if (frm.invalid) {
      return;
    }

    this.loading = true;

    const body = frm.getRawValue();

    // 判斷是否為新增或修改，可根據需要決定要呼叫哪個 API
    if (history.state?.crudstatus === CRUDStatus.Create) {
      this.tls12020Service.createTLS12020(body)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: () => {
            console.log('新增成功');
            this.loading = false;
          },
          error: () => {
            console.error('新增失敗');
            this.loading = false;
          }
        });
    } else if (history.state?.crudstatus === CRUDStatus.Edit) {
      this.tls12020Service.updateTLS12020(body)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: () => {
            console.log('更新成功');
            this.loading = false;
          },
          error: () => {
            console.error('更新失敗');
            this.loading = false;
          }
        });
    }
  }

  onCancel() {
    window.history.back();
  }
}
