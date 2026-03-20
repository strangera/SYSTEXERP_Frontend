import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS16040Data, ASS16040Request } from '@service/api/ass/ass16040.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateDuplicate, validateMaxLength, validateMaxNumber } from '@shared/componentkit/table-edit/validate-field.model';
import { PanelModule } from 'primeng/panel';

@Component({
    selector: 'app-ass16040-cru',
    templateUrl: './ass16040-cru.component.html',
    styleUrl: './ass16040-cru.component.scss',
    standalone: true,
    imports: [
        MenubarComponent,
        ButtonComponent,
        PanelModule,
        FormsModule,
        ReactiveFormsModule,
        InputTextComponent,
        TableEditComponent,
        NgIf,
        TranslateModule,
        DropdownComponent,
        InputTextComponent,
        CalendarComponent,
    ],
})
export class ASS16040CRUComponent extends BasicCruPageComponent<ASS16040Data> implements OnInit {
    dataForm = this.formBuilder.nonNullable.group({
        id: [],
        applicantCode: ['', [Validators.required, Validators.maxLength(60)]], // 申請人代號
        departmentCode: ['', [Validators.required, Validators.maxLength(60)]], // 部門代號
        applicationDate: ['', [Validators.required, Validators.maxLength(60)]], // 申請日期
        illustrate: ['', [Validators.maxLength(30)]], // 建議需求日(天)
        inventoryNo: ['', [Validators.required, Validators.maxLength(30)]], // 倉別
    });
    data: ASS16040Request[] = [];
    selectedRows: ASS16040Request[] = [];
    deleteRows: ASS16040Request[] = [];
    columns: EditColumn[] = [
        { field: 'itemCode', header: '品項代碼', type: 'dropdown', validate: [validateDuplicate, validateMaxLength(10)] },
        { field: 'unit', header: '單位', type: 'input', maxLength: 8, validate: [validateMaxLength(100)] },
        { field: 'quantity', header: '數量', type: 'inputNumber', maxLength: 8, validate: [validateMaxNumber(99999999)] },
        { field: 'itemRemark', header: '單項說明', type: 'autoComplete' },
    ];

    inventoryNoOptions = [];
    applicantCodeOptions = [];
    departmentCodeOptions = [];

    Departmentcode = [
        { value: 1, label: 'D001' },
        { value: 2, label: 'D002' },
    ];
    Kurabe = [
        { value: 1, label: '001' },
        { value: 2, label: '002' },
    ];
    Itemnumber = [

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
    Inventorystatus = [
        { value: 1, label: '盤點中' },
        { value: 2, label: '登錄完成' },
        { value: 3, label: '已結案' },

    ];
    Inventoryordenumber = [
        { value: 1, label: '202406002' },

    ];
    custodyunit = [
        { value: 1, label: '101000' },
        { value: 2, label: '102000' },
        { value: 3, label: '103000' },
        { value: 4, label: '104000' },
        { value: 5, label: '105000' },
        { value: 6, label: '106000' },
        { value: 7, label: '107000' },
        { value: 8, label: '108000' },
        { value: 9, label: '109000' },
        { value: 10, label: '10A000' },
    ];
    Accountcode = [
        { value: 1, label: '1501' },
        { value: 2, label: '150101' },
        { value: 3, label: '1511' },
        { value: 4, label: '151101' },
        { value: 5, label: '1512' },
        { value: 6, label: '151201' },
        { value: 7, label: '1521' },
        { value: 8, label: '152101' },
        { value: 9, label: '1522' },
        { value: 10, label: '152201' },
    ];
    reviewer = [
        { value: 1, label: '人員A' },
        { value: 2, label: '人員B' },
    ];
    usercode = [
        { value: 1, label: 'B001' },
        { value: 2, label: 'B002' },
        { value: 3, label: 'B003' },
        { value: 4, label: 'B004' },
        { value: 5, label: 'B005' },
    ];

    Querybystatus = [
        { value: 1, label: '移轉' },
        { value: 2, label: '報廢除帳' },
        { value: 3, label: '變賣除帳' },
        { value: 4, label: '新購' },
    ];
    assetCodeOptions = [
        { value: 1, label: '1A232300000010000001' },
        { value: 2, label: '1A232300000020000001' },
        { value: 3, label: '1A232300000040000001' },
        { value: 4, label: '1A232300000050000001' },
        { value: 5, label: '1A232300000060000001' },
        { value: 6, label: '1A232300000090000001' },
        { value: 7, label: '1A232400000010000001' },
        { value: 8, label: '1A232400000040000001' },
        { value: 9, label: '1A232400000060000001' },
    ];
    propertytype = [
        { value: 1, label: '資產' },
        { value: 2, label: '列管品' },
    ];
    status = [
        { value: 1, label: '領用申請' },
        { value: 2, label: '審核確認' },
        { value: 2, label: '領用發料' },
    ];

    constructor(
    ) {
        super();
    }
    ngOnInit(): void {
        this.initializePage('ASS16040', this.dataForm);
    }

    @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
    onSubmit(frm: FormGroup) {
        this.handleSubmit(frm, () => {
            const valid = this.tableEditComponent.validateAndShowErrors();
            if (!valid) {
                this.loading = false;
                return;
            }

        });
    }
    resetTable() {
        this.data = [];
        this.selectedRows = [];
    }

    // 刪除資料的方法
    onDelete(rows: ASS16040Request[]) {
        // 將畫面資料中刪除這些 row
        this.data = this.data.filter(item => !rows.includes(item));
        // 將有 id 的項目（表示是資料庫已存在的）加進 deleteRows，避免重複
        rows.filter(item => item.id !== undefined && !this.deleteRows.some(d => d.id === item.id)).forEach(item => this.deleteRows.push(item));
        // 清空選取列
        this.selectedRows = [];
    }
}
