import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleUploadComponent } from './example-upload.component';

describe('ExampleUploadComponent', () => {
  let component: ExampleUploadComponent;
  let fixture: ComponentFixture<ExampleUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExampleUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
