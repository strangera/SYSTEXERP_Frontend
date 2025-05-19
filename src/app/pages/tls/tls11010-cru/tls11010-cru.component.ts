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
  inputForm = this.formBuilder.nonNullable.group({
    LOCATION_Name: ['', [Validators.required, Validators.maxLength(30)]],
    org_id: ['', [Validators.required, Validators.maxLength(20)]],
    building_no: ['', [Validators.required, Validators.maxLength(1)]],
    FLOOR_NO: ['', [Validators.required, Validators.maxLength(2)]],
    AREA_NO: ['', [Validators.required, Validators.maxLength(2)]],
    GROSS_SPACE: [null, [Validators.required, Validators.min(0), Validators.max(9999.999)]],
    NET_SPACE: [null, [Validators.required, Validators.min(0), Validators.max(9999.999)]],
    LOCATION_Status: [0, [Validators.required, Validators.maxLength(1)]],
    Purpose_no: ['', [Validators.required, Validators.maxLength(2)]],
    Draw_X: ['', [Validators.maxLength(255)]],
    Draw_Y: ['', [Validators.maxLength(255)]],
  });

  floorOptions: any[] = [];
  RegionCodeOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  usageOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];

  LOCATION_Status_Options: any[] = [
    { value: 0, label: '空位' },
    { value: 1, label: '使用中' },
    { value: 2, label: '保留(不使用)' },
    { value: 3, label: '停用' },
  ];

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

    if (this.crudstatus === CRUDStatus.Create) {
      this.inputForm.patchValue({
        LOCATION_Status: 0,
      });
    }

    this.tls11010Service.getFloorOptions().subscribe(res => this.floorOptions = res);
    this.tls11010Service.getRegionOptions().subscribe(res => this.RegionCodeOptions = res);
    this.tls11010Service.getOrgOptions().subscribe(res => this.OrganizationCodeOptions = res);
    this.tls11010Service.getUsageOptions().subscribe(res => this.usageOptions = res);
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
          // ✅ 編輯成功後也不跳頁，改為清空資料
          this.inputForm.reset();
          this.inputForm.markAsPristine();
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
}
