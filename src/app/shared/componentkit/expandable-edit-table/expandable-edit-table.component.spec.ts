import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandableEditTableComponent } from './expandable-edit-table.component';

describe('ExpandableEditTableComponent', () => {
  let component: ExpandableEditTableComponent;
  let fixture: ComponentFixture<ExpandableEditTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpandableEditTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpandableEditTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
