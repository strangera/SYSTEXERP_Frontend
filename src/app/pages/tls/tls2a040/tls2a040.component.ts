import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls2a040Service } from '@service/api/tls/tls2a040.service';
import { ECRNoService } from '@service/basic/queryPOS1002.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from "@shared/componentkit/radiobutton/radiobutton.component";
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, formatDateToYYYYMMDD } from '@shared/componentkit/table/table.model';
import { yesterday } from '@shared/models/system/query-form.model';
import saveAs from 'file-saver';
import JSZip from 'jszip';
import { AccordionModule } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { finalize } from 'rxjs';
import { createPaginationConfig } from 'src/app/shared/componentkit/table/table.model';
import { LocationOptionsService } from '../../../shared/services/dropdownservice/location-options.service';
import { DOC_TYPE_COLUMNS } from './tls2a040.model';

export interface FileItem {
  fileData: string; // Base64 字串
  fileName: string; // 檔案名稱
  contentType: string; // MIME 類型
}

@Component({
  selector: 'app-tls22030',
  templateUrl: './tls2a040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    DropdownModule,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    DropdownComponent,
    CalendarRangeQuickComponent,
    InputNumberRangeComponent,
    InputTextComponent,
    RadiobuttonComponent,
    Button,
  ],
})
export class TLS2A040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    referenceNo: [null],                              // 信用卡卡號(信用卡)、有價券號(有價券)、發票號碼(作廢發票)
    docType: ['creditcard', Validators.required],     // 預設選信用卡
    ECR_No: [null],                                   // 收銀機號
    TXN_No: [null],                                   // 交易序號
    TXN_Date_Start: [yesterday, Validators.required],
    TXN_Date_End: [yesterday, Validators.required],
    TXN_PayAmt_Start: [null],                         // 金額範圍起
    TXN_PayAmt_End: [null],                           // 金額範圍迄
    check_statusList: [[]],                           // 狀況
    Floor_No: [null],                                 // 樓層
    Building_No: [null],                              // 館別
    ...createPaginationConfig([{ field: 'TXN_Date,ECR_No,TXN_No', order: 1 }]),
  });

  data: any[] = [];
  totalRecords = 0;
  columns: Column[] = DOC_TYPE_COLUMNS['creditcard'];

  // 下拉選單資料
  ECRNoOptions: any[] = [];
  statusOptions = getSYS1000Options('check_status').filter(opt => opt.value !== '1');
  floorOptions: any[] = [];
  buildingNoOptions: IDropdownItem[] = [];
  selectedItems: any[] = [];
  btnLoading = false;

  constructor(
    private locationOptionsService: LocationOptionsService,
    private ECRNoService: ECRNoService,
    private dropDownListService: DropDownListService,
    private tls2a040Service: Tls2a040Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2A040', '/TLS/TLS2A040cru', this.queryForm, (form) => this.onSubmit(form));

    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = data;
    });

    this.locationOptionsService.getFloorOptions().subscribe({
      next: (res) => {
        this.floorOptions = res.map((item: any) => ({
          label: item.name || item.FLOOR_NAME || item.label,
          value: item.code || item.FLOOR_NO || item.value
        }));
      },
      error: () => this.messageService.errorBubble('載入樓層選單失敗')
    });

    // 館別
    this.dropDownListService.querySYS3800_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.buildingNoOptions = res.Data.map(x => ({
          label: x.Name,
          value: x.No,
          Name: x.Name,
          No: x.No
        }));
      });
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      this.loading = true;

      this.tls2a040Service.queryTLS2A040(form.value).subscribe({
        next: (res) => {
          const rawData = res.Data ?? [];

          this.data = rawData.map((item: any) => {
            return {
              ...item,
              TXN_GUIBegNo: item.TXN_GUIBegNo ?? '--',
            };
          });

          this.totalRecords = res.TotalCount ?? this.data.length;
          this.loading = false;

          this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
        },
        error: (err) => {
          console.error('TLS2A040 查詢失敗', err);
          this.messageService.errorBubble('查詢失敗，請稍後再試');
          this.loading = false;
        }
      });
    });
  }

  getDocLabel(): string {
    const docType = this.queryForm.get('docType')?.value;
    switch (docType) {
      case 'creditcard':
        return '信用卡卡號';
      case 'voucher':
        return '有價券號';
      case 'voidInvoice':
        return '發票號碼';
      default:
        return '編號';
    }
  }

  exportReport(selectedItems: any[]): void {
    if (!selectedItems || selectedItems.length === 0) {
      this.messageService.warnBubble('請先勾選要匯出的項目');
      return;
    }
    const payload = {
      selectList: selectedItems,
      docType: this.queryForm.get('docType')?.value,
    }
    this.btnLoading = true;
    this.tls2a040Service.exportTLS2A040(payload).pipe(finalize(() => this.btnLoading = false)).subscribe(response => {
      if (response.Status !== '0000') {
        return;
      }
      const fileList = response.Data;
      if (fileList.length === 1) {
        // 單檔直接下載
        const file = fileList[0];
        const fileData = atob(file.fileData); // 將 Base64 轉為二進位
        const byteArray = new Uint8Array(fileData.length);
        for (let i = 0; i < fileData.length; i++) {
          byteArray[i] = fileData.charCodeAt(i);
        }
        const blob = new Blob([byteArray], { type: file.contentType });
        saveAs(blob, file.fileName);
      } else {
        // 多檔壓縮成 ZIP
        const zip = new JSZip();
        fileList.forEach((file: FileItem) => {
          const fileData = atob(file.fileData); // 將 Base64 轉為二進位
          const byteArray = new Uint8Array(fileData.length);
          for (let i = 0; i < fileData.length; i++) {
            byteArray[i] = fileData.charCodeAt(i);
          }
          zip.file(file.fileName, byteArray);
        });

        // 生成 ZIP 並下載
        const timestamp = formatDateToYYYYMMDD(new Date());
        zip.generateAsync({ type: 'blob' }).then((content) => {
          saveAs(content, `CRD-${timestamp}.zip`);
        });
      }
    });
  }

  get selectedCount(): number {
    return this.selectedItems?.length ?? 0;
  }

  onDocTypeChange(type: string) {
    this.columns = DOC_TYPE_COLUMNS[type] || DOC_TYPE_COLUMNS['creditcard'];
    this.queryForm.patchValue({
      referenceNo: null,
    });
    this.onSubmit(this.queryForm);
  }
}
