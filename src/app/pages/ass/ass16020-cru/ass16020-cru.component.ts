import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CPM11060Data } from '@service/api/cpm/cpm11060.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
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
        DropdownComponent
    ]
})
export class ASS16020CRUComponent extends BasicCruPageComponent<CPM11060Data> implements OnInit {
    dataForm = this.formBuilder.nonNullable.group({
        warehouseType: ['', [Validators.required, Validators.maxLength(60)]],   // 倉別
        inventoryNumber: [''],    // 盤點單號
        SInventoryDate: [''],   // 盤點日期(起)
        EInventoryDate: [''],   // 盤點日期(迄)
        initChecker: ['', [Validators.required, Validators.maxLength(60)]],    // 初盤人員
        rechecker: ['', [Validators.required, Validators.maxLength(60)]],   // 複盤人員
        remark: [''],    // 說明
    });

    isEditMode = true; // 修改頁

    constructor(
        private notificationService: NotificationService,
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

        this.formValidators();
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

    private formValidators(): void {
        const warehouseType = this.dataForm.controls.warehouseType;
        const initChecker = this.dataForm.controls.initChecker;
        const rechecker = this.dataForm.controls.rechecker;

        warehouseType.setValidators([Validators.required, Validators.maxLength(60)]);

        if (this.isEditMode) {
            // 修改頁：只有倉別必填
            initChecker.setValidators([Validators.maxLength(60)]);
            rechecker.setValidators([Validators.maxLength(60)]);
        } else {
            // 新增頁：倉別、初盤人員、複盤人員都必填
            initChecker.setValidators([Validators.required, Validators.maxLength(60)]);
            rechecker.setValidators([Validators.required, Validators.maxLength(60)]);
        }

        warehouseType.updateValueAndValidity();
        initChecker.updateValueAndValidity();
        rechecker.updateValueAndValidity();
    }
}
