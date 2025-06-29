import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup } from '@angular/forms';
import { Tls51060Service } from '../../../service/api/tls/tls51060.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { apiOption, option, Sysb300m } from '../../../shared/models/sys/sysb000.module';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { PluLogo } from '../../../shared/models/tls/tls000.model';

@Component({
  selector: 'app-tls14030-cru',
  templateUrl: './tls14030-cru.component.html',
  styleUrl: './tls14030-cru.component.scss'
})
export class Tls14030CRUComponent extends BasicCruPageComponent<PluLogo>
  implements OnInit{
    // ----------------------------------------------------------------
      dataForm = this.formBuilder.nonNullable.group({
        id: [{ value: null, disabled: true }], // read only
        talent_id: [{ value: null, disabled: true }], // 合約編號 read only 讀取 TLTTALENT 專櫃主檔
        tlt_no: ['', [Validators.required, Validators.maxLength(12)]], // 專櫃編號 read only          讀取 TLTTALENT 專櫃主檔

        ticket_type: ['', [Validators.required, Validators.maxLength(1)]], // 保證票型態 "1=準時開業保證票 2=施工保證票 3=契約屆滿保證票"
        ticket_no: ['', [Validators.required, Validators.maxLength(20)]], // 票據編號 手動輸入
        ticket_kind: ['', [Validators.maxLength(1)]], // 票據種類 非必填但有限制長度 "1=本票 2=支票 3=行銀保證函 9=其他"
        ticket_amount: [null, [Validators.required, Validators.min(0), Validators.maxLength(10)]], // 保證票金額 整數金額 "讀取 TLTTALENT 專櫃主檔相對的保證金金額"
        expiry_date: [null], // 票據到期日期 手動輸入
        get_ticket_status: ['', [Validators.maxLength(1)]], // 票據收票狀態 "0=未繳票  1=已繳票  2=已退票  9=封存"
        get_date: [null], // 繳票日期 手動輸入
        return_date: [null], // 退票日期 手動輸入
        close_date: [null], // 封存日期 手動輸入
        ticket_remarks: ['', [Validators.maxLength(1000)]], // 保證票摘要-合約主檔 "讀取 TLTTALENT 專櫃主檔ticket_remarks"
        remark: ['', [Validators.maxLength(200)]], // 備註 手動輸入

        CanDel: [null],  //能否刪除(僅顯示) 卡控
      });
      //
      storageOptions: apiOption[] = [];
      allquery: Sysb300m[] = [];

      ticket_typeOption: option[] = [ //保證票型態
            {value: '1', label: '準時開業保證票'},
            {value: '2', label: '施工保證票'},
            {value: '3', label: '契約屆滿保證票'},
          ];
      
          ticket_kindOption: option[] = [ //票據種類
            {value: '1', label: '本票'},
            {value: '2', label: '支票'},
            {value: '3', label: '行銀保證函'},
            {value: '9', label: '其他'},
          ];
      
          get_ticket_statusOption: option[] = [ //票據收票狀態
            {value: '1', label: '未繳票'},
            {value: '2', label: '已繳票'},
            {value: '3', label: '已退票'},
            {value: '9', label: '封存'},
          ];
    
      // ----------------------------------------------------------------
      constructor(private tls51060Service: Tls51060Service) {
        super(); // 呼叫父類建構子
      }
    
      ngOnInit(): void {
        this.initializePage('TLS14030', this.dataForm);
        this.loadOptions();
        // console.log('dataform', this.dataForm.value);
      }
    
      onSubmit(frm: FormGroup) {
        this.messageService.blockUi();
        this.submitted = true;
    
        if (this.dataForm.invalid) {
          this.messageService.unblockUi();
          return;
        }
    
        //--檢查--
        //
        //--------
        switch (this.crudstatus) {
          case CRUDStatus.Create:
            if (this.canAdd()) {
              console.log('insert', frm.value);
              // this.tls51060Service.insertTLS51060(frm.value).subscribe(() => {
              //   this.messageService.successBubble('新增成功');
              //   // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
              //   this.dataForm.reset(); // 重置表單
              // });
            }
            break;
          case CRUDStatus.Edit:
            if (this.canEdit()) {
              console.log('update', frm.value);
              // this.tls51060Service.updateTLS51060(frm.value).subscribe(() => {
              //   // this.messageService.successBubble('更新成功');
              //   this.onCancel(); // 儲存後，會返回列表
              // });
            }
            break;
        }
    
        this.messageService.unblockUi();
        this.submitted = false;
      }
    
      submitForm(frm: FormGroup) {
        this.onSubmit(frm);
      }
    
      onClearForm() {
        this.dataForm.reset(); // 重置表單
      }
    
      // 讀取dopropdown選項
      loadOptions() {
        {
          this.tls51060Service
            .queryPOS2034_DropDownList({})
            .subscribe((response) => {
              this.storageOptions = response.Data.map((item: apiOption) => ({
                No: item.No,
                Name: item.Name,
                Label: item.No + '-' + item.Name,
              }));
            });
        }
      }

}
