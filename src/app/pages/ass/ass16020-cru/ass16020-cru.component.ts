import { formatDate, NgIf } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import {
    ASS16020Data,
    ASS16020ReportData,
    ASS16020ReportRequest,
    Ass16020Service,
    InsertASS16020Request,
    PrintASS16020Request,
    QueryDetailASS16020Detail,
    QueryDetailASS16020Request,
    UpdateASS16020Request
} from '@service/api/ass/ass16020.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { validateDuplicate, validateMaxLength, validateMaxNumber } from '@shared/components/table-edit/validate-field.model';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { FileExportService } from '@shared/service/file-export.service';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { finalize, forkJoin } from 'rxjs';

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

    btnLoading = false; // 列印按鈕載入狀態
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
    ];

    EMP_ID = signal<{ label: string; value: string }[]>([]);
    EMP_ID2 = signal<{ label: string; value: string }[]>([]);
    EMP_ORG_ID = signal<{ label: string; value: string }[]>([]);
    EMP_ORG_ID2 = signal<{ label: string; value: string }[]>([]);
    allUsers: any[] = [];

    isReadOnly(): boolean {
        return this.crudstatus === CRUDStatus.Read;
    }

    constructor(
        private readonly ass16020Service: Ass16020Service,
        private readonly fileExportService: FileExportService,
    ) {
        super();
    }

    ngOnInit(): void {
        this.initializePage('ASS16020', this.dataForm);
        const mode = history.state.mode;

        // 1. 監聽 組織 的變化（只有使用者在 UI 上手動選擇時才清空人員）
        this.dataForm.get('EMP_ORG_ID')?.valueChanges.subscribe(orgId => {
            if (this.dataForm.get('EMP_ORG_ID')?.dirty) {
                this.dataForm.get('EMP_ID')?.setValue('', { emitEvent: false });
            }
            this.EMP_ID.set(this.filterEmployeesByOrg(orgId));
        });

        this.dataForm.get('EMP_ORG_ID2')?.valueChanges.subscribe(orgId => {
            if (this.dataForm.get('EMP_ORG_ID2')?.dirty) {
                this.dataForm.get('EMP_ID2')?.setValue('', { emitEvent: false });
            }
            this.EMP_ID2.set(this.filterEmployeesByOrg(orgId));
        });

        // 2. 嚴格控管：先載入 Dropdown 選項，完備後再載入單據資料
        this.loadDropdownOptions(() => {
            this.loadDataByStatus(mode);
        });
    }

    /** 根據 CRUD Status 與 mode 載入單據資料 */
    private loadDataByStatus(mode: string): void {
        const isReport = mode === 'report';

        if (this.crudstatus === CRUDStatus.Read && isReport) {
            // 報表頁模式
            this.isEditMode = false;
            this.isReportMode = true;
            this.lastPrintQueryBody = history.state?.queryConditions;
            this.reportdataForm.controls.INV_ID.setValue(this.lastPrintQueryBody?.INV_ID || '');

            this.ass16020Service.queryPrintASS16020(this.lastPrintQueryBody as PrintASS16020Request)
                .pipe(untilDestroyed(this))
                .subscribe(response => {
                    if (response.Data.ErrCode !== 0) {
                        this.messageService.errorBubble(response.Data.ErrMsg || '查詢報表失敗');
                    } else {
                        const mappedDetails = response.Data.Details.map(item => ({
                            ...item,
                            ASSGroupKey: [
                                item.B_CLASS_ID?.trim(),
                                item.M_CLASS_ID?.trim(),
                                item.S_CLASS_ID?.trim(),
                            ].join('_')
                        }));
                        this.subTotalData = mappedDetails.filter(item => item.RowType === 1);
                        this.reportData = mappedDetails.filter(item => item.RowType === 0);
                        this.group_name = [
                            { group_name: '盤盈項數' },
                            { group_name: '盤損項數' },
                            { group_name: '總差異金額' },
                            { group_name: '說明' },
                        ];
                        this.footerData = [
                            { group_name: '盤盈項數', DIFF_AMT: response.Data.SurplusCount },
                            { group_name: '盤損項數', DIFF_AMT: response.Data.LossCount },
                            { group_name: '總差異金額', DIFF_AMT: response.Data.TotalDiffAmt },
                            { group_name: '說明', DIFF_AMT: response.Data.NOTES ?? '' },
                        ];
                        this.totalRecords = this.reportData.length;
                    }
                });
        } else {
            // 新增 / 編輯 / 檢視 模式
            this.isEditMode = this.crudstatus === CRUDStatus.Edit;
            this.isReportMode = false;

            const invId = this.dataForm.getRawValue().INV_ID || history.state?.rowdata?.INV_ID; const request: QueryDetailASS16020Request = { INV_ID: invId };

            this.ass16020Service.queryDetailASS16020(request)
                .pipe(untilDestroyed(this))
                .subscribe(response => {
                    const detailData = response.Data;
                    if (!detailData) return;

                    // 關鍵點 1: 先將該組織下的人員選單過濾出來塞入 Signal
                    if (detailData.EMP_ORG_ID) {
                        this.EMP_ID.set(this.filterEmployeesByOrg(detailData.EMP_ORG_ID));
                    }
                    if (detailData.EMP_ORG_ID2) {
                        this.EMP_ID2.set(this.filterEmployeesByOrg(detailData.EMP_ORG_ID2));
                    }

                    // 關鍵點 2: 使用 emitEvent: false 避免觸發 valueChanges，確保工號順利帶出
                    this.dataForm.patchValue({
                        WH_ID: detailData.WH_ID,
                        INV_ID: detailData.INV_ID,
                        SInventoryDate: detailData.INV_DATE ? formatDate(detailData.INV_DATE, 'yyyy/MM/dd', 'en') : '',
                        EInventoryDate: detailData.INV_DATE ? formatDate(detailData.INV_DATE, 'yyyy/MM/dd', 'en') : '',
                        EMP_ORG_ID: detailData.EMP_ORG_ID,
                        EMP_ID: detailData.EMP_ID,
                        EMP_ORG_ID2: detailData.EMP_ORG_ID2,
                        EMP_ID2: detailData.EMP_ID2,
                        NOTES: detailData.NOTES
                    }, { emitEvent: false });

                    this.data = this.mapDetailsForDisplay(detailData.Details || []);
                });
        }
    }

    onSubmit(form: FormGroup) {
        const formValue = form.getRawValue();
        if (this.crudstatus === CRUDStatus.Create) {
            const insertRequest: InsertASS16020Request = {
                INV_ID: formValue.INV_ID || '',
                EMP_ID: formValue.EMP_ID || '',
                EMP_ID2: formValue.EMP_ID2 || '',
                NOTES: formValue.NOTES || '',
                Details: this.data.map(item => ({
                    KEYIN_NO: item.KEYIN_NO,
                    FINE_QTY: item.FINE_QTY === null || item.FINE_QTY === undefined ? 0 : Number(String(item.FINE_QTY).replace(/,/g, '')),
                    NOTES: item.NOTES,
                })),
                UPD_USR_No: this.getUserInfoFromLocal().user_No,
                UPD_USR_Name: this.getUserInfoFromLocal().user_Name,
            };

            this.ass16020Service.insertASS16020(insertRequest)
                .pipe(untilDestroyed(this), finalize(() => this.loading = false))
                .subscribe(response => {
                    if (response.Data.ErrCode !== 0) {
                        this.messageService.errorBubble(response.Data.ErrMsg || '新增失敗');
                    } else {
                        this.messageService.successBubble(response.Data.ErrMsg || '新增成功');
                        this.onCancel();
                    }
                });
        } else if (this.crudstatus === CRUDStatus.Edit) {
            const updateRequest: UpdateASS16020Request = {
                INV_ID: formValue.INV_ID || '',
                EMP_ID: formValue.EMP_ID || '',
                EMP_ID2: formValue.EMP_ID2 || '',
                NOTES: formValue.NOTES || '',
                Details: this.data.map(item => ({
                    KEYIN_NO: item.KEYIN_NO,
                    FINE_QTY: item.FINE_QTY === null || item.FINE_QTY === undefined ? 0 : Number(String(item.FINE_QTY).replace(/,/g, '')),
                    NOTES: item.NOTES,
                })),
                UPD_USR_No: this.getUserInfoFromLocal().user_No,
                UPD_USR_Name: this.getUserInfoFromLocal().user_Name,
            };

            this.ass16020Service.updateASS16020(updateRequest)
                .pipe(untilDestroyed(this), finalize(() => this.loading = false))
                .subscribe(response => {
                    if (response.Data.ErrCode !== 0) {
                        this.messageService.errorBubble(response.Data.ErrMsg || '修改失敗');
                    } else {
                        this.messageService.successBubble(response.Data.ErrMsg || '修改成功');
                        this.onCancel();
                    }
                });
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
            untilDestroyed(this),
            finalize(() => this.CloseLoading = false)
        ).subscribe(response => {
            if (response.Data.ErrCode !== 0) {
                this.messageService.errorBubble(response.Data.ErrMsg || '結案失敗');
            } else {
                this.messageService.successBubble(response.Data.ErrMsg || '結案成功');
                this.onCancel();
            }
        });
    }

    resetTable() {
        this.data = [];
        this.selectedRows = [];
    }

    onDelete(rows: QueryDetailASS16020Detail[]) {
        this.data = this.data.filter(item => !rows.includes(item));
        rows.filter(item => item.KEYIN_NO !== undefined && !this.deleteRows.some(d => d.KEYIN_NO === item.KEYIN_NO))
            .forEach(item => this.deleteRows.push(item));
        this.selectedRows = [];
    }

    onExportPDF(): void {
        if (!this.reportData || this.reportData.length === 0) return;
        const printRequest: PrintASS16020Request = {
            INV_ID: this.lastPrintQueryBody?.INV_ID || '',
            REPORT_TYPE: this.lastPrintQueryBody?.REPORT_TYPE || ''
        };
        const req$ = this.ass16020Service.exportPDFASS16020(printRequest);
        this.fileExportService
            .executeFileExport(req$, '.pdf', v => (this.exportPdfLoading = v))
            .subscribe();
    }

    onExportExcel(): void {
        if (!this.reportData || this.reportData.length === 0) return;
        const printRequest: PrintASS16020Request = {
            INV_ID: this.lastPrintQueryBody?.INV_ID || '',
            REPORT_TYPE: this.lastPrintQueryBody?.REPORT_TYPE || ''
        };
        const req$ = this.ass16020Service.exportExcelASS16020(printRequest);
        this.fileExportService
            .executeFileExport(req$, '.excel', v => (this.exportExcelLoading = v))
            .subscribe();
    }

    private mapDetailsForDisplay(details: QueryDetailASS16020Detail[]): QueryDetailASS16020Detail[] {
        return details.map(item => ({
            ...item,
            FASITEM_DISPLAY: `${item.FASITEM_ID} / ${item.GOODS_NAME}`,
        }));
    }

    private filterEmployeesByOrg(orgId: string | null): { label: string; value: string }[] {
        if (!orgId) return [];
        return this.allUsers
            .filter(user => user.Org_ID === orgId)
            .map(user => ({
                label: `${user.user_No} - ${user.user_Name}`,
                value: user.user_No,
            }));
    }

    /** 使用 forkJoin 確保「組織」與「人員」選項皆載入完畢後才呼叫 callback */
    private loadDropdownOptions(onLoaded?: () => void): void {
        forkJoin({
            orgs: this.ass16020Service.querySYS3100_DropDownList(),
            users: this.ass16020Service.queryTBLUSER_Orgid_DropDownList(),
        }).pipe(untilDestroyed(this)).subscribe({
            next: ({ orgs, users }) => {
                if (orgs.Status === '0000') {
                    const options = orgs.Data.map(item => ({
                        label: `${item.No} - ${item.Name}`,
                        value: item.No,
                    }));
                    this.EMP_ORG_ID.set(options);
                    this.EMP_ORG_ID2.set(options);
                }
                if (users.Status === '0000') {
                    this.allUsers = users.Data;
                }
                if (onLoaded) onLoaded();
            },
            error: () => {
                if (onLoaded) onLoaded();
            }
        });
    }

    private getUserInfoFromLocal(): { mid: number; SYS_StoreNo: string; user_No: string; user_Name: string } {
        let mid = 0;
        let SYS_StoreNo = '';
        let user_No = '';
        let user_Name = '';
        try {
            const raw = localStorage.getItem('UserInfo');
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