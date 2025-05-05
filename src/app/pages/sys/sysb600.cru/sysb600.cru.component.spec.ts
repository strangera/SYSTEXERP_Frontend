import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSB600CRUComponent } from './sysb600.cru.component';

describe('SYSB600CRUComponent', () => {
  let component: SYSB600CRUComponent;
  let fixture: ComponentFixture<SYSB600CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSB600CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSB600CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
