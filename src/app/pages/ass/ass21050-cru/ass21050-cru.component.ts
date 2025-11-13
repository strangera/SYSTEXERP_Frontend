import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { NgFor, NgIf } from '@angular/common';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { IDropdownItem } from '@service/utility/dropdown-api.model';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { ASS21030Service } from '@service/api/ass/ass21030.service';
import { apiOption } from '@shared/models/tls/tls000.model';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-ass21050-cru',
  templateUrl: './ass21050-cru.component.html',
  styleUrl: './ass21050-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, NgFor, ButtonComponent, NgIf, TranslateModule]
})
export class ASS21050CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    ENG_MeterNo: [''],
    FLOOR_NO: [''],
    AREA_NO: [''],
    remark: [''],
    mark: [''],
    xCoordinate: [''],
    yCoordinate: ['']
  });
  floorNoOptions: IDropdownItem[] = [];
  areaNoOptions: IDropdownItem[] = [];
  ENG_MeterNo_Option: apiOption[] = [];
  constructor(
    private ass21030Service: ASS21030Service,
    private dropDownListService: DropDownListService,
    private dropdownApiService: DropdownApiService,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('ASS21050', this.dataForm);
    this.loadOptions();
  }
  loadOptions() {
    // 查 取得能源表號
    this.ass21030Service.queryENG1001_ENG_MeterNo_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.ENG_MeterNo_Option = response.Data.map((item: any) => ({
        No: item.ENG_MeterNo,
        Name: item.ENG_MeterNo,
      }));
    });
    // 載入營業樓層選項
    this.dropdownApiService.querySys3900().subscribe(options => {
      this.floorNoOptions = options ?? [];
    });
    // 載入營業區域選項
    this.dropdownApiService.querySys3A00().subscribe(options => {
      this.areaNoOptions = options ?? [];
    });
  }
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const v = frm.value;


    });
  }
}
