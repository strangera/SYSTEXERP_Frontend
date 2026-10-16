import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS12050Service } from '@service/api/tls/tls12050.service';
import { InputNumberRangeComponent } from '@shared/components/input-number-range/input-number-range.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AddButton } from '@shared/components/table-report/table-report.model';
import { TableComponent } from '@others/component/table/table.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { finalize, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { Column, createPaginationConfig } from '../../../others/component/table/table.model';
import { Cpm11100Request, Cpm11100Service } from './../../../service/api/cpm/cpm11100.service';

// 財產變更記錄查詢
export interface cpm11100 {
  ROW_NO: number; // 行號
  TLT_NO: string; // 專櫃編號
  TLT_NAME: string; // 專櫃名稱
  BUS_TYPE_NAME: string; // 大分類
  FLOOR_DESC: string; // 樓層
  TLT_FLOOR: string; // 平面圖
  LOCATION_NO: string; // 位置
  TLT_OPENFLAG: string; // 營運狀態
  TLT_OPENSTATUS: string; // 營運狀態說明
  BUILDING_NO: string; // 館別
}

// CPM11000-全館店櫃資訊查詢
@Component({
  selector: 'app-cpm11100',
  standalone: true,
  templateUrl: './cpm11100.component.html',
  imports: [
    AsyncPipe,
    MenubarComponent,
    ButtonComponent,
    ButtonModule,
    AccordionModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberRangeComponent,
    ImageModule,
    DropdownComponent,
    TableReportComponent,
    TableComponent,
    TranslateModule]
})
export class Cpm11100Component extends BasicQueryPageComponent<cpm11100> implements OnInit {
  //---queyfunction撥接轉換---
  wrappedQueryFunction = (params: any) => {
    const payload = {
      ...params,
      PageIndex: params.pageIndex, // 轉型：小寫變大寫
      PageSize: params.pageSize    // 轉型：小寫變大寫
    };

    // 呼叫原始 Service 並回傳 Observable
    return this.cpm11100Service.queryCPM11100(payload).pipe(
      map(response => {
        // 將 API 格式轉換為 app-table-report 底層 loadMoreData 期望的格式
        return {
          Data: response.Data.QueryData,     // Table 期望 Data 直接是陣列
          TotalCount: response.Data.TotalCount // Table 期望 TotalCount 放在最外層
        };
      })
    );
  };
  //------
  // 查詢 ( tls2c040
  queryForm = this.formBuilder.group({
    KEYWORD: ["", [Validators.maxLength(100)]], // 專櫃品牌
    TLT_OPENFLAG: [null, [Validators.maxLength(1)]], // 營運狀態 (NULL=全部、0=已撤櫃、1=營運中)
    //分頁查詢
    ...createPaginationConfig([{ field: 'TLT_NO', order: 1 }]), // 分頁和排序參數
  });
  lastQueryBody: Cpm11100Request | null = null;

  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: cpm11100[] = [];
  columns: Column[] = [
    // { field: 'ROW_NO', header: '行號', visible: false },
    { field: 'TLT_NO', header: '專櫃編號' },
    { field: 'TLT_NAME', header: '專櫃名稱' },
    { field: 'BUS_TYPE_NAME', header: '大分類' },
    // { field: 'TLT_FLOOR', header: '樓層代碼', visible: false },
    { field: 'FLOOR_DESC', header: '樓層' },
    { field: 'LOCATION_NO', header: '位置' },
    // { field: 'TLT_OPENFLAG', header: '營運狀態代碼' },
    { field: 'TLT_OPENSTATUS', header: '營運狀態名稱' },
  ];

  // 修正 addButton：呼叫底層的 onDetail 並帶入「類型」字串作為 queryConditions
  addButton: AddButton[] = [
    {
      label: '觀看平面圖',
      action: (rowData: any) => { this.onLinkClick({ rowData, field: 'TLT_FLOOR' }) },
    }
  ];

  selectedItems: cpm11100[] = [];// 多選項目

  TLT_OPENFLAG_OPTIONS: { value: string; label: string }[] = [
    { value: '0', label: '已撤櫃' },
    { value: '1', label: '營業中' },
    { value: '9', label: '合約未生效' },
  ];

  // --- 平面圖相關變數 ---
  selectedImage?: string;
  selectedFloor = '';
  All_Count = 0;
  Idle = '';
  Under_Negotiation = '';
  In_Operation = '';
  Outof_Service = '';
  // 用於新開視窗的 HTML 字串，需組成絕對網址
  blank = new URL('assets/images/blank.jpg', document.baseURI).href;
  showFloorPlan = false; // 控制是否顯示平面圖區塊

  // ----------------------------------------------------------------
  constructor(
    public readonly cpm11100Service: Cpm11100Service,
    public readonly tls12050Service: TLS12050Service, // 平面圖api
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM11100', 'CPM/CPM11100', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.wrappedQueryFunction(frm.value)
        .pipe(
          finalize(() => this.loading = false),
          untilDestroyed(this)
        )
        .subscribe(res => {
          // wrappedQueryFunction 已經幫忙剝殼了，這裡直接讀取 res.Data
          this.data = res.Data;
          this.totalRecords = res.TotalCount;
          this.lastQueryBody = frm.value;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        });
    });
  }

  //點擊查看平面圖事件(參考TLS12050
  onLinkClick(event: { rowData: cpm11100; field: string }): void {
    const row = event.rowData;
    this.loading = true; // 開始讀取

    this.tls12050Service.queryTLS12050Details({ building_no: row.BUILDING_NO, FLOOR_NO: row.FLOOR_DESC })
      .pipe(
        finalize(() => this.loading = false),
        untilDestroyed(this)
      )
      .subscribe(res => {
        if (res && res.Summary && res.Summary.Image_Url) {
          // 組合完整圖片網址
          const imageUrl = `${environment.ApiUrl}/${res.Summary.Image_Url}`;

          // 在新視窗開啟圖片
          // 如果你想要更精緻的顯示，建議開一個專門的 Angular Route 頁面
          const win = globalThis.open('', '_blank');
          if (win) {
            // 寫入簡單的 HTML 讓圖片在新分頁置中且美觀
            win.document.write(`
              <html>
                <head>
                  <title>平面圖- ${row.BUILDING_NO}/${row.FLOOR_DESC}</title>
                  <style>
                    body { margin: 0; background: #333; display: flex; justify-content: center; align-items: center; height: 100vh; }
                    img { max-width: 100%; max-height: 100%; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
                  </style>
                </head>
                <body>
                  <img src="${imageUrl}" onerror="this.src='${this.blank}'">
                </body>
              </html>
            `);
            win.document.close();
          }
        } else {
          this.messageService.add({ severity: 'warn', summary: '提醒', detail: '查無平面圖路徑' });
        }
      });
  }
}
