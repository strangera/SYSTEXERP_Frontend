import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { QueryTLS51140ResponseData, Tls51140Service } from '@service/api/tls/tls51140.service';
import { IDropdownItem, DropDownListService, POS1002Item } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { debounceTime, finalize, tap } from 'rxjs';
@Component({
  selector: 'app-tls51140-cru',
  standalone: true,
  imports: [DialogComponent, TableComponent, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, DropdownComponent, ButtonComponent, NgIf, TranslateModule],
  templateUrl: './tls51140-cru.component.html'
})
export class Tls51140CruComponent extends BasicCruPageComponent<QueryTLS51140ResponseData> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    TLT_NO: [null, [Validators.required]], // 專櫃編號
    HOS_No: [null, [Validators.required]], // 倉庫代碼
  });
  TLT_NoOptions: IDropdownItem[] = [];
  warehouseOptions: IDropdownItem[] = [];
  buildingOptions: IDropdownItem[] = [];
  floorOptions: IDropdownItem[] = [];
  areaOptions: IDropdownItem[] = [];

  data: POS1002Item[] = []
  selectedItems: POS1002Item[] = []
  columns: Column[] = [
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'ECR_Name', header: '收銀機名稱' },
    { field: 'Remark', header: '備註', type: 'input' },
  ];
  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly tls51140Service: Tls51140Service
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS51140', this.dataForm);
    if (!this.isFormCreateable && this.rowdata) {
      this.dataForm.disable();
      this.tls51140Service.queryTLS51140ByTltNo(this.rowdata?.TLT_NO).pipe(untilDestroyed(this)).subscribe(res => {
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
    this.dropDownListService.queryTLTTALENT__StoreWay2_Approve_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.TLT_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    })
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(options => {
      this.warehouseOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    })
    this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.buildingOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    })
    this.dropDownListService.querySYS3900_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.floorOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    })
    this.dropDownListService.querySYS3A00_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.areaOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    })
    this.dialogQueryForm.valueChanges
      .pipe(untilDestroyed(this), tap(() => this.dialogLoading = true), debounceTime(500), finalize(() => this.dialogLoading = false))
      .subscribe(formValues => {
        const request: { building_no: string; floor_no: string; area_no: string; } = {
          building_no: formValues.building_no?.trim().toLowerCase() || '',
          floor_no: formValues.floor_no?.trim().toLowerCase() || '',
          area_no: formValues.area_no?.trim().toLowerCase() || '',
        };

        this.dropDownListService.queryPOS1002Group_SubGroup_AreaNo_DropDownList(request).pipe(untilDestroyed(this), tap(() => this.dialogLoading = true), finalize(() => this.dialogLoading = false)).subscribe(res => {
          this.dialogData = res.Data;
        });
      });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
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
  dialogQueryForm = this.formBuilder.group({
    building_no: [''], // 館別
    floor_no: [''], // 樓層
    area_no: [''] // 區域
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
