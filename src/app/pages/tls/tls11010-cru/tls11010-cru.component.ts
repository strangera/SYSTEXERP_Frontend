import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { TranslateService } from '@ngx-translate/core';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { HttpClient } from '@angular/common/http';
import { Tls11010Service } from '../../../service/API/tls/tls11010.service';

@Component({
  selector: 'app-tls11010-cru',
  templateUrl: './tls11010-cru.component.html',
  styleUrls: ['./tls11010-cru.component.scss'],
})
export class TLS11010CRUComponent extends BasicCruPageComponent<any> {
  // 建立表單欄位，並依據 POS2002 資料表設定欄位驗證規則
  inputForm = this.formBuilder.nonNullable.group({
    // 店位說明 (LOCATION_Name) - 長度 30，可為 null
    LOCATION_Name: ['', [Validators.maxLength(30)]],

    // 組織代碼 (org_id) - 長度 20，可為 null
    org_id: ['', [Validators.maxLength(20)]],

    // 館別代碼 (building_no) - 長度 1，必填
    building_no: ['', [Validators.required, Validators.maxLength(1)]],

    // 樓層代碼 (FLOOR_NO) - 長度 2，必填
    FLOOR_NO: ['', [Validators.required, Validators.maxLength(2)]],

    // 區域代碼 (AREA_NO) - 長度 2，必填
    AREA_NO: ['', [Validators.required, Validators.maxLength(2)]],

    // 簽約坪數 (GROSS_SPACE) - 數值 7,3，可為 null
    GROSS_SPACE: [
      null,
      [Validators.min(0), Validators.max(9999.999)]
    ], // 非必填，故移除 Validators.required

    // 營業坪數 (NET_SPACE) - 數值 7,3，可為 null
    NET_SPACE: [
      null,
      [Validators.min(0), Validators.max(9999.999)]
    ], // 非必填，故移除 Validators.required

    // 使用狀態 (LOCATION_Status) - 長度 1，必填
    LOCATION_Status: [0, [Validators.required, Validators.maxLength(1)]],

    // 用途代碼 (Purpose_no) - 長度 2，必填
    Purpose_no: ['', [Validators.required, Validators.maxLength(2)]],

    // X 軸 (Draw_X) - 長度 255，可為 null
    Draw_X: ['', [Validators.maxLength(255)]],

    // Y 軸 (Draw_Y) - 長度 255，可為 null
    Draw_Y: ['', [Validators.maxLength(255)]],

    // 店位代碼 (LOCATION_No) - 長度 10，必填，由系統帶入
    LOCATION_No: [
      { value: '由系統帶入', disabled: true },
      [Validators.required, Validators.maxLength(10)]
    ]
  });

  floorOptions: any[] = [];
  RegionCodeOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  usageOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];

  readonly locationStatusAll = [
    { value: 0, label: '空位' },
    { value: 1, label: '使用中' },
    { value: 2, label: '停用' },
  ];

  readonly locationStatusCreate = [
    { value: 0, label: '空位' },
    { value: 2, label: '停用' },
  ];

  readonly locationStatusFromVacant = [
    { value: 0, label: '空位' },
    { value: 2, label: '停用' },
  ];

  readonly locationStatusFromDisabled = [
    { value: 2, label: '停用' },
    { value: 0, label: '空位' },
  ];

  readonly locationStatusFromUsed = [
    { value: 1, label: '使用中' },
  ];


  LOCATION_Status_Options: any[] = []; // 實際綁定的下拉選單選項

  constructor(
    private validationService: ValidationService,
    private translate: TranslateService,
    private http: HttpClient,
    private tls11010Service: Tls11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS11010', this.inputForm);

    // 建立或編輯時處理 LOCATION_Status 下拉選單
    if (this.crudstatus === CRUDStatus.Create) {
      // 建立時固定給兩個選項：空位、停用
      this.LOCATION_Status_Options = [
        { value: 0, label: '空位' },
        { value: 2, label: '停用' },
      ];
      this.inputForm.patchValue({ LOCATION_Status: 0 });
      this.inputForm.get('LOCATION_Status')?.enable();
    }

    if (this.crudstatus === CRUDStatus.Edit) {
      const status = Number(this.rowdata?.LOCATION_Status);

      if (status === 1) {
        this.LOCATION_Status_Options = [{ value: 1, label: '使用中' }];
        this.inputForm.patchValue({ ...this.rowdata, LOCATION_Status: 1 }); // ✅ 確保 value 是數字
        this.inputForm.get('LOCATION_Status')?.disable(); // ✅ patch 後再 disable
      } else if (status === 0) {
        this.LOCATION_Status_Options = [
          { value: 0, label: '空位' },
          { value: 2, label: '停用' },
        ];
        this.inputForm.get('LOCATION_Status')?.enable();
        this.inputForm.patchValue(this.rowdata);
      } else if (status === 2) {
        this.LOCATION_Status_Options = [
          { value: 2, label: '停用' },
          { value: 0, label: '空位' },
        ];
        this.inputForm.get('LOCATION_Status')?.enable();
        this.inputForm.patchValue(this.rowdata);
      }
    }







    if (this.crudstatus === CRUDStatus.Read) {
      this.LOCATION_Status_Options = this.locationStatusAll;

      // ✅ 替換 LOCATION_Status 為對應的 option value（避免 disabled 時 dropdown 顯示空白）
      const matched = this.LOCATION_Status_Options.find(
        opt => String(opt.value) === String(this.rowdata?.LOCATION_Status)
      );
      const labelValue = matched ? matched.value : null;

      // ✅ 將原始資料補上對應值再 patch
      this.inputForm.patchValue({
        ...this.rowdata,
        LOCATION_Status: labelValue,
      });

      this.inputForm.disable();
    }


    // 其餘選項初始化
    this.tls11010Service.getFloorOptions().subscribe(res => this.floorOptions = res);
    this.tls11010Service.getRegionOptions().subscribe(res => this.RegionCodeOptions = res);
    this.tls11010Service.getOrgOptions().subscribe(res => {
      this.OrganizationCodeOptions = res?.map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      })) || [];
    });
    this.tls11010Service.getUsageOptions().subscribe((res) => {
      this.usageOptions = res?.map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      })) || [];
    });
    this.tls11010Service.getBuildingOptions().subscribe(res => this.BUILDING_NO_Options = res);
  }

  onSubmit(): void {
    this.handleSubmit(this.inputForm, () => {
      const raw = this.inputForm.getRawValue();

      (raw as any).GROSS_SPACE = Number(raw.GROSS_SPACE);
      (raw as any).NET_SPACE = Number(raw.NET_SPACE);
      (raw as any).LOCATION_Status = String(raw.LOCATION_Status);

      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        console.log('📤 新增送出的 payload：', raw);

        this.tls11010Service.insertData(raw).subscribe({
          next: () => {
            this.messageService.successBubble(this.translate.instant('success_message'));
            this.inputForm.reset(); // ✅ 清空整個表單
            this.inputForm.markAsPristine(); // ✅ 標記為未修改狀態（防止髒表單警告）
          },
          error: () => {
            this.messageService.errorBubble(this.translate.instant('create_failed'));
          },
        });
      } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        (raw as any).id = this.rowdata?.id;
        (raw as any).LOCATION_No = this.rowdata?.LOCATION_No;

        this.tls11010Service.updateData(raw).subscribe({
          next: () => {
            this.messageService.successBubble(this.translate.instant('updated-successfully'));
            this.router.navigate(['/TLS', 'TLS11010']); // ✅ 導回查詢頁
          },
          error: () => {
            this.messageService.errorBubble(this.translate.instant('update_failed'));
          },
        });
      }
    });
  }

  // ✅ 新增刪除方法
  onDelete(): void {
    const id = this.rowdata?.id;
    if (!id) {
      this.messageService.warnBubble('無有效資料可刪除');
      return;
    }

    const confirmDelete = window.confirm('是否確認刪除此筆資料？');
    if (!confirmDelete) return;

    this.tls11010Service.deleteData([id]).subscribe({
      next: () => {
        this.messageService.successBubble('刪除成功');
        this.router.navigate(['/TLS', 'TLS11010']);
      },
      error: () => {
        this.messageService.errorBubble('刪除失敗');
      },
    });
  }
  onClear(): void {
    const keepValues = {
      LOCATION_No: this.inputForm.get('LOCATION_No')?.value,
      LOCATION_Status: this.inputForm.get('LOCATION_Status')?.value,
    };
    // 重設表單
    this.inputForm.reset();
    // 設回保留欄位的值
    this.inputForm.patchValue(keepValues);
    this.inputForm.markAsPristine();
  }
  clearBtnConfig = {
    label: '清除',
    class: 'button-clear',
    text: true
  };
  fakeControlForDisplay(value: string) {
    return this.formBuilder.control({ value, disabled: true });
  }

}
