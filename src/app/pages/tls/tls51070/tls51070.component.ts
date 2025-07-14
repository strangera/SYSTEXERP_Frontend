import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column } from '../../../shared/componentkit/table/table.model';
import { apiOption, option } from '../../../shared/models/sys/sysb000.module';
import { POS2004 } from '../../../shared/models/tls/tls000.model';
import { Tls51070Service } from '../../../service/api/tls/tls51070.service';
import { FileSelectEvent } from 'primeng/fileupload';
import { untilDestroyed } from '@ngneat/until-destroy';
import { environment } from '../../../../environments/environment';

// 2.5.1.7  商品基本資料
@Component({
  selector: 'app-tls51070',
  templateUrl: './tls51070.component.html',
  styleUrl: './tls51070.component.scss'
})
export class TLS51070Component extends BasicQueryPageComponent<POS2004> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    // POS2004 商品主檔
    PLU_MagNo: ['', [Validators.maxLength(20)]], // 商品管理編號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    PLU_No: ['', [Validators.maxLength(20)]], // 國際條碼
    PLU_OrgPLUNo: ['', [Validators.maxLength(30)]], // 廠商貨號 --廠商自編碼 廠商貨號
    LOGO_No: ['', [Validators.maxLength(4)]], // 品牌代碼
    CAT_LNo: ['', [Validators.maxLength(6)]], // 大分類代碼 --POS2003
    CAT_MNo: ['', [Validators.maxLength(6)]], // 中分類代碼 POS20031
    CAT_SNo: ['', [Validators.maxLength(6)]], // 小分類代碼 POS20032
    PLU_Attribute: ['1', [Validators.maxLength(16)]], // 商品型態 1一般、2進口、3買斷、4試銷、5寄賣*/ --南紡 商品型態 1一般、2進口、3買斷、4試銷、5寄賣
    PLU_Unit: ['', [Validators.maxLength(2)]], // 單位代碼 --讀PLUUNIT  商品單位設定檔
    PLU_ECStatus: ['1', [Validators.maxLength(1)]], // EC商品狀態: 1.正常2.停用3.停進4,下架 For EC (備註: 原來的 商品狀態(PLU_Status) 改為 EC商品狀態(PLU_ECStatus))
    PLU_Reserve1: ['', [Validators.maxLength(400)]], // 說明
    PLU_Reserve3: ['', [Validators.maxLength(400)]], // 系列

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
  attributeOptions: option[] = [ // 商品型態
    { value: '1', label: '一般' },
    { value: '2', label: '進口' },
    { value: '3', label: '買斷' },
    { value: '4', label: '試銷' },
    { value: '5', label: '寄賣' },
  ];
  unitOptions: apiOption[] = [];  //商品單位
  statusOptions: option[] = [  //商品狀態
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
    {
      field: 'LOGO_No', header: '品牌代碼', visible: true,
      format: (value: string) =>
        this.brandOption.find((option) => option.No === value)?.Label ||
        value
    },
    {
      field: 'CAT_LNo', header: '大分類代碼', visible: true,
      format: (value: string) =>
        this.largeOption.find((option) => option.No === value)?.Label ||
        value,
    },
    {
      field: 'CAT_MNo', header: '中分類代碼', visible: true,
      format: (value: string) =>
        this.middleOption.find((option) => option.No === value)?.Label ||
        value,
    },
    {
      field: 'CAT_SNo', header: '小分類代碼', visible: true,
      format: (value: string) =>
        this.smallOption.find((option) => option.No === value)?.Label ||
        value,
    },
    {
      field: 'PLU_Attribute', header: '商品型態', visible: true,
      format: (value: string) =>
        this.attributeOptions.find((option) => option.value === value)?.label ||
        value,
    },
    {
      field: 'PLU_Unit', header: '單位代碼', visible: true,
      format: (value: string) =>
        this.unitOptions.find((option) => option.No === value)?.Label ||
        value,
    },
    {
      field: 'PLU_ECStatus', header: 'EC商品狀態', visible: true,
      format: (value: string) =>
        this.statusOptions.find((option) => option.value === value)?.label ||
        value,
    },
    { field: 'PLU_Reserve1', header: '說明', visible: true },
    { field: 'PLU_Reserve3', header: '系列', visible: true },
  ];

  selectedItems: POS2004[] = [];// 多選項目

  //---CRU注意---
  // 新增的時候 PLU_Staus 固定給 0
  // 編輯不顯示 PLU_Staus
  //-------------

  // ----------------------------------------------------------------
  constructor(
    private tls51070Service: Tls51070Service,
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
        this.tls51070Service
          .queryCAT_SNo_DropDownList({ CAT_LNo: [lno], CAT_MNo: [mno] })
          .subscribe((res) => {
            this.smallOption = res.Data.map((item: apiOption) => ({
              No: item.No,
              Name: item.Name,
              Label: item.No + '-' + item.Name,
            }));
            this.queryForm.get('CAT_SNo')?.setValue('');
          });
      } else {
        this.smallOption = [];
        this.queryForm.get('CAT_SNo')?.setValue('');
      }
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
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
          this.messageService.successBubble('選中項目刪除成功');
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
  }

  loadOptions() {
    //查詢 商品單位
    this.tls51070Service
      .queryPLUUNIT_DropDownList({})
      .subscribe((response) => {
        this.unitOptions = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));

        console.log('商品單位:', this.unitOptions);
      });

    // 查詢 品牌代碼
    this.tls51070Service
      .queryPLULOGO_DropDownList({})
      .subscribe((response) => {
        this.brandOption = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));

        console.log('品牌代碼:', this.brandOption);
      });
  }

  //讀取大、中、小 分類整份表單 (該情況禁止 中小下拉選擇)
  loadCATOptions() {
    {
      //查詢 大分類
      this.tls51070Service
        .queryCAT_LNo_DropDownList({})
        .subscribe((response) => {
          this.largeOption = response.Data.map((item: apiOption) => ({
            No: item.No,
            Name: item.Name,
            Label: item.No + '-' + item.Name,
          }));

          console.log('大分類:', this.largeOption);
        });
      //查詢 中分類
      this.tls51070Service
        .queryCAT_MNo_DropDownList({})
        .subscribe((response) => {
          this.middleOption = response.Data.map((item: apiOption) => ({
            No: item.No,
            Name: item.Name,
            Label: item.No + '-' + item.Name,
          }));

          console.log('中分類:', this.largeOption);
        });
      //查詢 小分類
      this.tls51070Service
        .queryCAT_SNo_DropDownList({})
        .subscribe((response) => {
          this.smallOption = response.Data.map((item: apiOption) => ({
            No: item.No,
            Name: item.Name,
            Label: item.No + '-' + item.Name,
          }));

          console.log('小分類:', this.largeOption);
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
    console.log('導引到', destination);
    //導引到sysb400.os
    this.router.navigate(['account/tls/tls51070os'], {
      state: {
        destination: destination,
      }
    });
  }

  //匯入excel並產生錯誤檔
  onFileUpload(event: FileSelectEvent) {
    const file = event.files[0];
    const formData = new FormData();
    formData.append('file', file);

    this.tls51070Service.uploadTLS51070(formData).pipe(untilDestroyed(this)).subscribe({
      next: (res) => {
        const data = res?.Data;

        if (data) {
          if (data.ErrorFilePath) {
            // 有錯誤檔：顯示錯誤提示
            this.messageService.errorBubble(`部分資料匯入失敗，請下載錯誤檔檢查`);
            // 自動下載錯誤檔
             this.downloadErrorFile(data.ErrorFilePath);
          } else {
            // 沒有錯誤檔：顯示成功筆數
            this.messageService.infoBubble(`匯入成功，筆數：${data.SuccessCount}`);
          }
        }
      },
      error: (err) => {
        console.error(err);
        this.messageService.errorBubble('檔案上傳失敗，請稍後再試');
      },
    });
  }

  downloadErrorFile(filePath: string) {
    window.open(`${environment.ApiUrl}/${filePath}`, '_blank');
  }
}
