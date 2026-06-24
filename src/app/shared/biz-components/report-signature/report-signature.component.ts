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
    templateUrl: './report-signature.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportSignatureComponent implements OnInit {
    readonly dataType = input.required<string>();

    private readonly sysbq00Service = inject(Sysbq00Service);
    private readonly destroyRef = inject(DestroyRef);

    readonly lines = signal<SignatureConfig | null>(null);

    ngOnInit() {
        this.sysbq00Service
            .getSignatureConfig(this.dataType())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(res => {
                if (res?.Data) this.lines.set(res.Data);
            });
    }
}
