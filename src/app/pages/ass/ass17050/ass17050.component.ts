import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { apiOption } from '../../../shared/models/sys/sysb000.model';
import { Ass17050Service } from './../../../service/api/ass/ass17050.service';
import { RadiobuttonComponent } from './../../../shared/componentkit/radiobutton/radiobutton.component';


// 財產變更記錄查詢
export interface ass17050 {
  "PAGE_NO": number, // 頁次
  "TOTAL_PAGES": number, // 頁數
  "ROW_TYPE": string, // D=明細,S=小計
  "ROWNO": number, // 全報表連續序號
  "ITEM_NO": string, // 品項編號
  "ITEM_NAME": string, // 品項名稱
  "M01_UNIT_PRICE": string, // 一月單價
  "M01_QTY": string, // 一月數量
  "M01_AMT": string, // 一月金額
  "M02_UNIT_PRICE": string, //二月單價
  "M02_QTY": string, // 二月數量
  "M02_AMT": string, // 二月金額
  "M03_UNIT_PRICE": string, // 三月單價
  "M03_QTY": string,
  "M03_AMT": string,
  "M04_UNIT_PRICE": string,
  "M04_QTY": string,
  "M04_AMT": string,
  "M05_UNIT_PRICE": string,
  "M05_QTY": string,
  "M05_AMT": string,
  "M06_UNIT_PRICE": string,
  "M06_QTY": string,
  "M06_AMT": string,
  "M07_UNIT_PRICE": string,
  "M07_QTY": string,
  "M07_AMT": string,
  "M08_UNIT_PRICE": string,
  "M08_QTY": string,
  "M08_AMT": string,
  "M09_UNIT_PRICE": string,
  "M09_QTY": string,
  "M09_AMT": string,
  "M10_UNIT_PRICE": string,
  "M10_QTY": string,
  "M10_AMT": string,
  "M11_UNIT_PRICE": string,
  "M11_QTY": string,
  "M11_AMT": string,
  "M12_UNIT_PRICE": string,
  "M12_QTY": string,
  "M12_AMT": string,
  "TOTAL_AMT": string // 合計金額
}

@Component({
  selector: 'app-ass17050',
  templateUrl: './ass17050.component.html',
  styleUrl: './ass17050.component.scss',
  standalone: true,
  imports: [
    AsyncPipe,
    MenubarComponent,
    ButtonComponent,
    ButtonModule,
    AccordionModule,
    CommonModule,
    CalendarComponent,
    FormsModule,
    ReactiveFormsModule,
    RadiobuttonComponent,
    InputTextComponent,
    InputNumberRangeComponent,
    DropdownComponent,
    TableComponent,
    TranslateModule]
})
export class ASS17050Component extends BasicQueryPageComponent<ass17050> implements OnInit {
  // 查詢 (Hugo
  queryForm = this.formBuilder.group({
    MID: [(this.authService.getUserInfo()?.mid?.toString()) ?? '', [Validators.required, Validators.maxLength(1)]], // 商場編號
    STO_NO: [this.authService.getUserInfo()?.SYS_StoreNo ?? null, [Validators.required, Validators.maxLength(10)]], // 分店編號

    YYYY: [null, [Validators.required]], // 統計年份(必填，YYYY)
    ORG_ID: [null], // 部門代號
    B_CLASS_ID: [null, [Validators.maxLength(1)]], // 大分類編號(參考 ass11030)
    M_CLASS_ID: [null, [Validators.maxLength(2)]], // 中分類編號
    S_CLASS_ID: [null, [Validators.maxLength(2)]], // 小分類編號
    FASITEM_ID: [null, [Validators.maxLength(20)]], // 品項編號 (參考 ass15020 的 queryASS11040DropDownList)

    //分頁查詢
    ...createPaginationConfig([{ field: 'ASSET_ID', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  data: ass17050[] = [];
  columns: Column[] = [
    // { field: 'ROW_TYPE', header: 'D=明細,S=小計', visible: true },
    // { field: 'ROWNO', header: '全報表連續序號', visible: true },
    { field: 'ITEM_NO', header: '品項編號', visible: true },
    { field: 'ITEM_NAME', header: '品項名稱', visible: true },

    // 1月
    { field: 'M01_UNIT_PRICE', header: '一月單價', visible: true },
    { field: 'M01_QTY', header: '一月數量', visible: true },
    { field: 'M01_AMT', header: '一月金額', visible: true },

    // 2月
    { field: 'M02_UNIT_PRICE', header: '二月單價', visible: true },
    { field: 'M02_QTY', header: '二月數量', visible: true },
    { field: 'M02_AMT', header: '二月金額', visible: true },

    // 3月
    { field: 'M03_UNIT_PRICE', header: '三月單價', visible: true },
    { field: 'M03_QTY', header: '三月數量', visible: true },
    { field: 'M03_AMT', header: '三月金額', visible: true },

    // 4月
    { field: 'M04_UNIT_PRICE', header: '四月單價', visible: true },
    { field: 'M04_QTY', header: '四月數量', visible: true },
    { field: 'M04_AMT', header: '四月金額', visible: true },

    // 5月
    { field: 'M05_UNIT_PRICE', header: '五月單價', visible: true },
    { field: 'M05_QTY', header: '五月數量', visible: true },
    { field: 'M05_AMT', header: '五月金額', visible: true },

    // 6月
    { field: 'M06_UNIT_PRICE', header: '六月單價', visible: true },
    { field: 'M06_QTY', header: '六月數量', visible: true },
    { field: 'M06_AMT', header: '六月金額', visible: true },

    // 7月
    { field: 'M07_UNIT_PRICE', header: '七月單價', visible: true },
    { field: 'M07_QTY', header: '七月數量', visible: true },
    { field: 'M07_AMT', header: '七月金額', visible: true },

    // 8月
    { field: 'M08_UNIT_PRICE', header: '八月單價', visible: true },
    { field: 'M08_QTY', header: '八月數量', visible: true },
    { field: 'M08_AMT', header: '八月金額', visible: true },

    // 9月
    { field: 'M09_UNIT_PRICE', header: '九月單價', visible: true },
    { field: 'M09_QTY', header: '九月數量', visible: true },
    { field: 'M09_AMT', header: '九月金額', visible: true },

    // 10月
    { field: 'M10_UNIT_PRICE', header: '十月單價', visible: true },
    { field: 'M10_QTY', header: '十月數量', visible: true },
    { field: 'M10_AMT', header: '十月金額', visible: true },

    // 11月
    { field: 'M11_UNIT_PRICE', header: '十一月單價', visible: true },
    { field: 'M11_QTY', header: '十一月數量', visible: true },
    { field: 'M11_AMT', header: '十一月金額', visible: true },

    // 12月
    { field: 'M12_UNIT_PRICE', header: '十二月單價', visible: true },
    { field: 'M12_QTY', header: '十二月數量', visible: true },
    { field: 'M12_AMT', header: '十二月金額', visible: true },

    { field: 'TOTAL_AMT', header: '合計金額', visible: true },
  ];

  selectedItems: ass17050[] = [];// 多選項目

  largeOption: apiOption[] = [];
  middleOption: apiOption[] = [];
  smallOption: apiOption[] = [];
  ORG_ID_Options: { value: string; label: string }[] = []; // 部門代號 下拉
  FASITEM_ID_Options: { value: string; label: string }[] = []; // 品項編號 下拉

  // ----------------------------------------------------------------
  constructor(
    private readonly dropdownApi: DropdownApiService,
    private readonly ass17050Service: Ass17050Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS17050', 'ASS/ASS17050', this.queryForm, (form) => this.onSubmit(form));

    this.loadOptions();
    //初始導入所有大分類、中分類、小分類表單 (ass11030)
    this.loadCATOptions();

    // 監聽 大分類 是否為''
    this.queryForm.get('B_CLASS_ID')!.valueChanges.subscribe((newValue) => {
      // console.log('大分類變更為:', newValue);
      if (!newValue) {
        // 讀取整份 大分類、中分類、小分類 dropDown
        this.loadCATOptions();
      } else {
        // 若大分類為空 禁用中分類、小分類
        this.queryForm.get('M_CLASS_ID')?.enable();
        this.queryForm.get('S_CLASS_ID')?.enable();
      }
    });

    //觀察表單 中分類變化
    this.queryForm.get('B_CLASS_ID')?.valueChanges.subscribe((lno) => {
      if (lno) {
        this.ass17050Service
          .queryFACLASS1_DropDownList({ CLASS_ID: lno })
          .subscribe((res) => {
            // console.log('中分類', res);
            this.middleOption = res.Data.map((item: any) => ({
              No: item.M_CLASS_ID,
              Name: item.M_CLASS_NAME,
              Label: item.M_CLASS_ID + '-' + item.M_CLASS_NAME,
            }));
            this.queryForm.get('M_CLASS_ID')?.setValue(null);
            this.queryForm.get('S_CLASS_ID')?.setValue(null);
            this.smallOption = [];
          });
      } else {
        this.middleOption = [];
        this.smallOption = [];
        this.queryForm.get('M_CLASS_ID')?.setValue(null);
        this.queryForm.get('S_CLASS_ID')?.setValue(null);
      }
    });
    //觀察表單 小分類變化
    this.queryForm.get('M_CLASS_ID')?.valueChanges.subscribe((mno) => {
      const lno = this.queryForm.get('B_CLASS_ID')?.value;
      if (lno && mno) {
        //新版api改成list傳送
        this.ass17050Service
          .queryFACLASS2_DropDownList({ B_CLASS_ID: lno, CLASS_ID: mno })
          .subscribe((res) => {
            // console.log('小分類', res);
            const rawData = res.Data;

            // 2. 進行格式轉換
            const mappedOptions = rawData.map((item: any) => ({
              No: item.S_CLASS_ID,
              Name: item.S_CLASS_NAME,
              Label: item.S_CLASS_ID + '-' + item.S_CLASS_NAME
            }));

            // console.log('轉換後的小分類', mappedOptions);

            // 3. 進行去重 (Distinct)
            // 在 filter 的參數中必須加上 (item, index, self)
            this.smallOption = mappedOptions.filter((item: any, index: number, self: any[]) =>
              index === self.findIndex((t) => t.No === item.No)
            );
          });
      } else {
        this.smallOption = [];
        this.queryForm.get('S_CLASS_ID')?.setValue(null);
      }
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = false;
      // 取得原始表單值
      const formValue = frm.value;
      // 處理年份轉型：從 ISO 字串提取年份並轉為字串
      const yearStr = formValue.YYYY ? new Date(formValue.YYYY).getFullYear().toString() : '';
      const payload = {
        ...formValue,
        "YYYY": yearStr,  // 這裡會變成 "2025" (根據 Date 物件解析結果)
        "PageSize": formValue.pageSize
      };

      // console.log('使用統計月報表request', payload)

      this.ass17050Service.queryASS17050(payload).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            // console.log('Result', response);
            this.data = response.Data || []; // 這邊後端多包了一層 Details
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(this.ProgNo, payload);
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

  private getTimestamp(): string {
    const now = new Date();
    return now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') + '_' +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0');
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(blobUrl);
  }

  // 列印明細
  exportPDFLoading = false
  onExportPDF(): void {
    this.exportPDFLoading = true;
    // 取得原始表單值
    const formValue = this.queryForm.value;
    // 處理年份轉型：從 ISO 字串提取年份並轉為字串
    const yearStr = formValue.YYYY ? new Date(formValue.YYYY).getFullYear().toString() : '';
    const payload = {
      ...formValue,
      "YYYY": yearStr,  // 這裡會變成 "2025" (根據 Date 物件解析結果)
      "PageSize": formValue.pageSize
    };

    // console.log('使用統計月報表request', payload)

    this.ass17050Service
      .exportPDFASS17050(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => this.exportPDFLoading = false)
      )
      .subscribe(blob => {
        if (blob) {
          this.downloadBlob(blob, `使用統計月報表_${this.getTimestamp()}.pdf`);
        }
      });
  }

  //讀取 大分類表單 (該情況禁止 中小下拉選擇)
  loadCATOptions() {
    {
      // 查詢 大分類(queryFACLASSM_DropDownList)
      this.dropdownApi
        .queryFaClassM().pipe(untilDestroyed(this))
        .subscribe((response) => {
          // console.log('大分類表單', response);
          if (response) {
            const mappedData = response.map((item: any) => ({
              No: item.B_CLASS_ID,
              Name: item.B_CLASS_NAME,
              Label: `${item.B_CLASS_ID}-${item.B_CLASS_NAME}`,
            }));

            // 利用 Map 以 No 作為 Key 來去重
            const uniqueData = [...new Map(mappedData.map(item => [item.No, item])).values()];

            // 3. 排序 (以 No 進行升冪排序)
            this.largeOption = uniqueData.sort((a, b) => {
              // 如果 No 是字串格式 (例如 'A01', 'A02')
              return a.No.localeCompare(b.No);
            });
          }
        });

      // 禁用中分類、小分類
      this.queryForm.get('M_CLASS_ID')?.disable();
      this.queryForm.get('S_CLASS_ID')?.disable();
    }
  }

  // 讀取 下拉
  loadOptions() {
    //部門代號 (ORG_ID) 下拉選項
    this.dropdownApi
      .querySys3100()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.ORG_ID_Options = opts ?? [];
      });
    //品項編號 (FASITEM_ID) 下拉選項
    // queryFASITEM_DropDownList(MATERIAL_TYPE = "3")，只需顯示品項編號跟名稱
    this.dropdownApi
      .queryFasItemDropdown()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.FASITEM_ID_Options = opts ?? [];
      });
  }
}
