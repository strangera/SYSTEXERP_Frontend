import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpmLostPersonCRUComponent } from './cpm-lost-person-cru.component';

describe('CpmLostPersonCRUComponent', () => {
  let component: CpmLostPersonCRUComponent;
  let fixture: ComponentFixture<CpmLostPersonCRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpmLostPersonCRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CpmLostPersonCRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
