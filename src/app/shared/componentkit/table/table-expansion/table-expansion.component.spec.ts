import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableExpansionComponent } from './table-expansion.component';

describe('TableExpansionComponent', () => {
  let component: TableExpansionComponent;
  let fixture: ComponentFixture<TableExpansionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TableExpansionComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(TableExpansionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
