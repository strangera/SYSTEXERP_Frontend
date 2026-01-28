import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin51010Service, QueryFIN51010DetailLine, QueryFIN51010Response, UpdateFIN51010Request } from '@service/api/fin/fin51010.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { formatAmount } from '@shared/componentkit/table-report/table-report.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
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
    { field: 'SerNo', header: '序號', width: '60px' },
    { field: 'AccNo', header: '科目代號', width: '120px' },
    { field: 'AccCName', header: '科目名稱', width: '180px' },
    { field: 'NoteDesc', header: '摘要', type: 'input' },
    { field: 'Debit_Amt', header: '借方金額', width: '120px', format: formatAmount, textAlign: 'right', aggregate: 'sum' },
    { field: 'Credit_Amt', header: '貸方金額', width: '120px', format: formatAmount, textAlign: 'right', aggregate: 'sum' },
    { field: 'ORG_ID', header: '組織代號', width: '120px' },
    { field: 'ProjectNo', header: '活動代號', width: '120px' },
    { field: 'PTA', header: '立沖代號', width: '120px' },
    { field: 'DetailNo', header: '廠商編號', width: '120px' },
    { field: 'SubDetailNo', header: '對象別編號', width: '120px' },
  ];
  PostFlagOptions = getSYS1000Options('PostFlag');
  Trans_StatusOptions = getSYS1000Options('Trans_Status');

  constructor(private readonly fin51010Service: Fin51010Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN51010', this.dataForm);
    this.formTitle = '傳票資料'
    if (this.rowdata?.id) {
      this.loading = true;
      this.fin51010Service.queryFIN51010Detail({ GLS6001_ID: this.rowdata?.id }).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        if (res.Data && res.Data.length > 0) {
          const mainData = res.Data[0];
          this.dataForm.patchValue(mainData);
          this.data = mainData.LineList || [];
        }
      });

    }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const mainId = this.rowdata?.id;
      if (mainId) {
        this.messageService.confirm({
          header: '確定修改嗎?',
          accept: () => {
            const modifiedDetails = this.data.filter((d: any) => d._dataStatus === 'modified').map((d: any) => ({
              GLS6002_ID: d.id,
              NoteDesc: d.NoteDesc
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
          }
        })
      }
    });
  }
}
