import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationExtras } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Tls51070Service } from '@service/api/tls/tls51070.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { FileUploadComponent } from '@shared/componentkit/file-upload/file-upload.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { apiOption } from '@shared/models/sys/sysb000.model';
import { POS2004 } from '@shared/models/tls/tls000.model';
import saveAs from 'file-saver';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { FileSelectEvent, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, firstValueFrom, map } from 'rxjs';
import { getSYS1000Options } from 'src/app/service/system/sys1000.service';
import { ProductAutocompleteComponent } from "src/app/shared/biz-components/product-autocomplete/product-autocomplete";
import { environment } from '../../../../../environments/environment';

// 2.5.1.7  商品基本資料
@Component({
  selector: 'app-tls51070',
  templateUrl: './tls51070.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    FileUploadModule,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    FileUploadComponent,
    ReactiveFormsModule,
    InputTextComponent,
    DialogComponent,
    DropdownComponent,
    TableReportComponent,
    TranslateModule,
    ButtonModule,
    TooltipModule,
    TagModule,
    ProductAutocompleteComponent,
    AsyncPipe
  ],
  styles: [
    `
    :host ::ng-deep {
      .can-del-tag {
        width: 22px;
        height: 22px;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;

        .p-tag-value {
          display: none;
        }

        .p-tag-icon {
          margin: 0;
        }
      }
    }
    `
  ]
})
export class TLS51070Component extends BasicQueryPageComponent<POS2004> implements OnInit {
  public readonly tls51070Service = inject(Tls51070Service);
  private readonly dropDown = inject(DropdownApiService);
  private readonly destroyRef = inject(DestroyRef);
  queryForm = this.formBuilder.group({
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    LOGO_No: [null, [Validators.maxLength(4)]], // 品牌代碼
    KeyWord: [null, [Validators.maxLength(20)]], // 查詢編號 input //新增
    CAT_LNo: [null, [Validators.maxLength(6)]], // 大分類代碼 --POS2003
    CAT_MNo: [null, [Validators.maxLength(6)]], // 中分類代碼 POS20031
    CAT_SNo: [null, [Validators.maxLength(6)]], // 小分類代碼 POS20032
    PLU_Attribute: [null, [Validators.maxLength(16)]], // 商品型態 1一般、2進口、3買斷、4試銷、5寄賣*/ --南紡 商品型態 1一般、2進口、3買斷、4試銷、5寄賣
    PLU_Unit: [null, [Validators.maxLength(2)]], // 單位代碼 --讀PLUUNIT  商品單位設定檔
    PLU_ECStatus: [null, [Validators.maxLength(1)]], // EC商品狀態: 1.正常2.停用3.停進4,下架 For EC (備註: 原來的 商品狀態(PLU_Status) 改為 EC商品狀態(PLU_ECStatus))
    PLU_Reserve1: ['', [Validators.maxLength(400)]], // 說明
    PLU_Reserve3: ['', [Validators.maxLength(400)]], // 系列
    TLT_NO: [null, [Validators.maxLength(12)]], // 專櫃編號
    pageSize: [500],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'PLU_MagNo', order: 1 }]],
  });
  data: POS2004[] = [];
  selectedItems: POS2004[] = [];// 多選項目
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  lastQueryBody: any = null;
  columns: ReportColumn[] = [
    { field: 'CanDel', header: '刪除', visible: true, width: '29px', align: 'center', showSort: false },
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true, width: '110px' },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'PLU_No', header: '國際條碼', visible: true, width: '100px' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號', visible: true, width: '95px' },
    { field: 'LOGO_No', header: '品牌代碼', visible: false },
    { field: 'LOGO_Name', header: '品牌', visible: true },
    { field: 'CAT_LNo', header: '大分類代碼', visible: false },
    { field: 'CAT_LName', header: '大分類', visible: true, },
    { field: 'CAT_MNo', header: '中分類代碼', visible: false, },
    { field: 'CAT_MName', header: '中分類', visible: true, },
    { field: 'CAT_SNo', header: '小分類代碼', visible: false, },
    { field: 'CAT_SName', header: '小分類', visible: true, },
    { field: 'PLU_SalePrc', header: '商品售價', visible: true, format: formatAmount, width: '80px' },
    { field: 'PLU_Attribute', header: '商品型態代碼', visible: false, width: '40px' },
    { field: 'PLU_AttributeName', header: '商品型態', visible: true, width: '40px' },
    { field: 'PLU_Unit', header: '單位代碼', visible: false, width: '20px' },
    { field: 'PLU_UnitNAME', header: '單位', visible: true, width: '20px' },
    {
      field: 'PLU_ECStatus', header: 'EC商品狀態', visible: true,
      format: (value: string) =>
        this.statusOptions.find((option) => option.value === value)?.label ||
        value, width: '40px'
    },
    { field: 'PLU_Reserve1', header: '說明', visible: true },
    { field: 'PLU_Reserve3', header: '系列', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDate, width: '80px' },
    { field: 'CRT_USR_No', header: '建立人員代碼', visible: false, width: '80px' },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDate, width: '80px' },
    { field: 'UPD_USR_No', header: '變更人員代碼', visible: false, width: '80px' },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false }
  ];

  largeOption = this.dropDown.queryPos2003(); // 大分類（改走共用 DropdownApiService，endpoint 與原本一致）
  middleOption: Option[] = []; // 中分類（依大分類連動查詢，改走共用 DropdownApiService）
  smallOption: apiOption[] = []; // 小分類：DropdownApiService.queryPos20032 送出的 body 是扁平陣列，跟後端要求的 CATList 結構不符（且全站無人呼叫過），維持既有 API 避免打壞
  brandOption = this.dropDown.queryPluLogo(); // 品牌代碼（改走共用 DropdownApiService，endpoint 與原本一致）
  TLT_NO_Option: apiOption[] = []; // 專櫃編號：此頁篩選條件多了 tlt_openflag，跟共用下拉對應的 endpoint 不同，維持既有 API
  unitOptions = this.dropDown.queryPluUnit().pipe(
    map(items => (items ?? []).map(item => ({ value: item.No, label: `${item.No}-${item.Name}` })))
  ); // 商品單位（改走共用 DropdownApiService，endpoint 與原本一致）
  attributeOptions = getSYS1000Options('PLU_Attribute');
  statusOptions = getSYS1000Options('PLU_ECStatus');

  excelLoading = false; //excel讀條
  btnLoading = false; //下傳POS讀條
  importDialogVisible = false;
  importForm = this.formBuilder.group({
    sheetName: ['', [Validators.maxLength(50)]] // 指定頁籤名稱
  });
  ngOnInit(): void {
    this.initializePage('TLS51070', 'TLS/TLS51070cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();

    // 初始狀態：尚未選擇大分類，中、小分類皆停用
    this.queryForm.get('CAT_MNo')?.disable();
    this.queryForm.get('CAT_SNo')?.disable();

    // 監聽大分類變化：控制中/小分類的啟用與清空，並連動查詢中分類選單
    this.queryForm.get('CAT_LNo')!.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lno) => {
        if (!lno) {
          this.middleOption = [];
          this.smallOption = [];
          this.queryForm.get('CAT_MNo')?.setValue(null);
          this.queryForm.get('CAT_SNo')?.setValue(null);
          this.queryForm.get('CAT_MNo')?.disable();
          this.queryForm.get('CAT_SNo')?.disable();
          return;
        }

        this.queryForm.get('CAT_MNo')?.enable();
        this.queryForm.get('CAT_SNo')?.enable();

        this.dropDown.queryPos20031({ CAT_LNo: [lno] })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((res) => {
            this.middleOption = (res ?? []).map(item => ({ value: item.No, label: `${item.No}-${item.Name}` }));
            this.queryForm.get('CAT_MNo')?.setValue(null);
            this.queryForm.get('CAT_SNo')?.setValue(null);
            this.smallOption = [];
          });
      });

    // 監聽中分類變化：連動查詢小分類選單
    this.queryForm.get('CAT_MNo')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((mno) => {
        const lno = this.queryForm.get('CAT_LNo')?.value;
        if (!lno || !mno) {
          this.smallOption = [];
          this.queryForm.get('CAT_SNo')?.setValue(null);
          return;
        }

        // API 要求以 CATList 傳送
        const requestPayload = { CATList: [{ CAT_LNo: lno, CAT_MNo: mno }] };
        this.tls51070Service.queryCAT_SNo_DropDownList(requestPayload)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((res) => {
            this.smallOption = this.mapToApiOptions(res.Data);
            this.queryForm.get('CAT_SNo')?.setValue(null);
          });
      });
  }

  // 將 {No, Name} 陣列轉換為下拉選單需要的 {No, Name, Label} 格式
  private mapToApiOptions(data: { No: string; Name: string }[]): apiOption[] {
    return (data ?? []).map(item => ({ No: item.No, Name: item.Name, Label: `${item.No}-${item.Name}` }));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls51070Service.queryTLS51070(frm.value).pipe(finalize(() => this.loading = false)).subscribe((response) => {
        this.data = response.Data || [];
        this.totalRecords = response.TotalCount || response.Data.length;
        this.lastQueryBody = frm.value;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
        this.messageService.unblockUi();
      });
    });
  }

  //---刪除檢查---
  /* LOGODISC 品牌進貨折數設定檔*/
  /* LOGOBUDGET 品牌每月進貨限額設定檔*/
  /* POS2004 商品基本資料檔 */
  // 沒有該資料才可以刪除
  // 更新刪除邏輯
  // 有歷史庫存就不能刪除
  //-------------
  // 刪除項目
  onDelete(data: POS2004 | POS2004[]): void {
    this.messageService.confirm({
      message: `是否確認刪除選中的商品基本資料?`,
      header: `確認刪除`,
      accept: () => {
        const items = Array.isArray(data) ? data : [data];
        if (items.length === 0) {
          this.messageService.errorBubble('無法刪除：沒有選中的項目');
          return;
        }

        // 收集所有有效的 ID
        const idList = items
          .filter((item) => item && item.id != null && item.id !== undefined)
          .map((item) => item.id);

        if (idList.length === 0) {
          this.messageService.errorBubble('無法刪除：選中的項目缺少有效 ID');
          return;
        }

        //確認是否全部都可以刪除
        const canDelete = items.every((item) => item.CanDel);

        if (!canDelete) {
          this.messageService.errorBubble('無法刪除：組織階層互相關連');
          return;
        }

        const deleteBody = {
          idList: idList, // 符合 API 的 idList 格式
        };
        this.tls51070Service.deleteTLS51070(deleteBody)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (response) => {
              if (response.Status === '0000') {
                this.messageService.successBubble('刪除成功');
              } else {
                this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
              }
            },
            error: () => {
              this.messageService.errorBubble('刪除失敗');
            },
            complete: () => {
              this.onSubmit(this.queryForm);
            },
          });

        this.selectedItems = [];
      },
    });
  }

  // 下傳POS2004異動資料
  onUpload() {
    this.btnLoading = true;
    const idList = this.selectedItems.map((item) => item.id);
    this.tls51070Service.ExecSpFuncTLS51070({ idList }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.btnLoading = false)
    ).subscribe({
      next: (response) => {
        if (response.Status === '0000') {
          this.messageService.successBubble('下傳成功');
          this.selectedItems = [];
        } else {
          this.messageService.errorBubble(`下傳失敗: ${response.Message}`);
        }
      },
      error: () => {
        this.messageService.errorBubble('下傳失敗');
      },
    });
  }

  loadOptions() {
    // 查詢 專櫃編號：此頁篩選條件含 tlt_openflag，與共用下拉的 endpoint 不同，維持既有 API
    this.tls51070Service.queryTLTTALENT_ByStoreWay2AndApprove2_DropDownList({})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.TLT_NO_Option = this.mapToApiOptions(response.Data);
      });
  }

  // 下傳POS不受限，故每一列皆可勾選；刪除限制改由 rowNotDeletable 控管刪除鈕本身
  rowNotDeletable(rowData: POS2004): boolean {
    return !rowData.CanDel;
  }

  //移動到 歷史紀錄查詢/標籤檔案
  gotoTls51070OS(destination: string) {
    const extras: NavigationExtras = {
      state: {
        fromRoute: this.router.url,
        destination: destination,
      },
    };
    this.router.navigate(['account/tls/tls51070os'], extras);
  }

  onImportExcelSubmit(event: FileUploadHandlerEvent) {
    if (!event || !event.files || event.files.length === 0) return;
    this.excelLoading = true;
    const file = event.files[0];
    const sheetName = this.importForm.get('sheetName')?.value || '';
    this.tls51070Service.uploadTLS51070(file, sheetName).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.excelLoading = false; })).subscribe(res => {
      const data = res?.Data;
      // --- 第一層：處理 ErrorFilePath (匯入失敗，包含錯誤檔案路徑) ---
      if (data?.ErrorFilePath) {
        // 拼接後端完整網址連結
        const fullDownloadUrl = `${environment.ApiUrl}/${data.ErrorFilePath}`;
        this.messageService.confirm({
          header: '匯入失敗',
          // 第一行：成功與失敗筆數
          // 第二行：後端完整位置（以超連結樣式呈現，並設定 target="_blank"）
          message: `匯入失敗，錯誤筆數：${data.ErrorCount || 0}，正確筆數：${data.SuccessCount || 0}<br>` +
            `檔案位置：<a href="${fullDownloadUrl}" target="_blank" style="color: var(--primary-color); text-decoration: underline; word-break: break-all;">${fullDownloadUrl}</a>`,
          icon: 'times-circle',
          showIcon: true,
          acceptLabel: '確定',
          showRejectButton: false, // 只留下一顆確定按鈕
          accept: () => {
            // 點擊下方確定按鈕時，一樣貼心幫他觸發下載
            if (data.SuccessCount > 0) {
              this.importDialogVisible = false;
              this.onSubmit(this.queryForm);
            }
          }
        });
        return;
      }
      // --- 第二層：處理 Data.Errors (預檢失敗，例如找不到工作表) ---
      if (data?.Errors && data.Errors.length > 0) {
        const errorDetail = data.Errors.join('；');
        this.messageService.errorBubble(errorDetail);
        return;
      }
      // --- 第三層：完全成功判斷 ---
      if (data?.Success === true || res?.Status === "0000") {
        this.messageService.successBubble(`匯入成功，共 ${data?.SuccessCount || 0} 筆`);
        this.importDialogVisible = false;
        this.onSubmit(this.queryForm);
      }
      // --- 最後：保險用的錯誤顯示 ---
      else {
        this.messageService.errorBubble(res?.Message || '匯入失敗，請檢查檔案格式');
      }
    });
  }

  // 匯出Excel範本
  onExportExcel() {
    this.tls51070Service.downloadTLS51070Template().subscribe((res: Blob) => {
      const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'TLS51070_Template.xlsx');
    });
  }

  // 匯入圖片檔
  async onIMGUpload(event: FileSelectEvent) {
    // 1. 檢查是否有檔案
    if (!event.files || event.files.length === 0) return;
    // 正則表達式解釋：
    // ^[a-zA-Z0-9]+ : 開頭為英數字（條碼）
    // (-\d+)?      : 可選的橫線加上一個或多個數字（如 -1, -2）
    // \.[a-zA-Z]+$  : 檔案結尾的副檔名
    const fileNamePattern = /^[a-zA-Z0-9]+(-\d+)?\.[a-zA-Z]+$/;
    const formData = new FormData();
    const invalidFiles: string[] = [];
    for (const file of event.files) {
      // 檢查檔名格式
      if (!fileNamePattern.test(file.name)) {
        invalidFiles.push(file.name);
        continue;
      }
      formData.append('files', file);
    }
    // 如果有格式不符的檔案，阻斷上傳並提示
    if (invalidFiles.length > 0) {
      this.messageService.errorBubble(`檔名格式錯誤：${invalidFiles.join(', ')}。必須為「國際條碼.png」或「國際條碼-1.png」`);
      return;
    }
    try {
      this.messageService.blockUi(); // 開始上傳時鎖定 UI
      await firstValueFrom(this.tls51070Service.uploadTLS51070Image(formData).pipe(takeUntilDestroyed(this.destroyRef)));
      this.messageService.successBubble('圖片上傳成功');
    } catch {
      this.messageService.errorBubble('圖片上傳失敗');
    } finally {
      this.messageService.unblockUi();
    }
  }

  downloadErrorFile(filePath: string) {
    globalThis.open(`${environment.ApiUrl}/${filePath}`, '_blank');
  }
}
