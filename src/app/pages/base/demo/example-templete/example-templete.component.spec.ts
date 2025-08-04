import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleTempleteComponent } from './example-templete.component';

describe('ExampleTempleteComponent', () => {
  let component: ExampleTempleteComponent;
  let fixture: ComponentFixture<ExampleTempleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleTempleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExampleTempleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
