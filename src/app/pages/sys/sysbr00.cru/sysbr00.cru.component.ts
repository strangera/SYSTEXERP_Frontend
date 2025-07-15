import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { ChangeDetectorRef } from '@angular/core';
import { SYSBR00Service } from '../../../service/api/sys/sysbr00.service';


import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { forkJoin } from 'rxjs';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { NgIf, NgClass } from '@angular/common';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonDirective } from 'primeng/button';

@Component({
    selector: 'app-sysbr00-cru',
    templateUrl: './sysbr00.cru.component.html',
    styleUrls: ['./sysbr00.cru.component.scss'],
    standalone: true,
    imports: [
        MenubarComponent,
        ButtonComponent,
        PanelModule,
        FormsModule,
        ReactiveFormsModule,
        InputTextComponent,
        NgIf,
        TableComponent,
        InputGroupModule,
        InputTextModule,
        NgClass,
        ButtonDirective,
    ],
})
export class SYSBR00CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    CITY_ID: [0],
    CITY_No: ['', [Validators.required, Validators.maxLength(10)]],
    CITY_Name: ['', [Validators.required, Validators.maxLength(10)]],
    CITY_Group: ['', [Validators.maxLength(3)]],
  });

  city: any[] = [];
  district: any[] = [];
  data: any[] = [];
  selectedItems: any[] = [];

columns: any[] = [
  {
    field: 'AREA_No',
    header: '地區代號',
    type: 'input',
    
   
  },
  {
    field: 'AREA_Name',
    header: '地區名稱',
    type: 'input',
   
  },
  {
    field: 'POST_No',
    header: '郵遞區號',
    type: 'input',
   
  }
];



  districtForm = this.formBuilder.nonNullable.group({
    AREA_No: ['', [Validators.required, Validators.maxLength(4)]],
    AREA_Name: ['', [Validators.required, Validators.maxLength(12)]],
    POST_No: ['', [Validators.required, Validators.maxLength(6)]],
    
  });

  constructor(private SYSBR00Service: SYSBR00Service, private cdr: ChangeDetectorRef) {
    super();
  }
original_CITY_No: string | null = null;
original_CITY_Name: string | null = null;
ngOnInit(): void {
  this.initializePage('SYSBR00', this.dataForm);
  const rowdata = history.state.rowdata;
  if (rowdata) {
    this.dataForm.patchValue(rowdata);
    this.original_CITY_No = rowdata.original_CITY_No;
    this.original_CITY_Name = rowdata.original_CITY_Name;
  }

  // 👇 修正：先塞進資料（不需要 CITY_ID）
  if (!this.isFormCreateable && this.rowdata) {
    this.dataForm.patchValue({
      CITY_No: this.rowdata.CITY_No,
      CITY_Name: this.rowdata.CITY_Name,
      CITY_Group: this.rowdata.CITY_Group,
    });
  }

  // 縣市資料無論 create/edit 都抓
  this.SYSBR00Service.queryCities().subscribe({
    next: (res) => this.city = res.Data || [],
    error: (err) => {
      console.error('❌ 縣市資料錯誤:', err);
      this.messageService.errorBubble('取得縣市資料失敗');
    }
  });

  // 👇 改：確認有 CITY_No 才 init 區域
  if (!this.isFormCreateable && this.dataForm.get('CITY_No')?.value?.trim()) {
    this.initDistrict();
  }
}



initDistrict(): void {
  const cityNo = this.dataForm.get('CITY_No')?.value?.trim();
  if (!cityNo) {
    this.messageService.errorBubble('無法取得 CITY_No，無法查詢區域');
    return;
  }

  const request = { CITY_No: cityNo };

  this.SYSBR00Service.queryDistricts(request).subscribe({
    next: (res) => {
      this.district = res.Data || [];

      // ✅ 用 CITY_No + AREA_No 組成唯一 ID
      this.data = this.district.map((d: any) => ({
        ...d,
        id: `${d.CITY_No}-${d.AREA_No}`
      }));

      this.cdr.detectChanges();

      this.districtForm.controls['AREA_No'].setValidators([
        Validators.required,
        Validators.maxLength(4),
        this.duplicateValidator(this.data.map(d => d.AREA_No))
      ]);
      this.districtForm.controls['AREA_Name'].setValidators([
        Validators.required,
        Validators.maxLength(12),
        this.duplicateValidator(this.data.map(d => d.AREA_Name))
      ]);
      this.districtForm.controls['POST_No'].setValidators([
        Validators.required,
        Validators.maxLength(6),
        this.duplicateValidator(this.data.map(d => d.POST_No))
      ]);
      this.districtForm.updateValueAndValidity();
    },
    error: (err) => {
      console.error('❌ 區域資料錯誤:', err);
      this.messageService.errorBubble('取得區域資料失敗');
    }
  });
}




onAddDistrict(form: FormGroup): void {
  form.markAllAsTouched();
  if (form.invalid) {
    this.messageService.errorBubble('請完整填寫欄位');
    return;
  }

  const { AREA_No, AREA_Name, POST_No } = form.getRawValue();
  const cityNo = this.dataForm.get('CITY_No')?.value?.trim();

  if (!cityNo) {
    this.messageService.errorBubble('縣市代號為空，無法新增區域');
    return;
  }

  // 檢查欄位值是否為空
  if (!AREA_No?.trim() || !AREA_Name?.trim() || !POST_No?.trim()) {
    this.messageService.errorBubble('請完整填寫所有欄位');
    return;
  }

  const payload = {
    AREA_No: AREA_No.trim(),
    AREA_Name: AREA_Name.trim(),
    POST_No: POST_No.trim(),
    CITY_No: cityNo
  };

  this.SYSBR00Service.insertArea(payload).subscribe({
    next: () => {
      this.messageService.successBubble('新增成功');
      this.initDistrict();
      form.reset({}, { emitEvent: false }); // ✅ 重設表單並避免觸發事件
    },
    error: (err) => {
      console.error('❌ 新增失敗:', err);
      this.messageService.errorBubble('新增失敗，請稍後再試');
    }
  });
}


onRowEditSave(event: any): void {
  const cityNo = this.dataForm.get('CITY_No')?.value?.trim();
  const areaNo = event.newData.AREA_No?.trim();
  const areaName = event.newData.AREA_Name?.trim();
  const postNo = event.newData.POST_No?.trim();

  if (!cityNo || !areaNo) {
    this.messageService.errorBubble('CITY_No 與 AREA_No 為必填，無法儲存區域資料');
    return;
  }

  const payload = {
    CITY_No: cityNo,
    AREA_No: areaNo,
    AREA_Name: areaName,
    POST_No: postNo
  };

  this.SYSBR00Service.updateArea(payload).subscribe({
    next: () => {
      this.messageService.successBubble('更新成功');
      this.initDistrict(); // 重新查詢列表
    },
    error: () => {
      this.messageService.errorBubble('更新失敗');
    }
  });
}


onDelete(rows: any[]): void {
  if (!rows.length) return;

  const payload = rows.map(item => ({
    CITY_No: item.CITY_No,
    AREA_No: item.AREA_No,
  }));

  this.SYSBR00Service.deleteAreas(payload).subscribe({
    next: () => {
      this.messageService.successBubble('刪除成功');
      this.initDistrict(); // 重新查詢
    },
    error: () => {
      this.messageService.errorBubble('刪除失敗');
    },
  });
}


onSubmit(form: FormGroup): void {
  this.handleSubmit(form, () => {
    const value = form.value;

    const payload = {
      CITY_No: value.CITY_No?.trim(),
      CITY_Name: value.CITY_Name?.trim(),
      CITY_Group: value.CITY_Group?.trim()
    };

    if (this.crudstatus === 'Create') {
      // ✅ 新增時：前端比對 CITY_No 是否重複
      const isDuplicateNo = this.city.some(c => c.CITY_No === payload.CITY_No);
      if (isDuplicateNo) {
        this.messageService.errorBubble('縣市代號已存在，請重新輸入');
        return;
      }

      this.SYSBR00Service.insertCity(payload).subscribe({
        next: () => {
          this.messageService.successBubble('新增成功');
          this.onCancel();
        },
        error: (err) => {
          console.error('❌ 新增失敗:', err);
          this.messageService.errorBubble('新增失敗，請確認資料是否正確或已存在');
        }
      });

    } else {
      // ✅ 修改時：比對是否有變更（CITY_No + CITY_Name）
      if (
        this.original_CITY_No === payload.CITY_No &&
        this.original_CITY_Name === payload.CITY_Name
      ) {
        // 沒有變更就直接更新
        this.SYSBR00Service.updateCity(payload).subscribe({
          next: () => {
            this.messageService.successBubble('修改成功');
            this.onCancel();
          },
          error: () => this.messageService.errorBubble('修改失敗')
        });
        return;
      }

      // 有變更才檢查唯一性
      this.SYSBR00Service.checkCityUnique(payload).subscribe({
        next: (res) => {
          const isUnique = res?.Data === true;
          if (!isUnique) {
            this.messageService.errorBubble('縣市代號與名稱已存在，請重新確認');
            return;
          }

          this.SYSBR00Service.updateCity(payload).subscribe({
            next: () => {
              this.messageService.successBubble('修改成功');
              this.onCancel();
            },
            error: () => this.messageService.errorBubble('修改失敗')
          });
        },
        error: () => this.messageService.errorBubble('唯一性檢查失敗')
      });
    }
  });
}





  duplicateValidator(existing: string[]): any {
    return (control: any): { [key: string]: boolean } | null => {
      return existing.includes(control.value) ? { duplicate: true } : null;
    };
  }
}
