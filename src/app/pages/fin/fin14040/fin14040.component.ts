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
import { environment } from 'src/environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';

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
              console.log('形成媒體申報檔response', JSON.stringify(response.Data));

              // 指定要抓的三個欄位
              const fileKeys = ['T02Url', 'TETUrl.tet', 'TXTUrl.txt'];

              fileKeys.forEach(key => {
                const url = response.Data[key];
                if (url) {
                  // window.open(environment.BaseUrl + url, '_blank');
                  // const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = key; // 指定下載的檔名
                  document.body.appendChild(a);
                  a.click();

                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);

                  // const finalUrl = url.startsWith('http') ? url
                  //   : `${environment.BaseUrl}${url}`;

                  // this.http.get(finalUrl, {
                  //   responseType: 'blob',
                  //   observe: 'response'
                  // }).subscribe((response: HttpResponse<Blob>) => {
                  //   console.log(response);
                  //   const blob = response.body;
                  //   if (!blob) return;

                  //   // 嘗試從後端 header 取得檔名
                  //   const contentDisposition = response.headers.get('content-disposition');
                  //   let filename = 'download';
                  //   if (contentDisposition) {
                  //     const match = /filename="?(.+?)"?($|;)/.exec(contentDisposition);
                  //     if (match && match[1]) {
                  //       filename = match[1];
                  //     }
                  //   } else {
                  //     // 從 URL 取得檔名
                  //     filename = finalUrl.split('/').pop() || 'download';
                  //   }

                  //   // 建立下載連結並觸發
                  //   const link = document.createElement('a');
                  //   const objectUrl = URL.createObjectURL(blob);
                  //   link.href = objectUrl;
                  //   link.download = filename; // 指定下載檔名
                  //   link.click();

                  //   // 釋放 URL
                  //   URL.revokeObjectURL(objectUrl);
                  // });
                }
              });

            }
          },
          error: () => { this.loading = false; },
        });
    });
  }
}
