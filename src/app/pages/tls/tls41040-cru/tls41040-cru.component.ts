import { DropDownListService } from './../../../service/utility/dropDownList.service';
// import { ValidationService } from './../../../shared/service/validation.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, map } from 'rxjs';
import { Column } from '../../../shared/componentkit/table/table.model';
import { UserSys3700Detail } from '@pages/sys/sys0110/sys0110.model';
import { apiOption, option } from '../../../shared/models/sys/sysb000.model';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { UserCodeService } from '@service/basic/user-code.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';



@Component({
  selector: 'app-tls41040-cru',
  templateUrl: './tls41040-cru.component.html',
  styleUrl: './tls41040-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    RadiobuttonComponent,
    ButtonComponent,
    CommonModule,
    TableComponent,
    InputTextareaComponent
  ]
})
export class TLS41040CRUComponent extends BasicCruPageComponent<any> implements OnInit {

  // 表單（你的陣列格式）
  dataForm = this.formBuilder.group({
    NOT_DateTime: [null, [Validators.required]],
    NOT_BegDateTime: [null, [Validators.required]],
    NOT_EndDateTime: [null, [Validators.required]],
    NOT_Status: ['A', [Validators.required]],

    NOT_Remark: ['', [Validators.maxLength(200)]],
    NOT_Desc: ['', [Validators.maxLength(2000)]],

    NOT_DispRt: ['Y'],
    NOT_DispSpd: ['Y'],
    NOT_DispBtn: ['Y'],
    NOT_DispCd: ['Y'],
    NOT_Prn: ['Y'],
    NOT_DtlLimit: ['Y'],
  });

  // 狀態選單
  NOT_Status_Option: any[] = [
    { value: 'A', label: '已生效（預設）' },
    { value: 'D', label: '已刪除' },
  ];

  // Table 欄位
  columns: Column[] = [];

  // 下拉選項
  SYS3100_Options: { value: string; label: string }[] = []; // 通告序號/組織
  SYS3700_Options: { value: string; label: string }[] = []; // 館別
  SYS3800_Options: { value: string; label: string }[] = []; // 樓層
  SYS3A00_Options: { value: string; label: string }[] = []; // 區域
  ECR_Type_Options: { value: string; label: string }[] = []; // 機台類型
  TLTTALENT_OPTIONS: { No: string; Name: string; label: string }[] = []; // 專櫃
  ECR_GrpNoOptions: { value: string; label: string }[] = []; // 機檯群組編號

  // 其他
  data: UserSys3700Detail[] = [];
  selectedRows: UserSys3700Detail[] = [];
  titleOptions: apiOption[] = [];
  userStatusOptions: option[] = [];
  userTypeOptions: option[] = [];

  constructor(
    private translate: TranslateService,
    private locationOptionsService: LocationOptionsService,
    private dropDownListService: DropDownListService,
    private userCodeService: UserCodeService,

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS41040', this.dataForm);
    this.loadAndSetupColumns();
    this.dataForm.get('org_ID')?.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      if (this.isFormCreateable && value && this.data.length === 0) {
        this.data = [
          {
            ID: 0,
            User_No: this.dataForm.get('user_No')?.value,
            Org_ID: value,
            Building_No: null,
            Floor_No: null,
            Area_No: null,
            TLT_No: null,
            TLT_Kind: null,
            BUS_Type: null
          }
        ];
      }
    });
  }

  // ===== 載入選項並設定 Table 欄位（用物件版 forkJoin，避免 tuple 推斷錯誤） =====
  private loadAndSetupColumns() {
    const Org_ID$ = this.locationOptionsService.getOrgOptions().pipe(
      map((res: any[]) => res.map(x => ({ value: x.value, label: x.label })))
    );

    const Building_No$ = this.locationOptionsService.getBuildingOptions().pipe(
      map((res: any[]) => res.map(x => ({ value: x.value, label: x.label })))
    );

    const Floor_No$ = this.locationOptionsService.getFloorOptions().pipe(
      map((res: any[]) => res.map(x => ({ value: x.value, label: x.label })))
    );

    const Area_No$ = this.locationOptionsService.getRegionOptions().pipe(
      map((res: any[]) => res.map(x => ({ value: x.value, label: x.label })))
    );

    // 機檯群組編號
    const ECR_GrpNo$ = this.dropDownListService
      .queryPOS1002_DropDownList()
      .pipe(map(res => (res?.Data ?? []).map((it: any) => ({
        value: it.value ?? it.id ?? it.No,
        label: it.label ?? it.name ?? it.Name ?? `${it.No}-${it.Name}`,
      }))));

    // 機台類型（SYS1000）
    const ECR_Type$ = this.dropDownListService
      .querySYS1000_DropDownList({ SYS_Type: 'ECR_Type', SYS_Status: 'A' } as any) // 若需只取啟用，加 SYS_Status:'A'
      .pipe(
        map(res => {
          const raw = Array.isArray(res?.Data) ? res.Data : [];
          // 後端可能回 {value,label} 或 {SYS_Code,SYS_Name} / {id,name}
          return raw.map((it: any) => ({
            value: it.value ?? it.SYS_Code ?? it.code ?? it.No ?? it.id ?? '',
            label: it.label ?? it.SYS_Name ?? it.name ?? it.Name ?? it.text ?? '',
          }));
        })
      );
    const TLTTALENT_OPTIONS$ = this.dropDownListService.queryTLTTALENT_DropDownList().pipe(
      map((response) => response.Data
        .map((item: { No: string, Name: string }) => ({
          ...item,
          label: item.No + '-' + item.Name,
        })))
    );



    forkJoin({
      Org_ID: Org_ID$,
      TLT_No: TLTTALENT_OPTIONS$,
      ECR_Type: ECR_Type$,
      ECR_GrpNo: ECR_GrpNo$,
      Building_No: Building_No$,
      Floor_No: Floor_No$,
      Area_No: Area_No$,
    }).subscribe(({ Org_ID, TLT_No, ECR_Type, ECR_GrpNo, Building_No, Floor_No, Area_No }) => {
      this.SYS3100_Options = Org_ID ?? [];
      this.TLTTALENT_OPTIONS = Array.isArray(TLT_No) ? TLT_No.map(item => ({
        No: item.No ?? '',
        Name: item.Name ?? '',
        label: `${item.No}-${item.Name}`,
      })) : [];
      this.ECR_Type_Options = Array.isArray(ECR_Type) ? ECR_Type.map(item => ({
        value: item.value ?? '',
        label: item.label ?? '',
      })) : [];
      this.ECR_GrpNoOptions = ECR_GrpNo ?? [];
      this.SYS3700_Options = Building_No ?? [];
      this.SYS3800_Options = Floor_No ?? [];
      this.SYS3A00_Options = Area_No ?? [];


      this.columns = [
        { field: 'Org_ID', header: '通告序號', type: 'dropdown', options: this.SYS3100_Options, optionLabel: 'label', optionValue: 'value' },
        { field: 'TLT_No', header: '專櫃編號', type: 'dropdown', options: this.TLTTALENT_OPTIONS, optionLabel: 'label', optionValue: 'No' },
        { field: 'ECR_Type', header: '機台類型', type: 'dropdown', options: this.ECR_Type_Options, optionLabel: 'label', optionValue: 'value' },
        { field: 'ECR_GrpNo', header: '機檯群組編號', type: 'dropdown', options: this.ECR_GrpNoOptions, optionLabel: 'label', optionValue: 'value' },
        { field: 'Building_No', header: '館別代碼', type: 'dropdown', options: this.SYS3700_Options, optionLabel: 'label', optionValue: 'value' },
        { field: 'Floor_No', header: '樓層代碼', type: 'dropdown', options: this.SYS3800_Options, optionLabel: 'label', optionValue: 'value' },
        { field: 'Area_No', header: '區域代碼', type: 'dropdown', options: this.SYS3A00_Options, optionLabel: 'label', optionValue: 'value' },
      ];
    });
  }

  // ===== 送出 =====
  onSubmit(form: FormGroup): void {
    if (form.invalid) {
      console.warn('Form invalid');
      return;
    }
    console.log('Form submitted:', form.getRawValue());
  }
  // 刪除資料的方法
  onDelete(rows: UserSys3700Detail[]) { // 將參數從單一 'row' 改為 'rows' 陣列
    const idsToDelete = new Set(rows.map(item => item.ID)); // 取得所有要刪除的 ID
    this.data = this.data.filter((item: UserSys3700Detail) => !idsToDelete.has(item.ID));
    this.selectedRows = [];
  }
}
