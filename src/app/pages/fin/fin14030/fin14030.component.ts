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
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CommonModule, JsonPipe } from '@angular/common';
import { Fin14030Service } from '@service/api/fin/fin14030.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { environment } from 'src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';

//1.1.4.3 形成申報書
@Component({
  selector: 'app-fin14030',
  templateUrl: './fin14030.component.html',
  styleUrl: './fin14030.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    Button, // dialog
    JsonPipe, // dialog
    DialogModule, // dialog
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    CommonModule,
    DropdownComponent,
    TableComponent,
    TranslateModule]
})
export class FIN14030Component extends BasicQueryPageComponent<unknown> implements OnInit {
  queryForm = this.formBuilder.group({
    Mid: [this.authService.getUserInfo()?.mid ?? null, [Validators.required]], // section抓
    STO_No: [this.authService.getUserInfo()?.SYS_StoreNo ?? null, [Validators.required]], // section抓
    REP_GUIYM: [null, Validators.required], //申報年月
    REP_TaxNo: [null, Validators.required], //稅籍編號

    // ...createPaginationConfig([{ field: 'REP_GUIYM', order: 1 }]), // 分頁和排序參數
  });

  // ---彈出視窗控制選項---
  showDialog = false;        // 控制 dialog 開關
  dialogData: any = {};      // 用來存放送出後的 form 值
  auditMode: '審核' | '反審核' = '審核'; // 標題用，可根據需求切換

  totalRecords = 0; // 總記錄數
  data: Record<string, string>[] = [];
  selectedItems: Record<string, string> = {}; // 用於儲存選中的項目

  pdfUrl: import('@angular/platform-browser').SafeResourceUrl | null = null;

  REP_TaxNo_Options: apiOption[] = []; //稅籍編號 選項

  columns: Column[] = [
    { field: 'field', header: '欄位' }, // 欄位定義
  ];
  constructor(
    private fin14030Service: Fin14030Service,
    private sanitizer: DomSanitizer
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('FIN14030', '/FIN/FIN14030cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }
  loadOptions() {
    //取得 稅籍編號 下拉
    this.fin14030Service.queryTDS1003_STO_TaxNo_DropDownList(
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
        REP_GUIYM: convertDateToYYYYMM(frm.value.REP_GUIYM),
      }
      // 可以用 202406 , 703902231 測試

      console.log('申報request', body);

      // 輸入申報年月和稅籍編號條件，按【申報書預覽】，即可預覽該申報年月的申報書，同時顯示「審核」
      // 視窗，可以執行「審核」與「反審核」的功能。

      // 這裡彈窗顯示
      this.dialogData = body;
      this.auditMode = '審核';   // 或者根據狀態切換 '反審核'
      this.showDialog = true;

      this.fin14030Service.printFIN14030(body).pipe(untilDestroyed(this)).subscribe({
        next: (response) => {
          if (response.Status === '0000' && response.Data?.printURL) {
            // 補上 API 主機網址 (假設後端回傳的是相對路徑)
            const rawUrl = response.Data.printURL.startsWith('http')
              ? response.Data.printURL
              : `${environment.BaseUrl}${response.Data.printURL}`;

            // 直接在新分頁打開
            // window.open(rawUrl, '_blank');

            // ⬇️ 用 sanitizer 包裝
            this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
            this.loading = false;
          }
        },
        error: () => { this.loading = false; },
      });
    });
  }

  // 確認審核
  confirmCheck(frm: FormGroup) {
    this.confirmationService.confirm({
      message: `是否執行審核?`,
      header: `確認審核`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // 按【審核】鈕後，系統詢問【是否執行審核?】，按【是】，更新審核日期=系統日期、
        // 審核人員=操作人員、設定狀態=已審核，並同時寫入操作記錄檔，執行審核後資料則不

        const body = {
          ...frm.value,
          Mid: Number(frm.value.Mid),
          REP_GUIYM: convertDateToYYYYMM(frm.value.REP_GUIYM),
          REP_AuditStatus: '1' // 0=未審核, 1=已審核
        }
        // 可以用 202406 , 703902231 測試

        console.log('審核request', body);

        this.fin14030Service.ApproveFIN14030(body).pipe(untilDestroyed(this)).subscribe({
          next: (response) => {
            if (response.Data.IsApproveSuccess) {
              this.messageService.successBubble('審核成功');
            } else {
              this.messageService.errorBubble(response.Data.MsgApprove);
              this.showDialog = false;
            }
          },
          error: (error) => {
            this.messageService.errorBubble('審核失敗，請稍後再試');
            console.error('審核錯誤:', error);
            this.showDialog = false;
          }
        });
      }
    });
    this.showDialog = false;
    this.loading = false;
  }

  //確認反審核
  cancelRecheck(frm: FormGroup) {
    this.confirmationService.confirm({
      message: `是否確認反審核?`,
      header: `確認反審核`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // 按【反審核】鈕，系統詢問【是否執行反審核?】，按【是】，清除該筆設定的審核日
        // 期、審核人員、更新設定狀態=未審核，並同時寫入操作記錄檔。

        const body = {
          ...frm.value,
          Mid: Number(frm.value.Mid),
          REP_GUIYM: convertDateToYYYYMM(frm.value.REP_GUIYM),
          REP_AuditStatus: '0' // 0=未審核, 1=已審核
        }
        // 可以用 202406 , 703902231 測試

        console.log('反審核request', body);

        this.fin14030Service.ApproveFIN14030(body).pipe(untilDestroyed(this)).subscribe({
          next: (response) => {
            if (response.Data.IsApproveSuccess) {
              this.messageService.successBubble('反審核成功');
            } else {
              this.messageService.errorBubble(response.Data.MsgApprove);
            }
          },
          error: (error) => {
            this.messageService.errorBubble('反審核失敗，請稍後再試');
            console.error('審核錯誤:', error);
          }
        });
      }
    });
    this.showDialog = false;
    this.loading = false;
  }
}