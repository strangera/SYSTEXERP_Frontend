import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS16030Data, ASS16030Request } from '@service/api/ass/ass16030.service';
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
    selector: 'app-ass16030-cru',
    templateUrl: './ass16030-cru.component.html',
    styleUrl: './ass16030-cru.component.scss',
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
export class ASS16030CRUComponent extends BasicCruPageComponent<ASS16030Data> implements OnInit {
    dataForm = this.formBuilder.nonNullable.group({
        id: [],
        applicantCode: ['', [Validators.required, Validators.maxLength(60)]], // 申請人代號
        departmentCode: ['', [Validators.required, Validators.maxLength(60)]], // 部門代號
        applicationDate: ['', [Validators.required, Validators.maxLength(60)]], // 申請日期
        illustrate: ['', [Validators.maxLength(30)]], // 建議需求日(天)
        inventoryNo: ['', [Validators.required, Validators.maxLength(30)]], // 倉別
    });
    data: ASS16030Request[] = [];
    selectedRows: ASS16030Request[] = [];
    deleteRows: ASS16030Request[] = [];
    columns: EditColumn[] = [
        { field: 'itemCode', header: '品項代碼', type: 'dropdown', validate: [validateDuplicate, validateMaxLength(10)] },
        { field: 'unit', header: '單位', type: 'input', maxLength: 8, validate: [validateMaxLength(100)] },
        { field: 'quantity', header: '數量', type: 'inputNumber', maxLength: 8, validate: [validateMaxNumber(99999999)] },
        { field: 'itemRemark', header: '單項說明', type: 'autoComplete' },
    ];

    inventoryNoOptions = [];
    applicantCodeOptions = [];
    departmentCodeOptions = [];

    constructor(
    ) {
        super();
    }
    ngOnInit(): void {
        this.initializePage('ASS16030', this.dataForm);
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
    onDelete(rows: ASS16030Request[]) {
        // 將畫面資料中刪除這些 row
        this.data = this.data.filter(item => !rows.includes(item));
        // 將有 id 的項目（表示是資料庫已存在的）加進 deleteRows，避免重複
        rows.filter(item => item.id !== undefined && !this.deleteRows.some(d => d.id === item.id)).forEach(item => this.deleteRows.push(item));
        // 清空選取列
        this.selectedRows = [];
    }
}
