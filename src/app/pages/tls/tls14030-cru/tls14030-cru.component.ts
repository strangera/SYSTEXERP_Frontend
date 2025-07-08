import { Tls14030Service } from './../../../service/API/tls/tls14030.service';
import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { apiOption, option } from '../../../shared/models/sys/sysb000.module';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { Garantee_Ticket } from '../../../shared/models/tls/tls000.model';

// 專櫃下拉資訊
interface TLTTALENT{
  talent_id: number,
  ticket_remarks: string,
  tlt_name: string,
  tlt_no: string
}

@Component({
  selector: 'app-tls14030-cru',
  templateUrl: './tls14030-cru.component.html',
  styleUrl: './tls14030-cru.component.scss'
})

export class Tls14030CRUComponent extends BasicCruPageComponent<Garantee_Ticket>
  implements OnInit{
    // ----------------------------------------------------------------
      dataForm = this.formBuilder.nonNullable.group({
        id: [{ value: null, disabled: true }], // read only
        talent_id: [,[Validators.required]], // 合約編號 read only  讀取 TLTTALENT 專櫃主檔
        tlt_no: [{ value: null as string | null, disabled: true }], // 專櫃編號 read only          讀取 TLTTALENT 專櫃主檔
        tlt_name: [{ value: null as string | null, disabled: true }], // 專櫃名稱

        ticket_type: ['', [Validators.required, Validators.maxLength(1)]], // 保證票型態 "1=準時開業保證票 2=施工保證票 3=契約屆滿保證票"
        ticket_no: ['', [Validators.required, Validators.maxLength(20)]], // 票據編號 手動輸入
        ticket_kind: ['', [Validators.maxLength(1)]], // 票據種類 非必填但有限制長度 "1=本票 2=支票 3=行銀保證函 9=其他"
        ticket_amount: [null, [Validators.required, Validators.min(0), Validators.maxLength(10)]], // 保證票金額 整數金額 "讀取 TLTTALENT 專櫃主檔相對的保證金金額"
        expiry_date: [null], // 票據到期日期 手動輸入
        get_ticket_status: ['', [Validators.maxLength(1)]], // 票據收票狀態 "0=未繳票  1=已繳票  2=已退票  9=封存"
        get_date: [null], // 繳票日期 手動輸入
        return_date: [null], // 退票日期 手動輸入
        close_date: [null], // 封存日期 手動輸入
        ticket_remarks: [{ value: null as string | null, disabled: true }], // 保證票摘要-合約主檔 "讀取 TLTTALENT 專櫃主檔ticket_remarks" (不可修改, 本欄位為契約中的保證票備註寫入)
        remark: ['', [Validators.maxLength(200)]], // 備註 手動輸入

        CanDel: [null],  //能否刪除(僅顯示) 卡控
      });

      private skipTalentChange = false; //是否更新編號的旗標

      //
      storageOptions: apiOption[] = [];
      allquery: Garantee_Ticket[] = [];

      TLTTALENT_Option: apiOption[] = [];

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
            { value: '0', label: '未繳票' },
            { value: '1', label: '已繳票' },
            { value: '2', label: '已退票' },
            { value: '9', label: '封存' },
          ];
    
      // ----------------------------------------------------------------
      constructor(private tls14030Service: Tls14030Service) {
        super(); // 呼叫父類建構子
      }
    
      ngOnInit(): void {
        this.initializePage('TLS14030', this.dataForm);
        //初始先讀取一遍
        this.loadOptions();
        console.log('編輯明細',this.dataForm.value);

        if(this.crudstatus != CRUDStatus.Create){ //非新增模式不可編輯 合約編號
          this.dataForm.get('talent_id')?.disable();
        }

         // ⭐ 監聽 talent_id 變更
        this.dataForm.get('talent_id')?.valueChanges.subscribe((value) => { // 合約編號 變更時寫入相關資料
          if (this.skipTalentChange) {
            this.skipTalentChange = false; // 重置旗標
            return;
          }

          if (value) {
            this.loadTLTTALENTDetail(value);
          }
        });
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
        const formValue = frm.getRawValue();

        switch (this.crudstatus) {
          case CRUDStatus.Create:
            if (this.canAdd()) {
              console.log('insert', formValue);
              this.tls14030Service.insertTLS14030(formValue).subscribe(() => {
                this.messageService.successBubble('新增成功');
                // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
                this.skipTalentChange = true;
                this.dataForm.reset(); // 重置表單
              });
            }
            break;
          case CRUDStatus.Edit:
            if (this.canEdit()) {
              console.log('update', formValue);
              this.tls14030Service.updateTLS14030(formValue).subscribe(() => {
                this.messageService.successBubble('更新成功');
                this.onCancel(); // 儲存後，會返回列表
              });
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
      loadOptions(){
        this.tls14030Service
            .queryTLTTALENT_Status_DropDownList({"approve_status": '2'}) //這支作業都固定帶已審核 (能選擇的tltid都已經審核)
            .subscribe((response) => {
              this.TLTTALENT_Option = response.Data.map((item: any) => ({
              No: Number(item.No), // 確保是 number
              Name: item.Name,
            }));

            console.log('專櫃主檔(合約編號)明細:', this.TLTTALENT_Option);
            });
      }
    
      // 讀取主檔變更候更新的選項
      loadTLTTALENTDetail(talent_id: number) {
        {
          const requestBody = {'talent_id': talent_id };
          if(talent_id){
            this.tls14030Service.getTLTTALENT(requestBody).subscribe((response) => {
            const data: TLTTALENT = response.Data;

            if (data) {
              this.skipTalentChange = true;
              this.dataForm.patchValue({
                ticket_remarks: data.ticket_remarks || '',
                tlt_name: data.tlt_name || '',
                tlt_no: data.tlt_no || '',
              });

              this.messageService.infoBubble('已經依照合約編號進行變更');
              console.log('偵測到合約編號變更',data);
            }
          });
          }
        }
      }
}
