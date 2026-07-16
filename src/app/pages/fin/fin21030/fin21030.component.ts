
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatDate } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { Fin21030Service } from 'src/app/service/api/fin/fin21030.service';
import { DropDownListService, IDropdownItem } from 'src/app/service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';

//1.2.1.3 廠客資料維護
@Component({
  selector: 'app-fin21030',
  templateUrl: './fin21030.component.html',
  standalone: true,
  imports: [MenubarComponent, DropdownComponent,
    AccordionModule, FormsModule, ReactiveFormsModule,
    InputTextComponent, MultiSelectComponent, ButtonComponent, TranslateModule, TableReportComponent]
})

export class FIN21030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    VEN_No: ['', [Validators.maxLength(14)]],                              // 廠商編號
    VEN_Name: ['', [Validators.maxLength(100)]],       // 廠商名稱 (後端有這個)
    VEN_ShortName: ['', [Validators.maxLength(20)]],                       // 廠商簡稱
    VEN_Post: ['', [Validators.maxLength(5)]],                            // 郵遞區號
    VEN_Address: ['', [Validators.maxLength(100)]],                         // 郵寄地址
    VEN_Boss: ['', [Validators.maxLength(20)]],                            // 聯絡人
    VEN_Tel: ['', [Validators.maxLength(20)]],                             // 電話
    VEN_Fax: ['', [Validators.maxLength(20)]],                             // 傳真
    VEN_Uniform: [''],                         // 統一編號
    VEN_RemitFeeMode: [[]],                    // 郵電負擔模式
    VEN_DiscYN: [[]],                          // 貼現廠商 (單一字串)
    VEN_CTRLYN: [[]],                          // 禁止背書轉讓 (單一字串)
    VEN_PayType: [[]],                         // 付款方式 (單一字串)
    VEN_BNK_No: ['', [Validators.maxLength(5)]],                          // 廠商匯款銀行代號
    VEN_BankAccountNo: ['', [Validators.maxLength(50)]],                   // 廠商銀行帳號
    VEN_AccountName: ['', [Validators.maxLength(80)]],                     // 廠商帳戶名稱
    VEN_PayConditionDay: [''],                  // 付款期限
    VEN_CheckTitle: [''],                      // 票據抬頭
    VEN_Status: [[]],                          // 審核狀態 (dropdown)
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'VEN_No', order: 1 }]],
  });

  VEN_FLAG_MAP: Record<string, string> = {
    '1': '廠商統一編號',
    '2': '個人身分證字號',
    '3': '自編編號',
  };

  VEN_REMIT_FEE_MODE_MAP: Record<string, string> = {
    '0': '廠商負擔',
    '1': '公司負擔',
  };
  VEN_PAY_TYPE_MAP: Record<string, string> = {
    '1': '電匯',
    '2': '開票',
    '3': '現金',
  };
  VEN_STATUS_MAP: Record<string, string> = {
    '0': '未審核',
    '1': '已審核',
  };
  VEN_YN_MAP: Record<string, string> = {
    'Y': '是',
    'N': '否',
  };

  VEN_UniformOptions: IDropdownItem[] = [];
  data: any[] = [];
  totalRecords = 0;
  lastQueryBody: any;
  // ----------------------------------------------------------------
  venderOptions: any[] = [];
  remitFeeOptions = [
    { value: '0', label: '廠商負擔' },
    { value: '1', label: '公司負擔' }
  ];
  // ====== Table / Options ======
  approvalOptions: { label: string; value: string }[] = [
    { label: '未審核', value: '0' },
    { label: '已審核', value: '1' },
  ];

  VEN_DiscYNOptions: { label: string; value: string }[] = [
    { label: '是', value: 'Y' },
    { label: '否', value: 'N' },

  ];
  VEN_CTRLYNOptions: { label: string; value: string }[] = [
    { label: '是', value: 'Y' },
    { label: '否', value: 'N' }
  ];
  VEN_PayTypeOptions: { label: string; value: string }[] = [
    { label: '電匯', value: '1' },
    { label: '開票', value: '2' },
    { label: '現金', value: '3' }
  ];
  columns: any[] = [
    { field: 'VEN_No', header: '廠客代號', visible: true },
    { field: 'VEN_Name', header: '廠客名稱', visible: true, width: '100px' },
    { field: 'VEN_ShortName', header: '廠商簡稱', visible: true },
    { field: 'VEN_EngName', header: '廠商英文簡稱', visible: true },
    { field: 'VEN_Flag', header: '欄位內容', visible: true },
    { field: 'VEN_Uniform', header: '廠商統一編號/身份證字號', visible: true },
    { field: 'VEN_RemitFeeMode', header: '郵電費負擔', visible: true },
    { field: 'VEN_Post', header: '郵遞區號', visible: true },
    { field: 'VEN_Address', header: '郵寄地址', visible: true, width: '150px' },
    { field: 'VEN_Tel', header: '電話', visible: true },
    { field: 'VEN_Fax', header: '傳真', visible: true },
    { field: 'VEN_Email', header: '廠商電子郵件', visible: true },
    { field: 'VEN_GUIAddr', header: '廠商發票地址', visible: true, width: '150px' },
    { field: 'VEN_GUIEmail', header: '廠商發票電子郵件', visible: true },
    { field: 'VEN_PayType', header: '付款方式', visible: true },
    { field: 'VEN_BNK_No', header: '匯款銀行代碼', visible: true },
    { field: 'VEN_BNK_BranchNo', header: '匯款銀行分行代碼', visible: true },
    { field: 'VEN_BankAccountNo', header: '匯款帳號', visible: true },
    { field: 'VEN_AccountName', header: '匯款帳戶名稱', visible: true, width: '100px' },
    { field: 'VEN_PayConditionDay', header: '付款期限(天數)', visible: true },
    { field: 'VEN_CheckTitle', header: '票據抬頭', visible: true },
    { field: 'VEN_Status', header: '審核狀態', visible: true },
    { field: 'Approved_Date', header: '審核日期', visible: true, format: formatDate },
    { field: 'VEN_DiscYN', header: '貼現廠商', visible: true },
    { field: 'VEN_CTRLYN', header: '禁止背書轉讓', visible: true },
    { field: 'VEN_DiscDateB', header: '貼現起日', visible: true, format: formatDate, width: '70px' },
    { field: 'VEN_DiscDateE', header: '貼現迄日', visible: true, format: formatDate, width: '70px' },
    { field: 'GUI_ID_WIRE', header: '匯款統一編號', visible: true },
    { field: 'VEN_Remark', header: '備註', visible: true, width: '150px' },
    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDate, width: '70px' },
    { field: 'CRT_USR_No', header: '建立人員', visible: true },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: true },
    { field: 'UPD_Date', header: '變更日期', visible: true, format: formatDate, width: '70px' },
    { field: 'UPD_USR_No', header: '變更人員', visible: true },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: true },
  ];
  private formatDate(date: string | Date | null): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  constructor(
    private dropDownListService: DropDownListService,
    public fin21030Service: Fin21030Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN21030', 'fin/fin21030cru', this.queryForm, form => this.onSubmit(form));
    this.dropDownListService.queryPOS2013_DropDownList({}).subscribe(res => {
      this.venderOptions = (res.Data ?? []).map((item: any) => ({
        label: `${item.VEN_No} - ${item.Name}`,
        value: item.VEN_No,
      }));
    });
    this.dropDownListService.queryPOS2013_DropDownList().subscribe(res => {
      if (res?.Data) {
        const uniqueMap = new Map<string, any>();

        res.Data.forEach(item => {
          // 組合 No 和 Name 作為唯一鍵
          const key = `${item.No}-${item.Name}`;

          // 如果唯一鍵尚未存在,則將項目加入 uniqueMap
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, {
              value: item.No,
              label: `${item.No} - ${item.Name}`,
              No: item.No,
              Name: item.Name,
              VEN_No: item.VEN_No,
              ShortName: item.ShortName,
            });
          }
        });

        this.VEN_UniformOptions = Array.from(uniqueMap.values());
      }
    });


  }
  onSubmit(frm: FormGroup) {
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();
    const raw = frm.getRawValue();
    const payload: any = { ...raw };
    // 保持多選欄位為陣列送出；若為單一值則轉為陣列；若為空則移除該欄位
    const multiSelectFields = ['VEN_RemitFeeMode', 'VEN_DiscYN', 'VEN_CTRLYN', 'VEN_PayType', 'VEN_Status'];
    multiSelectFields.forEach(field => {
      const val = (raw as any)[field];
      if (Array.isArray(val)) {
        if (val.length) {
          payload[field] = val;
        } else {
          delete payload[field];
        }
      } else if (val === null || val === undefined || val === '') {
        delete payload[field];
      } else {
        payload[field] = [String(val)];
      }
    });
    if (raw.VEN_PayConditionDay !== null && raw.VEN_PayConditionDay !== undefined && raw.VEN_PayConditionDay !== '') {
      payload.VEN_PayConditionDay = Number(raw.VEN_PayConditionDay);
    } else {
      delete payload.VEN_PayConditionDay;
    }

    // 清理 VEN_Uniform：trim，若為空或全為 0 則移除該欄位
    if (payload.VEN_Uniform !== undefined && payload.VEN_Uniform !== null) {
      const u = String(payload.VEN_Uniform).trim();
      if (u === '' || /^0+$/.test(u)) {
        delete payload.VEN_Uniform;
      } else {
        payload.VEN_Uniform = u;
      }
    }

    this.fin21030Service.queryFIN21030(payload)
      .pipe(untilDestroyed(this), finalize(() => {
        this.loading = false;
      }))
      .subscribe(res => {
        this.data = res?.Data || [];
        this.totalRecords = res?.TotalCount || 0;
        this.lastQueryBody = payload;
        this.queryStateService.setQueryState(this.ProgNo, payload);
      });
  }
}

