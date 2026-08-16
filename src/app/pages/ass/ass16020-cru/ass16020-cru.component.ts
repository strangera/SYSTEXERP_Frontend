import { formatDate, NgIf } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS16020Data, ASS16020ReportData, ASS16020ReportRequest, Ass16020Service, InsertASS16020Request, PrintASS16020Request, QueryDetailASS16020Detail, QueryDetailASS16020Request, UpdateASS16020Request } from '@service/api/ass/ass16020.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { NotificationService } from '@shared/components/notification-message/notification.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { validateDuplicate, validateMaxLength, validateMaxNumber } from '@shared/components/table-edit/validate-field.model';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { FileExportService } from '@shared/service/file-export.service';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-ass16020-cru',
    templateUrl: './ass16020-cru.component.html',
    standalone: true,
    imports: [
        NgIf,
        MenubarComponent,
        ButtonComponent,
        PanelModule,
        FormsModule,
        ReactiveFormsModule,
        InputTextComponent,
        TranslateModule,
        CalendarRangeComponent,
        DropdownComponent,
        TableEditComponent,
        TableReportComponent,
        ButtonModule,
    ]
})
export class ASS16020CRUComponent extends BasicCruPageComponent<ASS16020Data> implements OnInit {
    dataForm = this.formBuilder.nonNullable.group({
        WH_ID: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(60)]],   // 倉別
        INV_ID: [{ value: '', disabled: true }],    // 盤點單號
        SInventoryDate: [{ value: '', disabled: true }],   // 盤點日期(起)
        EInventoryDate: [{ value: '', disabled: true }],   // 盤點日期(迄)
        EMP_ORG_ID: ['', [Validators.required, Validators.maxLength(60)]],    // 初盤組織
        EMP_ID: ['', [Validators.required, Validators.maxLength(60)]],    // 初盤人員
        EMP_ORG_ID2: ['', [Validators.required, Validators.maxLength(60)]],   // 複盤組織
        EMP_ID2: ['', [Validators.required, Validators.maxLength(60)]],   // 複盤人員
        NOTES: [''],    // 說明
    });

    reportdataForm = this.formBuilder.nonNullable.group({
        INV_ID: [{ value: '', disabled: true }],    // 盤點單號
    });

    // 控制
    isEditMode = true; // 修改頁
    isReportMode = false; // 報表頁

    // // 控制搜尋頁、報表頁的顯示   
    // pageMode: PageMode = PageMode.Query;
    // PageMode = PageMode; // 給 html 用

    btnLoading = false;
    // 列印按鈕載入狀態
    exportPdfLoading = false;
    exportExcelLoading = false;

    totalRecords = 0;
    data: QueryDetailASS16020Detail[] = [];
    reportData: ASS16020ReportData[] = [];
    reportRequest: ASS16020ReportRequest = { INV_ID: '' };
    lastPrintQueryBody: PrintASS16020Request | null = null;

    subTotalData: any[] = [];
    groupRowsBy = 'ASSGroupKey'; // 分組欄位

    footerData: any[] = [];
    group_name = [{ group_name: '' }];
    selectedRows: QueryDetailASS16020Detail[] = [];
    deleteRows: QueryDetailASS16020Detail[] = [];
    columns: EditColumn[] = [
        { field: 'KEYIN_NO', header: '盤點序號', type: 'inputNumber', disabled: () => !this.isEditMode, validate: [validateDuplicate, validateMaxLength(100)] },
        { field: 'FINE_QTY', header: '盤點數量', type: 'inputNumber', disabled: () => this.isReadOnly(), maxLength: 8, validate: [validateMaxNumber(99999999)] },
        { field: 'B_CLASS_ID', header: '大分類編號', type: 'dropdown', disabled: () => true, maxLength: 8, validate: [validateMaxLength(100)] },
        { field: 'BClassName', header: '大分類名稱', type: 'input', disabled: () => true, validate: [validateMaxLength(100)] },
        { field: 'M_CLASS_ID', header: '中分類編號', type: 'dropdown', disabled: () => true, maxLength: 8, validate: [validateMaxLength(100)] },
        { field: 'MClassName', header: '中分類名稱', type: 'input', disabled: () => true, maxLength: 8, validate: [validateMaxLength(100)] },
        { field: 'S_CLASS_ID', header: '小分類編號', type: 'dropdown', disabled: () => true, validate: [validateMaxLength(100)] },
        { field: 'SClassName', header: '小分類名稱', type: 'input', disabled: () => true, maxLength: 8, validate: [validateMaxLength(100)] },
        { field: 'FASITEM_DISPLAY', header: '品項編號/名稱', type: 'input', disabled: () => true, validate: [validateMaxLength(100)] },
        { field: 'NOTES', header: '說明', type: 'autoComplete', disabled: () => this.isReadOnly(), validate: [validateMaxLength(100)] },
    ];

    reportColumns: ReportColumn[] = [
        { field: 'B_CLASS_ID', header: '大分類編號' },
        { field: 'BClassName', header: '大分類名稱' },
        { field: 'M_CLASS_ID', header: '中分類編號' },
        { field: 'MClassName', header: '中分類名稱' },
        { field: 'S_CLASS_ID', header: '小分類編號' },
        { field: 'SClassName', header: '小分類名稱' },
        { field: 'FASITEM_ID', header: '品項編號' },
        { field: 'GOODS_NAME', header: '品項名稱' },
        { field: 'QTY', header: '庫存數量', isSubTotal: true },
        { field: 'FINE_QTY', header: '盤點數量', isSubTotal: true },
        { field: 'DIFF_QTY', header: '差異數量', isSubTotal: true },
        { field: 'AVER_AMT', header: '平均單價', isSubTotal: true },
        { field: 'DIFF_AMT', header: '差異金額', isSubTotal: true },
    ]

    isReadOnly(): boolean {
        return this.crudstatus === CRUDStatus.Read;
    }

    constructor(
        private notificationService: NotificationService,
        private route: ActivatedRoute,
        private ass16020Service: Ass16020Service,
        private readonly fileExportService: FileExportService,
    ) {
        super();
    }

    ngOnInit(): void {
        this.initializePage('ASS16020', this.dataForm);
        console.log('讀取資料', this.dataForm);
        this.loadDropdownOptions();

        const mode = history.state.mode;

        // 監聽 組織 的變化，更新對應的 人員 選項
        this.dataForm.get('EMP_ORG_ID')?.valueChanges.subscribe(orgId => {
            this.dataForm.get('EMP_ID')?.setValue("");
            const filteredEmployees = this.filterEmployeesByOrg(orgId);
            this.EMP_ID.set(filteredEmployees);
        });
        this.dataForm.get('EMP_ORG_ID2')?.valueChanges.subscribe(orgId => {
            this.dataForm.get('EMP_ID2')?.setValue("");
            const filteredEmployees = this.filterEmployeesByOrg(orgId);
            this.EMP_ID2.set(filteredEmployees);
        });



        if (this.crudstatus === CRUDStatus.Create) {
            this.isEditMode = false; // 新增頁
            const request: QueryDetailASS16020Request = {
                INV_ID: this.dataForm.getRawValue().INV_ID,
            };
            this.ass16020Service.queryDetailASS16020(request)
                .subscribe(response => {
                    this.dataForm.patchValue({
                        WH_ID: response.Data.WH_ID,
                        INV_ID: response.Data.INV_ID,
                        SInventoryDate: formatDate(response.Data.INV_DATE, 'yyyy/MM/dd', 'en'),
                        EInventoryDate: formatDate(response.Data.INV_DATE, 'yyyy/MM/dd', 'en'),
                        EMP_ORG_ID: response.Data.EMP_ORG_ID,
                        EMP_ID: response.Data.EMP_ID,
                        // EMP_NAME: response.Data.EMP_NAME,
                        EMP_ORG_ID2: response.Data.EMP_ORG_ID2,
                        EMP_ID2: response.Data.EMP_ID2,
                        // EMP_NAME2: response.Data.EMP_NAME2,
                        NOTES: response.Data.NOTES
                    });
                    this.data = this.mapDetailsForDisplay(response.Data.Details);
                });
        }
        else if (this.crudstatus === CRUDStatus.Edit) {
            this.isEditMode = true; // 修改頁

            const request: QueryDetailASS16020Request = {
                INV_ID: this.dataForm.getRawValue().INV_ID,
            };
            this.ass16020Service.queryDetailASS16020(request)
                .subscribe(response => {
                    this.dataForm.patchValue({
                        WH_ID: response.Data.WH_ID,
                        INV_ID: response.Data.INV_ID,
                        SInventoryDate: formatDate(response.Data.INV_DATE, 'yyyy/MM/dd', 'en'),
                        EInventoryDate: formatDate(response.Data.INV_DATE, 'yyyy/MM/dd', 'en'),
                        EMP_ORG_ID: response.Data.EMP_ORG_ID,
                        EMP_ID: response.Data.EMP_ID,
                        // EMP_NAME: response.Data.EMP_NAME,
                        EMP_ORG_ID2: response.Data.EMP_ORG_ID2,
                        EMP_ID2: response.Data.EMP_ID2,
                        // EMP_NAME2: response.Data.EMP_NAME2,
                        NOTES: response.Data.NOTES
                    });
                    this.data = this.mapDetailsForDisplay(response.Data.Details);
                });
        }
        else if (this.crudstatus === CRUDStatus.Read) {
            this.isEditMode = false;
            this.isReportMode = mode === 'report'; // 判斷是 檢視頁 還是 報表頁
            let request: QueryDetailASS16020Request = {
                INV_ID: this.dataForm.getRawValue().INV_ID,
            };

            if (this.isReportMode) {
                this.lastPrintQueryBody = history.state?.queryConditions;
                console.log('報表查詢條件', this.lastPrintQueryBody);

                this.reportdataForm.controls.INV_ID.setValue(this.lastPrintQueryBody?.INV_ID || '');
                request = { INV_ID: this.reportdataForm.getRawValue().INV_ID, };

                this.ass16020Service.queryPrintASS16020(this.lastPrintQueryBody as PrintASS16020Request)
                    .subscribe(response => {
                        if (response.Data.ErrCode !== 0) {
                            this.messageService.errorBubble(response.Data.ErrMsg || '查詢報表失敗');
                        }
                        else {
                            const mappedDetails = response.Data.Details.map(item => ({
                                ...item,
                                ASSGroupKey: [
                                    item.B_CLASS_ID?.trim(),
                                    item.M_CLASS_ID?.trim(),
                                    item.S_CLASS_ID?.trim(),
                                ].join('_')
                            }));

                            console.log('mappedDetails', mappedDetails);

                            this.subTotalData = mappedDetails.filter(item => item.RowType === 1);  // 取出小計資料
                            this.reportData = mappedDetails.filter(item => item.RowType === 0);  // 取出報表資料

                            this.group_name = [
                                { group_name: '盤盈項數' },
                                { group_name: '盤損項數' },
                                { group_name: '總差異金額' },
                                { group_name: '說明' },
                            ]

                            this.footerData = [
                                { group_name: '盤盈項數', DIFF_AMT: response.Data.SurplusCount },
                                { group_name: '盤損項數', DIFF_AMT: response.Data.LossCount },
                                { group_name: '總差異金額', DIFF_AMT: response.Data.TotalDiffAmt },
                                { group_name: '說明', DIFF_AMT: response.Data.NOTES ?? '' },
                            ];
                            // 總筆數
                            this.totalRecords = this.reportData.length;
                        }

                    });
            }
            else {
                this.ass16020Service.queryDetailASS16020(request)
                    .subscribe(response => {
                        this.dataForm.patchValue({
                            WH_ID: response.Data.WH_ID,
                            INV_ID: response.Data.INV_ID,
                            SInventoryDate: formatDate(response.Data.INV_DATE, 'yyyy/MM/dd', 'en'),
                            EInventoryDate: formatDate(response.Data.INV_DATE, 'yyyy/MM/dd', 'en'),
                            EMP_ORG_ID: response.Data.EMP_ORG_ID,
                            EMP_ID: response.Data.EMP_ID,
                            // EMP_NAME: response.Data.EMP_NAME,
                            EMP_ORG_ID2: response.Data.EMP_ORG_ID2,
                            EMP_ID2: response.Data.EMP_ID2,
                            // EMP_NAME2: response.Data.EMP_NAME2,
                            NOTES: response.Data.NOTES
                        });
                        this.data = this.mapDetailsForDisplay(response.Data.Details);
                    });
            }


        }
        else {
            this.isEditMode = false;
            this.isReportMode = false;
        }

    }

    EMP_ID = signal<{ label: string; value: string }[]>([]);
    EMP_ID2 = signal<{ label: string; value: string }[]>([]);
    EMP_ORG_ID = signal<{ label: string; value: string }[]>([]);
    EMP_ORG_ID2 = signal<{ label: string; value: string }[]>([]);

    allUsers: any[] = [];
    empOptions: { label: string; value: string }[] = [];

    onSubmit(form: FormGroup) {
        console.log('onSubmit', form.value);

        const formValue = form.getRawValue();
        if (this.crudstatus === CRUDStatus.Create) {
            // 新增頁
            const insertRequest: InsertASS16020Request = {
                INV_ID: formValue.INV_ID || '',
                EMP_ID: formValue.EMP_ID || '',
                EMP_ID2: formValue.EMP_ID2 || '',
                NOTES: formValue.NOTES || '',
                Details: this.data.map(item => ({
                    KEYIN_NO: item.KEYIN_NO,
                    FINE_QTY:
                        item.FINE_QTY === null || item.FINE_QTY === undefined
                            ? 0
                            : Number(String(item.FINE_QTY).replace(/,/g, '')),
                    NOTES: item.NOTES,
                })),
                UPD_USR_No: this.getUserInfoFromLocal().user_No,
                UPD_USR_Name: this.getUserInfoFromLocal().user_Name,
            }
            console.log('新增 insertRequest', insertRequest);
            this.ass16020Service.insertASS16020(insertRequest)
                .pipe(untilDestroyed(this), finalize(() => this.loading = false))
                .subscribe(response => {
                    if (response.Data.ErrCode !== 0) {
                        this.messageService.errorBubble(response.Data.ErrMsg || '新增失敗');
                    }
                    else {
                        this.messageService.successBubble(response.Data.ErrMsg || '新增成功');
                    }
                    this.onCancel();  // 返回查詢頁
                    // this.dataForm.reset(); // 重置表單
                });
        }
        else if (this.crudstatus === CRUDStatus.Edit) {
            // 修改頁
            const updateRequest: UpdateASS16020Request = {
                INV_ID: formValue.INV_ID || '',
                EMP_ID: formValue.EMP_ID || '',
                EMP_ID2: formValue.EMP_ID2 || '',
                NOTES: formValue.NOTES || '',
                Details: this.data.map(item => ({
                    KEYIN_NO: item.KEYIN_NO,
                    FINE_QTY:
                        item.FINE_QTY === null || item.FINE_QTY === undefined
                            ? 0
                            : Number(String(item.FINE_QTY).replace(/,/g, '')),
                    NOTES: item.NOTES,
                })),
                UPD_USR_No: this.getUserInfoFromLocal().user_No,
                UPD_USR_Name: this.getUserInfoFromLocal().user_Name,
            }
            this.ass16020Service.updateASS16020(updateRequest)
                .pipe(untilDestroyed(this), finalize(() => this.loading = false))
                .subscribe(response => {
                    if (response.Data.ErrCode !== 0) {
                        this.messageService.errorBubble(response.Data.ErrMsg || '修改失敗');
                    }
                    else {
                        this.messageService.successBubble(response.Data.ErrMsg || '修改成功');
                    }
                    this.onCancel();  // 返回查詢頁
                })
        }

    }

    CloseLoading = false;
    onClosed() {
        this.CloseLoading = true;
        this.ass16020Service.updateCloseASS16020({
            INV_ID: String(this.dataForm.getRawValue().INV_ID),
            CLOSE_EMP_ID: this.getUserInfoFromLocal().user_No,
            UPD_USR_No: this.getUserInfoFromLocal().user_No,
            UPD_USR_Name: this.getUserInfoFromLocal().user_Name
        }).pipe(
            untilDestroyed(this), finalize(() => this.CloseLoading = false)
        ).subscribe(response => {
            if (response.Data.ErrCode !== 0) {
                this.messageService.errorBubble(response.Data.ErrMsg || '結案失敗');
            }
            else {
                this.messageService.successBubble(response.Data.ErrMsg || '結案成功');
            }
            this.onCancel();  // 返回查詢頁
        });

    }

    resetTable() {
        this.data = [];
        this.selectedRows = [];
    }

    // 刪除資料的方法
    onDelete(rows: QueryDetailASS16020Detail[]) {
        // 將畫面資料中刪除這些 row
        this.data = this.data.filter(item => !rows.includes(item));
        // 將有 KEYIN_NO 的項目（表示是資料庫已存在的）加進 deleteRows，避免重複
        rows.filter(item => item.KEYIN_NO !== undefined && !this.deleteRows.some(d => d.KEYIN_NO === item.KEYIN_NO)).forEach(item => this.deleteRows.push(item));
        // 清空選取列
        this.selectedRows = [];
    }

    onExportPDF(): void {
        if (!this.reportData || this.reportData.length === 0) {
            return;
        }

        const printRequest: PrintASS16020Request = {
            INV_ID: this.lastPrintQueryBody?.INV_ID || '',
            REPORT_TYPE: this.lastPrintQueryBody?.REPORT_TYPE || ''
        }

        const req$ = this.ass16020Service.exportPDFASS16020(printRequest);
        this.fileExportService
            .executeFileExport(req$, '.pdf', v => (this.exportPdfLoading = v))
            .subscribe();
    }

    onExportExcel(): void {
        if (!this.reportData || this.reportData.length === 0) {
            return;
        }

        const printRequest: PrintASS16020Request = {
            INV_ID: this.lastPrintQueryBody?.INV_ID || '',
            REPORT_TYPE: this.lastPrintQueryBody?.REPORT_TYPE || ''
        }

        const req$ = this.ass16020Service.exportExcelASS16020(printRequest);
        this.fileExportService
            .executeFileExport(req$, '.excel', v => (this.exportExcelLoading = v))
            .subscribe();
    }


    // 組合「品項編號/名稱」顯示欄位，比照報表格式
    private mapDetailsForDisplay(details: QueryDetailASS16020Detail[]): QueryDetailASS16020Detail[] {
        return details.map(item => ({
            ...item,
            FASITEM_DISPLAY: `${item.FASITEM_ID} / ${item.GOODS_NAME}`,
        }));
    }

    // 篩選員工的方法，根據選擇的組織 ID 來過濾員工列表
    private filterEmployeesByOrg(orgId: string | null): { label: string; value: string }[] {
        if (!orgId) {
            this.empOptions = [];
            return this.empOptions;
        }

        // 根據 orgId 過濾員工列表，並轉換成下拉選單需要的格式
        this.empOptions = this.allUsers
            .filter(user => user.Org_ID === orgId)
            .map(user => ({
                label: `${user.user_No} - ${user.user_Name}`,
                value: user.user_No,
            }));
        return this.empOptions;

    }

    /**
     * 載入下拉選單選項
     */
    private loadDropdownOptions(): void {
        // 組織
        this.ass16020Service.querySYS3100_DropDownList().subscribe({
            next: res => {
                if (res.Status !== '0000') return;
                const options = res.Data.map(item => ({
                    label: `${item.No} - ${item.Name}`,
                    value: item.No,
                }));
                this.EMP_ORG_ID.set(options);
                this.EMP_ORG_ID2.set(options);
            },
        });

        // 盤點人員
        this.ass16020Service.queryTBLUSER_Orgid_DropDownList().subscribe({
            next: res => {
                if (res.Status !== '0000') return;
                this.allUsers = res.Data; // 儲存完整員工資料以供篩選使用
            },
        });
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

}
