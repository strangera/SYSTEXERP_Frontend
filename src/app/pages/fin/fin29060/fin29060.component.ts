import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { createPaginationConfig, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { FIN29060Data, FIN29060Service, QueryFIN29060DetailRequest, QueryFIN29060Request } from '../../../service/api/fin/fin29060.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { DropDownListService } from './../../../service/utility/dropDownList.service';
//1.2.9.6 廠商付款明細表
@Component({
  selector: 'app-fin29060',
  templateUrl: './fin29060.component.html',
  styleUrl: './fin29060.component.scss',
  standalone: true,
  imports: [DropdownRangeComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, InputTextComponent, RadiobuttonComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class FIN29060Component extends BasicQueryPageComponent<FIN29060Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    STO_No: [""],
    VEN_No_From: [""],
    VEN_No_To: [""],
    ODM_Date_From: [null],
    ODM_Date_To: [null],
    PayRefDate_From: [null],
    PayRefDate_To: [null],
    AccNo_From: [""],
    AccNo_To: [""],
    ACP_Desc: [""],
    ShowUnpaid: [true],
    ShowZeroBalance: [true],
    ...createPaginationConfig([{ field: 'ACP_No', order: 1 }]),
  });
  VendorNoOptions: { label: string; value: string }[] = []; // 廠客代號選項
  AccNoOptions: { label: string; value: string }[] = []; // 科目代號選項
  selectedItems: FIN29060Data[] = [];
  totalRecords = 0
  data: FIN29060Data[] = [];
  columns = [
    { field: 'ACP_No', header: '應付帳款編號', visible: true },
    { field: 'VendorNo', header: '廠商編號', visible: true },
    { field: 'VendorName', header: '廠商名稱', visible: true },
    { field: 'AccNo', header: '會計科目', visible: true },
    { field: 'PostDate', header: '立帳日期', visible: true, format: formatDate },
    { field: 'ACP_Amt', header: '立帳金額', visible: true, format: formatAmount },
    { field: 'Summary', header: '摘要', visible: true },
    { field: 'PayAmt', header: '付款金額', visible: true, format: formatAmount },
    { field: 'PayRefDate', header: '開票/匯款日期', visible: true, format: formatDate },
    { field: 'BalanceAmt', header: '帳款餘額', visible: true, format: formatAmount },
    { field: 'PaymentNo', header: '電匯/開票/單號', visible: true },
    { field: 'VoucherNo', header: '傳票號碼', visible: true }
  ];

  // ----------------------------------------------------------------
  showUpOptions = [
    { value: 1, label: '顯示' },
    { value: 2, label: '不顯示' },
  ];

  constructor(
    private dropDownListService: DropDownListService,
    private fin29060Service: FIN29060Service
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN29060', '/FIN/FIN29060CRU', this.queryForm, (frm) => this.onSubmit(frm));
    this.loadOptions();
  }
  private loadOptions(): void {
    // 廠客代號
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => this.VendorNoOptions = res.Data.map((x: { No: string; Name: string }) => ({ label: `${x.No} - ${x.Name}`, value: x.No })));
    // 科目代號
    this.dropDownListService.queryGLS1005_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => this.AccNoOptions = res.Data.map((x: { No: string; Name: string }) => ({ label: `${x.No} - ${x.Name}`, value: x.No })));

  }
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const formValue = frm.value;
      this.loading = true;

      const requestData: QueryFIN29060Request = {
        PageSize: formValue.PageSize || 10,
        PageIndex: formValue.PageIndex || 1,
        SortBy: formValue.SortBy || [{ field: 'ACP_No', order: 1 }],
        STO_No: formValue.STO_No || '',
        VEN_No_From: formValue.VEN_No_From || '',
        VEN_No_To: formValue.VEN_No_To || '',
        ODM_Date_From: formValue.ODM_Date_From ? new Date(formValue.ODM_Date_From).toISOString() : undefined,
        ODM_Date_To: formValue.ODM_Date_To ? new Date(formValue.ODM_Date_To).toISOString() : undefined,
        PayRefDate_From: formValue.PayRefDate_From ? new Date(formValue.PayRefDate_From).toISOString().split('T')[0] : undefined,
        PayRefDate_To: formValue.PayRefDate_To ? new Date(formValue.PayRefDate_To).toISOString().split('T')[0] : undefined,
        AccNo_From: formValue.AccNo_From || '',
        AccNo_To: formValue.AccNo_To || '',
        ACP_Desc: formValue.ACP_Desc || '',
        ShowUnpaid: formValue.ShowUnpaid === true,
        ShowZeroBalance: formValue.ShowZeroBalance === true
      };

      this.fin29060Service
        .queryFIN29060(requestData)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe({
          next: (response) => {
            if (response && response.Data) {
              this.data = response.Data;
              this.totalRecords = response.TotalCount || 0;
            } else {
              this.data = [];
              this.totalRecords = 0;
            }
          },

        });
    });
  }

  override onDetail(rowData: FIN29060Data): void {
    if (!rowData.VoucherNo) {
      this.messageService.warnBubble('傳票號碼不存在，無法查詢明細');
      return;
    }

    const detailRequest: QueryFIN29060DetailRequest = {
      VouNo: rowData.VoucherNo
    };

    this.loading = true;
    this.messageService.blockUi();

    this.fin29060Service
      .queryFIN29060Detail(detailRequest)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.loading = false;
          this.messageService.unblockUi();
        })
      )
      .subscribe({
        next: (response) => {
          // 處理 blob 回應 - 通常是下載檔案
          if (response.body) {
            const contentDisposition = response.headers.get('content-disposition');
            let filename = `FIN29060_明細_${rowData.VoucherNo}.pdf`;

            if (contentDisposition) {
              const filenameMatch = contentDisposition.match(/filename\*?=['"]?(?:UTF-\d['"])?([^;'"\r\n]+)['"]?;?/);
              if (filenameMatch) {
                filename = decodeURIComponent(filenameMatch[1]);
              }
            }

            const blob = new Blob([response.body], { type: response.headers.get('content-type') || 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            // 創建下載連結
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();

            // 清理
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            this.messageService.successBubble('明細報表已下載');
          }
        },

      });
  }
}
