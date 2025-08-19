import { ITLS52050Data, Tls52050Service } from './../../../service/api/tls/tls52050.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { AddButton, Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize, map } from 'rxjs';
import { MAM_StatusOptions, POS2008M_COLUMNS } from './tls52050.model';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { ExportLabelService, IExportLabelRequest } from '../../../service/utility/exportLabel.service';
import { HttpResponse } from '@angular/common/http';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CheckboxModule } from 'primeng/checkbox';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
export const enum MAMStatus {
  已申請 = '0',
  已審核 = '1',
  變價生效中 = '2',
  變價結束 = '3',
  作廢 = '9'
}

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
  ],
})
export class TLS52050Component extends BasicQueryPageComponent<ITLS52050Data> implements OnInit {
  queryForm = this.formBuilder.group({
    MAM_No: ['', [Validators.maxLength(16)]],// 變價單號
    VEN_No: [null],              // 廠商代號
    LOGO_No: [null],             // 品牌代碼
    MAM_Status: [null, [Validators.required]],// 進價變價單狀態
    APPLY_USR_No: [null],        // 申請人
    APRV_USR_No: [null],         // 審核人
    APPLY_Date_Start: [null],  // 申請日期起
    APPLY_Date_End: [null],    // 申請日期迄
    APRV_Date_Start: [null],   // 審核日期起
    APRV_Date_End: [null],     // 審核日期迄
    showReturnPriceOrdersOnly: [false],
    ...createPaginationConfig([{ field: 'MAM_No', order: 1 }]),
  });
  totalRecords = 0;
  MAM_StatusOptions = MAM_StatusOptions; // 進價變價單狀態選項
  brandOptions: IDropdownItem[] = []; // 品牌代碼
  vendorOptions: IDropdownItem[] = []; // 廠商編號
  userOptions: { label: string, value: string }[] = []; // 申請人員、審核人員、結案人員
  data: ITLS52050Data[] = [];
  columns: Column[] = POS2008M_COLUMNS;
  addButton: AddButton[] = [
    { label: '審核', icon: 'pi pi-check-circle text-green-500', action: (rowData: ITLS52050Data) => { this.statusChange(rowData, MAMStatus.已審核); }, disabled: (rowData: ITLS52050Data) => rowData.MAM_Status !== MAMStatus.已申請 }, // 審核
    { label: '反審核', icon: 'pi pi-undo text-orange-500', action: (rowData: ITLS52050Data) => { this.statusChange(rowData, MAMStatus.已申請); }, disabled: (rowData: ITLS52050Data) => rowData.MAM_Status !== MAMStatus.已審核 }, // 反審核
    { label: '產生標籤檔', icon: 'pi pi-tags', action: (rowData: ITLS52050Data) => { this.generateLabelFile(rowData); } }, // 標籤檔
  ];

  constructor(
    private dropDownListService: DropDownListService,
    private tls52050Service: Tls52050Service,
    private exportLabelService: ExportLabelService
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS52050', 'tls/tls52050cru', this.queryForm, (frm) => this.onSubmit(frm));
    // 品牌代碼 (LOGO_No)
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.brandOptions = response.Data.map(brand => ({
        ...brand,
        label: `${brand.No} - ${brand.Name}`,
      }));
    });
    // 廠商編號 (VEN_No)
    this.dropDownListService.queryPOS2013_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.vendorOptions = response.Data.map(vendor => ({
        ...vendor,
        label: `${vendor.VEN_No} - ${vendor.Name}`,
      }));
    });
    // 申請人員、審核人員、結案人員 (共用人員下拉選單)
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this),
      map(response => response.Data.map(item => ({ label: item.Name, value: item.No })))
    ).subscribe(options => {
      this.userOptions = options;
    });
  }
  onFileUpload(event: FileSelectEvent) {
    const file = event.files[0];
    // this.fin11020Service.uploadFIN11020(file).pipe(untilDestroyed(this)).subscribe({
    //   next: (res) => {
    //     if (res.Data) {
    //       this.onSubmit(this.queryForm);
    //     }
    //   },
    //   error: (err) => {
    //     console.error(err);
    //   },
    // });
  }
  btnLoading = true;
  statusChange(rowData: ITLS52050Data, status: string) {
    this.btnLoading = true;
    const body = {
      idList: [rowData.id],
      PO_Status: status
    }
    // this.tls52010Service.updateStatusTLS52010(body).pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)).subscribe(response => {
    //   this.messageService.successBubble(response.Message);
    //   this.onSubmit(this.queryForm);
    // });
  }
  generateLabelFile(rowData: ITLS52050Data) {
    this.btnLoading = true;
    this.tls52050Service.getLabelTLS52050({ MAM_No: rowData.MAM_No }).pipe(untilDestroyed(this)).subscribe(response => {
      const transformedData: IExportLabelRequest[] = response.Data.map((item: any) => ({
        PLU_MagNo: item.PLU_MagNO,
        PLU_Name: item.PLU_Name,
        PLU_SalePrc: parseFloat(item.PLU_SalePrc.trim()),
        Label_Qty: parseInt(item.Label_Qty.trim(), 10),
        PLU_Unit: item.PLU_Unit,
        PLU_OrgPLUNo: item.PLU_OrgPLUNo,
        PLU_No: item.PLU_NO
      }));
      // !這邊要開啟彈跳視窗，並且顯示Table欄位，要多一個可輸入的「標籤數量」欄位預設為1，可調整後，按下確認產生標籤檔
      this.exportLabelService.ExportLabel(transformedData).pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)).subscribe(
        (exportHttpResponse: HttpResponse<Blob>) => {
          if (exportHttpResponse.ok && exportHttpResponse.body) {
            const blob = exportHttpResponse.body;
            const contentDisposition = exportHttpResponse.headers.get('content-disposition');
            let filename = `undefined`; // 預設檔名
            if (contentDisposition) {
              const filenameMatch = contentDisposition.match(/filename\*?=['"]?(?:UTF-8''|)([^;"]+)/i);
              if (filenameMatch && filenameMatch[1]) {
                // 解碼 URL 編碼的檔名，如果有的話 (例如 UTF-8''PLU_20250701.txt)
                try {
                  filename = decodeURIComponent(filenameMatch[1]);
                } catch (e) {
                  filename = filenameMatch[1]; // 解碼失敗則用原始值
                  console.error(e);
                }
              }
            }
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename; // 使用從 Header 獲取的檔名
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            this.messageService.successBubble('標籤檔案已成功下載！');
          }
        }
      );
    });
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
