import { Component, OnInit } from '@angular/core';
import { Sysb400Service } from '../../../service/api/sys/sysb400.service';
import { option, Sysb400m } from '../../../shared/models/sys/sysb000.model';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { NgIf } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TreeDropdownComponent } from '../../../shared/componentkit/tree-dropdown/tree-dropdown.component';

@Component({
  selector: 'app-sysb400.os',
  templateUrl: './sysb400.os.component.html',
  styleUrl: './sysb400.os.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, DropdownComponent, NgIf, ProgressSpinnerModule, TreeDropdownComponent]
})

// 組織架構列表
export class Sysb400OsComponent extends BasicCruPageComponent<Sysb400m> implements OnInit {
  override formTitle = '組織架構列表';

  // dataForm==================================
  dataForm = this.formBuilder.nonNullable.group({
    stop_flag: [''], // 是否停用
  });

  // tree dropDown==================================
  orgData: Sysb400m[] = [];
  orgColumn = [
    { value: 'org10Label', label: '全公司' },
    { value: 'org20Label', label: '室/部' },
    { value: 'org30Label', label: 'Team' },
    { value: 'org40Label', label: '樓/組' },
  ];
  LeaveLabel = 'org_name'; // 子節點顯示名稱
  listTitle = '組織架構列表'; // 節層圖名稱

  onLevelSelected(selected: any[]) {
    console.log('從子元件選到的:', selected);
  }

  // dropdownTable==================================
  //----------------
  constructor(
    private sysb400Service: Sysb400Service,
  ) {
    super();
  }

  whetherOptions: option[] = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
  ];

  ngOnInit(): void {
    this.initializePage('SYSB400');

    // ---- 初始載入一次------------------------------------------------------------
    this.loadOptions();

    // 當表單值變更時，重新載入 options
    this.dataForm.valueChanges.subscribe(() => {
      this.loadOptions();
    });
  }

  loadOptions() {
    this.loading = true;
    this.orgData = []; // 清空舊資料，避免閃爍殘留

    this.sysb400Service.querySYS3100_tree_DropDownList(this.dataForm.value).subscribe({
      next: (response) => {
        if (response.Status === '0000') {
          // console.log('篩查前結果',response.Data);
          const filtered = this.filterByDeepestUnique(response.Data || []);
          this.orgData = filtered;
          // console.log('篩查結果',this.orgData);
        } else {
          this.orgData = [];
          console.error('API error:', response.Status, response.Message);
        }
        this.loading = false;
      },
      error: (err) => {
        this.orgData = [];
        console.error('API error:', err);
        this.loading = false;
      }
    });
  }

  // 原始資料進行過濾 去除中間節點
  filterByDeepestUnique(data: any[]): any[] {
    return data.filter(item => {
      const orgKey = `${item.org_id}${item.org_name}`.trim();

      const parentLabels = [
        item.org10Label,
        item.org20Label,
        item.org30Label
      ];

      // 若任一上層的 label 和自己 orgKey 相同，表示重複，過濾掉
      const isDuplicate = parentLabels.some(label => label && orgKey.includes(label.trim()));

      return !isDuplicate;
    });
  }

  onBack() {
    this.router.navigate(['account/sys/sysb400']);
  }
}
