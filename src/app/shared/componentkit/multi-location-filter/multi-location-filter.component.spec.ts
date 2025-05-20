import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiLocationFilterComponent } from './multi-location-filter.component';

describe('MultiLocationFilterComponent', () => {
  let component: MultiLocationFilterComponent;
  let fixture: ComponentFixture<MultiLocationFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiLocationFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiLocationFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
