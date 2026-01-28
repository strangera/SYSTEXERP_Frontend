import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin14040Service } from '@service/api/fin/fin14040.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { AccordionModule } from 'primeng/accordion';
import { environment } from 'src/environments/environment';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';

// 本期發票月
const today = new Date();
let invoiceYear = today.getFullYear();
let invoiceMonth = today.getMonth() + 1; // JS 月份 0~11

// 如果不是偶數月，就加 1 個月
if (invoiceMonth % 2 !== 0) {
  invoiceMonth += 1;
  if (invoiceMonth > 12) {
    invoiceMonth = 1;
    invoiceYear += 1;
  }
}
// 將年月轉成 YYYYMM 字串
export const invoiceDate = invoiceYear.toString() + invoiceMonth.toString().padStart(2, '0');

interface REP_TaxNo_list {
  No: string,
  Lable: string,
  STO_Status: string, // 使否為使用中
}

// 形成媒體申報檔
@Component({
  selector: 'app-fin14040',
  templateUrl: './fin14040.component.html',
  styleUrl: './fin14040.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    CommonModule,
    DropdownComponent,
    TableComponent,
    TranslateModule,
    YearMonthComponent
  ]
})
export class FIN14040Component extends BasicQueryPageComponent<unknown> implements OnInit {
  queryForm = this.formBuilder.group({
    Mid: [this.authService.getUserInfo()?.mid ?? null, [Validators.required]], // section抓
    STO_No: [this.authService.getUserInfo()?.SYS_StoreNo ?? null, [Validators.required]], // section抓
    INV_DeclareYM: [invoiceDate, Validators.required], //申報年月
    Tax_No: [null, Validators.required], //稅籍編號

    // ...createPaginationConfig([{ field: 'REP_GUIYM', order: 1 }]), // 分頁和排序參數
  });

  totalRecords = 0; // 總記錄數
  data: Record<string, string>[] = [];
  selectedItems: Record<string, string> = {}; // 用於儲存選中的項目

  pdfUrl: import('@angular/platform-browser').SafeResourceUrl | null = null; //pdf的url

  REP_TaxNo_Options: REP_TaxNo_list[] = []; //稅籍編號 選項

  columns: Column[] = [
    { field: 'field', header: '欄位' }, // 欄位定義
  ];
  constructor(
    private fin14040Service: Fin14040Service
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('FIN14040', '/FIN/FIN14040cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }
  loadOptions() {
    //取得 稅籍編號 下拉
    this.fin14040Service.queryTDS1003_STO_TaxNo_DropDownList(
      {
        "mid": this.queryForm.get("Mid")?.value,
        "STO_No": this.queryForm.get("STO_No")?.value
      }).pipe(untilDestroyed(this)).subscribe({
        next: (response) => {
          const taxNos = response.Data?.TDS1003STO_TaxNos ?? [];
          this.REP_TaxNo_Options = taxNos.map((item: { STO_TaxNo: string; STO_TaxName: string; REP_BegGUIYM: string; REP_EndGUIYM: string; STO_Status: string }) => ({
            Label: item.STO_TaxNo + "/" + item.STO_TaxName,
            No: item.STO_TaxNo,
            STO_Status: item.STO_Status
          }));

          // 規格更新， 只使用STO_Status === '1' 的REP_TaxNo_Options
          this.REP_TaxNo_Options = this.REP_TaxNo_Options.filter(x => x.STO_Status === '1');
          console.log('稅籍編號 options', this.REP_TaxNo_Options);

          // 找出 STO_Status === '1' 的稅籍
          // const active = this.REP_TaxNo_Options.find(x => x.STO_Status === '1');

          // // 排序：使用中(1) 的排在未使用中(2) 前面，但保持其他順序
          // this.REP_TaxNo_Options.sort((a, b) => {
          //   if (a.STO_Status === '1' && b.STO_Status !== '1') return -1;
          //   if (a.STO_Status !== '1' && b.STO_Status === '1') return 1;
          //   return 0; // 都一樣就保持原順序
          // });

          // if (active) { //如果有使用中的設定為稅及編號預設值
          //   console.log('當期使用中的稅籍編號', active);
          //   this.queryForm.patchValue({
          //     Tax_No: active.No as any,
          //   });
          // } else {
          //   console.log('當期無使用中的稅籍編號', active);
          // }
        },
        error: (error) => {
          console.error('Error loading options:', error);
        }
      });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        Mid: Number(frm.value.Mid),
      }
      console.log('形成媒體申報檔request', body);

      this.fin14040Service.printFIN14040(body)
        .pipe(untilDestroyed(this)).subscribe({
          next: (response) => {
            if (response.Status === '0000') {
              console.log('形成媒體申報檔 response', response.Data);

              // 下載壓縮檔
              if (response.Data.ZipUrl) {
                window.open(environment.BaseUrl + response.Data.ZipUrl, '_blank');
                this.loading = false;
              }
            }
          },
          error: () => { this.loading = false; },
        });
    });
  }
}
