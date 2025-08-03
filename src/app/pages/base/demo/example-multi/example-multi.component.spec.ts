import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleMultiComponent } from './example-multi.component';

describe('ExampleMultiComponent', () => {
  let component: ExampleMultiComponent;
  let fixture: ComponentFixture<ExampleMultiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleMultiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExampleMultiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
