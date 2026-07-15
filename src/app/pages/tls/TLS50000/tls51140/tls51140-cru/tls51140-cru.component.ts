import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { QueryTLS51140ResponseData, Tls51140Service } from '@service/api/tls/tls51140.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService, POS1002Item } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Column } from '@others/component/table/table.model';
import { PanelModule } from 'primeng/panel';
import { debounceTime, finalize } from 'rxjs';
@Component({
  selector: 'app-tls51140-cru',
  standalone: true,
  imports: [DropdownTableComponent, TableReportComponent, TableEditComponent, AsyncPipe, DialogComponent, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, DropdownComponent, ButtonComponent, NgIf, TranslateModule],
  templateUrl: './tls51140-cru.component.html'
})
export class Tls51140CruComponent extends BasicCruPageComponent<QueryTLS51140ResponseData> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    TLT_NO: [null, [Validators.required]], // 專櫃編號
    HOS_No: [null, [Validators.required]], // 倉庫代碼
  });
  TLT_NoOptions$ = this.dropdown.queryTltTalentStoreWay2Approve();
  warehouseOptions$ = this.dropdown.queryPos2034();
  buildingOptions$ = this.dropdown.querySys3800();
  floorOptions$ = this.dropdown.querySys3900();
  areaOptions$ = this.dropdown.querySys3A00();

  data: POS1002Item[] = []
  selectedItems: POS1002Item[] = []
  columns: EditColumn[] = [
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'ECR_Name', header: '收銀機名稱' },
    { field: 'Remark', header: '備註', type: 'input' },
  ];
  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly tls51140Service: Tls51140Service,
    private readonly dropdown: DropdownApiService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS51140', this.dataForm);
    if (!this.isFormCreateable && this.rowdata) {
      this.dataForm.disable();
      this.tls51140Service.queryTLS51140ByTltNo(this.rowdata?.TLT_NO, this.rowdata?.HOS_No).pipe(untilDestroyed(this)).subscribe(res => {
        this.data = res.Data.map(item => ({
          ...item,
          ID: item.id,
          TLT_NO: item.TLT_NO,
          TLT_Name: item.TLT_Name,
          ECR_No: item.ECR_No,
          ECR_Name: item.ECR_Name,
          Remark: item.Remark,
        }));
      })
    }
    this.setupDialogQuerySubscription();
  }

  onOpenDialog(): void {
    this.dialogVisible = true;

    // 由於 ngOnInit 已經設置了 valueChanges 訂閱，
    // 只要我們呼叫一次 this.dialogQueryForm.updateValueAndValidity()，
    // 就能觸發首次查詢，並且使用當前 Form 的預設值（null/空字串）。
    // 這樣可以避免重複寫查詢邏輯。

    // 觸發首次查詢 (使用當前的表單值)
    this.dialogQueryForm.updateValueAndValidity({ emitEvent: true });
  }

  // ----------------------------------------------------
  // 處理 Dialog 查詢表單變動 (從 ngOnInit 中移出)
  // ----------------------------------------------------
  setupDialogQuerySubscription(): void {
    this.dialogQueryForm.valueChanges.pipe(untilDestroyed(this), debounceTime(500),).subscribe(formValues => {
      const request: { building_no: string; floor_no: string; area_no: string; ecr_no: string } = {
        building_no: formValues.building_no?.trim().toLowerCase() || '',
        floor_no: formValues.floor_no?.trim().toLowerCase() || '',
        area_no: formValues.area_no?.trim().toLowerCase() || '',
        ecr_no: formValues.ecr_no?.trim().toLowerCase() || '',
      };
      this.dropDownListService.queryPOS1002Group_SubGroup_AreaNo_DropDownList(request).pipe(untilDestroyed(this), finalize(() => this.dialogLoading = false)).subscribe(res => {
        this.dialogData = res.Data;
      });
    });
  }
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const valid = this.tableEditComponent.validateAndShowErrors();
      if (!valid) {
        this.loading = false;
        return;
      }
      // 這裡將前端的 data 轉換成後端期望的 updateTLS51140Request 格式
      const requestBody = this.data.map(item => ({
        // 判斷是否為既有資料。ID: 0 會被後端視為新增
        ID: item.ID ?? 0,
        TLT_NO: frm.getRawValue().TLT_NO,
        HOS_No: frm.getRawValue().HOS_No,
        ECR_No: item.ECR_No || '',
        Remark: item.Remark || '',
      }));

      const $request = this.isFormCreateable
        ? this.tls51140Service.insertTLS51140(requestBody)
        : this.tls51140Service.updateTLS51140(requestBody);

      $request.pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.messageService.successBubble(res.Message);
        this.onCancel();
      });
    });
  }
  dialogQueryForm = this.formBuilder.nonNullable.group({
    ecr_no: [null as string | null], // 收銀機
    building_no: [null as string | null], // 館別
    floor_no: [null as string | null], // 樓層
    area_no: [null as string | null] // 區域
  });
  dialogData: POS1002Item[] = [];
  selectedItemsDialog: POS1002Item[] = [];
  dialogLoading = false;
  dialogVisible = false;
  dialogColumns: Column[] = [
    { field: 'building_name', header: '館別' },
    { field: 'floor_name', header: '樓層' },
    { field: 'area_name', header: '區域' },
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'ECR_Name', header: '收銀機名稱' },
  ];
  suggestions: POS1002Item[] = [];
  ecrNoOptions$ = this.dropdown.queryPos2034();
  fieldsConfig: FieldsConfig[] = [
    { field: 'ecr_no', header: '收銀機號/名稱', mainDataField: true },
  ];
  onAutoCompleteInputChange(event: Record<'label', string>) {
    const body = {
      ecr_no: event.label
    }
    this.dropDownListService.queryPOS1002Group_SubGroup_AreaNo_DropDownList(body).pipe(untilDestroyed(this)).subscribe(res => {
      this.suggestions = [...res.Data.map(item => ({
        ...item,
        label: item.ECR_No + '-' + item.ECR_Name
      }))];
    });
  }
  isRowSelectable(event: POS1002Item): boolean {
    return !this.data || !this.data.some((item: POS1002Item) => item.ECR_No === event.ECR_No);
  }
  saveDialog() {
    this.dialogVisible = false;
    this.data = [
      ...this.data,
      ...this.selectedItemsDialog
    ];
    this.selectedItemsDialog = [];
  }
}
