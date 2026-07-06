import { NgIf } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ClaimFIN72020ExecuteRequest, ClaimFIN72020QueryResponse, FIN72020Service } from '@service/api/fin/fin72020.service';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, formatDate } from '../../../shared/componentkit/table/table.model';
import { monthOptions } from '../fin11200/fin11200.model';

@Component({
    selector: 'app-fin72020-cru',
    templateUrl: './fin72020-cru.component.html',
    styleUrl: './fin72020-cru.component.scss',
    standalone: true,
    imports: [
        MenubarComponent,
        ButtonComponent,
        PanelModule,
        FormsModule,
        ReactiveFormsModule,
        TableComponent,
        NgIf,
        DialogComponent,
        TranslateModule,
        CalendarRangeComponent,
        TableReportComponent,
        DropdownComponent,
    ],
})

// reference: 11200
export class FIN72020CRUComponent extends BasicCruPageComponent<FIN72020Service> implements OnInit {
    dataForm = this.formBuilder.group({
        DateFrom: [null, [Validators.required]], // 零用金申請日期（起）
        DateTo: [null, [Validators.required]], // 零用金申請日期（迄）
        Keep_OrgID: [null, [Validators.required]], // 保管單位組織代碼
        Keep_UsrNo: [null, [Validators.required]], // 保管人代碼
    });
    monthOptions = monthOptions;
    minDate?: Date;
    dialogVisible = false;

    data: ClaimFIN72020QueryResponse[] = [];
    selectedData: ClaimFIN72020QueryResponse[] = [];
    public readonly totalDialogRecords = signal<number>(0); // Dialog 中的資料總筆數
    columns: Column[] = [
        { field: 'PCS_No', header: '零用金單號', visible: true },
        { field: 'PCS_Date', header: '申請日期', visible: true, format: formatDate },
        { field: 'PCS_TotAmt', header: '申請金額', visible: true },
        { field: 'PCS_UsrDisplay', header: '申請人', visible: true },
        { field: 'PCS_OrgDisplay', header: '組織代號', visible: true },
        { field: 'Keep_UsrDisplay', header: '零用金保管人', visible: true },
        { field: 'PCS_StatusName', header: '狀態', visible: true },
    ]

    KeepOrgID_Options = signal<{ label: string; value: string }[]>([]);
    KeepUsrNo_Options = signal<{ label: string; value: string }[]>([]);

    constructor(
        public fin72020Service: FIN72020Service,
    ) {
        super();
    }

    ngOnInit(): void {
        this.initializePage('FIN72020', this.dataForm);
        if (this.isFormCreateable) {
            this.minDate = this.setMinDate();
        }
        this.loadDropdownOptions();
    }
    setMinDate(): Date | undefined {
        if (this.isFormCreateable) {
            const today = new Date();
            const currentMonth = today.getMonth();
            if ((currentMonth + 1) % 2 !== 0) {
                return new Date(today.getFullYear(), currentMonth, 1);
            } else {
                return new Date(today.getFullYear(), currentMonth - 1, 1);
            }
        }
        return undefined;
    }

    onSubmit(frm: FormGroup) {
        this.handleSubmit(frm, () => {
            this.fin72020Service.claimFIN72020Query(frm.value)
                .pipe(untilDestroyed(this), finalize(() => this.loading = false))
                .subscribe(response => {
                    this.dialogData = response.Data;
                    this.totalDialogRecords.set(response.TotalCount);
                    this.dialogVisible = true;
                    console.log('查詢結果', response.Data);
                });
        });
    }

    onClaim() {
        if (this.selectedData.length === 0) {
            this.messageService.errorBubble('請選擇至少一筆資料進行請款');
            return;
        }
        const req: ClaimFIN72020ExecuteRequest = {
            Keep_UsrNo: this.dataForm.controls.Keep_UsrNo.value!,
            PCS_NoList: this.data.map(item => item.PCS_No).join(','),
            RqstUsrNo: this.getUserInfoFromLocal().user_No,
            RqstUsrName: this.getUserInfoFromLocal().user_Name,
        };
        console.log('請款請求參數', req);
        this.fin72020Service.claimFIN72020Execute(req)
            .pipe(untilDestroyed(this), finalize(() => this.loading = false))
            .subscribe(response => {
                if (response.Status !== '0000') {
                    this.messageService.errorBubble(response.Data.ErrMsg || '修改失敗');
                }
                else {
                    this.messageService.successBubble(response.Data.ErrMsg || '修改成功');
                }
                this.onCancel();  // 返回查詢頁
            });
    }

    dialogData: ClaimFIN72020QueryResponse[] = [];
    selectedItemsDialog: ClaimFIN72020QueryResponse[] = [];

    isRowSelectable(event: ClaimFIN72020QueryResponse): boolean {
        return !this.data || !this.data.some((item: ClaimFIN72020QueryResponse) => item.PCS_No === event.PCS_No);
    }

    saveDialog() {
        this.dialogVisible = false;
        this.data = [...this.data, ...this.selectedItemsDialog];
        this.selectedItemsDialog = [];
    }
    onDelete(selectedRows: ClaimFIN72020QueryResponse[]) {
        this.data = this.data.filter(row => !selectedRows.includes(row));
        this.selectedData = [];
    }
    resetTable() {
        this.data = [];
        this.selectedData = [];
    }


    /** 解析 localStorage.UserInfo，回傳 { mid, SYS_StoreNo, user_No, user_Name } */
    private getUserInfoFromLocal(): { mid: number; SYS_StoreNo: string; user_No: string; user_Name: string } {
        let mid = 0;
        let SYS_StoreNo = '';
        let user_No = '';
        let user_Name = '';

        try {
            const raw = localStorage.getItem('UserInfo');
            if (raw) {
                const obj = JSON.parse(raw);
                // 依你的截圖欄位：mid 與 SYS_StoreNo
                mid = Number(obj?.mid ?? 0);
                SYS_StoreNo = String(obj?.SYS_StoreNo ?? '');
                user_No = String(obj?.user_No ?? '');
                user_Name = String(obj?.user_Name ?? '');
            }
        } catch (e) {
            console.error('解析 localStorage.UserInfo 失敗：', e);
        }

        return { mid, SYS_StoreNo, user_No, user_Name };
    }

    /** 載入下拉選單選項 */
    private loadDropdownOptions(): void {
        // 保管人
        this.fin72020Service.queryTBLUSER_Orgid_DropDownList().subscribe({
            next: res => {
                if (res.Status !== '0000') return;
                const options = res.Data.map(item => ({
                    label: `${item.user_No ?? ''} - ${item.user_Name ?? ''}`,
                    value: item.user_No ?? '',
                }));

                this.KeepUsrNo_Options.set(options);
            },
        });

        // 保管單位
        this.fin72020Service.querySYS3100_DropDownList().subscribe({
            next: res => {
                if (res.Status !== '0000') return;
                const options = res.Data.map(item => ({
                    label: `${item.No} - ${item.Name}`,
                    value: item.No,
                }));
                this.KeepOrgID_Options.set(options);
            },
        });
    }
}
