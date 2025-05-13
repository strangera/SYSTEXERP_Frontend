import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Tls11010Service } from '../../../service/API/tls/tls11010.service';

@Component({
  selector: 'app-tls11010-cru',
  templateUrl: './tls11010-cru.component.html',
  styleUrls: ['./tls11010-cru.component.scss'],
})
export class TLS11010CRUComponent extends BasicCruPageComponent<any> {
  inputForm = this.formBuilder.nonNullable.group({
    LOCATION_No: [{ value: '', disabled: true }, [Validators.maxLength(10)]],
    LOCATION_Name: ['', [Validators.required, Validators.maxLength(30)]],
    BUILDING_NO: ['', [Validators.required, Validators.maxLength(2)]],
    FLOOR_NO: ['', [Validators.required, Validators.maxLength(2)]],
    AREA_NO: ['', [Validators.required, Validators.maxLength(2)]],
    GROSS_SPACE: ['', [Validators.required, Validators.maxLength(7)]],
    NET_SPACE: ['', [Validators.required, Validators.maxLength(7)]],
    LOCATION_Status: ['', [Validators.required]],
    ORG_No: ['', [Validators.required, Validators.maxLength(6)]],
    Location_Purpose: ['', [Validators.required, Validators.maxLength(2)]],
    X_coordinate: ['', [Validators.maxLength(10)]],
    Y_coordinate: ['', [Validators.maxLength(10)]],
    Location_Remark: [''],
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
    private tls11010Service: Tls11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS11010', this.inputForm);

    this.tls11010Service.getFloorOptions().subscribe(res => this.floorOptions = res);
    this.tls11010Service.getRegionOptions().subscribe(res => this.RegionCodeOptions = res);
    this.tls11010Service.getOrgOptions().subscribe(res => this.OrganizationCodeOptions = res);
    this.tls11010Service.getUsageOptions().subscribe(res => this.usageOptions = res);
    this.tls11010Service.getBuildingOptions().subscribe(res => this.BUILDING_NO_Options = res);
  }

  onSubmit(): void {
    this.handleSubmit(this.inputForm, () => {
      const raw = this.inputForm.getRawValue();
      const payload: any = {
        LOCATION_Name: raw.LOCATION_Name,
        BUILDING_NO: raw.BUILDING_NO,
        FLOOR_NO: raw.FLOOR_NO,
        AREA_NO: raw.AREA_NO,
        GROSS_SPACE: raw.GROSS_SPACE,
        NET_SPACE: raw.NET_SPACE,
        LOCATION_Status: raw.LOCATION_Status,
        ORG_No: raw.ORG_No,
        Location_Purpose: raw.Location_Purpose,
        X_coordinate: raw.X_coordinate,
        Y_coordinate: raw.Y_coordinate,
        Location_Remark: raw.Location_Remark,
      };

      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        this.tls11010Service.insertData(payload).subscribe({
          next: () => {
            this.messageService.successBubble(this.translate.instant('success_message'));
            this.router.navigate(['/TLS', 'TLS11010']);
          },
          error: () => {
            this.messageService.errorBubble(this.translate.instant('create_failed'));
          },
        });
      } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        payload.id = this.rowdata?.id;
        payload.LOCATION_No = this.rowdata?.LOCATION_No;

        this.tls11010Service.updateData(payload).subscribe({
          next: () => {
            this.messageService.successBubble(this.translate.instant('updated-successfully'));
            this.router.navigate(['/TLS', 'TLS11010']);
          },
          error: () => {
            this.messageService.errorBubble(this.translate.instant('update_failed'));
          },
        });
      }
    });
  }

  onClearForm(): void {
    this.inputForm.reset({
      LOCATION_Status: '',
    });
  }
}
