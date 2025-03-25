import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpmLostCodeComponent } from './cpm-lost-code.component';

describe('CpmLostCodeComponent', () => {
  let component: CpmLostCodeComponent;
  let fixture: ComponentFixture<CpmLostCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpmLostCodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CpmLostCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
