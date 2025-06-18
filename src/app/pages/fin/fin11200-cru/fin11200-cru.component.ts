import { Component, OnInit } from '@angular/core';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { monthOptions, POS1002, Pos1018 } from '../fin11200/fin11200.model';
import { FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../shared/service/validation.service';
import { Column } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-fin11200-cru',
  templateUrl: './fin11200-cru.component.html',
  styleUrl: './fin11200-cru.component.scss'
})
export class FIN11200CRUComponent extends BasicCruPageComponent<Pos1018> implements OnInit {
  dataForm = this.formBuilder.group({
    GUI_YYMM: [null, [Validators.required, this.validationService.oddMonthValidator]], // 發票年月
  });
  monthOptions = monthOptions;
  minDate?: Date;

  data: POS1002[] = [];
  columns: Column[] = [
    { field: 'ECR_No', header: '收銀機編號', visible: true },
    { field: 'ECR_Name', header: '收銀機名稱', visible: true },
  ]

  constructor(
    private validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11200', this.dataForm);
    this.setMinDate();
  }
  setMinDate(): void {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const periodStartMonth = month % 2 === 0 ? month : month - 1;
    this.minDate = new Date(year, periodStartMonth, 1);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
    });
  }
}
