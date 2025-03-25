import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeOneComponent } from './time-one.component';

describe('TimeOneComponent', () => {
  let component: TimeOneComponent;
  let fixture: ComponentFixture<TimeOneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeOneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
