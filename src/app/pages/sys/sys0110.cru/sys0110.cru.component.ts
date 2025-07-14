import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { apiOption, option, SYS1000 } from '../../../shared/models/sys/sysb000.module';
import { Sys0110Service } from '../../../service/api/sys/sys0110.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { EncryptionService } from '../../../shared/service/encryption.service';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { Column } from '../../../shared/componentkit/table/table.model';
import { Sysb800DropdownService } from '../../../service/api/sys/sysb800-dropdown.service';
import { finalize, forkJoin, map } from 'rxjs';
import { UserInfo, UserSys3700Detail } from '../sys0110/sys0110.model';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { NgIf } from '@angular/common';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
// 4-2-1-1使用者基本資料維護
@Component({
    selector: 'app-sys0110-cru',
    templateUrl: './sys0110.cru.component.html',
    standalone: true,
    imports: [
        MenubarComponent,
        ButtonComponent,
        PanelModule,
        FormsModule,
        ReactiveFormsModule,
        InputTextComponent,
        DropdownComponent,
        CalendarRangeQuickComponent,
        NgIf,
        CalendarComponent,
        TableComponent,
        TranslateModule,
    ],
})
export class SYS0110CRUComponent extends BasicCruPageComponent<UserInfo> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    id: [null], // 序號
    user_No: ['', [Validators.required, Validators.maxLength(10)]], // 使用者編號
    user_Name: ['', [Validators.required, Validators.maxLength(20)]], // 使用者名稱
    user_Password: ['', [Validators.required]], // 使用者密碼-加密
    title: ['', Validators.maxLength(6)], // 職稱代碼-SYS1000 (就是職位)
    org_ID: ['', [Validators.required, Validators.maxLength(20)]], // 組織編號 (SYSB400_SYS3100)
    str_date: [null], // 帳號有效開始日期
    end_date: [null], // 帳號有效結束日期
    status: ['', [Validators.required, Validators.maxLength(1)]], // 使用者狀態 1=有效 2=停用
    user_type: ['', [Validators.required, Validators.maxLength(1)]], // 使用者型態 1=公司內部人員(default) 2=專櫃人員 3=其他
    user_email: ['', [Validators.email, Validators.maxLength(100)]], // 使用者email帳號
    TLT_No: ['', Validators.maxLength(12)], // 所屬專櫃編號
    remarks: ['', Validators.maxLength(100)], // 備註
    user_priority: ['', Validators.maxLength(1)], // 使用者等級
    USER_PwdExpireDate: [{ value: null, disabled: true }], // 密碼到期日 YYYY/MM/DD HH:NN:SS，若使用者登入系統的時間大於此日期，則需強制使用者變更密碼
    last_Login: [null], // 上次登入時間
    CRT_Date: [{ value: null, disabled: true }], // 建立日期
    CRT_USR_No: [{ value: '', disabled: true }], // 建立人員編號
    CRT_USR_Name: [{ value: '', disabled: true }], // 建立人員名稱
    UPD_Date: [{ value: null, disabled: true }], // 更新日期
    UPD_USR_No: [{ value: '', disabled: true }], // 更新人員編號
    UPD_USR_Name: [{ value: '', disabled: true }], // 更新人員名稱
  });
  // 下拉選單選項
  SYS3100_Options: { value: string; label: string }[] = [];
  titleOptions: apiOption[] = [];
  userStatusOptions: option[] = [];
  userTypeOptions: option[] = [];
  SYS3700_Options: { value: string; label: string }[] = [];
  SYS3800_Options: { value: string; label: string }[] = [];
  SYS3A00_Options: { value: string; label: string }[] = [];
  TLTTALENT_OPTIONS: { No: string; Name: string }[] = [];
  TLT_Kind_Options: { value: string; label: string }[] = [
    { value: '1', label: '正櫃' },
    { value: '2', label: '臨時櫃' },
    { value: '3', label: '特賣會' },
    { value: '4', label: '虛擬櫃' },
  ]
  BUS_TypeOptions: { value: string; label: string }[] = []

  data: UserSys3700Detail[] = [];
  selectedRows: UserSys3700Detail[] = [];
  columns: Column[] = [];

  constructor(
    private locationOptionsService: LocationOptionsService,
    private sys0110Service: Sys0110Service,
    private encrypt: EncryptionService,
    private sysb800DropdownService: Sysb800DropdownService,
    private userCodeService: UserCodeService,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('SYS0110', this.dataForm);
    if (this.isFormEditable) {
      this.dataForm.get('user_No')?.disable();
      this.dataForm.get('user_Password')?.disable();
    }
    if (!this.isFormCreateable) {
      this.rowdata?.sys3700?.forEach((item: UserSys3700Detail) => {
        this.data.push(item);
      })

    }
    this.loadAndSetupColumns(); // 呼叫新的方法來處理異步載入和 columns 設定
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
  // 加載下拉選項
  loadAndSetupColumns() {
    const orgOptions$ = this.locationOptionsService.getOrgOptions().pipe(
      map((options: any) => options.map((item: { value: string; label: string }) => ({
        ...item,
        label: item.value + ' - ' + item.label,
      })))
    );

    //讀取T103項目
    const systemCodeOptions$ = this.sys0110Service.queryAllSystemCode({}).pipe(
      map((response) => response.Data
        .filter((item: SYS1000) => item.SYS_Type === 'T103')
        .map((item: SYS1000) => ({
          No: item.SYS_Code,
          Name: item.SYS_Name,
          Label: item.SYS_Type + '-' + item.SYS_Code + '-' + item.SYS_Name,
        })))
    );

    const buildingOptions$ = this.locationOptionsService.getBuildingOptions()
    const floorOptions$ = this.locationOptionsService.getFloorOptions()
    const regionOptions$ = this.locationOptionsService.getRegionOptions()
    const busTypeOptions$ = this.sysb800DropdownService.getSystemTypes();
    const TLTTALENT_OPTIONS$ = this.sys0110Service.queryTLTTALENT_DropDownList({}).pipe(
      map((response) => response.Data
        .map((item: { No: string, Name: string }) => ({
          ...item,
          label: item.No + '-' + item.Name,
        })))
    );

    // 使用 forkJoin 等待所有異步請求完成
    forkJoin([
      orgOptions$,
      systemCodeOptions$,
      buildingOptions$,
      floorOptions$,
      regionOptions$,
      busTypeOptions$,
      TLTTALENT_OPTIONS$,
    ]).pipe(untilDestroyed(this)).subscribe(([
      orgOptions,
      systemCodeOptions,
      buildingOptions,
      floorOptions,
      regionOptions,
      busTypeOptions,
      TLTTALENT_OPTIONS
    ]) => {
      // 在這裡，所有的選項都已經載入完畢
      this.SYS3100_Options = orgOptions;
      this.titleOptions = systemCodeOptions;
      this.SYS3700_Options = buildingOptions;
      this.SYS3800_Options = floorOptions;
      this.SYS3A00_Options = regionOptions;
      this.BUS_TypeOptions = busTypeOptions;
      this.TLTTALENT_OPTIONS = TLTTALENT_OPTIONS;

      // 設定靜態選項 (如果它們是靜態的)
      this.userStatusOptions = [
        { value: '1', label: '有效' },
        { value: '2', label: '停用' },
      ];
      this.userTypeOptions = [
        { value: '1', label: '公司內部人員' },
        { value: '2', label: '專櫃人員' },
        { value: '3', label: '其他' },
      ];

      // 現在所有選項都已準備好，可以安全地設定 columns
      this.columns = [
        // { field: 'User_No', header: '使用者編號' },
        // { field: 'SEQ_No', header: '序號' },
        // { field: 'id', header: 'ID' },
        { field: 'Org_ID', header: '組織代碼', type: 'dropdown', options: this.SYS3100_Options, optionLabel: 'label', optionValue: 'value' },
        { field: 'Building_No', header: '館別代碼', type: 'dropdown', options: this.SYS3700_Options, optionLabel: 'label', optionValue: 'value' },
        { field: 'Floor_No', header: '樓層代碼', type: 'dropdown', options: this.SYS3800_Options, optionLabel: 'label', optionValue: 'value' },
        { field: 'Area_No', header: '區域代碼', type: 'dropdown', options: this.SYS3A00_Options, optionLabel: 'label', optionValue: 'value' },
        { field: 'TLT_No', header: '專櫃編號', type: 'dropdown', options: this.TLTTALENT_OPTIONS, optionLabel: 'label', optionValue: 'No' },
        { field: 'TLT_Kind', header: '專櫃類型', type: 'dropdown', options: this.TLT_Kind_Options, optionLabel: 'label', optionValue: 'value' }, // 假設這是靜態的
        { field: 'BUS_Type', header: '大分類代碼', type: 'dropdown', options: this.BUS_TypeOptions, optionLabel: 'label', optionValue: 'value' },
      ];
    });
  }
  // 刪除資料的方法
  onDelete(rows: any[]) { // 將參數從單一 'row' 改為 'rows' 陣列
    const idsToDelete = new Set(rows.map(item => item.ID)); // 取得所有要刪除的 ID
    this.data = this.data.filter((item: any) => !idsToDelete.has(item.ID));
    this.selectedRows = [];
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const today = new Date();
      const expireDate = new Date(today);
      expireDate.setDate(today.getDate() + 90);
      const body = {
        ...frm.value,
        user_Password: this.isFormCreateable ? this.encrypt.getPassword(frm.value.user_No, frm.value.user_Password) : undefined,
        user_No: frm.get('user_No')?.value,
        USER_PwdExpireDate: expireDate.toISOString(),
        sys3700: this.data.map((item: any) => ({
          ...item,
          User_No: frm.get('user_No')?.value,
        })),
      };
      const serviceCall = this.isFormCreateable
        ? this.sys0110Service.createUser(body)
        : this.sys0110Service.updateUser(body);
      serviceCall.pipe(untilDestroyed(this)).subscribe(() => {
        if (this.isFormCreateable) {
          this.messageService.successBubble('新增成功');
          this.dataForm.reset();
          this.resetTable();
        } else if (this.isFormEditable) {
          this.messageService.successBubble('更新成功');
          this.onCancel();
        }
      });
    });
  }

  resetTable() {
    this.data = [];
    this.selectedRows = [];
  }

  resetLoading = false;
  showStar = true;
  resetPassword() {
    const body = {
      SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
      User_No: this.dataForm.get('user_No')?.value || '',
    }
    this.userCodeService.resetPassword(body).pipe(untilDestroyed(this), finalize(() => this.resetLoading = false)).subscribe(response => {
      this.messageService.successBubble(`${this.dataForm.get('user_No')?.value} 密碼重置成功，密碼為：${response.Data}`);
      this.dataForm.get('user_Password')?.setValue(response.Data);
      this.showStar = false;
    });
  }
}
