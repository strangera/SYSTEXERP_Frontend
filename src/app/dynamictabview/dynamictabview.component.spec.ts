import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamictabviewComponent } from './dynamictabview.component';

describe('DynamictabviewComponent', () => {
  let component: DynamictabviewComponent;
  let fixture: ComponentFixture<DynamictabviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamictabviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamictabviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
