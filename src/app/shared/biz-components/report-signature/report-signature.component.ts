import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SignatureConfig, Sysbq00Service } from '../../../service/api/sys/sysbq00.service';

@Component({
  selector: 'app-report-signature',
  standalone: true,
  imports: [],
  template: `
  @if (lines()) {
    <div class="p-3">
      <div [class]="'flex gap-2' + (direction() === 'col' ? ' flex-column' : '')">
        @if (lines()!.line1) { <div [class]="direction() === 'row' ? 'flex-1 text-md' : 'text-md w-full'" style="white-space: pre-wrap;">{{ lines()!.line1 }}</div> }
        @if (lines()!.line2) { <div [class]="direction() === 'row' ? 'flex-1 text-md' : 'text-md w-full'" style="white-space: pre-wrap;">{{ lines()!.line2 }}</div> }
        @if (lines()!.line3) { <div [class]="direction() === 'row' ? 'flex-1 text-md' : 'text-md w-full'" style="white-space: pre-wrap;">{{ lines()!.line3 }}</div> }
        @if (lines()!.line4) { <div [class]="direction() === 'row' ? 'flex-1 text-md' : 'text-md w-full'" style="white-space: pre-wrap;">{{ lines()!.line4 }}</div> }
        @if (lines()!.line5) { <div [class]="direction() === 'row' ? 'flex-1 text-md' : 'text-md w-full'" style="white-space: pre-wrap;">{{ lines()!.line5 }}</div> }
      </div>
    </div>
  }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportSignatureComponent implements OnInit {
  readonly dataType = input.required<string | null>();
  readonly direction = input<'row' | 'col'>('col');

  private readonly sysbq00Service = inject(Sysbq00Service);
  private readonly destroyRef = inject(DestroyRef);

  readonly lines = signal<SignatureConfig | null>(null);

  ngOnInit() {
    // 1. 先把 Signal 的值取出來
    const typeId = this.dataType();

    // 2. 進行空值防禦（此時 TypeScript 知道 typeId 是 string | null）
    if (!typeId) {
      return;
    }

    // 3. 通過防禦後，TypeScript 會自動將 typeId 的型別收窄為純 'string'
    this.sysbq00Service
      .getSignatureConfig(typeId) // 順利傳入，不再報錯！
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res?.Data) this.lines.set(res.Data);
      });
  }
}
