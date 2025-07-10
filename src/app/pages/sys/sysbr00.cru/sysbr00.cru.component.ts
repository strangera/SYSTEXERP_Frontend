import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { ChangeDetectorRef } from '@angular/core';
import { SYSBR00Service } from '../../../service/api/sys/sysbr00.service';


import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-sysbr00-cru',
  templateUrl: './sysbr00.cru.component.html',
  styleUrls: ['./sysbr00.cru.component.scss'],
})
export class SYSBR00CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    CITY_ID: [0],
    CITY_No: ['', [Validators.required, Validators.maxLength(4)]],
    CITY_Name: ['', [Validators.required, Validators.maxLength(8)]],
    CITY_Group: ['', [Validators.maxLength(6)]],
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
    validate: [Validators.required, Validators.maxLength(4)],
  },
  {
    field: 'AREA_Name',
    header: '地區名稱',
    type: 'input',
    validate: [Validators.required, Validators.maxLength(12)],
  },
  {
    field: 'POST_No',
    header: '郵遞區號',
    type: 'input',
    validate: [Validators.required, Validators.maxLength(6)],
  },
];

  districtForm = this.formBuilder.nonNullable.group({
    AREA_No: ['', [Validators.required, Validators.maxLength(4)]],
    AREA_Name: ['', [Validators.required, Validators.maxLength(12)]],
    POST_No: ['', [Validators.required, Validators.maxLength(6)]],
  });

  constructor(private SYSBR00Service: SYSBR00Service, private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('005', this.dataForm);
    this.SYSBR00Service.queryCities().subscribe({
      next: (res) => this.city = res.Data || [],
      error: (err) => {
        console.error('❌ 縣市資料錯誤:', err);
        this.messageService.errorBubble('取得縣市資料失敗');
      }
    });

    if (!this.isFormCreateable) {
      this.initDistrict();
    }
  }

  initDistrict(): void {
    this.SYSBR00Service.queryDistricts().subscribe({
      next: (res) => {
        this.district = res.Data || [];
        this.data = this.district
          .filter((d: any) => d.CITY_No === this.dataForm.value.CITY_No)
          .map((d: any) => ({ ...d, id: uuidv4() }));

        this.cdr.detectChanges();
        this.districtForm.controls['AREA_No'].setValidators([
          Validators.required, Validators.maxLength(4), this.duplicateValidator(this.data.map(d => d.AREA_No))
        ]);
        this.districtForm.controls['AREA_Name'].setValidators([
          Validators.required, Validators.maxLength(12), this.duplicateValidator(this.data.map(d => d.AREA_Name))
        ]);
        this.districtForm.controls['POST_No'].setValidators([
          Validators.required, Validators.maxLength(6), this.duplicateValidator(this.data.map(d => d.POST_No))
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
    const { AREA_No, AREA_Name, POST_No } = form.value;
    if (form.valid && AREA_No && AREA_Name && POST_No) {
      this.SYSBR00Service.insertArea(this.rowdata.CITY_No, form.value).subscribe({
        next: () => {
          this.messageService.successBubble('新增成功');
          this.initDistrict();
          form.reset();
        }
      });
    }
  }

  onRowEditSave(event: any): void {
    const body = {
      AREA_ID: event.newData.AREA_ID,
      AREA_No: event.newData.AREA_No,
      AREA_Name: event.newData.AREA_Name,
      POST_No: event.newData.POST_No,
      CITY_No: this.rowdata.CITY_No
    };
    this.SYSBR00Service.updateArea(body).subscribe({
      next: () => {
        this.messageService.successBubble('更新成功');
        this.initDistrict();
      },
      error: () => this.messageService.errorBubble('更新失敗')
    });
  }

  onDelete(rows: any[]): void {
    const deletes = rows.map(row => this.SYSBR00Service.deleteArea(row.AREA_ID));
    forkJoin(deletes).subscribe({
      next: () => {
        this.messageService.successBubble('刪除成功');
        this.initDistrict();
      },
      error: () => this.messageService.errorBubble('刪除失敗')
    });
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const value = form.value;
      const payload = {
        CITY_ID: value.CITY_ID,
        CITY_No: value.CITY_No,
        CITY_Name: value.CITY_Name,
        CITY_Group: value.CITY_Group
      };

      const isDuplicate = this.city.some(c => c.CITY_No === payload.CITY_No && c.CITY_ID !== payload.CITY_ID);
      if (isDuplicate) {
        this.messageService.errorBubble('縣市代號重複，請重新輸入');
        return;
      }

      const action = this.crudstatus === 'Create'
        ? this.SYSBR00Service.insertCity(payload)
        : this.SYSBR00Service.updateCity(payload);

      action.subscribe({
        next: () => {
          this.messageService.successBubble(this.crudstatus === 'Create' ? '新增成功' : '修改成功');
          this.onCancel();
        },
        error: () => this.messageService.errorBubble('儲存失敗')
      });
    });
  }

  onBack(): void {
    this.router.navigate(['/PageBehaviorSettings/SYSBR00']);
  }

  duplicateValidator(existing: string[]): any {
    return (control: any): { [key: string]: boolean } | null => {
      return existing.includes(control.value) ? { duplicate: true } : null;
    };
  }
}
