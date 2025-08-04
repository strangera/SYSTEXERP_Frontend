import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleTableBruceComponent } from './example-table-bruce.component';

describe('ExampleTableBruceComponent', () => {
  let component: ExampleTableBruceComponent;
  let fixture: ComponentFixture<ExampleTableBruceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleTableBruceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExampleTableBruceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
