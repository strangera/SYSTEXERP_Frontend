import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls11010Service } from '@service/api/tls/tls11010.service';
import { TLS12050Service, TLS12050Summary } from '@service/api/tls/tls12050.service';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AddButton } from '@shared/componentkit/table-report/table-report.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { finalize, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
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
    { field: 'FLOOR_DESC', header: '樓層' },
    { field: 'LOCATION_NO', header: '位置' },
    { field: 'TLT_FLOOR', header: '平面圖' },
    { field: 'TLT_OPENFLAG', header: '營運狀態代碼' },
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
    { value: '1', label: '營運中' },
  ];

  // --- 平面圖相關變數 ---
  selectedImage?: string;
  selectedFloor = '';
  selectedBuildingLabel = '';
  All_Count = 0;
  Idle = '';
  Under_Negotiation = '';
  In_Operation = '';
  Outof_Service = '';
  blank = environment.ApiUrl + '/images/blank.jpg';
  showFloorPlan = false; // 控制是否顯示平面圖區塊

  // ----------------------------------------------------------------
  constructor(
    public readonly cpm11100Service: Cpm11100Service,
    public readonly tls11010Service: Tls11010Service, // 由位置編號抓館別api
    public readonly tls12050Service: TLS12050Service, // 平面圖api
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM11100', 'CPM/CPM11100', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      //這邊預設是pageSize但後端是PageSize要先轉型
      const payload = {
        ...frm.value,
        PageSize: frm.value.pageSize,
        PageIndex: frm.value.pageIndex,
      };
      console.log('全館店櫃request:', JSON.stringify(payload, null, 2));
      this.loading = false;
      this.cpm11100Service.queryCPM11100(payload).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.data = response.Data || [];
            console.log('Result', this.data);
            this.totalRecords = response.TotalCount || response.Data.length;
            this.lastQueryBody = frm.getRawValue();
            this.queryStateService.setQueryState(this.ProgNo, this.lastQueryBody);
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

      // this.cpm11100Service.queryCPM11100(frm.getRawValue())
      //   .pipe(untilDestroyed(this), finalize(() => this.loading = false))
      //   .subscribe(response => {
      //     this.data = response.Data || [];
      //     this.totalRecords = response.TotalCount || 0;
      //     this.lastQueryBody = frm.getRawValue();
      //     this.queryStateService.setQueryState(this.ProgNo, this.lastQueryBody);
      //   });
    });
  }

  //點擊查看平面圖事件(參考TLS12050
  onLinkClick(event: { rowData: cpm11100; field: string }): void {
    const row = event.rowData;
    this.loading = true; // 開始讀取

    // 1. 建立第一個 API 的 Payload (找館別)
    const tls11010payload = {
      "id": 0,
      "LOCATION_No": row.LOCATION_NO,
      "LOCATION_Name": null,
      "org_id": null,
      "org_name": null,
      "building_no": null,
      "FLOOR_NO": null,
      "AREA_NO": null,
      "GROSS_SPACE": null,
      "NET_SPACE": null,
      "LOCATION_Status": null,
      "Purpose_no": null,
      "purpose_desc": null,
      "Draw_X": null,
      "Draw_Y": null,
    };

    this.tls11010Service
      .queryData(tls11010payload)
      .pipe(
        untilDestroyed(this),
        // 使用 switchMap 將第一個 API 的結果轉接到第二個 API
        switchMap((res) => {
          // 取得館別，若無則預設為空字串
          const buildingNo = res.Data && res.Data.length > 0 ? res.Data[0].building_no : '';
          this.selectedBuildingLabel = buildingNo;

          console.log('成功抓到館別:', buildingNo);

          // 2. 建立第二個 API 的 Payload (查平面圖細節)
          const payload = {
            building_no: buildingNo,
            FLOOR_NO: row.FLOOR_DESC // 使用該列的樓層
          };

          // 回傳第二個 API 的 Observable
          return this.tls12050Service.queryTLS12050Details(payload);
        }),
        finalize(() => this.loading = false) // 不論成功失敗都關閉 Loading
      )
      .subscribe({
        next: (res) => {
          if (res && res.Summary) {
            // 3. 處理平面圖資料
            this.applyFloorPlanData(res.Summary, row.FLOOR_DESC);
            this.showFloorPlan = true;

            // 滾動到圖表區塊
            setTimeout(() => {
              const element = document.getElementById('floorPlanSection');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          } else {
            console.warn('查無平面圖摘要資料');
          }
        },
        error: (err) => {
          console.error('取得資料流程失敗:', err);
        }
      });
  }

  private applyFloorPlanData(summary: TLS12050Summary, floor: string): void {
    const total = summary.All_Count ?? 0;
    this.selectedImage = summary.Image_Url ? `${environment.ApiUrl}/${summary.Image_Url}` : this.blank;
    this.selectedFloor = floor;
    this.All_Count = total;
    this.Idle = this.calculatePercent(summary.Idle ?? 0, total);
    this.Under_Negotiation = this.calculatePercent(summary.Under_Negotiation ?? 0, total);
    this.In_Operation = this.calculatePercent(summary.In_Operation ?? 0, total);
    this.Outof_Service = this.calculatePercent(summary.Outof_Service ?? 0, total);
  }

  private calculatePercent(value: number, total: number): string {
    if (!total) return '0%';
    return ((value / total) * 100).toFixed(1) + '%';
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.blank;
  }
}
