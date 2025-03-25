import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicPrintComponent } from './basic-print.component';

describe('BasicPrintComponent', () => {
  let component: BasicPrintComponent;
  let fixture: ComponentFixture<BasicPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicPrintComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
