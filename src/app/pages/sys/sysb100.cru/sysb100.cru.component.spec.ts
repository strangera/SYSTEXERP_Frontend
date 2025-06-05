import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSB100CRUComponent } from './sysb100.cru.component';

describe('SYSB100CRUComponent', () => {
  let component: SYSB100CRUComponent;
  let fixture: ComponentFixture<SYSB100CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSB100CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSB100CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
