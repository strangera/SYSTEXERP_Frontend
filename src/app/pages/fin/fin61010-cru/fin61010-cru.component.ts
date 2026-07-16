import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN61010Data, FIN61010InsertRequest, FIN61010Service, FIN61010UpdateRequest, FIN61010VoidHistoryData } from '@service/api/fin/fin61010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';

@UntilDestroy()
@Component({
  selector: 'app-fin61010-cru',
  templateUrl: './fin61010-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule,
    InputTextComponent, DropdownComponent, CalendarComponent,
    ButtonComponent, NgIf, TranslateModule, TableEditComponent
  ]
})
export class FIN61010CRUComponent extends BasicCruPageComponent<FIN61010Data> implements OnInit {

  @ViewChild('voidTable') voidTableComponent?: TableEditComponent;

  dataForm = this.formBuilder.nonNullable.group({
    id: [null as number | null],
    BNK_No: ['', [Validators.required]],
    BNK_BranchNo: ['', [Validators.required]],
    BNK_AccNo: [''],
    CHK_Track: ['', [Validators.required]],
    CHK_BegNo: ['', [Validators.required]],
    CHK_EndNo: ['', [Validators.required]],
    CHK_LastUsedNo: [{ value: '', disabled: true }],
    CHK_Status: ['', [Validators.required]],
    CHK_UseDate: [null as string | null],
    CHK_StopDate: [null as string | null],
    HasIssuedRecord: [false],
  });

  hasIssuedRecord = false;

  isOriginalVoidRow = (row: any): boolean => row._dataStatus === 'original';

  bankNoOptions: { value: string; label: string }[] = [];

  voidItems: any[] = [];
  voidColumns: EditColumn[] = [
    {
      field: 'VoidDate',
      header: '作廢日期',
      type: 'date',
      width: '160px',
      isUserInput: true,
    },
    {
      field: 'CHK_No',
      header: '支票號碼',
      type: 'input',
      width: '150px',
      isUserInput: true,
      maxLength: 20,
    },
    {
      field: 'VoidReason',
      header: '作廢原因',
      type: 'input',
      isUserInput: true,
      maxLength: 200,
    },
  ];

  statusOptions = [
    { value: '0', label: '停用' },
    { value: '1', label: '手開' },
    { value: '2', label: '電腦' },
  ];

  constructor(
    private readonly fin61010Service: FIN61010Service,
    private readonly dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN61010', this.dataForm);

    this.dropdownApiService.queryAps1002().pipe(untilDestroyed(this)).subscribe(res => {
      this.bankNoOptions = (res ?? []).map(opt => ({
        value: opt.value,
        label: `${opt.value} - ${opt.label}`,
      }));
    });

    if (this.isFormEditable) {
      this.hasIssuedRecord = this.dataForm.controls.HasIssuedRecord.value === true;
      if (this.hasIssuedRecord) {
        this.dataForm.controls.BNK_No.disable();
        this.dataForm.controls.BNK_BranchNo.disable();
        this.dataForm.controls.BNK_AccNo.disable();
        this.dataForm.controls.CHK_Track.disable();
        this.dataForm.controls.CHK_BegNo.disable();
        this.dataForm.controls.CHK_EndNo.disable();
        this.dataForm.controls.CHK_UseDate.disable();
        this.dataForm.controls.CHK_StopDate.disable();
      }

      const id = this.dataForm.controls.id.value;
      if (id) {
        this.fin61010Service.queryFIN61010Detail(id, 1000, 1)
          .pipe(untilDestroyed(this))
          .subscribe(res => {
            this.voidItems = (res.Data?.VoidHistory ?? []).map((item: FIN61010VoidHistoryData) => ({
              ...item,
              _dataStatus: 'original',
            }));
          });
      }
    }
  }

  private formatVoidDate(d: Date | string | null | undefined): string | undefined {
    if (!d) return undefined;
    const date = d instanceof Date ? d : new Date(d);
    if (isNaN(date.getTime())) return undefined;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      const raw = frm.getRawValue();

      // 驗證：已用號碼必須在起始碼~終止碼範圍內
      const begNo = raw.CHK_BegNo as string;
      const endNo = raw.CHK_EndNo as string;
      const lastUsedNo = raw.CHK_LastUsedNo as string;
      if (lastUsedNo && begNo && endNo) {
        if (lastUsedNo < begNo || lastUsedNo > endNo) {
          this.loading = false;
          this.messageService.errorBubble('已用號碼必須大於等於起始碼並小於等於終止碼');
          return;
        }
      }

      const newVoidItems = this.voidItems.filter(
        item => !item._isAutoInsertCandidate && item._dataStatus === 'new' && item.CHK_No
      );

      const serviceCall = this.isFormCreateable
        ? this.fin61010Service.insertFIN61010({
            BNK_No: raw.BNK_No,
            BNK_BranchNo: raw.BNK_BranchNo,
            BNK_AccNo: raw.BNK_AccNo || undefined,
            CHK_Track: raw.CHK_Track,
            CHK_BegNo: raw.CHK_BegNo,
            CHK_EndNo: raw.CHK_EndNo,
            CHK_Status: raw.CHK_Status,
            CHK_UseDate: this.formatVoidDate(raw.CHK_UseDate),
            CHK_StopDate: this.formatVoidDate(raw.CHK_StopDate),
          } as FIN61010InsertRequest)
        : this.fin61010Service.updateFIN61010({
            id: raw.id!,
            CHK_Status: raw.CHK_Status,
            BNK_No: raw.BNK_No,
            BNK_BranchNo: raw.BNK_BranchNo,
            BNK_AccNo: raw.BNK_AccNo || undefined,
            CHK_Track: raw.CHK_Track,
            CHK_BegNo: raw.CHK_BegNo,
            CHK_EndNo: raw.CHK_EndNo,
            CHK_UseDate: this.formatVoidDate(raw.CHK_UseDate),
            CHK_StopDate: this.formatVoidDate(raw.CHK_StopDate),
            VoidItems: newVoidItems.map(item => ({
              VoidDate: this.formatVoidDate(item.VoidDate),
              CHK_No: item.CHK_No,
              VoidReason: item.VoidReason || undefined,
            })),
          } as FIN61010UpdateRequest);

      serviceCall.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.messageService.successBubble(res.Message);
        if (this.isFormCreateable) {
          this.dataForm.reset();
        } else if (this.isFormEditable) {
          this.onCancel();
        }
      });
    });
  }
}
