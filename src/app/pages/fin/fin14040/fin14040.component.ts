import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, convertDateToYYYYMM } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { apiOption } from '@shared/models/sys/sysb000.model';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { Fin14040Service } from '@service/api/fin/fin14040.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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
    TranslateModule
  ]
})
export class FIN14040Component extends BasicQueryPageComponent<unknown> implements OnInit {
  queryForm = this.formBuilder.group({
    Mid: [this.authService.getUserInfo()?.mid ?? null, [Validators.required]], // section抓
    STO_No: [this.authService.getUserInfo()?.SYS_StoreNo ?? null, [Validators.required]], // section抓
    INV_DeclareYM: [null, Validators.required], //申報年月
    Tax_No: [null, Validators.required], //稅籍編號

    // ...createPaginationConfig([{ field: 'REP_GUIYM', order: 1 }]), // 分頁和排序參數
  });

  totalRecords = 0; // 總記錄數
  data: Record<string, string>[] = [];
  selectedItems: Record<string, string> = {}; // 用於儲存選中的項目

  pdfUrl: import('@angular/platform-browser').SafeResourceUrl | null = null; //pdf的url

  REP_TaxNo_Options: apiOption[] = []; //稅籍編號 選項

  columns: Column[] = [
    { field: 'field', header: '欄位' }, // 欄位定義
  ];
  constructor(
    private fin14040Service: Fin14040Service,
    private http: HttpClient,
    private sanitizer: DomSanitizer
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
      }).subscribe({
        next: (response) => {
          const taxNos = response.Data?.TDS1003STO_TaxNos ?? [];
          this.REP_TaxNo_Options = taxNos.map((item: { STO_TaxNo: string; STO_TaxName: string }) => ({
            Label: item.STO_TaxNo + "/" + item.STO_TaxName,
            No: item.STO_TaxNo
          }));
          console.log('稅籍編號 options', this.REP_TaxNo_Options);
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
        INV_DeclareYM: convertDateToYYYYMM(frm.value.INV_DeclareYM),

        // "Mid": 0,
        // "STO_No": "10",
        // "INV_DeclareYM": "202506",
        // "Tax_No": "703902225"
      }
      console.log('形成媒體申報檔request', body);

      // TDS1001沒資料所以txt都是空的

      this.fin14040Service.printFIN14040(body)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (response) => {
            if (response.Status === '0000') {
            console.log('形成媒體申報檔 response', response.Data);

            // 下載壓縮檔
            if (response.Data.ZipUrl) {
              window.open(environment.BaseUrl + response.Data.ZipUrl, '_blank');
            }

            // const files = [
            //   { key: 'T02Url', name: '申報檔.t02' },
            //   { key: 'TETUrl', name: '申報檔.tet' },
            //   { key: 'TXTUrl', name: '申報檔.txt' }
            // ];

            // files.forEach(f => {
            //   const url = response.Data[f.key];
            //   if (url) {
            //     this.http.get(environment.BaseUrl + url, { responseType: 'blob' }).subscribe({
            //       next: (blob) => {
            //         const a = document.createElement('a');
            //         const objectUrl = window.URL.createObjectURL(blob);
            //         a.href = objectUrl;
            //         a.download = f.name;
            //         document.body.appendChild(a);
            //         a.click();
            //         document.body.removeChild(a);
            //         window.URL.revokeObjectURL(objectUrl);
            //       },
            //       error: (err) => {
            //         console.error(`下載失敗: ${f.name}`, err);
            //       }
            //     });
            //   }
            // });
            }
          },
          error: () => { this.loading = false; },
        });
    });
  }
}
