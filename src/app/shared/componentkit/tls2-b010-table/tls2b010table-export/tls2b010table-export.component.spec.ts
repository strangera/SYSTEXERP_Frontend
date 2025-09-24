import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableExport2Component } from './table-export2.component';

describe('TableExportComponent', () => {
  let component: TableExport2Component;
  let fixture: ComponentFixture<TableExport2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableExport2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableExport2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
