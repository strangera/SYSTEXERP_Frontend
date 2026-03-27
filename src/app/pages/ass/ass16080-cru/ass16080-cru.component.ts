import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ASS16080Data, ASS16080Request } from '@service/api/ass/ass16080.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '@shared/componentkit/editor-text/editor-text.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateDuplicate, validateMaxLength, validateMaxNumber, validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { PanelModule } from 'primeng/panel';

@Component({
    selector: 'app-ass16080-cru',
    templateUrl: './ass16080-cru.component.html',
    styleUrl: './ass16080-cru.component.scss',
    standalone: true,
    imports: [
        MenubarComponent,
        PanelModule,
        FormsModule,
        ReactiveFormsModule,
        DropdownComponent,
        CalendarComponent,
        EditorTextComponent,
        NgFor,
        InputTextComponent,
        ButtonComponent,
        NgIf,
        TranslateModule,
        TableEditComponent,
        InputTextareaComponent,
    ]
})
export class ASS16080CRUComponent extends BasicCruPageComponent<ASS16080Data> implements OnInit {
    data: ASS16080Request[] = [];
    oriData: ASS16080Request[] = []; // 用於儲存原始資料以便重置
    selectedRows: ASS16080Request[] = [];
    deleteRows: ASS16080Request[] = [];
    columns: EditColumn[] = [
        { field: 'itemCode', header: '品項編號', type: 'dropdown', disabled: () => true, validate: [validateRequired, validateDuplicate, validateMaxLength(10)] },
        { field: 'itemName', header: '品項名稱', type: 'dropdown', disabled: () => true, validate: [validateRequired, validateMaxLength(100)] },
        { field: 'unit', header: '單位', type: 'input', disabled: () => true, maxLength: 8, validate: [validateMaxLength(100)] },
        { field: 'returnQty', header: '調撥數量', disabled: () => true, type: 'inputNumber', maxLength: 8, validate: [validateRequired, validateMaxNumber(99999999)] },
        { field: 'shipQty', header: '發貨數量', type: 'inputNumber', maxLength: 8, validate: [validateRequired, validateMaxNumber(99999999)] },
        { field: 'remark', header: '說明', type: 'autoComplete', disabled: () => true },
    ];

    // 控制
    isOutWHMode = false; // 調撥出庫頁
    isInWHMode = false; // 調撥入庫頁

    ngOnInit(): void {
        // 網站導覽設定
        this.initializePage('ASS16080', this.dataForm);

        // 下拉選單--------------------------------------------------------
        const state = this.router.lastSuccessfulNavigation?.extras.state as {
            crudstatus: CRUDStatus;
            rowdata: any;
        };

        switch (state.crudstatus) {
            // 創建
            case CRUDStatus.Create:
                this.formTitle = 'create-conditions';
                // this.accordionTabCss = 'create-accordionTab';
                this.crudstatus = CRUDStatus.Create;

                break;
            // 修改
            case CRUDStatus.Edit:
                this.formTitle = 'edit-conditions';
                // this.accordionTabCss = 'edit-accordionTab';
                this.crudstatus = CRUDStatus.Edit;
                // 測試用假資料
                this.data = [
                    {
                        id: 1,
                        itemCode: '001',
                        itemName: '測試品項',
                        unit: '台',
                        returnQty: '10',
                        shipQty: '1',
                        remark: '測試用假資料',
                    },
                ]

                this.setWarehouseMode();
                this.Edit(state.rowdata);
                break;
            // 讀檔
            case CRUDStatus.Read:
                this.formTitle = 'display-conditions';
                this.crudstatus = CRUDStatus.Read;

                // 測試用假資料
                this.data = [
                    {
                        id: 1,
                        itemCode: '001',
                        itemName: '測試品項',
                        unit: '台',
                        returnQty: '10',
                        shipQty: '1',
                        remark: '測試用假資料',
                    },
                ]

                this.Read(state.rowdata);
                break;
        }

        // console.log(this.accordionTabCss);

        this.oriData = JSON.parse(JSON.stringify(this.data)); // 儲存原始資料的副本
    }

    dataForm = this.formBuilder.nonNullable.group({
        transferNote: [{ value: '', disabled: true }, [Validators.required]],
        outWarehouse: [{ value: '', disabled: true }, [Validators.required]],
        outWarehouseName: [{ value: '', disabled: true }, [Validators.required]],
        inWarehouse: [{ value: '', disabled: true }, [Validators.required]],
        inWarehouseName: [{ value: '', disabled: true }, [Validators.required]],
        applicantCode: [{ value: '', disabled: true }, [Validators.required]],
        applicantName: [{ value: '', disabled: true }, [Validators.required]],
        departmentCode: [{ value: '', disabled: true }, [Validators.required]],
        departmentName: [{ value: '', disabled: true }, [Validators.required]],
        applicationDate: [{ value: '', disabled: true }, [Validators.required]],
        retExp: [{ value: '', disabled: true }, [Validators.required]]
    });
    // Dropdown options
    Kurabe = [
        { value: 1, label: '001' },
        { value: 2, label: '002' },
    ];
    KurabeName = []
    applicantCode = [];
    applicantName = [];
    departmentCode = [];
    departmentName = [];
    itemCodeOptions = [
        { value: 1, label: '3A24210000001' },
        { value: 2, label: '3A24210000002' },
        { value: 3, label: '3A24210000003' },
        { value: 4, label: '3A24210000004' },
        { value: 5, label: '3A24210000005' },
        { value: 6, label: '3A24210000006' },
        { value: 7, label: '3A24210000007' },
        { value: 8, label: '3A24210000008' },
        { value: 9, label: '3A24210000009' },
        { value: 10, label: '3A24210000010' },
    ];



    // ----------------------------------------------------------------
    constructor(
        // private router: Router,
        // private formBuilder: FormBuilder,
        // private messageService: NotificationService,
        private translate: TranslateService,
    ) {
        super(); // 呼叫父類建構子
    }


    Edit(rowdata: any) {
        this.dataForm.patchValue(rowdata);
    }

    Read(rowdata: any) {
        this.dataForm.patchValue(rowdata);
        this.dataForm.disable();
    }

    onSubmit(frm: FormGroup) {
        this.messageService.blockUi();
        this.submitted = true;

        if (this.dataForm.invalid) {
            this.messageService.errorBubble(
                this.translate.instant('form_error_message')
            );
            this.messageService.unblockUi();
            return;
        }

        switch (this.crudstatus) {
            case CRUDStatus.Create:
                if (this.canAdd()) {
                    // this.storeService.addMachine(frm.value as MachineForm).subscribe((response: any) => {
                    this.messageService.successBubble(
                        this.translate.instant('success_message')
                    );
                }
                break;
            case CRUDStatus.Edit:
                if (this.canEdit()) {
                    // this.storeService.updateMachine(frm.value as MachineForm).subscribe((response: any) => {
                    this.messageService.successBubble(
                        this.translate.instant('updated-successfully')
                    );
                }
                break;
        }

        this.messageService.unblockUi();
        this.submitted = false;
    }

    submitForm(frm: FormGroup) {
        // 查詢邏輯
        this.onSubmit(frm);
    } //CRU

    // onCancel() {
    //   this.router.navigate(['ASS1000/ASS16080']);
    // }

    resetTable() {
        this.data = JSON.parse(JSON.stringify(this.oriData)); // 重置為原始資料的副本
        this.selectedRows = [];
    }

    // 刪除資料的方法
    onDelete(rows: ASS16080Request[]) {
        // 將畫面資料中刪除這些 row
        this.data = this.data.filter(item => !rows.includes(item));
        // 將有 id 的項目（表示是資料庫已存在的）加進 deleteRows，避免重複
        rows.filter(item => item.id !== undefined && !this.deleteRows.some(d => d.id === item.id)).forEach(item => this.deleteRows.push(item));
        // 清空選取列
        this.selectedRows = [];
    }

    setWarehouseMode(): void {
        const status = this.rowdata?.transferStatus;
        this.isOutWHMode = status === '已審核';
        this.isInWHMode = status === '已調撥';
    }
}
