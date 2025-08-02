import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleAutocompleteComponent } from './example-autocomplete.component';

describe('ExampleAutocompleteComponent', () => {
  let component: ExampleAutocompleteComponent;
  let fixture: ComponentFixture<ExampleAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleAutocompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExampleAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
