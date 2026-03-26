import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip'; // 用於顯示詳細分櫃
import { BehaviorSubject, catchError, finalize, Observable, of, tap } from 'rxjs';

@Component({
  selector: 'app-vendor-no-multi-select',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, AsyncPipe, MultiSelectModule, TooltipModule, ReactiveFormsModule, FormsModule],
  templateUrl: './vendor-no-multi-select.component.html',
  styleUrls: ['./vendor-no-multi-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VendorNoMultiSelectComponent implements OnInit {
  @Input() label = '廠商統一編號';
  @Input() controlName = 'ven_uniform_List';
  @Input() control!: FormControl;
  @Input() submitted = false;

  // 1. 元件內部直接查資料，不依賴父層傳入
  options$: Observable<any[] | null>;
  loading$ = new BehaviorSubject<boolean>(true);

  constructor(private dropdown: DropdownApiService) {
    this.options$ = this.dropdown.queryVendorNoGroup().pipe(
      tap(() => this.loading$.next(false)), // 💡 資料回來時停止轉圈
      catchError((err) => {
        console.error(err);
        this.loading$.next(false);
        return of([]);
      }),
      finalize(() => this.loading$.next(false))
    );
  }

  ngOnInit(): void {
    if (!this.control) {
      this.control = new FormControl([]);
    }
  }
}
