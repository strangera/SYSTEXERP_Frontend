import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { NgIf } from '@angular/common';
import { forkJoin, map } from 'rxjs';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';

import { LocationOptionsService } from '@service/api/dropdownservice/location-options.service';
import { Sys0110Service } from '@service/api/sys/sys0110.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropDownListService } from '@service/utility/dropDownList.service';

// 只用到欄位
interface SYS1000 {
  SYS_Type: string;
  SYS_Code: string;
  SYS_Name: string;
}

@UntilDestroy()
@Component({
  selector: 'app-tls43040-cru',
  templateUrl: './tls43040-cru.component.html',
  styleUrls: ['./tls43040-cru.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    ButtonComponent,
    NgIf,
    TranslateModule,
    TableComponent,
  ],
})
export class TLS43040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  constructor(
    private locationOptionsService: LocationOptionsService,
    private sys0110Service: Sys0110Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  // ===== Form =====
  dataForm = this.formBuilder.nonNullable.group({
    ECR_GrpNo: [{ value: '自動編號', disabled: true }],
    ECR_GrpName: ['', [Validators.required, Validators.maxLength(64)]],
    ECR_GrpDesc: ['', [Validators.maxLength(255)]],
    ECR_DtlLimit: [0, [Validators.maxLength(1)]],
    CRT_Date: [],
    CRT_USR_No: ['', [Validators.maxLength(8)]],
    CRT_USR_Name: ['', [Validators.maxLength(20)]],
    UPD_Date: [],
    UPD_USR_No: ['', [Validators.maxLength(8)]],
  });

  // ===== 下拉資料源 =====
  ECR_DtlLimit_Options = [
    { value: 0, label: '不限制' },
    { value: 1, label: '符合明細設定的機台才列入群組' },
    { value: 2, label: '不符合明細設定的機台才列入群組' },
  ];
  POS1002_ECR_Options: { label: string; value: string }[] = [];
  SYS1000_ECRType_Options: { label: string; value: string }[] = [];
  SYS3700_Options: { label: string; value: string }[] = []; // 館別
  SYS3900_Options: { label: string; value: string }[] = []; // 樓層
  SYS3A00_Options: { label: string; value: string }[] = []; // 區域
  TLTTALENT_OPTIONS: { label: string; No: string; Name?: string }[] = [];

  // 表格
  data: any[] = [];
  selectedRows: any[] = [];
  columns: Column[] = [];

  ngOnInit(): void {
    this.initializePage('TLS43040', this.dataForm);
    this.loadAndSetupColumns();
  }

  // ===== 載入下拉並設定 columns =====
  private loadAndSetupColumns(): void {
    // 1) POS1002.ECR_No
    const pos1002Options$ = this.dropDownListService.queryPOS1002_DropDownList().pipe(
      map((res: any) => (res?.Data ?? []).map((x: any) => {
        const no = x.No ?? x.ECR_No ?? x.value ?? '';
        const name = x.Name ?? x.ECR_Name ?? x.label ?? '';
        return { label: name ? `${no} - ${name}` : `${no}`, value: no };
      }))
    );

    // 2) SYS1000 機台類型 (SYS_Type='ECR_Type')
    const ecrTypeOptions$ = this.sys0110Service.queryAllSystemCode({}).pipe(
      map((res: any) =>
        (res?.Data ?? [])
          .filter((x: SYS1000) => x.SYS_Type === 'ECR_Type')
          .map((x: SYS1000) => ({ label: `${x.SYS_Code}-${x.SYS_Name}`, value: x.SYS_Code }))
      )
    );

    // 3) 館別/樓層/區域
    const buildingOptions$ = this.locationOptionsService.getBuildingOptions(); // -> 館別
    const floorOptions$ = this.locationOptionsService.getFloorOptions();    // -> 樓層
    const regionOptions$ = this.locationOptionsService.getRegionOptions();   // -> 區域

    // 4) 專櫃 TLT_No
    const tltTalentOptions$ = this.sys0110Service.queryTLTTALENT_DropDownList({}).pipe(
      map((res: any) => (res?.Data ?? []).map((i: any) => ({
        ...i,
        label: `${i.No}-${i.Name}`,
        No: i.No,
      })))
    );

    // RxJS v8：forkJoin 用 rest 參數
    forkJoin(
      pos1002Options$,
      ecrTypeOptions$,
      buildingOptions$,
      floorOptions$,
      regionOptions$,
      tltTalentOptions$,
    )
      .pipe(untilDestroyed(this))
      .subscribe(([
        POS1002_ECR_Options,
        SYS1000_ECRType_Options,
        SYS3700_Options,
        SYS3900_Options,
        SYS3A00_Options,
        TLTTALENT_OPTIONS,
      ]) => {
        this.POS1002_ECR_Options = POS1002_ECR_Options ?? ([] as { label: string; value: string }[]);
        this.SYS1000_ECRType_Options = SYS1000_ECRType_Options ?? [];
        this.SYS3700_Options = SYS3700_Options ?? [];
        this.SYS3900_Options = SYS3900_Options ?? [];
        this.SYS3A00_Options = SYS3A00_Options ?? [];
        this.TLTTALENT_OPTIONS = TLTTALENT_OPTIONS ?? [];

        this.columns = [
          {
            field: 'ECR_No', header: '收銀機號', type: 'dropdown',
            options: this.POS1002_ECR_Options, optionLabel: 'label', optionValue: 'value'
          },

          {
            field: 'ECR_Type', header: '機台類型', type: 'dropdown',
            options: this.SYS1000_ECRType_Options, optionLabel: 'label', optionValue: 'value'
          },

          {
            field: 'TLT_No', header: '專櫃編號', type: 'dropdown',
            options: this.TLTTALENT_OPTIONS, optionLabel: 'label', optionValue: 'No'
          },

          {
            field: 'Building_No', header: '館別代碼', type: 'dropdown',
            options: this.SYS3700_Options, optionLabel: 'label', optionValue: 'value'
          },

          {
            field: 'Floor_No', header: '樓層代碼', type: 'dropdown',
            options: this.SYS3900_Options, optionLabel: 'label', optionValue: 'value'
          },

          {
            field: 'Area_No', header: '區域', type: 'dropdown',
            options: this.SYS3A00_Options, optionLabel: 'label', optionValue: 'value'
          },
        ];
      });
  }

  // ===== 事件 =====
  onDelete(rows: any[]) {
    const ids = new Set(rows.map(r => r.ID));
    this.data = this.data.filter(x => !ids.has(x.ID));
    this.selectedRows = [];
  }

  onSubmit(form: FormGroup): void {
    if (form.valid) {
      console.log('提交成功:', form.value);
      // TODO: 串接新增/更新 API
    } else {
      console.log('表單驗證未通過');
    }
  }

  resetTable() {
    this.data = [];
    this.selectedRows = [];
  }
}
