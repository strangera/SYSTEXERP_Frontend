import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleDropdownComponent } from './example-dropdown.component';

describe('ExampleDropdownComponent', () => {
  let component: ExampleDropdownComponent;
  let fixture: ComponentFixture<ExampleDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExampleDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
