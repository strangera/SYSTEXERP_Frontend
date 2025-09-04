import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { QueryTLS51140ResponseData } from '@service/api/tls/tls51140.service';
import { IDropdownItem, DropDownListService, POS1002Item } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { debounceTime, finalize } from 'rxjs';
@Component({
  selector: 'app-tls51140-cru',
  standalone: true,
  imports: [InputTextComponent, DialogComponent, TableComponent, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, DropdownComponent, ButtonComponent, NgIf, TranslateModule],
  templateUrl: './tls51140-cru.component.html'
})
export class Tls51140CruComponent extends BasicCruPageComponent<QueryTLS51140ResponseData> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    TLT_No: [null, [Validators.required]], // 專櫃編號
    HOS_No: [null, [Validators.required]], // 倉庫代碼
  });
  TLT_NoOptions: IDropdownItem[] = [];
  warehouseOptions: IDropdownItem[] = [];

  data: POS1002Item[] = []
  selectedItems: POS1002Item[] = []
  columns: Column[] = [
    { field: 'building_name', header: '館別' },
    { field: 'floor_name', header: '樓層' },
    { field: 'area_name', header: '區域' },
    { field: 'ecr_no', header: '收銀機號' },
    { field: 'ecr_name', header: '收銀機名稱' },
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '櫃位名稱' },
    { field: 'ecr_type', header: '機台類型', format: (value) => value === '1' ? '集中機台' : value === '2' ? '專櫃機台' : value === '5' ? '離線機台' : value === '7' ? '虛擬機台' : '它社機台' },
  ];
  dialogVisible = false;

  constructor(
    private readonly dropDownListService: DropDownListService
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS51140', this.dataForm);
    this.dropDownListService.queryTLTTALENT__StoreWay2_Approve_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.TLT_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    })
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(options => {
      this.warehouseOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    })
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

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

  isRowSelectable(event: POS1002Item): boolean {
    return !this.data || !this.data.some((item: POS1002Item) => item.ecr_no === event.ecr_no);
  }
  inputEnter() {
    const filterbuilding_no = this.dialogQueryForm.controls.building_no.value?.trim().toLowerCase() || '';
    const filterfloor_no = this.dialogQueryForm.controls.floor_no.value?.trim().toLowerCase() || '';
    const filterarea_no = this.dialogQueryForm.controls.area_no.value?.trim().toLowerCase() || '';
    this.dialogLoading = true;
    this.dropDownListService.queryPOS1002Group_SubGroup_AreaNo_DropDownList({ building_no: filterbuilding_no, floor_no: filterfloor_no, area_no: filterarea_no })
      .pipe(untilDestroyed(this), debounceTime(300), finalize(() => this.dialogLoading = false)).subscribe(res => {
        this.dialogData = res.Data;
      })
  }
  saveDialog() {
    this.dialogVisible = false;
    this.data = [...this.data, ...this.selectedItemsDialog];
    this.selectedItemsDialog = [];
  }
}
