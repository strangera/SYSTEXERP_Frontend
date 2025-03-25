import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputAPIMultiDailogComponent } from './input-apimulti-dailog.component';

describe('InputAPIMultiDailogComponent', () => {
  let component: InputAPIMultiDailogComponent;
  let fixture: ComponentFixture<InputAPIMultiDailogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputAPIMultiDailogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputAPIMultiDailogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
