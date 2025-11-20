import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownComponent } from "@shared/componentkit/dropdown/dropdown.component";
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropDownListService } from './../../../service/utility/dropDownList.service';

//1.3.1.2 應收調整科目設定維護 CRU
@Component({
  selector: 'app-fin31020-cru',
  templateUrl: './fin31020-cru.component.html',
  styleUrl: './fin31020-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, ButtonComponent, TranslateModule, DropdownComponent]
})

export class FIN31020CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    AccNoFrom: [""],
    minus: [1],
    remark: ["", Validators.maxLength(100)],
  });

  AccNoOptions: any[] = []; // 科目代號選項
  minusOption: any[] = [
    { value: 1, label: '加項' },
    { value: 2, label: '減項' },
  ];
  constructor(
    private DropDownListService: DropDownListService
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN31020', this.dataForm);
    this.loadOptions();
  }
  private loadOptions(): void {
    // 科目代號
    this.DropDownListService.queryGLS1005_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => this.AccNoOptions = res.Data.map((x: any) => ({ label: `${x.No} - ${x.Name}`, value: x.No })));

  }
  onSubmit(frm: FormGroup) {

  }
}
