import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemostepsComponent } from './demosteps.component';

describe('DemostepsComponent', () => {
  let component: DemostepsComponent;
  let fixture: ComponentFixture<DemostepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemostepsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemostepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
