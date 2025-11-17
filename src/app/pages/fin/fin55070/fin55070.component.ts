import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// Shared
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FIN55070Data, Fin55070Service } from '@service/api/fin/fin55070.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';

import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-fin55070',
  templateUrl: './fin55070.component.html',
  styleUrl: './fin55070.component.scss',
  standalone: true,
  imports: [ButtonModule,TableModule,CommonModule,MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, RadiobuttonComponent, DropdownComponent, CheckboxModule, ButtonComponent, TableComponent, TranslateModule]
})
export class FIN55070Component extends BasicQueryPageComponent<FIN55070Data> implements OnInit {
  historyRequestBody: any;
  ORG_IDOptions = this.dropdown.querySys3100();
  AccNo_Options=this.fin55070Service.getAccNoList();
  queryForm = this.formBuilder.nonNullable.group({
     DateFrom: [new Date(), [Validators.required]],
     DateTo: [new Date(), [Validators.required]],
     Ledger_MD: [null],
     OrgId: [],
     AccNoFrom: [],
     AccNoTo: [],
     ShowAll: [false],
     PrintSign: [false],
   });

  typeOptions: any[] = [
    { value: null, label: '全部' },
    { value: '0', label: '統制' },
    { value: '1', label: '明細' },
  ];
   display : any[] = [
      { value: true, label: '顯示' },
      { value: false, label: '不顯示' },

    ]



  // Table data
  data: any[] = [

  ];
  columns: any[] = [
   { field: 'AccNo', header: '科目代號', visible: true },
  { field: 'AccCname', header: '科目名稱', visible: true },
  { field: 'Prior_DAmt', header: '前期借方金額', visible: true },
  { field: 'Prior_CAmt', header: '前期貸方金額', visible: true },
  { field: 'Curr_DAmt', header: '本期借方金額', visible: true },
  { field: 'Curr_CAmt', header: '本期貸方金額', visible: true },
  { field: 'Total_DAmt', header: '累積借方金額', visible: true },
  { field: 'Total_CAmt', header: '累積貸方金額', visible: true }
  ];



  // TypeScript Options
  AccountcodeOptions: any[] = [];
  constructor(
    public readonly fin55070Service: Fin55070Service,
    private readonly dropdown: DropdownApiService

  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN55070', '/FIN/FIN55070', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
     this.handleSubmit(frm, () => {
          const body = {
            ...frm.value
          }
          this.fin55070Service.queryFIN55070(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
            this.data = response.Data
            if (response.Data.length > 0) {
          this.historyRequestBody = body;
        }
          });
        });
  }

  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }

     loadCarsLazy(event: any) {
       
    }
    
      onExportPDF() {
        if (!this.historyRequestBody) {
              this.messageService.warnBubble('請先執行查詢以產生報表。');
              return;
            }
            this.btnLoading = true;
            this.fin55070Service.exportFIN55070PDF(this.historyRequestBody).pipe(
              untilDestroyed(this),
              finalize(() => this.btnLoading = false)
            ).subscribe({
              next: (response: HttpResponse<Blob>) => {
                this.handleFileExport(response, '.pdf');
              },
            });
      }
      btnLoading = false;
      onExportXLSX() {
        if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.fin55070Service.exportFIN55070Excel(this.historyRequestBody).pipe(
      untilDestroyed(this),
      finalize(() => this.btnLoading = false)
    ).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.handleFileExport(response, '.xlsx');
      },
    });
      }

      getColumnSum(field: string): number {
  return this.data.reduce((sum, row) => sum + (Number(row[field]) || 0), 0);
}

isNumericColumn(field: string): boolean {
  return [
    'Prior_DAmt',
    'Prior_CAmt',
    'Curr_DAmt',
    'Curr_CAmt',
    'Total_DAmt',
    'Total_CAmt'
  ].includes(field);
}

 private handleFileExport(response: HttpResponse<Blob>, fileExtension: string): void {
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = this.getFilenameFromHeader(contentDisposition, fileExtension);
    const blob = response.body;

    if (blob && blob.size > 0) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService.warnBubble('沒有找到符合條件的資料，無法生成報表。');
    }
  }
  private getFilenameFromHeader(contentDisposition: string | null, defaultExtension: string): string {
    if (!contentDisposition) {
      return `download${defaultExtension}`;
    }

    const filenameStarMatch = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStarMatch && filenameStarMatch.length > 1) {
      const encodedFilename = filenameStarMatch[1];
      try {
        const decoded = decodeURIComponent(encodedFilename.replace(/^UTF-8''/, ''));
        return decoded;
      } catch (error) {
        console.error('Failed to decode filename*', error);
        return encodedFilename;
      }
    }

    const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition);
    if (filenameMatch && filenameMatch.length > 1) {
      try {
        return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
      } catch {
        return filenameMatch[1];
      }
    }

    return `download${defaultExtension}`;
  }


}
