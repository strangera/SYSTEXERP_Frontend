import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

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
    private http: HttpClient
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS11010', this.inputForm);

    this.http
      .post<any>(`${environment.ApiUrl}/TLS0000/TLS1000/queryTLS11010_SYS3900_DropDownList`, {})
      .subscribe(res => {
        this.floorOptions = Array.isArray(res?.Data)
          ? res.Data.map((i: { No: string; Name: string }) => ({ label: i.Name, value: i.No }))
          : [];
      });

    this.http
      .post<any>(`${environment.ApiUrl}/TLS0000/TLS1000/queryTLS11010_SYS3A00_DropDownList`, {})
      .subscribe(res => {
        this.RegionCodeOptions = Array.isArray(res?.Data)
          ? res.Data.map((i: { No: string; Name: string }) => ({ label: i.Name, value: i.No }))
          : [];
      });

    this.http
      .post<any>(`${environment.ApiUrl}/TLS0000/TLS1000/queryTLS11010_SYS3100_DropDownList`, {})
      .subscribe(res => {
        this.OrganizationCodeOptions = Array.isArray(res?.Data)
          ? res.Data.map((i: { No: string; Name: string }) => ({ label: i.Name, value: i.No }))
          : [];
      });

    this.http
      .post<any>(`${environment.ApiUrl}/TLS0000/TLS1000/queryTLS11010_SYS3F00_DropDownList`, {})
      .subscribe(res => {
        this.usageOptions = Array.isArray(res?.Data)
          ? res.Data.map((i: { No: string; Name: string }) => ({ label: i.Name, value: i.No }))
          : [];
      });

    this.http
      .post<any>(`${environment.ApiUrl}/TLS0000/TLS1000/queryTLS11010_SYS3800_DropDownList`, {})
      .subscribe(res => {
        this.BUILDING_NO_Options = Array.isArray(res?.Data)
          ? res.Data.map((i: { No: string; Name: string }) => ({ label: i.Name, value: i.No }))
          : [];
      });
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
        this.http.post(`${environment.ApiUrl}/TLS0000/TLS1000/insertTLS11010`, payload).subscribe({
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

        this.http.post(`${environment.ApiUrl}/TLS0000/TLS1000/updateTLS11010`, payload).subscribe({
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
