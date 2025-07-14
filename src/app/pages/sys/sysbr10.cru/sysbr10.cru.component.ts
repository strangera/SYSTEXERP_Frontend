import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { AnnouncementCategoryService } from '../../../service/basic/announcement-category.service';
import { SYSBR10Service } from '../../../service/api/sys/sysbr10.service';
import { Column } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-sysbr10.cru',
  templateUrl: './sysbr10.cru.component.html',
  styleUrls: ['./sysbr10.cru.component.scss'],
})
export class SYSBR10CRUComponent
  extends BasicCruPageComponent<any>
  implements OnInit
{
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
    Pub_Eable: [, Validators.required],
    Pub_Type: [, Validators.required],
    Pub_Event: [, Validators.required],
    Pub_Description: [],
  });
detailList: any[] = []; // 初始化空陣列
  detailcolumns: Column[] = [
  { field: 'User_No', header: '使用者編號', visible: true, type: 'dropdown',options:[] },
  { field: 'Org_ID', header: '組織代碼', visible: true , type: 'dropdown',options:[]},
  { field: 'Role_No', header: '角色代碼', visible: true , type: 'dropdown',options:[]},
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

    this.announcementCategoryService
      .Pub_TypeOptions()
      .subscribe((data) => (this.Pub_TypeOptions = data));

    this.dropDownListService.queryTBLUSER_DropDownList().subscribe((res) => {
      this.User_NoOptions =
        res?.Data?.map((user) => ({ value: user.No, label: user.Name })) || [];
        this.detailcolumns[0].options =  this.User_NoOptions
    });

    this.dropDownListService.querySYS3100_DropDownList().subscribe((res) => {
      this.Org_IDOptions =
        res?.Data?.map((user) => ({ value: user.No, label: user.Name })) || [];
        this.detailcolumns[1].options =  this.Org_IDOptions
    });
        this.dropDownListService.querytblRole_DropDownList().subscribe((res) => {
      this.Role_NoOptions =
        res?.Data?.map((user) => ({ value: user.No, label: user.Name })) || [];
        this.detailcolumns[2].options =  this.Role_NoOptions
    });
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const value = form.getRawValue();

const payload = {
  id: this.crudstatus === CRUDStatus.Edit ? this.rowdata?.id ?? 0 : 0,
  Pub_StartDate: value.Pub_StartDate,
  Pub_EndDate: value.Pub_EndDate,
  Pub_Type: value.Pub_Type,
  Pub_Event: value.Pub_Event,
  Pub_Eable: value.Pub_Eable,
  Pub_Description: value.Pub_Description,
DetailList: this.detailList.map((row) => {
  const detail: any = {};
  this.detailcolumns.forEach((col) => {
    detail[col.field] = row[col.field];
  });

  detail.id = typeof row.id === 'number' && row.id > 0 && String(row.id).length < 10 ? row.id : 0;

  // ✅ 新增補上 pos5101_id
  detail.pos5101_id = this.rowdata?.id ?? payload.id ?? 0;

  return detail;
}),

};

      // 如果是編輯才加 id
      if (this.crudstatus === CRUDStatus.Edit) {
        payload.id = this.rowdata?.id ?? 0;
      }

      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        this.sysbr10Service.insertSYSBR10(payload).subscribe(() => {
          this.messageService.successBubble('新增成功');
          this.dataForm.reset();
        });
      }

      if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        this.sysbr10Service.updateSYSBR10(payload).subscribe(() => {
          this.messageService.successBubble('更新成功');
          this.onCancel();
        });
      }
    });
  }
}
