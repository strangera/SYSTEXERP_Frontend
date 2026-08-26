import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { formatDate } from '@pages/tls/tls12040-v2/utils';
import { fin72040Data } from '@service/api/fin/fin72040.service';
import { formatAmount } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { TableComponent } from '../../../others/component/table/table.component';
import { Column } from '../../../others/component/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { Fin72030Service } from '@service/api/fin/fin72030.service';
import { Fin72040Service } from './../../../service/api/fin/fin72040.service';

@Component({
  selector: 'app-fin72040',
  templateUrl: './fin72040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    ButtonModule,
    AccordionModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    TableComponent,
    TranslateModule]
})
export class FIN72040Component extends BasicQueryPageComponent<fin72040Data> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    // 檔案說明:
    //  POS2064M 收支主檔(I/O)
    //  POS2064 收支明細檔(I/O)
    //  tblUser 使用者資料檔(O)
    SYS_StoreNo: [this.authService.currentUserValue?.SYS_StoreNo || null, [Validators.required]], // 公司編號/店號(必填)
    PCS_RqstNo: [null, [Validators.required]], // TC+YYYYMMDDXXXX, 必填
    // PCS_RqstNo: ['TC202508180001', [Validators.required]],

    //分頁查詢
    // ...createPaginationConfig([{ field: 'PCS_RqstNo', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  PCS_RqstNo_Options: {
    PCS_RqstNo: string, // 請款單號
    PCS_RqstDate: Date, // 請款日期
    Keep_UsrNo: string // 保管人員編號
  }[] = [];

  data: fin72040Data[] = [];
  sumData: fin72040Data | null = null;
  columns: Column[] = [
    // { field: 'RowType', header: '列類型', visible: false },
    // { field: 'IDX', header: '主檔唯一識別碼', visible: true },
    // { field: 'SeqNo', header: '顯示項次', visible: true },
    { field: 'RqstNo', header: '支出請款單號', visible: true },
    { field: 'VoucherNo', header: '傳票號碼', visible: true },
    { field: 'TotAmt', header: '申請金額', visible: true, format: formatAmount },
    { field: 'PCS_Date', header: '零用金申請日期', visible: true, format: formatDate },
    { field: 'PCS_UsrNo', header: '申請人員工編號', visible: true },
    { field: 'PCS_UsrName', header: '申請人姓名', visible: true },
  ];

  selectedItems: fin72040Data[] = [];// 多選項目

  // ----------------------------------------------------------------
  constructor(
    private readonly fin72040Service: Fin72040Service,
    private readonly fin72030Service: Fin72030Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN72040', 'FIN/FIN72040cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();

    //確認 支出請款單號是否變動，如果變動就清空查詢結果，避免撥補錯誤的單號 (撥補需要PCS_RqstNo)
    this.queryForm.get('PCS_RqstNo')?.valueChanges.subscribe(() => {
      this.data = [];
      this.selectedItems = [];
      this.sumData = null;
      this.totalRecords = 0;
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // console.log('撥補request:', JSON.stringify(frm.value, null, 2));  // test: TC202508180001
      this.loading = false;
      this.fin72040Service.queryFIN72040(frm.value).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.data = response.Data.Detail || [];
            this.sumData = response.Data.Total;
            // console.log('Result', response);
            this.totalRecords = response.TotalCount;
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

  // 撥補
  btnLoading = false;
  onBtnToss() {
    if (!this.selectedItems) {
      this.messageService.errorBubble('未選擇撥補資料');
      return;
    }

    const iDXList = this.selectedItems.map(item => item.IDX).join(',');
    const payload = {
      IDXList: iDXList, // 勾選撥補的主檔 ID 清單，以逗號分隔 (必填) 例如: "123,124,125"
      PCS_RqstNo: this.queryForm.get('PCS_RqstNo')?.value,
    };

    console.log('撥補清單', payload); // test: TC202508180001

    this.btnLoading = true;
    this.fin72040Service.reimFIN72040(payload).subscribe({
      next: (response) => {
        this.btnLoading = false;
        if (response.Status === '0000') {
          this.messageService.successBubble(response.Message);
          // console.log('撥補成功',response.Message)
          this.selectedItems = [];
          this.onSubmit(this.queryForm);
        } else {
          this.messageService.errorBubble(response.Message);
          console.log('撥補失敗', response.Message)
        }
        this.messageService.unblockUi();
      },
      error: (err: string) => {
        console.error('API error:', err);
        this.btnLoading = false;
        this.messageService.unblockUi();
      },
    });
  }

  loadOptions() {
    // 支出請款單號 下拉：撥補只撈已拋轉(狀態3)、尚未撥補的單，共用 FIN72030 下拉端點
    this.fin72030Service.getFIN72030RqstNoDropDownList(['3']).pipe(untilDestroyed(this)).subscribe((response) => {
      const list = Array.isArray(response.Data) ? response.Data : [];
      this.PCS_RqstNo_Options = list.map((item) => {
        return {
          PCS_RqstNo: item.PCS_RqstNo,
          PCS_RqstDate: item.PCS_RqstDate as unknown as Date,
          Keep_UsrNo: item.Keep_UsrNo,
        };
      });
    });
  }
}
