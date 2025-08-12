import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { AnnouncementCategoryService } from '../../../service/basic/announcement-category.service';
import { SYSBR10Service } from '../../../service/api/sys/sysbr10.service';
import { Column } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { NgIf } from '@angular/common';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sysbr10.cru',
  templateUrl: './sysbr10.cru.component.html',
  styleUrls: ['./sysbr10.cru.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    RadiobuttonComponent,
    DropdownComponent,
    InputTextComponent,
    EditorTextComponent,
    NgIf,
    TableComponent,
    TranslateModule,
  ],
})
export class SYSBR10CRUComponent
  extends BasicCruPageComponent<any>
  implements OnInit {
  showInsert = true;
  showRowEdit = true;
  insertRowData = true;
  showDelete = true;
  showCheckBox = true;

  minDateToday: Date = new Date(); // 今天日期
  Pub_TypeOptions: any[] = [];
  User_NoOptions: any[] = [];
  Org_IDOptions: any[] = [];
  Role_NoOptions: any[] = [];

  YNOptions: any[] = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
  ];

  dataForm = this.formBuilder.nonNullable.group({
    Pub_StartDate: [, Validators.required],
    Pub_EndDate: [, Validators.required],
    pub_enable: [, Validators.required],
    Pub_Type: [, Validators.required],
    Pub_Event: [, Validators.required],
    Pub_Description: [, Validators.required],
  });
  detailList: any[] = []; // 初始化空陣列
  detailcolumns: Column[] = [
    {
      field: 'User_No',
      header: '使用者編號',
      visible: true,
      type: 'dropdown',
      options: [],
    },
    {
      field: 'Org_ID',
      header: '組織代碼',
      visible: true,
      type: 'dropdown',
      options: [],
    },
    {
      field: 'Role_No',
      header: '角色代號',
      visible: true,
      type: 'dropdown',
      options: [],
    },
  ];

  constructor(
    private dropDownListService: DropDownListService,
    private announcementCategoryService: AnnouncementCategoryService,
    private sysbr10Service: SYSBR10Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSBR10', this.dataForm);
    // ✅ 若為編輯且帶入 DetailList，初始化 this.detailList
    if (this.crudstatus === CRUDStatus.Edit && this.rowdata?.DetailList) {
      this.detailList = [...this.rowdata.DetailList];
    }
    // ⛔ CRUDStatus.Read 時禁止插入與編輯行
    if (this.crudstatus === CRUDStatus.Read) {
      this.showInsert = false;
      this.showRowEdit = false;
      this.insertRowData = false;
      this.showDelete = false;
      this.showCheckBox = false;
    }

    if (this.crudstatus === CRUDStatus.Edit && this.rowdata?.DetailList) {
      this.detailList = [...this.rowdata.DetailList];
    }

    this.announcementCategoryService
      .Pub_TypeOptions()
      .subscribe((data) => (this.Pub_TypeOptions = data));

    this.dropDownListService.queryTBLUSER_DropDownList().subscribe((res) => {
      this.User_NoOptions =
        res?.Data?.map((user) => ({ value: user.No, label: user.Name })) || [];
      this.detailcolumns[0].options = this.User_NoOptions;
    });

    this.dropDownListService.querySYS3100_DropDownList().subscribe((res) => {
      this.Org_IDOptions =
        res?.Data?.map((user) => ({ value: user.No, label: user.Name })) || [];
      this.detailcolumns[1].options = this.Org_IDOptions;
    });
    this.dropDownListService.querytblRole_DropDownList().subscribe((res) => {
      this.Role_NoOptions =
        res?.Data?.map((user) => ({ value: user.No, label: user.Name })) || [];
      this.detailcolumns[2].options = this.Role_NoOptions;
    });
  }
  get isCreate(): boolean {
    return this.crudstatus === CRUDStatus.Create;
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const value = form.getRawValue();

      // (略) 你的日期檢查...

      // ✅ 先決定主檔 id（編輯用原 id；新增為 0，由後端回填）
      const masterId =
        this.crudstatus === CRUDStatus.Edit ? (this.rowdata?.id ?? 0) : 0;

      // ✅ 先產生 DetailList，不要參考到 payload
      const detailList = this.detailList.map((row) => {
        const detail: any = {};
        this.detailcolumns.forEach((col) => (detail[col.field] = row[col.field] ?? null));

        // 你的 id 規則原樣保留
        detail.id =
          typeof row.id === 'number' && row.id > 0 && String(row.id).length < 10
            ? row.id
            : 0;

        // ✅ 直接用 masterId，別用 payload.id
        detail.pos5101_id = masterId;
        return detail;
      });

      // ✅ 最後才組 payload
      const payload = {
        id: masterId,
        Pub_StartDate: value.Pub_StartDate,
        Pub_EndDate: value.Pub_EndDate,
        Pub_Type: value.Pub_Type,
        Pub_Event: value.Pub_Event,
        pub_enable: value.pub_enable,
        Pub_Description: value.Pub_Description,
        DetailList: detailList,
      };

      if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        this.sysbr10Service.updateSYSBR10(payload).subscribe(() => {
          this.messageService.successBubble('更新成功');
          this.onCancel();
        });
      }

      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        this.sysbr10Service.insertSYSBR10(payload).subscribe(() => {
          this.messageService.successBubble('新增成功');
          this.dataForm.reset();
        });
      }
    });
  }


}
