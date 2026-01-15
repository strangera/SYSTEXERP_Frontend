import { AsyncPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { ExcelColumn, ExcelExportService } from '@shared/service/excel-export.service';
import { Actions } from '@shared/service/permission-guard.service';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { finalize, tap } from 'rxjs';
import { ExportLabelService, IExportLabelRequest } from '../../../service/utility/exportLabel.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { AddButton, Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { ITLS52050Data, Tls52050Service } from './../../../service/api/tls/tls52050.service';
import { EXPORT_LABEL_COLUMNS, MAMStatus, POS2008M_COLUMNS } from './tls52050.model';

@Component({
  selector: 'app-tls52050',
  templateUrl: './tls52050.component.html',
  styleUrls: ['./tls52050.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    FileUploadModule,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    MultiSelectComponent,
    CalendarRangeQuickComponent,
    CheckboxModule,
    TableComponent,
    TranslateModule,
    AsyncPipe,
    DialogComponent,
    TableEditComponent,
    DialogModule
  ],
})
export class TLS52050Component extends BasicQueryPageComponent<ITLS52050Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    MAM_No: ['', [Validators.maxLength(16)]],// 變價單號
    VEN_No: [null],              // 廠商編號
    LOGO_No: [null],             // 品牌代碼
    MAM_Status: [null],// 進價變價單狀態
    APPLY_USR_No: [null],        // 申請人
    APRV_USR_No: [null],         // 審核人
    APPLY_Date_Start: [null],  // 申請日期起
    APPLY_Date_End: [null],    // 申請日期迄
    APRV_Date_Start: [null],   // 審核日期起
    APRV_Date_End: [null],     // 審核日期迄
    showReturnPriceOrdersOnly: [false],
    ...createPaginationConfig([{ field: 'APPLY_Date', order: -1 }, { field: 'MAM_No', order: -1 }]),
  });
  // Options
  MAM_StatusOptions = getSYS1000Options('MAM_Status');        // 進價變價單狀態選項
  brandOptions = this.dropdown.queryPluLogo();   // 品牌
  vendorOptions = this.dropdown.queryPos2013TltTalent();  // 廠商編號
  userOptions = this.dropdown.queryTblUser();     // 申請人員、審核人員
  // table
  data: ITLS52050Data[] = [];
  columns: Column[] = POS2008M_COLUMNS;
  addButton: AddButton[] = [
    { label: '審核', icon: 'pi pi-check-circle text-green-500', action: (rowData: ITLS52050Data) => { this.statusChange(rowData, MAMStatus.已審核); }, disabled: (rowData: ITLS52050Data) => rowData.MAM_Status !== MAMStatus.已申請 || (new Date(rowData.MAM_BegDate).setHours(0, 0, 0, 0)) < (new Date().setHours(0, 0, 0, 0)) || !this.hasPermission(Actions.Audit) }, // 審核
    { label: '反審核', icon: 'pi pi-undo text-orange-500', action: (rowData: ITLS52050Data) => { this.statusChange(rowData, MAMStatus.已申請); }, disabled: (rowData: ITLS52050Data) => rowData.MAM_Status !== MAMStatus.已審核 || (new Date(rowData.MAM_BegDate).setHours(0, 0, 0, 0)) <= (new Date().setHours(0, 0, 0, 0)) || !this.hasPermission(Actions.AntiAudit) }, // 反審核
    { label: '產生標籤檔', icon: 'pi pi-tags', action: (rowData: ITLS52050Data) => { this.generateLabelFile(rowData); }, disabled: (rowData: ITLS52050Data) => rowData.MAM_Status === MAMStatus.已申請 || rowData.MAM_Status === MAMStatus.變價結束 || rowData.MAM_Status === MAMStatus.作廢 || !this.hasPermission(Actions.TagPrint) }, // 標籤檔
  ];
  editDisabled = (rowData: ITLS52050Data) => rowData.MAM_Status !== MAMStatus.已申請;
  btnLoading = signal(false);
  totalRecords = 0;
  // dialog
  dialogVisible = signal(false);
  dialogData: IExportLabelRequest[] = [];
  dialogColumns: EditColumn[] = EXPORT_LABEL_COLUMNS;

  constructor(
    private readonly tls52050Service: Tls52050Service,
    private readonly exportLabelService: ExportLabelService,
    public readonly dropdown: DropdownApiService,
    public readonly excelExportService: ExcelExportService
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS52050', 'tls/tls52050cru', this.queryForm, (frm) => this.onSubmit(frm));
  }
  statusChange(rowData: ITLS52050Data, status: string) {
    this.btnLoading.set(true);
    this.tls52050Service.approveTLS52050({ MAM_No: rowData.MAM_No, Approve: status }).pipe(untilDestroyed(this), tap(() => this.btnLoading.set(false)), finalize(() => this.btnLoading.set(false))).subscribe(response => {
      this.messageService.successBubble(response.Message);
      this.onSubmit(this.queryForm);
    });
  }
  generateLabelFile(rowData: ITLS52050Data) {
    this.btnLoading.set(true);
    this.tls52050Service.getLabelTLS52050({ MAM_No: rowData.MAM_No }).pipe(untilDestroyed(this), finalize(() => this.btnLoading.set(false))).subscribe(response => {
      this.dialogData = response.Data.map(item => ({
        PLU_MagNo: item.PLU_MagNO,
        PLU_Name: item.PLU_Name,
        PLU_SalePrc: parseFloat(item.PLU_SalePrc.trim()),
        Label_Qty: parseInt(item.Label_Qty.trim(), 10),
        PLU_Unit: item.UNIT_NAME,
        PLU_OrgPLUNo: item.PLU_OrgPLUNo,
        PLU_No: item.PLU_NO
      }));
      this.dialogVisible.set(true);
    });
  }
  saveDialog() {
    this.btnLoading.set(true);
    this.exportLabelService.ExportLabel_Other(this.dialogData).pipe(untilDestroyed(this), finalize(() => { this.btnLoading.set(false); this.dialogVisible.set(false); })).subscribe();
  }
  excelColumns: ExcelColumn[] = [
    { field: 'VEN_No', header: '廠商編號', excelFormat: '@' },
    { field: 'LOGO_No', header: '品牌編號', excelFormat: '@' },
    { field: 'MAM_BegDate', header: '啟用日期(起)(YYYY/MM/DD)' },
    { field: 'MAM_EndDate', header: '啟用日期(迄)(YYYY/MM/DD)' },
    { field: 'PLU_No', header: '國際條碼', excelFormat: '@' },
    { field: 'PLU_OrderPrc', header: '調整前進價' },
    { field: 'costPriceDiscount', header: '折扣%調整' },
    { field: 'costPriceAmount', header: '金額調整' }, // 假設也是數值
    { field: 'MAM_OrderPrc', header: '調整後進價' },
    { field: 'PLU_SalePrc', header: '調整前售價' },
    { field: 'salePriceDiscount', header: '折扣%調整' },
    { field: 'salePriceAmount', header: '金額調整' }, // 假設也是數值
    { field: 'MAM_UnitPrc', header: '調整後售價' },
  ]
  importExcel(event: FileSelectEvent) {
    this.tls52050Service.uploadTLS52050(event.files[0]).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
      this.messageService.successBubble(response.Message);
      this.onSubmit(this.queryForm);
    })
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls52050Service.queryTLS52050(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    })
  }
}
