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
    // REP_TaxNo: [null, Validators.required], //稅籍編號

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
      }
      console.log('形成媒體申報檔request', body);

      this.fin14040Service.printFIN14040(body)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (response) => {
            if (response.Status === '0000') {
            console.log('形成媒體申報檔 response', response.Data);

            // // T02 檔
            // if (response.Data.T02Url) {
            //   let url = response.Data.T02Url;
            //   if (url.startsWith('/')) url = environment.ApiUrl + url;

            //   this.http.get(url, { responseType: 'blob' }).subscribe(blob => {
            //     this.downloadBlob(blob, '申報檔.T02');
            //   });
            // }

            // // TET 檔
            // if (response.Data.TETUrl) {
            //   const url = response.Data.TETUrl;
            //   // ⚠️ 不要硬加 baseUrl，因為它已經是完整網址
            //   this.http.get(url, { responseType: 'blob' }).subscribe(blob => {
            //     this.downloadBlob(blob, '申報檔.tet');
            //   });
            // }

            // // TXT 檔
            // if (response.Data.TXTUrl) {
            //   const url = response.Data.TXTUrl;
            //   // if (url.startsWith('/')) url = environment.ApiUrl + url;

            //   this.http.get(url, { responseType: 'blob' }).subscribe(blob => {
            //     this.downloadBlob(blob, '申報檔.txt');
            //   });
            // }

        const fileMap: { key: string; name: string }[] = [
          { key: 'T02Url', name: '申報檔.T02' },
          { key: 'TETUrl', name: '申報檔.tet' },
          { key: 'TXTUrl', name: '申報檔.txt' },
        ];

        fileMap.forEach(f => {
          const url = response.Data[f.key];
          if (url) {
            // 這裡要用 HttpClient 再去抓檔案內容
            this.http.get(url, { responseType: 'blob' }).subscribe(blob => {
              const a = document.createElement('a');
              const objectUrl = window.URL.createObjectURL(blob);

              a.href = objectUrl;
              a.download = f.name;
              document.body.appendChild(a);
              a.click();

              // 清理資源
              document.body.removeChild(a);
              window.URL.revokeObjectURL(objectUrl);
            });
          }
        });
      }
          },
          error: () => { this.loading = false; },
        });
    });
  }

  // 抽成共用方法，避免重複
  private downloadBlob(blob: Blob, filename: string) {
    const a = document.createElement('a');
    const objectUrl = window.URL.createObjectURL(blob);

    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(objectUrl);
  }
}
