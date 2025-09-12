import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { NgIf } from '@angular/common';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropDownListService } from './../../../service/utility/dropDownList.service';
import { TranslateModule } from '@ngx-translate/core';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { Column } from '@shared/componentkit/table-edit/table-edit.model';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { DropdownTableComponent } from '../../../shared/componentkit/dropdown-table/dropdown-table.component';

@Component({
  selector: 'app-tls2d010-cru',
  templateUrl: './tls2d010-cru.component.html',
  styleUrl: './tls2d010-cru.component.scss',
  standalone: true,
  imports: [TableEditComponent, CalendarComponent,
    InputTextComponent, DropdownTableComponent, RadiobuttonComponent, TableComponent, DialogComponent, MenubarComponent, PanelModule, ReactiveFormsModule, DropdownComponent, InputNumberComponent, ButtonComponent, NgIf, TranslateModule]
})
export class TLS2D010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  currentCreateType: 'normal' | 'counter' = 'counter'
  tlt_noOptions: any[] = [];
  pod_noOptions: any[] = [];
  data: any[] = [];
  selectedItems: any[] = [];
  CAP_TypeOptions: any[] = [];
  cap_taxtypeOptions: any[] = [
    { value: '0', label: '免稅' },
    { value: '1', label: '應稅 APS1003.CAP_TaxType' }

  ];
  // ----------------------------------------------------------------
  dataFormCounter = this.formBuilder.group({
    tlt_no: [], // 專櫃編號/名稱 招募編號/營運起始日/營運截止日
    totalCash: [{ value: null as string | null, disabled: true }, [Validators.required]],
    pod_no: [], // 活動代碼/名稱
    contract_no: [{ value: null as string | null, disabled: true }, [Validators.required]],
    contract_subno: [{ value: null as string | null, disabled: true }, [Validators.required]],
    tlt_contract_bdate: [{ value: null as string | null, disabled: true }, [Validators.required]],
    tlt_contract_edate: [{ value: null as string | null, disabled: true }, [Validators.required]],
  });

  dataFormNormal = this.formBuilder.group({
    CAP_Type: [],
    CAP_Item: [],
    tpy_date: [null as null | Date, [Validators.required]], // 扣款日期
    tpy_net: [],
    cap_taxtype: [],
    GUI_FLAG: [],
    AccNo: [],
    org_id: [],
  });
  columnsCounter: Column[] = [
    { field: 'tpy_date', header: '扣款日期', type: 'input', width: '12rem' },
    { field: 'CAP_Type', header: '扣款類型', type: 'dropdown', width: '12rem', optionLabel: 'label', optionValue: 'No' },
    { field: 'CAP_Item', header: '扣款項目', type: 'dropdown', width: '12rem', optionLabel: 'label', optionValue: 'No' },
    { field: 'TLT_No', header: '會計科目', type: 'dropdown', width: '15rem', optionLabel: 'label', optionValue: 'No' },
    { field: 'AccNo', header: '會計科目', type: 'dropdown', width: '10rem', optionLabel: 'SYS_Name', optionValue: 'SYS_Code' },
    { field: 'org_id', header: '組織代號', type: 'dropdown', width: '15rem', optionLabel: 'label', optionValue: 'No' },
    { field: 'GUI_FLAG', header: '是否開立發票', type: 'dropdown', width: '9rem', optionLabel: 'Name', optionValue: 'No' },
    { field: 'cap_taxtype', header: '課稅別', type: 'dropdown', width: '9rem', optionLabel: 'Name', optionValue: 'No' },
    { field: 'tpy_net', header: '金額', type: 'inputNumber', width: '12rem' },
    { field: 'remarks', header: '備註', type: 'inputNumber', width: '12rem' },
  ];
  columnsNormal: Column[] = [
    { field: 'tlt_no', header: '專櫃編號/名稱', type: 'dropdown', width: '12rem', optionLabel: 'label', optionValue: 'No' },
    { field: 'contract_no', header: '契約編號', type: 'inputNumber', width: '12rem', disabled: () => true },
    { field: 'contract_subno', header: '版次', type: 'inputNumber', width: '15rem', disabled: () => true },
    { field: 'pod_no', header: '活動代碼/名稱', type: 'dropdown', width: '10rem', optionLabel: 'SYS_Name', optionValue: 'SYS_Code' },
    { field: 'tpy_date', header: '扣款日期', type: 'input', width: '12rem' },//共通要新增
    { field: 'tpy_date', header: '扣款金額(未稅)', type: 'inputNumber', width: '12rem' },
    { field: 'remarks', header: '備註', type: 'inputNumber', width: '12rem' },

  ];
  // dialogData: IPOS2004DetailData[] = [];
  totalRecords = 0;
  dialogVisible = false;
  selectedItemsDialog: any[] = [];
  saveDialog() {
    this.dialogVisible = false;
    this.data = [
      ...this.data,
      ...this.selectedItemsDialog.map(item => ({
        ...item,
        PLU_BoxQty: item.PLU_BoxQty === undefined || item.PLU_BoxQty === null ? 0 : item.PLU_BoxQty,
        POD_SubQty: 0,
        POD_Remark: ''
      }))
    ];
    this.selectedItemsDialog = [];
    this.selectedItems = [];
  }
  dialogQueryForm = this.formBuilder.group({
    PLU_MagNo: ['', [Validators.maxLength(20)]],
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    CAT_LNo: [null], // 大分類代碼
    CAT_MNo: [{ value: null, disabled: true }], // 中分類代碼
    CAT_SNo: [{ value: null, disabled: true }], // 小分類代碼
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  dialogColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'UNIT_NAME', header: '單位' },
    { field: 'PLU_BoxQty', header: '包裝入數' },
    { field: 'PLU_StockTaxType', header: '稅別', format: (value) => value === '0' ? '免稅' : value === '1' ? '應稅' : '' },
    { field: 'PLU_SalePrc_UNI', header: '單價' },
    { field: 'PLU_SalePrc', header: '售價' },
  ]
  dialogLoading = false;
  // onQuery(frm: FormGroup) {
  //   this.dialogLoading = true;
  //   const body = {
  //     ...frm.getRawValue(),
  //     // VEN_No: this.dataFormNormal.controls.VEN_No.value,
  //     // LOGO_No: this.dataFormNormal.controls.LOGO_No.value,
  //   }
  //   // this.tls52010Service.queryPOS2004DetailByVenNo(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
  //   //   this.dialogData = response.Data;
  //   //   this.totalRecords = response.TotalCount;
  //   // })
  // }
  // isRowSelectable(event: IPOS2004DetailData): boolean {
  //   return !this.data || !this.data.some((item: IPOS2004DetailData) => item.PLU_MagNo === event.PLU_MagNo);
  // }
  constructor(
    private dropDownListService: DropDownListService,
    private route: ActivatedRoute
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    if (this.currentCreateType === 'counter') {
      this.initializePage('TLS2D010', this.dataFormCounter);
    } else {
      this.initializePage('TLS2D010', this.dataFormNormal);
    }
    if (this.rowdata) {
      console.log(this.rowdata);
      this.currentCreateType = this.rowdata.type;
    }
  }

  onSubmit(): void {
    this.submitted = true;

  }
}
