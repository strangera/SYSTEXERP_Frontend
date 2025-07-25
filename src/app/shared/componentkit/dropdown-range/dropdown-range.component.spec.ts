import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownRangeComponent } from './dropdown-range.component';

describe('DropdownRangeComponent', () => {
  let component: DropdownRangeComponent;
  let fixture: ComponentFixture<DropdownRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownRangeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropdownRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
