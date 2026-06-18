import { ChangeDetectionStrategy, Component, computed, input, OnInit, output, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ControlMessagesComponent } from '@shared/component/control-messages/control-messages.component';
import { BasicKitComponent } from '@shared/componentextends/basic-kit/basic-kit.component';
import { CheckboxModule } from 'primeng/checkbox';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    TriStateCheckboxModule,
    ControlMessagesComponent,
  ],
})
export class CheckboxComponent extends BasicKitComponent implements OnInit {
  /** 標題 */
  public _title = input<string>('', { alias: 'title' });
  /** 標籤 */
  public _label = input<string>('', { alias: 'label' });
  /** 綁定的 FormControl */
  public control = input<FormControl<boolean | null>>(new FormControl());
  /** 是否為三態 */
  public tri = input<boolean>(!1);
  /** 預設值（若未提供且 control 尚未有值, 則用 tri 判定 三態:null, 雙態:false) */
  public value = input<boolean | null>(null);
  /** 檢查欄位是否標準 */
  public submitted = input<boolean>(!1);
  /** 是否禁用 */
  public disabled = input<boolean>(!1);
  /** 用於發送所選的值 */
  public valueChange = output<boolean | null>();

  /** 三態索引（0:false, 1:true, 2:null） */
  private readonly triIndex = signal<0 | 1 | 2>(0);

  /** 三態顯示值 */
  protected readonly triViewValue = computed<boolean | null>(() =>
    this.triIndex() === 2 ? null : this.triIndex() === 1
  );

  public ngOnInit(): void {
    this.updateControlState(this.control());
    this.initializeValue();
  }

  /** 初始化值並發送初始事件 */
  private initializeValue(): void {
    const ctrl = this.control();
    const currentValue = ctrl.value ?? this.value() ?? (this.tri() ? null : !1);

    ctrl.setValue(currentValue);
    this.updateTriIndex(currentValue);
    this.valueChange.emit(currentValue);
  }

  /** 更新三態索引 */
  private updateTriIndex(value: boolean | null): void {
    this.triIndex.set(value === null ? 2 : value ? 1 : 0);
  }

  /** 雙態變更 */
  protected onBinaryChange(): void {
    if (this.disabled()) return;
    this.valueChange.emit(this.control().value);
  }

  /** 三態變更 */
  protected onTriChange(value: boolean | null): void {
    if (this.disabled()) return;
    this.control().setValue(value);
    this.updateTriIndex(value);
    this.valueChange.emit(value);
  }
}
