import { NgIf } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import {
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import {
    ClaimFIN72020ExecuteRequest,
    ClaimFIN72020QueryResponse,
    FIN72020Service
} from '@service/api/fin/fin72020.service';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';

import { finalize } from 'rxjs';

import { TableComponent } from '../../../others/component/table/table.component';
import {
    Column,
    formatDate
} from '../../../others/component/table/table.model';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { monthOptions } from '../fin11200/fin11200.model';

@Component({
    selector: 'app-fin72020-cru',
    templateUrl: './fin72020-cru.component.html',
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

        // 保管人選擇 Dialog
        DialogModule,
        TableModule,
        InputTextModule,
        InputGroupModule,
        ButtonModule,
    ],
})

// reference: 11200
export class FIN72020CRUComponent
    extends BasicCruPageComponent<FIN72020Service>
    implements OnInit {

    dataForm = this.formBuilder.group({
        DateFrom: [null, [Validators.required]], // 零用金申請日期（起）
        DateTo: [null, [Validators.required]], // 零用金申請日期（迄）

        Keep_OrgID: [null as string | null, [Validators.required]], // 保管單位
        Keep_UsrNo: [null as string | null, [Validators.required]], // 保管人代碼
        Keep_UsrName: [''], // 保管人名稱
        Keep_UsrDisplay: [''], // 保管人畫面顯示
    });

    /**
     * 保管人 Dialog 查詢條件
     */
    userQueryForm = this.formBuilder.group({
        user_No: [''],
        user_Name: [''],
        Org_ID: [''],
        Org_Name: ['']
    });

    monthOptions = monthOptions;

    minDate?: Date;

    /**
     * 零用金單據 Dialog
     */
    dialogVisible = false;

    /**
     * 保管人 Dialog
     */
    userDialogVisible = false;

    /**
     * Dialog 目前選到的使用者
     */
    selectedUser: any = null;

    /**
     * 保管人完整資料
     */
    allKeeperUserResultData = signal<{
        user_No: string;
        user_Name: string;
        Org_ID: string;
        Org_Name: string;
    }[]>([]);

    /**
     * 保管人 Dialog 目前顯示資料
     */
    userResultData = signal<{
        user_No: string;
        user_Name: string;
        Org_ID: string;
        Org_Name: string;
    }[]>([]);

    /**
     * 保管單位下拉選單
     *
     * 注意：
     * 這裡不再一開始載入全部 SYS3100，
     * 而是選擇保管人之後，
     * 依該保管人取得可保管單位。
     */
    KeepOrgID_Options = signal<{
        label: string;
        value: string;
    }[]>([]);

    data: ClaimFIN72020QueryResponse[] = [];

    selectedData: ClaimFIN72020QueryResponse[] = [];

    public readonly totalDialogRecords = signal<number>(0);

    columns: Column[] = [
        {
            field: 'PCS_No',
            header: '零用金單號',
            visible: true
        },
        {
            field: 'PCS_Date',
            header: '申請日期',
            visible: true,
            format: formatDate
        },
        {
            field: 'PCS_TotAmt',
            header: '申請金額',
            visible: true
        },
        {
            field: 'PCS_UsrDisplay',
            header: '申請人',
            visible: true
        },
        {
            field: 'PCS_OrgDisplay',
            header: '組織代號',
            visible: true
        },
        {
            field: 'Keep_UsrDisplay',
            header: '零用金保管人',
            visible: true
        },
        {
            field: 'PCS_StatusName',
            header: '狀態',
            visible: true
        },
    ];

    constructor(
        public fin72020Service: FIN72020Service,
    ) {
        super();
    }

    ngOnInit(): void {

        this.initializePage(
            'FIN72020',
            this.dataForm
        );

        if (this.isFormCreateable) {
            this.minDate = this.setMinDate();
        }

        /**
         * 載入保管人清單
         */
        this.loadKeeperUsers();
    }

    setMinDate(): Date | undefined {

        if (this.isFormCreateable) {

            const today = new Date();

            const currentMonth = today.getMonth();

            if ((currentMonth + 1) % 2 !== 0) {

                return new Date(
                    today.getFullYear(),
                    currentMonth,
                    1
                );

            } else {

                return new Date(
                    today.getFullYear(),
                    currentMonth - 1,
                    1
                );
            }
        }

        return undefined;
    }

    /**
     * 查詢可請款單據
     */
    onSubmit(frm: FormGroup) {

        this.handleSubmit(frm, () => {

            this.fin72020Service
                .claimFIN72020Query(frm.value)
                .pipe(
                    untilDestroyed(this),
                    finalize(() => this.loading = false)
                )
                .subscribe(response => {

                    this.dialogData = response.Data;

                    this.totalDialogRecords.set(
                        response.TotalCount
                    );

                    this.dialogVisible = true;

                    console.log(
                        '查詢結果',
                        response.Data
                    );
                });
        });
    }

    /**
     * 執行請款
     */
    onClaim() {

        if (this.selectedData.length === 0) {

            this.messageService.errorBubble(
                '請選擇至少一筆資料進行請款'
            );

            return;
        }

        const req: ClaimFIN72020ExecuteRequest = {

            Keep_UsrNo:
                this.dataForm.controls.Keep_UsrNo.value!,

            PCS_NoList:
                this.data
                    .map(item => item.PCS_No)
                    .join(','),

            RqstUsrNo:
                this.getUserInfoFromLocal().user_No,

            RqstUsrName:
                this.getUserInfoFromLocal().user_Name,
        };

        console.log(
            '請款請求參數',
            req
        );

        this.fin72020Service
            .claimFIN72020Execute(req)
            .pipe(
                untilDestroyed(this),
                finalize(() => this.loading = false)
            )
            .subscribe(response => {

                if (response.Status !== '0000') {

                    this.messageService.errorBubble(
                        response.Data.ErrMsg || '修改失敗'
                    );

                } else {

                    this.messageService.successBubble(
                        response.Data.ErrMsg || '修改成功'
                    );
                }

                this.onCancel();
            });
    }

    // ============================================================
    // 零用金申請單據 Dialog
    // ============================================================

    dialogData: ClaimFIN72020QueryResponse[] = [];

    selectedItemsDialog: ClaimFIN72020QueryResponse[] = [];

    isRowSelectable(
        event: ClaimFIN72020QueryResponse
    ): boolean {

        return !this.data ||
            !this.data.some(
                (item: ClaimFIN72020QueryResponse) =>
                    item.PCS_No === event.PCS_No
            );
    }

    saveDialog() {

        this.dialogVisible = false;

        this.data = [
            ...this.data,
            ...this.selectedItemsDialog
        ];

        this.selectedItemsDialog = [];
    }

    onDelete(
        selectedRows: ClaimFIN72020QueryResponse[]
    ) {

        this.data = this.data.filter(
            row => !selectedRows.includes(row)
        );

        this.selectedData = [];
    }

    resetTable() {

        this.data = [];

        this.selectedData = [];
    }

    // ============================================================
    // 保管人 Dialog
    // ============================================================

    /**
     * 開啟保管人選擇 Dialog
     */
    openUserDialog(): void {

        this.userDialogVisible = true;

        this.userQueryForm.reset({
            user_No: '',
            user_Name: '',
            Org_ID: '',
            Org_Name: ''
        });

        /**
         * 開啟時顯示全部保管人
         */
        this.userResultData.set(
            this.allKeeperUserResultData()
        );

        this.selectedUser = null;
    }

    /**
     * 查詢保管人
     *
     * 完全參考 FIN72020：
     * 從 allKeeperUserResultData 做前端模糊查詢
     */
    queryUserData(): void {

        const raw =
            this.userQueryForm.getRawValue();

        const userNo =
            (raw.user_No ?? '')
                .trim()
                .toLowerCase();

        const userName =
            (raw.user_Name ?? '')
                .trim()
                .toLowerCase();

        const orgId =
            (raw.Org_ID ?? '')
                .trim()
                .toLowerCase();

        const orgName =
            (raw.Org_Name ?? '')
                .trim()
                .toLowerCase();

        const sourceData =
            this.allKeeperUserResultData();

        const filteredData =
            sourceData.filter(item => {

                return (
                    (
                        !userNo ||
                        item.user_No
                            .toLowerCase()
                            .includes(userNo)
                    )
                    &&
                    (
                        !userName ||
                        item.user_Name
                            .toLowerCase()
                            .includes(userName)
                    )
                    &&
                    (
                        !orgId ||
                        item.Org_ID
                            .toLowerCase()
                            .includes(orgId)
                    )
                    &&
                    (
                        !orgName ||
                        item.Org_Name
                            .toLowerCase()
                            .includes(orgName)
                    )
                );
            });

        this.userResultData.set(
            filteredData
        );

        this.selectedUser = null;
    }

    /**
     * 清除保管人 Dialog 查詢條件
     */
    clearUserQuery(): void {

        this.userQueryForm.reset({
            user_No: '',
            user_Name: '',
            Org_ID: '',
            Org_Name: ''
        });

        this.userResultData.set(
            this.allKeeperUserResultData()
        );

        this.selectedUser = null;
    }

    /**
     * 選擇保管人
     *
     * 完全參考 FIN72020：
     *
     * 1. 帶入 Keep_UsrNo
     * 2. 帶入 Keep_UsrName
     * 3. 帶入 Keep_UsrDisplay
     * 4. 依保管人重新取得可選的保管單位
     */
    onSelectUser(row: any): void {

        console.log(
            '選到的保管人',
            row
        );

        if (!row) {
            return;
        }

        this.dataForm.patchValue({

            Keep_UsrNo:
                row.user_No ?? null,

            Keep_UsrName:
                row.user_Name ?? '',

            Keep_UsrDisplay:
                `${row.user_No ?? ''} - ${row.user_Name ?? ''}`
        });

        /**
         * 選擇保管人後，
         * 依保管人重新取得保管單位。
         *
         * selectedOrgId 傳入目前該使用者的 Org_ID，
         * 讓 API 回來後優先選擇它。
         */
        this.loadKeepingUnitByUser(
            row.user_No,
            row.Org_ID
        );

        this.userDialogVisible = false;

        this.selectedUser = row;
    }

    /**
     * 清除保管人
     *
     * 同 FIN72020：
     * 保管人與保管單位一起清空
     */
    clearKeepUser(): void {

        this.dataForm.patchValue({
            Keep_UsrNo: null,
            Keep_UsrName: '',
            Keep_UsrDisplay: '',
            Keep_OrgID: null
        });

        this.KeepOrgID_Options.set([]);

        this.selectedUser = null;
    }

    // ============================================================
    // 保管人 / 保管單位資料
    // ============================================================

    /**
     * 載入所有零用金保管人
     *
     * 完全使用 FIN72020 原本 API：
     * queryTBLUSER_PCS_DropDownList()
     */
    private loadKeeperUsers(): void {

        this.fin72020Service
            .queryTBLUSER_PCS_DropDownList()
            .pipe(
                untilDestroyed(this)
            )
            .subscribe({

                next: res => {

                    if (res.Status !== '0000') {
                        return;
                    }

                    const options =
                        res.Data.map(item => ({

                            user_No:
                                item.user_No ?? '',

                            user_Name:
                                item.user_Name ?? '',

                            Org_ID:
                                item.Org_ID ?? '',

                            Org_Name:
                                item.Org_Name ?? '',
                        }));

                    this.allKeeperUserResultData.set(
                        options
                    );

                    this.userResultData.set(
                        options
                    );
                },

                error: err => {

                    console.error(
                        '載入零用金保管人失敗：',
                        err
                    );

                    this.allKeeperUserResultData.set([]);

                    this.userResultData.set([]);
                }
            });
    }

    /**
     * 依保管人取得可選保管單位
     *
     * 這段直接照 FIN72020 的設計。
     */
    private loadKeepingUnitByUser(
        userNo: string,
        selectedOrgId?: string
    ): void {

        if (!userNo) {

            this.KeepOrgID_Options.set([]);

            this.dataForm.patchValue({
                Keep_OrgID: null
            });

            return;
        }

        this.fin72020Service
            .queryTBLUSER_PCS_DropDownList(userNo)
            .pipe(
                untilDestroyed(this)
            )
            .subscribe({

                next: res => {

                    if (res.Status !== '0000') {
                        return;
                    }

                    const options =
                        res.Data.map(item => ({

                            label:
                                `${item.Org_ID ?? ''} - ${item.Org_Name ?? ''}`,

                            value:
                                item.Org_ID ?? '',
                        }));

                    this.KeepOrgID_Options.set(
                        options
                    );

                    /**
                     * 優先帶入選擇保管人時的 Org_ID。
                     *
                     * 如果選擇的 Org_ID 不在該使用者
                     * 可選的保管單位裡，
                     * 才改帶第一筆。
                     */
                    const defaultOrg =
                        options.some(
                            item =>
                                item.value === selectedOrgId
                        )
                            ? selectedOrgId
                            : options.length > 0
                                ? options[0].value
                                : null;

                    this.dataForm.patchValue({
                        Keep_OrgID:
                            defaultOrg ?? null
                    });
                },

                error: err => {

                    console.error(
                        '載入保管單位失敗：',
                        err
                    );

                    this.KeepOrgID_Options.set([]);

                    this.dataForm.patchValue({
                        Keep_OrgID: null
                    });
                }
            });
    }

    // ============================================================
    // LocalStorage
    // ============================================================

    /**
     * 解析 localStorage.UserInfo
     *
     * 回傳：
     * {
     *   mid,
     *   SYS_StoreNo,
     *   user_No,
     *   user_Name
     * }
     */
    private getUserInfoFromLocal(): { mid: number; SYS_StoreNo: string; user_No: string; user_Name: string; } {

        let mid = 0;
        let SYS_StoreNo = '';
        let user_No = '';
        let user_Name = '';

        try {

            const raw =
                localStorage.getItem('UserInfo');

            if (raw) {

                const obj = JSON.parse(raw);
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
}