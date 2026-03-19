import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin51010Service, QueryFIN51010DetailLine, QueryFIN51010Response, UpdateFIN51010Request } from '@service/api/fin/fin51010.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { formatAmount } from '@shared/componentkit/table-report/table-report.model';
import { PanelModule } from 'primeng/panel';
import { finalize, shareReplay } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-fin51010-cru',
  templateUrl: './fin51010-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule,
    InputTextComponent, ButtonComponent, TranslateModule,
    TableEditComponent, NgIf, CalendarComponent, DropdownComponent
  ],
})
export class FIN51010CRUComponent extends BasicCruPageComponent<QueryFIN51010Response> implements OnInit {
  dataForm = this.formBuilder.group({
    VouNo: [{ value: null as string | null, disabled: true }],      // 傳票編號
    Voucher_Name: [{ value: null as string | null, disabled: true }], // 傳票名稱 (種類名稱)
    SrcSheetType: [{ value: null as string | null, disabled: true }], // 傳票型態 (代碼)
    VouDate: [{ value: null as string | null, disabled: true }],      // 傳票日期
    Remark: [null as string | null],                // 傳票摘要 (可編輯)
    SettleNo: [{ value: null as string | null, disabled: true }],     // 結帳單號
    Trans_Status: [{ value: null as string | null, disabled: true }], // 狀態
    CRT_USR_No: [{ value: null as string | null, disabled: true }],   // 建立者
    CRT_Date: [{ value: null as string | null, disabled: true }],     // 建立日
    UPD_USR_No: [{ value: null as string | null, disabled: true }],   // 修改者
    UPD_Date: [{ value: null as string | null, disabled: true }],     // 修改日
  });
  data: QueryFIN51010DetailLine[] = [];
  columns: EditColumn[] = [
    { field: 'SerNo', header: '序號', width: '60px', textAlign: 'left' },
    {
      field: 'AccNo', header: '科目代號', width: '120px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true,
      options: () => this.ledgerOptions$, // 使用科目代號 API
      optionLabel: 'value',                        // 顯示選中的代碼
      optionValue: 'value',                        // 綁定的值
      templateLabel: 'label',                      // 下拉清單顯示 "代碼 - 名稱"
      showClear: false,
      onChange: (value: any, rowData: any) => {
        if (value) {
          this.dropdown.queryGls1005_ledgerMD().subscribe(options => {
            const selected = options?.find(opt => opt.value === value);
            if (selected) {
              rowData.AccCName = selected['Name'];
              rowData._dataStatus = 'modified';
            }
          });
        } else {
          rowData.AccCName = null;
        }
      }
    },
    { field: 'AccCName', header: '科目名稱', width: '180px', textAlign: 'left' },
    { field: 'NoteDesc', header: '摘要', type: 'input', textAlign: 'left' },
    { field: 'Debit_Amt', header: '借方金額', width: '120px', format: formatAmount, textAlign: 'right', aggregate: 'sum' },
    { field: 'Credit_Amt', header: '貸方金額', width: '120px', format: formatAmount, textAlign: 'right', aggregate: 'sum' },
    {
      field: 'ORG_ID', header: '組織代號', width: '120px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true,
      options: () => this.sys3100Options$,
      optionLabel: 'No',       // 對應您 Option 介面的 label (No - Name)
      optionValue: 'value',       // 對應您 Option 介面的 value (No)
      templateLabel: 'label',
      showClear: false,
      onChange: (value: any, rowData: any) => {
        if (value) {
          this.dropdown.querySys3100().subscribe(options => {
            const selected = options?.find(opt => opt.value === value);
            if (selected) {
              rowData.Org_Name = selected['Name'];
              rowData._dataStatus = 'modified';
            }
          });
        } else {
          rowData.Org_Name = null;
        }
      }
    },
    { field: 'Org_Name', header: '組織名稱', width: '120px', textAlign: 'left' },
    { field: 'ProjectNo', header: '活動代號', width: '120px', textAlign: 'left' },
    { field: 'PTA', header: '立沖代號', width: '120px', textAlign: 'left' },
    { field: 'DetailNo', header: '廠商編號', width: '120px', textAlign: 'left' },
    { field: 'SubDetailNo', header: '對象別編號', width: '120px', textAlign: 'left' },
  ];
  PostFlagOptions = getSYS1000Options('PostFlag');
  Trans_StatusOptions = getSYS1000Options('Trans_Status');
  private ledgerOptions$ = this.dropdown.queryGls1005_ledgerMD().pipe(shareReplay(1));
  private sys3100Options$ = this.dropdown.querySys3100().pipe(shareReplay(1));
  initTable = false;
  constructor(
    private readonly fin51010Service: Fin51010Service,
    private readonly dropdown: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initData();
  }
  initData() {
    this.initTable = false;
    this.initializePage('FIN51010', this.dataForm);
    this.formTitle = '傳票資料'
    if (this.rowdata?.id) {
      this.loading = true;
      this.fin51010Service.queryFIN51010Detail({ GLS6001_ID: this.rowdata?.id }).pipe(
        finalize(() => (this.loading = false)),
        untilDestroyed(this)
      ).subscribe((res) => {
        if (res.Data && res.Data.length > 0) {
          const mainData = res.Data[0];
          this.dataForm.patchValue(mainData);

          // 處理明細資料，移除特定欄位的空白
          this.data = (mainData.LineList || []).map((line: any) => ({
            ...line,
            // 使用 trim() 移除空白，並確保欄位有值才處理
            AccNo: line.AccNo?.trim(),
            ORG_ID: line.ORG_ID?.trim(), // 如果組織代號也有同樣問題，可以一併處理
          }));
          this.initTable = true;
        }
      });
    }
  }
  onSubmit(frm: FormGroup) {
    const mainId = this.rowdata?.id;
    if (mainId) {
      this.messageService.confirm({
        header: '確定修改嗎?',
        accept: () => {
          this.handleSubmit(frm, () => {
            const modifiedDetails = this.data.filter((d: any) => d._dataStatus === 'modified').map((d: any) => ({
              GLS6002_ID: d.id,
              AccNo: d.AccNo,
              NoteDesc: d.NoteDesc,
              ORG_ID: d.ORG_ID
            }));
            const body: UpdateFIN51010Request = {
              GLS6001_ID: mainId,
              Remark: frm.value.Remark,
              DetailList: modifiedDetails
            };
            this.fin51010Service.updateFIN51010(body).pipe(untilDestroyed(this)).subscribe(res => {
              this.messageService.successBubble(res.Message || '修改成功');
              this.onCancel();
            });
          });
        }
      })
    }
  }

  onClear() {
    this.initData();
  }
}
