import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { ASS17020TableReportUtilityService } from './ass17020-table-report-utility.service';
import { ReportColumn } from './ass17020-table-report.model';

describe('ASS17020TableReportUtilityService (triple header helpers)', () => {
  let service: ASS17020TableReportUtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ASS17020TableReportUtilityService,
        { provide: DomSanitizer, useValue: { bypassSecurityTrustUrl: (u: string) => u } },
        { provide: NotificationService, useValue: { infoBubble: (): void => undefined } },
      ],
    });
    service = TestBed.inject(ASS17020TableReportUtilityService);
  });

  it('splitTripleHeaderSegments: prefix | grouped | suffix when contiguous', () => {
    const columns: ReportColumn[] = [
      { field: 'a', header: 'A' },
      { field: 'b1', header: 'B1', groupField: 'G1' },
      { field: 'b2', header: 'B2', groupField: 'G1' },
      { field: 'c', header: 'C' },
    ];
    const seg = service.splitTripleHeaderSegments(columns);
    expect(seg.isValid).toBe(true);
    expect(seg.prefix.map((c) => c.field)).toEqual(['a']);
    expect(seg.grouped.map((c) => c.field)).toEqual(['b1', 'b2']);
    expect(seg.suffix.map((c) => c.field)).toEqual(['c']);
    expect(service.distinctGroupFieldsInOrder(seg.grouped)).toEqual(['G1']);
    expect(service.getOuterGroupedColspan(seg.grouped)).toBe(2);
  });

  it('splitTripleHeaderSegments: isValid false when visible column breaks contiguous group block', () => {
    const columns: ReportColumn[] = [
      { field: 'x', header: 'X', groupField: 'G1' },
      { field: 'y', header: 'Y' },
      { field: 'z', header: 'Z', groupField: 'G1' },
    ];
    const seg = service.splitTripleHeaderSegments(columns);
    expect(seg.isValid).toBe(false);
  });

  it('distinctGroupFieldsInOrder preserves first-seen order', () => {
    const grouped: ReportColumn[] = [
      { field: 'a', header: 'a', groupField: 'U' },
      { field: 'b', header: 'b', groupField: 'V' },
      { field: 'c', header: 'c', groupField: 'U' },
    ];
    expect(service.distinctGroupFieldsInOrder(grouped)).toEqual(['U', 'V']);
  });

  it('getColumnSpan respects visible flag', () => {
    const columns: ReportColumn[] = [
      { field: 'a', header: 'a', groupField: 'G', visible: false },
      { field: 'b', header: 'b', groupField: 'G' },
    ];
    expect(service.getColumnSpan(columns, 'G')).toBe(1);
  });
});
