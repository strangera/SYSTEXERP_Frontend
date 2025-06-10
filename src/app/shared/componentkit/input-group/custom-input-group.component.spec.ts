import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputGroupComponent } from './input-group.component';

describe('InputGroupComponent', () => {
  let component: InputGroupComponent<any>;
  let fixture: ComponentFixture<InputGroupComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputGroupComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(InputGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
