import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationExtras } from '@angular/router';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls51070Service } from '@service/api/tls/tls51070.service';
import { IQueryPOS2004DetailResponse, Tls52010Service } from '@service/api/tls/tls52010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { FileUploadComponent } from '@shared/componentkit/file-upload/file-upload.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { apiOption, option } from '@shared/models/sys/sysb000.model';
import { POS2004 } from '@shared/models/tls/tls000.model';
import saveAs from 'file-saver';
import { AccordionModule } from 'primeng/accordion';
import { FileSelectEvent, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { finalize, firstValueFrom } from 'rxjs';
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
    DropdownTableComponent,
    TableComponent,
    TranslateModule]
})
export class TLS51070Component extends BasicQueryPageComponent<POS2004> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    // POS2004 商品主檔

    KeyWord: ['', [Validators.maxLength(20)]], // 20260112調整: 商品管理編號/國際條碼/廠商貨號都以KeyWord送出
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    LOGO_No: ['', [Validators.maxLength(4)]], // 品牌代碼
    queryNo: [null, [Validators.maxLength(20)]], // 查詢編號 input //新增
    CAT_LNo: ['', [Validators.maxLength(6)]], // 大分類代碼 --POS2003
    CAT_MNo: ['', [Validators.maxLength(6)]], // 中分類代碼 POS20031
    CAT_SNo: ['', [Validators.maxLength(6)]], // 小分類代碼 POS20032
    PLU_Attribute: [null, [Validators.maxLength(16)]], // 商品型態 1一般、2進口、3買斷、4試銷、5寄賣*/ --南紡 商品型態 1一般、2進口、3買斷、4試銷、5寄賣
    PLU_Unit: ['', [Validators.maxLength(2)]], // 單位代碼 --讀PLUUNIT  商品單位設定檔
    PLU_ECStatus: ['', [Validators.maxLength(1)]], // EC商品狀態: 1.正常2.停用3.停進4,下架 For EC (備註: 原來的 商品狀態(PLU_Status) 改為 EC商品狀態(PLU_ECStatus))
    PLU_Reserve1: ['', [Validators.maxLength(400)]], // 說明
    PLU_Reserve3: ['', [Validators.maxLength(400)]], // 系列
    TLT_NO: ['', [Validators.maxLength(12)]], // 專櫃編號

    //分頁查詢
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  largeOption: apiOption[] = [];
  middleOption: apiOption[] = [];
  smallOption: apiOption[] = [];
  brandOption: apiOption[] = [];  // 品牌代碼
  TLT_NO_Option: apiOption[] = []; // 專櫃編號
  attributeOptions: option[] = [ // 商品型態
    { value: '1', label: '一般' },
    { value: '2', label: '進口' },
    { value: '3', label: '買斷' },
    { value: '4', label: '試銷' },
    { value: '5', label: '寄賣' },
  ];
  unitOptions: apiOption[] = [];  //商品單位
  statusOptions: option[] = [  // EC商品狀態
    { value: '1', label: '正常' },
    { value: '2', label: '停用' },
    { value: '3', label: '停進' },
    { value: '4', label: '下架' },
  ];

  data: POS2004[] = [];
  columns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'PLU_No', header: '國際條碼', visible: true },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號', visible: true },
    { field: 'LOGO_No', header: '品牌代碼', visible: false },
    { field: 'LOGO_Name', header: '品牌', visible: true },
    {
      field: 'CAT_LNo', header: '大分類代碼', visible: false,
    },
    {
      field: 'CAT_LName', header: '大分類', visible: true,
    },
    {
      field: 'CAT_MNo', header: '中分類代碼', visible: false,
    },
    {
      field: 'CAT_MName', header: '中分類', visible: true,
    },
    {
      field: 'CAT_SNo', header: '小分類代碼', visible: false,
    },
    {
      field: 'CAT_SName', header: '小分類', visible: true,
    },
    {
      field: 'PLU_SalePrc', header: '商品售價', visible: true, format: formatAmount
    },
    {
      field: 'PLU_Attribute', header: '商品型態代碼', visible: false,
    },
    {
      field: 'PLU_AttributeName', header: '商品型態', visible: true,
    },
    {
      field: 'PLU_Unit', header: '單位代碼', visible: false,
    },
    {
      field: 'PLU_UnitNAME', header: '單位', visible: true,
    },
    {
      field: 'PLU_ECStatus', header: 'EC商品狀態', visible: true,
      format: (value: string) =>
        this.statusOptions.find((option) => option.value === value)?.label ||
        value,
    },
    { field: 'PLU_Reserve1', header: '說明', visible: true },
    { field: 'PLU_Reserve3', header: '系列', visible: true },

    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDate },
    { field: 'CRT_USR_No', header: '建立人員代碼', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDate },
    { field: 'UPD_USR_No', header: '變更人員代碼', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false }
  ];

  selectedItems: POS2004[] = [];// 多選項目

  excelLoading = false; //excel讀條

  // #region 匯入 Excel Dialog 相關
  @ViewChild('excelUploadComponent') excelUploadComponent!: FileUploadComponent;
  importDialogVisible = false;

  importForm = this.formBuilder.group({
    sheetName: ['', [Validators.maxLength(50)]] // 指定頁籤名稱
  });

  // ----------------------------------------------------------------
  constructor(
    private tls51070Service: Tls51070Service,
    private tls52010Service: Tls52010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51070', 'TLS/TLS51070cru', this.queryForm, (form) => this.onSubmit(form));
    //導入下拉清單
    this.loadOptions();

    //初始導入所有大分類、中分類、小分類表單
    this.loadCATOptions();

    // 監聽 大分類 是否為''
    this.queryForm.get('CAT_LNo')!.valueChanges.subscribe((newValue) => {
      // console.log('大分類變更為:', newValue);
      if (!newValue) {
        // 讀取整份 大分類、中分類、小分類 dropDown
        this.loadCATOptions();
      } else {
        // 若大分類為空 禁用中分類、小分類
        this.queryForm.get('CAT_MNo')?.enable();
        this.queryForm.get('CAT_SNo')?.enable();
      }
    });

    //觀察表單 中分類變化
    this.queryForm.get('CAT_LNo')?.valueChanges.subscribe((lno) => {
      if (lno) {
        console.log('觀察中分類變化', lno);
        this.tls51070Service
          .queryCAT_MNo_DropDownList({ CAT_LNo: [lno] })
          .subscribe((res) => {
            this.middleOption = res.Data.map((item: apiOption) => ({
              No: item.No,
              Name: item.Name,
              Label: item.No + '-' + item.Name,
            }));
            this.queryForm.get('CAT_MNo')?.setValue('');
            this.queryForm.get('CAT_SNo')?.setValue('');
            this.smallOption = [];
          });
      } else {
        this.middleOption = [];
        this.smallOption = [];
        this.queryForm.get('CAT_MNo')?.setValue('');
        this.queryForm.get('CAT_SNo')?.setValue('');
      }
    });
    //觀察表單 小分類變化
    this.queryForm.get('CAT_MNo')?.valueChanges.subscribe((mno) => {
      const lno = this.queryForm.get('CAT_LNo')?.value;
      if (lno && mno) {
        //新版api改成list傳送
        const requestPayload = {
          CATList: [
            {
              CAT_LNo: lno,
              CAT_MNo: mno
            }
          ]
        };

        this.tls51070Service
          .queryCAT_SNo_DropDownList(requestPayload)
          .subscribe((res) => {
            this.smallOption = res.Data.map((item: apiOption) => ({
              No: item.No,
              Name: item.Name,
              Label: item.No + '-' + item.Name,
            }));
            this.queryForm.get('CAT_SNo')?.setValue('');

            console.log('小分類', this.smallOption);
          });
      } else {
        this.smallOption = [];
        this.queryForm.get('CAT_SNo')?.setValue('');
      }
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 將KeyWord值設定到queryNo
      frm.get('queryNo')?.setValue(frm.get('KeyWord')?.value);
      console.log('query condition', frm.value);
      this.tls51070Service.queryTLS51070(frm.value).subscribe({
        next: (response) => {
          // console.log('回傳階層:', response.Data);
          if (response.Status === '0000') {
            this.data = response.Data || [];
            console.log('Result', this.data);
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
          } else {
            console.error('API error:', response.Status, response.Message);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err: string) => {
          console.error('API error:', err);
          this.loading = false;
          this.messageService.unblockUi();
        },
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
        console.log('Delete data:', JSON.stringify(data, null, 2));

        const items = Array.isArray(data) ? data : [data];
        if (items.length === 0) {
          console.error('No items to delete');
          this.messageService.errorBubble('無法刪除：沒有選中的項目');
          return;
        }

        // 收集所有有效的 ID
        const idList = items
          .filter((item) => item && item.id != null && item.id !== undefined)
          .map((item) => item.id);

        if (idList.length === 0) {
          console.error('No valid IDs to delete');
          this.messageService.errorBubble('無法刪除：選中的項目缺少有效 ID');
          return;
        }

        //確認是否全部都可以刪除
        const canDelete = items.every((item) => item.CanDel);

        if (!canDelete) {
          console.error('Some items cannot be deleted');
          this.messageService.errorBubble('無法刪除：組織階層互相關連');
          return;
        }

        const deleteBody = {
          idList: idList, // 符合 API 的 idList 格式
        };
        this.tls51070Service.deleteTLS51070(deleteBody).subscribe({
          next: (response) => {
            if (response.Status === '0000') {
              this.messageService.successBubble('刪除成功');
            } else {
              console.error('API error:', response.Status, response.Message);
              this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
            }
          },
          error: (err: string) => {
            console.error('API error:', err);
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

  loadOptions() {
    //查詢 商品單位
    this.tls51070Service
      .queryPLUUNIT_DropDownList({}).pipe(untilDestroyed(this))
      .subscribe((response) => {
        this.unitOptions = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));
      });

    // 查詢 品牌代碼
    this.tls51070Service
      .queryPLULOGO_DropDownList({}).pipe(untilDestroyed(this))
      .subscribe((response) => {
        this.brandOption = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));
      });

    // 查詢 專櫃編號
    this.tls51070Service.queryTLTTALENT_ByStoreWay2AndApprove2_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.TLT_NO_Option = response.Data.map((item: any) => ({
        No: item.No, // 專櫃編號代碼
        Label: item.No + '-' + item.Name, // 組合成顯示用的Label
      }));
    });
  }

  //讀取 大分類表單 (該情況禁止 中小下拉選擇)
  loadCATOptions() {
    {
      //查詢 大分類
      this.tls51070Service
        .queryCAT_LNo_DropDownList({}).pipe(untilDestroyed(this))
        .subscribe((response) => {
          this.largeOption = response.Data.map((item: apiOption) => ({
            No: item.No,
            Name: item.Name,
            Label: item.No + '-' + item.Name,
          }));
        });

      // 禁用中分類、小分類
      this.queryForm.get('CAT_MNo')?.disable();
      this.queryForm.get('CAT_SNo')?.disable();
    }
  }

  isRowSelectable(rowData: POS2004): boolean {
    return rowData.CanDel
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

  // 開啟匯入 Dialog
  onOpenImportDialog() {
    this.importForm.reset();
    if (this.excelUploadComponent) {
      this.excelUploadComponent.clearFiles();
    }
    this.importDialogVisible = true;
  }

  // #reigion Excel匯入
  onImportExcelSubmit(event: FileUploadHandlerEvent) {
    if (!event || !event.files || event.files.length === 0) return;

    const file = event.files[0];
    const sheetName = this.importForm.get('sheetName')?.value || undefined; // 取得輸入框的值

    this.messageService.blockUi();

    this.tls51070Service.uploadTLS51070(file, sheetName)
      .pipe(
        untilDestroyed(this),
        // 2. 確保無論成功或失敗，最後都會解除鎖定
        finalize(() => {
          this.messageService.unblockUi();
        })
      )
      .subscribe({
        next: (res) => {
          const data = res?.Data;
          // --- 情況 A：失敗 (Status 不對 或 Success 為 false) ---
          if (res?.Status !== "200" || data?.Success === false) {

            // 優先抓取 Errors 陣列裡的詳細訊息
            const errorMsg = data?.Errors?.[0] || res?.Message || '匯入失敗';
            this.messageService.errorBubble(errorMsg);

            // 如果有提供錯誤檔，才執行下載邏輯
            if (data?.ErrorFilePath) {
              // this.messageService.errorBubble(`請下載錯誤檔檢查失敗原因`);
              this.downloadErrorFile(data.ErrorFilePath);
            }

            // 失敗就不往下跑了，直接結束
            this.excelUploadComponent.clearFiles();
            return;
          }

          // --- 情況 B：成功 (通過上面的檢查，代表成功) ---
          if (data?.Success === true) {
            this.messageService.infoBubble(`匯入成功，共 ${data.SuccessCount} 筆`);

            this.importDialogVisible = false; // 只有成功才關閉視窗
            this.onSubmit(this.queryForm);   // 重新整理列表
          }

          this.excelUploadComponent.clearFiles();
        },
        error: (err) => {
          console.error(err);
          this.messageService.errorBubble('檔案上傳失敗，請稍後再試');
          this.excelUploadComponent.clearFiles();
        },
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
      await firstValueFrom(this.tls51070Service.uploadTLS51070Image(formData).pipe(untilDestroyed(this)));
      this.messageService.successBubble('圖片上傳成功');
    } catch (error) {
      console.error('❌ 圖片上傳失敗:', error);
      this.messageService.errorBubble('圖片上傳失敗');
    } finally {
      this.messageService.unblockUi();
    }
  }

  downloadErrorFile(filePath: string) {
    window.open(`${environment.ApiUrl}/${filePath}`, '_blank');
  }

  //!!! 國際條碼/商品管理編號/廠商貨號
  suggestions: IQueryPOS2004DetailResponse[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_No', header: '國際條碼/商品管理編號/廠商貨號', mainDataField: true },
  ];
  onAutoCompleteInputChange(event: Record<'label', string>) {
    const body = {
      VEN_No: '',
      LOGO_No: '',
      queryNo: event.label || '',
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_No', order: 1 }],
    }
    // !!! 若有自己這隻的API請改成自己的
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = [...results.Data.map(item => ({
        ...item,
        label: item.PLU_No + '/' + item.PLU_MagNo + '/' + item.PLU_OrgPLUNo + ' - ' + item.PLU_Name
      }))];
    });
  }

  // 匯出Excel範本
  onExportExcel() {
    this.tls51070Service.downloadTLS51070Template().subscribe({
      next: (res: Blob) => {
        const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'TLS51070_Template.xlsx');
      },
    });
  }
}
