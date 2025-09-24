import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableExpansion2Component } from './table-expansion2.component';

describe('TableExpansionComponent', () => {
  let component: TableExpansion2Component;
  let fixture: ComponentFixture<TableExpansion2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TableExpansion2Component]
})
    .compileComponents();

    fixture = TestBed.createComponent(TableExpansion2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
