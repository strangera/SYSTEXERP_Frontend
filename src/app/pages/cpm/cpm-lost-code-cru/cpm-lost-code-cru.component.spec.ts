import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpmLostCodeCRUComponent } from './cpm-lost-code-cru.component';

describe('CpmLostCodeCRUComponent', () => {
  let component: CpmLostCodeCRUComponent;
  let fixture: ComponentFixture<CpmLostCodeCRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpmLostCodeCRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CpmLostCodeCRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
