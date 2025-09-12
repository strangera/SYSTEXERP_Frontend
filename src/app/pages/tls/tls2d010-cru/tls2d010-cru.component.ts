import { Component, OnInit, } from '@angular/core';
import { Validators, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { NgIf } from '@angular/common';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropDownListService } from './../../../service/utility/dropDownList.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-tls2d010-cru',
  templateUrl: './tls2d010-cru.component.html',
  styleUrl: './tls2d010-cru.component.scss',
  standalone: true,
  imports: [TableComponent, InputTextComponent, MenubarComponent, PanelModule, ReactiveFormsModule, DropdownComponent, InputNumberComponent, ButtonComponent, NgIf, TranslateModule]
})
export class TLS2D010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  tlt_noOptions: any[] = [];
  pod_noOptions: any[] = [];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.group({
    tlt_no: [], // 專櫃編號/名稱 招募編號/營運起始日/營運截止日
    totalCash: [{ value: null as string | null, disabled: true }, [Validators.required]],
    pod_no: [], // 活動代碼/名稱
    contract_no: [{ value: null as string | null, disabled: true }, [Validators.required]],
    contract_subno: [{ value: null as string | null, disabled: true }, [Validators.required]],
    tlt_contract_bdate: [{ value: null as string | null, disabled: true }, [Validators.required]],
    tlt_contract_edate: [{ value: null as string | null, disabled: true }, [Validators.required]],
  });
  // 下拉選項
  CAP_Type_Options: { value: string; label: string }[] = [];
  CAP_Item_Options: { value: string; label: string }[] = [];
  AccNo_Options: { value: string; label: string }[] = [];
  org_id_Options: { value: string; label: string }[] = [];
  GUI_FLAG_OPTIONS: { value: string; label: string }[] = [];
  cap_taxtypeOptions: { value: string; label: string }[] = [];


  constructor(
    private dropDownListService: DropDownListService,

  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('tls2d010', this.dataForm);
    //  this.loadAndSetupColumns();
  }
  // // ===== 載入選項並設定 Table 欄位 =====
  //   private loadAndSetupColumns() {
  //     const ECR_GrpNo$ = this.dropDownListService.queryPOS1002GRM_DropDownList()
  //       .pipe(map(res => (res?.Data ?? []).map((it: any) => ({
  //         value: it.No,
  //         label: `${it.No}-${it.Name}`
  //       }))));

  //     const ECR_Type$ = this.dropDownListService
  //       .querySYS1000_DropDownList({ SYS_Type: 'ECR_Type', SYS_Status: 'A' } as any)
  //       .pipe(map(res => (res?.Data ?? []).map((it: any) => ({
  //         value: it.No ?? it.SYS_Code,
  //         label: it.Name ?? it.SYS_Name ?? ''
  //       }))));

  //     const TLTTALENT_OPTIONS$ = this.dropDownListService.queryTLTTALENT_DropDownList()
  //       .pipe(map(res => res.Data.map((item: any) => ({
  //         value: item.No,
  //         label: `${item.No}-${item.Name}`
  //       }))));

  //     const Building_No$ = this.locationOptionsService.getBuildingOptions().pipe(
  //       map((res: any[]) => res.map(x => ({ value: x.No ?? x.value, label: x.Name ?? x.label })))
  //     );

  //     const Floor_No$ = this.locationOptionsService.getFloorOptions().pipe(
  //       map((res: any[]) => res.map(x => ({ value: x.No ?? x.value, label: x.Name ?? x.label })))
  //     );

  //     const Area_No$ = this.locationOptionsService.getRegionOptions().pipe(
  //       map((res: any[]) => res.map(x => ({ value: x.No ?? x.value, label: x.Name ?? x.label })))
  //     );

  //     forkJoin({
  //       TLT_No: TLTTALENT_OPTIONS$,
  //       ECR_Type: ECR_Type$,
  //       ECR_GrpNo: ECR_GrpNo$,
  //       Building_No: Building_No$,
  //       Floor_No: Floor_No$,
  //       Area_No: Area_No$,
  //     }).subscribe(({ TLT_No, ECR_Type, ECR_GrpNo, Building_No, Floor_No, Area_No }) => {
  //       this.TLTTALENT_OPTIONS = TLT_No ?? [];
  //       this.ECR_Type_Options = ECR_Type ?? [];
  //       this.ECR_GrpNoOptions = ECR_GrpNo ?? [];
  //       this.SYS3700_Options = Building_No ?? [];
  //       this.SYS3800_Options = Floor_No ?? [];
  //       this.SYS3A00_Options = Area_No ?? [];

  //       this.columns = [
  //         { field: 'NOT_SeqNo', header: '通告序號', format: (value) => this.isFormCreateable ? '自動給號' : value },
  //         { field: 'TLT_No', header: '專櫃編號', type: 'dropdown', options: this.TLTTALENT_OPTIONS, optionLabel: 'label', optionValue: 'value', disabled: (rowData) => this.isOtherGroupSelected(rowData) },
  //         { field: 'ECR_Type', header: '機台類型', type: 'dropdown', options: this.ECR_Type_Options, optionLabel: 'label', optionValue: 'value', disabled: (rowData) => this.isOtherGroupSelected(rowData) },
  //         { field: 'ECR_GrpNo', header: '機檯群組編號', type: 'dropdown', options: this.ECR_GrpNoOptions, optionLabel: 'label', optionValue: 'value', disabled: (rowData) => this.isEcrGrpNoSelected(rowData) },
  //         { field: 'BUILDING_No', header: '館別代碼', type: 'dropdown', options: this.SYS3700_Options, optionLabel: 'label', optionValue: 'value', disabled: (rowData) => this.isOtherGroupSelected(rowData) },
  //         { field: 'FLOOR_No', header: '樓層代碼', type: 'dropdown', options: this.SYS3800_Options, optionLabel: 'label', optionValue: 'value', disabled: (rowData) => this.isOtherGroupSelected(rowData) },
  //         { field: 'Area_No', header: '區域代碼', type: 'dropdown', options: this.SYS3A00_Options, optionLabel: 'label', optionValue: 'value', disabled: (rowData) => this.isOtherGroupSelected(rowData) },
  //       ];
  //     });
  // }
  onSubmit(): void {
    this.submitted = true;

  }
}
