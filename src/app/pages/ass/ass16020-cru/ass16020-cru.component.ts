import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ASS16020Data, ASS16020ReportData, ASS16020ReportRequest, ASS16020Request } from '@service/api/ass/ass16020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateDuplicate, validateMaxLength, validateMaxNumber } from '@shared/componentkit/table-edit/validate-field.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';

@Component({
    selector: 'app-ass16020-cru',
    templateUrl: './ass16020-cru.component.html',
    styleUrl: './ass16020-cru.component.scss',
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
        warehouseType: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(60)]],   // 倉別
        inventoryNumber: [{ value: '', disabled: true }],    // 盤點單號
        SInventoryDate: [{ value: '', disabled: true }],   // 盤點日期(起)
        EInventoryDate: [{ value: '', disabled: true }],   // 盤點日期(迄)
        initOrgCode: ['', [Validators.required, Validators.maxLength(60)]],    // 初盤組織
        initChecker: ['', [Validators.required, Validators.maxLength(60)]],    // 初盤人員
        reOrgCode: ['', [Validators.required, Validators.maxLength(60)]],   // 複盤組織
        rechecker: ['', [Validators.required, Validators.maxLength(60)]],   // 複盤人員
        remark: [''],    // 說明
    });

    // 控制
    isEditMode = true; // 修改頁
    isReportMode = false; // 報表頁

    // // 控制搜尋頁、報表頁的顯示   
    // pageMode: PageMode = PageMode.Query;
    // PageMode = PageMode; // 給 html 用

    btnLoading = false;
    totalRecords = 0;
    data: ASS16020Request[] = [];
    reportData: ASS16020ReportData[] = [];
    reportRequest: ASS16020ReportRequest = { inventoryNumber: '' };
    footerData: any[] = [];
    group_name = [{ group_name: '' }];
    selectedRows: ASS16020Request[] = [];
    deleteRows: ASS16020Request[] = [];
    columns: EditColumn[] = [
        { field: 'Inventoryordernumber', header: '盤點序號', type: 'inputNumber', disabled: () => !this.isEditMode, validate: [validateDuplicate, validateMaxLength(100)] },
        { field: 'InventoryQty', header: '盤點數量', type: 'inputNumber', maxLength: 8, validate: [validateMaxNumber(99999999)] },
        { field: 'MainCategoryNo', header: '大分類編號', type: 'dropdown', disabled: () => true, maxLength: 8, validate: [validateMaxLength(100)] },
        { field: 'MainCategoryName', header: '大分類名稱', type: 'input', disabled: () => true, validate: [validateMaxLength(100)] },
        { field: 'MidCategoryNo', header: '中分類編號', type: 'dropdown', disabled: () => true, maxLength: 8, validate: [validateMaxLength(100)] },
        { field: 'MidCategoryName', header: '中分類名稱', type: 'input', disabled: () => true, maxLength: 8, validate: [validateMaxLength(100)] },
        { field: 'SmallCategoryNo', header: '小分類編號', type: 'dropdown', disabled: () => true, validate: [validateMaxLength(100)] },
        { field: 'SmallCategoryName', header: '小分類名稱', type: 'input', disabled: () => true, maxLength: 8, validate: [validateMaxLength(100)] },
        { field: 'ItemNo', header: '品項編號/名稱', type: 'input', disabled: () => true, maxLength: 8, validate: [validateMaxLength(100)] },
        { field: 'Remark', header: '說明', type: 'autoComplete', validate: [validateMaxLength(100)] },
    ];

    reportColumns = [
        { field: 'MainCategoryNo', header: '大分類編號' },
        { field: 'MainCategoryName', header: '大分類名稱' },
        { field: 'MidCategoryNo', header: '中分類編號' },
        { field: 'MidCategoryName', header: '中分類名稱' },
        { field: 'SmallCategoryNo', header: '小分類編號' },
        { field: 'SmallCategoryName', header: '小分類名稱' },
        { field: 'Inventoryordernumber', header: '盤點序號' },
        { field: 'ItemNo', header: '品項編號' },
        { field: 'ItemName', header: '品項名稱' },
        { field: 'StockQty', header: '庫存數量' },
        { field: 'InventoryQty', header: '盤點數量' },
        { field: 'DiffQty', header: '差異數量' },
        { field: 'AvgUnitPrice', header: '平均單價' },
        { field: 'DiffAmount', header: '差異金額' },
    ]

    constructor(
        private notificationService: NotificationService,
        private route: ActivatedRoute,
    ) {
        super();
    }

    ngOnInit(): void {
        this.initializePage('ASS16020', this.dataForm);
        if (this.crudstatus === CRUDStatus.Create) {
            this.isEditMode = false; // 新增頁
        }
        else if (this.crudstatus === CRUDStatus.Edit) {
            this.isEditMode = true; // 修改頁
        }
        else {
            this.isEditMode = false;
            this.isReportMode = true; // 報表頁
        }

        // this.route.queryParams.subscribe(params => {
        //     const mode = params['mode'];

        //     if (mode === 'Report') {
        //         this.pageMode = PageMode.Report;
        //     }
        // });

        // 測試用假資料
        this.reportRequest = { inventoryNumber: '202502001' };
        this.reportData = [
            {
                MainCategoryNo: 'D',
                MainCategoryName: '電力及照明系統',
                MidCategoryNo: '25',
                MidCategoryName: '電力系統備品',
                SmallCategoryNo: '42',
                SmallCategoryName: '盤面接頭+接線箱',
                Inventoryordernumber: '1',
                ItemNo: '3D25420000001',
                ItemName: '3Ø4W+1/2E 4000A CU BUSWAY',
                StockQty: 2,
                InventoryQty: 2,
                DiffQty: 0,
                AvgUnitPrice: 99190,
                DiffAmount: 0,
            },
            {
                MainCategoryNo: 'D',
                MainCategoryName: '電力及照明系統',
                MidCategoryNo: '25',
                MidCategoryName: '電力系統備品',
                SmallCategoryNo: '42',
                SmallCategoryName: '盤面接頭+接線箱',
                Inventoryordernumber: '2',
                ItemNo: '3D25420000002',
                ItemName: '3Ø4W+1/2E 3000A CU BUSWAY',
                StockQty: 2,
                InventoryQty: 1,
                DiffQty: -1,
                AvgUnitPrice: 87000,
                DiffAmount: -87000,
            },
            {
                MainCategoryNo: 'D',
                MainCategoryName: '電力及照明系統',
                MidCategoryNo: '25',
                MidCategoryName: '電力系統備品',
                SmallCategoryNo: '42',
                SmallCategoryName: '盤面接頭+接線箱',
                Inventoryordernumber: '3',
                ItemNo: '3D25420000003',
                ItemName: '3Ø4W+1/2E 3000A CU BUSWAY',
                StockQty: 2,
                InventoryQty: 1,
                DiffQty: -1,
                AvgUnitPrice: 64000,
                DiffAmount: -64000,
            },
            {
                MainCategoryNo: 'D',
                MainCategoryName: '電力及照明系統',
                MidCategoryNo: '25',
                MidCategoryName: '電力系統備品',
                SmallCategoryNo: '42',
                SmallCategoryName: '盤面接頭+接線箱',
                Inventoryordernumber: '4',
                ItemNo: '3D25420000004',
                ItemName: '3Ø4W+1/2E 3000A CU BUSWAY',
                StockQty: 2,
                InventoryQty: 1,
                DiffQty: -1,
                AvgUnitPrice: 55000,
                DiffAmount: -55000,
            },
            {
                MainCategoryNo: 'D',
                MainCategoryName: '電力及照明系統',
                MidCategoryNo: '25',
                MidCategoryName: '電力系統備品',
                SmallCategoryNo: '42',
                SmallCategoryName: '盤面接頭+接線箱',
                Inventoryordernumber: '5',
                ItemNo: '3D25420000005',
                ItemName: '3Ø4W+1/2E 3000A CU BUSWAY',
                StockQty: 2,
                InventoryQty: 1,
                DiffQty: -1,
                AvgUnitPrice: 47000,
                DiffAmount: -47000,
            },
            {
                MainCategoryNo: 'D',
                MainCategoryName: '電力及照明系統',
                MidCategoryNo: '25',
                MidCategoryName: '電力系統備品',
                SmallCategoryNo: '42',
                SmallCategoryName: '盤面接頭+接線箱',
                Inventoryordernumber: '6',
                ItemNo: '3D25420000006',
                ItemName: '3Ø4W+1/2E 3000A CU BUSWAY',
                StockQty: 2,
                InventoryQty: 1,
                DiffQty: -1,
                AvgUnitPrice: 33000,
                DiffAmount: -33000,
            },
            {
                MainCategoryNo: 'D',
                MainCategoryName: '電力及照明系統',
                MidCategoryNo: '25',
                MidCategoryName: '電力系統備品',
                SmallCategoryNo: '42',
                SmallCategoryName: '盤面接頭+接線箱',
                Inventoryordernumber: '7',
                ItemNo: '3D25420000007',
                ItemName: '3Ø4W+1/2E 3000A CU BUSWAY',
                StockQty: 2,
                InventoryQty: 1,
                DiffQty: -1,
                AvgUnitPrice: 28000,
                DiffAmount: -28000,
            },
            {
                MainCategoryNo: 'D',
                MainCategoryName: '電力及照明系統',
                MidCategoryNo: '25',
                MidCategoryName: '電力系統備品',
                SmallCategoryNo: '42',
                SmallCategoryName: '盤面接頭+接線箱',
                Inventoryordernumber: '8',
                ItemNo: '3D25420000008',
                ItemName: '3Ø4W+1/2E 3000A CU BUSWAY',
                StockQty: 2,
                InventoryQty: 1,
                DiffQty: -1,
                AvgUnitPrice: 24000,
                DiffAmount: -24000,
            },
            {
                MainCategoryNo: 'D',
                MainCategoryName: '電力及照明系統',
                MidCategoryNo: '25',
                MidCategoryName: '電力系統備品',
                SmallCategoryNo: '42',
                SmallCategoryName: '盤面接頭+接線箱',
                Inventoryordernumber: '9',
                ItemNo: '3D25420000009',
                ItemName: '3Ø4W+1/2E 3000A CU BUSWAY',
                StockQty: 2,
                InventoryQty: 1,
                DiffQty: -1,
                AvgUnitPrice: 22000,
                DiffAmount: -22000,
            },
            {
                MainCategoryNo: 'D',
                MainCategoryName: '電力及照明系統',
                MidCategoryNo: '25',
                MidCategoryName: '電力系統備品',
                SmallCategoryNo: '42',
                SmallCategoryName: '盤面接頭+接線箱',
                Inventoryordernumber: '10',
                ItemNo: '3D25420000010',
                ItemName: '3Ø4W+1/2E 3000A CU BUSWAY',
                StockQty: 2,
                InventoryQty: 1,
                DiffQty: -1,
                AvgUnitPrice: 17000,
                DiffAmount: -17000,
            }
        ];
        this.group_name = [
            { group_name: '小計' },
            { group_name: '盤盈項數' },
            { group_name: '盤損項數' },
            { group_name: '總差異金額' },
            { group_name: '說明' },
        ]
        this.footerData = [
            { group_name: '小計', StockQty: 20, InventoryQty: 11, DiffQty: -9, AvgUnitPrice: 476190, DiffAmount: -377000 },
            { group_name: '盤盈項數', DiffAmount: 0 },
            { group_name: '盤損項數', DiffAmount: 9 },
            { group_name: '總差異金額', DiffAmount: -377000 },
            { group_name: '說明', DiffAmount: '' },
        ];
        this.totalRecords = this.reportData.length;
        if (this.isReportMode) {
            this.dataForm.controls.inventoryNumber.setValue(this.reportRequest.inventoryNumber);
        }
    }

    queryForm = this.formBuilder.group({
        warehouseType: [],
        inventoryNumber: [],
        SInventoryDate: [],
        EInventoryDate: [],
        initChecker: [],
        rechecker: [],
        remark: [],
    });

    initCheckerOp = [{ value: 1, label: '員工A' }, { value: 2, label: '員工B' },];
    recheckerOp = [{ value: 1, label: '員工A' }, { value: 2, label: '員工B' },];
    initOrgCodeOp = [];
    reOrgCodeOp = [];

    onSubmit(frm: FormGroup) {
        console.log(frm.value);
        this.submitted = true;
        this.loading = true;
        this.notificationService.blockUi();

        // if (frm.valid && this.canQuery()) {
        //   // Submit logic here
        // }

        this.loading = false;
        this.notificationService.unblockUi();


    }

    resetTable() {
        this.data = [];
        this.selectedRows = [];
    }

    // 刪除資料的方法
    onDelete(rows: ASS16020Request[]) {
        // 將畫面資料中刪除這些 row
        this.data = this.data.filter(item => !rows.includes(item));
        // 將有 inventoryNumber 的項目（表示是資料庫已存在的）加進 deleteRows，避免重複
        rows.filter(item => item.inventoryNumber !== undefined && !this.deleteRows.some(d => d.inventoryNumber === item.inventoryNumber)).forEach(item => this.deleteRows.push(item));
        // 清空選取列
        this.selectedRows = [];
    }
}
