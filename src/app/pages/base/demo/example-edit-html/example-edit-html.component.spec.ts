import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleEditHtmlComponent } from './example-edit-html.component';

describe('ExampleEditHtmlComponent', () => {
  let component: ExampleEditHtmlComponent;
  let fixture: ComponentFixture<ExampleEditHtmlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleEditHtmlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExampleEditHtmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
